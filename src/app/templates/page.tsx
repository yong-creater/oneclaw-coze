'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import LobsterLoading from '@/components/common/LobsterLoading';
import { 
  LayoutTemplate, Search, Copy, ArrowRight, 
  FileText, Feather, Globe, Sparkle, Scissors, Layout,
  Camera, Palette, Star, Wand2, Zap, Code, Lightbulb, Image as LucideImage
} from 'lucide-react';

// 图标映射
const TYPE_ICONS: Record<string, React.ReactNode> = {
  'xhs_post': <FileText className="w-5 h-5" />,
  'goods_poster': <Layout className="w-5 h-5" />,
  'portrait': <Camera className="w-5 h-5" />,
  'cover': <Sparkle className="w-5 h-5" />,
  'goods_image': <LucideImage className="w-5 h-5" />,
  'background_removal': <Scissors className="w-5 h-5" />,
  'photo': <Palette className="w-5 h-5" />,
  'layout': <LayoutTemplate className="w-5 h-5" />,
  'resume': <FileText className="w-5 h-5" />,
  'novel': <Feather className="w-5 h-5" />,
  'script': <Zap className="w-5 h-5" />,
};

// 类型名称映射
const TYPE_NAMES: Record<string, string> = {
  'xhs_post': '小红书',
  'goods_poster': '商品海报',
  'portrait': 'AI写真',
  'cover': '封面图',
  'background_removal': '抠图',
  'photo': '照片美化',
  'resume': '简历',
  'novel': '小说',
  'script': '脚本',
};

interface Template {
  id: number;
  name: string;
  description: string;
  template_type: string;
  thumbnail: string;
  tags: string[];
  usage_count: number;
  tool_name: string;
  tool_url: string;
  content?: Record<string, any>;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 加载模板
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedType) {
          params.set('type', selectedType);
        }
        
        const res = await fetch(`/api/templates?${params}`);
        const data = await res.json();
        
        if (data.success) {
          setTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('获取模板失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedType]);

  // 过滤模板
  const filteredTemplates = templates.filter(t => {
    const matchKeyword = !searchKeyword || 
      t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchKeyword;
  });

  // 按类型分组
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const type = template.template_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  // 复制模板
  const copyTemplate = (template: Template) => {
    const content = JSON.stringify(template, null, 2);
    navigator.clipboard.writeText(content);
    // 可以用 toast 提示
  };

  // 使用模板（复刻）
  const handleUseTemplate = (template: Template) => {
    if (!template.tool_url) {
      alert('该模板暂不支持复刻');
      return;
    }

    // 将模板参数编码到 URL 中
    const params = new URLSearchParams();
    params.set('template_id', String(template.id));
    params.set('template_name', template.name);
    
    // 将模板的 content 字段作为参数传递
    if (template.content) {
      params.set('template_content', encodeURIComponent(JSON.stringify(template.content)));
    }
    
    // 跳转到工具页面
    const targetUrl = `${template.tool_url}?${params.toString()}`;
    window.location.href = targetUrl;
  };

  // 获取所有类型
  const allTypes = Object.keys(groupedTemplates);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <BackToHome />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            <LayoutTemplate className="w-12 h-12 inline-block mr-3 text-orange-500" />
            模板中心
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            海量精选模板，一键复刻生成。涵盖小红书、电商、人像、设计等多个场景
          </p>
        </div>

        {/* 搜索 */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 
                         bg-white dark:bg-slate-800 focus:border-orange-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* 类型筛选 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedType === null
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            全部
          </button>
          {Object.entries(TYPE_NAMES).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedType(selectedType === key ? null : key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedType === key
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {TYPE_ICONS[key]}
              {name}
            </button>
          ))}
        </div>

        {/* 加载状态 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LobsterLoading />
          </div>
        ) : (
          <>
            {/* 模板列表 */}
            {Object.keys(groupedTemplates).length === 0 ? (
              <div className="text-center py-20">
                <LayoutTemplate className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">暂无模板</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
                  <div key={type}>
                    {/* 类型标题 */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        {TYPE_ICONS[type]}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                          {TYPE_NAMES[type]}模板
                        </h2>
                        <p className="text-sm text-slate-500">
                          {typeTemplates.length} 个模板
                        </p>
                      </div>
                    </div>

                    {/* 模板卡片网格 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {typeTemplates.map((template) => (
                        <Card 
                          key={template.id}
                          className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* 缩略图 */}
                          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                            {template.thumbnail ? (
                              <img
                                src={template.thumbnail}
                                alt={template.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <LayoutTemplate className="w-16 h-16 text-slate-300" />
                              </div>
                            )}
                            
                            {/* 工具来源标签 */}
                            <Link 
                              href={template.tool_url}
                              className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white hover:text-orange-500 transition-colors flex items-center gap-1"
                            >
                              → {template.tool_name}
                            </Link>
                          </div>

                          <CardContent className="p-5">
                            {/* 标题和描述 */}
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">
                              {template.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                              {template.description || '暂无描述'}
                            </p>

                            {/* 标签 */}
                            {template.tags && template.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {template.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="flex items-center gap-2">
                              <Button 
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                                onClick={() => handleUseTemplate(template)}
                              >
                                复刻使用
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                              <Button 
                                variant="outline"
                                size="icon"
                                onClick={() => copyTemplate(template)}
                                className="border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* 使用统计 */}
                            <p className="text-xs text-slate-400 mt-3 text-center">
                              已使用 {template.usage_count || 0} 次
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <WechatPromo />
    </div>
  );
}
