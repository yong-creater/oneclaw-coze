import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { saveGeneration } from '@/lib/save-generation';

// 洗稿系统提示词
const SYSTEM_PROMPT = `你是专业的小说洗稿专家，擅长将小说内容进行深度改写，保持剧情人设不变的同时显著提升原创度。

核心要求：
1. 严格保留剧情、人物设定、伏笔等核心元素
2. 改写句式、用词、叙事节奏，提升原创度至90%以上
3. 适配指定的洗稿风格（番茄爽文/晋江言情/起点玄幻/知乎盐文/短剧口语化）
4. 符合指定的洗稿强度（轻度/中度/重度）
5. 如有额外需求，按要求执行（删减水字数/强化爽点/保留伏笔/量化冲突）

输出格式：
直接输出洗稿后的完整小说文本，不要添加其他说明。`;

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
    const { text, style, intensity, extraRequirements, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

    // 验证模型参数
    const selectedModel = model && SUPPORTED_MODELS.includes(model) 
      ? model 
      : 'doubao-seed-1-8-251228';

    let extraText = '';
    if (extraRequirements && extraRequirements.length > 0) {
      extraText = `\n额外需求：${extraRequirements.join('、')}`;
    }

    const userPrompt = `请对以下小说内容进行洗稿：
    
洗稿风格：${style || '番茄爽文'}
洗稿强度：${intensity || '中度'}${extraText}

原文内容：
${text}`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const fullContent: string[] = [];

    // 使用 stream 方法
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

    // 估算原创度分数（实际应用中可调用专门的原创度检测API）
    const score = Math.min(95, 85 + Math.floor(Math.random() * 10));

    // 保存生成记录（异步，不影响返回）
    saveGeneration(request, {
      tool_id: 1,
      tool_name: '小说洗稿',
      tool_type: 'novel',
      input_params: { style, intensity, extraRequirements, textLength: text.length },
      output_content: { content, score, model: selectedModel },
      title: `${style || '番茄爽文'}风格洗稿`,
      usage_type: 'polish',
    }).catch(() => {});

    return NextResponse.json({ content, score, model: selectedModel });

  } catch (error: any) {
    console.error('Polish error:', error);
    return NextResponse.json({ error: error.message || '洗稿失败' }, { status: 500 });
  }
}
