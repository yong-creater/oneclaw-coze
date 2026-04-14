'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FlaskConical, Sparkles, ArrowLeft, Upload, Link, 
  FileText, GitBranch, Zap, ChevronRight, ChevronDown,
  Trash2, Plus, X, Download, Loader2, Check, AlertCircle,
  Eye, Edit3, Save, Copy, FileSpreadsheet
} from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import * as XLSX from 'xlsx';

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
  priority?: 'P0' | 'P1' | 'P2';
  children: (RequirementNode | TestCase)[];
  given?: string;
  when?: string;
  then?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link';
  content?: string;
  parsed?: boolean;
  parsing?: boolean;
  url?: string;
}

interface ExpandedState {
  [key: string]: boolean;
}

// ==================== 常量 ====================
const MODULES = [
  { value: '', label: '请选择模块（可选）' },
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
  { value: 'glm-4', label: 'GLM-4' },
];

const PRIORITY_COLORS = {
  P0: 'bg-red-100 text-red-700 border-red-200',
  P1: 'bg-amber-100 text-amber-700 border-amber-200',
  P2: 'bg-gray-100 text-gray-600 border-gray-200',
};

const PRIORITY_BG_COLORS = {
  P0: 'bg-red-50 border-red-200',
  P1: 'bg-amber-50 border-amber-200',
  P2: 'bg-gray-50 border-gray-200',
};

// ==================== 工具函数 ====================
const generateId = () => Math.random().toString(36).substring(2, 11);

const getNodeIcon = (type: 'root' | 'requirement' | 'testcase') => {
  switch (type) {
    case 'root': return <Sparkles className="w-4 h-4 text-violet-500" />;
    case 'requirement': return <GitBranch className="w-4 h-4 text-fuchsia-500" />;
    case 'testcase': return <FileText className="w-4 h-4 text-blue-500" />;
  }
};

const countTestCases = (node: RequirementNode): number => {
  let count = 0;
  const traverse = (n: RequirementNode | TestCase) => {
    if ('type' in n && n.type === 'testcase') {
      count++;
    } else if ('children' in n) {
      n.children.forEach(traverse);
    }
  };
  node.children.forEach(traverse);
  return count;
};

const getAllTestCases = (node: RequirementNode): TestCase[] => {
  const cases: TestCase[] = [];
  const traverse = (n: RequirementNode | TestCase) => {
    if ('type' in n && n.type === 'testcase') {
      cases.push(n as TestCase);
    } else if ('children' in n) {
      n.children.forEach(traverse);
    }
  };
  node.children.forEach(traverse);
  return cases;
};

