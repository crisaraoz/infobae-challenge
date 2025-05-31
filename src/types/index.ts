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