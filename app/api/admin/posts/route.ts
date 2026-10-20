import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import {
  validateApiOrigin,
  getCorsHeaders,
  handleCorsPreflight,
} from '@/lib/security';

const CONTENT_DIR = path.join(process.cwd(), 'content');

function formatPublishedDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function POST(request: NextRequest) {
  // Enforce origin validation to prevent CSRF / cross-site abuse
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isAuthenticated = await verifySessionToken(token);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in via the admin portal.' },
        { status: 401, headers: getCorsHeaders(request) },
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      category,
      excerpt,
      content,
      image,
      author,
      status,
    } = body;

    // 1. Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Article Title is required' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Article Content (Markdown) is required' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanCategory = (category?.trim() || 'TECHNOLOGY').toUpperCase();
    const cleanExcerpt = (excerpt?.trim() || '').replace(/\r?\n/g, ' ');
    const cleanImage = image?.trim() || '/images/hero/hero-bg.jpg';
    const cleanAuthor = author?.trim() || 'Editorial Team';
    const cleanStatus = status === 'draft' ? 'draft' : 'published';

    // 2. Generate and sanitize URL slug
    let finalSlug = sanitizeSlug(slug?.trim() || cleanTitle);
    if (!finalSlug) {
      finalSlug = `post-${Date.now()}`;
    }

    // 3. Primary Storage: Neon Database (Persists in production & serverless environments like Vercel)
    await sql`
      INSERT INTO posts (slug, title, excerpt, content, category, image, status, author)
      VALUES (${finalSlug}, ${cleanTitle}, ${cleanExcerpt}, ${cleanContent}, ${cleanCategory}, ${cleanImage}, ${cleanStatus}, ${cleanAuthor})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        image = EXCLUDED.image,
        status = EXCLUDED.status,
        author = EXCLUDED.author,
        updated_at = CURRENT_TIMESTAMP
    `;

    // 4. Secondary Sync: Write local markdown file if filesystem is writable (e.g. local development)
    try {
      await fs.mkdir(CONTENT_DIR, { recursive: true });
      const publishedDate = formatPublishedDate(new Date());
      const fileContent = `---
title: "${cleanTitle.replace(/"/g, '\\"')}"
date: "${publishedDate}"
category: "${cleanCategory}"
excerpt: "${cleanExcerpt.replace(/"/g, '\\"')}"
image: "${cleanImage}"
author: "${cleanAuthor.replace(/"/g, '\\"')}"
status: "${cleanStatus}"
---

${cleanContent}
`;
      const targetFilePath = path.join(CONTENT_DIR, `${finalSlug}.md`);
      await fs.writeFile(targetFilePath, fileContent, 'utf-8');
    } catch (fsErr) {
      // In serverless environments (e.g. Vercel), the filesystem is read-only (EROFS).
      // Since the article is already safely stored in Neon PostgreSQL, we silently bypass filesystem writes.
      console.info('Filesystem write skipped (read-only environment / Vercel):', fsErr instanceof Error ? fsErr.message : fsErr);
    }

    // 5. Revalidate Next.js cache so the article appears immediately
    revalidatePath('/');
    revalidatePath(`/posts/${finalSlug}`);
    revalidatePath(`/category/${cleanCategory.toLowerCase()}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Article successfully published.',
        slug: finalSlug,
        path: `/posts/${finalSlug}`,
        file: `content/${finalSlug}.md`,
      },
      { status: 201, headers: getCorsHeaders(request) },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish post';
    console.error('Error in /api/admin/posts route:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}
