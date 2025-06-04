/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, Globe, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useChat } from 'ai/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GeneratePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState(''); // Usado para tracking interno y limpieza
  const [activeTab, setActiveTab] = useState('url');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Estados para títulos dinámicos - removidos ya que redirigimos automáticamente
  const [selectedTitle] = useState<string>('');

  // Ref para scroll automático - removido ya que redirigimos automáticamente

  const { messages, append, isLoading } = useChat({ // messages usado internamente por useChat
    api: '/api/chat',
    onFinish: (message) => {
      console.log('Artículo generado:', message.content);
      setError(null); // Limpiar errores si todo va bien
      
      // Redirigir automáticamente a la vista optimizada
      const params = new URLSearchParams({
        topic: url || 'Contenido web',
        title: selectedTitle || 'Artículo Generado con IA',
        content: message.content,
        url: url || '',
        author: 'IA - Infobae Generate',
        score: '100',
        publishedDate: new Date().toISOString(),
        reasoning: 'Artículo generado automáticamente desde contenido web',
        origin: 'generate'
      });
      router.push(`/article?${params.toString()}`);
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
        
        // Redirigir automáticamente a la vista optimizada
        const params = new URLSearchParams({
          topic: 'Imagen analizada',
          title: selectedTitle || 'Artículo Generado con IA',
          content: data.article,
          url: '',
          author: 'IA - Infobae Generate',
          score: '100',
          publishedDate: new Date().toISOString(),
          reasoning: 'Artículo generado automáticamente desde análisis de imagen',
          origin: 'generate'
        });
        router.push(`/article?${params.toString()}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Variables used for internal tracking: generatedArticle, messages */}
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
                        Generando artículo...
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
                        Generando artículo...
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

          {/* Panel de estado de generación */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Estado de la Generación</CardTitle>
              <CardDescription className="text-sm">
                Información sobre el proceso de generación
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {(isLoading || isGeneratingFromImage) ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {isLoading ? 'Analizando URL...' : 'Analizando imagen...'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {isLoading 
                        ? 'Extrayendo contenido y generando artículo periodístico' 
                        : 'Procesando imagen y creando artículo basado en el análisis visual'
                      }
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        ✨ Al completarse, serás redirigido automáticamente a la vista optimizada del artículo
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                    <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Listo para generar
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Introduce una URL o sube una imagen para comenzar a generar tu artículo
                    </p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>Generación automática con IA</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Vista optimizada con navegación</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span>Descarga en PDF y texto</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 