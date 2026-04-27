import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, ImageGenerationResponseHelper, Config } from 'coze-coding-dev-sdk';
import { spawn } from 'child_process';
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
        requestBody.image = images[0];
      }
    }

    // 使用bash -c执行curl命令
    const curlCmd = `curl -s --connect-timeout 60 -X POST "${apiUrl}/images/generations" -H "Content-Type: application/json" -H "Authorization: Bearer ${apiKey}" -d '${JSON.stringify(requestBody)}'`;
    
    const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      const child = spawn('bash', ['-c', curlCmd]);
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });
      
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`bash exited with code ${code}`));
      });
    });
    
    const responseText = result.stdout;
    
    // 检查响应是否是HTML错误页
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<!doctype')) {
      return { success: false, error: '4sAPI返回了错误页面，可能是IP被限制或余额不足' };
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

// 通过扣子生成图片
async function generateWithCoze(
  prompt: string,
  model: string,
  size: string,
  image?: string | string[]
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  try {
    const client = createCozeClient();
    
    const request = {
      model,
      prompt,
      size: size || '1024x1024',
    };
    
    const result = await client.generate(request);
    
    const helper = new ImageGenerationResponseHelper(result);
    
    if (helper.success && helper.imageUrls.length > 0) {
      return {
        success: true,
        imageUrls: helper.imageUrls,
      };
    }
    
    return { success: false, error: helper.errorMessages[0] || '扣子图片生成失败' };
  } catch (error: any) {
    console.error('扣子调用失败:', error);
    return { success: false, error: error.message };
  }
}

// 上传图片到 Supabase Storage
async function uploadToStorage(imageUrl: string): Promise<string> {
  try {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool_id, prompt, size, model, image } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: '缺少prompt参数' },
        { status: 400 }
      );
    }

    // 获取工具的模型配置
    let providerConfig: any = null;
    let modelName = model || 'coze-image';
    
    if (tool_id) {
      const supabase = getSupabaseClient();
      
      // 查询工具的模型配置 - 支持 id 或 slug
      const query = supabase
        .from('utility_tools')
        .select('id, model_provider_id, model_name, model_config')
        .eq(isNaN(Number(tool_id)) ? 'slug' : 'id', tool_id);
      
      const { data: tool } = await query.single();
      
      if (tool?.model_provider_id) {
        // 获取 provider 配置
        const { data: provider } = await supabase
          .from('model_providers')
          .select('*')
          .eq('id', tool.model_provider_id)
          .single();
        
        if (provider) {
          providerConfig = provider;
          modelName = tool.model_name || modelName;
        }
      }
    }

    // 根据 provider 类型选择生成方式
    let result: { success: boolean; imageUrls?: string[]; error?: string };
    
    if (providerConfig?.api_url && providerConfig?.api_key) {
      // 使用 4SAPI 或其他外部 API
      result = await generateWith4SAPI(
        prompt,
        modelName,
        size,
        providerConfig.api_url,
        providerConfig.api_key,
        image
      );
    } else {
      // 使用扣子内置模型
      result = await generateWithCoze(prompt, modelName, size, image);
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // 上传图片到 Storage
    const uploadedUrls: string[] = [];
    for (const imageUrl of result.imageUrls || []) {
      try {
        const uploadedUrl = await uploadToStorage(imageUrl);
        uploadedUrls.push(uploadedUrl);
      } catch (error) {
        // 如果上传失败，使用原始 URL
        uploadedUrls.push(imageUrl);
      }
    }

    return NextResponse.json({
      success: true,
      imageUrls: uploadedUrls,
    });
  } catch (error: any) {
    console.error('图片生成失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
