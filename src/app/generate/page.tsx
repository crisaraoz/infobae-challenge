/* eslint-disable jsx-a11y/alt-text */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, Upload, FileText, Loader2, Globe, Image, AlertCircle } from 'lucide-react';
import { useChat } from 'ai/react';

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

  const { messages, append, isLoading } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      console.log('Artículo generado:', message.content);
      setError(null); // Limpiar errores si todo va bien
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de entrada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generador de Artículos
              </CardTitle>
              <CardDescription>
                Elige entre analizar una URL o subir una imagen para generar contenido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Desde URL
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Desde Imagen
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Prompt personalizado (opcional)
                    </label>
                    <Textarea
                      placeholder="Describe cómo quieres que sea el artículo generado..."
                      value={prompt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                      className="w-full min-h-[100px]"
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
                
                <TabsContent value="image" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Subir imagen
                    </label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">
                            Haz clic para subir una imagen o arrastra y suelta
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG, GIF hasta 10MB
                          </p>
                        </label>
                      ) : (
                        <div className="space-y-4">
                          {/* Previsualización de la imagen */}
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <img 
                                src={imagePreview || undefined}
                                alt="Preview"
                                className="max-w-full max-h-48 object-contain rounded-lg shadow-md"
                              />
                            </div>
                            <div className="mt-3 text-center">
                              <Badge variant="secondary" className="mb-2">
                                {selectedImage.name}
                              </Badge>
                              <p className="text-sm text-gray-500">
                                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          
                          {/* Botón para cambiar imagen */}
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                              <Upload className="h-4 w-4 mr-2" />
                              Cambiar imagen
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Prompt personalizado (opcional)
                    </label>
                    <Textarea
                      placeholder="Describe qué tipo de artículo quieres generar basado en la imagen..."
                      value={prompt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                      className="w-full min-h-[100px]"
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
                        <Image className="mr-2 h-4 w-4" />
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
            <CardHeader>
              <CardTitle>Artículo Generado</CardTitle>
              <CardDescription>
                El contenido aparecerá aquí una vez generado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(isLoading || isGeneratingFromImage) && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600">
                      {isLoading ? 'Analizando URL y generando artículo...' : 'Analizando imagen y generando artículo...'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Esto puede tomar algunos segundos
                    </p>
                  </div>
                </div>
              )}

              {/* Mostrar mensajes de useChat */}
              {!isLoading && !isGeneratingFromImage && messages.map((message, index) => (
                <div key={index} className="mb-4">
                  {message.role === 'assistant' && (
                    <div className="prose max-w-none">
                      {formatArticle(message.content)}
                    </div>
                  )}
                </div>
              ))}

              {/* Mostrar artículo generado de imagen */}
              {!isGeneratingFromImage && generatedArticle && activeTab === 'image' && (
                <div className="prose max-w-none">
                  {formatArticle(generatedArticle)}
                </div>
              )}

              {!isLoading && !isGeneratingFromImage && !generatedArticle && messages.length === 0 && !error && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>El artículo generado aparecerá aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 