/**
 * 生产环境数据初始化脚本
 * 运行方式: node scripts/init-production-data.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// 全品类分类
const CATEGORIES = [
  { name: '视频生成', slug: 'video-generation', sort_order: 1 },
  { name: '数字人', slug: 'digital-human', sort_order: 2 },
  { name: '视频编辑', slug: 'video-editing', sort_order: 3 },
  { name: 'AI配音', slug: 'ai-dubbing', sort_order: 4 },
  { name: '动漫创作', slug: 'anime-creation', sort_order: 5 },
  { name: 'AI绘画', slug: 'ai-image', sort_order: 10 },
  { name: 'AI写作', slug: 'ai-writing', sort_order: 20 },
  { name: 'AI编程', slug: 'ai-coding', sort_order: 30 },
  { name: 'AI音频', slug: 'ai-audio', sort_order: 40 },
  { name: 'AI办公', slug: 'ai-office', sort_order: 50 },
  { name: 'AI营销', slug: 'ai-marketing', sort_order: 60 },
  { name: 'AI学习', slug: 'ai-learning', sort_order: 70 },
  { name: 'AI聊天', slug: 'ai-chat', sort_order: 80 },
  { name: 'AI搜索', slug: 'ai-search', sort_order: 90 },
];

// 功能标签
const FEATURE_TAGS = [
  '文生视频', '图生视频', '数字人口播', 'AI配音', '视频编辑',
  '4K分辨率', '支持中文', '长视频生成', '去水印', '多语言',
  '图片生成', '艺术创作', '代码补全', 'AI对话', 'GPT-4',
  '音乐生成', 'PPT生成', '营销文案', '语言学习', 'AI搜索'
];

// 免费类型标签
const FREE_TYPE_TAGS = ['完全免费', '免费额度', '限时免费', '付费工具'];

// 时长标签
const DURATION_TAGS = ['1分钟以内', '1-10分钟', '10分钟以上'];

// 场景标签
const SCENE_TAGS = ['口播视频', '电商带货', '动漫制作', '知识科普'];

// 授权标签
const LICENSE_TAGS = ['可免费商用', '需授权商用', '不可商用'];

// 精选工具数据
const TOOLS = [
  // ========== 视频生成 ==========
  { name: 'Sora', logo: 'https://openai.com/favicon.ico', producer: 'OpenAI', highlight: 'OpenAI革命性AI视频生成', category: '视频生成', free_type: '付费工具', pricing: '$20/月起', url: 'https://openai.com/sora', featured: true, tags: ['文生视频', '4K分辨率', '长视频生成'], features: ['最长60秒视频生成', '复杂场景理解', '多角色一致性', '物理模拟真实'] },
  { name: 'Runway Gen-3', logo: 'https://runwayml.com/favicon.ico', producer: 'Runway', highlight: '专业级AI视频生成工具', category: '视频生成', free_type: '免费额度', pricing: '$12/月起', url: 'https://runwayml.com', featured: true, tags: ['文生视频', '图生视频', '视频编辑'], features: ['电影级画质', '运动笔刷控制', '多风格模板', '团队协作'] },
  { name: 'Pika Labs', logo: 'https://pika.art/favicon.ico', producer: 'Pika', highlight: '简单易用的AI视频生成', category: '视频生成', free_type: '免费额度', pricing: '$8/月起', url: 'https://pika.art', featured: true, tags: ['文生视频', '图生视频', '支持中文'], features: ['秒级生成速度', '动漫风格', '3D效果', '口型同步'] },
  { name: '可灵AI', logo: 'https://klingai.kuaishou.com/favicon.ico', producer: '快手', highlight: '国产最强AI视频生成', category: '视频生成', free_type: '免费额度', pricing: '会员$9.9/月', url: 'https://klingai.kuaishou.com', featured: true, tags: ['文生视频', '图生视频', '支持中文'], features: ['最长2分钟视频', '1080P高清', '中国风模板', '运动控制'] },
  { name: '即梦AI', logo: 'https://jimeng.jianying.com/favicon.ico', producer: '字节跳动', highlight: '字节跳动AI视频创作平台', category: '视频生成', free_type: '免费额度', pricing: '会员$6.9/月', url: 'https://jimeng.jianying.com', featured: true, tags: ['文生视频', '图生视频', '支持中文'], features: ['一键生成', '丰富模板', '中文优化', '快速导出'] },
  { name: 'Vidu', logo: 'https://www.vidu.studio/favicon.ico', producer: '生数科技', highlight: '国产AI视频生成新星', category: '视频生成', free_type: '免费额度', pricing: '会员$9.9/月', url: 'https://www.vidu.studio', featured: true, tags: ['文生视频', '图生视频', '支持中文'], features: ['4秒视频生成', '角色一致性', '多主体支持', '中文优化'] },
  { name: 'Luma AI', logo: 'https://lumalabs.ai/favicon.ico', producer: 'Luma Labs', highlight: '3D视频生成先锋', category: '视频生成', free_type: '免费额度', pricing: '$29.99/月', url: 'https://lumalabs.ai/dream-machine', featured: true, tags: ['文生视频', '图生视频', '4K分辨率'], features: ['Dream Machine', '3D场景生成', '物理真实', '相机控制'] },
  { name: 'LiblibAI', logo: 'https://www.liblib.art/favicon.ico', producer: 'LiblibAI', highlight: '一站式AI创作平台', category: '视频生成', free_type: '免费额度', pricing: '会员$9.9/月', url: 'https://www.liblib.art', featured: true, tags: ['文生视频', '图生视频', '支持中文'], features: ['图片生成', '视频生成', '模型训练', '社区分享'] },
  
  // ========== 数字人 ==========
  { name: 'HeyGen', logo: 'https://www.heygen.com/favicon.ico', producer: 'HeyGen', highlight: '顶级AI数字人视频平台', category: '数字人', free_type: '免费额度', pricing: '$24/月起', url: 'https://www.heygen.com', featured: true, tags: ['数字人口播', 'AI配音', '多语言'], features: ['100+数字人形象', '40+语言支持', '自定义数字人', '视频翻译'] },
  { name: 'Synthesia', logo: 'https://www.synthesia.io/favicon.ico', producer: 'Synthesia', highlight: '企业级数字人视频制作', category: '数字人', free_type: '付费工具', pricing: '$22/月起', url: 'https://www.synthesia.io', featured: true, tags: ['数字人口播', '多语言', '企业应用'], features: ['140+AI形象', '120+语言', 'PPT转视频', '企业模板库'] },
  { name: 'D-ID', logo: 'https://www.d-id.com/favicon.ico', producer: 'D-ID', highlight: '照片转数字人视频', category: '数字人', free_type: '免费额度', pricing: '$5.9/月起', url: 'https://www.d-id.com', featured: false, tags: ['数字人口播', 'AI配音'], features: ['照片驱动说话', '实时口型同步', '自定义头像', 'API接口'] },
  { name: '腾讯智影', logo: 'https://zenvideo.qq.com/favicon.ico', producer: '腾讯', highlight: '腾讯AI视频创作平台', category: '数字人', free_type: '免费额度', pricing: '会员$9.9/月', url: 'https://zenvideo.qq.com', featured: true, tags: ['数字人口播', '支持中文', '视频编辑'], features: ['多种数字人', '智能配音', '字幕生成', '模板丰富'] },
  
  // ========== 视频编辑 ==========
  { name: '剪映专业版', logo: 'https://lv.ulikecam.com/favicon.ico', producer: '字节跳动', highlight: '最强免费视频编辑器', category: '视频编辑', free_type: '完全免费', pricing: '完全免费', url: 'https://lv.ulikecam.com', featured: true, tags: ['视频编辑', 'AI配音', '支持中文'], features: ['AI智能剪辑', '一键成片', '海量素材', '多平台导出'] },
  { name: 'CapCut', logo: 'https://www.capcut.com/favicon.ico', producer: '字节跳动', highlight: '全球流行的视频编辑工具', category: '视频编辑', free_type: '免费额度', pricing: 'Pro$7.99/月', url: 'https://www.capcut.com', featured: true, tags: ['视频编辑', 'AI配音', '去水印'], features: ['AI背景移除', '自动字幕', '模板社区', '跨平台使用'] },
  { name: 'Runway ML', logo: 'https://runwayml.com/favicon.ico', producer: 'Runway', highlight: 'AI视频编辑套件', category: '视频编辑', free_type: '免费额度', pricing: '$15/月起', url: 'https://runwayml.com', featured: true, tags: ['视频编辑', '去水印', '4K分辨率'], features: ['绿幕抠像', '运动跟踪', '视频修复', '帧插值'] },
  { name: 'Descript', logo: 'https://www.descript.com/favicon.ico', producer: 'Descript', highlight: 'AI驱动的音视频编辑', category: '视频编辑', free_type: '免费额度', pricing: '$12/月起', url: 'https://www.descript.com', featured: false, tags: ['视频编辑', 'AI配音', '多语言'], features: ['文字编辑视频', 'AI声音克隆', '自动转录', '多轨编辑'] },
  
  // ========== AI绘画 ==========
  { name: 'Midjourney', logo: 'https://www.midjourney.com/favicon.ico', producer: 'Midjourney', highlight: '顶级AI绘画工具', category: 'AI绘画', free_type: '付费工具', pricing: '$10/月起', url: 'https://www.midjourney.com', featured: true, tags: ['图片生成', '艺术创作', '多风格'], features: ['电影级画质', '风格丰富', '社区活跃', 'V6模型强大'] },
  { name: 'DALL·E 3', logo: 'https://openai.com/favicon.ico', producer: 'OpenAI', highlight: 'OpenAI图像生成模型', category: 'AI绘画', free_type: '付费工具', pricing: '$20/月起', url: 'https://openai.com/dall-e-3', featured: true, tags: ['图片生成', '文字渲染', 'ChatGPT集成'], features: ['精准理解提示词', '文字渲染能力', '与ChatGPT无缝集成', '安全过滤'] },
  { name: 'Stable Diffusion', logo: 'https://stability.ai/favicon.ico', producer: 'Stability AI', highlight: '开源AI绘画模型', category: 'AI绘画', free_type: '完全免费', pricing: '完全免费', url: 'https://stability.ai', featured: true, tags: ['图片生成', '开源免费', '本地部署'], features: ['完全开源', '可本地部署', '模型生态丰富', '自定义训练'] },
  { name: 'Leonardo.AI', logo: 'https://leonardo.ai/favicon.ico', producer: 'Leonardo', highlight: 'AI图像生成与编辑', category: 'AI绘画', free_type: '免费额度', pricing: '$12/月起', url: 'https://leonardo.ai', featured: true, tags: ['图片生成', '图片编辑', '游戏素材'], features: ['游戏资产生成', '模型训练', '图片编辑', '免费额度充足'] },
  { name: 'Canva AI', logo: 'https://www.canva.com/favicon.ico', producer: 'Canva', highlight: 'AI设计平台', category: 'AI绘画', free_type: '免费额度', pricing: 'Pro$12.99/月', url: 'https://www.canva.com', featured: true, tags: ['图片设计', 'AI生成', '模板丰富'], features: ['AI图片生成', '魔法编辑', '海量模板', '团队协作'] },
  { name: '即梦AI绘画', logo: 'https://jimeng.jianying.com/favicon.ico', producer: '字节跳动', highlight: '字节跳动AI绘画平台', category: 'AI绘画', free_type: '免费额度', pricing: '会员$6.9/月', url: 'https://jimeng.jianying.com', featured: true, tags: ['图片生成', '支持中文', '中国风'], features: ['中文理解优秀', '中国风模板', '一键生成', '快速产出'] },
  
  // ========== AI聊天 ==========
  { name: 'ChatGPT', logo: 'https://chat.openai.com/favicon.ico', producer: 'OpenAI', highlight: '最强AI对话助手', category: 'AI聊天', free_type: '免费额度', pricing: 'Plus $20/月', url: 'https://chat.openai.com', featured: true, tags: ['AI对话', 'GPT-4', '多模态'], features: ['GPT-4模型', '联网搜索', '文件分析', 'DALL·E集成'] },
  { name: 'Claude', logo: 'https://claude.ai/favicon.ico', producer: 'Anthropic', highlight: '安全可靠的AI助手', category: 'AI聊天', free_type: '免费额度', pricing: 'Pro $20/月', url: 'https://claude.ai', featured: true, tags: ['AI对话', '长文本', '代码能力'], features: ['200K上下文', '推理能力强', '安全可靠', '代码优秀'] },
  { name: 'Kimi', logo: 'https://kimi.moonshot.cn/favicon.ico', producer: '月之暗面', highlight: '超长文本AI助手', category: 'AI聊天', free_type: '完全免费', pricing: '完全免费', url: 'https://kimi.moonshot.cn', featured: true, tags: ['AI对话', '长文本', '支持中文'], features: ['200万字上下文', '文件分析', '联网搜索', '完全免费'] },
  { name: '豆包', logo: 'https://www.doubao.com/favicon.ico', producer: '字节跳动', highlight: '字节跳动AI助手', category: 'AI聊天', free_type: '完全免费', pricing: '完全免费', url: 'https://www.doubao.com', featured: true, tags: ['AI对话', '支持中文', '免费'], features: ['完全免费', '中文优秀', '多场景应用', '抖音生态'] },
  { name: 'Gemini', logo: 'https://gemini.google.com/favicon.ico', producer: 'Google', highlight: 'Google多模态AI', category: 'AI聊天', free_type: '免费额度', pricing: 'Advanced $19.99/月', url: 'https://gemini.google.com', featured: true, tags: ['AI对话', '多模态', 'Google生态'], features: ['多模态理解', 'Google生态', '实时信息', '代码能力'] },
  { name: '通义千问', logo: 'https://tongyi.aliyun.com/favicon.ico', producer: '阿里云', highlight: '阿里云AI对话平台', category: 'AI聊天', free_type: '免费额度', pricing: 'Plus $9.9/月', url: 'https://tongyi.aliyun.com/qianwen', featured: true, tags: ['AI对话', '支持中文', '企业应用'], features: ['中文能力强', '多模态', '企业服务', 'API丰富'] },
  
  // ========== AI配音 ==========
  { name: 'ElevenLabs', logo: 'https://elevenlabs.io/favicon.ico', producer: 'ElevenLabs', highlight: '顶级AI语音合成平台', category: 'AI配音', free_type: '免费额度', pricing: '$5/月起', url: 'https://elevenlabs.io', featured: true, tags: ['AI配音', '多语言', '声音克隆'], features: ['超逼真语音', '29种语言', '声音克隆', '情感控制'] },
  { name: '讯飞配音', logo: 'https://peiyin.xunfei.cn/favicon.ico', producer: '科大讯飞', highlight: '中文AI配音首选', category: 'AI配音', free_type: '免费额度', pricing: '会员$3.9/月', url: 'https://peiyin.xunfei.cn', featured: true, tags: ['AI配音', '支持中文', '多语言'], features: ['中文语音领先', '多种音色', '情感表达', '批量处理'] },
  
  // ========== AI写作 ==========
  { name: 'Notion AI', logo: 'https://www.notion.so/favicon.ico', producer: 'Notion', highlight: '笔记协作AI助手', category: 'AI写作', free_type: '免费额度', pricing: 'Plus $10/月', url: 'https://www.notion.so/product/ai', featured: true, tags: ['AI写作', '笔记协作', '知识管理'], features: ['智能写作', '文档摘要', '翻译润色', '知识库'] },
  { name: 'Jasper', logo: 'https://www.jasper.ai/favicon.ico', producer: 'Jasper', highlight: '营销文案AI平台', category: 'AI写作', free_type: '付费工具', pricing: '$49/月起', url: 'https://www.jasper.ai', featured: true, tags: ['营销文案', 'SEO写作', '多语言'], features: ['营销模板', '品牌声音', 'SEO优化', '团队协作'] },
  { name: '秘塔写作猫', logo: 'https://xiezuocat.com/favicon.ico', producer: '秘塔科技', highlight: '中文AI写作助手', category: 'AI写作', free_type: '免费额度', pricing: '会员$9.9/月', url: 'https://xiezuocat.com', featured: true, tags: ['AI写作', '支持中文', '润色纠错'], features: ['中文优化', '语法纠错', '润色改写', '多场景模板'] },
  { name: 'DeepL', logo: 'https://www.deepl.com/favicon.ico', producer: 'DeepL', highlight: '最准AI翻译工具', category: 'AI写作', free_type: '免费额度', pricing: 'Pro $10.49/月', url: 'https://www.deepl.com', featured: true, tags: ['AI翻译', '多语言', '高精度'], features: ['翻译最准确', '支持31种语言', '文档翻译', '写作润色'] },
  
  // ========== AI编程 ==========
  { name: 'GitHub Copilot', logo: 'https://github.com/favicon.ico', producer: 'GitHub/Microsoft', highlight: '最强AI编程助手', category: 'AI编程', free_type: '付费工具', pricing: '$10/月', url: 'https://github.com/features/copilot', featured: true, tags: ['代码补全', '多语言', 'IDE集成'], features: ['主流IDE支持', '多语言', '上下文理解', '代码建议'] },
  { name: 'Cursor', logo: 'https://cursor.sh/favicon.ico', producer: 'Cursor', highlight: 'AI原生代码编辑器', category: 'AI编程', free_type: '免费额度', pricing: 'Pro $20/月', url: 'https://cursor.sh', featured: true, tags: ['代码编辑器', 'AI编程', '多模型'], features: ['AI原生设计', '多模型选择', '代码重构', '免费额度'] },
  { name: '通义灵码', logo: 'https://tongyi.aliyun.com/favicon.ico', producer: '阿里云', highlight: '阿里AI编程助手', category: 'AI编程', free_type: '完全免费', pricing: '完全免费', url: 'https://tongyi.aliyun.com/lingma', featured: true, tags: ['代码补全', '支持中文', '免费'], features: ['完全免费', '中文支持', '多语言', 'IDE插件'] },
  
  // ========== AI音频 ==========
  { name: 'Suno', logo: 'https://suno.ai/favicon.ico', producer: 'Suno', highlight: 'AI音乐生成神器', category: 'AI音频', free_type: '免费额度', pricing: 'Pro $10/月', url: 'https://suno.ai', featured: true, tags: ['音乐生成', '歌曲创作', '多风格'], features: ['完整歌曲生成', '人声演唱', '多种风格', '快速产出'] },
  { name: 'Udio', logo: 'https://www.udio.com/favicon.ico', producer: 'Udio', highlight: '高质量AI音乐生成', category: 'AI音频', free_type: '免费额度', pricing: 'Pro $10/月', url: 'https://www.udio.com', featured: true, tags: ['音乐生成', '歌曲创作', '高音质'], features: ['高音质输出', '多种风格', '人声生成', '专业级效果'] },
  
  // ========== AI办公 ==========
  { name: 'Gamma', logo: 'https://gamma.app/favicon.ico', producer: 'Gamma', highlight: 'AI演示文稿生成', category: 'AI办公', free_type: '免费额度', pricing: 'Pro $10/月', url: 'https://gamma.app', featured: true, tags: ['PPT生成', '演示文稿', '一键生成'], features: ['一键生成PPT', '精美模板', 'AI设计', '在线协作'] },
  { name: '飞书妙记', logo: 'https://www.feishu.cn/favicon.ico', producer: '字节跳动', highlight: '会议智能记录助手', category: 'AI办公', free_type: '免费额度', pricing: '企业版按需', url: 'https://www.feishu.cn/product/minutes', featured: true, tags: ['会议记录', '语音转文字', '协作'], features: ['实时转录', '智能摘要', '多语言支持', '飞书生态'] },
  
  // ========== AI搜索 ==========
  { name: 'Perplexity', logo: 'https://www.perplexity.ai/favicon.ico', producer: 'Perplexity', highlight: 'AI问答搜索引擎', category: 'AI搜索', free_type: '免费额度', pricing: 'Pro $20/月', url: 'https://www.perplexity.ai', featured: true, tags: ['AI搜索', '实时信息', '引用来源'], features: ['实时联网', '来源引用', '深度追问', '多模型'] },
  { name: '秘塔AI搜索', logo: 'https://metaso.cn/favicon.ico', producer: '秘塔科技', highlight: '无广告AI搜索', category: 'AI搜索', free_type: '完全免费', pricing: '完全免费', url: 'https://metaso.cn', featured: true, tags: ['AI搜索', '无广告', '深度搜索'], features: ['无广告干扰', '深度搜索', '结构化答案', '来源标注'] },
  
  // ========== AI营销 ==========
  { name: 'Jasper Marketing', logo: 'https://www.jasper.ai/favicon.ico', producer: 'Jasper', highlight: 'AI营销内容平台', category: 'AI营销', free_type: '付费工具', pricing: '$49/月起', url: 'https://www.jasper.ai', featured: true, tags: ['营销文案', 'SEO优化', '社媒运营'], features: ['营销模板库', 'SEO工具', '品牌声音', '多平台发布'] },
  
  // ========== AI学习 ==========
  { name: 'Duolingo', logo: 'https://www.duolingo.com/favicon.ico', producer: 'Duolingo', highlight: 'AI语言学习平台', category: 'AI学习', free_type: '免费额度', pricing: 'Super $6.99/月', url: 'https://www.duolingo.com', featured: true, tags: ['语言学习', '游戏化', '多语言'], features: ['游戏化学习', 'AI对话', '多种语言', '免费核心功能'] },
];

// Prompt模板
const PROMPTS = [
  { title: '电影级风景镜头', content: 'A breathtaking cinematic aerial shot of [SUBJECT], golden hour lighting, dramatic clouds, 8K resolution, photorealistic, smooth camera movement, professional cinematography, epic scale, volumetric fog', category: '场景描述', tags: ['风景', '电影感', '航拍'] },
  { title: '产品展示视频', content: 'Product showcase video of [PRODUCT], clean white background, soft studio lighting, 360 degree rotation, professional commercial style, high-end product photography, smooth motion, subtle reflections', category: '场景描述', tags: ['产品', '商业', '展示'] },
  { title: '科幻城市夜景', content: 'Futuristic cyberpunk cityscape at night, neon lights reflecting on wet streets, flying vehicles, holographic advertisements, Blade Runner aesthetic, cinematic wide shot, 8K quality, atmospheric fog', category: '场景描述', tags: ['科幻', '城市', '赛博朋克'] },
  { title: '自然纪录片风格', content: 'Nature documentary style footage of [ANIMAL/SCENE], close-up slow motion, shallow depth of field, golden hour, National Geographic quality, detailed textures, natural habitat, cinematic composition', category: '场景描述', tags: ['自然', '纪录片', '动物'] },
  { title: '美食视频拍摄', content: 'Delicious [FOOD] food videography, steam rising, close-up macro shot, warm lighting, professional food styling, appetizing presentation, shallow depth of field, slow motion pour, restaurant quality', category: '场景描述', tags: ['美食', '商业', '近景'] },
  { title: '古风仙侠场景', content: 'Ancient Chinese fantasy landscape, misty mountains, traditional pavilions, flying cranes, ethereal atmosphere, wuxia style, soft pastel colors, cinematic wide shot, dreamlike quality, 4K resolution', category: '场景描述', tags: ['古风', '仙侠', '中国风'] },
  { title: '二次元少女', content: 'Anime style girl with [HAIR_COLOR] hair, [EYE_COLOR] eyes, wearing [OUTFIT], cherry blossoms background, soft lighting, Studio Ghibli inspired, detailed illustration, kawaii aesthetic, pastel colors', category: '角色扮演', tags: ['二次元', '少女', '动漫'] },
  { title: '写实人物肖像', content: 'Photorealistic portrait of a [AGE] year old [GENDER] with [FEATURES], natural lighting, shallow depth of field, professional headshot, detailed skin texture, expressive eyes, cinematic color grading', category: '角色扮演', tags: ['肖像', '写实', '人物'] },
  { title: '奇幻角色设计', content: 'Fantasy character design, [RACE/TYPE] warrior with [WEAPONS], intricate armor details, magical aura, dramatic pose, concept art style, detailed background, epic lighting, ArtStation quality', category: '角色扮演', tags: ['奇幻', '游戏', '设计'] },
  { title: '复古电影风格', content: 'Vintage film look, [SUBJECT] in 1970s style, film grain, warm color palette, soft focus edges, retro aesthetic, Kodak Portra 400 colors, nostalgic atmosphere, classic cinema composition', category: '风格迁移', tags: ['复古', '电影', '胶片'] },
  { title: '赛博朋克风格', content: 'Cyberpunk transformation, [SUBJECT] with neon accents, glitch effects, holographic elements, purple and cyan color scheme, futuristic overlay, tech aesthetics, digital distortion, high contrast', category: '风格迁移', tags: ['赛博朋克', '科技', '未来'] },
  { title: '水墨画风格', content: 'Traditional Chinese ink wash painting style, [SUBJECT], elegant brush strokes, minimal composition, zen aesthetic, black and white with subtle color accents, artistic, cultural heritage feel', category: '风格迁移', tags: ['水墨', '中国风', '艺术'] },
  { title: '油画艺术风格', content: 'Oil painting style, [SUBJECT] in impressionist manner, visible brushstrokes, rich textures, classical art composition, museum masterpiece quality, warm tones, artistic interpretation', category: '风格迁移', tags: ['油画', '艺术', '印象派'] },
  { title: '爆炸特效', content: 'Cinematic explosion effect, debris and particles, fire and smoke, slow motion capture, realistic physics, dramatic lighting, Hollywood VFX quality, volumetric smoke, detailed destruction', category: '特效制作', tags: ['爆炸', '特效', '电影'] },
  { title: '魔法粒子效果', content: 'Magical particle effects, glowing sparkles, ethereal energy swirl, fantasy magic casting, mystical aura, rainbow colored particles, slow motion flow, dreamlike atmosphere, high quality VFX', category: '特效制作', tags: ['魔法', '粒子', '奇幻'] },
  { title: '数字人主播开场', content: 'Professional AI anchor greeting: Hello everyone, welcome to today\'s program. I\'m your AI host, bringing you the latest [TOPIC] content. Let\'s dive in and explore together!', category: '场景描述', tags: ['数字人', '主播', '开场'] },
  { title: '电商带货口播', content: '电商带货文案：大家好！今天给大家推荐这款[产品名]，它有[特点1]、[特点2]、[特点3]三大亮点。现在下单还有优惠，赶紧点击链接购买吧！', category: '场景描述', tags: ['电商', '带货', '口播'] },
];

// 教程
const TUTORIALS = [
  { title: 'Sora入门指南：如何生成高质量AI视频', category: '入门教程', difficulty: '初级', featured: true },
  { title: '可灵AI使用教程：国产最强视频生成工具', category: '入门教程', difficulty: '初级', featured: true },
  { title: 'HeyGen数字人制作全攻略', category: '入门教程', difficulty: '中级', featured: true },
  { title: 'Runway Gen-3高级技巧：打造电影级视频', category: '进阶技巧', difficulty: '高级', featured: false },
  { title: 'Pika Labs快速上手：最适合新手的AI视频工具', category: '入门教程', difficulty: '初级', featured: false },
  { title: 'ElevenLabs配音教程：打造专业级AI语音', category: '入门教程', difficulty: '中级', featured: false },
  { title: '剪映AI功能全解析：免费也能做出爆款', category: '入门教程', difficulty: '初级', featured: true },
  { title: 'AI视频制作工作流：从创意到成片', category: '案例分享', difficulty: '中级', featured: true },
];

async function initDatabase() {
  console.log('🚀 开始初始化生产环境数据...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // 1. 初始化分类
  console.log('📁 初始化分类...');
  for (const cat of CATEGORIES) {
    const { error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' });
    if (error) console.error(`  ❌ ${cat.name}: ${error.message}`);
    else console.log(`  ✅ ${cat.name}`);
  }
  
  // 2. 初始化标签
  console.log('\n🏷️ 初始化标签...');
  const allTags = [
    ...FEATURE_TAGS.map(t => ({ name: t, type: 'feature' })),
    ...FREE_TYPE_TAGS.map(t => ({ name: t, type: 'free_type' })),
    ...DURATION_TAGS.map(t => ({ name: t, type: 'duration' })),
    ...SCENE_TAGS.map(t => ({ name: t, type: 'scene' })),
    ...LICENSE_TAGS.map(t => ({ name: t, type: 'license' })),
  ];
  
  for (const tag of allTags) {
    const { error } = await supabase
      .from('tags')
      .upsert(tag, { onConflict: 'name' });
    if (!error) console.log(`  ✅ ${tag.name}`);
  }
  
  // 3. 获取分类ID映射
  const { data: categories } = await supabase.from('categories').select('id, slug');
  const categoryMap = new Map(categories?.map(c => [c.slug, c.id]) || []);
  
  // 4. 初始化工具
  console.log('\n🔧 初始化工具...');
  let toolCount = 0;
  for (const tool of TOOLS) {
    const categorySlug = CATEGORIES.find(c => c.name === tool.category)?.slug || 'video-generation';
    const categoryId = categoryMap.get(categorySlug);
    
    if (!categoryId) {
      console.log(`  ⚠️ 跳过 ${tool.name}: 找不到分类`);
      continue;
    }
    
    const { error } = await supabase.from('tools').upsert({
      name: tool.name,
      logo: tool.logo,
      producer: tool.producer,
      highlight: tool.highlight.substring(0, 15),
      category_id: categoryId,
      free_type: tool.free_type,
      free_quota_desc: tool.pricing,
      feature_tags: tool.tags,
      max_duration: '60秒',
      official_url: tool.url,
      promotion_url: null,
      is_featured: tool.featured || false,
      is_active: true,
      advantages: tool.features?.slice(0, 3) || [],
      limitations: [],
      commercial_license: '需授权商用',
      launch_date: new Date().toISOString(),
    }, { onConflict: 'name' });
    
    if (!error) {
      toolCount++;
      console.log(`  ✅ ${tool.name}`);
    }
  }
  
  // 5. 初始化Prompt模板
  console.log('\n📝 初始化Prompt模板...');
  let promptCount = 0;
  for (const prompt of PROMPTS) {
    const { error } = await supabase.from('prompts').insert({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags,
      author: 'OneClaw官方',
      uses: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 200) + 20,
      status: 'published',
    });
    if (!error) {
      promptCount++;
      console.log(`  ✅ ${prompt.title}`);
    }
  }
  
  // 6. 初始化教程
  console.log('\n📚 初始化教程...');
  let tutorialCount = 0;
  for (const tutorial of TUTORIALS) {
    const { error } = await supabase.from('tutorials').insert({
      title: tutorial.title,
      content: `# ${tutorial.title}\n\n这是${tutorial.title}的详细内容...`,
      category: tutorial.category,
      difficulty: tutorial.difficulty,
      author: 'OneClaw官方',
      views: Math.floor(Math.random() * 5000) + 500,
      likes: Math.floor(Math.random() * 300) + 30,
      is_featured: tutorial.featured,
      status: 'published',
    });
    if (!error) {
      tutorialCount++;
      console.log(`  ✅ ${tutorial.title}`);
    }
  }
  
  console.log('\n✨ 初始化完成！');
  console.log(`  - 分类: ${CATEGORIES.length} 个`);
  console.log(`  - 标签: ${allTags.length} 个`);
  console.log(`  - 工具: ${toolCount} 个`);
  console.log(`  - Prompt: ${promptCount} 个`);
  console.log(`  - 教程: ${tutorialCount} 个`);
}

// 简化的Supabase客户端
function createClient(url, key) {
  return {
    from: (table) => ({
      select: (fields) => ({
        eq: (field, value) => ({
          single: async () => {
            const res = await fetch(`${url}/rest/v1/${table}?${field}=eq.${value}&select=${fields}`, {
              headers: { apikey: key, Authorization: `Bearer ${key}` },
            });
            const data = await res.json();
            return { data: data[0] || data, error: null };
          },
          data: null,
        }),
        range: async (from, to) => {
          const res = await fetch(`${url}/rest/v1/${table}?select=${fields}&offset=${from}&limit=${to-from+1}`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
          });
          return { data: await res.json(), error: null };
        },
      }),
      insert: async (data) => {
        const res = await fetch(`${url}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(data),
        });
        return { error: res.ok ? null : await res.json() };
      },
      upsert: async (data, options) => {
        const res = await fetch(`${url}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify(data),
        });
        return { error: res.ok ? null : await res.json() };
      },
    }),
  };
}

initDatabase().catch(console.error);
