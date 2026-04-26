'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, ExternalLink, ArrowRight } from 'lucide-react';

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface Skill {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string;
  category_id: number;
  official_url: string;
  tags: string[];
}

export default function SkillsPage() {
  const router = useRouter();
  
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟数据（实际应从API获取）
      const mockCategories: SkillCategory[] = [
        { id: 1, name: 'AI助手', slug: 'ai', icon: '🤖', color: 'blue', sort_order: 1 },
        { id: 2, name: '智能开发', slug: 'code', icon: '💻', color: 'green', sort_order: 2 },
        { id: 3, name: '效率工具', slug: 'tool', icon: '🔧', color: 'amber', sort_order: 3 },
        { id: 4, name: '内容创作', slug: 'content', icon: '✍️', color: 'purple', sort_order: 4 },
      ];
      
      const mockSkills: Skill[] = [
        { id: 1, name: '代码审查', slug: 'code-review', description: '自动代码审查与优化建议', logo: '🔍', category_id: 2, official_url: '#', tags: ['代码', '审查'] },
        { id: 2, name: '文案生成', slug: 'copywriter', description: '智能生成营销文案', logo: '✍️', category_id: 4, official_url: '#', tags: ['文案', '营销'] },
        { id: 3, name: 'API集成', slug: 'api-integration', description: '快速集成第三方API', logo: '🔗', category_id: 2, official_url: '#', tags: ['API', '集成'] },
        { id: 4, name: '数据分析', slug: 'data-analysis', description: '智能数据分析与可视化', logo: '📊', category_id: 3, official_url: '#', tags: ['数据', '分析'] },
      ];
      
      setCategories(mockCategories);
      setSkills(mockSkills);
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 筛选
  const filteredSkills = skills.filter(skill => {
    const matchCategory = activeCategory === null || skill.category_id === activeCategory;
    const matchSearch = !search || 
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      skill.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 220px)' }}
      >
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">技能库</h1>
            <p className="text-sm text-muted-foreground mt-1">
              精选AI技能，即装即用
            </p>
          </div>

          {/* 搜索框 */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索技能..."
              className="pl-9 h-10"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                activeCategory === null
                  ? 'bg-black text-white'
                  : 'bg-secondary hover:bg-accent'
              )}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-colors',
                  activeCategory === cat.id
                    ? 'bg-black text-white'
                    : 'bg-secondary hover:bg-accent'
                )}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* 技能网格 */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              加载中...
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">未找到相关技能</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSkills.map((skill) => (
                <a
                  key={skill.id}
                  href={`/skills/${skill.slug}`}
                  className="group p-5 rounded-xl bg-secondary hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">
                      {skill.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {skill.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {skill.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-background">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
