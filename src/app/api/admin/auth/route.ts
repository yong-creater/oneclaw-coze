import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyToken, createToken } from "@/lib/auth";
import { RolePermissions } from "@/lib/permissions";
import { logLogin } from "@/lib/audit";

// 根据角色获取权限列表
function getPermissionsByRole(role: string): string[] {
  const permissions = RolePermissions[role as keyof typeof RolePermissions];
  if (!permissions) {
    return [];
  }
  return permissions as string[];
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Token无效" }, { status: 401 });
    }
    
    const client = getSupabaseClient();
    const { data: user, error } = await client
      .from("admin_users")
      .select("id, username, email, role, is_active")
      .eq("id", decoded.id)
      .single();
    
    if (error || !user) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 401 });
    }
    
    if (!user.is_active) {
      return NextResponse.json({ success: false, error: "账号已被禁用" }, { status: 403 });
    }
    
    // 获取用户的权限列表
    const permissions = getPermissionsByRole(user.role);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ success: false, error: "认证检查失败" }, { status: 500 });
  }
}

// 登录失败次数限制（内存级，防暴力破解）
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15分钟

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    // 检查登录限制
    const attempt = loginAttempts.get(username);
    if (attempt && attempt.count >= MAX_ATTEMPTS) {
      const remaining = Math.ceil((attempt.lockUntil - Date.now()) / 60000);
      if (remaining > 0) {
        return NextResponse.json(
          { success: false, error: `登录失败次数过多，请${remaining}分钟后重试` },
          { status: 429 }
        );
      }
      // 锁定时间已过，重置
      loginAttempts.delete(username);
    }
    
    const client = getSupabaseClient();
    const { data: user, error } = await client
      .from("admin_users")
      .select("id, username, password_hash, email, role, is_active")
      .eq("username", username)
      .single();
    
    if (error || !user) {
      // 记录失败次数
      const a = loginAttempts.get(username) || { count: 0, lockUntil: 0 };
      a.count++;
      if (a.count >= MAX_ATTEMPTS) a.lockUntil = Date.now() + LOCK_DURATION;
      loginAttempts.set(username, a);
      await logLogin(username, false, "用户不存在", request);
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }
    
    if (!user.is_active) {
      await logLogin(username, false, "账号已被禁用", request);
      return NextResponse.json(
        { success: false, error: "账号已被禁用" },
        { status: 403 }
      );
    }
    
    // 验证密码
    const bcrypt = await import("bcryptjs");
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      // 记录失败次数
      const a = loginAttempts.get(username) || { count: 0, lockUntil: 0 };
      a.count++;
      if (a.count >= MAX_ATTEMPTS) a.lockUntil = Date.now() + LOCK_DURATION;
      loginAttempts.set(username, a);
      await logLogin(username, false, "密码错误", request);
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }
    
    // 生成新 token
    const token = await createToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: true,
    });
    
    // 创建会话
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天
    await client.from("admin_sessions").insert({
      user_id: user.id,
      token: token,
      expires_at: expiresAt.toISOString(),
    });
    
    // 获取权限
    const permissions = getPermissionsByRole(user.role);
    
    // 记录登录日志
    // 登录成功，清除失败计数
    loginAttempts.delete(username);

    await logLogin(username, true, "登录成功", request);
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions,
      },
    });
    
    // 设置 cookie - 使用正确的domain隔离环境
    const cookieDomain = process.env.COZE_PROJECT_DOMAIN_DEFAULT?.replace(/^https?:\/\//, '').split(':')[0] || undefined;
    
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // 改为 strict 更安全
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: "/",
      ...(cookieDomain && { domain: cookieDomain }), // 设置domain隔离环境
    });
    
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "登录失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    
    if (token) {
      const client = getSupabaseClient();
      // 删除会话
      await client.from("admin_sessions").delete().eq("token", token);
    }
    
    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin_token");
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: "登出失败" }, { status: 500 });
  }
}
