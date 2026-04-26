// 图像生成提示词 - 专业商用级别

import { PromptItem } from './prompts-types';

export const prompts: PromptItem[] = [
  // ========== Midjourney 专业提示词 ==========
  {
    id: 'image-001',
    title: 'Midjourney V6 人像摄影提示词',
    description: '生成专业级别的人像摄影作品，支持多种光影风格和情绪表达',
    category: '图像生成',
    tags: ['Midjourney', 'V6', '人像', '摄影'],
    featured: true,
    usage: 28950,
    rating: 4.9,
    content: `# Midjourney V6 人像摄影提示词大师

## 【角色定位】
你是世界级人像摄影师，精通：
- 好莱坞明星肖像摄影技法
- 自然光与人造光的完美运用
- 情绪捕捉与氛围营造
- Midjourney V6 最新参数和特性

## 【Midjourney V6 核心参数】

### 镜头参数
- --ar 2:3 (人像比例)
- --ar 9:16 (手机壁纸)
- --ar 16:9 (电影感)

### 风格参数
- --style raw (真实摄影风格)
- --s 250 (高风格化)
- --v 6.0 (V6版本)

### 光影词典
- Rembrandt lighting
- Split lighting
- Butterfly lighting
- Golden hour
- Blue hour
- Ring light
- Natural window light`,
    example: {
      input: '生成一个科技感十足的AI机器人形象，要赛博朋克风格',
      output: `### Midjourney 精准提示词（带权重/参数控制）

\`\`\`
主体描述：(cyberpunk AI robot, sleek black carbon-fiber exoskeleton, glowing neon blue neural pathways, holographic display chest plate, retractable plasma energy claws, floating magnetic shoulder drones, asymmetric mechanical limbs:1.2)

风格修饰：cyberpunk aesthetic, neo-Tokyo street background, rain-slicked metallic surfaces, high contrast chiaroscuro lighting, hyper-detailed concept art, inspired by Syd Mead and Blade Runner 2049, cinematic lens flare, gritty futuristic texture

质量参数：8k resolution, ultra-photorealistic, intricate details, sharp focus, cinematic quality, ray tracing reflections

技术参数：--ar 16:9 --style raw --stylize 750 --v 6.0 --q 2
\`\`\`

### 提示词拆解说明
1. **主体强化**：通过(关键词:1.2)给核心视觉元素增加权重，突出机器人的赛博核心特征
2. **风格锚定**：明确绑定赛博朋克标志性元素，同时加入《银翼杀手2049》的电影质感
3. **技术参数优化**：
   - --style raw：保留机械硬科幻的冷峻质感
   - --stylize 750：平衡风格化与写实度
   - --ar 16:9：适配电影级宽屏构图
   - --q 2：提升渲染精度`,
      type: 'text'
    },
    tips: [
      'V6版本对真实描述词的理解更强，无需过度艺术化修饰',
      '使用具体相机型号可显著提升画面质感',
      '描述光影方向（from left/right）能控制立体感'
    ]
  },
  
  {
    id: 'image-002',
    title: 'Midjourney 风景摄影提示词',
    description: '生成震撼的自然风景和城市景观作品',
    category: '图像生成',
    tags: ['Midjourney', '风景', '自然', '城市'],
    featured: true,
    usage: 24560,
    rating: 4.9,
    content: `# Midjourney 风景摄影提示词指南

## 【风景类型与关键词】

### 自然风光
- majestic mountain peaks
- pristine tropical beach
- ancient redwood forest
- cascading waterfall
- vast desert landscape

### 城市景观
- iconic city skyline
- historic architecture
- bustling street scene
- neon-lit nightlife

## 【时间与光影】
- golden hour sunrise
- blue hour twilight
- dramatic storm clouds
- starry night sky
- northern lights aurora`,
    example: {
      input: '日本富士山日出',
      output: `【提示词】
"Majestic Mount Fuji at sunrise, Japan, iconic symmetrical snow-capped volcano reflected in the still waters of Lake Kawaguchi, cherry blossom trees in full bloom framing the view in foreground, soft pink and golden light of dawn painting the sky in pastel hues, wispy clouds around the peak, peaceful and serene atmosphere, professional landscape photography, shot on Sony A7R IV with 24-70mm lens, sharp details, vibrant colors, fine art landscape --ar 16:9 --style raw --s 200 --v 6.0"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-003',
    title: 'Midjourney 产品摄影提示词',
    description: '专业电商产品图的提示词生成器',
    category: '图像生成',
    tags: ['Midjourney', '产品', '电商', '商业'],
    usage: 21340,
    rating: 4.8,
    content: `# Midjourney 产品摄影提示词指南

## 【产品摄影类型】

### 平铺展示
- flat lay composition
- overhead shot
- clean white background
- lifestyle props

### 场景融合
- in-context use
- lifestyle setting
- brand story
- mood atmosphere

### 细节特写
- macro detail shot
- texture highlight
- material quality
- craftsmanship`,
    example: {
      input: '高端护肤品产品图',
      output: `【提示词】
"Premium skincare serum bottle product photography, frosted glass bottle with rose gold pump, minimalist white marble surface with subtle grey veining, soft diffused studio lighting from above and side, few fresh white rose petals and green eucalyptus leaves as elegant props, clean sophisticated aesthetic, professional commercial product shot, high-end beauty brand style, 4K ultra sharp, focus on product, shallow depth of field --ar 4:5 --style raw --s 150 --v 6.0"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-004',
    title: 'Midjourney 建筑室内设计提示词',
    description: '生成专业的建筑和室内设计效果图',
    category: '图像生成',
    tags: ['Midjourney', '建筑', '室内设计', '空间'],
    usage: 18920,
    rating: 4.8,
    content: `# Midjourney 建筑室内设计提示词指南

## 【室内风格】

### 现代风格
- minimalist modern
- Scandinavian design
- industrial loft
- contemporary luxury

### 传统风格
- classic European
- Japanese zen
- mid-century modern
- bohemian chic

## 【空间类型】
- living room
- bedroom sanctuary
- kitchen design
- bathroom spa
- home office`,
    example: {
      input: '北欧风格客厅设计',
      output: `【提示词】
"Beautiful Scandinavian-style living room interior, light oak wood flooring, white painted brick walls, large floor-to-ceiling windows with natural light, neutral beige linen sofa with textured cushions, minimalist coffee table, potted plants, beige area rug, simple pendant lighting, cozy hygge atmosphere, soft pastel color palette, architectural photography, bright and airy, professional interior design magazine quality --ar 16:9 --style raw --s 180 --v 6.0"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-005',
    title: 'Midjourney 概念艺术提示词',
    description: '游戏和电影概念艺术设计提示词',
    category: '图像生成',
    tags: ['Midjourney', '概念艺术', '游戏', '电影'],
    usage: 25670,
    rating: 4.9,
    content: `# Midjourney 概念艺术提示词指南

## 【概念艺术风格】

### 游戏场景
- fantasy landscape
- sci-fi environment
- medieval castle
- cyberpunk city

### 角色设计
- game character
- fantasy creature
- sci-fi suit
- anime character

### 氛围风格
- epic cinematic
- dark fantasy
- dreamlike surreal
- concept art illustration`,
    example: {
      input: '奇幻游戏城堡场景',
      output: `【提示词】
"Epic fantasy castle concept art, ancient stone fortress perched on dramatic cliff edge overlooking stormy sea, towering spires and banners, mystical glowing windows, massive gates with intricate carvings, dark brooding sky with lightning, volumetric fog, cinematic dramatic lighting, grand scale, Lord of the Rings inspired, professional game concept art, highly detailed, digital painting, artstation trending --ar 21:9 --s 350 --v 6.0"`,
      type: 'text'
    }
  },
  
  // ========== Stable Diffusion 专业提示词 ==========
  {
    id: 'image-006',
    title: 'Stable Diffusion 写实人像提示词',
    description: '针对SD XL优化的超写实人像提示词模板',
    category: '图像生成',
    tags: ['SD', 'Stable Diffusion', '写实', '人像'],
    featured: true,
    usage: 31240,
    rating: 4.9,
    content: `# Stable Diffusion 写实人像提示词指南

## 【角色定位】
你是Stable Diffusion提示词专家，精通：
- SD XL/SD 1.5模型特性
- 正向/负向提示词优化
- LoRA和Embedding使用
- 真实感与美感的平衡

## 【SD提示词结构】

### 正向提示词
\`\`\`
[画质词] + [主体描述] + [细节特征] + [光影] + [风格] + [技术参数]
\`\`\`

### 负向提示词
\`\`\`
(worst quality:2), (low quality:2), (normal quality:2), lowres, bad anatomy, bad hands, [其他负面词]
\`\`\`

## 【画质增强词】
- masterpiece, best quality
- ultra high res
- 8K UHD
- photorealistic
- hyperrealistic
- raw photo`,
    example: {
      input: '年轻女性肖像',
      output: `【正向提示词】
"(masterpiece, best quality, ultra high res:1.2), photorealistic 1girl, beautiful young woman, approximately 25 years old, natural makeup, soft smile, detailed beautiful eyes, long wavy brown hair, wearing white blouse, soft natural lighting, window light, indoor setting, shallow depth of field, Canon EOS R5, 85mm f/1.2, sharp focus on eyes, film grain"

【负向提示词】
"(worst quality:2), (low quality:2), (normal quality:2), lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst face, bad face, bad proportions, text, error, signature, watermark, username, blurry"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-007',
    title: 'Stable Diffusion 动漫角色提示词',
    description: '生成高质量动漫角色和插画作品',
    category: '图像生成',
    tags: ['SD', '动漫', '二次元', '角色设计'],
    usage: 27890,
    rating: 4.8,
    content: `# Stable Diffusion 动漫角色提示词指南

## 【动漫风格关键词】

### 风格类型
- anime style
- manga illustration
- cel shading
- semi-realistic anime

### 质量增强
- highly detailed anime art
- vibrant colors
- clean lineart
- professional illustration

### 角色特征
- beautiful detailed eyes
- gradient hair
- anime proportions
- expressive face`,
    example: {
      input: '可爱的动漫少女',
      output: `【正向提示词】
"(masterpiece, best quality:1.2), anime style, 1girl, cute young girl, big expressive eyes, long flowing pink gradient hair, sweet smile, wearing frilly white dress with ribbons, cherry blossom petals falling, soft pastel colors, anime key visual, detailed beautiful face, cel shading, professional anime illustration, artstation quality"

【负向提示词】
"(worst quality:2), (low quality:2), bad anatomy, bad proportions, deformed, disfigured, extra limbs, blurry, text, watermark, signature"`,
      type: 'text'
    }
  },
  
  // ========== DALL-E 3 专业提示词 ==========
  {
    id: 'image-008',
    title: 'DALL-E 3 插画设计提示词',
    description: '专为DALL-E 3优化的插画和图形设计提示词',
    category: '图像生成',
    tags: ['DALL-E', '插画', '设计', '创意'],
    usage: 19870,
    rating: 4.7,
    content: `# DALL-E 3 插画设计提示词指南

## 【DALL-E 3 特点】
- 自然语言理解强
- 支持长篇详细描述
- 文字排版能力强
- 插画风格多样化

## 【插画风格】

### 扁平风格
- flat design illustration
- vector art style
- minimalist graphics
- clean geometric shapes

### 手绘风格
- hand-drawn illustration
- watercolor painting
- ink sketch style
- pencil drawing

### 现代风格
- modern digital art
- contemporary illustration
- 3D render style
- mixed media`,
    example: {
      input: '科技公司的抽象插画',
      output: `【提示词】
"Modern abstract illustration for a technology company, featuring interconnected geometric shapes in shades of blue and purple, representing innovation and connectivity, clean minimalist design with subtle gradients, floating UI elements and data visualization motifs, professional corporate aesthetic suitable for website hero section, flat design with slight depth, harmonious color palette, sophisticated and forward-thinking vibe"`,
      type: 'text'
    }
  },
  
  // ========== 通用设计提示词 ==========
  {
    id: 'image-009',
    title: 'Logo设计提示词',
    description: '专业品牌Logo和标识设计的提示词模板',
    category: '图像生成',
    tags: ['Logo', '品牌', '标识', '设计'],
    featured: true,
    usage: 23450,
    rating: 4.8,
    content: `# Logo设计提示词指南

## 【Logo类型】

### 图形标志
- abstract symbol
- geometric mark
- illustrative icon
- lettermark logo

### 文字标志
- wordmark design
- logotype
- signature style
- custom typography

### 组合标志
- emblem logo
- combination mark
- mascot design
- badge style

## 【设计原则】
- clean and simple
- memorable and unique
- scalable vector style
- timeless design`,
    example: {
      input: '科技初创公司Logo',
      output: `【提示词】
"Modern minimal logo design for a tech startup company named 'Quantum', abstract geometric symbol combining letter Q with circuit board pattern, clean lines, futuristic aesthetic, professional and sophisticated, primary color: deep blue with electric cyan accent, flat vector design, white background, suitable for both digital and print, scalable icon, clean white background, logo design showcase --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-010',
    title: '海报设计提示词',
    description: '电影海报、活动海报、宣传海报的设计提示词',
    category: '图像生成',
    tags: ['海报', '设计', '宣传', '电影'],
    usage: 21230,
    rating: 4.7,
    content: `# 海报设计提示词指南

## 【海报类型】

### 电影海报
- movie poster design
- cinematic composition
- dramatic atmosphere
- star cast showcase

### 活动海报
- event poster
- music festival poster
- conference design
- exhibition poster

### 商业海报
- product advertisement
- brand campaign
- promotional design
- seasonal sale

## 【设计要素】
- striking visual hierarchy
- bold typography
- eye-catching colors
- clear message`,
    example: {
      input: '科幻电影海报设计',
      output: `【提示词】
"Epic sci-fi movie poster design, dramatic composition featuring a lone astronaut silhouette against a massive alien planet with rings, cosmic nebula background in deep purple and electric blue, futuristic typography for title 'BEYOND THE STARS', Hollywood blockbuster style, cinematic lighting, mysterious and awe-inspiring atmosphere, professional movie poster layout with billing block at bottom, high contrast, IMAX quality --ar 2:3"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-011',
    title: '包装设计提示词',
    description: '产品包装和商品包装设计的提示词模板',
    category: '图像生成',
    tags: ['包装', '产品设计', '商品', '品牌'],
    usage: 16780,
    rating: 4.7,
    content: `# 包装设计提示词指南

## 【包装类型】

### 食品包装
- chocolate box design
- beverage packaging
- snack wrapper
- gourmet food packaging

### 美妆包装
- cosmetic container
- perfume bottle
- skincare tube
- makeup compact

### 日常用品
- cleaning product
- personal care
- household items
- stationery`,
    example: {
      input: '有机茶叶包装设计',
      output: `【提示词】
"Premium organic tea packaging design, elegant rectangular box in sage green with gold foil accents, minimalist botanical illustration of tea leaves and flowers, clean modern typography for brand name 'Zen Leaf', subtle texture on surface, sophisticated and natural aesthetic, sustainable packaging style, mockup on clean background, professional product photography, lifestyle luxury feel --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-012',
    title: '社交媒体图像提示词',
    description: 'Instagram、小红书等社交媒体图片设计提示词',
    category: '图像生成',
    tags: ['社交媒体', 'Instagram', '小红书', '内容创作'],
    usage: 28940,
    rating: 4.8,
    content: `# 社交媒体图像提示词指南

## 【平台风格】

### Instagram
- square format
- aesthetic grid
- lifestyle content
- influencer style

### 小红书
- 浪漫唯美风
- 日系小清新
- 氛围感照片
- 种草笔记图

### Pinterest
- vertical pin
- DIY tutorial
- recipe card
- inspiration board

## 【内容类型】
- quote graphic
- carousel slide
- story template
- highlight cover`,
    example: {
      input: '小红书风格咖啡探店图',
      output: `【提示词】
"Aesthetic cafe photography for social media, cozy corner of a minimalist specialty coffee shop, latte art in ceramic cup on wooden table, afternoon sunlight streaming through window, blurred background with plants and rustic decor, soft warm tones, lifestyle influencer style, perfect for Xiaohongshu post, warm and inviting atmosphere, clean composition, beautiful food photography --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-013',
    title: 'UI界面设计提示词',
    description: 'App界面、网页设计、Dashboard设计提示词',
    category: '图像生成',
    tags: ['UI', '界面', 'App', '网页设计'],
    usage: 19870,
    rating: 4.7,
    content: `# UI界面设计提示词指南

## 【UI类型】

### 移动应用
- mobile app UI
- iOS interface
- Android design
- app screens

### 网页设计
- website homepage
- landing page
- dashboard UI
- admin panel

### 风格参考
- clean modern UI
- glassmorphism
- neumorphism
- flat design
- dark mode`,
    example: {
      input: '健身App界面设计',
      output: `【提示词】
"Modern fitness app UI design, clean mobile interface showing workout dashboard, dark theme with vibrant green accents, circular progress indicators, workout statistics cards, bottom navigation bar, sleek minimalist icons, health metrics visualization, professional app design, Dribbble-worthy UI, contemporary aesthetic, high contrast, mockup on iPhone frame --ar 9:16"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-014',
    title: '电商主图设计提示词',
    description: '淘宝、天猫、京东电商主图设计提示词',
    category: '图像生成',
    tags: ['电商', '淘宝', '主图', '产品展示'],
    usage: 24560,
    rating: 4.8,
    content: `# 电商主图设计提示词指南

## 【主图类型】

### 产品展示
- product on white
- hero shot
- angle showcase
- size reference

### 场景融合
- lifestyle setting
- in-use scenario
- benefit showcase
- mood atmosphere

### 促销设计
- discount highlight
- sale banner
- limited offer
- festive theme

## 【平台规范】
- 淘宝主图: 800x800px
- 天猫主图: 800x800px
- 京东主图: 800x800px
- 白底/场景背景`,
    example: {
      input: '无线耳机电商主图',
      output: `【提示词】
"Premium wireless earbuds product photography for e-commerce listing, sleek white charging case with earbuds, clean white background, professional studio lighting, three-quarter angle showing both earbuds and case, subtle shadow for depth, minimalist tech aesthetic, high-end product shot, commercial photography quality, sharp focus, product stand display, e-commerce hero shot --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-015',
    title: '书籍封面设计提示词',
    description: '小说、教材、杂志书籍封面设计提示词',
    category: '图像生成',
    tags: ['书籍', '封面', '出版', '设计'],
    usage: 14560,
    rating: 4.7,
    content: `# 书籍封面设计提示词指南

## 【书籍类型】

### 小说类
- fiction book cover
- thriller novel
- romance cover
- sci-fi book design

### 非虚构类
- business book
- self-help cover
- biography design
- educational book

### 杂志
- magazine cover
- fashion editorial
- lifestyle publication
- special edition

## 【设计要素】
- compelling typography
- evocative imagery
- genre-appropriate style
- shelf appeal`,
    example: {
      input: '悬疑小说封面设计',
      output: `【提示词】
"Gripping thriller novel book cover design, dark atmospheric composition, silhouette of a mysterious figure walking through fog, Victorian mansion in background, dramatic lighting with single lit window, deep blues and blacks with hints of amber, elegant serif typography for title 'The Silent Witness', New York Times bestseller style, professional publishing design, mysterious and suspenseful mood --ar 2:3"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-016',
    title: '名片设计提示词',
    description: '专业商务名片和创意名片设计提示词',
    category: '图像生成',
    tags: ['名片', '商务', '品牌', '设计'],
    usage: 12340,
    rating: 4.6,
    content: `# 名片设计提示词指南

## 【名片风格】

### 商务专业
- corporate business card
- minimalist professional
- elegant traditional
- clean typography

### 创意设计
- creative industry card
- artistic design
- unique shape
- bold statement

### 奢华高端
- luxury business card
- gold foil details
- premium paper texture
- sophisticated design`,
    example: {
      input: '律师事务所专业名片',
      output: `【提示词】
"Professional business card design for law firm attorney, clean minimal layout on premium white card stock, elegant serif typography in navy blue, subtle embossed logo, lawyer name and credentials, contact information in refined hierarchy, corporate and trustworthy aesthetic, standard business card size mockup, sophisticated professional design, law firm branding --ar 1.75:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-017',
    title: '表情包设计提示词',
    description: '可爱表情包、贴纸、Emoji设计提示词',
    category: '图像生成',
    tags: ['表情包', '贴纸', '可爱', '聊天'],
    usage: 19870,
    rating: 4.8,
    content: `# 表情包设计提示词指南

## 【表情包类型】

### 可爱萌系
- kawaii stickers
- cute character
- pastel colors
- chibi style

### 表情系列
- emotion set
- reaction faces
- mood expressions
- daily life series

### 节日主题
- holiday stickers
- seasonal emoji
- celebration series
- special occasion

## 【设计要点】
- simple clean lines
- expressive features
- consistent style
- transparent background`,
    example: {
      input: '可爱猫咪表情包系列',
      output: `【提示词】
"Adorable cat sticker set design, kawaii style illustrations, multiple cute cat expressions: happy, crying, angry, love, surprised, sleeping, thinking, simple clean lines, pastel color palette with pink and cream, white background, each expression in rounded square frame, chibi proportions, big sparkly eyes, consistent character design, sticker pack for messaging apps --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-018',
    title: '图标设计提示词',
    description: 'App图标、功能图标、UI图标设计提示词',
    category: '图像生成',
    tags: ['图标', 'icon', 'UI', '设计'],
    usage: 17650,
    rating: 4.7,
    content: `# 图标设计提示词指南

## 【图标类型】

### App图标
- mobile app icon
- iOS app icon
- Android adaptive icon
- app store icon

### 功能图标
- UI icon set
- navigation icons
- action buttons
- status indicators

### 风格选项
- filled solid
- outlined line
- duotone
- gradient
- 3D icon`,
    example: {
      input: '相机App图标设计',
      output: `【提示词】
"Modern camera app icon design, minimalist camera symbol in clean geometric style, rounded square iOS icon format, gradient background from coral pink to orange, white camera icon with simple lens detail, flat design with subtle shadow for depth, app store ready, clean and recognizable, professional app icon, consistent with Apple HIG --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-019',
    title: '插画角色设计提示词',
    description: '品牌吉祥物、IP角色、卡通人物设计提示词',
    category: '图像生成',
    tags: ['插画', '角色', '吉祥物', 'IP设计'],
    usage: 21230,
    rating: 4.8,
    content: `# 插画角色设计提示词指南

## 【角色类型】

### 吉祥物
- brand mascot
- company character
- sports team mascot
- event mascot

### IP角色
- original character
- story protagonist
- game character
- animation design

### 风格选择
- cute kawaii
- cool modern
- retro vintage
- 3D character`,
    example: {
      input: '科技公司可爱吉祥物',
      output: `【提示词】
"Adorable brand mascot character for tech company, cute friendly robot design, round shape with big expressive eyes, antenna on head, holding a laptop, soft blue and white color scheme, kawaii aesthetic, approachable and tech-savvy, multiple poses showing different emotions, clean vector illustration style, suitable for brand identity, white background --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-020',
    title: '纹理素材提示词',
    description: '背景纹理、图案设计、贴图素材提示词',
    category: '图像生成',
    tags: ['纹理', '背景', '图案', '素材'],
    usage: 15680,
    rating: 4.6,
    content: `# 纹理素材提示词指南

## 【纹理类型】

### 自然纹理
- marble texture
- wood grain pattern
- water surface
- stone texture

### 几何图案
- abstract pattern
- geometric background
- seamless pattern
- modern texture

### 艺术纹理
- watercolor splash
- grunge texture
- paper texture
- metallic surface`,
    example: {
      input: '水彩渐变背景纹理',
      output: `【提示词】
"Beautiful watercolor gradient texture background, soft flowing blend of pastel colors, pink coral and lavender and soft blue, organic watercolor edges and bleeds, artistic paper texture, subtle color variations, dreamy and ethereal aesthetic, high resolution seamless texture, suitable for stationery design and digital backgrounds, artistic watercolor painting --ar 16:9"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-021',
    title: '婚礼请柬设计提示词',
    description: '婚礼请柬、喜帖、婚礼视觉设计提示词',
    category: '图像生成',
    tags: ['婚礼', '请柬', '喜帖', '设计'],
    usage: 13450,
    rating: 4.7,
    content: `# 婚礼请柬设计提示词指南

## 【婚礼风格】

### 浪漫唯美
- romantic wedding
- floral elegant
- vintage classic
- soft pastel

### 现代简约
- modern minimalist
- clean typography
- contemporary design
- geometric accents

### 主题风格
- garden wedding
- beach ceremony
- rustic barn wedding
- elegant ballroom

## 【设计要素】
- elegant typography
- romantic motifs
- cohesive color palette
- invitation layout`,
    example: {
      input: '花园婚礼请柬设计',
      output: `【提示词】
"Elegant garden wedding invitation design, delicate watercolor floral border with roses and eucalyptus, soft blush pink and sage green color palette, romantic calligraphy typography for couple names 'Emma & James', classic serif font for details, white background, sophisticated and timeless aesthetic, formal wedding invitation layout with ceremony and reception details, luxury stationery design --ar 5:7"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-022',
    title: 'PPT模板设计提示词',
    description: '演示文稿、Keynote、幻灯片模板设计提示词',
    category: '图像生成',
    tags: ['PPT', '演示', '模板', '设计'],
    usage: 18920,
    rating: 4.7,
    content: `# PPT模板设计提示词指南

## 【PPT类型】

### 商务演示
- business presentation
- corporate deck
- annual report
- pitch deck

### 教育培训
- educational slides
- workshop presentation
- training materials
- lecture deck

### 创意展示
- portfolio presentation
- creative pitch
- design showcase
- inspiration deck

## 【设计要素】
- consistent theme
- clear hierarchy
- visual interest
- professional layout`,
    example: {
      input: '科技主题PPT封面设计',
      output: `【提示词】
"Modern technology presentation template cover slide, dark blue gradient background with subtle circuit pattern, clean minimalist title placeholder area, futuristic geometric accents, professional corporate design, PowerPoint/Keynote template style, placeholder for title and subtitle, modern sans-serif typography, tech company aesthetic, widescreen 16:9 format --ar 16:9"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-023',
    title: '专辑封面设计提示词',
    description: '音乐专辑、单曲封面、Spotify封面设计提示词',
    category: '图像生成',
    tags: ['专辑', '音乐', '封面', '设计'],
    usage: 16780,
    rating: 4.8,
    content: `# 专辑封面设计提示词指南

## 【音乐类型】

### 流行音乐
- pop album art
- upbeat energetic
- colorful vibrant
- modern trendy

### 摇滚电子
- rock album cover
- electronic music
- edgy alternative
- bold graphic

### 古典爵士
- classical album
- jazz cover art
- elegant sophisticated
- timeless aesthetic

## 【设计风格】
- artistic photography
- graphic design
- abstract art
- conceptual illustration`,
    example: {
      input: '独立流行音乐专辑封面',
      output: `【提示词】
"Indie pop album cover design, dreamy aesthetic, artistic photograph of a person looking up at colorful floating balloons against pastel sunset sky, soft focus and light leaks, nostalgic and whimsical mood, minimal typography for album title 'Daydreams', Spotify-ready square format, alternative music style, artistic and emotive, indie artist aesthetic --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-024',
    title: '食谱美食图提示词',
    description: '美食摄影、食谱配图、食物展示提示词',
    category: '图像生成',
    tags: ['美食', '食谱', '食物', '摄影'],
    usage: 19870,
    rating: 4.8,
    content: `# 食谱美食图提示词指南

## 【美食类型】

### 中式料理
- Chinese cuisine
- dim sum spread
- hot pot feast
- traditional dishes

### 西式料理
- Italian pasta
- French pastry
- American BBQ
- Mediterranean platter

### 甜点烘焙
- dessert photography
- cake styling
- cookie arrangement
- pastry showcase

## 【拍摄风格】
- overhead flat lay
- 45-degree angle
- close-up detail
- lifestyle setting`,
    example: {
      input: '精美法式甜点展示',
      output: `【提示词】
"Elegant French dessert photography, beautifully plated mille-feuille pastry with layers of cream and caramelized puff pastry, artistic drizzle of raspberry coulis, fresh berries and mint leaves as garnish, white ceramic plate on marble surface, soft natural window light, shallow depth of field, professional food photography, gourmet magazine quality, warm inviting atmosphere --ar 4:5"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-025',
    title: '宠物肖像提示词',
    description: '宠物摄影、动物肖像、可爱宠物图提示词',
    category: '图像生成',
    tags: ['宠物', '动物', '肖像', '可爱'],
    usage: 21340,
    rating: 4.9,
    content: `# 宠物肖像提示词指南

## 【宠物类型】

### 狗狗
- golden retriever
- french bulldog
- husky portrait
- corgi puppy

### 猫咪
- persian cat
- british shorthair
- siamese cat
- maine coon

### 其他宠物
- rabbit bunny
- hamster
- parrot bird
- fish aquarium

## 【拍摄风格】
- studio portrait
- outdoor lifestyle
- playful action
- cozy home setting`,
    example: {
      input: '可爱柯基犬肖像',
      output: `【提示词】
"Adorable corgi dog portrait photography, fluffy pembroke welsh corgi with signature short legs and big ears, sitting and looking directly at camera with happy expression, tongue out and bright eyes, natural outdoor setting with soft green grass background, golden hour warm sunlight, professional pet photography, shallow depth of field, heartwarming and joyful mood --ar 4:5"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-026',
    title: '时尚穿搭图提示词',
    description: '时尚穿搭、服装搭配、OOTD图片提示词',
    category: '图像生成',
    tags: ['时尚', '穿搭', '服装', 'OOTD'],
    usage: 24560,
    rating: 4.8,
    content: `# 时尚穿搭图提示词指南

## 【穿搭风格】

### 日常休闲
- casual everyday
- street style
- weekend outfit
- comfortable chic

### 职场正装
- office professional
- business casual
- elegant workwear
- power dressing

### 特殊场合
- evening formal
- party outfit
- vacation resort
- date night look

## 【拍摄形式】
- full body outfit
- detail shots
- flat lay clothing
- model pose`,
    example: {
      input: '春季职场穿搭展示',
      output: `【提示词】
"Professional spring office outfit photography, stylish young woman wearing tailored beige blazer over cream silk blouse, paired with high-waisted navy trousers and nude heels, minimal accessories with delicate gold necklace, confident pose in modern office setting with large windows, natural bright lighting, fashion editorial style, clean sophisticated aesthetic, outfit of the day content --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-027',
    title: '旅行风景图提示词',
    description: '旅游景点、目的地推广、旅行摄影提示词',
    category: '图像生成',
    tags: ['旅行', '风景', '旅游', '目的地'],
    usage: 23450,
    rating: 4.9,
    content: `# 旅行风景图提示词指南

## 【风景类型】

### 自然景观
- mountain scenery
- beach paradise
- forest nature
- waterfall adventure

### 城市景观
- city skyline
- historic street
- modern architecture
- night view

### 特色地点
- iconic landmark
- hidden gem
- local culture
- adventure spot

## 【拍摄技巧】
- golden hour
- blue hour
- aerial drone
- perspective view`,
    example: {
      input: '巴厘岛海滩日落美景',
      output: `【提示词】
"Stunning Bali beach sunset photography, pristine white sand beach with gentle waves, traditional Balinese fishing boat (jukung) silhouetted against golden orange sky, swaying palm trees framing the view, crystal clear turquoise water, dramatic clouds reflecting sunset colors, tropical paradise atmosphere, travel magazine quality, professional landscape photography, serene and breathtaking --ar 16:9"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-028',
    title: '艺术绘画风格提示词',
    description: '油画、水彩、素描等传统艺术风格提示词',
    category: '图像生成',
    tags: ['艺术', '绘画', '油画', '水彩'],
    usage: 19870,
    rating: 4.8,
    content: `# 艺术绘画风格提示词指南

## 【绘画风格】

### 油画风格
- oil painting style
- impressionist art
- classical painting
- palette knife texture

### 水彩风格
- watercolor painting
- ink wash painting
- loose watercolor
- botanical illustration

### 素描风格
- pencil sketch
- charcoal drawing
- ink drawing
- cross-hatching

## 【艺术家参考】
- in style of Monet
- Van Gogh inspired
- Rembrandt lighting
- impressionism`,
    example: {
      input: '印象派风格花园场景',
      output: `【提示词】
"Impressionist oil painting style, beautiful garden scene with vibrant flowers, dappled sunlight filtering through trees, soft brushstrokes capturing the play of light and shadow, pastel colors with pops of bright pinks and purples, loose painterly technique in the style of Monet, artistic interpretation of nature, romantic and dreamy atmosphere, fine art painting --ar 4:5"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-029',
    title: '节日主题设计提示词',
    description: '各种节日主题的设计图片提示词',
    category: '图像生成',
    tags: ['节日', '主题', '设计', '装饰'],
    usage: 17890,
    rating: 4.7,
    content: `# 节日主题设计提示词指南

## 【节日类型】

### 春节
- Chinese New Year
- lunar new year
- red lanterns
- spring festival

### 西方节日
- Christmas design
- Halloween theme
- Valentine's Day
- Easter celebration

### 现代节日
- New Year countdown
- Thanksgiving
- Mother's Day
- anniversary

## 【设计元素】
- festive colors
- traditional symbols
- celebration mood
- seasonal decorations`,
    example: {
      input: '中国新年喜庆设计',
      output: `【提示词】
"Beautiful Chinese New Year celebration design, traditional red lanterns with golden tassels hanging, delicate cherry blossom branches in bloom, paper cut style decorative elements, auspicious clouds pattern, festive red and gold color palette, elegant and auspicious atmosphere, Spring Festival greeting card style, traditional Chinese aesthetic with modern design sense, celebratory and joyous mood --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-030',
    title: '3D渲染设计提示词',
    description: '3D产品渲染、场景建模、C4D风格提示词',
    category: '图像生成',
    tags: ['3D', '渲染', 'C4D', '建模'],
    usage: 21230,
    rating: 4.8,
    content: `# 3D渲染设计提示词指南

## 【3D风格】

### 产品渲染
- product 3D render
- CGI product
- studio lighting
- clean background

### 场景建模
- 3D environment
- isometric scene
- low poly world
- voxel art

### 艺术风格
- abstract 3D
- surreal 3D art
- glassmorphism 3D
- neumorphism 3D

## 【渲染特点】
- realistic materials
- soft lighting
- studio setup
- clean composition`,
    example: {
      input: '3D手机产品渲染',
      output: `【提示词】
"Professional 3D product render of smartphone, sleek modern design with glass back and metal frame, floating in clean gradient background, soft studio lighting with rim light accent, photorealistic materials and reflections, 3D CGI quality, technical product visualization, Blender/Cinema 4D render style, floating composition with subtle shadow, premium tech product aesthetic --ar 4:3"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-031',
    title: '文字排版设计提示词',
    description: 'Typography设计、字体排版、文字艺术提示词',
    category: '图像生成',
    tags: ['排版', '字体', 'Typography', '文字'],
    usage: 15680,
    rating: 4.7,
    content: `# 文字排版设计提示词指南

## 【排版风格】

### 现代简约
- clean typography
- minimalist layout
- sans-serif design
- white space

### 复古经典
- vintage typography
- retro lettering
- art deco style
- classic serif

### 创意艺术
- experimental type
- hand lettering
- 3D typography
- illustrative text

## 【应用场景】
- quote poster
- title design
- brand typography
- editorial layout`,
    example: {
      input: '励志名言排版设计',
      output: `【提示词】
"Beautiful typography quote design, inspirational phrase 'DREAM BIG' in elegant modern script lettering, clean minimalist composition with subtle decorative elements, balanced white space, sophisticated color palette of navy blue and gold, professional typography poster, high contrast, elegant and motivational aesthetic, ready for print or social media --ar 4:5"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-032',
    title: '游戏界面设计提示词',
    description: '游戏UI、HUD设计、游戏菜单界面提示词',
    category: '图像生成',
    tags: ['游戏', 'UI', '界面', '设计'],
    usage: 18920,
    rating: 4.8,
    content: `# 游戏界面设计提示词指南

## 【游戏类型】

### RPG游戏
- RPG game UI
- fantasy interface
- inventory system
- character stats

### 策略游戏
- strategy game UI
- resource panel
- building menu
- tactical hud

### 休闲游戏
- casual game UI
- puzzle interface
- mobile game design
- social game elements

## 【UI元素】
- health bars
- skill icons
- navigation menus
- achievement badges`,
    example: {
      input: '奇幻RPG游戏HUD界面',
      output: `【提示词】
"Fantasy RPG game HUD interface design, medieval themed UI elements including health and mana bars in ornate golden frames, circular minimap with compass rose, skill hotkey slots with glowing icons, inventory bag icon, quest tracker panel, rich brown and gold color palette with magical blue accents, World of Warcraft inspired aesthetic, ornate decorative borders, dark atmospheric background, game UI mockup --ar 16:9"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-033',
    title: '虚拟形象设计提示词',
    description: '虚拟人、VTuber、元宇宙头像设计提示词',
    category: '图像生成',
    tags: ['虚拟形象', 'VTuber', '元宇宙', '头像'],
    usage: 21340,
    rating: 4.8,
    content: `# 虚拟形象设计提示词指南

## 【形象类型】

### VTuber风格
- anime vtuber avatar
- streaming character
- expressive mascot
- cute mascot design

### 虚拟人
- realistic virtual human
- digital avatar
- metaverse character
- 3D avatar design

### 风格选择
- anime style
- semi-realistic
- stylized 3D
- cartoon character`,
    example: {
      input: '可爱VTuber虚拟主播形象',
      output: `【提示词】
"Adorable anime-style VTuber character design, cute girl with long pastel pink gradient hair and sparkling blue eyes, wearing a stylish outfit with cat ear accessories, expressive and animated pose, streaming personality aesthetic, pastel color palette, clean vector illustration style, suitable for avatar and branding, Live2D ready design, charming and appealing character --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-034',
    title: '水彩画风格提示词',
    description: '专业水彩画效果、水彩插画风格提示词',
    category: '图像生成',
    tags: ['水彩', '绘画', '艺术', '插画'],
    usage: 16780,
    rating: 4.8,
    content: `# 水彩画风格提示词指南

## 【水彩类型】

### 传统水彩
- traditional watercolor
- loose brushstrokes
- wet-on-wet technique
- paper texture

### 现代水彩
- contemporary watercolor
- botanical illustration
- fashion sketch
- minimalist watercolor

### 特殊效果
- salt texture
- splatter effects
- color bleeding
- gradient washes

## 【主题选择】
- floral watercolor
- landscape painting
- portrait study
- still life`,
    example: {
      input: '水彩花卉插画',
      output: `【提示词】
"Beautiful watercolor botanical illustration, delicate peony flowers in soft pink and coral tones, loose expressive brushstrokes on textured watercolor paper, green leaves with natural color bleeding, artistic and organic feel, botanical art print style, white background, elegant and romantic aesthetic, professional watercolor painting --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-035',
    title: '极简主义设计提示词',
    description: 'Minimalist设计风格、简约美学提示词',
    category: '图像生成',
    tags: ['极简', '简约', 'Minimalism', '设计'],
    usage: 19870,
    rating: 4.8,
    content: `# 极简主义设计提示词指南

## 【极简原则】

### 视觉元素
- clean lines
- ample white space
- limited color palette
- essential forms

### 设计理念
- less is more
- form follows function
- visual hierarchy
- intentional design

## 【应用类型】
- minimalist poster
- simple logo
- clean illustration
- modern branding`,
    example: {
      input: '极简风格海报设计',
      output: `【提示词】
"Elegant minimalist poster design, single geometric shape in solid color against clean white background, simple sans-serif typography for title, maximum white space, subtle visual interest, modern Swiss design aesthetic, sophisticated and clean, limited color palette of black and one accent color, international typographic style, professional and timeless --ar 2:3"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-036',
    title: '复古怀旧风格提示词',
    description: 'Retro复古设计、怀旧美学、年代感风格提示词',
    category: '图像生成',
    tags: ['复古', '怀旧', 'Retro', '年代感'],
    usage: 18920,
    rating: 4.7,
    content: `# 复古怀旧风格提示词指南

## 【年代风格】

### 50-60年代
- mid-century modern
- vintage 1950s
- retro diner aesthetic
- atomic age design

### 70-80年代
- groovy 70s style
- 80s retro aesthetic
- neon vintage
- synthwave design

### 90年代
- 90s nostalgia
- Y2K aesthetic
- grunge style
- early internet

## 【复古元素】
- aged paper texture
- film grain effect
- vintage color palette
- retro typography`,
    example: {
      input: '80年代复古风格海报',
      output: `【提示词】
"Stylish 1980s retro poster design, vibrant neon colors of pink, cyan, and purple, geometric shapes and grid patterns, synthwave aesthetic, retro-futuristic typography, vintage film grain texture, nostalgic 80s vibe, Memphis design elements, bold dynamic composition, throwback aesthetic, ready for print --ar 2:3"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-037',
    title: '赛博朋克风格提示词',
    description: 'Cyberpunk科幻、霓虹美学、未来都市风格提示词',
    category: '图像生成',
    tags: ['赛博朋克', 'Cyberpunk', '科幻', '霓虹'],
    usage: 23450,
    rating: 4.9,
    content: `# 赛博朋克风格提示词指南

## 【赛博元素】

### 视觉特征
- neon lights
- high-tech low-life
- futuristic cityscape
- holographic displays

### 色彩体系
- neon cyan
- hot pink
- electric purple
- acid green

### 主题氛围
- dystopian future
- urban sprawl
- tech noir
- blade runner inspired`,
    example: {
      input: '赛博朋克城市夜景',
      output: `【提示词】
"Stunning cyberpunk city nightscape, towering skyscrapers with holographic advertisements and neon signs, rain-soaked streets reflecting pink and blue neon lights, flying vehicles, steam rising from vents, dark moody atmosphere with high contrast, blade runner inspired aesthetic, futuristic urban sprawl, cinematic wide shot, highly detailed, concept art quality --ar 21:9"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-038',
    title: '像素艺术风格提示词',
    description: 'Pixel Art像素画、复古游戏风格设计提示词',
    category: '图像生成',
    tags: ['像素', 'Pixel Art', '复古游戏', '8-bit'],
    usage: 15680,
    rating: 4.7,
    content: `# 像素艺术风格提示词指南

## 【像素风格】

### 复古游戏
- 8-bit pixel art
- 16-bit retro game
- NES style graphics
- arcade game aesthetic

### 现代像素
- modern pixel art
- detailed pixel scene
- isometric pixel
- pixel animation

### 像素角色
- pixel character
- sprite design
- game avatar
- pixel portrait

## 【技术要素】
- limited color palette
- precise pixel placement
- clean edges
- retro charm`,
    example: {
      input: '像素风游戏场景',
      output: `【提示词】
"Charming pixel art game scene, cozy fantasy village with small houses and shops, pixelated trees and flowers, dirt paths connecting buildings, bright blue sky with simple clouds, limited 32-color palette, retro RPG game aesthetic, detailed isometric view, nostalgic 16-bit style, game asset quality, animated feel --ar 16:9"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-039',
    title: '手绘插画风格提示词',
    description: '手绘风格、手绘插画、艺术绘画提示词',
    category: '图像生成',
    tags: ['手绘', '插画', '绘画', '艺术'],
    usage: 21230,
    rating: 4.8,
    content: `# 手绘插画风格提示词指南

## 【手绘类型】

### 素描风格
- pencil sketch
- charcoal drawing
- ink illustration
- marker rendering

### 彩色手绘
- colored pencil art
- marker illustration
- mixed media
- hand-drawn style

### 数字手绘
- digital sketch
- Procreate style
- iPad illustration
- tablet drawing

## 【主题类型】
- portrait sketch
- fashion illustration
- editorial art
- storybook style`,
    example: {
      input: '手绘风格人物肖像',
      output: `【提示词】
"Beautiful hand-drawn portrait illustration, young woman with flowing hair, delicate pencil sketch style with soft shading, minimal color accents in watercolor, artistic and expressive, fine art drawing quality, white paper background, traditional illustration aesthetic, graceful and elegant, portrait study --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-040',
    title: '剪纸艺术风格提示词',
    description: '剪纸设计、Paper Cut艺术、层次感设计提示词',
    category: '图像生成',
    tags: ['剪纸', 'Paper Cut', '层次', '艺术'],
    usage: 13450,
    rating: 4.7,
    content: `# 剪纸艺术风格提示词指南

## 【剪纸类型】

### 传统剪纸
- Chinese paper cutting
- traditional patterns
- symbolic motifs
- red paper art

### 现代剪纸
- modern paper art
- layered paper design
- geometric cutouts
- shadow box art

### 3D剪纸
- 3D paper sculpture
- paper layering
- depth effect
- dimensional art

## 【设计要素】
- intricate details
- layered depth
- clean edges
- shadow effects`,
    example: {
      input: '多层剪纸风景艺术',
      output: `【提示词】
"Beautiful layered paper cut art landscape, multiple layers of paper creating depth and dimension, forest scene with trees in foreground, mountains in middle distance, moon and stars in background, soft gradient lighting from behind, intricate cut details, white paper with subtle colored backlighting, paper sculpture art, diorama style, handmade craft aesthetic --ar 4:5"`,
      type: 'text'
    }
  },
  
  // ========== 更多专业图像提示词 ==========
  {
    id: 'image-041',
    title: '极光星空摄影提示词',
    description: '极光、银河、星空、天文摄影风格提示词',
    category: '图像生成',
    tags: ['极光', '星空', '银河', '天文'],
    usage: 16780,
    rating: 4.9,
    content: `# 极光星空摄影提示词指南

## 【星空类型】

### 极光
- aurora borealis
- northern lights
- dancing green lights
- aurora reflection

### 银河
- milky way galaxy
- starry night sky
- meteor shower
- deep space nebula

## 【拍摄技巧】
- long exposure
- dark sky location
- foreground interest
- star trail effect`,
    example: {
      input: '冰岛极光与冰川',
      output: `【提示词】
"Breathtaking aurora borealis photography over Icelandic glacier, vibrant green and purple northern lights dancing across dark sky, snow-covered ice formations in foreground, stars visible through aurora, long exposure capture, dramatic and otherworldly landscape, professional astrophotography, crisp details, magical atmosphere --ar 16:9"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-042',
    title: '美食平铺图提示词',
    description: 'Flat Lay美食摄影、俯拍食物、食物摆盘提示词',
    category: '图像生成',
    tags: ['美食', 'Flat Lay', '俯拍', '摆盘'],
    usage: 18920,
    rating: 4.8,
    content: `# 美食平铺图提示词指南

## 【平铺类型】

### 早餐主题
- breakfast spread
- brunch flat lay
- morning coffee setup
- healthy breakfast bowl

### 正餐摆盘
- dinner table setting
- gourmet plating
- ingredient showcase
- recipe ingredients

## 【拍摄要点】
- overhead 90-degree angle
- styled composition
- natural lighting
- texture and color variety`,
    example: {
      input: '健康早餐平铺图',
      output: `【提示词】
"Beautiful breakfast flat lay photography, wooden table surface, smoothie bowl with fresh berries and granola, avocado toast with poached egg, cup of latte with foam art, fresh orange juice, scattered nuts and seeds, soft natural morning light from window, lifestyle food photography aesthetic, healthy and inviting, food magazine quality --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-043',
    title: '科幻机器人设计提示词',
    description: '机器人设计、机械角色、科幻机甲提示词',
    category: '图像生成',
    tags: ['机器人', '科幻', '机甲', '机械'],
    usage: 21230,
    rating: 4.8,
    content: `# 科幻机器人设计提示词指南

## 【机器人类型】

### 人形机器人
- humanoid robot
- android design
- cyborg character
- robotic humanoid

### 机械载具
- mecha design
- giant robot
- battle mech
- transformable machine

## 【设计风格】
- sleek futuristic
- industrial mechanical
- anime mecha style
- realistic engineering`,
    example: {
      input: '友好的家庭机器人设计',
      output: `【提示词】
"Friendly household robot character design, round and approachable shape with big expressive LED eyes, white and soft blue color scheme, smooth modern aesthetic, helpful and caring demeanor, clean minimal design, Pixar style character appeal, domestic robot concept art, warm and inviting personality, product design rendering --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-044',
    title: '中国风水墨画提示词',
    description: '国画风格、水墨山水、传统中国绘画提示词',
    category: '图像生成',
    tags: ['国画', '水墨', '山水', '中国风'],
    usage: 19870,
    rating: 4.9,
    content: `# 中国风水墨画提示词指南

## 【国画类型】

### 山水画
- ink landscape
- mountain and water
- traditional Chinese painting
- misty mountains

### 花鸟画
- ink flower painting
- bamboo and birds
- plum blossom art
- lotus pond scene

## 【风格特点】
- ink wash technique
- brush stroke variation
- negative space
- traditional composition`,
    example: {
      input: '水墨山水画',
      output: `【提示词】
"Traditional Chinese ink wash painting of misty mountain landscape, dramatic peaks rising from clouds, waterfall cascading down cliff, pine trees on rocky outcrops, traditional brush stroke technique, subtle gradations of black ink on rice paper, minimal color accent, zen and contemplative mood, classical Chinese art style, negative space composition --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-045',
    title: '二维码艺术设计提示词',
    description: '创意二维码、艺术二维码、品牌二维码设计提示词',
    category: '图像生成',
    tags: ['二维码', '创意', '设计', '品牌'],
    usage: 14560,
    rating: 4.6,
    content: `# 二维码艺术设计提示词指南

## 【设计类型】

### 品牌融合
- logo integrated QR
- brand color QR code
- corporate QR design
- marketing QR code

### 艺术创意
- artistic QR illustration
- scenic QR code
- pattern integrated
- decorative QR design

## 【设计要点】
- maintain scannability
- creative integration
- brand consistency
- visual appeal`,
    example: {
      input: '咖啡店艺术二维码',
      output: `【提示词】
"Artistic QR code design for coffee shop, coffee cup illustration integrated into scannable QR pattern, warm brown color palette with cream accents, steam rising from cup design, minimal and clean aesthetic, functional yet creative, brand identity integrated, square format, modern cafe style --ar 1:1"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-046',
    title: '珠宝首饰摄影提示词',
    description: '珠宝产品图、首饰展示、奢侈品摄影提示词',
    category: '图像生成',
    tags: ['珠宝', '首饰', '奢侈品', '产品'],
    usage: 17890,
    rating: 4.8,
    content: `# 珠宝首饰摄影提示词指南

## 【珠宝类型】

### 戒指
- diamond ring
- engagement ring
- wedding band
- statement ring

### 项链耳环
- pendant necklace
- earring collection
- bracelet jewelry
- jewelry set

## 【拍摄风格】
- macro close-up
- sparkling highlights
- dark velvet background
- elegant presentation`,
    example: {
      input: '钻石项链产品图',
      output: `【提示词】
"Stunning diamond necklace product photography, brilliant cut diamonds set in platinum chain, sparkling under professional studio lighting, dark velvet background for contrast, macro shot showing fire and brilliance, luxury jewelry advertising style, elegant and sophisticated, shallow depth of field, high-end magazine quality --ar 4:5"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-047',
    title: '城市建筑摄影提示词',
    description: '建筑摄影、城市建筑、现代建筑艺术提示词',
    category: '图像生成',
    tags: ['建筑', '城市', '现代', '设计'],
    usage: 18920,
    rating: 4.8,
    content: `# 城市建筑摄影提示词指南

## 【建筑类型】

### 现代建筑
- contemporary architecture
- glass skyscraper
- modern office building
- architectural details

### 历史建筑
- historic landmark
- classical architecture
- gothic cathedral
- ancient temple

## 【拍摄角度】
- dramatic perspective
- symmetry composition
- detail close-up
- aerial overview`,
    example: {
      input: '现代艺术博物馆建筑',
      output: `【提示词】
"Dramatic modern museum architecture photography, contemporary building with flowing organic forms, glass and steel construction, dramatic angles and reflections, blue sky background, architectural photography style, clean lines and curves, professional architectural visualization, award-winning design aesthetic, editorial quality --ar 16:9"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-048',
    title: '漫画分镜提示词',
    description: '漫画分镜、连环画、故事板设计提示词',
    category: '图像生成',
    tags: ['漫画', '分镜', '故事板', '连环画'],
    usage: 16780,
    rating: 4.7,
    content: `# 漫画分镜提示词指南

## 【漫画类型】

### 日式漫画
- manga style panels
- action sequence
- emotional close-up
- speed lines effect

### 美式漫画
- comic book layout
- superhero panel
- dramatic composition
- speech bubbles

## 【分镜要素】
- panel arrangement
- visual flow
- action storytelling
- expression focus`,
    example: {
      input: '动作场景漫画分镜',
      output: `【提示词】
"Dynamic manga action sequence storyboard, multiple panels showing martial arts fight scene, speed lines and impact effects, dramatic angles, character expressions, Japanese comic style, black and white ink illustration, sequential art storytelling, professional manga layout, action-packed composition --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-049',
    title: '书法艺术提示词',
    description: '书法设计、文字艺术、汉字美学提示词',
    category: '图像生成',
    tags: ['书法', '汉字', '艺术', '设计'],
    usage: 15670,
    rating: 4.8,
    content: `# 书法艺术提示词指南

## 【书法类型】

### 传统书法
- Chinese calligraphy
- brush writing
- ink character
- traditional style

### 现代书法
- modern calligraphy
- creative lettering
- artistic script
- contemporary style

## 【风格特点】
- brush stroke beauty
- ink flow variation
- balanced composition
- artistic expression`,
    example: {
      input: '禅字书法艺术',
      output: `【提示词】
"Beautiful Chinese calligraphy art featuring character '禅' (Zen), bold brush strokes with elegant flow, black ink on textured rice paper, artistic variation in stroke thickness, minimalist composition with red seal stamp, traditional yet contemporary aesthetic, zen and peaceful atmosphere, fine art calligraphy --ar 3:4"`,
      type: 'text'
    }
  },
  
  {
    id: 'image-050',
    title: '涂鸦艺术提示词',
    description: '街头涂鸦、城市艺术、Graffiti风格提示词',
    category: '图像生成',
    tags: ['涂鸦', 'Graffiti', '街头', '艺术'],
    usage: 17890,
    rating: 4.7,
    content: `# 涂鸦艺术提示词指南

## 【涂鸦类型】

### 街头风格
- urban graffiti
- street art mural
- wall painting
- spray can art

### 数字涂鸦
- digital graffiti
- illustration style
- vibrant colors
- urban aesthetic

## 【风格元素】
- bold outlines
- vibrant color palette
- urban texture
- expressive characters`,
    example: {
      input: '城市街头涂鸦艺术',
      output: `【提示词】
"Vibrant urban graffiti street art, colorful mural on city wall, bold outlines with spray paint effect, urban culture theme, dynamic composition with characters and typography, bright neon colors against brick texture, hip-hop aesthetic, street art photography style, expressive and energetic --ar 16:9"`,
      type: 'text'
    }
  }
];

// 默认导出
export default prompts;
