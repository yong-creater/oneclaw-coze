// 案例展示数据 - 展示优化前后的真实对比

export interface ResumeCase {
  id: string;
  title: string;
  subtitle: string;
  target: string; // 目标岗位
  before: {
    resume: string;
    highlight: string[]; // 需要优化的点
  };
  jd: string;
  after: {
    resume: string;
    changes: {
      before: string; // 原文
      after: string;  // 优化后
      reason: string; // 为什么这样改
    }[];
  };
  result: {
    interviewRate: string;
    salary: string;
    company: string;
  };
}

export interface NovelCase {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  before: {
    content: string;
    style: string;
  };
  after: {
    content: string;
    style: string;
    script?: string; // 生成的脚本
  };
  result: {
    views: string;
    revenue: string;
    platform: string;
  };
}

export interface TestCaseModule {
  id: string;
  name: string;
  description: string;
  scenarios: string[];
}

export interface TestCaseStep {
  step: number;
  action: string;
  data?: string;
  expected: string;
}

export interface TestCaseDetail {
  id: string;
  title: string;
  module: string;
  level: string;       // P0/P1/P2
  type: string;        // 功能测试/异常测试/边界测试
  precondition: string[];
  steps: TestCaseStep[];
  tags: string[];
}

export interface TestCase {
  id: string;
  title: string;
  subtitle: string;
  feature: string;
  // 原始需求
  requirement: {
    description: string;
    details: string[];
  };
  // 拆解结果
  breakdown: {
    modules: {
      id: string;
      name: string;
      description: string;
      scenarios: string[];
    }[];
    testCases: TestCaseDetail[];
  };
  // 统计
  stats: {
    modules: number;
    scenarios: number;
    cases: number;
    p0: number;
    p1: number;
    p2: number;
  };
  result: {
    efficiency: string;
    coverage: string;
  };
}

export interface ProductRegion {
  id: string;
  name: string;
  image: string;
  complianceScore: number;
  marks: string[];
}

export interface ProductCase {
  id: string;
  title: string;
  subtitle: string;
  product: string;
  originalImage: string;
  regions: ProductRegion[];
  complianceSummary: {
    overall: string;
    issues: {
      type: string;
      original: string;
      fixed: string;
    }[];
  };
  result: {
    conversion: string;
    platforms: string;
    regions: string;
  };
}

