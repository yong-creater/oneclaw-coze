import { NextRequest, NextResponse } from 'next/server';

// 4sAPI 配置
const FORURIS_API_BASE = process.env.FORURIS_API_BASE || 'https://api.4sai.cn';
const FORURIS_API_KEY = process.env.FOURIS_API_KEY || process.env.FORURIS_API_KEY;

const AI_MODELS = {
  'doubao-seed-2-0-pro-260215': { provider: 'coze', model: 'doubao-seed-2-0-pro-260215' },
  'doubao-seed-2-0-lite-260215': { provider: 'coze', model: 'doubao-seed-2-0-lite-260215' },
  'doubao-pro-4k-240815': { provider: 'coze', model: 'doubao-pro-4k-240815' },
  'doubao-lite-4k-240815': { provider: 'coze', model: 'doubao-lite-4k-240815' },
  'deepseek-chat': { provider: '4sapi', model: 'deepseek-chat' },
  'deepseek-v3': { provider: '4sapi', model: 'deepseek-v3' },
};

const PLATFORM_PROMPTS = {
  amazon: '你是亚马逊产品Listing优化专家，擅长创建高转化的产品详情页。',
  shopify: '你是Shopify独立站产品页面优化专家，擅长创建专业的电商产品页。',
  aliexpress: '你是速卖通产品详情页优化专家，擅长创建吸引海外买家的内容。',
  ebay: '你是eBay产品Listing优化专家，擅长创建专业的拍卖/一口价商品页。',
  woocommerce: '你是WooCommerce产品页面优化专家，擅长创建woocommerce兼容的产品描述。',
};

const LANGUAGE_PROMPTS: Record<string, string> = {
  en: '使用英文撰写',
  de: '使用德语撰写',
  fr: '使用法语撰写',
  es: '使用西班牙语撰写',
  it: '使用意大利语撰写',
  ja: '使用日语撰写',
};

const TONE_PROMPTS: Record<string, string> = {
  professional: '语气专业正式，突出产品的专业性和可靠性',
  casual: '语气轻松随意，像朋友推荐一样',
  luxury: '语气轻奢高端，突出产品的品质和格调',
  friendly: '语气友好亲切，让买家感到被重视',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, language, tone, productName, productFeatures, aiModel } = body;

    if (!productName || !productFeatures) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const modelConfig = AI_MODELS[aiModel as keyof typeof AI_MODELS] || AI_MODELS['doubao-seed-2-0-pro-260215'];
    const platformPrompt = PLATFORM_PROMPTS[platform as keyof typeof PLATFORM_PROMPTS] || PLATFORM_PROMPTS.amazon;
    const languagePrompt = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;
    const tonePrompt = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS] || TONE_PROMPTS.professional;

    const systemPrompt = `${platformPrompt}
${languagePrompt}
${tonePrompt}

请根据以下产品信息，生成完整的产品详情页内容：

【产品名称】
${productName}

【产品核心卖点】
${productFeatures}

请按以下格式输出（使用英文输出内容，但标题标签用中文）：

【标题】
生成一个SEO优化的产品标题，包含主要关键词

【卖点】
生成5个核心卖点bullet point，每个30-50词，突出产品的独特优势和客户收益

【描述】
生成一段200词左右的产品详细描述，包含产品特点、使用场景、品质保证等

【关键词】
生成10个搜索关键词，用英文逗号分隔

注意：内容要专业、有说服力，符合目标平台的风格要求。`;

    // 判断是否使用4sAPI
    const use4sAPI = modelConfig.provider === '4sapi' && FORURIS_API_KEY;

    if (use4sAPI) {
      // 使用4sAPI
      const response = await fetch(`${FORURIS_API_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FORURIS_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请为 "${productName}" 生成产品详情页` },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('4sAPI Error:', error);
        throw new Error('AI 生成失败');
      }

      // 返回流式响应
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 使用 Coze API
      const COZE_API_BASE = process.env.COE_API_BASE || 'https://api.coze.cn';
      const COZE_API_KEY = process.env.COE_API_KEY || process.env.COZE_API_KEY;

      if (!COZE_API_KEY) {
        return NextResponse.json(
          { error: 'API密钥未配置' },
          { status: 500 }
        );
      }

      // 创建对话
      const chatResponse = await fetch(`${COZE_API_BASE}/v3/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${COZE_API_KEY}`,
        },
        body: JSON.stringify({
          bot_id: process.env.COE_BOT_ID || '',
          user_id: 'productpage-user',
          stream: true,
          messages: [
            {
              role: 'user',
              content: systemPrompt + `\n\n请为 "${productName}" 生成产品详情页`,
            },
          ],
        }),
      });

      if (!chatResponse.ok) {
        const error = await chatResponse.text();
        console.error('Coze API Error:', error);
        throw new Error('AI 生成失败');
      }

      const chatData = await chatResponse.json();
      const conversationId = chatData.data.conversation_id;
      const chatId = chatData.data.id;

      // 返回 SSE 流
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          try {
            while (true) {
              const retrieveResponse = await fetch(
                `${COZE_API_BASE}/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${COZE_API_KEY}`,
                  },
                }
              );

              const retrieveData = await retrieveResponse.json();
              
              if (retrieveData.data.status === 'completed') {
                // 获取完整消息
                const messagesResponse = await fetch(
                  `${COZE_API_BASE}/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${COZE_API_KEY}`,
                    },
                  }
                );

                const messagesData = await messagesResponse.json();
                const assistantMessage = messagesData.data.find(
                  (m: any) => m.role === 'assistant' && m.type === 'answer'
                );

                if (assistantMessage) {
                  controller.enqueue(encoder.encode(assistantMessage.content));
                }
                break;
              } else if (retrieveData.data.status === 'failed') {
                break;
              }

              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error('Stream error:', error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
  } catch (error: any) {
    console.error('ProductPage API Error:', error);
    return NextResponse.json(
      { error: error.message || '生成失败' },
      { status: 500 }
    );
  }
}
