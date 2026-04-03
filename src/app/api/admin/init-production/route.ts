import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 工具数据类型定义
interface ToolData {
  name: string;
  logo: string;
  producer: string;
  highlight: string;
  category: string;
  free_type: string;
  free_quota_desc: string;
  official_url: string;
  promotion_url?: string;
  is_official?: boolean;
  is_featured: boolean;
  feature_tags: string[];
  advantages: string[];
  limitations: string[];
  commercial_license: string;
}

// 完整初始化数据
const INIT_DATA = {
  categories: [
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
  ],
  tags: {
    feature: ['文生视频', '图生视频', '数字人口播', 'AI配音', '视频编辑', '4K分辨率', '支持中文', '长视频生成', '去水印', '多语言', '图片生成', '艺术创作', '代码补全', 'AI对话', 'GPT-4', '音乐生成', 'PPT生成', '营销文案', '语言学习', 'AI搜索', '角色扮演', '开源免费', '声音克隆', '会议记录'],
    free_type: ['完全免费', '免费额度', '限时免费', '付费工具'],
    duration: ['1分钟以内', '1-10分钟', '10分钟以上'],
    scene: ['口播视频', '电商带货', '动漫制作', '知识科普'],
    license: ['可免费商用', '需授权商用', '不可商用'],
  },
};

