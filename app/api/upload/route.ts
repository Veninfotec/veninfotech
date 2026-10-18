import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import {
  validateApiOrigin,
  getCorsHeaders,
  handleCorsPreflight,
} from '@/lib/security';

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function POST(request: NextRequest) {
  // Enforce origin validation to prevent cross-site abuse
  const originError = validateApiOrigin(request);
  if (originError) return originError;

  // Enforce admin session verification to prevent unauthorized uploads
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required to upload media.' },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate mime type
    const mimeType = file.type || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400, headers: getCorsHeaders(request) },
      );
    }

    // Generate safe unique filename
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    const fileName = `${cleanName}-${Date.now()}${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        fileName,
      },
      { headers: getCorsHeaders(request) },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'File upload failed';
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}
