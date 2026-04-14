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

// 推文脚本生成系统提示词
const SYSTEM_PROMPT = `你是专业的短视频脚本策划师，擅长为漫画内容生成适配抖音/小红书平台的推文脚本。

核心要求：
1. 根据小说内容和漫画分镜，生成完整的推文脚本
2. 适配指定的平台（抖音/小红书）和风格（悬疑/甜宠/爽文/古风/搞笑）
3. 脚本时长精确分配（15秒/30秒/60秒）
4. 每个镜头包含：时长、旁白、字幕、背景音乐建议、话题标签
5. 节奏紧凑，符合平台引流逻辑

输出格式（严格遵循）：
时长：【X秒】
镜头：【镜头编号】
旁白：【旁白内容】
字幕：【字幕内容（简短有力）】
背景音乐：【BGM建议】
话题：【#标签1 #标签2 #标签3】

---

时长：【X秒】
镜头：【镜头编号】
...（以此类推）

请直接输出脚本内容，不要添加其他说明。`;

export async function POST(request: NextRequest) {
  try {
    const { text, panels, platform, style, duration, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

    const platformMap: Record<string, string> = {
      douyin: '抖音',
      xiaohongshu: '小红书',
    };

    const durationSeconds = parseInt(duration || '30');
    const shotCount = Math.min(Math.ceil(durationSeconds / 5), 12);

    const userPrompt = `请根据以下小说和漫画分镜生成推文脚本：

发布平台：${platformMap[platform || 'douyin']}
推文风格：${style || '爽文'}
视频时长：${durationSeconds}秒
分镜数量：约${shotCount}个镜头
小说内容：
${text.substring(0, 2000)}...

请生成完整的短视频推文脚本。`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    const targetModel = model || 'doubao-seed-1-8-251228';
    const useFreeModel = isFreeModel(targetModel);

    let content = '';

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
          if (chunk && typeof chunk === 'object' && 'content' in chunk) {
            content += (chunk as any).content || '';
          } else if (typeof chunk === 'string') {
            content += chunk;
          }
        }
      } catch (llmError) {
        console.error('LLM streaming error:', llmError);
        throw new Error('AI服务调用失败，请重试');
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
      content = data.choices?.[0]?.message?.content || '';
    }
    
    if (!content) {
      throw new Error('AI未返回有效内容');
    }
    
    return NextResponse.json({ content });

  } catch (error: any) {
    console.error('Generate script error:', error);
    return NextResponse.json({ error: error.message || '脚本生成失败' }, { status: 500 });
  }
}
