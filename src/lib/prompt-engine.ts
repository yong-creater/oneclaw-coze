/**
 * OneClaw Prompt Engine — 三大工具独立 Prompt 构建系统
 *
 * 每个工具拥有独立的 Prompt Pipeline：
 *   用户输入 → 工具专属增强词 + 风格词 + 构图词 + 质量词 + 禁止词 → 最终 Prompt
 *
 * 目标：
 *   AI 商品图 → 像电商商业摄影
 *   AI 写真   → 像真实写真馆
 *   小红书封面 → 像真正爆款封面
 */

// ============================================================
// 类型定义
// ============================================================

export interface PromptInput {
  /** 用户原始输入 */
  prompt: string;
  /** 工具类型：product-generator | ai-photo | xiaohongshu-generator */
  toolType: string;
  /** 风格标识 */
  style?: string;
  /** 子类型（生成类型） */
  subtype?: string;
  /** 宽高比 */
  ratio?: string;
  /** 布局模式 */
  layoutMode?: string;
  /** 是否有参考图 */
  hasImage?: boolean;
  /** 生成数量 */
  count?: number;
}

export interface PromptOutput {
  /** 最终拼好的 prompt */
  fullPrompt: string;
  /** 是否为图生图模式（有参考图） */
  isImageToImage: boolean;
  /** 识别到的工具名（中文） */
  toolLabel: string;
}

// ============================================================
// 通用：参考图保真前缀
// ============================================================

const PRODUCT_FIDELITY_PREFIX = `CRITICAL: You MUST preserve the EXACT product from the reference image. The product's shape, color, material, proportions, and ALL visual details must remain IDENTICAL. ONLY change the background, lighting, and scene environment. NEVER deform, distort, or reimagine the product.

RULES:
1. Product MUST look EXACTLY like the reference image — same shape, color, material, proportions.
2. NEVER deform, distort, reshape, or stylize the product.
3. ONLY modify: background, lighting, scene, environment, and mood.
4. Output a photorealistic product photo in the specified style.
5. NO text, NO watermark, NO logo, NO badges, NO graphic overlays.`;

const PORTRAIT_FIDELITY_PREFIX = `CRITICAL: You MUST preserve the EXACT facial features, identity, and likeness from the reference photo. The person's face shape, eye shape, skin tone, and ALL facial details must remain IDENTICAL. ONLY change the styling, outfit, background, and lighting. NEVER alter the person's facial identity.

RULES:
1. Face MUST look EXACTLY like the reference photo — same features, same identity.
2. NEVER change face shape, eye shape, nose shape, or skin tone.
3. ONLY modify: hairstyle, makeup intensity, outfit, background, and lighting.
4. Output a photorealistic portrait in the specified style.`;

// ============================================================
// AI 商品图 Prompt Engine
// ============================================================

const PRODUCT_ENHANCEMENTS = [
  'commercial product photography',
  'premium advertising quality',
  'studio lighting setup',
  'realistic shadow and reflection',
  'high-end commercial composition',
  'e-commerce hero image',
  'professional product showcase',
  'high detail texture rendering',
  'clean premium background',
  'photorealistic product render',
];

const PRODUCT_NEGATIVES = [
  'illustration', 'cartoon', 'anime', 'fantasy',
  'abstract art', 'oil painting', '3D cartoon',
  'low quality', 'multiple products', 'collage',
  'blurry', 'noisy', 'grainy', 'oversaturated',
  'distorted product', 'deformed shape',
];

const PRODUCT_SUBTYPE_MAP: Record<string, string> = {
  'white-bg': 'Clean white background product photo, centered composition, professional studio lighting, e-commerce main image style',
  'lifestyle': 'Lifestyle scene photo, product in real-use environment, natural ambient lighting, warm and inviting atmosphere',
  'detail': 'Close-up detail shot, showing product material texture and craftsmanship, macro photography, shallow depth of field',
  'group': 'Product group/combo shot, multiple items arranged aesthetically, flat lay or styled composition, editorial layout',
};

