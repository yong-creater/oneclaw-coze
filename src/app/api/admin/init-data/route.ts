import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

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

// 精选工具数据
const UTILITY_TOOLS = [
  // 精选工具组 (group_id=1)
  { name: 'STAR简历优化', slug: 'resume', group_id: 1, sort_order: 1, tool_path: '/resume', color: 'from-blue-500 to-cyan-500', icon: 'FileText' },
  { name: '小说创作工坊', slug: 'novel', group_id: 1, sort_order: 2, tool_path: '/novel', color: 'from-purple-500 to-pink-500', icon: 'BookOpen' },
  { name: '商品详情页生成器', slug: 'productpage', group_id: 1, sort_order: 3, tool_path: '/productpage', color: 'from-green-500 to-emerald-500', icon: 'ShoppingCart' },
  { name: 'AI智能抠图', slug: 'background-removal', group_id: 1, sort_order: 4, tool_path: '/background-removal', color: 'from-amber-500 to-orange-500', icon: 'Scissors' },
  { name: '小红书笔记生成器', slug: 'xiaohongshu-generator', group_id: 1, sort_order: 5, tool_path: '/xiaohongshu-generator', color: 'from-pink-500 to-rose-500', icon: 'Heart' },
  { name: '商拍AI', slug: 'shangpai-ai', group_id: 1, sort_order: 6, tool_path: '/tools/shangpai-ai', color: 'from-orange-500 to-red-500', icon: 'ShoppingBag' },
];

// GET: 获取当前数据状态
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const [catResult, tagResult, toolResult] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('tags').select('*').order('type'),
      supabase.from('tools').select('id', { count: 'exact' }).eq('is_active', true),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories: catResult.data || [],
        tags: tagResult.data || [],
        tools_count: toolResult.count || 0,
      }
    });
  } catch (error) {
    console.error('获取数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '获取数据失败' 
    }, { status: 500 });
  }
}

// POST: 初始化基础数据
export async function POST(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const supabase = getSupabaseClient();
    
    let categoriesCount = 0;
    let tagsCount = 0;

    // 插入或更新分类
    for (const cat of CATEGORIES) {
      const { error } = await supabase
        .from('categories')
        .upsert({
          slug: cat.slug,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          sort_order: cat.sort_order,
        }, { onConflict: 'slug' });
      
      if (!error) categoriesCount++;
    }

    // 插入标签（忽略冲突）
    for (const tag of TAGS) {
      await supabase
        .from('tags')
        .upsert({ name: tag.name, type: tag.type }, { onConflict: 'name' })
        .then(({ error }) => {
          if (!error) tagsCount++;
        });
    }

    // 插入精选工具（忽略冲突）
    for (const tool of UTILITY_TOOLS) {
      await supabase
        .from('utility_tools')
        .upsert({ 
          slug: tool.slug,
          name: tool.name,
          group_id: tool.group_id,
          sort_order: tool.sort_order,
          tool_path: tool.tool_path,
          color: tool.color,
          icon: tool.icon,
          is_active: true,
        }, { onConflict: 'slug' });
    }

    return NextResponse.json({ 
      success: true, 
      message: '基础数据初始化完成',
      data: {
        categories: categoriesCount,
        tags: tagsCount,
        utility_tools: UTILITY_TOOLS.length,
      }
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '初始化失败' 
    }, { status: 500 });
  }
}
