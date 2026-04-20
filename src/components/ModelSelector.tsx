'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// 模型分组接口
export interface ModelGroup {
  provider: string;
  icon: string;
  models: Model[];
}

// 模型接口
export interface Model {
  value: string;
  label: string;
  region?: string;
  recommended?: boolean;
}

// 模型选择器组件 - 下拉选择形式
interface ModelSelectorProps {
  groups: ModelGroup[];
  value: string;
  onChange: (model: string) => void;
  triggerClassName?: string;
}

export function ModelSelector({ groups, value, onChange, triggerClassName = '' }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800 
                               border-2 border-slate-200 dark:border-slate-700 rounded-xl 
                               hover:border-orange-400 dark:hover:border-orange-500 
                               focus:outline-none focus:border-orange-500 transition-colors 
                               text-sm text-slate-800 dark:text-slate-200 h-auto overflow-hidden ${triggerClassName}`}>
        <SelectValue placeholder="选择模型" />
      </SelectTrigger>
      <SelectContent>
        {groups.map(group => (
          <SelectGroup key={group.provider}>
            <SelectLabel className="flex items-center gap-1.5">
              <span>{group.icon}</span>
              <span>{group.provider}</span>
              {group.provider.includes('4sAPI') && (
                <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 bg-amber-50 text-amber-600 border-amber-200">
                  付费
                </Badge>
              )}
            </SelectLabel>
            {group.models.map(m => (
              <SelectItem key={m.value} value={m.value}>
                <div className="flex items-center gap-2">
                  <span>{m.label}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    {m.region}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ModelSelector;
