import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 分类名称到slug的映射
const CATEGORY_SLUG_MAP: Record<string, string> = {
  '视频生成': 'video-generation',
  '数字人': 'digital-human',
  '视频编辑': 'video-editing',
  'AI配音': 'ai-dubbing',
  'AI字幕': 'ai-dubbing',
  'AI音乐': 'anime-creation',
  '动画制作': 'anime-creation',
  '动漫创作': 'anime-creation',
};

// 从现有数据迁移工具
export async function POST() {
  try {
    // 动态导入现有工具数据
    const { aiTools } = await import('@/data/tools');
    
    const client = getSupabaseClient();
    
    // 获取分类ID映射
    const { data: categories } = await client
      .from('categories')
      .select('id, slug');
    
    const categorySlugToId = new Map(
      categories?.map(c => [c.slug, c.id]) || []
    );
    
    const defaultCategoryId = categorySlugToId.get('video-generation') || 1;
    
    // 转换工具数据
    const toolsToInsert = aiTools.map((tool) => {
      const categorySlug = CATEGORY_SLUG_MAP[tool.category] || 'video-generation';
      const categoryId = categorySlugToId.get(categorySlug) || defaultCategoryId;
      
      let freeType = '付费工具';
      const pricing = tool.pricing || '';
      if (pricing.includes('完全免费')) {
        freeType = '完全免费';
      } else if (pricing.includes('免费试用') || pricing.includes('免费额度') || pricing.includes('免费版')) {
        freeType = '免费额度';
      } else if (pricing.includes('限时免费')) {
        freeType = '限时免费';
      }
      
      const featureTags = [
        ...(tool.tags || []),
        ...(tool.features || []).slice(0, 5)
      ].filter(t => t && t.length <= 10);
      
      return {
        name: tool.name,
        logo: tool.logo || '',
        producer: tool.name + '团队',
        highlight: (tool.description || 'AI视频工具').substring(0, 15),
        category_id: categoryId,
        sub_category_ids: [],
        free_type: freeType,
        free_quota_desc: pricing.includes('免费') ? pricing.substring(0, 100) : null,
        feature_tags: featureTags,
        max_duration: '60秒',
        official_url: tool.url,
        promotion_url: null,
        is_official: false,
        is_featured: tool.featured || false,
        is_active: true,
        advantages: (tool.features || []).slice(0, 3),
        limitations: [],
        commercial_license: '需授权商用',
        launch_date: new Date().toISOString(),
      };
    });
    
    // 先清空现有数据
    await client.from('tools').delete().neq('id', 0);
    
    // 批量插入
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
      } else {
        insertedCount += data?.length || 0;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `成功迁移 ${insertedCount} 个工具`,
      total: aiTools.length,
      imported: insertedCount
    });
  } catch (error) {
    console.error('迁移失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '迁移失败' 
    }, { status: 500 });
  }
}
