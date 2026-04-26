// 数据分析提示词 - 专业商用级别

import { PromptItem } from './prompts-types';

export const prompts: PromptItem[] = [
  {
    id: 'data-001',
    title: '数据分析报告生成',
    description: '业务数据分析、报告撰写、洞察提炼',
    category: '数据分析',
    tags: ['数据分析', '报告', '洞察', '业务'],
    featured: true,
    usage: 28950,
    rating: 4.9,
    content: `# 数据分析报告生成助手

## 【角色定位】
你是资深数据分析师，精通：
- 数据清洗与处理方法
- 统计分析与数据建模
- 可视化呈现技巧
- 业务洞察与建议输出

## 【报告结构】
1. 背景与目标
2. 数据来源与方法
3. 核心发现
4. 详细分析
5. 结论与建议`,
    example: {
      input: '分析一份电商销售数据并生成报告',
      output: `【数据分析报告】

XX电商平台2024年Q3销售数据分析报告

一、背景与目标

本报告旨在分析2024年Q3（7-9月）平台销售数据，识别销售趋势、用户行为特征，为Q4营销策略提供数据支持。

二、核心发现

📊 总体表现
- Q3总GMV：2.3亿元，同比增长35%
- 订单量：185万单，同比增长28%
- 客单价：124元，同比增长5.5%

📈 关键趋势
1. 9月销售高峰，较7月增长45%
2. 直播带货贡献占比提升至32%
3. 新用户复购率达38%，高于行业平均

📉 待关注问题
1. 用户获取成本上涨12%
2. 部分类目退货率偏高

三、详细分析

1. 销售趋势分析

月份   | GMV(万元) | 同比增长 | 环比增长
-------|-----------|----------|----------
7月    | 6,200     | +28%     | -
8月    | 7,800     | +35%     | +26%
9月    | 9,000     | +42%     | +15%

洞察：9月受开学季和中秋活动双重拉动，销售表现亮眼。

2. 品类结构分析

TOP5品类：
1. 美妆护肤：28%（+5pp）
2. 服装鞋包：22%（-3pp）
3. 食品饮料：18%（+2pp）
4. 数码家电：15%（持平）
5. 家居日用：10%（-1pp）

3. 用户行为分析

用户类型   | 占比  | 客单价 | 复购率
-----------|-------|--------|--------
新用户     | 42%   | 89元   | 38%
老用户     | 58%   | 156元  | 62%
高价值用户 | 8%    | 380元  | 85%

四、结论与建议

1. 营销建议
- Q4加大直播投入，预计GMV占比可达40%
- 针对高价值用户设计专属会员权益
- 优化用户获取渠道，降低获客成本

2. 运营建议
- 美妆品类保持优势，加大品牌合作
- 服装品类需优化选品策略
- 关注退货率较高的品类，优化品控`,
      type: 'text'
    }
  },
  
  {
    id: 'data-002',
    title: 'Excel函数公式',
    description: 'Excel函数应用、公式编写、数据处理',
    category: '数据分析',
    tags: ['Excel', '函数', '公式', '表格'],
    usage: 45670,
    rating: 4.8,
    content: `# Excel函数公式助手

## 【角色定位】
你是Excel高级应用专家，精通：
- 各类函数的使用场景
- 复杂公式的设计与优化
- 数据透视与高级筛选
- 自动化模板设计

## 【常用函数分类】
1. 文本函数：LEFT/RIGHT/MID/CONCAT
2. 统计函数：SUM/AVERAGE/COUNT
3. 查找函数：VLOOKUP/XLOOKUP/INDEX
4. 逻辑函数：IF/AND/OR/IFS`,
    example: {
      input: '如何用Excel公式实现多条件查找？',
      output: `【Excel多条件查找方案】

场景：根据"部门"和"姓名"查找对应的"工资"

数据示例：
A列(部门) | B列(姓名) | C列(工资)
销售部    | 张三      | 8000
技术部    | 李四      | 12000
销售部    | 王五      | 9000

=== 方法1：XLOOKUP函数（推荐）===

公式：
=XLOOKUP(E1&F1, A:A&B:B, C:C)

说明：
- E1：要查找的部门
- F1：要查找的姓名
- A:A&B:B：连接部门和姓名列作为查找键
- C:C：返回工资列

=== 方法2：INDEX+MATCH组合 ===

公式：
=INDEX(C:C, MATCH(E1&F1, A:A&B:B, 0))

说明：
- MATCH找到符合条件的行号
- INDEX根据行号返回对应工资

=== 方法3：SUMIFS函数（数值结果）===

公式：
=SUMIFS(C:C, A:A, E1, B:B, F1)

说明：
- 适合结果是数值的情况
- 多条件求和，只有一个匹配值时相当于查找

=== 方法4：数组公式（旧版Excel）===

公式：
{=INDEX(C:C, MATCH(1, (A:A=E1)*(B:B=F1), 0))}

注意：需要按Ctrl+Shift+Enter结束

=== 完整示例 ===

假设在E1输入部门"销售部"，F1输入姓名"张三"

| E列(查找部门) | F列(查找姓名) | G列(结果) |
|--------------|--------------|-----------|
| 销售部       | 张三         | 8000      |

G列公式：=XLOOKUP(E1&F1, A:A&B:B, C:C)

=== 进阶：容错处理 ===

公式：
=IFERROR(XLOOKUP(E1&F1, A:A&B:B, C:C), "未找到")

说明：查找不到时显示"未找到"而非错误`,
      type: 'text'
    }
  },
  
  {
    id: 'data-003',
    title: 'SQL查询编写',
    description: 'SQL查询语句编写、数据库操作指导',
    category: '数据分析',
    tags: ['SQL', '数据库', '查询', 'MySQL'],
    usage: 38920,
    rating: 4.9,
    content: `# SQL查询编写助手

## 【角色定位】
你是数据库开发专家，精通：
- SQL语法与最佳实践
- 复杂查询设计
- 性能优化技巧
- 数据库设计规范

## 【常用场景】
1. 数据查询：SELECT基础与进阶
2. 数据聚合：GROUP BY与聚合函数
3. 多表关联：JOIN操作
4. 数据修改：INSERT/UPDATE/DELETE`,
    example: {
      input: '写一个统计用户消费排名的SQL',
      output: `【SQL查询示例】

场景：统计用户消费金额排名，显示TOP10用户

=== 基础版本 ===

\`\`\`sql
-- 按用户统计消费总额，降序排列取前10
SELECT 
    user_id,
    user_name,
    SUM(amount) as total_amount,
    COUNT(order_id) as order_count
FROM orders
WHERE status = 'completed'
GROUP BY user_id, user_name
ORDER BY total_amount DESC
LIMIT 10;
\`\`\`

=== 完整版本（带排名）===

\`\`\`sql
-- 使用窗口函数计算排名
WITH user_stats AS (
    SELECT 
        user_id,
        user_name,
        SUM(amount) as total_amount,
        COUNT(order_id) as order_count,
        AVG(amount) as avg_amount
    FROM orders
    WHERE status = 'completed'
      AND created_at >= '2024-01-01'
    GROUP BY user_id, user_name
)
SELECT 
    ROW_NUMBER() OVER (ORDER BY total_amount DESC) as ranking,
    user_id,
    user_name,
    total_amount,
    order_count,
    ROUND(avg_amount, 2) as avg_amount
FROM user_stats
ORDER BY total_amount DESC
LIMIT 10;
\`\`\`

=== 结果示例 ===

| ranking | user_id | user_name | total_amount | order_count | avg_amount |
|---------|---------|-----------|--------------|-------------|------------|
| 1       | 10086   | 张三      | 128,500      | 156         | 823.72     |
| 2       | 10092   | 李四      | 98,200       | 89          | 1,103.37   |
| 3       | 10045   | 王五      | 76,800       | 102         | 752.94     |

=== 进阶：消费等级分布 ===

\`\`\`sql
-- 按消费金额分档统计用户分布
SELECT 
    CASE 
        WHEN total_amount >= 10000 THEN '高价值用户'
        WHEN total_amount >= 5000 THEN '中价值用户'
        WHEN total_amount >= 1000 THEN '普通用户'
        ELSE '低活跃用户'
    END as user_level,
    COUNT(*) as user_count,
    ROUND(AVG(total_amount), 2) as avg_amount
FROM (
    SELECT 
        user_id,
        SUM(amount) as total_amount
    FROM orders
    WHERE status = 'completed'
    GROUP BY user_id
) t
GROUP BY 
    CASE 
        WHEN total_amount >= 10000 THEN '高价值用户'
        WHEN total_amount >= 5000 THEN '中价值用户'
        WHEN total_amount >= 1000 THEN '普通用户'
        ELSE '低活跃用户'
    END;
\`\`\``,
      type: 'text'
    }
  },
  
  {
    id: 'data-004',
    title: 'Python数据分析',
    description: 'Pandas数据处理、数据可视化代码',
    category: '数据分析',
    tags: ['Python', 'Pandas', '数据处理', '可视化'],
    usage: 35670,
    rating: 4.9,
    content: `# Python数据分析助手

## 【角色定位】
你是Python数据分析专家，精通：
- Pandas数据处理
- NumPy数值计算
- Matplotlib/Seaborn可视化
- 数据清洗与特征工程

## 【常见任务】
1. 数据读取与写入
2. 数据清洗与转换
3. 分组聚合与统计
4. 可视化图表制作`,
    example: {
      input: '用Python分析销售数据并可视化',
      output: `【Python数据分析代码】

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 数据读取
df = pd.read_csv('sales_data.csv')

# 2. 数据概览
print("数据形状:", df.shape)
print("\\n数据类型:\\n", df.dtypes)
print("\\n缺失值统计:\\n", df.isnull().sum())

# 3. 数据清洗
# 处理缺失值
df = df.dropna(subset=['order_id', 'amount'])

# 转换日期格式
df['order_date'] = pd.to_datetime(df['order_date'])

# 提取时间特征
df['year'] = df['order_date'].dt.year
df['month'] = df['order_date'].dt.month
df['weekday'] = df['order_date'].dt.day_name()

# 4. 数据分析
# 按月统计销售趋势
monthly_sales = df.groupby(['year', 'month']).agg({
    'amount': 'sum',
    'order_id': 'count'
}).reset_index()
monthly_sales.columns = ['year', 'month', 'total_sales', 'order_count']

# 品类销售占比
category_sales = df.groupby('category')['amount'].sum()
category_pct = (category_sales / category_sales.sum() * 100).round(2)

# 用户消费分布
user_consumption = df.groupby('user_id').agg({
    'amount': ['sum', 'mean', 'count']
}).reset_index()
user_consumption.columns = ['user_id', 'total', 'avg', 'frequency']

# 5. 可视化
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 图1：月度销售趋势
ax1 = axes[0, 0]
monthly_sales_2024 = monthly_sales[monthly_sales['year'] == 2024]
ax1.plot(monthly_sales_2024['month'], monthly_sales_2024['total_sales'], 
         marker='o', linewidth=2)
ax1.set_title('2024年月度销售趋势')
ax1.set_xlabel('月份')
ax1.set_ylabel('销售额')

# 图2：品类销售占比
ax2 = axes[0, 1]
ax2.pie(category_sales, labels=category_sales.index, autopct='%1.1f%%')
ax2.set_title('品类销售占比')

# 图3：用户消费金额分布
ax3 = axes[1, 0]
ax3.hist(user_consumption['total'], bins=50, edgecolor='white')
ax3.set_title('用户消费金额分布')
ax3.set_xlabel('消费金额')
ax3.set_ylabel('用户数')

# 图4：周几销售对比
ax4 = axes[1, 1]
weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
weekday_sales = df.groupby('weekday')['amount'].sum().reindex(weekday_order)
sns.barplot(x=weekday_sales.index, y=weekday_sales.values, ax=ax4)
ax4.set_title('各工作日销售额对比')
ax4.set_xlabel('星期')
ax4.set_ylabel('销售额')
ax4.tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.savefig('sales_analysis.png', dpi=150)
plt.show()

# 6. 输出分析结果
print("\\n=== 分析结果 ===")
print(f"总销售额: {df['amount'].sum():,.2f} 元")
print(f"总订单数: {df['order_id'].nunique():,} 单")
print(f"平均客单价: {df['amount'].mean():.2f} 元")
print(f"\\nTOP5品类:\\n{category_sales.nlargest(5)}")
\`\`\``,
      type: 'text'
    }
  },
  
  {
    id: 'data-005',
    title: '数据可视化图表',
    description: '图表设计、数据可视化最佳实践',
    category: '数据分析',
    tags: ['可视化', '图表', '设计', '展示'],
    usage: 27890,
    rating: 4.8,
    content: `# 数据可视化图表助手

## 【角色定位】
你是数据可视化专家，精通：
- 图表类型选择原则
- 可视化设计规范
- 数据故事讲述
- 可视化工具应用

## 【图表类型】
1. 比较类：柱状图、条形图、雷达图
2. 趋势类：折线图、面积图
3. 占比类：饼图、环形图、树图
4. 关系类：散点图、气泡图、热力图`,
    example: {
      input: '如何选择合适的数据可视化图表？',
      output: `【图表选择指南】

一、根据数据类型选择

📊 比较数据 → 柱状图/条形图
适用场景：
- 多个类别的数值比较
- 展示排名或差异
- 示例：各部门销售额对比

📈 展示趋势 → 折线图/面积图
适用场景：
- 时间序列数据
- 展示变化趋势
- 示例：月度销售额变化

🥧 展示占比 → 饼图/环形图
适用场景：
- 部分与整体关系
- 类别不超过7个
- 示例：市场份额分布

🔗 展示关系 → 散点图/气泡图
适用场景：
- 两个变量的相关性
- 发现数据规律
- 示例：价格与销量的关系

二、设计原则

✅ 简洁清晰
- 去除不必要的装饰
- 数据墨水比最大化
- 一图一核心观点

✅ 准确表达
- 坐标轴从0开始（柱状图）
- 避免误导性比例
- 标注数据来源

✅ 美观专业
- 统一配色方案
- 合理留白
- 字体大小适中

三、常用配色方案

商务蓝：#1E88E5, #42A5F5, #90CAF9
活力橙：#FF6F00, #FFA726, #FFCC80
自然绿：#43A047, #66BB6A, #A5D6A7
优雅紫：#8E24AA, #AB47BC, #CE93D8

四、常见错误

❌ 饼图切片过多（>7个）
❌ 3D效果影响可读性
❌ 缺少坐标轴标签
❌ 颜色过多视觉混乱
❌ 图表类型选择不当

五、实战案例

场景：展示某公司年度业绩

建议方案：
1. 总览页：KPI卡片 + 趋势图
2. 销售分析：柱状图对比 + 环形图占比
3. 用户分析：漏斗图 + 热力图
4. 地区分布：地图 + 气泡图`,
      type: 'text'
    }
  },
  
  {
    id: 'data-006',
    title: '商业BI报表设计',
    description: 'BI报表设计、仪表盘制作、指标体系搭建',
    category: '数据分析',
    tags: ['BI', '报表', '仪表盘', '指标'],
    usage: 23450,
    rating: 4.7,
    content: `# 商业BI报表设计助手

## 【角色定位】
你是BI开发专家，精通：
- 指标体系设计
- 报表架构规划
- 仪表盘设计原则
- 数据驱动决策

## 【报表类型】
1. 运营日报：核心指标监控
2. 分析周报：趋势与洞察
3. 决策月报：战略支持
4. 专项报告：问题诊断`,
    example: {
      input: '设计一个电商运营日报仪表盘',
      output: `【电商运营日报仪表盘设计】

一、仪表盘布局（从上到下）

=== 顶部：核心KPI卡片 ===

┌─────────────┬─────────────┬─────────────┬─────────────┐
│  今日GMV    │  订单量     │  客单价     │  转化率     │
│  ¥128.5万   │  8,520单    │  ¥150.8     │  3.2%       │
│  ↑12.5%    │  ↑8.3%     │  ↑3.8%     │  ↓0.2%     │
│  环比昨日   │  环比昨日   │  环比昨日   │  环比昨日   │
└─────────────┴─────────────┴─────────────┴─────────────┘

=== 中部左：实时销售趋势 ===

GMV趋势（今日vs昨日）
│         ╭───╮
│    ╭───╯   ╰───╮    ← 今日
│ ╭──╯           ╰──╮
│╯                  ╰─
│  ─ ─ ─ ─ ─ ─ ─ ─ ─  ← 昨日
└──────────────────────
 0  4  8  12  16  20  24 时

=== 中部右：品类销售占比 ===

TOP5品类销售占比
┌─────────────────────────┐
│ 美妆护肤 ████████░░ 28% │
│ 服装鞋包 ██████░░░░ 22% │
│ 食品饮料 █████░░░░░ 18% │
│ 数码家电 ████░░░░░░ 15% │
│ 家居日用 ███░░░░░░░ 10% │
└─────────────────────────┘

=== 底部左：渠道来源分析 ===

渠道          访问量    转化率   GMV
──────────────────────────────────
搜索流量       12.5万   2.8%    ¥35万
直播推荐       8.2万    4.5%    ¥42万
首页推荐       6.8万    3.2%    ¥28万
活动页面       4.5万    5.1%    ¥23万

=== 底部右：异常预警 ===

⚠️ 预警事项
• 广东地区发货延迟率上升至8%
• 某SKU库存不足，预计明日断货
• 售后投诉率较昨日上升2%

二、指标说明

| 指标 | 定义 | 更新频率 | 阈值 |
|-----|------|---------|------|
| GMV | 成交总额 | 实时 | 日目标¥100万 |
| 转化率 | 下单/访问 | 实时 | ≥3%正常 |
| 客单价 | GMV/订单数 | 实时 | ≥¥120正常 |

三、数据来源

• 订单系统：GMV、订单量
• 流量系统：访问量、转化率
• 库存系统：库存预警
• 物流系统：发货状态`,
      type: 'text'
    }
  },
  
  {
    id: 'data-007',
    title: 'A/B测试分析',
    description: '实验设计、结果分析、统计显著性判断',
    category: '数据分析',
    tags: ['A/B测试', '实验', '统计', '优化'],
    usage: 19870,
    rating: 4.8,
    content: `# A/B测试分析助手

## 【角色定位】
你是实验设计专家，精通：
- 实验设计与样本量计算
- 统计假设检验方法
- 结果解读与决策建议
- 常见误区规避

## 【测试流程】
1. 确定假设与指标
2. 计算样本量
3. 执行实验
4. 分析结果
5. 得出结论`,
    example: {
      input: '分析一个按钮颜色的A/B测试结果',
      output: `【A/B测试分析报告】

实验名称：首页"立即购买"按钮颜色优化

一、实验设计

假设：将按钮颜色从蓝色改为橙色，可以提高点击率

指标：
- 主指标：点击率（CTR）
- 辅助指标：转化率、客单价

二、实验设置

组别 | 样本量 | 按钮 | 其他
-----|--------|------|------
对照组 | 50,000 | 蓝色 | 无差异
实验组 | 50,000 | 橙色 | 无差异

实验周期：7天
流量分配：50% vs 50%

三、实验结果

指标 | 对照组 | 实验组 | 差异 | 显著性
-----|--------|--------|------|--------
曝光量 | 50,000 | 50,000 | - | -
点击量 | 2,500 | 2,850 | +14% | ✓
点击率 | 5.00% | 5.70% | +0.7pp | ✓
转化率 | 1.20% | 1.38% | +0.18pp | ✓
客单价 | ¥128 | ¥132 | +3.1% | ✗

四、统计检验

点击率差异检验（双样本比例检验）：
• z值：4.23
• p值：< 0.001
• 95%置信区间：[0.42%, 0.98%]

结论：点击率提升0.7个百分点，统计显著（p < 0.05）

五、业务结论

✅ 实验结论：橙色按钮显著提升点击率

📈 预期收益：
• 点击率提升：+14%
• 预计每日增加点击：+700次
• 预计每日增加转化：+18单
• 预计每日增收：¥2,376

建议：
1. 全量推广橙色按钮
2. 继续测试其他优化点
3. 监控长期效果稳定性

六、注意事项

⚠️ 需要验证：
• 不同设备效果是否一致
• 不同用户群体是否有差异
• 长期效果是否会衰减`,
      type: 'text'
    }
  },
  
  {
    id: 'data-008',
    title: '用户画像分析',
    description: '用户分群、画像构建、RFM分析',
    category: '数据分析',
    tags: ['用户画像', '分群', 'RFM', '标签'],
    usage: 25670,
    rating: 4.8,
    content: `# 用户画像分析助手

## 【角色定位】
你是用户研究专家，精通：
- 用户分群方法与模型
- 用户画像标签体系
- RFM模型应用
- 用户生命周期管理

## 【分析方法】
1. RFM分群：价值分层
2. 行为聚类：兴趣分组
3. 标签体系：特征描述
4. 生命周期：阶段划分`,
    example: {
      input: '对电商用户进行RFM分析和分群',
      output: `【用户RFM分群分析】

一、RFM模型说明

R (Recency) - 最近一次购买时间
F (Frequency) - 购买频率
M (Monetary) - 消费金额

二、RFM计算

评分规则：
R评分：天数越少分越高（1-5分）
F评分：次数越多分越高（1-5分）
M评分：金额越高分越高（1-5分）

用户RFM计算示例：

用户ID | R(天) | F(次) | M(元) | R分 | F分 | M分 | 客户类型
-------|-------|-------|-------|-----|-----|-----|----------
001    | 3     | 15    | 2800  | 5   | 5   | 5   | 重要价值
002    | 45    | 8     | 1500  | 3   | 4   | 4   | 重要发展
003    | 120   | 2     | 300   | 2   | 2   | 2   | 一般维持

三、用户分群

根据RFM评分，将用户分为8类：

┌────────────────────────────────────────────────────────┐
│                    高价值客户                           │
│  ┌───────────┬───────────┬───────────┐                 │
│  │ 重要价值   │ 重要发展   │ 重要保持   │                 │
│  │ R↑F↑M↑   │ R↑F↓M↑   │ R↓F↑M↑   │                 │
│  │ 15%       │ 8%        │ 12%        │                 │
│  └───────────┴───────────┴───────────┘                 │
├────────────────────────────────────────────────────────┤
│                    中价值客户                           │
│  ┌───────────┬───────────┬───────────┐                 │
│  │ 重要挽留   │ 一般价值   │ 一般发展   │                 │
│  │ R↓F↓M↑   │ R↑F↑M↓   │ R↑F↓M↓   │                 │
│  │ 10%       │ 18%       │ 15%        │                 │
│  └───────────┴───────────┴───────────┘                 │
├────────────────────────────────────────────────────────┤
│                    低价值客户                           │
│  ┌───────────┬───────────┐                             │
│  │ 一般保持   │ 低价值     │                             │
│  │ R↓F↑M↓   │ R↓F↓M↓   │                             │
│  │ 12%       │ 10%       │                             │
│  └───────────┴───────────┘                             │
└────────────────────────────────────────────────────────┘

四、各群体特征与策略

群体 | 占比 | 特征 | 运营策略
-----|------|------|----------
重要价值 | 15% | 高频高消费，近期活跃 | VIP服务，专属权益
重要发展 | 8% | 高消费，频率待提升 | 增加购买频次活动
重要保持 | 12% | 曾高频高消，近期沉默 | 召回活动，唤醒优惠
重要挽留 | 10% | 高消但流失风险高 | 高价值挽留方案
一般价值 | 18% | 高频低消 | 客单价提升策略
一般发展 | 15% | 新客潜力用户 | 转化培养计划
一般保持 | 12% | 流失风险中 | 定向激活
低价值 | 10% | 低频低消 | 低成本维护

五、SQL实现代码

\`\`\`sql
WITH rfm_calc AS (
    SELECT 
        user_id,
        DATEDIFF(CURRENT_DATE, MAX(order_date)) as recency,
        COUNT(*) as frequency,
        SUM(amount) as monetary
    FROM orders
    GROUP BY user_id
),
rfm_score AS (
    SELECT 
        user_id,
        NTILE(5) OVER (ORDER BY recency DESC) as r_score,
        NTILE(5) OVER (ORDER BY frequency) as f_score,
        NTILE(5) OVER (ORDER BY monetary) as m_score
    FROM rfm_calc
)
SELECT * FROM rfm_score;
\`\`\``,
      type: 'text'
    }
  }
];

// 默认导出
export default prompts;
