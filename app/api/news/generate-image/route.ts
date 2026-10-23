import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { generateNewsImage } from '@/lib/aiImage';
import {
  validateApiOrigin,
  getCorsHeaders,
  handleCorsPreflight,
} from '@/lib/security';

// Route handler for generating unique editorial news imagery
export const maxDuration = 30;

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function POST(request: NextRequest) {
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin authentication session required.' },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  try {
    const body = await request.json();
    const { title, category = 'NEWS', slug } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required for image generation.' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    const imageUrl = await generateNewsImage(title.trim(), category, slug);

    return NextResponse.json(
      {
        success: true,
        imageUrl,
      },
      { headers: getCorsHeaders(request) },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate image';
    console.error('Error in generate-image API:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}
