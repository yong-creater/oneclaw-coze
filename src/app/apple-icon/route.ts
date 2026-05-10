import { NextResponse } from 'next/server';

// Apple Touch Icon - 180x180 闪电图标+紫蓝渐变
export async function GET() {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7B61FF"/>
      <stop offset="100%" style="stop-color:#5EA9FF"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="36" fill="url(#grad)"/>
  <path d="M103 22L55 100h31L77 158 125 80H94L103 22z" fill="white"/>
</svg>`;

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
