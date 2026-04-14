# @oneclaw/auth

OneClaw 统一认证 SDK，支持跨域单点登录 (SSO)。

## 安装

```bash
npm install @oneclaw/auth
# 或
pnpm add @oneclaw/auth
```

## 配置

在 `.env` 中设置：

```env
# JWT 密钥（所有应用使用相同的密钥）
JWT_SECRET=your-secret-key-change-in-production

# Cookie 域名（根域名）
COOKIE_DOMAIN=.oneclaw.shop

# 主站域名
MAIN_DOMAIN=oneclaw.shop

# 管理后台域名
ADMIN_DOMAIN=admin.oneclaw.shop

# 当前应用标识
APP_ID=oneclaw
```

## 使用

### 服务端 - Next.js API Route

```typescript
import { verifyToken } from '@oneclaw/auth';

export async function GET(request: Request) {
  const token = request.cookies.get('access_token')?.value;
  
  if (!token) {
    return Response.json({ error: '未登录' }, { status: 401 });
  }
  
  const user = await verifyToken(token);
  
  if (!user) {
    return Response.json({ error: 'Token 无效' }, { status: 401 });
  }
  
  return Response.json({ user });
}
```

### 服务端 - 认证中间件

```typescript
import { withAuth } from '@oneclaw/auth';

// 需要管理员权限的页面
export async function GET(request: NextRequest) {
  const auth = withAuth({
    requireAdmin: true,
    onUnauthorized: (req) => {
      return NextResponse.redirect('/unauthorized');
    }
  });
  
  const result = await auth(request);
  if (result) return result;
  
  // 继续处理...
}
```

### 前端 - 检查登录状态

```typescript
import { isLoggedIn, getCurrentUser, logout } from '@oneclaw/auth';

// 检查是否登录
if (isLoggedIn()) {
  console.log('已登录');
}

// 获取用户信息
const user = getCurrentUser();
console.log(user?.userId, user?.username);

// 退出登录
logout();
```

### 前端 - 路由守卫

```typescript
import { requireAuth, requireAdmin } from '@oneclaw/auth';

// 在页面组件中
if (!requireAuth()) {
  // 未登录，自动跳转到登录页
}

// 在管理员页面中
if (!requireAdmin()) {
  // 非管理员，自动跳转首页
}
```

## SSO 流程

```
1. 用户访问 app.oneclaw.shop
2. 检查 access_token Cookie
3. 无 Token -> 重定向到 oneclaw.shop/login
4. 用户扫码/账号登录
5. 签发 Token，设置 Cookie (domain=.oneclaw.shop)
6. 重定向回 app.oneclaw.shop
7. 验证 Token，自动登录
```

## 用户类型

| 类型 | 说明 | 可访问 |
|------|------|--------|
| `admin` | 管理员 | 所有应用 + 管理后台 |
| `user` | 普通用户 | 主站 + 授权应用 |

## Cookie 配置

```typescript
{
  name: 'access_token',
  domain: '.oneclaw.shop',  // 所有子域共享
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60  // 30天
}
```

## 应用接入

1. 安装 SDK
2. 配置环境变量（JWT_SECRET 必须相同）
3. 引入认证工具

## License

MIT
