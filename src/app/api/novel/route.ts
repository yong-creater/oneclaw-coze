import { NextRequest, NextResponse } from 'next/server';
import { streamWithModel } from '@/lib/llm-selector';

const SYSTEM_PROMPTS: Record<string, string> = {
  polish: '你是专业小说编辑，擅长洗稿润色，保留核心剧情，优化句式表达，提升文字质感。',
  character: '你是小说人设专家，擅长打造鲜活的小说人物，生成完整的人物DNA设定卡。',
  imagePrompt: '你是AI绘画提示词工程师，生成适配Midjourney、Stable Diffusion的高质量提示词。',
  scenePrompt: '你是专业场景设计师，生成小说场景描写和配套的AI绘图提示词。'
};

export async function POST(request: NextRequest) {
  try {
    const { feature, input, model } = await request.json();

    if (!input || !feature) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[feature] || SYSTEM_PROMPTS.polish;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: input }
    ];

    // 使用统一模型调度：toolId='novel' 从数据库读取配置
    const stream = await streamWithModel(request, messages, {
      model: model || 'doubao-seed-1-8-251228',
      toolId: 'novel',
      temperature: 0.7,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Novel API error:', error);
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
