'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 分类列表
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR('/api/categories', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1分钟内不重复请求
  });
  return {
    categories: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// 工具列表
export function useTools(params: Record<string, any> = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/tools${queryString ? `?${queryString}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30秒内不重复请求
  });
  return {
    tools: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    isError: error,
    mutate,
  };
}

// 单个工具详情
export function useTool(id: number | string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/tools/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
  return {
    tool: data?.data || null,
    isLoading,
    isError: error,
    mutate,
  };
}

// 标签列表
export function useTags() {
  const { data, error, isLoading, mutate } = useSWR('/api/tags', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  return {
    tags: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// 评分统计
export function useRatings(toolId: number | string) {
  const { data, error, isLoading, mutate } = useSWR(
    toolId ? `/api/ratings?tool_id=${toolId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );
  return {
    ratings: data?.data || null,
    isLoading,
    isError: error,
    mutate,
  };
}

// 提示词列表
export function usePrompts(params: Record<string, any> = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/prompts${queryString ? `?${queryString}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
  return {
    prompts: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    isError: error,
    mutate,
  };
}

// 教程列表
export function useTutorials(params: Record<string, any> = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/tutorials${queryString ? `?${queryString}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
  return {
    tutorials: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    isError: error,
    mutate,
  };
}

// 技能列表
export function useSkills(params: Record<string, any> = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/skills${queryString ? `?${queryString}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
  return {
    skills: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    isError: error,
    mutate,
  };
}

// 技能分类
export function useSkillCategories() {
  const { data, error, isLoading, mutate } = useSWR('/api/skills/categories', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  return {
    categories: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// 数据看板
export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR('/api/dashboard', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1分钟缓存
  });
  return {
    dashboard: data?.data || null,
    isLoading,
    isError: error,
    mutate,
  };
}

// 广告位
export function useAds(position: string) {
  const { data, error, isLoading, mutate } = useSWR(
    position ? `/api/ads?position=${position}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
  return {
    ads: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
