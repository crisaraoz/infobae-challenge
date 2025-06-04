'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Star, FileText, Sparkles, Lightbulb, Loader2, BookOpen, Share2, Download, Eye, ChevronRight, Home, Search, Bookmark, Copy, CheckCheck, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Función auxiliar para generar el artículo estructurado
const generateStructuredArticle = (
  topic: string, 
  title: string, 
  content: string, 
  reasoning?: string | null,
  publishedDate?: string | null,
  score?: string | null,
  url?: string | null,
  author?: string | null
) => {
  // El contenido que llega ya es el resumen generado por OpenAI en el backend
  
  return `# ${title}

## Resumen Ejecutivo

${content}

## Contexto e Importancia

Este hallazgo sobre **${topic}** representa un desarrollo significativo que merece atención especial. La investigación realizada ha identificado elementos clave que pueden tener implicaciones importantes para el campo.

## Análisis de Relevancia

### ¿Por qué es importante este contenido?

${reasoning ? `**Criterio de selección:** ${reasoning}` : 'Este contenido fue identificado como prioritario basado en múltiples factores de calidad y relevancia.'}

- **Actualidad**: ${publishedDate ? `Publicado el ${new Date(publishedDate).toLocaleDateString('es-ES')}` : 'Información procesada recientemente'}
- **Calidad**: ${score ? `Puntuación de relevancia: ${score}%` : 'Contenido verificado y analizado'}
- **Alcance**: Potencial para generar insights valiosos

### Factores Clave Identificados

1. **Tendencias Emergentes**: Los patrones identificados sugieren desarrollos importantes en el área de ${topic}
2. **Oportunidades de Investigación**: Existen áreas específicas que merecen mayor exploración
3. **Relevancia Práctica**: La información presenta aplicaciones concretas y verificables

## Implicaciones y Perspectivas

### Impacto Inmediato

Los hallazgos relacionados con este tema sugieren que:

- Hay desarrollos activos que requieren seguimiento continuo
- Las tendencias identificadas pueden influir en decisiones futuras
- El conocimiento generado contribuye al entendimiento del campo

### Consideraciones para el Futuro

Basado en el análisis realizado sobre **${topic}**, se recomienda:

1. **Monitoreo Activo**: Seguir de cerca los desarrollos en esta área específica
2. **Investigación Complementaria**: Buscar fuentes adicionales que complementen estos hallazgos
3. **Aplicación Práctica**: Evaluar cómo estos insights pueden aplicarse en contextos reales

## Fuente y Verificación

${url ? `**Fuente original:** [${url}](${url})` : 'Información procesada y verificada automáticamente'}
${author ? `**Autor:** ${author}` : ''}

## Conclusión

Este análisis de **${topic}** proporciona una base sólida para comprender los aspectos más relevantes del tema. La información recopilada y procesada ofrece perspectivas valiosas que pueden servir como punto de partida para investigaciones más profundas o decisiones informadas.

La calidad y relevancia del contenido analizado confirman su valor para el desarrollo de conocimiento en esta área específica.

---

*Artículo generado automáticamente basado en investigación y análisis de contenido relevante. Se recomienda verificación adicional para aplicaciones específicas.*`;
};

