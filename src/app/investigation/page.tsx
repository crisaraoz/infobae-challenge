'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid3X3, 
  List, 
  LayoutGrid, 
  Search, 
  Sparkles, 
  ArrowRight,
  Brain,
  Globe,
  TrendingUp,
  Heart,
  Building,
  Link2
} from 'lucide-react';

type ViewMode = 'cards' | 'list' | 'compact';

const predefinedTopics = [
  {
    id: 'ai',
    title: 'Inteligencia Artificial',
    description: 'Explora las últimas tendencias en IA',
    icon: '🤖',
    iconLucide: Brain,
    type: 'research',
    keywords: ['AI', 'Machine Learning', 'Deep Learning', 'ChatGPT']
  },
  {
    id: 'climate',
    title: 'Cambio Climático',
    description: 'Investigación sobre sostenibilidad y medio ambiente',
    icon: '🌍',
    iconLucide: Globe,
    type: 'research',
    keywords: ['Sostenibilidad', 'Medio Ambiente', 'Energías Renovables']
  },
  {
    id: 'politics',
    title: 'Política Argentina',
    description: 'Análisis de la situación política nacional y global',
    icon: '🏛️',
    iconLucide: Building,
    type: 'research',
    keywords: ['Elecciones', 'Gobierno', 'Políticas Públicas']
  },
  {
    id: 'health',
    title: 'Salud',
    description: 'Tendencias en salud y medicina',
    icon: '🏥',
    iconLucide: Heart,
    type: 'research',
    keywords: ['Medicina', 'Bienestar', 'Investigación Médica']
  },
  {
    id: 'economy',
    title: 'Economía',
    description: 'Análisis de mercados y tendencias económicas globales',
    icon: '📈',
    iconLucide: TrendingUp,
    type: 'research',
    keywords: ['Mercados', 'Finanzas', 'Criptomonedas', 'Inversiones']
  },
  {
    id: 'url-image',
    title: 'URL o Imagen',
    description: 'Genera artículos a partir de una URL o imagen usando IA',
    icon: '🔗',
    iconLucide: Link2,
    type: 'generate',
    keywords: ['Generación de Contenido', 'Análisis de Imágenes']
  },
];

function InvestigationPageContent() {
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const showParam = searchParams.get('show');
    if (showParam === 'topics') {
      setShowTopics(true);
    }
  }, [searchParams]);

  const handleStartResearch = () => {
    setShowTopics(true);
  };

  const handleTopicSelect = (topic: typeof predefinedTopics[0]) => {
    setSelectedTopic(topic.title);
    setTimeout(() => {
      if (topic.type === 'generate') {
        router.push('/generate');
      } else {
        router.push(`/research?topic=${encodeURIComponent(topic.title)}`);
      }
    }, 300);
  };

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      setSelectedTopic(customTopic);
      setTimeout(() => {
        router.push(`/research?topic=${encodeURIComponent(customTopic.trim())}`);
      }, 300);
    }
  };

  const renderTopicCard = (topic: typeof predefinedTopics[0]) => {
    const IconComponent = topic.iconLucide;
    
    return (
      <Card
        key={topic.id}
        onClick={() => handleTopicSelect(topic)}
        className={`
          group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105
          ${selectedTopic === topic.title ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${topic.type === 'generate' ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' : 'hover:border-blue-200'}
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {topic.title}
                </CardTitle>
              </div>
            </div>
            {topic.type === 'generate' && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                AI SDK
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-3">{topic.description}</CardDescription>
          <div className="flex flex-wrap gap-1">
            {topic.keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTopicList = (topic: typeof predefinedTopics[0]) => {
    const IconComponent = topic.iconLucide;
    
    return (
      <div
        key={topic.id}
        onClick={() => handleTopicSelect(topic)}
        className={`
          flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200
          hover:bg-gray-50 hover:border-blue-200 hover:shadow-md
          ${selectedTopic === topic.title ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
        `}
      >
        <div className="flex items-center space-x-4 flex-1">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <IconComponent className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{topic.title}</h3>
            <p className="text-sm text-gray-600">{topic.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            {topic.type === 'generate' && (
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                AI
              </span>
            )}
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  };

  const renderTopicCompact = (topic: typeof predefinedTopics[0]) => {
    const IconComponent = topic.iconLucide;
    
    return (
      <Button
        key={topic.id}
        variant="outline"
        onClick={() => handleTopicSelect(topic)}
        className={`
          flex items-center space-x-2 h-auto p-3 justify-start hover:bg-blue-50 hover:border-blue-300
          ${selectedTopic === topic.title ? 'bg-blue-50 border-blue-300' : ''}
        `}
      >
        <IconComponent className="h-4 w-4" />
        <span>{topic.title}</span>
        {topic.type === 'generate' && (
          <span className="ml-auto bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
            AI
          </span>
        )}
      </Button>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Infobae AI Challenge
      </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Inicia una investigación profunda sobre cualquier tema utilizando 
            inteligencia artificial avanzada
          </p>
        </div>

        {!showTopics ? (
          /* Botón principal para iniciar */
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <button
                onClick={handleStartResearch}
                className="px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                🚀 Comenzar Investigación
              </button>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm md:text-base">Selecciona un tema o crea uno personalizado</span>
            </div>
          </div>
        ) : (
          /* Panel de investigación */
          <div className="space-y-8 text-left">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowTopics(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Volver
              </Button>
              
              {/* Controles de vista */}
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'predefined' | 'custom')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="predefined" className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Temas Sugeridos</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Tema Personalizado</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="predefined" className="space-y-6">
                {/* Renderizado según el modo de vista */}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {predefinedTopics.map(renderTopicCard)}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-3 max-w-2xl mx-auto">
                    {predefinedTopics.map(renderTopicList)}
                  </div>
                )}

                {viewMode === 'compact' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
                    {predefinedTopics.map(renderTopicCompact)}
                  </div>
                )}

                <div className="text-center pt-4">
                  <p className="text-gray-500 text-sm">
                    Haz clic en cualquier tema para comenzar tu investigación
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-6">
                <div className="max-w-lg mx-auto space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Investigación Personalizada</CardTitle>
                      <CardDescription className="text-center">
                        Escribe cualquier tema que quieras investigar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Ej: Inteligencia artificial en medicina, Bitcoin en 2024..."
                          value={customTopic}
                          onChange={(e) => setCustomTopic(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCustomTopicSubmit();
                            }
                          }}
                          className="flex-1"
                        />
        <Button
                          onClick={handleCustomTopicSubmit}
                          disabled={!customTopic.trim()}
                          className="px-4"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Investigar
        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p className="mb-2">💡 Ejemplos de temas:</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'Realidad Virtual en educación',
                            'Energía solar en Argentina',
                            'Ciberseguridad 2025',
                            'Minería de datos'
                          ].map((example, index) => (
                            <button
                              key={index}
                              onClick={() => setCustomTopic(example)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
            <span>Develop by</span>
            <span className="font-semibold text-blue-600">CrisAraoz</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function InvestigationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando página de investigación...</p>
      </div>
    </div>}>
      <InvestigationPageContent />
    </Suspense>
  );
}
