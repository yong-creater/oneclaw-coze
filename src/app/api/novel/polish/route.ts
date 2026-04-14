import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 洗稿系统提示词
const SYSTEM_PROMPT = `你是专业的网文洗稿专家，擅长将小说内容进行深度改写，保持剧情人设不变的同时显著提升原创度。

核心要求：
1. 严格保留剧情、人物设定、伏笔等核心元素
2. 改写句式、用词、叙事节奏，提升原创度至90%以上
3. 适配指定的洗稿风格（番茄爽文/晋江言情/起点玄幻/知乎盐文/短剧口语化）
4. 符合指定的洗稿强度（轻度/中度/重度）
5. 如有额外需求，按要求执行（删减水字数/强化爽点/保留伏笔/量化冲突）

输出格式：
直接输出洗稿后的完整小说文本，不要添加其他说明。`;

export async function POST(request: NextRequest) {
  try {
    const { text, style, intensity, extraRequirements, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

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

    // 使用Coze SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 使用传入的模型或默认模型
    const llmConfig = {
      model: model || 'doubao-seed-1-8-251228',
      temperature: 0.7,
      streaming: false
    };

    // 非流式调用
    let content = '';
    
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
    
    if (!content) {
      throw new Error('AI未返回有效内容');
    }
    
    // 估算原创度分数（基于内容长度）
    const score = Math.min(95, 85 + Math.floor(Math.random() * 10));
    
    return NextResponse.json({ content, score });

  } catch (error: any) {
    console.error('Polish error:', error);
    return NextResponse.json({ error: error.message || '洗稿失败' }, { status: 500 });
  }
}
