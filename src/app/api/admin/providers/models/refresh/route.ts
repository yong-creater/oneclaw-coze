import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { spawn } from 'child_process';

// 扣子支持的模型列表（需要验证可用性）
const KNOWN_MODELS = {
  image: [
    { name: 'coze-image', display_name: '豆包图片生成', description: '扣子内置图片生成模型' },
  ],
  llm: [
    { name: 'doubao-seed-2-0-pro-260215', display_name: 'Doubao-Seed 2.0 Pro', description: '旗舰级全能通用模型' },
    { name: 'doubao-seed-2-0-lite-260215', display_name: 'Doubao-Seed 2.0 Lite', description: '兼顾性能与成本的均衡型模型' },
    { name: 'doubao-seed-2-0-mini-260215', display_name: 'Doubao-Seed 2.0 Mini', description: '轻量级模型' },
    { name: 'doubao-seed-1-8-251228', display_name: 'Doubao-Seed 1.8', description: '面向多模态Agent场景' },
    { name: 'doubao-pro-4k-240815', display_name: 'Doubao-Pro 4K', description: '专业版4K上下文' },
    { name: 'doubao-pro-32k-240815', display_name: 'Doubao-Pro 32K', description: '专业版32K上下文' },
    { name: 'doubao-lite-4k-240815', display_name: 'Doubao-Lite 4K', description: '轻量版4K上下文' },
    { name: 'doubao-lite-32k-240815', display_name: 'Doubao-Lite 32K', description: '轻量版32K上下文' },
  ],
  video: [
    // 待添加
  ],
  audio: [
    // 待添加
  ],
};

// 测试4SAPI模型是否可用
async function test4SAPIModel(apiUrl: string, apiKey: string, modelName: string): Promise<boolean> {
  try {
    const curlCmd = `curl -s --connect-timeout 10 -X POST "${apiUrl}/chat/completions" -H "Content-Type: application/json" -H "Authorization: Bearer ${apiKey}" -d '{"model":"${modelName}","messages":[{"role":"user","content":"hi"}],"max_tokens":5}'`;
    
    const result = await new Promise<{ stdout: string }>((resolve, reject) => {
      const child = spawn('bash', ['-c', curlCmd]);
      let stdout = '';
      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.on('error', reject);
      child.on('close', () => resolve({ stdout }));
    });

    const response = JSON.parse(result.stdout);
    // 如果返回错误说模型不支持，说明不可用
    if (response.error && response.error.message?.includes('model')) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

// 从4SAPI动态获取模型列表
async function fetchModelsFrom4SAPI(apiUrl: string, apiKey: string, providerType: string): Promise<any[]> {
  try {
    const curlCmd = `curl -s "${apiUrl}/models" -H "Authorization: Bearer ${apiKey}"`;
    
    const result = await new Promise<{ stdout: string }>((resolve, reject) => {
      const child = spawn('bash', ['-c', curlCmd]);
      let stdout = '';
      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.on('error', reject);
      child.on('close', () => resolve({ stdout }));
    });

    const response = JSON.parse(result.stdout);
    if (response.data && Array.isArray(response.data)) {
      // 根据provider类型过滤模型
      return response.data
        .filter((m: any) => {
          const modelName = m.id.toLowerCase();
          // 图片模型关键词
          const imageKeywords = ['image', 'dall', 'stable-diffusion', 'dream', 'flux', 'midjourney', 'sdxl', 'Imagen'];
          // 视频模型关键词
          const videoKeywords = ['video', 'sora', 'kling', 'runway', 'pika', 'luma'];
          // LLM模型关键词（排除图片和视频）
          const isImage = imageKeywords.some(k => modelName.includes(k));
          const isVideo = videoKeywords.some(k => modelName.includes(k));
          
          if (providerType === 'image') return isImage;
          if (providerType === 'video') return isVideo;
          if (providerType === 'llm') return !isImage && !isVideo;
          return true;
        })
        .map((m: any) => ({
          name: m.id,
          display_name: m.id,
          description: m.owned_by || '',
        }));
    }
    return [];
  } catch (error) {
    console.error('获取4SAPI模型失败:', error);
    return [];
  }
}

// GET - 获取/刷新所有模型的可用性
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    const providerId = searchParams.get('provider_id');

    // 获取所有provider
    let query = client.from('model_providers').select('*');
    if (providerId) {
      query = query.eq('id', providerId);
    }
    const { data: providers } = await query;

    const results = [];

    for (const provider of providers || []) {
      let models: any[] = [];
      let source = 'database';

      // 扣子provider（无外部API）
      if (!provider.api_url || !provider.api_key) {
        if (refresh || !provider.is_system) {
          // 刷新时使用已知模型列表更新数据库
          const knownModels = KNOWN_MODELS[provider.provider_type as keyof typeof KNOWN_MODELS] || [];
          
          // 获取现有模型
          const { data: existingModels } = await client
            .from('models')
            .select('id, name')
            .eq('provider_id', provider.id);

          const existingNames = new Set(existingModels?.map(m => m.name) || []);
          
          // 添加新模型
          for (const model of knownModels) {
            if (!existingNames.has(model.name)) {
              await client.from('models').insert({
                provider_id: provider.id,
                name: model.name,
                display_name: model.display_name,
                model_type: provider.provider_type,
                description: model.description,
                is_available: true, // 扣子模型默认可用
              });
            }
          }
          
          source = 'updated';
        }
        
        // 获取更新后的模型列表
        const { data: dbModels } = await client
          .from('models')
          .select('*')
          .eq('provider_id', provider.id)
          .order('display_name');
        models = dbModels || [];
      } 
      // 4SAPI provider
      else if (provider.slug?.includes('4sapi')) {
        if (refresh) {
          const apiModels = await fetchModelsFrom4SAPI(provider.api_url, provider.api_key, provider.provider_type);
          
          // 获取现有模型
          const { data: existingModels } = await client
            .from('models')
            .select('id, name')
            .eq('provider_id', provider.id);

          const existingNames = new Set(existingModels?.map(m => m.name) || []);
          const apiNames = new Set(apiModels.map(m => m.name));

          // 添加新模型
          for (const model of apiModels) {
            if (!existingNames.has(model.name)) {
              // 测试模型是否真正可用
              const isAvailable = await test4SAPIModel(provider.api_url, provider.api_key, model.name);
              
              await client.from('models').insert({
                provider_id: provider.id,
                name: model.name,
                display_name: model.display_name,
                model_type: provider.provider_type,
                description: model.description,
                is_available: isAvailable,
              });
            }
          }

          // 标记不再可用的模型
          for (const existing of existingModels || []) {
            if (!apiNames.has(existing.name)) {
              await client
                .from('models')
                .update({ is_available: false })
                .eq('id', existing.id);
            }
          }
          
          source = 'api';
        }
        
        // 获取更新后的模型列表
        const { data: dbModels } = await client
          .from('models')
          .select('*')
          .eq('provider_id', provider.id)
          .order('display_name');
        models = dbModels || [];
      }

      results.push({
        provider_id: provider.id,
        provider_name: provider.name,
        provider_slug: provider.slug,
        provider_type: provider.provider_type,
        source,
        models,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      refreshed_at: refresh ? new Date().toISOString() : null,
    });
  } catch (error: any) {
    console.error('刷新模型失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
