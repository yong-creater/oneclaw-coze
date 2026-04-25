'use client';

import { useState, useCallback } from 'react';
import { 
  Coffee, Download, Loader2, 
  Image as ImageIcon, Menu, 
  Copy, Check, RefreshCw, Wand2, Star,
  Plus, Type, Trash2, Upload, 
  BookOpen, Pizza, IceCream, Apple, 
  Soup, Wine, Cookie, ChefHat,
  FileText, Printer, DollarSign, QrCode, Palette
} from 'lucide-react';
import LoginButton from '@/components/common/LoginButton';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ==================== 类型定义 ====================
interface MenuCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface MenuItem {
  name: string;
  price: string;
  description?: string;
}

interface MenuStyle {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

interface GeneratedMenu {
  id: string;
  url: string;
  style: string;
  category: string;
  timestamp: number;
}

// ==================== 常量 ====================
const RESTAURANT_TYPES = [
  { id: 'bubble-tea', name: '奶茶饮品', icon: <Coffee className="w-5 h-5" /> },
  { id: 'bbq', name: '烧烤火锅', icon: <Soup className="w-5 h-5" /> },
  { id: 'fast-food', name: '快餐小吃', icon: <Pizza className="w-5 h-5" /> },
  { id: 'bakery', name: '烘焙甜品', icon: <Cookie className="w-5 h-5" /> },
  { id: 'fruit', name: '水果捞', icon: <Apple className="w-5 h-5" /> },
  { id: 'dessert', name: '冰淇淋', icon: <IceCream className="w-5 h-5" /> },
  { id: 'coffee', name: '咖啡茶饮', icon: <Wine className="w-5 h-5" /> },
  { id: 'noodle', name: '面馆粉店', icon: <Soup className="w-5 h-5" /> },
];

const MENU_STYLES: MenuStyle[] = [
  { id: 'ins', name: 'Ins简约风', description: '简洁ins风，年轻时尚', colors: ['#f5f5f5', '#333333', '#ff6b6b'] },
  { id: 'chinese', name: '国潮中国风', description: '传统中国元素，喜庆大气', colors: ['#c0392b', '#f39c12', '#2c3e50'] },
  { id: 'vintage', name: '复古港风', description: '怀旧港式茶餐厅风格', colors: ['#d4a574', '#5d4e37', '#f5e6d3'] },
  { id: 'minimal', name: '极简黑白', description: '高级感黑白极简', colors: ['#ffffff', '#000000', '#808080'] },
  { id: 'fresh', name: '清新自然', description: '绿色系健康风格', colors: ['#55efc4', '#00b894', '#81ecec'] },
  { id: 'warm', name: '温暖暖色', description: '暖色调温馨亲切', colors: ['#ffb347', '#ff6b6b', '#feca57'] },
];

const MENU_SIZES = [
  { value: 'a4', label: 'A4单页', ratio: '3:4', size: '210×297mm' },
  { value: 'a5', label: 'A5折页', ratio: '3:4', size: '148×210mm' },
  { value: 'card', label: '台卡桌卡', ratio: '1:2', size: '100×200mm' },
  { value: 'poster', label: '海报大版', ratio: '3:4', size: 'A3' },
];

const DEFAULT_CATEGORIES = ['招牌推荐', '人气热销', '新品上市', '特惠套餐', '主食', '小食', '饮品', '甜品'];

// ==================== 主组件 ====================
export default function RestaurantMenuGenerator() {
  const [activeTab, setActiveTab] = useState<'category' | 'theme'>('category');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('ins');
  const [selectedSize, setSelectedSize] = useState<string>('a4');
  const [storeName, setStoreName] = useState('');
  const [storeSlogan, setStoreSlogan] = useState('');
  
  // 菜品分类
  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: '1', name: '招牌推荐', icon: <Star className="w-4 h-4" />, items: [{ name: '', price: '' }] },
  ]);
  
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [uploadedQrCode, setUploadedQrCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedMenus, setGeneratedMenus] = useState<GeneratedMenu[]>([]);
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // 添加分类
  const handleAddCategory = useCallback(() => {
    const newCategory: MenuCategory = {
      id: Date.now().toString(),
      name: DEFAULT_CATEGORIES[categories.length] || `分类${categories.length + 1}`,
      icon: <BookOpen className="w-4 h-4" />,
      items: [{ name: '', price: '' }],
    };
    setCategories([...categories, newCategory]);
  }, [categories]);

  // 删除分类
  const handleDeleteCategory = useCallback((categoryId: string) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter(c => c.id !== categoryId));
  }, [categories]);

  // 更新分类名称
  const handleCategoryNameChange = useCallback((categoryId: string, name: string) => {
    setCategories(categories.map(c => c.id === categoryId ? { ...c, name } : c));
  }, [categories]);

  // 添加菜品
  const handleAddItem = useCallback((categoryId: string) => {
    setCategories(categories.map(c => {
      if (c.id === categoryId) {
        return { ...c, items: [...c.items, { name: '', price: '' }] };
      }
      return c;
    }));
  }, [categories]);

  // 删除菜品
  const handleDeleteItem = useCallback((categoryId: string, itemIndex: number) => {
    setCategories(categories.map(c => {
      if (c.id === categoryId && c.items.length > 1) {
        return { ...c, items: c.items.filter((_, i) => i !== itemIndex) };
      }
      return c;
    }));
  }, [categories]);

  // 更新菜品
  const handleItemChange = useCallback((categoryId: string, itemIndex: number, field: 'name' | 'price', value: string) => {
    setCategories(categories.map(c => {
      if (c.id === categoryId) {
        const newItems = [...c.items];
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
        return { ...c, items: newItems };
      }
      return c;
    }));
  }, [categories]);

  // 生成菜单
  const handleGenerate = async () => {
    if (!storeName) {
      alert('请输入店铺名称');
      return;
    }
    
    const hasItems = categories.some(c => c.items.some(item => item.name || item.price));
    if (!hasItems) {
      alert('请至少添加一个菜品');
      return;
    }

    setGenerating(true);
    
    // 模拟生成
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const newMenu: GeneratedMenu = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/800/1200`,
      style: selectedStyle,
      category: selectedType,
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

  const currentStyle = MENU_STYLES.find(s => s.id === selectedStyle);
  const currentType = RESTAURANT_TYPES.find(t => t.id === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      <UtilityHeader
        toolIcon={<ChefHat className="w-4 h-4" />}
        toolName="餐饮菜单生成器"
        toolDescription="餐饮门店菜单/价目表一键生成，零设计基础也能做出高级感菜单"
        gradient="from-orange-500 to-amber-500"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 工具类型选择 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Menu className="w-4 h-4 text-orange-500" />
            选择餐饮品类
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RESTAURANT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedType === type.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                <div className={`${selectedType === type.id ? 'text-orange-500' : 'text-slate-400'}`}>
                  {type.icon}
                </div>
                <span className={`text-sm font-medium ${
                  selectedType === type.id ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {type.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab切换 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('category')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'category'
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Type className="w-4 h-4 inline mr-2" />
              手动输入菜品
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'theme'
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              模板快速生成
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'category' ? (
              <div className="space-y-6">
                {/* 店铺信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      店铺名称 *
                    </label>
                    <Input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="请输入店铺名称"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      店铺口号
                    </label>
                    <Input
                      value={storeSlogan}
                      onChange={(e) => setStoreSlogan(e.target.value)}
                      placeholder="如：美味从这里开始"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      联系电话
                    </label>
                    <Input
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      placeholder="请输入联系电话"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      店铺地址
                    </label>
                    <Input
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="请输入店铺地址"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Logo和二维码 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      店铺Logo
                    </label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
                      {uploadedLogo ? (
                        <div className="relative">
                          <img src={uploadedLogo} alt="Logo" className="w-20 h-20 object-contain mx-auto rounded-lg" />
                          <button
                            onClick={() => setUploadedLogo(null)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">点击上传Logo</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      微信/外卖二维码
                    </label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
                      {uploadedQrCode ? (
                        <div className="relative">
                          <img src={uploadedQrCode} alt="二维码" className="w-20 h-20 object-contain mx-auto rounded-lg" />
                          <button
                            onClick={() => setUploadedQrCode(null)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <QrCode className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">点击上传二维码</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 菜品分类 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      菜品分类
                    </label>
                    <Button onClick={handleAddCategory} size="sm" variant="outline" className="border-orange-300 text-orange-500">
                      <Plus className="w-4 h-4 mr-1" />
                      添加分类
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {categories.map((category, catIndex) => (
                      <div key={category.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-orange-500">{category.icon}</span>
                          <Input
                            value={category.name}
                            onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                            className="w-32 font-medium bg-white dark:bg-slate-800"
                          />
                          {categories.length > 1 && (
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-2">
                              <Input
                                value={item.name}
                                onChange={(e) => handleItemChange(category.id, itemIndex, 'name', e.target.value)}
                                placeholder="菜品名称"
                                className="flex-1 bg-white dark:bg-slate-800"
                              />
                              <Input
                                value={item.price}
                                onChange={(e) => handleItemChange(category.id, itemIndex, 'price', e.target.value)}
                                placeholder="价格"
                                className="w-24 bg-white dark:bg-slate-800"
                              />
                              <span className="text-slate-400 text-sm">元</span>
                              {category.items.length > 1 && (
                                <button
                                  onClick={() => handleDeleteItem(category.id, itemIndex)}
                                  className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => handleAddItem(category.id)}
                            className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            添加菜品
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h4 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                  模板功能开发中
                </h4>
                <p className="text-sm text-slate-500">
                  即将上线奶茶、烧烤、烘焙等20+品类的爆款菜单模板
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 风格与尺寸 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className={`text-sm font-medium ${
                    selectedStyle === style.id ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {style.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{style.description}</p>
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
            <div className="grid grid-cols-2 gap-3">
              {MENU_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(size.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedSize === size.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                  }`}
                >
                  <div className={`text-center py-2 mb-2 rounded-lg ${
                    selectedSize === size.value ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    <FileText className={`w-6 h-6 mx-auto ${
                      selectedSize === size.value ? 'text-orange-500' : 'text-slate-400'
                    }`} />
                  </div>
                  <p className={`text-sm font-medium ${
                    selectedSize === size.value ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {size.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{size.size}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          disabled={generating || !storeName}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-base font-medium shadow-lg shadow-orange-500/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              正在生成精美菜单...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              一键生成菜单
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedMenus.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              生成的菜单
              <Badge variant="secondary" className="ml-2">{generatedMenus.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedMenus.map((menu) => (
                <div key={menu.id} className="relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
                  <img
                    src={menu.url}
                    alt="生成的菜单"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="bg-white/90" onClick={() => handleDownload(menu)}>
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/90" onClick={handleGenerate}>
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

        {/* 提示 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4" />
            使用提示
          </h4>
          <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
            <li>• 生成的菜单支持直接发给广告店印刷</li>
            <li>• 可添加店铺Logo和二维码，提升品牌形象</li>
            <li>• 支持A4/A5/台卡等多种打印尺寸</li>
            <li>• 批量生成多版本菜单，可用于不同渠道</li>
          </ul>
        </div>

        {/* 登录提示 */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">登录后享受更多权益</p>
              <p className="text-xs text-slate-500">高清无水印下载、商用授权、批量生成</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
