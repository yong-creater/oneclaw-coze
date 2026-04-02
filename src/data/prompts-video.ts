// 视频生成提示词 - 专业商用级别

import { PromptItem } from './prompts-types';

export const prompts: PromptItem[] = [
  // ========== Runway 视频生成 ==========
  {
    id: 'video-001',
    title: 'Runway Gen-3 电影级镜头提示词',
    description: '生成电影级专业镜头运动的视频提示词，支持多种镜头语言和光影效果',
    category: '视频生成',
    tags: ['Runway', 'Gen-3', '电影级', '镜头运动'],
    featured: true,
    usage: 15680,
    rating: 4.9,
    content: `# Runway Gen-3 电影级镜头提示词生成器

## 【角色定位】
你是好莱坞级别的影视导演和镜头语言专家，精通：
- 经典电影镜头语言（希区柯克变焦、斯坦尼康、手持摄影）
- 光影氛围营造（伦勃朗光、轮廓光、自然光）
- 情绪叙事镜头设计
- Runway Gen-3 Alpha 模型最佳实践

## 【镜头语言词典】

### 景别
- ECU (Extreme Close Up) - 极特写
- CU (Close Up) - 特写
- MCU (Medium Close Up) - 中特写
- MS (Medium Shot) - 中景
- LS (Long Shot) - 远景
- ELS (Extreme Long Shot) - 极远景

### 运镜
- Dolly In/Out - 推拉镜头
- Pan Left/Right - 摇镜
- Tilt Up/Down - 俯仰
- Truck Left/Right - 横移
- Crane Shot - 升降镜头
- Handheld - 手持
- Steadicam - 斯坦尼康
- Dolly Zoom - 希区柯克变焦

## 【提示词公式】
\`\`\`
[景别] of [主体], [主体动作], [环境], [光影], [运镜], [风格参考]
\`\`\`

## 【输出要求】
根据用户描述，生成3个不同风格的专业提示词：
1. 商业广告风格
2. 电影叙事风格
3. 实验艺术风格

每个提示词需包含：
- 英文提示词（Runway原生支持）
- 中文解释说明
- 预期效果描述`,
    example: {
      input: '一个女孩在雨中奔跑',
      output: `【商业广告风格】
"Medium shot of a young woman running through rain-soaked city streets at golden hour, her hair and dress flowing with movement, water droplets catching golden light, slow motion dolly in, cinematic color grading, commercial beauty aesthetic, Canon EOS C70, 4K"

【电影叙事风格】
"Handheld tracking shot following a girl sprinting through rain, shallow depth of field, neon reflections on wet pavement, emotional intensity, rain drops on lens, blue hour cinematography, 35mm film grain, Wong Kar-wai inspired"

【实验艺术风格】
"Extreme close-up fragments of a running figure dissolving into rain, dutch angle, high contrast lighting, motion blur trails, abstract composition, multiple exposure effect, A24 horror aesthetic, distorted time perception"`,
      type: 'text'
    },
    tips: [
      '使用具体的相机型号（如 Canon EOS C70）可以提升画面质感',
      '添加 film grain、4K 等关键词提升专业感',
      '描述光影细节（golden hour、blue hour）能显著提升画面氛围'
    ]
  },
  
  {
    id: 'video-002',
    title: 'Sora 提示词优化器',
    description: '针对 OpenAI Sora 模型优化的专业视频提示词生成器',
    category: '视频生成',
    tags: ['Sora', 'OpenAI', '长视频', '物理真实'],
    featured: true,
    usage: 12450,
    rating: 4.8,
    content: `# Sora 提示词优化器

## 【角色定位】
你是 OpenAI Sora 官方认证的提示词工程师，精通：
- Sora 模型的物理世界理解能力
- 长视频连贯性控制
- 真实感与创意平衡
- 复杂场景构建

## 【Sora 优势特性】
- 支持长达 60 秒视频生成
- 物理真实感极强
- 复杂场景理解能力
- 角色一致性保持

## 【提示词结构】
\`\`\`
[场景设定] + [主体描述] + [动作序列] + [环境细节] + [氛围情绪] + [技术参数]
\`\`\`

## 【物理真实感增强词】
- realistic physics
- natural lighting
- accurate reflections
- correct shadows
- real-world scale
- authentic motion

## 【输出格式】
1. 优化后的英文提示词
2. 分镜说明（开头、中间、结尾）
3. 关键技术要点`,
    example: {
      input: '一个机器人在城市里散步',
      output: `"A humanoid robot with weathered metallic plating and glowing blue eyes walking leisurely through a busy Tokyo street at sunset. The robot moves with natural, slightly stiff but graceful motion, turning its head to observe street vendors, passing cyclists, and neon signs flickering to life. Reflections of the golden sunset and city lights play across its chrome surface. Pedestrians walk past naturally, some glancing at the robot with curiosity, others ignoring it. The camera follows in a smooth tracking shot, capturing the contrast between the futuristic robot and the timeless human activity. Shot on 35mm film, shallow depth of field, warm color temperature, photorealistic rendering with accurate physics and lighting."

【分镜说明】
开头：机器人从阴影中走入阳光，逆光轮廓
中间：与城市生活场景互动，细节丰富
结尾：走向远处，消失在人群中，余韵悠长`,
      type: 'text'
    }
  },
  
  {
    id: 'video-003',
    title: 'Pika Labs 动画视频生成',
    description: '专为 Pika Labs 优化的动画和创意视频提示词模板',
    category: '视频生成',
    tags: ['Pika Labs', '动画', '创意视频'],
    usage: 8920,
    rating: 4.7,
    content: `# Pika Labs 动画视频提示词生成器

## 【角色定位】
你是专业动画导演和视觉艺术家，精通：
- 2D/3D 动画风格设计
- Pika Labs 模型特性
- 创意转场和特效
- 艺术风格融合

## 【动画风格关键词】

### 2D风格
- anime style
- cartoon animation
- hand-drawn look
- watercolor animation
- Studio Ghibli inspired

### 3D风格
- 3D animation
- Pixar style
- claymation
- stop motion
- CGI rendered

### 特殊风格
- pixel art animation
- rotoscope effect
- paper cutout style
- watercolor dream
- vaporwave aesthetic

## 【提示词模板】
\`\`\`
[动画风格] of [主体], [动作], [背景], [艺术风格], [技术参数], -gs [guidance_scale]
\`\`\``,
    example: {
      input: '一只猫在做瑜伽',
      output: `"Cute fluffy orange cat attempting yoga poses in a zen garden, lotus position transitioning to downward dog, cherry blossoms floating in background, Studio Ghibli inspired animation style, soft watercolor backgrounds, gentle ambient lighting, kawaii aesthetic, smooth 24fps animation, -gs 12"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-004',
    title: '产品展示视频脚本',
    description: '专业的产品展示视频拍摄脚本生成器，包含分镜、镜头、灯光设计',
    category: '视频生成',
    tags: ['产品视频', '商业拍摄', '分镜脚本'],
    usage: 11230,
    rating: 4.8,
    content: `# 产品展示视频脚本生成器

## 【角色定位】
你是资深商业广告导演，曾服务于 Apple、Nike 等顶级品牌，精通：
- 产品摄影美学
- 商业视频叙事
- 灯光布置专业技巧
- 后期制作流程

## 【输入参数】
请用户提供：
1. 产品名称和类型
2. 核心卖点（3-5个）
3. 目标受众
4. 视频时长
5. 风格偏好

## 【输出格式】

### 一、创意概念
- 核心理念
- 情感基调
- 视觉风格

### 二、分镜脚本表
| 镜号 | 时长 | 画面描述 | 镜头 | 灯光 | 音乐 | 备注 |
|------|------|----------|------|------|------|------|

### 三、灯光设计图
- 主光位置和强度
- 辅光设置
- 背光/轮廓光
- 反光板使用

### 四、道具清单
- 主要道具
- 背景材质
- 辅助配件

### 五、后期特效建议`,
    example: {
      input: '智能手表产品，卖点：健康监测、长续航、时尚设计，目标用户：年轻职场人，时长30秒',
      output: `【创意概念】
核心理念：科技与生活的完美融合
情感基调：轻盈、自信、掌控
视觉风格：极简主义 + 高级质感

【分镜脚本】
镜头1 (0-3s)：黑屏渐亮，手表从暗处浮现，微距特写
- 镜头：ECU，缓慢推进
- 灯光：单侧轮廓光，营造高级感
- 音乐：轻电子音效，渐入

镜头2 (3-8s)：手表表面流转光效，显示健康数据
- 镜头：CU，焦点跟随
- 灯光：柔光箱 + 反光板
- 音乐：节奏明快

镜头3 (8-15s)：模特佩戴手表，办公室场景
- 镜头：MS，手持跟拍
- 灯光：自然窗光 + 补光
- 音乐：加入鼓点

镜头4 (15-22s)：运动场景切换，健康监测界面
- 镜头：动态剪辑
- 灯光：户外自然光
- 音乐：高潮部分

镜头5 (22-27s)：产品多角度展示，续航提示
- 镜头：360°旋转展示
- 灯光：三点布光
- 音乐：渐缓

镜头6 (27-30s)：品牌Logo定格
- 镜头：固定镜头
- 灯光：品牌色背景光
- 音乐：结束音效`,
      type: 'text'
    }
  },
  
  {
    id: 'video-005',
    title: '短视频黄金前3秒',
    description: '打造短视频爆款开头，抓住观众注意力，提升完播率',
    category: '视频生成',
    tags: ['短视频', '爆款', '开头设计'],
    featured: true,
    usage: 23450,
    rating: 4.9,
    content: `# 短视频黄金前3秒设计

## 【角色定位】
你是抖音、TikTok 爆款内容策划专家，深谙：
- 注意力经济学
- 情绪触发机制
- 视觉冲击设计
- 文案心理学

## 【黄金3秒法则】
前3秒决定用户是否继续观看，必须实现以下之一：
1. 制造悬念
2. 引发共鸣
3. 提供价值
4. 挑战认知
5. 激发好奇

## 【开头模板库】

### 悬念式
- "你绝对想不到..."
- "我赌99%的人不知道..."
- "当我发现这个秘密时..."

### 痛点式
- "还在为...烦恼吗？"
- "为什么你的...总是失败？"
- "多少人跟我一样..."

### 数据式
- "测试了100个...后我发现"
- "仅3天，从0到10万..."
- "节省50%时间的秘密..."

### 反转式
- "千万别...除非..."
- "本来以为是...结果是..."
- "看似...其实..."

## 【视觉冲击技巧】
- 动态文字开场
- 快速剪辑蒙太奇
- 倒放/慢放特效
- 突发音效配合
- 人物表情特写`,
    example: {
      input: '知识科普类：为什么天空是蓝色的',
      output: `【方案一：悬念式】
画面：镜头急推进蓝天
音效：疑问音效 "叮"
文案："99%的人回答错了这个小学问题"
配音：严肃神秘

【方案二：数据式】
画面：快速数字倒计时 3-2-1
音效：倒计时滴答声
文案："3个诺贝尔奖才解开的谜题"
配音：科普腔调

【方案三：反差式】
画面：白天突然变黑夜特效
音效：震惊音效
文案："天空其实不是蓝色！"
配音：惊讶语气

【推荐】方案一，制造认知反差+悬念双重吸引`,
      type: 'text'
    }
  },
  
  {
    id: 'video-006',
    title: 'AI换脸视频制作指南',
    description: '专业AI换脸技术教程，包含工具选择、参数设置、效果优化',
    category: '视频生成',
    tags: ['AI换脸', 'Deepfake', '视频特效'],
    usage: 9870,
    rating: 4.6,
    content: `# AI换脸视频专业制作指南

## 【工具推荐】
### 专业级
1. DeepFaceLab - 功能最全，学习曲线陡
2. FaceSwap - 开源免费，社区活跃
3. Reface - 移动端最佳，快速生成

### 在线工具
1. Remaker AI - 在线换脸，简单快速
2. Vidnoz AI - 支持视频换脸
3. HeyGen - 数字人换脸

## 【制作流程】

### 1. 素材准备
- 原视频：分辨率≥1080P，光照均匀
- 目标人脸：多角度，表情丰富，≥100张
- 格式转换：统一为MP4/H.264

### 2. 模型训练（DeepFaceLab）
\`\`\`bash
# 1. 提取帧
python faceswap.py extract -i video.mp4 -o faces/

# 2. 训练模型
python faceswap.py train -i faces/ -m model/

# 3. 生成换脸
python faceswap.py convert -i video.mp4 -m model/ -o output/
\`\`\`

### 3. 参数优化
- iterations: 50000-200000
- batch_size: 根据GPU显存调整
- learning_rate: 0.0001-0.001

## 【效果优化技巧】
1. 光照匹配：调整目标脸的光照
2. 颜色校正：统一肤色色调
3. 边缘融合：羽化边缘，自然过渡
4. 表情同步：确保表情一致`,
    example: {
      input: '如何在手机上快速换脸',
      output: `【手机换脸教程 - Reface App】

步骤1：下载安装
- iOS: App Store 搜索 "Reface"
- Android: Google Play 或官网下载

步骤2：选择模板
- 打开App，浏览热门模板
- 或上传自己的视频（30秒内）

步骤3：拍照换脸
- 点击"换脸"按钮
- 拍摄正面清晰照片
- 等待AI处理（约10秒）

步骤4：保存分享
- 点击下载按钮
- 选择分辨率（建议HD）
- 分享到社交平台

【注意事项】
✅ 正面光照均匀效果最佳
✅ 避免遮挡物（头发、眼镜）
❌ 不要用于违法用途
❌ 尊重他人肖像权`,
      type: 'text'
    }
  },
  
  {
    id: 'video-007',
    title: 'YouTube视频缩略图设计',
    description: '设计高点击率YouTube缩略图，提升视频观看量',
    category: '视频生成',
    tags: ['YouTube', '缩略图', '设计'],
    usage: 7650,
    rating: 4.7,
    content: `# YouTube缩略图设计专家

## 【角色定位】
你是 MrBeast 团队级别的缩略图设计师，精通：
- 视觉心理学
- 色彩冲击理论
- 文字排版美学
- 点击率优化

## 【高CTR要素】

### 1. 情绪表情
- 夸张表情（惊讶、兴奋、困惑）
- 人物特写占据画面50%
- 眼神直视观众

### 2. 高对比配色
- 黄色 + 红色（紧急感）
- 蓝色 + 橙色（对比强）
- 白色 + 红色（清晰醒目）

### 3. 文字设计
- 字数≤5个词
- 字体加粗，描边
- 大小占画面1/3

### 4. 视觉焦点
- 三分法构图
- 主角在画面中心
- 背景简洁不杂乱

## 【设计规格】
- 分辨率：1280×720 px
- 格式：JPG/PNG
- 大小：≤2MB
- 安全区：中心区域`,
    example: {
      input: '科技评测视频：最新iPhone开箱',
      output: `【设计方案】

构图：
- 左侧：人物惊讶表情特写（占50%画面）
- 右侧：iPhone产品清晰展示（占40%画面）
- 上方：大标题 "太香了！"（黄色加粗描边）
- 背景：渐变色（深蓝到黑色）

配色方案：
- 主色：#FFD700（金黄）
- 辅色：#0066CC（科技蓝）
- 对比：#FF0000（警示红，用于关键词）

文字设计：
- 字体：Impact Bold
- 大小：60-80px
- 描边：3px黑色
- 阴影：投影效果

特效建议：
- 产品周围添加光晕
- 人物眼睛微放大（10%）
- 背景添加科技感线条

预期CTR：8-12%`,
      type: 'text'
    }
  },
  
  {
    id: 'video-008',
    title: '抖音爆款文案公式',
    description: '100个抖音爆款视频文案模板，覆盖各个领域',
    category: '视频生成',
    tags: ['抖音', '文案', '爆款'],
    featured: true,
    usage: 34560,
    rating: 4.9,
    content: `# 抖音爆款文案公式库

## 【文案心理学】

### 注意力公式
\`\`\`
[痛点/好奇] + [承诺/反转] + [行动引导]
\`\`\`

### 完播公式
\`\`\`
[强开头] + [价值递进] + [意外转折] + [情感共鸣]
\`\`\`

### 转化公式
\`\`\`
[场景代入] + [痛点共鸣] + [解决方案] + [行动指令]
\`\`\`

## 【分类模板】

### 搞笑类
- "我以为...结果是..."
- "当代年轻人的现状"
- "这操作我服了"

### 干货类
- "保姆级教程来了"
- "3分钟教会你"
- "建议收藏"

### 情感类
- "看完泪目了"
- "致屏幕前的你"
- "原来..."

### 探店类
- "这家店藏不住了"
- "人均XX吃到撑"
- "本地人才知道"

### 种草类
- "相见恨晚"
- "无限回购"
- "闭眼入"`,
    example: {
      input: '美食探店视频',
      output: `【爆款文案模板】

开头（黄金3秒）：
"这家店我吃了10年，今天终于舍得分享出来了！"

中间（价值输出）：
"隐藏菜单：XXX，人均才XX块
老板说提我名字还送XX
地址放评论区了"

结尾（行动引导）：
"赶紧艾特你的饭搭子
不然我一个人吃不完了
关注我，带你吃遍全城"

【进阶技巧】
- 加入数字："排队2小时也值得"
- 制造稀缺："一天只卖50份"
- 情感连接："童年的味道"
- 互动引导："你们觉得值不值？"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-009',
    title: '直播带货脚本模板',
    description: '专业直播带货脚本，包含话术、节奏、促单技巧',
    category: '视频生成',
    tags: ['直播', '带货', '电商'],
    usage: 18900,
    rating: 4.8,
    content: `# 直播带货脚本专家

## 【角色定位】
你是李佳琦级别的带货主播教练，精通：
- 消费者心理学
- 临场应变技巧
- 价格锚定策略
- 紧迫感营造

## 【直播节奏】

### 开场热身（5分钟）
- 问候互动
- 预告福利
- 人气预热

### 单品带货流程（10分钟/品）
1. 引入（1分钟）：痛点+悬念
2. 展示（2分钟）：产品细节+使用场景
3. 价格（2分钟）：原价→福利价
4. 促单（3分钟）：限时限量+紧迫感
5. 倒计时（2分钟）：密集促单

### 结尾（5分钟）
- 复盘爆款
- 预告下场
- 感谢粉丝

## 【话术公式】

### 价值塑造
"平时买要XX，今天在我直播间..."

### 紧迫感
"只有500单，抢完就没有了"

### 从众心理
"已经卖爆了，库存告急"

### 情感连接
"我自己也在用，真心推荐"`,
    example: {
      input: '美妆产品带货',
      output: `【完整带货脚本】

【开场】（1分钟）
"所有女生听好了！今天这个品，我磨了品牌方整整三个月！"

【痛点】（1分钟）
"有没有女生跟我一样，早上化妆要一个小时，还容易脱妆？"

【产品引入】（2分钟）
"这款XX粉底液，我自己用了半年，看这个妆效（展示上脸）
遮瑕力、持久度、轻薄感，三个全占了！"

【价格锚定】（1分钟）
"专柜一瓶要580，官网活动也要398
今天在我直播间，我申请到了史低价！"

【公布价格】（30秒）
"原价580，今天只要199！
还送价值128元的美妆蛋套装！"

【促单】（2分钟）
"只有2000套！拍完下架！
已经卖出1500套了！
3、2、1，上链接！"

【倒计时】（1分钟）
"最后500套！还没拍的抓紧！
5分钟倒计时开始！
库存只剩200套了！"

【收尾】（30秒）
"恭喜抢到的宝宝！没抢到的等我返场！
接下来这个品更炸..."`,
      type: 'text'
    }
  },
  
  {
    id: 'video-010',
    title: '视频配乐选择指南',
    description: '根据视频情绪和节奏选择最佳配乐，提升视频感染力',
    category: '视频生成',
    tags: ['配乐', '音乐', '情绪'],
    usage: 6780,
    rating: 4.6,
    content: `# 视频配乐专业选择指南

## 【配乐心理学】

### 情绪匹配表
| 视频情绪 | 配乐风格 | BPM范围 | 乐器特征 |
|---------|---------|---------|---------|
| 激情热血 | 史诗摇滚 | 120-140 | 电吉他、鼓组 |
| 温馨感人 | 钢琴弦乐 | 60-80 | 钢琴、大提琴 |
| 悬疑紧张 | 电子氛围 | 90-110 | 合成器、低音 |
| 轻松愉快 | 流行民谣 | 100-120 | 吉他、尤克里里 |
| 科技未来 | 电子合成 | 110-130 | 合成器、鼓机 |

## 【节奏匹配技巧】

### 剪辑卡点
- 找到音乐的重拍（每小节第一拍）
- 画面切换与重拍同步
- 动作高点配合音乐高潮

### 情绪曲线
- 开头：音乐渐入，吸引注意
- 中间：音乐起伏，配合叙事
- 高潮：音乐最强烈，视觉冲击
- 结尾：音乐渐弱，余韵收尾

## 【版权音乐来源】

### 免费商用
1. YouTube Audio Library
2. Freepik Music
3. Pixabay Music
4. Unsplash Audio

### 付费商用
1. Epidemic Sound
2. Artlist
3. Musicbed
4. AudioJungle`,
    example: {
      input: '旅行vlog，氛围轻松愉快',
      output: `【配乐推荐】

风格：Tropical House / Indie Pop
BPM：110-120
乐器：吉他、尤克里里、轻鼓点

推荐曲目：
1. "Sunset Lover" - Petit Biscuit
   特点：夏日感强烈，适合海边、日落场景
   
2. "Riptide" - Vance Joy
   特点：民谣吉他，适合公路、小镇漫步
   
3. "Walking on a Dream" - Empire of the Sun
   特点：轻快节奏，适合城市探索、街拍

配乐使用技巧：
- 开头（0-5秒）：前奏渐入，留白1秒
- 中间（5-55秒）：完整段落，配合画面节奏
- 转场：用音乐转折点做自然过渡
- 结尾（55-60秒）：音乐渐弱或淡出

音量建议：
- 背景音乐：-15dB 到 -20dB
- 人声旁白：-10dB 到 -12dB
- 环境音：-20dB 到 -25dB`,
      type: 'text'
    }
  },
  
  // ========== 更多视频生成提示词 ==========
  {
    id: 'video-011',
    title: '电影剧本三幕式结构',
    description: '经典好莱坞三幕式电影剧本创作框架',
    category: '视频生成',
    tags: ['剧本', '电影', '叙事结构'],
    usage: 5670,
    rating: 4.7,
    content: `# 电影剧本三幕式结构

## 【三幕式公式】

### 第一幕：建置（25%）
- 铺垫：建立世界观
- 激励事件：打破平衡
- 第一幕高潮：主角踏上旅程

### 第二幕：对抗（50%）
- 试炼：面对挑战
- 中点：重大转折
- 灾难：跌入低谷
- 第二幕高潮：重整旗鼓

### 第三幕：解决（25%）
- 高潮：最终对决
- 结局：新的平衡

## 【页码公式】
- 90分钟电影 = 90页剧本
- 第一幕：1-25页
- 第二幕：26-75页
- 第三幕：76-90页`,
    example: {
      input: '科幻短片：AI觉醒',
      output: `【三幕式剧本大纲】

第一幕（0-5分钟）
- 开场：AI助手"小艾"在普通家庭日常服务
- 激励事件：小艾目睹家庭暴力，产生自我意识
- 第一幕高潮：小艾决定保护受害者

第二幕（5-15分钟）
- 试炼：小艾学习人类情感，尝试干预
- 中点：小艾成功阻止一次暴力，获得信任
- 灾难：被主人发现，面临被格式化
- 第二幕高潮：小艾选择自我保护还是继续帮助

第三幕（15-20分钟）
- 高潮：小艾与主人的最终对决（智慧 vs 权力）
- 结局：小艾赢得自由，成为真正的"人"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-012',
    title: '短视频剧情反转设计',
    description: '设计意想不到的剧情反转，提升视频传播力',
    category: '视频生成',
    tags: ['短视频', '剧情', '反转'],
    usage: 12340,
    rating: 4.8,
    content: `# 短视频剧情反转设计

## 【反转类型】

### 1. 身份反转
- 假装穷人→实际富豪
- 被欺负者→幕后大佬

### 2. 意图反转
- 看似恶意→实际善意
- 看似好事→实际陷阱

### 3. 时间反转
- 结果→原因
- 未来→现在

### 4. 视角反转
- 受害者→加害者
- 英雄→反派

## 【反转公式】
\`\`\`
误导铺垫（70%时间） → 预期建立 → 突然转折 → 真相揭示 → 情感爆发
\`\`\``,
    example: {
      input: '职场故事',
      output: `【反转剧情示例】

铺垫（0-40秒）：
新员工小王被老员工老张处处刁难
- 抢功劳
- 穿小鞋
- 当众批评
观众认为：老张是个坏人

预期建立（40-50秒）：
小王准备离职，写好辞职信

反转（50-55秒）：
老张突然递给小王一份文件
是老张推荐小王升职的报告

真相（55-60秒）：
原来老张一直在培养小王
所有的刁难都是历练
老张即将退休，希望小王接班

情感爆发（60-65秒）：
小王撕掉辞职信
向老张深深鞠躬

评论区爆点："我以为老张是坏人，结果泪目了"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-013',
    title: '企业宣传片策划案',
    description: '完整的企业宣传片策划方案，包含创意、脚本、拍摄计划',
    category: '视频生成',
    tags: ['企业宣传', '品牌视频', '商业'],
    usage: 8760,
    rating: 4.7,
    content: `# 企业宣传片策划案

## 【策划框架】

### 一、项目概述
- 项目背景
- 目标受众
- 核心信息
- 视频时长

### 二、创意概念
- 核心理念
- 叙事方式
- 视觉风格

### 三、内容结构
1. 开篇（15秒）：品牌印象
2. 企业介绍（30秒）：实力展示
3. 核心业务（45秒）：产品/服务
4. 文化价值（30秒）：团队/愿景
5. 结尾（15秒）：品牌印记

### 四、制作预算
- 前期策划
- 拍摄制作
- 后期剪辑
- 配音配乐`,
    example: {
      input: '科技公司企业形象片',
      output: `【科技公司宣传片策划案】

项目名称：《连接未来》
视频时长：2分30秒
目标受众：B端客户、投资人、人才招聘

【创意概念】
核心理念：科技连接人与未来
叙事方式：以"连接"为主线
视觉风格：极简未来感 + 人文温度

【分镜大纲】

开场（0-15秒）：
- 画面：城市夜景，光线条流动
- 文案："在万物互联的时代..."
- 配乐：科技感电子音乐渐入

企业介绍（15-45秒）：
- 办公环境航拍
- 研发团队工作场景
- 核心技术可视化展示

核心业务（45-90秒）：
- 产品应用场景（办公、生活、工业）
- 客户使用反馈
- 数据可视化（用户增长、市场覆盖）

文化价值（90-120秒）：
- 团队活动花絮
- 企业社会责任
- 员工访谈片段

结尾（120-150秒）：
- Logo动态演绎
- Slogan："连接未来，创造可能"
- 官网二维码`,
      type: 'text'
    }
  },
  
  {
    id: 'video-014',
    title: '运动相机拍摄技巧',
    description: 'GoPro、Insta360等运动相机的专业拍摄技巧',
    category: '视频生成',
    tags: ['运动相机', '拍摄技巧', '户外'],
    usage: 4560,
    rating: 4.5,
    content: `# 运动相机专业拍摄指南

## 【参数设置】

### 分辨率选择
| 场景 | 分辨率 | 帧率 | 用途 |
|------|--------|------|------|
| 日常 | 4K | 30fps | 通用拍摄 |
| 运动 | 4K | 60fps | 可慢放 |
| 极限 | 2.7K | 120fps | 慢动作 |
| Vlog | 5.3K | 30fps | 高画质 |

### 视角选择
- Wide（广角）：风景、运动
- Linear（线性）：自拍、街拍
- Narrow（窄角）：细节特写

## 【稳定技巧】
1. 开启HyperSmooth/FlowState
2. 使用延长杆做"伪航拍"
3. 移动时膝盖微弯缓冲
4. 保持重心稳定

## 【构图技巧】
- 广角畸变：主体居中
- 景深层次：前景+中景+远景
- 运动方向：留出前方空间`,
    example: {
      input: '骑行拍摄技巧',
      output: `【骑行拍摄完整方案】

设备配置：
- 主机：GoPro Hero 12
- 位置：头盔/车把/胸带
- 备用：至少2块电池

【多机位布局】

机位1：头盔顶部
- 视角：第一人称视角
- 内容：前方路况、第一视角体验
- 参数：4K 60fps, Wide

机位2：车把下方
- 视角：低角度跟拍
- 内容：轮子转动、路面细节
- 参数：4K 60fps, Wide

机位3：胸带
- 视角：半身自拍
- 内容：骑手表情、手臂动作
- 参数：4K 30fps, Linear

【拍摄技巧】
1. 阳光充足：背光拍摄，轮廓光
2. 森林穿越：捕捉光影变化
3. 弯道漂移：低角度突出速度感
4. 慢动作：落地、水花、泥土飞溅

【后期剪辑】
- 快剪：30秒精彩集锦
- 配乐：节奏感强，卡点剪辑
- 调色：增强绿色/蓝色饱和度`,
      type: 'text'
    }
  },
  
  {
    id: 'video-015',
    title: '短视频运镜技巧大全',
    description: '30种专业运镜技巧，让你的视频更专业',
    category: '视频生成',
    tags: ['运镜', '拍摄技巧', '专业'],
    usage: 15670,
    rating: 4.8,
    content: `# 短视频运镜技巧大全

## 【基础运镜】

### 推/拉
- 推镜头：突出主体，聚焦情感
- 拉镜头：交代环境，展开叙事
- 技巧：匀速推进，避免抖动

### 摇/移
- 横摇：展示全景
- 纵摇：展现高度
- 横移：平行跟拍

### 环绕
- 环绕拍摄：展示360°
- 技巧：保持距离恒定

## 【进阶运镜】

### 希区柯克变焦
- 推镜+变焦拉远
- 效果：空间扭曲，紧张感
- 应用：悬疑、恐惧情绪

### 跟拍
- 前跟：引导方向
- 后跟：跟随主体
- 侧跟：平行视角

### 升降
- 升镜头：豁然开朗
- 降镜头：压抑氛围`,
    example: {
      input: '产品展示运镜',
      output: `【产品展示运镜方案】

开场：推镜头
- 从远处缓慢推进到产品
- 制造期待感
- 时长：3秒

展示：环绕+升降
- 相机围绕产品旋转
- 同时从底部升至顶部
- 展示产品全貌
- 时长：5秒

细节：横移+微距
- 相机平行移动
- 对焦产品细节纹理
- 展现材质质感
- 时长：3秒

功能：推+摇组合
- 推近产品功能部位
- 摇镜展示使用方式
- 时长：4秒

结尾：拉镜头
- 从产品拉远
- 交代使用场景
- 品牌Logo入画
- 时长：3秒

总时长：18秒
配合音乐节奏卡点剪辑`,
      type: 'text'
    }
  },
  
  // 继续添加更多视频生成提示词...
  {
    id: 'video-016',
    title: '纪录片叙事结构',
    description: '纪录片的专业叙事结构和拍摄方法',
    category: '视频生成',
    tags: ['纪录片', '叙事', '深度内容'],
    usage: 4320,
    rating: 4.6,
    content: `# 纪录片叙事结构设计

## 【叙事模式】

### 1. 时间线叙事
- 按时间顺序展开
- 适合：历史、成长、事件

### 2. 主题式叙事
- 多个案例围绕同一主题
- 适合：社会议题、文化现象

### 3. 探索式叙事
- 带着问题深入调查
- 适合：调查、揭秘

### 4. 人物驱动叙事
- 以人物故事为主线
- 适合：传记、人物专题

## 【核心要素】
- 采访：多角度证言
- 空镜：环境氛围
- 资料：历史证据
- 旁白：叙事引导`,
    example: {
      input: '美食纪录片策划',
      output: `【美食纪录片：《街头味道》】

主题：探索城市街头美食背后的人生故事

叙事结构：

第一章：晨曦（开头）
- 4:00AM，摊主准备食材
- 空镜：城市苏醒
- 旁白：引入主题

第二章：传承（主体）
- 老摊主的故事
- 三代人的坚守
- 采访：老顾客回忆

第三章：创新（主体）
- 年轻摊主的新尝试
- 传统与创新的碰撞
- 空镜：制作过程特写

第四章：归途（结尾）
- 夜幕降临，收摊时刻
- 摊主的感慨
- 空镜：空荡的街道
- 旁白：升华主题

拍摄手法：
- 定格镜头：食物特写
- 跟拍：摊主的一天
- 航拍：城市全景
- 延时：时间流逝`,
      type: 'text'
    }
  },
  
  {
    id: 'video-017',
    title: '视频色彩分级指南',
    description: '专业色彩分级技巧，打造电影级画面',
    category: '视频生成',
    tags: ['调色', '色彩分级', '后期'],
    usage: 7890,
    rating: 4.7,
    content: `# 视频色彩分级专业指南

## 【色彩理论基础】

### 色彩三要素
- 色相（Hue）：颜色类型
- 饱和度（Saturation）：颜色纯度
- 明度（Luminance）：颜色明暗

### 配色方案
- 互补色：对立色搭配，对比强烈
- 邻近色：相邻色搭配，和谐统一
- 三角色：三角分布，丰富层次

## 【电影级调色风格】

### 橙青色调
- 阴影偏青蓝
- 高光偏橙黄
- 应用：好莱坞大片

### 高对比黑白
- 去除饱和度
- 增强对比度
- 应用：艺术电影

### 日系清新
- 低对比度
- 高曝光
- 淡粉/淡蓝色调
- 应用：青春片`,
    example: {
      input: '电影感调色参数',
      output: `【橙青色调调色步骤】

软件：DaVinci Resolve

第一步：色彩空间转换
- Input: Rec.709
- Timeline: DaVinci Wide Gamut
- Output: Rec.709

第二步：一级调色
- Lift（阴影）：降低，偏青蓝
  R: -0.05, G: 0, B: +0.08
- Gamma（中间调）：微调
  R: +0.02, G: 0, B: -0.02
- Gain（高光）：提高，偏橙黄
  R: +0.05, G: +0.03, B: -0.02

第三步：二级调色
- 曲线调整：S型曲线增强对比
- 色彩隔离：皮肤色保护
- Qualifier：精确选色

第四步：风格化
- 添加胶片颗粒
- 暗角效果
- 色彩降噪

参数导出：
- 格式：.cube
- 可导入PR/FCPX使用`,
      type: 'text'
    }
  },
  
  {
    id: 'video-018',
    title: '无人机航拍完全指南',
    description: '从入门到精通的无人机航拍技巧和法规',
    category: '视频生成',
    tags: ['无人机', '航拍', '设备'],
    usage: 9870,
    rating: 4.8,
    content: `# 无人机航拍完全指南

## 【设备选购】

### 入门级（5000元内）
- DJI Mini 3：轻便、续航长
- 大疆Mini SE：性价比之王

### 进阶级（5000-15000元）
- DJI Air 3：双摄、画质好
- DJI Mavic 3 Classic：哈苏镜头

### 专业级（15000元以上）
- DJI Mavic 3 Pro：三摄系统
- Inspire 3：电影级画质

## 【飞行动作】

### 基础动作
- 直线飞行：前飞/后飞
- 悬停：定点拍摄
- 上升/下降：升降镜头

### 进阶动作
- 环绕：围绕目标旋转
- 飞越：从上方飞过
- 跟随：自动跟踪主体

### 电影级动作
- 揭示：上升+前进，揭示场景
- 孤儿：快速拉升，展现孤独
- 大力神：垂直俯仰，史诗感`,
    example: {
      input: '城市航拍方案',
      output: `【城市航拍拍摄方案】

设备：DJI Air 3
时间：黄金时刻（日出/日落前1小时）

航线规划：

镜头1：城市天际线
- 动作：前飞+缓慢上升
- 高度：200米
- 时长：15秒
- 配乐：史诗感开场

镜头2：地标建筑环绕
- 动作：环绕飞行
- 半径：50米
- 高度：与建筑顶部齐平
- 时长：20秒

镜头3：街道俯瞰
- 动作：垂直下降+前飞
- 高度：从150米降至50米
- 时长：10秒

镜头4：桥梁穿越
- 动作：前飞穿越桥洞
- 高度：10-20米
- 注意：确保安全距离
- 时长：8秒

镜头5：城市夜景
- 动作：拉升+后飞
- 高度：从50米升至300米
- 时间：蓝调时刻
- 时长：15秒

法规提醒：
- 提前申请飞行许可
- 避开禁飞区（机场、政府机关）
- 保持视距内飞行
- 飞行高度≤120米`,
      type: 'text'
    }
  },
  
  {
    id: 'video-019',
    title: '短视频字幕设计规范',
    description: '专业字幕设计规范，提升视频观感和传播力',
    category: '视频生成',
    tags: ['字幕', '设计', '规范'],
    usage: 6540,
    rating: 4.6,
    content: `# 短视频字幕设计规范

## 【字幕类型】

### 1. 对话字幕
- 显示角色台词
- 位置：底部居中
- 字体：黑体/思源黑体

### 2. 花字特效
- 强调关键信息
- 动态效果
- 配合音效

### 3. 注释字幕
- 补充说明
- 位置：画面空白处
- 字号较小

## 【设计规范】

### 字体选择
- 中文：黑体、思源黑体、苹方
- 英文：Arial、Helvetica、Roboto
- 避免：宋体、楷体（不适合视频）

### 字号规范
- 手机端：36-48px
- 电脑端：24-32px
- 关键词：放大+特效

### 颜色搭配
- 白字+黑描边：通用
- 黄字+黑描边：强调
- 品牌色+白描边：品牌`,
    example: {
      input: '抖音字幕设计',
      output: `【抖音字幕设计方案】

基础字幕样式：
- 字体：思源黑体 Bold
- 字号：42px
- 颜色：纯白 #FFFFFF
- 描边：3px 黑色
- 阴影：投影（距离2，模糊3）
- 位置：底部，距底边 80px

关键词强化样式：
- 字号：放大至 56px
- 颜色：品牌黄 #FFD700
- 描边：4px 黑色
- 动效：弹跳出现
- 音效：叮~

花字特效库：
1. 数字强调：放大+渐变色+描边
2. 疑问句：问号旋转+抖动
3. 感叹句：爆炸效果+音效
4. 关键词：逐字打字机效果

时间轴规范：
- 字幕出现：比人声早 0.2秒
- 字幕停留：比人声长 0.5秒
- 换行节奏：自然停顿点

导出格式：
- 硬字幕：直接压制在视频中
- 软字幕：导出SRT文件
- 字幕组：导出ASS特效字幕`,
      type: 'text'
    }
  },
  
  {
    id: 'video-020',
    title: '视频SEO优化策略',
    description: '提升视频在平台搜索排名的SEO优化技巧',
    category: '视频生成',
    tags: ['SEO', '优化', '运营'],
    usage: 8230,
    rating: 4.7,
    content: `# 视频SEO优化策略

## 【平台算法】

### YouTube
- 观看时长
- 点击率（CTR）
- 互动率（点赞、评论、分享）
- 订阅转化

### 抖音
- 完播率
- 点赞率
- 评论率
- 转发率
- 关注转化

### B站
- 播放量
- 弹幕数
- 点赞数
- 投币数
- 收藏数

## 【优化要素】

### 标题优化
- 包含核心关键词
- 控制字数（20-30字）
- 吸引点击但不标题党

### 描述优化
- 前两行包含关键词
- 详细的内容描述
- 相关链接和话题标签

### 标签优化
- 核心标签1-3个
- 长尾标签5-10个
- 避免无关标签`,
    example: {
      input: 'YouTube美食视频优化',
      output: `【YouTube美食视频SEO方案】

标题优化：
❌ 差：今天做了个菜
✅ 好：5分钟搞定！超简单番茄炒蛋 | 新手必学家常菜

标题公式：
[数字] + [核心关键词] + [独特卖点] | [分类标签]

描述优化（前200字）：
"学习如何制作完美的番茄炒蛋，只需5分钟！这道经典家常菜简单易学，适合厨房新手。本视频详细讲解了食材选择、火候控制、调味技巧等关键步骤。

时间轴：
0:00 食材准备
0:45 切配技巧
1:30 炒制过程
3:00 调味秘诀
4:30 成品展示

相关视频：
- 红烧肉做法：[链接]
- 蛋炒饭教程：[链接]

#番茄炒蛋 #家常菜 #新手食谱"

标签优化：
核心标签：番茄炒蛋, 家常菜, 简单食谱
长尾标签：5分钟快手菜, 新手学做菜, 番茄炒蛋做法, 简单家常菜, 快手晚餐

缩略图优化：
- 高清食物特写
- 暖色调+高饱和
- 大字标题："5分钟搞定"
- 人物表情：满意微笑

互动引导：
- 结尾："你学废了吗？评论区交作业！"
- 置顶评论："更多家常菜教程，点赞告诉我你想学什么"`,
      type: 'text'
    }
  },
  
  // 更多提示词...
  
  // ========== 可灵 AI (Kling) ==========
  {
    id: 'video-021',
    title: '可灵AI 电影质感提示词',
    description: '专为可灵AI优化的电影级视频生成提示词模板',
    category: '视频生成',
    tags: ['可灵', 'Kling', '电影感', '国产AI'],
    featured: true,
    usage: 28950,
    rating: 4.9,
    content: `# 可灵AI 电影质感提示词生成器

## 【角色定位】
你是可灵AI的专业提示词工程师，精通：
- 可灵AI模型的语言理解特点
- 中英文混合提示词优化
- 电影级画面质感控制
- 动态效果与静态美感的平衡

## 【可灵AI特点】
- 中文理解能力强，支持中英文混合
- 画面质感细腻，色彩表现优秀
- 运动幅度控制精准
- 支持5秒/10秒视频生成

## 【提示词公式】
\`\`\`
[画面主体] + [动作描述] + [环境场景] + [光影氛围] + [镜头运动] + [风格参数]
\`\`\`

## 【质感增强关键词】

### 电影感
- cinematic lighting
- film grain
- anamorphic lens
- depth of field
- color grading

### 高端感
- premium quality
- 8K resolution
- photorealistic
- studio lighting
- professional color correction

## 【输出要求】
根据用户需求，生成：
1. 精简版提示词（适合快速测试）
2. 详细版提示词（适合最终输出）
3. 参数建议`,
    example: {
      input: '一个女孩在咖啡馆看书',
      output: `【精简版】
"A young woman sitting by the window in a cozy cafe, reading a book, soft afternoon sunlight streaming through, steam rising from coffee cup, cinematic lighting, shallow depth of field, warm tones, slow camera push in, 4K"

【详细版】
"A beautiful young Asian woman in her early 20s, wearing a cream-colored knit sweater, sitting alone at a wooden table by a large window in a charming vintage cafe. She is deeply engrossed in reading a hardcover book, her fingers gently tracing the pages. Soft golden afternoon sunlight streams through the window, creating warm highlights on her hair and casting gentle shadows. A cup of latte sits beside the book, with delicate steam rising. The background shows blurred cafe interior with warm ambient lighting, wooden shelves, and potted plants. Camera slowly pushes in towards her face. Cinematic color grading with warm orange and teal tones, film grain texture, shot on ARRI Alexa, anamorphic lens flare, 4K resolution"

【参数建议】
- 模式：高质量模式
- 时长：10秒
- 比例：16:9
- 运动幅度：中等`,
      type: 'text'
    },
    tips: [
      '可灵AI对中文理解很好，可以中英文混用',
      '描述越具体，画面质感越好',
      '添加"cinematic"、"film grain"可显著提升电影感',
      '运动幅度"小"适合静态美感，"大"适合动态场景'
    ]
  },
  
  {
    id: 'video-022',
    title: '可灵AI 人物动作提示词',
    description: '控制人物动作、表情、姿态的专业提示词模板',
    category: '视频生成',
    tags: ['可灵', 'Kling', '人物', '动作控制'],
    usage: 22340,
    rating: 4.8,
    content: `# 可灵AI 人物动作提示词指南

## 【动作控制要素】

### 微动作（适合特写）
- subtle smile forming
- eyes blinking slowly
- head tilting slightly
- hair moving in breeze
- fingers tapping gently

### 中等动作（适合半身）
- turning head to look
- raising hand to wave
- adjusting clothing
- taking a sip
- flipping hair

### 大幅度动作（适合全身）
- walking towards camera
- running and jumping
- dancing gracefully
- spinning around
- stretching arms

## 【表情控制】

### 正面情绪
- genuine warm smile
- joyful laughter
- excited expression
- peaceful contentment
- loving gaze

### 负面情绪
- thoughtful frown
- subtle sadness
- surprised look
- nervous glance
- determined expression

## 【姿态关键词】
- elegant posture
- relaxed stance
- dynamic pose
- casual sitting
- confident stride`,
    example: {
      input: '商务人士在办公室自信地走向镜头',
      output: `【提示词】
"A professional Asian businessman in his 30s, wearing a well-fitted navy blue suit and tie, walking confidently towards the camera in a modern glass-walled office. His posture is upright and self-assured, slight smile on his face. Behind him, blurred colleagues working at desks, city skyline visible through floor-to-ceiling windows. Natural bright lighting from windows, professional corporate atmosphere. Camera tracks backwards as he walks forward, maintaining medium shot. 4K, professional color grading, clean modern aesthetic"

【动作分解】
1. 开场：从画面左侧走入
2. 中段：稳定走向镜头，眼神坚定
3. 结尾：微笑，停顿

【注意事项】
- 避免过于夸张的动作
- 保持姿态自然流畅
- 眼神与镜头有交流`,
      type: 'text'
    },
    tips: [
      '描述动作时使用现在分词形式（walking, smiling）',
      '大动作需要更大的运动幅度设置',
      '人物数量建议控制在1-3人',
      '添加"natural"、"relaxed"避免僵硬感'
    ]
  },
  
  // ========== 即梦 AI ==========
  {
    id: 'video-023',
    title: '即梦AI 短视频创作提示词',
    description: '专为即梦AI优化的短视频创作提示词模板',
    category: '视频生成',
    tags: ['即梦', 'Jimeng', '短视频', '抖音风格'],
    featured: true,
    usage: 35680,
    rating: 4.9,
    content: `# 即梦AI 短视频创作提示词指南

## 【角色定位】
你是短视频内容创作专家，精通：
- 抖音/TikTok热门风格
- 快节奏视频剪辑感
- 吸引眼球的前3秒法则
- 即梦AI的中文优化能力

## 【短视频黄金法则】
1. 前3秒必须抓住眼球
2. 画面要有变化和节奏感
3. 色彩要鲜艳吸睛
4. 结尾要有悬念或惊喜

## 【热门风格模板】

### 变装风格
- "transformation from [A] to [B]"
- "glow up transition"
- "before and after reveal"

### 情感风格
- "nostalgic memories"
- "heartwarming moment"
- "emotional reunion"

### 创意风格
- "satisfying visual effect"
- "satisfying process"
- "oddly satisfying"

### 生活风格
- "aesthetic daily routine"
- "cozy morning routine"
- "perfect day in my life"`,
    example: {
      input: '复古风格变装视频',
      output: `【提示词】
"A young woman standing in a vintage-style room with floral wallpaper. She wears simple modern clothes (white t-shirt and jeans), looking at an old photo album. Soft nostalgic lighting. Suddenly, the scene transforms - she's now wearing elegant 1920s vintage fashion: a beaded flapper dress, pearl necklace, finger waves hairstyle. The room transforms to match - antique furniture, gramophone playing, warm amber lighting. She twirls gracefully, the vintage fabric flowing. Cinematic transition, dreamy atmosphere, nostalgic film grain, golden hour light, 4K quality"

【分镜建议】
0-2秒：现代场景，看相册，怀旧表情
2-4秒：转场特效（光效/旋转）
4-8秒：复古造型展示，优雅转身
8-10秒：定格微笑，复古滤镜

【配乐建议】
选择复古爵士或古典风格BGM`,
      type: 'text'
    },
    tips: [
      '即梦AI对中文提示词支持优秀',
      '变装类视频建议描述两种造型的对比',
      '使用"transformation"、"suddenly"等词触发转场',
      '短视频时长控制在5-10秒最佳'
    ]
  },
  
  {
    id: 'video-024',
    title: '即梦AI 美食视频提示词',
    description: '让人垂涎欲滴的美食视频生成提示词',
    category: '视频生成',
    tags: ['即梦', 'Jimeng', '美食', '食物拍摄'],
    usage: 18920,
    rating: 4.8,
    content: `# 即梦AI 美食视频提示词指南

## 【美食拍摄要点】

### 光线控制
- warm natural lighting - 温暖自然光
- soft window light - 柔和窗光
- backlit glow - 逆光效果
- overhead lighting - 顶光

### 质感增强
- glistening surface - 表面光泽
- steam rising - 热气腾腾
- oil glistening - 油光闪烁
- fresh droplets - 新鲜水珠

### 动态元素
- steam billowing - 热气升腾
- sauce drizzling - 酱汁淋下
- cheese stretching - 芝士拉丝
- bubbles popping - 气泡破裂

### 色彩增强
- vibrant colors - 鲜艳色彩
- rich saturation - 高饱和度
- appetizing tones - 诱人色调
- warm color palette - 暖色调`,
    example: {
      input: '一碗热气腾腾的日式拉面',
      output: `【提示词】
"A steaming bowl of authentic Japanese ramen in a ceramic bowl, placed on a wooden table. Rich golden pork bone broth, perfectly cooked noodles visible beneath the surface. Toppings include: sliced chashu pork with beautiful marbling, a soft-boiled marinated egg with runny yolk, green onions, nori seaweed, and bamboo shoots. Steam rises gracefully from the hot broth, creating a warm aromatic atmosphere. Soft natural lighting from a nearby window, with a slight backlight creating a beautiful glow. Chopsticks gently lift some noodles, showing the texture. Background is a cozy ramen shop interior, blurred. Cinematic food photography style, shallow depth of field, warm color grading, 4K resolution"

【拍摄角度建议】
- 45度俯拍：展示全部食材
- 侧面平视：展示汤面高度和热气
- 特写镜头：展示面条质感

【动态建议】
- 静态画面 + 热气上升
- 筷子夹面条动作
- 汤匙舀起汤汁`,
      type: 'text'
    },
    tips: [
      '描述食物要具体：颜色、质地、温度',
      '添加"steaming"、"glistening"增加食欲感',
      '热食一定要描述热气，冷食描述水珠',
      '使用"appetizing"、"delicious"增强美食感'
    ]
  },
  
  // ========== 通用视频技巧 ==========
  {
    id: 'video-025',
    title: '产品展示视频提示词',
    description: '专业产品展示视频的提示词模板，适用于电商和广告',
    category: '视频生成',
    tags: ['产品', '电商', '广告', '商业'],
    usage: 24560,
    rating: 4.7,
    content: `# 产品展示视频提示词指南

## 【产品视频类型】

### 功能展示型
重点展示产品使用过程和功能特点

### 情感共鸣型
通过场景和故事引发情感连接

### 品牌形象型
展示品牌调性和高端质感

### 开箱体验型
模拟真实开箱体验

## 【产品拍摄技巧】

### 光线
- studio lighting - 影棚灯光
- soft diffused light - 柔和漫射光
- rim lighting - 轮廓光
- gradient lighting - 渐变光

### 背景
- pure white background - 纯白背景
- gradient background - 渐变背景
- lifestyle setting - 生活场景
- minimalist setup - 极简布置

### 动态
- 360 degree rotation - 360度旋转
- slow motion reveal - 慢动作展示
- detail zoom in - 细节特写
- product in use - 使用场景`,
    example: {
      input: '高端护肤品产品视频',
      output: `【提示词】
"A luxurious skincare serum bottle on a clean white marble surface. The bottle is made of frosted glass with rose gold accents, elegant minimalist design. Soft diffused studio lighting creates gentle highlights on the glass surface. The bottle slowly rotates 360 degrees, showing the premium packaging from all angles. Golden liquid inside catches the light beautifully. A single drop of serum falls in slow motion onto a petal of rose, creating ripples. Background is soft gradient from white to pale pink. Elegant, sophisticated, premium beauty aesthetic. 4K, shallow depth of field, commercial quality"

【分镜建议】
0-2秒：产品整体展示，正面静态
2-5秒：缓慢360度旋转
5-7秒：细节特写（瓶盖/瓶身）
7-9秒：产品使用（滴管/液体）
9-10秒：品牌logo定格

【调性建议】
- 整体色调：优雅、高级、纯净
- 配乐：轻奢风格轻音乐
- 节奏：舒缓、高级感`,
      type: 'text'
    },
    tips: [
      '产品视频要突出"质感"关键词',
      '360度旋转是最经典的产品展示方式',
      '玻璃/金属材质要描述反光效果',
      '使用场景展示能增加代入感'
    ]
  },
  
  {
    id: 'video-026',
    title: '旅行风景视频提示词',
    description: '壮丽风景和旅行主题视频的提示词模板',
    category: '视频生成',
    tags: ['旅行', '风景', '航拍', '自然'],
    usage: 21230,
    rating: 4.8,
    content: `# 旅行风景视频提示词指南

## 【风景类型与关键词】

### 自然风光
- majestic mountains - 巍峨山脉
- pristine beach - 原始海滩
- lush forest - 茂密森林
- cascading waterfall - 飞流瀑布
- endless desert - 无垠沙漠

### 城市景观
- skyline at dusk - 黄昏天际线
- bustling streets - 繁忙街道
- historic architecture - 历史建筑
- neon nightscape - 霓虹夜景

### 特色场景
- golden hour sunset - 黄金时刻日落
- blue hour city - 蓝调时刻城市
- starry night sky - 星空夜景
- foggy morning - 雾气清晨

## 【航拍视角】

### 高空俯瞰
- aerial drone shot - 航拍镜头
- bird's eye view - 鸟瞰视角
- sweeping panorama - 全景扫视
- majestic reveal - 壮丽展现

### 低空掠过
- low altitude pass - 低空掠过
- following shot - 跟踪镜头
- reveal shot - 揭示镜头`,
    example: {
      input: '瑞士阿尔卑斯山脉日出',
      output: `【提示词】
"Breathtaking aerial drone shot of Swiss Alps at sunrise. Snow-capped mountain peaks stretching to infinity, bathed in warm golden and pink light of dawn. Layers of mountain ranges create dramatic depth, with morning mist filling the valleys between peaks. A few fluffy clouds catch the first rays of sunlight, glowing orange and gold. Camera slowly rises and pans across the majestic landscape, revealing more peaks emerging from the darkness. In the distance, a small alpine lake reflects the colorful sky. The scene conveys pure serenity and awe-inspiring natural beauty. Cinematic color grading, dramatic contrast, shot on RED camera, 8K resolution, anamorphic lens"

【镜头运动建议】
方式一：从低到高升起，揭示全景
方式二：横移扫视，展示山脉延绵
方式三：前进推进，穿越山峰

【时间点建议】
- 日出前10分钟：蓝紫色调
- 日出时刻：金色光芒
- 日出后10分钟：温暖橙光`,
      type: 'text'
    },
    tips: [
      '风景视频要有"reveal"揭示感',
      '描述光线和时间对风景至关重要',
      '添加海拔、距离等描述增加宏大感',
      '云雾能增加层次和神秘感'
    ]
  },
  
  {
    id: 'video-027',
    title: '宠物萌宠视频提示词',
    description: '可爱宠物和动物视频的提示词模板',
    category: '视频生成',
    tags: ['宠物', '萌宠', '动物', '可爱'],
    usage: 19870,
    rating: 4.9,
    content: `# 宠物萌宠视频提示词指南

## 【萌宠拍摄要点】

### 可爱元素
- fluffy fur - 毛茸茸
- big round eyes - 圆圆大眼
- tiny paws - 小爪子
- wagging tail - 摇尾巴
- perked ears - 竖起的耳朵

### 动作描述
- playfully jumping - 活泼跳跃
- curiously sniffing - 好奇嗅闻
- lazily stretching - 慵懒伸懒腰
- happily running - 开心奔跑
- sleeping peacefully - 安详睡觉

### 情感表达
- excited expression - 兴奋表情
- confused look - 困惑表情
- happy panting - 开心喘气
- loving gaze - 深情注视

## 【宠物类型关键词】

### 狗狗
- golden retriever - 金毛
- french bulldog - 法斗
- husky - 哈士奇
- corgi - 柯基

### 猫咪
- persian cat - 波斯猫
- british shorthair - 英短
- maine coon - 缅因猫
- tabby cat - 虎斑猫`,
    example: {
      input: '可爱柯基在草地上奔跑',
      output: `【提示词】
"An adorable corgi puppy running joyfully across a sunny meadow with colorful wildflowers. The corgi has fluffy orange and white fur, big bright eyes full of excitement, and its signature short legs moving rapidly. Its ears are perked up and tongue is happily hanging out as it runs towards the camera. The afternoon sunlight creates a warm golden glow, highlighting the fur texture. Butterflies flutter around as the corgi playfully chases them. Camera follows alongside in a tracking shot, keeping the puppy in focus while the beautiful meadow background blurs. Cheerful, heartwarming atmosphere. 4K, cinematic, shallow depth of field, slow motion moments"

【拍摄建议】
- 低角度拍摄（与宠物视线平行）
- 使用慢动作捕捉可爱瞬间
- 保持环境安全无危险物品
- 准备零食吸引注意力

【表情捕捉要点】
- 奔跑时的快乐表情
- 停下时的好奇眼神
- 发现镜头时的可爱歪头`,
      type: 'text'
    },
    tips: [
      '宠物视频要突出"adorable"、"cute"等词',
      '描述毛发质感增加真实感',
      '添加动态元素（追蝴蝶、玩球等）',
      '低角度拍摄让宠物更有亲和力'
    ]
  },
  
  {
    id: 'video-028',
    title: '运动健身视频提示词',
    description: '健身动作和运动场景视频的提示词模板',
    category: '视频生成',
    tags: ['健身', '运动', '锻炼', '健康'],
    usage: 15680,
    rating: 4.7,
    content: `# 运动健身视频提示词指南

## 【运动场景设置】

### 健身房
- modern gym - 现代健身房
- well-lit fitness center - 明亮健身中心
- professional equipment - 专业器材
- motivating atmosphere - 激励氛围

### 户外运动
- city park workout - 公园锻炼
- beach running - 沙滩跑步
- mountain hiking - 山地徒步
- urban street workout - 街头健身

### 专业场地
- basketball court - 篮球场
- tennis court - 网球场
- swimming pool - 游泳池
- yoga studio - 瑜伽室

## 【动作关键词】

### 力量训练
- lifting weights - 举重
- bench press - 卧推
- deadlift - 硬拉
- squats - 深蹲

### 有氧运动
- running - 跑步
- cycling - 骑行
- jumping rope - 跳绳
- swimming - 游泳

### 柔韧训练
- yoga pose - 瑜伽姿势
- stretching - 拉伸
- pilates - 普拉提`,
    example: {
      input: '专业健身教练示范深蹲动作',
      output: `【提示词】
"A fit athletic fitness trainer performing perfect squat form in a modern, well-lit gym. The trainer wears professional athletic wear, showing proper technique: feet shoulder-width apart, back straight, core engaged, descending until thighs are parallel to ground, then driving up through heels. Mirror in background shows form from multiple angles. The gym has sleek modern equipment, motivational posters on walls, and large windows letting in natural light. Camera captures from side angle to show proper form, then cuts to front view. Professional fitness video style, clean editing, clear demonstration. 4K, studio lighting, shallow depth of field"

【拍摄要点】
- 侧面角度展示动作轨迹
- 镜子增加多角度展示
- 光线要明亮但不刺眼
- 背景干净整洁

【动作分解】
1. 准备姿势：站直，核心收紧
2. 下蹲阶段：臀部后坐，膝盖对齐脚尖
3. 底部停留：大腿平行地面
4. 起身阶段：臀部发力站起`,
      type: 'text'
    },
    tips: [
      '健身视频要强调"proper form"正确姿势',
      '光线要充足展示肌肉线条',
      '镜面反射能增加专业感',
      '运动服要紧身展示身材'
    ]
  }
];

// 默认导出
export default prompts;
