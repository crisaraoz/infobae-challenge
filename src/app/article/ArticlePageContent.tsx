'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ArticlePageContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<string>('');

  useEffect(() => {
    // Simular carga de artículo
    const timer = setTimeout(() => {
      setArticle(`
        # Artículo sobre ${topic}

        Este es un artículo generado automáticamente sobre el tema: **${topic}**.

        ## Introducción

        En este artículo exploraremos los aspectos más importantes relacionados con ${topic}. 
        A través de una investigación exhaustiva, hemos recopilado información relevante 
        que te ayudará a comprender mejor este tema.

        ## Desarrollo

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

        ### Puntos Clave

        - Punto importante 1 sobre ${topic}
        - Punto importante 2 sobre ${topic}
        - Punto importante 3 sobre ${topic}

        ## Conclusión

        En conclusión, ${topic} es un tema de gran relevancia que requiere atención 
        continua y análisis detallado.
      `);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [topic]);

  if (!topic) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-semibold mb-4">No se encontró el tema</h1>
        <Link href="/investigation">
          <Button>Volver a Investigación</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 py-8">
      <div className="mb-6">
        <Link href="/investigation">
          <Button variant="outline" className="mb-4">
            ← Volver a Investigación
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg">Generando artículo sobre {topic}...</p>
        </div>
      ) : (
        <article className="prose prose-lg max-w-none">
          <div className="whitespace-pre-line">
            {article.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={index} className="text-3xl font-bold mb-6 text-gray-900">
                    {line.replace('# ', '')}
                  </h1>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-semibold mb-4 mt-8 text-gray-800">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-semibold mb-3 mt-6 text-gray-700">
                    {line.replace('### ', '')}
                  </h3>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={index} className="mb-2 text-gray-600">
                    {line.replace('- ', '')}
                  </li>
                );
              }
              if (line.includes('**')) {
                const parts = line.split('**');
                return (
                  <p key={index} className="mb-4 text-gray-600 leading-relaxed">
                    {parts.map((part, i) => 
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </p>
                );
              }
              if (line.trim()) {
                return (
                  <p key={index} className="mb-4 text-gray-600 leading-relaxed">
                    {line}
                  </p>
                );
              }
              return <br key={index} />;
            })}
          </div>
        </article>
      )}
    </main>
  );
} 