export default function ArticlePageContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const initialTitle = searchParams.get('title');
  const url = searchParams.get('url');
  const content = searchParams.get('content');
  const author = searchParams.get('author');
  const score = searchParams.get('score');
  const publishedDate = searchParams.get('publishedDate');
  const reasoning = searchParams.get('reasoning');
  const [loading, setLoading] = useState(true);
  const [generatedArticle, setGeneratedArticle] = useState<string>('');
  const [currentArticleTitle, setCurrentArticleTitle] = useState<string | null>(initialTitle);

  // Estado para la generación de títulos
  const [numTitlesToGenerate, setNumTitlesToGenerate] = useState<number>(3);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  // Estados para funcionalidades mejoradas
  const [tableOfContents, setTableOfContents] = useState<{id: string, title: string, level: number}[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  // Calcular tiempo estimado de lectura
  const calculateReadingTime = useCallback((text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  }, []);

  const generateAndSetArticle = useCallback(() => {
    if (!topic || !currentArticleTitle || !content) {
      setLoading(false);
      return;
    }
    const structuredArticle = generateStructuredArticle(topic, currentArticleTitle, content, reasoning, publishedDate, score, url, author);
    setGeneratedArticle(structuredArticle);
    
    // Generar tabla de contenidos
    const lines = structuredArticle.split('\n');
    const toc = lines
      .map((line, index) => {
        if (line.startsWith('## ')) {
          return { id: `section-${index}`, title: line.replace('## ', ''), level: 2 };
        }
        if (line.startsWith('### ')) {
          return { id: `section-${index}`, title: line.replace('### ', ''), level: 3 };
        }
        return null;
      })
      .filter(Boolean) as {id: string, title: string, level: number}[];
    
    setTableOfContents(toc);
    setLoading(false);
  }, [topic, currentArticleTitle, content, reasoning, publishedDate, score, url, author]);

  useEffect(() => {
    // Generación inicial del artículo
    setLoading(true);
    const timer = setTimeout(() => {
      generateAndSetArticle();
    }, 500);

    return () => clearTimeout(timer);
  }, [generateAndSetArticle]);

  // Scroll tracking para progress y active section
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;

      const article = articleRef.current;
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / documentHeight) * 100;
      setReadingProgress(Math.min(progress, 100));

      // Detectar sección activa
      const sections = article.querySelectorAll('h2, h3');
      let current = '';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          current = section.id;
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const handleGenerateTitles = async () => {
    if (!content || numTitlesToGenerate <= 0) {
      setTitleError('El contenido del artículo no puede estar vacío y debe solicitar al menos 1 título.');
      return;
    }
    setIsGeneratingTitles(true);
    setTitleError(null);
    setSuggestedTitles([]);

    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleContent: content, numTitles: numTitlesToGenerate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      if (data.titles && data.titles.length > 0) {
        setSuggestedTitles(data.titles);
      } else {
        setTitleError('No se pudieron generar títulos. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Failed to generate titles:', err);
      setTitleError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleTitleSelection = (newTitle: string) => {
    setCurrentArticleTitle(newTitle);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Aquí se podría implementar lógica para guardar en localStorage o backend
  };

  const handleDownloadText = () => {
    const articleContent = `${currentArticleTitle || `Investigación sobre ${topic}`}\n\n${generatedArticle}`;
    const blob = new Blob([articleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${topic?.replace(/\s+/g, '-').toLowerCase() || 'articulo'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    try {
      // Crear el contenido HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${currentArticleTitle || `Investigación sobre ${topic}`}</title>
          <style>
            body { 
              font-family: 'Segoe UI', system-ui, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px; 
            }
            h1 { 
              color: #1e40af; 
              border-bottom: 3px solid #3b82f6; 
              padding-bottom: 10px; 
              margin-bottom: 30px; 
            }
            h2 { 
              color: #1f2937; 
              border-left: 4px solid #3b82f6; 
              padding-left: 16px; 
              margin-top: 40px; 
              margin-bottom: 20px; 
            }
            h3 { 
              color: #374151; 
              border-left: 2px solid #8b5cf6; 
              padding-left: 12px; 
              margin-top: 30px; 
            }
            p { margin-bottom: 16px; }
            strong { background-color: #fef3c7; padding: 2px 4px; border-radius: 3px; }
            ul, ol { margin: 16px 0; padding-left: 24px; }
            li { margin-bottom: 8px; }
            hr { 
              border: none; 
              height: 2px; 
              background: #e5e7eb; 
              margin: 40px 0; 
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 12px; 
              color: #6b7280; 
              text-align: center; 
            }
          </style>
        </head>
        <body>
          ${generatedArticle.split('\n').map(line => {
            if (line.trim() === '') return '<br>';
            if (line.startsWith('# ')) return `<h1>${line.replace('# ', '')}</h1>`;
            if (line.startsWith('## ')) return `<h2>${line.replace('## ', '')}</h2>`;
            if (line.startsWith('### ')) return `<h3>${line.replace('### ', '')}</h3>`;
            if (line.match(/^\d+\.\s/)) return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
            if (line.startsWith('- ')) return `<li>${line.replace('- ', '')}</li>`;
            if (line.startsWith('---')) return '<hr>';
            if (line.startsWith('*') && line.endsWith('*')) {
              return `<p style="font-style: italic; background: #f3f4f6; padding: 16px; border-left: 4px solid #9ca3af; margin: 20px 0;">${line.replace(/^\*/, '').replace(/\*$/, '')}</p>`;
            }
            if (line.trim()) {
              const processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
              return `<p>${processedLine}</p>`;
            }
            return '';
          }).join('')}
          <div class="footer">
            <p>Artículo generado por Infobae AI el ${new Date().toLocaleDateString('es-ES')}</p>
            <p>Investigación sobre: ${topic}</p>
          </div>
        </body>
        </html>
      `;

      // Crear y descargar el archivo HTML que se puede convertir a PDF
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${topic?.replace(/\s+/g, '-').toLowerCase() || 'articulo'}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mostrar instrucciones al usuario
      setTimeout(() => {
        alert('Se ha descargado el archivo HTML. Para convertirlo a PDF:\n\n1. Abre el archivo en tu navegador\n2. Presiona Ctrl+P (Cmd+P en Mac)\n3. Selecciona "Guardar como PDF" como destino\n4. Ajusta los márgenes si es necesario\n5. Guarda el archivo');
      }, 500);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  if (!topic || !initialTitle) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">No se encontró el tema</h1>
          <p className="text-gray-600 mb-6">No se proporcionó información suficiente para generar el artículo.</p>
          <Link href="/investigation">
            <Button>Volver a Investigación</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 sticky top-1 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <Link href="/investigation" className="flex items-center hover:text-blue-600 transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/research?topic=${encodeURIComponent(topic || '')}`} className="flex items-center hover:text-blue-600 transition-colors">
              <Search className="h-4 w-4 mr-1" />
              Investigación
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Artículo</span>
          </nav>

          {/* Header Content */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Infobae AI</h1>
                  <p className="text-xs text-gray-500">Artículo generado con IA</p>
                </div>
              </div>

              {/* Article Meta */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {calculateReadingTime(generatedArticle)} min lectura
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  Vista previa
                </div>
                {score && (
                  <Badge variant="outline" className="text-xs">
                    Calidad: {score}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? 'text-yellow-600' : ''}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyUrl}
                className="relative"
              >
                {copySuccess ? (
                  <CheckCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={handleDownloadText} title="Descargar como texto">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Table of Contents */}
        {!loading && tableOfContents.length > 0 && (
          <aside className={`hidden lg:block sticky top-20 h-fit transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className={`flex items-center ${isSidebarOpen ? 'justify-between mb-4' : 'justify-center'}`}>
                  {isSidebarOpen && (
                    <h3 className="font-semibold text-gray-900">
                      Índice del artículo
                    </h3>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`${isSidebarOpen ? 'p-1' : 'p-2'} hover:bg-gray-100`}
                    title={isSidebarOpen ? "Contraer índice" : "Expandir índice"}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
                
                {isSidebarOpen && (
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeSection === item.id
                            ? 'bg-blue-100 text-blue-900 border-l-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        } ${item.level === 3 ? 'ml-4' : ''}`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                )}
              </div>

              {/* Reading Progress */}
              {isSidebarOpen && (
                <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso de lectura</span>
                    <span className="text-sm text-gray-500">{Math.round(readingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${!loading && tableOfContents.length > 0 ? 'lg:ml-4' : ''}`}>
          <div className="p-4 md:p-6">
            {/* Article Source Info */}
            {currentArticleTitle && (
              <Card className="mb-6 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-3 text-gray-900">
                        {currentArticleTitle}
                      </CardTitle>
                      <CardDescription className="text-base text-gray-700">
                        Investigación sobre: <strong>{topic}</strong>
                      </CardDescription>
                      {reasoning && (
                        <div className="mt-3 p-3 bg-white rounded-lg border">
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">Criterio de selección:</strong> {reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1" />
                        Recomendado
                      </Badge>
                      {score && (
                        <Badge variant="outline" className="text-center">
                          Puntuación: {score}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {publishedDate 
                            ? `${new Date(publishedDate).toLocaleDateString('es-ES')}`
                            : 'Generado hoy'
                          }
                        </span>
                      </div>
                      {author && (
                        <div className="flex items-center">
                          <span className="font-medium">Por: {author}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        <span>{calculateReadingTime(generatedArticle)} min</span>
                      </div>
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver fuente original
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Title Generation Section */}
            <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-yellow-400">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Generador de Títulos Alternativos
                </CardTitle>
                <CardDescription>
                  Experimenta con diferentes títulos para encontrar el más impactante.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Label htmlFor="numTitles" className="whitespace-nowrap font-medium">Cantidad:</Label>
                  <Input 
                    id="numTitles"
                    type="number" 
                    value={numTitlesToGenerate} 
                    onChange={(e) => setNumTitlesToGenerate(Math.max(1, Math.min(10, parseInt(e.target.value, 10))))} 
                    min="1" 
                    max="10"
                    className="w-20"
                  />
                  <Button 
                    onClick={handleGenerateTitles} 
                    disabled={isGeneratingTitles || !content}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isGeneratingTitles ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                    ) : (
                      'Generar Títulos'
                    )}
                  </Button>
                </div>

                {titleError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">Error: {titleError}</p>
                  </div>
                )}

                {suggestedTitles.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h4 className="font-medium text-gray-800">Títulos Sugeridos:</h4>
                    <RadioGroup value={currentArticleTitle || undefined} onValueChange={handleTitleSelection}>
                      {suggestedTitles.map((sTitle, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors">
                          <RadioGroupItem value={sTitle} id={`title-${index}`} />
                          <Label htmlFor={`title-${index}`} className="font-normal cursor-pointer flex-1 text-gray-800">
                            {sTitle}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <p className="text-xs text-gray-500 bg-white p-2 rounded border">
                      💡 Selecciona un título para regenerar automáticamente el artículo.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Article Content */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
              {/* Article Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 mr-2" />
                    <span className="text-sm font-medium opacity-90">Artículo Generado con IA</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                    {currentArticleTitle || `Investigación sobre ${topic}`}
                  </h1>
                  <p className="text-lg opacity-90 max-w-3xl">
                    Análisis detallado basado en investigación avanzada sobre <strong>{topic}</strong>
                  </p>
                  
                  {/* Article Stats */}
                  <div className="flex items-center space-x-6 mt-6 text-sm opacity-90">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {calculateReadingTime(generatedArticle)} min de lectura
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {generatedArticle.split(' ').length} palabras
                    </div>
                    {publishedDate && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(publishedDate).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Article Body */}
              <div className="p-8 md:p-12" ref={articleRef}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                      <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
                    </div>
                    <p className="text-xl text-gray-700 mt-6 font-medium">Generando artículo estructurado...</p>
                    <p className="text-sm text-gray-500 mt-2">Procesando y organizando la información</p>
                  </div>
                ) : (
                  <article className="prose prose-lg prose-blue max-w-none">
                    <div className="space-y-8">
                      {generatedArticle.split('\n').map((line, index) => {
                        if (line.trim() === '') return <br key={index} />;
                        
                        if (line.startsWith('# ')) {
                          return (
                            <h1 
                              key={index} 
                              id={`section-${index}`}
                              className="text-4xl font-bold mb-8 text-gray-900 border-b-2 border-gray-200 pb-4"
                            >
                              {line.replace('# ', '')}
                            </h1>
                          );
                        }
                        if (line.startsWith('## ')) {
                          return (
                            <h2 
                              key={index} 
                              id={`section-${index}`}
                              className="text-3xl font-semibold mb-6 mt-12 text-gray-800 border-l-4 border-blue-500 pl-4 bg-blue-50 py-3 rounded-r-lg"
                            >
                              {line.replace('## ', '')}
                            </h2>
                          );
                        }
                        if (line.startsWith('### ')) {
                          return (
                            <h3 
                              key={index} 
                              id={`section-${index}`}
                              className="text-2xl font-semibold mb-4 mt-8 text-gray-700 border-l-2 border-purple-400 pl-3"
                            >
                              {line.replace('### ', '')}
                            </h3>
                          );
                        }
                        if (line.match(/^\d+\.\s/)) {
                          return (
                            <li key={index} className="mb-3 text-gray-700 list-decimal list-inside bg-gray-50 p-3 rounded-lg">
                              {line.replace(/^\d+\.\s/, '')}
                            </li>
                          );
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <li key={index} className="mb-3 text-gray-700 list-disc list-inside ml-4 relative">
                              <span className="absolute -left-4 text-blue-600">•</span>
                              {line.replace('- ', '')}
                            </li>
                          );
                        }
                        if (line.startsWith('---')) {
                          return <hr key={index} className="my-12 border-gray-300 border-t-2" />;
                        }
                        if (line.startsWith('*') && line.endsWith('*')) {
                          return (
                            <div key={index} className="my-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-gray-400 rounded-r-lg">
                              <p className="text-sm text-gray-600 italic">
                                {line.replace(/^\*/, '').replace(/\*$/, '')}
                              </p>
                            </div>
                          );
                        }
                        
                        // Procesar texto con markdown básico
                        const processMarkdown = (text: string) => {
                          const parts = text.split(/(\*\*[^*]+\*\*)/);
                          return parts.map((part, i) => 
                            part.startsWith('**') && part.endsWith('**') 
                              ? <strong key={i} className="text-gray-900 bg-yellow-100 px-1 rounded">{part.slice(2, -2)}</strong> 
                              : part
                          );
                        };
                        
                        if (line.trim()) {
                          return (
                            <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">
                              {processMarkdown(line)}
                            </p>
                          );
                        }
                        return null;
                      }).filter(Boolean)}
                    </div>
                  </article>
                )}
              </div>
            </div>

            {/* Enhanced Actions Section */}
            <div className="mt-8 bg-white rounded-xl shadow-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Te resultó útil este artículo?</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 mb-3">Acciones rápidas</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBookmark}
                      className={`${isBookmarked ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}`}
                    >
                      <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Guardado' : 'Guardar'}
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                      {copySuccess ? (
                        <>
                          <CheckCheck className="h-4 w-4 mr-1 text-green-600" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar enlace
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Compartir
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF} title="Descargar como PDF">
                      <Download className="h-4 w-4 mr-1" />
                      Descargar PDF
                    </Button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 mb-3">Continuar investigando</h4>
                  <div className="space-y-2">
                    <Link href={`/research?topic=${encodeURIComponent(topic)}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <Search className="h-4 w-4 mr-2" />
                        Ver más resultados sobre {topic}
                      </Button>
                    </Link>
                    
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Leer fuente original
                        </Button>
                      </a>
                    )}
                    
                    <Link href="/investigation">
                      <Button variant="outline" className="w-full justify-start">
                        <Home className="h-4 w-4 mr-2" />
                        Nueva investigación
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 