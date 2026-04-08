import { NextResponse } from 'next/server';

// Apple Touch Icon - 180x180 透明背景
export async function GET() {
  // 直接返回内联SVG（透明背景的龙虾图标）
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35"/>
      <stop offset="100%" style="stop-color:#E63946"/>
    </linearGradient>
  </defs>
  <!-- 龙虾身体 -->
  <ellipse cx="90" cy="105" rx="45" ry="35" fill="url(#grad)"/>
  <!-- 龙虾头 -->
  <circle cx="90" cy="65" r="30" fill="url(#grad)"/>
  <!-- 左钳 -->
  <path d="M45 75 Q20 65 15 85 Q20 105 45 90" fill="url(#grad)"/>
  <path d="M15 85 L5 75 M15 85 L5 95" stroke="url(#grad)" stroke-width="4" stroke-linecap="round"/>
  <!-- 右钳 -->
  <path d="M135 75 Q160 65 165 85 Q160 105 135 90" fill="url(#grad)"/>
  <path d="M165 85 L175 75 M165 85 L175 95" stroke="url(#grad)" stroke-width="4" stroke-linecap="round"/>
  <!-- 眼睛 -->
  <circle cx="80" cy="60" r="6" fill="white"/>
  <circle cx="100" cy="60" r="6" fill="white"/>
  <!-- 触须 -->
  <path d="M75 40 Q60 20 50 25" stroke="url(#grad)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M105 40 Q120 20 130 25" stroke="url(#grad)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- 腿 -->
  <path d="M65 115 L55 130 M75 118 L70 135 M85 120 L82 137" stroke="url(#grad)" stroke-width="3" stroke-linecap="round"/>
  <path d="M115 115 L125 130 M105 118 L110 135 M95 120 L98 137" stroke="url(#grad)" stroke-width="3" stroke-linecap="round"/>
</svg>`;

  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
