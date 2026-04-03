'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeftRight, Crown } from 'lucide-react';
import { getCompareTools, saveCompareTools, type CompareTool } from './CompareBar';

interface CompareButtonProps {
  tool: {
    id: number;
    name: string;
    logo: string;
    category_id: number;
    categories?: { name: string };
  };
  isMember?: boolean;
}

// 最大对比数量（游客2，会员3）
const getMaxCompare = (isMember: boolean) => isMember ? 3 : 2;

export default function CompareButton({ tool, isMember = false }: CompareButtonProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disabledReason, setDisabledReason] = useState('');
  const maxCompare = getMaxCompare(isMember);

  // 检查当前状态
  useEffect(() => {
    const checkState = () => {
      const selected = getCompareTools();
      const isThisSelected = selected.some(t => t.id === tool.id);
      setIsSelected(isThisSelected);

      // 如果没选中，检查是否可以添加
      if (!isThisSelected) {
        if (selected.length >= maxCompare) {
          // 已达上限
          setDisabled(true);
          setDisabledReason('已达上限');
        } else if (selected.length > 0 && selected[0].category_id !== tool.category_id) {
          // 不同分类
          setDisabled(true);
          setDisabledReason('需同分类');
        } else {
          setDisabled(false);
          setDisabledReason('');
        }
      } else {
        setDisabled(false);
        setDisabledReason('');
      }
    };

    checkState();

    // 监听变化
    window.addEventListener('compareToolsChanged', checkState);
    return () => window.removeEventListener('compareToolsChanged', checkState);
  }, [tool.id, tool.category_id, maxCompare]);

  // 切换选中状态
  const toggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const selected = getCompareTools();

    if (isSelected) {
      // 移除
      const newTools = selected.filter(t => t.id !== tool.id);
      saveCompareTools(newTools);
    } else {
      // 添加
      if (selected.length >= maxCompare) {
        return;
      }
      if (selected.length > 0 && selected[0].category_id !== tool.category_id) {
        return;
      }

      const newTool: CompareTool = {
        id: tool.id,
        name: tool.name,
        logo: tool.logo,
        category_id: tool.category_id,
        category_name: tool.categories?.name || '',
      };

      saveCompareTools([...selected, newTool]);
    }
  };

  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      size="sm"
      className={`h-7 text-xs gap-1 ${
        isSelected 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : ''
      }`}
      disabled={disabled && !isSelected}
      onClick={toggleCompare}
    >
      <ArrowLeftRight className="w-3 h-3" />
      {isSelected ? '已选' : disabled ? disabledReason : '对比'}
    </Button>
  );
}

// 详情页用的复选框版本
export function CompareCheckbox({ tool, isMember = false }: CompareButtonProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const maxCompare = getMaxCompare(isMember);

  useEffect(() => {
    const checkState = () => {
      const selected = getCompareTools();
      const isThisSelected = selected.some(t => t.id === tool.id);
      setIsSelected(isThisSelected);

      if (!isThisSelected) {
        if (selected.length >= maxCompare) {
          setDisabled(true);
        } else if (selected.length > 0 && selected[0].category_id !== tool.category_id) {
          setDisabled(true);
        } else {
          setDisabled(false);
        }
      } else {
        setDisabled(false);
      }
    };

    checkState();
    window.addEventListener('compareToolsChanged', checkState);
    return () => window.removeEventListener('compareToolsChanged', checkState);
  }, [tool.id, tool.category_id, maxCompare]);

  const toggleCompare = () => {
    const selected = getCompareTools();

    if (isSelected) {
      const newTools = selected.filter(t => t.id !== tool.id);
      saveCompareTools(newTools);
    } else {
      if (selected.length >= maxCompare) return;
      if (selected.length > 0 && selected[0].category_id !== tool.category_id) return;

      const newTool: CompareTool = {
        id: tool.id,
        name: tool.name,
        logo: tool.logo,
        category_id: tool.category_id,
        category_name: tool.categories?.name || '',
      };

      saveCompareTools([...selected, newTool]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`compare-${tool.id}`}
        checked={isSelected}
        disabled={disabled && !isSelected}
        onCheckedChange={toggleCompare}
        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
      />
      <label
        htmlFor={`compare-${tool.id}`}
        className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1"
      >
        <ArrowLeftRight className="w-4 h-4" />
        加入对比
        {!isMember && <Crown className="w-3 h-3 text-orange-500" />}
      </label>
      {disabled && !isSelected && (
        <span className="text-xs text-slate-400">
          {maxCompare === 2 ? '（会员可对比3款）' : '已达上限'}
        </span>
      )}
    </div>
  );
}
