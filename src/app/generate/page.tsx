'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, Upload, FileText, Loader2, Globe, Image as ImageIcon, AlertCircle, Lightbulb } from 'lucide-react';
import { useChat } from 'ai/react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

export default function GeneratePage() {
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [activeTab, setActiveTab] = useState('url');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Estados para títulos dinámicos
  const [numTitlesToGenerate, setNumTitlesToGenerate] = useState<number>(3);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState<boolean>(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  // Ref para scroll automático
  const titlesSectionRef = useRef<HTMLDivElement>(null);

  const { messages, append, isLoading } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      console.log('Artículo generado:', message.content);
      setError(null); // Limpiar errores si todo va bien
      // Scroll automático cuando se complete la generación desde URL
      setTimeout(() => {
        titlesSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
    },
    onError: (error) => {
      console.error('Error en useChat:', error);
      setError('Error: No se pudo generar el artículo. Verifica tu configuración de OpenAI o intenta más tarde.');
    }
  });

  const handleGenerateFromUrl = async () => {
    if (!url) return;
    
    setError(null); // Limpiar errores anteriores
    setGeneratedArticle(''); // Limpiar artículo anterior
    setSuggestedTitles([]); // Limpiar títulos anteriores
    setSelectedTitle(''); // Limpiar título seleccionado
    
    const customPrompt = prompt || 'Genera un artículo periodístico completo basado en el contenido de esta URL.';
    
    try {
      // Construir prompt completo para extraer contenido de URL
      const fullPrompt = `
Actúa como un periodista profesional. Tu tarea es:

1. Extraer el contenido principal de esta URL: ${url}
2. Crear un artículo periodístico completo basado en ese contenido

Instrucciones específicas:
${customPrompt}

Formato esperado:
- Título atractivo
- Introducción
- Desarrollo en secciones
- Conclusión
- Tono profesional y periodístico

URL a analizar: ${url}
      `;

      await append({
        role: 'user',
        content: fullPrompt
      });
    } catch (error) {
      console.error('Error al generar desde URL:', error);
      setError('Error: No se pudo procesar la URL. Verifica que sea válida e intenta de nuevo.');
    }
  };

  const handleGenerateFromImage = async () => {
    if (!selectedImage) return;
    
    setError(null); // Limpiar errores anteriores
    setGeneratedArticle(''); // Limpiar artículo anterior
    setSuggestedTitles([]); // Limpiar títulos anteriores
    setSelectedTitle(''); // Limpiar título seleccionado
    setIsGeneratingFromImage(true); // Activar loading state
    
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('prompt', prompt || 'Analiza esta imagen y genera un artículo periodístico completo basado en lo que observas.');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.article) {
        setGeneratedArticle(data.article);
        setError(null);
        // Scroll automático cuando se complete la generación desde imagen
        setTimeout(() => {
          titlesSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 500);
      } else if (data.error) {
        setError(`Error: ${data.error}`);
        setGeneratedArticle('');
      } else {
        setError('Error: Respuesta inesperada del servidor');
        setGeneratedArticle('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al generar el artículo desde la imagen.');
      setGeneratedArticle('');
    } finally {
      setIsGeneratingFromImage(false); // Desactivar loading state
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setError(null); // Limpiar errores al subir nueva imagen
      setSuggestedTitles([]); // Limpiar títulos al cambiar imagen
      setSelectedTitle(''); // Limpiar título seleccionado
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedImage(file);
    setError(null);
    setSuggestedTitles([]); // Limpiar títulos al cambiar imagen
    setSelectedTitle(''); // Limpiar título seleccionado
    
    // Crear preview de la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      } else {
        setError('Por favor, selecciona solo archivos de imagen.');
      }
    }
  };

  // Funciones para títulos dinámicos
  const handleGenerateTitles = async () => {
    const articleContent = getArticleContent();
    if (!articleContent || numTitlesToGenerate <= 0) {
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
        body: JSON.stringify({ articleContent, numTitles: numTitlesToGenerate }),
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
    setSelectedTitle(newTitle);
  };

  const getArticleContent = () => {
    if (activeTab === 'image' && generatedArticle) {
      return generatedArticle;
    }
    const latestMessage = messages.find(msg => msg.role === 'assistant');
    return latestMessage?.content || '';
  };

  const formatArticle = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      
      // Detectar títulos (líneas que empiezan con #)
      if (paragraph.startsWith('#')) {
        const level = paragraph.match(/^#+/)?.[0].length || 1;
        const title = paragraph.replace(/^#+\s*/, '');
        
        if (level === 1) {
          return (
            <h1 key={index} className="text-2xl font-bold mb-4">
              {title}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 key={index} className="text-xl font-bold mb-4">
              {title}
            </h2>
          );
        } else {
          return (
            <h3 key={index} className="text-lg font-bold mb-4">
              {title}
            </h3>
          );
        }
      }
      
      // Párrafos normales
      return (
        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
          {paragraph}
        </p>
      );
    }).filter(Boolean);
  };

  const formatArticleWithTitle = (text: string, newTitle?: string) => {
    const lines = text.split('\n');
    let formattedText = text;
    
    // Si hay un nuevo título seleccionado, reemplazar el primer H1
    if (newTitle) {
      const firstH1Index = lines.findIndex(line => line.startsWith('# '));
      if (firstH1Index !== -1) {
        lines[firstH1Index] = `# ${newTitle}`;
        formattedText = lines.join('\n');
      } else {
        // Si no hay H1, agregar el título al principio
        formattedText = `# ${newTitle}\n\n${text}`;
      }
    }
    
    return formatArticle(formattedText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/investigation" className="text-blue-600 hover:text-blue-800">
              ← Volver a Investigación
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generación de Artículos con IA
          </h1>
          <p className="text-gray-600">
            Genera artículos periodísticos desde URLs o imágenes usando inteligencia artificial
          </p>
        </div>

        {/* Mostrar errores */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de entrada */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Generador de Artículos
              </CardTitle>
              <CardDescription className="text-sm">
                Elige entre analizar una URL o subir una imagen para generar contenido
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="url" className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    Desde URL
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4" />
                    Desde Imagen
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      URL del artículo o página web
                    </label>
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/articulo"
                      value={url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Prompt personalizado (opcional)
                    </label>
                    <Textarea
                      placeholder="Describe cómo quieres que sea el artículo generado..."
                      value={prompt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                      className="w-full min-h-[80px]"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerateFromUrl}
                    disabled={!url || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        Generar desde URL
                      </>
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Subir imagen
                    </label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        isDragOver 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      
                      {!selectedImage ? (
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-600 text-sm">
                            Haz clic para subir una imagen o arrastra y suelta
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF hasta 10MB
                          </p>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          {/* Previsualización de la imagen */}
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              {imagePreview && (
                                <Image 
                                  src={imagePreview}
                                  alt="Preview"
                                  className="max-w-full max-h-32 object-contain rounded-lg shadow-md"
                                  width={150}
                                  height={120}
                                  unoptimized
                                />
                              )}
                            </div>
                            <div className="mt-2 text-center">
                              <Badge variant="secondary" className="text-xs">
                                {selectedImage.name}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          
                          {/* Botón para cambiar imagen */}
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                              <Upload className="h-3 w-3 mr-1.5" />
                              Cambiar imagen
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Prompt personalizado (opcional)
                    </label>
                    <Textarea
                      placeholder="Describe qué tipo de artículo quieres generar basado en la imagen..."
                      value={prompt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                      className="w-full min-h-[80px]"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerateFromImage}
                    disabled={!selectedImage || isGeneratingFromImage}
                    className="w-full"
                  >
                    {isGeneratingFromImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Generar desde Imagen
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Panel de resultado */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Artículo Generado</CardTitle>
              <CardDescription className="text-sm">
                El contenido aparecerá aquí una vez generado
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {(isLoading || isGeneratingFromImage) && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-3" />
                    <p className="text-gray-600 text-sm">
                      {isLoading ? 'Analizando URL y generando artículo...' : 'Analizando imagen y generando artículo...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Esto puede tomar algunos segundos
                    </p>
                  </div>
                </div>
              )}

              {/* Mostrar mensajes de useChat */}
              {!isLoading && !isGeneratingFromImage && messages.map((message, index) => (
                <div key={index} className="mb-4">
                  {message.role === 'assistant' && (
                    <div className="prose prose-sm max-w-none">
                      {formatArticleWithTitle(message.content, selectedTitle)}
                    </div>
                  )}
                </div>
              ))}

              {/* Mostrar artículo generado de imagen */}
              {!isGeneratingFromImage && generatedArticle && activeTab === 'image' && (
                <div className="prose prose-sm max-w-none">
                  {formatArticleWithTitle(generatedArticle, selectedTitle)}
                </div>
              )}

              {!isLoading && !isGeneratingFromImage && !generatedArticle && messages.length === 0 && !error && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                  <p className="text-sm">El artículo generado aparecerá aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sección de Títulos Dinámicos - Posicionada arriba del artículo */}
        {((!isLoading && !isGeneratingFromImage && messages.length > 0) || 
          (!isGeneratingFromImage && generatedArticle && activeTab === 'image')) && (
          <Card className="my-8" ref={titlesSectionRef}>
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
                <Button onClick={handleGenerateTitles} disabled={isGeneratingTitles || !getArticleContent()}>
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
                  <RadioGroup value={selectedTitle} onValueChange={handleTitleSelection}>
                    {suggestedTitles.map((sTitle, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50">
                        <RadioGroupItem value={sTitle} id={`title-${index}`} />
                        <Label htmlFor={`title-${index}`} className="font-normal cursor-pointer flex-1">
                          {sTitle}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-gray-500 pt-1">Selecciona un título para actualizar el artículo automáticamente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Artículo Completo - Versión Final */}
        {((!isLoading && !isGeneratingFromImage && messages.length > 0) || 
          (!isGeneratingFromImage && generatedArticle && activeTab === 'image')) && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center mb-2">
                <FileText className="h-6 w-6 mr-2" />
                <span className="text-sm font-medium opacity-90">Artículo Generado con IA</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {selectedTitle || 'Artículo Generado'}
              </h1>
              <p className="mt-2 opacity-90">
                Análisis basado en {activeTab === 'url' ? 'contenido web' : 'imagen analizada'}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <article className="prose prose-lg max-w-none">
                <div className="space-y-6">
                  {/* Contenido del artículo */}
                  {activeTab === 'url' && messages.map((message, index) => (
                    message.role === 'assistant' && (
                      <div key={index}>
                        {formatArticleWithTitle(message.content, selectedTitle)}
                      </div>
                    )
                  ))}
                  
                  {activeTab === 'image' && generatedArticle && (
                    <div>
                      {formatArticleWithTitle(generatedArticle, selectedTitle)}
                    </div>
                  )}
                </div>
              </article>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 