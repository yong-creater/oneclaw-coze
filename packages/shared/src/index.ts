// 数据库连接
export { getSupabaseClient } from '@/storage/database/supabase-client';

// 共享类型
export interface Tool {
  id: number;
  name: string;
  logo: string;
  category_id: number;
  // ... 其他字段
}

// 共享工具函数
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('zh-CN');
}
