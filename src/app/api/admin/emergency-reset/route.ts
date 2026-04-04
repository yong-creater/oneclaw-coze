import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 生产环境紧急密码重置接口
 * 
 * ⚠️ 使用后请立即删除此文件！
 * 
 * 调用示例：
 * curl -X POST https://oneclaw.shop/api/admin/emergency-reset \
 *   -H "Content-Type: application/json" \
 *   -d '{"security_key":"oneclaw-emergency-2024","username":"admin","new_password":"新密码"}'
 */

const SECURITY_KEY = process.env.ADMIN_RESET_KEY || 'oneclaw-emergency-2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { security_key, username, new_password } = body;

    // 验证安全密钥
    if (security_key !== SECURITY_KEY) {
      return NextResponse.json({ success: false, error: '安全密钥错误' }, { status: 403 });
    }

    if (!username || !new_password || new_password.length < 6) {
      return NextResponse.json({ success: false, error: '参数无效，密码至少6位' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查找管理员
    const { data: admin, error: findError } = await client
      .from('admin_users')
      .select('id, username')
      .eq('username', username)
      .single();

    if (findError || !admin) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 });
    }

    // 更新密码
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(new_password, 10);

    const { error: updateError } = await client
      .from('admin_users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', admin.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      message: '密码重置成功！请立即删除此API文件。' 
    });

  } catch (error) {
    console.error('重置密码失败:', error);
    return NextResponse.json({ success: false, error: '重置失败' }, { status: 500 });
  }
}
