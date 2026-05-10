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
  /** 子类型选项（如白底/场景/细节等） */
  subtypeOptions?: { value: string; label: string }[];
  /** 子类型区域标签 */
  subtypeLabel?: string;
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
        label: '生成类型',
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
    subtypeLabel: '生成类型',
    subtypeOptions: [
      { value: 'white-bg', label: '白底主图' },
      { value: 'lifestyle', label: '场景图' },
      { value: 'detail', label: '细节展示' },
      { value: 'group', label: '组合搭配' },
    ],
  },
  {
    slug: 'xiaohongshu-generator',
    name: '小红书封面',
    icon: '📕',
    description: '爆款小红书封面一键生成',
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
        label: '风格标签',
        options: [
          { value: 'beauty', label: '美妆', icon: '💄' },
          { value: 'fashion', label: '穿搭', icon: '👗' },
          { value: 'lifestyle', label: '生活', icon: '✨' },
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
    subtypeLabel: '内容类型',
    subtypeOptions: [
      { value: 'beauty', label: '美妆' },
      { value: 'fashion', label: '穿搭' },
      { value: 'lifestyle', label: '生活' },
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
        label: '风格标签',
        options: [
          { value: 'korean', label: '韩系', icon: '🇰🇷' },
          { value: 'retro', label: '复古', icon: '📼' },
          { value: 'film', label: '胶片', icon: '🎞️' },
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
      { image: '/demo-card-lifestyle.jpg', title: '韩系清新写真', desc: '自然光线下的人像' },
      { image: '/demo-scene.jpg', title: '复古胶片写真', desc: '怀旧氛围感大片' },
      { image: '/case-lipstick-main.png', title: '高级质感写真', desc: '棚拍质感大片' },
    ],
    defaultRatio: '3:4',
    defaultCount: 6,
    styleOptions: [
      { value: 'korean-fresh', label: '韩系清新' },
      { value: 'retro-film', label: '复古胶片' },
      { value: 'luxury', label: '高级质感' },
    ],
    subtypeLabel: '写真风格',
    subtypeOptions: [
      { value: 'portrait', label: '单人写真' },
      { value: 'couple', label: '双人写真' },
      { value: 'group', label: '多人写真' },
    ],
  },
  {
    slug: 'poster-design',
    name: '海报设计',
    icon: '🎨',
    description: 'AI一键生成品牌海报和营销图',
    greeting: '你想设计什么类型的海报？',
    steps: [
      {
        id: 'upload',
        type: 'upload',
        label: '上传参考图或素材（可选）',
        placeholder: '上传Logo、产品图或风格参考',
        maxFiles: 5,
        optional: true,
      },
      {
        id: 'template',
        type: 'select',
        label: '风格模板',
        options: [
          { value: 'minimal', label: '简约', icon: '◻️' },
          { value: 'premium', label: '高级', icon: '✨' },
          { value: 'lifestyle', label: '生活场景', icon: '🏡' },
        ],
      },
      {
        id: 'description',
        type: 'input',
        label: '描述海报内容和用途',
        placeholder: '例如：618促销活动海报，科技产品发布海报…',
      },
    ],
    cases: [
      { image: '/case-ecommerce.jpg', title: '科技产品海报', desc: '简约高级风格' },
      { image: '/demo-card-lifestyle.jpg', title: '品牌活动海报', desc: '生活场景风格' },
      { image: '/case-lipstick-main.png', title: '促销海报', desc: '高级质感风格' },
    ],
    defaultRatio: '3:4',
    defaultCount: 2,
    styleOptions: [
      { value: 'minimal', label: '简约风格' },
      { value: 'premium', label: '高级质感' },
      { value: 'lifestyle', label: '生活场景' },
      { value: 'festive', label: '节日氛围' },
    ],
    subtypeLabel: '海报类型',
    subtypeOptions: [
      { value: 'minimal', label: '简约' },
      { value: 'premium', label: '高级' },
      { value: 'lifestyle', label: '生活场景' },
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
    subtypeLabel: '背景类型',
    subtypeOptions: [
      { value: 'transparent', label: '透明背景' },
      { value: 'white', label: '白色背景' },
      { value: 'custom', label: '自定义颜色' },
    ],
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
    subtypeLabel: '详情页类型',
    subtypeOptions: [
      { value: 'full', label: '完整详情页' },
      { value: 'highlight', label: '卖点提炼页' },
      { value: 'compare', label: '对比展示页' },
    ],
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
    'poster-design': 'product',
    'background-removal': 'removebg',
    'product-page': 'detail',
    'productpage': 'detail',
    'product-poster': 'product',
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
    'poster': 'poster-design',
  };
  return map[genType] || genType;
}
