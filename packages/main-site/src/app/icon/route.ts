import { NextResponse } from 'next/server';

// Favicon - 浏览器标签页图标 (龙虾emoji配合红橙渐变)
export async function GET() {
  // 龙虾emoji配合红橙渐变背景的SVG
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ef4444"/>
      <stop offset="50%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#fbbf24"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#grad)"/>
  <text x="16" y="23" font-size="20" text-anchor="middle" dominant-baseline="middle">🦞</text>
</svg>`;

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
