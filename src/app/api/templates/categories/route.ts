import { NextResponse } from 'next/server';

// 模板分类数据
const categories = [
  { key: 'social', name: '社交媒体', icon: 'Share2', count: 45 },
  { key: 'ecommerce', name: '电商设计', icon: 'ShoppingBag', count: 32 },
  { key: 'poster', name: '海报宣传', icon: 'Image', count: 28 },
  { key: 'video', name: '视频封面', icon: 'Play', count: 24 },
  { key: 'document', name: '文档PPT', icon: 'FileText', count: 18 },
  { key: 'logo', name: 'LOGO设计', icon: 'Hexagon', count: 12 },
];

// 风格分类数据
const styles = [
  { key: 'all', name: '全部风格' },
  { key: 'minimal', name: '简约', count: 52 },
  { key: 'vibrant', name: '活泼', count: 38 },
  { key: 'luxury', name: '高端', count: 24 },
  { key: 'cute', name: '可爱', count: 28 },
  { key: 'tech', name: '科技', count: 18 },
];

// GET 获取分类和风格列表
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      categories,
      styles,
    },
  });
}
