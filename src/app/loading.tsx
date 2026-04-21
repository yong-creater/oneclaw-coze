import LobsterLoading from '@/components/common/LobsterLoading';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LobsterLoading size={80} />
        <p className="mt-4 text-slate-500">加载中...</p>
      </div>
    </div>
  );
}
