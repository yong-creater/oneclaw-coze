'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Eye, MousePointer, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  type: string;
}

interface ToolScene {
  scene_no: string;
  user_group: string;
  scene_desc: string;
}

interface ToolFunction {
  func_name: string;
  func_desc: string;
}

interface ToolFAQ {
  question: string;
  answer: string;
}

interface ToolModelConfig {
  default_model: string;
  model_source: string;
  model_price_per_1k_tokens: number;
  is_free: boolean;
  is_active: boolean;
}

interface Tool {
  id: number;
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  short_desc: string;
  full_desc: string;
  use_guide: string;
  category_id: number;
  sub_category_ids: number[];
  feature_tags: string[];
  max_duration: string;
  official_url: string;
  promotion_url: string;
  is_official: boolean;
  is_featured: boolean;
  is_active: boolean;
  advantages: string[];
  limitations: string[];
  commercial_license: string;
  launch_date: string;
  view_count: number;
  click_count: number;
  scenes: ToolScene[];
  functions: ToolFunction[];
  faqs: ToolFAQ[];
  customer_email: string;
  feedback_link: string;
  model_config?: ToolModelConfig;
}

const LICENSE_TYPES = ['可免费商用', '需授权商用', '不可商用'];
const DURATION_OPTIONS = ['30秒', '60秒', '2分钟', '5分钟', '10分钟', '无限制'];

