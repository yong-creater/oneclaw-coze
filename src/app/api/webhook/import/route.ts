import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 统一导入 webhook 端点
// 扣子工作流完成后调用此接口，自动路由到对应导入逻辑

// API 密钥验证（防止恶意调用）
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'oneclaw-webhook-secret-2024';

interface ImportResult {
  type: string;
  success: boolean;
  count: number;
  error?: string;
}

// 验证请求合法性
function verifyRequest(request: NextRequest): { valid: boolean; error?: string } {
  // 检查 API 密钥
  const authHeader = request.headers.get('Authorization');
  const apiKey = request.headers.get('x-api-key');
  
  const validKey = apiKey === WEBHOOK_SECRET || 
                   (authHeader && authHeader.replace('Bearer ', '') === WEBHOOK_SECRET);
  
  if (!validKey) {
    return { valid: false, error: '未授权的请求' };
  }
  
  return { valid: true };
}

// 导入教程
async function importTutorials(client: any, tutorials: any[]): Promise<ImportResult> {
  try {
    const tutorialsToInsert = tutorials.map((t: Record<string, unknown>) => ({
      title: t.title,
      content: t.content,
      tool_id: t.tool_id || null,
      category: t.category || '其他',
      difficulty: t.difficulty || '初级',
      cover_image: t.cover_image || null,
      author: t.author || 'OneClaw官方',
      views: t.views || Math.floor(Math.random() * 5000) + 500,
      likes: t.likes || Math.floor(Math.random() * 300) + 30,
      is_featured: t.is_featured || false,
      status: 'published'
    }));

    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < tutorialsToInsert.length; i += batchSize) {
      const batch = tutorialsToInsert.slice(i, i + batchSize);
      const { error } = await client.from('tutorials').insert(batch);
      
      if (error) {
        console.error('导入教程失败:', error);
        return { type: 'tutorials', success: false, count: 0, error: error.message };
      }
      insertedCount += batch.length;
    }

    return { type: 'tutorials', success: true, count: insertedCount };
  } catch (error: any) {
    return { type: 'tutorials', success: false, count: 0, error: error.message };
  }
}

// 导入提示词
async function importPrompts(client: any, prompts: any[]): Promise<ImportResult> {
  try {
    const promptsToInsert = prompts.map((p: Record<string, unknown>) => ({
      title: p.title,
      content: p.content,
      tool_id: p.tool_id || null,
      category: p.category || '通用',
      tags: p.tags || [],
      author: p.author || 'OneClaw官方',
      uses: p.uses || Math.floor(Math.random() * 1000) + 100,
      likes: p.likes || Math.floor(Math.random() * 200) + 20,
      status: 'published'
    }));

    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < promptsToInsert.length; i += batchSize) {
      const batch = promptsToInsert.slice(i, i + batchSize);
      const { error } = await client.from('prompts').insert(batch);
      
      if (error) {
        console.error('导入提示词失败:', error);
        return { type: 'prompts', success: false, count: 0, error: error.message };
      }
      insertedCount += batch.length;
    }

    return { type: 'prompts', success: true, count: insertedCount };
  } catch (error: any) {
    return { type: 'prompts', success: false, count: 0, error: error.message };
  }
}

// 导入工具
async function importTools(client: any, tools: any[]): Promise<ImportResult> {
  try {
    // 获取分类ID映射
    const { data: categories } = await client.from('categories').select('id, slug');
    const categorySlugToId = new Map(categories?.map((c: any) => [c.slug, c.id]) || []);
    const defaultCategoryId = categorySlugToId.get('video-generation') || 1;

    const toolsToInsert = tools.map((t: Record<string, unknown>) => {
      // 根据分类名称找到对应的 slug
      const categoryName = t.category as string;
      const categorySlug = getCategorySlug(categoryName);
      const categoryId = categorySlugToId.get(categorySlug) || defaultCategoryId;

      return {
        name: t.name,
        logo: t.logo || 'https://via.placeholder.com/100x100?text=AI',
        producer: t.producer || '未知',
        highlight: t.highlight || '优质AI工具',
        category_id: categoryId,
        sub_category_ids: t.sub_category_ids || [],
        free_type: t.free_type || '免费额度',
        free_quota_desc: t.free_quota_desc || '',
        feature_tags: t.feature_tags || [],
        max_duration: t.max_duration || '',
        official_url: t.official_url || '',
        promotion_url: t.promotion_url || '',
        is_official: t.is_official || false,
        is_featured: t.is_featured || false,
        is_active: true,
        advantages: t.advantages || [],
        limitations: t.limitations || [],
        commercial_license: t.commercial_license || '待确认',
        sponsor_type: t.sponsor_type || 'none'
      };
    });

    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < toolsToInsert.length; i += batchSize) {
      const batch = toolsToInsert.slice(i, i + batchSize);
      const { error } = await client.from('tools').insert(batch);
      
      if (error) {
        console.error('导入工具失败:', error);
        return { type: 'tools', success: false, count: 0, error: error.message };
      }
      insertedCount += batch.length;
    }

    return { type: 'tools', success: true, count: insertedCount };
  } catch (error: any) {
    return { type: 'tools', success: false, count: 0, error: error.message };
  }
}

