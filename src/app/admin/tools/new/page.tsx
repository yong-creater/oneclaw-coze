'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

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

const FREE_TYPES = ['完全免费', '免费额度', '限时免费', '付费工具'];
const LICENSE_TYPES = ['可免费商用', '需授权商用', '不可商用'];

export default function NewToolPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureTags, setFeatureTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    producer: '',
    highlight: '',
    category_id: '',
    sub_category_ids: [] as number[],
    free_type: '免费额度',
    free_quota_desc: '',
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
  });

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
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        advantages: formData.advantages.filter(a => a.trim()),
        limitations: formData.limitations.filter(l => l.trim()),
        launch_date: new Date(formData.launch_date).toISOString(),
      };

      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/tools');
      } else {
        alert('创建失败: ' + data.error);
      }
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Link
        href="/admin/tools"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回工具列表
      </Link>

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
                免费类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.free_type}
                onChange={(e) => setFormData(prev => ({ ...prev, free_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                {FREE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {formData.free_type === '免费额度' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  免费额度说明 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.free_quota_desc}
                  onChange={(e) => setFormData(prev => ({ ...prev, free_quota_desc: e.target.value }))}
                  placeholder="如：每日免费生成5条1080P视频"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                    bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                生成时长上限 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.max_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, max_duration: e.target.value }))}
                placeholder="如：60秒、10分钟"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                商用授权说明 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.commercial_license}
                onChange={(e) => setFormData(prev => ({ ...prev, commercial_license: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                {LICENSE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.feature_tags.includes(tag.name)
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* 链接 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">链接设置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                官网直达链接 <span className="text-red-500">*</span>
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
                专属推广链接
              </label>
              <input
                type="url"
                value={formData.promotion_url}
                onChange={(e) => setFormData(prev => ({ ...prev, promotion_url: e.target.value }))}
                placeholder="联盟推广链接，优先于官网链接"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                  bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* 优劣势 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">核心优势与局限性</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                核心优势（最多3条）
              </label>
              {[0, 1, 2].map(i => (
                <input
                  key={i}
                  type="text"
                  value={formData.advantages[i] || ''}
                  onChange={(e) => {
                    const newAdvantages = [...formData.advantages];
                    newAdvantages[i] = e.target.value;
                    setFormData(prev => ({ ...prev, advantages: newAdvantages }));
                  }}
                  placeholder={`优势${i + 1}（最多20字）`}
                  maxLength={20}
                  className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-200 dark:border-slate-700 
                    bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                局限性（最多2条）
              </label>
              {[0, 1].map(i => (
                <input
                  key={i}
                  type="text"
                  value={formData.limitations[i] || ''}
                  onChange={(e) => {
                    const newLimitations = [...formData.limitations];
                    newLimitations[i] = e.target.value;
                    setFormData(prev => ({ ...prev, limitations: newLimitations }));
                  }}
                  placeholder={`局限${i + 1}（最多20字）`}
                  maxLength={20}
                  className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-200 dark:border-slate-700 
                    bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 状态设置 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">状态设置</h2>
          
          <div className="flex flex-wrap gap-6">
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
              <span className="text-sm text-slate-700 dark:text-slate-300">上架</span>
            </label>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              上线时间
            </label>
            <input
              type="date"
              value={formData.launch_date}
              onChange={(e) => setFormData(prev => ({ ...prev, launch_date: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/tools"
            className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
              text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-orange-500 text-white 
              font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
