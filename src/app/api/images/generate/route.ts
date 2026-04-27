import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, ImageGenerationResponseHelper, Config } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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
  apiUrl: string,
  apiKey: string,
  image?: string | string[]
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  try {
    // 构建请求体（OpenAI兼容格式）
    const requestBody: Record<string, any> = {
      model: model,
      prompt: prompt,
      n: 1,
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
        requestBody.image = images[0];
      }
    }

    // 使用Node.js原生fetch调用
    const fullUrl = `${apiUrl}/images/generations`;
    console.log('[4SAPI] 请求URL:', fullUrl);
    console.log('[4SAPI] 请求体:', JSON.stringify(requestBody));
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('[4SAPI] 响应状态:', response.status);
    console.log('[4SAPI] 响应内容:', responseText.substring(0, 500));
    
    // 检查响应是否是HTML错误页
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<!doctype')) {
      return { success: false, error: '4sAPI返回了错误页面，可能是IP被限制或余额不足' };
    }

    if (!response.ok) {
      return { success: false, error: `4sAPI返回错误: ${response.status} - ${responseText.substring(0, 200)}` };
    }

    const data = JSON.parse(responseText);
    
    if (data.error) {
      return { success: false, error: data.error.message || '4sAPI调用失败' };
    }
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, image, size, style, model, tool_id } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: '请提供提示词' }, { status: 400 });
    }

    // 如果指定了模型，优先使用指定模型
    // 获取工具的模型配置
    let providerConfig: any = null;
    
    if (tool_id) {
      const supabase = getSupabaseClient();
      
      // 查询工具数据
      const { data: toolData } = await supabase
        .from('utility_tools')
        .select('id, tool_id, name, model_provider_id, model_name')
        .eq('tool_id', tool_id)
        .single();
      
      if (toolData && toolData.model_provider_id) {
        // 查询提供商数据
        const { data: providerData } = await supabase
          .from('model_providers')
          .select('id, name, slug, api_url, api_key')
          .eq('id', toolData.model_provider_id)
          .single();
        
        if (providerData) {
          providerConfig = {
            providerId: providerData.id,
            providerName: providerData.name,
            providerSlug: providerData.slug,
            apiUrl: providerData.api_url,
            apiKey: providerData.api_key,
            modelName: toolData.model_name,
          };
        }
      }
    }

    // 确定使用哪个模型
    let useModel = model;
    
    if (providerConfig) {
      useModel = providerConfig.modelName || model;
    }

    // 根据模型选择生成方式
    if (providerConfig && providerConfig.providerSlug && !providerConfig.providerSlug.includes('coze')) {
      // 4SAPI 或其他第三方API
      const result = await generateWith4SAPI(
        prompt,
        useModel || 'gpt-image-2',
        size || '1024x1024',
        providerConfig.apiUrl,
        providerConfig.apiKey
      );
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        imageUrls: result.imageUrls,
      });
    } else {
      // 扣子API（默认）
      const client = createCozeClient();
      
      const request: any = {
        prompt: prompt,
        size: size || '1024',
      };

      // 如果有参考图片（图生图）
      if (image) {
        if (Array.isArray(image) && image.length > 0) {
          request.image = image[0];
        } else if (image) {
          request.image = image;
        }
      }
      
      // 如果有指定模型
      if (useModel) {
        request.model = useModel;
      }
      
      const result = await client.generate(request);
      const helper = new ImageGenerationResponseHelper(result);
      
      if (helper.success && helper.imageUrls.length > 0) {
        return NextResponse.json({
          success: true,
          imageUrls: helper.imageUrls,
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: helper.errorMessages[0] || '扣子图片生成失败',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[图片生成] 错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
