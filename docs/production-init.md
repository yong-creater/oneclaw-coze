# 生产环境数据初始化指南

## 一键初始化（推荐）

部署完成后，访问以下URL或执行curl命令：

```bash
# 查看初始化状态
curl https://oneclaw.shop/api/admin/init-production

# 执行初始化（如需要）
curl -X POST https://oneclaw.shop/api/admin/init-production
```

---

## 初始化数据统计

| 数据类型 | 数量 |
|---------|------|
| 分类 | 14 个 |
| 标签 | 22 个 |
| 工具 | ~50 个精选 |
| Prompt模板 | 17 个 |
| 教程 | 6 篇 |

---

## 工具导入

### 方法1：通过后台批量导入

1. 访问后台：`https://oneclaw.shop/admin/tools/import`
2. 上传JSON文件或粘贴JSON数据
3. 点击"开始导入"

### 方法2：通过API导入

```bash
# 导入工具
curl -X POST https://oneclaw.shop/api/admin/tools/import \
  -H "Content-Type: application/json" \
  -d '{"tools": [...工具数组...]}'

# 导入Prompt模板
curl -X POST https://oneclaw.shop/api/prompts/import \
  -H "Content-Type: application/json" \
  -d '{"prompts": [...模板数组...]}'

# 导入教程
curl -X POST https://oneclaw.shop/api/tutorials/import \
  -H "Content-Type: application/json" \
  -d '{"tutorials": [...教程数组...]}'
```

---

## 工具数据格式

```json
{
  "name": "工具名称",
  "logo": "https://example.com/logo.png",
  "producer": "出品方",
  "category": "视频生成",
  "pricing": "免费额度，$10/月起",
  "description": "工具描述",
  "url": "https://example.com",
  "featured": true,
  "tags": ["文生视频", "4K分辨率"],
  "features": ["特性1", "特性2", "特性3"]
}
```

### 分类对照表

| 分类名称 | slug |
|---------|------|
| 视频生成 | video-generation |
| 数字人 | digital-human |
| 视频编辑 | video-editing |
| AI配音 | ai-dubbing |
| 动漫创作 | anime-creation |
| AI绘画 | ai-image |
| AI写作 | ai-writing |
| AI编程 | ai-coding |
| AI音频 | ai-audio |
| AI办公 | ai-office |
| AI营销 | ai-marketing |
| AI学习 | ai-learning |
| AI聊天 | ai-chat |
| AI搜索 | ai-search |

---

## Prompt数据格式

```json
{
  "title": "Prompt标题",
  "content": "Prompt内容...",
  "category": "场景描述",
  "tags": ["标签1", "标签2"]
}
```

### Prompt分类

- 场景描述
- 角色扮演
- 风格迁移
- 特效制作

---

## 教程数据格式

```json
{
  "title": "教程标题",
  "content": "教程内容（支持Markdown）...",
  "category": "入门教程",
  "difficulty": "初级",
  "is_featured": true
}
```

### 教程分类

- 入门教程
- 进阶技巧
- 案例分享

### 难度等级

- 初级
- 中级
- 高级
