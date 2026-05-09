/**
 * 统一 AI 工作流配置系统
 * 
 * 每个工具有专属的 AI 引导流程、案例展示和参数配置。
 * 首页入口和工具库入口共用同一套工作流。
 */

// ===== 工具引导步骤 =====
export interface GuideStep {
  id: string;
  type: 'upload' | 'select' | 'input';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string; icon?: string }[];
  optional?: boolean;
  maxFiles?: number;
}

// ===== 工具案例 =====
export interface ToolCase {
  image: string;
  title: string;
  desc: string;
}

// ===== 工具工作流配置 =====
export interface ToolWorkflowConfig {
  slug: string;
  name: string;
  icon: string;
  description: string;
  /** 顶部问候语 */
  greeting: string;
  /** AI 引导步骤 */
  steps: GuideStep[];
  /** 默认展示案例 */
  cases: ToolCase[];
  /** 生成后推荐比例 */
  defaultRatio: string;
  /** 生成数量 */
  defaultCount: number;
  /** 生成风格选项 */
  styleOptions: { value: string; label: string }[];
}

// ===== 全部工具配置 =====
const TOOL_WORKFLOWS: ToolWorkflowConfig[] = [
  {
    slug: 'product-generator',
    name: 'AI商品图',
    icon: '📦',
    description: '上传商品图，秒变高级电商主图',
    greeting: '你想生成什么类型的商品图？',
    steps: [
      {
        id: 'upload',
        type: 'upload',
        label: '上传商品图',
        placeholder: '上传你的商品原图',
        maxFiles: 5,
      },
      {
        id: 'scene',
        type: 'select',
        label: '你想生成哪种商品图？',
        options: [
          { value: 'white-bg', label: '白底主图', icon: '⬜' },
          { value: 'lifestyle', label: '场景图', icon: '🏞️' },
          { value: 'detail', label: '细节展示图', icon: '🔍' },
          { value: 'group', label: '组合搭配图', icon: '🎨' },
        ],
      },
      {
        id: 'description',
        type: 'input',
        label: '描述商品卖点（可选）',
        placeholder: '例如：轻奢感口红，玫瑰金外壳，丝绒质地…',
        optional: true,
      },
    ],
    cases: [
      { image: '/case-lipstick-main.png', title: '口红白底主图', desc: '高级感白底商品图' },
      { image: '/case-ecommerce.jpg', title: '耳机场景图', desc: '生活化场景展示' },
      { image: '/demo-card-lifestyle.jpg', title: '护肤品组合图', desc: '多品搭配展示' },
    ],
    defaultRatio: '1:1',
    defaultCount: 4,
    styleOptions: [
      { value: 'premium', label: '高级质感' },
      { value: 'minimal', label: '极简风格' },
      { value: 'lifestyle', label: '生活场景' },
    ],
  },
  {
    slug: 'xiaohongshu-generator',
    name: '小红书爆款',
    icon: '📕',
    description: '爆款小红书内容一键生成',
    greeting: '你想做什么类型的小红书内容？',
    steps: [
      {
        id: 'upload',
        type: 'upload',
        label: '上传参考图',
        placeholder: '上传产品或风格参考',
        maxFiles: 5,
      },
      {
        id: 'niche',
        type: 'select',
        label: '选择你的赛道',
        options: [
          { value: 'beauty', label: '美妆护肤', icon: '💄' },
          { value: 'fashion', label: '穿搭时尚', icon: '👗' },
          { value: 'food', label: '美食饮品', icon: '🍽️' },
          { value: 'lifestyle', label: '生活方式', icon: '✨' },
        ],
      },
      {
        id: 'content_type',
        type: 'select',
        label: '需要封面还是整套内容？',
        options: [
          { value: 'cover', label: '封面图', icon: '🖼️' },
          { value: 'carousel', label: '整套图文', icon: '📑' },
          { value: 'copy', label: '文案+封面', icon: '📝' },
        ],
      },
      {
        id: 'description',
        type: 'input',
        label: '描述你想要的效果',
        placeholder: '例如：夏日清爽风，适合18-25岁女性…',
        optional: true,
      },
    ],
    cases: [
      { image: '/demo-card-lifestyle.jpg', title: '护肤品种草封面', desc: '清新夏日风格' },
      { image: '/case-lipstick-main.png', title: '口红试色封面', desc: '高级质感大片' },
      { image: '/demo-scene.jpg', title: '穿搭推荐封面', desc: '氛围感日常穿搭' },
    ],
    defaultRatio: '3:4',
    defaultCount: 4,
    styleOptions: [
      { value: 'fresh', label: '清新自然' },
      { value: 'premium', label: '高级质感' },
      { value: 'cute', label: '甜美可爱' },
    ],
  },
  {
    slug: 'ai-photo',
    name: 'AI写真',
    icon: '📸',
    description: '一键生成氛围感写真大片',
    greeting: '你喜欢什么风格的写真？',
    steps: [
      {
        id: 'upload',
        type: 'upload',
        label: '上传人物照片',
        placeholder: '上传一张清晰正面照',
        maxFiles: 3,
      },
      {
        id: 'style',
        type: 'select',
        label: '选择写真风格',
        options: [
          { value: 'id-photo', label: '证件照', icon: '🪪' },
          { value: 'artistic', label: '艺术写真', icon: '🎨' },
          { value: 'couples', label: '情侣写真', icon: '💑' },
          { value: 'creative', label: '创意写真', icon: '✨' },
        ],
      },
      {
        id: 'description',
        type: 'input',
        label: '补充风格要求（可选）',
        placeholder: '例如：港风复古、日系清新、韩系高级感…',
        optional: true,
      },
    ],
    cases: [
      { image: '/demo-card-lifestyle.jpg', title: '港风艺术写真', desc: '复古氛围感大片' },
      { image: '/demo-scene.jpg', title: '日系清新写真', desc: '自然光线下的人像' },
      { image: '/case-lipstick-main.png', title: '韩系证件照', desc: '精致职业形象' },
    ],
    defaultRatio: '3:4',
    defaultCount: 6,
    styleOptions: [
      { value: 'hk-retro', label: '港风复古' },
      { value: 'jp-fresh', label: '日系清新' },
      { value: 'kr-elegant', label: '韩系高级' },
    ],
  },
  {
    slug: 'background-removal',
    name: '智能抠图',
    icon: '✂️',
    description: '一键智能抠图，3秒出白底图',
    greeting: '上传需要抠图的图片',
    steps: [
      {
        id: 'upload',
        type: 'upload',
        label: '上传图片',
        placeholder: '上传需要处理的图片',
        maxFiles: 5,
      },
      {
        id: 'bg-type',
        type: 'select',
        label: '需要什么背景？',
        options: [
          { value: 'transparent', label: '透明背景', icon: '🔲' },
          { value: 'white', label: '白色背景', icon: '⬜' },
          { value: 'custom', label: '自定义颜色', icon: '🎨' },
        ],
      },
    ],
    cases: [
      { image: '/case-ecommerce.jpg', title: '商品抠图', desc: '一键去除复杂背景' },
      { image: '/demo-scene.jpg', title: '人物抠图', desc: '精准人物边缘处理' },
      { image: '/case-lipstick-main.png', title: '白底商品图', desc: '自动生成白底图' },
    ],
    defaultRatio: '1:1',
    defaultCount: 1,
    styleOptions: [],
  },
  {
    slug: 'product-page',
    name: '商品详情页',
    icon: '📋',
    description: '自动生成电商详情页长图',
    greeting: '你想生成什么类型的详情页？',
    steps: [
      {
        id: 'upload',
        type: 'upload',
        label: '上传商品图',
        placeholder: '上传你的商品图',
        maxFiles: 5,
      },
      {
        id: 'page-type',
        type: 'select',
        label: '选择详情页类型',
        options: [
          { value: 'full', label: '完整详情页', icon: '📄' },
          { value: 'highlight', label: '卖点提炼页', icon: '💡' },
          { value: 'compare', label: '对比展示页', icon: '⚖️' },
        ],
      },
      {
        id: 'description',
        type: 'input',
        label: '商品卖点描述（可选）',
        placeholder: '例如：智能降噪耳机，续航40小时…',
        optional: true,
      },
    ],
    cases: [
      { image: '/case-lipstick-main.png', title: '口红详情页', desc: '高端美妆详情页' },
      { image: '/case-ecommerce.jpg', title: '耳机详情页', desc: '科技产品长图' },
      { image: '/demo-card-lifestyle.jpg', title: '护肤品详情页', desc: '成分展示长图' },
    ],
    defaultRatio: '2:3',
    defaultCount: 1,
    styleOptions: [
      { value: 'premium', label: '高端质感' },
      { value: 'tech', label: '科技简约' },
      { value: 'cute', label: '清新甜美' },
    ],
  },
  {
    slug: 'novel',
    name: '小说创作',
    icon: '📖',
    description: 'AI辅助小说创作，大纲到正文一键生成',
    greeting: '你想创作什么类型的小说？',
    steps: [
      {
        id: 'genre',
        type: 'select',
        label: '选择小说类型',
        options: [
          { value: 'romance', label: '言情', icon: '💕' },
          { value: 'fantasy', label: '玄幻', icon: '🔮' },
          { value: 'scifi', label: '科幻', icon: '🚀' },
          { value: 'mystery', label: '悬疑', icon: '🔍' },
        ],
      },
      {
        id: 'description',
        type: 'input',
        label: '描述你的故事构思',
        placeholder: '例如：现代都市背景下，一个平凡女孩意外获得读心术…',
      },
    ],
    cases: [
      { image: '/cover-novel.png', title: '言情小说大纲', desc: '甜宠文经典设定' },
      { image: '/cover-resume.png', title: '玄幻世界设定', desc: '修仙体系与世界观' },
    ],
    defaultRatio: 'text',
    defaultCount: 1,
    styleOptions: [
      { value: 'sweet', label: '甜宠风格' },
      { value: 'dark', label: '暗黑风格' },
      { value: 'epic', label: '史诗风格' },
    ],
  },
  {
    slug: 'resume-optimizer',
    name: '简历优化',
    icon: '📝',
    description: 'STAR法则优化简历，HR直接约面试',
    greeting: '上传你的简历或描述工作经历',
    steps: [
      {
        id: 'upload',
        type: 'upload',
        label: '上传简历（可选）',
        placeholder: '上传你的简历文件或截图',
        maxFiles: 3,
        optional: true,
      },
      {
        id: 'description',
        type: 'input',
        label: '描述你的工作经历',
        placeholder: '例如：3年产品经理经验，负责过电商和社交产品…',
      },
    ],
    cases: [
      { image: '/cover-resume.png', title: '产品经理简历', desc: 'STAR法则优化' },
      { image: '/cover-novel.png', title: '设计师简历', desc: '作品集式排版' },
    ],
    defaultRatio: 'text',
    defaultCount: 1,
    styleOptions: [],
  },
];

