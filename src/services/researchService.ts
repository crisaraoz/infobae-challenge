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
      daysBack: 15 // Buscar en los últimos 15 días
    });
    
    if (!categorizedResults.length) {
      return getMockResults(topic);
    }
    
    return categorizedResults;
  } catch (error) {
    console.error('Error detallado:', error);
    
    // Si es un error de timeout, propagarlo para que se muestre al usuario
    if (error instanceof Error && error.message.includes('Timeout')) {
      throw error;
    }
    
    // Para otros errores, usar datos mock
    console.warn('Usando datos mock debido a error en la API');
    return getMockResults(topic);
  }
} 