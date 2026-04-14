import { NextRequest, NextResponse } from 'next/server';

// 4sapi 配置
const ENABLE_4SAPI = process.env.ENABLE_4SAPI === 'true';
const API4S_KEY = process.env.API4S_KEY || '';
const API4S_URL = process.env.API4S_URL || 'https://4sapi.com';

// Coze SDK 免费模型列表
const FREE_MODELS = [
  // 豆包系列
  'doubao-seed-2-0-pro-260215',
  'doubao-seed-2-0-lite-260215',
  'doubao-seed-2-0-mini-260215',
  'doubao-seed-1-6-251015',
  'doubao-seed-1-8-251228',
  'doubao-seed-1-6-vision-250815',
  'doubao-seed-1-6-thinking-250715',
  'doubao-pro-4k-240815',
  'doubao-pro-32k-240815',
  'doubao-lite-4k-240815',
  'doubao-lite-32k-240815',
  // 智谱AI (GLM)
  'glm-4',
  'glm-4-flash',
  'glm-4-plus',
  'glm-4v',
  'glm-3-turbo',
  'characterglm',
  // 通义千问
  'qwen-turbo',
  'qwen-plus',
  'qwen-max',
  'qwen2-72b-instruct',
  'qwen2-7b-instruct',
  'qwen-coder-turbo',
  // Kimi
  'moonshot-v1-8k',
  'moonshot-v1-32k',
  'moonshot-v1-128k',
  // DeepSeek
  'deepseek-chat',
  'deepseek-coder',
  // 百川
  'baichuan4',
  'baichuan3-turbo',
  // 其他
  'yi-34b-chat',
  'minimax-chat',
];

// 检查是否为免费模型
function isFreeModel(model: string): boolean {
  const lowerModel = model?.toLowerCase() || '';
  return FREE_MODELS.some(m => lowerModel.includes(m.toLowerCase()));
}

// 生图提示词模板
const SYSTEM_PROMPT = `你是专业的AI漫画图像生成专家，擅长生成高质量的网文风格漫画图片。

核心要求：
1. 根据分镜描述生成专业、生动的漫画提示词
2. 提示词应包含：场景、人物、动作、情绪、风格等关键元素
3. 适配指定的漫画风格（古风/Q版/写实/赛博朋克/暗黑）
4. 画质要求明确（标清512/高清1024/超清2048）

输出格式：
直接输出英文提示词，包含以下元素：
- 漫画类型和风格
- 场景描述
- 人物外观和动作
- 情绪表达
- 画质要求
- 负面提示词（避免低质量元素）

示例输出：
comic style, ancient Chinese fantasy theme, dynamic action scene, young male protagonist in traditional robes, dramatic pose with sword raised, intense expression, detailed background with mountains and clouds, vibrant colors, clean linework, anime art style, high quality, 4K`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, quality, style, model } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: '请提供分镜描述' }, { status: 400 });
    }

    const qualityMap: Record<string, { size: string; quality: string }> = {
      '512': { size: '512x512', quality: 'standard' },
      '1024': { size: '1024x1024', quality: 'hd' },
      '2048': { size: '1024x1024', quality: 'hd' }, // 超清也用1024
    };

    const q = qualityMap[quality || '1024'] || qualityMap['1024'];

    const userPrompt = `请为以下漫画分镜生成AI生图提示词：

分镜描述：${prompt}
漫画风格：${style || '古风'}
画质设置：${q.size}

请生成专业的英文提示词。`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    const targetModel = model || 'doubao-seed-1-8-251228';
    const useFreeModel = isFreeModel(targetModel);

    let fullPrompt = '';

    if (useFreeModel) {
      // 方案1：Coze SDK 免费模型
      const { LLMClient, Config, HeaderUtils } = await import('coze-coding-dev-sdk');
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new LLMClient(config, customHeaders);

      const llmConfig = {
        model: targetModel,
        temperature: 0.7,
        streaming: false
      };

      try {
        const aiStream = client.stream(messages, llmConfig);
        
        for await (const chunk of aiStream) {
          let content: string | undefined;
          
          if (chunk && typeof chunk === 'object') {
            content = (chunk as { content?: string }).content;
          } else if (typeof chunk === 'string') {
            content = chunk;
          }
          
          if (content) {
            fullPrompt += content;
          }
        }
      } catch (llmError) {
        console.error('LLM error:', llmError);
        throw new Error('提示词生成失败');
      }
    } else {
      // 方案2：付费模型走 4sapi
      if (!ENABLE_4SAPI || !API4S_KEY) {
        throw new Error('付费模型未启用，请选择豆包模型或联系管理员配置付费API');
      }

      const response = await fetch(`${API4S_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API4S_KEY}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`4sapi error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      fullPrompt = data.choices?.[0]?.message?.content || '';
    }

    // 由于没有实际的图像生成API，这里返回一个占位图片
    // 实际项目中需要对接 Midjourney/DALL-E 等图像生成API
    const placeholderImageUrl = `https://picsum.photos/${q.size}?random=${Date.now()}`;

    return NextResponse.json({
      prompt: fullPrompt || prompt,
      imageUrl: placeholderImageUrl,
      quality: q.size,
    });

  } catch (error: any) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: error.message || '生图失败' }, { status: 500 });
  }
}
