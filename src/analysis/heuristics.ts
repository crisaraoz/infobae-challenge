import { ExaSearchResult } from '@/types';

// ==========================================
// ANÁLISIS SIMPLIFICADO DE CONTENIDO
// ==========================================

/**
 * Análisis de relevancia del tema en el contenido
 */
function analyzeTopicRelevance(content: string, title: string, topic: string): number {
  const topicWords = topic.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const combinedText = (title + ' ' + content).toLowerCase();
  
  let matches = 0;
  const totalWords = topicWords.length;
  
  // Buscar palabras del tema en título y contenido
  for (const word of topicWords) {
    if (combinedText.includes(word)) {
      matches++;
    }
  }
  
  // Bonus para coincidencias en título (más importantes)
  const titleMatches = topicWords.filter(word => title.toLowerCase().includes(word)).length;
  
  // Score base mucho más alto para mostrar porcentajes altos en UI
  let relevanceScore = matches > 0 ? 80 + (matches / totalWords) * 15 : 60;
  
  // Bonus por título
  if (titleMatches > 0) {
    relevanceScore += (titleMatches / totalWords) * 10;
  }
  
  return Math.min(relevanceScore, 100);
}

/**
 * Análisis de calidad básica del contenido
 */
function analyzeContentQuality(content: string, url: string): number {
  let qualityScore = 85; // Base muy alto para mostrar porcentajes altos
  
  // Longitud del contenido
  const wordCount = content.split(/\s+/).length;
  if (wordCount > 500) qualityScore += 8;
  else if (wordCount > 200) qualityScore += 6;
  else if (wordCount > 100) qualityScore += 4;
  else if (wordCount > 50) qualityScore += 2;
  
  // Presencia de datos/números
  if (/\d+[%$€]?|\d+\.\d+|estadística|datos|cifra|estudio|investigación/i.test(content)) {
    qualityScore += 4;
  }
  
  // Fuentes confiables
  const domain = url.toLowerCase();
  if (domain.includes('coindesk') || domain.includes('reuters.com') || domain.includes('bbc.com') || 
      domain.includes('elpais.com') || domain.includes('expansion.com') ||
      domain.includes('.edu') || domain.includes('.gov') ||
      domain.includes('marca.com') || domain.includes('espn.com')) {
    qualityScore += 3;
  }
  
  return Math.min(qualityScore, 100);
}

/**
 * Análisis de frescura simplificado
 */
function analyzeFreshness(publishedDate: string | null): number {
  if (!publishedDate) return 85; // Alto para mostrar porcentajes altos
  
  const daysSince = (Date.now() - new Date(publishedDate).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince <= 7) return 98;   // Última semana
  if (daysSince <= 30) return 95;   // Último mes  
  if (daysSince <= 90) return 90;   // 3 meses
  if (daysSince <= 365) return 85;  // 1 año
  return 80;                        // Más viejo
}

// ==========================================
// CATEGORIZACIÓN PRINCIPAL SIMPLIFICADA
// ==========================================

export function categorizeResult(result: ExaSearchResult, topic: string): { 
  category: 'expand' | 'not_expand', 
  finalScore: number, 
  reasoning: string 
} {
  // Calcular scores individuales (0-100)
  const relevanceScore = analyzeTopicRelevance(result.text || '', result.title, topic);
  const qualityScore = analyzeContentQuality(result.text || '', result.url);
  const freshnessScore = analyzeFreshness(result.publishedDate || null);
  const exaScore = (result.score || 0) * 100; // Convertir a 0-100
  
  // Promedio ponderado directo
  const finalScore = (
    relevanceScore * 0.50 +   // 50% relevancia (más peso)
    qualityScore * 0.25 +     // 25% calidad del contenido  
    freshnessScore * 0.20 +   // 20% frescura
    exaScore * 0.05           // 5% score de Exa
  );
  
  // El score final es directamente el que se muestra (0-100)
  const normalizedScore = Math.round(finalScore);
  
  // Threshold ajustado para la nueva escala: 85 puntos para expandir
  const threshold = 85;
  const category = normalizedScore >= threshold ? 'expand' : 'not_expand';
  
  // Generar reasoning basado en scores individuales
  const reasons: string[] = [];
  if (relevanceScore >= 85) reasons.push('Alta relevancia temática');
  if (qualityScore >= 90) reasons.push('Buena calidad de contenido');
  if (freshnessScore >= 95) reasons.push('Contenido reciente');
  if (exaScore >= 40) reasons.push('Score de búsqueda alto');
  
  const reasoning = reasons.length > 0 ? 
    reasons.join(' • ') : 
    `Puntaje ${normalizedScore}/100 por debajo del umbral de ${threshold}`;
  
  return { 
    category, 
    finalScore: normalizedScore / 100, // Convertir de vuelta a 0-1 para compatibilidad
    reasoning 
  };
} 