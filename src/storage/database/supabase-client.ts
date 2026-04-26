import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Edge Runtime 检测
const isEdgeRuntime = typeof window === 'undefined' && !process.env.NODE_ENV;

// 延迟加载 child_process（仅 Node.js 环境）
let envLoaded = false;
const loadEnvFn: (() => void) | null = null;

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
      // 使用 require 来加载 child_process（仅在服务端执行）
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { execSync }: { execSync: typeof import('child_process').execSync } = require('child_process');
      
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

  // 在构建时，如果环境变量不存在，返回占位符（不会实际使用）
  if (!url || !anonKey) {
    return { 
      url: 'https://placeholder.supabase.co', 
      anonKey: 'placeholder-key' 
    };
  }

  return { url, anonKey };
}

function getSupabaseServiceRoleKey(): string | undefined {
  loadEnv();
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
}

export function getSupabaseClient(token?: string): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();

  let key: string;
  if (token) {
    key = anonKey;
  } else {
    const serviceRoleKey = getSupabaseServiceRoleKey();
    key = serviceRoleKey ?? anonKey;
  }

  if (token) {
    return createClient(url, key, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return createClient(url, key, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { loadEnv, getSupabaseCredentials, getSupabaseServiceRoleKey };
