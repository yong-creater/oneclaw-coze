'use client';

import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-slate-800 text-slate-300 ${className}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 主要信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* 关于我们 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">关于我们</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OneClaw 是一个专注于 AI 生图工具的平台，精选多款高效的 AI 图像生成工具，
              帮助用户轻松创建头像、封面、海报、菜单等各种设计作品。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">快速链接</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-slate-400 hover:text-white transition-colors">
                  设计模板
                </Link>
              </li>
              <li>
                <Link href="/membership" className="text-slate-400 hover:text-white transition-colors">
                  会员中心
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                  登录/注册
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">联系我们</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>联系邮箱：1017760688@qq.com</li>
              <li>工作时间：周一至周五 9:00-18:00</li>
            </ul>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-slate-700 pt-6">
          {/* 备案信息 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <Link href="/about" className="hover:text-white transition-colors">
                关于我们
              </Link>
              <span className="text-slate-600">|</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                隐私政策
              </Link>
              <span className="text-slate-600">|</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                用户协议
              </Link>
            </div>
          </div>

          {/* 版权和备案 */}
          <div className="text-center text-xs text-slate-500 space-y-1">
            <p>Copyright © 2024 OneClaw. All rights reserved.</p>
            <p className="flex items-center justify-center gap-2">
              <span>皖ICP备XXXXXXXX号</span>
              <span className="text-slate-600">|</span>
              <span>皖ICP备XXXXXXXX号-1</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
