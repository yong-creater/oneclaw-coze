import nodemailer from 'nodemailer';

// 邮件配置
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'OneClaw <noreply@oneclaw.shop>';

  if (!host || !user || !pass) {
    return null;
  }

  return { host, port, secure, user, pass, from };
}

// 创建 transporter
function createTransporter() {
  const config = getEmailConfig();
  
  if (!config) {
    console.warn('[Email] SMTP配置未完成，邮件发送将被记录到日志');
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

// 验证码邮件模板
function getVerificationEmailTemplate(code: string, action: 'register' | 'login' | 'reset' = 'register'): { subject: string; html: string } {
  const actionText = action === 'register' ? '注册' : action === 'login' ? '登录' : '重置密码';
  return {
    subject: action === 'reset' ? 'OneClaw 重置密码验证码' : 'OneClaw 邮箱验证码',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>邮箱验证码</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 24px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 32px 24px; text-align: center; }
    .code-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 20px 40px; margin: 20px 0; }
    .code { font-size: 32px; font-weight: bold; color: #d97706; letter-spacing: 8px; }
    .tips { color: #6b7280; font-size: 14px; line-height: 1.6; }
    .footer { background: #f9fafb; padding: 16px 24px; text-align: center; color: #9ca3af; font-size: 12px; }
    .warning { color: #ef4444; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🦞 OneClaw</h1>
    </div>
    <div class="content">
      <h2 style="color: #1f2937; margin: 0 0 16px;">邮箱验证码</h2>
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      <p class="tips">
        您正在${actionText} OneClaw 账号，验证码有效期为 <strong>10 分钟</strong>。
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

// 发送验证码邮件
export async function sendVerificationEmail(
  to: string, 
  code: string, 
  type: 'register' | 'login' = 'register'
): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();
  const template = getVerificationEmailTemplate(code);

  // 如果没有配置 SMTP，记录日志并返回成功（开发环境）
  if (!transporter) {
    console.log(`[Email] 开发环境模拟发送验证码到 ${to}: ${code}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'OneClaw <noreply@oneclaw.shop>',
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log(`[Email] 验证码已发送至 ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('[Email] 发送验证码失败:', error.message);
    return { success: false, error: '邮件发送失败' };
  }
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 生成6位验证码
export function generateCode(): string {
  return Math.random().toString().slice(2, 8).padStart(6, '0');
}
