import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 生成 API
export async function POST(request: NextRequest) {
  try {
    const { prompt, type, count = 1 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: '缺少prompt' }, { status: 400 });
    }

    // 根据类型调整 prompt
    const systemPrompt = getSystemPrompt(type);
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    // 调用 LLM
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: prompt },
    ];

    // 非流式响应，直接获取完整结果
    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.8,
    });

    // 解析结果
    const results = parseResults(response.content, count, type);

    return NextResponse.json({
      success: true,
      results,
      original: response.content,
    });
  } catch (error) {
    console.error('生成失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '生成失败',
    }, { status: 500 });
  }
}

// 根据类型获取系统提示词
function getSystemPrompt(type: string): string {
  const prompts: Record<string, string> = {
    xiaohongshu: `你是一个专业的小红书爆款内容创作专家。

请根据用户输入的主题，生成以下内容：

1. 3个爆款标题（带emoji，吸引眼球）
2. 1篇完整的小红书笔记正文
3. 10个相关标签

要求：
- 标题要引发好奇和共鸣
- 正文要真实、有感染力、带情绪
- 使用emoji增加可读性
- 标签要精准且热门`,
    product: `你是一个专业的高端商业摄影师。

请根据用户输入的商品信息，生成详细的AI绘图Prompt，用于生成商业级产品主图。

生成3个不同风格的Prompt：
1. 白底图（纯白背景，干净利落）
2. 场景图（生活化场景，有氛围感）
3. 广告图（有故事感，高级感）

每个Prompt要求：
- 英文撰写
- 详细的场景描述
- 专业摄影术语
- 高画质要求`,
    poster: `你是一个资深广告创意总监。

请根据用户输入的产品信息，生成高级广告海报的AI绘图Prompt。

生成2个不同风格的Prompt：
1. 品牌海报（简约大气，品牌调性）
2. 活动海报（有紧迫感，突出促销）

每个Prompt要求：
- 英文撰写
- Apple级简约设计风格
- 强烈的视觉层次
- 电影级光影`,
  };

  return prompts[type] || prompts.xiaohongshu;
}

// 解析结果
function parseResults(content: string, count: number, type: string): string[] {
  // 简单处理，直接返回完整内容
  // 可以根据类型进一步解析
  return [content.trim()];
}
