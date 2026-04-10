import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

// SkillHub 风格的数据（基于 https://skillhub.cn/skills 获取的分类和技能）
const SKILLHUB_CATEGORIES = [
  { name: 'AI', slug: 'ai', icon: '🤖', color: '#8B5CF6', sort_order: 1 },
  { name: '智能开发', slug: 'dev', icon: '💻', color: '#3B82F6', sort_order: 2 },
  { name: '工具效率', slug: 'tools', icon: '⚡', color: '#10B981', sort_order: 3 },
  { name: '提升', slug: 'improve', icon: '📈', color: '#F59E0B', sort_order: 4 },
  { name: '数据分析', slug: 'data', icon: '📊', color: '#EC4899', sort_order: 5 },
  { name: '内容创作', slug: 'content', icon: '✍️', color: '#EF4444', sort_order: 6 },
  { name: '安全合规', slug: 'security', icon: '🔒', color: '#06B6D4', sort_order: 7 },
  { name: '通讯协作', slug: 'communication', icon: '💬', color: '#F97316', sort_order: 8 },
];

// 基于 skillhub.cn 发现的技能创建更丰富的技能数据
const SKILLHUB_SKILLS = [
  // AI 分类
  { name: 'Self Improving Agent', slug: 'self-improving-agent', description: '一个能够持续自我学习和优化的 AI Agent，自动分析执行结果并改进策略。适用于需要持续迭代优化的复杂任务场景。', category_slug: 'ai', tags: ['Agent', '自我优化', '机器学习'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/self-improving-agent' },
  { name: 'Find Skills', slug: 'find-skills', description: '智能发现和推荐适合的 AI Skills，帮助用户快速找到满足特定需求的技能工具。支持多维度筛选和智能匹配。', category_slug: 'ai', tags: ['技能发现', '智能推荐', '搜索'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/find-skills' },
  { name: 'Summarize', slug: 'summarize', description: '智能文本摘要工具，快速提取长文本的核心要点。支持多种摘要模式，可调节摘要长度和重点。', category_slug: 'ai', tags: ['文本摘要', '内容压缩', '信息提取'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/summarize' },
  { name: 'Agent Browser', slug: 'agent-browser', description: '浏览器自动化 Agent，能够自主浏览网页、填写表单、提取信息。适用于网页数据采集、表单自动填写等场景。', category_slug: 'ai', tags: ['浏览器自动化', '网页抓取', 'Agent'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/agent-browser' },
  { name: 'Self Improving', slug: 'self-improving', description: '通用自我改进框架，帮助 AI 助手在对话中学习用户偏好，不断优化响应质量。', category_slug: 'ai', tags: ['自我改进', '个性化', '机器学习'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/self-improving' },
  { name: 'Deep Research', slug: 'deep-research', description: '深度研究助手，能够对复杂主题进行深入调研，整合多源信息生成全面的研究报告。', category_slug: 'ai', tags: ['研究', '调研', '报告生成'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/deep-research' },
  { name: 'Smart Classifier', slug: 'smart-classifier', description: '智能分类器，可根据给定规则或样本自动对文本、图像等内容进行分类。', category_slug: 'ai', tags: ['分类', '机器学习', '自动化'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/smart-classifier' },
  { name: 'Intent Detector', slug: 'intent-detector', description: '用户意图识别工具，准确判断用户查询背后的真实需求，支持多轮对话理解。', category_slug: 'ai', tags: ['意图识别', 'NLP', '对话理解'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/intent-detector' },

  // 智能开发
  { name: 'Code Review', slug: 'code-review', description: '自动代码审查工具，检测代码质量问题、安全漏洞和最佳实践违规。支持多种编程语言。', category_slug: 'dev', tags: ['代码审查', '质量检测', '安全'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/code-review' },
  { name: 'SQL Generator', slug: 'sql-generator', description: '自然语言转 SQL 查询工具，将日常语言描述转换为准确的 SQL 语句，降低数据库使用门槛。', category_slug: 'dev', tags: ['SQL', '数据库', '代码生成'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/sql-generator' },
  { name: 'API Designer', slug: 'api-designer', description: 'API 设计与文档生成工具，帮助快速设计和文档化 RESTful API，自动生成 OpenAPI 规范。', category_slug: 'dev', tags: ['API', '设计', '文档生成'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/api-designer' },
  { name: 'Test Case Generator', slug: 'test-case-generator', description: '自动化测试用例生成器，根据代码功能自动生成单元测试和集成测试用例。', category_slug: 'dev', tags: ['测试', '自动化', '质量保障'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/test-case-generator' },
  { name: 'Bug Hunter', slug: 'bug-hunter', description: '智能 Bug 定位与修复助手，分析错误信息并提供修复建议，支持常见编程错误自动修复。', category_slug: 'dev', tags: ['调试', 'Bug修复', '开发辅助'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/bug-hunter' },
  { name: 'Code Translator', slug: 'code-translator', description: '编程语言互转工具，支持主流编程语言之间的代码翻译，保持语义一致性。', category_slug: 'dev', tags: ['代码翻译', '多语言', '代码转换'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/code-translator' },
  { name: 'Regex Master', slug: 'regex-master', description: '正则表达式专家，帮助编写、调试和优化正则表达式，提供可视化的匹配测试。', category_slug: 'dev', tags: ['正则表达式', '字符串处理', '文本匹配'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/regex-master' },
  { name: 'Git Assistant', slug: 'git-assistant', description: 'Git 命令行助手，用自然语言描述你的需求，自动生成正确的 Git 命令。', category_slug: 'dev', tags: ['Git', '版本控制', '开发工具'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/git-assistant' },

  // 工具效率
  { name: 'Meeting Notes', slug: 'meeting-notes', description: '会议记录助手，自动生成会议纪要，提取待办事项和关键决策。支持多种会议形式。', category_slug: 'tools', tags: ['会议', '记录', '效率工具'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/meeting-notes' },
  { name: 'Email Writer', slug: 'email-writer', description: '专业邮件撰写助手，根据场景生成得体、专业的商务邮件，支持多种语调和风格。', category_slug: 'tools', tags: ['邮件', '商务沟通', '写作辅助'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/email-writer' },
  { name: 'Calendar Manager', slug: 'calendar-manager', description: '智能日程管理助手，帮助安排会议、设置提醒、管理日历，提高时间管理效率。', category_slug: 'tools', tags: ['日程管理', '时间管理', '提醒'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/calendar-manager' },
  { name: 'PDF Converter', slug: 'pdf-converter', description: '文档格式转换工具，支持 PDF 与 Word、Excel、图片等多种格式的互转。', category_slug: 'tools', tags: ['格式转换', 'PDF', '文档处理'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/pdf-converter' },
  { name: 'Screen Capture', slug: 'screen-capture', description: '智能截图助手，支持区域截图、长截图、滚动截图，自动添加标注和注释。', category_slug: 'tools', tags: ['截图', '标注', '屏幕捕捉'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/screen-capture' },
  { name: 'File Organizer', slug: 'file-organizer', description: '文件整理助手，自动分类和组织文件夹，批量重命名，保持文件结构整洁有序。', category_slug: 'tools', tags: ['文件管理', '自动化', '整理'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/file-organizer' },
  { name: 'Quick Launcher', slug: 'quick-launcher', description: '快速启动器，一键启动常用应用、文件和命令，支持自定义快捷方式和工作流。', category_slug: 'tools', tags: ['启动器', '快捷方式', '效率'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/quick-launcher' },

  // 提升
  { name: 'Writing Coach', slug: 'writing-coach', description: '写作提升教练，提供写作建议、语法纠正、风格优化，帮助提升整体写作水平。', category_slug: 'improve', tags: ['写作提升', '语法检查', '风格优化'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/writing-coach' },
  { name: 'Presentation Pro', slug: 'presentation-pro', description: '演示文稿优化助手，帮助设计专业 PPT，提供内容建议和视觉优化方案。', category_slug: 'improve', tags: ['PPT', '演示', '设计优化'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/presentation-pro' },
  { name: 'Language Tutor', slug: 'language-tutor', description: 'AI 语言学习导师，提供口语练习、语法讲解、词汇记忆等个性化学习支持。', category_slug: 'improve', tags: ['语言学习', '口语练习', '教育'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/language-tutor' },
  { name: 'Critical Thinking', slug: 'critical-thinking', description: '批判性思维训练工具，帮助分析论证逻辑，识别思维谬误，提升分析能力。', category_slug: 'improve', tags: ['批判性思维', '逻辑分析', '思维训练'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/critical-thinking' },
  { name: 'Memory Palace', slug: 'memory-palace', description: '记忆宫殿训练助手，运用记忆技巧帮助记忆信息，提高长期记忆效果。', category_slug: 'improve', tags: ['记忆力', '学习技巧', '记忆宫殿'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/memory-palace' },

  // 数据分析
  { name: 'Data Visualizer', slug: 'data-visualizer', description: '数据可视化助手，将数据自动转换为图表，支持多种可视化类型和自定义样式。', category_slug: 'data', tags: ['数据可视化', '图表', '数据分析'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/data-visualizer' },
  { name: 'Excel Formula Helper', slug: 'excel-formula-helper', description: 'Excel 公式助手，帮助编写复杂公式，解决数据处理问题，支持函数推荐。', category_slug: 'data', tags: ['Excel', '公式', '数据处理'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/excel-formula-helper' },
  { name: 'Trend Analyzer', slug: 'trend-analyzer', description: '趋势分析工具，识别数据中的趋势、季节性和异常，支持预测和洞察发现。', category_slug: 'data', tags: ['趋势分析', '预测', '统计'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/trend-analyzer' },
  { name: 'Data Cleaner', slug: 'data-cleaner', description: '数据清洗助手，自动处理缺失值、异常值和重复数据，提高数据质量。', category_slug: 'data', tags: ['数据清洗', '数据质量', '预处理'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/data-cleaner' },
  { name: 'Report Generator', slug: 'report-generator', description: '自动化报告生成器，根据数据自动生成分析报告，支持自定义模板和样式。', category_slug: 'data', tags: ['报告生成', '自动化', '数据分析'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/report-generator' },

  // 内容创作
  { name: 'Blog Writer', slug: 'blog-writer', description: '博客文章创作助手，生成高质量原创文章，支持多种风格和主题定制。', category_slug: 'content', tags: ['博客', '内容创作', '写作'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/blog-writer' },
  { name: 'Social Media Manager', slug: 'social-media-manager', description: '社交媒体内容管理助手，生成帖子、评论和回复，提升社交媒体运营效率。', category_slug: 'content', tags: ['社交媒体', '内容运营', '自动化'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/social-media-manager' },
  { name: 'SEO Optimizer', slug: 'seo-optimizer', description: 'SEO 优化助手，分析内容关键词密度、可读性，提供搜索引擎优化建议。', category_slug: 'content', tags: ['SEO', '搜索引擎优化', '内容营销'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/seo-optimizer' },
  { name: 'Image Caption', slug: 'image-caption', description: '图片描述生成器，自动为图片生成准确、吸引人的文字描述和 alt 文本。', category_slug: 'content', tags: ['图片描述', 'ALT文本', '内容创作'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/image-caption' },
  { name: 'Creative Writer', slug: 'creative-writer', description: '创意写作助手，帮助创作故事、小说、剧本等创意内容，激发创作灵感。', category_slug: 'content', tags: ['创意写作', '故事创作', '灵感'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/creative-writer' },
  { name: 'Product Description', slug: 'product-description', description: '产品描述生成器，创作吸引人的商品描述，突出卖点，提升转化率。', category_slug: 'content', tags: ['电商', '产品描述', '营销'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/product-description' },

  // 安全合规
  { name: 'Security Auditor', slug: 'security-auditor', description: '安全审计助手，检查代码和系统中的安全漏洞，提供修复建议和最佳实践。', category_slug: 'security', tags: ['安全审计', '漏洞检测', '网络安全'], pricing: '免费', difficulty: '高级', official_url: 'https://skillhub.cn/skills/security-auditor' },
  { name: 'Privacy Checker', slug: 'privacy-checker', description: '隐私合规检查工具，评估内容或系统的隐私风险，确保符合数据保护法规。', category_slug: 'security', tags: ['隐私保护', '合规检查', 'GDPR'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/privacy-checker' },
  { name: 'Code Scanner', slug: 'code-scanner', description: '代码安全扫描器，检测代码中的敏感信息泄露、弱加密等安全隐患。', category_slug: 'security', tags: ['代码扫描', '安全检测', '敏感信息'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/code-scanner' },
  { name: 'Compliance Guide', slug: 'compliance-guide', description: '合规指南助手，提供各行业法规咨询，帮助企业确保业务合规性。', category_slug: 'security', tags: ['合规', '法规', '咨询'], pricing: '免费', difficulty: '进阶', official_url: 'https://skillhub.cn/skills/compliance-guide' },

  // 通讯协作
  { name: 'Team Coordinator', slug: 'team-coordinator', description: '团队协作协调器，帮助分配任务、跟踪进度、协调资源，提升团队效率。', category_slug: 'communication', tags: ['团队协作', '项目管理', '协调'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/team-coordinator' },
  { name: 'Customer Support', slug: 'customer-support', description: '智能客服助手，自动回答常见问题，处理客户咨询，提供 7x24 小时服务。', category_slug: 'communication', tags: ['客服', '自动化', '客户服务'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/customer-support' },
  { name: 'Translator Pro', slug: 'translator-pro', description: '专业翻译助手，支持多语言互译，保持原文风格和语气，适合商务场景。', category_slug: 'communication', tags: ['翻译', '多语言', '跨语言'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/translator-pro' },
  { name: 'FAQ Builder', slug: 'faq-builder', description: '常见问题库构建助手，帮助创建和维护 FAQ 文档，提升自助服务能力。', category_slug: 'communication', tags: ['FAQ', '知识库', '客服'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/faq-builder' },
  { name: 'Survey Designer', slug: 'survey-designer', description: '问卷调查设计助手，帮助设计专业问卷，生成问题模板，提高响应率。', category_slug: 'communication', tags: ['问卷调查', '用户反馈', '数据分析'], pricing: '免费', difficulty: '入门', official_url: 'https://skillhub.cn/skills/survey-designer' },
];

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { force } = body;

    const supabase = getSupabaseClient();

    // 如果强制覆盖，先删除现有数据
    if (force) {
      await supabase.from('skills').delete().neq('id', 0);
      await supabase.from('skill_categories').delete().neq('id', 0);
    }

    // 插入分类
    const categoryResults = [];
    for (const cat of SKILLHUB_CATEGORIES) {
      const { data, error } = await supabase
        .from('skill_categories')
        .upsert({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          color: cat.color,
          sort_order: cat.sort_order,
          description: `SkillHub ${cat.name} 分类，汇聚优质 AI 技能`,
        }, { onConflict: 'slug' })
        .select('id, slug')
        .single();
      
      if (!error && data) {
        categoryResults.push({ ...data, name: cat.name });
      }
    }

    // 创建 slug -> id 映射
    const categoryMap = new Map(categoryResults.map(c => [c.slug, c.id]));

    // 插入技能
    let skillsCreated = 0;
    for (const skill of SKILLHUB_SKILLS) {
      const categoryId = categoryMap.get(skill.category_slug);
      if (!categoryId) continue;

      const { error } = await supabase
        .from('skills')
        .upsert({
          name: skill.name,
          slug: `skillhub-${skill.slug}`,
          description: skill.description,
          category_id: categoryId,
          official_url: skill.official_url,
          pricing: skill.pricing,
          difficulty: skill.difficulty,
          tags: skill.tags,
          is_featured: skill.tags?.length > 0,
          is_active: true,
        }, { onConflict: 'slug' });
      
      if (!error) {
        skillsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `已导入 SkillHub 风格技能数据：${categoryResults.length} 个分类，${skillsCreated} 个技能`,
      data: {
        categories_created: categoryResults.length,
        skills_created: skillsCreated,
      }
    });
  } catch (error) {
    console.error('导入失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: `导入失败: ${error instanceof Error ? error.message : '未知错误'}`
    }, { status: 500 });
  }
}

// 获取导入状态
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const { count: categoryCount } = await supabase
      .from('skill_categories')
      .select('*', { count: 'exact', head: true });

    const { count: skillCount } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        categories: categoryCount || 0,
        skills: skillCount || 0,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
