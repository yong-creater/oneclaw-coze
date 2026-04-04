import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 生产环境带安全验证的数据初始化接口
 * 
 * 调用示例：
 * curl -X POST https://oneclaw.shop/api/admin/init-secure \
 *   -H "Content-Type: application/json" \
 *   -d '{"security_key":"oneclaw-init-2024"}'
 */

const SECURITY_KEY = process.env.ADMIN_RESET_KEY || 'oneclaw-init-2024';

// 分类数据
const CATEGORIES = [
  { name: '视频生成', slug: 'video-generation', sort_order: 1 },
  { name: '数字人', slug: 'digital-human', sort_order: 2 },
  { name: '视频编辑', slug: 'video-editing', sort_order: 3 },
  { name: 'AI配音', slug: 'ai-dubbing', sort_order: 4 },
  { name: '动漫创作', slug: 'anime-creation', sort_order: 5 },
  { name: 'AI绘画', slug: 'ai-image', sort_order: 10 },
  { name: 'AI写作', slug: 'ai-writing', sort_order: 20 },
  { name: 'AI编程', slug: 'ai-coding', sort_order: 30 },
  { name: 'AI音频', slug: 'ai-audio', sort_order: 40 },
  { name: 'AI办公', slug: 'ai-office', sort_order: 50 },
  { name: 'AI营销', slug: 'ai-marketing', sort_order: 60 },
  { name: 'AI学习', slug: 'ai-learning', sort_order: 70 },
  { name: 'AI聊天', slug: 'ai-chat', sort_order: 80 },
  { name: 'AI搜索', slug: 'ai-search', sort_order: 90 },
];

// 标签数据
const TAGS = {
  feature: ['文生视频', '图生视频', '数字人口播', 'AI配音', '视频编辑', '4K分辨率', '支持中文', '长视频生成', '去水印', '多语言', '图片生成', '艺术创作', '代码补全', 'AI对话', 'GPT-4', '音乐生成', 'PPT生成', '营销文案', '语言学习', 'AI搜索', '角色扮演', '开源免费', '声音克隆', '会议记录'],
  free_type: ['完全免费', '免费额度', '限时免费', '付费工具'],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { security_key } = body;

    // 验证安全密钥
    if (security_key !== SECURITY_KEY) {
      return NextResponse.json({ success: false, error: '安全密钥错误' }, { status: 403 });
    }

    const client = getSupabaseClient();
    const results = { categories: 0, tags: 0, tools: 0, prompts: 0, tutorials: 0, errors: [] as string[] };

    console.log('🚀 开始初始化数据...');

    // 1. 初始化分类
    for (const cat of CATEGORIES) {
      const { error } = await client.from('categories').upsert(cat, { onConflict: 'slug' });
      if (!error) results.categories++;
    }

    // 2. 初始化标签
    for (const [type, tags] of Object.entries(TAGS)) {
      for (const name of tags) {
        const { error } = await client.from('tags').upsert({ name, type }, { onConflict: 'name' });
        if (!error) results.tags++;
      }
    }

    // 3. 获取分类映射
    const { data: categories } = await client.from('categories').select('id, name');
    const categoryMap = new Map(categories?.map(c => [c.name, c.id]) || []);

    // 4. 统计现有数据
    const { count: toolCount } = await client.from('tools').select('*', { count: 'exact', head: true });
    const { count: promptCount } = await client.from('prompts').select('*', { count: 'exact', head: true });
    const { count: tutorialCount } = await client.from('tutorials').select('*', { count: 'exact', head: true });

    results.tools = toolCount || 0;
    results.prompts = promptCount || 0;
    results.tutorials = tutorialCount || 0;

    console.log('✅ 初始化完成:', results);

    return NextResponse.json({
      success: true,
      message: '基础数据初始化完成',
      results,
      note: '工具、Prompt、教程数据已存在于数据库中，无需重复导入'
    });

  } catch (error) {
    console.error('初始化失败:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// GET 获取当前数据状态
export async function GET() {
  try {
    const client = getSupabaseClient();

    const { count: categoryCount } = await client.from('categories').select('*', { count: 'exact', head: true });
    const { count: tagCount } = await client.from('tags').select('*', { count: 'exact', head: true });
    const { count: toolCount } = await client.from('tools').select('*', { count: 'exact', head: true });
    const { count: promptCount } = await client.from('prompts').select('*', { count: 'exact', head: true });
    const { count: tutorialCount } = await client.from('tutorials').select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        categories: categoryCount || 0,
        tags: tagCount || 0,
        tools: toolCount || 0,
        prompts: promptCount || 0,
        tutorials: tutorialCount || 0,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
