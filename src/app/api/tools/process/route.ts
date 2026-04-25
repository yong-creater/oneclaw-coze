/**
 * 工具处理 API
 * 
 * 支持流式输出（SSE 协议），用于处理各种 AI 任务
 * 
 * 支持的工具：
 * - remove-bg: 智能抠图
 * - enhance: 图片变清晰
 * - replace-bg: 背景替换
 * - remove-object: AI 消除
 * - product-hero: 商品主图生成
 * - id-photo: 证件照生成
 * - poster: 海报设计
 * - 等等
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 工具对应的系统提示词
const TOOL_SYSTEM_PROMPTS: Record<string, string> = {
  'remove-bg': `你是一个专业的图像处理专家，擅长分析和处理图像。

请分析用户上传的图片，识别图片中的主体对象，然后描述如何去除背景。

你的回复应该包含：
1. 图片中识别到的主要对象
2. 背景的类型和特征
3. 抠图后的效果描述
4. 使用此工具的注意事项

请用简洁专业的语言回复。`,

  'enhance': `你是一个图像增强专家，擅长将模糊或低质量的图片变得清晰。

请分析用户上传的图片，识别质量问题，然后给出详细的增强建议。

你的回复应该包含：
1. 图片当前的质量问题（如模糊、噪点、低分辨率等）
2. 增强后预期效果描述
3. 适用的增强技术（如超分辨率、去噪、锐化等）
4. 注意事项

请用简洁专业的语言回复。`,

  'replace-bg': `你是一个专业的图像背景处理专家，擅长识别和替换图片背景。

请分析用户上传的图片，识别当前背景和主体对象，然后给出背景替换建议。

你的回复应该包含：
1. 当前背景的描述
2. 图片主体的详细描述
3. 推荐的替换背景场景
4. 背景替换后的效果描述

请用简洁专业的语言回复。`,

  'remove-object': `你是一个专业的图像修复专家，擅长去除图片中不需要的元素。

请分析用户上传的图片，识别需要去除的对象，然后给出修复建议。

你的回复应该包含：
1. 需要去除的对象描述
2. 周围环境的描述
3. 修复后的效果预期
4. 修复难度评估

请用简洁专业的语言回复。`,

  'product-hero': `你是一个专业的电商视觉设计专家，擅长生成商品主图。

请分析用户提供的商品信息，设计吸引人的商品主图方案。

你的回复应该包含：
1. 商品特点分析
2. 推荐的展示角度和方式
3. 主图布局建议
4. 适用的电商平台优化建议（淘宝/京东/亚马逊等）

请用简洁专业的语言回复。`,

  'id-photo': `你是一个专业的证件照处理专家，擅长生成各种规格的证件照。

请根据用户需求（如证件类型、尺寸、背景色等），给出证件照处理建议。

你的回复应该包含：
1. 推荐的证件照规格
2. 面部表情和姿态建议
3. 背景颜色选择建议
4. 常见问题（如头发处理、眼镜佩戴等）

请用简洁专业的语言回复。`,

  'poster': `你是一个创意海报设计专家，擅长根据主题设计吸引眼球的海报。

请根据用户描述的主题或场景，生成创意海报设计方案。

你的回复应该包含：
1. 主题分析
2. 配色方案建议
3. 布局和构图建议
4. 文案建议
5. 视觉元素推荐

请用创意且专业的语言回复。`,

  'video-cover': `你是一个专业的视频封面设计专家，擅长从视频中提取精彩画面作为封面。

请分析用户提供的视频内容，推荐适合作为封面的精彩片段。

你的回复应该包含：
1. 视频内容主题分析
2. 推荐截取的片段及原因
3. 封面文字建议
4. 封面构图建议

请用简洁专业的语言回复。`,

  'default': `你是一个专业的AI工具助手。请分析用户的需求，提供专业、准确的建议和帮助。

对于图片处理，请先了解图片内容，然后给出专业的处理建议。
对于文案创作，请根据主题和风格要求，给出创意建议。
对于其他问题，请用简洁清晰的语言回答。

请始终保持专业、耐心的态度。`,
};

// 获取工具的系统提示词
function getSystemPrompt(toolId: string): string {
  return TOOL_SYSTEM_PROMPTS[toolId] || TOOL_SYSTEM_PROMPTS['default'];
}

// 验证请求
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body.toolId || typeof body.toolId !== 'string') {
    return { valid: false, error: '缺少 toolId 参数' };
  }

  if (!body.prompt && !body.imageUrl) {
    return { valid: false, error: '请提供 prompt 或 imageUrl 参数' };
  }

  return { valid: true };
}

// SSE 流式响应
function createSSEStream(responseText: string) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // 发送开始信号
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', content: '' })}\n\n`));

      // 模拟打字机效果，逐字符发送
      for (let i = 0; i < responseText.length; i++) {
        const char = responseText[i];
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: char })}\n\n`));
        // 添加小延迟以实现打字机效果
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // 发送完成信号
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', content: responseText })}\n\n`));
      controller.close();
    },
  });

  return stream;
}

// POST: 处理工具任务（流式响应）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { toolId, prompt, imageUrl } = body;

    // 构建消息
    const messages: any[] = [
      { role: 'system', content: getSystemPrompt(toolId) },
    ];

    // 根据是否有图片构建用户消息
    if (imageUrl) {
      // 多模态消息（图片 + 文字）
      const userContent: any[] = [];

      if (prompt) {
        userContent.push({ type: 'text', text: prompt });
      } else {
        userContent.push({ type: 'text', text: '请分析这张图片' });
      }

      // 添加图片
      userContent.push({
        type: 'image_url',
        image_url: {
          url: imageUrl,
          detail: 'high',
        },
      });

      messages.push({ role: 'user', content: userContent });
    } else {
      // 纯文本消息
      messages.push({ role: 'user', content: prompt });
    }

    // 调用 LLM
    const config = new Config();
    const client = new LLMClient(config);

    // 获取流式响应
    const stream = client.stream(messages, {
      model: imageUrl ? 'doubao-seed-1-6-vision-250815' : 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    // 构建 SSE 响应
    const encoder = new TextEncoder();
    let fullContent = '';

    const sseStream = new ReadableStream({
      async start(controller) {
        // 发送开始信号
        const startEvent = `data: ${JSON.stringify({ type: 'start', toolId })}\n\n`;
        controller.enqueue(encoder.encode(startEvent));

        try {
          // 遍历流
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullContent += text;
              
              // 发送内容片段
              const event = `data: ${JSON.stringify({ type: 'content', content: text })}\n\n`;
              controller.enqueue(encoder.encode(event));
            }
          }

          // 发送完成信号
          const doneEvent = `data: ${JSON.stringify({ type: 'done', toolId, content: fullContent })}\n\n`;
          controller.enqueue(encoder.encode(doneEvent));
        } catch (error: any) {
          // 发送错误信号
          const errorEvent = `data: ${JSON.stringify({ type: 'error', error: error.message || '处理失败' })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        }

        controller.close();
      },
    });

    return new Response(sseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error: any) {
    console.error('工具处理错误:', error);
    return NextResponse.json(
      { error: error.message || '处理失败' },
      { status: 500 }
    );
  }
}

// GET: 获取支持的工具列表
export async function GET() {
  const tools = [
    { id: 'remove-bg', name: '智能抠图', description: 'AI 一键移除背景', icon: '✂️' },
    { id: 'enhance', name: '图片变清晰', description: '模糊图片 AI 增强', icon: '🔍' },
    { id: 'replace-bg', name: '背景替换', description: '智能替换图片背景', icon: '🖼️' },
    { id: 'remove-object', name: 'AI 消除', description: '去除图片中不需要的元素', icon: '🧹' },
    { id: 'product-hero', name: '商品主图', description: '自动生成电商主图', icon: '🛍️' },
    { id: 'id-photo', name: '证件照', description: '生成各尺寸证件照', icon: '📸' },
    { id: 'poster', name: '海报设计', description: 'AI 生成创意海报', icon: '🎨' },
    { id: 'video-cover', name: '视频封面', description: '截取视频精彩封面', icon: '🎬' },
  ];

  return NextResponse.json({
    success: true,
    data: { tools },
  });
}
