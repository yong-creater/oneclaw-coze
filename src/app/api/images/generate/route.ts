import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 创建图片生成客户端
function createClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new ImageGenerationClient(config, customHeaders);
}

// 生成图片
export async function POST(request: NextRequest) {
  try {
    // 提取转发头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = createClient(customHeaders);

    const body = await request.json();
    const { 
      prompt, 
      size = '2K', 
      count = 1,
      image, // 可选：参考图片，用于图生图
      model 
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: '请提供图片描述' }, { status: 400 });
    }

    // 构造请求参数
    const requestParams: any = {
      prompt,
      size,
      watermark: false,
    };

    if (model) {
      requestParams.model = model;
    }

    // 如果有参考图片，添加图生图参数
    if (image) {
      requestParams.image = Array.isArray(image) ? image : [image];
    }

    // 生成单张或多张图片
    const response = await client.generate(requestParams);
    const helper = client.getResponseHelper(response);

    if (helper.success) {
      return NextResponse.json({
        success: true,
        imageUrls: helper.imageUrls,
        count: helper.imageUrls.length,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: helper.errorMessages.join(', ') || '生成失败',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || '服务器错误'
    }, { status: 500 });
  }
}

// 批量生成图片
export async function PUT(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = createClient(customHeaders);

    const body = await request.json();
    const { requests } = body;

    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({ error: '请提供生成请求数组' }, { status: 400 });
    }

    // 限制批量数量
    const limitedRequests = requests.slice(0, 5).map((req: any) => ({
      prompt: req.prompt,
      size: req.size || '2K',
      watermark: false,
    }));

    const responses = await client.batchGenerate(limitedRequests);
    
    const results = responses.map((response, index) => {
      const helper = client.getResponseHelper(response);
      return {
        index,
        success: helper.success,
        imageUrls: helper.success ? helper.imageUrls : [],
        error: helper.success ? null : helper.errorMessages.join(', '),
      };
    });

    return NextResponse.json({
      success: true,
      results,
      totalSuccess: results.filter((r: any) => r.success).length,
    });
  } catch (error: any) {
    console.error('Batch image generation error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || '服务器错误'
    }, { status: 500 });
  }
}
