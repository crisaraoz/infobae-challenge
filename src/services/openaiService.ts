import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY no encontrada. Las funciones de IA estarán limitadas.');
    }
  }

  /**
   * Verifica si OpenAI está disponible
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Genera texto usando GPT-3.5
   */
  async generateText(prompt: string, options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key no configurada');
    }

    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 2000
    } = options;

    try {
      const result = await generateText({
        model: openai(model),
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente útil y profesional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        maxTokens,
      });

      return result.text;
    } catch (error) {
      console.error('Error en generateText:', error);
      throw error;
    }
  }

  /**
   * Analiza una imagen usando GPT-4 Vision
   */
  async analyzeImage(imageBase64: string, prompt: string, mimeType: string = 'image/jpeg'): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key no configurada');
    }

    try {
      const result = await generateText({
        model: openai('gpt-4-vision-preview'),
        messages: [
          {
            role: 'system',
            content: `Eres un periodista profesional experto en análisis visual. 
            Analiza la imagen proporcionada y crea contenido periodístico de alta calidad.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image',
                image: `data:${mimeType};base64,${imageBase64}`
              }
            ]
          }
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      return result.text;
    } catch (error) {
      console.error('Error en analyzeImage:', error);
      throw error;
    }
  }

  /**
   * Genera un artículo periodístico
   */
  async generateArticle(content: string, prompt?: string): Promise<string> {
    const userPrompt = `
${prompt || 'Genera un artículo periodístico completo basado en este contenido.'}

Contenido base:
${content}

Instrucciones:
- Crea un artículo periodístico completo con título, introducción, desarrollo y conclusión
- Mantén un tono profesional e informativo
- Estructura el contenido con títulos y subtítulos usando formato markdown
- El artículo debe ser original y bien documentado
    `;

    return this.generateText(userPrompt, {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000
    });
  }

  /**
   * Extrae contenido de una URL
   */
  async extractContentFromUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Extraer texto básico del HTML
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000); // Limitar contenido

      return textContent;
    } catch (error) {
      console.error('Error extrayendo contenido de URL:', error);
      throw new Error('No se pudo extraer el contenido de la URL');
    }
  }
}

// Instancia singleton
export const openaiService = new OpenAIService(); 