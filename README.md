# 🔍 Infobae AI Challenge - Sistema de Investigación Inteligente

Un sistema avanzado de investigación que utiliza inteligencia artificial para buscar, analizar y categorizar contenido relevante sobre cualquier tema, generando artículos de alta calidad basados en fuentes confiables.

## 🎬 Demostración

### 📸 Capturas de Pantalla

**🔍 Proceso de Investigación Completo**

<div align="center">
  <img src="./public/screen_1.png" alt="Pantalla inicial de investigación" width="45%" />
  <img src="./public/screen_2.png" alt="Proceso de búsqueda" width="45%" />
</div>

<div align="center">
  <img src="./public/screen_3.png" alt="Resultados categorizados" width="45%" />
  <img src="./public/screen_4.png" alt="Generación de artículos" width="45%" />
</div>

### 🖼️ **Galería de funcionalidades:**

1. **🏠 Pantalla inicial** (`screen_1.png`) - Interfaz principal y búsqueda
2. **🔍 Proceso de búsqueda** (`screen_2.png`) - IA procesando consultas
3. **📊 Resultados categorizados** (`screen_3.png`) - Análisis y categorización
4. **📝 Generación de artículos** (`screen_4.png`) - Creación de contenido

### ✨ Lo que ves en las capturas:
- 🔍 **Búsqueda inteligente** con optimización de consultas
- ⚡ **Velocidad de compilación** mejorada (3.5s vs 14.6s)
- 📊 **Categorización automática** de resultados
- 🎨 **Interfaz moderna** y responsive
- 🧠 **Procesamiento con IA** en tiempo real
- 📱 **Experiencia de usuario** fluida

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- **npm** o **yarn**
- **Claves de API** (ver configuración más abajo)

### ⚡ Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd infobae-ai-challenge
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   
   ```env
   # 🔑 APIs Requeridas
   EXA_API_KEY=your_exa_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   
   # 🚀 Optimizaciones de desarrollo (opcional)
   NEXT_PRIVATE_SKIP_VALIDATION=1
   NEXT_PRIVATE_STANDALONE=1
   NEXT_PRIVATE_BUILD_WORKER=1
   NODE_OPTIONS="--max-old-space-size=4096"
   FAST_REFRESH=true
   ```

