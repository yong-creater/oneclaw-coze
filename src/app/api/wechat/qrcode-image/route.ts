import { NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { readFile } from 'fs/promises';
import { join } from 'path';

// 禁用 ISR 缓存
export const dynamic = 'force-dynamic';

/**
 * GET /api/wechat/qrcode-image
 * 直接返回微信公众号二维码图片（二进制），前端可作为 <img src> 使用
 * 
 * 优先级：
 * 1. 当前环境对象存储中的文件（自动上传 + 读取）
 * 2. 本地 public/wechat-qrcode.jpg
 * 3. 302 重定向到 /wechat-qrcode.jpg
 */

// 缓存上传结果，避免重复上传
let uploadedKey: string | null | undefined = undefined;

function buildResponse(buffer: Buffer) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}

export async function GET() {
  // 方案1: 从对象存储读取
  try {
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    // 首次调用时尝试上传到当前 bucket
    if (uploadedKey === undefined) {
      try {
        const S3KEY = 'wechat/qrcode_ce8e4852.jpg';
        const exists = await storage.fileExists({ fileKey: S3KEY });
        if (exists) {
          uploadedKey = S3KEY;
        } else {
          // 从本地 public 目录上传到当前 bucket
          const localPath = join(process.cwd(), 'public', 'wechat-qrcode.jpg');
          const fileBuffer = await readFile(localPath);
          // 校验文件大小，确保上传的是正确文件（≥ 50KB）
          if (fileBuffer.length >= 50000) {
            const key = await storage.uploadFile({
              fileContent: fileBuffer,
              fileName: S3KEY,
              contentType: 'image/jpeg',
            });
            uploadedKey = key;
            console.log('[qrcode-image] Uploaded:', key);
          } else {
            console.warn('[qrcode-image] Local file too small:', fileBuffer.length, '- skip upload');
            uploadedKey = null;
          }
        }
      } catch (err) {
        console.error('[qrcode-image] Upload failed:', err);
        uploadedKey = null;
      }
    }

    // 从对象存储读取
    if (uploadedKey) {
      const imageBuffer = await storage.readFile({ fileKey: uploadedKey });
      return buildResponse(imageBuffer);
    }
  } catch (err) {
    console.error('[qrcode-image] S3 read failed:', err);
  }

  // 方案2: 直接读取本地 public 目录
  try {
    const localPath = join(process.cwd(), 'public', 'wechat-qrcode.jpg');
    const fileBuffer = await readFile(localPath);
    if (fileBuffer.length >= 50000) {
      return buildResponse(fileBuffer);
    }
  } catch {
    // 本地文件也不可用
  }

  // 方案3: 重定向到静态文件
  return NextResponse.redirect(
    new URL('/wechat-qrcode.jpg', process.env.COZE_PROJECT_DOMAIN_DEFAULT
      ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT}`
      : 'http://localhost:5000')
  );
}