// 简历优化案例
export const RESUME_CASES: ResumeCase[] = [
  {
    id: 'resume-case-1',
    title: '从简历石沉大海到斩获字节offer',
    subtitle: '23届毕业生 · 计算机专业',
    target: '字节跳动 · 前端开发工程师',
    before: {
      resume: `张三
求职意向：前端开发
工作年限：应届

教育背景
2020-2024  北京理工大学  计算机科学与技术  本科

项目经验
1. 校园二手交易平台
   - 使用Vue.js开发前端页面
   - 实现了用户登录注册功能

2. 课程管理系统
   - 使用React框架
   - 实现了课程表查询功能`,
      highlight: [
        '项目描述过于简单，缺乏技术深度',
        '没有量化成果，无法体现能力',
        'STAR法则完全没有体现',
        '缺少技能亮点关键词'
      ]
    },
    jd: `字节跳动 - 前端开发工程师

岗位职责：
1. 负责产品的前端架构设计与开发
2. 优化页面性能，提升用户体验
3. 参与前端技术选型与团队技术建设

任职要求：
1. 本科及以上学历，计算机相关专业
2. 熟练掌握React/Vue等前端框架
3. 熟悉前端工程化、性能优化
4. 有大型项目经验优先
5. 了解Node.js或Python后端开发`,
    after: {
      resume: `张三
求职意向：前端开发工程师
工作年限：1年（23届） | 期望薪资：25-35K

教育背景
2020-2024  北京理工大学  计算机科学与技术  本科
• GPA 3.7/4.0，连续3年获得校级奖学金
• ACM-ICPC亚洲区域赛铜奖

项目经验
1. 校园二手交易平台「校淘」- 核心前端开发
   技术栈：Vue3 + TypeScript + Vite + Pinia
   
   • 独立完成从0到1搭建前端架构，设计并实现用户体系、商品发布、订单交易等核心模块
   • 优化首屏加载性能，LCP从3.2s降至0.8s，用户转化率提升40%
   • 封装10+通用业务组件，代码复用率达65%，开发效率提升50%
   • 支撑618大促峰值QPS 5000+，服务全校3万+师生

2. 课程管理系统「CourseHub」- 全栈开发
   技术栈：React18 + Next.js + Node.js + MySQL
   
   • 主导前端架构设计，采用组件化+Hooks模式，模块解耦率提升70%
   • 实现课程智能推荐算法，基于用户行为数据，课程点击率提升35%
   • 设计RESTful API接口20+，后端响应时间<100ms
   • 项目获校级优秀毕业设计，综合评分93分

专业技能
• 前端框架：Vue3 / React18 / Next.js（精通）
• 工程化：Webpack / Vite / TypeScript（深入理解原理）
• 性能优化：Web Vitals / Lighthouse / Performance API
• 后端能力：Node.js / Express / MySQL / Redis
• 工具：Git / Docker / CI/CD`,
      changes: [
        {
          before: '使用Vue.js开发前端页面',
          after: 'Vue3 + TypeScript + Vite + Pinia，技术栈精确到版本',
          reason: 'JD要求"熟练掌握Vue"，明确技术栈让面试官快速匹配'
        },
        {
          before: '实现了用户登录注册功能',
          after: '独立完成从0到1搭建前端架构，设计并实现用户体系、订单交易等核心模块',
          reason: '体现独立负责能力，符合"有大型项目经验优先"'
        },
        {
          before: '优化页面性能',
          after: '优化首屏加载性能，LCP从3.2s降至0.8s，用户转化率提升40%',
          reason: '量化成果，证明性能优化能力，符合"优化页面性能"的岗位要求'
        },
        {
          before: '支撑峰值流量',
          after: '支撑618大促峰值QPS 5000+，服务全校3万+师生',
          reason: '"大促"场景契合字节跳动业务特点，"3万+"体现用户规模'
        }
      ]
    },
    result: {
      interviewRate: '+200%',
      salary: '28K · 16薪',
      company: '字节跳动'
    }
  }
];

// 小说案例
export const NOVEL_CASES: NovelCase[] = [
  {
    id: 'novel-case-1',
    title: '1小时产出10条推文，月入5万+',
    subtitle: '短剧达人 · 小说改编专家',
    genre: '都市爽文 → 短剧脚本',
    before: {
      content: `第38章 真相大白

林天站在会议室门口，看着里面的灯光，心里五味杂陈。

三年了，整整三年。他从一个普通的实习生，一步步爬到了现在的位置。可是谁知道，这背后付出了多少。

推开门的瞬间，所有人的目光都看向了他。有人惊讶，有人不屑，还有人冷笑。

"林天，你怎么来了？"王总皱起眉头。

"我是来拿回属于我的东西的。"林天平静地说。`,
      style: '传统小说风格，节奏慢，描写冗余'
    },
    after: {
      content: `【场景1：会议室对峙】（情绪张力：★★★★★）

林天推门而入。

王总："你怎么——"

林天打断他，将文件甩在会议桌上。

"这是三年前项目的原始代码，commit记录清清楚楚。最后三个月，是谁在加班？是谁一个人扛下整个模块？"

全场鸦雀无声。

"还有这份财务报表，"林天冷笑，"王总，要不要我念出来？"

王总脸色煞白。

【反转金句】
"您给我的定位是'团队协作'，那这个'协作'的代价，是不是有点太大了？"`,
      style: '短剧风格，快节奏，强反转，情绪爆点密集'
    },
    result: {
      views: '5000万+',
      revenue: '5万+/月',
      platform: '抖音·短剧'
    }
  }
];

