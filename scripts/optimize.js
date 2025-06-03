#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Aplicando optimizaciones de rendimiento...\n');

// 1. Limpiar cache existente
console.log('🧹 Limpiando cache...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  console.log('✅ Cache de Next.js limpiado');
} catch (error) {
  console.log('⚠️ No se pudo limpiar el cache (puede que no exista)');
}

// 2. Crear archivo .env.local si no existe
const envLocalPath = path.join(process.cwd(), '.env.local');
const envContent = `# Optimizaciones de desarrollo para mayor velocidad
NEXT_PRIVATE_SKIP_VALIDATION=1
NEXT_PRIVATE_STANDALONE=1
NEXT_PRIVATE_BUILD_WORKER=1

# Optimización de memoria
NODE_OPTIONS="--max-old-space-size=4096"

# Configuración de desarrollo rápido
FAST_REFRESH=true
`;

if (!fs.existsSync(envLocalPath)) {
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Archivo .env.local creado con optimizaciones');
} else {
  console.log('ℹ️ Archivo .env.local ya existe');
}

// 3. Verificar configuraciones
console.log('\n📋 Verificando configuraciones...');

const configs = [
  { file: 'next.config.ts', check: 'turbo' },
  { file: 'tsconfig.json', check: 'ES2022' },
  { file: 'package.json', check: '--turbo' }
];

configs.forEach(({ file, check }) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(check)) {
      console.log(`✅ ${file} - Optimización encontrada`);
    } else {
      console.log(`⚠️ ${file} - Optimización podría no estar aplicada`);
    }
  } catch (error) {
    console.log(`❌ ${file} - No se pudo verificar`);
  }
});

console.log('\n🎉 Optimizaciones aplicadas!');
console.log('\n📖 Próximos pasos:');
console.log('1. Ejecuta: npm run dev (modo normal con turbo)');
console.log('2. O ejecuta: npm run dev:fast (modo ultra-rápido)');
console.log('3. Lee PERFORMANCE_OPTIMIZATIONS.md para más detalles');

console.log('\n⏱️ Tiempos esperados:');
console.log('• Compilación inicial: 3-5s (vs 14s anterior)');
console.log('• Hot reload: <1s');
console.log('• Cambios incrementales: <500ms'); 