'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CustomCategorizationRules, CategorizationPreset } from '@/types';

// Presets predefinidos
const DEFAULT_PRESETS: CategorizationPreset[] = [
  {
    id: 'balanced',
    name: 'Balanceado',
    description: 'Configuración equilibrada para la mayoría de casos',
    icon: '⚖️',
    rules: {
      weights: {
        relevance: 50,
        quality: 25,
        freshness: 20,
        exaScore: 5
      },
      thresholds: {
        expandThreshold: 85,
        minWordCount: 100,
        maxDaysForFresh: 30
      },
      qualityFactors: {
        preferredDomains: ['reuters.com', 'bbc.com', 'elpais.com', 'expansion.com', '.edu', '.gov'],
        keywordBonus: ['datos', 'estadística', 'estudio', 'investigación', 'análisis'],
        minimumContentLength: 100
      }
    }
  },
  {
    id: 'quality-focused',
    name: 'Enfoque en Calidad',
    description: 'Prioriza la calidad del contenido sobre otros factores',
    icon: '🏆',
    rules: {
      weights: {
        relevance: 30,
        quality: 50,
        freshness: 15,
        exaScore: 5
      },
      thresholds: {
        expandThreshold: 90,
        minWordCount: 200,
        maxDaysForFresh: 90
      },
      qualityFactors: {
        preferredDomains: ['nature.com', 'science.org', 'reuters.com', 'bbc.com', '.edu', '.gov', 'arxiv.org'],
        keywordBonus: ['investigación', 'estudio', 'datos', 'análisis', 'evidencia', 'método'],
        minimumContentLength: 200
      }
    }
  },
  {
    id: 'freshness-focused',
    name: 'Enfoque en Actualidad',
    description: 'Prioriza contenido reciente y trending',
    icon: '🚀',
    rules: {
      weights: {
        relevance: 40,
        quality: 20,
        freshness: 35,
        exaScore: 5
      },
      thresholds: {
        expandThreshold: 80,
        minWordCount: 50,
        maxDaysForFresh: 7
      },
      qualityFactors: {
        preferredDomains: ['twitter.com', 'reddit.com', 'medium.com', 'linkedin.com'],
        keywordBonus: ['trending', 'viral', 'breaking', 'último', 'nuevo', 'reciente'],
        minimumContentLength: 50
      }
    }
  },
  {
    id: 'relevance-focused',
    name: 'Enfoque en Relevancia',
    description: 'Maximiza la relevancia temática del contenido',
    icon: '🎯',
    rules: {
      weights: {
        relevance: 70,
        quality: 15,
        freshness: 10,
        exaScore: 5
      },
      thresholds: {
        expandThreshold: 85,
        minWordCount: 75,
        maxDaysForFresh: 60
      },
      qualityFactors: {
        preferredDomains: ['wikipedia.org', 'britannica.com', '.edu'],
        keywordBonus: ['definición', 'concepto', 'explicación', 'guía', 'tutorial'],
        minimumContentLength: 75
      }
    }
  }
];

// Regla por defecto
const DEFAULT_RULE: CustomCategorizationRules = {
  id: 'default',
  name: 'Configuración por Defecto',
  description: 'Configuración estándar del sistema',
  weights: DEFAULT_PRESETS[0].rules.weights,
  thresholds: DEFAULT_PRESETS[0].rules.thresholds,
  qualityFactors: DEFAULT_PRESETS[0].rules.qualityFactors,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const STORAGE_KEY = 'categorization-rules';
const ACTIVE_RULE_KEY = 'active-categorization-rule';

export function useCategorizationRules() {
  const [rules, setRules] = useState<CustomCategorizationRules[]>([]);
  const [activeRuleId, setActiveRuleId] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar reglas desde localStorage
  useEffect(() => {
    try {
      const savedRules = localStorage.getItem(STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_RULE_KEY);

      if (savedRules) {
        const parsedRules: CustomCategorizationRules[] = JSON.parse(savedRules);
        setRules(parsedRules.length > 0 ? parsedRules : [DEFAULT_RULE]);
      } else {
        setRules([DEFAULT_RULE]);
      }

      if (savedActiveId) {
        setActiveRuleId(savedActiveId);
      }
    } catch (error) {
      console.error('Error loading categorization rules:', error);
      setRules([DEFAULT_RULE]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar reglas en localStorage
  const saveRules = useCallback((newRules: CustomCategorizationRules[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRules));
      setRules(newRules);
    } catch (error) {
      console.error('Error saving categorization rules:', error);
    }
  }, []);

  // Guardar regla activa
  const saveActiveRule = useCallback((ruleId: string) => {
    try {
      localStorage.setItem(ACTIVE_RULE_KEY, ruleId);
      setActiveRuleId(ruleId);
    } catch (error) {
      console.error('Error saving active rule:', error);
    }
  }, []);

  // Obtener regla activa
  const getActiveRule = useCallback((): CustomCategorizationRules => {
    const activeRule = rules.find(rule => rule.id === activeRuleId);
    return activeRule || DEFAULT_RULE;
  }, [rules, activeRuleId]);

  // Crear nueva regla
  const createRule = useCallback((ruleData: Omit<CustomCategorizationRules, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: CustomCategorizationRules = {
      ...ruleData,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRules = [...rules, newRule];
    saveRules(updatedRules);
    return newRule;
  }, [rules, saveRules]);

  // Actualizar regla existente
  const updateRule = useCallback((ruleId: string, updates: Partial<CustomCategorizationRules>) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId
        ? { ...rule, ...updates, updatedAt: new Date().toISOString() }
        : rule
    );
    saveRules(updatedRules);
  }, [rules, saveRules]);

  // Eliminar regla
  const deleteRule = useCallback((ruleId: string) => {
    if (ruleId === 'default') return; // No permitir eliminar la regla por defecto
    
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    saveRules(updatedRules);

    // Si eliminamos la regla activa, cambiar a la por defecto
    if (activeRuleId === ruleId) {
      saveActiveRule('default');
    }
  }, [rules, activeRuleId, saveRules, saveActiveRule]);

  // Aplicar preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const newRule = createRule({
      name: `${preset.name} (Personalizado)`,
      description: `Basado en preset: ${preset.description}`,
      weights: preset.rules.weights,
      thresholds: preset.rules.thresholds,
      qualityFactors: preset.rules.qualityFactors,
      isActive: false
    });

    saveActiveRule(newRule.id);
    return newRule;
  }, [createRule, saveActiveRule]);

  // Activar regla
  const activateRule = useCallback((ruleId: string) => {
    // Desactivar todas las reglas
    const updatedRules = rules.map(rule => ({ ...rule, isActive: false }));
    
    // Activar la regla seleccionada
    const finalRules = updatedRules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: true } : rule
    );

    saveRules(finalRules);
    saveActiveRule(ruleId);
  }, [rules, saveRules, saveActiveRule]);

  return {
    rules,
    activeRule: getActiveRule(),
    activeRuleId,
    presets: DEFAULT_PRESETS,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    activateRule,
    applyPreset
  };
} 