'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import AnimatedLobster from './AnimatedLobster';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 ${className}`}>
      {/* 顶部装饰渐变 */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 主要内容区 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Logo 和简介 */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
                <AnimatedLobster size={22} />
              </div>
              <div>
                <span className="font-bold text-lg text-white">OneClaw</span>
                <p className="text-[11px] text-orange-400">AI 智能工具箱</p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              OneClaw 是全品类 AI 工具导航站，精选优质 AI 工具，涵盖视频生成、数字人、AI绘画、AI写作等全品类，帮助用户轻松完成各种 AI 处理任务。
            </p>
            {/* 社交图标 */}
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-700/50 hover:bg-orange-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-700/50 hover:bg-orange-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-700/50 hover:bg-orange-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              快速链接
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/', label: '首页' },
                { href: '/tools', label: 'AI工具' },
                { href: '/templates', label: '设计模板' },
                { href: '/vip', label: '会员中心' },
                { href: '/recent', label: '最近打开' },
                { href: '/assets', label: '资产库' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 帮助与支持 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              帮助与支持
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/about', label: '关于我们' },
                { href: '/privacy', label: '隐私政策' },
                { href: '/terms', label: '用户协议' },
                { href: '/help', label: '使用帮助' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-orange-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 p-4 bg-slate-700/30 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">联系邮箱</p>
              <a href="mailto:1017760688@qq.com" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                1017760688@qq.com
              </a>
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-slate-700/50 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* 备案信息 */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span>Copyright © 2024 OneClaw. All rights reserved.</span>
              <span className="hidden md:inline text-slate-600">|</span>
              <span>皖ICP备XXXXXXXX号</span>
              <span className="hidden md:inline text-slate-600">|</span>
              <span>皖ICP备XXXXXXXX号-1</span>
            </div>
            
            {/* 右侧装饰 */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Made with</span>
              <span className="text-red-500">❤</span>
              <span>using AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部装饰渐变 */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
    </footer>
  );
}
