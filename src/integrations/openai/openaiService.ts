import OpenAI from 'openai';

// ==========================================
// CONFIGURACIÓN DE OPENAI
// ==========================================

let openaiInstance: OpenAI | null = null;

const getOpenAI = (): OpenAI | null => {
  if (openaiInstance) return openaiInstance;
  
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    openaiInstance = new OpenAI({
      apiKey: openaiKey,
    });
    return openaiInstance;
  }
  
  console.warn('OPENAI_API_KEY no está configurada. El sumarizado estará limitado.');
  return null;
};

// ==========================================
// FUNCIONES DE OPENAI
// ==========================================

/**
 * Genera una consulta optimizada basada en la pregunta del usuario
 */
export async function generateOptimizedQuery(userQuestion: string): Promise<string> {
  const openai = getOpenAI();
  
  if (!openai) {
    return userQuestion; // Fallback al query original
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates search queries based on user questions. Generate a focused search query for finding recent, relevant news articles and content. Return only the search query, nothing else."
        },
        {
          role: "user",
          content: `Generate a search query for: ${userQuestion}`
        },
      ],
      max_tokens: 50,
    });

    const optimizedQuery = completion.choices[0].message?.content?.trim() || userQuestion;
    return optimizedQuery;
  } catch (error) {
    console.warn('Error generando query optimizada:', error);
    return userQuestion;
  }
}

/**
 * Genera un resumen conciso de un artículo
 */
export async function generateSummary(content: string, title: string = ''): Promise<string> {
  const openai = getOpenAI();
  
  if (!openai) {
    // Generar resumen básico sin OpenAI
    const sentences = content.split('.').filter(s => s.trim().length > 10).slice(0, 3);
    return sentences.join('.') + '.';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente que genera resúmenes concisos de artículos en español. Proporciona un resumen breve que capture los puntos principales en 2-3 oraciones."
        },
        {
          role: "user",
          content: `Título: ${title}\n\nContenido: ${content.substring(0, 3000)}` // Limitar contenido
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    const summary = completion.choices[0].message?.content?.trim() || 'Resumen no disponible';
    return summary;
  } catch (error) {
    console.warn('⚠️ Error generando resumen para:', title, error);
    // Fallback a resumen básico
    const sentences = content.split('.').filter(s => s.trim().length > 10).slice(0, 2);
    return sentences.join('.') + '.';
  }
} 