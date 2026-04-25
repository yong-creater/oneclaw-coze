'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">隐私政策</h1>
        
        <div className="bg-white rounded-2xl p-8 border border-slate-100">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-500 text-sm mb-6">最后更新日期：2024年1月1日</p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. 信息收集</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              OneClaw（「我们」）非常重视用户的隐私和个人信息保护。本隐私政策旨在向您说明我们如何收集、
              使用、存储和保护您的个人信息。
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              我们收集的信息包括：您主动提供的信息（如注册账号时填写的邮箱）、您使用服务时产生的信息
              （如浏览记录、使用偏好）、以及您上传的图片内容。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. 信息使用</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              我们使用收集的信息用于：提供和改进我们的服务、响应您的请求、向您推送相关的产品更新和优惠信息。
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              特别说明：您上传的图片仅用于为您提供 AI 生成服务，我们不会将您的图片用于任何其他目的，
              也不会在未经您同意的情况下向第三方提供。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. 信息存储</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              我们会将您的信息存储在安全的服务器上，并采取适当的技术和管理措施来保护您的个人信息安全。
              您上传的图片会在生成完成后保留一定时间，供您查看和下载，之后会自动删除。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. 信息共享</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              除以下情况外，我们不会与任何第三方共享您的个人信息：
            </p>
            <ul className="list-disc list-inside text-slate-600 leading-relaxed mb-4 space-y-2">
              <li>获得您的明确同意</li>
              <li>根据法律法规要求或政府主管部门的要求</li>
              <li>为保护我们的合法权益而必需</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. Cookie 使用</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              我们使用 Cookie 和类似技术来改善您的用户体验，包括保持您的登录状态记住您的偏好设置。
              您可以通过浏览器设置拒绝 Cookie，但这可能会影响部分功能的使用。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. 您的权利</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              您有权访问、更正、删除您的个人信息，也有权撤回您的同意。您可以通过联系我们的客服
              （邮箱：1017760688@qq.com）来行使这些权利。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. 联系我们</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
            </p>
            <p className="text-slate-600 leading-relaxed">
              联系邮箱：1017760688@qq.com<br />
              工作时间：周一至周五 9:00-18:00
            </p>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-slate-800 text-slate-400 py-6 mt-12">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm">
          <p className="mb-2">Copyright © 2024 OneClaw. All rights reserved.</p>
          <p className="text-slate-500">
            <Link href="/about" className="hover:text-white transition-colors mx-2">关于我们</Link>
            <Link href="/terms" className="hover:text-white transition-colors mx-2">用户协议</Link>
            <span className="mx-2">|</span>
            <span>皖ICP备XXXXXXXX号</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
