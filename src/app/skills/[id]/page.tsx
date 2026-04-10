import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Sparkles, Star, Download } from 'lucide-react';

// 获取技能详情
async function getSkill(slug: string) {
  const supabase = getSupabaseClient();
  
  // 移除 skillhub- 前缀
  const realSlug = slug.replace('skillhub-', '');
  
  const { data, error } = await supabase
    .from('skills')
    .select(`
      *,
      skill_categories (
        id,
        name,
        slug,
        color
      )
    `)
    .eq('slug', slug)
    .single();
    
  if (error || !data) {
    // 尝试用真实 slug 查询
    const { data: data2, error: error2 } = await supabase
      .from('skills')
      .select(`
        *,
        skill_categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('slug', `skillhub-${realSlug}`)
      .single();
      
    if (error2 || !data2) {
      return null;
    }
    return data2;
  }
  
  return data;
}

// 获取相关技能
async function getRelatedSkills(categoryId: number, currentId: number) {
  const supabase = getSupabaseClient();
  
  const { data } = await supabase
    .from('skills')
    .select(`
      id,
      name,
      slug,
      description,
      skill_categories (
        name,
        color
      )
    `)
    .eq('category_id', categoryId)
    .neq('id', currentId)
    .eq('is_active', true)
    .limit(6);
    
  return data || [];
}

// 获取所有技能列表（用于导航）
async function getAllSkills() {
  const supabase = getSupabaseClient();
  
  const { data } = await supabase
    .from('skills')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name');
    
  return data || [];
}

export async function generateStaticParams() {
  const skills = await getAllSkills();
  return skills.map(skill => ({
    id: skill.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = await getSkill(id);
  
  if (!skill) {
    return {
      title: '技能未找到 - OneClaw',
    };
  }
  
  return {
    title: `${skill.name} - 技能详情 - OneClaw`,
    description: skill.description || `${skill.name} - 来自 ClawHub 的精选 AI 技能`,
  };
}

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = await getSkill(id);
  
  if (!skill) {
    notFound();
  }
  
  const relatedSkills = await getRelatedSkills(skill.category_id, skill.id);
  
  // 生成字母标识的颜色
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
  const colorIndex = skill.name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  const letter = skill.name.charAt(0).toUpperCase();
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回技能库</span>
            </Link>
            <div className="flex-1" />
            <div className="text-sm text-slate-400">
              技能库 / {skill.skill_categories?.name || '全部'}
            </div>
          </div>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* 技能头部 */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-start gap-6">
              {/* 字母标识 */}
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
                style={{ backgroundColor: bgColor + '20' }}
              >
                <span style={{ color: bgColor }}>{letter}</span>
              </div>
              
              {/* 技能信息 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {skill.name}
                    </h1>
                    {skill.skill_categories && (
                      <span 
                        className="inline-flex text-sm px-3 py-1 rounded-full"
                        style={{ backgroundColor: skill.skill_categories.color + '20', color: skill.skill_categories.color }}
                      >
                        {skill.skill_categories.name}
                      </span>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-3">
                    {/* 按钮移至详情页底部展示 */}
                  </div>
                </div>
                
                {/* 描述 */}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {skill.description || '暂无详细描述。'}
                </p>
              </div>
            </div>
          </div>
          
          {/* 技能详情 */}
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：主要信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 标签 */}
              {skill.tags && skill.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">功能标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.tags.map((tag: string, idx: number) => (
                      <Badge 
                        key={idx}
                        variant="secondary"
                        className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 特点 */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">技能特点</h3>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>来自 ClawHub 精选技能库</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>经过 ClawHub 安全检测，可放心使用</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Download className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>免费使用，无需付费</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 使用说明 */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">使用说明</h3>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 text-slate-600 dark:text-slate-300">
                  <p className="mb-3">
                    1. 点击右上角「在 ClawHub 打开」按钮
                  </p>
                  <p className="mb-3">
                    2. 在 ClawHub 页面上点击「安装」或「使用」按钮
                  </p>
                  <p>
                    3. 按照 SkillHub 的指引完成技能的安装和使用
                  </p>
                </div>
              </div>
            </div>
            
            {/* 右侧：信息卡片 */}
            <div className="space-y-4">
              {/* 技能信息 */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">技能信息</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">价格</span>
                    <span className="text-slate-800 dark:text-slate-200">{skill.pricing || '免费'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">难度</span>
                    <span className="text-slate-800 dark:text-slate-200">{skill.difficulty || '入门'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">分类</span>
                    <span className="text-slate-800 dark:text-slate-200">{skill.skill_categories?.name || '其他'}</span>
                  </div>
                </div>
              </div>
              
              {/* 来源 */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">技能来源</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">ClawHub</div>
                    <div className="text-xs text-slate-500">精选 AI 技能社区</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 相关技能 */}
        {relatedSkills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              相关技能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedSkills.map(related => {
                const relatedColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
                const relatedColorIndex = related.name.charCodeAt(0) % relatedColors.length;
                const relatedBgColor = relatedColors[relatedColorIndex];
                const relatedLetter = related.name.charAt(0).toUpperCase();
                
                return (
                  <Link
                    key={related.id}
                    href={`/skills/${related.slug}`}
                    className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0"
                        style={{ backgroundColor: relatedBgColor + '20' }}
                      >
                        <span style={{ color: relatedBgColor }}>{relatedLetter}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                          {related.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {related.description || '暂无描述'}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
