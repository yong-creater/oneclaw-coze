import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 简化的初始化数据
const INIT_DATA = {
  categories: [
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
  ],
  tags: {
    feature: ['文生视频', '图生视频', '数字人口播', 'AI配音', '视频编辑', '4K分辨率', '支持中文', '长视频生成', '去水印', '多语言', '图片生成', '艺术创作', '代码补全', 'AI对话', 'GPT-4', '音乐生成', 'PPT生成', '营销文案', '语言学习', 'AI搜索'],
    free_type: ['完全免费', '免费额度', '限时免费', '付费工具'],
    duration: ['1分钟以内', '1-10分钟', '10分钟以上'],
    scene: ['口播视频', '电商带货', '动漫制作', '知识科普'],
    license: ['可免费商用', '需授权商用', '不可商用'],
  },
};

// 一键初始化生产环境数据
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const results = {
      categories: 0,
      tags: 0,
      prompts: 0,
      tutorials: 0,
    };

    // 1. 初始化分类
    console.log('初始化分类...');
    for (const cat of INIT_DATA.categories) {
      const { error } = await client
        .from('categories')
        .upsert(cat, { onConflict: 'slug' });
      if (!error) results.categories++;
    }

    // 2. 初始化标签
    console.log('初始化标签...');
    for (const [type, tags] of Object.entries(INIT_DATA.tags)) {
      for (const name of tags) {
        const { error } = await client
          .from('tags')
          .upsert({ name, type }, { onConflict: 'name' });
        if (!error) results.tags++;
      }
    }

    // 3. 调用其他初始化接口
    const baseUrl = process.env.DEPLOY_RUN_PORT 
      ? `http://localhost:${process.env.DEPLOY_RUN_PORT}` 
      : 'http://localhost:5000';

    // 初始化Prompt
    try {
      const promptsRes = await fetch(`${baseUrl}/api/prompts/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts: getInitialPrompts() }),
      });
      const promptsData = await promptsRes.json();
      results.prompts = promptsData.count || 0;
    } catch {
      // prompts表可能不存在
    }

    // 初始化教程
    try {
      const tutorialsRes = await fetch(`${baseUrl}/api/tutorials/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorials: getInitialTutorials() }),
      });
      const tutorialsData = await tutorialsRes.json();
      results.tutorials = tutorialsData.count || 0;
    } catch {
      // tutorials表可能不存在
    }

    return NextResponse.json({
      success: true,
      message: '初始化完成',
      results,
    });
  } catch (error) {
    console.error('初始化失败:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}

function getInitialPrompts() {
  return [
    { title: '电影级风景镜头', content: 'A breathtaking cinematic aerial shot of [SUBJECT], golden hour lighting, dramatic clouds, 8K resolution', category: '场景描述', tags: ['风景', '电影感'] },
    { title: '产品展示视频', content: 'Product showcase video of [PRODUCT], clean white background, soft studio lighting, 360 degree rotation', category: '场景描述', tags: ['产品', '商业'] },
    { title: '科幻城市夜景', content: 'Futuristic cyberpunk cityscape at night, neon lights, flying vehicles, Blade Runner aesthetic', category: '场景描述', tags: ['科幻', '城市'] },
    { title: '自然纪录片风格', content: 'Nature documentary style footage of [ANIMAL], close-up slow motion, National Geographic quality', category: '场景描述', tags: ['自然', '纪录片'] },
    { title: '美食视频拍摄', content: 'Delicious [FOOD] food videography, steam rising, close-up macro shot, warm lighting', category: '场景描述', tags: ['美食', '商业'] },
    { title: '古风仙侠场景', content: 'Ancient Chinese fantasy landscape, misty mountains, traditional pavilions, wuxia style', category: '场景描述', tags: ['古风', '仙侠'] },
    { title: '二次元少女', content: 'Anime style girl with [HAIR_COLOR] hair, cherry blossoms background, Studio Ghibli inspired', category: '角色扮演', tags: ['二次元', '少女'] },
    { title: '写实人物肖像', content: 'Photorealistic portrait of [SUBJECT], natural lighting, shallow depth of field, professional headshot', category: '角色扮演', tags: ['肖像', '写实'] },
    { title: '奇幻角色设计', content: 'Fantasy character design, [RACE] warrior with intricate armor, concept art style, ArtStation quality', category: '角色扮演', tags: ['奇幻', '游戏'] },
    { title: '复古电影风格', content: 'Vintage film look, [SUBJECT] in 1970s style, film grain, warm color palette, retro aesthetic', category: '风格迁移', tags: ['复古', '电影'] },
    { title: '赛博朋克风格', content: 'Cyberpunk transformation, neon accents, glitch effects, purple and cyan color scheme', category: '风格迁移', tags: ['赛博朋克', '科技'] },
    { title: '水墨画风格', content: 'Traditional Chinese ink wash painting style, elegant brush strokes, zen aesthetic', category: '风格迁移', tags: ['水墨', '中国风'] },
    { title: '油画艺术风格', content: 'Oil painting style, impressionist manner, visible brushstrokes, museum masterpiece quality', category: '风格迁移', tags: ['油画', '艺术'] },
    { title: '爆炸特效', content: 'Cinematic explosion effect, debris and particles, fire and smoke, Hollywood VFX quality', category: '特效制作', tags: ['爆炸', '特效'] },
    { title: '魔法粒子效果', content: 'Magical particle effects, glowing sparkles, fantasy magic casting, dreamlike atmosphere', category: '特效制作', tags: ['魔法', '粒子'] },
    { title: '数字人主播开场', content: 'Hello everyone, welcome to today\'s program. I\'m your AI host, bringing you the latest content.', category: '场景描述', tags: ['数字人', '主播'] },
    { title: '电商带货口播', content: '大家好！今天给大家推荐这款产品，它有三大亮点。现在下单还有优惠，赶紧购买吧！', category: '场景描述', tags: ['电商', '带货'] },
  ];
}

function getInitialTutorials() {
  return [
    { title: 'Sora入门指南：如何生成高质量AI视频', content: 'Sora入门教程内容...', category: '入门教程', difficulty: '初级', is_featured: true },
    { title: '可灵AI使用教程：国产最强视频生成工具', content: '可灵AI教程内容...', category: '入门教程', difficulty: '初级', is_featured: true },
    { title: 'HeyGen数字人制作全攻略', content: 'HeyGen教程内容...', category: '入门教程', difficulty: '中级', is_featured: true },
    { title: 'Runway Gen-3高级技巧：打造电影级视频', content: 'Runway高级教程内容...', category: '进阶技巧', difficulty: '高级', is_featured: false },
    { title: '剪映AI功能全解析：免费也能做出爆款', content: '剪映教程内容...', category: '入门教程', difficulty: '初级', is_featured: true },
    { title: 'AI视频制作工作流：从创意到成片', content: '工作流教程内容...', category: '案例分享', difficulty: '中级', is_featured: true },
  ];
}

// GET请求返回初始化状态
export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 检查各表数据量
    const { count: categoryCount } = await client
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    const { count: tagCount } = await client
      .from('tags')
      .select('*', { count: 'exact', head: true });
    
    const { count: toolCount } = await client
      .from('tools')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      status: {
        categories: categoryCount || 0,
        tags: tagCount || 0,
        tools: toolCount || 0,
        needsInit: (categoryCount || 0) < 14,
      },
      message: (categoryCount || 0) < 14 
        ? '数据库未初始化，请POST请求初始化' 
        : '数据库已初始化',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
