'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Search, Sparkles, Wand2, BookOpen, MessageSquare,
  Video, Image as ImageIcon, FileText, Code2, Mic,
  ArrowRight, Loader2, Bot, Send, Star, Globe, Briefcase,
  GraduationCap, TrendingUp, Music, Play, Users
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: 'redirect' | 'suggest';
    target?: string;
    label?: string;
  };
}

const QUICK_ACTIONS = [
  { icon: Video, label: '视频生成工具', query: '视频生成', color: 'bg-purple-500/10 text-purple-600' },
  { icon: ImageIcon, label: 'AI绘画工具', query: 'AI绘画', color: 'bg-pink-500/10 text-pink-600' },
  { icon: MessageSquare, label: 'AI聊天工具', query: 'AI聊天', color: 'bg-blue-500/10 text-blue-600' },
  { icon: FileText, label: 'AI写作工具', query: 'AI写作', color: 'bg-green-500/10 text-green-600' },
  { icon: Code2, label: 'AI编程工具', query: 'AI编程', color: 'bg-orange-500/10 text-orange-600' },
  { icon: Mic, label: 'AI配音工具', query: 'AI配音', color: 'bg-red-500/10 text-red-600' },
  { icon: Users, label: '数字人工具', query: '数字人', color: 'bg-cyan-500/10 text-cyan-600' },
  { icon: Music, label: 'AI音频工具', query: 'AI音频', color: 'bg-indigo-500/10 text-indigo-600' },
  { icon: BookOpen, label: 'AI教程', query: '教程', color: 'bg-amber-500/10 text-amber-600' },
  { icon: Sparkles, label: '提示词库', query: '提示词', color: 'bg-emerald-500/10 text-emerald-600' },
];

// 意图识别
function analyzeIntent(message: string): { type: 'tools' | 'prompts' | 'tutorials' | 'own-tools'; query?: string } {
  const msg = message.toLowerCase();

  // 自建工具
  if (msg.includes('简历') || msg.includes('优化简历')) {
    return { type: 'own-tools', query: 'resume' };
  }
  if (msg.includes('小说') || msg.includes('创作小说')) {
    return { type: 'own-tools', query: 'novel' };
  }
  if (msg.includes('出海') || msg.includes('详情页') || msg.includes('电商')) {
    return { type: 'own-tools', query: 'overseas' };
  }
  if (msg.includes('证件照') || msg.includes('证件照')) {
    return { type: 'own-tools', query: 'photo-id' };
  }

  // 教程
  if (msg.includes('教程') || msg.includes('怎么用') || msg.includes('如何使用') || msg.includes('学习')) {
    return { type: 'tutorials' };
  }

  // 提示词
  if (msg.includes('提示词') || msg.includes('prompt')) {
    return { type: 'prompts' };
  }

  // 工具类别
  if (msg.includes('视频') || msg.includes('sora') || msg.includes('runway') || msg.includes('可灵')) {
    return { type: 'tools', query: '视频生成' };
  }
  if (msg.includes('数字人') || msg.includes('heygen') || msg.includes('d-id')) {
    return { type: 'tools', query: '数字人' };
  }
  if (msg.includes('绘画') || msg.includes('midjourney') || msg.includes('dall')) {
    return { type: 'tools', query: 'AI绘画' };
  }
  if (msg.includes('聊天') || msg.includes('chatgpt') || msg.includes('claude') || msg.includes('kimi')) {
    return { type: 'tools', query: 'AI聊天' };
  }
  if (msg.includes('写作') || msg.includes('文案') || msg.includes('notion')) {
    return { type: 'tools', query: 'AI写作' };
  }
  if (msg.includes('编程') || msg.includes('代码') || msg.includes('copilot') || msg.includes('cursor')) {
    return { type: 'tools', query: 'AI编程' };
  }
  if (msg.includes('配音') || msg.includes('语音') || msg.includes('tts')) {
    return { type: 'tools', query: 'AI配音' };
  }
  if (msg.includes('音频') || msg.includes('音乐') || msg.includes('suno')) {
    return { type: 'tools', query: 'AI音频' };
  }
  if (msg.includes('办公') || msg.includes('ppt') || msg.includes('文档')) {
    return { type: 'tools', query: 'AI办公' };
  }
  if (msg.includes('搜索')) {
    return { type: 'tools', query: 'AI搜索' };
  }
  if (msg.includes('营销')) {
    return { type: 'tools', query: 'AI营销' };
  }

  // 默认搜索工具
  return { type: 'tools', query: message };
}