// 完整工具数据
const TOOLS: ToolData[] = [
  // ========== 视频生成 ==========
  { name: 'Sora', logo: 'https://openai.com/favicon.ico', producer: 'OpenAI', highlight: 'OpenAI革命性AI视频', category: '视频生成', free_type: '付费工具', free_quota_desc: '$20/月起', official_url: 'https://openai.com/sora', is_featured: true, feature_tags: ['文生视频', '4K分辨率', '长视频生成'], advantages: ['最长60秒视频', '复杂场景理解', '多角色一致性'], limitations: ['需要订阅'], commercial_license: '需授权商用' },
  { name: 'Runway Gen-3', logo: 'https://runwayml.com/favicon.ico', producer: 'Runway', highlight: '专业级AI视频生成', category: '视频生成', free_type: '免费额度', free_quota_desc: '$12/月起', official_url: 'https://runwayml.com', is_featured: true, feature_tags: ['文生视频', '图生视频', '视频编辑'], advantages: ['电影级画质', '运动笔刷控制', '多风格模板'], limitations: ['免费额度有限'], commercial_license: '需授权商用' },
  { name: 'Pika Labs', logo: 'https://pika.art/favicon.ico', producer: 'Pika', highlight: '简单易用AI视频', category: '视频生成', free_type: '免费额度', free_quota_desc: '$8/月起', official_url: 'https://pika.art', is_featured: true, feature_tags: ['文生视频', '图生视频', '支持中文'], advantages: ['秒级生成速度', '动漫风格', '3D效果'], limitations: ['视频时长有限'], commercial_license: '需授权商用' },
  { name: '可灵AI', logo: 'https://klingai.kuaishou.com/favicon.ico', producer: '快手', highlight: '国产最强AI视频', category: '视频生成', free_type: '免费额度', free_quota_desc: '会员$9.9/月', official_url: 'https://klingai.kuaishou.com', is_featured: true, feature_tags: ['文生视频', '图生视频', '支持中文'], advantages: ['最长2分钟视频', '1080P高清', '中国风模板'], limitations: ['排队时间较长'], commercial_license: '需授权商用' },
  { name: '即梦AI', logo: 'https://jimeng.jianying.com/favicon.ico', producer: '字节跳动', highlight: '字节AI视频创作', category: '视频生成', free_type: '免费额度', free_quota_desc: '会员$6.9/月', official_url: 'https://jimeng.jianying.com', is_featured: true, feature_tags: ['文生视频', '图生视频', '支持中文'], advantages: ['一键生成', '丰富模板', '中文优化'], limitations: ['复杂场景效果一般'], commercial_license: '需授权商用' },
  { name: 'Vidu', logo: 'https://www.vidu.studio/favicon.ico', producer: '生数科技', highlight: '国产AI视频新星', category: '视频生成', free_type: '免费额度', free_quota_desc: '会员$9.9/月', official_url: 'https://www.vidu.studio', is_featured: true, feature_tags: ['文生视频', '图生视频', '支持中文'], advantages: ['角色一致性好', '多主体支持', '中文优化'], limitations: ['视频时长较短'], commercial_license: '需授权商用' },
  { name: 'Luma AI', logo: 'https://lumalabs.ai/favicon.ico', producer: 'Luma Labs', highlight: '3D视频生成先锋', category: '视频生成', free_type: '免费额度', free_quota_desc: '$29.99/月', official_url: 'https://lumalabs.ai/dream-machine', is_featured: true, feature_tags: ['文生视频', '图生视频', '4K分辨率'], advantages: ['3D场景生成', '物理真实', '相机控制'], limitations: ['价格较高'], commercial_license: '需授权商用' },
  { name: 'LiblibAI', logo: 'https://www.liblib.art/favicon.ico', producer: 'LiblibAI', highlight: '一站式AI创作', category: '视频生成', free_type: '免费额度', free_quota_desc: '会员$9.9/月', official_url: 'https://www.liblib.art', is_featured: true, feature_tags: ['文生视频', '图生视频', '支持中文'], advantages: ['图片+视频生成', '模型训练', '社区分享'], limitations: ['学习成本较高'], commercial_license: '需授权商用' },
  { name: 'Stable Video', logo: 'https://stability.ai/favicon.ico', producer: 'Stability AI', highlight: '开源视频生成模型', category: '视频生成', free_type: '免费额度', free_quota_desc: '$10/月起', official_url: 'https://stability.ai', is_featured: false, feature_tags: ['文生视频', '图生视频', '开源免费'], advantages: ['开源模型', '本地部署', '自定义训练'], limitations: ['需要技术能力'], commercial_license: '可免费商用' },

  // ========== 数字人 ==========
  { name: 'HeyGen', logo: 'https://www.heygen.com/favicon.ico', producer: 'HeyGen', highlight: '顶级AI数字人平台', category: '数字人', free_type: '免费额度', free_quota_desc: '$24/月起', official_url: 'https://www.heygen.com', is_featured: true, feature_tags: ['数字人口播', 'AI配音', '多语言'], advantages: ['100+数字人形象', '40+语言支持', '自定义数字人'], limitations: ['价格较高'], commercial_license: '需授权商用' },
  { name: 'Synthesia', logo: 'https://www.synthesia.io/favicon.ico', producer: 'Synthesia', highlight: '企业级数字人制作', category: '数字人', free_type: '付费工具', free_quota_desc: '$22/月起', official_url: 'https://www.synthesia.io', is_featured: true, feature_tags: ['数字人口播', '多语言', 'AI配音'], advantages: ['140+AI形象', '120+语言', 'PPT转视频'], limitations: ['企业定价'], commercial_license: '需授权商用' },
  { name: 'D-ID', logo: 'https://www.d-id.com/favicon.ico', producer: 'D-ID', highlight: '照片转数字人视频', category: '数字人', free_type: '免费额度', free_quota_desc: '$5.9/月起', official_url: 'https://www.d-id.com', is_featured: false, feature_tags: ['数字人口播', 'AI配音'], advantages: ['照片驱动说话', '实时口型同步', 'API接口'], limitations: ['形象有限'], commercial_license: '需授权商用' },
  { name: '腾讯智影', logo: 'https://zenvideo.qq.com/favicon.ico', producer: '腾讯', highlight: '腾讯AI视频创作', category: '数字人', free_type: '免费额度', free_quota_desc: '会员$9.9/月', official_url: 'https://zenvideo.qq.com', is_featured: true, feature_tags: ['数字人口播', '支持中文', '视频编辑'], advantages: ['多种数字人', '智能配音', '模板丰富'], limitations: ['中文为主'], commercial_license: '需授权商用' },
  { name: '小冰数字人', logo: 'https://www.xiaoice.com/favicon.ico', producer: '小冰公司', highlight: '超拟真AI数字人', category: '数字人', free_type: '付费工具', free_quota_desc: '联系客服', official_url: 'https://www.xiaoice.com', is_featured: false, feature_tags: ['数字人口播', '支持中文', 'AI配音'], advantages: ['超逼真形象', '情感交互', '企业定制'], limitations: ['需要联系销售'], commercial_license: '需授权商用' },

  // ========== 视频编辑 ==========
  { name: '剪映专业版', logo: 'https://lv.ulikecam.com/favicon.ico', producer: '字节跳动', highlight: '最强免费视频编辑', category: '视频编辑', free_type: '完全免费', free_quota_desc: '完全免费', official_url: 'https://lv.ulikecam.com', is_featured: true, feature_tags: ['视频编辑', 'AI配音', '支持中文'], advantages: ['AI智能剪辑', '一键成片', '海量素材'], limitations: ['导出格式有限'], commercial_license: '可免费商用' },
  { name: 'CapCut', logo: 'https://www.capcut.com/favicon.ico', producer: '字节跳动', highlight: '全球流行视频编辑', category: '视频编辑', free_type: '免费额度', free_quota_desc: 'Pro$7.99/月', official_url: 'https://www.capcut.com', is_featured: true, feature_tags: ['视频编辑', 'AI配音', '去水印'], advantages: ['AI背景移除', '自动字幕', '模板社区'], limitations: ['Pro版功能付费'], commercial_license: '需授权商用' },
  { name: 'Runway ML', logo: 'https://runwayml.com/favicon.ico', producer: 'Runway', highlight: 'AI视频编辑套件', category: '视频编辑', free_type: '免费额度', free_quota_desc: '$15/月起', official_url: 'https://runwayml.com', is_featured: true, feature_tags: ['视频编辑', '去水印', '4K分辨率'], advantages: ['绿幕抠像', '运动跟踪', '视频修复'], limitations: ['学习曲线较陡'], commercial_license: '需授权商用' },
  { name: 'Descript', logo: 'https://www.descript.com/favicon.ico', producer: 'Descript', highlight: 'AI音视频编辑', category: '视频编辑', free_type: '免费额度', free_quota_desc: '$12/月起', official_url: 'https://www.descript.com', is_featured: false, feature_tags: ['视频编辑', 'AI配音', '多语言'], advantages: ['文字编辑视频', 'AI声音克隆', '自动转录'], limitations: ['功能相对单一'], commercial_license: '需授权商用' },
  { name: 'Veed.io', logo: 'https://www.veed.io/favicon.ico', producer: 'Veed', highlight: '在线视频编辑平台', category: '视频编辑', free_type: '免费额度', free_quota_desc: '$12/月起', official_url: 'https://www.veed.io', is_featured: false, feature_tags: ['视频编辑', 'AI配音', '多语言'], advantages: ['自动字幕', '屏幕录制', '模板库'], limitations: ['免费版水印'], commercial_license: '需授权商用' },

  // ========== AI绘画 ==========
  { name: 'Midjourney', logo: 'https://www.midjourney.com/favicon.ico', producer: 'Midjourney', highlight: '顶级AI绘画工具', category: 'AI绘画', free_type: '付费工具', free_quota_desc: '$10/月起', official_url: 'https://www.midjourney.com', is_featured: true, feature_tags: ['图片生成', '艺术创作', '多风格'], advantages: ['电影级画质', '风格丰富', '社区活跃'], limitations: ['需要Discord'], commercial_license: '需授权商用' },
  { name: 'DALL·E 3', logo: 'https://openai.com/favicon.ico', producer: 'OpenAI', highlight: 'OpenAI图像生成', category: 'AI绘画', free_type: '付费工具', free_quota_desc: '$20/月起', official_url: 'https://openai.com/dall-e-3', is_featured: true, feature_tags: ['图片生成', '艺术创作', 'GPT-4'], advantages: ['精准理解提示词', '文字渲染能力', 'ChatGPT集成'], limitations: ['需要订阅'], commercial_license: '需授权商用' },
  { name: 'Stable Diffusion', logo: 'https://stability.ai/favicon.ico', producer: 'Stability AI', highlight: '开源AI绘画模型', category: 'AI绘画', free_type: '完全免费', free_quota_desc: '完全免费', official_url: 'https://stability.ai', is_featured: true, feature_tags: ['图片生成', '开源免费', '艺术创作'], advantages: ['完全开源', '可本地部署', '模型生态丰富'], limitations: ['需要技术能力'], commercial_license: '可免费商用' },
  { name: 'Leonardo.AI', logo: 'https://leonardo.ai/favicon.ico', producer: 'Leonardo', highlight: 'AI图像生成与编辑', category: 'AI绘画', free_type: '免费额度', free_quota_desc: '$12/月起', official_url: 'https://leonardo.ai', is_featured: true, feature_tags: ['图片生成', '艺术创作', '视频编辑'], advantages: ['游戏资产生成', '模型训练', '免费额度充足'], limitations: ['排队时间'], commercial_license: '需授权商用' },
  { name: 'Canva AI', logo: 'https://www.canva.com/favicon.ico', producer: 'Canva', highlight: 'AI设计平台', category: 'AI绘画', free_type: '免费额度', free_quota_desc: 'Pro$12.99/月', official_url: 'https://www.canva.com', is_featured: true, feature_tags: ['图片生成', '艺术创作', '多语言'], advantages: ['AI图片生成', '魔法编辑', '海量模板'], limitations: ['Pro版付费'], commercial_license: '需授权商用' },
  { name: '即梦AI绘画', logo: 'https://jimeng.jianying.com/favicon.ico', producer: '字节跳动', highlight: '字节AI绘画平台', category: 'AI绘画', free_type: '免费额度', free_quota_desc: '会员$6.9/月', official_url: 'https://jimeng.jianying.com', is_featured: true, feature_tags: ['图片生成', '支持中文', '艺术创作'], advantages: ['中文理解优秀', '中国风模板', '一键生成'], limitations: ['风格相对有限'], commercial_license: '需授权商用' },
  { name: '通义万相', logo: 'https://tongyi.aliyun.com/favicon.ico', producer: '阿里云', highlight: '阿里AI图像生成', category: 'AI绘画', free_type: '免费额度', free_quota_desc: '按量付费', official_url: 'https://tongyi.aliyun.com/wanxiang', is_featured: false, feature_tags: ['图片生成', '支持中文', '艺术创作'], advantages: ['中文优化', '企业级服务', 'API接口'], limitations: ['需要阿里云账号'], commercial_license: '需授权商用' },
  { name: '文心一格', logo: 'https://yige.baidu.com/favicon.ico', producer: '百度', highlight: '百度AI绘画平台', category: 'AI绘画', free_type: '免费额度', free_quota_desc: '按量付费', official_url: 'https://yige.baidu.com', is_featured: false, feature_tags: ['图片生成', '支持中文', '艺术创作'], advantages: ['中文理解', '国风特色', '多种风格'], limitations: ['生成速度一般'], commercial_license: '需授权商用' },

  // ========== AI聊天 ==========
  { name: 'ChatGPT', logo: 'https://chat.openai.com/favicon.ico', producer: 'OpenAI', highlight: '最强AI对话助手', category: 'AI聊天', free_type: '免费额度', free_quota_desc: 'Plus $20/月', official_url: 'https://chat.openai.com', is_featured: true, feature_tags: ['AI对话', 'GPT-4', '多语言'], advantages: ['GPT-4模型', '联网搜索', '文件分析'], limitations: ['Plus版付费'], commercial_license: '需授权商用' },
  { name: 'Claude', logo: 'https://claude.ai/favicon.ico', producer: 'Anthropic', highlight: '安全可靠AI助手', category: 'AI聊天', free_type: '免费额度', free_quota_desc: 'Pro $20/月', official_url: 'https://claude.ai', is_featured: true, feature_tags: ['AI对话', '多语言', '代码补全'], advantages: ['200K上下文', '推理能力强', '安全可靠'], limitations: ['Pro版付费'], commercial_license: '需授权商用' },
  { name: 'Kimi', logo: 'https://kimi.moonshot.cn/favicon.ico', producer: '月之暗面', highlight: '超长文本AI助手', category: 'AI聊天', free_type: '完全免费', free_quota_desc: '完全免费', official_url: 'https://kimi.moonshot.cn', is_featured: true, feature_tags: ['AI对话', '支持中文', '多语言'], advantages: ['200万字上下文', '文件分析', '联网搜索'], limitations: ['高峰期排队'], commercial_license: '可免费商用' },
  { name: '豆包', logo: 'https://www.doubao.com/favicon.ico', producer: '字节跳动', highlight: '字节跳动AI助手', category: 'AI聊天', free_type: '完全免费', free_quota_desc: '完全免费', official_url: 'https://www.doubao.com', is_featured: true, feature_tags: ['AI对话', '支持中文', '多语言'], advantages: ['完全免费', '中文优秀', '多场景应用'], limitations: ['功能相对基础'], commercial_license: '可免费商用' },
  { name: 'Gemini', logo: 'https://gemini.google.com/favicon.ico', producer: 'Google', highlight: 'Google多模态AI', category: 'AI聊天', free_type: '免费额度', free_quota_desc: 'Advanced $19.99/月', official_url: 'https://gemini.google.com', is_featured: true, feature_tags: ['AI对话', 'GPT-4', '多语言'], advantages: ['多模态理解', 'Google生态', '实时信息'], limitations: ['部分地区不可用'], commercial_license: '需授权商用' },
  { name: '通义千问', logo: 'https://tongyi.aliyun.com/favicon.ico', producer: '阿里云', highlight: '阿里云AI对话平台', category: 'AI聊天', free_type: '免费额度', free_quota_desc: 'Plus $9.9/月', official_url: 'https://tongyi.aliyun.com/qianwen', is_featured: true, feature_tags: ['AI对话', '支持中文', '多语言'], advantages: ['中文能力强', '多模态', '企业服务'], limitations: ['需要阿里云账号'], commercial_license: '需授权商用' },
  { name: '文心一言', logo: 'https://yiyan.baidu.com/favicon.ico', producer: '百度', highlight: '百度AI对话平台', category: 'AI聊天', free_type: '免费额度', free_quota_desc: 'Pro $9.9/月', official_url: 'https://yiyan.baidu.com', is_featured: false, feature_tags: ['AI对话', '支持中文', '多语言'], advantages: ['中文优化', '知识图谱', '百度生态'], limitations: ['功能相对基础'], commercial_license: '需授权商用' },
  { name: '智谱清言', logo: 'https://chatglm.cn/favicon.ico', producer: '智谱AI', highlight: '国产大语言模型', category: 'AI聊天', free_type: '免费额度', free_quota_desc: 'Plus $9.9/月', official_url: 'https://chatglm.cn', is_featured: false, feature_tags: ['AI对话', '支持中文', '代码补全'], advantages: ['GLM-4模型', '代码能力强', '免费额度'], limitations: ['知名度较低'], commercial_license: '需授权商用' },

  // ========== AI配音 ==========
  { name: 'ElevenLabs', logo: 'https://elevenlabs.io/favicon.ico', producer: 'ElevenLabs', highlight: '顶级AI语音合成', category: 'AI配音', free_type: '免费额度', free_quota_desc: '$5/月起', official_url: 'https://elevenlabs.io', is_featured: true, feature_tags: ['AI配音', '多语言', '声音克隆'], advantages: ['超逼真语音', '29种语言', '声音克隆'], limitations: ['价格较高'], commercial_license: '需授权商用' },
  { name: '讯飞配音', logo: 'https://peiyin.xunfei.cn/favicon.ico', producer: '科大讯飞', highlight: '中文AI配音首选', category: 'AI配音', free_type: '免费额度', free_quota_desc: '会员$3.9/月', official_url: 'https://peiyin.xunfei.cn', is_featured: true, feature_tags: ['AI配音', '支持中文', '多语言'], advantages: ['中文语音领先', '多种音色', '情感表达'], limitations: ['中文为主'], commercial_license: '需授权商用' },
  { name: 'Azure TTS', logo: 'https://azure.microsoft.com/favicon.ico', producer: 'Microsoft', highlight: '微软Azure语音服务', category: 'AI配音', free_type: '免费额度', free_quota_desc: '按量付费', official_url: 'https://azure.microsoft.com/services/cognitive-services/text-to-speech', is_featured: false, feature_tags: ['AI配音', '多语言', '支持中文'], advantages: ['神经网络语音', 'SSML支持', '多语言'], limitations: ['需要Azure账号'], commercial_license: '需授权商用' },
  { name: 'Murf AI', logo: 'https://murf.ai/favicon.ico', producer: 'Murf', highlight: '专业AI配音工具', category: 'AI配音', free_type: '免费额度', free_quota_desc: '$19/月起', official_url: 'https://murf.ai', is_featured: false, feature_tags: ['AI配音', '多语言', '声音克隆'], advantages: ['120+声音', '20+语言', '声音定制'], limitations: ['价格较高'], commercial_license: '需授权商用' },

  // ========== AI写作 ==========
  { name: 'Notion AI', logo: 'https://www.notion.so/favicon.ico', producer: 'Notion', highlight: '笔记协作AI助手', category: 'AI写作', free_type: '免费额度', free_quota_desc: 'Plus $10/月', official_url: 'https://www.notion.so/product/ai', is_featured: true, feature_tags: ['AI对话', '多语言', '营销文案'], advantages: ['智能写作', '文档摘要', '翻译润色'], limitations: ['需要Notion订阅'], commercial_license: '需授权商用' },
  { name: 'Jasper', logo: 'https://www.jasper.ai/favicon.ico', producer: 'Jasper', highlight: '营销文案AI平台', category: 'AI写作', free_type: '付费工具', free_quota_desc: '$49/月起', official_url: 'https://www.jasper.ai', is_featured: true, feature_tags: ['营销文案', '多语言', 'AI对话'], advantages: ['营销模板', '品牌声音', 'SEO优化'], limitations: ['价格较高'], commercial_license: '需授权商用' },
  { name: 'Copy.ai', logo: 'https://www.copy.ai/favicon.ico', producer: 'Copy.ai', highlight: 'AI文案生成工具', category: 'AI写作', free_type: '免费额度', free_quota_desc: 'Pro $36/月', official_url: 'https://www.copy.ai', is_featured: false, feature_tags: ['营销文案', '多语言', 'AI对话'], advantages: ['多种模板', '快速生成', '免费版可用'], limitations: ['功能相对基础'], commercial_license: '需授权商用' },
  { name: '秘塔写作猫', logo: 'https://xiezuocat.com/favicon.ico', producer: '秘塔科技', highlight: '中文AI写作助手', category: 'AI写作', free_type: '免费额度', free_quota_desc: '会员$9.9/月', official_url: 'https://xiezuocat.com', is_featured: true, feature_tags: ['AI对话', '支持中文', '多语言'], advantages: ['中文优化', '语法纠错', '润色改写'], limitations: ['中文为主'], commercial_license: '需授权商用' },
  { name: 'DeepL', logo: 'https://www.deepl.com/favicon.ico', producer: 'DeepL', highlight: '最准AI翻译工具', category: 'AI写作', free_type: '免费额度', free_quota_desc: 'Pro $10.49/月', official_url: 'https://www.deepl.com', is_featured: true, feature_tags: ['多语言', '支持中文', 'AI对话'], advantages: ['翻译最准确', '支持31种语言', '文档翻译'], limitations: ['免费版限制'], commercial_license: '需授权商用' },
  { name: '科大讯飞翻译', logo: 'https://fanyi.xunfei.cn/favicon.ico', producer: '科大讯飞', highlight: '国产AI翻译平台', category: 'AI写作', free_type: '免费额度', free_quota_desc: '按量付费', official_url: 'https://fanyi.xunfei.cn', is_featured: false, feature_tags: ['多语言', '支持中文', 'AI对话'], advantages: ['中文优化', '多语种', '文档翻译'], limitations: ['需要讯飞账号'], commercial_license: '需授权商用' },

  // ========== AI编程 ==========
  { name: 'GitHub Copilot', logo: 'https://github.com/favicon.ico', producer: 'GitHub/Microsoft', highlight: '最强AI编程助手', category: 'AI编程', free_type: '付费工具', free_quota_desc: '$10/月', official_url: 'https://github.com/features/copilot', is_featured: true, feature_tags: ['代码补全', '多语言', 'AI对话'], advantages: ['主流IDE支持', '多语言', '上下文理解'], limitations: ['需要订阅'], commercial_license: '需授权商用' },
  { name: 'Cursor', logo: 'https://cursor.sh/favicon.ico', producer: 'Cursor', highlight: 'AI原生代码编辑器', category: 'AI编程', free_type: '免费额度', free_quota_desc: 'Pro $20/月', official_url: 'https://cursor.sh', is_featured: true, feature_tags: ['代码补全', '多语言', 'AI对话'], advantages: ['AI原生设计', '多模型选择', '代码重构'], limitations: ['学习曲线'], commercial_license: '需授权商用' },
  { name: '通义灵码', logo: 'https://tongyi.aliyun.com/favicon.ico', producer: '阿里云', highlight: '阿里AI编程助手', category: 'AI编程', free_type: '完全免费', free_quota_desc: '完全免费', official_url: 'https://tongyi.aliyun.com/lingma', is_featured: true, feature_tags: ['代码补全', '支持中文', '多语言'], advantages: ['完全免费', '中文支持', '多语言'], limitations: ['功能相对基础'], commercial_license: '可免费商用' },
  { name: 'CodeGeeX', logo: 'https://codegeex.cn/favicon.ico', producer: '智谱AI', highlight: '国产AI编程助手', category: 'AI编程', free_type: '完全免费', free_quota_desc: '完全免费', official_url: 'https://codegeex.cn', is_featured: false, feature_tags: ['代码补全', '支持中文', '开源免费'], advantages: ['完全免费', '中文优化', '多语言'], limitations: ['知名度较低'], commercial_license: '可免费商用' },

  // ========== AI音频 ==========
  { name: 'Suno', logo: 'https://suno.ai/favicon.ico', producer: 'Suno', highlight: 'AI音乐生成神器', category: 'AI音频', free_type: '免费额度', free_quota_desc: 'Pro $10/月', official_url: 'https://suno.ai', is_featured: true, feature_tags: ['音乐生成', '多语言', 'AI配音'], advantages: ['完整歌曲生成', '人声演唱', '多种风格'], limitations: ['免费额度有限'], commercial_license: '需授权商用' },
  { name: 'Udio', logo: 'https://www.udio.com/favicon.ico', producer: 'Udio', highlight: '高质量AI音乐生成', category: 'AI音频', free_type: '免费额度', free_quota_desc: 'Pro $10/月', official_url: 'https://www.udio.com', is_featured: true, feature_tags: ['音乐生成', '多语言', 'AI配音'], advantages: ['高音质输出', '多种风格', '人声生成'], limitations: ['免费额度有限'], commercial_license: '需授权商用' },
  { name: 'Mubert', logo: 'https://mubert.com/favicon.ico', producer: 'Mubert', highlight: 'AI背景音乐生成', category: 'AI音频', free_type: '免费额度', free_quota_desc: '$14/月', official_url: 'https://mubert.com', is_featured: false, feature_tags: ['音乐生成', '多语言', 'AI配音'], advantages: ['商用授权', '多场景模板', 'API接口'], limitations: ['风格相对有限'], commercial_license: '可免费商用' },
  { name: '网易天音', logo: 'https://tianyin.163.com/favicon.ico', producer: '网易', highlight: '网易AI音乐创作', category: 'AI音频', free_type: '免费额度', free_quota_desc: '会员$9.9/月', official_url: 'https://tianyin.163.com', is_featured: false, feature_tags: ['音乐生成', '支持中文', 'AI配音'], advantages: ['中文歌曲', '多种风格', '编曲工具'], limitations: ['中文为主'], commercial_license: '需授权商用' },

  // ========== AI办公 ==========
  { name: 'Gamma', logo: 'https://gamma.app/favicon.ico', producer: 'Gamma', highlight: 'AI演示文稿生成', category: 'AI办公', free_type: '免费额度', free_quota_desc: 'Pro $10/月', official_url: 'https://gamma.app', is_featured: true, feature_tags: ['PPT生成', '多语言', 'AI对话'], advantages: ['一键生成PPT', '精美模板', 'AI设计'], limitations: ['免费版限制'], commercial_license: '需授权商用' },
  { name: '飞书妙记', logo: 'https://www.feishu.cn/favicon.ico', producer: '字节跳动', highlight: '会议智能记录助手', category: 'AI办公', free_type: '免费额度', free_quota_desc: '企业版按需', official_url: 'https://www.feishu.cn/product/minutes', is_featured: true, feature_tags: ['会议记录', '支持中文', '多语言'], advantages: ['实时转录', '智能摘要', '多语言支持'], limitations: ['需要飞书账号'], commercial_license: '需授权商用' },
  { name: 'Beautiful.ai', logo: 'https://www.beautiful.ai/favicon.ico', producer: 'Beautiful.ai', highlight: '智能演示文稿设计', category: 'AI办公', free_type: '付费工具', free_quota_desc: '$12/月', official_url: 'https://www.beautiful.ai', is_featured: false, feature_tags: ['PPT生成', '多语言', 'AI对话'], advantages: ['智能布局', '企业模板', '团队协作'], limitations: ['需要订阅'], commercial_license: '需授权商用' },
  { name: '通义听悟', logo: 'https://tingwu.aliyun.com/favicon.ico', producer: '阿里云', highlight: '阿里会议转录助手', category: 'AI办公', free_type: '免费额度', free_quota_desc: '按量付费', official_url: 'https://tingwu.aliyun.com', is_featured: false, feature_tags: ['会议记录', '支持中文', '多语言'], advantages: ['高精度转录', '智能摘要', 'API接口'], limitations: ['需要阿里云账号'], commercial_license: '需授权商用' },

  // ========== AI搜索 ==========
  { name: 'Perplexity', logo: 'https://www.perplexity.ai/favicon.ico', producer: 'Perplexity', highlight: 'AI问答搜索引擎', category: 'AI搜索', free_type: '免费额度', free_quota_desc: 'Pro $20/月', official_url: 'https://www.perplexity.ai', is_featured: true, feature_tags: ['AI搜索', '多语言', 'AI对话'], advantages: ['实时联网', '来源引用', '深度追问'], limitations: ['Pro版付费'], commercial_license: '需授权商用' },
  { name: '秘塔AI搜索', logo: 'https://metaso.cn/favicon.ico', producer: '秘塔科技', highlight: '无广告AI搜索', category: 'AI搜索', free_type: '完全免费', free_quota_desc: '完全免费', official_url: 'https://metaso.cn', is_featured: true, feature_tags: ['AI搜索', '支持中文', '多语言'], advantages: ['无广告干扰', '深度搜索', '结构化答案'], limitations: ['中文为主'], commercial_license: '可免费商用' },
  { name: '天工AI搜索', logo: 'https://www.tiangong.cn/favicon.ico', producer: '昆仑万维', highlight: '国产AI搜索引擎', category: 'AI搜索', free_type: '完全免费', free_quota_desc: '完全免费', official_url: 'https://www.tiangong.cn', is_featured: false, feature_tags: ['AI搜索', '支持中文', '多语言'], advantages: ['中文优化', '完全免费', '多模态'], limitations: ['知名度较低'], commercial_license: '可免费商用' },

  // ========== AI营销 ==========
  { name: 'Jasper Marketing', logo: 'https://www.jasper.ai/favicon.ico', producer: 'Jasper', highlight: 'AI营销内容平台', category: 'AI营销', free_type: '付费工具', free_quota_desc: '$49/月起', official_url: 'https://www.jasper.ai', is_featured: true, feature_tags: ['营销文案', '多语言', 'AI对话'], advantages: ['营销模板库', 'SEO工具', '品牌声音'], limitations: ['价格较高'], commercial_license: '需授权商用' },
  { name: 'Copy.ai Marketing', logo: 'https://www.copy.ai/favicon.ico', producer: 'Copy.ai', highlight: '营销文案AI生成', category: 'AI营销', free_type: '免费额度', free_quota_desc: 'Pro $36/月', official_url: 'https://www.copy.ai', is_featured: false, feature_tags: ['营销文案', '多语言', 'AI对话'], advantages: ['多种模板', '快速生成', '免费版可用'], limitations: ['功能相对基础'], commercial_license: '需授权商用' },
  { name: 'Writesonic', logo: 'https://writesonic.com/favicon.ico', producer: 'Writesonic', highlight: 'AI内容营销平台', category: 'AI营销', free_type: '免费额度', free_quota_desc: '$13/月起', official_url: 'https://writesonic.com', is_featured: false, feature_tags: ['营销文案', '多语言', 'AI对话'], advantages: ['SEO优化', '博客生成', '多语言'], limitations: ['免费版限制'], commercial_license: '需授权商用' },

  // ========== AI学习 ==========
  { name: 'Duolingo', logo: 'https://www.duolingo.com/favicon.ico', producer: 'Duolingo', highlight: 'AI语言学习平台', category: 'AI学习', free_type: '免费额度', free_quota_desc: 'Super $6.99/月', official_url: 'https://www.duolingo.com', is_featured: true, feature_tags: ['语言学习', '多语言', 'AI对话'], advantages: ['游戏化学习', 'AI对话', '多种语言'], limitations: ['Super版付费'], commercial_license: '需授权商用' },
  { name: 'Speak', logo: 'https://www.speak.com/favicon.ico', producer: 'Speak', highlight: 'AI英语口语练习', category: 'AI学习', free_type: '免费额度', free_quota_desc: '$19.99/月', official_url: 'https://www.speak.com', is_featured: false, feature_tags: ['语言学习', 'AI配音', 'AI对话'], advantages: ['AI口语对话', '发音纠正', '个性化学习'], limitations: ['仅英语'], commercial_license: '需授权商用' },
  { name: 'Quizlet', logo: 'https://quizlet.com/favicon.ico', producer: 'Quizlet', highlight: 'AI智能学习卡片', category: 'AI学习', free_type: '免费额度', free_quota_desc: 'Plus $35.99/年', official_url: 'https://quizlet.com', is_featured: false, feature_tags: ['语言学习', '多语言', 'AI对话'], advantages: ['AI生成卡片', '智能复习', '多种模式'], limitations: ['Plus版付费'], commercial_license: '需授权商用' },

  // ========== 动漫创作 ==========
  { name: 'Comic AI', logo: 'https://comicai.ai/favicon.ico', producer: 'Comic AI', highlight: 'AI漫画创作平台', category: '动漫创作', free_type: '免费额度', free_quota_desc: '$9.9/月', official_url: 'https://comicai.ai', is_featured: false, feature_tags: ['图片生成', '支持中文', '艺术创作'], advantages: ['一键生成漫画', '多种画风', '角色一致性'], limitations: ['功能相对小众'], commercial_license: '需授权商用' },
  { name: '巨日禄', logo: 'https://jurilu.paluai.com/favicon.ico', producer: '巨日禄', highlight: 'AI动漫视频生成', category: '动漫创作', free_type: '免费额度', free_quota_desc: '会员$5.9/月', official_url: 'https://jurilu.paluai.com', is_featured: false, feature_tags: ['文生视频', '支持中文', '长视频生成'], advantages: ['动漫角色生成', '场景动画', '配音字幕'], limitations: ['知名度较低'], commercial_license: '需授权商用' },
];

