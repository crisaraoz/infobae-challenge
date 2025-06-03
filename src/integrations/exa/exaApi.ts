import { ExaSearchResult, SearchOptions, ExaConfig } from "@/types";

// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================

const getExaConfig = (): ExaConfig => ({
  apiKey: process.env.EXA_API_KEY || "",
  baseUrl: process.env.EXA_API_BASE_URL || "",
});

// Timeout de 45 segundos
const TIMEOUT_MS = 30000;

/**
 * Wrapper para fetch con timeout personalizado
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout: La búsqueda tardó más de ${timeoutMs / 1000} segundos. Por favor, intenta con un tema más específico.`);
    }
    throw error;
  }
}

// ==========================================
// FUNCIONES DE API EXA
// ==========================================

/**
 * Realiza búsqueda en Exa API
 */
export async function searchExaContent(
  query: string,
  options: SearchOptions = {}
): Promise<ExaSearchResult[]> {
  const config = getExaConfig();

  if (!config.apiKey) {
    throw new Error("EXA_API_KEY no está configurada");
  }

  const {
    numResults = 10,
    includeDomains = [],
    excludeDomains = [],
    daysBack = 30,
  } = options;

  // Calcular fecha de corte
  const datecutoff = new Date();
  datecutoff.setDate(datecutoff.getDate() - daysBack);
  const startPublishedDate = datecutoff.toISOString().split("T")[0];

  const requestBody = {
    query,
    numResults,
    startPublishedDate,
    type: "neural",
    ...(includeDomains.length > 0 && { includeDomains }),
    ...(excludeDomains.length > 0 && { excludeDomains }),
  };

  try {
    const response = await fetchWithTimeout(`${config.baseUrl}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error de la API de Exa: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("❌ Error en searchExaContent:", error);
    throw error;
  }
}

/**
 * Obtiene contenido completo de URLs específicas
 */
export async function getExaContents(
  urls: string[]
): Promise<ExaSearchResult[]> {
  if (!urls.length) return [];

  const config = getExaConfig();

  if (!config.apiKey) {
    throw new Error("EXA_API_KEY no está configurada");
  }

  try {
    const requestBody = {
      ids: urls,
      text: true,
    };

    const response = await fetchWithTimeout(`${config.baseUrl}/contents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error obteniendo contenido:", errorText);
      throw new Error(
        `Error obteniendo contenido: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("❌ Error en getExaContents:", error);
    return []; // Retornar array vacío en lugar de error
  }
}

/**
 * Combina búsqueda y obtención de contenido
 */
export async function searchAndGetContents(
  query: string,
  options: SearchOptions = {}
): Promise<ExaSearchResult[]> {
  // Paso 1: Buscar
  const searchResults = await searchExaContent(query, options);
  if (!searchResults.length) {
    return [];
  }
  // Paso 2: Obtener contenido completo para los primeros resultados
  const urls = searchResults
    .slice(0, 5)
    .map((result) => result.url)
    .filter(Boolean);
  const contentsResults = await getExaContents(urls);

  // Combinar resultados de búsqueda con contenido
  const mergedResults = searchResults.map((searchResult) => {
    const contentResult = contentsResults.find(
      (content) => content.url === searchResult.url
    );
    return {
      ...searchResult,
      text: contentResult?.text || searchResult.text || "",
    };
  });

  return mergedResults;
}
