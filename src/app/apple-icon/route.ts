import { NextResponse } from 'next/server';

// Apple Touch Icon - 180x180 OC圆形图标，橙红色渐变
export async function GET() {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ef4444"/>
      <stop offset="50%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#fb923c"/>
    </linearGradient>
  </defs>
  <circle cx="90" cy="90" r="82" fill="url(#grad)"/>
  <text x="90" y="115" font-family="system-ui, -apple-system, sans-serif" 
        font-size="80" font-weight="700" text-anchor="middle" fill="white">OC</text>
</svg>`;

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
