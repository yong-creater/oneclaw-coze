import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { validateSession } from '@/lib/auth';

// 图片上传 API
export async function POST(request: NextRequest) {
  try {
    // 验证登录
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const user = await validateSession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: '会话已过期' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'tutorials'; // tutorials, tools, covers

    if (!file) {
      return NextResponse.json({ success: false, error: '没有上传文件' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: '不支持的图片格式' }, { status: 400 });
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: '图片大小不能超过 5MB' }, { status: 400 });
    }

    // 生成唯一文件名
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${type}/${timestamp}-${random}.${ext}`;

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('上传失败:', error);
      return NextResponse.json({ success: false, error: '上传失败: ' + error.message }, { status: 500 });
    }

    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        path: fileName,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '上传失败' 
    }, { status: 500 });
  }
}
