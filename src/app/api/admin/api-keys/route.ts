import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdminAuth } from '@/lib/auth';
import crypto from 'crypto';

// 创建 API Key
function generateApiKey(): string {
  return 'sk-' + crypto.randomBytes(24).toString('hex');
}

// 确保表存在
async function ensureTablesExist(client: any) {
  try {
    // 检查 api_keys 表是否存在
    const { error: checkError } = await client.from('api_keys').select('id').limit(1);
    if (checkError && checkError.code === '42P01') {
      // 表不存在，创建它
      await client.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS api_keys (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            key VARCHAR(100) UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS api_call_logs (
            id SERIAL PRIMARY KEY,
            api_key_id INTEGER REFERENCES api_keys(id) ON DELETE CASCADE,
            endpoint VARCHAR(255),
            status VARCHAR(50),
            records_imported INTEGER DEFAULT 0,
            called_at TIMESTAMP DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
        `
      });
    }
  } catch (e) {
    console.log('表检查/创建完成');
  }
}

// 获取 API Key 列表
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const client = getSupabaseClient();
    await ensureTablesExist(client);
    
    const { data, error } = await client
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取API Key列表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }, { status: 500 });
  }
}

// 创建 API Key
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = body.name;

    if (!name) {
      return NextResponse.json({ success: false, error: '请提供名称' }, { status: 400 });
    }

    const client = getSupabaseClient();
    await ensureTablesExist(client);
    
    const key = generateApiKey();

    const { data, error } = await client
      .from('api_keys')
      .insert({
        name,
        key,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        key, // 只在创建时返回一次
      },
    });
  } catch (error) {
    console.error('创建API Key失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建失败',
    }, { status: 500 });
  }
}

// 删除 API Key
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除API Key失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    }, { status: 500 });
  }
}

// 切换 API Key 状态
export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id;
    const is_active = body.is_active;

    if (!id || is_active === undefined) {
      return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from('api_keys')
      .update({ is_active })
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新API Key失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新失败',
    }, { status: 500 });
  }
}
