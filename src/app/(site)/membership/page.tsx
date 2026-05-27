import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '会员中心',
  description: 'OneClaw 会员中心，升级会员获取更多创作额度与专属权益。',
};

export default function MembershipPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11.825 1.736a.5.5 0 0 1 .352 0l2.21.854 2.288.886a.5.5 0 0 1 .297.314l.854 2.21.886 2.288a.5.5 0 0 1 0 .352l-.854 2.21-.886 2.288a.5.5 0 0 1-.314.297l-2.21.854-2.288.886a.5.5 0 0 1-.352 0l-2.21-.854-2.288-.886a.5.5 0 0 1-.297-.314l-.854-2.21-.886-2.288a.5.5 0 0 1 0-.352l.854-2.21.886-2.288a.5.5 0 0 1 .314-.297l2.21-.854z"/>
            <path d="M6.825 4.736a.5.5 0 0 1 .352 0l2.21.854 2.288.886a.5.5 0 0 1 .297.314l.854 2.21.886 2.288a.5.5 0 0 1 0 .352l-.854 2.21-.886 2.288a.5.5 0 0 1-.314.297l-2.21.854-2.288.886a.5.5 0 0 1-.352 0l-2.21-.854-2.288-.886a.5.5 0 0 1-.297-.314l-.854-2.21-.886-2.288a.5.5 0 0 1 0-.352l.854-2.21.886-2.288a.5.5 0 0 1 .314-.297l2.21-.854z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">会员中心</h1>
        <p className="text-slate-500 text-sm max-w-sm">升级会员，解锁更多创作额度与专属权益，即将上线</p>
      </div>
    </div>
  );
}
