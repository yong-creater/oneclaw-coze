/**
 * 工具管理 API
 * 
 * 注意：工具是代码内置的，不能增删
 * 此 API 用于：
 * - 获取工具列表及统计（公开接口）
 * - 更新工具配置（需要管理员权限）
 */

import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库中的工具使用记录
const mockUsageData: Record<string, { totalUsage: number; todayUsage: number; uniqueUsers: number }> = {
  'remove-bg': { totalUsage: 125000, todayUsage: 342, uniqueUsers: 8900 },
  'enhance': { totalUsage: 450000, todayUsage: 1234, uniqueUsers: 23400 },
  'replace-bg': { totalUsage: 42000, todayUsage: 89, uniqueUsers: 5600 },
  'remove-object': { totalUsage: 280000, todayUsage: 567, uniqueUsers: 15600 },
  'product-hero': { totalUsage: 89000, todayUsage: 234, uniqueUsers: 7800 },
  'model-try-on': { totalUsage: 78000, todayUsage: 189, uniqueUsers: 6700 },
  'ap-detail': { totalUsage: 56000, todayUsage: 67, uniqueUsers: 4500 },
  'product-enhance': { totalUsage: 123000, todayUsage: 345, uniqueUsers: 11200 },
  'id-photo': { totalUsage: 234000, todayUsage: 678, uniqueUsers: 18900 },
  'poster': { totalUsage: 89000, todayUsage: 123, uniqueUsers: 7800 },
  'video-cover': { totalUsage: 340000, todayUsage: 890, uniqueUsers: 21200 },
  'batch-process': { totalUsage: 56000, todayUsage: 45, uniqueUsers: 3400 },
};

// 工具配置（与 src/config/tools.ts 保持同步）
const toolConfigs = [
  { id: 'remove-bg', name: '智能抠图', category: '图片处理', icon: '✂️', color: 'from-blue-100 to-cyan-100' },
  { id: 'enhance', name: '图片变清晰', category: '图片处理', icon: '🔍', color: 'from-amber-100 to-orange-100' },
  { id: 'replace-bg', name: '背景替换', category: '图片处理', icon: '🖼️', color: 'from-sky-100 to-cyan-100' },
  { id: 'remove-object', name: 'AI 消除', category: '图片处理', icon: '🧹', color: 'from-fuchsia-100 to-pink-100' },
  { id: 'product-hero', name: '商品主图生成', category: '电商工具', icon: '🛍️', color: 'from-orange-100 to-amber-100' },
  { id: 'model-try-on', name: '模特试衣', category: '电商工具', icon: '👗', color: 'from-pink-100 to-rose-100' },
  { id: 'ap-detail', name: 'A+详情页', category: '电商工具', icon: '📦', color: 'from-purple-100 to-violet-100' },
  { id: 'product-enhance', name: '商品图增强', category: '电商工具', icon: '✨', color: 'from-lime-100 to-green-100' },
  { id: 'id-photo', name: '证件照', category: '人像设计', icon: '📸', color: 'from-emerald-100 to-teal-100' },
  { id: 'poster', name: '海报设计', category: '人像设计', icon: '🎨', color: 'from-red-100 to-pink-100' },
  { id: 'video-cover', name: '视频封面', category: '人像设计', icon: '🎬', color: 'from-indigo-100 to-blue-100' },
  { id: 'batch-process', name: '批量处理', category: '批量工具', icon: '⚡', color: 'from-slate-100 to-gray-100' },
];

// 默认运行时配置
const defaultRuntimeConfigs: Record<string, { enabled: boolean; credits: number; featured: boolean }> = {
  'remove-bg': { enabled: true, credits: 0, featured: true },
  'enhance': { enabled: true, credits: 0, featured: true },
  'replace-bg': { enabled: true, credits: 5, featured: false },
  'remove-object': { enabled: true, credits: 5, featured: true },
  'product-hero': { enabled: true, credits: 10, featured: true },
  'model-try-on': { enabled: true, credits: 15, featured: true },
  'ap-detail': { enabled: true, credits: 20, featured: false },
  'product-enhance': { enabled: true, credits: 5, featured: true },
  'id-photo': { enabled: true, credits: 0, featured: true },
  'poster': { enabled: true, credits: 10, featured: false },
  'video-cover': { enabled: true, credits: 0, featured: true },
  'batch-process': { enabled: true, credits: 20, featured: false },
};

