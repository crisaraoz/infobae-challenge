/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Verificar API key
    if (!process.env.OPENAI_API_KEY) {
      // Crear un stream mock para respuesta de demostración
      return createMockStream('# Artículo de Demostración\n\nEste es un artículo generado en modo demostración porque no hay API key configurada.\n\n## Contenido de Ejemplo\n\nAquí iría el contenido del artículo basado en la URL proporcionada.');
    }
    
    try {
      const result = await streamText({
        model: openai('gpt-3.5-turbo'),
        messages,
        temperature: 0.7,
        maxTokens: 2000,
      });

      return result.toDataStreamResponse();
    } catch (error: any) {
      console.error('Error de OpenAI:', error);
      
      // Si hay problema de cuota, devolver stream mock
      if (error?.status === 429 || error?.code === 'insufficient_quota') {
        return createMockStream(`# Artículo de Demostración

## Cuota de OpenAI Excedida

Lo sentimos, la cuota de OpenAI ha sido excedida. Este es un artículo de demostración.

## Contenido de Ejemplo

Aquí se generaría un artículo completo basado en la URL proporcionada, utilizando inteligencia artificial para extraer y resumir el contenido.

### Características del artículo:
- Análisis del contenido de la URL
- Resumen estructurado
- Perspectiva periodística
- Información relevante y actualizada

## Conclusión

Para obtener artículos reales, por favor configura una API key de OpenAI válida con cuota disponible.

*Nota: Este es contenido de demostración generado automáticamente.*`);
      }
      
      // Para otros errores, también devolver stream mock
      return createMockStream('# Error en la Generación\n\nHubo un problema al generar el artículo. Por favor, inténtalo de nuevo más tarde.');
    }
  } catch (error: any) {
    console.error('Error en chat API:', error);
    return createMockStream('# Error del Servidor\n\nHubo un error interno del servidor. Por favor, inténtalo de nuevo.');
  }
}

function createMockStream(content: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Simular streaming palabra por palabra
      const words = content.split(' ');
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < words.length) {
          const word = words[index] + (index < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(`0:${word}\n`));
          index++;
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 50); // 50ms entre palabras para simular streaming
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 