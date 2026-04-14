/**
 * 企业微信群机器人推送工具
 */

// 企微群机器人 webhook
const WECOM_WEBHOOK_URL = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=';

/**
 * 发送企微群消息
 */
export async function sendWeComMessage(webhook: string, content: string): Promise<boolean> {
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'text',
        text: {
          content,
        },
      }),
    });

    const result = await response.json();
    return result.errcode === 0;
  } catch (error) {
    console.error('企微推送失败:', error);
    return false;
  }
}

/**
 * 发送 Markdown 格式的企微群消息
 */
export async function sendWeComMarkdown(webhook: string, content: string): Promise<boolean> {
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: {
          content,
        },
      }),
    });

    const result = await response.json();
    return result.errcode === 0;
  } catch (error) {
    console.error('企微推送失败:', error);
    return false;
  }
}