// ===== 查找工具配置 =====
export function getToolWorkflow(slug: string): ToolWorkflowConfig | undefined {
  return TOOL_WORKFLOWS.find(t => t.slug === slug);
}

// ===== 获取全部工具配置 =====
export function getAllToolWorkflows(): ToolWorkflowConfig[] {
  return TOOL_WORKFLOWS;
}

// ===== slug → genType 映射 =====
export function slugToGenType(slug: string): string {
  const map: Record<string, string> = {
    'product-generator': 'product',
    'xiaohongshu-generator': 'xiaohongshu',
    'ai-photo': 'aiphoto',
    'background-removal': 'removebg',
    'product-page': 'detail',
    'productpage': 'detail',
    'product-poster': 'product',
    'novel': 'novel',
    'resume-optimizer': 'resume',
  };
  return map[slug] || slug;
}

// ===== genType → slug 反向映射 =====
export function genTypeToSlug(genType: string): string {
  const map: Record<string, string> = {
    'product': 'product-generator',
    'xiaohongshu': 'xiaohongshu-generator',
    'aiphoto': 'ai-photo',
    'removebg': 'background-removal',
    'detail': 'product-page',
    'novel': 'novel',
    'resume': 'resume-optimizer',
  };
  return map[genType] || genType;
}
