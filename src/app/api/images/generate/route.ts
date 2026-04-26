import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 图片生成模型映射
const IMAGE_MODELS = {
  // 扣子内置模型（豆包SeeDream）
  'coze-image': { provider: 'coze', model: 'coze-image' },
  // 4sapi图片生成模型
  'gpt-image2': { provider: '4sapi', model: 'gpt-image-2' },
  'dall-e-3': { provider: '4sapi', model: 'dall-e-3' },
  'stable-diffusion-3': { provider: '4sapi', model: 'stable-diffusion-3' },
};

// 创建图片生成客户端（扣子）
function createCozeClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new ImageGenerationClient(config, customHeaders);
}

// 通过4sapi生成图片
async function generateWith4SAPI(
  prompt: string,
  model: string,
  size: string,
  image?: string | string[]
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  try {
    // 检查4sAPI是否启用（ENABLE_4SAPI=true才启用）
    if (process.env.ENABLE_4SAPI !== 'true') {
      return { success: false, error: '4sapi功能未启用，请联系管理员设置 ENABLE_4SAPI=true' };
    }
    
    // 4sAPI密钥 - 支持多种环境变量名称
    const apiKey = process.env.FOURS_API_KEY 
      || process.env.OPENAI_API_KEY 
      || process.env.API4S_KEY;
    
    if (!apiKey || apiKey === 'your-api-key-here') {
      return { success: false, error: '4sapi API密钥未配置' };
    }
    
    const apiUrl = process.env.API4S_URL || 'https://api.4sapi.cn/v1';

    // 构建请求体（OpenAI兼容格式）
    const requestBody: any = {
      model: model,
      prompt: prompt,
      n: 1,
      response_format: 'url',
    };

    // 设置尺寸
    if (size === '2K') {
      requestBody.size = '1024x1024';
    } else if (size === '4K') {
      requestBody.size = '1792x1024';
    } else {
      requestBody.size = size || '1024x1024';
    }

    // 如果有参考图片（图生图）
    if (image) {
      const images = Array.isArray(image) ? image : [image];
      if (images.length > 0 && images[0]) {
        // GPT-image2 支持参考图片
        requestBody.image = images[0];
      }
    }

    // 调用4sapi
    const response = await fetch(`${apiUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('4sapi图片生成失败:', response.status, errorText);
      return { success: false, error: `API错误: ${response.status}` };
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return {
        success: true,
        imageUrls: data.data.map((item: any) => item.url),
      };
    }

    return { success: false, error: '未返回图片数据' };
  } catch (error: any) {
    console.error('4sapi调用失败:', error);
    return { success: false, error: error.message };
  }
}

// 上传图片到 Supabase Storage
async function uploadToStorage(imageUrl: string): Promise<string> {
  try {
    const { getSupabaseClient } = await import('@/storage/database/supabase-client');
    const supabase = getSupabaseClient();
    
    // 下载图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`下载图片失败: ${response.status}`);
    }
    const blob = await response.blob();
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `ai-photos/${timestamp}-${random}.png`;
    
    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) {
      console.error('上传到Storage失败:', error);
      throw error;
    }

    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}

// 生成图片
export async function POST(request: NextRequest) {
  try {
    // 提取转发头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

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

    // 确定使用哪个模型
    const modelKey = model || 'coze-image';
    const modelConfig = IMAGE_MODELS[modelKey as keyof typeof IMAGE_MODELS] || IMAGE_MODELS['coze-image'];

    console.log('开始生成图片，参数:', JSON.stringify({
      prompt: prompt.substring(0, 100) + '...',
      size,
      model: modelKey,
      modelProvider: modelConfig.provider,
      hasImage: !!image,
    }));

    let imageUrls: string[] = [];

    if (modelConfig.provider === '4sapi') {
      // 使用4sapi生成图片
      const result = await generateWith4SAPI(
        prompt,
        modelConfig.model,
        size,
        image
      );

      if (!result.success || !result.imageUrls) {
        return NextResponse.json({
          success: false,
          error: result.error || '生成失败',
        }, { status: 500 });
      }

      imageUrls = result.imageUrls;
    } else {
      // 使用扣子SDK生成图片
      const client = createCozeClient(customHeaders);

      // 构造请求参数
      const requestParams: any = {
        prompt,
        size,
        watermark: false,
      };

      // 如果有参考图片，添加图生图参数
      if (image) {
        requestParams.image = Array.isArray(image) ? image : [image];
      }

      const response = await client.generate(requestParams);
      const helper = client.getResponseHelper(response);

      if (!helper.success || !helper.imageUrls || helper.imageUrls.length === 0) {
        console.error('图片生成失败:', helper.errorMessages);
        return NextResponse.json({
          success: false,
          error: helper.errorMessages?.join(', ') || '生成失败',
        }, { status: 500 });
      }

      imageUrls = helper.imageUrls;
    }

    console.log('图片生成成功，数量:', imageUrls.length);
    
    // 上传所有图片到 Storage 并返回公网URL
    const publicUrls = await Promise.all(
      imageUrls.map(async (url: string) => {
        try {
          const publicUrl = await uploadToStorage(url);
          console.log('图片上传成功:', publicUrl.substring(0, 50) + '...');
          return publicUrl;
        } catch (error) {
          console.error('单张图片上传失败，使用原URL:', url);
          // 如果上传失败，返回原URL
          return url;
        }
      })
    );

    return NextResponse.json({
      success: true,
      imageUrls: publicUrls,
      count: publicUrls.length,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || '服务器错误'
    }, { status: 500 });
  }
}

// 批量生成图片（默认使用扣子SDK）
export async function PUT(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = createCozeClient(customHeaders);

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
    
    const results = await Promise.all(responses.map(async (response, index) => {
      const helper = client.getResponseHelper(response);
      if (helper.success) {
        // 上传图片到 Storage
        const publicUrls = await Promise.all(
          (helper.imageUrls || []).map(async (url: string) => {
            try {
              return await uploadToStorage(url);
            } catch {
              return url;
            }
          })
        );
        return {
          index,
          success: true,
          imageUrls: publicUrls,
          error: null,
        };
      }
      return {
        index,
        success: false,
        imageUrls: [],
        error: helper.errorMessages.join(', '),
      };
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('批量生成失败:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || '服务器错误'
    }, { status: 500 });
  }
}
