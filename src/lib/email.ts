import { Resend } from 'resend';

// Resend 邮件发送
export async function sendEmailViaResend(
  toAddress: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Resend API Key 未配置' };
  }

  try {
    const resend = new Resend(apiKey);
    
    // 从环境变量获取发件人邮箱，默认为 noreply@resend.dev（Resend 免费版的测试域名）
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'OneClaw <noreply@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toAddress,
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error('[Resend] 发送失败:', error);
      return { success: false, error: error.message };
    }

    console.log('[Resend] 邮件已发送, ID:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('[Resend] 发送异常:', error.message);
    return { success: false, error: error.message };
  }
}

// 验证码邮件模板
function getVerificationEmailTemplate(code: string) {
  return {
    subject: 'OneClaw - 邮箱验证码',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; }
    .header img { width: 48px; height: 48px; vertical-align: middle; }
    .header span { color: #fff; margin: 0; font-size: 24px; font-weight: 600; margin-left: 8px; }
    .content { padding: 40px 30px; text-align: center; }
    .title { font-size: 18px; color: #333; margin-bottom: 20px; }
    .code-box { background: #fff7ed; border: 2px dashed #f7931e; border-radius: 8px; padding: 20px 40px; display: inline-block; margin: 20px 0; }
    .code { font-size: 36px; font-weight: bold; color: #ff6b35; letter-spacing: 8px; }
    .tips { color: #666; font-size: 14px; line-height: 1.8; }
    .warning { color: #999; font-size: 12px; margin-top: 20px; }
    .footer { background: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #999; font-size: 12px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.oneclaw.shop/crab-icon.png" alt="logo" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';" />
      <span style="display:none;">OneClaw</span>
    </div>
    <div class="content">
      <p class="title">您的验证码</p>
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      <p class="tips">
        您正在注册 OneClaw 账号，验证码有效期为 <strong>10 分钟</strong>。
      </p>
      <p class="warning">
        如非本人操作，请忽略此邮件。
      </p>
    </div>
    <div class="footer">
      <p>OneClaw - AI 工具导航平台</p>
      <p>此邮件由系统自动发送，请勿回复</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

// 发送验证码邮件（使用 Resend）
export async function sendVerificationEmail(
  to: string, 
  code: string, 
  type: 'register' | 'login' = 'register'
): Promise<{ success: boolean; configured: boolean; error?: string }> {
  // 检查 Resend 配置
  const hasResendConfig = process.env.RESEND_API_KEY;
  
  const template = getVerificationEmailTemplate(code);
  
  if (hasResendConfig) {
    console.log(`[Email] 使用 Resend 发送验证码到 ${to}: ${code}`);
    const result = await sendEmailViaResend(to, template.subject, template.html);
    
    if (result.success) {
      console.log(`[Resend] 验证码已发送至 ${to}, MessageId: ${result.messageId}`);
      return { success: true, configured: true };
    } else {
      console.error(`[Resend] 发送失败:`, result.error);
      return { success: false, configured: true, error: result.error };
    }
  }
  
  // 未配置邮件服务：模拟发送
  console.log(`[Email] 未配置 Resend，模拟发送验证码到 ${to}: ${code}`);
  return { success: true, configured: false };
}

// 邮箱格式验证
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 生成验证码
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
