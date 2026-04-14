# OneClaw 拆分方案文档

## 概述

本文档描述如何将 OneClaw 项目拆分为独立的管理后台和主站项目，实现：
1. 管理后台独立部署（admin.oneclaw.shop）
2. 主站专注内容展示（oneclaw.shop）
3. 所有应用共享用户认证体系（SSO）
4. 便于未来扩展新应用

## 项目结构

```
oneclaw/
├── packages/
│   └── auth/                    # @oneclaw/auth SDK
│       ├── src/
│       │   ├── config.ts        # 认证配置
│       │   ├── jwt.ts           # JWT 工具
│       │   ├── middleware.ts     # Next.js 中间件
│       │   └── client.ts        # 前端工具
│       └── README.md
│
├── admin-oneclaw/               # 管理后台项目（新建）
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/          # 管理页面
│   │   │   ├── api/auth/       # 认证 API
│   │   │   └── api/admin/      # 管理 API
│   │   └── lib/
│   └── package.json
│
└── oneclaw-main/                # 主站项目（当前项目改造）
    ├── src/
    │   ├── app/                # 前台页面
    │   └── api/                # 前台 API
    └── package.json
```

---

## 第一部分：管理后台部署

### 1. 在扣子编程新建项目

1. 登录扣子编程
2. 新建项目：`oneclaw-admin`
3. 选择模板：`nextjs` 或 `native-static`
4. 将 `admin-oneclaw/` 目录下的所有文件复制到新项目

### 2. 配置环境变量

在扣子编程项目中设置环境变量：

```env
# Supabase（与管理后台共用）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT 密钥（必须与管理后台相同！）
JWT_SECRET=your-shared-jwt-secret-key

# 域名配置
COOKIE_DOMAIN=.oneclaw.shop
MAIN_DOMAIN=oneclaw.shop
ADMIN_DOMAIN=admin.oneclaw.shop

# 应用标识
APP_ID=admin
```

### 3. 部署

```bash
pnpm install
pnpm build
pnpm start
```

访问 `https://admin.oneclaw.shop`

---

## 第二部分：主站改造

### 1. 移除管理后台代码

从当前项目中移除：
- `src/app/admin/` 目录
- `src/app/api/admin/` 目录

保留：
- `src/app/`（前台页面）
- `src/app/api/`（前台 API）
- `src/components/`（组件）

### 2. 更新环境变量

```env
# 与管理后台相同的配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JWT 密钥（必须与管理后台相同！）
JWT_SECRET=your-shared-jwt-secret-key

# 域名配置
COOKIE_DOMAIN=.oneclaw.shop
MAIN_DOMAIN=oneclaw.shop

# 应用标识
APP_ID=oneclaw
```

### 3. 更新用户认证

将登录逻辑改为签发跨域 Token：

```typescript
// api/auth/route.ts
import { signToken, getCookieConfig } from '@oneclaw/auth';

export async function POST(request: Request) {
  // 验证用户...
  const user = { id: 1, username: 'test' };
  
  // 签发 Token
  const token = await signToken({
    userId: user.id,
    userType: 'user',
    username: user.username,
    appId: 'oneclaw',
  });
  
  // 设置跨域 Cookie
  const response = NextResponse.json({ success: true });
  const cookieConfig = getCookieConfig(token);
  response.cookies.set(cookieConfig);
  
  return response;
}
```

---

## 第三部分：SSO 配置

### 核心原理

```
用户登录 oneclaw.shop
         ↓
  签发 JWT Token
  设置 Cookie (domain=.oneclaw.shop)
         ↓
  用户访问 app.oneclaw.shop
         ↓
  读取 Cookie (domain=.oneclaw.shop)
         ↓
  验证 JWT Token
         ↓
  自动登录
```

### 关键配置

1. **JWT_SECRET**：所有应用必须使用相同的密钥
2. **COOKIE_DOMAIN**：设置为根域名 `.oneclaw.shop`
3. **Cookie 属性**：
   - `httpOnly: true`（防止 XSS）
   - `secure: true`（生产环境）
   - `sameSite: 'lax'`（允许跨域携带）
   - `domain: '.oneclaw.shop'`（根域名）

---

## 第四部分：未来扩展新应用

### 示例：创建 app.oneclaw.shop

1. **新建项目**

```bash
pnpm create next-app app-oneclaw
cd app-oneclaw
pnpm add @oneclaw/auth
```

2. **配置环境变量**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 必须使用相同的 JWT 密钥！
JWT_SECRET=your-shared-jwt-secret-key

# 根域名
COOKIE_DOMAIN=.oneclaw.shop

# 自己的域名
MAIN_DOMAIN=oneclaw.shop
APP_ID=app
```

3. **添加认证中间件**

```typescript
// middleware.ts
import { withAuth } from '@oneclaw/auth';

export function middleware(request: NextRequest) {
  return withAuth({})(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

4. **登录页面**

```typescript
// app/login/page.tsx
import { redirect } from 'next/navigation';
import { isLoggedIn } from '@oneclaw/auth';

export default function LoginPage() {
  if (isLoggedIn()) {
    redirect('/');
  }
  
  // 跳转到主站登录
  const loginUrl = new URL('https://oneclaw.shop/login', request.url);
  loginUrl.searchParams.set('redirect', request.url);
  redirect(loginUrl.toString());
}
```

5. **部署**

```bash
pnpm build
# 部署到 app.oneclaw.shop
```

---

## 第五部分：数据库共享

所有应用共用一个 Supabase 数据库，表结构：

### 用户表（users）
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  openid VARCHAR(100),
  nickname VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(openid)
);
```

### 管理员表（admin_users）
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 应用业务表

各应用可以有自己的业务表：
- `tools` - 主站工具
- `skills` - 主站技能
- `app_specific_data` - 其他应用数据

---

## 第六部分：迁移检查清单

### 管理后台
- [ ] 在扣子编程新建项目
- [ ] 复制 admin-oneclaw 代码
- [ ] 配置环境变量
- [ ] 设置 Supabase 权限
- [ ] 创建初始管理员账户
- [ ] 部署并验证

### 主站
- [ ] 移除 admin 相关代码
- [ ] 更新用户认证逻辑
- [ ] 配置跨域 Cookie
- [ ] 验证 SSO 登录
- [ ] 部署并验证

### 测试
- [ ] 主站登录
- [ ] 访问管理后台（应自动登录）
- [ ] 管理后台登出
- [ ] 验证主站也登出

---

## 附录：常见问题

### Q: Cookie 不生效？
检查：
1. 域名是否正确设置为 `.oneclaw.shop`
2. 是否使用 `https`
3. 浏览器是否阻止了第三方 Cookie

### Q: Token 验证失败？
检查：
1. 所有应用的 JWT_SECRET 是否相同
2. Token 是否过期
3. Token 是否被篡改

### Q: 如何添加新应用？
1. 在扣子编程新建项目
2. 配置相同的环境变量
3. 引入 @oneclaw/auth SDK
4. 部署

### Q: 如何管理多应用数据？
在数据库中按应用隔离：
```sql
ALTER TABLE app_data ADD COLUMN app_id VARCHAR(50);
CREATE INDEX idx_app_data_app_id ON app_data(app_id);
```
