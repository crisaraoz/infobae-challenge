'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Star, FileText, Sparkles, Lightbulb, Loader2 } from 'lucide-react';
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

  const generateAndSetArticle = useCallback(() => {
    if (!topic || !currentArticleTitle || !content) {
      setLoading(false);
      return;
    }
    const structuredArticle = generateStructuredArticle(topic, currentArticleTitle, content, reasoning, publishedDate, score, url, author);
    setGeneratedArticle(structuredArticle);
    setLoading(false);
  }, [topic, currentArticleTitle, content, reasoning, publishedDate, score, url, author]);

  useEffect(() => {
    // Generación inicial del artículo
    setLoading(true);
    const timer = setTimeout(() => {
      generateAndSetArticle();
    }, 500); // Temporizador reducido, la generación de contenido es rápida

    return () => clearTimeout(timer);
  }, [generateAndSetArticle]); // Vuelve a ejecutar si el título cambia

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <Link href={`/research?topic=${encodeURIComponent(topic || '')}`}>
            <Button variant="outline" className="mb-6">
              ← Volver a Resultados
            </Button>
          </Link>
          
          {/* Info del artículo */}
          {currentArticleTitle && (
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">Fuente de Investigación</CardTitle>
                    <CardDescription className="text-base text-gray-700 font-medium">
                      {currentArticleTitle}
                    </CardDescription>
                    {reasoning && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Criterio:</strong> {reasoning}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      Vale la pena expandir
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
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {publishedDate 
                        ? `Publicado: ${new Date(publishedDate).toLocaleDateString('es-ES')}`
                        : 'Generado automáticamente'
                      }
                    </span>
                    {author && (
                      <span className="ml-4">
                        <strong>Autor:</strong> {author}
                      </span>
                    )}
                  </div>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver fuente original
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Title Generation Section */}
        <Card className="my-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Sugerencia de Títulos (Opcional)
            </CardTitle>
            <CardDescription>
              Genera títulos alternativos para tu artículo basados en el contenido actual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Label htmlFor="numTitles" className="whitespace-nowrap">Número de títulos:</Label>
              <Input 
                id="numTitles"
                type="number" 
                value={numTitlesToGenerate} 
                onChange={(e) => setNumTitlesToGenerate(Math.max(1, Math.min(10, parseInt(e.target.value, 10))))} 
                min="1" 
                max="10"
                className="w-20"
              />
              <Button onClick={handleGenerateTitles} disabled={isGeneratingTitles || !content}>
                {isGeneratingTitles ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                ) : (
                  'Generar Títulos'
                )}
              </Button>
            </div>

            {titleError && (
              <p className="text-sm text-red-600">Error: {titleError}</p>
            )}

            {suggestedTitles.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="font-medium text-gray-800">Títulos Sugeridos:</h4>
                <RadioGroup value={currentArticleTitle || undefined} onValueChange={handleTitleSelection}>
                  {suggestedTitles.map((sTitle, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50">
                      <RadioGroupItem value={sTitle} id={`title-${index}`} />
                      <Label htmlFor={`title-${index}`} className="font-normal cursor-pointer flex-1">
                        {sTitle}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                 <p className="text-xs text-gray-500 pt-1">Selecciona un título para actualizar el artículo.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contenido del artículo */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center mb-2">
              <Sparkles className="h-6 w-6 mr-2" />
              <span className="text-sm font-medium opacity-90">Artículo Generado con IA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {currentArticleTitle || `Investigación sobre ${topic}`}
            </h1>
            <p className="mt-2 opacity-90">
              Análisis basado en la investigación sobre <strong>{topic}</strong>
            </p>
          </div>

          <div className="p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-lg text-gray-600">Generando artículo estructurado...</p>
                <p className="text-sm text-gray-500 mt-2">Procesando información de la investigación</p>
              </div>
            ) : (
              <article className="prose prose-lg max-w-none">
                <div className="space-y-6">
                  {generatedArticle.split('\n').map((line, index) => {
                    if (line.trim() === '') return <br key={index} />;
                    
                    if (line.startsWith('# ')) {
                      return (
                        <h1 key={index} className="text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">
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
                    if (line.match(/^\d+\.\s/)) {
                      return (
                        <li key={index} className="mb-2 text-gray-700 list-decimal list-inside">
                          {line.replace(/^\d+\.\s/, '')}
                        </li>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={index} className="mb-2 text-gray-700 list-disc list-inside">
                          {line.replace('- ', '')}
                        </li>
                      );
                    }
                    if (line.startsWith('---')) {
                      return <hr key={index} className="my-8 border-gray-200" />;
                    }
                    if (line.startsWith('*') && line.endsWith('*')) {
                      return (
                        <p key={index} className="text-sm text-gray-500 italic mb-4 border-l-4 border-gray-200 pl-4">
                          {line.replace(/^\*/, '').replace(/\*$/, '')}
                        </p>
                      );
                    }
                    
                    // Procesar texto con markdown básico
                    const processMarkdown = (text: string) => {
                      const parts = text.split(/(\*\*[^*]+\*\*)/);
                      return parts.map((part, i) => 
                        part.startsWith('**') && part.endsWith('**') 
                          ? <strong key={i} className="text-gray-900">{part.slice(2, -2)}</strong> 
                          : part
                      );
                    };
                    
                    if (line.trim()) {
                      return (
                        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
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

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href={`/research?topic=${encodeURIComponent(topic)}`}>
            <Button variant="outline">
              Ver más resultados sobre {topic}
            </Button>
          </Link>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Leer fuente original
              </Button>
            </a>
          )}
        </div>
      </div>
    </main>
  );
} 