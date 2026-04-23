import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

// 使用原生 fetch 获取网页内容
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    }
  });
  return response.text();
}

// SkillHub 分类映射
const SKILL_CATEGORIES: Record<string, { name: string; slug: string; icon: string; color: string }> = {
  'AI': { name: 'AI', slug: 'ai', icon: '🤖', color: '#8B5CF6' },
  '智能开发': { name: '智能开发', slug: 'dev', icon: '💻', color: '#3B82F6' },
  '工具效率': { name: '工具效率', slug: 'tools', icon: '⚡', color: '#10B981' },
  '数据分析': { name: '数据分析', slug: 'data', icon: '📊', color: '#EC4899' },
  '内容创作': { name: '内容创作', slug: 'content', icon: '✍️', color: '#EF4444' },
  '安全合规': { name: '安全合规', slug: 'security', icon: '🔒', color: '#06B6D4' },
  '通讯协作': { name: '通讯协作', slug: 'communication', icon: '💬', color: '#F97316' },
};

// 辅助函数：根据 slug 判断分类
function getCategoryForSlug(slug: string): string {
  const slugLower = slug.toLowerCase();
  if (slugLower.includes('code') || slugLower.includes('git') || slugLower.includes('test') || 
      slugLower.includes('deploy') || slugLower.includes('api') || slugLower.includes('browser') ||
      slugLower.includes('conductor') || slugLower.includes('gateway')) {
    return 'dev';
  }
  if (slugLower.includes('data') || slugLower.includes('sql') || slugLower.includes('analytics') ||
      slugLower.includes('spreadsheet') || slugLower.includes('excel')) {
    return 'data';
  }
  if (slugLower.includes('write') || slugLower.includes('content') || slugLower.includes('blog')) {
    return 'content';
  }
  if (slugLower.includes('security') || slugLower.includes('safe') || slugLower.includes('vetter')) {
    return 'security';
  }
  if (slugLower.includes('team') || slugLower.includes('collabor') || slugLower.includes('meeting')) {
    return 'communication';
  }
  if (slugLower.includes('tool') || slugLower.includes('cli') || slugLower.includes('summarize') ||
      slugLower.includes('search') || slugLower.includes('browser') || slugLower.includes('admapix')) {
    return 'tools';
  }
  return 'ai';
}

// 辅助函数：从内容提取标签
function extractTags(slug: string, description: string): string[] {
  const tags: string[] = [];
  const content = `${slug} ${description}`.toLowerCase();
  
  if (content.includes('agent')) tags.push('Agent');
  if (content.includes('code')) tags.push('代码');
  if (content.includes('git')) tags.push('Git');
  if (content.includes('browser') || content.includes('网页')) tags.push('浏览器');
  if (content.includes('data') || content.includes('sql')) tags.push('数据');
  if (content.includes('search') || content.includes('搜索')) tags.push('搜索');
  if (content.includes('api')) tags.push('API');
  if (content.includes('test')) tags.push('测试');
  if (content.includes('deploy')) tags.push('部署');
  if (content.includes('memory')) tags.push('记忆');
  if (content.includes('write') || content.includes('写作')) tags.push('写作');
  if (content.includes('image') || content.includes('图片')) tags.push('图像');
  if (content.includes('video')) tags.push('视频');
  if (content.includes('summar')) tags.push('总结');
  if (content.includes('ontology') || content.includes('知识图谱')) tags.push('知识图谱');
  if (content.includes('security') || content.includes('安全')) tags.push('安全');
  if (content.includes('automation') || content.includes('自动化')) tags.push('自动化');
  if (content.includes('cli')) tags.push('CLI');
  
  return tags.slice(0, 5);
}

// 从 HTML 中提取链接
function extractSkillLinks(html: string): string[] {
  const links: string[] = [];
  const regex = /href=["']([^"']*\/skills\/([^/"'?#]+))["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    const slug = match[2];
    if (slug && !url.endsWith('/skills') && !url.includes('.md')) {
      links.push(slug);
    }
  }
  return [...new Set(links)];
}

