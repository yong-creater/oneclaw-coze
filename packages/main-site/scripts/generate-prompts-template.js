// 完整提示词生成脚本
// 此文件包含为每个分类生成50个提示词的模板

const promptTemplates = {
  // 文本创作类（补充到50个）
  text: [
    { title: '文章大纲生成', desc: '快速生成结构清晰的文章大纲', tags: ['大纲', '文章', '结构'] },
    { title: '小红书爆款文案', desc: '生成符合小红书调性的爆款内容', tags: ['小红书', '文案', '种草'] },
    { title: '公众号文章写作', desc: '生成高质量微信公众号文章', tags: ['公众号', '文章', '写作'] },
    { title: '邮件写作助手', desc: '专业商务邮件撰写模板', tags: ['邮件', '商务', '沟通'] },
    { title: '故事创作助手', desc: '创意故事、小说片段创作', tags: ['故事', '创意', '小说'] },
    { title: '新闻稿撰写', desc: '企业新闻稿、公关稿撰写', tags: ['新闻稿', '公关', '企业'] },
    { title: '演讲稿撰写', desc: '各类演讲、致辞稿撰写', tags: ['演讲', '致辞', '演讲稿'] },
    { title: '简历优化', desc: '专业简历撰写与优化', tags: ['简历', '求职', '职场'] },
    { title: '产品说明书', desc: '产品使用手册、操作指南撰写', tags: ['说明书', '手册', '产品'] },
    { title: 'SEO文章优化', desc: 'SEO友好型文章创作与优化', tags: ['SEO', '优化', '搜索'] },
    { title: '写作风格转换', desc: '将文本转换为不同写作风格', tags: ['风格', '改写', '文案'] },
    { title: '标题生成器', desc: '生成吸引眼球的优质标题', tags: ['标题', '文案', '吸引力'] },
    { title: '内容润色', desc: '文章润色、语句优化', tags: ['润色', '优化', '修改'] },
    { title: '读书笔记', desc: '书籍内容提炼与笔记整理', tags: ['读书', '笔记', '总结'] },
    { title: '会议纪要', desc: '会议内容记录与整理', tags: ['会议', '纪要', '记录'] },
    { title: '视频脚本创作', desc: '短视频、长视频脚本撰写', tags: ['视频', '脚本', '创作'] },
    { title: '播客脚本', desc: '播客节目脚本与大纲', tags: ['播客', '音频', '脚本'] },
    { title: '剧本创作', desc: '短片剧本、微电影剧本', tags: ['剧本', '创作', '短片'] },
    { title: '歌词创作', desc: '专业歌词创作与改编', tags: ['歌词', '音乐', '创作'] },
    { title: '对联创作', desc: '传统对联、春联创作', tags: ['对联', '传统', '文化'] },
    { title: '散文创作', desc: '抒情散文、叙事散文写作', tags: ['散文', '抒情', '写作'] },
    { title: '诗歌创作', desc: '现代诗、古典诗创作', tags: ['诗歌', '诗词', '创作'] },
    { title: '日记写作', desc: '日记、周记写作指导', tags: ['日记', '写作', '记录'] },
    { title: '作文批改', desc: '作文修改与润色建议', tags: ['作文', '批改', '润色'] },
    { title: '论文大纲', desc: '学术论文大纲设计', tags: ['论文', '大纲', '学术'] },
    { title: '书评撰写', desc: '深度书评、读后感创作', tags: ['书评', '读后感', '评论'] },
    { title: '影评撰写', desc: '电影评论、观后感写作', tags: ['影评', '观后感', '电影'] },
    { title: '产品测评', desc: '产品测评报告撰写', tags: ['测评', '评测', '产品'] },
    { title: '活动策划文案', desc: '活动策划方案撰写', tags: ['活动', '策划', '文案'] },
    { title: '品牌故事', desc: '品牌故事创作与包装', tags: ['品牌', '故事', '包装'] },
    { title: '案例撰写', desc: '成功案例分析撰写', tags: ['案例', '分析', '撰写'] },
    { title: '白皮书撰写', desc: '行业白皮书、报告撰写', tags: ['白皮书', '报告', '行业'] },
    { title: '技术文档', desc: '技术文档、API文档撰写', tags: ['技术', '文档', 'API'] },
    { title: '用户手册', desc: '用户使用手册撰写', tags: ['手册', '用户', '指南'] },
    { title: '培训材料', desc: '培训课件、教材撰写', tags: ['培训', '课件', '教材'] },
    { title: '合同起草', desc: '合同、协议文本起草', tags: ['合同', '协议', '法律'] },
    { title: '通知公告', desc: '企业通知、公告撰写', tags: ['通知', '公告', '企业'] },
    { title: '邀请函', desc: '各类邀请函、请柬撰写', tags: ['邀请函', '请柬', '邀请'] },
    { title: '感谢信', desc: '感谢信、表扬信撰写', tags: ['感谢信', '表扬信', '感谢'] },
    { title: '道歉信', desc: '道歉信、致歉声明撰写', tags: ['道歉信', '致歉', '道歉'] },
    { title: '推荐信', desc: '推荐信、介绍信撰写', tags: ['推荐信', '介绍信', '推荐'] },
    { title: '申请书', desc: '各类申请书、申请表撰写', tags: ['申请书', '申请', '文书'] },
    { title: '报告总结', desc: '工作总结、述职报告撰写', tags: ['报告', '总结', '述职'] },
    { title: '宣传文案', desc: '宣传材料、推广文案撰写', tags: ['宣传', '文案', '推广'] },
    { title: '广告语创作', desc: '品牌广告语、slogan创作', tags: ['广告语', 'slogan', '品牌'] },
    { title: '口号标语', desc: '活动口号、标语创作', tags: ['口号', '标语', '活动'] },
    { title: '朋友圈文案', desc: '微信朋友圈文案创作', tags: ['朋友圈', '文案', '微信'] },
    { title: '短视频文案', desc: '抖音、快手短视频文案', tags: ['短视频', '文案', '抖音'] },
    { title: '直播话术', desc: '直播带货话术设计', tags: ['直播', '话术', '带货'] },
    { title: '访谈提纲', desc: '采访提纲、访谈问题设计', tags: ['访谈', '采访', '提纲'] }
  ],

  // 数据分析类（补充到50个）
  data: [
    { title: '数据报告撰写', desc: '专业的数据分析报告撰写模板', tags: ['报告', '数据', '分析'] },
    { title: 'Excel函数应用', desc: 'Excel常用函数与公式应用', tags: ['Excel', '函数', '公式'] },
    { title: 'SQL查询优化', desc: 'SQL查询语句优化与调优', tags: ['SQL', '查询', '优化'] },
    { title: '数据可视化', desc: '图表选择与数据可视化设计', tags: ['可视化', '图表', '展示'] },
    { title: '数据清洗', desc: '数据清洗与预处理方法', tags: ['清洗', '预处理', '数据质量'] },
    { title: 'A/B测试分析', desc: 'A/B测试设计与结果分析', tags: ['A/B测试', '实验', '对比'] },
    { title: '用户画像构建', desc: '用户画像标签体系构建', tags: ['用户画像', '标签', '分群'] },
    { title: '预测模型构建', desc: '数据预测模型设计与实现', tags: ['预测', '模型', '机器学习'] },
    { title: '销售数据分析', desc: '销售数据深度分析与洞察', tags: ['销售', '数据', '分析'] },
    { title: '用户行为分析', desc: '用户行为路径与漏斗分析', tags: ['用户行为', '路径', '漏斗'] },
    { title: '留存分析', desc: '用户留存率分析与优化', tags: ['留存', '留存率', '用户'] },
    { title: '转化率优化', desc: '转化率分析与提升策略', tags: ['转化率', '优化', '提升'] },
    { title: 'RFM分析', desc: 'RFM模型用户分层分析', tags: ['RFM', '用户分层', '模型'] },
    { title: '同期群分析', desc: '同期群分析方法与应用', tags: ['同期群', 'cohort', '分析'] },
    { title: '漏斗分析', desc: '转化漏斗分析与优化', tags: ['漏斗', '转化', '分析'] },
    { title: '归因分析', desc: '营销归因分析方法', tags: ['归因', '营销', '分析'] },
    { title: '竞品分析', desc: '竞争对手数据分析', tags: ['竞品', '竞争', '分析'] },
    { title: '市场分析', desc: '市场规模与趋势分析', tags: ['市场', '趋势', '分析'] },
    { title: '行业研究', desc: '行业研究报告撰写', tags: ['行业', '研究', '报告'] },
    { title: '财务分析', desc: '财务数据分析与解读', tags: ['财务', '分析', '数据'] },
    { title: '运营数据监控', desc: '运营指标监控体系', tags: ['运营', '监控', '指标'] },
    { title: '流量分析', desc: '网站流量数据分析', tags: ['流量', '网站', '分析'] },
    { title: '渠道分析', desc: '获客渠道效果分析', tags: ['渠道', '获客', '分析'] },
    { title: '内容分析', desc: '内容数据效果分析', tags: ['内容', '效果', '分析'] },
    { title: '商品分析', desc: '商品销售数据分析', tags: ['商品', '销售', '数据'] },
    { title: '库存分析', desc: '库存管理与优化分析', tags: ['库存', '管理', '优化'] },
    { title: '客户分析', desc: '客户价值与满意度分析', tags: ['客户', '价值', '满意度'] },
    { title: '风险分析', desc: '业务风险识别与评估', tags: ['风险', '识别', '评估'] },
    { title: '异常检测', desc: '数据异常检测方法', tags: ['异常', '检测', '监控'] },
    { title: '趋势预测', desc: '业务趋势预测分析', tags: ['趋势', '预测', '分析'] },
    { title: '数据仪表盘', desc: '数据仪表盘设计', tags: ['仪表盘', 'dashboard', '设计'] },
    { title: 'KPI设定', desc: '关键绩效指标设计', tags: ['KPI', '指标', '绩效'] },
    { title: '数据字典', desc: '数据字典编写规范', tags: ['数据字典', '规范', '文档'] },
    { title: 'ETL流程', desc: '数据抽取转换加载流程', tags: ['ETL', '数据', '流程'] },
    { title: '数据质量管理', desc: '数据质量评估与提升', tags: ['数据质量', '管理', '评估'] },
    { title: '数据安全', desc: '数据安全与隐私保护', tags: ['数据安全', '隐私', '保护'] },
    { title: '报表自动化', desc: '自动化报表系统设计', tags: ['报表', '自动化', '系统'] },
    { title: 'Python数据分析', desc: 'Python数据处理与分析', tags: ['Python', '数据处理', '分析'] },
    { title: 'R语言分析', desc: 'R语言统计分析应用', tags: ['R', '统计分析', '数据'] },
    { title: 'SPSS分析', desc: 'SPSS统计分析操作', tags: ['SPSS', '统计', '分析'] },
    { title: 'Tableau应用', desc: 'Tableau可视化分析', tags: ['Tableau', '可视化', '分析'] },
    { title: 'Power BI', desc: 'Power BI报表设计', tags: ['Power BI', '报表', '设计'] },
    { title: '数据仓库', desc: '数据仓库设计与建设', tags: ['数据仓库', '数仓', '建设'] },
    { title: '数据治理', desc: '企业数据治理体系', tags: ['数据治理', '治理', '体系'] },
    { title: '数据标准', desc: '数据标准化规范制定', tags: ['数据标准', '标准化', '规范'] },
    { title: '元数据管理', desc: '元数据管理方法', tags: ['元数据', '管理', '数据'] },
    { title: '主数据管理', desc: '主数据管理系统设计', tags: ['主数据', 'MDM', '管理'] },
    { title: '数据血缘', desc: '数据血缘关系梳理', tags: ['数据血缘', '血缘', '关系'] },
    { title: '数据资产', desc: '数据资产管理与盘点', tags: ['数据资产', '资产', '管理'] },
    { title: '数据中台', desc: '数据中台架构设计', tags: ['数据中台', '中台', '架构'] }
  ]
};

