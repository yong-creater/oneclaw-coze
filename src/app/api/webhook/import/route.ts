import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// ============================================================
// 统一导入 Webhook 端点 - 安全性增强版
// ============================================================

// 安全配置（从环境变量读取）
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const ALLOWED_IPS = process.env.WEBHOOK_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
const MAX_REQUEST_SIZE = 5 * 1024 * 1024; // 5MB
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟窗口
const RATE_LIMIT_MAX = 10; // 最多10次/分钟

// 内存存储（生产环境建议使用 Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// ============================================================
// 安全验证
// ============================================================

// 1. API 密钥验证
function verifyApiKey(request: NextRequest): { valid: boolean; error?: string } {
  if (!WEBHOOK_SECRET) {
    console.error('[Webhook] 严重错误: WEBHOOK_SECRET 环境变量未配置');
    return { valid: false, error: '服务端配置错误' };
  }

  const authHeader = request.headers.get('Authorization');
  const apiKey = request.headers.get('x-api-key');
  const validKey = apiKey === WEBHOOK_SECRET || 
                   (authHeader?.startsWith('Bearer ') && authHeader.slice(7) === WEBHOOK_SECRET);

  if (!validKey) {
    logSecurityEvent('invalid_api_key', { ip: getClientIP(request) });
    return { valid: false, error: '未授权' };
  }

  return { valid: true };
}

// 2. IP 白名单验证
function verifyIP(request: NextRequest): { valid: boolean; error?: string } {
  if (ALLOWED_IPS.length === 0) {
    return { valid: true }; // 未配置白名单，跳过检查
  }

  const clientIP = getClientIP(request);
  
  // 支持 CIDR 格式（简单实现）
  const isAllowed = ALLOWED_IPS.some(allowed => {
    if (allowed.includes('/')) {
      // 简单 CIDR 检查（仅支持 /24）
      const [allowedIP, mask] = allowed.split('/');
      const allowedBase = allowedIP.split('.').slice(0, 3).join('.');
      const clientBase = clientIP.split('.').slice(0, 3).join('.');
      return allowedBase === clientBase;
    }
    return allowed === clientIP;
  });

  if (!isAllowed) {
    logSecurityEvent('ip_blocked', { ip: clientIP, allowedIPs: ALLOWED_IPS });
    return { valid: false, error: 'IP不在允许范围内' };
  }

  return { valid: true };
}

// 3. 速率限制
function verifyRateLimit(request: NextRequest): { valid: boolean; error?: string } {
  const clientIP = getClientIP(request);
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { valid: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    logSecurityEvent('rate_limit_exceeded', { ip: clientIP, count: record.count });
    return { valid: false, error: '请求过于频繁，请稍后重试' };
  }

  record.count++;
  return { valid: true };
}

// 4. 请求大小验证
function verifyRequestSize(request: NextRequest): { valid: boolean; error?: string } {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > MAX_REQUEST_SIZE) {
      logSecurityEvent('request_too_large', { ip: getClientIP(request), size });
      return { valid: false, error: '请求数据过大' };
    }
  }

  return { valid: true };
}

// 获取客户端 IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

// 安全事件日志
function logSecurityEvent(event: string, details: Record<string, unknown>) {
  console.warn(`[Webhook Security] ${event}:`, {
    ...details,
    timestamp: new Date().toISOString()
  });
}

// ============================================================
// 数据导入逻辑
// ============================================================

interface ImportResult {
  type: string;
  success: boolean;
  count: number;
  error?: string;
}

