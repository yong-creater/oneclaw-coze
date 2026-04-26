import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Edge Runtime 检测
const isEdgeRuntime = typeof window === 'undefined' && !process.env.NODE_ENV;

// 延迟加载 child_process（仅 Node.js 环境）
let envLoaded = false;
let loadEnvFn: (() => void) | null = null;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  if (envLoaded) return;
  
  // 已有环境变量，跳过
  if (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY) {
    envLoaded = true;
    return;
  }

  // Edge Runtime 跳过
  if (isEdgeRuntime) {
    return;
  }

  // Node.js 环境延迟加载
  if (!loadEnvFn) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { execSync } = require('child_process');
      
      const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;
      
      const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
        encoding: 'utf-8',
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const lines = output.trim().split('\n');
      for (const line of lines) {
        if (line.startsWith('#')) continue;
        const eqIndex = line.indexOf('=');
        if (eqIndex > 0) {
          const key = line.substring(0, eqIndex);
          let value = line.substring(eqIndex + 1);
          if ((value.startsWith("'") && value.endsWith("'")) ||
              (value.startsWith('"') && value.endsWith('"'))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    } catch {
      // Silently fail
    }
  }
  
  loadEnvFn?.();
  envLoaded = true;
}

function getSupabaseCredentials(): SupabaseCredentials {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  // 在构建时，如果环境变量不存在，返回 null（不在模块级别创建客户端）
  if (!url || !anonKey) {
    return null as unknown as SupabaseCredentials;
  }

  return { url, anonKey };
}

function getSupabaseServiceRoleKey(): string | undefined {
  loadEnv();
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
}

// 单例模式 - 延迟初始化客户端
let supabaseClient: SupabaseClient | null = null;

// 创建支持链式调用的 Mock 客户端
function createMockClient() {
  // 创建一个可链式调用的查询对象
  const createChainableQuery = (data: unknown = [], count?: number) => {
    const query = {
      // select 支持链式调用
      select: (columns?: string, options?: { count?: string }) => {
        return createChainableQuery(data, options?.count === 'exact' ? 0 : count);
      },
      // eq 支持链式调用
      eq: (column: string, value: unknown) => {
        return createChainableQuery(data, count);
      },
      // order 支持链式调用
      order: (column: string, options?: { ascending?: boolean }) => {
        return createChainableQuery(data, count);
      },
      // limit 支持链式调用
      limit: (n: number) => {
        return createChainableQuery(data, count);
      },
      // range 支持链式调用
      range: (from: number, to: number) => {
        return createChainableQuery(data, count);
      },
      // single 返回 Promise
      single: () => {
        return Promise.resolve({ data, error: null });
      },
      // 最终执行返回 Promise
      then: function(resolve: (value: unknown) => void, reject?: (reason: unknown) => void) {
        return Promise.resolve({ data, error: null, count }).then(resolve, reject);
      },
    };
    return query;
  };

  return {
    from: (table: string) => {
      return {
        select: (columns?: string, options?: { count?: string }) => {
          return createChainableQuery([], options?.count === 'exact' ? 0 : undefined);
        },
        eq: (column: string, value: unknown) => {
          return createChainableQuery([]);
        },
        insert: () => ({
          select: () => Promise.resolve({ data: null, error: null }),
          then: function(resolve: (value: unknown) => void) {
            return Promise.resolve({ data: null, error: null }).then(resolve);
          },
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
          then: function(resolve: (value: unknown) => void) {
            return Promise.resolve({ data: null, error: null }).then(resolve);
          },
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
          then: function(resolve: (value: unknown) => void) {
            return Promise.resolve({ data: null, error: null }).then(resolve);
          },
        }),
      };
    },
    channel: () => ({ subscribe: () => ({}) }),
    removeChannel: () => Promise.resolve(),
  } as unknown as SupabaseClient;
}

export function getSupabaseClient(token?: string): SupabaseClient {
  // 检查是否在构建时环境
  const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === undefined;
  
  // 在构建时返回空客户端（避免构建错误）
  if (isBuildTime) {
    return createMockClient();
  }

  // 正常运行时创建客户端
  const credentials = getSupabaseCredentials();
  
  if (!credentials) {
    // 环境变量未配置，返回空客户端
    return createMockClient();
  }

  // 如果已经有缓存的客户端且没有 token，复用缓存
  if (supabaseClient && !token) {
    return supabaseClient;
  }

  const { url, anonKey } = credentials;

  let key: string;
  if (token) {
    key = anonKey;
  } else {
    const serviceRoleKey = getSupabaseServiceRoleKey();
    key = serviceRoleKey ?? anonKey;
  }

  const client = createClient(url, key, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 缓存无 token 的客户端
  if (!token) {
    supabaseClient = client;
  }

  return client;
}

export { loadEnv, getSupabaseCredentials, getSupabaseServiceRoleKey };
