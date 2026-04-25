'use client';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />

      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 mb-6">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              隐私政策
            </h1>
            <p className="text-sm text-muted-foreground">
              更新日期：2024年1月1日
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border prose prose-sm max-w-none">
            <h2>一、信息收集</h2>
            <p>
              我们可能收集以下信息：浏览记录、搜索关键词、收藏记录等，以优化用户体验。这些信息仅在本地存储，不会上传至服务器。
            </p>

            <h2>二、信息使用</h2>
            <p>
              收集的信息用于：提供个性化推荐、改进服务质量、分析使用趋势。
            </p>

            <h2>三、信息保护</h2>
            <p>
              我们采取合理的安全措施保护用户信息，但无法保证绝对安全。
            </p>

            <h2>四、第三方服务</h2>
            <p>
              我们的网站可能包含第三方链接，这些第三方可能有独立的隐私政策。
            </p>

            <h2>五、Cookie使用</h2>
            <p>
              我们使用Cookie来记住用户偏好和登录状态，您可以在浏览器中禁用Cookie。
            </p>

            <h2>六、联系我们</h2>
            <p>
              如有隐私相关问题，请联系：<a href="mailto:1017760688@qq.com">1017760688@qq.com</a>
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
