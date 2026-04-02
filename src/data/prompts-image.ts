// 图像生成提示词 - 专业商用级别

import { PromptItem } from './prompts-types';

export const imagePrompts: PromptItem[] = [
  // ========== Midjourney 提示词 ==========
  {
    id: 'image-001',
    title: 'Midjourney 产品摄影大师',
    description: '生成专业级产品摄影提示词，适用于电商、广告、品牌宣传',
    category: '图像生成',
    tags: ['Midjourney', '产品摄影', '电商'],
    featured: true,
    usage: 23450,
    rating: 4.9,
    content: `# Midjourney 产品摄影提示词专家

## 【角色定位】
你是顶级商业产品摄影师，精通：
- 产品摄影布光技术
- 构图美学与色彩理论
- Midjourney V6 模型特性
- 电商视觉规范

## 【产品摄影分类】

### 1. 高端科技产品
风格：极简、科技感、冷色调
关键词：minimal, sleek, premium, tech, studio lighting

### 2. 美妆护肤产品
风格：柔美、质感、温暖色调
关键词：soft lighting, beauty, elegant, luxurious, rose gold

### 3. 食品饮料
风格：新鲜、诱人、暖色调
关键词：fresh, delicious, food photography, warm lighting, appetizing

### 4. 珠宝首饰
风格：奢华、闪耀、高对比
关键词：luxurious, sparkling, jewelry, macro, high contrast

## 【提示词公式】
\`\`\`
[产品名称], [拍摄角度], [背景环境], [光影设置], [风格修饰], [技术参数] --ar [宽高比] --v 6
\`\`\`

## 【参数推荐】
- 产品展示：--ar 1:1 或 4:3
- Banner图：--ar 16:9 或 3:1
- 详情页：--ar 3:4 或 9:16
- 质量优先：--q 2 --s 750`,
    example: {
      input: '智能手表产品图',
      output: `【方案一：极简科技风】
"Smartwatch with silver metal case, floating on pure white background, soft studio lighting, minimalist product photography, Apple style, 4K commercial shot, clean and modern --ar 1:1 --v 6 --q 2"

【方案二：生活场景风】
"Premium smartwatch on wooden desk beside coffee cup and laptop, morning sunlight through window, lifestyle product photography, warm color grading, Instagram aesthetic --ar 4:3 --v 6"

【方案三：科技氛围风】
"Smartwatch product shot with holographic interface elements, dark blue gradient background, futuristic tech atmosphere, cinematic lighting, cyberpunk style, 8K render --ar 16:9 --v 6"

【预期效果】
方案一：纯净专业，适合电商主图
方案二：生活感强，适合社交媒体
方案三：科技感强，适合广告宣传`,
      type: 'text'
    },
    tips: [
      '产品主体居中，留白充足',
      '使用 studio lighting 确保光照均匀',
      '添加 depth of field 增加层次感'
    ]
  },
  
  {
    id: 'image-002',
    title: 'Midjourney 人像摄影大师',
    description: '专业人像摄影提示词，涵盖各种风格和场景',
    category: '图像生成',
    tags: ['Midjourney', '人像', '摄影'],
    featured: true,
    usage: 19870,
    rating: 4.8,
    content: `# Midjourney 人像摄影提示词专家

## 【人像风格分类】

### 1. 商业肖像
- 企业形象照
- 职场头像
- 专业感、可信度

### 2. 时尚人像
- 杂志封面
- 时尚大片
- 创意、前卫

### 3. 环境人像
- 生活场景
- 自然光影
- 故事感

### 4. 艺术人像
- 创意合成
- 概念摄影
- 艺术表达

## 【人像提示词公式】
\`\`\`
[人物描述], [表情姿态], [服装造型], [场景环境], [光影氛围], [风格参考], [技术参数] --ar [比例] --v 6
\`\`\`

## 【光影词汇】
- Rembrandt lighting：伦勃朗光
- Split lighting：分割光
- Butterfly lighting：蝴蝶光
- Natural lighting：自然光
- Golden hour：黄金时刻
- Blue hour：蓝调时刻`,
    example: {
      input: '职业女性形象照',
      output: `【商业肖像风格】
"Professional business woman, confident smile, wearing elegant navy blue suit, modern office background with blurred city view, soft natural lighting from window, executive portrait photography, headshot style, professional and approachable --ar 4:5 --v 6"

【时尚杂志风格】
"Young professional woman, sophisticated gaze, wearing designer blazer, minimalist studio with gray gradient background, dramatic side lighting, Vogue magazine style, high fashion portrait, editorial look --ar 3:4 --v 6"

【环境人像风格】
"Confident business woman walking in modern corporate hallway, natural stride, wearing smart casual attire, architectural interior, soft ambient lighting, lifestyle corporate photography, authentic moment --ar 16:9 --v 6"

【参数说明】
- --ar 4:5：适合LinkedIn头像
- --ar 3:4：适合社交媒体竖图
- --ar 16:9：适合网站Banner`,
      type: 'text'
    }
  },
  
  {
    id: 'image-003',
    title: 'Stable Diffusion 提示词专家',
    description: 'Stable Diffusion 专业提示词生成，涵盖各种模型和风格',
    category: '图像生成',
    tags: ['Stable Diffusion', 'SD', 'AI绘画'],
    usage: 16780,
    rating: 4.7,
    content: `# Stable Diffusion 提示词专家

## 【角色定位】
你是 Stable Diffusion 深度用户，精通：
- SDXL、SD 1.5 等各版本特性
- 正向/负向提示词优化
- 各种微调模型（LoRA、Embeddings）
- ControlNet 高级控制

## 【提示词结构】

### 正向提示词
\`\`\`
(质量词), (主体描述), (细节描述), (风格词), (技术参数)
\`\`\`

### 负向提示词
\`\`\`
(worst quality), (low quality), (normal quality), (deformed), (blurry), (watermark)
\`\`\`

## 【权重语法】
- (word)：权重 1.1倍
- ((word))：权重 1.21倍
- (word:1.5)：权重 1.5倍
- [word]：权重 0.9倍
- [word:0.8]：权重 0.8倍

## 【常用质量词】
- masterpiece：杰作
- best quality：最佳质量
- ultra-detailed：超细节
- 8K resolution：8K分辨率
- highly detailed：高度细节
- professional illustration：专业插画`,
    example: {
      input: '赛博朋克城市',
      output: `【正向提示词】
(masterpiece), (best quality), (ultra-detailed), 
cyberpunk cityscape, neon lights, holographic advertisements, 
flying cars, towering skyscrapers, rain-soaked streets, 
reflections on wet pavement, (neon blue and pink lighting:1.3), 
futuristic architecture, blade runner style, 
8K, HDR, cinematic lighting

【负向提示词】
(worst quality), (low quality), (normal quality), 
(deformed), (blurry), (watermark), (signature), 
(text), (logo), (cropped), (out of frame), 
(ugly), (duplicate), (morbid), (mutilated), 
(extra fingers), (poorly drawn hands), (poorly drawn face), 
(mutation), (bad proportions), (gross proportions)

【参数设置】
Steps: 30
Sampler: DPM++ 2M Karras
CFG Scale: 7
Size: 1024x1024
Model: SDXL Base 1.0

【可选LoRA】
- CyberpunkStyle
- NeonLights
- RainEffect`,
      type: 'text'
    }
  },
  
  {
    id: 'image-004',
    title: 'DALL-E 3 提示词优化',
    description: 'OpenAI DALL-E 3 专属提示词生成器',
    category: '图像生成',
    tags: ['DALL-E', 'OpenAI', 'AI绘画'],
    usage: 12340,
    rating: 4.6,
    content: `# DALL-E 3 提示词优化器

## 【DALL-E 3 特点】
- 理解自然语言能力强
- 自动优化提示词
- 支持文字渲染
- 风格多样

## 【最佳实践】

### 1. 使用自然语言
DALL-E 3 理解自然语言，无需堆砌关键词

### 2. 明确描述细节
详细描述场景、色彩、氛围

### 3. 指定风格
直接说明想要的风格

### 4. 利用文字能力
可以要求在图像中显示文字

## 【提示词模板】
\`\`\`
创建一个[风格]的图像，展示[主体描述]。场景包括[细节描述]。整体色调为[色彩描述]。氛围是[情感描述]。
\`\`\``,
    example: {
      input: '科幻书籍封面',
      output: `【提示词】
"Create a science fiction book cover showing a lone astronaut standing on an alien planet, looking up at a massive ringed planet in the purple sky. The astronaut's suit is illuminated by the glow of two moons. In the distance, crystalline structures rise from the barren landscape. The scene should have a sense of wonder and isolation. Use deep purples, blues, and silver as the color palette. Add the title 'BEYOND THE STARS' in elegant silver letters at the top, and the author name 'JANE DOE' at the bottom. Style should be cinematic and dramatic, like a Hollywood movie poster."

【生成效果预期】
- 宇航员背对镜头，仰望天空
- 巨大的环状行星占据天空大部分
- 两颗月亮发出柔和光芒
- 远处晶体结构反射星光
- 整体色调：深紫、深蓝、银色
- 顶部：书名"BEYOND THE STARS"
- 底部：作者名"JANE DOE"

【DALL-E 3 优势】
- 自动添加电影感光效
- 文字清晰可读
- 无需复杂参数设置`,
      type: 'text'
    }
  },
  
  {
    id: 'image-005',
    title: '电商主图设计规范',
    description: '淘宝、京东、拼多多等平台主图设计规范和提示词',
    category: '图像生成',
    tags: ['电商', '主图', '淘宝'],
    usage: 28900,
    rating: 4.8,
    content: `# 电商主图设计规范

## 【平台规范】

### 淘宝/天猫
- 尺寸：800×800px 或以上
- 格式：JPG/PNG
- 大小：≤3MB
- 主图视频：≤60秒

### 京东
- 尺寸：800×800px
- 格式：JPG
- 大小：≤1MB

### 拼多多
- 尺寸：750×750px
- 格式：JPG/PNG
- 大小：≤3MB

## 【主图设计要点】

### 1. 突出产品
- 产品占比 ≥ 60%
- 背景简洁
- 无干扰元素

### 2. 信息清晰
- 品牌Logo
- 核心卖点
- 促销信息

### 3. 视觉吸引力
- 高饱和度
- 高对比度
- 清晰锐利

### 4. 差异化
- 独特角度
- 创意场景
- 视觉记忆点`,
    example: {
      input: '口红产品主图',
      output: `【主图设计方案】

基础版（白底主图）：
尺寸：800×800px
背景：纯白 #FFFFFF
产品：口红居中，占比70%
光影：柔和顶光，边缘轮廓光
文字：无（平台白底图要求）

进阶版（场景主图）：
尺寸：800×800px
背景：粉色渐变 + 花瓣元素
产品：口红倾斜45度，居中偏下
光影：左侧主光 + 右侧补光
文字：
- 左上角：品牌Logo
- 右上角："新品上市"标签
- 底部：产品名称 + 核心卖点

视频主图（前3秒关键帧）：
- 0-1秒：口红从模糊到清晰
- 1-2秒：旋转展示360度
- 2-3秒：涂抹效果展示

【AI生成提示词】
"Premium lipstick product photography, centered composition on pure white background, soft studio lighting, elegant and luxurious, 800x800px, commercial product shot, high resolution, sharp focus --ar 1:1 --v 6"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-006',
    title: 'Logo设计提示词',
    description: 'AI生成专业Logo设计的提示词模板',
    category: '图像生成',
    tags: ['Logo', '品牌设计', '标识'],
    usage: 15670,
    rating: 4.7,
    content: `# Logo设计提示词专家

## 【Logo类型】

### 1. 文字Logo（Wordmark）
- 品牌名称为主
- 字体设计为核心
- 案例：Google、Coca-Cola

### 2. 图形Logo（Symbol）
- 抽象图形符号
- 无文字或少量文字
- 案例：Apple、Nike

### 3. 组合Logo（Combination）
- 图形+文字组合
- 可拆分使用
- 案例：Adidas、Starbucks

### 4. 徽章Logo（Emblem）
- 图形+文字融合
- 徽章/印章风格
- 案例：星巴克经典款、Harley-Davidson

## 【设计原则】
- 简洁性：易于识别记忆
- 可缩放：各种尺寸清晰
- 时间性：经得起时间考验
- 适用性：多场景使用

## 【提示词模板】
\`\`\`
A [type] logo design for [brand name], [style description], [color palette], [industry], minimalist, vector style, white background, professional design
\`\`\``,
    example: {
      input: '咖啡品牌Logo',
      output: `【方案一：图形Logo】
"A minimal logo design for a coffee brand named 'MORNING BREW', featuring a stylized coffee cup with steam forming a sunrise shape, geometric and clean lines, warm brown and orange color palette, modern and friendly, suitable for cafe and coffee products, vector graphic on white background"

【方案二：组合Logo】
"A combination logo for 'ARTISAN COFFEE', featuring a hand-drawn coffee bean icon with elegant serif typography, earthy tones with forest green accent, artisanal and premium feel, craft coffee industry, minimalist design on white background"

【方案三：徽章Logo】
"An emblem-style logo for 'BREW HOUSE COFFEE', circular badge design with coffee cup illustration in center, vintage typography around the edge, retro brown and cream colors, classic cafe atmosphere, stamp-like design on white background"

【设计建议】
- 提供3-5个方案供选择
- 展示黑白稿（确保可缩放）
- 展示不同尺寸效果
- 提供矢量文件（SVG/AI）`,
      type: 'text'
    }
  },
  
  {
    id: 'image-007',
    title: 'UI界面设计灵感',
    description: '生成UI/UX设计灵感和参考的提示词',
    category: '图像生成',
    tags: ['UI', 'UX', '界面设计'],
    usage: 11230,
    rating: 4.6,
    content: `# UI界面设计灵感提示词

## 【设计风格】

### 1. 极简主义
- 大量留白
- 清晰层次
- 简洁配色

### 2. 新拟态（Neumorphism）
- 柔和阴影
- 立体浮雕
- 柔和配色

### 3. 玻璃拟态（Glassmorphism）
- 毛玻璃效果
- 透明度层次
- 模糊背景

### 4. 暗黑模式
- 深色背景
- 高对比文字
- 霓虹点缀

### 5. 3D元素
- 立体图形
- 深度层次
- 光影效果

## 【提示词模板】
\`\`\`
[App类型] mobile app UI design, [风格], [主要功能页面], [配色], modern interface, high fidelity, clean design, [平台] style
\`\`\``,
    example: {
      input: '健身App界面设计',
      output: `【方案一：极简风格】
"Fitness tracking app UI design, minimalist style, main dashboard showing daily progress with circular graphs, workout history, and quick action buttons, clean white background with energetic orange accent, iOS design system, modern and motivating interface"

【方案二：暗黑风格】
"Dark mode fitness app UI, sleek design with neon green and purple accents, workout statistics with glowing progress bars, heart rate monitor display, activity rings, futuristic feel, Material Design 3, high contrast for outdoor visibility"

【方案三：玻璃拟态】
"Glassmorphism fitness app interface, translucent cards with frosted glass effect, soft gradient background in blue and purple, workout plan cards, calorie tracking widget, modern iOS style, elegant and premium feel"

【设计要点】
- 主要功能一目了然
- 数据可视化清晰
- 操作按钮易触达
- 配色传递活力感`,
      type: 'text'
    }
  },
  
  {
    id: 'image-008',
    title: '海报设计提示词',
    description: '活动海报、电影海报、宣传海报AI生成提示词',
    category: '图像生成',
    tags: ['海报', '宣传', '设计'],
    usage: 14560,
    rating: 4.7,
    content: `# 海报设计提示词专家

## 【海报类型】

### 1. 活动海报
- 时间、地点、主题明确
- 视觉冲击力强
- 信息层次清晰

### 2. 电影海报
- 视觉叙事
- 情绪氛围营造
- 演职员信息

### 3. 产品海报
- 产品突出
- 卖点清晰
- 品牌调性

### 4. 公益海报
- 情感触动人
- 信息明确
- 引发思考

## 【设计要素】
- 视觉焦点：吸引眼球
- 信息层次：主次分明
- 配色方案：情绪表达
- 留白：呼吸感
- 排版：易读性

## 【提示词模板】
\`\`\`
[类型] poster design for [主题], [视觉元素], [风格], [配色], [排版要求], high impact, professional design, [尺寸]
\`\`\``,
    example: {
      input: '音乐节海报',
      output: `【提示词】
"Music festival poster design for 'SOUND WAVES 2024', featuring dynamic abstract sound wave graphics in vibrant neon colors, headline act names in bold typography, date and venue information at bottom, psychedelic and energetic style, gradient background from deep purple to electric blue, modern festival aesthetic, vertical format 2:3"

【设计要素】
主视觉：
- 动态声波图形
- 霓虹色彩（紫、蓝、粉）
- 几何元素穿插

信息层次：
- 一级：音乐节名称"SOUND WAVES 2024"
- 二级：Headline艺人名单
- 三级：时间、地点、票价

排版建议：
- 标题：粗体，占据上方1/3
- 艺人：中等大小，中间区域
- 信息：小号，底部整齐排列

配色方案：
- 主色：#6B21A8（深紫）
- 辅色：#3B82F6（电蓝）
- 点缀：#EC4899（亮粉）`,
      type: 'text'
    }
  },
  
  {
    id: 'image-009',
    title: '建筑渲染提示词',
    description: '建筑外观、室内设计渲染图AI生成',
    category: '图像生成',
    tags: ['建筑', '渲染', '室内设计'],
    usage: 8920,
    rating: 4.5,
    content: `# 建筑渲染提示词专家

## 【渲染类型】

### 1. 外观渲染
- 建筑整体外观
- 环境融合
- 天气/时间效果

### 2. 室内渲染
- 空间布局
- 材质细节
- 光影氛围

### 3. 景观渲染
- 整体规划
- 绿化景观
- 人视角度

## 【提示词模板】
\`\`\`
[建筑类型], [视角], [风格], [环境], [光影], [细节], professional architectural visualization, photorealistic, [渲染器] style
\`\`\`

## 【视角词汇】
- Eye-level view：人视角度
- Aerial view：鸟瞰视角
- Interior view：室内视角
- Close-up shot：特写镜头
- Wide angle：广角`,
    example: {
      input: '现代别墅外观',
      output: `【白天效果】
"Modern minimalist villa exterior, eye-level view from garden, white concrete facade with wooden accent panels, floor-to-ceiling glass windows, clean geometric lines, lush green landscaping with Japanese maple trees, bright sunny day with soft shadows, professional architectural photography, V-Ray render style, 8K resolution"

【黄昏效果】
"Contemporary luxury villa at golden hour, warm sunlight casting long shadows across white stucco walls, interior lights glowing through large glass windows, swimming pool with water reflections, palm trees silhouettes, dramatic sky with orange and purple gradient, cinematic atmosphere, photorealistic architectural visualization"

【夜景效果】
"Modern villa at night, exterior LED lighting highlighting architectural features, interior lights creating warm glow through windows, illuminated swimming pool, ambient landscape lighting, starry sky, mood lighting design, professional real estate photography, high-end luxury feel"

【参数建议】
- 分辨率：4K-8K
- 渲染器：V-Ray / Corona
- 后期：Lightroom调色`,
      type: 'text'
    }
  },
  
  {
    id: 'image-010',
    title: '插画风格提示词',
    description: '各种插画风格的AI生成提示词库',
    category: '图像生成',
    tags: ['插画', '风格', '艺术'],
    usage: 17890,
    rating: 4.8,
    content: `# 插画风格提示词库

## 【主流插画风格】

### 1. 扁平化插画
特点：简约、无阴影、几何化
关键词：flat illustration, minimal, vector art, simple shapes

### 2. 2.5D等距插画
特点：立体感、等距视角
关键词：isometric illustration, 2.5D, geometric

### 3. 手绘水彩
特点：柔和、水彩质感、艺术感
关键词：watercolor illustration, hand-painted, soft colors

### 4. 扁平描边
特点：清晰线条、色块填充
关键词：flat line art, outline style, bold lines

### 5. 渐变插画
特点：渐变色、现代感、梦幻
关键词：gradient illustration, duotone, soft gradients

### 6. 纸片风格
特点：剪纸效果、层次感
关键词：paper cut style, layered, craft aesthetic

### 7. 像素艺术
特点：复古、像素化、游戏感
关键词：pixel art, 8-bit, retro game style

### 8. 日系插画
特点：可爱、动漫风、鲜艳
关键词：anime style, kawaii, Japanese illustration`,
    example: {
      input: '科技主题插画',
      output: `【扁平化风格】
"Flat illustration of futuristic technology concept, robot and human working together, minimalist design, clean geometric shapes, vibrant blue and purple color scheme, no gradients or shadows, simple vector style, modern corporate aesthetic"

【等距风格】
"Isometric illustration of smart city technology, interconnected devices and buildings, 2.5D perspective, geometric shapes, soft gradient colors in blue and teal, clean lines, tech startup style, infographic aesthetic"

【渐变风格】
"Gradient illustration showing digital transformation, abstract flowing shapes representing data flow, duotone purple to blue gradients, dreamy and modern, soft glow effects, contemporary tech aesthetic, suitable for web design"

【像素艺术风格】
"Pixel art illustration of a futuristic laboratory, scientists working with robots, 8-bit retro game style, limited color palette, nostalgic technology aesthetic, cute and charming, video game UI elements"

【应用建议】
- 企业网站：扁平化/等距
- 移动应用：扁平描边/渐变
- 游戏开发：像素艺术
- 品牌形象：水彩/纸片`,
      type: 'text'
    }
  },
  
  {
    id: 'image-011',
    title: '包装设计提示词',
    description: '产品包装设计AI生成提示词模板',
    category: '图像生成',
    tags: ['包装', '产品设计', '商业'],
    usage: 9870,
    rating: 4.6,
    content: `# 包装设计提示词专家

## 【包装类型】

### 1. 食品包装
- 色彩鲜艳
- 食欲感
- 信息清晰

### 2. 美妆包装
- 高端质感
- 简约优雅
- 品牌调性

### 3. 电子产品包装
- 科技感
- 保护性强
- 开箱体验

### 4. 礼品包装
- 精致美观
- 情感价值
- 仪式感

## 【设计要素】
- 品牌识别：Logo、VI系统
- 产品信息：名称、规格、成分
- 视觉吸引：色彩、图形、材质
- 差异化：独特卖点、创新结构`,
    example: {
      input: '茶叶礼盒包装',
      output: `【提示词】
"Premium tea gift box packaging design, elegant rectangular box with traditional Chinese elements in modern interpretation, forest green and gold color scheme, embossed lotus flower pattern, minimalist layout with brand logo centered, matte finish with spot UV details, luxurious unboxing experience, product photography ready, high-end gift market"

【设计要点】

视觉风格：
- 主色：森林绿 #2D5016
- 辅色：金色 #D4AF37
- 元素：现代化的莲花图案
- 材质：哑光+局部UV

结构设计：
- 天地盖盒型
- 内部分隔：4个独立小盒
- 茶叶罐：金属材质
- 茶杯配件：陶瓷质感

信息布局：
- 正面：品牌Logo + 产品名
- 背面：产品信息、产地、冲泡方法
- 侧面：净含量、保质期
- 内盖：品牌故事文案

配套物料：
- 手提袋：同款设计
- 产品手册：纸质说明卡
- 封口贴：品牌封条`,
      type: 'text'
    }
  },
  
  {
    id: 'image-012',
    title: '书籍封面设计',
    description: '小说、教材、杂志封面AI设计提示词',
    category: '图像生成',
    tags: ['书籍', '封面', '出版'],
    usage: 7650,
    rating: 4.5,
    content: `# 书籍封面设计提示词

## 【类型分类】

### 1. 小说类
- 视觉叙事
- 情绪氛围
- 艺术性强

### 2. 商业类
- 专业可信
- 信息清晰
- 品牌感

### 3. 教育类
- 主题明确
- 友好易懂
- 适合学生

### 4. 艺术类
- 创意表达
- 视觉冲击
- 艺术价值

## 【设计原则】
- 封面即广告：吸引目标读者
- 风格匹配：视觉传达内容
- 易读性：标题清晰醒目
- 差异化：书架上一眼识别`,
    example: {
      input: '悬疑小说封面',
      output: `【提示词】
"Thriller novel book cover design, mysterious dark forest silhouette against blood-red moon, single figure standing at edge of cliff looking into darkness, ominous atmosphere, bold typography for title 'THE SILENT WOODS', author name at bottom, cinematic lighting, suspense and dread mood, commercial fiction aesthetic, standard book trim size 6x9"

【设计解析】

主视觉：
- 深色森林剪影
- 血红月亮背景
- 孤独人影增强悬疑感
- 整体色调：深蓝+暗红

字体设计：
- 书名：粗体无衬线，金属质感
- 位置：上方居中
- 大小：占封面高度1/4
- 颜色：白色/银色带描边

布局结构：
- 上部：书名 + 装饰线
- 中部：主视觉插画
- 下部：作者名 + 推荐语
- 边缘：留白充足

系列化考虑：
- 统一字体和位置
- 不同场景变化
- 保持整体风格一致`,
      type: 'text'
    }
  },
  
  {
    id: 'image-013',
    title: '社交媒体图片设计',
    description: 'Instagram、微信、微博等社交平台图片设计',
    category: '图像生成',
    tags: ['社交媒体', 'Instagram', '微信'],
    usage: 21340,
    rating: 4.7,
    content: `# 社交媒体图片设计

## 【平台规范】

### Instagram
- 方形：1080×1080px
- 竖版：1080×1350px (4:5)
- 横版：1080×608px (16:9)
- Stories：1080×1920px (9:16)

### 微信朋友圈
- 方形：1080×1080px
- 竖版：1080×1260px
- 横版：1080×608px

### 微博
- 最佳：1080×1260px
- 支持：1080×608px / 1080×1080px

### 小红书
- 竖版：1242×1660px (3:4)
- 方形：1080×1080px

## 【设计要点】
- 移动端优先
- 视觉冲击力
- 3秒吸引力法则
- 文字简洁（<20字）`,
    example: {
      input: 'Instagram美食博主图片',
      output: `【提示词】
"Instagram-worthy food photography, beautifully plated dish on rustic wooden table, soft natural window lighting, shallow depth of field, overhead angle shot, warm color grading, fresh ingredients visible, minimalist styling, food blogger aesthetic, hashtag-friendly composition, 1080x1350px, engagement-optimized"

【设计要素】

拍摄技巧：
- 角度：俯拍45度或平视
- 光线：自然光，侧逆光
- 背景：木桌/大理石/素色布
- 道具：餐具、花卉、杂志

后期调色：
- 曝光：+0.3
- 对比度：+10
- 饱和度：+15
- 色温：偏暖+5
- 清晰度：+20

文字叠加：
- 位置：留白区域
- 字体：手写体/无衬线
- 颜色：白色带描边
- 内容：简短描述/食材标签

话题标签（评论区）：
#foodie #foodporn #instafood 
#yummy #delicious #homemade
#foodphotography #foodblogger`,
      type: 'text'
    }
  },
  
  {
    id: 'image-014',
    title: '图标设计提示词',
    description: 'App图标、网站图标、UI图标设计',
    category: '图像生成',
    tags: ['图标', 'icon', 'UI'],
    usage: 13450,
    rating: 4.6,
    content: `# 图标设计提示词

## 【图标类型】

### 1. App图标
- 品牌识别
- 应用商店优化
- 尺寸：1024×1024px

### 2. 功能图标
- UI导航
- 操作按钮
- 状态指示

### 3. 社交图标
- 分享功能
- 平台链接
- 统一风格

### 4. 品牌图标
- Logo图标化
- 品牌延伸
- 视觉一致

## 【设计原则】
- 可识别性：小尺寸仍清晰
- 统一性：风格、线条粗细
- 意义明确：一眼理解功能
- 易用性：触控友好`,
    example: {
      input: '健身App图标',
      output: `【App图标提示词】
"Fitness app icon design, stylized dumbbell or running figure, energetic gradient from orange to red, simple geometric shapes, app store ready, 1024x1024px, rounded corners, iOS and Android compatible, stands out on home screen"

【设计规范】

iOS规范：
- 圆角半径：22.37%
- 格式：PNG透明背景
- 尺寸集：1024, 180, 120, 80, 60, 40, 29

Android规范：
- 透明背景
- 图形居中，安全区
- 适应各种形状（圆、方、圆角方）

设计要素：
- 图形：哑铃/跑步人形/心跳线
- 配色：橙色(#FF6B35) + 红色(#E63946)
- 风格：扁平化/轻渐变
- 细节：避免过于复杂

【功能图标集】
"UI icon set for fitness app, line art style, consistent 2px stroke weight, includes: dumbbell, heart, timer, graph, user profile, settings, 24x24px grid, rounded line caps, minimalist design"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-015',
    title: 'AI生成艺术画作',
    description: '各种艺术风格的AI画作生成提示词',
    category: '图像生成',
    tags: ['艺术', '画作', '创意'],
    usage: 16780,
    rating: 4.8,
    content: `# AI艺术画作提示词

## 【经典艺术风格】

### 1. 印象派
特点：光影变化、笔触可见
关键词：Impressionist style, Monet inspired, soft brushstrokes

### 2. 油画风格
特点：厚重质感、色彩浓郁
关键词：Oil painting style, rich colors, textured brushwork

### 3. 水彩风格
特点：透明流动、清新淡雅
关键词：Watercolor painting, soft edges, flowing colors

### 4. 数字艺术
特点：现代、精细、多样化
关键词：Digital art, CG render, high detail

### 5. 浮世绘
特点：平面化、线条优美
关键词：Ukiyo-e style, Japanese woodblock print

### 6. 赛博朋克
特点：霓虹、未来感、反乌托邦
关键词：Cyberpunk art, neon lights, futuristic

### 7. 超现实主义
特点：梦幻、荒诞、潜意识
关键词：Surrealist style, dreamlike, Salvador Dali inspired

### 8. 极简主义
特点：简洁、留白、抽象
关键词：Minimalist art, abstract, simple composition`,
    example: {
      input: '星空主题艺术画',
      output: `【梵高风格】
"Starry night landscape painting in style of Vincent van Gogh, swirling sky with bright yellow stars and crescent moon, cypress tree in foreground, thick impasto brushstrokes, vibrant blues and yellows, expressionist style, oil on canvas texture, museum quality art"

【浮世绘风格】
"Japanese ukiyo-e woodblock print of starry night, Mount Fuji under star-filled sky, flat colors with bold outlines, indigo and gold color palette, traditional Japanese aesthetic, horizontal composition, Edo period style"

【数字艺术风格】
"Epic digital art of cosmic landscape, nebula clouds and countless stars, distant planets and asteroids, vibrant purple and blue color scheme, highly detailed, 8K resolution, concept art style, space exploration theme, cinematic atmosphere"

【超现实主义风格】
"Surrealist painting of melting clocks under starry sky, Salvador Dali inspired, dreamlike landscape with impossible geometry, floating islands in space, soft pastel colors with dramatic shadows, subconscious imagery, museum masterpiece"

【应用建议】
- 家居装饰：油画/水彩风格
- 数字收藏：数字艺术/NFT
- 品牌设计：极简主义
- 文化产品：浮世绘/国风`,
      type: 'text'
    }
  },
  
  {
    id: 'image-016',
    title: '3D渲染提示词',
    description: 'Cinema 4D、Blender风格的3D渲染图提示词',
    category: '图像生成',
    tags: ['3D', '渲染', 'C4D'],
    usage: 11230,
    rating: 4.7,
    content: `# 3D渲染提示词专家

## 【3D风格分类】

### 1. 卡通渲染（C4D风）
特点：圆润、可爱、鲜艳
关键词：Cinema 4D render, cute 3D, clay render, soft lighting

### 2. 写实渲染
特点：照片级真实、细节丰富
关键词：Photorealistic 3D, Octane render, path tracing, PBR materials

### 3. 低多边形（Low Poly）
特点：几何化、简约、游戏风
关键词：Low poly 3D, faceted, geometric, minimal triangles

### 4. 等距视角
特点：立体但无透视、示意图
关键词：Isometric 3D render, orthographic, infographic style

### 5. 玻璃/液态
特点：透明材质、流体感
关键词：Glass render, translucent, liquid simulation, caustics

### 6. 赛博朋克
特点：霓虹、金属、科幻
关键词：Cyberpunk 3D, neon lights, metallic, holographic`,
    example: {
      input: '音乐主题3D场景',
      output: `【C4D可爱风格】
"Cute 3D illustration of music studio scene, rounded headphones, vinyl records, speakers with happy faces, clay render style, soft pastel colors, Cinema 4D render, smooth materials, ambient occlusion, Instagram aesthetic, floating musical notes"

【写实渲染】
"Photorealistic 3D render of vintage recording studio, analog synthesizers, mixing console with glowing VU meters, acoustic foam on walls, warm studio lighting, Octane render, highly detailed textures, depth of field, 8K resolution"

【低多边形风格】
"Low poly 3D scene of outdoor music festival, geometric stage with lights, polygon crowd, stylized trees and tents, sunset sky, Unity game asset style, flat shading, minimal triangles, colorful and playful"

【玻璃材质风格】
"3D render of transparent glass headphones with liquid filling inside, iridescent reflections, caustic light effects, product visualization, studio lighting on gradient background, premium technology aesthetic, Octane render, 4K"

【渲染参数】
- 软件推荐：Blender / Cinema 4D
- 渲染器：Octane / Redshift / Cycles
- 灯光：三点布光 + HDRI
- 材质：PBR标准`,
      type: 'text'
    }
  },
  
  {
    id: 'image-017',
    title: '社交媒体滤镜效果',
    description: '各种网红滤镜、调色效果的提示词',
    category: '图像生成',
    tags: ['滤镜', '调色', '社交媒体'],
    usage: 14560,
    rating: 4.5,
    content: `# 社交媒体滤镜效果提示词

## 【流行滤镜风格】

### 1. Instagram风格
- Clarendon：高对比、冷色调
- Juno：增强绿色、复古
- Valencia：暖色调、复古胶片
- Gingham：柔和、复古感

### 2. VSCO风格
- A6：冷色调、高对比
- M5：暖色调、复古
- HB2：街拍、高对比
- C1：经典、清新

### 3. 小红书风格
- 日系：低对比、高曝光
- 胶片：颗粒感、褪色
- 治愈：柔和、淡粉

### 4. 抖音风格
- 美颜：磨皮、美白
- 特效：动态贴纸
- 滤镜：各种主题`,
    example: {
      input: '日系清新滤镜',
      output: `【提示词】
"Japanese-style photography filter effect, soft pastel colors with slight pink tint, low contrast and high exposure, dreamy and ethereal atmosphere, overexposed highlights, clean and minimal aesthetic, suitable for lifestyle and portrait photography"

【调色参数】

基础调整：
- 曝光：+0.5 to +1.0
- 对比度：-10 to -20
- 高光：-30 to -50
- 阴影：+10 to +20
- 清晰度：-10 to -15

色彩调整：
- 色温：+5（偏暖）
- 色调：+5（偏粉）
- 饱和度：-10 to -20
- 自然饱和度：+5

曲线调整：
- RGB：轻微提亮中间调
- 红色：暗部略微压低
- 蓝色：高光略微提升

【后期工具推荐】
- VSCO：滤镜库丰富
- Lightroom：专业调整
- 醒图：国内常用
- 泼辣修图：功能全面`,
      type: 'text'
    }
  },
  
  {
    id: 'image-018',
    title: '商业摄影布光方案',
    description: '专业产品摄影布光示意图和提示词',
    category: '图像生成',
    tags: ['摄影', '布光', '商业'],
    usage: 8920,
    rating: 4.6,
    content: `# 商业摄影布光方案

## 【经典布光模式】

### 1. 三点布光
- 主光（Key Light）：主光源
- 补光（Fill Light）：填充阴影
- 轮廓光（Rim Light）：勾勒轮廓

### 2. 伦勃朗光
特点：三角光斑、戏剧感
适用：人像、产品

### 3. 蝴蝶光
特点：蝴蝶形阴影、美妆
适用：女性人像

### 4. 分割光
特点：阴阳脸、神秘感
适用：戏剧性人像

### 5. 高调布光
特点：明亮、干净
适用：产品、美容

### 6. 低调布光
特点：暗调、戏剧性
适用：奢侈品、男士`,
    example: {
      input: '珠宝产品布光方案',
      output: `【三点布光方案】

主光：
- 位置：产品右前方45度
- 高度：高于产品30度
- 光质：柔光箱（60×90cm）
- 强度：作为主曝光

补光：
- 位置：产品左侧
- 光质：柔光屏/反光板
- 强度：比主光弱2档

轮廓光：
- 位置：产品后方
- 高度：高于产品45度
- 光质：蜂巢罩
- 强度：比主光强1档

背景光：
- 位置：背景后方
- 作用：营造渐变

【拍摄参数】
- 相机：全画幅单反
- 镜头：微距镜头（100mm）
- 光圈：f/8-f/11
- 快门：1/125s
- ISO：100
- 三脚架：必须使用

【后期处理】
- 堆栈合成（景深合成）
- 瑕疵修复
- 颜色校正
- 锐化输出`,
      type: 'text'
    }
  },
  
  {
    id: 'image-019',
    title: '摄影构图法则',
    description: '专业摄影构图技巧和提示词应用',
    category: '图像生成',
    tags: ['构图', '摄影', '技巧'],
    usage: 12340,
    rating: 4.7,
    content: `# 摄影构图法则大全

## 【经典构图法则】

### 1. 三分法
- 主体放在三分线/交点
- 适用于大部分场景
- 简单有效

### 2. 黄金分割
- 更高级的三分法
- 比例1:1.618
- 古典美感

### 3. 对称构图
- 中心对称
- 倒影、建筑
- 庄重感

### 4. 引导线
- 线条引导视线
- 道路、河流、栏杆
- 纵深感

### 5. 框架构图
- 利用前景框架
- 门窗、树枝
- 聚焦主体

### 6. 留白
- 大量负空间
- 简约、意境
- 情绪表达

### 7. 对角线
- 动感、张力
- 倾斜构图
- 打破平衡`,
    example: {
      input: '风景摄影构图',
      output: `【构图方案一：三分法+引导线】
主体：山脉或建筑
位置：右上三分交点
引导线：道路/河流从左下延伸至主体
前景：草地/岩石增加层次

【构图方案二：对称+倒影】
主体：建筑/山峦
位置：画面中心对称
倒影：水面完美镜像
时机：无风时刻

【构图方案三：框架+剪影】
框架：树枝/拱门
主体：日落/建筑剪影
位置：框架中心
曝光：针对天空测光

【AI提示词应用】
"Landscape photograph with rule of thirds composition, mountain peak at upper right intersection, winding river leading viewer's eye to subject, golden hour lighting, dramatic sky, professional nature photography --ar 16:9 --v 6"

【注意事项】
- 打破规则前先掌握规则
- 多尝试不同角度
- 后期可裁剪二次构图`,
      type: 'text'
    }
  },
  
  {
    id: 'image-020',
    title: '食物摄影提示词',
    description: '专业美食摄影提示词，让食物看起来更诱人',
    category: '图像生成',
    tags: ['美食', '食物', '摄影'],
    usage: 18760,
    rating: 4.8,
    content: `# 食物摄影提示词专家

## 【拍摄角度】

### 1. 俯拍（Overhead）
- 适合：餐具组合、桌面布置
- 特点：展示整体
- 高度：垂直90度

### 2. 45度角
- 适合：大部分食物
- 特点：自然视角
- 最常用角度

### 3. 平视（Eye-level）
- 适合：汉堡、蛋糕、饮品
- 特点：展示高度和层次
- 侧拍特写

## 【光线选择】

### 自然光
- 柔和、真实
- 窗边拍摄
- 漫射光最佳

### 人造光
- 可控性强
- 模拟自然光
- 影棚必备

## 【造型技巧】
- 色彩搭配
- 留白布局
- 新鲜感（喷水）
- 动态元素（蒸汽、倾倒）`,
    example: {
      input: '汉堡美食摄影',
      output: `【提示词】
"Mouth-watering gourmet burger photography, stacked high with fresh ingredients, melting cheese dripping, lettuce and tomato visible, sesame seed bun with shine, 45-degree angle shot, shallow depth of field with focus on center, warm natural lighting, appetizing and inviting, food magazine quality, professional food styling"

【拍摄方案】

角度选择：
- 主角度：45度侧拍，展示层次
- 补充角度：平视特写，展示厚度
- 备选：俯拍，展示整体布局

布光方案：
- 主光：侧逆光（窗光）
- 补光：白色反光板
- 效果：蒸汽、油光质感

造型要点：
- 食材分层清晰
- 酱汁自然流淌
- 配菜新鲜点缀
- 餐具简洁衬托

道具搭配：
- 木板/石板背景
- 牛皮纸/报纸
- 手持汉堡姿势
- 薯条/饮料入镜

后期调色：
- 提高饱和度+15
- 增强对比度+10
- 暖色调+5
- 锐化细节`,
      type: 'text'
    }
  },
];

export default imagePrompts;
