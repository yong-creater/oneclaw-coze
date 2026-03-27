// AI 技能数据

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string; // emoji 图标
  tags: string[];
  featured?: boolean;
  difficulty: '入门' | '进阶' | '高级';
  timeRequired: string; // 预计学习时间
  tools: string[]; // 相关工具
  scenario: string; // 应用场景
  steps: string[]; // 使用步骤
  tips: string[]; // 技巧提示
  examples?: string[]; // 示例
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
    '视频创作': { name: '视频创作', icon: '🎬', count: 0 },
    '图像设计': { name: '图像设计', icon: '🎨', count: 0 },
    '写作助手': { name: '写作助手', icon: '✍️', count: 0 },
    '编程开发': { name: '编程开发', icon: '💻', count: 0 },
    '音频处理': { name: '音频处理', icon: '🎵', count: 0 },
    '办公效率': { name: '办公效率', icon: '📊', count: 0 },
    '学习研究': { name: '学习研究', icon: '📚', count: 0 },
    '营销推广': { name: '营销推广', icon: '📢', count: 0 },
  };

  aiSkills.forEach(skill => {
    if (categories[skill.category]) {
      categories[skill.category].count++;
    }
    categories['全部'].count++;
  });

  return Object.values(categories);
}

export const aiSkills: SkillItem[] = [
  // ========== 视频创作技能 ==========
  {
    id: '1',
    name: 'AI 文生视频制作',
    description: '使用 AI 工具将文字描述转换为高质量视频内容',
    category: '视频创作',
    icon: '🎬',
    tags: ['视频生成', '文生视频', '内容创作'],
    featured: true,
    difficulty: '入门',
    timeRequired: '15-30分钟',
    tools: ['即梦 AI', '可灵 AI', 'Runway', 'Pika', 'Sora'],
    scenario: '适用于短视频创作者、营销人员快速制作视频内容，无需拍摄和剪辑技能',
    steps: [
      '选择合适的 AI 视频生成工具',
      '构思并撰写详细的视频描述提示词',
      '设置视频参数（时长、风格、比例等）',
      '生成视频并预览效果',
      '根据需要调整提示词重新生成',
      '下载并进行后期编辑优化'
    ],
    tips: [
      '提示词越详细，生成效果越好',
      '描述要包含画面内容、风格、氛围等要素',
      '可以参考优秀案例的提示词结构',
      '多尝试不同工具，找到最适合的'
    ],
    examples: [
      '一只可爱的橘猫在阳光下打盹，毛发蓬松柔软，背景是温馨的客厅，柔和的光线，温馨治愈的风格',
      '城市夜景延时摄影，高楼大厦灯火通明，车流如织，霓虹闪烁，赛博朋克风格'
    ]
  },
  {
    id: '2',
    name: 'AI 图生视频技巧',
    description: '将静态图片转换为动态视频，让图片"活起来"',
    category: '视频创作',
    icon: '🖼️',
    tags: ['图生视频', '动画制作', '图片动效'],
    featured: true,
    difficulty: '进阶',
    timeRequired: '20-40分钟',
    tools: ['可灵 AI', 'Runway', 'Pika', 'Vidu', '即梦 AI'],
    scenario: '适用于电商产品展示、艺术作品动效化、照片转视频等场景',
    steps: [
      '准备高质量的静态图片素材',
      '选择支持图生视频的 AI 工具',
      '上传图片并描述期望的动态效果',
      '设置运动强度和方向参数',
      '生成预览并调整效果',
      '导出满意的视频成品'
    ],
    tips: [
      '图片质量越高，生成效果越好',
      '主体清晰的图片更容易生成好效果',
      '可以描述具体的运动方式（如"向右旋转"、"缓慢放大"）',
      '注意图片版权问题'
    ]
  },
  {
    id: '3',
    name: 'AI 数字人口播视频',
    description: '使用 AI 数字人制作口播视频，无需真人出镜',
    category: '视频创作',
    icon: '🧑‍💼',
    tags: ['数字人', '口播视频', '虚拟主播'],
    featured: true,
    difficulty: '入门',
    timeRequired: '10-20分钟',
    tools: ['HeyGen', '有言', '蝉镜', 'Keevx', 'D-ID'],
    scenario: '适用于企业宣传、培训视频、新闻播报、电商带货等场景',
    steps: [
      '选择数字人形象或上传照片定制',
      '编写口播脚本内容',
      '选择合适的声音和语速',
      '设置背景和字幕样式',
      '生成视频并预览',
      '调整后导出最终版本'
    ],
    tips: [
      '脚本要口语化，避免过于书面',
      '选择与内容调性匹配的数字人形象',
      '注意数字人的表情和口型同步',
      '可以添加品牌元素增强专业性'
    ]
  },
  {
    id: '4',
    name: 'AI 视频风格转换',
    description: '将视频转换为不同的艺术风格，实现创意效果',
    category: '视频创作',
    icon: '🎭',
    tags: ['风格转换', '视频特效', '艺术风格'],
    difficulty: '进阶',
    timeRequired: '30-60分钟',
    tools: ['Runway', 'DomoAI', 'Kaiber', 'DraGAN'],
    scenario: '适用于音乐视频、艺术创作、广告特效等创意视频制作',
    steps: [
      '准备需要转换风格的原始视频',
      '选择目标风格（动漫、油画、赛博朋克等）',
      '上传视频到 AI 风格转换工具',
      '调整风格强度和参数',
      '预览转换效果',
      '导出处理后的视频'
    ],
    tips: [
      '视频时长不宜过长，建议分段处理',
      '选择风格要与视频内容匹配',
      '可以尝试多种风格组合效果',
      '注意保持角色一致性'
    ]
  },
  {
    id: '5',
    name: 'AI 视频字幕生成',
    description: '自动识别视频语音并生成字幕，支持多语言翻译',
    category: '视频创作',
    icon: '📝',
    tags: ['字幕生成', '语音识别', '视频翻译'],
    difficulty: '入门',
    timeRequired: '5-15分钟',
    tools: ['剪映', 'Arctime', '讯飞听见', 'Vrew'],
    scenario: '适用于短视频字幕、会议记录、课程字幕、多语言视频制作',
    steps: [
      '导入需要添加字幕的视频',
      '选择 AI 字幕工具的自动识别功能',
      '设置识别语言和字幕样式',
      '等待 AI 自动生成字幕',
      '校对并修正错误内容',
      '导出带字幕的视频或字幕文件'
    ],
    tips: [
      '音频质量越好，识别准确率越高',
      '专业术语需要手动校对',
      '可以设置关键词提高识别准确率',
      '注意字幕的时间轴同步'
    ]
  },

  // ========== 图像设计技能 ==========
  {
    id: '6',
    name: 'AI 图像生成基础',
    description: '掌握 AI 图像生成的核心技巧，从零开始创作精美图像',
    category: '图像设计',
    icon: '🎨',
    tags: ['图像生成', 'AI绘画', '创意设计'],
    featured: true,
    difficulty: '入门',
    timeRequired: '20-30分钟',
    tools: ['Midjourney', 'DALL-E', 'Stable Diffusion', '即梦 AI', 'LiblibAI'],
    scenario: '适用于创意设计、概念图绘制、素材制作、艺术创作等场景',
    steps: [
      '选择合适的 AI 图像生成工具',
      '构思并撰写详细的图像描述提示词',
      '选择图像尺寸和风格参数',
      '生成图像并查看效果',
      '根据结果调整提示词优化',
      '下载或进一步编辑图像'
    ],
    tips: [
      '提示词结构：主体 + 细节 + 风格 + 氛围',
      '使用英文提示词效果通常更好',
      '可以添加艺术家风格关键词',
      '多尝试不同的参数组合'
    ],
    examples: [
      'A majestic lion standing on a cliff at sunset, golden hour lighting, dramatic atmosphere, highly detailed, 8k resolution',
      '未来城市天际线，霓虹灯光，赛博朋克风格，雨夜氛围，高清细节'
    ]
  },
  {
    id: '7',
    name: 'AI 图像编辑与修复',
    description: '使用 AI 工具进行图像编辑、修复和增强',
    category: '图像设计',
    icon: '✂️',
    tags: ['图像编辑', '图像修复', '图像增强'],
    difficulty: '进阶',
    timeRequired: '15-30分钟',
    tools: ['Photoshop AI', '美图秀秀', 'Clipdrop', 'Cleanup.pictures'],
    scenario: '适用于照片修复、背景移除、物体消除、图像增强等场景',
    steps: [
      '导入需要编辑的图像',
      '选择合适的 AI 编辑功能',
      '标记需要修改的区域',
      '执行 AI 编辑操作',
      '预览并微调效果',
      '导出处理后的图像'
    ],
    tips: [
      '选区要尽量精确，避免误处理',
      '可以多次小范围处理获得更好效果',
      '注意保持图像的自然过渡',
      '保留原始图像备份'
    ]
  },
  {
    id: '8',
    name: 'AI Logo 与品牌设计',
    description: '使用 AI 快速生成 Logo 和品牌视觉设计方案',
    category: '图像设计',
    icon: '💎',
    tags: ['Logo设计', '品牌设计', '视觉识别'],
    difficulty: '进阶',
    timeRequired: '30-60分钟',
    tools: ['Midjourney', 'Looka', 'Brandmark', 'Designs.ai'],
    scenario: '适用于初创企业、个人品牌、产品品牌的视觉设计',
    steps: [
      '明确品牌定位和设计需求',
      '收集相关风格参考',
      '使用 AI 生成 Logo 方案',
      '筛选满意的方案进行优化',
      '生成完整的品牌视觉系统',
      '导出不同格式的设计文件'
    ],
    tips: [
      '提供清晰的品牌描述和关键词',
      '多生成几个方案进行对比选择',
      '注意 Logo 的可识别性和简洁性',
      '考虑不同场景的应用效果'
    ]
  },

  // ========== 写作助手技能 ==========
  {
    id: '9',
    name: 'AI 文章写作',
    description: '使用 AI 辅助撰写各类文章，提升写作效率',
    category: '写作助手',
    icon: '✍️',
    tags: ['文章写作', '内容创作', 'AI写作'],
    featured: true,
    difficulty: '入门',
    timeRequired: '10-30分钟',
    tools: ['ChatGPT', 'Claude', '文心一言', '讯飞星火', 'Kimi'],
    scenario: '适用于博客文章、公众号内容、新闻稿、营销文案等写作场景',
    steps: [
      '明确文章主题和目标读者',
      '构思文章大纲和关键要点',
      '使用 AI 生成初稿内容',
      '审阅并修改 AI 生成的内容',
      '添加个人观点和细节',
      '润色语言并检查错误'
    ],
    tips: [
      '提供详细的写作要求和背景信息',
      'AI 生成的内容需要人工审核修改',
      '分段落生成可以获得更好的效果',
      '注意内容的原创性和真实性'
    ]
  },
  {
    id: '10',
    name: 'AI 营销文案创作',
    description: '快速生成吸引人的营销文案和广告创意',
    category: '写作助手',
    icon: '📢',
    tags: ['营销文案', '广告创意', '转化率'],
    difficulty: '进阶',
    timeRequired: '15-45分钟',
    tools: ['ChatGPT', 'Copy.ai', 'Jasper', '秘塔写作猫'],
    scenario: '适用于电商详情页、广告投放、社交媒体推广等营销场景',
    steps: [
      '分析产品特点和目标受众',
      '确定文案风格和调性',
      '输入产品信息和营销目标',
      '生成多个文案方案',
      'A/B 测试筛选最优方案',
      '优化并定稿文案'
    ],
    tips: [
      '突出产品独特卖点和用户利益',
      '使用数据和案例增强说服力',
      '注意文案的合规性和真实性',
      '根据平台特点调整文案风格'
    ]
  },
  {
    id: '11',
    name: 'AI 学术写作辅助',
    description: '使用 AI 辅助学术论文写作和研究整理',
    category: '写作助手',
    icon: '📖',
    tags: ['学术写作', '论文辅助', '研究整理'],
    difficulty: '高级',
    timeRequired: '1-3小时',
    tools: ['ChatGPT', 'Claude', 'Scholarcy', 'Elicit'],
    scenario: '适用于论文写作、文献综述、研究报告等学术场景',
    steps: [
      '确定研究主题和论文框架',
      '使用 AI 辅助文献检索和总结',
      'AI 辅助生成初稿框架',
      '填充具体研究内容',
      'AI 辅助润色和格式化',
      '检查引用和参考文献'
    ],
    tips: [
      'AI 生成内容仅作参考，需验证准确性',
      '注意学术诚信，合理引用',
      '核心观点和创新必须原创',
      '使用 AI 检查语法和表达'
    ]
  },

  // ========== 编程开发技能 ==========
  {
    id: '12',
    name: 'AI 代码生成与补全',
    description: '使用 AI 辅助编程，快速生成和补全代码',
    category: '编程开发',
    icon: '💻',
    tags: ['代码生成', 'AI编程', '开发效率'],
    featured: true,
    difficulty: '入门',
    timeRequired: '持续使用',
    tools: ['GitHub Copilot', 'Cursor', 'ChatGPT', 'Claude', 'Codeium'],
    scenario: '适用于日常开发、快速原型、代码学习、Bug 修复等场景',
    steps: [
      '安装并配置 AI 编程助手',
      '在 IDE 中启用 AI 补全功能',
      '编写代码时接受 AI 建议',
      '使用 Chat 功能解决复杂问题',
      '审查 AI 生成的代码',
      '测试并优化代码质量'
    ],
    tips: [
      '清晰的注释可以帮助 AI 理解意图',
      '不要盲目接受所有 AI 建议',
      '注意代码的安全性和性能',
      '持续学习和验证 AI 生成的代码'
    ]
  },
  {
    id: '13',
    name: 'AI Bug 调试与修复',
    description: '使用 AI 快速定位和修复代码 Bug',
    category: '编程开发',
    icon: '🐛',
    tags: ['Bug修复', '代码调试', '问题排查'],
    difficulty: '进阶',
    timeRequired: '15-60分钟',
    tools: ['ChatGPT', 'Claude', 'GitHub Copilot', 'Cursor'],
    scenario: '适用于代码调试、错误修复、性能优化等开发场景',
    steps: [
      '收集错误信息和相关代码',
      '向 AI 描述问题和上下文',
      'AI 分析可能的原因',
      '根据 AI 建议修复代码',
      '测试验证修复效果',
      '记录问题和解决方案'
    ],
    tips: [
      '提供完整的错误信息和代码上下文',
      '描述清楚期望行为和实际行为',
      'AI 建议需要验证后再应用',
      '学习 AI 的分析思路提升自己'
    ]
  },
  {
    id: '14',
    name: 'AI 代码审查与优化',
    description: '使用 AI 进行代码审查，提升代码质量',
    category: '编程开发',
    icon: '🔍',
    tags: ['代码审查', '代码优化', '最佳实践'],
    difficulty: '进阶',
    timeRequired: '30-60分钟',
    tools: ['ChatGPT', 'Claude', 'GitHub Copilot', 'SonarQube'],
    scenario: '适用于代码评审、重构优化、技术债务处理等场景',
    steps: [
      '准备需要审查的代码',
      '向 AI 提供代码和上下文',
      '请求 AI 进行代码审查',
      '分析 AI 提出的建议',
      '选择性采纳并优化代码',
      '验证优化后的效果'
    ],
    tips: [
      '提供足够的上下文信息',
      '指定关注的审查维度（性能、安全、可读性）',
      '结合团队规范进行判断',
      '不要过度依赖 AI 建议'
    ]
  },

  // ========== 音频处理技能 ==========
  {
    id: '15',
    name: 'AI 语音合成',
    description: '使用 AI 将文本转换为自然流畅的语音',
    category: '音频处理',
    icon: '🎤',
    tags: ['语音合成', 'TTS', '配音'],
    difficulty: '入门',
    timeRequired: '10-30分钟',
    tools: ['Azure TTS', '讯飞语音', 'ElevenLabs', '剪映配音'],
    scenario: '适用于视频配音、有声书、播客、语音通知等场景',
    steps: [
      '准备需要合成的文本内容',
      '选择合适的 AI 语音合成工具',
      '选择或定制声音模型',
      '调整语速、语调等参数',
      '生成语音并预览效果',
      '导出音频文件'
    ],
    tips: [
      '选择与内容匹配的声音类型',
      '适当添加标点控制节奏',
      '可以使用 SSML 标签增强表现',
      '注意语音的版权问题'
    ]
  },
  {
    id: '16',
    name: 'AI 音乐创作',
    description: '使用 AI 生成原创音乐和背景音乐',
    category: '音频处理',
    icon: '🎵',
    tags: ['音乐生成', '背景音乐', '原创音乐'],
    featured: true,
    difficulty: '进阶',
    timeRequired: '20-45分钟',
    tools: ['Suno', 'Udio', 'Stable Audio', 'Mubert'],
    scenario: '适用于视频配乐、游戏音乐、广告音乐、个人创作等场景',
    steps: [
      '确定音乐风格和情绪',
      '描述期望的音乐效果',
      '选择时长和结构参数',
      '生成音乐并预览',
      '选择满意的版本',
      '下载并应用到项目中'
    ],
    tips: [
      '详细描述音乐风格、乐器、节奏',
      '可以参考现有歌曲的风格',
      '多生成几个版本对比选择',
      '注意音乐的版权和使用范围'
    ]
  },

  // ========== 办公效率技能 ==========
  {
    id: '17',
    name: 'AI PPT 快速制作',
    description: '使用 AI 快速生成专业的 PPT 演示文稿',
    category: '办公效率',
    icon: '📊',
    tags: ['PPT制作', '演示文稿', '办公效率'],
    featured: true,
    difficulty: '入门',
    timeRequired: '15-30分钟',
    tools: ['Gamma', 'Beautiful.ai', '讯飞智文', 'MindShow'],
    scenario: '适用于工作汇报、产品介绍、培训课件、商业提案等场景',
    steps: [
      '确定 PPT 主题和核心内容',
      '使用 AI 生成 PPT 大纲',
      '选择合适的模板风格',
      'AI 自动生成完整 PPT',
      '调整内容和设计细节',
      '导出并演示'
    ],
    tips: [
      '提供清晰的主题和要点',
      '选择与场景匹配的模板',
      '适当添加图表和图片',
      '保持简洁，避免内容过多'
    ]
  },
  {
    id: '18',
    name: 'AI 表格数据处理',
    description: '使用 AI 处理 Excel 数据，提升数据分析效率',
    category: '办公效率',
    icon: '📈',
    tags: ['Excel', '数据分析', '公式生成'],
    difficulty: '入门',
    timeRequired: '10-30分钟',
    tools: ['ChatGPT', 'Excel AI', 'Formula Bot', 'SheetAI'],
    scenario: '适用于数据处理、公式编写、数据分析、报表制作等场景',
    steps: [
      '准备需要处理的数据表格',
      '描述数据处理需求',
      'AI 生成公式或处理方案',
      '应用到表格中执行',
      '验证结果正确性',
      '优化和美化报表'
    ],
    tips: [
      '清晰描述数据结构和处理目标',
      '提供示例数据帮助 AI 理解',
      '验证 AI 生成的公式正确性',
      '注意数据的隐私和安全'
    ]
  },
  {
    id: '19',
    name: 'AI 会议纪要整理',
    description: '使用 AI 自动整理会议录音和笔记',
    category: '办公效率',
    icon: '📋',
    tags: ['会议纪要', '语音转文字', '信息整理'],
    difficulty: '入门',
    timeRequired: '10-20分钟',
    tools: ['飞书妙记', '讯飞听见', '通义听悟', 'Otter.ai'],
    scenario: '适用于会议记录、访谈整理、课程笔记等场景',
    steps: [
      '录制会议或上传音频文件',
      '使用 AI 工具进行语音转文字',
      'AI 自动提取要点和待办',
      '审核并补充遗漏内容',
      '格式化输出会议纪要',
      '分发相关人员'
    ],
    tips: [
      '确保录音质量清晰',
      '会议前介绍参会者便于识别',
      'AI 生成内容需要人工校对',
      '注意敏感信息的处理'
    ]
  },

  // ========== 学习研究技能 ==========
  {
    id: '20',
    name: 'AI 辅助学习',
    description: '使用 AI 作为学习助手，提升学习效率',
    category: '学习研究',
    icon: '📚',
    tags: ['学习助手', '知识问答', '概念解释'],
    difficulty: '入门',
    timeRequired: '持续使用',
    tools: ['ChatGPT', 'Claude', 'Kimi', '文心一言'],
    scenario: '适用于知识学习、概念理解、问题解答、作业辅导等场景',
    steps: [
      '确定学习主题和目标',
      '向 AI 提问不懂的概念',
      '请求 AI 举例说明',
      '让 AI 出题检验理解',
      '针对薄弱点深入学习',
      '总结并记录学习笔记'
    ],
    tips: [
      '问题要具体，避免过于宽泛',
      '可以让 AI 用不同方式解释',
      '主动请求练习题巩固',
      '批判性思考 AI 的回答'
    ]
  },
  {
    id: '21',
    name: 'AI 文献阅读与总结',
    description: '使用 AI 快速阅读和总结学术文献',
    category: '学习研究',
    icon: '📄',
    tags: ['文献阅读', '论文总结', '研究辅助'],
    difficulty: '进阶',
    timeRequired: '20-60分钟',
    tools: ['ChatGPT', 'Claude', 'Scholarcy', 'Elicit'],
    scenario: '适用于学术研究、文献综述、知识整理等场景',
    steps: [
      '上传或粘贴文献内容',
      '请求 AI 总结核心观点',
      '询问具体章节的细节',
      '让 AI 提取关键数据和结论',
      '请求 AI 解释难点内容',
      '整理文献笔记'
    ],
    tips: [
      '分段落或章节进行总结效果更好',
      '可以要求特定格式的总结',
      '验证 AI 总结的准确性',
      '注意文献的版权限制'
    ]
  },

  // ========== 营销推广技能 ==========
  {
    id: '22',
    name: 'AI 社交媒体运营',
    description: '使用 AI 提升社交媒体内容创作和运营效率',
    category: '营销推广',
    icon: '📱',
    tags: ['社媒运营', '内容创作', '社交媒体'],
    difficulty: '进阶',
    timeRequired: '30-60分钟',
    tools: ['ChatGPT', 'Notion AI', '讯飞写作', '火山写作'],
    scenario: '适用于微博、小红书、抖音、公众号等社交媒体运营',
    steps: [
      '分析目标受众和平台特点',
      '使用 AI 生成内容创意',
      'AI 辅助撰写文案初稿',
      '根据平台调性调整内容',
      '设计配图和排版',
      '发布并分析数据反馈'
    ],
    tips: [
      '了解各平台的内容风格差异',
      '保持内容的一致性和连贯性',
      'AI 内容需要人格化处理',
      '结合热点提升传播效果'
    ]
  },
  {
    id: '23',
    name: 'AI SEO 优化',
    description: '使用 AI 优化网站内容，提升搜索引擎排名',
    category: '营销推广',
    icon: '🔍',
    tags: ['SEO', '搜索引擎', '内容优化'],
    difficulty: '进阶',
    timeRequired: '1-2小时',
    tools: ['ChatGPT', 'SurferSEO', 'Frase', 'Jasper'],
    scenario: '适用于网站内容优化、关键词布局、外链建设等场景',
    steps: [
      '分析目标关键词和竞品',
      '使用 AI 生成 SEO 友好内容',
      '优化标题和元描述',
      '布局关键词和内链',
      '提升内容质量和深度',
      '监测排名并持续优化'
    ],
    tips: [
      '内容质量是 SEO 的核心',
      '关键词自然融入，避免堆砌',
      '关注用户体验和页面速度',
      'SEO 是长期工作，需要持续优化'
    ]
  },
  {
    id: '24',
    name: 'AI 数据分析',
    description: '使用 AI 进行数据分析和可视化报告',
    category: '营销推广',
    icon: '📊',
    tags: ['数据分析', '数据可视化', '商业智能'],
    difficulty: '进阶',
    timeRequired: '30-90分钟',
    tools: ['ChatGPT', 'Claude', 'Julius AI', 'Tableau AI'],
    scenario: '适用于营销数据分析、用户行为分析、业务报告等场景',
    steps: [
      '收集和整理原始数据',
      '向 AI 描述分析目标',
      'AI 辅助数据清洗和处理',
      '请求 AI 进行数据分析和洞察',
      '生成可视化图表',
      '撰写分析报告'
    ],
    tips: [
      '提供清晰的数据上下文',
      '明确分析目标很重要',
      '验证 AI 分析结果的合理性',
      '结合业务知识解读数据'
    ]
  }
];

// 获取热门技能
export function getFeaturedSkills(): SkillItem[] {
  return aiSkills.filter(skill => skill.featured);
}
