'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
            <div className="text-6xl mb-4">🦞</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">页面出错了</h2>
            <p className="text-slate-500 mb-4">抱歉，页面加载时遇到了问题</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// API 错误处理包装器
export async function withApiError<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      error: error instanceof Error ? error.message : '请求失败',
      ...(fallback !== undefined && { data: fallback })
    };
  }
}

// 组件懒加载包装器（带错误处理）
import { lazy, Suspense } from 'react';

export function LazyLoad(
  importer: () => Promise<{ default: React.ComponentType<any> }>,
  fallback?: ReactNode
) {
  const Component = lazy(importer);
  
  return function LazyWrapper(props: any) {
    return (
      <Suspense fallback={fallback || <LoadingSkeleton />}>
        <ErrorBoundary>
          <Component {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  );
}
