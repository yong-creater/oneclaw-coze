import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyUserToken, 
  validateUserSession, 
  deleteUserSession, 
  mockWechatLogin,
  getWechatQRCode,
  createOrGetUser
} from '@/lib/user-auth';

// 获取登录二维码
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // 获取二维码
    if (action === 'qrcode') {
      const { qrUrl, sceneId } = await getWechatQRCode();
      return NextResponse.json({
        success: true,
        data: {
          qrUrl,
          sceneId
        }
      });
    }
    
    // 验证登录状态
    const token = request.cookies.get('user_token')?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: '未登录'
      }, { status: 401 });
    }
    
    const user = await validateUserSession(token);
    
    if (!user) {
      const response = NextResponse.json({
        success: false,
        authenticated: false,
        error: '会话已过期'
      }, { status: 401 });
      response.cookies.delete('user_token');
      return response;
    }
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      data: user
    });
  } catch (error) {
    console.error('验证登录状态失败:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: '服务器错误'
    }, { status: 500 });
  }
}

// 登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, openid, nickname, avatar_url } = body;
    
    // 模拟登录（开发环境）
    if (action === 'mock_login') {
      const { user, token } = await mockWechatLogin();
      
      const response = NextResponse.json({
        success: true,
        data: { user, token }
      });
      
      // 设置Cookie（30天有效）
      response.cookies.set('user_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30天
        path: '/'
      });
      
      return response;
    }
    
    // 微信扫码登录（生产环境）
    if (action === 'wechat_login' && openid) {
      const user = await createOrGetUser(openid, nickname, avatar_url);
      const { generateUserToken, createUserSession } = await import('@/lib/user-auth');
      const token = await generateUserToken(user);
      await createUserSession(user.user_id, token);
      
      const response = NextResponse.json({
        success: true,
        data: { user, token }
      });
      
      response.cookies.set('user_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });
      
      return response;
    }
    
    return NextResponse.json({
      success: false,
      error: '无效的登录方式'
    }, { status: 400 });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json({
      success: false,
      error: '登录失败'
    }, { status: 500 });
  }
}

// 登出
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('user_token')?.value;
    
    if (token) {
      await deleteUserSession(token);
    }
    
    const response = NextResponse.json({ success: true });
    response.cookies.delete('user_token');
    
    return response;
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json({
      success: false,
      error: '登出失败'
    }, { status: 500 });
  }
}
