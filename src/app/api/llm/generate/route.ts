import { NextRequest, NextResponse } from 'next/server';
import { streamWithModel, invokeWithModel, ChatMessage } from '@/lib/llm-selector';

/**
 * LLM 通用生成 API
 * 
 * 统一入口，所有 LLM 类工具都通过此接口生成
 * 通过 tool_id 从数据库读取模型配置，按 providerSlug 分发
 * 
 * 支持两种模式：
 * - streaming=true: 流式输出（SSE）
 * - streaming=false: 非流式输出
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      messages,     // ChatMessage[] 对话消息
      prompt,       // 简化的 prompt（会自动包装为 user message）
      systemPrompt, // 系统提示词
      model,        // fallback 模型名
      tool_id,      // 工具 slug，走数据库配置
      streaming,    // 是否流式
      temperature,  // 温度
    } = body;
    
    // 构建消息列表
    let chatMessages: ChatMessage[] = [];
    
    if (messages && Array.isArray(messages)) {
      // 直接使用传入的消息列表
      chatMessages = messages;
    } else {
      // 使用简化的 prompt 构建消息
      if (systemPrompt) {
        chatMessages.push({ role: 'system', content: systemPrompt });
      }
      if (prompt) {
        chatMessages.push({ role: 'user', content: prompt });
      }
    }

    if (chatMessages.length === 0) {
      return NextResponse.json({ error: '请提供消息内容' }, { status: 400 });
    }

    const useStreaming = streaming !== false; // 默认流式
    const options = {
      model: model || 'doubao-seed-2-0-pro-260215',
      toolId: tool_id,
      temperature: temperature || 0.7,
    };

    if (useStreaming) {
      // 流式输出
      const stream = await streamWithModel(request, chatMessages, options);
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 非流式输出
      const result = await invokeWithModel(request, chatMessages, options);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        content: result.content,
        model: result.model,
      });
    }
  } catch (error: any) {
    console.error('[LLM生成] 错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