4. **Obtener las claves de API**

   **🔍 Exa API Key:**
   - Visita: [https://exa.ai/](https://exa.ai/)
   - Regístrate y obtén tu API key
   - Servicio de búsqueda semántica avanzada

   **🤖 OpenAI API Key:**
   - Visita: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Crea una cuenta y genera tu API key
   - Necesario para procesamiento de texto y resúmenes

5. **Ejecutar el proyecto**
   ```bash
   # Modo desarrollo normal
   npm run dev
   
   # Modo desarrollo ultra-rápido (sin type checking)
   npm run dev:fast
   ```

6. **¡Listo!** 🎉
   
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Arquitectura del Sistema

### 📁 Estructura del Proyecto

```
src/
├── 🔌 integrations/      # APIs externas
│   ├── exa/             # Búsqueda con Exa API
│   └── openai/          # Procesamiento con OpenAI
├── 🧠 analysis/         # Lógica de análisis
│   ├── heuristics.ts    # Algoritmos de categorización
│   └── contentProcessor.ts # Procesamiento completo
├── ⚙️ services/         # Servicios principales
│   └── researchService.ts
├── 🎯 app/              # Aplicación Next.js
│   ├── actions/         # Server Actions
│   ├── research/        # Página de resultados
│   ├── investigation/   # Página de búsqueda
│   └── article/         # Generación de artículos
├── 🧩 components/       # Componentes UI
└── 🔧 hooks/           # Hooks personalizados
```

### 🔄 Flujo de Funcionamiento

1. **Usuario ingresa tema** → Página de investigación
2. **Optimización de consulta** → OpenAI mejora la búsqueda
3. **Búsqueda de contenido** → Exa API encuentra fuentes
4. **Análisis de resultados** → Heurísticas categorizan contenido
5. **Presentación** → Resultados organizados por relevancia
6. **Generación de artículos** → Creación de contenido expandido

## 🎮 Funcionalidades

### ✨ Características Principales

- **🔍 Búsqueda Inteligente**: Utiliza Exa API para búsquedas semánticas avanzadas
- **�� Análisis con IA**: OpenAI procesa y optimiza consultas
- **📊 Categorización Automática**: Algoritmos heurísticos evalúan relevancia
- **⚡ Cache Inteligente**: Sistema de caché para mejorar rendimiento
- **📱 Responsive Design**: Interfaz adaptada a todos los dispositivos
- **🎨 UI Moderna**: Componentes con Tailwind CSS y Radix UI

### 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbopack
npm run dev:fast     # Desarrollo sin type checking (más rápido)

# Construcción
npm run build        # Build de producción
npm run build:analyze # Análisis del bundle

# Calidad de código
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores automáticamente
npm run type-check   # Verificar tipos TypeScript

# Utilidades
npm run optimize     # Aplicar optimizaciones de rendimiento
```

## 🚀 Optimizaciones de Rendimiento

### ⚡ Configuraciones Aplicadas

- **Turbopack**: Compilación ultra-rápida de Next.js 15
- **Optimización de imports**: Paquetes específicos optimizados
- **Cache inteligente**: Sistema de caché del filesystem
- **Type checking opcional**: Modo rápido sin verificación de tipos
- **Bundle optimization**: Análisis y optimización de bundles

## 🔮 Posibilidad de Nuevas Futuras

### 🎯 Versión 2.0

- **📊 Dashboard Analytics**
  - Métricas de uso y rendimiento
  - Estadísticas de investigaciones
  - Análisis de tendencias de búsqueda

- **🔄 Integraciones Adicionales**
  - Google Scholar API
  - PubMed para artículos científicos
  - News API para noticias recientes
  - Wikipedia API para contexto general

- **🧠 Mejoras de IA**
  - Soporte para múltiples modelos (Claude, Gemini)
  - Análisis de sentimiento
  - Detección de sesgos
  - Fact-checking automático

### 🎯 Versión 2.5

- **👥 Funcionalidades Colaborativas**
  - Equipos de investigación
  - Comentarios y anotaciones
  - Historial compartido
  - Workflows colaborativos

- **🔒 Seguridad y Privacidad**
  - Autenticación avanzada
  - Encriptación de datos sensibles
  - Auditoría de accesos
  - Cumplimiento GDPR

### 🎯 Versión 3.0

- **📱 Aplicación Móvil**
  - React Native
  - Sincronización offline
  - Notificaciones push

- **🤖 IA Avanzada**
  - Generación de imágenes
  - Análisis de video/audio
  - Procesamiento multimodal
  - Agentes autónomos

## 🛠️ Tecnologías Utilizadas

### 🎨 Frontend
- **Next.js 15** - Framework React con Turbopack
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Styling utility-first
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos modernos

### 🔧 Backend/APIs
- **OpenAI API** - Procesamiento de lenguaje natural
- **Exa API** - Búsqueda semántica avanzada
- **Next.js Server Actions** - Server-side logic

### 🔨 Herramientas de Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **TypeScript** - Type checking
- **Turbopack** - Bundling ultra-rápido

## 📝 Scripts de Configuración

### 🔧 Optimización Automática

```bash
# Aplicar todas las optimizaciones de rendimiento
npm run optimize
```

Este script automáticamente:
- Limpia caché de Next.js
- Crea archivo .env.local con optimizaciones
- Verifica configuraciones
- Aplica mejores prácticas

### 🧹 Limpieza de Proyecto

```bash
# Limpiar completamente el proyecto
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run dev
```

## ⚠️ Notas Importantes

### 🔑 Seguridad de API Keys
- **NUNCA** subas tus claves al repositorio
- Usa `.env.local` que está en `.gitignore`
- Rota las claves periódicamente
- Limita el uso de APIs según necesidad

### 💾 Recomendaciones de Desarrollo
- **Filesystem**: Mover el proyecto fuera de OneDrive para mejor rendimiento
- **Memoria**: Usa al menos 8GB RAM para desarrollo fluido
- **Node.js**: Versión 18+ recomendada
- **Antivirus**: Excluye `node_modules` y `.next` del escaneo

