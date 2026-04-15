'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FlaskConical, Sparkles, Upload, Link as LinkIcon,
  FileText, GitBranch, Zap, ChevronRight, ChevronDown,
  Trash2, Plus, X, Download, Loader2, Check, AlertCircle,
  Eye, Edit2, Library, Hourglass, LayoutList, Network, BookOpen,
  Paperclip, FileCheck, FileX, ChevronDown as ChevronDownIcon,
  Merge
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackToHome from '@/components/BackToHome';

// ==================== 类型定义 ====================
interface TestCase {
  id: string;
  type: 'testcase';
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  given?: string;
  when?: string;
  then?: string;
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

// ==================== 常量 ====================
const MODULES = [
  { value: '星链', label: '星链' },
  { value: 'C端APP', label: 'C端APP' },
  { value: '工作手机', label: '工作手机' },
];

const AI_MODELS = [
  { value: 'doubao-seed-2-0-pro-260215', label: '豆包 Seed 2.0 Pro（推荐）' },
  { value: 'doubao-seed-2-0-lite-260215', label: '豆包 Seed 2.0 Lite' },
  { value: 'doubao-pro-4k-240815', label: '豆包 Pro 4K' },
  { value: 'doubao-lite-4k-240815', label: '豆包 Lite 4K' },
  { value: 'deepseek-chat', label: 'DeepSeek V3.2' },
  { value: 'deepseek-v3', label: 'DeepSeek V3' },
  { value: 'glm-4-7', label: 'GLM-4.7' },
  { value: 'glm-4', label: 'GLM-4' },
];

// ==================== 工具函数 ====================
const generateId = () => Math.random().toString(36).substring(2, 11);

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  if (priority === 'P0' || priority === '高') {
    return 'bg-red-500 text-white';
  }
  if (priority === 'P1' || priority === '中') {
    return 'bg-amber-500 text-white';
  }
  if (priority === 'P2' || priority === '低') {
    return 'bg-gray-400 text-white';
  }
  return 'bg-gray-400 text-white';
};

