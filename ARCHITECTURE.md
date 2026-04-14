# Monorepo 架构说明

## 推荐方案：单项目 + 路由区分

这是最简单高效的方案，当前项目已经是这种结构。

```
oneclaw/
├── src/
│   ├── app/                    # 前台页面 → /
│   │   ├── page.tsx           # 首页
│   │   ├── tools/             # 工具列表
│   │   └── ...
│   ├── app/admin/              # 后台页面 → /admin
│   │   ├── page.tsx          # 仪表盘
│   │   └── tools/             # 工具管理
│   └── app/api/               # 前后台共用 API
│       ├── tools/             # 前台工具 API
│       └── admin/              # 后台管理 API
└── src/storage/               # 共用数据库连接
```

**优点：**
- 一次改动，前后都生效
- 共用组件、共用类型
- 一次部署，全部更新
- 维护成本最低

---

## 可选方案：pnpm workspaces 拆分

如果确实需要两个独立项目，使用 workspaces 共享代码：

```
oneclaw/
├── packages/
│   ├── shared/                 # 共享包
│   │   ├── src/
│   │   │   ├── database/      # 数据库连接
│   │   │   ├── types/         # 共享类型
│   │   │   └── utils/         # 工具函数
│   │   └── package.json
│   ├── main-site/              # 主站
│   │   ├── src/app/           # 前台页面
│   │   └── package.json       # dependencies: { "@oneclaw/shared": "workspace:*" }
│   └── admin-site/             # 管理后台
│       ├── src/app/admin/     # 后台页面
│       └── package.json       # dependencies: { "@oneclaw/shared": "workspace:*" }
├── pnpm-workspace.yaml
└── package.json
```

### 部署策略

| 方案 | 主站 | 后台 | 数据同步 |
|------|------|------|----------|
| 单项目 | / | /admin | 自动同步 |
| 两个独立项目 | 主站部署 | 后台部署 | 共用数据库 |

---

## 数据关联方案

无论哪种部署方式，数据通过**同一个火山引擎 PostgreSQL 数据库**关联：

```
┌─────────────────────────────────────────────────┐
│           火山引擎 PostgreSQL                     │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │ categories│  tools   │  users   │ reviews  │  │
│  └──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────┘
        ↑                ↑                ↑
    主站读取          后台管理          前后台共用
```

### 环境变量（扣子平台自动注入）

```bash
# 主站和后台共用同样的数据库连接
COZE_SUPABASE_URL=postgres://xxx
COZE_SUPABASE_ANON_KEY=xxx
```

两个项目通过相同的 Supabase SDK 连接同一个数据库，实现数据互通。

---

## 建议

**继续使用当前的单项目架构**，因为：

1. ✅ 开发效率最高（改一处生效）
2. ✅ 部署最简单（一次部署全部更新）
3. ✅ 数据库天然共享
4. ✅ 代码复用最大化

如果将来业务量非常大，需要独立团队开发，再考虑拆分。
