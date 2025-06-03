'use server';

import { CategorizedResult } from '@/types';
import { fetchResearchResults } from '@/services/researchService';

/**
 * Acción del servidor para realizar investigación sobre un tema específico
 */
export async function performResearch(topic: string): Promise<CategorizedResult[]> {
  if (!topic.trim()) {
    throw new Error('El tema de investigación no puede estar vacío');
  }

  try {
    const results = await fetchResearchResults(topic);
    return results;
  } catch (error) {
    console.error('Error en performResearch:', error);
    
    // Manejo específico para errores de timeout
    if (error instanceof Error && error.message.includes('Timeout')) {
      throw new Error(`⏱️ ${error.message.replace('45 segundos', '30 segundos')}`);
    }
    
    // Error genérico para otros casos
    throw new Error('❌ Error al realizar la investigación. Por favor, intenta nuevamente.');
  }
}

export async function categorizeResearchResults(results: CategorizedResult[]): Promise<{
  expandWorthy: CategorizedResult[];
  notExpandWorthy: CategorizedResult[];
}> {
  const expandWorthy = results.filter(result => result.category === 'expand');
  const notExpandWorthy = results.filter(result => result.category === 'not_expand');
  
  // Ordenar por prioridad
  expandWorthy.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  notExpandWorthy.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  return {
    expandWorthy,
    notExpandWorthy
  };
} 