// 根据分类名称获取 slug
function getCategorySlug(name: string): string {
  const map: Record<string, string> = {
    '视频生成': 'video-generation',
    '数字人': 'digital-human',
    '视频编辑': 'video-editing',
    'AI配音': 'ai-dubbing',
    'AI音乐': 'ai-audio',
    'AI绘画': 'ai-image',
    'AI写作': 'ai-writing',
    'AI编程': 'ai-coding',
    'AI办公': 'ai-office',
    'AI营销': 'ai-marketing',
    'AI学习': 'ai-learning',
    'AI聊天': 'ai-chat',
    'AI搜索': 'ai-search',
    '其他': 'other'
  };
  return map[name] || 'other';
}

// 爬取技能（从 SkillHub）
async function crawlSkills(client: any): Promise<ImportResult> {
  try {
    const SKILL_CATEGORIES: Record<string, { name: string; slug: string; icon: string; color: string }> = {
      'AI': { name: 'AI', slug: 'ai', icon: '🤖', color: '#8B5CF6' },
      '智能开发': { name: '智能开发', slug: 'dev', icon: '💻', color: '#3B82F6' },
      '工具效率': { name: '工具效率', slug: 'tools', icon: '⚡', color: '#10B981' },
      '数据分析': { name: '数据分析', slug: 'data', icon: '📊', color: '#EC4899' },
      '内容创作': { name: '内容创作', slug: 'content', icon: '✍️', color: '#EF4444' },
      '安全合规': { name: '安全合规', slug: 'security', icon: '🔒', color: '#06B6D4' },
      '通讯协作': { name: '通讯协作', slug: 'communication', icon: '💬', color: '#F97316' },
    };

    // 获取所有技能分类
    const { data: existingCategories } = await client.from('skill_categories').select('*');
    const existingSlugs = new Set(existingCategories?.map((c: any) => c.slug) || []);
    
    // 插入新分类
    for (const cat of Object.values(SKILL_CATEGORIES)) {
      if (!existingSlugs.has(cat.slug)) {
        await client.from('skill_categories').insert(cat);
      }
    }

    // 从 SkillHub 爬取技能
    const response = await fetch('https://skillhub.cn/skills', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return { type: 'skills', success: false, count: 0, error: '无法访问 SkillHub' };
    }

    const html = await response.text();
    // 简单的 HTML 解析，提取技能数据
    const skills = parseSkillsFromHTML(html);

    if (skills.length === 0) {
      return { type: 'skills', success: false, count: 0, error: '未解析到技能数据' };
    }

    // 批量插入技能
    const { data: skillCategories } = await client.from('skill_categories').select('id, slug');
    const categorySlugToId = new Map(skillCategories?.map((c: any) => [c.slug, c.id]) || []);

    const skillsToInsert = skills.map((s: any) => ({
      name: s.name,
      slug: s.slug,
      description: s.description || '',
      logo: s.logo || '',
      category_id: categorySlugToId.get(s.category) || categorySlugToId.get('tools') || 1,
      official_url: s.url || '',
      tags: s.tags || []
    }));

    const { error } = await client.from('skills').insert(skillsToInsert);
    
    if (error) {
      console.error('导入技能失败:', error);
      return { type: 'skills', success: false, count: 0, error: error.message };
    }

    return { type: 'skills', success: true, count: skills.length };
  } catch (error: any) {
    return { type: 'skills', success: false, count: 0, error: error.message };
  }
}

// 从 HTML 解析技能数据
function parseSkillsFromHTML(html: string): any[] {
  const skills: any[] = [];
  
  // 简单的正则匹配，实际使用需要更完善的解析逻辑
  const skillPattern = /href="\/skills\/([^"]+)">([^<]+)<\/a>/g;
  let match;
  
  while ((match = skillPattern.exec(html)) !== null) {
    const slug = match[1];
    const name = match[2].trim();
    
    if (name && slug && !skills.find(s => s.slug === slug)) {
      skills.push({
        name,
        slug,
        description: '',
        url: `https://skillhub.cn/skills/${slug}`,
        tags: []
      });
    }
  }
  
  return skills.slice(0, 100); // 限制数量
}

export async function POST(request: NextRequest) {
  try {
    // 验证请求
    const verification = verifyRequest(request);
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 401 });
    }

    const client = getSupabaseClient();
    const body = await request.json();
    
    const results: ImportResult[] = [];
    let totalCount = 0;

    // 根据请求内容自动路由
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
      const result = await crawlSkills(client);
      results.push(result);
      totalCount += result.count;
    }

    // 返回汇总结果
    const summary = {
      success: results.every(r => r.success),
      totalImported: totalCount,
      details: results,
      timestamp: new Date().toISOString()
    };

    console.log('Webhook 导入完成:', summary);

    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('Webhook 处理失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// GET 请求返回 API 信息
export async function GET() {
  return NextResponse.json({
    name: 'OneClaw Webhook API',
    version: '1.0.0',
    endpoints: {
      tutorials: 'POST { tutorials: [...] }',
      prompts: 'POST { prompts: [...] }',
      tools: 'POST { tools: [...] }',
      crawl_skills: 'POST { action: "crawl_skills" }'
    },
    usage: {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'your-webhook-secret'
      }
    }
  });
}
