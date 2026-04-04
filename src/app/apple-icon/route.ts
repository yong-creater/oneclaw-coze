import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// 返回 Apple Touch Icon
export async function GET() {
  try {
    // 尝试读取 lobster logo
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
    
    // 降级：返回一个简单的 SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f97316"/>
          <stop offset="100%" style="stop-color:#ef4444"/>
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="36" fill="url(#bg)"/>
      <text x="90" y="130" font-size="100" text-anchor="middle" fill="white">🦞</text>
    </svg>`;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }
}
