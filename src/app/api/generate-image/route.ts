import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen es requerida' },
        { status: 400 }
      );
    }

    // Verificar si OpenAI está disponible
    if (!process.env.OPENAI_API_KEY) {
      const mockArticle = generateMockArticle(prompt);
      return NextResponse.json({ 
        article: mockArticle,
        note: 'Artículo generado en modo demostración (API key no configurada)'
      });
    }

    try {
      // Convertir imagen a base64
      const imageBuffer = await image.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = image.type || 'image/jpeg';
      
      const customPrompt = prompt || 'Analiza esta imagen y genera un artículo periodístico completo basado en lo que observas.';
      
      const result = await generateText({
        model: openai('gpt-4o'), // GPT-4 Vision para análisis de imágenes
        messages: [
          {
            role: 'system',
            content: `Eres un periodista profesional experto en análisis visual y creación de artículos informativos. 
            Tu tarea es analizar la imagen proporcionada y crear un artículo periodístico completo, bien estructurado y profesional.
            
            Instrucciones:
            - Analiza detalladamente los elementos visuales de la imagen
            - Crea un artículo periodístico completo con título, introducción, desarrollo y conclusión
            - Mantén un tono profesional e informativo
            - Incluye contexto relevante cuando sea apropiado
            - Estructura el contenido con títulos y subtítulos usando formato markdown
            - El artículo debe ser original y basado en tu análisis de la imagen`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: customPrompt
              },
              {
                type: 'image',
                image: `data:${mimeType};base64,${base64Image}`
              }
            ]
          }
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      return NextResponse.json({ 
        article: result.text,
        note: 'Artículo generado con OpenAI GPT-4 Vision'
      });
      
    } catch (error: unknown) {
      console.error('Error con OpenAI, usando artículo de demostración:', error);
      
      // Si hay error con OpenAI, usar mock
      const mockArticle = generateMockArticle(prompt);
      return NextResponse.json({ 
        article: mockArticle,
        note: 'Artículo generado en modo demostración (error con OpenAI API)'
      });
    }

  } catch (error) {
    console.error('Error en API de generación desde imagen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function generateMockArticle(prompt?: string): string {
  const customSection = prompt ? 
    `\n## Análisis Personalizado\n${prompt}\n\nEste análisis se basa en las especificaciones proporcionadas, adaptando el contenido visual a los requerimientos periodísticos solicitados.` : 
    '';

  return `# Análisis Visual: Una Perspectiva Periodística

## Introducción
En el mundo actual, las imágenes han adquirido un papel fundamental en la comunicación y el periodismo. Este análisis presenta una interpretación profesional del contenido visual proporcionado.

## Observaciones Principales
La imagen presenta elementos significativos que merecen atención desde una perspectiva informativa. Los detalles visuales revelan aspectos importantes que pueden contextualizarse dentro del panorama actual.

## Contexto y Relevancia
Este tipo de contenido visual se enmarca dentro de las tendencias contemporáneas de comunicación, donde la imagen trasciende su función decorativa para convertirse en un vehículo de información.
${customSection}

## Implicaciones
Las características observadas sugieren conexiones con temas de actualidad y relevancia social, proporcionando una ventana a aspectos importantes de nuestra realidad.

## Conclusión
El análisis visual revela la complejidad inherente en la interpretación de contenido gráfico, destacando la importancia del contexto en la comprensión de mensajes visuales en el ámbito periodístico.

*Nota: Este es un artículo de demostración. Para análisis detallados con IA, configura tu API key de OpenAI con cuota disponible.*`;
} 