import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { intent, email, timestamp } = await request.json();

    // 验证必填字段
    if (!intent || !intent.trim()) {
      return NextResponse.json(
        { success: false, message: '请输入您的合成意向' },
        { status: 400 }
      );
    }

    // 构建邮件内容
    const emailContent = {
      to: '1017760688@qq.com',
      subject: '【OneClaw】新的合成意向提交',
      body: `
用户合成意向提交

提交时间: ${timestamp || new Date().toLocaleString('zh-CN')}
用户邮箱: ${email || '未填写'}

合成意向:
${intent}

---
此邮件由 OneClaw 系统自动发送
      `.trim(),
    };

    // 在生产环境中，这里应该调用邮件发送服务
    // 例如：使用 Resend、SendGrid、Nodemailer 等
    // 目前先记录日志，返回成功
    console.log('=== 新的合成意向提交 ===');
    console.log('收件人:', emailContent.to);
    console.log('主题:', emailContent.subject);
    console.log('内容:', emailContent.body);
    console.log('========================');

    // TODO: 接入真实邮件服务
    // 示例：使用 Resend
    // const { data, error } = await resend.emails.send({
    //   from: 'onboarding@resend.dev',
    //   to: '1017760688@qq.com',
    //   subject: emailContent.subject,
    //   text: emailContent.body,
    // });

    return NextResponse.json({
      success: true,
      message: '提交成功！我们会尽快与您联系。',
    });
  } catch (error) {
    console.error('Submit intent error:', error);
    return NextResponse.json(
      { success: false, message: '提交失败，请稍后重试' },
      { status: 500 }
    );
  }
}