// ==================== 主组件 ====================
export default function TestCraft() {
  // 状态
  const [title, setTitle] = useState('');
  const [module, setModule] = useState('');
  const [aiModel, setAiModel] = useState('doubao-seed-2-0-pro-260215');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [mindmap, setMindmap] = useState<RequirementNode | null>(null);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
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
          setExpanded(JSON.parse(savedExpanded));
        } catch (e) {
          console.error('Failed to parse expanded:', e);
        }
      }
    }
  }, []);

  // 保存到localStorage
  const saveToStorage = useCallback(() => {
    if (mindmap && typeof window !== 'undefined') {
      localStorage.setItem('testcraft-mindmap', JSON.stringify(mindmap));
      localStorage.setItem('testcraft-expanded', JSON.stringify(expanded));
    }
  }, [mindmap, expanded]);

  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  // 合并所有内容
  const getMergedContent = (): string => {
    let content = description;
    
    attachments.forEach(att => {
      if (att.content) {
        content += `\n\n[${att.name}]\n${att.content}`;
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

      // 解析返回的需求点
      const requirements = parseRequirements(data.content);
      
      // 构建思维导图
      const root: RequirementNode = {
        id: generateId(),
        type: 'root',
        title,
        children: requirements.map((req, idx) => ({
          id: generateId(),
          type: 'requirement' as const,
          title: req.title,
          description: req.description,
          priority: (['P0', 'P1', 'P2'][idx % 3] || 'P1') as 'P0' | 'P1' | 'P2',
          children: [],
        })),
      };

      setMindmap(root);
      
      // 展开所有节点
      const newExpanded: ExpandedState = {};
      const setAllExpanded = (node: RequirementNode) => {
        newExpanded[node.id] = true;
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
    
    // 尝试多种分隔符
    const lines = content.split('\n');
    let currentReq: { title: string; description: string } | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 检测需求点标题
      if (/^[\d]+[.、]/.test(trimmed) || /^(需求|功能|模块)[：:]/.test(trimmed)) {
        if (currentReq) {
          requirements.push(currentReq);
        }
        currentReq = {
          title: trimmed.replace(/^[\d]+[.、]\s*/, '').replace(/^(需求|功能|模块)[：:]\s*/, ''),
          description: '',
        };
      } else if (currentReq && trimmed) {
        currentReq.description += (currentReq.description ? '\n' : '') + trimmed;
      }
    }
    
    if (currentReq) {
      requirements.push(currentReq);
    }
    
    // 如果没有解析出需求点，创建一个默认的
    if (requirements.length === 0) {
      requirements.push({
        title: '需求点 1',
        description: content.substring(0, 500),
      });
    }
    
    return requirements.slice(0, 10); // 最多10个需求点
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

      // 解析测试用例
      const testCases = parseTestCases(fullContent);
      
      // 更新mindmap
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

      const currentMindmap = mindmap;
      if (currentMindmap) {
        setMindmap(updateMindmap(currentMindmap));
      }

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
      await new Promise(resolve => setTimeout(resolve, 500)); // 间隔500ms
    }
    
    setGenerating(false);
  };

  // 解析测试用例
  const parseTestCases = (content: string): Omit<TestCase, 'id'>[] => {
    const cases: Omit<TestCase, 'id'>[] = [];
    
    // 按分隔符分割
    const parts = content.split(/===CASE_SEPARATOR===|用例\d+[.、]/).filter(p => p.trim());
    
    for (let i = 0; i < parts.length && i < 10; i++) {
      const part = parts[i];
      
      // 提取标题
      const titleMatch = part.match(/【用例标题】[:：]\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : `用例 ${i + 1}`;
      
      // 提取优先级
      const priorityMatch = part.match(/【优先级】[:：]\s*(P\d+)/);
      const priority = (priorityMatch ? priorityMatch[1] : i < 2 ? 'P0' : i < 5 ? 'P1' : 'P2') as 'P0' | 'P1' | 'P2';
      
      // 提取Given/When/Then
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
    
    // 如果没有解析出用例，创建一个默认的
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
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 添加需求点
  const addRequirement = () => {
    if (!mindmap) return;
    
    const newReq: RequirementNode = {
      id: generateId(),
      type: 'requirement',
      title: `需求点 ${mindmap.children.length + 1}`,
      priority: 'P1',
      children: [],
    };
    
    setMindmap({
      ...mindmap,
      children: [...mindmap.children, newReq],
    });
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
        return {
          ...node,
          children: [...node.children, newCase],
        };
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

  // 删除节点
  const deleteNode = (parentId: string, nodeId: string) => {
    if (!mindmap) return;
    if (!confirm('确定要删除吗？')) return;
    
    const updateParent = (node: RequirementNode): RequirementNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: node.children.filter(child => child.id !== nodeId),
        };
      }
      return {
        ...node,
        children: node.children.map(child => {
          if ('type' in child && child.type === 'requirement') {
            return updateParent(child as RequirementNode);
          }
          return child;
        }),
      };
    };
    
    setMindmap(updateParent(mindmap));
    if (selectedCase?.id === nodeId) {
      setSelectedCase(null);
    }
  };

  // 编辑节点
  const startEdit = (id: string, currentTitle: string) => {
    setEditingNode(id);
    setEditValue(currentTitle);
  };

  const saveEdit = (parentId: string, nodeId: string) => {
    if (!mindmap) return;
    
    const updateTitle = (node: RequirementNode): RequirementNode => {
      if (node.id === nodeId) {
        return { ...node, title: editValue };
      }
      return {
        ...node,
        children: node.children.map(child => {
          if (child.id === nodeId) {
            return { ...child, title: editValue };
          }
          if ('type' in child && child.type === 'requirement') {
            return updateTitle(child as RequirementNode);
          }
          return child;
        }),
      };
    };
    
    setMindmap(updateTitle(mindmap));
    setEditingNode(null);
  };

  // 文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const tempId = generateId();
    const newAtt: Attachment = {
      id: tempId,
      name: file.name,
      type: 'file',
      parsing: true,
    };
    
    setAttachments(prev => [...prev, newAtt]);
    
    try {
      // 简单读取文件内容（实际应调用API解析）
      const text = await file.text();
      
      setAttachments(prev => prev.map(att => 
        att.id === tempId 
          ? { ...att, content: text.substring(0, 5000), parsed: true, parsing: false }
          : att
      ));
    } catch (error) {
      setAttachments(prev => prev.filter(att => att.id !== tempId));
      alert('文件读取失败');
    }
  };

  // 链接抓取
  const handleLinkFetch = async () => {
    const url = linkInputRef.current?.value?.trim();
    if (!url) return;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('请输入以 http:// 或 https:// 开头的链接');
      return;
    }
    
    const tempId = generateId();
    const newAtt: Attachment = {
      id: tempId,
      name: url,
      type: 'link',
      url,
      parsing: true,
    };
    
    setAttachments(prev => [...prev, newAtt]);
    
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAttachments(prev => prev.map(att =>
          att.id === tempId
            ? { ...att, content: data.data.content?.substring(0, 5000), parsed: true, parsing: false }
            : att
        ));
      } else {
        throw new Error(data.error || '抓取失败');
      }
    } catch (error: any) {
      setAttachments(prev => prev.filter(att => att.id !== tempId));
      alert(error.message || '链接抓取失败');
    } finally {
      if (linkInputRef.current) linkInputRef.current.value = '';
    }
  };

  // 删除附件
  const deleteAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // 合并到描述
  const mergeToDescription = () => {
    const merged = attachments
      .filter(att => att.content)
      .map(att => `[${att.name}]\n${att.content}`)
      .join('\n\n---\n\n');
    
    setDescription(prev => (prev ? prev + '\n\n---\n\n' : '') + merged);
  };

  // 清除所有数据
  const handleClear = () => {
    if (!confirm('确定要清除所有数据吗？')) return;
    
    setTitle('');
    setDescription('');
    setModule('');
    setAttachments([]);
    setMindmap(null);
    setExpanded({});
    setSelectedCase(null);
    
    localStorage.removeItem('testcraft-mindmap');
    localStorage.removeItem('testcraft-expanded');
  };

  // 导出CSV
  const exportCSV = () => {
    if (!mindmap) return;
    
    const cases = getAllTestCases(mindmap);
    if (cases.length === 0) {
      alert('没有可导出的测试用例');
      return;
    }
    
    const rows = [
      ['类型', '标题', '优先级', '前置条件', '操作步骤', '预期结果'],
      ...cases.map(tc => [
        '用例',
        tc.title,
        tc.priority || 'P1',
        tc.given || '',
        tc.when || '',
        tc.then || '',
      ]),
    ];
    
    const csv = rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadFile(csv, `测试用例_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  // 导出Excel
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
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 8 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
    ];
    
    XLSX.writeFile(wb, `测试用例_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 导出XMind
  const exportXMind = () => {
    if (!mindmap) return;
    
    const cases = getAllTestCases(mindmap);
    if (cases.length === 0) {
      alert('没有可导出的测试用例');
      return;
    }
    
    // 生成XMind 8格式的XML
    const xmlContent = generateXMindXML(mindmap, cases);
    downloadFile(xmlContent, `测试用例_${new Date().toISOString().split('T')[0]}.xml`, 'application/xml');
  };

  // 生成XMind XML
  const generateXMindXML = (root: RequirementNode, cases: TestCase[]): string => {
    const escapeMap: Record<string, string> = {
      '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
    };
    const escapeXml = (str: string) => {
      let result = '';
      for (const char of str) {
        result += escapeMap[char] || char;
      }
      return result;
    };
    
    const priorityColor = (p: string) => ({
      P0: '#FF6B6B', P1: '#FFE066', P2: '#95DE64'
    })[p] || '#95DE64';
    
    const reqNodes = root.children
      .filter(c => 'type' in c && c.type === 'requirement')
      .map(c => c as RequirementNode);
    
    const reqXml = reqNodes.map(req => {
      const reqCases = cases.filter((_, idx) => {
        // 简单分配：平均分配到各个需求点
        return true;
      });
      
      const caseXml = reqCases.map(tc => `
        <topic ID="tc_${tc.id}" GUID="${tc.id}" modified-by="TestCraft" created-by="TestCraft">
          <title>${escapeXml(tc.title)}</title>
          <notes>
            <plain>【Given】${escapeXml(tc.given || '')}
【When】${escapeXml(tc.when || '')}
【Then】${escapeXml(tc.then || '')}</plain>
          </notes>
          <marker-refs>
            <marker-ref ID="marker_${tc.priority}" marker-id="${tc.priority}"/>
          </marker-refs>
        </topic>
      `).join('');
      
      return `
        <topic ID="req_${req.id}" GUID="${req.id}" modified-by="TestCraft" created-by="TestCraft">
          <title>${escapeXml(req.title)}</title>
          <marker-refs>
            <marker-ref ID="marker_${req.priority}" marker-id="${req.priority}"/>
          </marker-refs>
          ${caseXml}
        </topic>
      `;
    }).join('');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
< xmap xmlns="urn:xmind:xmap:xmlns:2.0" xmlns:content="urn:xmind:xmap:xmlns:content:2.0" xmlns:attachment="urn:xmind:xmap:xmlns:attachment:2.0" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:markers="urn:xmind:xmap:xmlns:markers:2.0" version="2.0">
  <metadata>
    <content>
      <title>${escapeXml(root.title)}</title>
      <description>Generated by TestCraft</description>
    </content>
  </metadata>
  <content>
    <sheet>
      <title>测试用例</title>
      <topic ID="root" GUID="${root.id}" modified-by="TestCraft" created-by="TestCraft">
        <title>${escapeXml(root.title)}</title>
        <markers>
          <marker ID="marker_P0" marker-id="P0"/>
          <marker ID="marker_P1" marker-id="P1"/>
          <marker ID="marker_P2" marker-id="P2"/>
        </markers>
        ${reqXml}
      </topic>
    </sheet>
  </content>
</xmap>`;
  };

  // 下载文件
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 计算统计
  const reqCount = mindmap?.children.length || 0;
  const caseCount = mindmap ? countTestCases(mindmap) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1 text-slate-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">返回</span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 hidden sm:inline">OneClaw</span>
            </div>
            
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-700">TestCraft</span>
              <span className="text-xs text-slate-400 hidden sm:inline">AI 生成测试用例</span>
            </div>
          </div>
          
          <LoginButton />
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：需求输入 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Header操作区 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !title.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>拆分需求</span>
                </button>
                
                {mindmap && (
                  <>
                    <button
                      onClick={handleBatchGenerate}
                      disabled={generating}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      {generating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      <span>一键生成</span>
                    </button>
                    
                    <div className="flex items-center gap-3 ml-auto text-sm">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        {reqCount} 需求点
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {caseCount} 用例
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* 需求输入表单 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">需求输入</h2>
              
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  需求标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入需求标题"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              
              {/* 模块 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">所属模块</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  {MODULES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              
              {/* AI模型 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">AI 模型</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  {AI_MODELS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              
              {/* 需求描述 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">需求描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="详细描述需求内容..."
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>
              
              {/* 附件列表 */}
              {attachments.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      已解析内容 ({attachments.length})
                    </span>
                    <button
                      onClick={mergeToDescription}
                      className="text-xs text-violet-600 hover:text-violet-700"
                    >
                      合并到描述
                    </button>
                  </div>
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      {att.type === 'file' ? (
                        <FileText className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Link className="w-4 h-4 text-green-500" />
                      )}
                      <span className="flex-1 text-sm truncate">{att.name}</span>
                      {att.parsing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : att.parsed ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : null}
                      <button
                        onClick={() => deleteAttachment(att.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 文件上传 */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">上传文件</span>
                </button>
                
                <div className="flex-1 flex gap-2">
                  <input
                    ref={linkInputRef}
                    type="text"
                    placeholder="输入链接抓取内容"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleLinkFetch}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors"
                  >
                    <Link className="w-4 h-4" />
                    <span className="text-sm">抓取</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 导出按钮 */}
            {mindmap && caseCount > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">CSV</span>
                  </button>
                  <button
                    onClick={exportExcel}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-sm">Excel</span>
                  </button>
                  <button
                    onClick={exportXMind}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span className="text-sm">XMind</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="ml-auto flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">清除</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 右侧：思维导图和用例详情 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 思维导图 */}
            {mindmap && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      <span className="font-semibold text-slate-800">{mindmap.title}</span>
                    </div>
                    <button
                      onClick={addRequirement}
                      className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
                    >
                      <Plus className="w-4 h-4" />
                      添加需求点
                    </button>
                  </div>
                </div>
                
                <div className="p-6 max-h-[500px] overflow-y-auto">
                  <div className="space-y-2">
                    {mindmap.children.map((req, reqIdx) => {
                      const reqNode = req as RequirementNode;
                      const isExpanded = expanded[reqNode.id];
                      const hasCases = reqNode.children.length > 0;
                      
                      return (
                        <div key={reqNode.id} className="space-y-1">
                          {/* 需求点行 */}
                          <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 group">
                            <button
                              onClick={() => toggleExpand(reqNode.id)}
                              className="w-5 h-5 flex items-center justify-center text-slate-400"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            
                            <span className="text-sm text-slate-500 w-6">{reqIdx + 1}.</span>
                            {getNodeIcon(reqNode.type)}
                            
                            {editingNode === reqNode.id ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => saveEdit(mindmap.id, reqNode.id)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(mindmap.id, reqNode.id)}
                                className="flex-1 px-2 py-1 border border-violet-300 rounded focus:ring-2 focus:ring-violet-500"
                                autoFocus
                              />
                            ) : (
                              <span
                                className="flex-1 text-sm text-slate-700 cursor-pointer"
                                onDoubleClick={() => startEdit(reqNode.id, reqNode.title)}
                              >
                                {reqNode.title}
                              </span>
                            )}
                            
                            <span className={`px-2 py-0.5 text-xs rounded border ${PRIORITY_COLORS[reqNode.priority || 'P1']}`}>
                              {reqNode.priority || 'P1'}
                            </span>
                            
                            {!hasCases && (
                              <button
                                onClick={() => handleGenerate(reqNode.id)}
                                disabled={generatingId === reqNode.id}
                                className="opacity-0 group-hover:opacity-100 p-1 text-amber-500 hover:text-amber-600 transition-opacity"
                                title="生成用例"
                              >
                                {generatingId === reqNode.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Zap className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            
                            <button
                              onClick={() => addTestCase(reqNode.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-blue-500 hover:text-blue-600 transition-opacity"
                              title="添加用例"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => deleteNode(mindmap.id, reqNode.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 transition-opacity"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* 用例列表 */}
                          {isExpanded && reqNode.children.length > 0 && (
                            <div className="ml-10 space-y-1">
                              {reqNode.children.map((tc, caseIdx) => {
                                const testCase = tc as TestCase;
                                const isSelected = selectedCase?.id === testCase.id;
                                
                                return (
                                  <div
                                    key={testCase.id}
                                    onClick={() => setSelectedCase(testCase)}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                      isSelected ? 'bg-violet-50 border border-violet-200' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="text-sm text-slate-400 w-8">
                                      {reqIdx + 1}.{caseIdx + 1}
                                    </span>
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span className="flex-1 text-sm text-slate-600 truncate">
                                      {testCase.title}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded ${PRIORITY_COLORS[testCase.priority || 'P1']}`}>
                                      {testCase.priority || 'P1'}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNode(reqNode.id, testCase.id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* 用例详情 */}
            {selectedCase && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-slate-800">{selectedCase.title}</span>
                    <span className={`px-2 py-0.5 text-xs rounded border ${PRIORITY_COLORS[selectedCase.priority || 'P1']}`}>
                      {selectedCase.priority || 'P1'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Given */}
                  {selectedCase.given && (
                    <div className={`p-4 rounded-xl border ${selectedCase.priority === 'P0' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-emerald-700">前提条件</span>
                        <span className="text-xs text-emerald-500">Given</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedCase.given}</p>
                    </div>
                  )}
                  
                  {/* When */}
                  {selectedCase.when && (
                    <div className="p-4 rounded-xl border bg-amber-50 border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-amber-700">操作步骤</span>
                        <span className="text-xs text-amber-500">When</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedCase.when}</p>
                    </div>
                  )}
                  
                  {/* Then */}
                  {selectedCase.then && (
                    <div className="p-4 rounded-xl border bg-rose-50 border-rose-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-rose-700">预期结果</span>
                        <span className="text-xs text-rose-500">Then</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedCase.then}</p>
                    </div>
                  )}
                  
                  {/* 执行要点 */}
                  <div className="p-4 rounded-xl border bg-violet-50 border-violet-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-violet-700">执行要点</span>
                      <span className="text-xs text-violet-500">Tips</span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>按 Given 准备好测试数据和环境</li>
                      <li>严格按 When 步骤执行操作</li>
                      <li>逐项验证 Then 中的预期结果</li>
                    </ul>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        const text = `【用例标题】${selectedCase.title}\n【优先级】${selectedCase.priority || 'P1'}\n【Given】${selectedCase.given || ''}\n【When】${selectedCase.when || ''}\n【Then】${selectedCase.then || ''}`;
                        navigator.clipboard.writeText(text);
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">复制用例</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 空状态 */}
            {!mindmap && (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">开始创建测试用例</h3>
                <p className="text-sm text-slate-400 mb-6">
                  填写需求信息，点击「拆分需求」开始 AI 智能分析
                </p>
                <div className="flex justify-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>支持文件上传</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    <span>支持链接抓取</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>多格式导出</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