// 导入教程
async function importTutorials(client: any, tutorials: any[]): Promise<ImportResult> {
  try {
    // 数据校验
    const validTutorials = tutorials
      .filter(t => t.title && t.content)
      .slice(0, 500); // 限制单次导入数量

    if (validTutorials.length === 0) {
      return { type: 'tutorials', success: false, count: 0, error: '无有效数据' };
    }

    const tutorialsToInsert = validTutorials.map((t: Record<string, unknown>) => ({
      title: String(t.title).slice(0, 200),
      content: String(t.content).slice(0, 50000),
      tool_id: null,
      category: String(t.category || '其他').slice(0, 50),
      difficulty: ['初级', '中级', '高级'].includes(t.difficulty as string) ? t.difficulty : '初级',
      cover_image: t.cover_image ? String(t.cover_image).slice(0, 500) : null,
      author: 'OneClaw官方',
      views: 0,
      likes: 0,
      is_featured: false,
      status: 'published'
    }));

    const { error } = await client.from('tutorials').insert(tutorialsToInsert);
    
    if (error) {
      return { type: 'tutorials', success: false, count: 0, error: '数据库写入失败' };
    }

    return { type: 'tutorials', success: true, count: validTutorials.length };
  } catch (error: any) {
    console.error('[Webhook] 导入教程失败:', error.message);
    return { type: 'tutorials', success: false, count: 0, error: '处理失败' };
  }
}

// 导入提示词
async function importPrompts(client: any, prompts: any[]): Promise<ImportResult> {
  try {
    const validPrompts = prompts
      .filter(p => p.title && p.content)
      .slice(0, 500);

    if (validPrompts.length === 0) {
      return { type: 'prompts', success: false, count: 0, error: '无有效数据' };
    }

    const promptsToInsert = validPrompts.map((p: Record<string, unknown>) => ({
      title: String(p.title).slice(0, 200),
      content: String(p.content).slice(0, 10000),
      tool_id: null,
      category: String(p.category || '通用').slice(0, 50),
      tags: Array.isArray(p.tags) ? p.tags.slice(0, 10).map(t => String(t).slice(0, 30)) : [],
      author: 'OneClaw官方',
      uses: 0,
      likes: 0,
      status: 'published'
    }));

    const { error } = await client.from('prompts').insert(promptsToInsert);
    
    if (error) {
      return { type: 'prompts', success: false, count: 0, error: '数据库写入失败' };
    }

    return { type: 'prompts', success: true, count: validPrompts.length };
  } catch (error: any) {
    console.error('[Webhook] 导入提示词失败:', error.message);
    return { type: 'prompts', success: false, count: 0, error: '处理失败' };
  }
}

// 导入工具
async function importTools(client: any, tools: any[]): Promise<ImportResult> {
  try {
    const validTools = tools
      .filter(t => t.name)
      .slice(0, 200);

    if (validTools.length === 0) {
      return { type: 'tools', success: false, count: 0, error: '无有效数据' };
    }

    // 获取分类映射
    const { data: categories } = await client.from('categories').select('id, slug');
    const categorySlugToId = new Map(categories?.map((c: any) => [c.slug, c.id]) || []);
    const defaultCategoryId = categorySlugToId.get('video-generation') || 1;

    const toolsToInsert = validTools.map((t: Record<string, unknown>) => {
      const categorySlug = getCategorySlug(String(t.category || '其他'));
      return {
        name: String(t.name).slice(0, 100),
        logo: String(t.logo || '').slice(0, 500) || 'https://via.placeholder.com/100x100?text=AI',
        producer: String(t.producer || '未知').slice(0, 100),
        highlight: String(t.highlight || '优质AI工具').slice(0, 100),
        category_id: categorySlugToId.get(categorySlug) || defaultCategoryId,
        sub_category_ids: [],
        free_type: ['完全免费', '免费额度', '限时免费', '付费工具'].includes(t.free_type as string) ? t.free_type : '免费额度',
        free_quota_desc: '',
        feature_tags: Array.isArray(t.feature_tags) ? t.feature_tags.slice(0, 10) : [],
        max_duration: '',
        official_url: String(t.official_url || '').slice(0, 500),
        promotion_url: String(t.promotion_url || '').slice(0, 500),
        is_official: false,
        is_featured: false,
        is_active: true,
        advantages: [],
        limitations: [],
        commercial_license: '待确认',
        sponsor_type: 'none'
      };
    });

    const { error } = await client.from('tools').insert(toolsToInsert);
    
    if (error) {
      return { type: 'tools', success: false, count: 0, error: '数据库写入失败' };
    }

    return { type: 'tools', success: true, count: validTools.length };
  } catch (error: any) {
    console.error('[Webhook] 导入工具失败:', error.message);
    return { type: 'tools', success: false, count: 0, error: '处理失败' };
  }
}

