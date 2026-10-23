import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/posts';
import { revalidatePath } from 'next/cache';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import {
  validateApiOrigin,
  getCorsHeaders,
  handleCorsPreflight,
} from '@/lib/security';

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') as 'published' | 'draft' | 'pending_review' | 'all' | null;
    const filter = statusParam || 'published';

    // If requesting drafts, pending_review, or all, require admin authentication
    if (filter !== 'published') {
      const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
      const isAuthenticated = await verifySessionToken(token);
      if (!isAuthenticated) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Admin authentication required for draft posts.' },
          { status: 401, headers: getCorsHeaders(request) },
        );
      }
    }

    const posts = await getAllPosts(filter);
    return NextResponse.json(
      { success: true, posts },
      { headers: getCorsHeaders(request) },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch posts';
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}

export async function POST(request: NextRequest) {
  // Enforce origin validation to prevent cross-site abuse
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  // Enforce admin session verification
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required to create posts.' },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  try {
    const body = await request.json();
    const { title, slug, excerpt, content, category, image, status, author, is_breaking, post_type } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    const post = await createPost({
      title,
      slug,
      excerpt,
      content,
      category,
      image,
      status: status || 'published',
      author,
      is_breaking: Boolean(is_breaking),
      post_type,
    });

    // Revalidate public feeds so updates appear instantly without redeployment
    revalidatePath('/');
    revalidatePath(`/posts/${post.slug}`);

    return NextResponse.json(
      { success: true, post },
      { status: 201, headers: getCorsHeaders(request) },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create post';
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}
