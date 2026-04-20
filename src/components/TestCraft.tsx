'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Sparkles, Link as LinkIcon, CheckCircle,
  FileText, GitBranch, Zap, ChevronRight, ChevronDown,
  Trash2, Plus, X, Download, Loader2, Check, AlertCircle, Circle,
  Edit2, Library, Hourglass, LayoutList, Network, BookOpen,
  Paperclip, FileCheck, ChevronDown as ChevronDownIcon,
  Merge, ZoomIn, ZoomOut, Maximize2, ArrowLeft, Search, Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import BackToHome from '@/components/BackToHome';
import { ModelSelector } from '@/components/ModelSelector';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ==================== 类型定义 ====================
interface TestCase {
  id: string;
  type: 'testcase';
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  given?: string;
  when?: string;
  then?: string;
  verified?: boolean;
}

interface RequirementNode {
  id: string;
  type: 'root' | 'requirement' | 'testcase';
  title: string;
  description?: string;
  priority?: 'P0' | 'P1' | 'P2' | '高' | '中' | '低';
  children: (RequirementNode | TestCase)[];
  given?: string;
  when?: string;
  then?: string;
}

interface ParsedContent {
  id: string;
  source: 'file' | 'link';
  name: string;
  content: string;
}

// 思维导图节点位置
interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ==================== 常量 ====================
const MODULES = [
  { value: '星链', label: '星链' },
  { value: 'C端APP', label: 'C端APP' },
  { value: '工作手机', label: '工作手机' },
];

// AI 模型分组（统一组件 ModelSelector 使用）
const AI_MODEL_GROUPS = [
  {
    provider: '豆包',
    icon: '🦞',
    models: [
      { value: 'doubao-seed-1-8-251228', label: 'Seed 1.8', region: '免费' },
      { value: 'doubao-seed-2-0-pro-260215', label: 'Seed 2.0 Pro', region: '免费' },
      { value: 'doubao-seed-2-0-lite-260215', label: 'Seed 2.0 Lite', region: '免费' },
      { value: 'doubao-seed-2-0-mini-260215', label: 'Seed 2.0 Mini', region: '免费' },
    ]
  },
  {
    provider: 'DeepSeek',
    icon: '🔮',
    models: [
      { value: 'deepseek-v3-2-251201', label: 'V3', region: '免费' },
      { value: 'deepseek-r1-250528', label: 'R1 (推理)', region: '免费' },
    ]
  },
  {
    provider: 'Kimi',
    icon: '🌙',
    models: [
      { value: 'kimi-k2-5-260127', label: 'K2.5', region: '免费' },
      { value: 'kimi-k2-250905', label: 'K2', region: '免费' },
    ]
  },
  {
    provider: 'GLM',
    icon: '📊',
    models: [
      { value: 'glm-5-0-260211', label: 'GLM-5', region: '免费' },
      { value: 'glm-4-7-251222', label: 'GLM-4.7', region: '免费' },
    ]
  },
  {
    provider: 'Qwen',
    icon: '🏔️',
    models: [
      { value: 'qwen-3-5-plus-260215', label: 'Qwen 3.5 Plus', region: '免费' },
    ]
  },
  // 4sAPI 付费模型
  {
    provider: 'GPT (4sAPI)',
    icon: '🤖',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o', region: '付费' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', region: '付费' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', region: '付费' },
    ]
  },
  {
    provider: 'Claude (4sAPI)',
    icon: '🧠',
    models: [
      { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', region: '付费' },
      { value: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku', region: '付费' },
      { value: 'claude-sonnet-4', label: 'Claude Sonnet 4', region: '付费' },
    ]
  },
  {
    provider: 'Gemini (4sAPI)',
    icon: '✨',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', region: '付费' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', region: '付费' },
    ]
  },
];

// 扁平化的模型列表
const AI_MODELS = AI_MODEL_GROUPS.flatMap(group => 
  group.models.map(m => ({
    ...m,
    provider: group.provider,
    providerIcon: group.icon
  }))
);

// 思维导图布局常量
const MINDMAP_CONFIG = {
  GAP_X: 80,
  GAP_Y: 24,
  PADDING: 60,
  ROOT_HEIGHT: 56,
  REQ_HEIGHT: 52,
  TC_HEIGHT: 44,
  MIN_WIDTH: 150,
  MAX_WIDTH: 300,
};

// ==================== 工具函数 ====================
const generateId = () => Math.random().toString(36).substring(2, 11);

// 获取节点宽度
const getNodeWidth = (title: string, type: string): number => {
  const baseWidth = title.length * 12 + (type === 'root' ? 40 : type === 'requirement' ? 100 : 80);
  return Math.min(Math.max(baseWidth, MINDMAP_CONFIG.MIN_WIDTH), MINDMAP_CONFIG.MAX_WIDTH);
};

// 获取节点高度
const getNodeHeight = (type: string): number => {
  if (type === 'root') return MINDMAP_CONFIG.ROOT_HEIGHT;
  if (type === 'requirement') return MINDMAP_CONFIG.REQ_HEIGHT;
  return MINDMAP_CONFIG.TC_HEIGHT;
};

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  if (priority === 'P0' || priority === '高') return 'bg-red-500 text-white';
  if (priority === 'P1' || priority === '中') return 'bg-amber-500 text-white';
  return 'bg-gray-400 text-white';
};

// 获取优先级边框颜色
const getPriorityBorderColor = (priority: string) => {
  if (priority === 'P0' || priority === '高') return 'border-red-400';
  if (priority === 'P1' || priority === '中') return 'border-amber-400';
  return 'border-gray-300';
};

// 获取优先级背景
const getPriorityBg = (priority: string) => {
  if (priority === 'P0' || priority === '高') return 'bg-red-50';
  if (priority === 'P1' || priority === '中') return 'bg-amber-50';
  return 'bg-gray-50';
};

const countTestCases = (node: RequirementNode): number => {
  let count = 0;
  const traverse = (n: RequirementNode | TestCase) => {
    if ('type' in n && n.type === 'testcase') count++;
    if ('children' in n) n.children.forEach(traverse);
  };
  node.children.forEach(traverse);
  return count;
};

const getAllTestCases = (node: RequirementNode): TestCase[] => {
  const cases: TestCase[] = [];
  const traverse = (n: RequirementNode | TestCase) => {
    if ('type' in n && n.type === 'testcase') cases.push(n as TestCase);
    if ('children' in n) n.children.forEach(traverse);
  };
  node.children.forEach(traverse);
  return cases;
};

// ==================== XMind导出函数 ====================
const generateXMind = (mindmap: RequirementNode): Blob => {
  const zip = new JSZip();
  
  // mimetype 文件
  zip.file('mimetype', 'application/vnd.xmind.workbook');
  
  // content.json - 思维导图内容
  const contentJson = generateContentJson(mindmap);
  zip.file('content.json', JSON.stringify(contentJson, null, 2));
  
  // metadata.json
  const metadata = {
    "xmind-version": "2.0",
    "creator": {
      "name": "TestCraft",
      "version": "1.0"
    },
    "created": new Date().toISOString(),
    "modified": new Date().toISOString()
  };
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));
  
  // preferences.json
  const preferences = {
    "version": "1.0"
  };
  zip.file('preferences.json', JSON.stringify(preferences, null, 2));
  
  // styles.xml
  const styles = generateStyles();
  zip.file('styles.xml', styles);
  
  // markes.json
  const marks = {
    "legend": [
      { "key": "priority-p0", "caption": "P0", "color": "#ef4444" },
      { "key": "priority-p1", "caption": "P1", "color": "#f59e0b" },
      { "key": "priority-p2", "caption": "P2", "color": "#6b7280" }
    ]
  };
  zip.file('marks.json', JSON.stringify(marks, null, 2));
  
  return zip.generateAsync({ type: 'blob' }) as unknown as Blob;
};

