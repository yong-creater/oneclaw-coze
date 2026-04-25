'use client';

import { useState, useCallback } from 'react';
import { 
  ChefHat, Download, Loader2, Upload,
  Image as ImageIcon, Type, Wand2, 
  RefreshCw, Check, Star, Palette,
  FileText, Printer, Sparkles
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ==================== 类型定义 ====================
type GenerateMode = 'image' | 'text';

interface GeneratedMenu {
  id: string;
  url: string;
  style: string;
  timestamp: number;
}

// ==================== 常量 ====================
const MENU_STYLES = [
  { id: 'ins', name: 'Ins简约风', colors: ['#f5f5f5', '#333333', '#ff6b6b'] },
  { id: 'chinese', name: '国潮中国风', colors: ['#c0392b', '#f39c12', '#2c3e50'] },
  { id: 'vintage', name: '复古港风', colors: ['#d4a574', '#5d4e37', '#f5e6d3'] },
  { id: 'minimal', name: '极简黑白', colors: ['#ffffff', '#000000', '#808080'] },
];

const MENU_SIZES = [
  { value: 'a4', label: 'A4单页', icon: '📄' },
  { value: 'a5', label: 'A5折页', icon: '📋' },
  { value: 'card', label: '台卡桌卡', icon: '🪧' },
];

// ==================== 主组件 ====================
export default function RestaurantMenuGenerator() {
  const [mode, setMode] = useState<GenerateMode>('image');
  
  // 图片模式
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // 文字模式
  const [menuText, setMenuText] = useState('');
  
  // 通用设置
  const [selectedStyle, setSelectedStyle] = useState('ins');
  const [selectedSize, setSelectedSize] = useState('a4');
  const [generating, setGenerating] = useState(false);
  const [generatedMenus, setGeneratedMenus] = useState<GeneratedMenu[]>([]);

  // 上传图片
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // 生成菜单
  const handleGenerate = async () => {
    if (mode === 'image' && !uploadedImage) {
      alert('请先上传菜单图片');
      return;
    }
    if (mode === 'text' && !menuText.trim()) {
      alert('请输入菜品内容');
      return;
    }

    setGenerating(true);
    
    // 模拟生成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newMenu: GeneratedMenu = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/800/1100`,
      style: selectedStyle,
      timestamp: Date.now(),
    };
    
    setGeneratedMenus([newMenu, ...generatedMenus]);
    setGenerating(false);
  };

  // 导出菜单
  const handleDownload = useCallback((menu: GeneratedMenu) => {
    const link = document.createElement('a');
    link.href = menu.url;
    link.download = `菜单_${menu.style}_${menu.timestamp}.png`;
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<ChefHat className="w-4 h-4" />}
        toolName="餐饮菜单生成器"
        toolDescription="上传图片一键优化，或输入文字自动生成精美菜单"
        gradient="from-orange-500 to-amber-500"
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 模式切换 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex">
            <button
              onClick={() => setMode('image')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'image'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              图片优化
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'text'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Type className="w-4 h-4" />
              文字生成
            </button>
          </div>
        </div>

        {/* 图片模式 */}
        {mode === 'image' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              上传现有菜单图片
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              上传你现有的菜单图片，AI将一键优化排版和视觉效果
            </p>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {uploadedImage ? (
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="上传的菜单" 
                    className="max-h-64 mx-auto rounded-lg shadow-md" 
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 mb-1">点击上传菜单图片</p>
                  <p className="text-xs text-slate-400">支持 JPG、PNG 格式</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 文字模式 */}
        {mode === 'text' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-orange-500" />
              输入菜品内容
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              输入菜品名称和价格，一键生成精美菜单
            </p>
            
            <textarea
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
              placeholder={`示例格式：
招牌奶茶 | ¥18
珍珠奶茶 | ¥15
椰椰芋泥 | ¥22

水果茶系列
鲜橙百香果 | ¥20
西瓜椰椰 | ¥18`}
              rows={10}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-400 focus:outline-none focus:border-orange-500 transition-colors text-sm text-slate-800 dark:text-slate-200 resize-none font-mono"
            />
            
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Star className="w-3 h-3" />
              <span>使用 | 分隔菜品名和价格</span>
            </div>
          </div>
        )}

        {/* 风格选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-orange-500" />
            选择菜单风格
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {MENU_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {style.colors.map((color, i) => (
                    <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className={`text-sm font-medium ${
                  selectedStyle === style.id ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {style.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 尺寸选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-500" />
            选择打印尺寸
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {MENU_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setSelectedSize(size.value)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedSize === size.value
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                <span className="text-2xl mb-1 block">{size.icon}</span>
                <p className={`text-sm font-medium ${
                  selectedSize === size.value ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {size.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={generating || (mode === 'image' && !uploadedImage) || (mode === 'text' && !menuText.trim())}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-base font-medium shadow-lg shadow-orange-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI正在生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              {mode === 'image' ? '一键优化菜单' : '一键生成菜单'}
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedMenus.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              生成的菜单
              <Badge variant="secondary" className="ml-2">{generatedMenus.length}</Badge>
            </h3>
            
            <div className="space-y-4">
              {generatedMenus.map((menu) => (
                <div key={menu.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
                  <img
                    src={menu.url}
                    alt="生成的菜单"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/90 hover:bg-white"
                        onClick={() => handleDownload(menu)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/90 hover:bg-white"
                        onClick={handleGenerate}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        重新生成
                      </Button>
                    </div>
                  </div>
                  <Badge className="absolute top-2 left-2 bg-black/50 text-white">
                    {MENU_STYLES.find(s => s.id === menu.style)?.name}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 登录提示 */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">登录解锁高清无水印</p>
              <p className="text-xs text-slate-500">商用授权、批量生成</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
