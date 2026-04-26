'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackToHome from '@/components/common/BackToHome';
import WechatPromo from '@/components/common/WechatPromo';
import UtilityHeader from '@/components/common/UtilityHeader';
import { Sparkles, Upload, Loader2, Download, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductPhotoPage() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = () => {
    toast.success('功能开发中，敬请期待！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<Image className="w-4 h-4" />}
        toolName="商品图精修"
        toolDescription="AI智能电商商品图精修"
        gradient="from-amber-500 to-orange-500"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackToHome />
        
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            商品图精修
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            AI智能电商商品图一键精修
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            去褶皱 / 提亮度 / 去瑕疵 / 优化背景
          </p>
        </div>

        <Card className="mb-8 border-amber-100 dark:border-amber-900/30">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Image className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              功能即将上线
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              AI智能识别品类，一键精修电商商品图
            </p>
            <Button
              onClick={handleUpload}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              敬请期待
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { title: '服饰精修', desc: '抚平褶皱、提亮色彩' },
            { title: '美妆优化', desc: '提亮色彩、修正肤色' },
            { title: '批量处理', desc: '支持20张同时精修' },
          ].map((item, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
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
