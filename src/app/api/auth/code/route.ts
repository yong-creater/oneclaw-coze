import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail, generateCode, isValidEmail } from '@/lib/email';
import { storeCode, getCodeStatus, CODE_EXPIRY } from '@/lib/verify-code-db';

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

    // 只有在邮件发送成功时才返回成功
    if (!emailResult.success) {
      console.error('[验证码] 邮件发送失败:', emailResult.error);
      return NextResponse.json({
        success: false,
        error: emailResult.error || '邮件发送失败，请稍后重试'
      }, { status: 500 });
    }

    const isDev = process.env.NODE_ENV !== 'production';
    
    // 只有在开发环境且邮件服务未配置时，才返回devCode方便测试
    const showDevCode = isDev && !emailResult.configured;
    
    if (showDevCode) {
      console.log(`[验证码] 邮件服务未配置，返回模拟验证码用于测试: ${code}`);
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