// 服务器端存储
let runtimeConfigs = { ...defaultRuntimeConfigs };

// 验证管理员身份
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const adminToken = request.cookies.get('admin_token')?.value;
  return adminToken === 'oneclaw-admin-secret-token';
}

// GET: 获取工具列表及统计（公开接口）
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('id');

    // 如果指定了工具 ID，返回单个工具详情
    if (toolId) {
      const config = toolConfigs.find(t => t.id === toolId);
      if (!config) {
        return NextResponse.json({ error: '工具不存在' }, { status: 404 });
      }

      const usage = mockUsageData[toolId] || { totalUsage: 0, todayUsage: 0, uniqueUsers: 0 };
      const runtime = runtimeConfigs[toolId] || defaultRuntimeConfigs[toolId];

      return NextResponse.json({
        success: true,
        data: {
          ...config,
          ...usage,
          ...runtime,
        },
      });
    }

    // 返回所有工具
    const tools = toolConfigs.map(tool => {
      const usage = mockUsageData[tool.id] || { totalUsage: 0, todayUsage: 0, uniqueUsers: 0 };
      const runtime = runtimeConfigs[tool.id] || defaultRuntimeConfigs[tool.id];
      return {
        ...tool,
        ...usage,
        ...runtime,
      };
    });

    // 计算总计
    const totalStats = {
      totalUsage: Object.values(mockUsageData).reduce((sum, u) => sum + u.totalUsage, 0),
      todayUsage: Object.values(mockUsageData).reduce((sum, u) => sum + u.todayUsage, 0),
      uniqueUsers: Object.values(mockUsageData).reduce((sum, u) => sum + u.uniqueUsers, 0),
      enabledCount: Object.values(runtimeConfigs).filter(c => c.enabled).length,
      totalCount: toolConfigs.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        tools,
        stats: totalStats,
      },
    });
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

// PUT: 更新工具配置（需要管理员权限）
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员身份
    if (!await verifyAdmin(request)) {
      return NextResponse.json({ error: '未授权访问，请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { toolId, enabled, credits, featured } = body;

    // 验证工具 ID
    if (!toolId || !toolConfigs.find(t => t.id === toolId)) {
      return NextResponse.json({ error: '工具不存在' }, { status: 404 });
    }

    // 验证并更新配置
    const updates: Record<string, unknown> = {};
    
    if (typeof enabled === 'boolean') {
      updates.enabled = enabled;
      runtimeConfigs[toolId] = { ...runtimeConfigs[toolId], enabled };
    }
    
    if (typeof credits === 'number' && credits >= 0) {
      updates.credits = credits;
      runtimeConfigs[toolId] = { ...runtimeConfigs[toolId], credits };
    }
    
    if (typeof featured === 'boolean') {
      updates.featured = featured;
      runtimeConfigs[toolId] = { ...runtimeConfigs[toolId], featured };
    }

    return NextResponse.json({
      success: true,
      message: '配置已更新',
      data: updates,
    });
  } catch (error) {
    console.error('更新工具配置失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// PATCH: 批量更新工具配置（需要管理员权限）
export async function PATCH(request: NextRequest) {
  try {
    // 验证管理员身份
    if (!await verifyAdmin(request)) {
      return NextResponse.json({ error: '未授权访问，请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
    }

    const results: { toolId: string; success: boolean }[] = [];

    for (const update of updates) {
      const { toolId, enabled, credits, featured } = update;
      
      if (!toolConfigs.find(t => t.id === toolId)) {
        results.push({ toolId, success: false });
        continue;
      }

      if (typeof enabled === 'boolean') {
        runtimeConfigs[toolId] = { ...runtimeConfigs[toolId], enabled };
      }
      if (typeof credits === 'number' && credits >= 0) {
        runtimeConfigs[toolId] = { ...runtimeConfigs[toolId], credits };
      }
      if (typeof featured === 'boolean') {
        runtimeConfigs[toolId] = { ...runtimeConfigs[toolId], featured };
      }

      results.push({ toolId, success: true });
    }

    return NextResponse.json({
      success: true,
      message: '批量更新完成',
      data: results,
    });
  } catch (error) {
    console.error('批量更新工具配置失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
