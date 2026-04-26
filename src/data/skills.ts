// AI Skills 技能市场数据 - 类似 SkillHub

export interface SkillExample {
  scenario: string;        // 使用场景
  input: string;          // 输入示例
  output: string;         // 输出结果
  imageUrl?: string;      // 效果图片（可选）
}

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
  example?: SkillExample; // 案例展示
  capabilities?: string[]; // 核心能力
  useCases?: string[]; // 使用场景
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

// AI技能列表 - 专业商用级别
export const aiSkills: SkillItem[] = [
  // ========== 搜索工具 ==========
  {
    id: 'skill-001',
    name: 'Web Search Pro',
    identifier: 'web-search-pro',
    description: '强大的网络搜索能力，支持多引擎并行搜索、结果聚合、智能摘要',
    icon: '🔍',
    version: '2.1.0',
    author: 'OneClaw Team',
    source: '官方',
    sourceUrl: 'https://github.com/oneclaw/web-search-pro',
    tags: ['搜索', '网络', '信息检索'],
    category: '搜索工具',
    featured: true,
    downloads: 125680,
    favorites: 8940,
    installs: 98760,
    installGuide: {
      agent: 'npm install @oneclaw/web-search-pro',
      human: '在技能市场搜索"Web Search Pro"并点击安装'
    },
    updatedAt: '2024-01-15',
    example: {
      scenario: '查询最新的AI视频生成工具',
      input: '搜索：2024年最佳AI视频生成工具',
      output: `找到 15 个相关结果：

1. **Runway Gen-3 Alpha** - 电影级视频生成
   - 官网：runwayml.com
   - 特点：支持长视频、物理真实感强
   
2. **OpenAI Sora** - 革命性视频模型
   - 官网：openai.com/sora
   - 特点：60秒长视频、角色一致性

3. **Pika Labs** - 创意动画生成
   - 官网：pika.art
   - 特点：动画风格丰富、创意性强

【智能摘要】
2024年AI视频生成领域呈现爆发式增长，Runway、Sora、Pika Labs等工具在视频质量、时长、一致性方面都有重大突破...`
    },
    capabilities: ['多引擎并行搜索', '智能结果聚合', '自动摘要生成', '实时信息获取'],
    useCases: ['市场调研', '竞品分析', '新闻追踪', '学术研究']
  },
  
  {
    id: 'skill-002',
    name: 'Academic Search',
    identifier: 'academic-search',
    description: '专业学术文献搜索，支持Google Scholar、arXiv、PubMed等数据库',
    icon: '📚',
    version: '1.8.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['学术', '论文', '文献'],
    category: '搜索工具',
    downloads: 78450,
    favorites: 5620,
    installs: 62340,
    installGuide: {
      agent: 'npm install @oneclaw/academic-search',
      human: '在技能市场搜索"Academic Search"并点击安装'
    },
    updatedAt: '2024-01-10',
    example: {
      scenario: '查找AI视频生成相关论文',
      input: '搜索论文：AI video generation diffusion models',
      output: `找到 8 篇相关论文：

1. **Video Diffusion Models** (arXiv:2024.12345)
   - 作者：Ho et al.
   - 引用：1,234次
   - 摘要：提出了一种新的视频扩散模型架构...
   
2. **Make-A-Video: Text-to-Video Generation** 
   - 作者：Singer et al. (Meta AI)
   - 发表：NeurIPS 2023
   - 摘要：无需配对数据即可实现文本到视频...

【引用格式】
APA: Ho, J., et al. (2024). Video Diffusion Models. arXiv.
BibTeX: @article{ho2024video, ...}`
    },
    capabilities: ['多数据库搜索', '引用格式生成', '影响因子查询', '相关论文推荐'],
    useCases: ['文献综述', '论文写作', '研究方向确定', '引用管理']
  },
  
  // ========== 文件处理 ==========
  {
    id: 'skill-003',
    name: 'Document Parser',
    identifier: 'document-parser',
    description: '智能文档解析，支持PDF、Word、Excel、PPT等多种格式',
    icon: '📄',
    version: '3.2.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['文档', '解析', 'PDF'],
    category: '文件处理',
    featured: true,
    downloads: 234560,
    favorites: 15670,
    installs: 189340,
    installGuide: {
      agent: 'npm install @oneclaw/document-parser',
      human: '在技能市场搜索"Document Parser"并点击安装'
    },
    updatedAt: '2024-01-18',
    example: {
      scenario: '解析PDF合同文档',
      input: '上传文件：contract_2024.pdf',
      output: `文档解析完成

【文档信息】
- 格式：PDF
- 页数：12页
- 字数：5,680字
- 语言：中文

【结构提取】
1. 合同标题
2. 甲乙双方信息
3. 合作内容（第1-3页）
4. 权利与义务（第4-6页）
5. 付款条款（第7-8页）
6. 违约责任（第9-10页）
7. 其他条款（第11-12页）

【关键信息】
- 甲方：XX科技有限公司
- 乙方：XX传媒集团
- 合同金额：￥1,200,000
- 有效期：2024.01.01 - 2025.12.31
- 付款方式：分期付款（3期）`
    },
    capabilities: ['多格式支持', '结构化提取', '表格识别', 'OCR文字识别'],
    useCases: ['合同审查', '报告提取', '发票处理', '档案数字化']
  },
  
  {
    id: 'skill-004',
    name: 'Excel Analyzer',
    identifier: 'excel-analyzer',
    description: 'Excel智能分析，自动生成图表、数据透视、洞察报告',
    icon: '📊',
    version: '2.0.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['Excel', '数据分析', '图表'],
    category: '文件处理',
    downloads: 156780,
    favorites: 9870,
    installs: 123450,
    installGuide: {
      agent: 'npm install @oneclaw/excel-analyzer',
      human: '在技能市场搜索"Excel Analyzer"并点击安装'
    },
    updatedAt: '2024-01-12',
    example: {
      scenario: '分析销售数据Excel',
      input: '上传文件：sales_2024.xlsx（包含产品、销售额、地区、月份）',
      output: `数据分析报告

【数据概览】
- 总记录：1,234条
- 时间范围：2024年1-12月
- 产品类别：8个
- 销售地区：15个

【关键指标】
- 总销售额：￥12,345,678
- 平均月销售：￥1,028,806
- 增长率：+23.5%
- 最佳产品：产品A（占比35%）
- 最佳地区：华东区（占比42%）

【自动生成图表】
1. 月度销售趋势图（折线图）
2. 产品销售占比（饼图）
3. 地区分布热力图
4. 同比对比柱状图

【洞察建议】
- 产品A持续增长，建议加大投入
- 华北地区有下降趋势，需关注
- Q4销售高峰，应提前备货`
    },
    capabilities: ['自动图表生成', '数据透视', '异常检测', '预测分析'],
    useCases: ['销售分析', '财务报表', '运营数据', '绩效统计']
  },
  
  // ========== 数据分析 ==========
  {
    id: 'skill-005',
    name: 'Data Visualization',
    identifier: 'data-viz',
    description: '专业数据可视化，支持20+图表类型，自动配色和布局',
    icon: '📈',
    version: '2.5.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['可视化', '图表', '数据'],
    category: '数据分析',
    featured: true,
    downloads: 189340,
    favorites: 12340,
    installs: 156780,
    installGuide: {
      agent: 'npm install @oneclaw/data-viz',
      human: '在技能市场搜索"Data Visualization"并点击安装'
    },
    updatedAt: '2024-01-16',
    example: {
      scenario: '创建销售数据可视化',
      input: `数据：
月份 | 销售额
1月  | 100万
2月  | 120万
3月  | 150万
4月  | 180万`,
      output: `已生成可视化图表

【图表类型】折线图
【配色方案】品牌蓝色主题
【布局】自动优化

生成的图表：
- 清晰展示增长趋势
- 自动添加数据标签
- 网格线适度
- 标题和图例完整

导出格式：
- PNG：高清图片
- SVG：矢量格式
- PDF：打印质量
- 交互式HTML：支持悬停查看数据

【AI建议】
- 建议添加趋势线
- 可考虑添加目标线
- 适合用于月度汇报`
    },
    capabilities: ['智能图表选择', '自动配色', '交互式图表', '批量生成'],
    useCases: ['业务报告', '数据大屏', 'PPT制作', '在线展示']
  },
  
  {
    id: 'skill-006',
    name: 'Statistical Analysis',
    identifier: 'stat-analysis',
    description: '专业统计分析，支持回归、方差、假设检验等',
    icon: '📊',
    version: '1.5.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['统计', '分析', '建模'],
    category: '数据分析',
    downloads: 67890,
    favorites: 4560,
    installs: 54320,
    installGuide: {
      agent: 'npm install @oneclaw/stat-analysis',
      human: '在技能市场搜索"Statistical Analysis"并点击安装'
    },
    updatedAt: '2024-01-08',
    example: {
      scenario: '分析广告投放效果',
      input: `数据：广告投入(X) vs 销售额(Y)
[10, 45], [15, 52], [20, 68], [25, 75], [30, 82]`,
      output: `统计分析结果

【回归分析】
模型：Y = a + bX
截距(a)：28.5
斜率(b)：1.82
R²：0.94（拟合优度优秀）

【统计检验】
t检验：t = 8.23, p < 0.01（显著）
F检验：F = 67.8, p < 0.01（模型显著）

【结论】
1. 广告投入与销售额显著正相关
2. 每投入1万元广告，销售额增加1.82万元
3. 模型解释了94%的变异，拟合良好

【预测】
当广告投入=35万时，预测销售额≈92万`
    },
    capabilities: ['回归分析', '方差分析', '假设检验', '预测建模'],
    useCases: ['市场研究', 'A/B测试', '因果分析', '预测建模']
  },
  
  // ========== 图像处理 ==========
  {
    id: 'skill-007',
    name: 'Image Generator',
    identifier: 'image-gen',
    description: 'AI图像生成，支持Midjourney、DALL-E、Stable Diffusion等模型',
    icon: '🎨',
    version: '3.0.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['图像', 'AI绘画', '生成'],
    category: '图像处理',
    featured: true,
    downloads: 345670,
    favorites: 23450,
    installs: 289340,
    installGuide: {
      agent: 'npm install @oneclaw/image-gen',
      human: '在技能市场搜索"Image Generator"并点击安装'
    },
    updatedAt: '2024-01-20',
    example: {
      scenario: '生成产品主图',
      input: '描述：高端智能手表产品图，极简风格，白色背景，专业产品摄影',
      output: `已生成4张图片

【图1】推荐 ⭐
- 构图：居中特写
- 光影：柔和顶光
- 风格：Apple风
- 分辨率：1024x1024

【图2】
- 构图：45度角
- 光影：侧光
- 风格：商业摄影
- 分辨率：1024x1024

【优化建议】
- 可添加品牌色背景
- 可生成多角度组合
- 支持高清放大（4K）

下载链接：
- [图1-高清.png]
- [图2-高清.png]`
    },
    capabilities: ['多模型支持', '风格迁移', '图像编辑', '超分辨率'],
    useCases: ['电商主图', '营销素材', '创意设计', '内容创作']
  },
  
  {
    id: 'skill-008',
    name: 'Image Editor',
    identifier: 'image-editor',
    description: 'AI图像编辑，支持抠图、修图、换背景、美颜等',
    icon: '✂️',
    version: '2.3.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['抠图', '修图', '编辑'],
    category: '图像处理',
    downloads: 267890,
    favorites: 17890,
    installs: 213450,
    installGuide: {
      agent: 'npm install @oneclaw/image-editor',
      human: '在技能市场搜索"Image Editor"并点击安装'
    },
    updatedAt: '2024-01-14',
    example: {
      scenario: '电商产品抠图换背景',
      input: '上传：产品照片（复杂背景）',
      output: `处理完成

【自动抠图】
- 边缘精度：98%
- 发丝级细节保留
- 半透明物体处理

【背景选项】
1. 纯白背景（电商主图）
2. 渐变背景（宣传图）
3. 场景背景（生活照）
4. 自定义上传

【额外处理】
- 自动颜色校正
- 阴影生成
- 尺寸调整

下载文件：
- [产品_白底.png]
- [产品_渐变.png]
- [产品_场景.png]`
    },
    capabilities: ['AI抠图', '智能修复', '背景替换', '批量处理'],
    useCases: ['电商修图', '证件照处理', '广告设计', '社交媒体']
  },
  
  // ========== 代码开发 ==========
  {
    id: 'skill-009',
    name: 'Code Assistant',
    identifier: 'code-assist',
    description: 'AI编程助手，支持代码生成、优化、调试、文档生成',
    icon: '💻',
    version: '4.0.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['代码', '编程', '开发'],
    category: '代码开发',
    featured: true,
    downloads: 456780,
    favorites: 34560,
    installs: 389450,
    installGuide: {
      agent: 'npm install @oneclaw/code-assist',
      human: '在技能市场搜索"Code Assistant"并点击安装'
    },
    updatedAt: '2024-01-19',
    example: {
      scenario: '生成API接口代码',
      input: '需求：用户登录接口，返回JWT token',
      output: `已生成代码

\`\`\`typescript
// user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.authService.login(user);
  }
}

// auth.service.ts
async login(user: User) {
  const payload = { email: user.email, sub: user.id };
  return {
    access_token: this.jwtService.sign(payload),
    expires_in: 3600
  };
}
\`\`\`

【功能说明】
- POST /auth/login
- 参数：email, password
- 返回：JWT token
- 过期时间：1小时

【安全建议】
- 添加请求频率限制
- 密码加密存储
- Token刷新机制`
    },
    capabilities: ['代码生成', '代码审查', 'Bug修复', '文档生成'],
    useCases: ['快速原型', '代码重构', '学习编程', '技术面试']
  },
  
  {
    id: 'skill-010',
    name: 'API Tester',
    identifier: 'api-tester',
    description: 'API接口测试工具，自动生成测试用例和文档',
    icon: '🔌',
    version: '1.6.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['API', '测试', '文档'],
    category: '代码开发',
    downloads: 89760,
    favorites: 6780,
    installs: 72340,
    installGuide: {
      agent: 'npm install @oneclaw/api-tester',
      human: '在技能市场搜索"API Tester"并点击安装'
    },
    updatedAt: '2024-01-11',
    example: {
      scenario: '测试用户API接口',
      input: 'API地址：GET /api/users/:id',
      output: `测试报告

【测试用例】
1. 正常请求 - 用户ID存在
   - 请求：GET /api/users/123
   - 预期：200 OK, 返回用户信息
   - 结果：✅ 通过

2. 异常请求 - 用户ID不存在
   - 请求：GET /api/users/999
   - 预期：404 Not Found
   - 结果：✅ 通过

3. 边界测试 - 无效ID格式
   - 请求：GET /api/users/abc
   - 预期：400 Bad Request
   - 结果：✅ 通过

【性能测试】
- 并发：100请求/秒
- 平均响应：45ms
- 成功率：99.8%

【自动生成文档】
- OpenAPI 3.0规范
- Swagger UI预览
- 示例请求/响应`
    },
    capabilities: ['自动测试', '性能测试', '文档生成', 'Mock数据'],
    useCases: ['接口测试', '文档维护', '质量保证', '团队协作']
  },
  
  // ========== 写作助手 ==========
  {
    id: 'skill-011',
    name: 'Content Writer',
    identifier: 'content-writer',
    description: '专业内容创作，支持文章、营销文案、社交媒体内容',
    icon: '✍️',
    version: '3.5.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['写作', '内容', '文案'],
    category: '写作助手',
    featured: true,
    downloads: 378900,
    favorites: 25670,
    installs: 312450,
    installGuide: {
      agent: 'npm install @oneclaw/content-writer',
      human: '在技能市场搜索"Content Writer"并点击安装'
    },
    updatedAt: '2024-01-17',
    example: {
      scenario: '撰写产品介绍文章',
      input: '产品：智能手表，卖点：健康监测、长续航、时尚设计',
      output: `已生成文章

# 让健康触手可及：全新智能手表体验

## 前言
在这个快节奏的时代，健康管理变得尤为重要...

## 核心亮点

### 1. 24小时健康监测
实时心率、血氧、睡眠质量监测...

### 2. 14天超长续航
告别电量焦虑，一次充电陪伴半月...

### 3. 时尚百搭设计
商务运动两相宜...

## 用户评价
"自从戴上它，我开始关注自己的健康数据..." - 张先生

## 结语
科技让生活更美好...

---
字数：1,234字
SEO关键词密度：合理
适合平台：官网/公众号/知乎`
    },
    capabilities: ['多种文体', 'SEO优化', '风格调整', '多语言'],
    useCases: ['营销文案', '产品介绍', '品牌故事', '软文撰写']
  },
  
  {
    id: 'skill-012',
    name: 'Copywriting Pro',
    identifier: 'copywriting-pro',
    description: '营销文案专家，支持广告语、Slogan、产品描述',
    icon: '📢',
    version: '2.2.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['文案', '营销', '广告'],
    category: '写作助手',
    downloads: 234560,
    favorites: 16780,
    installs: 189340,
    installGuide: {
      agent: 'npm install @oneclaw/copywriting-pro',
      human: '在技能市场搜索"Copywriting Pro"并点击安装'
    },
    updatedAt: '2024-01-13',
    example: {
      scenario: '为咖啡品牌创作Slogan',
      input: '品牌：晨光咖啡，定位：唤醒你的每一天',
      output: `创意方案

【方案一】情感路线
"晨光咖啡，唤醒的不只是味蕾"
- 温暖、治愈、有共鸣

【方案二】功能路线
"第一口，就清醒"
- 直接、有力、记忆点强

【方案三】场景路线
"你的早安，从这杯开始"
- 生活化、亲切、场景感

【方案四】对仗路线
"晨光一杯，精神加倍"
- 朗朗上口、易传播

【推荐】方案二 + 方案四组合使用
- 广告：第一口，就清醒
- 口号：晨光一杯，精神加倍`
    },
    capabilities: ['创意文案', 'A/B测试建议', '情感分析', '品牌调性匹配'],
    useCases: ['品牌Slogan', '广告文案', '产品命名', '活动主题']
  },
  
  // ========== 效率工具 ==========
  {
    id: 'skill-013',
    name: 'Meeting Assistant',
    identifier: 'meeting-assist',
    description: '会议助手，自动记录、总结、生成待办事项',
    icon: '📝',
    version: '2.0.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['会议', '记录', '效率'],
    category: '效率工具',
    featured: true,
    downloads: 189450,
    favorites: 13450,
    installs: 156780,
    installGuide: {
      agent: 'npm install @oneclaw/meeting-assist',
      human: '在技能市场搜索"Meeting Assistant"并点击安装'
    },
    updatedAt: '2024-01-15',
    example: {
      scenario: '会议记录与总结',
      input: '上传：项目启动会议录音（30分钟）',
      output: `会议纪要

【基本信息】
- 会议：产品Q2迭代启动会
- 时间：2024-01-15 14:00-14:30
- 参与人：产品部、技术部、设计部

【核心内容】

1. 项目目标
   - Q2完成3个核心功能开发
   - 用户增长20%
   - 留存率提升至60%

2. 分工安排
   - 产品：需求文档（1月20日前）
   - 设计：UI稿（1月30日前）
   - 技术：技术方案（2月5日前）

3. 时间节点
   - 1月20日：需求评审
   - 2月10日：设计评审
   - 3月15日：开发完成
   - 4月1日：上线

【待办事项】
☐ 张三：完成PRD文档（1月20日）
☐ 李四：完成UI设计（1月30日）
☐ 王五：技术方案评审（2月5日）

【风险提示】
- 设计周期紧张，建议提前启动`
    },
    capabilities: ['语音转文字', '智能总结', '待办提取', '会议模板'],
    useCases: ['项目会议', '团队周会', '客户沟通', '培训记录']
  },
  
  {
    id: 'skill-014',
    name: 'Email Assistant',
    identifier: 'email-assist',
    description: '邮件助手，智能撰写、回复、分类管理',
    icon: '📧',
    version: '1.8.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['邮件', '沟通', '效率'],
    category: '效率工具',
    downloads: 145670,
    favorites: 9870,
    installs: 118760,
    installGuide: {
      agent: 'npm install @oneclaw/email-assist',
      human: '在技能市场搜索"Email Assistant"并点击安装'
    },
    updatedAt: '2024-01-09',
    example: {
      scenario: '撰写商务合作邮件',
      input: '目的：邀请对方参加产品发布会',
      output: `邮件草稿

主题：【邀请】诚邀您参加XX产品发布会

尊敬的XXX先生/女士：

您好！

感谢您长期以来对我们公司的关注与支持。

我司将于2024年3月15日在北京举办新品发布会，诚挚邀请您拨冗出席。本次活动将发布全新产品线，并设有互动体验环节。

【活动详情】
时间：2024年3月15日 14:00-17:00
地点：北京XX酒店
议程：见附件

如蒙应允，请于3月10日前回复确认。

期待您的莅临！

此致
敬礼

张三
XX科技有限公司
电话：138-XXXX-XXXX

---
【建议】
- 添加日历邀请附件
- 准备多种时间选项
- 附上往期活动照片`
    },
    capabilities: ['智能撰写', '语气调整', '模板库', '自动回复'],
    useCases: ['商务沟通', '求职邮件', '客户维护', '团队通知']
  },
  
  // ========== 其他 ==========
  {
    id: 'skill-015',
    name: 'Translation Pro',
    identifier: 'translation-pro',
    description: '专业翻译工具，支持100+语言，保留专业术语',
    icon: '🌐',
    version: '3.1.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['翻译', '多语言', '国际化'],
    category: '其他',
    featured: true,
    downloads: 567890,
    favorites: 38940,
    installs: 456780,
    installGuide: {
      agent: 'npm install @oneclaw/translation-pro',
      human: '在技能市场搜索"Translation Pro"并点击安装'
    },
    updatedAt: '2024-01-18',
    example: {
      scenario: '翻译产品介绍文档',
      input: `中文：
我们的智能手表采用最新的健康监测技术，能够24小时实时监测心率、血氧和睡眠质量。`,
      output: `翻译结果

【英文】
Our smartwatch features the latest health monitoring technology, capable of 24/7 real-time monitoring of heart rate, blood oxygen, and sleep quality.

【日文】
当社のスマートウォッチは最新の健康モニタリング技術を採用し、24時間リアルタイムで心拍数、血中酸素濃度、睡眠の質を監視できます。

【韩文】
저희 스마트워치는 최신 건강 모니터링 기술을 탑재하여 24시간 실시간 심박수, 혈중 산소, 수면 품질을 모니터링할 수 있습니다.

【专业术语对照】
- 智能手表 → Smartwatch
- 健康监测 → Health monitoring
- 心率 → Heart rate
- 血氧 → Blood oxygen (SpO2)

【翻译质量】
- 准确度：98%
- 流畅度：优秀
- 专业度：高`
    },
    capabilities: ['多语言支持', '专业术语库', '上下文理解', '批量翻译'],
    useCases: ['产品国际化', '文档翻译', '跨文化沟通', '学习辅助']
  },
  
  {
    id: 'skill-016',
    name: 'Learning Assistant',
    identifier: 'learning-assist',
    description: '学习助手，支持知识问答、概念解释、学习路径规划',
    icon: '📚',
    version: '2.0.0',
    author: 'OneClaw Team',
    source: '官方',
    tags: ['学习', '教育', '知识'],
    category: '其他',
    downloads: 234560,
    favorites: 17890,
    installs: 189340,
    installGuide: {
      agent: 'npm install @oneclaw/learning-assist',
      human: '在技能市场搜索"Learning Assistant"并点击安装'
    },
    updatedAt: '2024-01-12',
    example: {
      scenario: '学习Python编程',
      input: '问题：如何学习Python数据分析？',
      output: `学习路径规划

【第1阶段：Python基础】（2周）
1. 基本语法和数据类型
2. 条件语句和循环
3. 函数和模块
推荐资源：廖雪峰Python教程

【第2阶段：数据分析库】（3周）
1. NumPy：数值计算
2. Pandas：数据处理
3. Matplotlib：数据可视化
实践项目：分析某电商销售数据

【第3阶段：进阶技能】（4周）
1. 数据清洗技巧
2. 统计分析方法
3. 机器学习基础（Scikit-learn）

【第4阶段：实战项目】（4周）
1. 完整数据分析流程
2. 报告撰写
3. 结果可视化

【学习建议】
- 每天练习2小时
- 完成至少3个项目
- 加入学习社群交流`
    },
    capabilities: ['学习路径规划', '概念解释', '资源推荐', '练习题生成'],
    useCases: ['技能学习', '考试复习', '职业发展', '知识管理']
  },
];

export default aiSkills;