// Prompt模板数据
const PROMPTS = [
  { title: '电影级风景镜头', content: 'A breathtaking cinematic aerial shot of [SUBJECT], golden hour lighting, dramatic clouds, 8K resolution, photorealistic, smooth camera movement, professional cinematography, epic scale, volumetric fog', category: '场景描述', tags: ['风景', '电影感', '航拍'] },
  { title: '产品展示视频', content: 'Product showcase video of [PRODUCT], clean white background, soft studio lighting, 360 degree rotation, professional commercial style, high-end product photography, smooth motion, subtle reflections', category: '场景描述', tags: ['产品', '商业', '展示'] },
  { title: '科幻城市夜景', content: 'Futuristic cyberpunk cityscape at night, neon lights reflecting on wet streets, flying vehicles, holographic advertisements, Blade Runner aesthetic, cinematic wide shot, 8K quality, atmospheric fog', category: '场景描述', tags: ['科幻', '城市', '赛博朋克'] },
  { title: '自然纪录片风格', content: 'Nature documentary style footage of [ANIMAL/SCENE], close-up slow motion, shallow depth of field, golden hour, National Geographic quality, detailed textures, natural habitat, cinematic composition', category: '场景描述', tags: ['自然', '纪录片', '动物'] },
  { title: '美食视频拍摄', content: 'Delicious [FOOD] food videography, steam rising, close-up macro shot, warm lighting, professional food styling, appetizing presentation, shallow depth of field, slow motion pour, restaurant quality', category: '场景描述', tags: ['美食', '商业', '近景'] },
  { title: '古风仙侠场景', content: 'Ancient Chinese fantasy landscape, misty mountains, traditional pavilions, flying cranes, ethereal atmosphere, wuxia style, soft pastel colors, cinematic wide shot, dreamlike quality, 4K resolution', category: '场景描述', tags: ['古风', '仙侠', '中国风'] },
  { title: '科技产品发布', content: 'Tech product reveal video, sleek [DEVICE] emerging from darkness, particle effects, futuristic interface animations, Apple-style presentation, premium feel, dramatic lighting, clean minimal design', category: '场景描述', tags: ['科技', '产品', '发布'] },
  { title: '城市延时摄影', content: 'Urban timelapse from day to night, city skyline transformation, moving clouds, traffic lights trails, busy streets, architectural details, smooth transitions, professional timelapse photography', category: '场景描述', tags: ['城市', '延时', '风景'] },
  { title: '太空宇宙场景', content: 'Space cosmic scene, planets and nebulae, stars backdrop, cinematic quality, NASA inspired, vast universe, dramatic lighting, sci-fi aesthetic, epic scale, astronomical accuracy', category: '场景描述', tags: ['太空', '宇宙', '科幻'] },
  { title: '二次元少女', content: 'Anime style girl with [HAIR_COLOR] hair, [EYE_COLOR] eyes, wearing [OUTFIT], cherry blossoms background, soft lighting, Studio Ghibli inspired, detailed illustration, kawaii aesthetic, pastel colors', category: '角色扮演', tags: ['二次元', '少女', '动漫'] },
  { title: '写实人物肖像', content: 'Photorealistic portrait of a [AGE] year old [GENDER] with [FEATURES], natural lighting, shallow depth of field, professional headshot, detailed skin texture, expressive eyes, cinematic color grading', category: '角色扮演', tags: ['肖像', '写实', '人物'] },
  { title: '奇幻角色设计', content: 'Fantasy character design, [RACE/TYPE] warrior with [WEAPONS], intricate armor details, magical aura, dramatic pose, concept art style, detailed background, epic lighting, ArtStation quality', category: '角色扮演', tags: ['奇幻', '游戏', '设计'] },
  { title: '职业形象照', content: 'Professional [JOB_TITLE] in modern office environment, confident expression, business attire, soft natural lighting from window, corporate headshot style, clean background, approachable yet professional', category: '角色扮演', tags: ['职业', '商务', '肖像'] },
  { title: '动漫角色战斗', content: 'Anime character dynamic battle pose, action scene, energy effects, dramatic speed lines, intense expression, manga style, dynamic composition, vibrant colors, epic moment capture', category: '角色扮演', tags: ['动漫', '战斗', '动感'] },
  { title: '复古电影风格', content: 'Vintage film look, [SUBJECT] in 1970s style, film grain, warm color palette, soft focus edges, retro aesthetic, Kodak Portra 400 colors, nostalgic atmosphere, classic cinema composition', category: '风格迁移', tags: ['复古', '电影', '胶片'] },
  { title: '赛博朋克风格', content: 'Cyberpunk transformation, [SUBJECT] with neon accents, glitch effects, holographic elements, purple and cyan color scheme, futuristic overlay, tech aesthetics, digital distortion, high contrast', category: '风格迁移', tags: ['赛博朋克', '科技', '未来'] },
  { title: '水墨画风格', content: 'Traditional Chinese ink wash painting style, [SUBJECT], elegant brush strokes, minimal composition, zen aesthetic, black and white with subtle color accents, artistic, cultural heritage feel', category: '风格迁移', tags: ['水墨', '中国风', '艺术'] },
  { title: '油画艺术风格', content: 'Oil painting style, [SUBJECT] in impressionist manner, visible brushstrokes, rich textures, classical art composition, museum masterpiece quality, warm tones, artistic interpretation', category: '风格迁移', tags: ['油画', '艺术', '印象派'] },
  { title: '像素艺术风格', content: 'Pixel art style, [SUBJECT] in 16-bit retro game aesthetic, vibrant limited color palette, nostalgic 90s gaming feel, clean pixel work, sprite animation style, charming simplicity', category: '风格迁移', tags: ['像素', '复古', '游戏'] },
  { title: '动漫渲染风格', content: 'Anime 3D render style, [SUBJECT], cel-shaded, vibrant colors, clean outlines, anime aesthetic, smooth gradients, Ghibli-inspired, expressive, professional animation quality', category: '风格迁移', tags: ['动漫', '渲染', '3D'] },
  { title: '爆炸特效', content: 'Cinematic explosion effect, debris and particles, fire and smoke, slow motion capture, realistic physics, dramatic lighting, Hollywood VFX quality, volumetric smoke, detailed destruction', category: '特效制作', tags: ['爆炸', '特效', '电影'] },
  { title: '魔法粒子效果', content: 'Magical particle effects, glowing sparkles, ethereal energy swirl, fantasy magic casting, mystical aura, rainbow colored particles, slow motion flow, dreamlike atmosphere, high quality VFX', category: '特效制作', tags: ['魔法', '粒子', '奇幻'] },
  { title: '火焰特效', content: 'Realistic fire effects, roaring flames, heat distortion, dynamic movement, realistic smoke, orange and blue color palette, cinematic quality, volumetric fire, natural combustion physics', category: '特效制作', tags: ['火焰', '特效', '写实'] },
  { title: '闪电风暴效果', content: 'Dramatic lightning storm, electric bolts across sky, dark clouds, bright flashes, cinematic weather, powerful energy, realistic lightning physics, ominous atmosphere, high contrast', category: '特效制作', tags: ['闪电', '风暴', '天气'] },
  { title: '数字人主播开场', content: 'Professional AI anchor greeting: Hello everyone, welcome to today\'s program. I\'m your AI host, bringing you the latest [TOPIC] content. Let\'s dive in and explore together!', category: '场景描述', tags: ['数字人', '主播', '开场'] },
  { title: '电商带货口播', content: '电商带货文案：大家好！今天给大家推荐这款[产品名]，它有[特点1]、[特点2]、[特点3]三大亮点。现在下单还有优惠，赶紧点击链接购买吧！', category: '场景描述', tags: ['电商', '带货', '口播'] },
  { title: '知识科普解说', content: '知识科普文案：今天我们来了解[TOPIC]。首先，让我们看看它的基本原理...[详细解释]...通过这个例子，相信大家对[TOPIC]有了更深入的理解。欢迎点赞关注！', category: '场景描述', tags: ['知识', '科普', '教育'] },
  { title: '品牌故事叙述', content: '品牌故事文案：从一个简单的想法开始，[品牌名]一直致力于[使命]。经过[时间]的发展，我们已经[成就]。未来，我们将继续[愿景]。感谢一路有您。', category: '场景描述', tags: ['品牌', '故事', '企业'] },
  { title: 'Vlog生活记录', content: 'Vlog文案：今天是美好的一天！早上[活动]，中午[活动]，下午[活动]。生活就是要这样充满仪式感，希望你们也过得开心！记得点赞关注哦～', category: '场景描述', tags: ['Vlog', '生活', '记录'] },
  { title: '产品旋转展示', content: '360 degree product rotation, [PRODUCT] on turntable, smooth continuous motion, studio lighting, clean background, professional commercial style, detailed texture showcase, premium presentation', category: '场景描述', tags: ['产品', '展示', '商业'] },
];

