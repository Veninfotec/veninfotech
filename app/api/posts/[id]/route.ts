import { NextRequest, NextResponse } from 'next/server';
import { updatePost, deletePost } from '@/lib/posts';
import { revalidatePath } from 'next/cache';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import {
  validateApiOrigin,
  getCorsHeaders,
  handleCorsPreflight,
} from '@/lib/security';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  // Enforce origin validation to prevent cross-site abuse
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  // Enforce admin session verification
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required.' },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    const body = await request.json();
    const updated = await updatePost(numericId, body);

    revalidatePath('/');
    revalidatePath('/news');
    if (updated.slug) {
      revalidatePath(`/posts/${updated.slug}`);
    }

    return NextResponse.json(
      { success: true, post: updated },
      { headers: getCorsHeaders(request) },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update post';
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  // Enforce origin validation to prevent cross-site abuse
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  // Enforce admin session verification
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required.' },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    await deletePost(numericId);

    revalidatePath('/');
    revalidatePath('/news');
    return NextResponse.json(
      { success: true },
      { headers: getCorsHeaders(request) },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete post';
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}
