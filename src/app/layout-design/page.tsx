'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { 
  Palette, Upload, Loader2, Download, 
  RefreshCw, Check, AlignLeft, AlignCenter, AlignRight,
  Type, Image as ImageIcon, Copy, Eye, DownloadCloud, Bold, Italic
} from 'lucide-react';
import { toast } from 'sonner';

type LayoutType = 'left-image' | 'right-image' | 'full-width' | 'grid' | 'masonry';
type TextStyle = 'modern' | 'elegant' | 'playful' | 'minimal';

const layouts: { type: LayoutType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'left-image', label: '左图右文', icon: <AlignLeft className="w-4 h-4" />, desc: '图片在左，文字在右' },
  { type: 'right-image', label: '右图左文', icon: <AlignRight className="w-4 h-4" />, desc: '文字在左，图片在右' },
  { type: 'full-width', label: '全宽图片', icon: <DownloadCloud className="w-4 h-4" />, desc: '图片全宽，文字居中' },
  { type: 'grid', label: '网格布局', icon: <AlignCenter className="w-4 h-4" />, desc: '图片网格排列' },
  { type: 'masonry', label: '瀑布流', icon: <Palette className="w-4 h-4" />, desc: '错落瀑布布局' },
];

const textStyles: { type: TextStyle; label: string; fontFamily: string }[] = [
  { type: 'modern', label: '现代简约', fontFamily: 'system-ui' },
  { type: 'elegant', label: '优雅气质', fontFamily: 'Georgia, serif' },
  { type: 'playful', label: '活泼可爱', fontFamily: 'Comic Sans MS, cursive' },
  { type: 'minimal', label: '极简风格', fontFamily: 'Arial, sans-serif' },
];

interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  content: string;
  imageUrl?: string;
}