export default function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureTags, setFeatureTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    producer: '',
    highlight: '',
    short_desc: '',
    full_desc: '',
    use_guide: '',
    category_id: '',
    sub_category_ids: [] as number[],
    feature_tags: [] as string[],
    max_duration: '60秒',
    official_url: '',
    promotion_url: '',
    is_official: false,
    is_featured: false,
    is_active: true,
    advantages: ['', '', ''],
    limitations: ['', ''],
    commercial_license: '可免费商用',
    launch_date: new Date().toISOString().split('T')[0],
    scenes: [{ scene_no: '#1', user_group: '', scene_desc: '' }] as ToolScene[],
    functions: [{ func_name: '', func_desc: '' }] as ToolFunction[],
    faqs: [{ question: '', answer: '' }] as ToolFAQ[],
    customer_email: '',
    feedback_link: '',
    model_config: {
      default_model: 'ep-20250312145957-p8xpp',
      model_source: 'coze',
      model_price_per_1k_tokens: 0,
      is_free: true,
      is_active: true,
    },
  });

  // 获取工具数据
  useEffect(() => {
    async function fetchTool() {
      try {
        const res = await fetch(`/api/admin/tools/${id}`);
        const data = await res.json();
        if (data.success) {
          const toolData = data.data;
          setTool(toolData);
          setFormData({
            name: toolData.name || '',
            logo: toolData.logo || '',
            producer: toolData.producer || '',
            highlight: toolData.highlight || '',
            short_desc: toolData.short_desc || '',
            full_desc: toolData.full_desc || '',
            use_guide: toolData.use_guide || '',
            category_id: toolData.category_id?.toString() || '',
            sub_category_ids: toolData.sub_category_ids || [],
            feature_tags: toolData.feature_tags || [],
            max_duration: toolData.max_duration || '60秒',
            official_url: toolData.official_url || '',
            promotion_url: toolData.promotion_url || '',
            is_official: toolData.is_official || false,
            is_featured: toolData.is_featured || false,
            is_active: toolData.is_active !== false,
            advantages: toolData.advantages?.length > 0 
              ? [...toolData.advantages, '', '', ''].slice(0, 3) 
              : ['', '', ''],
            limitations: toolData.limitations?.length > 0 
              ? [...toolData.limitations, ''].slice(0, 2) 
              : ['', ''],
            commercial_license: toolData.commercial_license || '可免费商用',
            launch_date: toolData.launch_date?.split('T')[0] || new Date().toISOString().split('T')[0],
            scenes: toolData.scenes?.length > 0 ? toolData.scenes : [{ scene_no: '#1', user_group: '', scene_desc: '' }],
            functions: toolData.functions?.length > 0 ? toolData.functions : [{ func_name: '', func_desc: '' }],
            faqs: toolData.faqs?.length > 0 ? toolData.faqs : [{ question: '', answer: '' }],
            customer_email: toolData.customer_email || '',
            feedback_link: toolData.feedback_link || '',
            model_config: toolData.model_config || {
              default_model: 'ep-20250312145957-p8xpp',
              model_source: 'coze',
              model_price_per_1k_tokens: 0,
              is_free: true,
              is_active: true,
            },
          });
        } else {
          alert('工具不存在');
          router.push('/admin/tools');
        }
      } catch (error) {
        console.error('获取工具失败:', error);
        alert('获取工具失败');
        router.push('/admin/tools');
      } finally {
        setLoading(false);
      }
    }
    fetchTool();
  }, [id, router]);

  // 获取分类和标签
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/init-data');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data.categories);
          setFeatureTags(data.data.tags.filter((t: Tag) => t.type === 'feature'));
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        id: parseInt(id),
        ...formData,
        category_id: parseInt(formData.category_id),
        advantages: formData.advantages.filter(a => a.trim()),
        limitations: formData.limitations.filter(l => l.trim()),
        scenes: formData.scenes.filter(s => s.user_group.trim() && s.scene_desc.trim()),
        functions: formData.functions.filter(f => f.func_name.trim() && f.func_desc.trim()),
        faqs: formData.faqs.filter(f => f.question.trim() && f.answer.trim()),
        launch_date: new Date(formData.launch_date).toISOString(),
      };

      const res = await fetch('/api/admin/tools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        alert('保存成功');
        router.push('/admin/tools');
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个工具吗？此操作不可恢复。')) return;

    try {
      const res = await fetch(`/api/admin/tools?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        alert('删除成功');
        router.push('/admin/tools');
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleFeatureTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      feature_tags: prev.feature_tags.includes(tag)
        ? prev.feature_tags.filter(t => t !== tag)
        : [...prev.feature_tags, tag]
    }));
  };

  // 场景管理
  const addScene = () => {
    setFormData(prev => ({
      ...prev,
      scenes: [...prev.scenes, { scene_no: `#${prev.scenes.length + 1}`, user_group: '', scene_desc: '' }]
    }));
  };

  const updateScene = (index: number, field: keyof ToolScene, value: string) => {
    setFormData(prev => {
      const newScenes = [...prev.scenes];
      newScenes[index] = { ...newScenes[index], [field]: value };
      return { ...prev, scenes: newScenes };
    });
  };

  const removeScene = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scenes: prev.scenes.filter((_, i) => i !== index).map((s, i) => ({ ...s, scene_no: `#${i + 1}` }))
    }));
  };

  // 功能管理
  const addFunction = () => {
    setFormData(prev => ({
      ...prev,
      functions: [...prev.functions, { func_name: '', func_desc: '' }]
    }));
  };

  const updateFunction = (index: number, field: keyof ToolFunction, value: string) => {
    setFormData(prev => {
      const newFunctions = [...prev.functions];
      newFunctions[index] = { ...newFunctions[index], [field]: value };
      return { ...prev, functions: newFunctions };
    });
  };

  const removeFunction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      functions: prev.functions.filter((_, i) => i !== index)
    }));
  };

  // FAQ管理
  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => {
      const newFAQs = [...prev.faqs];
      newFAQs[index] = { ...newFAQs[index], [field]: value };
      return { ...prev, faqs: newFAQs };
    });
  };

  const removeFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 返回按钮 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/tools"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工具列表
        </Link>

        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          删除工具
        </Button>
      </div>

      {/* 工具统计 */}
      {tool && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex items-center gap-6">
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-16 h-16 rounded-xl object-contain bg-slate-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect fill="%23f97316" width="64" height="64"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${tool.name[0]}</text></svg>`;
              }}
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{tool.name}</h1>
              <p className="text-sm text-slate-500">{tool.producer}</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-slate-500">
                <Eye className="w-4 h-4" />
                <span>{tool.view_count} 浏览</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <MousePointer className="w-4 h-4" />
                <span>{tool.click_count} 点击</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                工具名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                出品方 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.producer}
                onChange={(e) => setFormData(prev => ({ ...prev, producer: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Logo URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                一句话核心亮点 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.highlight}
                onChange={(e) => setFormData(prev => ({ ...prev, highlight: e.target.value }))}
                placeholder="最多15字"
                maxLength={15}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        {/* 描述信息 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">描述信息</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                简短描述（首页展示）
              </label>
              <input
                type="text"
                value={formData.short_desc}
                onChange={(e) => setFormData(prev => ({ ...prev, short_desc: e.target.value }))}
                placeholder="一句话介绍工具用途"
                maxLength={100}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                完整描述（详情页展示）
              </label>
              <Textarea
                value={formData.full_desc}
                onChange={(e) => setFormData(prev => ({ ...prev, full_desc: e.target.value }))}
                placeholder="详细介绍工具的功能、特点和使用场景..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                使用指南
              </label>
              <Textarea
                value={formData.use_guide}
                onChange={(e) => setFormData(prev => ({ ...prev, use_guide: e.target.value }))}
                placeholder="分步骤说明工具的使用方法..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* 分类与价格 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">分类与价格</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                一级分类 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">请选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                生成时长上限
              </label>
              <select
                value={formData.max_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, max_duration: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {DURATION_OPTIONS.map(dur => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 链接设置 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">链接设置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                官网链接 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.official_url}
                onChange={(e) => setFormData(prev => ({ ...prev, official_url: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                推广链接（联盟链接，优先跳转）
              </label>
              <input
                type="url"
                value={formData.promotion_url}
                onChange={(e) => setFormData(prev => ({ ...prev, promotion_url: e.target.value }))}
                placeholder="联盟推广链接（可选）"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                联系邮箱
              </label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                placeholder="用户反馈联系邮箱"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                反馈链接
              </label>
              <input
                type="url"
                value={formData.feedback_link}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback_link: e.target.value }))}
                placeholder="用户反馈表单链接"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* 功能标签 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">功能标签</h2>
          
          <div className="flex flex-wrap gap-2">
            {featureTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleFeatureTagToggle(tag.name)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  formData.feature_tags.includes(tag.name)
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-orange-100'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* 核心优势 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">核心优势（最多3条）</h2>
          
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <input
                key={i}
                type="text"
                value={formData.advantages[i] || ''}
                onChange={(e) => {
                  const newAdv = [...formData.advantages];
                  newAdv[i] = e.target.value;
                  setFormData(prev => ({ ...prev, advantages: newAdv }));
                }}
                placeholder={`优势${i + 1}`}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ))}
          </div>
        </div>

        {/* 局限性 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">局限性（最多2条）</h2>
          
          <div className="space-y-3">
            {[0, 1].map(i => (
              <input
                key={i}
                type="text"
                value={formData.limitations[i] || ''}
                onChange={(e) => {
                  const newLim = [...formData.limitations];
                  newLim[i] = e.target.value;
                  setFormData(prev => ({ ...prev, limitations: newLim }));
                }}
                placeholder={`局限性${i + 1}`}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ))}
          </div>
        </div>

        {/* 适用场景 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">适用场景</h2>
            <Button type="button" variant="outline" size="sm" onClick={addScene}>
              <Plus className="w-4 h-4 mr-1" />
              添加场景
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.scenes.map((scene, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={scene.user_group}
                    onChange={(e) => updateScene(index, 'user_group', e.target.value)}
                    placeholder="适用人群（如：学生/科研人群）"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 
                      bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={scene.scene_desc}
                    onChange={(e) => updateScene(index, 'scene_desc', e.target.value)}
                    placeholder="场景描述"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 
                      bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeScene(index)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 核心功能 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">核心功能</h2>
            <Button type="button" variant="outline" size="sm" onClick={addFunction}>
              <Plus className="w-4 h-4 mr-1" />
              添加功能
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.functions.map((func, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={func.func_name}
                    onChange={(e) => updateFunction(index, 'func_name', e.target.value)}
                    placeholder="功能名称（如：智能搜索）"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 
                      bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={func.func_desc}
                    onChange={(e) => updateFunction(index, 'func_desc', e.target.value)}
                    placeholder="功能描述"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 
                      bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFunction(index)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 常见问题 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">常见问题</h2>
            <Button type="button" variant="outline" size="sm" onClick={addFAQ}>
              <Plus className="w-4 h-4 mr-1" />
              添加FAQ
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.faqs.map((faq, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="text-sm font-medium text-slate-500 mt-2">Q{index + 1}</span>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    placeholder="问题"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 
                      bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeFAQ(index)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-sm font-medium text-slate-500 mt-2">A</span>
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    placeholder="回答"
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 
                      bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 模型配置 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">AI 模型配置</h2>
          <p className="text-sm text-slate-500 mb-4">
            配置该工具调用的 AI 模型。扣子内置模型免费，4sAPI 模型需付费。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                模型来源
              </label>
              <select
                value={formData.model_config.model_source}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  model_config: { 
                    ...prev.model_config, 
                    model_source: e.target.value,
                    is_free: e.target.value === 'coze',
                  }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="coze">扣子内置 (免费)</option>
                <option value="4sapi">4sAPI (付费)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                选择模型
              </label>
              <select
                value={formData.model_config.default_model}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  model_config: { ...prev.model_config, default_model: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {formData.model_config.model_source === 'coze' ? (
                  <>
                    <option value="ep-20250312145957-p8xpp">Doubao-Pro (扣子)</option>
                    <option value="ep-20250410165509-dtk4n">Doubao-Seed (扣子)</option>
                  </>
                ) : (
                  <>
                    <option value="gpt-4o">GPT-4o ($0.0025/1K)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini ($0.00015/1K)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo ($0.01/1K)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet ($0.003/1K)</option>
                    <option value="claude-3-opus">Claude 3 Opus ($0.015/1K)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro ($0.00125/1K)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash ($0.000075/1K)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                价格 (元/千token)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.model_config.model_price_per_1k_tokens}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  model_config: { 
                    ...prev.model_config, 
                    model_price_per_1k_tokens: parseFloat(e.target.value) || 0 
                  }
                }))}
                disabled={formData.model_config.model_source === 'coze'}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500
                  disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                状态
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.model_config.is_active}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      model_config: { ...prev.model_config, is_active: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">启用</span>
                </label>
                {formData.model_config.is_free ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    免费
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    付费
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 其他设置 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">其他设置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                商用授权
              </label>
              <select
                value={formData.commercial_license}
                onChange={(e) => setFormData(prev => ({ ...prev, commercial_license: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {LICENSE_TYPES.map(lic => (
                  <option key={lic} value={lic}>{lic}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                上线日期
              </label>
              <input
                type="date"
                value={formData.launch_date}
                onChange={(e) => setFormData(prev => ({ ...prev, launch_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_official}
                onChange={(e) => setFormData(prev => ({ ...prev, is_official: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">官方认证</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">首页推荐</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">上架显示</span>
            </label>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/tools">
            <Button variant="outline" type="button">取消</Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存修改'}
          </Button>
        </div>
      </form>
    </div>
  );
}
