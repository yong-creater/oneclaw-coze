'use client';

import ProductPageGenerator from '@/components/tools/ProductPageGenerator';

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ProductPageGenerator />
      </div>
    </main>
  );
}