const generateContentJson = (mindmap: RequirementNode): Record<string, unknown> => {
  const rootTopic = {
    id: mindmap.id,
    title: mindmap.title,
    children: {
      'attached': mindmap.children
        .filter((c): c is RequirementNode => c.type === 'requirement')
        .map((req, reqIdx) => ({
          id: req.id,
          title: req.title,
          children: {
            'attached': req.children
              .filter((c): c is TestCase => c.type === 'testcase')
              .map((tc, tcIdx) => ({
                id: tc.id,
                title: `[${tc.priority}] ${tc.title}`,
                notes: {
                  'plain-content': tc.given || tc.when || tc.then 
                    ? `【前置条件 Given】\n${tc.given || '无'}\n\n【操作步骤 When】\n${tc.when || '无'}\n\n【预期结果 Then】\n${tc.then || '无'}`
                    : '无'
                }
              }))
          }
        }))
    }
  };
  
  return {
    'first-node-id': mindmap.id,
    'nodes': {
      [mindmap.id]: rootTopic
    }
  };
};

const generateStyles = (): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<styles xmlns="urn:xmind:xhtml:styles">
  <style id="root" type="topics">
    <fill-background>true</fill-background>
    <color>#7c3aed</color>
    <font-size>18</font-size>
    <font-weight>bold</font-weight>
  </style>
  <style id="main-topic" type="topics">
    <fill-background>true</fill-background>
    <color>#3b82f6</color>
    <font-size>14</font-size>
    <font-weight>bold</font-weight>
  </style>
  <style id="sub-topic" type="topics">
    <fill-background>false</fill-background>
    <color>#6b7280</color>
    <font-size>12</font-size>
  </style>
  <style id="line" type="lines">
    <color>#d1d5db</color>
    <width>2</width>
    <style>bezier</style>
  </style>
