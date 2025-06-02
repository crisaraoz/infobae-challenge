'use client'; // Asegurar que es un Client Component

import { createContext, useContext, useState, ReactNode } from 'react';
import { CategorizedResult } from '@/types';

interface ResearchCache {
  [topic: string]: {
    results: CategorizedResult[];
    categorized: {
      expandWorthy: CategorizedResult[];
      notExpandWorthy: CategorizedResult[];
    };
    timestamp: number;
  };
}

interface ResearchContextType {
  cache: ResearchCache;
  getCache: (topic: string) => ResearchCache[string] | undefined;
  setCache: (topic: string, data: ResearchCache[string]) => void;
  clearCache: (topic?: string) => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

const CACHE_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutos

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<ResearchCache>({});

  const getCache = (topic: string) => {
    const cachedItem = cache[topic];
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_EXPIRATION_MS)) {
      return cachedItem;
    }
    return undefined;
  };

  const setCacheItem = (topic: string, data: ResearchCache[string]) => {
    setCache(prevCache => ({
      ...prevCache,
      [topic]: { ...data, timestamp: Date.now() }
    }));
  };

  const clearCacheItem = (topic?: string) => {
    if (topic) {
      setCache(prevCache => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [topic]: _removed, ...rest } = prevCache;
        return rest;
      });
    } else {
      setCache({}); // Limpiar todo el cache
    }
  };

  return (
    <ResearchContext.Provider value={{
      cache,
      getCache,
      setCache: setCacheItem,
      clearCache: clearCacheItem
    }}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearchCache() {
  const context = useContext(ResearchContext);
  if (context === undefined) {
    throw new Error('useResearchCache debe ser usado dentro de un ResearchProvider');
  }
  return context;
} 