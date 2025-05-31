'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const predefinedTopics = [
  {
    id: 'ai',
    title: 'Inteligencia Artificial',
    description: 'Explora las últimas tendencias en IA',
    icon: '🤖'
  },
  {
    id: 'climate',
    title: 'Cambio Climático',
    description: 'Investigación sobre sostenibilidad y medio ambiente',
    icon: '🌍'
  },
  {
    id: 'politics',
    title: 'Política',
    description: 'Análisis de la situación política nacional y global',
    icon: '🏛️'
  },
  {
    id: 'health',
    title: 'Salud',
    description: 'Tendencias en salud y medicina',
    icon: '🏥'
  },
  {
    id: 'economy',
    title: 'Economía',
    description: 'Análisis de mercados y tendencias económicas globales',
    icon: '📈'
  },
];

export default function InvestigationPage() {
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const router = useRouter();

  const handleStartResearch = () => {
    setShowTopics(true);
  };

  const handleTopicSelect = (topicTitle: string) => {
    setSelectedTopic(topicTitle);
    // Pequeño delay para mostrar la selección antes de navegar
    setTimeout(() => {
      router.push(`/article?topic=${encodeURIComponent(topicTitle)}`);
    }, 300);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Investigación de Contenido
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
              <span className="text-sm md:text-base">Selecciona un tema para empezar</span>
            </div>
          </div>
        ) : (
          /* Grid de opciones de temas */
          <div className="space-y-8">
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowTopics(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Volver
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {predefinedTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.title)}
                  className={`
                    group cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl 
                    transform hover:scale-105 transition-all duration-300 border-2 
                    ${selectedTopic === topic.title ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-blue-200'}
                  `}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {topic.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {topic.description}
                  </p>
                  
                  {selectedTopic === topic.title && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center pt-4">
              <p className="text-gray-500">
                Haz clic en cualquier tema para comenzar tu investigación
              </p>
            </div>
          </div>
        )}

        {/* Footer con info adicional */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
            <span>Potenciado por</span>
            <span className="font-semibold text-blue-600">AI SDK</span>
            <span>+</span>
            <span className="font-semibold text-purple-600">Exa API</span>
          </div>
        </div>
      </div>
    </main>
  );
}
