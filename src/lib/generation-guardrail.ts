/**
 * Generation Guardrail — 生成质量控制系统
 *
 * 职责：
 * 1. Prompt Normalization — 规范化用户输入
 * 2. Style Anchor — 固定风格锚点，防止漂移
 * 3. Negative Enforcement — 强化负面词，减少低质量输出
 * 4. Result Validation — 基础结果验证
 * 5. Auto Retry — 质量不达标时自动重试
 */

// ================================================================
// 一、风格锚点（Style Anchor v1）
// ================================================================

export const STYLE_ANCHORS = {
  product: {
    name: 'OneClaw Product Style v1',
    anchor: 'OneClaw Product Style v1: commercial product photography, premium studio lighting, clean minimal composition, luxury material texture, Apple-style aesthetic, realistic shadows, single product focus',
  },
  portrait: {
    name: 'OneClaw Portrait Style v1',
    anchor: 'OneClaw Portrait Style v1: Korean photography style, natural skin texture, cinematic soft lighting, Xiaohongshu influencer aesthetic, shallow depth of field, warm color grading, authentic portrait',
  },
  xiaohongshu: {
    name: 'OneClaw Xiaohongshu Style v1',
    anchor: 'OneClaw Xiaohongshu Style v1: Chinese social media aesthetic, viral cover design, high click-through layout, large title area, strong visual hierarchy, lifestyle blogging style',
  },
} as const;

// ================================================================
// 二、强制约束词（Hard Constraints）
// ================================================================

export const HARD_CONSTRAINTS = {
  product: {
    must: [
      'single product only',
      'one product centered in frame',
      'product is the sole focus',
      'no other objects competing for attention',
    ],
    never: [
      'multiple products',
      'collage',
      'grid layout',
      'chaotic background',
      'cluttered composition',
      'illustration style',
      'fantasy art',
      'abstract composition',
      'cartoon',
      'anime',
      'low quality lighting',
      'multiple items',
      'grid of products',
      'split view',
      'comparison layout',
      'mosaic',
      'watermark',
      'text overlay',
    ],
  },
  portrait: {
    must: [
      'real human face only',
      'natural proportions',
      'anatomically correct',
    ],
    never: [
      'CGI face',
      'plastic skin',
      'anime face',
      'doll face',
      'extra fingers',
      'broken hands',
      'unrealistic eyes',
      'illustration style',
      '3D render',
      'game character',
      'cartoon',
      'low detail skin',
      'oversmoothed skin',
      'wax figure',
      'mannequin',
      'multiple faces',
    ],
  },
  xiaohongshu: {
    must: [
      'clean title area',
      'space for Chinese text',
      'clear visual hierarchy',
      'single focal point',
    ],
    never: [
      'western movie poster',
      'abstract poster',
      'over complicated layout',
      'no title area',
      'chaotic composition',
      'text-heavy composition',
      'dark illegible design',
      'too many elements',
      'no focal point',
      'cluttered text',
      'small unreadable text',
    ],
  },
} as const;

// ================================================================
// 三、Prompt Normalization
// ================================================================

/** 规范化用户输入：去除无意义前缀、多余空格，统一格式 */
export function normalizePrompt(input: string): string {
  let normalized = input.trim();

  // 移除常见无意义前缀
  const prefixes = [
    /^帮我生成/, /^请生成/, /^生成/, /^帮我/, /^请帮我/,
    /^创建/, /^制作/, /^设计/, /^画/, /^做/,
    /^generate\s*/i, /^create\s*/i, /^make\s*/i, /^draw\s*/i,
    /^help me\s*/i, /^please\s*/i,
  ];
  for (const prefix of prefixes) {
    normalized = normalized.replace(prefix, '');
  }

  // 移除多余空格和标点
  normalized = normalized.replace(/\s+/g, ' ').trim();
  normalized = normalized.replace(/[，]{2,}/g, '，');
  normalized = normalized.replace(/[,]{2,}/g, ',');

  // 首字母大写（英文场景）
  if (/^[a-z]/.test(normalized)) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  return normalized;
}

