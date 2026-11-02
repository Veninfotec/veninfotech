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

    // Anti-bot honeypot check
    if (body.company_website || body.hp_check) {
      return NextResponse.json(
        {
          status: 'success',
          message: 'Thank you for your message! Our editorial desk will get back to you shortly.',
        },
        { status: 200 }
      );
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : 'General Inquiry';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { error: 'Please provide your name (2–120 characters).' },
        { status: 400 }
      );
    }

    if (!email || email.length < 5 || email.length > 254 || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!message || message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Please enter a message between 10 and 5,000 characters.' },
        { status: 400 }
      );
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        INSERT INTO contact_messages (name, email, subject, message)
        VALUES (${name}, ${email}, ${subject.slice(0, 200)}, ${message})
      `;
    } catch (dbErr) {
      console.warn('Contact message DB storage warning (continuing gracefully):', dbErr);
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Thank you for contacting Veninfotech! Our editorial team has received your inquiry and will respond within 24–48 business hours.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Unable to send your message right now. Please try again or email us directly.' },
      { status: 500 }
    );
  }
}

