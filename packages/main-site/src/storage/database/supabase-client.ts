import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

let envLoaded = false;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  if (envLoaded) return;
  
  // 如果已经有环境变量，直接使用
  if (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY) {
    envLoaded = true;
    return;
  }

  // 如果有 DATABASE_URL（火山引擎 PostgreSQL），也认为已加载
  if (process.env.DATABASE_URL) {
    envLoaded = true;
    return;
  }

  try {
    // 尝试动态加载 dotenv
    import('dotenv').then(dotenv => {
      dotenv.config();
    }).catch(() => {});
    if (process.env.COZE_SUPABASE_URL || process.env.DATABASE_URL) {
      envLoaded = true;
      return;
    }

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

    envLoaded = true;
  } catch {
    // Silently fail
  }
}

function isSupabaseMode(): boolean {
  return !!(process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY);
}

function getSupabaseCredentials(): SupabaseCredentials {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  // 在构建时，如果环境变量不存在，返回占位符
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

// 获取火山引擎 PostgreSQL 连接信息
function getVolcenginePgConfig() {
  loadEnv();
  
  // 优先使用 DATABASE_URL
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }
  
  // 否则使用单独的参数
  const host = process.env.PGHOST;
  const port = process.env.PGPORT || '5432';
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE || 'postgres';
  
  if (!host || !password) {
    return null;
  }
  
  return {
    host,
    port: parseInt(port),
    user,
    password,
    database,
  };
}

// 判断是否使用火山引擎模式
function isVolcengineMode(): boolean {
  loadEnv();
  return !isSupabaseMode() && !!(process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGPASSWORD));
}

// 创建 Supabase 客户端（用于 Supabase 模式）
function getSupabaseClient(token?: string): SupabaseClient {
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

// 创建 pg 客户端（用于火山引擎 PostgreSQL 模式）
async function getPgClient() {
  const { default: pg } = await import('pg');
  const { Pool } = pg;
  
  const config = getVolcenginePgConfig();
  if (!config) {
    throw new Error('火山引擎数据库配置不完整');
  }
  
  const pool = new Pool(config);
  return pool;
}

// 统一的数据库客户端接口
export async function getDatabase() {
  if (isSupabaseMode()) {
    return getSupabaseClient();
  } else if (isVolcengineMode()) {
    return await getPgClient();
  } else {
    throw new Error('未配置数据库，请设置 COZE_SUPABASE_URL 或 DATABASE_URL');
  }
}

// 为了兼容现有代码，导出这些
export { loadEnv, getSupabaseCredentials, getSupabaseServiceRoleKey, getSupabaseClient, isSupabaseMode, isVolcengineMode, getVolcenginePgConfig };
