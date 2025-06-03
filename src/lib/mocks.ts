import { CategorizedResult } from '@/types';

// ==========================================
// DATOS MOCK PARA DESARROLLO Y TESTING
// ==========================================

/**
 * Genera resultados mock para desarrollo cuando la API no está disponible
 * o para testing de la interfaz
 */
export function getMockResults(topic: string): CategorizedResult[] {
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

// ==========================================
// MOCK DATA PARA DIFERENTES CASOS DE USO
// ==========================================

/**
 * Genera resultados mock específicos para testing de heurísticas
 */
export function getMockResultsForTesting(): CategorizedResult[] {
  return [
    {
      title: 'Estudio científico sobre inteligencia artificial en medicina',
      url: 'https://nature.com/ai-medicine-study-2025',
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Dr. Research Team',
      score: 0.95,
      text: 'Investigación exhaustiva sobre aplicaciones de IA en diagnósticos médicos. Metodología rigurosa con 10,000 casos analizados. Resultados muestran 94% de precisión en detección temprana.',
      category: 'expand',
      reasoning: 'Score de relevancia alto • Contenido reciente • Buena calidad de contenido • Fuente confiable • Contenido especializado',
      priority: 95
    },
    {
      title: 'Mi experiencia personal con tecnología',
      url: 'https://myblog.wordpress.com/my-tech-experience',
      publishedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Usuario Blog',
      score: 0.25,
      text: 'Comprar ahora esta increíble oferta tecnológica. Mi experiencia personal sin datos específicos.',
      category: 'not_expand',
      reasoning: 'Puntaje insuficiente según criterios establecidos',
      priority: 25
    }
  ];
}

/**
 * Genera resultados mock vacíos para testing de estados de error
 */
export function getEmptyMockResults(): CategorizedResult[] {
  return [];
} 