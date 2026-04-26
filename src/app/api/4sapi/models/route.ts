import { NextResponse } from 'next/server';

// 4S API 模型列表接口
const FOUR_S_MODELS_API = 'https://api.4sapi.com/api/models';

// 备用模型列表（API 不可用时使用）
const FALLBACK_MODELS = [
  // 文本模型
  { id: 'gpt-4o', name: 'GPT-4o', type: 'chat', input_price: 0.0025, output_price: 0.01, price_unit: 'per_1k_tokens', description: 'OpenAI 最强通用模型' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'chat', input_price: 0.00015, output_price: 0.0006, price_unit: 'per_1k_tokens', description: 'OpenAI 高性价比模型' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'chat', input_price: 0.01, output_price: 0.03, price_unit: 'per_1k_tokens', description: 'OpenAI 高性能模型' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', type: 'chat', input_price: 0.003, output_price: 0.015, price_unit: 'per_1k_tokens', description: 'Anthropic 最强通用模型' },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', type: 'chat', input_price: 0.0008, output_price: 0.004, price_unit: 'per_1k_tokens', description: 'Anthropic 高性价比模型' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', type: 'chat', input_price: 0.015, output_price: 0.075, price_unit: 'per_1k_tokens', description: 'Anthropic 最强旗舰模型' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'chat', input_price: 0.00125, output_price: 0.005, price_unit: 'per_1k_tokens', description: 'Google 最强通用模型' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', type: 'chat', input_price: 0.000075, output_price: 0.0003, price_unit: 'per_1k_tokens', description: 'Google 高性价比模型' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', type: 'chat', input_price: 0.0001, output_price: 0.0004, price_unit: 'per_1k_tokens', description: 'Google 新一代高速模型' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', type: 'chat', input_price: 0.0001, output_price: 0.0003, price_unit: 'per_1k_tokens', description: 'DeepSeek 高性价比模型' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', type: 'chat', input_price: 0.00014, output_price: 0.00049, price_unit: 'per_1k_tokens', description: 'DeepSeek 编程专用模型' },
  { id: 'qwen-plus', name: 'Qwen Plus', type: 'chat', input_price: 0.0008, output_price: 0.002, price_unit: 'per_1k_tokens', description: '阿里通义千问 Plus' },
  { id: 'qwen-turbo', name: 'Qwen Turbo', type: 'chat', input_price: 0.0015, output_price: 0.006, price_unit: 'per_1k_tokens', description: '阿里通义千问 Turbo' },
  { id: 'yi-lightning', name: 'Yi Lightning', type: 'chat', input_price: 0.0015, output_price: 0.006, price_unit: 'per_1k_tokens', description: '零一万物高速模型' },
  { id: 'kimi-plus', name: 'Kimi Plus', type: 'chat', input_price: 0.012, output_price: 0.096, price_unit: 'per_1k_tokens', description: '月之暗面 Kimi Plus' },
  // 图像模型
  { id: 'dall-e-3', name: 'DALL-E 3', type: 'image', input_price: 0.04, output_price: 0, price_unit: 'per_image', description: 'OpenAI 最强图像生成模型' },
  { id: 'dall-e-3-hd', name: 'DALL-E 3 HD', type: 'image', input_price: 0.08, output_price: 0, price_unit: 'per_image', description: 'OpenAI 高清图像生成' },
  { id: 'gpt-image-1', name: 'GPT-Image 1', type: 'image', input_price: 0.01, output_price: 0, price_unit: 'per_image', description: 'OpenAI 新一代图像生成' },
  { id: 'gpt-image-2', name: 'GPT-Image 2', type: 'image', input_price: 0.02, output_price: 0, price_unit: 'per_image', description: 'OpenAI 最新图像生成 V2' },
  { id: 'stable-diffusion-3', name: 'Stable Diffusion 3', type: 'image', input_price: 0.003, output_price: 0, price_unit: 'per_image', description: 'Stability AI 最新模型' },
  { id: 'flux-pro', name: 'FLUX Pro', type: 'image', input_price: 0.05, output_price: 0, price_unit: 'per_image', description: 'FLUX 最强图像模型' },
  { id: 'flux-dev', name: 'FLUX Dev', type: 'image', input_price: 0.003, output_price: 0, price_unit: 'per_image', description: 'FLUX 开发版' },
  { id: 'flux-schnell', name: 'FLUX Schnell', type: 'image', input_price: 0.001, output_price: 0, price_unit: 'per_image', description: 'FLUX 快速版' },
  { id: 'midjourney', name: 'Midjourney', type: 'image', input_price: 0.035, output_price: 0, price_unit: 'per_image', description: 'Midjourney 最新版本' },
  { id: 'minimax-image-01', name: 'MiniMax Image-01', type: 'image', input_price: 0.001, output_price: 0, price_unit: 'per_image', description: 'MiniMax 高性价比图像' },
  { id: ' CogView-3', name: 'CogView-3', type: 'image', input_price: 0.003, output_price: 0, price_unit: 'per_image', description: '智谱 CogView 3' },
  { id: 'wanx-plus', name: 'WanX Plus', type: 'image', input_price: 0.05, output_price: 0, price_unit: 'per_image', description: '阿里万相 Plus' },
  // 视频模型
  { id: 'kling-1', name: '可灵 1.0', type: 'video', input_price: 0.1, output_price: 0, price_unit: 'per_second', description: '快手可灵视频生成 1.0' },
  { id: 'kling-1-pro', name: '可灵 1.0 Pro', type: 'video', input_price: 0.35, output_price: 0, price_unit: 'per_second', description: '快手可灵视频生成 Pro' },
  { id: 'hailuo-2', name: '海螺 2.0', type: 'video', input_price: 0.02, output_price: 0, price_unit: 'per_second', description: 'MiniMax 海螺视频 2.0' },
  { id: 'hailuo-2-pro', name: '海螺 2.0 Pro', type: 'video', input_price: 0.1, output_price: 0, price_unit: 'per_second', description: 'MiniMax 海螺视频 Pro' },
  { id: 'runway-gen3', name: 'Runway Gen-3', type: 'video', input_price: 0.05, output_price: 0, price_unit: 'per_second', description: 'Runway 视频生成' },
  { id: 'pika-2', name: 'Pika 2.0', type: 'video', input_price: 0.01, output_price: 0, price_unit: 'per_second', description: 'Pika 视频生成 2.0' },
  { id: 'luma-photon', name: 'Luma Photon', type: 'video', input_price: 0.02, output_price: 0, price_unit: 'per_second', description: 'Luma 视频生成' },
  { id: 'sora-1', name: 'Sora 1.0', type: 'video', input_price: 0.1, output_price: 0, price_unit: 'per_second', description: 'OpenAI Sora 视频生成' },
  { id: 'sora-turbo', name: 'Sora Turbo', type: 'video', input_price: 0.02, output_price: 0, price_unit: 'per_second', description: 'OpenAI Sora 快速版' },
  // 音频模型
  { id: 'elevenlabs', name: 'ElevenLabs', type: 'audio', input_price: 0.005, output_price: 0, price_unit: 'per_1k_chars', description: 'ElevenLabs 语音合成' },
  { id: 'fish-speech', name: 'Fish Speech', type: 'audio', input_price: 0.001, output_price: 0, price_unit: 'per_1k_chars', description: 'Fish Speech 语音合成' },
  { id: 'cosyvoice', name: 'CosyVoice', type: 'audio', input_price: 0.001, output_price: 0, price_unit: 'per_1k_chars', description: '阿里 CosyVoice 语音合成' },
];

// 缓存模型列表 1 小时
let cachedModels: any[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1小时

export async function GET() {
  try {
    const now = Date.now();
    
    // 检查缓存
    if (cachedModels && (now - cacheTime) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        models: cachedModels,
        source: 'cache'
      });
    }

    // 从 4S API 获取模型列表
    const response = await fetch(FOUR_S_MODELS_API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Next.js 缓存 1 小时
    });

    if (!response.ok) {
      throw new Error(`4S API 返回错误: ${response.status}`);
    }

    const data = await response.json();
    
    // 解析 4S API 返回的模型数据
    // 4S API 返回格式可能是 { models: [...] } 或直接的数组
    let models: any[] = [];
    
    if (Array.isArray(data)) {
      models = data;
    } else if (data.data && Array.isArray(data.data)) {
      models = data.data;
    } else if (data.models && Array.isArray(data.models)) {
      models = data.models;
    } else if (typeof data === 'object') {
      // 尝试从对象中提取模型数组
      const possibleArrays = Object.values(data).filter(v => Array.isArray(v));
      if (possibleArrays.length > 0) {
        models = possibleArrays[0];
      }
    }

    // 标准化模型数据
    const normalizedModels = models.map((model: any) => ({
      id: model.id || model.model_id || model.name,
      name: model.name || model.id || model.model_id,
      type: model.type || 'chat', // chat, image, embedding 等
      input_price: model.input_price || model.price?.input || 0,
      output_price: model.output_price || model.price?.output || 0,
      price_unit: model.price_unit || 'per_1k_tokens',
      description: model.description || model.name || '',
    }));

    // 更新缓存
    cachedModels = normalizedModels;
    cacheTime = now;

    return NextResponse.json({
      success: true,
      models: normalizedModels,
      source: 'api',
      cached_at: cacheTime
    });
  } catch (error) {
    console.error('获取 4S API 模型列表失败:', error);
    
    // 如果有缓存，返回缓存数据
    if (cachedModels) {
      return NextResponse.json({
        success: true,
        models: cachedModels,
        source: 'cache_fallback',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
    
    // API 不可用时返回备用模型列表
    return NextResponse.json({
      success: true,
      models: FALLBACK_MODELS,
      source: 'fallback',
      error: error instanceof Error ? error.message : '使用备用模型列表'
    });
  }
}
