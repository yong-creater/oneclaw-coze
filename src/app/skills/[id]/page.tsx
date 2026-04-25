import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, List, Clock, CheckCircle, Download, Heart, ExternalLink, FileText, Code, Zap, Star, Shield } from 'lucide-react';
import BackButton from '@/components/common/BackButton';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import LobsterLoading from '@/components/common/LobsterLoading';

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
    description: skill.description || `${skill.name} - OneClaw 精选 AI 技能`,
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
        <div className="max-w-4xl mx-auto px-4 py-3">
          <BackToHome label="技能详情" />
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 技能头部卡片 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 左侧：技能图标 */}
              <div className="flex-shrink-0">
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg"
                  style={{ backgroundColor: bgColor + '20' }}
                >
                  <span style={{ color: bgColor }}>{letter}</span>
                </div>
              </div>
              
              {/* 中间：技能信息 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {skill.name}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      {skill.skill_categories && (
                        <Badge 
                          className="text-sm px-3 py-1"
                          style={{ backgroundColor: skill.skill_categories.color + '20', color: skill.skill_categories.color }}
                        >
                          {skill.skill_categories.name}
                        </Badge>
                      )}
                      {skill.pricing && (
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {skill.pricing}
                        </Badge>
                      )}
                      {skill.difficulty && (
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {skill.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {skill.description || '暂无详细描述。'}
                </p>
                
                {/* 标签 */}
                {skill.tags && skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {skill.tags.map((tag: string, idx: number) => (
                      <span 
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 技能元信息 */}
                <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>下载量</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>收藏</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>通过安全检测</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 平铺内容区域 */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* 技能描述 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">技能描述</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {skill.description || '暂无详细描述。该技能数据来源于 OneClaw 精选技能库。'}
              </p>
            </div>

            {/* 功能特点 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">技能特点</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">精选技能</div>
                    <div className="text-sm text-slate-500">来自 OneClaw 精选技能库</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">安全检测</div>
                    <div className="text-sm text-slate-500">经过 OneClaw 安全检测</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">免费使用</div>
                    <div className="text-sm text-slate-500">无需付费，直接使用</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">持续更新</div>
                    <div className="text-sm text-slate-500">技能库持续更新迭代</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 功能列表 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">功能列表</h3>
              {skill.feature_list && skill.feature_list.length > 0 ? (
                <ul className="space-y-3">
                  {skill.feature_list.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">暂无功能列表信息。</p>
              )}
            </div>

            {/* 文档和源码链接 */}
            <div className="flex flex-wrap gap-3">
              {skill.documentation_url && (
                <a 
                  href={skill.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  查看官方文档
                </a>
              )}
              {skill.github_url && (
                <a 
                  href={skill.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                >
                  <Code className="w-4 h-4" />
                  在 GitHub 查看
                </a>
              )}
            </div>
          </div>

        </div>
        
        {/* 相关技能 */}
        {relatedSkills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
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
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{ backgroundColor: relatedBgColor + '20' }}
                      >
                        <span style={{ color: relatedBgColor }}>{relatedLetter}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-orange-500 transition-colors">
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

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        {/* 公众号推广 */}
        <WechatPromo />
        
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/oneclaw-logo-v2.png" 
                alt="OneClaw" 
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/about" className="hover:text-orange-500 transition-colors">关于OneClaw</Link>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                渝ICP备2026004291号-2
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
