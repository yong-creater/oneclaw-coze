# 生产环境数据初始化指南

## 一键初始化

部署完成后，执行以下命令初始化所有数据：

```bash
# 查看初始化状态
curl https://oneclaw.shop/api/admin/init-production

# 执行初始化
curl -X POST https://oneclaw.shop/api/admin/init-production
```

---

## 初始化数据概览

### 分类（14个）

| 序号 | 分类名称 | Slug |
|------|---------|------|
| 1 | 视频生成 | video-generation |
| 2 | 数字人 | digital-human |
| 3 | 视频编辑 | video-editing |
| 4 | AI配音 | ai-dubbing |
| 5 | 动漫创作 | anime-creation |
| 6 | AI绘画 | ai-image |
| 7 | AI写作 | ai-writing |
| 8 | AI编程 | ai-coding |
| 9 | AI音频 | ai-audio |
| 10 | AI办公 | ai-office |
| 11 | AI营销 | ai-marketing |
| 12 | AI学习 | ai-learning |
| 13 | AI聊天 | ai-chat |
| 14 | AI搜索 | ai-search |

---

### 标签（22+）

**功能标签**
- 文生视频、图生视频、数字人口播、AI配音、视频编辑
- 4K分辨率、支持中文、长视频生成、去水印、多语言
- 图片生成、艺术创作、代码补全、AI对话、GPT-4
- 音乐生成、PPT生成、营销文案、语言学习、AI搜索
- 角色扮演、开源免费、声音克隆、会议记录

**免费类型标签**
- 完全免费、免费额度、限时免费、付费工具

**时长标签**
- 1分钟以内、1-10分钟、10分钟以上

**场景标签**
- 口播视频、电商带货、动漫制作、知识科普

**授权标签**
- 可免费商用、需授权商用、不可商用

---

### 工具（60+精选）

#### 视频生成（10个）
- Sora - OpenAI革命性AI视频
- Runway Gen-3 - 专业级AI视频生成
- Pika Labs - 简单易用AI视频
- 可灵AI - 国产最强AI视频
- 即梦AI - 字节AI视频创作
- Vidu - 国产AI视频新星
- Luma AI - 3D视频生成先锋
- LiblibAI - 一站式AI创作
- Stable Video - 开源视频生成模型

#### 数字人（5个）
- HeyGen - 顶级AI数字人平台
- Synthesia - 企业级数字人制作
- D-ID - 照片转数字人视频
- 腾讯智影 - 腾讯AI视频创作
- 小冰数字人 - 超拟真AI数字人

#### 视频编辑（5个）
- 剪映专业版 - 最强免费视频编辑
- CapCut - 全球流行视频编辑
- Runway ML - AI视频编辑套件
- Descript - AI音视频编辑
- Veed.io - 在线视频编辑平台

#### AI绘画（8个）
- Midjourney - 顶级AI绘画工具
- DALL·E 3 - OpenAI图像生成
- Stable Diffusion - 开源AI绘画模型
- Leonardo.AI - AI图像生成与编辑
- Canva AI - AI设计平台
- 即梦AI绘画 - 字节AI绘画平台
- 通义万相 - 阿里AI图像生成
- 文心一格 - 百度AI绘画平台

#### AI聊天（8个）
- ChatGPT - 最强AI对话助手
- Claude - 安全可靠AI助手
- Kimi - 超长文本AI助手
- 豆包 - 字节跳动AI助手
- Gemini - Google多模态AI
- 通义千问 - 阿里云AI对话平台
- 文心一言 - 百度AI对话平台
- 智谱清言 - 国产大语言模型

#### AI配音（4个）
- ElevenLabs - 顶级AI语音合成
- 讯飞配音 - 中文AI配音首选
- Azure TTS - 微软Azure语音服务
- Murf AI - 专业AI配音工具

#### AI写作（6个）
- Notion AI - 笔记协作AI助手
- Jasper - 营销文案AI平台
- Copy.ai - AI文案生成工具
- 秘塔写作猫 - 中文AI写作助手
- DeepL - 最准AI翻译工具
- 科大讯飞翻译 - 国产AI翻译平台