// 生成提示词数据的函数
function generatePromptData(category, template, index) {
  return {
    id: `${category.toLowerCase()}-${String(index + 1).padStart(3, '0')}`,
    title: template.title,
    description: template.desc,
    category: getCategoryName(category),
    tags: template.tags,
    featured: index < 5, // 前5个标记为推荐
    usage: Math.floor(Math.random() * 40000) + 10000,
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    content: generatePromptContent(template),
    example: generatePromptExample(template)
  };
}

function getCategoryName(code) {
  const map = {
    text: '文本创作',
    data: '数据分析',
    code: '代码开发',
    marketing: '营销文案',
    translate: '翻译润色',
    education: '教育学习',
    business: '商业策划',
    life: '生活助手'
  };
  return map[code] || code;
}

function generatePromptContent(template) {
  return `# ${template.title}助手

## 【角色定位】
你是专业的${template.title}专家，精通：
- 核心技能与方法
- 实战经验丰富
- 问题解决方案
- 最佳实践指导

## 【工作流程】
1. 需求分析：明确目标
2. 方案设计：制定策略
3. 执行实施：落地推进
4. 效果评估：优化改进`;
}

function generatePromptExample(template) {
  return {
    input: `请帮我${template.title.toLowerCase()}`,
    output: `【${template.title}示例】

这是一个专业的${template.title}示例内容。

核心要点：
• 要点一
• 要点二
• 要点三

具体内容根据实际需求展开...`,
    type: 'text'
  };
}

module.exports = { promptTemplates, generatePromptData };
