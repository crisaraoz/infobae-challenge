import { useState, useCallback } from 'react';
import { useChat } from 'ai/react';

export function useOpenAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { messages, append, isLoading } = useChat({
    api: '/api/chat',
    onFinish: () => {
      setError(null);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Error en useChat:', error);
      setError('Error: No se pudo generar el contenido. Verifica tu configuración de OpenAI o intenta más tarde.');
      setIsGenerating(false);
    }
  });

  const generateFromUrl = useCallback(async (url: string, prompt?: string) => {
    setError(null);
    setIsGenerating(true);

    const customPrompt = prompt || 'Genera un artículo periodístico completo basado en el contenido de esta URL.';
    
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

    try {
      await append({
        role: 'user',
        content: fullPrompt
      });
    } catch (error) {
      console.error('Error al generar desde URL:', error);
      setError('Error: No se pudo procesar la URL. Verifica que sea válida e intenta de nuevo.');
      setIsGenerating(false);
    }
  }, [append]);

  const generateFromImage = useCallback(async (image: File, prompt?: string) => {
    setError(null);
    setIsGenerating(true);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('prompt', prompt || 'Analiza esta imagen y genera un artículo periodístico completo basado en lo que observas.');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(`Error: ${data.error}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error:', error);
      setError('Error al generar el artículo desde la imagen.');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading: isLoading || isGenerating,
    error,
    generateFromUrl,
    generateFromImage,
    clearError
  };
} 