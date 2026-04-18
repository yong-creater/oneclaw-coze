import { NextResponse } from 'next/server';

// 百度站点验证文件 - 返回纯文本
export async function GET() {
  return new NextResponse('19de926e4c71768ffabf4b6856d1f346', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