// 测试用例案例
export const TEST_CASES: TestCase[] = [
  {
    id: 'test-case-1',
    title: 'AI智能拆解，3分钟生成完整测试用例',
    subtitle: '电商后台 · 用户订单模块',
    feature: '用户下单全流程测试',
    // 原始需求
    requirement: {
      description: '用户下单功能需求文档',
      details: [
        '用户选择商品，添加到购物车',
        '用户确认订单，填写/选择收货地址',
        '选择支付方式（余额/支付宝/微信）完成支付',
        '支付成功后，订单状态变更为"已支付"',
        '商家后台发货，填写物流信息',
        '用户查看物流状态',
        '用户确认收货，订单完成',
        '支持订单取消、退款申请'
      ]
    },
    // 拆解结果
    breakdown: {
      modules: [
        {
          id: 'M01',
          name: '商品管理',
          description: '商品浏览、搜索、详情、库存',
          scenarios: ['商品列表', '商品搜索', '商品详情', '库存查询', '库存不足提示']
        },
        {
          id: 'M02',
          name: '购物车',
          description: '添加商品、数量修改、删除、结算',
          scenarios: ['添加购物车', '修改数量', '删除商品', '价格实时计算', '结算前校验']
        },
        {
          id: 'M03',
          name: '订单确认',
          description: '地址选择、优惠使用、订单预览',
          scenarios: ['地址簿选择', '新增地址', '编辑地址', '优惠券使用', '订单信息确认']
        },
        {
          id: 'M04',
          name: '支付中心',
          description: '支付方式选择、支付流程、结果处理',
          scenarios: ['余额支付', '支付宝支付', '微信支付', '支付密码验证', '支付超时', '支付失败恢复']
        },
        {
          id: 'M05',
          name: '订单状态',
          description: '状态流转、物流、取消退款',
          scenarios: ['待支付→已支付', '已支付→已发货', '已发货→确认收货', '订单超时取消', '用户取消申请', '退款申请处理']
        }
      ],
      testCases: [
        {
          id: 'TC-001',
          title: '正常流程-使用余额支付完成下单',
          module: 'M04-支付中心',
          level: 'P0',
          type: '功能测试',
          precondition: ['用户已登录', '账户余额≥100元', '购物车有1件库存充足的商品'],
          steps: [
            { step: 1, action: '进入购物车', data: '-', expected: '商品列表显示正确，价格合计准确' },
            { step: 2, action: '点击"去结算"', data: '-', expected: '跳转至订单确认页，收货地址正确' },
            { step: 3, action: '确认订单信息，点击"提交订单"', data: '-', expected: '弹出支付方式选择' },
            { step: 4, action: '选择"余额支付"，输入支付密码', data: '密码: test123', expected: '支付成功，跳转支付完成页' },
            { step: 5, action: '查看订单状态', data: '-', expected: '订单状态变为"已支付"，余额扣减正确' }
          ],
          tags: ['冒烟测试', 'P0用例', '核心流程']
        },
        {
          id: 'TC-002',
          title: '异常流程-余额不足时支付失败',
          module: 'M04-支付中心',
          level: 'P0',
          type: '异常测试',
          precondition: ['用户已登录', '账户余额=5元', '购物车有1件价格100元的商品'],
          steps: [
            { step: 1, action: '进入购物车，点击"去结算"', data: '-', expected: '跳转至订单确认页' },
            { step: 2, action: '点击"提交订单"', data: '-', expected: '弹出支付方式选择' },
            { step: 3, action: '选择"余额支付"，输入支付密码', data: '密码: test123', expected: '提示"余额不足，当前余额5.00元，需要100.00元"' },
            { step: 4, action: '点击"去充值"', data: '-', expected: '跳转至充值页面' },
            { step: 5, action: '取消支付，返回订单页', data: '-', expected: '订单状态仍为"待支付"，余额未扣减' }
          ],
          tags: ['异常测试', 'P0用例', '余额不足']
        },
        {
          id: 'TC-003',
          title: '边界测试-订单支付超时自动取消',
          module: 'M05-订单状态',
          level: 'P1',
          type: '边界测试',
          precondition: ['用户已登录', '已创建未支付订单'],
          steps: [
            { step: 1, action: '创建新订单，进入待支付状态', data: '-', expected: '倒计时显示15:00' },
            { step: 2, action: '等待15分钟，不进行任何操作', data: '-', expected: '倒计时归零' },
            { step: 3, action: '查看订单状态', data: '-', expected: '订单状态变更为"已取消"，显示"超时未支付，自动取消"' },
            { step: 4, action: '验证库存是否释放', data: '-', expected: '商品库存已恢复' }
          ],
          tags: ['边界测试', 'P1用例', '超时场景']
        },
        {
          id: 'TC-004',
          title: '功能测试-商家发货后用户查看物流',
          module: 'M05-订单状态',
          level: 'P0',
          type: '功能测试',
          precondition: ['存在已支付订单', '商家已发货并填写物流信息'],
          steps: [
            { step: 1, action: '用户进入"我的订单"列表', data: '-', expected: '显示订单列表，包含物流状态标签' },
            { step: 2, action: '点击订单查看详情', data: '-', expected: '显示物流信息卡片（物流公司+运单号）' },
            { step: 3, action: '点击"查看物流"进入物流详情页', data: '-', expected: '显示完整物流轨迹，含时间节点' },
            { step: 4, action: '物流信息中点击商家电话', data: '-', expected: '调起拨打电话' }
          ],
          tags: ['功能测试', 'P0用例', '物流场景']
        },
        {
          id: 'TC-005',
          title: '异常测试-商品库存不足时无法下单',
          module: 'M02-购物车',
          level: 'P0',
          type: '异常测试',
          precondition: ['商品A库存=1件', '用户已登录'],
          steps: [
            { step: 1, action: '用户A将商品A加入购物车', data: '数量: 1', expected: '添加成功' },
            { step: 2, action: '管理员将商品A库存修改为0', data: '-', expected: '库存变更成功' },
            { step: 3, action: '用户A进入购物车，点击"去结算"', data: '-', expected: '提示"商品库存不足，请返回购物车修改"' },
            { step: 4, action: '查看购物车商品状态', data: '-', expected: '商品A显示"库存不足"标签，无法勾选结算' }
          ],
          tags: ['异常测试', 'P0用例', '库存校验']
        },
        {
          id: 'TC-006',
          title: '功能测试-新增收货地址',
          module: 'M03-订单确认',
          level: 'P1',
          type: '功能测试',
          precondition: ['用户已登录', '当前有2个收货地址（最多5个）'],
          steps: [
            { step: 1, action: '进入订单确认页，点击"新增收货地址"', data: '-', expected: '弹出地址编辑弹窗' },
            { step: 2, action: '填写完整地址信息', data: '收货人: 张三, 手机: 13800138000, 省市区: 北京市朝阳区, 详细地址: xx路xx号', expected: '表单验证通过' },
            { step: 3, action: '点击"保存"', data: '-', expected: '弹窗关闭，地址列表更新显示新地址' },
            { step: 4, action: '选择新地址，确认订单', data: '-', expected: '订单收货地址正确显示新地址信息' }
          ],
          tags: ['功能测试', 'P1用例', '地址管理']
        },
        {
          id: 'TC-007',
          title: '异常测试-收货地址为空时无法提交订单',
          module: 'M03-订单确认',
          level: 'P0',
          type: '异常测试',
          precondition: ['用户已登录', '购物车有商品', '当前无收货地址'],
          steps: [
            { step: 1, action: '进入购物车，点击"去结算"', data: '-', expected: '跳转至订单确认页' },
            { step: 2, action: '点击"提交订单"按钮', data: '-', expected: '提示"请添加收货地址"' },
            { step: 3, action: '点击提示中的"添加地址"', data: '-', expected: '跳转至地址管理页' }
          ],
          tags: ['异常测试', 'P0用例', '必填校验']
        },
        {
          id: 'TC-008',
          title: '功能测试-用户申请退款',
          module: 'M05-订单状态',
          level: 'P1',
          type: '功能测试',
          precondition: ['存在已支付订单（未发货）'],
          steps: [
            { step: 1, action: '进入"我的订单"，点击已支付订单', data: '-', expected: '进入订单详情页' },
            { step: 2, action: '点击"申请退款"按钮', data: '-', expected: '弹出退款原因选择' },
            { step: 3, action: '选择退款原因，提交申请', data: '原因: 不想要了', expected: '提示"退款申请已提交，等待商家处理"' },
            { step: 4, action: '查看订单状态', data: '-', expected: '订单状态变更为"退款中"' },
            { step: 5, action: '商家后台同意退款', data: '-', expected: '订单状态变更为"已退款"，余额返还' }
          ],
          tags: ['功能测试', 'P1用例', '退款流程']
        }
      ]
    },
    // 统计
    stats: {
      modules: 5,
      scenarios: 23,
      cases: 47,
      p0: 15,
      p1: 22,
      p2: 10
    },
    result: {
      efficiency: '3分钟生成47条用例',
      coverage: '覆盖率98%'
    }
  }
];

