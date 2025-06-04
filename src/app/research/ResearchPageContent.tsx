'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { performResearch, categorizeResearchResults } from '@/app/actions/research';
import type { CategorizedResult, CustomCategorizationRules } from '@/types';
import { useResearchCache } from '@/hooks/useResearchCache';
import { useCategorizationRules } from '@/hooks/useCategorizationRules';
import { useExcelExport } from '@/hooks/useExcelExport';
import { CategorizationRulesConfig } from '@/components/CategorizationRulesConfig';
import { RefreshCw, Settings, Download, FileSpreadsheet, FileText, FileBarChart, LayoutGrid, List, ExternalLink, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'cards' | 'list';

export default function ResearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get('topic');
  const { getCache, setCache, clearCache } = useResearchCache();
  const { activeRule } = useCategorizationRules();
  const { exportToExcel, exportSimpleList, exportAsCSV } = useExcelExport();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [results, setResults] = useState<CategorizedResult[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<{
    expandWorthy: CategorizedResult[];
    notExpandWorthy: CategorizedResult[];
  }>({
    expandWorthy: [],
    notExpandWorthy: []
  });
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [expandWorthyExpanded, setExpandWorthyExpanded] = useState(true);
  const [notExpandWorthyExpanded, setNotExpandWorthyExpanded] = useState(true);

  // Forzar vista de lista en móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveViewMode = isMobile ? 'list' : viewMode;

  const fetchResearch = useCallback(async (forceRefresh: boolean = false, customRules?: CustomCategorizationRules) => {
    if (!topic) return;
    
    setIsLoading(!forceRefresh);
    setIsRefreshing(forceRefresh);
    setError(null);
    setProgress(0);
    setProgressMessage('Iniciando investigación...');

    if (forceRefresh) {
      clearCache(topic);
    }

    const cachedData = getCache(topic);
    if (cachedData && !forceRefresh && !customRules) {
      setResults(cachedData.results);
      setCategorizedResults(cachedData.categorized);
      setProgress(100);
      setProgressMessage('¡Investigación completada!');
      setTimeout(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      }, 500);
      console.log('♻️ Resultados cargados desde cache para:', topic);
      return;
    }

    try {
      console.log('🌐 Realizando nueva investigación para:', topic);
      
      // Usar reglas personalizadas o reglas activas
      const rulesToUse = customRules || activeRule;
      
      const results = await performResearch(topic, rulesToUse);
      const categorized = await categorizeResearchResults(results);
      setResults(results);
      setCategorizedResults(categorized);
      
      // Solo cachear si no se usan reglas personalizadas temporales
      if (!customRules) {
      setCache(topic, { results, categorized, timestamp: Date.now() });
      }
      
      // Completar progreso
      setProgress(100);
      setProgressMessage('¡Investigación completada exitosamente!');
      setTimeout(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la investigación');
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [topic, clearCache, getCache, setCache, activeRule]);

  const handleRulesChange = (newRules: CustomCategorizationRules) => {
    // Reejecutar la investigación con las nuevas reglas
    fetchResearch(true, newRules);
  };

  const handleExportExcel = () => {
    if (!topic) return;
    
    exportToExcel({
      expandWorthy: categorizedResults.expandWorthy,
      notExpandWorthy: categorizedResults.notExpandWorthy,
      topic
    });
    setShowExportMenu(false);
  };

  const handleExportSimple = () => {
    if (!topic) return;
    
    exportSimpleList({
      expandWorthy: categorizedResults.expandWorthy,
      notExpandWorthy: categorizedResults.notExpandWorthy,
      topic
    });
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    if (!topic) return;
    
    exportAsCSV({
      expandWorthy: categorizedResults.expandWorthy,
      notExpandWorthy: categorizedResults.notExpandWorthy,
      topic
    });
    setShowExportMenu(false);
  };

  const handleRefreshInvestigation = () => {
    fetchResearch(true);
  };

  useEffect(() => {
    if (!topic) {
      router.push('/investigation');
      return;
    }

    fetchResearch();
  }, [topic, router, fetchResearch]);

  // Cerrar menú de exportación al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        const target = event.target as Element;
        if (!target.closest('.export-menu-container')) {
          setShowExportMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Simular progreso de carga dinámico
  useEffect(() => {
    if (!isLoading && !isRefreshing) {
      setProgress(0);
      setProgressMessage('');
      return;
    }

    let currentProgress = 0;
    const progressSteps = [
      { progress: 15, message: 'Conectando con fuentes de datos...', duration: 800 },
      { progress: 25, message: 'Optimizando consulta de búsqueda...', duration: 600 },
      { progress: 45, message: 'Buscando contenido relevante...', duration: 2000 },
      { progress: 65, message: 'Analizando resultados encontrados...', duration: 1500 },
      { progress: 85, message: 'Aplicando heurísticas de categorización...', duration: 1000 },
      { progress: 95, message: 'Finalizando investigación...', duration: 500 },
    ];

    let stepIndex = 0;
    
    const updateProgress = () => {
      if (stepIndex < progressSteps.length && (isLoading || isRefreshing)) {
        const step = progressSteps[stepIndex];
        setProgressMessage(step.message);
        
        // Incremento gradual hasta el siguiente paso
        const targetProgress = step.progress;
        const increment = (targetProgress - currentProgress) / 10;
        
        const gradualUpdate = () => {
          if (currentProgress < targetProgress && (isLoading || isRefreshing)) {
            currentProgress += increment;
            setProgress(Math.min(currentProgress, targetProgress));
            setTimeout(gradualUpdate, 100);
          } else {
            // Pasar al siguiente paso después de la duración especificada
            setTimeout(() => {
              stepIndex++;
              updateProgress();
            }, step.duration);
          }
        };
        
        gradualUpdate();
      } else if (isLoading || isRefreshing) {
        // Si llegamos al final pero aún estamos cargando, mantener en 95%
        setProgress(95);
        setProgressMessage('Preparando resultados...');
      }
    };

    updateProgress();
  }, [isLoading, isRefreshing]);

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

  const renderResultCard = (result: CategorizedResult, index: number, isExpandWorthy: boolean) => (
    <div key={index} className={`bg-white rounded-lg p-4 md:p-6 shadow-lg border-l-4 ${isExpandWorthy ? 'border-green-400' : 'border-gray-400'} ${!isExpandWorthy ? 'opacity-75' : ''}`}>
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base leading-tight">
        {result.title}
      </h3>
      <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-3">
        {result.reasoning}
      </p>
      {result.score && (
        <div className="text-xs text-gray-500 mb-3">
          Puntuación: {Math.round(result.score * 100)}%
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-xs md:text-sm truncate block"
          title={result.url}
        >
          {result.url}
        </a>
        {isExpandWorthy && (
          <Button
            onClick={() => handleStartArticle(result)}
            size="sm"
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-10 sm:h-auto"
          >
            Crear Artículo
          </Button>
        )}
      </div>
    </div>
  );

  const renderResultListItem = (result: CategorizedResult, index: number, isExpandWorthy: boolean) => (
    <div key={index} className={`bg-white rounded-lg border p-3 md:p-4 hover:shadow-md transition-shadow ${isExpandWorthy ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-gray-400'} ${!isExpandWorthy ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 md:gap-3">
            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 md:mt-2 ${isExpandWorthy ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm md:text-base leading-tight">
                {result.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                {result.reasoning}
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-gray-500">
                {result.score && (
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    📊 {Math.round(result.score * 100)}%
                  </span>
                )}
                {result.author && (
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    👤 {result.author}
                  </span>
                )}
                {result.publishedDate && (
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    📅 {new Date(result.publishedDate).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 ml-2 md:ml-4 flex-shrink-0">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
            title="Abrir enlace"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          {isExpandWorthy && (
            <Button
              onClick={() => handleStartArticle(result)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-xs px-2 md:px-3 py-2 h-8 md:h-7"
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Artículo</span>
              <span className="sm:hidden">📄</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (!topic) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-3 w-full mb-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{Math.round(progress)}%</span>
              <span className="text-blue-600 font-medium">Investigando...</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Investigando sobre {topic}
          </h2>
          <p className="text-gray-600 mb-4">
            {progressMessage || 'Iniciando investigación...'}
          </p>
          
          {/* Indicador visual adicional */}
          <div className="flex justify-center space-x-1 mb-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  progress > (i + 1) * 25 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animation: progress > (i + 1) * 25 ? 'pulse 2s infinite' : 'none'
                }}
              ></div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500">
            Esto puede tomar algún tiempo, por favor, no cierre la página.
          </div>
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
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          {/* Mobile Header Layout */}
          <div className="block md:hidden space-y-4 mb-6">
            {/* Back Button */}
            <div className="flex justify-start">
              <Link href="/investigation?show=topics">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  ← Volver a investigación
                </Button>
              </Link>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Resultados para: {topic}
              </h1>
              <p className="text-sm text-gray-600">
                {results.length} resultados encontrados y categorizados
                {isRefreshing && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • Actualizando...
                  </span>
                )}
              </p>
            </div>
            
            {/* Mobile Controls - Stacked */}
            <div className="space-y-3">
              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden">
                {/* Mobile always uses list view - no toggle needed */}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={() => setShowConfigModal(true)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <Settings className="h-4 w-4" />
                  Configurar Reglas
                </Button>
                
                <Button 
                  onClick={handleRefreshInvestigation}
                  disabled={isRefreshing}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualizando...' : 'Nueva Investigación'}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden md:block">
          <div className="flex justify-between items-center mb-4">
            <Link href="/investigation?show=topics">
              <Button variant="outline">
                ← Volver a investigación
              </Button>
            </Link>
              
              <div className="flex items-center gap-2">
                {/* Controles de vista */}
                <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="h-8 w-8 p-0"
                    title="Vista de tarjetas"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                    title="Vista de lista"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setShowConfigModal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configurar Reglas
                </Button>
            
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
        </div>

        {/* Sección de Exportación */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 md:mb-8">
            {/* Mobile Export Layout */}
            <div className="block md:hidden">
              <div className="text-center mb-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Exportar Resultados</h3>
                <p className="text-xs text-gray-600">
                  Descarga los resultados en diferentes formatos
                </p>
              </div>
              
              <div className="relative">
                <Button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 h-12"
                >
                  <Download className="h-4 w-4" />
                  {showExportMenu ? 'Cerrar opciones' : 'Ver opciones de exportación'}
                </Button>
                
                {showExportMenu && (
                  <div className="export-menu-container mt-3 w-full bg-gray-50 rounded-lg border">
                    <div className="p-3 space-y-2">
                      <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-3 w-full p-3 text-left hover:bg-white rounded-lg transition-colors border border-gray-200"
                      >
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Excel Completo</div>
                          <div className="text-xs text-gray-500">Con resumen y hojas separadas</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={handleExportSimple}
                        className="flex items-center gap-3 w-full p-3 text-left hover:bg-white rounded-lg transition-colors border border-gray-200"
                      >
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Lista Simple</div>
                          <div className="text-xs text-gray-500">Solo título, URL y puntuación</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-3 w-full p-3 text-left hover:bg-white rounded-lg transition-colors border border-gray-200"
                      >
                        <FileBarChart className="h-5 w-5 text-orange-600" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">CSV</div>
                          <div className="text-xs text-gray-500">Para análisis en otras herramientas</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Export Layout */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Exportar Resultados</h3>
                  <p className="text-sm text-gray-600">
                    Descarga los resultados de la investigación en diferentes formatos
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                    
                    {showExportMenu && (
                      <div className="export-menu-container absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-10">
                        <div className="p-2">
                          <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium text-gray-900">Excel Completo</div>
                              <div className="text-xs text-gray-500">Con resumen y hojas separadas</div>
                            </div>
                          </button>
                          
                          <button
                            onClick={handleExportSimple}
                            className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">Lista Simple</div>
                              <div className="text-xs text-gray-500">Solo título, URL y puntuación</div>
                            </div>
                          </button>
                          
                          <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <FileBarChart className="h-4 w-4 text-orange-600" />
                            <div>
                              <div className="font-medium text-gray-900">CSV</div>
                              <div className="text-xs text-gray-500">Para análisis en otras herramientas</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={effectiveViewMode === 'cards' ? 'grid md:grid-cols-2 gap-4 md:gap-8' : 'space-y-4 md:space-y-6'}>
          {/* Contenido que vale la pena expandir */}
          <div className="space-y-4">
            <div 
              className="bg-green-50 border-l-4 border-green-400 p-3 md:p-4 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => setExpandWorthyExpanded(!expandWorthyExpanded)}
            >
              <h2 className="text-lg md:text-xl font-semibold text-green-800 mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg md:text-xl">✅</span>
                  <span className="ml-2">Vale la pena expandir</span>
                  <span className="ml-2 bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs md:text-sm font-medium">
                  {categorizedResults.expandWorthy.length}
                </span>
                </div>
                <div className="text-green-600">
                  {expandWorthyExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </h2>
              <p className="text-green-700 text-xs md:text-sm">
                Contenido con alta relevancia y potencial para artículos
              </p>
            </div>

            {expandWorthyExpanded && (
              <div className="animate-slideDown">
                {effectiveViewMode === 'cards' ? (
                  <div className="space-y-3 md:space-y-4">
                    {categorizedResults.expandWorthy.map((result, index) => 
                      renderResultCard(result, index, true)
                    )}
                    </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {categorizedResults.expandWorthy.map((result, index) => 
                      renderResultListItem(result, index, true)
                    )}
                  </div>
                )}
                </div>
            )}
          </div>

          {/* Contenido que NO vale la pena expandir */}
          <div className="space-y-4">
            <div 
              className="bg-gray-50 border-l-4 border-gray-400 p-3 md:p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setNotExpandWorthyExpanded(!notExpandWorthyExpanded)}
            >
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg md:text-xl">❌</span>
                  <span className="ml-2">No vale la pena expandir</span>
                  <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs md:text-sm font-medium">
                  {categorizedResults.notExpandWorthy.length}
                </span>
                </div>
                <div className="text-gray-600">
                  {notExpandWorthyExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </h2>
              <p className="text-gray-700 text-xs md:text-sm">
                Contenido con menor relevancia o información limitada
              </p>
            </div>

            {notExpandWorthyExpanded && (
              <div className="animate-slideDown">
                {effectiveViewMode === 'cards' ? (
                  <div className="space-y-3 md:space-y-4">
                    {categorizedResults.notExpandWorthy.map((result, index) => 
                      renderResultCard(result, index, false)
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {categorizedResults.notExpandWorthy.map((result, index) => 
                      renderResultListItem(result, index, false)
                    )}
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>

        {results.length === 0 && !isLoading && (
          <div className="text-center py-8 md:py-12 px-4">
            <div className="text-4xl md:text-6xl mb-4">🔍</div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto">
              Intenta con un tema diferente o verifica la configuración de la API
            </p>
          </div>
        )}
      </div>

      {/* Modal de configuración de reglas */}
      <CategorizationRulesConfig
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onRulesChange={handleRulesChange}
      />
    </main>
  );
} 