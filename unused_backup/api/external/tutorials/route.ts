import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyApiKey, logApiCall } from '../route';

// 教程导入接口
export async function POST(request: NextRequest) {
  // 验证 API Key
  const auth = await verifyApiKey(request);
  if (!auth.valid) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body.data) ? body.data : [body.data];
    
    if (!items.length) {
      return NextResponse.json({ success: false, error: '没有数据' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const item of items) {
      try {
        // 验证必填字段
        if (!item.title || !item.content || !item.category || !item.difficulty) {
          results.skipped++;
          results.errors.push(`${item.title || '未知'}: 缺少必填字段`);
          continue;
        }

        // 检查是否已存在（根据标题）
        const { data: existing } = await client
          .from('tutorials')
          .select('id')
          .eq('title', item.title)
          .single();

        if (existing) {
          results.skipped++;
          results.errors.push(`${item.title}: 已存在`);
          continue;
        }

        // 插入数据
        const { error } = await client.from('tutorials').insert({
          title: item.title,
          content: item.content,
          category: item.category,
          difficulty: item.difficulty,
          author: item.author || '外部导入',
          tool_id: item.tool_id || null,
          status: 'published',
        });

        if (error) {
          results.skipped++;
          results.errors.push(`${item.title}: ${error.message}`);
        } else {
          results.imported++;
        }
      } catch (err) {
        results.skipped++;
        results.errors.push(`${item.title || '未知'}: ${err instanceof Error ? err.message : '未知错误'}`);
      }
    }

    // 记录日志
    await logApiCall(auth.keyId!, '/api/external/tutorials', results.imported > 0 ? 'success' : 'failed', results.imported);

    return NextResponse.json({
      success: true,
      message: `导入完成`,
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors.slice(0, 10),
    });
  } catch (error) {
    console.error('教程导入失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '导入失败',
    }, { status: 500 });
  }
}
