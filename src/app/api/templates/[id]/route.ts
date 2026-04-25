import { NextRequest, NextResponse } from 'next/server';

// 模拟模板数据存储
const templates = [
  { id: 1, name: '小红书爆款封面', category: 'social', style: 'vibrant', useCount: 12580, isActive: true, createdAt: '2024-01-15' },
  { id: 2, name: '抖音视频封面', category: 'video', style: 'vibrant', useCount: 8932, isActive: true, createdAt: '2024-01-14' },
  { id: 3, name: '电商主图模板', category: 'ecommerce', style: 'minimal', useCount: 15620, isActive: true, createdAt: '2024-01-13' },
  { id: 4, name: '节日促销海报', category: 'poster', style: 'vibrant', useCount: 23450, isActive: true, createdAt: '2024-01-12' },
  { id: 5, name: '企业PPT模板', category: 'document', style: 'luxury', useCount: 6780, isActive: true, createdAt: '2024-01-11' },
  { id: 6, name: '品牌LOGO设计', category: 'logo', style: 'minimal', useCount: 4560, isActive: true, createdAt: '2024-01-10' },
];

// GET 获取单个模板
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = templates.find(t => t.id === parseInt(id));

  if (!template) {
    return NextResponse.json(
      { success: false, error: '模板不存在' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: template,
  });
}

// PUT 更新模板
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const index = templates.findIndex(t => t.id === parseInt(id));

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      );
    }

    templates[index] = {
      ...templates[index],
      ...body,
      id: parseInt(id),
    };

    return NextResponse.json({
      success: true,
      data: templates[index],
      message: '模板更新成功',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: '请求格式错误' },
      { status: 400 }
    );
  }
}

// DELETE 删除模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = templates.findIndex(t => t.id === parseInt(id));

  if (index === -1) {
    return NextResponse.json(
      { success: false, error: '模板不存在' },
      { status: 404 }
    );
  }

  templates.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: '模板删除成功',
  });
}