// 获取优先级Badge样式
const getPriorityBadge = (priority: string) => {
  if (priority === 'P0' || priority === '高') {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  if (priority === 'P1' || priority === '中') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  return 'bg-gray-100 text-gray-600 border-gray-200';
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

// ==================== 主组件 ====================
export default function TestCraft() {
  // 状态
  const [title, setTitle] = useState('');
  const [module, setModule] = useState('星链');
  const [aiModel, setAiModel] = useState('doubao-seed-2-0-pro-260215');
  const [description, setDescription] = useState('');
  const [parsedContent, setParsedContent] = useState<ParsedContent[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [mindmap, setMindmap] = useState<RequirementNode | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeTitle, setEditingNodeTitle] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'mindmap'>('tree');
  const [showKnowledgeSearch, setShowKnowledgeSearch] = useState(false);
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
  const [knowledgeSearchResults, setKnowledgeSearchResults] = useState<any[]>([]);
  const [selectedKnowledgeCases, setSelectedKnowledgeCases] = useState<Set<string>>(new Set());
  const [knowledgeSearchLoading, setKnowledgeSearchLoading] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
  const [deletingNodeTitle, setDeletingNodeTitle] = useState('');
  const [deletingNodeType, setDeletingNodeType] = useState<'requirement' | 'testcase'>('testcase');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // 从localStorage恢复状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMindmap = localStorage.getItem('testcraft-mindmap');
      const savedExpanded = localStorage.getItem('testcraft-expanded');
      
      if (savedMindmap) {
        try {
          setMindmap(JSON.parse(savedMindmap));
        } catch (e) {
          console.error('Failed to parse mindmap:', e);
        }
      }
      if (savedExpanded) {
        try {
          setExpanded(new Set(JSON.parse(savedExpanded)));
        } catch (e) {
          console.error('Failed to parse expanded:', e);
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
      const setAllExpanded = (node: RequirementNode) => {
        newExpanded.add(node.id);
        node.children.forEach(child => {
          if ('type' in child && child.type === 'requirement') {
            setAllExpanded(child as RequirementNode);
          }
        });
      };
      setAllExpanded(root);
      setExpanded(newExpanded);

    } catch (error: any) {
      console.error('分析失败:', error);
      alert(error.message || '分析失败，请重试');
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

  // 生成测试用例
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

      const responseReader = response.body?.getReader();
      if (!responseReader) throw new Error('无法读取响应');

      let fullContent = '';
      
      while (true) {
        const { done, value } = await responseReader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        fullContent += text;
      }

      const testCases = parseTestCases(fullContent);
      
      await fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_type: 'testcraft',
          input_data: { requirement: reqNode.title, module, ai_model: aiModel },
          output_data: { test_cases_count: testCases.length },
          status: 'success',
        }),
      }).catch(console.error);
      
      const updateMindmap = (node: RequirementNode): RequirementNode => {
        if (node.id === reqId) {
          return {
            ...node,
            children: testCases.map((tc, idx) => ({
              id: generateId(),
              type: 'testcase' as const,
              title: tc.title,
              priority: tc.priority,
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

    } catch (error: any) {
      console.error('生成失败:', error);
      alert(error.message || '生成失败，请重试');
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
      await new Promise(resolve => setTimeout(resolve, 500));
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
  const handleDeleteNode = (parentId: string, nodeId: string, nodeTitle: string, nodeType: 'requirement' | 'testcase') => {
    setDeletingNodeId(nodeId);
    setDeletingNodeTitle(nodeTitle);
    setDeletingNodeType(nodeType);
    // 直接删除，不显示确认框
    confirmDelete();
  };

  const confirmDelete = () => {
    if (!mindmap || !deletingNodeId) return;
    
    const updateParent = (node: RequirementNode): RequirementNode => {
      if (node.id === deletingNodeId) {
        return { ...node, children: [] }; // 清空子节点即删除
      }
      return {
        ...node,
        children: node.children.filter(child => {
          if (child.id === deletingNodeId) return false;
          if ('type' in child && child.type === 'requirement') {
            const updated = updateParent(child as RequirementNode);
            return updated.children.length > 0 || updated.id !== deletingNodeId;
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
    
    setMindmap(updateParent(mindmap));
    if (selectedCase?.id === deletingNodeId) {
      setSelectedCase(null);
    }
    setDeletingNodeId(null);
  };

  const cancelDelete = () => {
    setDeletingNodeId(null);
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
      } catch (error) {
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
    } catch (error: any) {
      setParsedContent(prev => prev.filter(p => p.id !== tempId));
      alert(error.message || '链接抓取失败');
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
    setModule('星链');
    setParsedContent([]);
    setMindmap(null);
    setExpanded(new Set());
    setSelectedCase(null);
    setClearingData(false);
    
    localStorage.removeItem('testcraft-mindmap');
    localStorage.removeItem('testcraft-expanded');
  };

  // 导出功能
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
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
          (c as RequirementNode).children.some((cc: any) => cc.id === tc.id)
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

  const exportXMind = () => {
    if (!mindmap) return;
    alert('XMind导出功能开发中...');
    setExportDropdownOpen(false);
  };

  // 知识库搜索
  const handleKnowledgeSearch = () => {
    if (!knowledgeSearchQuery.trim()) return;
    setKnowledgeSearchLoading(true);
    
    // 模拟搜索结果
    setTimeout(() => {
      const mockResults = [
        { id: 'case-001', title: '用户登录功能测试', content: '前提：用户已注册账号\n操作：输入正确的用户名和密码点击登录\n预期：成功登录并跳转到首页' },
        { id: 'case-002', title: '用户登出功能测试', content: '前提：用户已登录\n操作：点击退出登录按钮\n预期：成功退出并跳转到登录页' },
        { id: 'case-003', title: '密码修改功能测试', content: '前提：用户已登录\n操作：进入设置-修改密码，输入原密码和新密码\n预期：密码修改成功，下次登录需使用新密码' },
      ].filter(r => r.title.includes(knowledgeSearchQuery));
      
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
      .filter(r => selectedKnowledgeCases.has(r.id))
      .map(r => {
        const lines = r.content.split('\n');
        return {
          id: generateId(),
          type: 'testcase' as const,
          title: r.title,
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

    return (
      <div key={node.id} className="mb-2 group">
        <div 
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer ${
            isTestCase ? 'hover:bg-gray-100' : ''
          } ${selectedCase?.id === node.id && isTestCase ? 'bg-violet-50 border border-violet-200' : ''}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => isTestCase && setSelectedCase(currentTestCase)}
        >
          {/* 展开/折叠按钮 */}
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* 图标 */}
          {isRoot && <Sparkles className="w-4 h-4 text-violet-600" />}
          {isRequirement && <GitBranch className="w-4 h-4 text-blue-500" />}
          {isTestCase && <FileText className="w-4 h-4 text-gray-400" />}

          {/* 序号 */}
          {(isRequirement || isTestCase) && (
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded min-w-[28px] text-center">
              {isTestCase ? testCaseIndex : requirementIndex}
            </span>
          )}

          {/* 标题 */}
          {isEditing ? (
            <input
              type="text"
              value={editingNodeTitle}
              onChange={(e) => setEditingNodeTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className={`flex-1 text-sm ${isRoot ? 'font-semibold text-gray-900' : isRequirement ? 'font-medium text-gray-700' : 'text-gray-600'}`}
              onDoubleClick={() => startEdit(node.id, node.title)}
            >
              {node.title}
            </span>
          )}

          {/* 优先级标签 */}
          {!isRoot && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(node.priority || 'P1')}`}>
              {node.priority || 'P1'}
            </span>
          )}

          {/* 操作按钮 */}
          {!isRoot && (
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              {isRequirement && (
                <>
                  <button title="从知识库添加" onClick={(e) => { e.stopPropagation(); setShowKnowledgeSearch(true); }}>
                    <Library className="w-3 h-3" />
                  </button>
                  <button title="生成用例" onClick={(e) => { e.stopPropagation(); handleGenerate(node.id); }}>
                    {isGeneratingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  </button>
                  <button title="编辑" onClick={(e) => { e.stopPropagation(); startEdit(node.id, node.title); }}>
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button title="删除" onClick={(e) => { e.stopPropagation(); handleDeleteNode(mindmap?.id || '', node.id, node.title, 'requirement'); }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
              {isTestCase && (
                <>
                  <button title="编辑" onClick={(e) => { e.stopPropagation(); startEdit(node.id, node.title); }}>
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button title="删除" onClick={(e) => { 
                    e.stopPropagation(); 
                    const parentReq = mindmap?.children.find(c => 
                      'type' in c && c.type === 'requirement' && 
                      (c as RequirementNode).children.some(cc => cc.id === node.id)
                    );
                    handleDeleteNode(parentReq?.id || '', node.id, node.title, 'testcase'); 
                  }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 子节点 */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {currentReq.children.map((child, idx) => {
              if (child.type === 'testcase') {
                const tcIdx = currentReq.children.filter((c: any) => c.type === 'testcase').indexOf(child) + 1;
                return renderTreeNode(child, level + 1, tcIdx, 0);
              }
              const reqIdx = currentReq.children.filter((c: any) => c.type === 'requirement').indexOf(child) + 1;
              return renderTreeNode(child, level + 1, 0, reqIdx);
            })}
          </div>
        )}
      </div>
    );
  };

  // 渲染用例详情
  const renderTestCaseDetail = () => {
    if (!selectedCase) return null;
    
    const formatContent = (text?: string) => {
      if (!text || text === '未提供前置条件') {
        return <span className="text-gray-400 italic">{text || '未提供'}</span>;
      }
      return text;
    };

    return (
      <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {/* 场景标题 */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 px-3 py-1">
              测试场景
            </Badge>
            <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(selectedCase.priority)}`}>
              {selectedCase.priority}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 leading-relaxed pr-2">
            {selectedCase.title}
          </h3>
        </div>

        {/* 分割线 */}
        <div className="border-t border-gray-100 shrink-0" />

        {/* Given - 前置条件 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 shrink-0">前置条件</Badge>
            <span className="text-xs text-gray-400">Given</span>
          </div>
          <div className="bg-emerald-50/70 rounded-xl px-4 py-3">
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words font-sans">
              {formatContent(selectedCase.given)}
            </pre>
          </div>
        </div>

        {/* When - 操作步骤 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 px-3 py-1 shrink-0">操作步骤</Badge>
            <span className="text-xs text-gray-400">When</span>
          </div>
          <div className="bg-amber-50/70 rounded-xl px-4 py-3">
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words font-sans">
              {formatContent(selectedCase.when)}
            </pre>
          </div>
        </div>

        {/* Then - 预期结果 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-rose-100 text-rose-700 px-3 py-1 shrink-0">预期结果</Badge>
            <span className="text-xs text-gray-400">Then</span>
          </div>
          <div className="bg-rose-50/70 rounded-xl px-4 py-3">
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words font-sans">
              {formatContent(selectedCase.then)}
            </pre>
          </div>
        </div>

        {/* 执行要点提示 */}
        <div className="bg-violet-50/50 rounded-xl px-4 py-3 border border-violet-100 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-violet-600">ℹ️</span>
            <span className="text-xs font-medium text-violet-700">执行要点</span>
          </div>
          <ul className="text-xs text-violet-600/80 space-y-1 pl-6 list-disc">
            <li>按 Given 准备好测试数据和环境</li>
            <li>严格按 When 步骤执行操作</li>
            <li>逐项验证 Then 中的预期结果</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <BackToHome />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* 左侧 Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 
                                flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 
                                rounded-2xl blur opacity-30 -z-10" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">TestCraft</h1>
                <p className="text-xs text-gray-500">AI 生成测试用例</p>
              </div>
            </div>

            {/* 右侧按钮组 */}
            <div className="flex items-center gap-3">
              {/* 拆分需求按钮 */}
              <Button 
                className="h-10 px-4 bg-gradient-to-r from-violet-600 to-purple-600 
                           hover:from-violet-700 hover:to-purple-700 text-white rounded-xl 
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
                  className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
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
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    <span>{reqCount} 需求点</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{caseCount} 测试用例</span>
                  </div>
                </div>
              )}
              
              {/* 导出下拉菜单 */}
              {mindmap && caseCount > 0 && (
                <div className="relative">
                  <Button 
                    variant="outline"
                    className="h-10 px-4 gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl border-0"
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  >
                    <Download className="w-4 h-4" />
                    <span>导出</span>
                    <ChevronDownIcon className="w-3 h-3" />
                  </Button>
                  
                  {exportDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                        <button 
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          onClick={exportXMind}
                        >
                          导出为 XMind
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          onClick={exportExcel}
                        >
                          导出为 Excel
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          onClick={exportCSV}
                        >
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
                  className="h-10 px-4 gap-2 border-gray-200 rounded-xl 
                             text-gray-600 hover:text-red-600 
                             hover:border-red-200 hover:bg-red-50"
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

      {/* 主内容区 - Flex布局 */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto">
        {/* 左侧表单区域 - 固定宽度380px */}
        <div className="w-full lg:w-[380px] shrink-0">
          <Card className="bg-white border border-gray-200/80 rounded-2xl 
                           shadow-sm shadow-gray-200/50 overflow-hidden 
                           lg:sticky lg:top-28">
            <CardContent className="p-4 md:p-6 space-y-6">
              {/* 需求标题 */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                  需求标题
                </label>
                <Input 
                  type="text"
                  placeholder="输入需求标题"
                  className="h-11 bg-gray-50/50 border-gray-200 rounded-xl 
                             focus:bg-white transition-colors 
                             text-lg font-medium text-gray-900"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* 所属模块 & AI 模型 */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                    所属模块
                  </label>
                  <Select value={module} onValueChange={setModule}>
                    <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODULES.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                    AI 模型
                  </label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 需求描述 */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                  需求描述
                </label>
                <textarea
                  placeholder="详细描述你的需求，或上传文件/粘贴链接自动解析..."
                  className="min-h-[120px] w-full px-4 py-3 bg-gray-50/50 border-gray-200 rounded-xl 
                             focus:bg-white resize-none transition-colors text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* 已解析内容预览区 */}
              {parsedContent.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 
                                border border-violet-100 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <label className="text-xs font-medium text-violet-700 uppercase tracking-wider">
                        已解析内容
                      </label>
                      <Badge variant="secondary" className="rounded-full bg-violet-100 text-violet-700 text-xs">
                        {parsedContent.length} 个来源
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-violet-600 
                                                       hover:text-violet-700 hover:bg-violet-100"
                      onClick={handleMergeToDescription}>
                      <Merge className="w-3 h-3" />
                      合并到需求描述
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {parsedContent.map((p) => (
                      <div key={p.id} className="bg-white/60 rounded-lg p-3 border border-violet-100/50">
                        <div className="flex items-center gap-2 mb-2">
                          {p.source === 'file' ? (
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span className="text-sm font-medium text-gray-700 truncate flex-1">{p.name}</span>
                          <span className="text-xs text-gray-400">{p.content.length} 字</span>
                          <button onClick={() => removeParsedContent(p.id)}>
                            <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-4 whitespace-pre-wrap">
                          {p.content.slice(0, 500)}{p.content.length > 500 && '...'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 上传文件 */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                  上传文件
                </label>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.html,.htm,.txt,.md,image/*" 
                  onChange={handleFileSelect}
                  multiple
                />
                <Button variant="outline" className="gap-2 border-gray-200 rounded-xl h-10 px-4 
                                                   bg-gray-50/30 hover:bg-gray-100 w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">添加文件（PDF/Word/HTML）</span>
                </Button>
              </div>

              {/* 粘贴链接 */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                  粘贴链接
                </label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="输入需求文档链接地址..."
                    className="h-10 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white flex-1"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                  />
                  <Button variant="outline" className="h-10 px-4 rounded-xl border-gray-200 hover:bg-gray-100"
                    onClick={handleFetchUrl} disabled={!linkInput.trim() || isFetchingUrl}>
                    {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : '抓取'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 min-w-0">
          {analyzing ? (
            /* 加载状态 */
            <div className="flex flex-col items-center justify-center min-h-[500px]">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-3" />
              <p className="text-gray-500">正在分析需求...</p>
            </div>
          ) : mindmap ? (
            <div className="flex flex-col xl:flex-row gap-6">
              {/* 左侧：需求点列表 / 思维导图 */}
              <div className="flex-1 min-w-0">
                <Card className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      {/* 视图切换 */}
                      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                        <button
                          onClick={() => setViewMode('tree')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            viewMode === 'tree'
                              ? 'bg-white text-violet-700 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <LayoutList className="w-4 h-4" />
                          列表视图
                        </button>
                        <button
                          onClick={() => setViewMode('mindmap')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            viewMode === 'mindmap'
                              ? 'bg-white text-violet-700 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Network className="w-4 h-4" />
                          思维导图
                        </button>
                      </div>
                      
                      <Button size="sm" variant="ghost" className="gap-1 text-violet-600" onClick={addRequirement}>
                        <Plus className="w-4 h-4" />
                        添加需求点
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                    {viewMode === 'tree' ? (
                      <div className="space-y-1">
                        {mindmap.children.map((child, idx) => {
                          if (child.type === 'requirement') {
                            const reqIdx = mindmap.children.filter((c: any) => c.type === 'requirement').indexOf(child) + 1;
                            return renderTreeNode(child, 0, 0, reqIdx);
                          }
                          return null;
                        })}
                      </div>
                    ) : (
                      /* 思维导图视图 - 简化版 */
                      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
                        <div className="text-center">
                          <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>思维导图视图开发中...</p>
                          <p className="text-xs mt-1">敬请期待</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* 右侧：用例详情 */}
              <div className="xl:w-[520px] shrink-0">
                <Card className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden lg:sticky lg:top-28">
                  <CardContent className="p-4">
                    {selectedCase ? (
                      <>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-700">用例详情</span>
                          <button onClick={() => setSelectedCase(null)}>
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        {renderTestCaseDetail()}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">点击左侧用例查看详情</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* 空状态 */
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Hourglass className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">待输入需求</h3>
              <p className="text-gray-400">左侧填写需求后自动展示</p>
            </div>
          )}
        </div>
      </div>

      {/* 知识库搜索弹窗 */}
      {showKnowledgeSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Library className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">从知识库添加用例</h3>
                  <p className="text-xs text-gray-500">搜索并选择已有的测试用例</p>
                </div>
              </div>
              <button onClick={() => setShowKnowledgeSearch(false)} className="w-8 h-8 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="输入关键词搜索测试用例..."
                    value={knowledgeSearchQuery}
                    onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleKnowledgeSearch()}
                    className="pl-10 h-10"
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
                  <div className="text-sm text-gray-500 mb-3">
                    找到 {knowledgeSearchResults.length} 个相关用例：
                  </div>
                  {knowledgeSearchResults.map((result) => (
                    <div 
                      key={result.id}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedKnowledgeCases.has(result.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => toggleKnowledgeCaseSelection(result.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          selectedKnowledgeCases.has(result.id) 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedKnowledgeCases.has(result.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{result.title}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2 whitespace-pre-wrap">{result.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">输入关键词搜索知识库</p>
                  <p className="text-xs text-gray-400 mt-1">输入测试用例相关的关键词进行搜索</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-500">
                已选择 <span className="font-semibold text-blue-600">{selectedKnowledgeCases.size}</span> 个用例
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-10 rounded-xl" onClick={() => setShowKnowledgeSearch(false)}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">清除所有数据</h3>
                <p className="text-sm text-gray-500">不可逆操作</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">确定要清除所有数据吗？此操作将删除：</p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                所有需求点和测试用例
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                左侧输入的表单内容
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                页面缓存数据
              </li>
            </ul>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-10 rounded-xl" onClick={() => setClearingData(false)}>
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
