import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import BackToHome from '@/components/common/BackToHome';
import AnimatedLobster from '@/components/common/AnimatedLobster';

export const metadata: Metadata = {
  title: 'AI技能库',
  description: '探索实用的AI技能，从写作到编程，全方位提升你的AI使用效率',
};

async function getSkills() {
  const supabase = getSupabaseClient();
  
  const { data: skills, error } = await supabase
    .from('skills')
    .select(`
      *,
      skill_categories (
        id,
        name,
        slug,
        icon,
        color
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('获取技能失败:', error);
    return [];
  }

  return skills || [];
}

async function getCategories() {
  const supabase = getSupabaseClient();
  
  const { data: categories, error } = await supabase
    .from('skill_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('获取分类失败:', error);
    return [];
  }

  return categories || [];
}

export default async function SkillsPage() {
  const [skills, categories] = await Promise.all([
    getSkills(),
    getCategories()
  ]);

  // 按分类分组
  const groupedSkills = skills.reduce((acc, skill) => {
    const categoryId = skill.category_id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: skill.skill_categories,
        skills: []
      };
    }
    acc[categoryId].skills.push(skill);
    return acc;
  }, {} as Record<number, { category: any; skills: any[] }>);

  const groupedSkillsList = Object.values(groupedSkills) as { category: any; skills: any[] }[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <BackToHome />
            <Link href="/" className="text-white/80 hover:text-white text-sm flex items-center gap-1">
              <span>返回首页</span>
            </Link>
          </div>
          
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">实用AI技能集合</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI技能库</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              探索来自 SkillHub 的实用AI技能，覆盖写作、编程、数据分析等多个领域
            </p>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {groupedSkillsList.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">暂无技能数据</h2>
            <p className="text-slate-500">技能数据正在同步中，请稍后再试</p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedSkillsList.map(({ category, skills: categorySkills }) => (
              <section key={category.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon || '🔧'}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {category.name}
                  </h2>
                  <Badge variant="secondary" className="ml-auto">
                    {categorySkills.length} 个技能
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map((skill) => (
                    <Link 
                      key={skill.id}
                      href={`/skills/${skill.slug}`}
                      className="group"
                    >
                      <Card className="h-full hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all duration-200">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            {skill.logo ? (
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                                <Image
                                  src={skill.logo}
                                  alt={skill.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {skill.name.charAt(0)}
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">
                                {skill.name}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                {skill.description || '暂无描述'}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-3">
                                {skill.official_url && (
                                  <Badge variant="outline" className="text-xs">
                                    官方链接
                                  </Badge>
                                )}
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors ml-auto" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <AnimatedLobster size={20} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">OneClaw</span>
              <span className="text-xs text-slate-400 ml-2">AI技能库</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/about" className="hover:text-orange-500 transition-colors">
                关于OneClaw
              </Link>
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