/** 检测用户输入中是否包含冲突指令（如同时要求多角度和单商品） */
export function detectConflicts(input: string, toolType: string): string[] {
  const conflicts: string[] = [];

  if (toolType === 'product-generator' || toolType === 'product') {
    // 商品图：检测"多角度"和"单商品"的冲突
    if (/多角度|多视角|四宫格|拼图|组合展示/.test(input)) {
      if (/单商品|单独|一个|only one/.test(input)) {
        conflicts.push('layout_conflict: 用户同时要求多角度和单商品');
      }
    }
  }

  if (toolType === 'xiaohongshu-generator' || toolType === 'xiaohongshu') {
    // 小红书：检测复杂度和留白的冲突
    if (/复杂|丰富|多层/.test(input) && /留白|简约|极简|干净/.test(input)) {
      conflicts.push('style_conflict: 用户同时要求复杂和简约');
    }
  }

  return conflicts;
}

// ================================================================
// 四、Guardrail 增强
// ================================================================

interface GuardrailInput {
  prompt: string;
  toolType: string;
  style?: string;
  layoutMode?: string;
  hasImage?: boolean;
}

interface GuardrailOutput {
  normalizedPrompt: string;
  styleAnchor: string;
  hardMustPhrases: string[];
  hardNeverPhrases: string[];
  conflicts: string[];
  warnings: string[];
}

/** 对用户输入执行完整 Guardrail 检查 */
export function applyGuardrail(input: GuardrailInput): GuardrailOutput {
  const { prompt, toolType, style, layoutMode, hasImage } = input;

  // 1. 规范化
  const normalizedPrompt = normalizePrompt(prompt);

  // 2. 确定工具类别
  const category = getToolCategory(toolType);

  // 3. 风格锚点
  const styleAnchor = STYLE_ANCHORS[category]?.anchor || '';

  // 4. 硬约束
  const constraints = HARD_CONSTRAINTS[category] || { must: [], never: [] };
  const hardMustPhrases: string[] = [...constraints.must];
  const hardNeverPhrases: string[] = [...constraints.never];

  // 5. 特殊增强：商品图必须强调单商品
  if (category === 'product' && layoutMode !== 'multi-angle') {
    hardMustPhrases.push('single product hero shot');
  }

  // 6. 特殊增强：小红书必须强调标题区域
  if (category === 'xiaohongshu') {
    hardMustPhrases.push('reserve large clean area at top for Chinese title text');
  }

  // 7. 特殊增强：写真有参考图时
  if (category === 'portrait' && hasImage) {
    hardMustPhrases.push('maintain facial resemblance to reference photo');
  }

  // 8. 冲突检测
  const conflicts = detectConflicts(prompt, toolType);

  // 9. 警告
  const warnings: string[] = [];
  if (normalizedPrompt.length < 5) {
    warnings.push('prompt_too_short: 用户描述过短，可能影响生成质量');
  }
  if (normalizedPrompt.length > 200) {
    warnings.push('prompt_too_long: 用户描述过长，可能引入噪声');
  }

  return {
    normalizedPrompt,
    styleAnchor,
    hardMustPhrases,
    hardNeverPhrases,
    conflicts,
    warnings,
  };
}

// ================================================================
// 五、结果验证
// ================================================================

interface ValidationResult {
  passed: boolean;
  issues: string[];
  shouldRetry: boolean;
}

/** 基础结果验证（检查生成结果的基本属性） */
export function validateGenerationResult(
  imageUrls: string[],
  toolType: string,
  expectedCount: number
): ValidationResult {
  const issues: string[] = [];

  // 1. 检查是否有结果
  if (!imageUrls || imageUrls.length === 0) {
    return {
      passed: false,
      issues: ['no_images: 生成结果为空'],
      shouldRetry: true,
    };
  }

  // 2. 检查 URL 有效性
  const validUrls = imageUrls.filter(url =>
    typeof url === 'string' && url.startsWith('http') && url.length > 20
  );
  if (validUrls.length < imageUrls.length) {
    issues.push(`invalid_urls: ${imageUrls.length - validUrls.length} 个 URL 无效`);
  }

  // 3. 检查数量是否符合预期
  if (expectedCount > 1 && validUrls.length < expectedCount) {
    issues.push(`count_mismatch: 期望 ${expectedCount} 张，实际 ${validUrls.length} 张`);
  }

  // 4. 检查重复 URL
  const uniqueUrls = new Set(validUrls);
  if (uniqueUrls.size < validUrls.length) {
    issues.push(`duplicate_urls: ${validUrls.length - uniqueUrls.size} 个重复图片`);
  }

  const shouldRetry = issues.some(i =>
    i.startsWith('no_images') || i.startsWith('invalid_urls')
  );

  return {
    passed: issues.length === 0,
    issues,
    shouldRetry,
  };
}

