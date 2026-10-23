import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { curateTrendingNewsDrafts, SUPPORTED_FEEDS } from '@/lib/aiNews';
import {
  validateApiOrigin,
  getCorsHeaders,
  handleCorsPreflight,
} from '@/lib/security';

export const maxDuration = 60; // Allow sufficient time for RSS fetch + AI processing

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function POST(request: NextRequest) {
  // 1. Enforce origin validation to prevent CSRF abuse
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  // 2. Enforce admin authentication
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin authentication session required.' },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is allowed
    }

    const { limit = 5, apiKey, feedUrl } = body;
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);

    // 3. Run AI News Curation pipeline
    const result = await curateTrendingNewsDrafts({
      limit: safeLimit,
      apiKey: typeof apiKey === 'string' ? apiKey.trim() : undefined,
      feedUrl: typeof feedUrl === 'string' && feedUrl.startsWith('http') ? feedUrl.trim() : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully curated ${result.created.length} new draft articles.`,
        createdCount: result.created.length,
        skippedCount: result.skippedCount,
        totalFetched: result.totalFetched,
        drafts: result.created,
      },
      { headers: getCorsHeaders(request) },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch and process trending news';
    console.error('Error in fetch-trending news API:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow admin to check endpoint status and verify credentials
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);

  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required.' },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  const hasServerApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

  return NextResponse.json(
    {
      success: true,
      ready: true,
      hasServerApiKey,
      supportedFeeds: SUPPORTED_FEEDS.map((f) => f.name),
    },
    { headers: getCorsHeaders(request) },
  );
}
