import { NextRequest, NextResponse } from 'next/server';

// 模拟模板数据
let templates = [
  { id: 1, name: '小红书爆款封面', category: 'social', style: 'vibrant', useCount: 12580, isActive: true, createdAt: '2024-01-15' },
  { id: 2, name: '抖音视频封面', category: 'video', style: 'vibrant', useCount: 8932, isActive: true, createdAt: '2024-01-14' },
  { id: 3, name: '电商主图模板', category: 'ecommerce', style: 'minimal', useCount: 15620, isActive: true, createdAt: '2024-01-13' },
  { id: 4, name: '节日促销海报', category: 'poster', style: 'vibrant', useCount: 23450, isActive: true, createdAt: '2024-01-12' },
  { id: 5, name: '企业PPT模板', category: 'document', style: 'luxury', useCount: 6780, isActive: true, createdAt: '2024-01-11' },
  { id: 6, name: '品牌LOGO设计', category: 'logo', style: 'minimal', useCount: 4560, isActive: true, createdAt: '2024-01-10' },
  { id: 7, name: '朋友圈九宫格', category: 'social', style: 'cute', useCount: 9870, isActive: true, createdAt: '2024-01-09' },
  { id: 8, name: '商品详情页', category: 'ecommerce', style: 'minimal', useCount: 11230, isActive: true, createdAt: '2024-01-08' },
  { id: 9, name: 'B站视频封面', category: 'video', style: 'tech', useCount: 7650, isActive: true, createdAt: '2024-01-07' },
  { id: 10, name: '餐饮菜单设计', category: 'poster', style: 'cute', useCount: 5430, isActive: true, createdAt: '2024-01-06' },
  { id: 11, name: '简历模板套装', category: 'document', style: 'minimal', useCount: 18900, isActive: true, createdAt: '2024-01-05' },
  { id: 12, name: 'ins风配图', category: 'social', style: 'cute', useCount: 6540, isActive: true, createdAt: '2024-01-04' },
];

// GET 获取模板列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'all';
  const style = searchParams.get('style') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');

  let filtered = templates.filter(t => {
    const matchCategory = category === 'all' || t.category === category;
    const matchStyle = style === 'all' || t.style === style;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchStyle && matchSearch;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedTemplates = filtered.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    success: true,
    data: {
      templates: paginatedTemplates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        total: templates.length,
        active: templates.filter(t => t.isActive).length,
        totalUses: templates.reduce((sum, t) => sum + t.useCount, 0),
      },
    },
  });
}

// POST 创建模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, style, thumbnail, tags } = body;

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const newTemplate = {
      id: Math.max(...templates.map(t => t.id)) + 1,
      name,
      category,
      style: style || 'minimal',
      useCount: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    templates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: '模板创建成功',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: '请求格式错误' },
      { status: 400 }
    );
  }
}
