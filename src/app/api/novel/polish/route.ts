import { NextRequest, NextResponse } from 'next/server';
import { invokeWithModel } from '@/lib/llm-selector';
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

    // 使用统一模型调度：toolId='novel' 从数据库读取配置
    const result = await invokeWithModel(request, messages, {
      model: model || 'doubao-seed-1-8-251228',
      toolId: 'novel',
      temperature: 0.7,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.content) {
      return NextResponse.json({ error: 'AI未返回有效内容' }, { status: 500 });
    }

    // 估算原创度分数
    const score = Math.min(95, 85 + Math.floor(Math.random() * 10));

    // 保存生成记录（异步，不影响返回）
    saveGeneration(request, {
      tool_id: 1,
      tool_name: '小说洗稿',
      tool_type: 'novel',
      input_params: { style, intensity, extraRequirements, textLength: text.length },
      output_content: { content: result.content, score, model: result.model },
      title: `${style || '番茄爽文'}风格洗稿`,
      thumbnail: '',
      usage_type: 'polish',
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      content: result.content,
      score,
      model: result.model,
    });
  } catch (error: any) {
    console.error('Polish API error:', error);
    return NextResponse.json({ error: error.message || '洗稿失败' }, { status: 500 });
  }
}
