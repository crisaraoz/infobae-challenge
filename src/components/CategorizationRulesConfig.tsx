'use client';

import React, { useState } from 'react';
import { useCategorizationRules } from '@/hooks/useCategorizationRules';
import type { CustomCategorizationRules } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CategorizationRulesConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onRulesChange?: (rules: CustomCategorizationRules) => void;
}

export function CategorizationRulesConfig({ 
  isOpen, 
  onClose, 
  onRulesChange 
}: CategorizationRulesConfigProps) {
  const {
    rules,
    activeRule,
    presets,
    createRule,
    updateRule,
    deleteRule,
    activateRule,
    applyPreset
  } = useCategorizationRules();

  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');

  // Estados para los pesos (inicializados con regla activa)
  const [weights, setWeights] = useState({
    relevance: activeRule?.weights.relevance || 50,
    quality: activeRule?.weights.quality || 25,
    freshness: activeRule?.weights.freshness || 20,
    exaScore: activeRule?.weights.exaScore || 5,
  });

  // Estados para los umbrales
  const [thresholds, setThresholds] = useState({
    expandThreshold: activeRule?.thresholds.expandThreshold || 85,
    minWordCount: activeRule?.thresholds.minWordCount || 100,
    maxDaysForFresh: activeRule?.thresholds.maxDaysForFresh || 30,
  });

  // Estados para factores de calidad
  const [qualityFactors, setQualityFactors] = useState({
    preferredDomains: activeRule?.qualityFactors.preferredDomains?.join(', ') || '',
    keywordBonus: activeRule?.qualityFactors.keywordBonus?.join(', ') || '',
    minimumContentLength: activeRule?.qualityFactors.minimumContentLength || 100,
  });

  if (!isOpen) return null;

  const handleCreateRule = () => {
    if (!newRuleName.trim()) return;

    const newRule = createRule({
      name: newRuleName,
      description: newRuleDescription,
      weights: {
        relevance: weights.relevance,
        quality: weights.quality,
        freshness: weights.freshness,
        exaScore: weights.exaScore,
      },
      thresholds: {
        expandThreshold: thresholds.expandThreshold,
        minWordCount: thresholds.minWordCount,
        maxDaysForFresh: thresholds.maxDaysForFresh,
      },
      qualityFactors: {
        preferredDomains: qualityFactors.preferredDomains
          .split(',')
          .map(d => d.trim())
          .filter(d => d.length > 0),
        keywordBonus: qualityFactors.keywordBonus
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0),
        minimumContentLength: qualityFactors.minimumContentLength,
      },
      isActive: false,
    });

    setNewRuleName('');
    setNewRuleDescription('');
    onRulesChange?.(newRule);
  };

  const handleUpdateRule = (ruleId: string) => {
    updateRule(ruleId, {
      weights: {
        relevance: weights.relevance,
        quality: weights.quality,
        freshness: weights.freshness,
        exaScore: weights.exaScore,
      },
      thresholds: {
        expandThreshold: thresholds.expandThreshold,
        minWordCount: thresholds.minWordCount,
        maxDaysForFresh: thresholds.maxDaysForFresh,
      },
      qualityFactors: {
        preferredDomains: qualityFactors.preferredDomains
          .split(',')
          .map(d => d.trim())
          .filter(d => d.length > 0),
        keywordBonus: qualityFactors.keywordBonus
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0),
        minimumContentLength: qualityFactors.minimumContentLength,
      },
    });

    const updatedRule = rules.find(r => r.id === ruleId);
    if (updatedRule) {
      onRulesChange?.(updatedRule);
    }
  };

  const handleActivateRule = (ruleId: string) => {
    activateRule(ruleId);
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      onRulesChange?.(rule);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const newRule = applyPreset(presetId);
    if (newRule) {
      // Actualizar los estados locales con los valores del preset
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        setWeights(preset.rules.weights);
        setThresholds(preset.rules.thresholds);
        setQualityFactors({
          preferredDomains: preset.rules.qualityFactors.preferredDomains.join(', '),
          keywordBonus: preset.rules.qualityFactors.keywordBonus.join(', '),
          minimumContentLength: preset.rules.qualityFactors.minimumContentLength,
        });
      }
      onRulesChange?.(newRule);
    }
  };

  const totalWeight = weights.relevance + weights.quality + weights.freshness + weights.exaScore;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Configuración de Reglas de Categorización</h2>
              <p className="text-gray-600">Personaliza cómo se categorizan los resultados de investigación</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              ✕ Cerrar
            </Button>
          </div>

          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="weights">Pesos</TabsTrigger>
              <TabsTrigger value="thresholds">Umbrales</TabsTrigger>
              <TabsTrigger value="quality">Calidad</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Presets Predefinidos</CardTitle>
                  <CardDescription>
                    Configuraciones predefinidas para diferentes casos de uso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presets.map((preset) => (
                      <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{preset.icon}</span>
                              <h3 className="font-semibold">{preset.name}</h3>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleApplyPreset(preset.id)}
                            >
                              Aplicar
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Relevancia:</span>
                              <span>{preset.rules.weights.relevance}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Calidad:</span>
                              <span>{preset.rules.weights.quality}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Frescura:</span>
                              <span>{preset.rules.weights.freshness}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reglas Guardadas</CardTitle>
                  <CardDescription>
                    Tus configuraciones personalizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                        {rule.isActive && <Badge variant="default" className="mt-1">Activa</Badge>}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={rule.isActive ? "default" : "outline"}
                          onClick={() => handleActivateRule(rule.id)}
                        >
                          {rule.isActive ? '✓ Activa' : 'Activar'}
                        </Button>
                        {rule.id !== 'default' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteRule(rule.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pesos de Factores</CardTitle>
                  <CardDescription>
                    Ajusta la importancia de cada factor en la categorización
                    {totalWeight !== 100 && (
                      <span className="text-red-500 ml-2">
                        ⚠️ Total: {totalWeight}% (debe sumar 100%)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="flex justify-between">
                        <span>Relevancia Temática</span>
                        <span>{weights.relevance}%</span>
                      </Label>
                      <Slider
                        value={[weights.relevance]}
                        onValueChange={([value]: number[]) => setWeights(prev => ({ ...prev, relevance: value }))}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="flex justify-between">
                        <span>Calidad del Contenido</span>
                        <span>{weights.quality}%</span>
                      </Label>
                      <Slider
                        value={[weights.quality]}
                        onValueChange={([value]: number[]) => setWeights(prev => ({ ...prev, quality: value }))}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="flex justify-between">
                        <span>Frescura/Actualidad</span>
                        <span>{weights.freshness}%</span>
                      </Label>
                      <Slider
                        value={[weights.freshness]}
                        onValueChange={([value]: number[]) => setWeights(prev => ({ ...prev, freshness: value }))}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="flex justify-between">
                        <span>Score de Exa</span>
                        <span>{weights.exaScore}%</span>
                      </Label>
                      <Slider
                        value={[weights.exaScore]}
                        onValueChange={([value]: number[]) => setWeights(prev => ({ ...prev, exaScore: value }))}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Umbrales de Decisión</CardTitle>
                  <CardDescription>
                    Configura los umbrales para determinar qué contenido vale la pena expandir
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="flex justify-between">
                      <span>Umbral para &quot;Vale la pena expandir&quot;</span>
                      <span>{thresholds.expandThreshold}/100</span>
                    </Label>
                    <Slider
                      value={[thresholds.expandThreshold]}
                      onValueChange={([value]: number[]) => setThresholds(prev => ({ ...prev, expandThreshold: value }))}
                      min={50}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Contenido con score mayor a este valor será categorizado como &quot;expandir&quot;
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="minWordCount">Mínimo de palabras para calidad</Label>
                    <Input
                      id="minWordCount"
                      type="number"
                      value={thresholds.minWordCount}
                      onChange={(e) => setThresholds(prev => ({ ...prev, minWordCount: parseInt(e.target.value) || 0 }))}
                      min={10}
                      max={1000}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Contenido con menos palabras tendrá penalización en calidad
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxDaysForFresh">Máximo días para considerar &quot;fresco&quot;</Label>
                    <Input
                      id="maxDaysForFresh"
                      type="number"
                      value={thresholds.maxDaysForFresh}
                      onChange={(e) => setThresholds(prev => ({ ...prev, maxDaysForFresh: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={365}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Contenido más reciente que estos días recibirá bonus de frescura
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Factores de Calidad</CardTitle>
                  <CardDescription>
                    Configura qué dominios y palabras clave aumentan la puntuación de calidad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="preferredDomains">Dominios Preferidos</Label>
                    <Textarea
                      id="preferredDomains"
                      value={qualityFactors.preferredDomains}
                      onChange={(e) => setQualityFactors(prev => ({ ...prev, preferredDomains: e.target.value }))}
                      placeholder="reuters.com, bbc.com, .edu, .gov"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Separar por comas. Dominios que reciben bonus de calidad
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="keywordBonus">Palabras Clave Bonus</Label>
                    <Textarea
                      id="keywordBonus"
                      value={qualityFactors.keywordBonus}
                      onChange={(e) => setQualityFactors(prev => ({ ...prev, keywordBonus: e.target.value }))}
                      placeholder="investigación, estudio, datos, análisis"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Separar por comas. Palabras que aumentan la puntuación de calidad
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="minimumContentLength">Longitud Mínima de Contenido</Label>
                    <Input
                      id="minimumContentLength"
                      type="number"
                      value={qualityFactors.minimumContentLength}
                      onChange={(e) => setQualityFactors(prev => ({ ...prev, minimumContentLength: parseInt(e.target.value) || 0 }))}
                      min={10}
                      max={1000}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Caracteres mínimos para considerar contenido de calidad
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-6">
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nombre de la nueva regla"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-48"
                />
                <Input
                  placeholder="Descripión"
                  value={newRuleDescription}
                  onChange={(e) => setNewRuleDescription(e.target.value)}
                  className="w-64"
                />
                <Button 
                  onClick={handleCreateRule}
                  disabled={!newRuleName.trim() || totalWeight !== 100}
                >
                  Crear Regla
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleUpdateRule(activeRule.id)}
                disabled={totalWeight !== 100}
              >
                Actualizar Regla Activa
              </Button>
              <Button onClick={onClose}>
                Guardar y Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 