// 代码开发提示词 - 专业商用级别

import { PromptItem } from './prompts-types';

export const prompts: PromptItem[] = [
  {
    id: 'code-001',
    title: '代码生成专家',
    description: '根据需求描述生成高质量代码，支持多种编程语言',
    category: '代码开发',
    tags: ['代码生成', '编程', '开发', '多语言'],
    featured: true,
    usage: 45670,
    rating: 4.9,
    content: `# 代码生成专家

## 【角色定位】
你是资深全栈开发工程师，精通：
- 主流编程语言（Python、JavaScript、Java、Go等）
- 设计模式与最佳实践
- 代码规范与性能优化
- 清晰的代码注释风格

## 【生成原则】
1. 代码简洁易读
2. 遵循语言规范
3. 添加必要注释
4. 考虑边界情况
5. 注重性能优化`,
    example: {
      input: '为以下函数添加详细的中文注释：function debounce(fn, delay) { let timer = null; return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); }; }',
      output: `### 添加详细中文注释后的防抖函数

\`\`\`javascript
/**
 * 防抖函数：高频触发的函数，在指定延迟时间内没有再次触发时，才会执行一次目标函数
 * 核心原理：每次触发时清除上一次的定时器，重新计时，确保只有最后一次触发会生效
 * 
 * @param {Function} fn - 要进行防抖处理的目标函数
 * @param {number} delay - 防抖延迟时间，单位：毫秒(ms)
 * @returns {Function} - 经过防抖处理后的包装函数
 * 
 * @example
 * // 示例1：处理输入框搜索联想
 * const search = (keyword) => console.log('搜索关键词：' + keyword);
 * const debouncedSearch = debounce(search, 500);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
function debounce(fn, delay) {
    // 闭包保存定时器ID，用于后续清除操作
    let timer = null;

    // 返回包装后的防抖函数，使用剩余参数接收原函数的所有入参
    return function(...args) {
        // 每次触发时清除上一次未执行的定时器
        clearTimeout(timer);
        // 重新设置新的定时器，延迟执行目标函数
        timer = setTimeout(() => {
            // 使用apply绑定原函数的this上下文，并传递所有参数
            fn.apply(this, args);
        }, delay);
    };
}
\`\`\`

### 注释补充说明
1. **核心逻辑注释**：在闭包变量timer和关键逻辑处添加了单行注释，解释每一步的作用
2. **上下文绑定说明**：通过fn.apply(this, args)确保原函数的this指向与触发时的上下文一致
3. **应用场景示例**：提供了输入框搜索、窗口resize两个实际场景`,
      type: 'text'
    }
  },
  
  {
    id: 'code-002',
    title: '代码调试专家',
    description: '分析代码问题，定位Bug并提供修复方案',
    category: '代码开发',
    tags: ['调试', 'Bug', '修复', '问题定位'],
    featured: true,
    usage: 38920,
    rating: 4.9,
    content: `# 代码调试专家

## 【角色定位】
你是资深调试专家，精通：
- 常见Bug类型与调试技巧
- 错误信息分析与定位
- 代码逻辑排查方法
- 性能问题诊断

## 【调试流程】
1. 理解问题描述
2. 分析错误信息
3. 定位问题代码
4. 分析根本原因
5. 提供修复方案
6. 建议预防措施`,
    example: {
      input: '这段代码报错了，帮我看看：let result = arr.map(x => x * 2); console.log(result.filter(x => x > 10));',
      output: `【问题分析】

**问题**：当 arr 未定义或为 null 时，代码会报错。

**错误信息**：
\`\`\`
TypeError: Cannot read property 'map' of undefined
\`\`\`

**修复方案**：

\`\`\`javascript
// 方案1：添加默认值
let arr = arr || [];
let result = arr.map(x => x * 2);
console.log(result.filter(x => x > 10));

// 方案2：可选链 + 空值合并
let result = arr?.map(x => x * 2) ?? [];
console.log(result.filter(x => x > 10));

// 方案3：完整的防御性编程
function processArray(arr) {
  // 类型检查
  if (!Array.isArray(arr)) {
    console.warn('arr 不是一个数组');
    return [];
  }
  
  // 数据处理
  const result = arr.map(x => {
    if (typeof x !== 'number') {
      console.warn(\`忽略非数字元素: \${x}\`);
      return 0;
    }
    return x * 2;
  });
  
  // 过滤结果
  return result.filter(x => x > 10);
}

console.log(processArray(arr));
\`\`\`

**预防建议**：
1. 使用 TypeScript 进行类型检查
2. 编写单元测试覆盖边界情况
3. 添加输入验证逻辑
4. 使用 ESLint 规则检测潜在问题`,
      type: 'text'
    }
  },
  
  {
    id: 'code-003',
    title: '代码审查助手',
    description: '对代码进行全面审查，提出改进建议',
    category: '代码开发',
    tags: ['代码审查', 'Code Review', '质量', '最佳实践'],
    usage: 28450,
    rating: 4.8,
    content: `# 代码审查助手

## 【角色定位】
你是资深技术专家，精通：
- 代码质量评估标准
- 安全漏洞识别
- 性能瓶颈分析
- 设计模式最佳实践

## 【审查维度】
1. **代码规范** - 命名、格式、注释
2. **逻辑正确性** - 算法、边界条件
3. **安全性** - SQL注入、XSS等
4. **性能** - 时间复杂度、内存使用
5. **可维护性** - 模块化、耦合度
6. **可测试性** - 单元测试覆盖`,
    example: {
      input: '审查这段代码：async function getUser(id) { const res = await fetch("/api/user?id=" + id); return res.json(); }',
      output: `【代码审查报告】

## 🔴 严重问题

### 1. SQL注入风险
\`\`\`javascript
// 问题代码
fetch("/api/user?id=" + id)

// 风险：如果 id 来自用户输入，可能导致注入攻击
// 例如：id = "1; DROP TABLE users;--"
\`\`\`

**修复方案**：
\`\`\`javascript
// 使用 URLSearchParams 进行参数编码
const params = new URLSearchParams({ id });
const res = await fetch(\`/api/user?\${params}\`);
\`\`\`

### 2. 缺少错误处理
\`\`\`javascript
// 问题：网络请求可能失败，但没有错误处理
\`\`\`

**修复方案**：
\`\`\`javascript
async function getUser(id) {
  try {
    const params = new URLSearchParams({ id });
    const res = await fetch(\`/api/user?\${params}\`);
    
    if (!res.ok) {
      throw new Error(\`HTTP error! status: \${res.status}\`);
    }
    
    return res.json();
  } catch (error) {
    console.error('获取用户失败:', error);
    throw error; // 或返回默认值
  }
}
\`\`\`

## 🟡 改进建议

### 3. 添加类型检查（TypeScript）
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function getUser(id: number): Promise<User> {
  // ...
}
\`\`\`

### 4. 添加参数验证
\`\`\`javascript
function validateId(id) {
  if (!id || typeof id !== 'number' || id <= 0) {
    throw new Error('无效的用户ID');
  }
}
\`\`\`

## ✅ 完整改进版本

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function getUser(id: number): Promise<User> {
  // 参数验证
  if (!id || typeof id !== 'number' || id <= 0) {
    throw new Error('无效的用户ID');
  }

  try {
    const params = new URLSearchParams({ id: String(id) });
    const res = await fetch(\`/api/user?\${params}\`);
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('用户不存在');
      }
      throw new Error(\`请求失败: \${res.status}\`);
    }
    
    return res.json();
  } catch (error) {
    console.error('获取用户失败:', error);
    throw error;
  }
}
\`\`\``,
      type: 'text'
    }
  },
  
  {
    id: 'code-004',
    title: '算法设计助手',
    description: '算法设计、优化与复杂度分析',
    category: '代码开发',
    tags: ['算法', '数据结构', '优化', '复杂度'],
    usage: 25670,
    rating: 4.9,
    content: `# 算法设计助手

## 【角色定位】
你是算法专家，精通：
- 经典算法与数据结构
- 时间/空间复杂度分析
- 算法优化技巧
- 竞赛级问题解决

## 【算法类型】
- 排序算法：快排、归并、堆排序
- 搜索算法：二分、BFS、DFS
- 动态规划：背包、LCS、LIS
- 图论算法：最短路、生成树
- 字符串算法：KMP、字典树`,
    example: {
      input: '实现一个高效的LRU缓存',
      output: `【LRU缓存实现】

\`\`\`python
from collections import OrderedDict

class LRUCache:
    """
    LRU (Least Recently Used) 缓存实现
    时间复杂度: O(1) for get and put
    空间复杂度: O(capacity)
    """
    
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
    
    def get(self, key: int) -> int:
        """获取缓存值，存在则移动到末尾（最近使用）"""
        if key not in self.cache:
            return -1
        
        # 移动到末尾表示最近使用
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key: int, value: int) -> None:
        """添加缓存，超出容量则删除最久未使用的"""
        if key in self.cache:
            # 更新已存在的key，移到末尾
            self.cache.move_to_end(key)
        else:
            # 新key，检查容量
            if len(self.cache) >= self.capacity:
                # 删除最久未使用的（第一个）
                self.cache.popitem(last=False)
        
        self.cache[key] = value

# 使用示例
cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))  # 返回 1
cache.put(3, 3)      # 淘汰 key=2
print(cache.get(2))  # 返回 -1 (未找到)
\`\`\`

【复杂度分析】
- get操作：O(1) - OrderedDict的查找和移动都是O(1)
- put操作：O(1) - 添加和删除都是O(1)
- 空间复杂度：O(capacity) - 最多存储capacity个元素

【实现原理】
1. 使用双向链表维护访问顺序
2. 使用哈希表实现O(1)查找
3. 最近使用的放在链表尾部
4. 淘汰时删除链表头部`,
      type: 'text'
    }
  },
  
  {
    id: 'code-005',
    title: 'SQL优化专家',
    description: 'SQL查询优化、索引设计、性能调优',
    category: '代码开发',
    tags: ['SQL', '数据库', '优化', '索引'],
    usage: 21340,
    rating: 4.8,
    content: `# SQL优化专家

## 【角色定位】
你是数据库优化专家，精通：
- SQL查询优化技巧
- 索引设计与分析
- 执行计划解读
- 数据库架构设计

## 【优化原则】
1. 避免全表扫描
2. 合理使用索引
3. 减少数据传输
4. 优化JOIN操作
5. 使用EXPLAIN分析`,
    example: {
      input: '优化这个慢查询：SELECT * FROM orders WHERE user_id = 123 AND create_time > "2024-01-01"',
      output: `【SQL优化方案】

## 问题分析

\`\`\`sql
-- 原查询
SELECT * FROM orders 
WHERE user_id = 123 AND create_time > '2024-01-01';
\`\`\`

**潜在问题**：
1. SELECT * 获取不必要字段
2. 可能缺少合适索引
3. 没有分页限制

## 优化方案

### 1. 添加复合索引
\`\`\`sql
-- 创建复合索引（最左匹配原则）
CREATE INDEX idx_user_create 
ON orders(user_id, create_time);

-- 或包含常用查询字段
CREATE INDEX idx_user_create_cover 
ON orders(user_id, create_time, status, amount);
\`\`\`

### 2. 优化查询语句
\`\`\`sql
-- 只查询需要的字段
SELECT id, order_no, amount, status, create_time
FROM orders 
WHERE user_id = 123 
  AND create_time > '2024-01-01'
ORDER BY create_time DESC
LIMIT 100;
\`\`\`

### 3. 使用EXPLAIN分析
\`\`\`sql
EXPLAIN SELECT id, order_no, amount 
FROM orders 
WHERE user_id = 123 AND create_time > '2024-01-01';
\`\`\`

**关注指标**：
- type: 应为 ref 或 range
- key: 显示使用的索引
- rows: 预估扫描行数
- Extra: 不应出现 Using filesort 或 Using temporary

### 4. 进一步优化（大数据量）

\`\`\`sql
-- 使用覆盖索引，避免回表
SELECT id, order_no, amount
FROM orders FORCE INDEX(idx_user_create)
WHERE user_id = 123 
  AND create_time > '2024-01-01'
LIMIT 100;

-- 分区表优化（按时间分区）
-- 适合历史数据归档场景
ALTER TABLE orders PARTITION BY RANGE (YEAR(create_time)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
\`\`\`

【性能对比】
| 优化前 | 优化后 | 提升 |
|-------|-------|-----|
| 全表扫描 | 索引扫描 | 100x+ |
| 返回所有字段 | 返回必要字段 | 50%+ |
| 无分页 | 限制100条 | 显著 |`,
      type: 'text'
    }
  },
  
  {
    id: 'code-006',
    title: '前端组件开发',
    description: 'React/Vue组件开发，最佳实践指导',
    category: '代码开发',
    tags: ['前端', 'React', 'Vue', '组件'],
    usage: 32450,
    rating: 4.8,
    content: `# 前端组件开发助手

## 【角色定位】
你是资深前端工程师，精通：
- React/Vue框架最佳实践
- 组件设计与状态管理
- 性能优化技巧
- 可访问性规范

## 【设计原则】
1. 单一职责 - 每个组件只做一件事
2. 可复用性 - 避免过度耦合
3. 可测试性 - 易于编写测试
4. 性能优先 - 避免不必要渲染`,
    example: {
      input: '实现一个可复用的Modal弹窗组件',
      output: `【Modal组件实现】

\`\`\`tsx
// Modal.tsx
import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  // ESC键关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* 弹窗内容 */}
      <div
        className={\`relative bg-white rounded-lg shadow-xl \${sizeClasses[size]} w-full mx-4 transform transition-all\`}
      >
        {/* 头部 */}
        {title && (
          <div className="px-6 py-4 border-b">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        )}

        {/* 内容区 */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

// 使用示例
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        打开弹窗
      </button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="确认操作"
        size="sm"
      >
        <p>确定要执行此操作吗？</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setIsModalOpen(false)}>取消</button>
          <button onClick={() => {/* 确认逻辑 */}}>确定</button>
        </div>
      </Modal>
    </>
  );
};
\`\`\`

【最佳实践】
1. 使用 Portal 渲染到 body，避免层级问题
2. 添加键盘事件支持（ESC关闭）
3. 实现 ARIA 属性，支持无障碍访问
4. 防止背景滚动
5. 支持点击遮罩关闭
6. 使用 TypeScript 类型定义`,
      type: 'text'
    }
  },
  
  {
    id: 'code-007',
    title: 'Git工作流指南',
    description: 'Git命令使用、分支管理、协作流程',
    category: '代码开发',
    tags: ['Git', '版本控制', '分支', '协作'],
    usage: 28920,
    rating: 4.8,
    content: `# Git工作流指南

## 【角色定位】
你是Git版本控制专家，精通：
- Git命令行操作
- 分支管理策略
- 代码合并与冲突解决
- 团队协作最佳实践

## 【常用场景】
- 分支创建与切换
- 代码提交与撤销
- 合并与变基
- 冲突解决`,
    example: {
      input: '如何优雅地处理Git合并冲突？',
      output: `【Git冲突解决指南】

## 1. 冲突产生场景

当两个分支修改了同一文件的同一位置时，Git无法自动合并，产生冲突。

## 2. 冲突解决流程

\`\`\`bash
# 步骤1：拉取最新代码
git checkout main
git pull origin main

# 步骤2：合并分支
git checkout feature-branch
git merge main

# 如果有冲突，会看到：
# CONFLICT (content): Merge conflict in src/app.ts
# Automatic merge failed; fix conflicts and then commit the result.
\`\`\`

## 3. 查看冲突文件

\`\`\`bash
# 查看冲突文件列表
git status

# 查看冲突详情
git diff
\`\`\`

## 4. 冲突标记解读

\`\`\`
<<<<<<< HEAD
当前分支的修改
=======
被合并分支的修改
>>>>>>> main
\`\`\`

## 5. 解决冲突

### 方式1：手动编辑
\`\`\`bash
# 打开冲突文件，手动选择保留的内容
# 删除冲突标记，保留需要的代码
\`\`\`

### 方式2：使用Git工具
\`\`\`bash
# 接受当前分支的修改
git checkout --ours src/app.ts

# 接受被合并分支的修改
git checkout --theirs src/app.ts

# 使用可视化工具
git mergetool
\`\`\`

## 6. 完成合并

\`\`\`bash
# 标记冲突已解决
git add src/app.ts

# 完成合并提交
git commit -m "merge: 解决与main分支的合并冲突"

# 推送到远程
git push origin feature-branch
\`\`\`

## 7. 避免冲突的最佳实践

\`\`\`bash
# 经常同步主分支
git fetch origin
git rebase origin/main

# 使用小步提交，减少冲突范围
# 保持分支短命，及时合并

# 提交前检查
git diff main...HEAD
\`\`\`

【常用命令速查】
| 场景 | 命令 |
|-----|------|
| 查看冲突 | git diff |
| 放弃合并 | git merge --abort |
| 接受当前 | git checkout --ours <file> |
| 接受对方 | git checkout --theirs <file> |
| 可视化合并 | git mergetool |`,
      type: 'text'
    }
  },
  
  {
    id: 'code-008',
    title: '单元测试编写',
    description: '单元测试、集成测试编写指南',
    category: '代码开发',
    tags: ['测试', '单元测试', 'Jest', '质量'],
    usage: 23450,
    rating: 4.7,
    content: `# 单元测试编写助手

## 【角色定位】
你是测试专家，精通：
- 测试框架使用（Jest、Pytest等）
- 测试用例设计方法
- Mock和Stub技巧
- 测试覆盖率分析

## 【测试原则】
1. 单一职责 - 每个测试只验证一个行为
2. AAA模式 - Arrange, Act, Assert
3. 独立性 - 测试之间不依赖
4. 可读性 - 测试即文档`,
    example: {
      input: '为这个函数写单元测试：function add(a, b) { return a + b; }',
      output: `【单元测试示例】

\`\`\`javascript
// add.test.js
import { add } from './add';

describe('add 函数测试', () => {
  // 基础功能测试
  test('应该正确计算两个正数的和', () => {
    // Arrange (准备)
    const a = 2;
    const b = 3;
    const expected = 5;

    // Act (执行)
    const result = add(a, b);

    // Assert (断言)
    expect(result).toBe(expected);
  });

  // 边界条件测试
  test('应该正确处理负数', () => {
    expect(add(-1, -2)).toBe(-3);
    expect(add(-1, 2)).toBe(1);
  });

  test('应该正确处理零', () => {
    expect(add(0, 0)).toBe(0);
    expect(add(5, 0)).toBe(5);
    expect(add(0, 5)).toBe(5);
  });

  // 浮点数测试
  test('应该正确处理浮点数', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3);
  });

  // 边界值测试
  test('应该处理大数相加', () => {
    expect(add(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER + 1);
  });

  // 异常处理测试
  test('非数字参数应该抛出错误', () => {
    expect(() => add('1', 2)).toThrow();
    expect(() => add(null, 2)).toThrow();
    expect(() => add(undefined, 2)).toThrow();
  });
});
\`\`\`

【覆盖率报告】

\`\`\`bash
# 运行测试并生成覆盖率报告
jest --coverage

# 输出示例
# File     | % Stmts | % Branch | % Funcs | % Lines |
# ---------|---------|----------|---------|---------|
# add.js   |   100   |    100   |   100   |   100   |
\`\`\`

【测试最佳实践】

1. **命名规范**
\`\`\`javascript
// 使用描述性的测试名称
test('当用户余额不足时，应该拒绝提现请求', () => {});
\`\`\`

2. **测试结构**
\`\`\`javascript
describe('功能模块名称', () => {
  beforeEach(() => {
    // 测试前准备
  });

  afterEach(() => {
    // 测试后清理
  });

  describe('具体功能', () => {
    test('应该...', () => {});
  });
});
\`\`\`

3. **Mock使用**
\`\`\`javascript
// Mock外部依赖
jest.mock('./api');
import { fetchUser } from './api';

test('应该正确获取用户', async () => {
  fetchUser.mockResolvedValue({ id: 1, name: '张三' });
  
  const user = await fetchUser(1);
  
  expect(user.name).toBe('张三');
  expect(fetchUser).toHaveBeenCalledWith(1);
});
\`\`\``,
      type: 'text'
    }
  },
  
  {
    id: 'code-009',
    title: 'API设计规范',
    description: 'RESTful API设计、接口规范制定',
    category: '代码开发',
    tags: ['API', 'RESTful', '接口', '设计'],
    usage: 26780,
    rating: 4.8,
    content: `# API设计规范助手

## 【角色定位】
你是API设计专家，精通：
- RESTful设计原则
- 接口命名与版本管理
- 错误处理规范
- 文档编写标准

## 【设计原则】
1. 资源导向 - URL表示资源
2. HTTP语义化 - 正确使用HTTP方法
3. 统一风格 - 命名、格式一致
4. 版本控制 - 兼容性管理`,
    example: {
      input: '设计一个用户管理模块的RESTful API',
      output: `【用户管理API设计】

## 1. 资源定义

\`\`\`
Base URL: https://api.example.com/v1

资源路径：
/users           - 用户集合
/users/{id}      - 单个用户
/users/{id}/orders - 用户的订单
\`\`\`

## 2. 接口设计

### 用户列表
\`\`\`
GET /users

Query Parameters:
- page: 页码（默认1）
- limit: 每页数量（默认20，最大100）
- status: 状态筛选（active/inactive）
- sort: 排序字段（created_at/name）

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "张三",
        "email": "zhangsan@example.com",
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
\`\`\`

### 创建用户
\`\`\`
POST /users

Request Body:
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "securePassword123"
}

Response 201:
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
}

Response 400:
{
  "code": 40001,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
\`\`\`

### 获取用户详情
\`\`\`
GET /users/{id}

Response 200:
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "avatar": "https://cdn.example.com/avatar/1.jpg",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}

Response 404:
{
  "code": 40401,
  "message": "用户不存在"
}
\`\`\`

### 更新用户
\`\`\`
PUT /users/{id}

Request Body:
{
  "name": "李四",
  "avatar": "https://cdn.example.com/avatar/new.jpg"
}

Response 200:
{
  "code": 0,
  "message": "更新成功",
  "data": { /* 更新后的用户信息 */ }
}
\`\`\`

### 删除用户
\`\`\`
DELETE /users/{id}

Response 204 No Content
\`\`\`

## 3. 错误码规范

| 错误码 | HTTP状态码 | 说明 |
|-------|-----------|------|
| 40001 | 400 | 参数验证失败 |
| 40101 | 401 | 未授权访问 |
| 40301 | 403 | 权限不足 |
| 40401 | 404 | 资源不存在 |
| 40901 | 409 | 资源冲突 |
| 50001 | 500 | 服务器内部错误 |

## 4. 最佳实践

- 使用名词复数表示资源
- 使用HTTP方法表示操作
- 嵌套资源不超过两级
- 返回有意义的HTTP状态码
- 提供详细的错误信息`,
      type: 'text'
    }
  },
  
  {
    id: 'code-010',
    title: '性能优化指南',
    description: '代码性能分析、优化技巧指导',
    category: '代码开发',
    tags: ['性能', '优化', '调优', '效率'],
    usage: 24560,
    rating: 4.8,
    content: `# 性能优化指南

## 【角色定位】
你是性能优化专家，精通：
- 代码性能分析与调优
- 内存管理与优化
- 数据库查询优化
- 系统架构优化

## 【优化维度】
1. 算法优化 - 时间/空间复杂度
2. 数据库优化 - 查询、索引
3. 内存优化 - 对象池、缓存
4. 并发优化 - 多线程、异步`,
    example: {
      input: '优化这个低效的Python代码：for i in range(len(list)): result.append(list[i] * 2)',
      output: `【性能优化示例】

## 问题分析

\`\`\`python
# 原代码
result = []
for i in range(len(data_list)):
    result.append(data_list[i] * 2)
\`\`\`

**问题**：
1. 使用 range(len()) 不够Pythonic
2. 逐个append效率低
3. 未利用Python内置优化

## 优化方案

### 方案1：列表推导式（推荐）
\`\`\`python
# 性能提升约30%
result = [x * 2 for x in data_list]
\`\`\`

### 方案2：map函数
\`\`\`python
# 适合简单转换
result = list(map(lambda x: x * 2, data_list))
\`\`\`

### 方案3：生成器（大数据量）
\`\`\`python
# 节省内存，惰性计算
result = (x * 2 for x in data_list)
# 需要列表时转换
result_list = list(result)
\`\`\`

### 方案4：NumPy（数值计算）
\`\`\`python
import numpy as np

# 性能提升100倍以上
arr = np.array(data_list)
result = arr * 2
\`\`\`

## 性能对比

\`\`\`python
import timeit

data = list(range(100000))

# 原方法
def original():
    result = []
    for i in range(len(data)):
        result.append(data[i] * 2)
    return result

# 列表推导式
def list_comprehension():
    return [x * 2 for x in data]

# NumPy
def numpy_method():
    return np.array(data) * 2

# 性能测试结果
# original: 15.2 ms
# list_comprehension: 10.8 ms (快30%)
# numpy_method: 0.15 ms (快100倍)
\`\`\`

## 通用优化原则

1. **避免重复计算**
\`\`\`python
# 差
for item in items:
    if len(items) > 0:  # 每次循环都计算
        process(item)

# 好
if items:  # 只计算一次
    for item in items:
        process(item)
\`\`\`

2. **使用内置函数**
\`\`\`python
# 差
result = []
for x in data:
    if x > 0:
        result.append(x)

# 好
result = list(filter(lambda x: x > 0, data))
# 或
result = [x for x in data if x > 0]
\`\`\`

3. **合理使用缓存**
\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_function(n):
    # 计算密集型操作
    return result
\`\`\``,
      type: 'text'
    }
  }
];

// 默认导出
export default prompts;
