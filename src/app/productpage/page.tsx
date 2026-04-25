'use client';

import ProductPageGenerator from '@/components/tools/ProductPageGenerator';
import BackToHome from '@/components/common/BackToHome';

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackToHome />
        <ProductPageGenerator />
      </div>
    </main>
  );
}