// 教程数据
const TUTORIALS = [
  { title: 'Sora入门指南：如何生成高质量AI视频', content: '## 什么是Sora？\n\nSora是OpenAI推出的革命性AI视频生成工具，可以根据文字描述生成长达60秒的高质量视频。\n\n## 快速上手\n\n### 1. 访问Sora\n访问 OpenAI官网，登录ChatGPT Plus账户。\n\n### 2. 编写提示词\n好的提示词是生成优质视频的关键：\n- 描述具体场景和动作\n- 指定镜头运动方式\n- 说明光线和氛围\n\n### 3. 生成视频\n点击生成，等待1-2分钟即可获得视频。\n\n## 进阶技巧\n\n- 使用分号分隔不同场景\n- 添加风格关键词如"cinematic"、"8K"\n- 尝试不同的镜头术语', category: '入门教程', difficulty: '初级', is_featured: true },
  { title: '可灵AI使用教程：国产最强视频生成工具', content: '## 可灵AI简介\n\n可灵AI是快手推出的AI视频生成工具，支持最长2分钟的视频生成，是目前国内最强大的视频生成工具之一。\n\n## 注册与登录\n\n1. 访问可灵AI官网\n2. 使用手机号或微信登录\n3. 完成实名认证获得免费额度\n\n## 核心功能\n\n### 文生视频\n输入文字描述，AI自动生成对应视频。\n\n### 图生视频\n上传图片，让静态图片动起来。\n\n### 视频延长\n对已有视频进行续写延长。\n\n## 使用技巧\n\n- 中文提示词效果更好\n- 添加"4K"、"电影感"等关键词提升画质\n- 善用运动控制功能', category: '入门教程', difficulty: '初级', is_featured: true },
  { title: 'HeyGen数字人制作全攻略', content: '## HeyGen是什么？\n\nHeyGen是专业的AI数字人视频制作平台，可以创建逼真的数字人口播视频。\n\n## 快速开始\n\n### 步骤1：选择数字人\nHeyGen提供100+预制数字人形象，涵盖不同性别、年龄、种族。\n\n### 步骤2：输入文案\n在文本框输入您想让数字人说的内容，支持40+语言。\n\n### 步骤3：调整设置\n- 语速控制\n- 表情选择\n- 背景设置\n\n### 步骤4：生成视频\n点击生成，几分钟内即可获得视频。\n\n## 高级功能\n\n### 自定义数字人\n上传自己的照片，创建专属数字人形象。\n\n### 视频翻译\n一键将视频翻译成多国语言，口型自动同步。', category: '入门教程', difficulty: '中级', is_featured: true },
  { title: 'Runway Gen-3高级技巧：打造电影级视频', content: '## 前言\n\nRunway Gen-3是目前最强大的AI视频生成模型之一，本教程将深入讲解高级技巧。\n\n## 运动笔刷\n\n运动笔刷是Runway的特色功能：\n\n1. 选择画面区域\n2. 绘制运动方向\n3. 调整运动强度\n\n这样可以精确控制视频中的运动效果。\n\n## 相机运动\n\nRunway支持多种预设相机运动：\n- 推拉镜头\n- 左右平移\n- 旋转镜头\n- 摇镜头\n\n组合使用可以创造复杂的电影效果。\n\n## 风格迁移\n\n上传参考图片，让视频继承特定风格：\n- 电影风格\n- 动漫风格\n- 油画风格', category: '进阶技巧', difficulty: '高级', is_featured: false },
  { title: '剪映AI功能全解析：免费也能做出爆款', content: '## 剪映AI功能概览\n\n剪映是字节跳动推出的免费视频编辑器，内置丰富的AI功能。\n\n## 核心AI功能\n\n### 1. AI智能剪辑\n自动识别精彩片段，一键成片。\n\n### 2. AI字幕\n- 自动识别语音生成字幕\n- 支持多语言翻译\n- 字幕样式丰富\n\n### 3. AI配音\n内置多种AI声音，输入文字自动配音。\n\n### 4. AI抠图\n一键去除背景，更换视频背景。\n\n### 5. AI美颜\n智能美颜、美体功能。\n\n## 制作流程\n\n1. 导入素材\n2. 使用AI功能处理\n3. 添加特效和滤镜\n4. 导出成品', category: '入门教程', difficulty: '初级', is_featured: true },
  { title: 'AI视频制作工作流：从创意到成片', content: '## 完整工作流程\n\n本教程分享专业的AI视频制作工作流，帮助您高效产出高质量视频。\n\n## 第一步：创意策划\n\n1. 确定视频主题\n2. 撰写分镜脚本\n3. 准备提示词模板\n\n## 第二步：素材生成\n\n根据内容类型选择工具：\n- 视频素材：Sora、Runway、可灵AI\n- 数字人口播：HeyGen、D-ID\n- 配音：ElevenLabs、讯飞配音\n\n## 第三步：后期编辑\n\n使用剪映或CapCut进行：\n- 素材拼接\n- 添加转场\n- 插入字幕\n- 配乐调整\n\n## 第四步：质量优化\n\n- 画质增强（Topaz Video AI）\n- 去水印处理\n- 音频优化\n\n## 第五步：导出发布\n\n根据平台要求选择格式：\n- 抖音：9:16，1080P\n- B站：16:9，1080P或4K\n- YouTube：16:9，4K', category: '案例分享', difficulty: '中级', is_featured: true },
  { title: 'Midjourney绘画完全指南', content: '## Midjourney简介\n\nMidjourney是目前最强大的AI绘画工具之一，以其出色的艺术风格和画质著称。\n\n## 开始使用\n\n1. 加入Discord服务器\n2. 进入新手频道\n3. 使用 /imagine 命令\n\n## 提示词技巧\n\n### 基础结构\n[主体] + [风格] + [细节] + [参数]\n\n### 常用参数\n- --ar 宽高比\n- --q 质量\n- --s 风格化程度\n- --v 版本\n\n## 进阶技巧\n\n### 图片垫图\n上传图片作为参考，在提示词中引用。\n\n### 权重控制\n使用 :: 设置关键词权重。\n\n### 排除元素\n使用 --no 排除不需要的元素。', category: '入门教程', difficulty: '中级', is_featured: true },
  { title: 'ChatGPT高效使用技巧', content: '## ChatGPT简介\n\nChatGPT是OpenAI推出的AI对话助手，是目前最强大的大语言模型应用之一。\n\n## 基础使用\n\n### 提问技巧\n1. 明确具体\n2. 提供背景\n3. 指定格式\n\n### 角色扮演\n让AI扮演特定角色，获得更专业的回答。\n\n## 高级功能\n\n### 联网搜索\nPlus用户可开启联网功能，获取实时信息。\n\n### 文件分析\n上传文档，让AI分析内容。\n\n### DALL·E绘图\n在对话中直接生成图片。\n\n## 实用场景\n\n- 文案写作\n- 代码编程\n- 学习辅导\n- 翻译润色', category: '入门教程', difficulty: '初级', is_featured: true },
  { title: 'ElevenLabs配音教程：打造专业级AI语音', content: '## ElevenLabs简介\n\nElevenLabs是业界领先的AI语音合成平台，提供超逼真的语音效果。\n\n## 快速开始\n\n### 文本转语音\n1. 输入要朗读的文本\n2. 选择声音角色\n3. 调整语音参数\n4. 生成并下载\n\n## 声音库\n\nElevenLabs提供丰富的预制声音：\n- 男性/女性\n- 不同年龄段\n- 多种语言\n- 不同情感风格\n\n## 声音克隆\n\n上传您的声音样本，AI会学习并克隆您的声音：\n\n1. 录制1-2分钟清晰音频\n2. 上传到平台\n3. 等待模型训练\n4. 使用克隆声音\n\n## 最佳实践\n\n1. 分段处理长文本\n2. 使用SSML标签控制停顿\n3. 多次试听微调参数', category: '入门教程', difficulty: '中级', is_featured: false },
  { title: 'Cursor AI编程实战指南', content: '## Cursor简介\n\nCursor是一款AI原生的代码编辑器，内置强大的AI编程能力。\n\n## 安装与配置\n\n1. 下载Cursor编辑器\n2. 登录账户\n3. 选择AI模型\n\n## 核心功能\n\n### 代码补全\nAI根据上下文智能补全代码。\n\n### 代码解释\n选中代码，让AI解释功能。\n\n### 代码重构\n让AI帮你优化代码结构。\n\n### 代码生成\n描述需求，AI生成完整代码。\n\n## 快捷键\n\n- Cmd+K: 内联编辑\n- Cmd+L: 打开AI聊天\n- Cmd+I: AI建议\n\n## 最佳实践\n\n1. 提供清晰的上下文\n2. 分步骤处理复杂任务\n3. 善用代码审查功能', category: '入门教程', difficulty: '中级', is_featured: true },
];

