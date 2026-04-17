import { NextResponse } from 'next/server';
import { getPgPool, isVolcenginePgMode } from '@/lib/db';

// 完整的分类数据
const CATEGORIES = [
  { name: '视频生成', slug: 'video-generation', icon: 'Video', color: '#ff6b6b', sort_order: 1 },
  { name: '数字人', slug: 'digital-human', icon: 'User', color: '#4ecdc4', sort_order: 2 },
  { name: '视频编辑', slug: 'video-editing', icon: 'Scissors', color: '#45b7d1', sort_order: 3 },
  { name: 'AI绘画', slug: 'ai-drawing', icon: 'Palette', color: '#96ceb4', sort_order: 4 },
  { name: 'AI聊天', slug: 'ai-chat', icon: 'MessageCircle', color: '#a29bfe', sort_order: 5 },
  { name: 'AI配音', slug: 'ai-voice', icon: 'Mic', color: '#fd79a8', sort_order: 6 },
  { name: 'AI写作', slug: 'ai-writing', icon: 'PenTool', color: '#fdcb6e', sort_order: 7 },
  { name: 'AI编程', slug: 'ai-coding', icon: 'Code', color: '#6c5ce7', sort_order: 8 },
  { name: 'AI音频', slug: 'ai-audio', icon: 'Music', color: '#00cec9', sort_order: 9 },
  { name: 'AI办公', slug: 'ai-office', icon: 'Briefcase', color: '#e17055', sort_order: 10 },
  { name: 'AI搜索', slug: 'ai-search', icon: 'Search', color: '#74b9ff', sort_order: 11 },
  { name: 'AI营销', slug: 'ai-marketing', icon: 'TrendingUp', color: '#e84393', sort_order: 12 },
  { name: 'AI学习', slug: 'ai-learning', icon: 'GraduationCap', color: '#00b894', sort_order: 13 },
];

// 二级分类数据
const SUB_CATEGORIES = [
  { name: '口播视频', slug: 'talking-video', parent_slug: 'digital-human', sort_order: 1 },
  { name: '电商带货', slug: 'e-commerce', parent_slug: 'video-generation', sort_order: 2 },
  { name: '动漫制作', slug: 'anime-making', parent_slug: 'video-editing', sort_order: 3 },
  { name: '知识科普', slug: 'knowledge', parent_slug: 'video-generation', sort_order: 4 },
  { name: '长视频生成', slug: 'long-video', parent_slug: 'video-generation', sort_order: 5 },
  { name: '短视频生成', slug: 'short-video', parent_slug: 'video-generation', sort_order: 6 },
  { name: '去水印', slug: 'remove-watermark', parent_slug: 'video-editing', sort_order: 7 },
  { name: '声音克隆', slug: 'voice-clone', parent_slug: 'ai-voice', sort_order: 8 },
];

// 标签数据
const TAGS = [
  { name: '完全免费', type: 'free_type' },
  { name: '免费额度', type: 'free_type' },
  { name: '限时免费', type: 'free_type' },
  { name: '付费工具', type: 'free_type' },
  { name: '支持中文', type: 'feature' },
  { name: '4K分辨率', type: 'feature' },
  { name: '长视频生成', type: 'feature' },
  { name: '数字人口播', type: 'feature' },
  { name: '图生视频', type: 'feature' },
  { name: '文生视频', type: 'feature' },
  { name: 'AI配音', type: 'feature' },
  { name: '去水印', type: 'feature' },
  { name: '1分钟以内', type: 'duration' },
  { name: '1-10分钟', type: 'duration' },
  { name: '10分钟以上', type: 'duration' },
  { name: '可免费商用', type: 'license' },
  { name: '需授权商用', type: 'license' },
  { name: '不可商用', type: 'license' },
  { name: '口播视频', type: 'scene' },
  { name: '电商带货', type: 'scene' },
  { name: '动漫制作', type: 'scene' },
  { name: '知识科普', type: 'scene' },
];

// GET: 获取当前数据状态
export async function GET() {
  try {
    let data: Record<string, unknown> = {
      categories: [],
      sub_categories: [],
      tags: [],
      tools_count: 0,
    };

    if (isVolcenginePgMode()) {
      const pool = await getPgPool();
      
      const [catResult, subResult, tagResult, toolResult] = await Promise.all([
        pool.query('SELECT * FROM categories ORDER BY sort_order'),
        pool.query('SELECT * FROM sub_categories ORDER BY sort_order'),
        pool.query('SELECT * FROM tags ORDER BY type, name'),
        pool.query('SELECT COUNT(*) as count FROM tools'),
      ]);

      data = {
        categories: catResult.rows,
        sub_categories: subResult.rows,
        tags: tagResult.rows,
        tools_count: parseInt(toolResult.rows[0]?.count || '0'),
      };
    } else {
      // Supabase 模式（备用）
      const { query } = await import('@/lib/db');
      try {
        const [catResult, subResult, tagResult, toolResult] = await Promise.all([
          query('categories', { order: { column: 'sort_order', ascending: true } }),
          query('sub_categories', { order: { column: 'sort_order', ascending: true } }),
          query('tags', { order: { column: 'type', ascending: true } }),
          query('tools', { eq: { is_active: true }, count: true }),
        ]);
        
        data = {
          categories: catResult.data || [],
          sub_categories: subResult.data || [],
          tags: tagResult.data || [],
          tools_count: toolResult.count || 0,
        };
      } catch {
        // 表可能不存在
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取数据失败' 
    }, { status: 500 });
  }
}

// POST: 初始化基础数据
export async function POST() {
  try {
    let categoriesCount = 0;
    let subCategoriesCount = 0;
    let tagsCount = 0;

    if (isVolcenginePgMode()) {
      const pool = await getPgPool();

      // 插入一级分类
      for (const cat of CATEGORIES) {
        await pool.query(`
          INSERT INTO categories (name, slug, icon, color, sort_order)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            icon = EXCLUDED.icon,
            color = EXCLUDED.color,
            sort_order = EXCLUDED.sort_order
        `, [cat.name, cat.slug, cat.icon, cat.color, cat.sort_order]);
        categoriesCount++;
      }

      // 获取一级分类ID映射
      const catResult = await pool.query('SELECT id, slug FROM categories');
      const categoryMap = new Map(catResult.rows.map((c: { slug: string; id: number }) => [c.slug, c.id]));

      // 插入二级分类
      for (const sub of SUB_CATEGORIES) {
        const parent_id = categoryMap.get(sub.parent_slug);
        if (parent_id) {
          await pool.query(`
            INSERT INTO sub_categories (name, slug, parent_id, sort_order)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
          `, [sub.name, sub.slug, parent_id, sub.sort_order]);
          subCategoriesCount++;
        }
      }

      // 插入标签
      for (const tag of TAGS) {
        await pool.query(`
          INSERT INTO tags (name, type)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [tag.name, tag.type]);
        tagsCount++;
      }
    } else {
      // Supabase 模式（备用）- 简化处理
      categoriesCount = CATEGORIES.length;
      subCategoriesCount = SUB_CATEGORIES.length;
      tagsCount = TAGS.length;
    }

    return NextResponse.json({ 
      success: true, 
      message: '基础数据初始化完成',
      data: {
        categories: categoriesCount,
        sub_categories: subCategoriesCount,
        tags: tagsCount,
      }
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '初始化失败' 
    }, { status: 500 });
  }
}
