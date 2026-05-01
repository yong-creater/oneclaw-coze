import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyApiKey, logApiCall } from '../route';

// AI应用导入接口
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
        if (!item.name || !item.logo || !item.producer || !item.highlight || !item.category_id || !item.free_type || !item.official_url) {
          results.skipped++;
          results.errors.push(`${item.name || '未知'}: 缺少必填字段`);
          continue;
        }

        // 检查是否已存在（根据名称和URL）
        const { data: existing } = await client
          .from('tools')
          .select('id')
          .eq('name', item.name)
          .single();

        if (existing) {
          results.skipped++;
          results.errors.push(`${item.name}: 已存在`);
          continue;
        }

        // 插入数据
        const { error } = await client.from('tools').insert({
          name: item.name,
          logo: item.logo,
          producer: item.producer,
          highlight: item.highlight,
          short_desc: item.short_desc || null,
          full_desc: item.full_desc || null,
          use_guide: item.use_guide || null,
          category_id: item.category_id,
          sub_category_ids: item.sub_category_ids || [],
          free_type: item.free_type,
          free_quota_desc: item.free_quota_desc || null,
          feature_tags: item.feature_tags || [],
          max_duration: item.max_duration || '5分钟',
          official_url: item.official_url,
          promotion_url: item.promotion_url || null,
          is_official: item.is_official || false,
          is_featured: item.is_featured || false,
          is_active: true,
          advantages: item.advantages || [],
          limitations: item.limitations || [],
          commercial_license: item.commercial_license || '需授权',
          scenes: item.scenes || [],
          functions: item.functions || [],
          faqs: item.faqs || [],
          customer_email: item.customer_email || null,
          feedback_link: item.feedback_link || null,
        });

        if (error) {
          results.skipped++;
          results.errors.push(`${item.name}: ${error.message}`);
        } else {
          results.imported++;
        }
      } catch (err) {
        results.skipped++;
        results.errors.push(`${item.name || '未知'}: ${err instanceof Error ? err.message : '未知错误'}`);
      }
    }

    // 记录日志
    await logApiCall(auth.keyId!, '/api/external/tools', results.imported > 0 ? 'success' : 'failed', results.imported);

    return NextResponse.json({
      success: true,
      message: `导入完成`,
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors.slice(0, 10), // 最多返回10条错误
    });
  } catch (error) {
    console.error('AI应用导入失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '导入失败',
    }, { status: 500 });
  }
}
