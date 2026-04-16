import crypto from 'crypto';

// 阿里云 DirectMail API 发送邮件
export async function sendEmailViaAliyun(
  toAddress: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const region = process.env.ALIYUN_DIRECT_MAIL_REGION || 'cn-hangzhou';
  const accountName = process.env.ALIYUN_MAIL_FROM;

  if (!accessKeyId || !accessKeySecret || !accountName) {
    return { success: false, error: '阿里云邮件推送配置不完整' };
  }

  try {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, '.000Z');
    
    // 构建请求参数（按字母顺序排序）
    const params: Record<string, string> = {
      AccessKeyId: accessKeyId,
      AccountName: accountName,
      Action: 'SingleSendMail',
      AddressType: '1',
      Format: 'JSON',
      HtmlBody: htmlBody,
      RegionId: region,
      ReplyToAddress: 'false',
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: Date.now().toString(),
      SignatureVersion: '1.0',
      Subject: subject,
      Timestamp: timestamp,
      ToAddress: toAddress,
      Version: '2015-11-23',
    };

    // 1. 构造规范化查询字符串
    const sortedKeys = Object.keys(params).sort();
    const canonicalizedQueryString = sortedKeys
      .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
      .join('&');

    // 2. 构造待签名字符串
    const stringToSign = `GET&${percentEncode('/')}&${percentEncode(canonicalizedQueryString)}`;

    // 3. 计算签名
    const signature = crypto
      .createHmac('sha1', `${accessKeySecret}&`)
      .update(stringToSign)
      .digest('base64');

    // 4. 添加签名到参数
    params.Signature = signature;

    // 5. 构造最终 URL
    const queryString = sortedKeys
      .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
      .join('&');
    
    const url = `https://dm.${region}.aliyuncs.com/?${queryString}`;

    console.log('[Aliyun DirectMail] 发送请求到:', `https://dm.${region}.aliyuncs.com/`);
    console.log('[Aliyun DirectMail] 参数:', JSON.stringify(params));

    const response = await fetch(url, {
      method: 'GET',
    });

    const result = await response.json();
    console.log('[Aliyun DirectMail] 响应:', JSON.stringify(result));

    if (response.ok && result.Code === 'OK') {
      return { success: true, messageId: result.MessageId };
    } else {
      return { success: false, error: result.Message || result.Code || `HTTP ${response.status}` };
    }
  } catch (error: any) {
    console.error('[Aliyun DirectMail] 发送失败:', error.message);
    return { success: false, error: error.message };
  }
}

// URL 编码（RFC 3986）
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E')
    .replace(/%/g, '%25');
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
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 600; }
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
      <h1>🦞 OneClaw</h1>
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

// 发送验证码邮件（兼容旧接口）
export async function sendVerificationEmail(
  to: string, 
  code: string, 
  type: 'register' | 'login' = 'register'
): Promise<{ success: boolean; configured: boolean; error?: string }> {
  // 检查阿里云配置
  const hasAliyunConfig = process.env.ALIYUN_ACCESS_KEY_ID && process.env.ALIYUN_ACCESS_KEY_SECRET;
  
  // 未配置阿里云：模拟发送
  if (!hasAliyunConfig) {
    console.log(`[Email] 未配置阿里云邮件推送，模拟发送验证码到 ${to}: ${code}`);
    return { success: true, configured: false };
  }

  // 已配置阿里云：使用阿里云发送
  console.log(`[Email] 使用阿里云邮件推送发送验证码到 ${to}: ${code}`);
  const template = getVerificationEmailTemplate(code);
  const result = await sendEmailViaAliyun(to, template.subject, template.html);

  if (result.success) {
    console.log(`[Aliyun DirectMail] 验证码已发送至 ${to}, MessageId: ${result.messageId}`);
    return { success: true, configured: true };
  } else {
    console.error(`[Aliyun DirectMail] 发送失败:`, result.error);
    return { success: false, configured: true, error: result.error };
  }
}

// 旧接口兼容（已废弃）
export function createTransporter() {
  // 返回 null 表示使用阿里云 DirectMail
  return null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