// 一键初始化
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const results = {
      categories: 0,
      tags: 0,
      tools: 0,
      prompts: 0,
      tutorials: 0,
      errors: [] as string[],
    };

    console.log('🚀 开始初始化生产环境数据...');

    // 1. 初始化分类
    console.log('📁 初始化分类...');
    for (const cat of INIT_DATA.categories) {
      const { error } = await client
        .from('categories')
        .upsert(cat, { onConflict: 'slug' });
      if (error) {
        console.log(`  ❌ 分类 ${cat.name}: ${error.message}`);
        results.errors.push(`分类 ${cat.name}: ${error.message}`);
      } else {
        results.categories++;
      }
    }

    // 2. 初始化标签
    console.log('🏷️ 初始化标签...');
    for (const [type, tags] of Object.entries(INIT_DATA.tags)) {
      for (const name of tags) {
        const { error } = await client
          .from('tags')
          .upsert({ name, type }, { onConflict: 'name' });
        if (error) {
          console.log(`  ❌ 标签 ${name}: ${error.message}`);
        } else {
          results.tags++;
        }
      }
    }

    // 3. 获取分类ID映射
    const { data: categories, error: catError } = await client
      .from('categories')
      .select('id, name');
    
    if (catError || !categories) {
      results.errors.push(`获取分类失败: ${catError?.message}`);
      return NextResponse.json({ success: false, results, error: '获取分类失败' }, { status: 500 });
    }
    
    const categoryMap = new Map(categories.map(c => [c.name, c.id]));
    console.log('📋 分类映射:', Object.fromEntries(categoryMap));

    // 4. 初始化工具
    console.log('🔧 初始化工具...');
    let toolErrors = 0;
    for (const tool of TOOLS) {
      const categoryId = categoryMap.get(tool.category);
      if (!categoryId) {
        const errMsg = `跳过 ${tool.name}: 找不到分类 ${tool.category}`;
        console.log(`  ⚠️ ${errMsg}`);
        results.errors.push(errMsg);
        continue;
      }

      const { error } = await client.from('tools').insert({
        name: tool.name,
        logo: tool.logo,
        producer: tool.producer,
        highlight: tool.highlight.substring(0, 15),
        category_id: categoryId,
        sub_category_ids: [],
        free_type: tool.free_type,
        free_quota_desc: tool.free_quota_desc,
        feature_tags: tool.feature_tags || [],
        max_duration: '60秒',
        official_url: tool.official_url,
        promotion_url: tool.promotion_url || null,
        is_official: tool.is_official || false,
        is_featured: tool.is_featured || false,
        is_active: true,
        advantages: tool.advantages || [],
        limitations: tool.limitations || [],
        commercial_license: tool.commercial_license || '需授权商用',
        launch_date: new Date().toISOString(),
        view_count: Math.floor(Math.random() * 1000),
        click_count: Math.floor(Math.random() * 500),
      });

      if (error) {
        // 如果是重复键错误，忽略
        if (!error.message.includes('duplicate')) {
          toolErrors++;
          if (toolErrors <= 5) {
            results.errors.push(`${tool.name}: ${error.message}`);
          }
        }
      } else {
        results.tools++;
      }
    }

    // 5. 初始化Prompt模板
    console.log('📝 初始化Prompt模板...');
    for (const prompt of PROMPTS) {
      const { error } = await client.from('prompts').insert({
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags || [],
        author: 'OneClaw官方',
        uses: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 200) + 20,
        status: 'published',
      });

      if (error) {
        if (!error.message.includes('duplicate')) {
          results.errors.push(`Prompt ${prompt.title}: ${error.message}`);
        }
      } else {
        results.prompts++;
      }
    }

    // 6. 初始化教程
    console.log('📚 初始化教程...');
    for (const tutorial of TUTORIALS) {
      const { error } = await client.from('tutorials').insert({
        title: tutorial.title,
        content: tutorial.content,
        category: tutorial.category,
        difficulty: tutorial.difficulty,
        author: 'OneClaw官方',
        views: Math.floor(Math.random() * 5000) + 500,
        likes: Math.floor(Math.random() * 300) + 30,
        is_featured: tutorial.is_featured || false,
        status: 'published',
      });

      if (error) {
        if (!error.message.includes('duplicate')) {
          results.errors.push(`教程 ${tutorial.title}: ${error.message}`);
        }
      } else {
        results.tutorials++;
      }
    }

    console.log('✨ 初始化完成！', results);

    return NextResponse.json({
      success: true,
      message: '初始化完成',
      results,
    });
  } catch (error) {
    console.error('初始化失败:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}

// GET请求返回初始化状态
export async function GET() {
  try {
    const client = getSupabaseClient();

    const { count: categoryCount } = await client
      .from('categories')
      .select('*', { count: 'exact', head: true });

    const { count: tagCount } = await client
      .from('tags')
      .select('*', { count: 'exact', head: true });

    const { count: toolCount } = await client
      .from('tools')
      .select('*', { count: 'exact', head: true });

    const { count: promptCount } = await client
      .from('prompts')
      .select('*', { count: 'exact', head: true });

    const { count: tutorialCount } = await client
      .from('tutorials')
      .select('*', { count: 'exact', head: true });

    const needsInit = (categoryCount || 0) < 14 || (toolCount || 0) < 50;

    return NextResponse.json({
      success: true,
      status: {
        categories: categoryCount || 0,
        tags: tagCount || 0,
        tools: toolCount || 0,
        prompts: promptCount || 0,
        tutorials: tutorialCount || 0,
      },
      needsInit,
      message: needsInit
        ? '数据库未完全初始化，请POST请求初始化'
        : '数据库已初始化',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
