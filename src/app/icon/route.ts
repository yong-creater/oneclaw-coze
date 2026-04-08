import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Favicon - 浏览器标签页图标 (透明背景的SVG)
export async function GET() {
  try {
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.svg');
    const svgBuffer = await readFile(faviconPath);
    
    return new NextResponse(svgBuffer, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[Favicon] 读取 favicon.svg 失败:', error);
    
    // 降级方案：返回内联SVG
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35"/>
      <stop offset="100%" style="stop-color:#E63946"/>
    </linearGradient>
  </defs>
  <ellipse cx="16" cy="18" rx="8" ry="6" fill="url(#grad)"/>
  <circle cx="16" cy="12" r="5" fill="url(#grad)"/>
  <path d="M8 14 Q4 12 3 15 Q4 18 8 16" fill="url(#grad)"/>
  <path d="M3 15 L1 13 M3 15 L1 17" stroke="url(#grad)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M24 14 Q28 12 29 15 Q28 18 24 16" fill="url(#grad)"/>
  <path d="M29 15 L31 13 M29 15 L31 17" stroke="url(#grad)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="14" cy="11" r="1" fill="white"/>
  <circle cx="18" cy="11" r="1" fill="white"/>
  <path d="M13 7 Q10 4 8 5" stroke="url(#grad)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M19 7 Q22 4 24 5" stroke="url(#grad)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`;

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }
}
