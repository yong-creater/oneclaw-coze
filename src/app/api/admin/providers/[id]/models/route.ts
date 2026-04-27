import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { spawn } from 'child_process';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    // 获取 provider 配置
    const { data: provider, error: providerError } = await client
      .from('model_providers')
      .select('*')
      .eq('id', id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json({ error: 'Provider 不存在' }, { status: 404 });
    }

    // 如果是扣子（无 API URL），直接返回数据库中的模型
    if (!provider.api_url || !provider.api_key) {
      const { data: models } = await client
        .from('models')
        .select('*')
        .eq('provider_id', id)
        .order('display_name');
      return NextResponse.json({ data: models, source: 'database' });
    }

    // 从 API 获取模型列表
    const models = await fetchModelsFromAPI(provider.api_url, provider.api_key, provider.provider_type);
    
    if (!models || models.length === 0) {
      // API 获取失败，返回数据库中的模型
      const { data: dbModels } = await client
        .from('models')
        .select('*')
        .eq('provider_id', id)
        .order('display_name');
      return NextResponse.json({ data: dbModels, source: 'database', warning: '从API获取失败' });
    }

    // 更新数据库中的模型
    const existingModels = await client
      .from('models')
      .select('name, id')
      .eq('provider_id', id);

    const existingNames = new Set(existingModels.data?.map(m => m.name) || []);
    const newModels = models.filter(m => !existingNames.has(m.name));

    // 插入新模型
    if (newModels.length > 0) {
      const insertData = newModels.map(m => ({
        provider_id: id,
        name: m.name,
        display_name: m.display_name || m.name,
        model_type: provider.provider_type,
        description: m.description || '',
        is_available: true,
      }));

      await client.from('models').insert(insertData);
    }

    // 标记不存在的模型为不可用
    const currentNames = new Set(models.map(m => m.name));
    for (const existing of existingModels.data || []) {
      if (!currentNames.has(existing.name)) {
        await client
          .from('models')
          .update({ is_available: false })
          .eq('id', existing.id);
      }
    }

    // 返回更新后的模型列表
    const { data: updatedModels } = await client
      .from('models')
      .select('*')
      .eq('provider_id', id)
      .order('display_name');

    return NextResponse.json({ 
      data: updatedModels, 
      source: 'api',
      fetched_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('获取模型列表失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchModelsFromAPI(
  apiUrl: string, 
  apiKey: string, 
  type: string
): Promise<Array<{name: string, display_name?: string, description?: string}>> {
  try {
    // 使用 curl 调用 API
    const curlCmd = `curl -s "${apiUrl}/models" -H "Authorization: Bearer ${apiKey}"`;
    
    const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      const child = spawn('bash', ['-c', curlCmd]);
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`curl exited with code ${code}`));
      });
    });

    const response = JSON.parse(result.stdout);
    
    if (response.data && Array.isArray(response.data)) {
      // 根据类型过滤模型
      return response.data
        .filter((m: any) => {
          if (type === 'image') {
            return m.id.includes('image') || m.id.includes('dall') || m.id.includes('stable-diffusion') || m.id.includes('dream');
          }
          if (type === 'llm') {
            return !m.id.includes('image') && !m.id.includes('dall') && !m.id.includes('stable-diffusion') && !m.id.includes('dream');
          }
          return true;
        })
        .map((m: any) => ({
          name: m.id,
          display_name: m.id,
          description: `支持端点: ${m.supported_endpoint_types?.join(', ') || 'unknown'}`,
        }));
    }

    return [];
  } catch (error) {
    console.error('API 调用失败:', error);
    return [];
  }
}