export default function LayoutDesignPage() {
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [layout, setLayout] = useState<LayoutType>('left-image');
  const [textStyle, setTextStyle] = useState<TextStyle>('modern');
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从 URL 参数读取模板数据
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateContent = params.get('template_content');
    const templateName = params.get('template_name');
    
    if (templateContent) {
      try {
        const data = JSON.parse(decodeURIComponent(templateContent));
        console.log('收到图文排版模板数据:', data, '模板名称:', templateName);
        
        // 如果模板有标题，预填标题
        if (data.title) {
          setTitle(data.title);
        }
        
        // 如果模板有内容，预填内容
        if (data.content) {
          setContent(data.content);
        }
        
        // 如果模板有布局设置，应用布局
        if (data.layout) {
          const matchedLayout = layouts.find(l => 
            l.type === data.layout || l.label.includes(data.layout)
          );
          if (matchedLayout) {
            setLayout(matchedLayout.type);
          }
        }
        
        // 如果模板有文字风格设置，应用风格
        if (data.textStyle || data.style) {
          const styleName = data.textStyle || data.style;
          const matchedStyle = textStyles.find(s => 
            s.type === styleName || s.label.includes(styleName)
          );
          if (matchedStyle) {
            setTextStyle(matchedStyle.type);
          }
        }
        
        if (templateName) {
          toast.success('已加载模板 "' + templateName + '"');
        }
      } catch (e) {
        console.error('解析模板数据失败:', e);
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).slice(0, 9 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target?.result as string].slice(0, 9));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (images.length === 0) {
      toast.error('请至少上传一张图片');
      return;
    }

    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }

    setGenerating(true);
    
    try {
      // 使用第一张图片作为参考，生成排版好的图片
      const res = await fetch('/api/images/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: images[0],
          processType: 'layout-design'
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        // 同时生成HTML预览
        const html = generateHtmlPreview();
        setGeneratedHtml(html);
        toast.success('排版生成成功！');
      } else {
        toast.error(data.error || '处理失败，请重试');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('处理失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const generateHtmlPreview = (): string => {
    const style = textStyles.find(s => s.type === textStyle)!;
    const contentBlocks: ContentBlock[] = [
      { id: '1', type: 'text', content: title },
      { id: '2', type: 'text', content: content || '这里是正文内容，可以输入你想要展示的文字...' },
      ...images.map((url, i) => ({ id: `img-${i}`, type: 'image' as const, content: '', imageUrl: url })),
    ];

    let imageHtml = '';
    switch (layout) {
      case 'left-image':
        contentBlocks.forEach(block => {
          if (block.type === 'text') {
            imageHtml += `<div class="text-block"><p>${block.content}</p></div>`;
          } else {
            imageHtml += `<div class="image-block left"><img src="${block.imageUrl}" /></div>`;
          }
        });
        break;
      case 'right-image':
        contentBlocks.forEach(block => {
          if (block.type === 'text') {
            imageHtml += `<div class="text-block"><p>${block.content}</p></div>`;
          } else {
            imageHtml += `<div class="image-block right"><img src="${block.imageUrl}" /></div>`;
          }
        });
        break;
      case 'full-width':
        imageHtml = `<div class="full-width"><img src="${images[0]}" /></div>`;
        imageHtml += `<div class="text-block centered"><h1>${title}</h1><p>${content}</p></div>`;
        break;
      case 'grid':
        imageHtml = '<div class="image-grid">';
        images.forEach(url => {
          imageHtml += `<img src="${url}" />`;
        });
        imageHtml += '</div>';
        imageHtml += `<div class="text-block"><h1>${title}</h1><p>${content}</p></div>`;
        break;
      case 'masonry':
        imageHtml = '<div class="masonry">';
        images.forEach((url, i) => {
          const isWide = i % 3 === 0;
          imageHtml += `<div class="masonry-item ${isWide ? 'wide' : ''}"><img src="${url}" /></div>`;
        });
        imageHtml += '</div>';
        imageHtml += `<div class="text-block"><h1>${title}</h1><p>${content}</p></div>`;
        break;
    }

    return `
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${style.fontFamily}; background: #fff; padding: 20px; max-width: 800px; margin: 0 auto; }
  .container { display: flex; flex-direction: column; gap: 20px; }
  .text-block { padding: 20px; }
  .text-block h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 12px; font-weight: bold; }
  .text-block p { font-size: 16px; color: #666; line-height: 1.8; }
  .text-block.centered { text-align: center; }
  .image-block { padding: 10px; }
  .image-block.left { order: -1; }
  .image-block.right { order: 1; }
  .image-block img { width: 100%; border-radius: 12px; }
  .full-width img { width: 100%; border-radius: 12px; }
  .image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .image-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; }
  .masonry { columns: 2; gap: 10px; }
  .masonry-item { break-inside: avoid; margin-bottom: 10px; }
  .masonry-item img { width: 100%; border-radius: 8px; }
  .masonry-item.wide { column-span: all; }
</style>
</head>
<body>
  <div class="container">
    ${imageHtml}
  </div>
</body>
</html>`;
  };

  const handleDownloadHtml = () => {
    if (!generatedHtml) return;
    
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layout-design-${Date.now()}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('HTML下载成功');
  };

  const handleCopyHtml = async () => {
    if (!generatedHtml) return;
    
    await navigator.clipboard.writeText(generatedHtml);
    toast.success('HTML已复制到剪贴板');
  };

  const handleReset = () => {
    setImages([]);
    setTitle('');
    setContent('');
    setGeneratedHtml(null);
    setGeneratedImageUrl(null);
  };

  const handleDownloadImage = async () => {
    if (!generatedImageUrl) return;
    
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `layout-design-${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('图片下载成功');
    } catch {
      toast.error('下载失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Palette className="w-4 h-4" />}
        toolName="图文排版"
        toolDescription="AI自动排版，一键导出"
        gradient="from-green-500 to-emerald-500"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium mb-4">
            <Palette className="w-4 h-4" />
            图文排版
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            AI智能图文排版工具
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            上传图片，输入文字，AI自动排版
          </p>
        </div>

        {/* 图片上传 */}
        <Card className="mb-6 border-green-100 dark:border-green-900/30">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-500" />
              上传图片（最多9张）
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {images.length < 9 && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
                     onClick={() => fileInputRef.current?.click()}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-center text-slate-400">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">添加图片</span>
                  </div>
                </div>
              )}
            </div>
            
            {images.length > 0 && (
              <p className="text-sm text-slate-500 text-center">{images.length}/9 张图片已上传</p>
            )}
          </CardContent>
        </Card>

        {/* 内容输入 */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                <Bold className="w-4 h-4" />
                标题 *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入文章标题"
                className="text-lg"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-2">
                <Type className="w-4 h-4" />
                正文内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入正文内容..."
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl resize-none h-32 bg-white dark:bg-slate-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* 布局选择 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-green-500" />
              选择布局
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {layouts.map(item => (
                <button
                  key={item.type}
                  onClick={() => setLayout(item.type)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    layout === item.type
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    layout === item.type ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-medium ${layout === item.type ? 'text-green-700 dark:text-green-400' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 文字风格 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Italic className="w-5 h-5 text-green-500" />
              文字风格
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {textStyles.map(style => (
                <button
                  key={style.type}
                  onClick={() => setTextStyle(style.type)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    textStyle === style.type
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-lg ${textStyle === style.type ? 'text-green-700' : 'text-slate-500'}`} style={{ fontFamily: style.fontFamily }}>
                    Aa
                  </span>
                  <span className={`block text-xs mt-2 ${textStyle === style.type ? 'text-green-700 dark:text-green-400' : 'text-slate-500'}`}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 生成按钮 */}
        {!generatedImageUrl && (
          <Button 
            onClick={handleGenerate}
            disabled={generating || images.length === 0 || !title.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI排版中...
              </>
            ) : (
              <>
                <Palette className="w-5 h-5 mr-2" />
                生成排版
              </>
            )}
          </Button>
        )}

        {/* 生成结果 */}
        {generatedImageUrl && (
          <>
            <Card className="mb-4 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-700 dark:text-green-400">排版完成</h3>
                      <p className="text-sm text-slate-500">点击下方按钮导出</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新排版
                  </Button>
                </div>
              </CardContent>
            </Card>

        {/* 预览 */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-500" />
                    AI生成效果
                  </h3>
                  {generatedImageUrl && (
                    <Button variant="outline" size="sm" onClick={handleDownloadImage}>
                      <Download className="w-4 h-4 mr-2" />
                      下载图片
                    </Button>
                  )}
                </div>
                {generatedImageUrl ? (
                  <img 
                    src={generatedImageUrl} 
                    alt="生成的排版图片" 
                    className="w-full rounded-xl"
                  />
                ) : (
                  <div 
                    className="bg-white rounded-xl p-4 max-h-96 overflow-auto border border-slate-200"
                    dangerouslySetInnerHTML={{ __html: generatedHtml.replace(/<!DOCTYPE html>[\s\S]*?<body>/, '').replace(/<\/body><\/html>/, '') }}
                  />
                )}
              </CardContent>
            </Card>

            {/* 导出选项 */}
            <div className="flex gap-3">
              <Button 
                onClick={handleDownloadHtml}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Download className="w-4 h-4 mr-2" />
                下载HTML
              </Button>
              <Button 
                variant="outline"
                onClick={handleCopyHtml}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制代码
              </Button>
            </div>
          </>
        )}

        {/* 功能说明 */}
        <div className="grid grid-cols-4 gap-4 mt-8 mb-8">
          {[
            { title: '多图支持', desc: '最多9张图', icon: <ImageIcon className="w-5 h-5" /> },
            { title: '多种布局', desc: '5种布局', icon: <AlignLeft className="w-5 h-5" /> },
            { title: '风格多样', desc: '4种字体', icon: <Type className="w-5 h-5" /> },
            { title: '一键导出', desc: 'HTML代码', icon: <Download className="w-5 h-5" /> },
          ].map((item, i) => (
            <Card key={i} className="border-green-100 dark:border-green-900/30">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <WechatPromo />
      </div>
    </div>
  );
}
