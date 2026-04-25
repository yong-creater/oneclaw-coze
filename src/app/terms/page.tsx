'use client';

import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />

      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500/10 to-slate-600/10 mb-6">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              用户协议
            </h1>
            <p className="text-sm text-muted-foreground">
              更新日期：2024年1月1日
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border prose prose-sm max-w-none">
            <h2>一、服务说明</h2>
            <p>
              OneClaw是一个AI工具导航平台，为用户提供AI工具信息检索、推荐和导航服务。我们不对第三方工具的实际使用效果、安全性或合法性负责。
            </p>

            <h2>二、用户责任</h2>
            <p>
              用户在使用第三方工具时，应遵守各工具的服务条款和当地法律法规。用户对自身行为负全部责任。
            </p>

            <h2>三、知识产权</h2>
            <p>
              OneClaw上的内容（包括但不限于文字、图片、标识）受知识产权保护，未经授权不可擅自使用。
            </p>

            <h2>四、免责声明</h2>
            <p>
              我们会尽力确保信息的准确性，但不对第三方工具的描述、功能或价格变动承担任何责任。使用第三方工具的风险由用户自行承担。
            </p>

            <h2>五、协议修改</h2>
            <p>
              我们保留随时修改本协议的权利，修改后的协议将在网站上公布。
            </p>

            <h2>六、联系我们</h2>
            <p>
              如有疑问，请联系：<a href="mailto:1017760688@qq.com">1017760688@qq.com</a>
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