const PRODUCT_STYLE_MAP: Record<string, string> = {
  'premium': 'Premium luxury feel, high-end studio quality, sophisticated color palette, Apple-style minimalism',
  'minimal': 'Minimalist clean aesthetic, simple and elegant, whitespace-dominant, Scandinavian design',
  'lifestyle': 'Lifestyle casual feel, warm and inviting, natural environment, cozy atmosphere',
  'clean': 'Ultra clean and crisp, bright white background, surgical precision, catalog quality',
  'romantic': 'Romantic and elegant, soft pink and gold tones, dreamy bokeh, luxury brand aesthetic',
  'luxury': 'Dark luxury aesthetic, deep rich colors, dramatic lighting, premium brand feel',
  'fresh': 'Fresh and vibrant, bright natural lighting, clean and modern, summery feel',
};

const PRODUCT_RATIO_MAP: Record<string, string> = {
  '1:1': 'Square composition, perfect for e-commerce main image, centered product',
  '3:4': 'Vertical portrait composition, product with elegant background, lifestyle feel',
  '4:3': 'Horizontal composition, product with scene context, editorial style',
  '4:5': 'Slightly vertical composition, product showcase with subtle background',
  '16:9': 'Wide cinematic composition, product in lifestyle environment, storytelling',
};

function buildProductPrompt(input: PromptInput): string {
  const parts: string[] = [];

  // 1. 参考图保真前缀
  if (input.hasImage) {
    parts.push(PRODUCT_FIDELITY_PREFIX);
  }

  // 2. 核心指令
  parts.push('Create a professional commercial product photograph.');

  // 3. 子类型描述
  const subtypeKey = input.subtype || 'white-bg';
  const subtypeDesc = PRODUCT_SUBTYPE_MAP[subtypeKey] || PRODUCT_SUBTYPE_MAP['white-bg'];
  if (subtypeDesc) parts.push(subtypeDesc);

  // 4. 风格描述
  const styleKey = input.style || 'premium';
  const styleDesc = PRODUCT_STYLE_MAP[styleKey];
  if (styleDesc) parts.push(styleDesc);

  // 5. 用户需求
  if (input.prompt) {
    parts.push(`Product/Scene description: ${input.prompt}`);
  }

  // 6. 比例构图
  const ratioDesc = PRODUCT_RATIO_MAP[input.ratio || '1:1'];
  if (ratioDesc) parts.push(ratioDesc);

  // 7. 布局模式
  if (input.layoutMode === 'multi-angle') {
    parts.push('Create a SINGLE composite image showing the product from MULTIPLE angles in a clean grid/collage layout. Show the product from front, side, back, and detail views arranged in a professional product photography grid. Each angle should be clearly visible and well-lit.');
  }

  // 8. 增强词（随机选取5-6个，避免过长）
  const shuffled = [...PRODUCT_ENHANCEMENTS].sort(() => Math.random() - 0.5);
  parts.push(shuffled.slice(0, 6).join(', '));

  // 9. 禁止词
  parts.push(`AVOID: ${PRODUCT_NEGATIVES.join(', ')}`);

  return parts.join('\n');
}

// ============================================================
// AI 写真 Prompt Engine
// ============================================================

const PORTRAIT_ENHANCEMENTS = [
  'ultra realistic portrait',
  'natural skin texture with pores visible',
  'cinematic lighting',
  'soft studio lighting',
  'professional photography',
  'real human face with natural features',
  'shallow depth of field',
  'natural expression and pose',
  'high-end portrait photography',
  '8K resolution skin detail',
  'magazine-quality retouching',
  'authentic skin tones',
];

const PORTRAIT_NEGATIVES = [
  'CGI', '3D render', 'plastic skin', 'anime',
  'illustration', 'doll face', 'game character',
  'low detail skin', 'cartoon face', 'airbrushed',
  'wax figure', 'uncanny valley', 'over-smoothed skin',
  'artificial looking', 'mannequin',
];

const PORTRAIT_SUBTYPE_MAP: Record<string, string> = {
  'korean': 'Korean photography style, soft natural lighting, clean and fresh, minimal makeup, pale skin with natural glow, gentle expression',
  'retro': 'Retro/vintage portrait, warm film tones, nostalgic atmosphere, classic styling, analog film grain, timeless elegance',
  'cyberpunk': 'Cyberpunk portrait, neon lights, futuristic vibes, edgy and bold, urban night scene, high contrast colors',
  'japanese': 'Japanese style portrait, soft pastel tones, natural and serene, wabi-sabi aesthetic, gentle and contemplative',
};