</styles>`;
};

// ==================== 主组件 ====================
export default function TestCraft() {
  // 状态
  const [title, setTitle] = useState('');
  const [module, setModule] = useState('');
  const [aiModel, setAiModel] = useState('doubao-seed-2-0-pro-260215');
  const [description, setDescription] = useState('');
  const [parsedContent, setParsedContent] = useState<ParsedContent[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [mindmap, setMindmap] = useState<RequirementNode | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementNode | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeTitle, setEditingNodeTitle] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'mindmap'>('tree');
  const [showKnowledgeSearch, setShowKnowledgeSearch] = useState(false);
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
  const [knowledgeSearchResults, setKnowledgeSearchResults] = useState<Record<string, unknown>[]>([]);
  const [selectedKnowledgeCases, setSelectedKnowledgeCases] = useState<Set<string>>(new Set());
  const [knowledgeSearchLoading, setKnowledgeSearchLoading] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  
  // 思维导图状态
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  
  // 用例筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 从localStorage恢复状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMindmap = localStorage.getItem('testcraft-mindmap');
      const savedExpanded = localStorage.getItem('testcraft-expanded');
      
      if (savedMindmap) {
        try {
          setMindmap(JSON.parse(savedMindmap));
        } catch {
          console.error('Failed to parse mindmap');
        }
      }
      if (savedExpanded) {
        try {
          setExpanded(new Set(JSON.parse(savedExpanded)));
        } catch {
          console.error('Failed to parse expanded');
        }
      }
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    if (mindmap && typeof window !== 'undefined') {
      localStorage.setItem('testcraft-mindmap', JSON.stringify(mindmap));
      localStorage.setItem('testcraft-expanded', JSON.stringify([...expanded]));
    }
  }, [mindmap, expanded]);

  // 合并内容
  const getMergedContent = (): string => {
    let content = description;
    parsedContent.forEach(p => {
      if (p.content) {
        content += `\n\n[${p.name}]\n${p.content}`;
      }
    });
    return content;
  };

  // 需求拆分
  const handleAnalyze = async () => {
    if (!title.trim()) {
      alert('请填写需求标题');
      return;
    }
    
    const content = getMergedContent();
    if (!content.trim()) {
      alert('请输入需求描述或上传文件/链接');
      return;
    }

    setAnalyzing(true);
    
    try {
      const response = await fetch('/api/testcraft/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirement: content,
          title,
          module,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const requirements = parseRequirements(data.content || data.requirementPointsText || content);
      
      const root: RequirementNode = {
        id: generateId(),
        type: 'root',
        title,
        children: requirements.map((req, idx) => ({
          id: generateId(),
          type: 'requirement' as const,
          title: req.title,
          description: req.description,
          priority: (['高', '中', '低'][idx % 3] || '中') as '高' | '中' | '低',
          children: [],
        })),
      };

      setMindmap(root);
      
      const newExpanded = new Set<string>();
      newExpanded.add(root.id);
      root.children.forEach(child => newExpanded.add(child.id));
      setExpanded(newExpanded);

    } catch (error: unknown) {
      console.error('分析失败:', error);
      alert(error instanceof Error ? error.message : '分析失败，请重试');
    } finally {
      setAnalyzing(false);
    }
  };

  // 解析需求点
  const parseRequirements = (content: string): { title: string; description: string }[] => {
    const requirements: { title: string; description: string }[] = [];
    const lines = content.split('\n');
    let currentReq: { title: string; description: string } | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[\d]+[.、]/.test(trimmed) || /^(需求|功能|模块)[：:]/.test(trimmed)) {
        if (currentReq) requirements.push(currentReq);
        currentReq = {
          title: trimmed.replace(/^[\d]+[.、]\s*/, '').replace(/^(需求|功能|模块)[：:]\s*/, ''),
          description: '',
        };
      } else if (currentReq && trimmed) {
        currentReq.description += (currentReq.description ? '\n' : '') + trimmed;
      }
    }
    
    if (currentReq) requirements.push(currentReq);
    
    if (requirements.length === 0) {
      requirements.push({
        title: '需求点 1',
        description: content.substring(0, 500),
      });
    }
    
    return requirements.slice(0, 10);
  };

  // 生成测试用例（流式）
  const handleGenerate = async (reqId: string) => {
    if (!mindmap) return;
    
    const findReq = (node: RequirementNode): RequirementNode | null => {
      if (node.id === reqId) return node;
      for (const child of node.children) {
        if ('type' in child && child.type === 'requirement') {
          const found = findReq(child as RequirementNode);
          if (found) return found;
        }
      }
      return null;
    };

    const reqNode = findReq(mindmap);
    if (!reqNode) return;

    setGeneratingId(reqId);
    
    try {
      const response = await fetch('/api/testcraft/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementPoint: {
            title: reqNode.title,
            description: reqNode.description || '',
          },
          module,
          aiModel,
        }),
      });

      if (!response.ok) {
        throw new Error('生成请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      let fullContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        fullContent += text;
      }

      // 尝试解析JSON响应
      let testCases: Omit<TestCase, 'id'>[] = [];
      try {
        const jsonData = JSON.parse(fullContent);
        if (jsonData.cases) {
          testCases = jsonData.cases;
        } else if (jsonData.content || jsonData.rawContent) {
          testCases = parseTestCases(jsonData.content || jsonData.rawContent);
        }
      } catch {
        testCases = parseTestCases(fullContent);
      }
      
      // 记录使用统计
      fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_type: 'testcraft',
          input_data: { requirement: reqNode.title, module, aiModel },
          output_data: { test_cases_count: testCases.length },
          status: 'success',
        }),
      }).catch(() => {});
      
      const updateMindmap = (node: RequirementNode): RequirementNode => {
        if (node.id === reqId) {
          return {
            ...node,
            children: testCases.map((tc) => ({
              id: generateId(),
              type: 'testcase' as const,
              title: tc.title,
              priority: tc.priority || 'P1',
              given: tc.given,
              when: tc.when,
              then: tc.then,
            })),
          };
        }
        return {
          ...node,
          children: node.children.map(child => {
            if ('type' in child && child.type === 'requirement') {
              return updateMindmap(child as RequirementNode);
            }
            return child;
          }),
        };
      };

      setMindmap(prev => prev ? updateMindmap(prev) : null);

    } catch (error: unknown) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败，请重试');
    } finally {
      setGeneratingId(null);
    }
  };

  // 批量生成
  const handleBatchGenerate = async () => {
    if (!mindmap) return;
    
    const reqsWithoutCases = mindmap.children.filter(
      child => 'type' in child && child.type === 'requirement' && (child as RequirementNode).children.length === 0
    ) as RequirementNode[];
    
    if (reqsWithoutCases.length === 0) {
      alert('所有需求点都已生成测试用例');
      return;
    }

    setGenerating(true);
    
    for (const req of reqsWithoutCases) {
      await handleGenerate(req.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setGenerating(false);
  };

  // 解析测试用例
  const parseTestCases = (content: string): Omit<TestCase, 'id'>[] => {
    const cases: Omit<TestCase, 'id'>[] = [];
    const parts = content.split(/===CASE_SEPARATOR===|用例\d+[.、]/).filter(p => p.trim());
    
    for (let i = 0; i < parts.length && i < 10; i++) {
      const part = parts[i];
      const titleMatch = part.match(/【用例标题】[:：]\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : `用例 ${i + 1}`;
      const priorityMatch = part.match(/【优先级】[:：]\s*(P\d+)/);
      const priority = (priorityMatch ? priorityMatch[1] : i < 2 ? 'P0' : i < 5 ? 'P1' : 'P2') as 'P0' | 'P1' | 'P2';
      const givenMatch = part.match(/【Given】[:：]\s*([\s\S]*?)(?=【When】|【Then】|$)/);
      const whenMatch = part.match(/【When】[:：]\s*([\s\S]*?)(?=【Given】|【Then】|$)/);
      const thenMatch = part.match(/【Then】[:：]\s*([\s\S]*?)(?=【Given】|【When】|$)/);
      
      cases.push({
        type: 'testcase' as const,
        title,
        priority,
        given: givenMatch ? givenMatch[1].trim() : '',
        when: whenMatch ? whenMatch[1].trim() : '',
        then: thenMatch ? thenMatch[1].trim() : '',
      });
    }
    
    if (cases.length === 0) {
      cases.push({
        type: 'testcase' as const,
        title: '默认用例',
        priority: 'P0',
        given: '测试前置条件',
        when: '执行的操作',
        then: '预期的结果',
      });
    }
    
    return cases;
  };

  // 切换展开/折叠
  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 展开所有
  const expandAll = () => {
    if (!mindmap) return;
    const allIds = new Set<string>();
    const collectIds = (node: RequirementNode | TestCase) => {
      allIds.add(node.id);
      if ('children' in node) node.children.forEach(collectIds);
    };
    mindmap.children.forEach(collectIds);
    setExpanded(allIds);
  };

  // 折叠所有
  const collapseAll = () => {
    if (!mindmap) return;
    const rootIds = new Set<string>();
    rootIds.add(mindmap.id);
    mindmap.children.forEach(child => rootIds.add(child.id));
    setExpanded(rootIds);
  };

  // 添加需求点
  const addRequirement = () => {
    if (!mindmap) return;
    
    const newReq: RequirementNode = {
      id: generateId(),
      type: 'requirement',
      title: `需求点 ${mindmap.children.length + 1}`,
      priority: '中',
      children: [],
    };
    
    setMindmap({
      ...mindmap,
      children: [...mindmap.children, newReq],
    });
    setExpanded(prev => new Set(prev).add(newReq.id));
  };

  // 添加测试用例
  const addTestCase = (reqId: string) => {
    if (!mindmap) return;
    
    const updateReq = (node: RequirementNode): RequirementNode => {
      if (node.id === reqId) {
        const newCase: TestCase = {
          id: generateId(),
          type: 'testcase',
          title: `用例 ${node.children.length + 1}`,
          priority: 'P1',
        };
        return { ...node, children: [...node.children, newCase] };
      }
      return {
        ...node,
        children: node.children.map(child => {
          if ('type' in child && child.type === 'requirement') {
            return updateReq(child as RequirementNode);
          }
          return child;
        }),
      };
    };
    
    setMindmap(updateReq(mindmap));
  };

  // 开始编辑
  const startEdit = (id: string, currentTitle: string) => {
    setEditingNodeId(id);
    setEditingNodeTitle(currentTitle);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!mindmap || !editingNodeId) return;
    
    const updateTitle = (node: RequirementNode): RequirementNode => {
      if (node.id === editingNodeId) {
        return { ...node, title: editingNodeTitle };
      }
      return {
        ...node,
        children: node.children.map(child => {
          if (child.id === editingNodeId) {
            return { ...child, title: editingNodeTitle };
          }
          if ('type' in child && child.type === 'requirement') {
            return updateTitle(child as RequirementNode);
          }
          return child;
        }),
      };
    };
    
    setMindmap(updateTitle(mindmap));
    setEditingNodeId(null);
  };

  // 删除节点
  const handleDeleteNode = (parentId: string, nodeId: string) => {
    if (!mindmap) return;
    
    const updateParent = (node: RequirementNode): RequirementNode => {
      return {
        ...node,
        children: node.children.filter(child => {
          if (child.id === nodeId) return false;
          if ('type' in child && child.type === 'requirement') {
            return true;
          }
          return true;
        }).map(child => {
          if ('type' in child && child.type === 'requirement') {
            return updateParent(child as RequirementNode);
          }
          return child;
        }),
      };
    };
    
    // 如果是删除需求点，同时删除子节点
    const nodeToDelete = findNodeById(mindmap, nodeId);
    if (nodeToDelete?.type === 'requirement') {
      setMindmap(prev => {
        if (!prev) return null;
        return removeNodeAndChildren(prev, nodeId);
      });
    } else {
      // 只删除测试用例
      setMindmap(prev => {
        if (!prev) return null;
        return removeTestCase(prev, nodeId);
      });
    }
    
    if (selectedCase?.id === nodeId) setSelectedCase(null);
    if (selectedRequirement?.id === nodeId) {
      setSelectedRequirement(null);
      setDetailsPanelOpen(false);
    }
  };

  const findNodeById = (node: RequirementNode, id: string): RequirementNode | TestCase | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      if (child.id === id) return child;
      if ('type' in child && child.type === 'requirement') {
        const found = findNodeById(child as RequirementNode, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeNodeAndChildren = (node: RequirementNode, nodeId: string): RequirementNode => {
    return {
      ...node,
      children: node.children
        .filter(child => child.id !== nodeId)
        .map(child => {
          if ('type' in child && child.type === 'requirement') {
            return removeNodeAndChildren(child as RequirementNode, nodeId);
          }
          return child;
        }),
    };
  };

  const removeTestCase = (node: RequirementNode, tcId: string): RequirementNode => {
    return {
      ...node,
      children: node.children.map(child => {
        if (child.type === 'requirement') {
          return {
            ...child,
            children: child.children.filter(c => c.id !== tcId),
          };
        }
        return child;
      }),
    };
  };

  // 文件上传
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    for (const file of Array.from(files)) {
      const tempId = generateId();
      const newContent: ParsedContent = {
        id: tempId,
        source: 'file',
        name: file.name,
        content: '',
      };
      
      setParsedContent(prev => [...prev, newContent]);
      
      try {
        const text = await file.text();
        setParsedContent(prev => prev.map(p => 
          p.id === tempId ? { ...p, content: text.substring(0, 5000) } : p
        ));
      } catch {
        setParsedContent(prev => prev.filter(p => p.id !== tempId));
      }
    }
    
    e.target.value = '';
  };

  // 链接抓取
  const handleFetchUrl = async () => {
    const url = linkInput.trim();
    if (!url) return;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('请输入以 http:// 或 https:// 开头的链接');
      return;
    }
    
    const tempId = generateId();
    const newContent: ParsedContent = {
      id: tempId,
      source: 'link',
      name: url,
      content: '',
    };
    
    setParsedContent(prev => [...prev, newContent]);
    setIsFetchingUrl(true);
    
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setParsedContent(prev => prev.map(p =>
          p.id === tempId ? { ...p, content: data.data.content?.substring(0, 5000) || '' } : p
        ));
      } else {
        throw new Error(data.error || '抓取失败');
      }
    } catch (error: unknown) {
      setParsedContent(prev => prev.filter(p => p.id !== tempId));
      alert(error instanceof Error ? error.message : '链接抓取失败');
    } finally {
      setIsFetchingUrl(false);
      setLinkInput('');
    }
  };

  // 删除解析内容
  const removeParsedContent = (id: string) => {
    setParsedContent(prev => prev.filter(p => p.id !== id));
  };

  // 合并到需求描述
  const handleMergeToDescription = () => {
    const merged = parsedContent
      .filter(p => p.content)
      .map(p => `[${p.name}]\n${p.content}`)
      .join('\n\n---\n\n');
    
    setDescription(prev => (prev ? prev + '\n\n---\n\n' : '') + merged);
  };

  // 清除所有数据
  const confirmClearAllData = () => {
    setTitle('');
    setDescription('');
    setModule('');
    setParsedContent([]);
    setMindmap(null);
    setExpanded(new Set());
    setSelectedCase(null);
    setSelectedRequirement(null);
    setDetailsPanelOpen(false);
    setClearingData(false);
    
    localStorage.removeItem('testcraft-mindmap');
    localStorage.removeItem('testcraft-expanded');
  };

  // 导出功能
  const downloadFile = (content: string | Blob, filename: string, type?: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setExportDropdownOpen(false);
  };

  const exportCSV = () => {
    if (!mindmap) return;
    const cases = getAllTestCases(mindmap);
    if (cases.length === 0) {
      alert('没有可导出的测试用例');
      return;
    }
    
    const rows = [
      ['需求点', '用例标题', '优先级', 'Given', 'When', 'Then'],
      ...cases.map(tc => {
        const req = mindmap.children.find(c => 
          'type' in c && c.type === 'requirement' && 
          (c as RequirementNode).children.some((cc) => cc.id === tc.id)
        );
        return [
          req ? (req as RequirementNode).title : '',
          tc.title,
          tc.priority || 'P1',
          tc.given || '',
          tc.when || '',
          tc.then || '',
        ];
      }),
    ];
    
    const csv = rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadFile(csv, `testcases_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const exportExcel = () => {
    if (!mindmap) return;
    const cases = getAllTestCases(mindmap);
    if (cases.length === 0) {
      alert('没有可导出的测试用例');
      return;
    }
    
    const wsData = [
      ['序号', '用例标题', '优先级', '前置条件(Given)', '操作步骤(When)', '预期结果(Then)'],
      ...cases.map((tc, idx) => [
        idx + 1,
        tc.title,
        tc.priority || 'P1',
        tc.given || '',
        tc.when || '',
        tc.then || '',
      ]),
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '测试用例');
    ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 8 }, { wch: 40 }, { wch: 40 }, { wch: 40 }];
    XLSX.writeFile(wb, `testcases_${new Date().toISOString().split('T')[0]}.xlsx`);
    setExportDropdownOpen(false);
  };

  const exportXMind = async () => {
    if (!mindmap) return;
    const cases = getAllTestCases(mindmap);
    if (cases.length === 0) {
      alert('没有可导出的测试用例');
      return;
    }
    
    try {
      const zip = new JSZip();
      
      // mimetype
      zip.file('mimetype', 'application/vnd.xmind.workbook');
      
      // content.json
      const rootTopic = {
        id: mindmap.id,
        title: mindmap.title,
        children: {
          'attached': mindmap.children
            .filter((c): c is RequirementNode => c.type === 'requirement')
            .map((req) => ({
              id: req.id,
              title: `[${req.priority || '中'}] ${req.title}`,
              children: {
                'attached': req.children
                  .filter((c): c is TestCase => c.type === 'testcase')
                  .map((tc) => ({
                    id: tc.id,
                    title: `[${tc.priority}] ${tc.title}`,
                    notes: {
                      'plain-content': `【前置条件 Given】\n${tc.given || '无'}\n\n【操作步骤 When】\n${tc.when || '无'}\n\n【预期结果 Then】\n${tc.then || '无'}`
                    }
                  }))
              }
            }))
        }
      };
      
      const nodesMap: Record<string, unknown> = {};
      const collectNodes = (node: RequirementNode | TestCase) => {
        nodesMap[node.id] = {
          id: node.id,
          title: node.title,
          children: 'children' in node && node.children.length > 0 ? {
            'attached': node.children
              .filter((c): c is RequirementNode | TestCase => c.type === 'testcase' || c.type === 'requirement')
              .map(c => ({ id: c.id }))
          } : undefined
        };
        if ('children' in node) node.children.forEach(collectNodes);
      };
      mindmap.children.forEach(collectNodes);
      
      const contentJson = {
        'first-node-id': mindmap.id,
        'nodes': nodesMap
      };
      
      zip.file('content.json', JSON.stringify(contentJson, null, 2));
      
      // metadata.json
      zip.file('metadata.json', JSON.stringify({
        "xmind-version": "2.0",
        "creator": { "name": "TestCraft", "version": "1.0" },
        "created": new Date().toISOString(),
        "modified": new Date().toISOString()
      }, null, 2));
      
      // preferences.json
      zip.file('preferences.json', JSON.stringify({ "version": "1.0" }, null, 2));
      
      // styles.xml
      zip.file('styles.xml', `<?xml version="1.0" encoding="UTF-8"?>
<styles xmlns="urn:xmind:xhtml:styles">
  <style id="root" type="topics">
    <fill-background>true</fill-background>
    <color>#7c3aed</color>
    <font-size>18</font-size>
    <font-weight>bold</font-weight>
  </style>
  <style id="main-topic" type="topics">
    <fill-background>true</fill-background>
    <color>#3b82f6</color>
    <font-size>14</font-size>
    <font-weight>bold</font-weight>
  </style>
  <style id="sub-topic" type="topics">
    <fill-background>false</fill-background>
    <color>#6b7280</color>
    <font-size>12</font-size>
  </style>
</styles>`);
      
      // marks.json
      zip.file('marks.json', JSON.stringify({
        "legend": [
          { "key": "p0", "caption": "P0", "color": "#ef4444" },
          { "key": "p1", "caption": "P1", "color": "#f59e0b" },
          { "key": "p2", "caption": "P2", "color": "#6b7280" }
        ]
      }, null, 2));
      
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadFile(blob, `testcases_${new Date().toISOString().split('T')[0]}.xmind`);
    } catch (error) {
      console.error('XMind export error:', error);
      alert('导出失败，请重试');
    }
  };

  // 知识库搜索
  const handleKnowledgeSearch = () => {
    if (!knowledgeSearchQuery.trim()) return;
    setKnowledgeSearchLoading(true);
    
    setTimeout(() => {
      const mockResults = [
        { id: 'case-001', title: '用户登录功能测试', content: '前提：用户已注册账号\n操作：输入正确的用户名和密码点击登录\n预期：成功登录并跳转到首页' },
        { id: 'case-002', title: '用户登出功能测试', content: '前提：用户已登录\n操作：点击退出登录按钮\n预期：成功退出并跳转到登录页' },
        { id: 'case-003', title: '密码修改功能测试', content: '前提：用户已登录\n操作：进入设置-修改密码，输入原密码和新密码\n预期：密码修改成功，下次登录需使用新密码' },
      ].filter((r: { title: string }) => r.title.includes(knowledgeSearchQuery));
      
      setKnowledgeSearchResults(mockResults);
      setKnowledgeSearchLoading(false);
    }, 500);
  };

  const toggleKnowledgeCaseSelection = (id: string) => {
    setSelectedKnowledgeCases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddFromKnowledge = () => {
    if (selectedKnowledgeCases.size === 0 || !mindmap) return;
    
    const selectedCases = knowledgeSearchResults
      .filter((r: Record<string, unknown>) => selectedKnowledgeCases.has(r.id as string))
      .map((r: Record<string, unknown>) => {
        const content = r.content as string;
        const lines = content.split('\n');
        return {
          id: generateId(),
          type: 'testcase' as const,
          title: r.title as string,
          priority: 'P1' as const,
          given: lines.find((l: string) => l.startsWith('前提：'))?.replace('前提：', '') || '',
          when: lines.find((l: string) => l.startsWith('操作：'))?.replace('操作：', '') || '',
          then: lines.find((l: string) => l.startsWith('预期：'))?.replace('预期：', '') || '',
        };
      });
    
    if (mindmap.children.length > 0) {
      const firstReq = mindmap.children[0] as RequirementNode;
      setMindmap({
        ...mindmap,
        children: mindmap.children.map((child, idx) => {
          if (idx === 0 && 'type' in child && child.type === 'requirement') {
            return { ...child, children: [...child.children, ...selectedCases] };
          }
          return child;
        }),
      });
    }
    
    setShowKnowledgeSearch(false);
    setKnowledgeSearchQuery('');
    setKnowledgeSearchResults([]);
    setSelectedKnowledgeCases(new Set());
  };

  // 思维导图交互
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.3), 2));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // 计算思维导图节点位置
  const calculateNodePositions = useMemo(() => {
    if (!mindmap) return { positions: new Map(), totalWidth: 0, totalHeight: 0 };
    
    const positions = new Map<string, NodePosition>();
    const { GAP_X, GAP_Y, PADDING, ROOT_HEIGHT, REQ_HEIGHT, TC_HEIGHT } = MINDMAP_CONFIG;
    
    let currentY = PADDING;
    let maxX = 0;
    
    // 根节点位置
    const rootWidth = getNodeWidth(mindmap.title, 'root');
    positions.set(mindmap.id, {
      id: mindmap.id,
      x: PADDING,
      y: PADDING,
      width: rootWidth,
      height: ROOT_HEIGHT,
    });
    
    // 需求点和测试用例位置
    const requirementNodes = mindmap.children.filter((c): c is RequirementNode => c.type === 'requirement');
    
    // 计算每列的垂直偏移
    let colY = PADDING;
    let colMaxHeight = 0;
    
    // 根节点高度
    const rootNodeHeight = Math.max(
      ...requirementNodes.map(req => {
        const reqHeight = REQ_HEIGHT;
        const tcCount = req.children.filter((c): c is TestCase => c.type === 'testcase').length;
        const tcTotalHeight = tcCount * TC_HEIGHT + (tcCount > 0 ? (tcCount - 1) * GAP_Y : 0);
        return reqHeight + GAP_Y + tcTotalHeight;
      })
    );
    
    // 根节点居中
    positions.get(mindmap.id)!.y = PADDING + (colMaxHeight - ROOT_HEIGHT) / 2;
    
    // 第一列：需求点
    let reqX = PADDING + rootWidth + GAP_X;
    let reqY = PADDING;
    
    for (const req of requirementNodes) {
      const reqWidth = getNodeWidth(req.title, 'requirement');
      const tcNodes = req.children.filter((c): c is TestCase => c.type === 'testcase');
      
      positions.set(req.id, {
        id: req.id,
        x: reqX,
        y: reqY,
        width: reqWidth,
        height: REQ_HEIGHT,
      });
      
      // 测试用例位置
      let tcX = reqX + reqWidth + GAP_X;
      let tcY = reqY;
      
      for (const tc of tcNodes) {
        const tcWidth = getNodeWidth(tc.title, 'testcase');
        positions.set(tc.id, {
          id: tc.id,
          x: tcX,
          y: tcY,
          width: tcWidth,
          height: TC_HEIGHT,
        });
        tcY += TC_HEIGHT + GAP_Y;
      }
      
      reqY += REQ_HEIGHT + GAP_Y + Math.max(tcNodes.length * (TC_HEIGHT + GAP_Y), GAP_Y);
      maxX = Math.max(maxX, tcX + (tcNodes.length > 0 ? tcNodes[tcNodes.length - 1].title.length * 12 + 100 : 0));
    }
    
    const totalWidth = maxX + PADDING;
    const totalHeight = reqY + PADDING;
    
    return { positions, totalWidth, totalHeight };
  }, [mindmap]);

  // 渲染思维导图节点
  const renderMindMapNode = (node: RequirementNode | TestCase, position: NodePosition, isRoot: boolean = false) => {
    const isSelected = (selectedCase?.id === node.id) || (selectedRequirement?.id === node.id);
    const isReq = node.type === 'requirement';
    const isTC = node.type === 'testcase';
    const isExpanded = expanded.has(node.id);
    
    // 简洁配色方案
    // 根节点：深紫色
    // 需求点：浅白色
    // 测试用例：白色 + 优先级边框
    const getNodeColors = () => {
      if (isRoot) {
        return {
          bg: '#7c3aed',      // 深紫色
          text: '#ffffff',     // 白色文字
          border: 'transparent',
        };
      }
      if (isReq) {
        return {
          bg: '#f8fafc',       // 浅白色
          text: '#334155',     // 深灰色文字
          border: 'transparent',
        };
      }
      // 测试用例 - 根据优先级边框
      if (node.priority === 'P0') {
        return {
          bg: '#ffffff',       // 白色
          text: '#334155',      // 深灰色文字
          border: '#22c55e',   // 绿色边框
        };
      }
      if (node.priority === 'P1') {
        return {
          bg: '#ffffff',       // 白色
          text: '#334155',     // 深灰色文字
          border: '#f97316',   // 橙色边框
        };
      }
      // P2 或默认
      return {
        bg: '#ffffff',         // 白色
        text: '#334155',       // 深灰色文字
        border: '#94a3b8',      // 灰色边框
      };
    };
    
    const colors = getNodeColors();
    
    // 优先级圆圈颜色
    const getPriorityCircle = () => {
      if (node.priority === 'P0') return '#22c55e';  // 绿色
      if (node.priority === 'P1') return '#f97316';  // 橙色
      return '#94a3b8';  // 灰色
    };
    
    // 优先级文字
    const getPriorityText = () => {
      switch (node.priority) {
        case 'P0': return '高';
        case 'P1': return '中';
        case 'P2': return '低';
        default: return '';
      }
    };
    
    const handleClick = () => {
      if (isRoot) {
        setViewMode('tree');
      } else if (isReq) {
        toggleExpand(node.id);
        setSelectedRequirement(node as RequirementNode);
        setDetailsPanelOpen(true);
      } else if (isTC) {
        setSelectedCase(node as TestCase);
        setDetailsPanelOpen(true);
      }
    };
    
    // 子节点数量
    const childCount = 'children' in node ? node.children.length : 0;
    
    return (
      <g key={node.id} transform={`translate(${position.x}, ${position.y})`}>
        {/* 节点背景 - 圆角卡片 */}
        <rect
          x="0"
          y="0"
          width={position.width}
          height={position.height}
          rx={10}
          ry={10}
          fill={colors.bg}
          stroke={isSelected ? '#8b5cf6' : colors.border}
          strokeWidth={isSelected ? 3 : colors.border !== 'transparent' ? 2 : 0}
          className="cursor-pointer transition-all"
          onClick={handleClick}
          filter={isRoot ? "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.05))"}
        />
        
        {/* 根节点 - 白色星形图标 */}
        {isRoot && (
          <g transform={`translate(10, ${position.height / 2 - 6})`}>
            <text fill="#ffffff" fontSize="12" className="pointer-events-none">⭐</text>
          </g>
        )}
        
        {/* 节点标题 */}
        <text
          x={isRoot ? position.width / 2 : 12}
          y={position.height / 2}
          dominantBaseline="middle"
          textAnchor={isRoot ? 'middle' : 'start'}
          fill={colors.text}
          fontSize={isRoot ? 13 : 12}
          fontWeight={isRoot ? '600' : '500'}
          className="select-none pointer-events-none"
        >
          {node.title.length > (isRoot ? 18 : 20) 
            ? node.title.substring(0, isRoot ? 18 : 20) + '...' 
            : node.title}
        </text>
        
        {/* 需求点 - 左上角优先级标签 */}
        {isReq && node.priority && (
          <g transform={`translate(6, 6)`}>
            <rect
              x="0"
              y="0"
              width={20}
              height={14}
              rx={3}
              fill="#e2e8f0"
            />
            <text
              x={10}
              y={7}
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#64748b"
              fontSize={8}
              fontWeight="500"
              className="select-none pointer-events-none"
            >
              {getPriorityText()}
            </text>
          </g>
        )}
        
        {/* 需求点 - 右上角子节点数量 */}
        {isReq && childCount > 0 && (
          <g transform={`translate(${position.width - 26}, 6)`}>
            <rect
              x="0"
              y="0"
              width={20}
              height={14}
              rx={3}
              fill="#7c3aed"
            />
            <text
              x={10}
              y={7}
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ffffff"
              fontSize={8}
              fontWeight="600"
              className="select-none pointer-events-none"
            >
              {childCount}
            </text>
          </g>
        )}
        
        {/* 测试用例 - 左侧圆形优先级标识 */}
        {isTC && (
          <g transform={`translate(8, ${position.height / 2 - 5})`}>
            <circle
              cx={5}
              cy={5}
              r={5}
              fill={getPriorityCircle()}
            />
            <text
              x={5}
              y={5}
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ffffff"
              fontSize={7}
              fontWeight="bold"
              className="select-none pointer-events-none"
            >
              {node.priority?.replace('P', '') || ''}
            </text>
          </g>
        )}
      </g>
    );
  };

  // 计算统计
  const reqCount = mindmap?.children.length || 0;
  const caseCount = mindmap ? countTestCases(mindmap) : 0;

  // 渲染树节点
  const renderTreeNode = (node: RequirementNode | TestCase, level: number = 0, testCaseIndex: number = 0, requirementIndex: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = 'children' in node && node.children.length > 0;
    const isRoot = node.type === 'root';
    const isRequirement = node.type === 'requirement';
    const isTestCase = node.type === 'testcase';
    const isEditing = editingNodeId === node.id;
    const isGeneratingThis = generatingId === node.id;
    const currentTestCase = node as TestCase;
    const currentReq = node as RequirementNode;
    
    // 节点类型样式配置（与网站风格一致的橙色主题）
    const getNodeStyles = () => {
      if (isRoot) {
        return {
          bg: 'bg-gradient-to-r from-violet-600 to-purple-600',
          text: 'text-white',
          border: 'border-transparent',
          icon: <Sparkles className="w-4 h-4" />,
        };
      }
      if (isRequirement) {
        // 需求点：白底橙色边框 + 橙色文字（与网站风格一致）
        return {
          bg: 'bg-white dark:bg-slate-800',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-300 dark:border-orange-700',
          icon: <CheckCircle className="w-4 h-4 text-orange-500" />,
        };
      }
      if (isTestCase) {
        // 测试用例：白底灰色边框 + 灰色文字
        return {
          bg: 'bg-white dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          icon: <AlertCircle className="w-4 h-4 text-slate-400" />,
        };
      }
      return {
        bg: 'bg-slate-100 dark:bg-slate-700',
        text: 'text-slate-700 dark:text-slate-200',
        border: 'border-slate-200 dark:border-slate-700',
        icon: <FileText className="w-4 h-4" />,
      };
    };
    
    const styles = getNodeStyles();
    const isSelectedNode = isSelected || (isTestCase && selectedCase?.id === node.id);

    return (
      <div key={node.id} className="mb-2 group relative">
        {/* 连接线 */}
        {level > 0 && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-0.5 bg-purple-300 dark:bg-purple-600"
            style={{ left: `${(level - 1) * 20 + 8}px` }}
          />
        )}
        
        {/* 节点卡片 - 白底卡片样式 */}
        <div 
          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md border-2 ${
            styles.bg
          } ${styles.text} ${styles.border} ${isSelectedNode ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => {
            if (isTestCase) {
              setSelectedCase(currentTestCase);
              setDetailsPanelOpen(true);
            } else if (isRequirement) {
              setSelectedRequirement(currentReq);
              setDetailsPanelOpen(true);
            }
          }}
        >
          {/* 展开/折叠按钮 */}
          {hasChildren ? (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }} 
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* 图标 */}
          {styles.icon}

          {/* 标题 */}
          {isEditing ? (
            <input
              type="text"
              value={editingNodeTitle}
              onChange={(e) => setEditingNodeTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              className="flex-1 px-2 py-1 text-sm border-0 rounded outline-none bg-white/90 text-slate-800"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className="flex-1 text-sm font-medium truncate"
              onDoubleClick={() => startEdit(node.id, node.title)}
            >
              {node.title}
            </span>
          )}

          {/* 数量标签（需求点显示子节点数量） */}
          {isRequirement && hasChildren && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
              {currentReq.children.length}
            </span>
          )}

          {/* 操作按钮 */}
          {!isRoot && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {isRequirement && (
                <>
                  <button title="从知识库添加" onClick={(e) => { e.stopPropagation(); setShowKnowledgeSearch(true); }} className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded text-slate-500 hover:text-orange-600">
                    <Library className="w-3.5 h-3.5" />
                  </button>
                  <button title="生成用例" onClick={(e) => { e.stopPropagation(); handleGenerate(node.id); }} className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded text-slate-500 hover:text-orange-600">
                    {isGeneratingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  </button>
                  <button title="编辑" onClick={(e) => { e.stopPropagation(); startEdit(node.id, node.title); }} className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded text-slate-500 hover:text-orange-600">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button title="删除" onClick={(e) => { e.stopPropagation(); handleDeleteNode(mindmap?.id || '', node.id); }} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-500 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              {isTestCase && (
                <>
                  <button title="编辑" onClick={(e) => { e.stopPropagation(); startEdit(node.id, node.title); }} className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded text-slate-500 hover:text-orange-600">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button title="删除" onClick={(e) => { e.stopPropagation(); handleDeleteNode('', node.id); }} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-500 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 子节点 */}
        {isExpanded && hasChildren && (
          <div className="mt-1 relative">
            {/* 子节点连接线 */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-purple-300 dark:bg-purple-700"
              style={{ marginLeft: `${level * 20 + 16}px` }}
            />
            {currentReq.children.map((child) => {
              if (child.type === 'testcase') {
                const tcIdx = currentReq.children.filter((c) => c.type === 'testcase').indexOf(child) + 1;
                return renderTreeNode(child, level + 1, tcIdx, 0);
              }
              const reqIdx = currentReq.children.filter((c) => c.type === 'requirement').indexOf(child) + 1;
              return renderTreeNode(child, level + 1, 0, reqIdx);
            })}
          </div>
        )}
      </div>
    );
  };;

  // 渲染详情面板
  const renderDetailPanel = () => {
    if (!detailsPanelOpen) return null;
    
    const isRequirementDetail = selectedRequirement && !selectedCase;
    const isCaseDetail = selectedCase;
    
    return (
      <div className="xl:w-[400px] shrink-0">
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
                用例详情
              </span>
              <button 
                onClick={() => {
                  setDetailsPanelOpen(false);
                  setSelectedCase(null);
                  setSelectedRequirement(null);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            
            {isCaseDetail && selectedCase && (
              <div className="space-y-4 p-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {/* 场景标题 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-3 py-1 font-medium">
                      测试场景
                    </Badge>
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 ${selectedCase.priority === 'P0' ? 'border-red-300 text-red-600' : selectedCase.priority === 'P1' ? 'border-amber-300 text-amber-600' : 'border-slate-300 text-slate-500'}`}>
                      {selectedCase.priority}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 leading-relaxed text-sm">
                    {selectedCase.title}
                  </h3>
                </div>

                {/* Given - 前置条件 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 shrink-0 font-medium">前置条件</Badge>
                    <span className="text-xs text-slate-400 font-mono">Given</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl px-4 py-3 border border-emerald-100 dark:border-emerald-900/30">
                    <pre className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words font-sans">
                      {selectedCase.given || <span className="text-slate-400 italic">未提供</span>}
                    </pre>
                  </div>
                </div>

                {/* When - 操作步骤 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 shrink-0 font-medium">操作步骤</Badge>
                    <span className="text-xs text-slate-400 font-mono">When</span>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl px-4 py-3 border border-amber-100 dark:border-amber-900/30">
                    <pre className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words font-sans">
                      {selectedCase.when || <span className="text-slate-400 italic">未提供</span>}
                    </pre>
                  </div>
                </div>

                {/* Then - 预期结果 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 px-3 py-1 shrink-0 font-medium">预期结果</Badge>
                    <span className="text-xs text-slate-400 font-mono">Then</span>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-950/20 rounded-xl px-4 py-3 border border-pink-100 dark:border-pink-900/30">
                    <pre className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words font-sans">
                      {selectedCase.then || <span className="text-slate-400 italic">未提供</span>}
                    </pre>
                  </div>
                </div>
              </div>
            )}
            
            {isRequirementDetail && selectedRequirement && (
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {/* 需求点标题 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1">
                      需求点
                    </Badge>
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(selectedRequirement.priority || '中')}`}>
                      {selectedRequirement.priority || '中'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {selectedRequirement.title}
                  </h3>
                </div>

                {/* 描述 */}
                {selectedRequirement.description && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1">描述</Badge>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                      <pre className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words font-sans">
                        {selectedRequirement.description}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 子用例统计 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1">关联测试用例</Badge>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          P0: {selectedRequirement.children.filter((c): c is TestCase => c.type === 'testcase' && c.priority === 'P0').length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          P1: {selectedRequirement.children.filter((c): c is TestCase => c.type === 'testcase' && c.priority === 'P1').length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          P2: {selectedRequirement.children.filter((c): c is TestCase => c.type === 'testcase' && c.priority === 'P2').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!isCaseDetail && !isRequirementDetail && (
              <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">选择一个需求点或测试用例查看详情</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const isSelected = selectedCase?.id !== undefined || selectedRequirement?.id !== undefined;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <BackToHome />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* 左侧 Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 
                                flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">TestCraft</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI 生成测试用例</p>
              </div>
            </div>

            {/* 右侧按钮组 */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* 拆分需求按钮 */}
              <Button 
                className="h-10 px-4 bg-gradient-to-r from-purple-600 to-violet-600 
                           hover:from-purple-700 hover:to-violet-700 text-white rounded-xl 
                           gap-2 shadow-lg shadow-purple-500/25"
                onClick={handleAnalyze}
                disabled={analyzing || !title.trim() || !description.trim()}
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>拆分需求</span>
              </Button>
              
              {/* 生成测试用例按钮 */}
              {mindmap && reqCount > 0 && (
                <Button 
                  className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-md"
                  onClick={handleBatchGenerate}
                  disabled={generating}
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>生成测试用例</span>
                </Button>
              )}
              
              {/* 统计信息 */}
              {mindmap && (
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-slate-600 dark:text-slate-400">{reqCount} 需求点</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">{caseCount} 测试用例</span>
                  </div>
                </div>
              )}
              
              {/* 导出下拉菜单 */}
              {mindmap && caseCount > 0 && (
                <div className="relative">
                  <Button 
                    variant="outline"
                    className="h-10 px-4 gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border-0 dark:bg-slate-800"
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  >
                    <Download className="w-4 h-4" />
                    <span>导出</span>
                    <ChevronDownIcon className="w-3 h-3" />
                  </Button>
                  
                  {exportDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                        <button 
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                          onClick={exportXMind}
                        >
                          <Network className="w-4 h-4 text-violet-600" />
                          导出为 XMind
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                          onClick={exportExcel}
                        >
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          导出为 Excel
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                          onClick={exportCSV}
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          导出为 CSV
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* 清除按钮 */}
              {mindmap && (
                <Button 
                  variant="outline" 
                  className="h-10 px-4 gap-2 border-slate-200 dark:border-slate-700 rounded-xl 
                             text-slate-600 dark:text-slate-400 hover:text-red-600 
                             hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setClearingData(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>清除</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto">
          {/* 左侧表单区域 */}
          <div className="w-full lg:w-[400px] shrink-0">
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl 
                             shadow-sm overflow-hidden 
                             lg:sticky lg:top-28">
              <CardContent className="p-4 md:p-6 space-y-5">
                {/* 需求标题 */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    需求标题
                  </label>
                  <Input 
                    type="text"
                    placeholder="输入需求标题"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl 
                               hover:border-orange-400 dark:hover:border-orange-500 transition-colors 
                               text-sm text-slate-800 dark:text-slate-200"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* 所属模块 & AI 模型 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                      所属模块
                    </label>
                    <Input 
                      type="text"
                      placeholder="输入模块名称"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl 
                                 hover:border-orange-400 dark:hover:border-orange-500 transition-colors 
                                 text-sm text-slate-800 dark:text-slate-200"
                      value={module}
                      onChange={(e) => setModule(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                      AI 模型
                    </label>
                    <ModelSelector
                      groups={AI_MODEL_GROUPS}
                      value={aiModel}
                      onChange={setAiModel}
                      triggerClassName="w-full"
                    />
                  </div>
                </div>

                {/* 需求描述 */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    需求描述
                  </label>
                  <textarea
                    placeholder="详细描述你的需求，或上传文件/粘贴链接自动解析..."
                    className="min-h-[120px] w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl 
                               hover:border-orange-400 dark:hover:border-orange-500 focus:outline-none focus:border-orange-500 resize-none transition-colors text-sm
                               text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* 已解析内容预览区 */}
                {parsedContent.length > 0 && (
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 
                                  border border-orange-100 dark:border-orange-900/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <label className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                          已解析内容
                        </label>
                        <Badge variant="secondary" className="rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-xs">
                          {parsedContent.length} 个来源
                        </Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-orange-600 dark:text-orange-400 
                                                         hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                        onClick={handleMergeToDescription}>
                        <Merge className="w-3 h-3" />
                        合并
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto">
                      {parsedContent.map((p) => (
                        <div key={p.id} className="bg-white/60 dark:bg-slate-900/50 rounded-lg p-3 border border-orange-100/50 dark:border-orange-900/30">
                          <div className="flex items-center gap-2 mb-2">
                            {p.source === 'file' ? (
                              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1">{p.name}</span>
                            <span className="text-xs text-slate-400">{p.content.length} 字</span>
                            <button onClick={() => removeParsedContent(p.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-4 whitespace-pre-wrap">
                            {p.content.slice(0, 300)}{p.content.length > 300 && '...'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 上传文件 */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    上传文件
                  </label>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.html,.htm,.txt,.md" 
                    onChange={handleFileSelect}
                    multiple
                  />
                  <Button variant="outline" className="gap-2 border-slate-200 dark:border-slate-700 rounded-xl h-10 px-4 
                                                     bg-slate-50/30 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 w-full justify-start"
                    onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">添加文件（PDF/Word/HTML）</span>
                  </Button>
                </div>

                {/* 粘贴链接 */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    粘贴链接
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="输入需求文档链接..."
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl 
                                 hover:border-orange-400 dark:hover:border-orange-500 transition-colors 
                                 text-sm text-slate-800 dark:text-slate-200 h-auto"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                    />
                    <Button variant="outline" className="h-auto px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400"
                      onClick={handleFetchUrl} disabled={!linkInput.trim() || isFetchingUrl}>
                      {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : '抓取'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧预览区域 */}
          <div className="flex-1 min-w-0">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">正在分析需求...</p>
              </div>
            ) : mindmap ? (
              <div className="flex flex-col xl:flex-row gap-6">
                {/* 左侧：需求点列表 / 思维导图 */}
                <div className="flex-1 min-w-0">
                  <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* 视图切换 */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <button
                            onClick={() => setViewMode('tree')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              viewMode === 'tree'
                                ? 'bg-white dark:bg-slate-700 text-purple-600 border border-purple-300 dark:border-purple-600 shadow-sm'
                                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <LayoutList className="w-4 h-4" />
                            列表视图
                          </button>
                          <button
                            onClick={() => setViewMode('mindmap')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              viewMode === 'mindmap'
                                ? 'bg-white dark:bg-slate-700 text-purple-600 border border-purple-300 dark:border-purple-600 shadow-sm'
                                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <Network className="w-4 h-4" />
                            思维导图
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {viewMode === 'tree' && (
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className="gap-1 text-slate-600 dark:text-slate-400 h-8" onClick={expandAll}>
                                <ChevronDown className="w-3 h-3" />
                                展开
                              </Button>
                              <Button size="sm" variant="ghost" className="gap-1 text-slate-600 dark:text-slate-400 h-8" onClick={collapseAll}>
                                <ChevronRight className="w-3 h-3" />
                                折叠
                              </Button>
                            </div>
                          )}
                          {viewMode === 'mindmap' && (
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                              <button onClick={() => setScale(prev => Math.min(prev * 1.2, 2))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded">
                                <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              </button>
                              <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
                              <button onClick={() => setScale(prev => Math.max(prev * 0.8, 0.5))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded">
                                <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              </button>
                              <button onClick={resetView} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded ml-1">
                                <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              </button>
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="gap-1 h-8 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={addRequirement}>
                            <Plus className="w-4 h-4" />
                            新增需求点
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 max-h-[600px] overflow-auto">
                      {viewMode === 'tree' ? (
                        <div className="space-y-1">
                          {mindmap.children.map((child, idx) => {
                            if (child.type === 'requirement') {
                              const reqIdx = mindmap.children.filter((c: unknown) => (c as { type?: string }).type === 'requirement').indexOf(child) + 1;
                              return renderTreeNode(child, 0, 0, reqIdx);
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        /* 思维导图视图 */
                        <div 
                          ref={canvasRef}
                          className="relative overflow-hidden cursor-grab active:cursor-grabbing min-h-[500px]"
                          onWheel={handleWheel}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                        >
                          <div 
                            className="inline-block"
                            style={{
                              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                              transformOrigin: '0 0',
                            }}
                          >
                            <svg
                              width={Math.max(calculateNodePositions.totalWidth, 800)}
                              height={Math.max(calculateNodePositions.totalHeight, 500)}
                              className="overflow-visible"
                            >
                              <defs>
                                <marker
                                  id="arrowhead"
                                  markerWidth="10"
                                  markerHeight="7"
                                  refX="9"
                                  refY="3.5"
                                  orient="auto"
                                >
                                  <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
                                </marker>
                              </defs>
                              
                              {/* 连接线 */}
                              {mindmap && calculateNodePositions.positions.get(mindmap.id) && Array.from(calculateNodePositions.positions.entries()).map(([id, pos]: [string, NodePosition]) => {
                                if (id === mindmap.id) return null;
                                const parentReq = mindmap.children.find(c => 
                                  c.type === 'requirement' && 
                                  (c as RequirementNode).children.some(cc => cc.id === id)
                                );
                                if (!parentReq) return null;
                                const parentPos = calculateNodePositions.positions.get(parentReq.id);
                                if (!parentPos) return null;
                                
                                return (
                                  <path
                                    key={`line-${id}`}
                                    d={`M ${parentPos.x + parentPos.width} ${parentPos.y + parentPos.height / 2} 
                                       C ${parentPos.x + parentPos.width + MINDMAP_CONFIG.GAP_X / 2} ${parentPos.y + parentPos.height / 2},
                                         ${pos.x - MINDMAP_CONFIG.GAP_X / 2} ${pos.y + pos.height / 2},
                                         ${pos.x} ${pos.y + pos.height / 2}`}
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="2"
                                  />
                                );
                              })}
                              
                              {/* 根节点连接线 */}
                              {mindmap && calculateNodePositions.positions.get(mindmap.id) && mindmap.children.map((req) => {
                                const reqPos = calculateNodePositions.positions.get(req.id);
                                const rootPos = calculateNodePositions.positions.get(mindmap.id);
                                if (!reqPos || !rootPos) return null;
                                
                                return (
                                  <path
                                    key={`root-line-${req.id}`}
                                    d={`M ${rootPos.x + rootPos.width} ${rootPos.y + rootPos.height / 2} 
                                       C ${rootPos.x + rootPos.width + MINDMAP_CONFIG.GAP_X / 2} ${rootPos.y + rootPos.height / 2},
                                         ${reqPos.x - MINDMAP_CONFIG.GAP_X / 2} ${reqPos.y + reqPos.height / 2},
                                         ${reqPos.x} ${reqPos.y + reqPos.height / 2}`}
                                    fill="none"
                                    stroke="#fb923c"
                                    strokeWidth="2"
                                  />
                                );
                              })}
                              
                              {/* 节点 */}
                              {calculateNodePositions.positions.get(mindmap.id) && renderMindMapNode(mindmap, calculateNodePositions.positions.get(mindmap.id)!, true)}
                              {Array.from(calculateNodePositions.positions.entries()).map(([id, pos]: [string, NodePosition]) => {
                                const node = findNodeById(mindmap, id);
                                if (!node || node.type === 'root') return null;
                                return renderMindMapNode(node, pos);
                              })}
                            </svg>
                          </div>
                          
                          {/* 图例 */}
                          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 text-xs shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-orange-600" />
                                <span className="text-slate-600 dark:text-slate-400">需求</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-blue-500" />
                                <span className="text-slate-600 dark:text-slate-400">需求点</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-600" />
                                <span className="text-slate-600 dark:text-slate-400">测试用例</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* 右侧：详情面板 */}
                {isSelected && renderDetailPanel()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                    <Hourglass className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">待输入需求</h3>
                  <p className="text-slate-500 dark:text-slate-400">左侧填写需求后自动展示</p>
                </div>
            )}
          </div>
        </div>

      {/* 知识库搜索弹窗 */}
      {showKnowledgeSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Library className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">从知识库添加用例</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">搜索并选择已有的测试用例</p>
                </div>
              </div>
              <button onClick={() => setShowKnowledgeSearch(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="输入关键词搜索测试用例..."
                    value={knowledgeSearchQuery}
                    onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleKnowledgeSearch()}
                    className="pl-10 h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <Button onClick={handleKnowledgeSearch} disabled={!knowledgeSearchQuery.trim() || knowledgeSearchLoading}
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700">
                  {knowledgeSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '搜索'}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {knowledgeSearchResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    找到 {knowledgeSearchResults.length} 个相关用例
                  </div>
                  {knowledgeSearchResults.map((result) => (
                    <div 
                      key={result.id as string}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedKnowledgeCases.has(result.id as string) 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => toggleKnowledgeCaseSelection(result.id as string)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          selectedKnowledgeCases.has(result.id as string) 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {selectedKnowledgeCases.has(result.id as string) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{result.title as string}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 whitespace-pre-wrap">{result.content as string}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">输入关键词搜索知识库</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">输入测试用例相关的关键词进行搜索</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                已选择 <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedKnowledgeCases.size}</span> 个用例
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-10 rounded-xl border-slate-200 dark:border-slate-700" onClick={() => setShowKnowledgeSearch(false)}>
                  取消
                </Button>
                <Button className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700" 
                  disabled={selectedKnowledgeCases.size === 0} onClick={handleAddFromKnowledge}>
                  <Check className="w-4 h-4 mr-1" />
                  添加选中用例
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 清除确认对话框 */}
      {clearingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">清除所有数据</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">不可逆操作</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">确定要清除所有数据吗？此操作将删除：</p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                所有需求点和测试用例
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                左侧输入的表单内容
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                页面缓存数据
              </li>
            </ul>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-10 rounded-xl border-slate-200 dark:border-slate-700" onClick={() => setClearingData(false)}>
                取消
              </Button>
              <Button className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmClearAllData}>
                确认清除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
