import { ExaSearchResponse, ExaSearchResult, CategorizedResult } from '@/types';
import OpenAI from 'openai';

export class ExaService {
  private apiKey: string;
  private openai: OpenAI | null = null;

  constructor() {
    this.apiKey = process.env.EXA_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('EXA_API_KEY no está configurada en las variables de entorno');
    }
    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
    } else {
      console.warn('OPENAI_API_KEY no está configurada. El sumarizado estará limitado.');
    }
  }

  // Generar query optimizada con OpenAI
  async generateOptimizedQuery(userQuestion: string): Promise<string> {
    if (!this.openai) {
      return userQuestion; // Fallback al query original
    }

    try {
      const completion = await this.openai.chat.completions.create({
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
      console.log('Query original:', userQuestion);
      console.log('Query optimizada:', optimizedQuery);
      return optimizedQuery;
    } catch (error) {
      console.warn('Error generando query optimizada:', error);
      return userQuestion;
    }
  }

  // Buscar contenido (paso 1: search)
  async searchContent(topic: string, options: {
    numResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
    daysBack?: number;
  } = {}): Promise<ExaSearchResult[]> {
    try {
      const {
        numResults = 10,
        includeDomains = [],
        excludeDomains = [],
        daysBack = 30
      } = options;
      // Generar query optimizada
      const optimizedQuery = await this.generateOptimizedQuery(topic);
      // Calcular fecha de corte (formato YYYY-MM-DD)
      const datecutoff = new Date();
      datecutoff.setDate(datecutoff.getDate() - daysBack);
      const startPublishedDate = datecutoff.toISOString().split('T')[0];

      const requestBody = {
        query: optimizedQuery,
        numResults,
        startPublishedDate,
        type: "neural",
        ...(includeDomains.length > 0 && { includeDomains }),
        ...(excludeDomains.length > 0 && { excludeDomains }),
      };

      console.log('🔍 Realizando búsqueda con:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${process.env.EXA_API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from Exa:', errorText);
        throw new Error(`Error de la API de Exa: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Búsqueda exitosa:', data.results?.length || 0, 'resultados encontrados');
      
      return data.results || [];
    } catch (error) {
      console.error('❌ Error en searchContent:', error);
      throw error;
    }
  }

  // Obtener contenido completo (paso 2: contents)
  async getContents(urls: string[]): Promise<ExaSearchResult[]> {
    if (!urls.length) return [];

    try {
      const requestBody = {
        ids: urls,
        text: true
      };

      console.log('📄 Obteniendo contenido para', urls.length, 'URLs');

      const response = await fetch(`${process.env.EXA_API_BASE_URL}/contents`, {
        method: 'POST',
      headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error obteniendo contenido:', errorText);
        throw new Error(`Error obteniendo contenido: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Contenido obtenido para', data.results?.length || 0, 'artículos');
      
      return data.results || [];
    } catch (error) {
      console.error('❌ Error en getContents:', error);
      return []; // Retornar array vacío en lugar de error
    }
  }

  // Buscar y obtener contenido completo
  async searchAndContents(topic: string, options: {
    numResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
    daysBack?: number;
  } = {}): Promise<ExaSearchResponse> {
    try {
      // Paso 1: Buscar
      const searchResults = await this.searchContent(topic, options);
      if (!searchResults.length) {
        console.log('⚠️ No se encontraron resultados en la búsqueda');
        return { results: [], autopromptString: '' };
      }

      // Paso 2: Obtener contenido completo para los primeros resultados
      const urls = searchResults.slice(0, 5).map(result => result.url).filter(Boolean);
      const contentsResults = await this.getContents(urls);
      // Combinar resultados de búsqueda con contenido
      const mergedResults = searchResults.map(searchResult => {
        const contentResult = contentsResults.find(
          content => content.url === searchResult.url
        );
        return {
          ...searchResult,
          text: contentResult?.text || searchResult.text || ''
        };
      });

      return {
        results: mergedResults,
        autopromptString: ''
      };
    } catch (error) {
      console.error('❌ Error en searchAndContents:', error);
      throw error;
    }
  }

  // Generar resumen de un artículo
  async generateSummary(content: string, title: string = ''): Promise<string> {
    if (!this.openai) {
      // Generar resumen básico sin OpenAI
      const sentences = content.split('.').filter(s => s.trim().length > 10).slice(0, 3);
      return sentences.join('.') + '.';
    }

    try {
      const completion = await this.openai.chat.completions.create({
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
      console.log('📝 Resumen generado para:', title.substring(0, 50) + '...');
      return summary;
    } catch (error) {
      console.warn('⚠️ Error generando resumen para:', title, error);
      // Fallback a resumen básico
      const sentences = content.split('.').filter(s => s.trim().length > 10).slice(0, 2);
      return sentences.join('.') + '.';
    }
  }

  // Categorizar resultados con sumarizado
  async categorizeResultsWithSummary(results: ExaSearchResult[]): Promise<CategorizedResult[]> {
    const categorizedResults: CategorizedResult[] = [];

    console.log('🏷️ Categorizando', results.length, 'resultados...');
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      // Generar resumen si hay contenido suficiente
      let summary = '';
      if (result.text && result.text.length > 200) {
        try {
          summary = await this.generateSummary(result.text, result.title);
        } catch (error) {
          console.warn('Error generando resumen:', error);
        }
      }
      // Lógica de categorización mejorada
      const score = result.score || 0;
      const hasQualityContent = result.text && result.text.length > 500;
      const hasRecentDate = result.publishedDate && 
        new Date(result.publishedDate) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 2 semanas
      const hasSummary = summary.length > 50;
      const isHighScore = score > 0.7;
      
      // Criterios para expandir: alto score, contenido reciente, o buen resumen
      const shouldExpand = isHighScore || hasRecentDate || (hasQualityContent && hasSummary);

      categorizedResults.push({
        ...result,
        text: summary || result.text?.substring(0, 300) + '...' || 'Contenido no disponible',
        category: shouldExpand ? 'expand' : 'not_expand',
        reasoning: shouldExpand 
          ? `${isHighScore ? 'Alto score' : ''}${hasRecentDate ? ' • Contenido reciente' : ''}${hasSummary ? ' • Resumen de calidad' : ''}`
          : 'Contenido con menor prioridad o información limitada',
        priority: Math.round(score * 100) || (results.length - i) * 10
      });
    }

    // Ordenar por prioridad
    categorizedResults.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    console.log('✅ Categorización completa:', {
      total: categorizedResults.length,
      expandir: categorizedResults.filter(r => r.category === 'expand').length,
      no_expandir: categorizedResults.filter(r => r.category === 'not_expand').length
    });

    return categorizedResults;
  }
}

// Exportar instancia singleton
export const exaService = new ExaService();

// Función principal actualizada
export async function fetchResearchResults(topic: string): Promise<CategorizedResult[]> {
  try {
    console.log(`🚀 Iniciando investigación completa para: "${topic}"`);
    const response = await exaService.searchAndContents(topic, {
      numResults: 10,
      daysBack: 30 // Buscar en los últimos 30 días
    });
    console.log(`📚 Encontrados ${response.results.length} resultados`);
    if (!response.results.length) {
      console.log('⚠️ No se encontraron resultados, usando datos mock');
      return getMockResults(topic);
    }
    const categorizedResults = await exaService.categorizeResultsWithSummary(response.results);
    console.log(`✅ Investigación completa: ${categorizedResults.length} resultados procesados y categorizados`);
    
    return categorizedResults;
  } catch (error) {
    console.log("❌ Error en la investigación, usando datos mock...");
    console.error('Error detallado:', error);
    // Retornar datos mock en caso de error
    return getMockResults(topic);
  }
}

// Datos mock mejorados
function getMockResults(topic: string): CategorizedResult[] {
  return [
    {
      title: `Últimas tendencias en ${topic} - Análisis 2025`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-trends-2025`,
      publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
      author: 'Equipo de Investigación',
      score: 0.92,
      text: `Resumen completo sobre las últimas tendencias en ${topic}. Este análisis cubre los desarrollos más importantes del año 2024, incluyendo innovaciones tecnológicas, cambios en el mercado y perspectivas futuras. Los expertos destacan la importancia de mantenerse actualizado en este campo dinámico.`,
      category: 'expand',
      reasoning: 'Contenido actualizado con alta relevancia y análisis profundo',
      priority: 92
    },
    {
      title: `Guía básica de ${topic} para principiantes`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-guide`,
      publishedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 meses atrás
      author: 'Editor General',
      score: 0.58,
      text: `Introducción básica a ${topic} con conceptos fundamentales. Información general que puede servir como punto de partida.`,
      category: 'not_expand',
      reasoning: 'Información básica y desactualizada',
      priority: 58
    },
    {
      title: `Impacto futuro de ${topic} en la sociedad`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-future-impact`,
      publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana atrás
      author: 'Dr. Ana Futurista',
      score: 0.85,
      text: `Análisis prospectivo sobre cómo ${topic} transformará nuestra sociedad en los próximos años. El estudio examina múltiples escenarios y sus posibles consecuencias, basándose en datos actuales y tendencias emergentes. Se incluyen entrevistas con expertos líderes en el campo.`,
      category: 'expand',
      reasoning: 'Análisis prospectivo con alta calidad y contenido reciente',
      priority: 85
    }
  ];
  }
  