const PORTRAIT_STYLE_MAP: Record<string, string> = {
  'korean': 'Korean studio portrait, soft box lighting, flawless but natural skin, gentle and approachable',
  'korean-fresh': 'Korean fresh style portrait, soft natural daylight, clean and bright, dewy skin, gentle smile, pastel tones',
  'cinematic': 'Cinematic film look, dramatic side lighting, movie poster quality, rich color grading, atmospheric mood',
  'retro-film': 'Retro film photography style, warm vintage tones, grainy texture, nostalgic mood, analog camera feel',
  'japanese': 'Japanese style portrait, soft pastel tones, dreamy atmosphere, natural pose, light film aesthetic',
  'artistic': 'Artistic and creative portrait, unique composition, gallery quality, painterly light, evocative mood',
  'magazine': 'High fashion magazine cover, editorial quality, professional retouching, bold and confident pose',
  'luxury': 'Luxury high-end portrait, dramatic studio lighting, sophisticated composition, premium fashion editorial',
  'lifestyle': 'Lifestyle candid portrait, natural environment, warm tones, relaxed and authentic',
  'emotional': 'Emotional portrait with depth, expressive eyes, contemplative mood, artistic lighting',
  'studio': 'Professional studio portrait, controlled lighting, clean background, magazine quality',
  'selfie': 'Premium selfie style, natural lighting, social media ready, confident and polished',
  'soft': 'Soft and dreamy portrait, diffused light, gentle glow, ethereal atmosphere',
  'natural': 'Natural and fresh style, soft diffused daylight, candid feel, minimal retouching, authentic beauty',
};

const PORTRAIT_RATIO_MAP: Record<string, string> = {
  '3:4': 'Vertical portrait composition, standard headshot framing, professional studio ratio',
  '2:3': 'Full body or half body portrait composition, elegant vertical framing',
  '1:1': 'Square portrait composition, centered face, social media profile style',
  '4:5': 'Slightly vertical portrait, Instagram-style composition, head and shoulders',
  '9:16': 'Full body portrait, vertical storytelling composition, fashion editorial',
};

function buildPortraitPrompt(input: PromptInput): string {
  const parts: string[] = [];

  // 1. 参考图保真前缀
  if (input.hasImage) {
    parts.push(PORTRAIT_FIDELITY_PREFIX);
  }

  // 2. 核心指令
  parts.push('Create a professional ultra-realistic portrait photograph.');

  // 3. 子类型描述
  const subtypeKey = input.subtype || 'korean';
  const subtypeDesc = PORTRAIT_SUBTYPE_MAP[subtypeKey] || PORTRAIT_SUBTYPE_MAP['korean'];
  if (subtypeDesc) parts.push(subtypeDesc);

  // 4. 风格描述
  const styleKey = input.style || 'natural';
  const styleDesc = PORTRAIT_STYLE_MAP[styleKey];
  if (styleDesc) parts.push(styleDesc);

  // 5. 用户需求
  if (input.prompt) {
    parts.push(`Style notes: ${input.prompt}`);
  }

  // 6. 比例构图
  const ratioDesc = PORTRAIT_RATIO_MAP[input.ratio || '3:4'];
  if (ratioDesc) parts.push(ratioDesc);

  // 7. 增强词
  const shuffled = [...PORTRAIT_ENHANCEMENTS].sort(() => Math.random() - 0.5);
  parts.push(shuffled.slice(0, 6).join(', '));

  // 8. 禁止词
  parts.push(`AVOID: ${PORTRAIT_NEGATIVES.join(', ')}`);

  return parts.join('\n');
}

// ============================================================
// 小红书封面 Prompt Engine
// ============================================================

const XHS_ENHANCEMENTS = [
  'viral Xiaohongshu cover design',
  'Chinese social media aesthetic',
  'high click-through visual design',
  'clean composition with visual hierarchy',
  'title-friendly layout with negative space',
  'high contrast cover design',
  'lifestyle blogging aesthetic',
  'Chinese internet visual style',
  'trendy and eye-catching thumbnail',
  'aesthetic flat lay arrangement',
  'modern minimalist Chinese design',
  'influencer-quality visual content',
];

