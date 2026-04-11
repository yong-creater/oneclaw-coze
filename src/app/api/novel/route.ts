import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// API 配置 - 请替换为你的 API2D Key
// ============================================================
const API_KEY = process.env.API2D_KEY || '';
const BASE_URL = 'https://oa.api2d.net/v1';

// 模型列表
const MODELS = {
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    desc: '写作最强'
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    desc: '长文本专业'
  },
  'gpt-4o': {
    name: 'GPT-4o',
    desc: '综合与绘图提示词最强'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { model, messages, temperature = 0.7 } = await request.json();

    // 验证模型
    if (!model || !MODELS[model as keyof typeof MODELS]) {
      return NextResponse.json(
        { error: '请选择有效的模型' },
        { status: 400 }
      );
    }

    // 验证 API Key
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API Key 未配置，请联系管理员' },
        { status: 500 }
      );
    }

    // 构建请求
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API Error:', error);
      return NextResponse.json(
        { error: `API 请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Request Error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
