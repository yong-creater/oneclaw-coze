import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 一级分类数据
const CATEGORIES = [
  { name: '视频生成', slug: 'video-generation', sort_order: 1 },
  { name: '数字人', slug: 'digital-human', sort_order: 2 },
  { name: '视频编辑', slug: 'video-editing', sort_order: 3 },
  { name: 'AI配音', slug: 'ai-dubbing', sort_order: 4 },
  { name: '动漫创作', slug: 'anime-creation', sort_order: 5 },
];

// 二级分类数据
const SUB_CATEGORIES = [
  { name: '口播视频', slug: 'talking-video', parent_slug: 'digital-human', sort_order: 1 },
  { name: '电商带货', slug: 'e-commerce', parent_slug: 'video-generation', sort_order: 2 },
  { name: '动漫制作', slug: 'anime-making', parent_slug: 'anime-creation', sort_order: 3 },
  { name: '知识科普', slug: 'knowledge', parent_slug: 'video-generation', sort_order: 4 },
  { name: '长视频生成', slug: 'long-video', parent_slug: 'video-generation', sort_order: 5 },
  { name: '短视频生成', slug: 'short-video', parent_slug: 'video-generation', sort_order: 6 },
  { name: '去水印', slug: 'remove-watermark', parent_slug: 'video-editing', sort_order: 7 },
  { name: '声音克隆', slug: 'voice-clone', parent_slug: 'ai-dubbing', sort_order: 8 },
];

// 标签数据
const TAGS = [
  // 免费类型
  { name: '完全免费', type: 'free_type' },
  { name: '免费额度', type: 'free_type' },
  { name: '限时免费', type: 'free_type' },
  { name: '付费工具', type: 'free_type' },
  // 功能标签
  { name: '支持中文', type: 'feature' },
  { name: '4K分辨率', type: 'feature' },
  { name: '长视频生成', type: 'feature' },
  { name: '数字人口播', type: 'feature' },
  { name: '图生视频', type: 'feature' },
  { name: '文生视频', type: 'feature' },
  { name: 'AI配音', type: 'feature' },
  { name: '去水印', type: 'feature' },
  // 生成时长
  { name: '1分钟以内', type: 'duration' },
  { name: '1-10分钟', type: 'duration' },
  { name: '10分钟以上', type: 'duration' },
  // 商用权限
  { name: '可免费商用', type: 'license' },
  { name: '需授权商用', type: 'license' },
  { name: '不可商用', type: 'license' },
  // 场景
  { name: '口播视频', type: 'scene' },
  { name: '电商带货', type: 'scene' },
  { name: '动漫制作', type: 'scene' },
  { name: '知识科普', type: 'scene' },
];

export async function POST() {
  try {
    const client = getSupabaseClient();
    
    // 插入一级分类
    for (const cat of CATEGORIES) {
      const { error } = await client
        .from('categories')
        .upsert(cat, { onConflict: 'slug' });
      if (error) console.error(`插入分类 ${cat.name} 失败:`, error.message);
    }
    
    // 获取一级分类ID映射
    const { data: categories } = await client
      .from('categories')
      .select('id, slug');
    const categoryMap = new Map(categories?.map(c => [c.slug, c.id]) || []);
    
    // 插入二级分类
    for (const sub of SUB_CATEGORIES) {
      const parent_id = categoryMap.get(sub.parent_slug);
      if (parent_id) {
        const { error } = await client
          .from('sub_categories')
          .upsert({
            name: sub.name,
            slug: sub.slug,
            parent_id,
            sort_order: sub.sort_order
          }, { onConflict: 'slug' });
        if (error) console.error(`插入二级分类 ${sub.name} 失败:`, error.message);
      }
    }
    
    // 插入标签
    for (const tag of TAGS) {
      const { error } = await client
        .from('tags')
        .upsert(tag, { onConflict: 'name' });
      if (error) console.error(`插入标签 ${tag.name} 失败:`, error.message);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '基础数据初始化完成',
      categories: CATEGORIES.length,
      sub_categories: SUB_CATEGORIES.length,
      tags: TAGS.length
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '初始化失败' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    const [categories, subCategories, tags, tools] = await Promise.all([
      client.from('categories').select('*').order('sort_order'),
      client.from('sub_categories').select('*').order('sort_order'),
      client.from('tags').select('*').order('type, name'),
      client.from('tools').select('id', { count: 'exact', head: true }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        categories: categories.data || [],
        sub_categories: subCategories.data || [],
        tags: tags.data || [],
        tools_count: tools.count || 0,
      }
    });
  } catch (error) {
    console.error('获取数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取数据失败' 
    }, { status: 500 });
  }
}
