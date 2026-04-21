import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import pg from 'pg';

const { Pool } = pg;

let envLoaded = false;
let pgPool: InstanceType<typeof Pool> | null = null;

function loadEnv(): void {
  if (envLoaded) return;
  
  // 如果已经有环境变量，直接使用
  if (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY) {
    envLoaded = true;
    return;
  }

  // 如果有 DATABASE_URL 或 PGHOST（火山引擎 PostgreSQL），也认为已加载
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    envLoaded = true;
    return;
  }

  try {
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

function isVolcenginePgMode(): boolean {
  loadEnv();
  return !!(process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGPASSWORD));
}

function isSupabaseMode(): boolean {
  loadEnv();
  return !!(process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY);
}

export async function getPgPool() {
  if (pgPool) return pgPool;
  
  loadEnv();
  
  const config: any = {};
  
  if (process.env.PGDATABASE_URL) {
    config.connectionString = process.env.PGDATABASE_URL;
  } else if (process.env.DATABASE_URL) {
    config.connectionString = process.env.DATABASE_URL;
  } else {
    config.host = process.env.PGHOST;
    config.port = parseInt(process.env.PGPORT || '5432');
    config.user = process.env.PGUSER || 'postgres';
    config.password = process.env.PGPASSWORD;
    config.database = process.env.PGDATABASE || 'postgres';
  }
  
  pgPool = new Pool(config);
  return pgPool;
}

// 数据库查询接口
export async function query(table: string, options?: {
  select?: string;
  where?: Record<string, any>;
  eq?: Record<string, any>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  count?: boolean;
}) {
  if (isVolcenginePgMode()) {
    const pool = await getPgPool();
    
    let sql = `SELECT ${options?.select || '*'} FROM ${table}`;
    const params: any[] = [];
    let paramIndex = 1;
    
    // 处理 where 条件
    if (options?.where) {
      const conditions: string[] = [];
      for (const [key, value] of Object.entries(options.where)) {
        conditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
    }
    
    // 处理 eq 条件
    if (options?.eq) {
      const conditions: string[] = [];
      for (const [key, value] of Object.entries(options.eq)) {
        conditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
      if (conditions.length > 0) {
        sql += sql.includes('WHERE') ? ' AND ' + conditions.join(' AND ') : ' WHERE ' + conditions.join(' AND ');
      }
    }
    
    // 排序
    if (options?.order) {
      sql += ` ORDER BY ${options.order.column} ${options.order.ascending ? 'ASC' : 'DESC'}`;
    }
    
    // 限制数量
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    
    // 偏移量
    if (options?.offset !== undefined) {
      sql += ` OFFSET ${options.offset}`;
    }
    
    const result = await pool.query(sql, params);
    return { data: result.rows, error: null, count: result.rows.length };
  }
  
  if (isSupabaseMode()) {
    const client = createClient(
      process.env.COZE_SUPABASE_URL!,
      process.env.COZE_SUPABASE_ANON_KEY!
    );
    
    let q = client.from(table).select(options?.select || '*', { count: options?.count ? 'exact' : undefined });
    
    if (options?.eq) {
      for (const [key, value] of Object.entries(options.eq)) {
        q = q.eq(key, value);
      }
    }
    
    if (options?.order) {
      q = q.order(options.order.column, { ascending: options.order.ascending ?? true });
    }
    
    if (options?.limit) {
      q = q.limit(options.limit);
    }
    
    if (options?.offset !== undefined) {
      q = q.range(options.offset, options.offset + (options.limit || 100) - 1);
    }
    
    return await q;
  }
  
  return { data: null, error: { message: '未配置数据库' } };
}

export { loadEnv, isVolcenginePgMode, isSupabaseMode };
