import { NextResponse } from 'next/server';

// Favicon - 浏览器标签页图标 (闪电图标+紫蓝渐变)
export async function GET() {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7B61FF"/>
      <stop offset="100%" style="stop-color:#5EA9FF"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#grad)"/>
  <path d="M18.5 4L10 18h5.5L13.5 28 22 14h-5.5L18.5 4z" fill="white"/>
</svg>`;

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
