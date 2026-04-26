import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { S3Storage } from 'coze-coding-dev-sdk';
import { saveGeneration } from '@/lib/save-generation';

// 生图提示词模板
const SYSTEM_PROMPT = `你是专业的AI漫画图像生成专家，擅长生成高质量的小说风格漫画图片。

核心要求：
1. 根据分镜描述生成专业、生动的漫画提示词
2. 提示词应包含：场景、人物、动作、情绪、风格等关键元素
3. 适配指定的漫画风格（古风/Q版/写实/赛博朋克/暗黑）
4. 画质要求明确（标清512/高清1024/超清2048）

输出格式：
直接输出英文提示词`;

// 支持的模型列表
const SUPPORTED_MODELS = [
  'doubao-seed-2-0-pro-260215',
  'doubao-seed-2-0-lite-260215',
  'doubao-seed-2-0-mini-260215',
  'doubao-seed-1-8-251228',
  'deepseek-r1-250528',
  'deepseek-v3-2-251201',
  'kimi-k2-5-260127',
  'glm-5-0-260211',
  'qwen3-5-plus-260215',
];

// 创建存储客户端
function createStorage() {
  return new S3Storage({
    endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
    bucketName: process.env.COZE_BUCKET_NAME,
    region: 'cn-beijing',
  });
}

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

export async function POST(request: NextRequest) {
  try {
    const { prompt, quality, style, model, sceneDescription } = await request.json();

    if (!prompt && !sceneDescription) {
      return NextResponse.json({ error: '请提供分镜描述' }, { status: 400 });
    }

    const qualityMap: Record<string, { size: string; quality: string }> = {
      '512': { size: '512x512', quality: 'standard' },
      '1024': { size: '1024x1024', quality: 'hd' },
      '2048': { size: '2K', quality: 'hd' },
    };

    const q = qualityMap[quality || '1024'] || qualityMap['1024'];
    
    // 验证模型参数
    const selectedModel = model && SUPPORTED_MODELS.includes(model) 
      ? model 
      : 'doubao-seed-1-8-251228';

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const llmClient = new LLMClient(new Config(), customHeaders);

    // 生成提示词
    const userPrompt = `请为以下漫画分镜生成AI生图提示词：

分镜描述：${prompt || sceneDescription}
漫画风格：${style || '古风'}
画质设置：${q.size}

请生成专业的英文提示词。`;

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt }
    ];

    // 获取提示词
    const fullContent: string[] = [];
    const llmConfig = {
      model: selectedModel,
      temperature: 0.7,
      streaming: true
    };

    const aiStream = llmClient.stream(messages as any, llmConfig);
    
    for await (const chunk of aiStream) {
      if (chunk.content) {
        fullContent.push(chunk.content.toString());
      }
    }

    const fullPrompt = fullContent.join('') || prompt || sceneDescription;

    // 调用图片生成API
    try {
      const imageClient = new ImageGenerationClient(new Config(), customHeaders);
      const storage = createStorage();

      const imageParams: any = {
        prompt: fullPrompt,
        size: q.size,
        watermark: false,
      };

      const imageResponse = await imageClient.generate(imageParams);
      const helper = imageClient.getResponseHelper(imageResponse);

      if (helper.success && helper.imageUrls.length > 0) {
        // 上传到存储获取可访问的URL
        const resultUrl = await downloadAndUploadImage(helper.imageUrls[0], storage, 'novel');
        
        // 保存生成记录
        saveGeneration(request, {
          tool_id: 4,
          tool_name: '漫画生图',
          tool_type: 'portrait',
          input_params: { style, quality, prompt: fullPrompt },
          output_content: { prompt: fullPrompt, imageUrl: resultUrl },
          title: `${style || '古风'}风格漫画`,
          thumbnail: resultUrl,
          usage_type: 'generate-image',
        }).catch(() => {});

        return NextResponse.json({
          success: true,
          prompt: fullPrompt,
          imageUrl: resultUrl,
          quality: q.size,
        });
      }
    } catch (imageError) {
      console.error('Image generation failed:', imageError);
      // 图片生成失败时返回提示词
    }

    // 返回结果（图片生成失败时只返回提示词）
    return NextResponse.json({
      success: false,
      prompt: fullPrompt,
      imageUrl: null,
      quality: q.size,
      error: '图片生成服务暂时不可用，已生成提示词可复制使用',
    });

  } catch (error: any) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: error.message || '生图失败' }, { status: 500 });
  }
}
