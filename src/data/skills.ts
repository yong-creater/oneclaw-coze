// AI Skills 技能市场数据 - 类似 SkillHub

export interface SkillItem {
  id: string;
  name: string;
  identifier: string; // 技能标识符，如 find-skills
  description: string;
  icon: string; // emoji 或首字母
  logo?: string; // 真实 logo URL（可选）
  version: string;
  author: string;
  source: string; // 来源
  sourceUrl?: string;
  tags: string[];
  category: string;
  featured?: boolean;
  downloads: number; // 下载量
  favorites: number; // 收藏数
  installs: number; // 安装量
  installGuide: {
    agent: string; // Agent 安装指南
    human: string; // Human 安装指南
  };
  updatedAt: string;
}

// 技能分类
export interface SkillCategory {
  name: string;
  icon: string;
  count: number;
}

// 获取技能分类
export function getSkillCategories(): SkillCategory[] {
  const categories: Record<string, SkillCategory> = {
    '全部': { name: '全部', icon: '🎯', count: 0 },
    '搜索工具': { name: '搜索工具', icon: '🔍', count: 0 },
    '文件处理': { name: '文件处理', icon: '📁', count: 0 },
    '数据分析': { name: '数据分析', icon: '📊', count: 0 },
    '图像处理': { name: '图像处理', icon: '🖼️', count: 0 },
    '代码开发': { name: '代码开发', icon: '💻', count: 0 },
    '写作助手': { name: '写作助手', icon: '✍️', count: 0 },
    '效率工具': { name: '效率工具', icon: '⚡', count: 0 },
    '其他': { name: '其他', icon: '📦', count: 0 },
  };

  aiSkills.forEach(skill => {
    if (categories[skill.category]) {
      categories[skill.category].count++;
    }
    categories['全部'].count++;
  });

  return Object.values(categories);
}

// 格式化数字显示
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + '千';
  }
  return num.toString();
}

