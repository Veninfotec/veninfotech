import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    // Anti-bot honeypot check: If the hidden honeypot field is filled, silently succeed
    if (body.company_website || body.hp_check) {
      return NextResponse.json(
        {
          status: 'success',
          message: 'Thank you for subscribing to our newsletter!',
        },
        { status: 200 }
      );
    }

    const rawEmail = body.email;
    if (typeof rawEmail !== 'string') {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();

    // Length check & regex validation
    if (!email || email.length < 5 || email.length > 254 || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const parts = email.split('@');
    if (parts.length !== 2 || !parts[1].includes('.') || (parts[1].split('.').pop()?.length ?? 0) < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid domain address (e.g. name@example.com).' },
        { status: 400 }
      );
    }

    // Check if email is already subscribed
    const existing = await sql`
      SELECT id FROM newsletter_subscribers WHERE email = ${email} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          status: 'already_subscribed',
          message: 'This email is already subscribed to our newsletter!',
        },
        { status: 409 }
      );
    }

    // Insert new subscriber
    await sql`
      INSERT INTO newsletter_subscribers (email) VALUES (${email})
    `;

    return NextResponse.json(
      {
        status: 'success',
        message: 'Thank you for subscribing! You are now subscribed to our newsletter.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Handle unique violation error code from PostgreSQL
    if (error?.code === '23505') {
      return NextResponse.json(
        {
          status: 'already_subscribed',
          message: 'This email is already subscribed to our newsletter!',
        },
        { status: 409 }
      );
    }

    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
