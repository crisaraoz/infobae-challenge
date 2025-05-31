'use server';

import { fetchResearchResults } from '@/services/exaService';
import { CategorizedResult } from '@/types';

export async function performResearch(topic: string): Promise<{
  success: boolean;
  results?: CategorizedResult[];
  error?: string;
}> {
  try {
    console.log(`Iniciando investigación para el tema: ${topic}`);
    
    const results = await fetchResearchResults(topic);
    
    console.log(`Investigación completada. ${results.length} resultados encontrados`);
    
    return {
      success: true,
      results: results
    };
  } catch (error) {
    console.error('Error en performResearch:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido durante la investigación'
    };
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