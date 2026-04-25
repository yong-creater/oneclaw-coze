'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Coffee, RefreshCw, Download, Check, Plus, Trash2, Sparkles, Wand2
} from 'lucide-react';
import Footer from '@/components/common/Footer';

const MENU_STYLES = [
  { id: 'elegant', name: '典雅风格', color: 'from-amber-100 to-orange-200' },
  { id: 'simple', name: '简约风格', color: 'from-slate-100 to-gray-200' },
  { id: 'vintage', name: '复古风格', color: 'from-yellow-100 to-amber-200' },
  { id: 'fresh', name: '清新风格', color: 'from-green-100 to-emerald-200' },
];

interface MenuItem {
  id: number;
  name: string;
  price: string;
}

export default function RestaurantMenuPage() {
  const [menuStyle, setMenuStyle] = useState('elegant');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 1, name: '', price: '' }
  ]);
  const [isGenerated, setIsGenerated] = useState(false);

  const addMenuItem = () => {
    setMenuItems([...menuItems, { id: Date.now(), name: '', price: '' }]);
  };

  const removeMenuItem = (id: number) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const updateMenuItem = (id: number, field: 'name' | 'price', value: string) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleGenerate = () => {
    const hasContent = menuItems.some(item => item.name.trim());
    if (!hasContent) return;
    setIsGenerated(true);
  };

  const handleReset = () => {
    setMenuStyle('elegant');
    setMenuItems([{ id: 1, name: '', price: '' }]);
    setIsGenerated(false);
  };

  const style = MENU_STYLES.find(s => s.id === menuStyle);
  const validItems = menuItems.filter(item => item.name.trim());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">餐饮菜单</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 pb-24">
        
        {/* 风格选择 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            选择菜单风格
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {MENU_STYLES.map(s => (
              <button key={s.id} onClick={() => setMenuStyle(s.id)}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${menuStyle === s.id ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-full h-10 rounded-lg bg-gradient-to-br ${s.color} mb-2`} />
                <div className="text-sm font-medium text-slate-800">{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 菜品列表 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-500" />
              添加菜品
            </h3>
            <button onClick={addMenuItem} className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-600 font-medium">
              <Plus className="w-4 h-4" />添加
            </button>
          </div>
          <div className="space-y-3">
            {menuItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm text-amber-600 font-medium">{idx + 1}</span>
                <input type="text" value={item.name} onChange={e => { updateMenuItem(item.id, 'name', e.target.value); setIsGenerated(false); }}
                  placeholder="菜品名称" className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors" />
                <input type="text" value={item.price} onChange={e => updateMenuItem(item.id, 'price', e.target.value)}
                  placeholder="¥价格" className="w-28 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors" />
                <button onClick={() => removeMenuItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 预览 */}
        {validItems.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">菜单预览</h3>
            <div className={`max-w-md mx-auto p-8 bg-gradient-to-br ${style?.color} rounded-2xl shadow-inner`}>
              <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">菜单</h2>
              <div className="space-y-3">
                {validItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.price || '¥--'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={handleReset}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />重新制作
          </button>
          <button onClick={handleGenerate} disabled={validItems.length === 0}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all ${
              validItems.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-xl'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}>
            <Check className="w-5 h-5" />一键生成
          </button>
        </div>

        {/* 生成成功 */}
        {isGenerated && (
          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full">
              <Check className="w-5 h-5" />
              <span className="font-medium">菜单已生成！</span>
            </div>
            <div className="mt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 flex items-center gap-2 mx-auto shadow-lg">
                <Download className="w-5 h-5" />下载菜单
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
