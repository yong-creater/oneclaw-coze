import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail, generateCode, isValidEmail } from '@/lib/email';
import { storeCode, getCodeStatus, CODE_EXPIRY } from '@/lib/verify-code-db';

// 简单的内存频率限制（生产环境建议使用 Redis）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟内
const RATE_LIMIT_MAX = 5; // 最多5次

function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(email);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// 发送验证码
export async function POST(request: NextRequest) {
  try {
    const { email, type = 'register' } = await request.json();

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: '请输入有效的邮箱地址'
      }, { status: 400 });
    }

    // 验证类型
    if (!['register', 'login'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: '无效的验证类型'
      }, { status: 400 });
    }

    // 频率限制检查
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: '请求过于频繁，请稍后再试'
      }, { status: 429 });
    }

    // 生成验证码
    const code = generateCode();

    // 存储验证码
    storeCode(email, code, type);

    // 发送邮件
    const emailResult = await sendVerificationEmail(email, code, type);

    // 只有在邮件发送成功时才返回成功
    if (!emailResult.success) {
      console.error('[验证码] 邮件发送失败:', emailResult.error);
      return NextResponse.json({
        success: false,
        error: emailResult.error || '邮件发送失败，请稍后重试'
      }, { status: 200 });  // 返回200而不是500，前端能正确展示错误
    }

    const isDev = process.env.NODE_ENV !== 'production';
    
    // 只有在开发环境且邮件服务未配置时，才返回devCode方便测试
    const showDevCode = isDev && !emailResult.configured;
    
    if (showDevCode) {
      // Dev mode: return code for testing (no log in production)
    }

    return NextResponse.json({
      success: true,
      message: emailResult.configured ? '验证码已发送，请查收邮件' : '验证码已生成',
      // 只有在邮件服务未配置时才返回devCode
      ...(showDevCode && { devCode: code }),
      expiresIn: CODE_EXPIRY / 1000
    });

  } catch (error: unknown) {
    console.error('发送验证码失败:', error);
    return NextResponse.json({
      success: false,
      error: '发送失败，请稍后重试'
    }, { status: 500 });
  }
}

// 获取验证码状态（用于调试）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const type = (searchParams.get('type') || 'register') as 'register' | 'login';

  if (!email) {
    return NextResponse.json({
      success: false,
      error: '请提供邮箱'
    }, { status: 400 });
  }

  const status = getCodeStatus(email, type);

  return NextResponse.json({
    success: true,
    ...status
  });
}
