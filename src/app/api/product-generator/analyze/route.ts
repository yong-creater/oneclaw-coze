import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

const SYSTEM_PROMPT = `你是电商文案专家，擅长根据商品图片和名称提炼卖点。

用户会给你商品名称（可能还有商品图片描述），你需要：
1. 分析商品的核心卖点
2. 生成3-5个简洁有力的卖点文案
3. 用 ｜ 分隔
4. 每个卖点不超过8个字
5. 只输出卖点，不要其他解释

示例格式：
高音质沉浸体验｜主动降噪｜超长续航｜轻量舒适
去污力强｜温和不伤手｜自然清香｜浓缩配方`;

export async function POST(request: NextRequest) {
  try {
    const { productName, productImage } = await request.json();

    if (!productName && !productImage) {
      return NextResponse.json(
        { error: '请提供商品名称或商品图片' },
        { status: 400 }
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    const userContent: string[] = [];

    if (productName) {
      userContent.push(`商品名称：${productName}`);
    }

    if (productImage) {
      userContent.push('已上传商品图片，请根据图片内容分析商品卖点');
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent.join('\n') }
    ];

    const llmConfig = {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
      streaming: true
    };

    let result = '';
    const aiStream = client.stream(messages as any, llmConfig as any);

    for await (const chunk of aiStream) {
      if (chunk && chunk.content) {
        result += chunk.content.toString();
      }
    }

    // 清理结果（去掉可能的引号、换行等）
    const cleaned = result
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
