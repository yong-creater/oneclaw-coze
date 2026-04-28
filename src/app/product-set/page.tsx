'use client';

import { useState } from 'react';
import UtilityHeader from '@/components/common/UtilityHeader';
import ProductSetConfig from '@/components/tools/ProductSetConfig';

/**
 * 电商AI商品套图生成工具
 * 
 * 功能：面向电商卖家的轻量化AI商品视觉生成工具
 * - 左右分栏布局：左侧预览区，右侧配置区
 * - 配置项：目标平台、生图类型、智能文案、生成模式、清晰度、图像比例、生成张数
 * - 仅做配置展示与预览，无提交生成逻辑
 */
export default function ProductSetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <UtilityHeader
        toolIcon={<span className="text-xl">🛍️</span>}
        toolName="电商AI商品套图"
        toolDescription="一键生成全套电商视觉素材"
        gradient="from-orange-500 to-amber-500"
      />
      
      {/* 左侧：预览区 | 右侧：配置区 */}
      <ProductSetConfig />
    </div>
  );
}
