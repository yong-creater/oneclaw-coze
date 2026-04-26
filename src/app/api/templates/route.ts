import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

// 只有在有环境变量时才创建客户端
const getSupabaseClient = () => {
  if (supabaseUrl && supabaseKey) {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(supabaseUrl, supabaseKey);
  }
  return null;
};

// 模板类型映射到工具
const TEMPLATE_TYPE_MAP: Record<string, { name: string; slug: string }> = {
  'xhs_post': { name: '小红书爆款生成器', slug: '/xhs-generator' },
  'goods_poster': { name: '商品海报生成器', slug: '/product-poster' },
  'portrait': { name: 'AI写真生成器', slug: '/ai-photo' },
  'cover': { name: '封面生成器', slug: '/cover-generator' },
  'goods_image': { name: '商品图精修', slug: '/product-photo' },
  'background_removal': { name: 'AI智能抠图', slug: '/background-removal' },
  'photo': { name: '照片美化', slug: '/photo-editor' },
  'layout': { name: '图文排版', slug: '/layout-design' },
  'resume': { name: '简历优化', slug: '/resume' },
  'novel': { name: '小说创作', slug: '/novel' },
  'script': { name: '推文脚本生成', slug: '/novel' },
};

// GET - 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = getSupabaseClient();

    // 如果没有数据库，返回示例数据
    if (!supabase) {
      const exampleTemplates = getExampleTemplates();
      let filtered = exampleTemplates;
      
      if (type) {
        filtered = filtered.filter(t => t.template_type === type);
      }
      if (featured === 'true') {
        filtered = filtered.filter(t => t.is_featured);
      }
      
      return NextResponse.json({
        success: true,
        templates: filtered.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      });
    }

    let query = supabase
      .from('templates')
      .select('*')
      .eq('is_active', true);

    if (type) {
      query = query.eq('template_type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    query = query
      .order('sort_order', { ascending: true })
      .order('usage_count', { ascending: false })
      .range((page - 1) * limit, page * limit);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: '获取模板失败' }, { status: 500 });
    }

    // 转换数据，添加工具链接
    const templates = (data || []).map((t: any) => ({
      ...t,
      tool_name: TEMPLATE_TYPE_MAP[t.template_type]?.name || t.template_type,
      tool_url: TEMPLATE_TYPE_MAP[t.template_type]?.slug || '/',
    }));

    return NextResponse.json({
      success: true,
      templates,
      pagination: {
        page,
        limit,
        total: count || templates.length,
        totalPages: Math.ceil((count || templates.length) / limit),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 示例模板数据
function getExampleTemplates() {
  return [
    {
      id: 1,
      name: '美妆产品种草模板',
      description: '适合口红、粉底液等美妆产品的种草文案模板，包含产品特点、使用感受、推荐理由',
      template_type: 'xhs_post',
      thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
      tags: ['美妆', '种草', '护肤'],
      usage_count: 1256,
      is_featured: true,
      is_active: true,
      tool_name: '小红书爆款生成器',
      tool_url: '/xhs-generator',
    },
    {
      id: 2,
      name: '电商促销海报',
      description: '适用于双十一、618等大促活动的电商海报模板，突出优惠信息',
      template_type: 'goods_poster',
      thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
      tags: ['电商', '促销', '节日'],
      usage_count: 892,
      is_featured: true,
      is_active: true,
      tool_name: '商品海报生成器',
      tool_url: '/product-poster',
    },
    {
      id: 3,
      name: '古风写真模板',
      description: '适合汉服、古风场景的AI写真模板，古典韵味十足',
      template_type: 'portrait',
      thumbnail: 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=400&h=300&fit=crop',
      tags: ['古风', '汉服', '写真'],
      usage_count: 2341,
      is_featured: true,
      is_active: true,
      tool_name: 'AI写真生成器',
      tool_url: '/ai-photo',
    },
    {
      id: 4,
      name: '小红书封面模板',
      description: '高点击率的封面模板设计，适合各类内容创作者',
      template_type: 'cover',
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop',
      tags: ['封面', '小红书', '自媒体'],
      usage_count: 1567,
      is_featured: true,
      is_active: true,
      tool_name: '封面生成器',
      tool_url: '/cover-generator',
    },
    {
      id: 5,
      name: '服装商品图优化',
      description: '提升服装商品图的视觉效果，增加买家购买欲望',
      template_type: 'goods_image',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      tags: ['服装', '电商', '商品图'],
      usage_count: 756,
      is_featured: false,
      is_active: true,
      tool_name: '商品图精修',
      tool_url: '/product-photo',
    },
    {
      id: 6,
      name: '证件照换底色',
      description: '快速更换证件照背景色，蓝底、白底、红底一键切换',
      template_type: 'background_removal',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      tags: ['证件照', '换底', '实用'],
      usage_count: 3421,
      is_featured: true,
      is_active: true,
      tool_name: 'AI智能抠图',
      tool_url: '/background-removal',
    },
    {
      id: 7,
      name: '旅行照片美化',
      description: '旅行照片一键美化，调色增亮，让回忆更美好',
      template_type: 'photo',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      tags: ['旅行', '风景', '摄影'],
      usage_count: 1890,
      is_featured: false,
      is_active: true,
      tool_name: '照片美化',
      tool_url: '/photo-editor',
    },
    {
      id: 8,
      name: '产品图文排版',
      description: '适合电商详情页的产品图文混排模板，信息清晰有层次',
      template_type: 'layout',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      tags: ['电商', '排版', '详情页'],
      usage_count: 654,
      is_featured: false,
      is_active: true,
      tool_name: '图文排版',
      tool_url: '/layout-design',
    },
    {
      id: 9,
      name: '互联网简历模板',
      description: '适合产品经理、运营、开发等互联网岗位的简历模板',
      template_type: 'resume',
      thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
      tags: ['求职', '互联网', '简历'],
      usage_count: 2134,
      is_featured: true,
      is_active: true,
      tool_name: '简历优化',
      tool_url: '/resume',
    },
    {
      id: 10,
      name: '玄幻小说开头',
      description: '热血玄幻小说的黄金开头模板，吸引读者继续阅读',
      template_type: 'novel',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
      tags: ['玄幻', '小说', '网文'],
      usage_count: 1876,
      is_featured: true,
      is_active: true,
      tool_name: '小说创作',
      tool_url: '/novel',
    },
    {
      id: 11,
      name: '抖音带货脚本',
      description: '适合抖音带货的短视频脚本模板，包含开场、产品介绍、促成下单',
      template_type: 'script',
      thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop',
      tags: ['抖音', '带货', '短视频'],
      usage_count: 2567,
      is_featured: true,
      is_active: true,
      tool_name: '推文脚本生成',
      tool_url: '/novel',
    },
  ];
}

// POST - 创建模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      template_type,
      category,
      thumbnail,
      content,
      params,
      tags,
      is_featured,
      sort_order,
    } = body;

    if (!name || !template_type) {
      return NextResponse.json({ error: '名称和类型不能为空' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        template_type,
        category,
        thumbnail,
        content,
        params,
        tags: tags || [],
        is_featured: is_featured || false,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
