import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 初始化外部导入相关表
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const client = getSupabaseClient();
    const results = [];

    // 创建 api_keys 表
    const { error: keysError } = await client.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS api_keys (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          key VARCHAR(100) UNIQUE NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (keysError) {
      // 如果 RPC 不可用，尝试直接创建（supabase 可能不支持）
      results.push({ table: 'api_keys', status: '需要手动创建', detail: keysError.message });
    } else {
      results.push({ table: 'api_keys', status: 'created' });
    }

    // 创建 api_call_logs 表
    const { error: logsError } = await client.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS api_call_logs (
          id SERIAL PRIMARY KEY,
          api_key_id INTEGER REFERENCES api_keys(id),
          endpoint VARCHAR(255),
          status VARCHAR(50),
          records_imported INTEGER DEFAULT 0,
          called_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (logsError) {
      results.push({ table: 'api_call_logs', status: '需要手动创建', detail: logsError.message });
    } else {
      results.push({ table: 'api_call_logs', status: 'created' });
    }

    // 使用标准的 INSERT/UPDATE 方式创建表（通过 Supabase SQL Editor）
    // 这里返回创建表的 SQL 语句供用户在 Supabase 后台执行
    const sqlStatements = [
      `CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        key VARCHAR(100) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS api_call_logs (
        id SERIAL PRIMARY KEY,
        api_key_id INTEGER REFERENCES api_keys(id) ON DELETE CASCADE,
        endpoint VARCHAR(255),
        status VARCHAR(50),
        records_imported INTEGER DEFAULT 0,
        called_at TIMESTAMP DEFAULT NOW()
      );`,
      `CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);`,
      `CREATE INDEX IF NOT EXISTS idx_api_call_logs_key_id ON api_call_logs(api_key_id);`
    ];

    return NextResponse.json({
      success: true,
      message: '表创建SQL已生成，请在 Supabase SQL Editor 中执行',
      sql: sqlStatements,
      results,
    });
  } catch (error) {
    console.error('初始化表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '初始化失败',
    }, { status: 500 });
  }
}
