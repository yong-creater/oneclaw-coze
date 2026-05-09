import { Suspense } from 'react';
import CreateWorkbench from '@/components/site/pages/CreateWorkbench';

function CreateLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">加载工作台...</span>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<CreateLoading />}>
      <CreateWorkbench />
    </Suspense>
  );
}
