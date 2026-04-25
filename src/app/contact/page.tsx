'use client';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />

      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 mb-6">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              联系我们
            </h1>
            <p className="text-muted-foreground">
              有任何问题或建议？我们随时为您服务
            </p>
          </div>

          {/* 联系方式卡片 */}
          <div className="bg-card rounded-2xl p-8 border border-border mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">邮箱联系</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  工作日 24 小时内回复
                </p>
                <a href="mailto:1017760688@qq.com" className="text-primary hover:underline">
                  1017760688@qq.com
                </a>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-card rounded-2xl p-8 border border-border">
            <h2 className="font-semibold text-foreground mb-4">常见问题</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">工具收录</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    如果您希望收录您的AI工具，请通过邮箱联系我们
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">合作推广</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    欢迎AI工具厂商洽谈合作推广事宜
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">功能建议</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    我们非常重视用户的反馈，期待您的建议
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
