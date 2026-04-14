import { NextResponse } from 'next/server';

// 统一 API 响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// 统一错误码
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// API 处理包装器
export async function withApiHandler<T>(
  handler: () => Promise<T>,
  options?: {
    needAuth?: boolean;
    errorMessage?: string;
  }
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    // 如果需要认证，可以在这里添加
    // if (options?.needAuth && !await checkAuth()) {
    //   return NextResponse.json(
    //     { success: false, error: '未授权', code: ErrorCodes.UNAUTHORIZED },
    //     { status: 401 }
    //   );
    // }

    const data = await handler();
    
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API Error:', error);
    
    const message = error instanceof Error 
      ? error.message 
      : (options?.errorMessage || '服务器错误');
    
    return NextResponse.json(
      { success: false, error: message, code: ErrorCodes.SERVER_ERROR },
      { status: 500 }
    );
  }
}

// 带缓存的 API 响应
export async function withCache<T>(
  cacheKey: string,
  handler: () => Promise<T>,
  options?: {
    revalidate?: number; // 秒
    tags?: string[];
  }
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    // 在 Next.js App Router 中使用 fetch cache
    const data = await handler();
    
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, s-maxage=${options?.revalidate || 60}, stale-while-revalidate=3600`,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '获取数据失败',
        code: ErrorCodes.SERVER_ERROR 
      },
      { status: 500 }
    );
  }
}
