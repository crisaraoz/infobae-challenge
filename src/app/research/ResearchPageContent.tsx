'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { performResearch, categorizeResearchResults } from '@/app/actions/research';
import { CategorizedResult } from '@/types';
import { useResearchCache } from '@/hooks/useResearchCache';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ResearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get('topic');
  const { getCache, setCache, clearCache } = useResearchCache();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [results, setResults] = useState<CategorizedResult[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<{
    expandWorthy: CategorizedResult[];
    notExpandWorthy: CategorizedResult[];
  }>({
    expandWorthy: [],
    notExpandWorthy: []
  });
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = useCallback(async (forceRefresh: boolean = false) => {
    if (!topic) return;
    
    setIsLoading(!forceRefresh);
    setIsRefreshing(forceRefresh);
    setError(null);

    if (forceRefresh) {
      clearCache(topic);
    }

    const cachedData = getCache(topic);
    if (cachedData && !forceRefresh) {
      setResults(cachedData.results);
      setCategorizedResults(cachedData.categorized);
      setIsLoading(false);
      setIsRefreshing(false);
      console.log('♻️ Resultados cargados desde cache para:', topic);
      return;
    }

    try {
      console.log('🌐 Realizando nueva investigación para:', topic);
      const results = await performResearch(topic);
      const categorized = await categorizeResearchResults(results);
      setResults(results);
      setCategorizedResults(categorized);
      setCache(topic, { results, categorized, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la investigación');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [topic, clearCache, getCache, setCache]);

  useEffect(() => {
    if (!topic) {
      router.push('/investigation');
      return;
    }

    fetchResearch();
  }, [topic, router, fetchResearch]);

  const handleStartArticle = (result: CategorizedResult) => {
    const params = new URLSearchParams({
      topic: topic || '',
      title: result.title,
      url: result.url,
      content: result.text || '',
      author: result.author || '',
      score: (result.score ? Math.round(result.score * 100) : 0).toString(),
      publishedDate: result.publishedDate || '',
      reasoning: result.reasoning || ''
    });
    router.push(`/article?${params.toString()}`);
  };

  const handleRefreshInvestigation = () => {
    fetchResearch(true);
  };

  if (!topic) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Investigando sobre {topic}
          </h2>
          <p className="text-gray-600">
            Obteniendo los mejores resultados de la web...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    const isTimeoutError = error.includes('Timeout');
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-lg bg-white rounded-lg shadow-lg p-8">
          <div className={`text-6xl mb-4 ${isTimeoutError ? 'text-yellow-500' : 'text-red-500'}`}>
            {isTimeoutError ? '⏱️' : '⚠️'}
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {isTimeoutError ? 'Búsqueda demorada' : 'Error en la investigación'}
          </h2>
          <div className="text-gray-600 mb-6 space-y-2">
            <p className="font-medium">{error}</p>
            {isTimeoutError && (
              <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <p className="font-medium text-yellow-800 mb-1">💡 Sugerencias:</p>
                <ul className="text-left text-yellow-700 space-y-1">
                  <li>• Intenta con un tema más específico</li>
                  <li>• Verifica tu conexión a internet</li>
                  <li>• Usa palabras clave más concretas</li>
                </ul>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/investigation">
              <Button variant="outline">← Cambiar tema</Button>
            </Link>
            <Button onClick={() => fetchResearch(true)} disabled={isRefreshing}>
              {isRefreshing ? '🔄 Intentando...' : '🔄 Reintentar'}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/investigation?show=topics">
              <Button variant="outline">
                ← Volver a investigación
              </Button>
            </Link>
            
            <Button 
              onClick={handleRefreshInvestigation}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Nueva Investigación'}
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Resultados para: {topic}
          </h1>
          <p className="text-gray-600">
            {results.length} resultados encontrados y categorizados
            {isRefreshing && (
              <span className="ml-2 text-blue-600 font-medium">
                • Actualizando resultados...
              </span>
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contenido que vale la pena expandir */}
          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2 flex items-center">
                ✅ Vale la pena expandir
                <span className="ml-2 bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm">
                  {categorizedResults.expandWorthy.length}
                </span>
              </h2>
              <p className="text-green-700 text-sm">
                Contenido con alta relevancia y potencial para artículos
              </p>
            </div>

            <div className="space-y-4">
              {categorizedResults.expandWorthy.map((result, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-400">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {result.reasoning}
                  </p>
                  {result.score && (
                    <div className="text-xs text-gray-500 mb-3">
                      Puntuación: {Math.round(result.score * 100)}%
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm truncate flex-1 mr-4"
                    >
                      {result.url}
                    </a>
                    <Button
                      onClick={() => handleStartArticle(result)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Crear Artículo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contenido que NO vale la pena expandir */}
          <div className="space-y-4">
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                ❌ No vale la pena expandir
                <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
                  {categorizedResults.notExpandWorthy.length}
                </span>
              </h2>
              <p className="text-gray-700 text-sm">
                Contenido con menor relevancia o información limitada
              </p>
            </div>

            <div className="space-y-4">
              {categorizedResults.notExpandWorthy.map((result, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-gray-400 opacity-75">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {result.reasoning}
                  </p>
                  {result.score && (
                    <div className="text-xs text-gray-500 mb-3">
                      Puntuación: {Math.round(result.score * 100)}%
                    </div>
                  )}
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm truncate block"
                  >
                    {result.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {results.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600">
              Intenta con un tema diferente o verifica la configuración de la API
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 