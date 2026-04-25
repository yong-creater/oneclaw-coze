'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-slate-800 mb-8">用户协议</h1>
        
        <div className="bg-white rounded-2xl p-8 border border-slate-100">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-500 text-sm mb-6">最后更新日期：2024年1月1日</p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. 服务说明</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              OneClaw（「我们」）是一个 AI 生图工具平台，通过整合多种 AI 图像生成技术，
              为用户提供便捷的图片生成服务。您同意并了解，我们仅提供工具平台服务，
              具体的 AI 生成功能由第三方技术提供方提供。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. 账号注册</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              您可以选择注册账号以使用更多功能。注册时您需要提供真实、准确的信息，
              并妥善保管您的账号信息。如果您未满18岁，请在监护人的陪同下使用我们的服务。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. 使用规范</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              您同意在使用我们的服务时遵守以下规定：
            </p>
            <ul className="list-disc list-inside text-slate-600 leading-relaxed mb-4 space-y-2">
              <li>遵守中华人民共和国法律法规，不得利用本服务从事违法活动</li>
              <li>不得生成、传播任何违法违规、有害或侵犯他人权益的内容</li>
              <li>不得生成涉及色情、暴力、血腥、恐怖主义等内容</li>
              <li>不得生成侵犯他人知识产权（商标、专利、版权等）的内容</li>
              <li>不得尝试破解、逆向工程或滥用我们的服务</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. 知识产权</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong>关于生成内容：</strong>您使用我们的 AI 工具生成的图片，您享有使用这些图片的合法权利，
              可以用于个人或商业目的。但我们不对生成内容的知识产权归属做出任何保证。
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong>关于平台内容：</strong>我们的网站设计、界面布局、Logo 等元素均受知识产权保护，
              未经授权不得复制、修改或使用。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. 服务变更</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              我们有权随时修改、暂停或终止服务，也有权修改本协议。重要变更我们会通过网站公告
              或其他方式通知您。继续使用服务即表示您接受修改后的协议。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. 免责声明</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              您了解并同意：AI 生成的内容可能存在不确定性，我们不对生成结果的准确性、
              适用性或商业价值做任何保证。因使用本服务产生的任何直接或间接损失，
              我们不承担责任（法律法规另有规定的除外）。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. 争议解决</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              本协议的解释和执行均适用中华人民共和国法律。如发生争议，双方应友好协商解决；
              协商不成的，任何一方可向被告住所地有管辖权的人民法院提起诉讼。
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">8. 联系我们</h2>
            <p className="text-slate-600 leading-relaxed">
              如您对本协议有任何疑问，请联系我们：<br />
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
            <Link href="/privacy" className="hover:text-white transition-colors mx-2">隐私政策</Link>
            <span className="mx-2">|</span>
            <span>皖ICP备XXXXXXXX号</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
