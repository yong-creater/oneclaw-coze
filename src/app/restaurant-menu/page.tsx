'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Coffee, RefreshCw, Download, Check, ChevronRight, Upload, Plus, Trash2
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

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Check className="w-4 h-4 text-green-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

export default function RestaurantMenuPage() {
  const [step, setStep] = useState<'upload' | 'edit' | 'result'>('upload');
  const [menuStyle, setMenuStyle] = useState('elegant');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 1, name: '', price: '' }
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStep('edit');
      setToast('菜品图片已上传');
    }
  };

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
    if (!hasContent) {
      setToast('请至少添加一个菜品');
      return;
    }
    setStep('result');
    setToast('菜单生成成功！');
  };

  const handleReset = () => {
    setMenuStyle('elegant');
    setMenuItems([{ id: 1, name: '', price: '' }]);
    setStep('upload');
  };

  const style = MENU_STYLES.find(s => s.id === menuStyle);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-center gap-4 mb-8">
          {['上传菜品', '编辑菜单', '生成菜单'].map((label, idx) => {
            const steps = ['upload', 'edit', 'result'];
            const s = steps[idx];
            const isActive = step === s;
            const isDone = steps.indexOf(step) > idx;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{label}</span>
                {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {step === 'upload' && (
          <div className="max-w-md mx-auto">
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">上传菜品图片</h3>
              <p className="text-sm text-slate-500 mb-4">上传菜品照片，AI自动识别生成菜单</p>
              <p className="text-xs text-slate-400">支持 JPG、PNG 格式</p>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => setStep('edit')} className="text-amber-500 hover:text-amber-600 text-sm">
                没有图片？直接创建菜单
              </button>
            </div>
          </div>
        )}

        {step === 'edit' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">选择菜单风格</h3>
              <div className="grid grid-cols-4 gap-3">
                {MENU_STYLES.map(s => (
                  <button key={s.id} onClick={() => setMenuStyle(s.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${menuStyle === s.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${s.color} mb-2`} />
                    <div className="text-sm font-medium text-slate-800">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">添加菜品</h3>
                <button onClick={addMenuItem} className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-600">
                  <Plus className="w-4 h-4" />添加
                </button>
              </div>
              <div className="space-y-3">
                {menuItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-500">{idx + 1}</span>
                    <input type="text" value={item.name} onChange={e => updateMenuItem(item.id, 'name', e.target.value)}
                      placeholder="菜品名称" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400" />
                    <input type="text" value={item.price} onChange={e => updateMenuItem(item.id, 'price', e.target.value)}
                      placeholder="价格" className="w-24 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400" />
                    <button onClick={() => removeMenuItem(item.id)} className="p-2 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={handleGenerate} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold">
                生成菜单
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className={`max-w-md mx-auto p-8 bg-gradient-to-br ${style?.color} rounded-2xl`}>
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">菜单</h2>
                <div className="space-y-3">
                  {menuItems.filter(item => item.name.trim()).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.price || '¥--'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={handleReset} className="px-6 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />重新制作
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center gap-2">
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
