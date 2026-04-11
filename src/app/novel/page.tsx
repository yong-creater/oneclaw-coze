'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  Send, Loader2, AlertCircle, Check, Copy, Download,
  ChevronDown, Feather, UserCircle, ImagePlus, Mountain
} from 'lucide-react';
import AnimatedLobster from '@/components/AnimatedLobster';
import LoginModal from '@/components/LoginModal';

const API2D_KEY = '';
const API_BASE_URL = 'https://oa.api2d.net/v1';
const REQUEST_TIMEOUT = 30000;
const RATE_LIMIT_MAX = 5;

const SYSTEM_PROMPTS: Record<string, string> = {
  polish: 'Professional editor for novel rewriting.',
  character: 'Character designer for novel character DNA.',
  imagePrompt: 'AI art prompt generator.',
  scenePrompt: 'Scene designer for novel scenes.'
};

const FEATURES = [
  { id: 'polish', name: 'Rewrite', icon: Feather, placeholder: 'Enter text...' },
  { id: 'character', name: 'Character', icon: UserCircle, placeholder: 'Character desc...' },
  { id: 'imagePrompt', name: 'Art Prompt', icon: ImagePlus, placeholder: 'Image desc...' },
  { id: 'scenePrompt', name: 'Scene', icon: Mountain, placeholder: 'Scene desc...' }
];

const MODELS = [
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5', recommend: 'Best' },
  { id: 'gemini-1.5-pro', name: 'Gemini Pro', recommend: 'Fast' },
  { id: 'gpt-4o', name: 'GPT-4o', recommend: 'Balanced' }
];

class RateLimiter {
  private requests: number[] = [];
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < 60000);
    return this.requests.length < RATE_LIMIT_MAX;
  }
  getRemainingRequests(): number {
    return RATE_LIMIT_MAX - this.requests.length;
  }
  addRequest(): void {
    this.requests.push(Date.now());
  }
}

const rateLimiter = new RateLimiter();

export default function NovelPage() {
  const [activeFeature, setActiveFeature] = useState('polish');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/auth?action=check', { credentials: 'include' });
        const data = await res.json();
        setIsLoggedIn(data.authenticated);
      } catch { /* ignore */ }
    };
    checkLogin();
  }, []);

  const getApiKey = useCallback((): string => {
    return process.env.NEXT_PUBLIC_API2D_KEY || API2D_KEY;
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('Please enter content');
      return;
    }
    if (!getApiKey()) {
      setError('Please configure API Key');
      return;
    }
    if (!rateLimiter.canMakeRequest()) {
      setError('Too many requests');
      return;
    }

    rateLimiter.addRequest();
    setError('');
    setOutputText('');
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, REQUEST_TIMEOUT);

    try {
      const response = await fetch(API_BASE_URL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getApiKey()
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS[activeFeature] || '' },
            { role: 'user', content: inputText }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setOutputText(data.choices?.[0]?.message?.content || '');
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Request timeout');
      } else {
        setError(err.message || 'Failed');
      }
    } finally {
      setIsLoading(false);
      cancelRequest();
    }
  }

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy failed');
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novel.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentFeature = FEATURES.find(f => f.id === activeFeature);
  const currentModel = MODELS.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <AnimatedLobster size={24} />
              <span className="font-bold text-lg">OneClaw</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm text-slate-600 hover:text-orange-500">Back</Link>
              {isLoggedIn ? (
                <Link href="/workspace" className="px-4 py-2 text-sm border rounded-full hover:border-orange-500">Dashboard</Link>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="px-4 py-2 text-sm border rounded-full hover:border-orange-500">Login</button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Feather className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Novel Master</h1>
              <p className="text-white/80 text-sm">AI-powered novel creation</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <button key={f.id} onClick={() => setActiveFeature(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeFeature === f.id ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
                <Icon className="w-4 h-4" />
                {f.name}
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <button onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg">
            <span className="text-sm">Model: <span className="font-medium">{currentModel?.name}</span></span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showModelDropdown && (
            <div className="mt-2 w-48 bg-white border rounded-lg shadow-lg">
              {MODELS.map(m => (
                <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.recommend}</div>
                </button>
              ))}
            </div>
          )}
          <span className="ml-4 text-sm text-slate-500">Remaining: {rateLimiter.getRemainingRequests()}</span>
        </div>

        <div className="mb-6">
          <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
            placeholder={currentFeature?.placeholder}
            className="w-full h-48 p-4 bg-white border rounded-xl resize-none" />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <button onClick={isLoading ? cancelRequest : handleSubmit}
            disabled={!inputText.trim() && !isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isLoading ? 'Generating...' : 'Create'}
          </button>
          {error && <span className="text-red-500 text-sm"><AlertCircle className="w-4 h-4 inline" /> {error}</span>}
        </div>

        {(outputText || isLoading) && (
          <div className="bg-white border rounded-xl">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="text-sm font-medium">Result</span>
              {outputText && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-xs text-slate-500 hover:text-orange-500">
                    {copied ? <Check className="w-3 h-3 inline" /> : <Copy className="w-3 h-3 inline" />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={handleDownload} className="text-xs text-slate-500 hover:text-orange-500">
                    <Download className="w-3 h-3 inline" /> Download
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 whitespace-pre-wrap">
              {isLoading ? <span className="text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline" /> Creating...</span> : outputText}
            </div>
          </div>
        )}
      </main>

      {showLoginModal && <LoginModal open={true} onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}
