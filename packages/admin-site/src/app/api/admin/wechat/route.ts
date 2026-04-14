import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取微信配置
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const admin = await validateSession(token);
    if (!admin) {
      return NextResponse.json({ success: false, error: '登录已过期' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('wechat_config')
      .select('id, app_id, qr_code_url, updated_at')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error('获取微信配置失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取失败'
    }, { status: 500 });
  }
}

// 更新微信配置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    const admin = await validateSession(token);
    if (!admin) {
      return NextResponse.json({ success: false, error: '登录已过期' }, { status: 401 });
    }

    const body = await request.json();
    const { app_id, app_secret, qr_code_url, token: wechatToken, encoding_aes_key } = body;

    const client = getSupabaseClient();

    // 检查是否已有配置
    const { data: existing } = await client
      .from('wechat_config')
      .select('id')
      .maybeSingle();

    let result;
    if (existing) {
      // 更新
      result = await client
        .from('wechat_config')
        .update({
          app_id,
          app_secret,
          qr_code_url,
          token: wechatToken,
          encoding_aes_key,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // 新增
      result = await client
        .from('wechat_config')
        .insert({
          app_id,
          app_secret,
          qr_code_url,
          token: wechatToken,
          encoding_aes_key
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存微信配置失败:', error);
    return NextResponse.json({
      success: false,
      error: '保存失败'
    }, { status: 500 });
  }
}
