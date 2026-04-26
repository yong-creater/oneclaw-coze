import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { saveGeneration } from '@/lib/save-generation';

// 推文脚本生成系统提示词
const SYSTEM_PROMPT = `你是专业的短视频脚本策划师，擅长为漫画内容生成适配抖音/小红书平台的推文脚本。

核心要求：
1. 根据小说内容和漫画分镜，生成完整的推文脚本
2. 适配指定的平台（抖音/小红书）和风格（悬疑/甜宠/爽文/古风/搞笑）
3. 脚本时长精确分配（15秒/30秒/60秒）
4. 每个镜头包含：时长、旁白、字幕、背景音乐建议、话题标签
5. 节奏紧凑，符合平台引流逻辑

输出格式：
时长：【X秒】
镜头：【镜头编号】
旁白：【旁白内容】
字幕：【字幕内容（简短有力）】
背景音乐：【BGM建议】
话题：【#标签1 #标签2 #标签3】`;

// 支持的模型列表
const SUPPORTED_MODELS = [
  'doubao-seed-2-0-pro-260215',
  'doubao-seed-2-0-lite-260215',
  'doubao-seed-2-0-mini-260215',
  'doubao-seed-1-8-251228',
  'deepseek-r1-250528',
  'deepseek-v3-2-251201',
  'kimi-k2-5-260127',
  'glm-5-0-260211',
  'qwen3-5-plus-260215',
];

export async function POST(request: NextRequest) {
  try {
    const { text, panels, platform, style, duration, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

    // 验证模型参数
    const selectedModel = model && SUPPORTED_MODELS.includes(model) 
      ? model 
      : 'doubao-seed-1-8-251228';

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
${text.substring(0, 2000)}${text.length > 2000 ? '...' : ''}

请生成完整的短视频推文脚本。`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const fullContent: string[] = [];

    const llmConfig = {
      model: selectedModel,
      temperature: 0.7,
      streaming: true
    };

    const aiStream = client.stream(messages as any, llmConfig);
    
    for await (const chunk of aiStream) {
      if (chunk.content) {
        fullContent.push(chunk.content.toString());
      }
    }

    const content = fullContent.join('');

    if (!content) {
      throw new Error('AI未返回有效内容');
    }

    // 保存生成记录
    saveGeneration(request, {
      tool_id: 2,
      tool_name: '推文脚本生成',
      tool_type: 'script',
      input_params: { platform, style, duration, textLength: text.length },
      output_content: { content, model: selectedModel },
      title: `${platformMap[platform || 'douyin']}${style || '爽文'}风格脚本`,
      usage_type: 'script',
    }).catch(() => {});

    return NextResponse.json({ content, model: selectedModel }); catch (error: any) {
    console.error('Generate script error:', error);
    return NextResponse.json({ error: error.message || '脚本生成失败' }, { status: 500 });
  }
}
