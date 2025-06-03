import { ExaSearchResult, CategorizedResult } from '@/types';
import { searchAndGetContents } from '@/integrations/exa/exaApi';
import { generateOptimizedQuery, generateSummary } from '@/integrations/openai/openaiService';
import { categorizeResult } from './heuristics';

// ==========================================
// PROCESAMIENTO COMPLETO DE CONTENIDO
// ==========================================

interface ProcessingOptions {
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  daysBack?: number;
}

/**
 * Procesa resultados de búsqueda y los categoriza con resúmenes
 */
export async function processSearchResults(
  results: ExaSearchResult[], 
  topic: string = ''
): Promise<CategorizedResult[]> {
  const categorizedResults: CategorizedResult[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    
    // Generar resumen si hay contenido suficiente
    let summary = '';
    if (result.text && result.text.length > 200) {
      try {
        summary = await generateSummary(result.text, result.title);
      } catch (error) {
        console.warn('Error generando resumen:', error);
      }
    }

    // Aplicar reglas heurísticas
    const { category, finalScore, reasoning } = categorizeResult(result, topic);
    
    categorizedResults.push({
      ...result,
      text: summary || result.text?.substring(0, 300) + '...' || 'Contenido no disponible',
      category,
      reasoning,
      priority: Math.round(finalScore * 100)
    });
  }

  // Ordenar por prioridad (score final)
  categorizedResults.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return categorizedResults;
}

/**
 * Realiza búsqueda completa: optimiza query, busca, obtiene contenido y categoriza
 */
export async function searchAndProcessContent(
  topic: string,
  options: ProcessingOptions = {}
): Promise<CategorizedResult[]> {
  try {
    // Paso 1: Optimizar la consulta
    const optimizedQuery = await generateOptimizedQuery(topic);
    // Paso 2: Buscar y obtener contenido
    const searchResults = await searchAndGetContents(optimizedQuery, {
      numResults: options.numResults || 10,
      includeDomains: options.includeDomains || [],
      excludeDomains: options.excludeDomains || [],
      daysBack: options.daysBack || 30
    });
    
    if (!searchResults.length) {
      return [];
    }
    
    // Paso 3: Procesar y categorizar resultados
    const categorizedResults = await processSearchResults(searchResults, topic);
    
    return categorizedResults;
  } catch (error) {
    console.error('❌ Error en searchAndProcessContent:', error);
    throw error;
  }
} 