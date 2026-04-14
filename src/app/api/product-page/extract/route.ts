import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 系统提示词
const SYSTEM_PROMPT = `你是一位专业的跨境电商商品卖点提炼专家，擅长从用户输入的模糊描述中提炼出精准、有吸引力的商品卖点。

核心要求：
1. 识别并提取商品的核心功能、材质、优势
2. 将卖点转化为适合AI生图的描述词
3. 按类目特点优化卖点的表达方式
4. 生成简洁有力的卖点文案

输出格式：
直接输出提炼后的卖点，不要添加其他说明，每条卖点用编号区分。`;

export async function POST(request: NextRequest) {
  let text = '';
  
  try {
    const body = await request.json();
    text = body.text || '';
    const { category } = body;

    if (!text) {
      return NextResponse.json({ error: '请输入商品描述' }, { status: 400 });
    }

    const categoryHints: Record<string, string> = {
      '3c': '3C电子产品特点：参数、性能、做工',
      'home': '家居园艺产品特点：实用性、设计感、材质',
      'beauty': '美妆个护产品特点：功效、成分、使用体验',
      'clothing': '服装鞋帽产品特点：款式、面料、舒适度',
      'outdoor': '户外用品特点：功能、防护、耐用性',
      'other': '通用产品卖点',
    };

    const userPrompt = `请提炼以下商品描述中的核心卖点：

【商品类目】${categoryHints[category] || categoryHints.other}

【原始描述】
${text}

请提炼出适合用于生成商品详情图的卖点描述，包括：
1. 核心功能/卖点
2. 材质/做工描述
3. 使用场景
4. 优势亮点

每条卖点简洁有力，便于AI理解生成精准图片。`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    // 使用Coze SDK
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const llmConfig = {
      model: 'doubao-seed-1-6-251015',
      temperature: 0.7,
      streaming: false
    };

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
      console.error('LLM error:', llmError);
      // 如果AI调用失败，返回原文本
      content = text;
    }

    return NextResponse.json({ content: content || text });

  } catch (error: any) {
    console.error('Extract selling points error:', error);
    return NextResponse.json({ content: text || '' }, { status: 200 });
  }
}
