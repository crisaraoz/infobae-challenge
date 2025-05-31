'use client';

import { Suspense } from 'react';
import ArticlePageContent from './ArticlePageContent';

export default function ArticlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando artículo...</p>
        </div>
      </div>
    }>
      <ArticlePageContent />
    </Suspense>
  );
}
