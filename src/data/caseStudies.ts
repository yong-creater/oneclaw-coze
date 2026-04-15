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

export interface TestCase {
  id: string;
  title: string;
  subtitle: string;
  feature: string;
  target?: string;
  before: {
    requirement: string;
    testCases: string[];
  };
  after: {
    // 拆解出的功能模块
    modules: TestCaseModule[];
    // 汇总统计
    summary: {
      totalModules: number;
      totalScenarios: number;
      totalCases: number;
      coverage: string;
    };
  };
  result: {
    coverage: string;
    timeSaved: string;
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
    title: '功能测试全覆盖，交付效率提升300%',
    subtitle: '电商后台 · 用户订单模块',
    feature: '用户下单全流程测试',
    target: '用户订单全流程测试',
    before: {
      requirement: `用户下单功能需求：
1. 用户选择商品，添加到购物车
2. 用户确认订单，填写收货地址
3. 选择支付方式完成支付
4. 支付成功后，订单状态变更为"已支付"
5. 商家发货后，订单状态变更为"已发货"
6. 用户确认收货后，订单完成`,
      testCases: [
        '测试正常下单流程',
        '测试支付失败',
        '测试地址为空'
      ]
    },
    after: {
      // 拆解出的功能模块
      modules: [
        {
          id: 'MOD_01',
          name: '商品管理模块',
          description: '商品浏览、搜索、详情查看',
          scenarios: ['商品列表展示', '商品搜索过滤', '商品详情查看', '库存状态显示']
        },
        {
          id: 'MOD_02',
          name: '购物车模块',
          description: '商品添加、修改数量、删除、结算',
          scenarios: ['添加商品到购物车', '修改购买数量', '删除购物车商品', '购物车价格计算', '结算前库存校验']
        },
        {
          id: 'MOD_03',
          name: '订单确认模块',
          description: '地址选择、优惠使用、订单信息确认',
          scenarios: ['地址簿选择', '新增收货地址', '优惠券使用', '订单信息确认', '备注信息填写']
        },
        {
          id: 'MOD_04',
          name: '支付模块',
          description: '支付方式选择、支付流程、结果处理',
          scenarios: ['余额支付', '第三方支付', '支付密码验证', '支付超时处理', '支付异常恢复']
        },
        {
          id: 'MOD_05',
          name: '订单状态模块',
          description: '订单状态流转、状态查询、通知推送',
          scenarios: ['待支付→已支付', '已支付→已发货', '已发货→确认收货', '订单超时取消', '退款申请处理']
        }
      ],
      // 汇总统计
      summary: {
        totalModules: 5,
        totalScenarios: 23,
        totalCases: 47,
        coverage: '98%'
      }
    },
    result: {
      coverage: '98%',
      timeSaved: '3小时/轮'
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
  }
];
