import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { readFile } from 'fs/promises';
import { join } from 'path';

// 从开发环境导入数据到当前环境
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { dev_url, use_local_file } = body;

    let data: { tools?: unknown[]; categories?: unknown[]; tags?: unknown[]; prompts?: unknown[]; tutorials?: unknown[] };

    // 支持从本地文件导入
    if (use_local_file) {
      // 尝试从文件系统读取
      const filePath = join(process.cwd(), 'public', 'migration-data.json');
      console.log('[Import] 从本地文件导入:', filePath);
      
      try {
        const fileContent = await readFile(filePath, 'utf-8');
        const migrationData = JSON.parse(fileContent);
        data = migrationData.data || migrationData;
      } catch (fileError) {
        // 如果文件系统读取失败，尝试从URL获取
        const localUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT 
          ? `https://${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/migration-data.json`
          : 'http://localhost:5000/migration-data.json';
        
        console.log('[Import] 从URL导入:', localUrl);
        const response = await fetch(localUrl);
        if (!response.ok) {
          return NextResponse.json({ 
            success: false, 
            error: '无法获取本地迁移文件' 
          }, { status: 500 });
        }
        const migrationData = await response.json();
        data = migrationData.data || migrationData;
      }
    } else {
      // 从开发环境API获取
      const sourceUrl = dev_url || 'http://localhost:5000/api/admin/data-migration';
      console.log('[Import] 从开发环境导入:', sourceUrl);

      const response = await fetch(sourceUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return NextResponse.json({ 
          success: false, 
          error: '无法获取数据源' 
        }, { status: 500 });
      }

      const migrationData = await response.json();
      data = migrationData.data || migrationData;
    }
    
    if (!data.tools) {
      return NextResponse.json({ 
        success: false, 
        error: '数据格式错误' 
      }, { status: 400 });
    }

    const results = {
      tools: { inserted: 0, skipped: 0 },
      prompts: { inserted: 0, skipped: 0 },
      tutorials: { inserted: 0, skipped: 0 },
      categories: { inserted: 0, skipped: 0 },
      tags: { inserted: 0, skipped: 0 },
    };

    // 清空现有数据
    console.log('[Import] 清空现有数据...');
    await client.from('tools').delete().neq('id', 0);
    await client.from('prompts').delete().neq('id', 0);
    await client.from('tutorials').delete().neq('id', 0);
    await client.from('categories').delete().neq('id', 0);
    await client.from('tags').delete().neq('id', 0);

    // 批量导入分类
    if (data.categories?.length && data.categories.length > 0) {
      console.log('[Import] 导入分类:', data.categories?.length);
      const { error } = await client.from('categories').insert(data.categories);
      if (error) console.error('[Import] 分类导入错误:', error.message);
      else results.categories.inserted = data.categories?.length || 0;
    }

    // 批量导入标签
    if (data.tags?.length && data.tags.length > 0) {
      console.log('[Import] 导入标签:', data.tags?.length);
      const { error } = await client.from('tags').insert(data.tags);
      if (error) console.error('[Import] 标签导入错误:', error.message);
      else results.tags.inserted = data.tags?.length || 0;
    }

    // 批量导入工具（分批处理，每批50条）
    if (data.tools?.length > 0) {
      console.log('[Import] 导入工具:', data.tools.length);
      const batchSize = 50;
      for (let i = 0; i < data.tools.length; i += batchSize) {
        const batch = data.tools.slice(i, i + batchSize);
        const { error } = await client.from('tools').insert(batch);
        if (error) {
          console.error(`[Import] 工具批次 ${i}-${i + batchSize} 导入错误:`, error.message);
          // 逐条插入失败的项目
          for (const tool of batch) {
            const { error: singleError } = await client.from('tools').insert(tool);
            if (singleError) results.tools.skipped++;
            else results.tools.inserted++;
          }
        } else {
          results.tools.inserted += batch.length;
        }
      }
    }

    // 批量导入提示词
    if (data.prompts?.length && data.prompts.length > 0) {
      console.log('[Import] 导入提示词:', data.prompts?.length);
      const { error } = await client.from('prompts').insert(data.prompts);
      if (error) console.error('[Import] 提示词导入错误:', error.message);
      else results.prompts.inserted = data.prompts?.length || 0;
    }

    // 批量导入教程
    if (data.tutorials?.length && data.tutorials.length > 0) {
      console.log('[Import] 导入教程:', data.tutorials?.length);
      const { error } = await client.from('tutorials').insert(data.tutorials);
      if (error) console.error('[Import] 教程导入错误:', error.message);
      else results.tutorials.inserted = data.tutorials?.length || 0;
    }

    // 验证最终数量
    const { count: finalCount } = await client
      .from('tools')
      .select('id', { count: 'exact', head: true });

    console.log('[Import] 导入完成，最终工具数:', finalCount);

    return NextResponse.json({
      success: true,
      message: '数据导入完成',
      results,
      final_counts: {
        tools: finalCount || 0,
      },
      source_counts: {
        tools: data.tools?.length || 0,
        categories: data.categories?.length || 0,
        tags: data.tags?.length || 0,
        prompts: data.prompts?.length || 0,
        tutorials: data.tutorials?.length || 0,
      },
    });

  } catch (error) {
    console.error('[Import] 导入失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '导入失败' 
    }, { status: 500 });
  }
}
