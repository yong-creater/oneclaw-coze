import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import pg from 'pg';

const { Pool } = pg;

let envLoaded = false;

// 火山引擎 PostgreSQL 连接池
let pgPool: InstanceType<typeof Pool> | null = null;

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
  
  // 如果有 PGHOST，也认为已加载
  if (process.env.PGHOST) {
    envLoaded = true;
    return;
  }

  try {
    // 尝试从扣子平台获取环境变量
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

// 判断是否使用火山引擎 PostgreSQL 模式
function isVolcenginePgMode(): boolean {
  loadEnv();
  return !!(process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGPASSWORD));
}

// 判断是否使用 Supabase 模式
function isSupabaseMode(): boolean {
  loadEnv();
  return !!(process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY);
}

// 获取火山引擎 PostgreSQL 连接池
async function getPgPool() {
  if (pgPool) return pgPool;
  
  loadEnv();
  
  const config: any = {};
  
  if (process.env.DATABASE_URL) {
    // 直接使用连接字符串
    config.connectionString = process.env.DATABASE_URL;
  } else {
    // 使用单独的参数
    config.host = process.env.PGHOST || 'localhost';
    config.port = parseInt(process.env.PGPORT || '5432');
    config.user = process.env.PGUSER || 'postgres';
    config.password = process.env.PGPASSWORD || '';
    config.database = process.env.PGDATABASE || 'postgres';
  }
  
  pgPool = new Pool(config);
  return pgPool;
}

// 获取 Supabase 客户端
export function getSupabaseClient() {
  loadEnv();
  
  const url = process.env.COZE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createClient(url, anonKey, {
    db: { timeout: 60000 },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// 统一的数据库查询接口
export async function query(sql: string, params?: any[]) {
  if (isVolcenginePgMode()) {
    // 使用火山引擎 PostgreSQL
    const pool = await getPgPool();
    const result = await pool.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } else if (isSupabaseMode()) {
    // 使用 Supabase
    const client = getSupabaseClient();
    // 对于简单查询，转换为 Supabase 格式
    // 这里需要根据 SQL 内容做简单转换
    const result = await client.rpc('exec_sql', { sql, params: params || [] });
    return { rows: result.data || [], rowCount: result.data?.length || 0 };
  }
  
  throw new Error('未配置数据库连接');
}

// 直接执行 SQL（用于 pg 客户端）
export async function pgQuery(sql: string, params?: any[]) {
  const pool = await getPgPool();
  const result = await pool.query(sql, params);
  return result;
}

// 获取数据库类型
export function getDbType(): 'volcengine' | 'supabase' | 'none' {
  loadEnv();
  if (isVolcenginePgMode()) return 'volcengine';
  if (isSupabaseMode()) return 'supabase';
  return 'none';
}

// 导出
export { loadEnv, isVolcenginePgMode, isSupabaseMode, getPgPool };
