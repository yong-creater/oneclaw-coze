import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用Coze内置的环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

function getSupabaseClient() {
  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey);
  }
  return null;
}

// 30个模板数据
const TEMPLATES_DATA = [
  // ========== 小红书帖子 (xhs_post) - 3个 ==========
  {
    name: '美妆产品种草模板',
    description: '适合口红、粉底液等美妆产品的种草文案模板，包含产品特点、使用感受、推荐理由三段式结构',
    template_type: 'xhs_post',
    category: '美妆',
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    content: JSON.stringify({
      prompt: '生成一篇小红书种草文案',
      style: '真实分享',
      structure: '产品介绍-使用感受-总结推荐',
      tags: ['好物分享', '种草', '美妆']
    }),
    tags: ['美妆', '种草', '护肤'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '探店打卡模板',
    description: '适合餐厅、咖啡厅、景点等探店打卡文案，突出环境、美食、体验感受',
    template_type: 'xhs_post',
    category: '探店',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    content: JSON.stringify({
      prompt: '生成一篇探店打卡文案',
      style: '生活记录',
      structure: '店铺介绍-环境描述-推荐菜品-总结',
      tags: ['探店', '打卡', '美食']
    }),
    tags: ['探店', '打卡', '美食'],
    is_featured: false,
    sort_order: 2,
  },
  {
    name: '穿搭分享模板',
    description: '适合衣服、鞋子、配饰等穿搭分享文案，包含今日穿搭、搭配技巧、好物推荐',
    template_type: 'xhs_post',
    category: '穿搭',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    content: JSON.stringify({
      prompt: '生成一篇穿搭分享文案',
      style: '时尚分享',
      structure: '今日穿搭-单品介绍-搭配技巧',
      tags: ['穿搭', '时尚', '每日穿搭']
    }),
    tags: ['穿搭', '时尚', '搭配'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 商品海报 (goods_poster) - 3个 ==========
  {
    name: '电商促销海报',
    description: '适用于双十一、618等大促活动的电商海报模板，突出优惠信息、限时折扣',
    template_type: 'goods_poster',
    category: '电商促销',
    thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
    content: JSON.stringify({
      style: '促销风格',
      color: '红金配色',
      elements: ['折扣信息', '产品图', '倒计时'],
      layout: '居中构图'
    }),
    tags: ['电商', '促销', '节日'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '新品上市海报',
    description: '适合新品发布的产品海报模板，突出新品特性、营造期待感',
    template_type: 'goods_poster',
    category: '新品',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    content: JSON.stringify({
      style: '简约高端',
      color: '黑白金',
      elements: ['新品图', '新品标识', '核心卖点'],
      layout: '左图右文'
    }),
    tags: ['新品', '上市', '首发'],
    is_featured: true,
    sort_order: 2,
  },
  {
    name: '节日礼盒海报',
    description: '适合中秋、端午、春节等节日礼盒包装设计，营造节日氛围',
    template_type: 'goods_poster',
    category: '节日',
    thumbnail: 'https://images.unsplash.com/photo-1512909006721-c3eb8ff4c3cd?w=400&h=300&fit=crop',
    content: JSON.stringify({
      style: '节日风格',
      color: '节日配色',
      elements: ['礼盒图', '节日元素', '祝福语'],
      layout: '全屏构图'
    }),
    tags: ['节日', '礼盒', '送礼'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== AI写真 (portrait) - 3个 ==========
  {
    name: '古风写真模板',
    description: '适合汉服、古风场景的AI写真模板，古典韵味十足，仕女图风格',
    template_type: 'portrait',
    category: '古风',
    thumbnail: 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=400&h=300&fit=crop',
    content: JSON.stringify({
      style: '古风仕女',
      costume: '汉服',
      scene: '园林/宫殿',
      mood: '优雅端庄',
      prompt: 'Traditional Chinese beauty in hanfu, elegant pose, classical garden background, soft lighting, high quality portrait photography style'
    }),
    tags: ['古风', '汉服', '仕女'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '现代写真模板',
    description: '适合都市街拍、时尚写真的模板，现代感强，适合社交媒体',
    template_type: 'portrait',
    category: '现代',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop',
    content: JSON.stringify({
      style: '时尚街拍',
      costume: '休闲装',
      scene: '城市街景',
      mood: '自信随性',
      prompt: 'Modern fashion portrait, casual stylish outfit, urban street background, natural lighting, confident expression, magazine cover style'
    }),
    tags: ['街拍', '时尚', '都市'],
    is_featured: true,
    sort_order: 2,
  },
  {
    name: '证件照模板',
    description: '标准证件照生成模板，支持多种证件规格，蓝白底色可选',
    template_type: 'portrait',
    category: '证件',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    content: JSON.stringify({
      style: '证件照',
      background: '蓝底',
      size: '一寸',
      requirements: ['正面免冠', '露出五官', '素颜或淡妆'],
      prompt: 'Professional ID photo, blue background, formal expression, front-facing, high quality, clean and tidy appearance'
    }),
    tags: ['证件照', '简历', '登记照'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 封面图 (cover) - 3个 ==========
  {
    name: '小红书爆款封面',
    description: '高点击率的小红书笔记封面模板，标题醒目、配图吸睛',
    template_type: 'cover',
    category: '小红书',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop',
    content: JSON.stringify({
      platform: '小红书',
      style: '爆款风格',
      elements: ['大标题', '副标题', '吸睛图', '装饰元素'],
      layout: '图文结合'
    }),
    tags: ['小红书', '封面', '爆款'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '公众号文章封面',
    description: '适合微信公众号文章的头图模板，简洁大方、内容聚焦',
    template_type: 'cover',
    category: '公众号',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
    content: JSON.stringify({
      platform: '微信公众号',
      style: '简约文艺',
      elements: ['主标题', '副标题', '背景图'],
      layout: '居中排版'
    }),
    tags: ['公众号', '文章', '新媒体'],
    is_featured: false,
    sort_order: 2,
  },
  {
    name: '短视频封面',
    description: '适合抖音、快手等短视频平台的封面模板，第一眼抓住观众',
    template_type: 'cover',
    category: '短视频',
    thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop',
    content: JSON.stringify({
      platform: '抖音/快手',
      style: '冲击力强',
      elements: ['人物/产品', '文字标题', '高对比度'],
      layout: '人物居中'
    }),
    tags: ['短视频', '抖音', '封面'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 商品图 (goods_image) - 3个 ==========
  {
    name: '服装商品图优化',
    description: '提升服装商品图的视觉效果，增加买家购买欲望，专业的电商摄影风格',
    template_type: 'goods_image',
    category: '服装',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    content: JSON.stringify({
      category: '服装',
      style: '电商白底图',
      enhance: ['光线优化', '背景处理', '色彩增强'],
      requirements: ['纯白背景', '正面展示', '高清细节']
    }),
    tags: ['服装', '电商', '商品图'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '美食商品图精修',
    description: '让美食照片看起来更诱人，提升食欲感的精修模板',
    template_type: 'goods_image',
    category: '美食',
    thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    content: JSON.stringify({
      category: '美食',
      style: '美食摄影',
      enhance: ['提亮暖色', '锐化细节', '背景虚化'],
      requirements: ['真实自然', '突出食欲', '干净背景']
    }),
    tags: ['美食', '餐饮', '菜品'],
    is_featured: false,
    sort_order: 2,
  },
  {
    name: '首饰商品图精修',
    description: '珠宝首饰类商品的精修模板，突出光泽感和精致细节',
    template_type: 'goods_image',
    category: '首饰',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
    content: JSON.stringify({
      category: '首饰珠宝',
      style: '高端精修',
      enhance: ['提亮光泽', '背景处理', '细节锐化'],
      requirements: ['突出质感', '光泽自然', '简洁背景']
    }),
    tags: ['首饰', '珠宝', '金银饰'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 抠图 (background_removal) - 3个 ==========
  {
    name: '证件照换底色',
    description: '快速更换证件照背景色，蓝底、白底、红底一键切换',
    template_type: 'background_removal',
    category: '证件照',
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
    content: JSON.stringify({
      type: '证件照',
      backgrounds: ['蓝底RGB(67,142,219)', '白底RGB(255,255,255)', '红底RGB(255,0,0)'],
      requirements: ['人像清晰', '边缘完整', '无残留背景']
    }),
    tags: ['证件照', '换底', '实用'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '电商白底图制作',
    description: '快速去除商品背景，制作标准化电商白底图',
    template_type: 'background_removal',
    category: '电商',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    content: JSON.stringify({
      type: '电商商品',
      background: '纯白(RGB:255,255,255)',
      requirements: ['边缘清晰', '无毛边', '阴影自然']
    }),
    tags: ['电商', '白底图', '商品图'],
    is_featured: false,
    sort_order: 2,
  },
  {
    name: '人物抠图换背景',
    description: '人像照片智能抠图，可替换任意背景，适合各类创意场景',
    template_type: 'background_removal',
    category: '人像',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    content: JSON.stringify({
      type: '人像',
      edge_refinement: true,
      hair_detail: true,
      requirements: ['发丝清晰', '边缘平滑', '保留阴影']
    }),
    tags: ['人像', '换背景', '创意'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 照片美化 (photo) - 3个 ==========
  {
    name: '旅行照片美化',
    description: '旅行照片一键美化，调色增亮，让回忆更美好，自然风光风格',
    template_type: 'photo',
    category: '旅行',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    content: JSON.stringify({
      scene: '旅行风光',
      style: '自然清新',
      adjustments: ['色彩增强', '对比度优化', '暗部提亮'],
      preset: '日系小清新'
    }),
    tags: ['旅行', '风景', '摄影'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '人像美颜精修',
    description: '自然系人像美颜，保留真实感的同时提升肤质和气色',
    template_type: 'photo',
    category: '人像',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop',
    content: JSON.stringify({
      scene: '人像',
      style: '自然美颜',
      adjustments: ['磨皮美白', '五官立体', '气色提升'],
      preset: '自然奶油肌'
    }),
    tags: ['人像', '美颜', '自拍'],
    is_featured: true,
    sort_order: 2,
  },
  {
    name: '美食滤镜调色',
    description: '让美食照片看起来更诱人，适合朋友圈分享的美食滤镜',
    template_type: 'photo',
    category: '美食',
    thumbnail: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop',
    content: JSON.stringify({
      scene: '美食',
      style: '暖色食欲',
      adjustments: ['暖色调', '饱和度提升', '锐化细节'],
      preset: '美食滤镜'
    }),
    tags: ['美食', '滤镜', '朋友圈'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 图文排版 (layout) - 3个 ==========
  {
    name: '产品详情页排版',
    description: '适合电商详情页的产品图文混排模板，信息清晰有层次',
    template_type: 'layout',
    category: '电商',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    content: JSON.stringify({
      type: '电商详情页',
      layout: '左图右文',
      elements: ['产品图', '卖点图标', '参数表格', '买家秀'],
      style: '简洁专业'
    }),
    tags: ['电商', '排版', '详情页'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '小红书图文笔记',
    description: '适合小红书图文笔记的排版模板，吸睛又易读',
    template_type: 'layout',
    category: '小红书',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop',
    content: JSON.stringify({
      type: '小红书图文',
      layout: '上下图文',
      elements: ['封面图', '分段落', '配图', '话题标签'],
      style: '清新活泼'
    }),
    tags: ['小红书', '图文', '笔记'],
    is_featured: false,
    sort_order: 2,
  },
  {
    name: '朋友圈九宫格',
    description: '适合朋友圈九宫格发布的图文排版模板，整齐又吸睛',
    template_type: 'layout',
    category: '朋友圈',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    content: JSON.stringify({
      type: '朋友圈九宫格',
      layout: '3x3网格',
      elements: ['主图', '辅图', '风格统一'],
      style: '统一色调'
    }),
    tags: ['朋友圈', '九宫格', '分享'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 简历 (resume) - 3个 ==========
  {
    name: '互联网产品经理简历',
    description: '适合产品经理岗位的简历模板，突出项目经验、产品思维',
    template_type: 'resume',
    category: '互联网',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
    content: JSON.stringify({
      job: '产品经理',
      sections: ['基本信息', '工作经历', '项目经验', '技能特长'],
      highlights: ['数据思维', '项目管理', '需求分析'],
      style: '专业简洁'
    }),
    tags: ['产品经理', '互联网', '求职'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '设计师简历模板',
    description: '适合UI、平面、插画等设计岗位的简历模板，展示设计能力',
    template_type: 'resume',
    category: '设计',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    content: JSON.stringify({
      job: '设计师',
      sections: ['个人信息', '作品集链接', '工作经历', '技能清单'],
      highlights: ['设计软件', '代表作品', '设计理念'],
      style: '设计感强'
    }),
    tags: ['设计师', 'UI', '创意'],
    is_featured: true,
    sort_order: 2,
  },
  {
    name: '技术开发简历',
    description: '适合前端、后端、算法等开发岗位的简历模板，突出技术栈',
    template_type: 'resume',
    category: '技术',
    thumbnail: 'https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?w=400&h=300&fit=crop',
    content: JSON.stringify({
      job: '开发工程师',
      sections: ['基本信息', '教育背景', '技术栈', '项目经验'],
      highlights: ['编程语言', '框架工具', '项目成果'],
      style: '技术简洁'
    }),
    tags: ['程序员', '技术', '开发'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 小说 (novel) - 3个 ==========
  {
    name: '玄幻小说开头',
    description: '热血玄幻小说的黄金开头模板，包含世界观、主角、冲突三要素',
    template_type: 'novel',
    category: '玄幻',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    content: JSON.stringify({
      genre: '玄幻',
      structure: '世界观铺垫-主角出场-金手指展示-第一冲突',
      elements: ['修炼体系', '势力格局', '主角背景', '特殊能力'],
      length: '2000字',
      tone: '热血激昂'
    }),
    tags: ['玄幻', '网文', '开头'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '都市言情模板',
    description: '现代都市言情小说开头模板，轻松甜蜜或虐恋情深皆可',
    template_type: 'novel',
    category: '言情',
    thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
    content: JSON.stringify({
      genre: '都市言情',
      structure: '场景设定-男女主相遇-矛盾展开-情感铺垫',
      elements: ['都市背景', '人物身份', '相遇契机', '情感张力'],
      length: '1500字',
      tone: '甜蜜/虐恋'
    }),
    tags: ['言情', '都市', '甜文'],
    is_featured: true,
    sort_order: 2,
  },
  {
    name: '悬疑推理模板',
    description: '悬疑推理小说开头模板，营造紧张氛围，设置悬念',
    template_type: 'novel',
    category: '悬疑',
    thumbnail: 'https://images.unsplash.com/photo-1509248961725-9d3c0c9b4b4f?w=400&h=300&fit=crop',
    content: JSON.stringify({
      genre: '悬疑推理',
      structure: '命案/异常-侦探出场-线索铺垫-第一谜团',
      elements: ['案件设定', '侦探角色', '嫌疑人', '关键线索'],
      length: '1800字',
      tone: '紧张悬疑'
    }),
    tags: ['悬疑', '推理', '刑侦'],
    is_featured: false,
    sort_order: 3,
  },

  // ========== 脚本 (script) - 3个 ==========
  {
    name: '抖音带货脚本',
    description: '适合抖音带货的短视频脚本模板，包含开场、产品介绍、促成下单三段式',
    template_type: 'script',
    category: '带货',
    thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop',
    content: JSON.stringify({
      platform: '抖音',
      duration: '60秒',
      structure: ['开场3秒-痛点共鸣', '产品介绍30秒-卖点展示', '促单27秒-限时优惠'],
      elements: ['场景设定', '痛点挖掘', '产品卖点', '价格对比', '限时促单'],
      tips: ['前3秒要抓人', '突出性价比', '制造紧迫感']
    }),
    tags: ['抖音', '带货', '短视频'],
    is_featured: true,
    sort_order: 1,
  },
  {
    name: '口播知识分享脚本',
    description: '适合知识科普、技能教学的短视频口播脚本，吸引关注、传递价值',
    template_type: 'script',
    category: '知识',
    thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=300&fit=crop',
    content: JSON.stringify({
      platform: '通用',
      duration: '90秒',
      structure: ['开场5秒-抛出问题', '主体60秒-知识讲解', '结尾25秒-总结互动'],
      elements: ['痛点问题', '解决方案', '实操步骤', '效果承诺', '引导关注'],
      tips: ['开头要共鸣', '内容要干货', '结尾要互动']
    }),
    tags: ['知识', '口播', '科普'],
    is_featured: true,
    sort_order: 2,
  },
  {
    name: '小红书种草脚本',
    description: '适合小红书视频笔记的脚本模板，真实分享、促进转化',
    template_type: 'script',
    category: '种草',
    thumbnail: 'https://images.unsplash.com/photo-1611162616311-30d23c0d41e8?w=400&h=300&fit=crop',
    content: JSON.stringify({
      platform: '小红书',
      duration: '45秒',
      structure: ['开场5秒-吸引眼球', '分享20秒-真实体验', '推荐15秒-核心卖点', '结尾5秒-引导互动'],
      elements: ['使用场景', '真实体验', '前后对比', '推荐理由', '互动引导'],
      tips: ['真实感强', '有代入感', '种草感自然']
    }),
    tags: ['小红书', '种草', '视频'],
    is_featured: false,
    sort_order: 3,
  },
];

// POST - 批量初始化模板
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json({ 
        error: '数据库未配置，请先设置Supabase环境变量' 
      }, { status: 500 });
    }

    // 检查是否已有模板
    const { count } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return NextResponse.json({ 
        success: false,
        error: `数据库中已有 ${count} 个模板，如需重新初始化请先清空数据`,
        count,
      });
    }

    // 批量插入
    const { data, error } = await supabase
      .from('templates')
      .insert(TEMPLATES_DATA)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ 
        success: false,
        error: '批量插入失败: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `成功初始化 ${data?.length || TEMPLATES_DATA.length} 个模板`,
      count: data?.length || TEMPLATES_DATA.length,
      templates: data,
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || '服务器错误' 
    }, { status: 500 });
  }
}

// DELETE - 清空所有模板
export async function DELETE() {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json({ 
        error: '数据库未配置' 
      }, { status: 500 });
    }

    const { error } = await supabase
      .from('templates')
      .delete()
      .neq('id', 0); // 删除所有

    if (error) {
      return NextResponse.json({ 
        success: false,
        error: '清空失败: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '已清空所有模板',
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || '服务器错误' 
    }, { status: 500 });
  }
}