#### AI编程（4个）
- GitHub Copilot - 最强AI编程助手
- Cursor - AI原生代码编辑器
- 通义灵码 - 阿里AI编程助手
- CodeGeeX - 国产AI编程助手

#### AI音频（4个）
- Suno - AI音乐生成神器
- Udio - 高质量AI音乐生成
- Mubert - AI背景音乐生成
- 网易天音 - 网易AI音乐创作

#### AI办公（4个）
- Gamma - AI演示文稿生成
- 飞书妙记 - 会议智能记录助手
- Beautiful.ai - 智能演示文稿设计
- 通义听悟 - 阿里会议转录助手

#### AI搜索（3个）
- Perplexity - AI问答搜索引擎
- 秘塔AI搜索 - 无广告AI搜索
- 天工AI搜索 - 国产AI搜索引擎

#### AI营销（3个）
- Jasper Marketing - AI营销内容平台
- Copy.ai Marketing - 营销文案AI生成
- Writesonic - AI内容营销平台

#### AI学习（3个）
- Duolingo - AI语言学习平台
- Speak - AI英语口语练习
- Quizlet - AI智能学习卡片

#### 动漫创作（2个）
- Comic AI - AI漫画创作平台
- 巨日禄 - AI动漫视频生成

---

### Prompt模板（30个）

#### 场景描述
- 电影级风景镜头
- 产品展示视频
- 科幻城市夜景
- 自然纪录片风格
- 美食视频拍摄
- 古风仙侠场景
- 科技产品发布
- 城市延时摄影
- 太空宇宙场景
- 数字人主播开场
- 电商带货口播
- 知识科普解说
- 品牌故事叙述
- Vlog生活记录
- 产品旋转展示

#### 角色扮演
- 二次元少女
- 写实人物肖像
- 奇幻角色设计
- 职业形象照
- 动漫角色战斗

#### 风格迁移
- 复古电影风格
- 赛博朋克风格
- 水墨画风格
- 油画艺术风格
- 像素艺术风格
- 动漫渲染风格

#### 特效制作
- 爆炸特效
- 魔法粒子效果
- 火焰特效
- 闪电风暴效果

---

### 教程（10篇）

#### 入门教程
1. Sora入门指南：如何生成高质量AI视频
2. 可灵AI使用教程：国产最强视频生成工具
3. HeyGen数字人制作全攻略
4. 剪映AI功能全解析：免费也能做出爆款
5. ChatGPT高效使用技巧
6. Midjourney绘画完全指南
7. ElevenLabs配音教程：打造专业级AI语音
8. Cursor AI编程实战指南

#### 进阶技巧
- Runway Gen-3高级技巧：打造电影级视频

#### 案例分享
- AI视频制作工作流：从创意到成片

---

## 初始化响应示例

### GET 查看状态

```json
{
  "success": true,
  "status": {
    "categories": 14,
    "tags": 22,
    "tools": 60,
    "prompts": 30,
    "tutorials": 10
  },
  "needsInit": false,
  "message": "数据库已初始化"
}
```

### POST 执行初始化

```json
{
  "success": true,
  "message": "初始化完成",
  "results": {
    "categories": 14,
    "tags": 22,
    "tools": 60,
    "prompts": 30,
    "tutorials": 10
  }
}
```

---

## 手动导入

如需导入更多工具，可访问后台批量导入页面：

```
https://oneclaw.shop/admin/tools/import
```

上传JSON文件格式示例：

```json
{
  "tools": [
    {
      "name": "工具名称",
      "logo": "https://example.com/logo.png",
      "producer": "出品方",
      "highlight": "一句话亮点",
      "category": "视频生成",
      "free_type": "免费额度",
      "free_quota_desc": "$10/月",
      "official_url": "https://example.com",
      "is_featured": true,
      "feature_tags": ["文生视频", "4K分辨率"],
      "advantages": ["优势1", "优势2"],
      "limitations": ["局限1"],
      "commercial_license": "需授权商用"
    }
  ]
}
```

---

## 注意事项

1. 初始化操作是**幂等**的，重复执行不会产生重复数据
2. 初始化使用 `upsert` 操作，已存在的数据会被更新
3. 建议在生产环境部署后立即执行初始化
4. 如需重置数据，请先清空数据库表再执行初始化
