import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 创建图片生成客户端
function createClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new ImageGenerationClient(config, customHeaders);
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

    console.log('开始生成图片，参数:', JSON.stringify({
      prompt: prompt.substring(0, 100) + '...',
      size,
      model,
      hasImage: !!image,
    }));

    // 生成单张或多张图片
    const response = await client.generate(requestParams);
    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls && helper.imageUrls.length > 0) {
      console.log('图片生成成功，数量:', helper.imageUrls.length);
      
      // 上传所有图片到 Storage 并返回公网URL
      const publicUrls = await Promise.all(
        helper.imageUrls.map(async (url: string) => {
          try {
            const publicUrl = await uploadToStorage(url);
            console.log('图片上传成功:', publicUrl.substring(0, 50) + '...');
            return publicUrl;
          } catch (error) {
            console.error('单张图片上传失败，使用原URL:', url);
            // 如果上传失败，返回原URL（可能是内部代理地址）
            return url;
          }
        })
      );

      return NextResponse.json({
        success: true,
        imageUrls: publicUrls,
        count: publicUrls.length,
      });
    } else {
      console.error('图片生成失败:', helper.errorMessages);
      return NextResponse.json({
        success: false,
        error: helper.errorMessages?.join(', ') || '生成失败',
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