// 出海详情页案例
export const PRODUCT_CASES: ProductCase[] = [
  {
    id: 'product-case-1',
    title: '一套素材打全球，转化率提升180%',
    subtitle: '智能手表 · 出海多平台适配',
    product: 'GT-Watch Pro 智能运动手表',
    originalImage: 'https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_09710216-7c4e-437e-9b2d-ffdcd194489b.jpeg',
    regions: [
      {
        id: 'eu',
        name: '欧盟版',
        image: 'https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_89ef0078-e708-4654-8c06-fa690d0ec7c6.jpeg',
        complianceScore: 98,
        marks: ['CE标识', 'WEEE标志', '多语言警告语', '环保材料说明']
      },
      {
        id: 'us',
        name: '美国版',
        image: 'https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_9d0e94da-429b-4a9a-bd16-f8012d979344.jpeg',
        complianceScore: 96,
        marks: ['FDA描述合规', 'FCC认证标注', '英文警告语', '运动场景']
      },
      {
        id: 'jp',
        name: '日本版',
        image: 'https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_947e9f22-ca6a-402b-8a3a-320fb51b4e63.jpeg',
        complianceScore: 95,
        marks: ['PSE标识', '日语标注', 'JIS规格说明', '简约色调']
      },
      {
        id: 'sea',
        name: '东南亚版',
        image: 'https://coze-coding-project.tos.coze.site/coze_storage_7621509635564011535/image/generate_image_3aa01991-10dc-4643-9966-9ecdf887ad89.jpeg',
        complianceScore: 94,
        marks: ['无宗教元素', '多语言标注', '价格含税标识', '本地审美']
      }
    ],
    complianceSummary: {
      overall: '4大地区全覆盖，合规通过率98%+，无下架风险',
      issues: [
        { type: '法规标识', original: '无任何法规标识', fixed: '按地区添加CE/FCC/PSE等强制标识' },
        { type: '文化适配', original: '统一中文素材', fixed: '色调、场景、模特本地化' },
        { type: '平台适配', original: '单一尺寸素材', fixed: '自动生成各平台标准尺寸' },
        { type: '语言合规', original: '夸大宣传用语', fixed: '符合各国广告法的规范表述' }
      ]
    },
    result: {
      conversion: '+180%',
      platforms: '亚马逊/TikTok/速卖通/独立站',
      regions: '欧盟/美国/日本/东南亚'
    }
  }
];

// 所有案例的元数据
export const ALL_CASES = [
  {
    key: 'resume',
    name: 'STAR简历优化',
    icon: 'FileText',
    color: 'from-blue-500 to-cyan-500',
    description: '上传简历+粘贴JD，一键生成STAR法则优化版简历',
    case: RESUME_CASES[0]
  },
  {
    key: 'novel',
    name: '小说创作工坊',
    icon: 'Feather',
    color: 'from-purple-500 to-pink-500',
    description: '小说→深度洗稿→漫画生图→推文脚本，全流程创作',
    case: NOVEL_CASES[0]
  },
  {
    key: 'testcraft',
    name: 'AI测试用例',
    icon: 'FlaskConical',
    color: 'from-violet-500 to-fuchsia-500',
    description: 'AI智能生成测试用例，支持BDD格式、批量导出',
    case: TEST_CASES[0]
  },
  {
    key: 'product-page',
    name: '出海详情页',
    icon: 'Globe',
    color: 'from-orange-500 to-amber-500',
    description: '一键生成合规商品图，自动适配各地区法规与文化',
    case: PRODUCT_CASES[0]
  }
];