// 从 HTML 中提取技能名称
function extractSkillName(html: string): { title: string; description: string; icon: string | null } {
  // 提取标题
  let title = '';
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(' - SkillHub', '').replace(' - skillhub', '').trim();
  }

  // 提取 meta 描述
  let description = '';
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (descMatch) {
    description = descMatch[1];
  }

  // 提取图标
  let icon: string | null = null;
  const iconMatch = html.match(/<img[^>]+class=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i);
  if (iconMatch) {
    icon = iconMatch[1];
  }

  return { title, description, icon };
}

// 从 skillhub.cn 爬取所有技能并导入
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // 收集所有技能 slug
    const allSlugs = new Set<string>();

    // 1. 从首页获取
    console.log('Fetching homepage...');
    const homeHtml = await fetchPage('https://skillhub.cn/skills');
    const homeLinks = extractSkillLinks(homeHtml);
    homeLinks.forEach(slug => allSlugs.add(slug));
    console.log(`Found ${homeLinks.length} links from homepage`);

    // 2. 尝试获取更多技能（如果有分类页面）
    const categorySlugs = ['ai', 'dev', 'tools', 'data', 'content', 'security', 'communication'];
    for (const cat of categorySlugs) {
      try {
        console.log(`Fetching category: ${cat}`);
        const catHtml = await fetchPage(`https://skillhub.cn/skills/${cat}`);
        const catLinks = extractSkillLinks(catHtml);
        catLinks.forEach(slug => {
          if (slug !== cat) allSlugs.add(slug);
        });
      } catch (e) {
        // 忽略错误
      }
    }

    console.log('Total slugs found:', allSlugs.size);

    // 批量获取技能详情
    const skillsToImport: Record<string, unknown>[] = [];
    const slugList = Array.from(allSlugs);

    for (const slug of slugList) {
      try {
        const skillUrl = `https://skillhub.cn/skills/${slug}`;
        const html = await fetchPage(skillUrl);
        
        const { title, description, icon } = extractSkillName(html);
        const name = title || slug;

        // 跳过无效页面
        if (name.includes('不存在') || name.includes('已下线')) {
          console.log(`Skipping invalid skill: ${slug}`);
          continue;
        }

        // 根据 slug 判断分类
        const categorySlug = getCategoryForSlug(slug);

        skillsToImport.push({
          slug: `skillhub-${slug}`,
          name,
          description: description || `${name} - 来自 SkillHub 的精选 AI 技能`,
          logo: icon,
          category_slug: categorySlug,
          official_url: skillUrl,
          pricing: '免费',
          difficulty: '入门',
          tags: extractTags(slug, description),
          is_featured: extractTags(slug, description).length > 0,
          is_active: true,
        });

        console.log(`[${skillsToImport.length}] ${name}`);
      } catch (err) {
        console.error(`Error fetching ${slug}:`, err);
      }
    }

    // 清空现有数据并导入
    await supabase.from('skills').delete().neq('id', 0);

    // 导入分类
    const categoryResults: Record<string, unknown>[] = [];
    let catIndex = 0;
    for (const cat of Object.values(SKILL_CATEGORIES)) {
      const { data, error } = await supabase
        .from('skill_categories')
        .upsert({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          color: cat.color,
          sort_order: catIndex++,
          description: `SkillHub ${cat.name} 分类，汇聚优质 AI 技能`,
        }, { onConflict: 'slug' })
        .select('id, slug')
        .single();
      
      if (!error && data) {
        categoryResults.push(data);
      }
    }

    // 创建 slug -> id 映射
    const categoryMap = new Map(categoryResults.map(c => [c.slug, c.id]));

    // 导入技能
    let skillsCreated = 0;
    for (const skill of skillsToImport) {
      const categoryId = categoryMap.get(skill.category_slug);
      
      const { error } = await supabase
        .from('skills')
        .upsert({
          name: skill.name,
          slug: skill.slug,
          description: skill.description,
          logo: skill.logo,
          category_id: categoryId,
          official_url: skill.official_url,
          pricing: skill.pricing,
          difficulty: skill.difficulty,
          tags: skill.tags,
          is_featured: skill.is_featured,
          is_active: true,
        }, { onConflict: 'slug' });
      
      if (!error) {
        skillsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `已从 SkillHub 爬取并导入：${categoryResults.length} 个分类，${skillsCreated} 个技能`,
      data: {
        categories_imported: categoryResults.length,
        skills_imported: skillsCreated,
        total_found: allSlugs.size,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