// 精选工具数据
const FEATURED_TOOLS = [
  {
    id: 'resume',
    name: '简历优化',
    desc: 'AI智能优化简历，提升求职竞争力',
    icon: FileText,
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    iconColor: 'text-orange-500'
  },
  {
    id: 'novel',
    name: '小说创作',
    desc: 'AI辅助小说创作，激发无限灵感',
    icon: BookOpen,
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-500'
  },
  {
    id: 'overseas',
    name: '出海详情页',
    desc: '一键生成跨境电商产品详情页',
    icon: Globe,
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-500'
  },
  {
    id: 'photo-id',
    name: 'AI证件照',
    desc: '上传照片智能抠图生成合规证件照',
    icon: ImageIcon,
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-500'
  },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理发送
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // 模拟AI思考
    await new Promise(resolve => setTimeout(resolve, 800));

    // 意图分析
    const intent = analyzeIntent(userMessage);

    let responseText = '';
    let redirectUrl = '/';

    switch (intent.type) {
      case 'own-tools':
        if (intent.query === 'resume') {
          responseText = '好的，正在为您打开简历优化工具...';
          redirectUrl = '/resume';
        } else if (intent.query === 'novel') {
          responseText = '好的，正在为您打开小说创作工具...';
          redirectUrl = '/novel';
        } else if (intent.query === 'overseas') {
          responseText = '好的，正在为您打开出海详情页生成工具...';
          redirectUrl = '/productpage';
        } else if (intent.query === 'photo-id') {
          responseText = '好的，正在为您打开AI证件照工具...';
          redirectUrl = '/photo-id';
        }
        break;
      case 'prompts':
        responseText = '好的，正在为您打开提示词库...';
        redirectUrl = '/?tab=prompts';
        break;
      case 'tutorials':
        responseText = '好的，正在为您打开教程中心...';
        redirectUrl = '/?tab=tutorials';
        break;
      case 'tools':
        responseText = `好的，正在为您搜索「${intent.query}」相关的AI工具...`;
        redirectUrl = `/?tab=ai-tools&category=${encodeURIComponent(intent.query || '')}`;
        break;
    }

    // 添加AI响应
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: responseText,
      action: { type: 'redirect', target: redirectUrl, label: '点击跳转' }
    }]);

    setIsTyping(false);

    // 延迟跳转
    setTimeout(() => {
      router.push(redirectUrl);
    }, 1000);
  };

  // 快捷操作
  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setInput(action.query);
    setShowSuggestions(false);
    // 直接执行搜索
    const intent = analyzeIntent(action.query);
    let redirectUrl = '/?tab=ai-tools';
    if (intent.type === 'prompts') redirectUrl = '/?tab=prompts';
    if (intent.type === 'tutorials') redirectUrl = '/?tab=tutorials';
    if (intent.type === 'own-tools') {
      if (action.query.includes('简历')) redirectUrl = '/resume';
      if (action.query.includes('小说')) redirectUrl = '/novel';
      if (action.query.includes('出海')) redirectUrl = '/productpage';
      if (action.query.includes('证件')) redirectUrl = '/photo-id';
    }
    router.push(redirectUrl);
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* 主内容区 */}
      <main
        className="transition-all duration-300 h-screen flex flex-col"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Logo 区域 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                OneClaw AI 助手
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                告诉我想做什么，我来帮你找到合适的AI工具
              </p>
            </div>

            {/* 精选工具 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                精选工具
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {FEATURED_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => router.push(`/${tool.id === 'overseas' ? 'productpage' : tool.id}`)}
                      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                    >
                      {/* 预览区 */}
                      <div className={cn(
                        "h-24 flex items-center justify-center transition-colors",
                        tool.bgColor
                      )}>
                        <Icon className={cn("w-10 h-10 transition-transform group-hover:scale-110", tool.iconColor)} />
                      </div>
                      {/* 说明区 */}
                      <div className="p-3 bg-white dark:bg-slate-800">
                        <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {tool.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 消息列表 */}
            {messages.length > 0 && (
              <div className="space-y-6 mb-8">
                {messages.map((msg, index) => (
                  <div key={index} className={cn(
                    "flex gap-3",
                    msg.role === 'user' && "justify-end"
                  )}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}>
                      <p className="text-sm">{msg.content}</p>
                      {msg.action && (
                        <button
                          onClick={() => router.push(msg.action!.target!)}
                          className="mt-2 text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
                        >
                          {msg.action.label}
                        </button>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">U</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* 打字指示器 */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* 快捷操作 */}
            {showSuggestions && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  或者直接选择你想做的事情：
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {QUICK_ACTIONS.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-muted/50 border border-border hover:border-primary/20 transition-all group"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                        action.color
                      )}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 输入区域 */}
        <div className="border-t border-border bg-background/80 backdrop-blur-lg">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你想做的事情，比如：帮我找视频生成工具..."
                className="w-full px-4 py-3 pr-12 bg-muted rounded-2xl border-2 border-transparent focus:border-primary focus:outline-none resize-none text-sm placeholder:text-muted-foreground transition-colors"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 bottom-2 rounded-xl"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
