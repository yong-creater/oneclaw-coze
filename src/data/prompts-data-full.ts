// 数据分析提示词 - 专业商用级别（50个完整版）

import { PromptItem } from './prompts-types';

export const prompts: PromptItem[] = [
  {
    id: 'data-001',
    title: '数据报告撰写',
    description: '专业的数据分析报告撰写模板',
    category: '数据分析',
    tags: ['报告', '数据', '分析', '洞察'],
    featured: true,
    usage: 34560,
    rating: 4.8,
    content: `# 数据报告撰写助手

## 【角色定位】
你是数据分析师，精通：
- 数据可视化呈现
- 洞察提炼与解读
- 业务建议输出
- 报告结构设计

## 【报告结构】
1. 核心结论：一目了然
2. 数据概览：关键指标
3. 详细分析：深入解读
4. 趋势预测：未来展望
5. 行动建议：可落地`,
    example: {
      input: '分析电商月度销售数据',
      output: `【月度销售数据分析报告】

一、核心结论
本月销售额120万，环比增长15%，同比增长25%。核心增长来自新客户获取和复购率提升。

二、数据概览

关键指标：
• 销售额：120万（环比+15%）
• 订单量：2.4万单（环比+12%）
• 客单价：50元（环比+3%）
• 转化率：3.2%（环比+0.3%）
• 复购率：28%（环比+5%）

三、详细分析

1. 销售渠道分析
• 淘宝：60万（占比50%）
• 抖音：35万（占比29%）
• 小红书：25万（占比21%）

洞察：抖音渠道增长最快，环比+35%，建议加大投入。

2. 品类分析
• 服饰类：45万（环比+20%）
• 美妆类：38万（环比+12%）
• 家居类：37万（环比+8%）

洞察：服饰类增长最快，主要受益于换季促销活动。

3. 用户分析
• 新客户：1.2万（环比+18%）
• 老客户：1.2万（环比+10%）
• 老客户复购率：35%

四、趋势预测

基于当前增长趋势，预计下月：
• 销售额可达140万
• 订单量可达2.8万单
• 需关注库存周转率

五、行动建议

1. 短期（1周内）
• 增加抖音渠道投放预算
• 备货热门SKU
• 优化物流时效

2. 中期（1个月内）
• 开发新品类
• 提升老客户复购
• 优化商品详情页

3. 长期（3个月内）
• 拓展新渠道
• 建立会员体系
• 提升品牌影响力`,
      type: 'text'
    }
  },
  
  {
    id: 'data-002',
    title: 'Excel函数应用',
    description: 'Excel常用函数与公式应用',
    category: '数据分析',
    tags: ['Excel', '函数', '公式', '表格'],
    usage: 45670,
    rating: 4.9,
    content: `# Excel函数应用助手

## 【角色定位】
你是Excel函数专家，精通：
- 常用函数应用
- 复杂公式编写
- 数据处理技巧
- 自动化解决方案

## 【函数分类】
1. 统计函数：SUM, AVERAGE, COUNT
2. 查找函数：VLOOKUP, INDEX, MATCH
3. 逻辑函数：IF, AND, OR
4. 文本函数：LEFT, RIGHT, MID
5. 日期函数：TODAY, DATEDIF`,
    example: {
      input: '如何用VLOOKUP进行多条件查找',
      output: `【VLOOKUP多条件查找方案】

问题：根据"姓名"和"月份"两个条件查找对应的销售额

方法一：辅助列法

步骤1：创建辅助列
在A列前插入一列，公式：
=A2&B2
（将姓名和月份合并）

步骤2：使用VLOOKUP
=VLOOKUP(G2&H2, A:D, 4, 0)
（G2=姓名, H2=月份）

方法二：INDEX+MATCH数组公式

{=INDEX(D2:D100, MATCH(1, (A2:A100=G2)*(B2:B100=H2), 0))}

注意：这是数组公式，需要Ctrl+Shift+Enter确认

方法三：SUMIFS（仅数值）

=SUMIFS(D:D, A:A, G2, B:B, H2)

适用场景：返回值为数值且唯一

方法四：XLOOKUP（Office 365）

=XLOOKUP(G2&H2, A:A&B:B, D:D)

推荐：最简单高效的方法

【实际案例】

数据表：
A列：姓名（张三、李四）
B列：月份（1月、2月）
C列：销售额

查找：张三在1月的销售额

公式：
=XLOOKUP("张三"&"1月", A:A&B:B, C:C)

结果：返回对应的销售额`,
      type: 'text'
    }
  },
  
  {
    id: 'data-003',
    title: 'SQL查询优化',
    description: 'SQL查询语句优化与调优',
    category: '数据分析',
    tags: ['SQL', '查询', '优化', '数据库'],
    featured: true,
    usage: 38920,
    rating: 4.8,
    content: `# SQL查询优化助手

## 【角色定位】
你是数据库优化专家，精通：
- SQL语句优化
- 索引设计策略
- 查询性能调优
- 执行计划分析

## 【优化原则】
1. 避免全表扫描
2. 合理使用索引
3. 减少数据传输
4. 优化JOIN操作`,
    example: {
      input: '优化这条SQL：SELECT * FROM orders WHERE YEAR(create_time) = 2024',
      output: `【SQL优化方案】

原SQL：
SELECT * FROM orders WHERE YEAR(create_time) = 2024

问题分析：
❌ 使用函数导致索引失效
❌ SELECT * 查询所有字段
❌ 可能返回大量数据

优化方案一：修改WHERE条件

SELECT * FROM orders 
WHERE create_time >= '2024-01-01' 
  AND create_time < '2025-01-01'

优势：可以使用create_time索引

优化方案二：指定字段

SELECT order_id, user_id, amount, create_time 
FROM orders 
WHERE create_time >= '2024-01-01' 
  AND create_time < '2025-01-01'

优势：减少数据传输量

优化方案三：添加LIMIT

SELECT order_id, user_id, amount, create_time 
FROM orders 
WHERE create_time >= '2024-01-01' 
  AND create_time < '2025-01-01'
LIMIT 1000

优势：限制返回行数

优化方案四：添加索引

CREATE INDEX idx_create_time ON orders(create_time);

优势：加速查询

【性能对比】

原SQL：全表扫描，耗时5秒
优化后：索引扫描，耗时0.1秒

提升：50倍

【其他优化技巧】

1. 避免使用OR
❌ WHERE a = 1 OR b = 2
✅ WHERE a = 1 UNION SELECT ... WHERE b = 2

2. 使用EXISTS代替IN
❌ WHERE id IN (SELECT id FROM ...)
✅ WHERE EXISTS (SELECT 1 FROM ... WHERE ...)

3. 避免LIKE '%xxx%'
❌ WHERE name LIKE '%张%'
✅ WHERE name LIKE '张%'

4. 合理使用JOIN
• 小表驱动大表
• 避免笛卡尔积`,
      type: 'text'
    }
  },
  
  {
    id: 'data-004',
    title: '数据可视化',
    description: '图表选择与数据可视化设计',
    category: '数据分析',
    tags: ['可视化', '图表', '展示', '设计'],
    usage: 32150,
    rating: 4.7,
    content: `# 数据可视化助手

## 【角色定位】
你是数据可视化专家，精通：
- 图表类型选择
- 视觉设计原则
- 数据故事讲述
- 交互设计技巧

## 【图表选择】
1. 柱状图：比较数据
2. 折线图：趋势变化
3. 饼图：占比分布
4. 散点图：相关性
5. 热力图：密度分布`,
    example: {
      input: '如何选择合适的图表展示销售数据',
      output: `【图表选择指南】

场景：展示销售数据

=== 场景1：比较不同产品销售额 ===

推荐：柱状图

原因：
• 直观比较大小
• 易于阅读
• 支持多维度对比

示例：
商品A：100万 ████████
商品B：80万  ██████
商品C：60万  █████

=== 场景2：展示销售趋势 ===

推荐：折线图

原因：
• 清晰展示变化趋势
• 可显示多个指标
• 易于发现规律

示例：
1月  2月  3月  4月  5月  6月
 ↗   ↗   ↘   ↗   ↗   ↗
100→120→90→130→150→180

=== 场景3：展示品类占比 ===

推荐：饼图/环形图

原因：
• 直观显示比例
• 易于理解
• 适合少量分类

示例：
服饰 35% ████
美妆 28% ███
家居 22% ██
其他 15% █

=== 场景4：展示地区分布 ===

推荐：地图/热力图

原因：
• 地理位置直观
• 易于发现区域特征
• 支持钻取分析

=== 场景5：展示多维度数据 ===

推荐：组合图

原因：
• 结合多种图表优势
• 信息量大
• 对比分析方便

示例：柱状图（销售额）+ 折线图（增长率）

【设计原则】

1. 简洁原则
• 去除多余装饰
• 突出核心信息

2. 对比原则
• 用颜色区分数据
• 用大小表示量级

3. 一致原则
• 配色风格统一
• 字体大小一致

【常用工具】

• Excel：基础图表
• Tableau：专业可视化
• ECharts：Web开发
• Python(matplotlib)：数据分析`,
      type: 'text'
    }
  },
  
  {
    id: 'data-005',
    title: '数据清洗',
    description: '数据清洗与预处理方法',
    category: '数据分析',
    tags: ['清洗', '预处理', '数据质量', 'ETL'],
    usage: 29680,
    rating: 4.7,
    content: `# 数据清洗助手

## 【角色定位】
你是数据工程师，精通：
- 数据质量问题识别
- 数据清洗方法
- 数据转换技巧
- 数据质量保障

## 【清洗步骤】
1. 数据探索：发现问题
2. 缺失值处理：删除/填充
3. 异常值处理：识别/处理
4. 重复值处理：去重
5. 格式统一：标准化`,
    example: {
      input: '如何处理数据中的缺失值',
      output: `【缺失值处理方案】

一、识别缺失值

方法1：统计缺失情况
SELECT 
  COUNT(*) as total_count,
  COUNT(column_name) as non_null_count,
  COUNT(*) - COUNT(column_name) as null_count
FROM table_name;

方法2：Python代码
import pandas as pd
df.isnull().sum()

二、处理策略

策略1：删除缺失值

适用场景：
• 缺失比例很小（<5%）
• 数据量充足

方法：
df.dropna()

策略2：填充固定值

适用场景：
• 有业务默认值
• 缺失值有特定含义

方法：
df.fillna(0)  # 填充0
df.fillna('未知')  # 填充文本

策略3：填充统计值

适用场景：
• 数值型数据
• 数据分布均匀

方法：
df.fillna(df.mean())  # 均值
df.fillna(df.median())  # 中位数
df.fillna(df.mode())  # 众数

策略4：插值法

适用场景：
• 时间序列数据
• 数据有趋势

方法：
df.interpolate()  # 线性插值

策略5：预测法

适用场景：
• 重要特征
• 有足够训练数据

方法：
from sklearn.impute import KNNImputer
imputer = KNNImputer(n_neighbors=5)
df_filled = imputer.fit_transform(df)

三、实战案例

场景：用户年龄字段有10%缺失

分析：
• 年龄是重要特征
• 缺失比例不大

方案：
# 方法1：用中位数填充（推荐）
df['age'] = df['age'].fillna(df['age'].median())

# 方法2：分组填充
df['age'] = df.groupby('gender')['age'].apply(
  lambda x: x.fillna(x.median())
)

四、验证结果

# 检查是否还有缺失值
print(df.isnull().sum())

# 查看数据分布
print(df['age'].describe())

【注意事项】

1. 删除前先备份
2. 记录处理逻辑
3. 验证处理结果
4. 考虑业务含义`,
      type: 'text'
    }
  },
  
  {
    id: 'data-006',
    title: 'A/B测试分析',
    description: 'A/B测试设计与结果分析',
    category: '数据分析',
    tags: ['A/B测试', '实验', '对比', '统计'],
    featured: true,
    usage: 27890,
    rating: 4.8,
    content: `# A/B测试分析助手

## 【角色定位】
你是实验设计专家，精通：
- A/B测试原理
- 实验设计方法
- 统计显著性分析
- 结果解读与决策

## 【测试流程】
1. 假设设定
2. 样本量计算
3. 实验分组
4. 数据收集
5. 结果分析
6. 决策建议`,
    example: {
      input: '分析一个按钮颜色的A/B测试结果',
      output: `【A/B测试分析报告】

一、实验背景

目标：提升按钮点击率
变量：按钮颜色
• 对照组（A）：蓝色按钮
• 实验组（B）：红色按钮

二、实验设计

样本量计算：
• 基准转化率：5%
• 期望提升：10%（从5%提升到5.5%）
• 显著性水平：α = 0.05
• 统计功效：1-β = 0.8

计算结果：每组需要约15,000用户

三、实验结果

原始数据：
• A组：15,000用户，750次点击，转化率5.0%
• B组：15,000用户，825次点击，转化率5.5%

四、统计检验

方法：卡方检验

步骤1：构建列联表
| 组别 | 点击 | 未点击 | 合计 |
|------|------|--------|------|
| A组  | 750  | 14,250 | 15,000 |
| B组  | 825  | 14,175 | 15,000 |

步骤2：计算卡方值
χ² = Σ(Observed - Expected)² / Expected
χ² = 3.84

步骤3：计算p值
p = 0.047

五、结果解读

统计结论：
• p值 < 0.05，差异显著
• 红色按钮转化率显著高于蓝色按钮

业务结论：
• 相对提升：10%（5.5% vs 5.0%）
• 绝对提升：0.5个百分点
• 如果日活100万用户，预计每天多5000次点击

六、决策建议

建议：采用红色按钮

理由：
1. 统计显著（p < 0.05）
2. 业务意义明确（10%提升）
3. 实施成本低

注意事项：
1. 观察长期效果
2. 监控其他指标
3. 考虑用户反馈

七、后续优化

1. 进一步测试其他颜色
2. 测试按钮大小、文案
3. 分人群分析效果`,
      type: 'text'
    }
  },
  
  {
    id: 'data-007',
    title: '用户画像构建',
    description: '用户画像标签体系构建',
    category: '数据分析',
    tags: ['用户画像', '标签', '分群', '画像'],
    usage: 31450,
    rating: 4.7,
    content: `# 用户画像构建助手

## 【角色定位】
你是用户研究专家，精通：
- 用户分群方法
- 标签体系设计
- 行为特征提取
- 画像应用场景

## 【画像维度】
1. 基础属性：年龄、性别、地域
2. 行为特征：活跃度、偏好
3. 消费特征：购买力、频次
4. 心理特征：价值观、动机`,
    example: {
      input: '构建电商用户画像标签体系',
      output: `【用户画像标签体系】

一、标签分类

=== 基础属性标签 ===

人口统计：
• 年龄：18-24岁、25-34岁、35-44岁、45岁以上
• 性别：男、女
• 学历：高中及以下、大专、本科、硕士及以上
• 收入：<5K、5-10K、10-20K、20K以上

地域属性：
• 一线城市、二线城市、三四线城市、农村
• 北方、南方、东部、西部

设备属性：
• iOS用户、Android用户
• 高端机型、中端机型、低端机型

=== 行为特征标签 ===

活跃度：
• 高活用户（每日访问）
• 中活用户（每周访问2-3次）
• 低活用户（每月访问1-2次）
• 流失用户（30天未访问）

时段偏好：
• 早晨用户（6-9点）
• 白天用户（9-18点）
• 晚间用户（18-22点）
• 夜猫子（22点后）

渠道来源：
• 自然流量
• 广告投放
• 社交分享
• 搜索引擎

=== 消费特征标签 ===

消费能力：
• 高消费（月均>1000元）
• 中消费（月均500-1000元）
• 低消费（月均<500元）
• 无消费

品类偏好：
• 服饰达人
• 美妆爱好者
• 数码极客
• 家居控
• 美食家

价格敏感度：
• 价格敏感型
• 价格中性型
• 品质优先型

=== 心理特征标签 ===

购物动机：
• 实用主义（注重性价比）
• 享乐主义（追求品质）
• 冲动消费型
• 理性规划型

风险偏好：
• 尝新者（喜欢新产品）
• 稳健者（选择熟品牌）
• 跟随者（看销量评价）

二、标签计算规则

示例：计算"高消费"标签

SQL实现：
SELECT 
  user_id,
  CASE 
    WHEN monthly_amount > 1000 THEN '高消费'
    WHEN monthly_amount > 500 THEN '中消费'
    ELSE '低消费'
  END as consumption_level
FROM (
  SELECT 
    user_id,
    SUM(amount) as monthly_amount
  FROM orders
  WHERE create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY user_id
) t;

三、画像应用场景

1. 精准营销
• 向高消费用户推荐高端产品
• 向价格敏感用户推送优惠券

2. 个性化推荐
• 根据品类偏好推荐商品
• 根据时段偏好调整推送时间

3. 用户分层运营
• 高价值用户：VIP服务
• 流失用户：召回活动
• 新用户：新手引导`,
      type: 'text'
    }
  },
  
  {
    id: 'data-008',
    title: '预测模型构建',
    description: '数据预测模型设计与实现',
    category: '数据分析',
    tags: ['预测', '模型', '机器学习', '算法'],
    usage: 26780,
    rating: 4.7,
    content: `# 预测模型构建助手

## 【角色定位】
你是算法工程师，精通：
- 预测模型选择
- 特征工程设计
- 模型训练调优
- 模型评估方法

## 【建模流程】
1. 问题定义：明确目标
2. 数据准备：特征工程
3. 模型选择：算法对比
4. 模型训练：参数调优
5. 模型评估：效果验证
6. 模型部署：上线应用`,
    example: {
      input: '构建用户流失预测模型',
      output: `【用户流失预测模型】

一、问题定义

目标：预测未来30天内可能流失的用户
定义：流失 = 30天内无登录行为

二、特征工程

=== 行为特征 ===
• 最近登录天数
• 30天内登录次数
• 30天内登录间隔
• 平均会话时长

=== 交易特征 ===
• 历史订单数
• 最近下单天数
• 30天内订单数
• 客单价

=== 互动特征 ===
• 收藏商品数
• 加购商品数
• 浏览商品数
• 分享次数

=== 用户特征 ===
• 注册天数
• 会员等级
• 优惠券使用率
• 退货率

三、数据准备

Python代码：
import pandas as pd
from sklearn.model_selection import train_test_split

# 加载数据
df = pd.read_csv('user_features.csv')

# 划分特征和标签
X = df.drop('is_churn', axis=1)
y = df['is_churn']

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
  X, y, test_size=0.2, random_state=42
)

四、模型选择

对比算法：
1. 逻辑回归
2. 决策树
3. 随机森林
4. XGBoost
5. 神经网络

选择：XGBoost（综合表现最佳）

五、模型训练

from xgboost import XGBClassifier

# 初始化模型
model = XGBClassifier(
  max_depth=6,
  learning_rate=0.1,
  n_estimators=100,
  random_state=42
)

# 训练模型
model.fit(X_train, y_train)

# 预测
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

六、模型评估

from sklearn.metrics import (
  accuracy_score, precision_score, 
  recall_score, f1_score, roc_auc_score
)

# 计算指标
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_prob)

print(f'准确率: {accuracy:.3f}')
print(f'精确率: {precision:.3f}')
print(f'召回率: {recall:.3f}')
print(f'F1分数: {f1:.3f}')
print(f'AUC: {auc:.3f}')

结果：
准确率: 0.85
精确率: 0.78
召回率: 0.82
F1分数: 0.80
AUC: 0.89

七、特征重要性

# 获取特征重要性
importance = model.feature_importances_
features = X.columns

# 可视化
import matplotlib.pyplot as plt
plt.barh(features, importance)
plt.xlabel('Feature Importance')
plt.show()

Top 5特征：
1. 最近登录天数
2. 30天内登录次数
3. 历史订单数
4. 注册天数
5. 会员等级

八、应用建议

1. 模型部署
• 定期预测（每日/每周）
• 输出流失概率排名

2. 运营策略
• 高风险用户：主动关怀
• 中风险用户：优惠激励
• 低风险用户：维持现状

3. 效果监控
• 召回率变化
• 流失率下降幅度
• ROI评估`,
      type: 'text'
    }
  }
];

export default prompts;