// 分类名称转 slug
function getCategorySlug(name: string): string {
  const map: Record<string, string> = {
    '视频生成': 'video-generation', '数字人': 'digital-human', '视频编辑': 'video-editing',
    'AI配音': 'ai-dubbing', 'AI音乐': 'ai-audio', 'AI绘画': 'ai-image',
    'AI写作': 'ai-writing', 'AI编程': 'ai-coding', 'AI办公': 'ai-office',
    'AI营销': 'ai-marketing', 'AI学习': 'ai-learning', 'AI聊天': 'ai-chat',
    'AI搜索': 'ai-search', '其他': 'other'
  };
  return map[name] || 'other';
}

// ============================================================
// API 入口
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  try {
    // ===== 安全检查（按顺序执行）=====
    
    // 1. 请求大小检查
    const sizeCheck = verifyRequestSize(request);
    if (!sizeCheck.valid) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 });
    }

    // 2. API 密钥验证
    const authCheck = verifyApiKey(request);
    if (!authCheck.valid) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 3. IP 白名单验证
    const ipCheck = verifyIP(request);
    if (!ipCheck.valid) {
      return NextResponse.json({ error: 'IP不在允许范围内' }, { status: 403 });
    }

    // 4. 速率限制检查
    const rateCheck = verifyRateLimit(request);
    if (!rateCheck.valid) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    // ===== 解析请求体 =====
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '无效的JSON格式' }, { status: 400 });
    }

    // ===== 数据导入 =====
    const client = getSupabaseClient();
    const results: ImportResult[] = [];
    let totalCount = 0;

    if (body.tutorials && Array.isArray(body.tutorials)) {
      const result = await importTutorials(client, body.tutorials);
      results.push(result);
      totalCount += result.count;
    }

    if (body.prompts && Array.isArray(body.prompts)) {
      const result = await importPrompts(client, body.prompts);
      results.push(result);
      totalCount += result.count;
    }

    if (body.tools && Array.isArray(body.tools)) {
      const result = await importTools(client, body.tools);
      results.push(result);
      totalCount += result.count;
    }

    if (body.action === 'crawl_skills') {
      return NextResponse.json({ 
        error: '技能爬取功能已禁用，请手动导入' 
      }, { status: 403 });
    }

    // ===== 返回结果 =====
    const processingTime = Date.now() - startTime;
    
    console.log(`[Webhook] 导入完成 IP:${clientIP} 耗时:${processingTime}ms 数量:${totalCount}`);

    return NextResponse.json({
      success: results.length > 0 && results.every(r => r.success),
      totalImported: totalCount,
      details: results,
      processingTime: `${processingTime}ms`
    });

  } catch (error: any) {
    console.error('[Webhook] 处理异常:', error.message);
    
    // 不暴露内部错误细节
    return NextResponse.json({ 
      success: false, 
      error: '处理失败' 
    }, { status: 500 });
  }
}

// 健康检查
export async function GET() {
  const configStatus = {
    webhookSecret: WEBHOOK_SECRET ? '已配置' : '未配置 ⚠️',
    allowedIPs: ALLOWED_IPS.length > 0 ? `${ALLOWED_IPS.length}个` : '未限制',
    rateLimit: `${RATE_LIMIT_MAX}次/${RATE_LIMIT_WINDOW/1000}秒`
  };

  return NextResponse.json({
    name: 'OneClaw Webhook API',
    version: '1.0.0',
    security: configStatus,
    endpoints: {
      import: 'POST /api/webhook/import'
    }
  });
}
