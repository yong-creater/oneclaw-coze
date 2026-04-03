import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, getTokenFromHeader, validateSession, logout } from '@/lib/auth';

// 登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '请输入用户名和密码' },
        { status: 400 }
      );
    }

    const result = await authenticateAdmin(username, password);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 设置HTTP-only Cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });

    response.cookies.set('admin_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24小时
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 验证登录状态
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value || 
                  getTokenFromHeader(request.headers.get('authorization'));

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: '未登录',
      }, { status: 401 });
    }

    const user = await validateSession(token);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: '会话已过期',
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: user,
    });
  } catch (error) {
    console.error('验证登录状态失败:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: '服务器错误',
    }, { status: 500 });
  }
}

// 登出
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value || 
                  getTokenFromHeader(request.headers.get('authorization'));

    if (token) {
      await logout(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_token');
    
    return response;
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
