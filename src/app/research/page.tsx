'use client';

import { Suspense } from 'react';
import ResearchPageContent from './ResearchPageContent';

export default function ResearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando investigación...</p>
        </div>
      </div>
    }>
      <ResearchPageContent />
    </Suspense>
  );
} 