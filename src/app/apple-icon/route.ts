import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// 返回logo图片作为apple-touch-icon
export async function GET() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'lobster-logo.png');
    const imageBuffer = await readFile(logoPath);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('读取logo失败:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}

