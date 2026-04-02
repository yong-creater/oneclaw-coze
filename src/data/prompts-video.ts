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
- watercolor dream`,
    example: {
      input: '一个小女孩在魔法森林探险',
      output: `【提示词】
"A curious little girl with a red hood exploring an enchanted forest. The trees have glowing mushrooms and floating fireflies. She discovers a hidden door on an ancient oak tree. Studio Ghibli inspired animation style, soft watercolor textures, magical atmosphere, gentle camera movement following the girl. The scene transitions from daylight to bioluminescent evening as she goes deeper into the forest."

【风格建议】
- 2D动画风格更适合奇幻主题
- 添加"Studio Ghibli"获得治愈系画面
- 使用"watercolor texture"增加艺术感`,
      type: 'text'
    }
  },
  
  // ========== 可灵 AI (Kling) ==========
  {
    id: 'video-004',
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
\`\`\``,
    example: {
      input: '一个女孩在咖啡馆看书',
      output: `【精简版】
"A young woman sitting by the window in a cozy cafe, reading a book, soft afternoon sunlight streaming through, steam rising from coffee cup, cinematic lighting, shallow depth of field, warm tones, slow camera push in, 4K"

【详细版】
"A beautiful young Asian woman in her early 20s, wearing a cream-colored knit sweater, sitting alone at a wooden table by a large window in a charming vintage cafe. She is deeply engrossed in reading a hardcover book, her fingers gently tracing the pages. Soft golden afternoon sunlight streams through the window, creating warm highlights on her hair and casting gentle shadows. A cup of latte sits beside the book, with delicate steam rising. Cinematic color grading with warm orange and teal tones, film grain texture, 4K resolution"`,
      type: 'text'
    },
    tips: [
      '可灵AI对中文理解很好，可以中英文混用',
      '描述越具体，画面质感越好',
      '添加"cinematic"、"film grain"可显著提升电影感'
    ]
  },
  
  {
    id: 'video-005',
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

### 中等动作（适合半身）
- turning head to look
- raising hand to wave
- adjusting clothing
- taking a sip

### 大幅度动作（适合全身）
- walking towards camera
- running and jumping
- dancing gracefully
- spinning around`,
    example: {
      input: '商务人士在办公室自信地走向镜头',
      output: `【提示词】
"A professional Asian businessman in his 30s, wearing a well-fitted navy blue suit and tie, walking confidently towards the camera in a modern glass-walled office. His posture is upright and self-assured, slight smile on his face. Behind him, blurred colleagues working at desks, city skyline visible through floor-to-ceiling windows. Natural bright lighting from windows, professional corporate atmosphere. Camera tracks backwards as he walks forward, maintaining medium shot. 4K, professional color grading"`,
      type: 'text'
    }
  },
  
  // ========== 即梦 AI ==========
  {
    id: 'video-006',
    title: '即梦AI 短视频创作提示词',
    description: '专为即梦AI优化的短视频创作提示词模板',
    category: '视频生成',
    tags: ['即梦', 'Jimeng', '短视频', '抖音风格'],
    featured: true,
    usage: 35680,
    rating: 4.9,
    content: `# 即梦AI 短视频创作提示词指南

## 【短视频黄金法则】
1. 前3秒必须抓住眼球
2. 画面要有变化和节奏感
3. 色彩要鲜艳吸睛
4. 结尾要有悬念或惊喜

## 【热门风格模板】

### 变装风格
- transformation from [A] to [B]
- glow up transition
- before and after reveal

### 情感风格
- nostalgic memories
- heartwarming moment
- emotional reunion

### 创意风格
- satisfying visual effect
- oddly satisfying
- ASMR aesthetic`,
    example: {
      input: '写一个15秒的抖音短视频脚本，主题是咖啡店推荐',
      output: `### 15秒抖音咖啡店推荐脚本

|镜号|时长|景别|画面内容|台词|音效|拍摄地点|
|----|----|----|--------|----|----|--------|
|1|0-3s|特写|手快速撕开奶泡拉花针的包装，针尖轻触奶泡，瞬间拉出完美爱心|（惊讶语气）"天呐！这家店的拉花居然……"|撕包装的脆响、轻敲奶泡的闷响|咖啡吧台内|
|2|3-8s|中景|镜头拉远，露出咖啡师微笑递出咖啡的手，背景是暖黄色的复古吊灯和满墙的咖啡豆罐|"……能把爱心拉到我心坎里！"|轻柔的钢琴BGM起|咖啡店前厅|
|3|8-12s|近景|博主捧起咖啡杯，喝一大口后眯眼满足点头，杯身上印着咖啡店的LOGO|"焦糖拿铁甜而不腻，绝了！"|吸溜咖啡的声音|博主座位区|
|4|12-15s|全景|博主举着咖啡指向镜头，画面左下角弹出门店定位+"今日买一送一"字样|"地址放左下角，快冲！"|BGM突然鼓点加重|咖啡店门口|`,
      type: 'text'
    }
  },
  
  {
    id: 'video-007',
    title: '即梦AI 美食视频提示词',
    description: '让人垂涎欲滴的美食视频生成提示词',
    category: '视频生成',
    tags: ['即梦', 'Jimeng', '美食', '食物拍摄'],
    usage: 18920,
    rating: 4.8,
    content: `# 即梦AI 美食视频提示词指南

## 【美食拍摄要点】

### 光线控制
- warm natural lighting
- soft window light
- backlit glow
- overhead lighting

### 质感增强
- glistening surface
- steam rising
- oil glistening
- fresh droplets

### 动态元素
- steam billowing
- sauce drizzling
- cheese stretching
- bubbles popping`,
    example: {
      input: '一碗热气腾腾的日式拉面',
      output: `【提示词】
"A steaming bowl of authentic Japanese ramen in a ceramic bowl. Rich golden pork bone broth, perfectly cooked noodles visible. Toppings include sliced chashu pork, soft-boiled marinated egg with runny yolk, green onions, nori seaweed. Steam rises gracefully from the hot broth. Soft natural lighting from a nearby window. Chopsticks gently lift some noodles. Cinematic food photography style, shallow depth of field, warm color grading, 4K"`,
      type: 'text'
    }
  },
  
  // ========== 通用视频类型 ==========
  {
    id: 'video-008',
    title: '产品展示视频提示词',
    description: '专业产品展示视频的提示词模板',
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

## 【产品拍摄技巧】

### 光线
- studio lighting
- soft diffused light
- rim lighting
- gradient lighting

### 动态
- 360 degree rotation
- slow motion reveal
- detail zoom in
- product in use`,
    example: {
      input: '高端护肤品产品视频',
      output: `【提示词】
"A luxurious skincare serum bottle on a clean white marble surface. The bottle is made of frosted glass with rose gold accents. Soft diffused studio lighting creates gentle highlights. The bottle slowly rotates 360 degrees, showing the premium packaging. Golden liquid inside catches the light beautifully. A single drop of serum falls in slow motion onto a petal of rose. Background is soft gradient from white to pale pink. Elegant, sophisticated, premium beauty aesthetic. 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-009',
    title: '旅行风景视频提示词',
    description: '壮丽风景和旅行主题视频的提示词模板',
    category: '视频生成',
    tags: ['旅行', '风景', '航拍', '自然'],
    usage: 21230,
    rating: 4.8,
    content: `# 旅行风景视频提示词指南

## 【风景类型与关键词】

### 自然风光
- majestic mountains
- pristine beach
- lush forest
- cascading waterfall
- endless desert

### 城市景观
- skyline at dusk
- bustling streets
- historic architecture
- neon nightscape

### 航拍视角
- aerial drone shot
- bird's eye view
- sweeping panorama
- majestic reveal`,
    example: {
      input: '瑞士阿尔卑斯山脉日出',
      output: `【提示词】
"Breathtaking aerial drone shot of Swiss Alps at sunrise. Snow-capped mountain peaks stretching to infinity, bathed in warm golden and pink light of dawn. Layers of mountain ranges create dramatic depth, with morning mist filling the valleys. A few fluffy clouds catch the first rays of sunlight, glowing orange and gold. Camera slowly rises and pans across the majestic landscape. Cinematic color grading, dramatic contrast, 8K resolution"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-010',
    title: '宠物萌宠视频提示词',
    description: '可爱宠物和动物视频的提示词模板',
    category: '视频生成',
    tags: ['宠物', '萌宠', '动物', '可爱'],
    usage: 19870,
    rating: 4.9,
    content: `# 宠物萌宠视频提示词指南

## 【萌宠拍摄要点】

### 可爱元素
- fluffy fur
- big round eyes
- tiny paws
- wagging tail

### 动作描述
- playfully jumping
- curiously sniffing
- lazily stretching
- happily running

### 宠物类型
- golden retriever
- french bulldog
- persian cat
- british shorthair`,
    example: {
      input: '可爱柯基在草地上奔跑',
      output: `【提示词】
"An adorable corgi puppy running joyfully across a sunny meadow with colorful wildflowers. The corgi has fluffy orange and white fur, big bright eyes full of excitement, and its signature short legs moving rapidly. Its ears are perked up and tongue is happily hanging out. Butterflies flutter around as the corgi playfully chases them. Camera follows alongside in a tracking shot. Cheerful, heartwarming atmosphere. 4K, slow motion"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-011',
    title: '运动健身视频提示词',
    description: '健身动作和运动场景视频的提示词模板',
    category: '视频生成',
    tags: ['健身', '运动', '锻炼', '健康'],
    usage: 15680,
    rating: 4.7,
    content: `# 运动健身视频提示词指南

## 【运动场景设置】

### 健身房
- modern gym
- well-lit fitness center
- professional equipment
- motivating atmosphere

### 户外运动
- city park workout
- beach running
- mountain hiking
- urban street workout

## 【动作关键词】

### 力量训练
- lifting weights
- bench press
- deadlift
- squats

### 有氧运动
- running
- cycling
- jumping rope
- swimming`,
    example: {
      input: '专业健身教练示范深蹲动作',
      output: `【提示词】
"A fit athletic fitness trainer performing perfect squat form in a modern, well-lit gym. The trainer wears professional athletic wear, showing proper technique: feet shoulder-width apart, back straight, core engaged, descending until thighs are parallel to ground. Mirror in background shows form from multiple angles. The gym has sleek modern equipment and large windows letting in natural light. Camera captures from side angle to show proper form. Professional fitness video style, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-012',
    title: '婚礼浪漫视频提示词',
    description: '婚礼现场和浪漫主题视频的提示词模板',
    category: '视频生成',
    tags: ['婚礼', '浪漫', '爱情', '仪式'],
    usage: 14560,
    rating: 4.8,
    content: `# 婚礼浪漫视频提示词指南

## 【婚礼场景】

### 仪式现场
- wedding ceremony
- exchanging vows
- walking down aisle
- first kiss as couple

### 婚宴场景
- romantic reception
- first dance
- cake cutting
- bouquet toss

## 【浪漫元素】
- soft candlelight
- flower petals falling
- golden hour portraits
- slow motion moments`,
    example: {
      input: '新娘走向新郎的婚礼仪式',
      output: `【提示词】
"A beautiful bride in an elegant white lace wedding gown walking down a flower-lined aisle towards her waiting groom. Soft natural light streams through the church windows, creating a heavenly glow. The bride holds a bouquet of white roses, her veil trailing behind her. Guests turn to watch with smiles. The groom stands at the altar in a classic black tuxedo, emotional expression on his face. Slow motion capture, romantic atmosphere, cinematic color grading with warm tones, 4K quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-013',
    title: '教育培训视频提示词',
    description: '在线教育和知识科普视频的提示词模板',
    category: '视频生成',
    tags: ['教育', '培训', '课程', '科普'],
    usage: 13240,
    rating: 4.6,
    content: `# 教育培训视频提示词指南

## 【教育场景】

### 课堂教学
- classroom setting
- teacher explaining
- students listening
- interactive discussion

### 在线教育
- online tutorial
- screen recording
- animated explanation
- virtual classroom

## 【科普视频】
- scientific visualization
- animated diagrams
- step-by-step tutorial
- hands-on demonstration`,
    example: {
      input: '数学老师在黑板前讲解公式',
      output: `【提示词】
"A professional mathematics teacher in a modern classroom, writing equations on a clean whiteboard while explaining concepts. The teacher wears smart casual attire, engaging expression, occasional hand gestures to emphasize points. Classroom has bright natural lighting, educational posters on walls, desks visible in foreground. Camera angle shows both the teacher and the whiteboard clearly. Professional educational video style, clean and bright, 4K quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-014',
    title: '城市夜景视频提示词',
    description: '城市夜景和都市生活视频的提示词模板',
    category: '视频生成',
    tags: ['城市', '夜景', '都市', '霓虹'],
    usage: 16780,
    rating: 4.8,
    content: `# 城市夜景视频提示词指南

## 【夜景类型】

### 城市天际线
- city skyline at night
- twinkling lights
- iconic landmarks
- panoramic views

### 街头夜景
- neon signs
- busy intersections
- street food vendors
- night markets

### 特殊场景
- Times Square style
- Tokyo Shibuya crossing
- Hong Kong skyline
- Dubai night architecture`,
    example: {
      input: '东京涩谷十字路口夜景',
      output: `【提示词】
"Bustling Shibuya Crossing in Tokyo at night, the world's busiest pedestrian intersection. Hundreds of people crossing simultaneously from all directions when the light turns green. Towering buildings covered in massive LED screens and neon advertisements create a kaleidoscope of colors. Rain-slicked streets reflect the vibrant lights. Camera angle from above showing the organized chaos. Cyberpunk aesthetic, dynamic energy, Tokyo nightlife atmosphere, cinematic color grading, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-015',
    title: '音乐演出视频提示词',
    description: '演唱会和音乐表演视频的提示词模板',
    category: '视频生成',
    tags: ['音乐', '演唱会', '演出', '舞台'],
    usage: 15340,
    rating: 4.7,
    content: `# 音乐演出视频提示词指南

## 【演出类型】

### 演唱会
- stadium concert
- music festival
- intimate venue show
- acoustic performance

### 舞台元素
- dramatic lighting
- fog machine effects
- pyrotechnics
- LED screens

## 【氛围营造】
- crowd energy
- performer charisma
- dramatic close-ups
- wide establishing shots`,
    example: {
      input: '摇滚乐队现场演出',
      output: `【提示词】
"Electrifying rock band performance on a large festival stage at night. The lead singer with a guitar moves energetically across the stage, singing passionately into a microphone. Dramatic lighting with beams of colorful lights cutting through theatrical fog. The drummer and other band members visible in background. Large LED screens display dynamic visuals. The crowd in front is a sea of raised hands and phone lights. High energy atmosphere, professional concert footage style, dynamic camera movement, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-016',
    title: '节日庆典视频提示词',
    description: '各种节日庆典活动的视频提示词模板',
    category: '视频生成',
    tags: ['节日', '庆典', '烟花', '活动'],
    usage: 12890,
    rating: 4.7,
    content: `# 节日庆典视频提示词指南

## 【节日类型】

### 传统节日
- Chinese New Year
- Christmas celebration
- Diwali festival
- Thanksgiving gathering

### 现代节日
- New Year's Eve
- Valentine's Day
- Halloween party
- Independence Day

## 【庆典元素】
- fireworks display
- parade floats
- traditional costumes
- festive decorations`,
    example: {
      input: '中国新年烟花庆典',
      output: `【提示词】
"Spectacular Chinese New Year fireworks display over a historic Chinese city skyline at night. Brilliant explosions of red, gold, and purple fireworks light up the sky above traditional pagodas and modern skyscrapers. Reflections shimmer on a river below. Crowds of people in winter clothes watch in awe, some holding red lanterns. Traditional Chinese architecture in foreground. Festive atmosphere, celebration mood, cinematic wide shot, slow motion fireworks, 4K quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-017',
    title: '科技演示视频提示词',
    description: '科技产品和未来科技概念视频提示词模板',
    category: '视频生成',
    tags: ['科技', '未来', '产品发布', '概念'],
    usage: 14560,
    rating: 4.6,
    content: `# 科技演示视频提示词指南

## 【科技场景】

### 产品发布
- product launch event
- keynote presentation
- tech reveal
- feature showcase

### 未来概念
- futuristic city
- AI technology
- autonomous vehicles
- smart home

## 【科技美学】
- sleek minimal design
- holographic displays
- clean white aesthetic
- blue accent lighting`,
    example: {
      input: '未来智能家居概念视频',
      output: `【提示词】
"Futuristic smart home concept video. A modern minimalist living room with floor-to-ceiling windows overlooking a city skyline. Smart home features activate seamlessly: lights adjust automatically, blinds open, temperature controls appear as floating holographic interfaces. A family interacts with voice-activated devices. Clean white and wood interior with subtle blue accent lighting. Apple-style presentation aesthetic, premium feel, smooth transitions, 4K quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-018',
    title: '自然纪录片视频提示词',
    description: '自然纪录片风格视频的提示词模板',
    category: '视频生成',
    tags: ['自然', '纪录片', '野生动物', '生态'],
    usage: 18920,
    rating: 4.9,
    content: `# 自然纪录片视频提示词指南

## 【纪录片风格】

### 动物世界
- wildlife in natural habitat
- predator hunting
- animal migration
- mating rituals

### 自然奇观
- volcanic eruption
- aurora borealis
- extreme weather
- seasonal changes

## 【拍摄技法】
- slow motion capture
- time-lapse sequences
- drone aerial shots
- macro close-ups`,
    example: {
      input: '非洲草原狮子狩猎场景',
      output: `【提示词】
"Dramatic wildlife documentary footage of a lioness hunting on the African savanna at golden hour. The lioness moves silently through tall golden grass, muscles rippling beneath her tawny coat. Her eyes locked on a herd of wildebeest in the distance. Dust particles float in the warm light. Camera follows her in slow motion, capturing the tension and power of the moment. National Geographic documentary style, natural history cinematography, 4K, shallow depth of field"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-019',
    title: '时尚穿搭视频提示词',
    description: '时尚穿搭和服装展示视频的提示词模板',
    category: '视频生成',
    tags: ['时尚', '穿搭', '服装', '模特'],
    usage: 21340,
    rating: 4.8,
    content: `# 时尚穿搭视频提示词指南

## 【时尚场景】

### T台走秀
- runway fashion show
- model walking
- designer collection
- fashion week

### 穿搭展示
- outfit of the day
- seasonal lookbook
- street style
- fashion haul

## 【视觉风格】
- editorial lighting
- dynamic poses
- textile details
- color coordination`,
    example: {
      input: '春季穿搭展示视频',
      output: `【提示词】
"Stylish spring fashion video featuring a young woman in a trendy outfit. She wears a light beige trench coat over a cream sweater, high-waisted blue jeans, and white sneakers. Walking through a blooming cherry blossom park, petals falling gently around her. Soft morning sunlight creates a dreamy atmosphere. Multiple outfit shots showing front, side, and detail views. Lifestyle fashion content style, Instagram aesthetic, light and airy color grading, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-020',
    title: '儿童亲子视频提示词',
    description: '亲子互动和儿童成长视频的提示词模板',
    category: '视频生成',
    tags: ['儿童', '亲子', '家庭', '成长'],
    usage: 16780,
    rating: 4.8,
    content: `# 儿童亲子视频提示词指南

## 【亲子场景】

### 日常互动
- parent and child playing
- reading together
- outdoor activities
- mealtime moments

### 成长记录
- first steps
- birthday celebration
- school activities
- holiday memories

## 【拍摄要点】
- eye-level perspective
- natural expressions
- soft lighting
- warm color palette`,
    example: {
      input: '父母和孩子在公园玩耍',
      output: `【提示词】
"Heartwarming scene of young parents playing with their toddler in a sunny park on a weekend afternoon. The father lifts the child high in the air, both laughing with pure joy. The mother watches nearby with a warm smile, ready to catch the child. Green grass, tall trees, and blue sky in background. Golden hour lighting creates a magical atmosphere. Slow motion capture to emphasize the emotional moment. Family lifestyle video style, warm and loving mood, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-021',
    title: '汽车驾驶视频提示词',
    description: '汽车广告和驾驶体验视频的提示词模板',
    category: '视频生成',
    tags: ['汽车', '驾驶', '广告', '交通工具'],
    usage: 13450,
    rating: 4.7,
    content: `# 汽车驾驶视频提示词指南

## 【汽车场景】

### 城市驾驶
- urban driving
- city streets
- night cruise
- traffic flow

### 公路旅行
- highway driving
- scenic route
- cross-country
- coastal road

## 【拍摄角度】
- dashboard view
- aerial following
- interior detail
- exterior showcase`,
    example: {
      input: '豪华跑车沿海公路驾驶',
      output: `【提示词】
"Luxury sports car driving along a scenic coastal highway at sunset. The sleek vehicle hugs the curves of the winding road, ocean waves crashing against cliffs below. Camera follows from multiple angles: low side profile, aerial drone shot, and interior driver view. The car's glossy finish reflects the golden sunset. Windows down, wind in hair, sense of freedom and adventure. Premium automotive commercial style, cinematic color grading, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-022',
    title: '手工制作视频提示词',
    description: 'DIY手工和创意制作视频的提示词模板',
    category: '视频生成',
    tags: ['手工', 'DIY', '制作', '创意'],
    usage: 11230,
    rating: 4.6,
    content: `# 手工制作视频提示词指南

## 【手工类型】

### 美术创作
- painting process
- drawing tutorial
- pottery making
- sculpting

### DIY项目
- home crafts
- upcycling
- jewelry making
- candle making

## 【拍摄技巧】
- close-up detail shots
- step-by-step process
- satisfying moments
- before and after`,
    example: {
      input: '陶艺制作过程视频',
      output: `【提示词】
"Peaceful pottery making video in a sunlit studio. Close-up of skilled hands shaping wet clay on a spinning wheel. Clay rises and forms into a beautiful ceramic bowl. Water drips create smooth surfaces. The potter's fingers leave artistic indentations. Natural light from studio windows, plants and pottery tools in background. ASMR-style satisfying content, calming atmosphere, soft natural colors, 4K macro shots"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-023',
    title: 'ASMR放松视频提示词',
    description: 'ASMR和放松解压视频的提示词模板',
    category: '视频生成',
    tags: ['ASMR', '放松', '解压', '治愈'],
    usage: 19870,
    rating: 4.8,
    content: `# ASMR放松视频提示词指南

## 【ASMR类型】

### 触觉类
- tapping sounds
- scratching surfaces
- fabric sounds
- kinetic sand

### 视觉类
- satisfying visuals
- slow movements
- color mixing
- slime videos

## 【氛围营造】
- soft lighting
- minimal background
- slow motion
- close-up focus`,
    example: {
      input: '咖啡制作ASMR视频',
      output: `【提示词】
"Satisfying coffee making ASMR video. Close-up shots of each step: coffee beans being slowly ground, steam rising from hot water, milk being frothed with creamy swirls, and finally pouring latte art. Soft natural lighting, minimal clean background. Every movement is slow and deliberate. Focus on textures and sounds - grinding, pouring, steaming. Calming and therapeutic atmosphere, cozy morning aesthetic, 4K macro quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-024',
    title: '舞蹈表演视频提示词',
    description: '舞蹈表演和编舞视频的提示词模板',
    category: '视频生成',
    tags: ['舞蹈', '表演', '编舞', '艺术'],
    usage: 17650,
    rating: 4.8,
    content: `# 舞蹈表演视频提示词指南

## 【舞蹈类型】

### 现代舞
- contemporary dance
- hip-hop routine
- jazz choreography
- ballet performance

### 传统舞蹈
- cultural dance
- folk dance
- classical dance
- ritual dance

## 【拍摄技巧】
- wide stage shots
- close-up expressions
- slow motion highlights
- multiple angles`,
    example: {
      input: '现代舞表演视频',
      output: `【提示词】
"Powerful contemporary dance performance in a minimalist studio space. A skilled dancer moves with fluid grace and explosive energy, transitioning between slow, controlled movements and dynamic leaps. Natural light streams through large windows, casting dramatic shadows. The dancer's silhouette creates beautiful shapes against the light. Floor-to-ceiling mirrors reflect different angles. Artistic and emotional choreography, professional dance video style, cinematic color grading, 4K slow motion"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-025',
    title: '体育赛事视频提示词',
    description: '体育比赛和运动赛事视频的提示词模板',
    category: '视频生成',
    tags: ['体育', '比赛', '运动', '竞技'],
    usage: 15430,
    rating: 4.7,
    content: `# 体育赛事视频提示词指南

## 【体育类型】

### 球类运动
- basketball game
- soccer match
- tennis championship
- golf tournament

### 竞技运动
- track and field
- swimming competition
- gymnastics
- martial arts

## 【拍摄要点】
- action close-ups
- crowd reactions
- slow motion replays
- emotional moments`,
    example: {
      input: '篮球比赛关键时刻',
      output: `【提示词】
"Intense basketball game moment during the final seconds of a championship match. A player dribbles down the court, defenders closing in, crowd on their feet. He leaps for a slam dunk, ball in hand, muscles tense, sweat visible. Time seems to slow as the ball approaches the hoop. Stadium lights create dramatic highlights. Crowds cheer in background, some capturing on phones. Sports broadcast style, slow motion highlight, professional sports videography, 4K"`,
      type: 'text'
    }
  },
  
  // ========== 更多视频类型 ==========
  {
    id: 'video-026',
    title: '企业宣传片提示词',
    description: '企业品牌宣传片和形象展示视频的提示词模板',
    category: '视频生成',
    tags: ['企业', '宣传片', '品牌', '形象'],
    usage: 18920,
    rating: 4.7,
    content: `# 企业宣传片提示词指南

## 【企业场景】

### 办公环境
- modern office space
- collaborative workspace
- professional team meeting
- executive boardroom

### 生产场景
- manufacturing facility
- quality control process
- research laboratory
- product assembly line

## 【风格类型】
- corporate professional
- innovative dynamic
- trustworthy established
- forward-thinking modern`,
    example: {
      input: '科技公司企业形象宣传片',
      output: `【提示词】
"Professional corporate promotional video for a technology company. Wide shot of modern glass office building exterior, cut to interior shots of diverse teams collaborating in open workspace, engineers working on innovative projects, executive giving presentation, happy employees in break area. Clean, bright lighting throughout. Smooth transitions between scenes. Inspirational background music implied. Corporate professional style, 4K quality, brand storytelling approach"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-027',
    title: '美食制作过程视频提示词',
    description: '详细展示烹饪步骤和技巧的美食视频提示词',
    category: '视频生成',
    tags: ['美食', '烹饪', '教程', '料理'],
    usage: 23450,
    rating: 4.8,
    content: `# 美食制作过程视频提示词指南

## 【烹饪类型】

### 中式烹饪
- Chinese stir-fry
- dim sum making
- noodle pulling
- dumpling wrapping

### 西式料理
- Italian pasta making
- French sauce technique
- baking pastry
- grilling steak

### 甜点制作
- cake decorating
- chocolate tempering
- ice cream making
- dessert plating`,
    example: {
      input: '手工拉面制作过程',
      output: `【提示词】
"Traditional Chinese hand-pulled noodle making process. Close-up shots of skilled chef's hands stretching and folding dough, rhythmic motions creating perfect noodles. Flour dust in the air, sunlight streaming through kitchen window. Cut to boiling water, noodles being added, steam rising. Final shot of beautiful bowl of noodles being garnished. Cooking tutorial style, step-by-step visual storytelling, 4K macro shots"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-028',
    title: '酒店民宿展示视频提示词',
    description: '酒店、民宿、度假村环境展示视频提示词',
    category: '视频生成',
    tags: ['酒店', '民宿', '旅游', '住宿'],
    usage: 15680,
    rating: 4.7,
    content: `# 酒店民宿展示视频提示词指南

## 【展示重点】

### 客房展示
- luxury suite tour
- bedroom walkthrough
- bathroom spa facilities
- room amenities showcase

### 公共区域
- lobby and reception
- swimming pool
- restaurant and bar
- garden and outdoor space

## 【氛围营造】
- relaxing and serene
- luxurious and elegant
- cozy and welcoming
- tropical paradise`,
    example: {
      input: '海岛度假酒店环境展示',
      output: `【提示词】
"Luxury beachfront resort hotel promotional video. Aerial drone shot approaching beautiful overwater bungalows on crystal clear turquoise lagoon. Interior tour of premium villa with floor-to-ceiling ocean views, private infinity pool, outdoor shower. Shots of infinity pool blending with horizon, beachside restaurant with sunset views, spa treatment room. Paradise atmosphere, relaxing and exclusive, hospitality marketing style, 4K cinematic"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-029',
    title: '房地产样板房视频提示词',
    description: '房地产楼盘和样板房展示视频提示词',
    category: '视频生成',
    tags: ['房地产', '样板房', '楼盘', '购房'],
    usage: 17890,
    rating: 4.7,
    content: `# 房地产样板房视频提示词指南

## 【展示类型】

### 室内空间
- living room walkthrough
- kitchen showcase
- master bedroom tour
- bathroom features

### 建筑外观
- building exterior facade
- community amenities
- landscaping and gardens
- parking and accessibility

## 【目标客户】
- first-time homebuyers
- luxury property buyers
- family-oriented buyers
- investment buyers`,
    example: {
      input: '现代简约风格样板房展示',
      output: `【提示词】
"Modern minimalist show apartment virtual tour. Smooth camera glide through entryway into open-concept living room with clean lines and neutral color palette. Pan across contemporary kitchen with premium appliances and marble countertops. Tour master bedroom with walk-in closet, ensuite bathroom with dual vanity. Highlight smart home features, natural lighting from large windows. Real estate marketing video style, aspirational lifestyle appeal, 4K quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-030',
    title: '纪录片风格视频提示词',
    description: '纪录片、人物专访、纪实风格视频提示词',
    category: '视频生成',
    tags: ['纪录片', '专访', '纪实', '人物'],
    usage: 14560,
    rating: 4.8,
    content: `# 纪录片风格视频提示词指南

## 【纪录片类型】

### 人物传记
- life story documentary
- artist profile
- entrepreneur journey
- community leader

### 社会话题
- environmental issue
- cultural exploration
- historical event
- scientific discovery

## 【拍摄风格】
- observational documentary
- interview-based
- cinema verite
- archival footage integration`,
    example: {
      input: '手工艺人纪录片片段',
      output: `【提示词】
"Intimate documentary portrait of a traditional craftsman in his workshop. Natural lighting filtering through dusty windows, close-ups of weathered hands carefully working on intricate details. Interview segments interspersed with B-roll of tools, materials, work-in-progress. Contemplative atmosphere, authentic and respectful tone. Cinema verite style, handheld camera movements, observational documentary aesthetic. Voice-over narration implied, emotional storytelling approach"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-031',
    title: '科技评测开箱视频提示词',
    description: '数码产品开箱和科技评测类视频提示词',
    category: '视频生成',
    tags: ['开箱', '评测', '科技', '数码'],
    usage: 21230,
    rating: 4.8,
    content: `# 科技评测开箱视频提示词指南

## 【视频类型】

### 开箱体验
- unboxing first look
- package reveal
- accessories overview
- initial impressions

### 深度评测
- hands-on review
- feature demonstration
- comparison with competitors
- real-world testing

## 【拍摄风格】
- clean white studio setup
- multiple camera angles
- macro detail shots
- lifestyle integration shots`,
    example: {
      input: '新款智能手机开箱评测',
      output: `【提示词】
"Professional tech unboxing video for latest flagship smartphone. Clean white studio background, overhead shot of sealed box. Hands carefully open packaging, reveal device wrapped in protective film. Close-up shots of phone from multiple angles, highlighting design details. Cut to accessories unboxing, then first power-on moment. Tech YouTuber style, clean and informative, multiple camera angles with smooth transitions, 4K macro shots of details"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-032',
    title: '瑜伽健身课程视频提示词',
    description: '瑜伽、普拉提、健身课程教学视频提示词',
    category: '视频生成',
    tags: ['瑜伽', '健身', '课程', '教学'],
    usage: 16780,
    rating: 4.8,
    content: `# 瑜伽健身课程视频提示词指南

## 【课程类型】

### 瑜伽
- vinyasa flow
- yin yoga
- power yoga
- meditation yoga

### 普拉提
- mat pilates
- reformer workout
- barre pilates
- stretching routine

## 【场景设置】
- serene studio with natural light
- outdoor beach or park setting
- minimalist home workout space
- gym group class`,
    example: {
      input: '晨间瑜伽课程视频',
      output: `【提示词】
"Peaceful morning yoga flow class video. Instructor demonstrating sun salutation sequence in sunlit studio with wooden floors and plants. Calm and centered energy, soft natural lighting. Multiple camera angles: wide shot showing full pose, close-up of proper alignment. Slow, deliberate movements with breathing cues. Wellness and mindfulness aesthetic, instructional yet calming, 4K quality with soft focus background"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-033',
    title: '游戏实况解说视频提示词',
    description: '游戏直播、实况解说、游戏攻略视频提示词',
    category: '视频生成',
    tags: ['游戏', '实况', '直播', '解说'],
    usage: 23450,
    rating: 4.7,
    content: `# 游戏实况解说视频提示词指南

## 【游戏类型】

### 动作游戏
- battle royale gameplay
- FPS shooter highlights
- action adventure walkthrough
- boss fight compilation

### 策略游戏
- strategy game tutorial
- city building timelapse
- civilization gameplay
- competitive match analysis

## 【视频元素】
- face cam reaction
- on-screen annotations
- highlight moments
- commentary style`,
    example: {
      input: '精彩游戏操作集锦',
      output: `【提示词】
"Exciting gaming highlights compilation video. Fast-paced cuts between impressive gameplay moments, clutch plays, and epic wins. Face cam in corner showing streamer's enthusiastic reactions. On-screen graphics for key moments, subscriber notifications popping up. Dynamic editing with music sync, slow-motion for epic kills. Gaming content creator style, high energy, engagement-focused, suitable for YouTube/TikTok"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-034',
    title: '母婴育儿视频提示词',
    description: '育儿知识、母婴护理、亲子互动视频提示词',
    category: '视频生成',
    tags: ['母婴', '育儿', '宝宝', '亲子'],
    usage: 18920,
    rating: 4.8,
    content: `# 母婴育儿视频提示词指南

## 【内容类型】

### 育儿知识
- baby care tips
- developmental milestones
- feeding guidance
- sleep training advice

### 亲子互动
- baby massage tutorial
- play activities
- reading time
- sensory play ideas

## 【拍摄风格】
- warm and nurturing atmosphere
- soft natural lighting
- close-up demonstrations
- parent-child interaction focus`,
    example: {
      input: '新生儿护理教程视频',
      output: `【提示词】
"Gentle baby care tutorial video for new parents. Soft lighting in nursery setting, calm and reassuring tone. Close-up demonstration of swaddling technique with baby doll or real infant. Step-by-step visual guide with clear voice-over instructions. Warm, supportive atmosphere, helpful and informative. Parenting content style, accessible and encouraging, soft color palette, 4K quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-035',
    title: '音乐MV创意视频提示词',
    description: '音乐MV、创意短片、艺术视频提示词',
    category: '视频生成',
    tags: ['MV', '音乐', '创意', '艺术'],
    usage: 19870,
    rating: 4.9,
    content: `# 音乐MV创意视频提示词指南

## 【MV风格】

### 叙事类
- story-driven music video
- emotional narrative
- relationship story
- coming-of-age theme

### 视觉类
- visual art piece
- dance performance video
- abstract visual effects
- aesthetic mood piece

## 【创意元素】
- symbolic imagery
- color grading themes
- visual metaphors
- artistic transitions`,
    example: {
      input: '梦幻风格音乐MV',
      output: `【提示词】
"Dreamy indie music video aesthetic. Young woman wandering through surreal landscape of floating islands and giant flowers, soft pastel colors, whimsical atmosphere. Visual storytelling through metaphorical imagery, slow-motion shots, ethereal lighting with lens flares. Artistic transitions between reality and dream world. Intimate performance shots interspersed with narrative scenes. Indie film aesthetic, emotional and poetic, 4K cinematic"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-036',
    title: '新闻报道视频提示词',
    description: '新闻报道、采访、现场报道视频提示词',
    category: '视频生成',
    tags: ['新闻', '报道', '采访', '媒体'],
    usage: 14560,
    rating: 4.6,
    content: `# 新闻报道视频提示词指南

## 【报道类型】

### 现场报道
- on-location news report
- breaking news coverage
- event reporting
- field correspondent

### 采访报道
- one-on-one interview
- panel discussion
- press conference
- street interview

## 【拍摄要素】
- professional news set
- on-location backdrop
- lower third graphics
- multiple camera setup`,
    example: {
      input: '现场新闻报道片段',
      output: `【提示词】
"Professional news broadcast segment. Field reporter standing in front of significant location, microphone in hand, speaking to camera with confidence. Breaking news style with urgency in tone. Camera captures both reporter and contextual background. Cut to B-roll footage relevant to story. Professional news production style, clear audio, stable camera work. Broadcast journalism aesthetic, authoritative yet approachable"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-037',
    title: '时尚走秀视频提示词',
    description: '时装周、T台走秀、时尚秀场视频提示词',
    category: '视频生成',
    tags: ['时尚', '走秀', '时装周', 'T台'],
    usage: 16780,
    rating: 4.8,
    content: `# 时尚走秀视频提示词指南

## 【秀场类型】

### 时装周
- runway fashion show
- designer collection reveal
- haute couture presentation
- ready-to-wear show

### 品牌发布
- brand fashion film
- collection campaign
- seasonal launch
- exclusive preview

## 【拍摄角度】
- front row center view
- side angle tracking shot
- overhead drone perspective
- backstage behind scenes`,
    example: {
      input: '高级时装走秀现场',
      output: `【提示词】
"High fashion runway show at prestigious fashion week. Models walking with confident stride on illuminated catwalk, designer couture garments flowing with movement. Front row audience of fashion editors and celebrities watching attentively. Dramatic lighting, pulsing music, atmosphere of exclusivity and glamour. Multiple camera angles: wide establishing shot, close-up on garment details, model's determined expression. Fashion event coverage style, 4K broadcast quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-038',
    title: '纪录片航拍视频提示词',
    description: '航拍、无人机拍摄、空中视角视频提示词',
    category: '视频生成',
    tags: ['航拍', '无人机', '空中', '俯瞰'],
    usage: 18920,
    rating: 4.9,
    content: `# 纪录片航拍视频提示词指南

## 【航拍类型】

### 自然景观
- mountain range aerial
- coastline drone shot
- forest canopy view
- waterfall from above

### 城市景观
- city skyline aerial
- urban sprawl overview
- architectural landmark
- traffic flow pattern

## 【航拍技巧】
- slow reveal approach
- orbiting shot
- rising vertical shot
- tracking follow shot`,
    example: {
      input: '挪威峡湾航拍镜头',
      output: `【提示词】
"Breathtaking aerial drone footage of Norwegian fjords. Camera approaches dramatic cliff faces from over the water, revealing massive scale of the landscape. Slowly rising above mountain peaks, showing endless layers of fjords stretching to horizon. Water below perfectly reflects the sky. Cinematic documentary style, smooth drone movements, natural color grading. National Geographic quality, awe-inspiring and majestic, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-039',
    title: '烹饪比赛节目视频提示词',
    description: '美食竞技、烹饪比赛、厨艺挑战视频提示词',
    category: '视频生成',
    tags: ['烹饪', '比赛', '美食节目', '竞技'],
    usage: 15670,
    rating: 4.7,
    content: `# 烹饪比赛节目视频提示词指南

## 【节目元素】

### 比赛现场
- professional kitchen setup
- multiple contestant stations
- judge's tasting table
- countdown timer display

### 情感捕捉
- contestant concentration
- dramatic plating moments
- judge reactions
- winner announcement

## 【拍摄风格】
- multiple camera angles
- close-up cooking action
- time-lapse cooking
- reaction shots`,
    example: {
      input: '美食烹饪比赛现场',
      output: `【提示词】
"Intense cooking competition show scene. Professional kitchen arena with multiple contestant stations, chefs rushing to complete dishes before timer runs out. Close-ups of skilled knife work, sizzling pans, and artistic plating. Judges watching critically, tasting with discerning expressions. Dramatic lighting, countdown clock visible, background music building tension. Reality cooking show style, professional broadcast quality, multiple camera coverage"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-040',
    title: '科普教育动画视频提示词',
    description: '科学知识、教育动画、趣味科普视频提示词',
    category: '视频生成',
    tags: ['科普', '教育', '动画', '知识'],
    usage: 17890,
    rating: 4.8,
    content: `# 科普教育动画视频提示词指南

## 【科普类型】

### 自然科学
- biological process animation
- physical phenomenon
- chemical reaction visualization
- astronomical exploration

### 社会人文
- historical event reenactment
- cultural tradition explanation
- economic concept visualization
- psychological insight

## 【动画风格】
- 2D motion graphics
- 3D scientific visualization
- hand-drawn illustration style
- infographic animation`,
    example: {
      input: '太阳系行星科普动画',
      output: `【提示词】
"Educational animated video about the solar system. 3D visualization of planets orbiting the sun, with informative text overlays. Zoom in to each planet showing unique characteristics and facts. Smooth camera movements through space, beautiful rendering of cosmic scenes. Narrator voice-over explaining concepts clearly. Educational content style, engaging and accessible, suitable for students and general audience, high-quality animation"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-041',
    title: '装修改造视频提示词',
    description: '家居装修、空间改造、前后对比视频提示词',
    category: '视频生成',
    tags: ['装修', '改造', '家居', '设计'],
    usage: 21340,
    rating: 4.8,
    content: `# 装修改造视频提示词指南

## 【改造类型】

### 房间改造
- bedroom makeover
- kitchen renovation
- living room transformation
- bathroom remodel

### 全屋翻新
- whole house renovation
- apartment makeover
- outdoor space upgrade
- historic restoration

## 【视频结构】
- before and after reveal
- transformation timelapse
- design process explanation
- final reveal moment`,
    example: {
      input: '小户型公寓改造前后对比',
      output: `【提示词】
"Dramatic home renovation reveal video. Begin with cramped, outdated apartment with cluttered spaces. Transition to renovation process timelapse showing demolition and construction. Final reveal: same space now open, bright, and modern with clever storage solutions. Slow camera pan through transformed rooms showing before-and-after comparison. Home improvement show style, satisfying transformation, aspirational interior design, 4K quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-042',
    title: '户外探险视频提示词',
    description: '户外运动、极限挑战、探险旅行视频提示词',
    category: '视频生成',
    tags: ['户外', '探险', '极限运动', '冒险'],
    usage: 16780,
    rating: 4.8,
    content: `# 户外探险视频提示词指南

## 【探险类型】

### 山地探险
- mountain climbing
- hiking adventure
- rock climbing challenge
- summit achievement

### 水上探险
- white water rafting
- surfing adventure
- scuba diving exploration
- kayaking journey

## 【视频元素】
- action camera POV
- drone establishing shots
- emotional achievement moments
- breathtaking scenery`,
    example: {
      input: '攀岩挑战纪录片片段',
      output: `【提示词】
"Thrilling rock climbing adventure documentary. POV from climber's perspective showing hands gripping rock face, camera looking down at vast drop below. Cut to wide shot of majestic cliff face with tiny figure of climber. Determination on face, chalk dust flying from hands. Summit achievement moment with arms raised in triumph, panoramic view stretching to horizon. Adventure sports documentary style, GoPro action footage mixed with cinematic shots, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-043',
    title: '宠物搞笑视频提示词',
    description: '宠物趣事、萌宠搞笑、动物娱乐视频提示词',
    category: '视频生成',
    tags: ['宠物', '搞笑', '萌宠', '娱乐'],
    usage: 24560,
    rating: 4.9,
    content: `# 宠物搞笑视频提示词指南

## 【搞笑类型】

### 反应视频
- pet reactions to things
- surprised expressions
- funny fail moments
- unexpected behaviors

### 互动视频
- pet and owner comedy
- animal friendship
- training mishaps
- daily life humor

## 【拍摄要点】
- capture authentic moments
- multiple angles for comedy
- slow-motion for dramatic effect
- natural pet expressions`,
    example: {
      input: '狗狗第一次看到雪的反应',
      output: `【提示词】
"Adorable and funny video of a dog experiencing snow for the first time. Golden retriever cautiously stepping onto white snow, sniffing curiously, then suddenly becoming excited and bounding through the snow with joy. Playful jumping, catching snowflakes, rolling in the white powder. Wide-eyed wonder and pure happiness on dog's face. Viral pet video style, heartwarming and humorous, 4K slow-motion captures of cute moments"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-044',
    title: '美妆教程视频提示词',
    description: '化妆教程、美妆技巧、妆容展示视频提示词',
    category: '视频生成',
    tags: ['美妆', '化妆', '教程', '美容'],
    usage: 23450,
    rating: 4.8,
    content: `# 美妆教程视频提示词指南

## 【妆容类型】

### 日常妆容
- natural everyday makeup
- quick morning routine
- minimal makeup look
- work-appropriate style

### 特殊场合
- evening glam makeup
- bridal makeup tutorial
- party makeup look
- creative editorial style

## 【拍摄要素】
- ring light setup
- close-up application shots
- before and after
- product showcase`,
    example: {
      input: '日常自然妆容教程',
      output: `【提示词】
"Professional makeup tutorial video for natural everyday look. Beauty influencer facing camera with ring lighting, demonstrating foundation application with beauty blender. Cut to close-up of eye makeup technique, blending soft neutral tones. Lips being carefully lined and filled with nude shade. Final reveal showing fresh, radiant complexion. Beauty YouTuber style, clear voice-over instructions, well-lit and professional, 4K close-ups"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-045',
    title: '汽车测评视频提示词',
    description: '汽车评测、试驾体验、车辆展示视频提示词',
    category: '视频生成',
    tags: ['汽车', '测评', '试驾', '评测'],
    usage: 18920,
    rating: 4.7,
    content: `# 汽车测评视频提示词指南

## 【测评类型】

### 新车评测
- new model test drive
- first impression review
- comparison test
- detailed walkthrough

### 性能测试
- acceleration test
- handling review
- off-road capability
- fuel efficiency test

## 【拍摄角度】
- exterior walk-around
- interior features tour
- driving POV
- dynamic action shots`,
    example: {
      input: '豪华轿车深度测评',
      output: `【提示词】
"Comprehensive luxury sedan review video. Opening with cinematic shots of car exterior from multiple angles, highlighting design details. Cut to interior tour showing premium materials, technology features, and comfort amenities. Test drive footage on scenic roads, demonstrating handling and performance. Professional automotive journalist commentary, informative and engaging. Car review show style, broadcast quality, 4K with aerial drone shots"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-046',
    title: '创意广告视频提示词',
    description: '品牌创意广告、商业短片、营销视频提示词',
    category: '视频生成',
    tags: ['广告', '创意', '品牌', '营销'],
    usage: 21230,
    rating: 4.8,
    content: `# 创意广告视频提示词指南

## 【广告类型】

### 品牌形象
- brand story video
- emotional connection ad
- lifestyle branding
- corporate values message

### 产品推广
- product launch video
- feature highlight ad
- benefit demonstration
- call-to-action focused

## 【创意手法】
- emotional storytelling
- humor and entertainment
- visual spectacle
- celebrity endorsement`,
    example: {
      input: '运动品牌励志广告',
      output: `【提示词】
"Inspirational sports brand commercial. Opening with diverse athletes preparing for their sports in dawn light. Montage of training, struggle, and ultimate achievement. Powerful voice-over about pushing limits. Final shot of athlete triumph with brand logo appearing. Cinematic color grading, emotional music build-up. Nike-style inspirational advertising, premium production value, 4K slow-motion highlights"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-047',
    title: '旅行Vlog视频提示词',
    description: '旅行日志、旅游Vlog、目的地分享视频提示词',
    category: '视频生成',
    tags: ['旅行', 'Vlog', '旅游', '分享'],
    usage: 26780,
    rating: 4.9,
    content: `# 旅行Vlog视频提示词指南

## 【Vlog类型】

### 目的地分享
- city exploration vlog
- hidden gems discovery
- local food adventure
- cultural experience

### 旅行日记
- journey documentation
- personal reflections
- travel tips sharing
- memorable moments

## 【视频风格】
- handheld authentic feel
- talking head segments
- B-roll scenery shots
- montage sequences`,
    example: {
      input: '日本京都旅行Vlog',
      output: `【提示词】
"Engaging travel vlog exploring Kyoto, Japan. Vlogger walking through historic Gion district, camera following from front. Cut to visits of iconic temples, bamboo groves, and traditional tea houses. Food tasting segments with authentic reactions. Beautiful B-roll of cherry blossoms and traditional architecture. Personal narration about cultural discoveries. Travel influencer style, authentic and enthusiastic, good mix of personality and destination focus, 4K quality"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-048',
    title: '婚礼预告片视频提示词',
    description: '婚礼预告、爱情故事、婚前视频提示词',
    category: '视频生成',
    tags: ['婚礼', '预告片', '爱情', '情侣'],
    usage: 15670,
    rating: 4.8,
    content: `# 婚礼预告片视频提示词指南

## 【视频类型】

### 爱情故事
- how we met story
- relationship journey
- proposal moment
- couple interview

### 婚礼预告
- teaser trailer
- save the date video
- invitation video
- engagement announcement

## 【风格选择】
- cinematic romantic
- documentary style
- fun and playful
- elegant and classic`,
    example: {
      input: '浪漫爱情故事视频',
      output: `【提示词】
"Romantic couple love story video. Opening with childhood photos transitioning to present-day couple walking hand in hand at sunset beach. Recreated moments of how they met, first date, and proposal. Soft, dreamy color grading with warm tones. Intimate interview clips of couple sharing their story. Cinematic slow-motion shots of their connection. Wedding teaser style, emotional and personal, professional cinematography, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-049',
    title: '音乐教学视频提示词',
    description: '乐器教学、音乐课程、演奏技巧视频提示词',
    category: '视频生成',
    tags: ['音乐', '教学', '乐器', '演奏'],
    usage: 14560,
    rating: 4.7,
    content: `# 音乐教学视频提示词指南

## 【教学类型】

### 乐器教学
- piano lesson tutorial
- guitar chord guide
- violin technique
- drum basics

### 音乐理论
- music theory explained
- songwriting tips
- ear training
- composition guide

## 【拍摄要素】
- clear instrument close-ups
- finger position detail
- multi-angle demonstrations
- on-screen notation`,
    example: {
      input: '钢琴基础教学视频',
      output: `【提示词】
"Clear and engaging piano lesson video for beginners. Instructor sitting at grand piano, camera angle showing both hands on keyboard. Close-up of finger placement for basic scales and chords. On-screen keyboard diagram showing notes being played. Patient and encouraging teaching style. Step-by-step breakdown with practice exercises. Music tutorial style, well-lit and professional audio, educational and accessible, 4K"`,
      type: 'text'
    }
  },
  
  {
    id: 'video-050',
    title: '延时摄影视频提示词',
    description: '延时摄影、时间流逝、变化过程视频提示词',
    category: '视频生成',
    tags: ['延时', '时间流逝', '变化', '摄影'],
    usage: 17890,
    rating: 4.9,
    content: `# 延时摄影视频提示词指南

## 【延时类型】

### 自然变化
- sunrise to sunset
- seasons changing
- plant growth
- weather transformation

### 城市动态
- city day to night
- traffic flow patterns
- construction progress
- crowd movement

## 【技术要点】
- smooth exposure transitions
- stable camera mount
- appropriate time interval
- post-processing flow`,
    example: {
      input: '城市日落到夜景延时',
      output: `【提示词】
"Stunning timelapse video of city transitioning from sunset to night. Wide shot of city skyline as golden hour turns to blue hour, then city lights begin twinkling on. Smooth transition of colors in sky, buildings gradually illuminating. Traffic light trails creating dynamic patterns. Professional timelapse photography style, smooth exposure changes, vibrant colors, captivating progression, 4K resolution"`,
      type: 'text'
    }
  }
];

// 默认导出
export default prompts;
