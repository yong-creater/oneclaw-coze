import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: '没有文件' }, { status: 400 });
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: '只支持图片文件' }, { status: 400 });
    }

    // 检查文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: '文件大小不能超过 5MB' }, { status: 400 });
    }

    // 生成唯一文件名
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `tutorials/${fileName}`;

    // 上传到 Supabase Storage
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('上传到 Supabase 失败:', error);
      return NextResponse.json({ success: false, error: '上传失败: ' + error.message }, { status: 500 });
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('上传处理失败:', error);
    return NextResponse.json({ success: false, error: '上传失败' }, { status: 500 });
  }
}
