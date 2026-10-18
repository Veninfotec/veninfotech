import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  verifyAdminPassword,
  verifySessionToken,
} from '@/lib/auth';
import {
  validateApiOrigin,
  getCorsHeaders,
  handleCorsPreflight,
} from '@/lib/security';

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function POST(request: NextRequest) {
  // Enforce origin validation to prevent CSRF / cross-site abuse
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Admin portal password is required.' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid access key. Access denied.' },
        { status: 401, headers: getCorsHeaders(request) },
      );
    }

    const token = await createSessionToken();

    const response = NextResponse.json(
      {
        success: true,
        message: 'Portal access granted.',
      },
      { headers: getCorsHeaders(request) },
    );

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in /api/admin/auth POST:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during authentication.' },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  const response = NextResponse.json(
    {
      success: true,
      message: 'Logged out successfully.',
    },
    { headers: getCorsHeaders(request) },
  );

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuth = await verifySessionToken(token);

  return NextResponse.json(
    {
      authenticated: isAuth,
    },
    { headers: getCorsHeaders(request) },
  );
}
