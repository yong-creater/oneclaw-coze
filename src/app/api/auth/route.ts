import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyUserToken, 
  validateUserSession, 
  deleteUserSession, 
  mockWechatLogin,
  getWechatQRCode,
  createOrGetUser,
  checkLoginRequest,
  loginWithEmail,
  registerWithEmail,
  generateUserToken,
  createUserSession
} from '@/lib/user-auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyCode } from '@/lib/verify-code';

// 获取登录二维码 / 检查登录状态
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
    
    // 检查扫码登录状态
    if (action === 'check') {
      const sceneId = searchParams.get('sceneId');
      if (!sceneId) {
        return NextResponse.json({
          success: false,
          error: '缺少sceneId参数'
        }, { status: 400 });
      }
      
      const result = await checkLoginRequest(sceneId);
      
      if (result.status === 'confirmed' && result.user && result.token) {
        const response = NextResponse.json({
          success: true,
          status: 'confirmed',
          data: { user: result.user, token: result.token }
        });
        
        response.cookies.set('user_token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
          path: '/'
        });
        
        return response;
      }
      
      return NextResponse.json({
        success: true,
        status: result.status
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

// 登录/注册
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
      
      response.cookies.set('user_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });
      
      return response;
    }
    
    // ========================================
    // 密码登录
    // ========================================
    if (action === 'email_login') {
      const { email, password } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: '请输入邮箱和密码' },
          { status: 400 }
        );
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: '请输入有效的邮箱地址' },
          { status: 400 }
        );
      }
      
      const result = await loginWithEmail(email, password);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        );
      }
      
      const response = NextResponse.json({
        success: true,
        user: {
          user_id: result.user!.user_id,
          nickname: result.user!.nickname,
          email: result.user!.email,
          avatar_url: result.user!.avatar_url
        }
      });
      
      response.cookies.set('user_token', result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });
      
      return response;
    }
    
    // ========================================
    // 验证码登录（未注册用户先注册）
    // ========================================
    if (action === 'email_code_login') {
      const { email, code, nickname } = body;
      
      if (!email || !code) {
        return NextResponse.json(
          { success: false, error: '请输入邮箱和验证码' },
          { status: 400 }
        );
      }
      
      // 验证验证码
      const codeResult = await verifyCode(email, code, 'login');
      if (!codeResult.valid) {
        return NextResponse.json(
          { success: false, error: codeResult.error },
          { status: 400 }
        );
      }
      
      // 尝试验证码登录（会自动创建用户）
      const supabase = getSupabaseClient();
      
      // 查找或创建用户
      let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error && error.code === 'PGRST116') {
        // 用户不存在，创建新用户
        const randomId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const defaultNickname = nickname || `用户${randomId.slice(-6)}`;
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            user_id: randomId,
            email: email.toLowerCase(),
            nickname: defaultNickname,
            avatar_url: null,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error('创建用户失败:', createError);
          return NextResponse.json(
            { success: false, error: '创建用户失败' },
            { status: 500 }
          );
        }
        
        user = newUser;
      } else if (error) {
        console.error('查询用户失败:', error);
        return NextResponse.json(
          { success: false, error: '登录失败' },
          { status: 500 }
        );
      }
      
      // 生成 token
      const token = await generateUserToken(user);
      await createUserSession(user.user_id, token);
      
      const response = NextResponse.json({
        success: true,
        user: {
          user_id: user.user_id,
          nickname: user.nickname,
          email: user.email,
          avatar_url: user.avatar_url
        },
        isNewUser: !user.password_hash
      });
      
      response.cookies.set('user_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });
      
      return response;
    }
    
    // ========================================
    // 设置密码（验证码登录后的用户）
    // ========================================
    if (action === 'set_password') {
      const { email, password, confirmPassword } = body;
      const token = request.cookies.get('user_token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { success: false, error: '请先登录' },
          { status: 401 }
        );
      }
      
      const user = await validateUserSession(token);
      if (!user) {
        return NextResponse.json(
          { success: false, error: '会话已过期' },
          { status: 401 }
        );
      }
      
      if (!password || !confirmPassword) {
        return NextResponse.json(
          { success: false, error: '请输入密码' },
          { status: 400 }
        );
      }
      
      if (password !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: '两次密码输入不一致' },
          { status: 400 }
        );
      }
      
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: '密码至少需要6个字符' },
          { status: 400 }
        );
      }
      
      // 加密密码
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 10);
      
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('user_id', user.user_id);
      
      if (error) {
        console.error('设置密码失败:', error);
        return NextResponse.json(
          { success: false, error: '设置密码失败' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: '密码设置成功'
      });
    }
    
    // ========================================
    // 验证码注册（需要先验证邮箱）
    // ========================================
    if (action === 'email_register_with_code') {
      const { email, code, password, nickname } = body;
      
      if (!email || !code) {
        return NextResponse.json(
          { success: false, error: '请输入邮箱和验证码' },
          { status: 400 }
        );
      }
      
      // 验证验证码
      const codeResult = await verifyCode(email, code, 'register');
      if (!codeResult.valid) {
        return NextResponse.json(
          { success: false, error: codeResult.error },
          { status: 400 }
        );
      }
      
      // 如果提供了密码，进行完整注册
      if (password) {
        if (password.length < 6) {
          return NextResponse.json(
            { success: false, error: '密码至少需要6个字符' },
            { status: 400 }
          );
        }
        
        const result = await registerWithEmail(email, password, nickname);
        
        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error },
            { status: 400 }
          );
        }
        
        const response = NextResponse.json({
          success: true,
          user: {
            user_id: result.user!.user_id,
            nickname: result.user!.nickname,
            email: result.user!.email,
            avatar_url: result.user!.avatar_url
          }
        });
        
        response.cookies.set('user_token', result.token!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
          path: '/'
        });
        
        return response;
      }
      
      // 只验证了邮箱，返回待设置密码状态
      return NextResponse.json({
        success: true,
        emailVerified: true,
        email
      });
    }
    
    // ========================================
    // 旧版邮箱注册（保留兼容）
    // ========================================
    if (action === 'email_register') {
      const { email, password, nickname } = body;
      
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: '请输入邮箱和密码' },
          { status: 400 }
        );
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: '请输入有效的邮箱地址' },
          { status: 400 }
        );
      }
      
      // 验证密码强度
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: '密码至少需要6个字符' },
          { status: 400 }
        );
      }
      
      const result = await registerWithEmail(email, password, nickname);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }
      
      const response = NextResponse.json({
        success: true,
        user: {
          user_id: result.user!.user_id,
          nickname: result.user!.nickname,
          email: result.user!.email,
          avatar_url: result.user!.avatar_url
        }
      });
      
      response.cookies.set('user_token', result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });
      
      return response;
    }
    
    // 微信扫码登录（生产环境）
    if (action === 'wechat_login' && openid) {
      const user = await createOrGetUser(openid, nickname, avatar_url);
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