// ================================================================
// 六、Retry 策略
// ================================================================

export const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelayMs: 1000, // 重试间隔
  backoffMultiplier: 1.5, // 退避倍数
} as const;

/** 构建重试 Prompt（在原有基础上加强约束） */
export function buildRetryPrompt(
  originalPrompt: string,
  toolType: string,
  attemptNumber: number
): string {
  const category = getToolCategory(toolType);

  // 每次重试加强约束力度
  const reinforcementByAttempt: Record<number, string> = {
    1: 'IMPORTANT: Ensure single product only, no collage, no grid, clean composition. ',
    2: 'CRITICAL REQUIREMENT: Exactly one product centered, absolutely no multiple items, no collage effect, premium commercial photography only. ',
  };

  const productReinforcement = reinforcementByAttempt[attemptNumber] || '';
  const portraitReinforcement = attemptNumber > 0
    ? 'IMPORTANT: Realistic human portrait only, natural skin, no CGI, no plastic, no anime. '
    : '';
  const xiaohongshuReinforcement = attemptNumber > 0
    ? 'IMPORTANT: Clean Xiaohongshu cover with title area, no clutter, no movie poster style. '
    : '';

  const reinforcements: Record<string, string> = {
    product: productReinforcement,
    portrait: portraitReinforcement,
    xiaohongshu: xiaohongshuReinforcement,
  };

  const reinforcement = reinforcements[category] || '';

  // 重试时追加更强的负面词
  const extraNegatives: Record<string, string> = {
    product: 'Avoid: multiple products, collage, grid, chaotic background, illustration, cartoon, anime, fantasy',
    portrait: 'Avoid: CGI, plastic skin, anime, doll face, extra fingers, broken hands, 3D render',
    xiaohongshu: 'Avoid: movie poster, abstract art, cluttered layout, no title area, western design',
  };

  const extraNegative = extraNegatives[category]
    ? `. ${extraNegatives[category]}`
    : '';

  return `${reinforcement}${originalPrompt}${extraNegative}`;
}

// ================================================================
// 辅助函数
// ================================================================

function getToolCategory(toolType: string): 'product' | 'portrait' | 'xiaohongshu' {
  if (/product|商品/.test(toolType)) return 'product';
  if (/portrait|photo|写真|ai-photo/.test(toolType)) return 'portrait';
  if (/xiaohongshu|小红书|xhs/.test(toolType)) return 'xiaohongshu';
  // 默认按商品图处理
  return 'product';
}

// ================================================================
// 便捷导出（供 prompt-engine.ts 使用）
// ================================================================

/** 获取风格锚点 prompt */
export function getAnchorPrompt(toolType: string): string {
  const category = getToolCategory(toolType);
  return STYLE_ANCHORS[category]?.anchor || '';
}

/** 构建负面提示词（用于模型 API 的 negative_prompt 参数） */
export function buildNegativePrompt(toolType: string): string {
  const category = getToolCategory(toolType);
  const constraints = HARD_CONSTRAINTS[category];
  if (!constraints) return '';
  return constraints.never.join(', ');
}

/** 判断是否应该重试 */
export function shouldRetry(
  imageUrls: string[],
  toolType: string,
  expectedCount: number
): boolean {
  return validateGenerationResult(imageUrls, toolType, expectedCount).shouldRetry;
}

/** 获取最大重试次数 */
export function getMaxRetries(): number {
  return RETRY_CONFIG.maxRetries;
}

/** Guardrail 结果类型（对外导出） */
export type { GuardrailOutput as GuardrailResult, ValidationResult };
