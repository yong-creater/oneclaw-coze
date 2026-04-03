import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 分类名称到slug的映射
const CATEGORY_SLUG_MAP: Record<string, string> = {
  '视频生成': 'video-generation',
  '数字人': 'digital-human',
  '视频编辑': 'video-editing',
  'AI配音': 'ai-dubbing',
  'AI字幕': 'ai-dubbing', // 兼容旧分类
  'AI音乐': 'anime-creation', // 兼容旧分类
  '动画制作': 'anime-creation',
  '动漫创作': 'anime-creation',
};

// 批量导入工具
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const tools = body.tools;

    if (!Array.isArray(tools) || tools.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的工具数据' 
      }, { status: 400 });
    }

    // 获取分类ID映射
    const { data: categories } = await client
      .from('categories')
      .select('id, slug');
    
    const categorySlugToId = new Map(
      categories?.map(c => [c.slug, c.id]) || []
    );

    // 默认分类ID（视频生成）
    const defaultCategoryId = categorySlugToId.get('video-generation') || 1;

    // 转换工具数据
    const toolsToInsert = tools.map((tool: Record<string, unknown>) => {
      // 确定分类
      const categorySlug = CATEGORY_SLUG_MAP[tool.category as string] || 'video-generation';
      const categoryId = categorySlugToId.get(categorySlug) || defaultCategoryId;
      
      // 确定免费类型
      let freeType = '付费工具';
      const pricing = (tool.pricing as string) || '';
      if (pricing.includes('完全免费')) {
        freeType = '完全免费';
      } else if (pricing.includes('免费试用') || pricing.includes('免费额度') || pricing.includes('免费版')) {
        freeType = '免费额度';
      } else if (pricing.includes('限时免费')) {
        freeType = '限时免费';
      }
      
      // 提取功能标签
      const featureTags = [
        ...(tool.tags as string[] || []),
        ...(tool.features as string[] || []).slice(0, 5)
      ].filter(t => t && t.length <= 10);
      
      return {
        name: tool.name as string,
        logo: (tool.logo as string) || '',
        producer: (tool.name as string) + '团队',
        highlight: ((tool.description as string) || 'AI视频工具').substring(0, 15),
        category_id: categoryId,
        sub_category_ids: [],
        free_type: freeType,
        free_quota_desc: pricing.includes('免费') ? pricing.substring(0, 100) : null,
        feature_tags: featureTags,
        max_duration: '60秒',
        official_url: tool.url as string,
        promotion_url: null,
        is_official: false,
        is_featured: (tool.featured as boolean) || false,
        is_active: true,
        advantages: ((tool.features as string[]) || []).slice(0, 3),
        limitations: [],
        commercial_license: '需授权商用',
        launch_date: new Date().toISOString(),
      };
    });

    // 批量插入（分批处理，每批50个）
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < toolsToInsert.length; i += batchSize) {
      const batch = toolsToInsert.slice(i, i + batchSize);
      const { data, error } = await client
        .from('tools')
        .insert(batch)
        .select();

      if (error) {
        console.error('批量插入失败:', error);
        // 继续处理下一批
      } else {
        insertedCount += data?.length || 0;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `成功导入 ${insertedCount} 个工具`,
      count: insertedCount
    });
  } catch (error) {
    console.error('批量导入失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '导入失败' 
    }, { status: 500 });
  }
}
