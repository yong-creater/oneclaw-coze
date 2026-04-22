import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';

// 自动创建所有数据库表
export async function POST(request: NextRequest) {
  // 权限验证
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }
  
  try {
    const client = getSupabaseClient();

    console.log('🔧 开始自动创建数据库表...');

    // Supabase 的 SQL 执行接口
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: '缺少 Supabase 配置'
      }, { status: 500 });
    }

    // 所有需要创建的表
    const createTableSQL = `
-- 1. admin_users 表
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. users 表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. categories 表
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  icon TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. tags 表
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. tools 表
CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo TEXT,
  producer TEXT,
  highlight TEXT,
  description TEXT,
  category_id INTEGER,
  free_type TEXT,
  free_quota_desc TEXT,
  official_url TEXT,
  promotion_url TEXT,
  is_official BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. verification_codes 表
CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  email_key TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. admin_sessions 表
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. user_sessions 表
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`.trim();

    // 通过 Supabase REST API 执行 SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: createTableSQL }),
    });

    // 如果 RPC 方法不存在，尝试通过 pg_execute 函数
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 尝试不使用 RPC 的替代方案
      // 通过 POST 到 /rest/v1/ 表来创建记录（如果表不存在会返回错误）
      const tableResults: { table: string; status: string; error?: string }[] = [];
      
      const tables = [
        'admin_users',
        'users', 
        'categories',
        'tags',
        'tools',
        'verification_codes',
        'admin_sessions',
        'user_sessions',
      ];

      // 检查哪些表存在
      for (const tableName of tables) {
        try {
          const checkRes = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=id&limit=1`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            }
          });
          
          if (checkRes.ok) {
            tableResults.push({ table: tableName, status: '已存在' });
          } else {
            tableResults.push({ table: tableName, status: '不存在', error: `HTTP ${checkRes.status}` });
          }
        } catch (e: any) {
          tableResults.push({ table: tableName, status: '检查失败', error: e.message });
        }
      }

      // 返回结果和建议
      const existingTables = tableResults.filter(r => r.status === '已存在').map(r => r.table);
      const missingTables = tableResults.filter(r => r.status !== '已存在').map(r => r.table);

      if (missingTables.length === 0) {
        return NextResponse.json({
          success: true,
          message: '所有表已存在，无需创建',
          tables: tableResults,
        });
      }

      return NextResponse.json({
        success: false,
        error: `部分表不存在: ${missingTables.join(', ')}`,
        existing_tables: existingTables,
        missing_tables: missingTables,
        solution: '请在 Supabase Dashboard → SQL Editor 中执行建表 SQL',
        sql: createTableSQL,
      }, { status: 400 });
    }

    console.log('✅ 数据库表创建成功！');
    return NextResponse.json({
      success: true,
      message: '数据库表创建成功！',
    });

  } catch (error: any) {
    console.error('创建数据库表失败:', error);
    return NextResponse.json({
      success: false,
      error: `创建失败: ${error.message}`,
    }, { status: 500 });
  }
}

// GET 方法检查表状态
export async function GET() {
  try {
    const client = getSupabaseClient();
    const results: { table: string; exists: boolean; error?: string }[] = [];

    const tables = [
      'admin_users',
      'users', 
      'categories',
      'tags',
      'tools',
      'verification_codes',
      'admin_sessions',
      'user_sessions',
    ];

    for (const tableName of tables) {
      try {
        const { error } = await client.from(tableName).select('id').limit(1);
        results.push({ 
          table: tableName, 
          exists: !error,
          error: error?.message 
        });
      } catch (e: any) {
        results.push({ 
          table: tableName, 
          exists: false, 
          error: e.message 
        });
      }
    }

    const existingCount = results.filter(r => r.exists).length;

    return NextResponse.json({
      success: true,
      total: tables.length,
      existing: existingCount,
      missing: tables.length - existingCount,
      tables: results,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
