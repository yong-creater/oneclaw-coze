import { NextResponse } from 'next/server';

// 百度站点验证 - 必须返回纯文本，不能有任何HTML包装
export async function GET() {
  return new NextResponse('19de926e4c71768ffabf4b6856d1f346', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    },
  });
}
