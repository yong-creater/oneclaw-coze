import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getTokenFromHeader } from '@/lib/auth';
import { saveGeneration } from '@/lib/save-generation';

// 创建图片生成客户端
function createImageClient(customHeaders: Record<string, string> = {}) {
  const config = new Config();
  return new ImageGenerationClient(config, customHeaders);
}

// 创建存储客户端
function createStorage() {
  return new S3Storage({
    endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
    bucketName: process.env.COZE_BUCKET_NAME,
    region: 'cn-beijing',
  });
}

// 处理类型对应的提示词
const PROCESS_PROMPTS: Record<string, { prompt: string; name: string }> = {
  'product-enhance': {
    name: '商品图精修',
    prompt: 'Professional product photography enhancement, improve lighting and brightness, remove wrinkles and creases, enhance colors and saturation, add natural shadow, make the product look more appealing and professional, high quality commercial photography, clean white background'
  },
  'background-removal': {
    name: 'AI智能抠图',
    prompt: 'Remove background from the product image, transparent background PNG, clean and precise edge cutout, professional product isolation, white or transparent background, maintain original product quality and details'
  },
  'portrait-enhance': {
    name: '照片美化',
    prompt: 'Professional photo retouching and enhancement, improve lighting and contrast, enhance natural skin tones, add subtle makeup effect, remove blemishes naturally, maintain realistic look, make the portrait more beautiful while keeping natural appearance, high quality portrait photography'
  },
  'layout-design': {
    name: '图文排版',
    prompt: 'Professional social media graphic design, combining product image with elegant text layout, modern minimalist style, clean typography, balanced composition, high quality marketing material, suitable for Instagram or WeChat content'
  }
};

// 从URL下载图片并上传到存储
async function downloadAndUploadImage(imageUrl: string, storage: S3Storage, prefix: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `${prefix}/${Date.now()}.${ext}`;
    
    const key = await storage.uploadFile({
      fileContent: Buffer.from(buffer),
      fileName,
      contentType,
    });
    
    return await storage.generatePresignedUrl({ key, expireTime: 3600 });
  } catch (error) {
    console.error('Download and upload failed:', error);
    throw error;
  }
}

// 图像处理主函数
async function processImage(
  imageUrl: string,
  processType: string,
  customHeaders: Record<string, string>
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const client = createImageClient(customHeaders);
  const storage = createStorage();
  
  const config = PROCESS_PROMPTS[processType];
  if (!config) {
    return { success: false, error: '未知的处理类型' };
  }
  
  try {
    // 如果是base64格式，先上传到存储获取可访问的URL
    let processedImageUrl = imageUrl;
    const isBase64 = imageUrl.startsWith('data:') || imageUrl.startsWith('blob:');
    
    if (isBase64) {
      console.log('Uploading base64 image to storage...');
      processedImageUrl = await downloadAndUploadImage(imageUrl, storage, 'input');
      console.log('Image uploaded:', processedImageUrl);
    } else if (!imageUrl.startsWith('http')) {
      return { success: false, error: '请提供有效的图片URL' };
    }
    
    // 调用图片生成API进行处理
    const requestParams: any = {
      prompt: config.prompt,
      size: '2K',
      watermark: false,
    };
    
    // 只有当有参考图片时才添加image参数
    if (processedImageUrl.startsWith('http')) {
      requestParams.image = [processedImageUrl]; // 必须传入数组格式
    }
    
    console.log('Calling image generation API with prompt:', config.prompt);
    const response = await client.generate(requestParams);
    const helper = client.getResponseHelper(response);
    
    if (helper.success && helper.imageUrls.length > 0) {
      console.log('Image generated successfully:', helper.imageUrls[0]);
      // 将生成的图片上传到存储
      const resultKey = await downloadAndUploadImage(helper.imageUrls[0], storage, 'output');
      return { success: true, imageUrl: resultKey };
    } else {
      console.error('Image generation failed:', helper.errorMessages);
      return { success: false, error: helper.errorMessages?.join(', ') || '处理失败' };
    }
  } catch (error: any) {
    console.error('Image processing error:', error);
    return { success: false, error: error?.message || '服务器错误' };
  }
}

// POST - 图像处理
export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const body = await request.json();
    const { imageUrl, processType } = body;
    
    if (!imageUrl) {
      return NextResponse.json({ error: '请提供图片' }, { status: 400 });
    }
    
    if (!processType || !PROCESS_PROMPTS[processType]) {
      return NextResponse.json({ error: '请提供有效的处理类型' }, { status: 400 });
    }
    
    const result = await processImage(imageUrl, processType, customHeaders);
    
    if (result.success) {
      // 保存生成记录
      saveGeneration(request, {
        tool_id: 6,
        tool_name: PROCESS_PROMPTS[processType].name,
        tool_type: processType === 'background-removal' ? 'background_removal' : 
                   processType === 'product-enhance' ? 'goods_image' :
                   processType === 'portrait-enhance' ? 'photo' : 'layout',
        input_params: { processType, imageUrl },
        output_content: { imageUrl: result.imageUrl },
        title: `${PROCESS_PROMPTS[processType].name}结果`,
        thumbnail: result.imageUrl,
        usage_type: processType,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        processType: PROCESS_PROMPTS[processType].name,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || '处理失败',
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || '服务器错误',
    }, { status: 500 });
  }
}

// GET - 获取支持的处理类型列表
export async function GET() {
  const types = Object.entries(PROCESS_PROMPTS).map(([key, value]) => ({
    type: key,
    name: value.name,
  }));
  
  return NextResponse.json({
    success: true,
    types,
  });
}