const XHS_NEGATIVES = [
  'abstract poster', 'movie poster', 'fantasy art',
  'over complicated layout', 'western poster design',
  'text-heavy composition', 'cluttered', 'low quality',
  'blurry', 'amateur design', 'generic stock photo',
  'crowded layout', 'no focal point',
];

const XHS_SUBTYPE_MAP: Record<string, string> = {
  'beauty': 'Beauty/cosmetics cover, makeup product showcase with elegant arrangement, soft pink and rose gold tones, premium beauty aesthetic',
  'fashion': 'Fashion outfit cover, OOTD style with trendy clothing arrangement, chic and stylish, modern fashion layout',
  'lifestyle': 'Lifestyle recommendation cover, cozy and aesthetic scene, daily essentials beautifully arranged, warm and inviting',
  'food': 'Food/restaurant cover, appetizing food photography with attractive plating, warm tones, delicious visual appeal',
};

const XHS_STYLE_MAP: Record<string, string> = {
  'fresh': 'Fresh and natural style, soft lighting, pastel tones, clean and airy, gentle aesthetic',
  'premium': 'Premium refined style, luxurious feel, rich colors, sophisticated composition',
  'ins': 'Instagram aesthetic, clean and trendy, minimalist chic, curated lifestyle feel',
  'viral': 'Xiaohongshu viral style, eye-catching bold composition, high saturation, scroll-stopping design',
  'beauty': 'Beauty and skincare aesthetic, dewy and luminous, clean and elegant, glass skin concept',
  'emotional': 'Emotional and atmospheric, warm color grading, dreamy mood, soft light leaks',
  'clean': 'Ultra clean minimal design, whitespace-dominant, editorial quality, refined taste',
  'tech': 'Tech and AI aesthetic, futuristic gradient, neon accents, digital innovation feel',
  'professional': 'Professional career style, structured layout, neutral sophisticated tones, confident vibe',
  'chic': 'Chic and fashionable, bold typography space, high contrast, editorial layout',
  'natural': 'Natural and organic aesthetic, earth tones, botanical elements, sustainable feel',
  'cute': 'Cute and playful style, pastel colors, kawaii elements, youthful and fun',
  'minimal': 'Ultra minimal design, single focal element, abundant negative space, refined simplicity',
  'modern': 'Modern contemporary design, bold geometric elements, vibrant accent colors, dynamic layout',
};

const XHS_RATIO_MAP: Record<string, string> = {
  '3:4': 'Vertical 3:4 ratio, standard Xiaohongshu cover format, optimized for mobile feed, leave top area clean for title overlay',
  '4:5': 'Slightly vertical, Instagram-friendly ratio, clean top section for text, lifestyle composition',
  '1:1': 'Square composition, balanced layout, center-focused design, product showcase style',
  '2:3': 'Tall vertical ratio, full body outfit or scene composition, cinematic vertical framing',
  '9:16': 'Full vertical story format, immersive composition, mobile-first design',
};

function buildXiaohongshuPrompt(input: PromptInput): string {
  const parts: string[] = [];

  // 1. 参考图保真前缀
  if (input.hasImage) {
    parts.push(PRODUCT_FIDELITY_PREFIX);
  }

  // 2. 核心指令
  parts.push('Create a viral Xiaohongshu (Little Red Book) social media cover image.');

  // 3. 小红书特有：预留标题区域
  parts.push('IMPORTANT: Leave clean negative space in the top-left or upper area for Chinese title text overlay. The image must have a clear focal point with room for text.');

  // 4. 子类型描述
  const subtypeKey = input.subtype || 'beauty';
  const subtypeDesc = XHS_SUBTYPE_MAP[subtypeKey] || XHS_SUBTYPE_MAP['beauty'];
  if (subtypeDesc) parts.push(subtypeDesc);

  // 5. 风格描述
  const styleKey = input.style || 'fresh';
  const styleDesc = XHS_STYLE_MAP[styleKey];
  if (styleDesc) parts.push(styleDesc);

  // 6. 用户需求
  if (input.prompt) {
    parts.push(`Content: ${input.prompt}`);
  }

  // 7. 比例构图
  const ratioDesc = XHS_RATIO_MAP[input.ratio || '3:4'];
  if (ratioDesc) parts.push(ratioDesc);

  // 8. 增强词
  const shuffled = [...XHS_ENHANCEMENTS].sort(() => Math.random() - 0.5);
  parts.push(shuffled.slice(0, 6).join(', '));

  // 9. 禁止词
  parts.push(`AVOID: ${XHS_NEGATIVES.join(', ')}`);

  return parts.join('\n');
}

