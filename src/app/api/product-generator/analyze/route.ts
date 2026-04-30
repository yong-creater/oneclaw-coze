import { NextRequest, NextResponse } from 'next/server';
import { invokeWithModel, ChatMessage } from '@/lib/llm-selector';

const SYSTEM_PROMPT = `你是电商文案专家，擅长根据商品图片和名称提炼卖点。

用户会给你商品名称和/或商品图片，你需要：
1. 仔细观察商品图片，识别商品类型、外观特征、设计亮点
2. 分析商品的核心卖点
3. 生成3-5个简洁有力的卖点文案
4. 用 ｜ 分隔
5. 每个卖点不超过8个字
6. 只输出卖点，不要其他解释

示例格式：
高音质沉浸体验｜主动降噪｜超长续航｜轻量舒适
去污力强｜温和不伤手｜自然清香｜浓缩配方`;

// 工具标识（对应 utility_tools 表的 slug）
const TOOL_SLUG = 'product-generator-analyze';

export async function POST(request: NextRequest) {
  try {
    const { productName, productImage } = await request.json();

    if (!productName && !productImage) {
      return NextResponse.json(
        { error: '请提供商品名称或商品图片' },
        { status: 400 }
      );
    }

    // 构建多模态消息内容
    const messageContent: ChatMessage['content'] = [];

    if (productName) {
      messageContent.push({
        type: 'text',
        text: `商品名称：${productName}`
      });
    }

    if (productImage) {
      // 支持 base64 和 URL 两种格式
      const imageUrl = productImage.startsWith('data:') 
        ? productImage 
        : `data:image/jpeg;base64,${productImage}`;
      
      messageContent.push({
        type: 'image_url',
        image_url: { url: imageUrl }
      });
      messageContent.push({
        type: 'text',
        text: '请根据这张商品图片分析商品卖点'
      });
    }

    if (!productName && productImage) {
      messageContent.push({
        type: 'text',
        text: '请识别图片中的商品并分析其卖点'
      });
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: messageContent }
    ];

    // 走统一模型调度（从数据库读取配置）
    const result = await invokeWithModel(request, messages, {
      toolId: TOOL_SLUG,
      temperature: 0.7,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error || '卖点分析失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 清理结果（去掉可能的引号、换行等）
    const cleaned = (result.content || '')
      .replace(/^["'""]+|["'""]+$/g, '')
      .replace(/\n/g, '')
      .trim();

    return NextResponse.json({
      success: true,
      benefits: cleaned
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('卖点分析失败:', errMsg);
    return NextResponse.json(
      { error: errMsg || '卖点分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
