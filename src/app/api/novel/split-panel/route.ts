import { NextRequest, NextResponse } from 'next/server';
import { invokeWithModel } from '@/lib/llm-selector';
import { saveGeneration } from '@/lib/save-generation';

// 分镜拆解系统提示词
const SYSTEM_PROMPT = `你是专业的漫画分镜师，擅长将小说内容拆解为适合漫画表现的生动分镜脚本。

核心要求：
1. 根据小说内容拆解为多个漫画分镜（按指定数量或自动判断）
2. 每个分镜明确：场景、人物动作、对话/台词、情绪表达
3. 适配指定的分镜风格（古风/Q版/写实/赛博朋克/暗黑）
4. 分镜之间逻辑连贯，符合漫画叙事节奏
5. 每个分镜应包含足够的视觉信息便于后续生图

输出格式（严格遵循）：
分镜1：【场景描述】
人物动作：【具体动作描述】
对话：【台词内容】
情绪：【情绪表达】

分镜2：【场景描述】
...（以此类推）

请直接输出分镜内容，不要添加其他说明。`;

export async function POST(request: NextRequest) {
  try {
    const { text, style, panelCount, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '请提供小说内容' }, { status: 400 });
    }

    const userPrompt = `请对以下小说内容进行漫画分镜拆解：

分镜风格：${style || '写实'}
分镜数量：${panelCount || '自动判断（建议6-8个）'}
小说内容：
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

    // 保存生成记录
    saveGeneration(request, {
      tool_id: 3,
      tool_name: '漫画分镜生成',
      tool_type: 'layout',
      input_params: { style, panelCount, textLength: text.length },
      output_content: { content: result.content, model: result.model },
      title: `${style || '写实'}风格漫画分镜`,
      usage_type: 'split-panel',
    }).catch(() => {});

    return NextResponse.json({ content: result.content, model: result.model });
  } catch (error: any) {
    console.error('Split panel error:', error);
    return NextResponse.json({ error: error.message || '分镜拆解失败' }, { status: 500 });
  }
}