export const aiSkills: SkillItem[] = [
  {
    id: '1',
    name: 'Find Skills',
    identifier: 'find-skills',
    description: '当用户询问如何操作、寻找技能或有意扩展功能时，帮助发现并安装技能。',
    icon: '🔍',
    version: 'v0.1.0',
    author: 'jimliuxinghai',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['搜索', '技能发现', '安装'],
    category: '搜索工具',
    featured: true,
    downloads: 223000,
    favorites: 907,
    installs: 3600,
    installGuide: {
      agent: '请先检查是否已安装 SkillHub 商店，若未安装，请根据文档安装 SkillHub 商店，但是只安装 CLI，然后安装 find-skills 技能。若已安装，则直接安装 find-skills 技能。',
      human: '访问 SkillHub 官网，搜索 find-skills 技能，点击安装按钮按照提示完成安装。'
    },
    updatedAt: '2024-03-15'
  },
  {
    id: '2',
    name: 'Web Search',
    identifier: 'web-search',
    description: '为 AI 提供实时网络搜索能力，获取最新的网络信息和新闻动态。',
    icon: '🌐',
    version: 'v0.2.1',
    author: 'skillteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['搜索', '网络', '实时信息'],
    category: '搜索工具',
    featured: true,
    downloads: 456000,
    favorites: 1823,
    installs: 8900,
    installGuide: {
      agent: '安装 web-search 技能后，AI 将获得实时网络搜索能力，可以获取最新的网页内容和搜索结果。',
      human: '在 SkillHub 中搜索 web-search，点击安装并按照提示配置 API 密钥。'
    },
    updatedAt: '2024-03-20'
  },
  {
    id: '3',
    name: 'Image Generator',
    identifier: 'image-generator',
    description: '使用 AI 生成高质量图像，支持多种风格和尺寸，可自定义提示词。',
    icon: '🎨',
    version: 'v1.0.3',
    author: 'aiteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['图像生成', 'AI绘画', '创意'],
    category: '图像处理',
    featured: true,
    downloads: 389000,
    favorites: 2156,
    installs: 7200,
    installGuide: {
      agent: '安装 image-generator 技能后，AI 可以根据用户描述生成各种风格的图像。',
      human: '在 SkillHub 中搜索 image-generator，安装后配置图像生成服务的 API。'
    },
    updatedAt: '2024-03-18'
  },
  {
    id: '4',
    name: 'Code Interpreter',
    identifier: 'code-interpreter',
    description: '安全执行 Python 代码，支持数据分析、可视化、文件处理等任务。',
    icon: '💻',
    version: 'v0.3.2',
    author: 'devteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['代码执行', 'Python', '数据分析'],
    category: '代码开发',
    featured: true,
    downloads: 567000,
    favorites: 3421,
    installs: 12500,
    installGuide: {
      agent: '安装 code-interpreter 技能后，AI 可以安全地执行 Python 代码进行计算和数据处理。',
      human: '在 SkillHub 中搜索 code-interpreter，安装后即可使用代码执行功能。'
    },
    updatedAt: '2024-03-22'
  },
  {
    id: '5',
    name: 'PDF Reader',
    identifier: 'pdf-reader',
    description: '读取和解析 PDF 文档，提取文本内容、表格数据，支持多语言 OCR。',
    icon: '📄',
    version: 'v0.1.8',
    author: 'docteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['PDF', '文档处理', 'OCR'],
    category: '文件处理',
    downloads: 234000,
    favorites: 1234,
    installs: 5600,
    installGuide: {
      agent: '安装 pdf-reader 技能后，AI 可以读取和解析 PDF 文档内容。',
      human: '在 SkillHub 中搜索 pdf-reader，安装后上传 PDF 文件即可解析。'
    },
    updatedAt: '2024-03-10'
  },
  {
    id: '6',
    name: 'Weather',
    identifier: 'weather',
    description: '获取全球各地的实时天气信息和天气预报，支持多种语言和单位。',
    icon: '🌤️',
    version: 'v0.2.0',
    author: 'infoteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['天气', '预报', '实时信息'],
    category: '其他',
    downloads: 178000,
    favorites: 567,
    installs: 3200,
    installGuide: {
      agent: '安装 weather 技能后，AI 可以查询全球各地的实时天气和预报信息。',
      human: '在 SkillHub 中搜索 weather，安装后即可查询天气信息。'
    },
    updatedAt: '2024-03-12'
  },
  {
    id: '7',
    name: 'Chart Maker',
    identifier: 'chart-maker',
    description: '根据数据自动生成各种类型的图表，支持柱状图、折线图、饼图等。',
    icon: '📊',
    version: 'v0.4.1',
    author: 'vizteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['图表', '数据可视化', '报告'],
    category: '数据分析',
    featured: true,
    downloads: 312000,
    favorites: 1678,
    installs: 6800,
    installGuide: {
      agent: '安装 chart-maker 技能后，AI 可以根据数据自动生成专业的图表。',
      human: '在 SkillHub 中搜索 chart-maker，安装后提供数据即可生成图表。'
    },
    updatedAt: '2024-03-19'
  },
  {
    id: '8',
    name: 'Translator',
    identifier: 'translator',
    description: '多语言翻译工具，支持 100+ 种语言互译，保持原文风格和语境。',
    icon: '🌐',
    version: 'v0.5.0',
    author: 'langteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['翻译', '多语言', '国际化'],
    category: '效率工具',
    downloads: 445000,
    favorites: 2345,
    installs: 9100,
    installGuide: {
      agent: '安装 translator 技能后，AI 可以进行高质量的多语言翻译。',
      human: '在 SkillHub 中搜索 translator，安装后即可使用翻译功能。'
    },
    updatedAt: '2024-03-21'
  },
  {
    id: '9',
    name: 'Video Downloader',
    identifier: 'video-downloader',
    description: '下载各大平台的视频内容，支持多种格式和分辨率选择。',
    icon: '🎬',
    version: 'v0.2.3',
    author: 'mediamate',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['视频', '下载', '媒体'],
    category: '文件处理',
    downloads: 289000,
    favorites: 1456,
    installs: 5400,
    installGuide: {
      agent: '安装 video-downloader 技能后，AI 可以帮助下载支持平台的视频内容。',
      human: '在 SkillHub 中搜索 video-downloader，安装后提供视频链接即可下载。'
    },
    updatedAt: '2024-03-14'
  },
  {
    id: '10',
    name: 'OCR Tool',
    identifier: 'ocr-tool',
    description: '图片文字识别工具，支持印刷体和手写体识别，准确率高达 99%。',
    icon: '👁️',
    version: 'v0.3.0',
    author: 'aiteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['OCR', '文字识别', '图片处理'],
    category: '图像处理',
    downloads: 356000,
    favorites: 1890,
    installs: 7300,
    installGuide: {
      agent: '安装 ocr-tool 技能后，AI 可以识别图片中的文字内容。',
      human: '在 SkillHub 中搜索 ocr-tool，安装后上传图片即可识别文字。'
    },
    updatedAt: '2024-03-16'
  },
  {
    id: '11',
    name: 'Markdown Editor',
    identifier: 'markdown-editor',
    description: 'Markdown 编辑和渲染工具，支持实时预览和多种导出格式。',
    icon: '📝',
    version: 'v0.1.5',
    author: 'editorteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['Markdown', '编辑器', '文档'],
    category: '写作助手',
    downloads: 198000,
    favorites: 987,
    installs: 4100,
    installGuide: {
      agent: '安装 markdown-editor 技能后，AI 可以帮助编辑和渲染 Markdown 文档。',
      human: '在 SkillHub 中搜索 markdown-editor，安装后即可编辑 Markdown 文档。'
    },
    updatedAt: '2024-03-11'
  },
  {
    id: '12',
    name: 'SQL Helper',
    identifier: 'sql-helper',
    description: 'SQL 查询生成和优化工具，支持多种数据库，自动优化查询性能。',
    icon: '🗃️',
    version: 'v0.2.8',
    author: 'dbteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['SQL', '数据库', '查询优化'],
    category: '代码开发',
    downloads: 167000,
    favorites: 823,
    installs: 3500,
    installGuide: {
      agent: '安装 sql-helper 技能后，AI 可以帮助生成和优化 SQL 查询语句。',
      human: '在 SkillHub 中搜索 sql-helper，安装后描述需求即可生成 SQL。'
    },
    updatedAt: '2024-03-13'
  },
  {
    id: '13',
    name: 'Meeting Notes',
    identifier: 'meeting-notes',
    description: '自动整理会议记录，提取关键信息和待办事项，生成结构化摘要。',
    icon: '📋',
    version: 'v0.1.2',
    author: 'prodteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['会议', '笔记', '摘要'],
    category: '效率工具',
    downloads: 145000,
    favorites: 678,
    installs: 2900,
    installGuide: {
      agent: '安装 meeting-notes 技能后，AI 可以帮助整理会议记录和提取要点。',
      human: '在 SkillHub 中搜索 meeting-notes，安装后上传会议内容即可整理。'
    },
    updatedAt: '2024-03-09'
  },
  {
    id: '14',
    name: 'API Tester',
    identifier: 'api-tester',
    description: 'API 接口测试工具，支持 RESTful 和 GraphQL，自动生成测试报告。',
    icon: '🔌',
    version: 'v0.3.5',
    author: 'apiteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['API', '测试', '调试'],
    category: '代码开发',
    downloads: 134000,
    favorites: 534,
    installs: 2300,
    installGuide: {
      agent: '安装 api-tester 技能后，AI 可以帮助测试 API 接口并生成报告。',
      human: '在 SkillHub 中搜索 api-tester，安装后提供 API 信息即可测试。'
    },
    updatedAt: '2024-03-17'
  },
  {
    id: '15',
    name: 'Email Writer',
    identifier: 'email-writer',
    description: '智能邮件撰写助手，根据场景生成专业邮件，支持多种语言和风格。',
    icon: '📧',
    version: 'v0.2.1',
    author: 'writeteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['邮件', '写作', '商务'],
    category: '写作助手',
    downloads: 223000,
    favorites: 1123,
    installs: 4800,
    installGuide: {
      agent: '安装 email-writer 技能后，AI 可以帮助撰写专业的邮件内容。',
      human: '在 SkillHub 中搜索 email-writer，安装后描述邮件场景即可生成。'
    },
    updatedAt: '2024-03-08'
  },
  {
    id: '16',
    name: 'Image Editor',
    identifier: 'image-editor',
    description: 'AI 图像编辑工具，支持抠图、调色、滤镜、修复等功能。',
    icon: '🖼️',
    version: 'v0.4.2',
    author: 'editteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['图像编辑', '抠图', '修图'],
    category: '图像处理',
    downloads: 267000,
    favorites: 1345,
    installs: 5800,
    installGuide: {
      agent: '安装 image-editor 技能后，AI 可以帮助进行图像编辑和处理。',
      human: '在 SkillHub 中搜索 image-editor，安装后上传图片即可编辑。'
    },
    updatedAt: '2024-03-07'
  },
  {
    id: '17',
    name: 'Data Cleaner',
    identifier: 'data-cleaner',
    description: '数据清洗和预处理工具，自动处理缺失值、异常值和重复数据。',
    icon: '🧹',
    version: 'v0.1.9',
    author: 'datateam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['数据清洗', '预处理', '数据分析'],
    category: '数据分析',
    downloads: 156000,
    favorites: 789,
    installs: 3400,
    installGuide: {
      agent: '安装 data-cleaner 技能后，AI 可以帮助清洗和预处理数据。',
      human: '在 SkillHub 中搜索 data-cleaner，安装后上传数据文件即可处理。'
    },
    updatedAt: '2024-03-06'
  },
  {
    id: '18',
    name: 'Calendar',
    identifier: 'calendar',
    description: '日程管理和提醒工具，支持创建、查询和管理日程安排。',
    icon: '📅',
    version: 'v0.2.4',
    author: 'prodteam',
    source: 'SkillHub',
    sourceUrl: 'https://skillhub.tencent.com',
    tags: ['日程', '时间管理', '提醒'],
    category: '效率工具',
    downloads: 189000,
    favorites: 956,
    installs: 4200,
    installGuide: {
      agent: '安装 calendar 技能后，AI 可以帮助管理日程和设置提醒。',
      human: '在 SkillHub 中搜索 calendar，安装后即可管理日程安排。'
    },
    updatedAt: '2024-03-05'
  }
];

// 获取热门技能
export function getFeaturedSkills(): SkillItem[] {
  return aiSkills.filter(skill => skill.featured);
}

// 获取技能总数
export function getTotalSkillsCount(): number {
  return aiSkills.length;
}
