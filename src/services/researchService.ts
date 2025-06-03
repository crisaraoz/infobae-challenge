import { CategorizedResult } from '@/types';
import { searchAndProcessContent } from '@/analysis/contentProcessor';
import { getMockResults } from '@/lib/mocks';

// ==========================================
// SERVICIO PRINCIPAL DE INVESTIGACIÓN
// ==========================================

export async function fetchResearchResults(topic: string): Promise<CategorizedResult[]> {
  try {
    const categorizedResults = await searchAndProcessContent(topic, {
      numResults: 20,
      daysBack: 15 // Buscar en los últimos 30 días
    });
    
    if (!categorizedResults.length) {
      return getMockResults(topic);
    }
    
    return categorizedResults;
  } catch (error) {
    console.error('Error detallado:', error);
    // Retornar datos mock en caso de error
    return getMockResults(topic);
  }
} 