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
  };
  return map[slug] || slug;
}

// ===== genType → slug 反向映射 =====
export function genTypeToSlug(genType: string): string {
  const map: Record<string, string> = {
    'product': 'product-generator',
    'xiaohongshu': 'xiaohongshu-generator',
    'aiphoto': 'ai-photo',
  };
  return map[genType] || genType;
}

// ===== 灵感库数据 =====
export interface InspirationItem {
  id: string;
  /** 所属工具 slug */
  toolSlug: string;
  /** 展示图片 URL */
  image: string;
  /** 标题 */
  title: string;
  /** 风格/场景描述 */
  desc: string;
  /** 推荐风格 value */
  style: string;
  /** 推荐子类型 value */
  subtype: string;
  /** 推荐比例 */
  ratio: string;
  /** 推荐数量 */
  count: number;
  /** 关键词标签 */
  tags: string[];
  /** 分类标签文字 */
  categoryLabel: string;
  /** 浏览量 */
  views?: number;
  /** 点赞数 */
  likes?: number;
}

const INSPIRATIONS: InspirationItem[] = [
  // ===== 商品图 =====
  { id: 'p1', toolSlug: 'product-generator', image: '/case-lipstick-main.png', title: '口红白底主图', desc: '高级质感白底商品图', style: 'premium', subtype: 'white-bg', ratio: '1:1', count: 4, tags: ['白底', '高级感', '美妆'], categoryLabel: '商品图', views: 444, likes: 59 },
  { id: 'p2', toolSlug: 'product-generator', image: '/case-ecommerce.jpg', title: '耳机场景图', desc: '生活化场景展示', style: 'lifestyle', subtype: 'lifestyle', ratio: '1:1', count: 4, tags: ['场景', '科技', '生活'], categoryLabel: '商品图', views: 328, likes: 42 },
  { id: 'p3', toolSlug: 'product-generator', image: '/demo-card-lifestyle.jpg', title: '护肤品组合图', desc: '多品搭配展示', style: 'minimal', subtype: 'group', ratio: '1:1', count: 4, tags: ['组合', '简约', '护肤'], categoryLabel: '商品图', views: 256, likes: 31 },
  { id: 'p4', toolSlug: 'product-generator', image: '/demo-scene.jpg', title: '商品细节特写', desc: '细节展示突出品质', style: 'premium', subtype: 'detail', ratio: '1:1', count: 4, tags: ['细节', '品质', '特写'], categoryLabel: '商品图', views: 189, likes: 24 },

  // ===== 小红书封面 =====
  { id: 'x1', toolSlug: 'xiaohongshu-generator', image: '/demo-card-lifestyle.jpg', title: '护肤品种草封面', desc: '清新夏日风格', style: 'fresh', subtype: 'beauty', ratio: '3:4', count: 4, tags: ['种草', '清新', '美妆'], categoryLabel: '小红书', views: 512, likes: 78 },
  { id: 'x2', toolSlug: 'xiaohongshu-generator', image: '/case-lipstick-main.png', title: '口红试色封面', desc: '高级质感大片', style: 'premium', subtype: 'beauty', ratio: '3:4', count: 4, tags: ['试色', '高级', '彩妆'], categoryLabel: '小红书', views: 387, likes: 63 },
  { id: 'x3', toolSlug: 'xiaohongshu-generator', image: '/demo-scene.jpg', title: '穿搭推荐封面', desc: '氛围感日常穿搭', style: 'fresh', subtype: 'fashion', ratio: '3:4', count: 4, tags: ['穿搭', '氛围感', '日常'], categoryLabel: '小红书', views: 298, likes: 45 },
  { id: 'x4', toolSlug: 'xiaohongshu-generator', image: '/case-ecommerce.jpg', title: '生活好物分享', desc: '甜美可爱风格', style: 'cute', subtype: 'lifestyle', ratio: '3:4', count: 4, tags: ['好物', '可爱', '分享'], categoryLabel: '小红书', views: 234, likes: 38 },

  // ===== AI写真 =====
  { id: 'a1', toolSlug: 'ai-photo', image: '/demo-card-lifestyle.jpg', title: '韩系清新写真', desc: '自然光线下的人像', style: 'korean-fresh', subtype: 'portrait', ratio: '3:4', count: 6, tags: ['韩系', '清新', '人像'], categoryLabel: 'AI写真', views: 623, likes: 92 },
  { id: 'a2', toolSlug: 'ai-photo', image: '/demo-scene.jpg', title: '复古胶片写真', desc: '怀旧氛围感大片', style: 'retro-film', subtype: 'portrait', ratio: '3:4', count: 6, tags: ['复古', '胶片', '氛围'], categoryLabel: 'AI写真', views: 487, likes: 71 },
  { id: 'a3', toolSlug: 'ai-photo', image: '/case-lipstick-main.png', title: '高级质感写真', desc: '棚拍质感大片', style: 'luxury', subtype: 'portrait', ratio: '3:4', count: 6, tags: ['高级', '质感', '棚拍'], categoryLabel: 'AI写真', views: 356, likes: 54 },
  { id: 'a4', toolSlug: 'ai-photo', image: '/case-ecommerce.jpg', title: '双人复古写真', desc: '复古风格双人照', style: 'retro-film', subtype: 'couple', ratio: '4:5', count: 4, tags: ['双人', '复古', '情侣'], categoryLabel: 'AI写真', views: 278, likes: 43 },
];

export function getInspirations(toolSlug?: string): InspirationItem[] {
  if (!toolSlug) return INSPIRATIONS;
  return INSPIRATIONS.filter(i => i.toolSlug === toolSlug);
}

export function getInspirationCategories(): { label: string; count: number }[] {
  const map = new Map<string, number>();
  INSPIRATIONS.forEach(i => {
    const c = i.categoryLabel;
    map.set(c, (map.get(c) || 0) + 1);
  });
  return [{ label: '全部', count: INSPIRATIONS.length }, ...Array.from(map.entries()).map(([label, count]) => ({ label, count }))];
}
