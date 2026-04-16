import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail, generateCode, isValidEmail } from '@/lib/email';
import { storeCode, getCodeStatus, CODE_EXPIRY } from '@/lib/verify-code';

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

    // 生成验证码
    const code = generateCode();

    // 存储验证码
    storeCode(email, code, type);

    // 发送邮件
    const emailResult = await sendVerificationEmail(email, code, type);

    if (!emailResult.success) {
      // 开发环境可能没有配置 SMTP，但会模拟发送
      console.log(`[验证码] 邮件发送失败，但返回模拟验证码用于测试: ${code}`);
    }

    // 开发环境返回验证码方便测试
    const isDev = process.env.NODE_ENV !== 'production';
    
    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      // 开发环境返回验证码方便测试
      ...(isDev && { devCode: code }),
      expiresIn: CODE_EXPIRY / 1000
    });

  } catch (error: any) {
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
