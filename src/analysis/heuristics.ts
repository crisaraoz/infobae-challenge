import type { ExaSearchResult } from '@/types';
import type { CustomCategorizationRules } from '@/types';

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
 * Análisis de calidad básica del contenido con reglas personalizables
 */
function analyzeContentQuality(
  content: string, 
  url: string, 
  rules?: CustomCategorizationRules
): number {
  let qualityScore = 85; // Base muy alto para mostrar porcentajes altos
  
  // Usar reglas personalizadas o valores por defecto
  const minWordCount = rules?.thresholds.minWordCount || 100;
  const preferredDomains = rules?.qualityFactors.preferredDomains || [
    'coindesk', 'reuters.com', 'bbc.com', 'elpais.com', 'expansion.com',
    '.edu', '.gov', 'marca.com', 'espn.com'
  ];
  const keywordBonus = rules?.qualityFactors.keywordBonus || [
    'estadística', 'datos', 'cifra', 'estudio', 'investigación'
  ];
  
  // Longitud del contenido
  const wordCount = content.split(/\s+/).length;
  if (wordCount > minWordCount * 5) qualityScore += 8;
  else if (wordCount > minWordCount * 2) qualityScore += 6;
  else if (wordCount > minWordCount) qualityScore += 4;
  else if (wordCount > minWordCount * 0.5) qualityScore += 2;
  
  // Presencia de datos/números con keywords personalizables
  const keywordPattern = keywordBonus.join('|');
  const dataPattern = new RegExp(`\\d+[%$€]?|\\d+\\.\\d+|${keywordPattern}`, 'i');
  if (dataPattern.test(content)) {
    qualityScore += 4;
  }
  
  // Fuentes confiables personalizables
  const domain = url.toLowerCase();
  const isDomainPreferred = preferredDomains.some(preferredDomain => 
    domain.includes(preferredDomain.toLowerCase())
  );
  
  if (isDomainPreferred) {
    qualityScore += 3;
  }
  
  return Math.min(qualityScore, 100);
}

/**
 * Análisis de frescura simplificado con reglas personalizables
 */
function analyzeFreshness(publishedDate: string | null, rules?: CustomCategorizationRules): number {
  if (!publishedDate) return 85; // Alto para mostrar porcentajes altos
  
  const maxDaysForFresh = rules?.thresholds.maxDaysForFresh || 30;
  const daysSince = (Date.now() - new Date(publishedDate).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince <= maxDaysForFresh * 0.25) return 98;   // Muy reciente
  if (daysSince <= maxDaysForFresh) return 95;          // Dentro del rango
  if (daysSince <= maxDaysForFresh * 3) return 90;      // Moderadamente viejo
  if (daysSince <= maxDaysForFresh * 12) return 85;     // Viejo pero aceptable
  return 80;                                            // Muy viejo
}

// ==========================================
// CATEGORIZACIÓN PRINCIPAL CON REGLAS PERSONALIZABLES
// ==========================================

export function categorizeResult(
  result: ExaSearchResult, 
  topic: string,
  customRules?: CustomCategorizationRules
): { 
  category: 'expand' | 'not_expand', 
  finalScore: number, 
  reasoning: string,
  breakdown?: {
    relevance: number;
    quality: number;
    freshness: number;
    exaScore: number;
  }
} {
  // Usar reglas personalizadas o valores por defecto
  const weights = customRules?.weights || {
    relevance: 50,
    quality: 25,
    freshness: 20,
    exaScore: 5
  };
  
  const threshold = customRules?.thresholds.expandThreshold || 85;
  
  // Calcular scores individuales (0-100)
  const relevanceScore = analyzeTopicRelevance(result.text || '', result.title, topic);
  const qualityScore = analyzeContentQuality(result.text || '', result.url, customRules);
  const freshnessScore = analyzeFreshness(result.publishedDate || null, customRules);
  const exaScore = (result.score || 0) * 100; // Convertir a 0-100
  
  // Normalizar pesos para que sumen 100
  const totalWeight = weights.relevance + weights.quality + weights.freshness + weights.exaScore;
  const normalizedWeights = {
    relevance: weights.relevance / totalWeight,
    quality: weights.quality / totalWeight,
    freshness: weights.freshness / totalWeight,
    exaScore: weights.exaScore / totalWeight
  };
  
  // Promedio ponderado con pesos personalizados
  const finalScore = (
    relevanceScore * normalizedWeights.relevance +
    qualityScore * normalizedWeights.quality +
    freshnessScore * normalizedWeights.freshness +
    exaScore * normalizedWeights.exaScore
  );
  
  // El score final es directamente el que se muestra (0-100)
  const normalizedScore = Math.round(finalScore);
  
  // Usar threshold personalizado
  const category = normalizedScore >= threshold ? 'expand' : 'not_expand';
  
  // Generar reasoning basado en scores individuales y pesos
  const reasons: string[] = [];
  const highestWeight = Math.max(
    normalizedWeights.relevance,
    normalizedWeights.quality,
    normalizedWeights.freshness,
    normalizedWeights.exaScore
  );
  
  if (normalizedWeights.relevance === highestWeight && relevanceScore >= 85) {
    reasons.push('Alta relevancia temática (factor principal)');
  }
  if (normalizedWeights.quality === highestWeight && qualityScore >= 90) {
    reasons.push('Excelente calidad de contenido (factor principal)');
  }
  if (normalizedWeights.freshness === highestWeight && freshnessScore >= 95) {
    reasons.push('Contenido muy reciente (factor principal)');
  }
  if (normalizedWeights.exaScore === highestWeight && exaScore >= 40) {
    reasons.push('Alto score de búsqueda (factor principal)');
  }
  
  // Agregar razones adicionales
  if (reasons.length === 0) {
    if (relevanceScore >= 85) reasons.push('Buena relevancia temática');
    if (qualityScore >= 90) reasons.push('Calidad aceptable');
    if (freshnessScore >= 95) reasons.push('Contenido reciente');
  }
  
  const reasoning = reasons.length > 0 ? 
    reasons.join(' • ') : 
    `Puntaje ${normalizedScore}/100 por debajo del umbral de ${threshold}`;
  
  return { 
    category, 
    finalScore: normalizedScore / 100, // Convertir de vuelta a 0-1 para compatibilidad
    reasoning,
    breakdown: {
      relevance: relevanceScore,
      quality: qualityScore,
      freshness: freshnessScore,
      exaScore: exaScore
    }
  };
} 