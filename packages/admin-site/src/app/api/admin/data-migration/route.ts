import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 导出所有数据（用于数据迁移）
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    // 并行获取所有数据
    const [toolsResult, promptsResult, tutorialsResult, categoriesResult, tagsResult] = await Promise.all([
      client.from('tools').select('*'),
      client.from('prompts').select('*'),
      client.from('tutorials').select('*'),
      client.from('categories').select('*'),
      client.from('tags').select('*'),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      counts: {
        tools: toolsResult.data?.length || 0,
        prompts: promptsResult.data?.length || 0,
        tutorials: tutorialsResult.data?.length || 0,
        categories: categoriesResult.data?.length || 0,
        tags: tagsResult.data?.length || 0,
      },
      data: {
        tools: toolsResult.data || [],
        prompts: promptsResult.data || [],
        tutorials: tutorialsResult.data || [],
        categories: categoriesResult.data || [],
        tags: tagsResult.data || [],
      }
    };

    return NextResponse.json({
      success: true,
      ...exportData
    });
  } catch (error) {
    console.error('导出数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '导出失败' 
    }, { status: 500 });
  }
}

// 导入数据（用于数据迁移）
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { data, mode = 'merge' } = body; // mode: 'merge' 或 'replace'

    if (!data) {
      return NextResponse.json({ success: false, error: '缺少数据' }, { status: 400 });
    }

    const results = {
      tools: { inserted: 0, updated: 0, skipped: 0 },
      prompts: { inserted: 0, updated: 0, skipped: 0 },
      tutorials: { inserted: 0, updated: 0, skipped: 0 },
      categories: { inserted: 0, updated: 0, skipped: 0 },
      tags: { inserted: 0, updated: 0, skipped: 0 },
    };

    // 导入分类
    if (data.categories?.length > 0) {
      for (const item of data.categories) {
        const { data: existing } = await client
          .from('categories')
          .select('id')
          .eq('id', item.id)
          .single();

        if (existing) {
          if (mode === 'replace') {
            await client.from('categories').update(item).eq('id', item.id);
            results.categories.updated++;
          } else {
            results.categories.skipped++;
          }
        } else {
          await client.from('categories').insert(item);
          results.categories.inserted++;
        }
      }
    }

    // 导入标签
    if (data.tags?.length > 0) {
      for (const item of data.tags) {
        const { data: existing } = await client
          .from('tags')
          .select('id')
          .eq('id', item.id)
          .single();

        if (existing) {
          if (mode === 'replace') {
            await client.from('tags').update(item).eq('id', item.id);
            results.tags.updated++;
          } else {
            results.tags.skipped++;
          }
        } else {
          await client.from('tags').insert(item);
          results.tags.inserted++;
        }
      }
    }

    // 导入工具
    if (data.tools?.length > 0) {
      for (const item of data.tools) {
        const { data: existing } = await client
          .from('tools')
          .select('id')
          .eq('id', item.id)
          .single();

        if (existing) {
          if (mode === 'replace') {
            await client.from('tools').update(item).eq('id', item.id);
            results.tools.updated++;
          } else {
            results.tools.skipped++;
          }
        } else {
          await client.from('tools').insert(item);
          results.tools.inserted++;
        }
      }
    }

    // 导入提示词
    if (data.prompts?.length > 0) {
      for (const item of data.prompts) {
        const { data: existing } = await client
          .from('prompts')
          .select('id')
          .eq('id', item.id)
          .single();

        if (existing) {
          if (mode === 'replace') {
            await client.from('prompts').update(item).eq('id', item.id);
            results.prompts.updated++;
          } else {
            results.prompts.skipped++;
          }
        } else {
          await client.from('prompts').insert(item);
          results.prompts.inserted++;
        }
      }
    }

    // 导入教程
    if (data.tutorials?.length > 0) {
      for (const item of data.tutorials) {
        const { data: existing } = await client
          .from('tutorials')
          .select('id')
          .eq('id', item.id)
          .single();

        if (existing) {
          if (mode === 'replace') {
            await client.from('tutorials').update(item).eq('id', item.id);
            results.tutorials.updated++;
          } else {
            results.tutorials.skipped++;
          }
        } else {
          await client.from('tutorials').insert(item);
          results.tutorials.inserted++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据导入完成',
      results,
    });
  } catch (error) {
    console.error('导入数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '导入失败' 
    }, { status: 500 });
  }
}
