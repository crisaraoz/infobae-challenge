// Tipos para la API de Exa
export interface ExaSearchResult {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
}

export interface SearchOptions {
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  daysBack?: number;
}

export interface ExaConfig {
  apiKey: string;
  baseUrl: string;
}
export interface ExaSearchResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
}

// Tipos para categorización
export interface CategorizedResult extends ExaSearchResult {
  category: 'expand' | 'not_expand';
  reasoning?: string;
  priority?: number;
}

// Tipos para la investigación
export interface ResearchTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ResearchState {
  isLoading: boolean;
  results: CategorizedResult[];
  error: string | null;
  selectedTopic: string | null;
}

// Tipos para generación de artículos
export interface ArticleTitle {
  title: string;
  subtitle?: string;
  tone: 'formal' | 'casual' | 'professional' | 'engaging';
}

export interface GeneratedArticle {
  content: string;
  titles: ArticleTitle[];
  summary: string;
  keywords: string[];
}

// Tipos para reglas de categorización personalizables
export interface CategorizationWeights {
  relevance: number;    // 0-100 (peso de relevancia temática)
  quality: number;      // 0-100 (peso de calidad del contenido)
  freshness: number;    // 0-100 (peso de frescura/actualidad)
  exaScore: number;     // 0-100 (peso del score de Exa)
}

export interface CategorizationThresholds {
  expandThreshold: number;     // 0-100 (umbral mínimo para "expandir")
  minWordCount: number;        // Mínimo de palabras para calidad
  maxDaysForFresh: number;     // Máximo días para considerar "fresco"
}

export interface QualityFactors {
  preferredDomains: string[];     // Dominios que suman puntos de calidad
  keywordBonus: string[];        // Keywords que suman puntos (datos, estadística, etc.)
  minimumContentLength: number;   // Longitud mínima del contenido
}

export interface CustomCategorizationRules {
  id: string;
  name: string;
  description: string;
  weights: CategorizationWeights;
  thresholds: CategorizationThresholds;
  qualityFactors: QualityFactors;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategorizationPreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rules: Omit<CustomCategorizationRules, 'id' | 'name' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'>;
} 