// ============================================================
// 通用 Fallback（未知工具类型）
// ============================================================

function buildGenericPrompt(input: PromptInput): string {
  const parts: string[] = [];
  if (input.hasImage) parts.push(PRODUCT_FIDELITY_PREFIX);
  parts.push('Create a high-quality image.');
  if (input.prompt) parts.push(`Description: ${input.prompt}`);
  if (input.style) parts.push(`Style: ${input.style}`);
  if (input.ratio) parts.push(`Aspect ratio: ${input.ratio}`);
  parts.push('Professional quality, high resolution, photorealistic.');
  return parts.join('\n');
}

// ============================================================
// 主入口：buildPrompt
// ============================================================

const TOOL_LABELS: Record<string, string> = {
  'product-generator': 'AI商品图',
  'ai-photo': 'AI写真',
  'xiaohongshu-generator': '小红书封面',
};

export function buildPrompt(input: PromptInput): PromptOutput {
  let fullPrompt: string;

  switch (input.toolType) {
    case 'product-generator':
      fullPrompt = buildProductPrompt(input);
      break;
    case 'ai-photo':
      fullPrompt = buildPortraitPrompt(input);
      break;
    case 'xiaohongshu-generator':
      fullPrompt = buildXiaohongshuPrompt(input);
      break;
    default:
      fullPrompt = buildGenericPrompt(input);
  }

  return {
    fullPrompt,
    isImageToImage: !!input.hasImage,
    toolLabel: TOOL_LABELS[input.toolType] || 'AI生成',
  };
}

// ============================================================
// 导出样式/子类型标签（供前端使用）
// ============================================================

export const SUBTYPE_LABELS: Record<string, Record<string, string>> = {
  'product-generator': {
    'white-bg': '白底主图',
    'lifestyle': '场景图',
    'detail': '细节展示',
    'group': '组合搭配',
  },
  'xiaohongshu-generator': {
    'beauty': '美妆种草',
    'fashion': '穿搭分享',
    'lifestyle': '生活好物',
    'food': '美食探店',
  },
  'ai-photo': {
    'korean': '韩系写真',
    'retro': '复古写真',
    'cyberpunk': '赛博朋克',
    'japanese': '日系写真',
  },
};

export const STYLE_LABELS: Record<string, Record<string, string>> = {
  'product-generator': {
    'premium': '高级质感',
    'minimal': '极简风格',
    'lifestyle': '生活场景',
    'clean': '干净清爽',
    'romantic': '浪漫优雅',
    'luxury': '暗黑奢华',
    'fresh': '清新明亮',
  },
  'xiaohongshu-generator': {
    'fresh': '清新自然',
    'premium': '精致高级',
    'ins': 'INS 风格',
    'viral': '爆款风格',
    'beauty': '美妆氛围',
    'emotional': '情绪感',
    'clean': '极简干净',
    'tech': '科技感',
    'professional': '职场专业',
    'chic': '时尚潮流',
    'natural': '自然有机',
    'cute': '可爱甜美',
    'minimal': '极简留白',
    'modern': '现代设计',
  },
  'ai-photo': {
    'natural': '自然清新',
    'cinematic': '电影感',
    'artistic': '艺术创意',
    'magazine': '杂志封面',
    'korean': '韩系写真',
    'lifestyle': '生活方式',
    'emotional': '情绪写真',
    'studio': '影棚棚拍',
    'selfie': '高级自拍',
    'soft': '柔光梦幻',
  },
};

// ============================================================
// 比例 → SDK size 参数映射
// ============================================================

export const RATIO_TO_SIZE: Record<string, string> = {
  '1:1':  '2560x2560',
  '3:4':  '2560x3414',
  '4:3':  '3414x2560',
  '4:5':  '2560x3200',
  '5:4':  '3200x2560',
  '2:3':  '2560x3840',
  '3:2':  '3840x2560',
  '16:9': '2560x1440',
  '9:16': '1440x2560',
};

export function ratioToSize(ratio: string | undefined, fallback: string = '2K'): string {
  if (!ratio) return fallback;
  return RATIO_TO_SIZE[ratio] || fallback;
}
