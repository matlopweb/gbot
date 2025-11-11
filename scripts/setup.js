#!/usr/bin/env node

/**
 * Script de configuración inicial para GBot
 * Genera claves de seguridad y crea archivos .env
 */

import { randomBytes } from 'crypto';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSecret(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

async function setup() {
  console.log('🤖 GBot - Configuración Inicial\n');

  // Verificar si ya existen archivos .env
  const backendEnvPath = join(rootDir, 'backend', '.env');
  const frontendEnvPath = join(rootDir, 'frontend', '.env');

  if (existsSync(backendEnvPath) || existsSync(frontendEnvPath)) {
    const overwrite = await question('⚠️  Los archivos .env ya existen. ¿Sobrescribir? (s/N): ');
    if (overwrite.toLowerCase() !== 's') {
      console.log('Configuración cancelada.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Ingresa la información requerida:\n');

  // OpenAI
  const openaiKey = await question('OpenAI API Key: ');

  // Google OAuth
  const googleClientId = await question('Google Client ID: ');
  const googleClientSecret = await question('Google Client Secret: ');

  // Generar secretos
  console.log('\n🔐 Generando claves de seguridad...\n');
  const jwtSecret = generateSecret(64);
  const encryptionKey = generateSecret(16);

  // Configuración opcional
  const useSupabase = await question('¿Usar Supabase para persistencia? (s/N): ');
  let supabaseUrl = '';
  let supabaseKey = '';

  if (useSupabase.toLowerCase() === 's') {
    supabaseUrl = await question('Supabase URL: ');
    supabaseKey = await question('Supabase Anon Key: ');
  }

  // Crear archivo .env del backend
  const backendEnv = `# OpenAI Configuration
OPENAI_API_KEY=${openaiKey}

# Google OAuth2
GOOGLE_CLIENT_ID=${googleClientId}
GOOGLE_CLIENT_SECRET=${googleClientSecret}
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# JWT
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Supabase (opcional)
${supabaseUrl ? `SUPABASE_URL=${supabaseUrl}` : '# SUPABASE_URL='}
${supabaseKey ? `SUPABASE_KEY=${supabaseKey}` : '# SUPABASE_KEY='}

# Server
PORT=3001
NODE_ENV=development

# Encryption
ENCRYPTION_KEY=${encryptionKey}

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
`;

  // Crear archivo .env del frontend
  const frontendEnv = `VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
`;

  // Escribir archivos
  writeFileSync(backendEnvPath, backendEnv);
  writeFileSync(frontendEnvPath, frontendEnv);

  console.log('\n✅ Configuración completada!\n');
  console.log('Archivos creados:');
  console.log('  - backend/.env');
  console.log('  - frontend/.env');
  console.log('\n📚 Próximos pasos:');
  console.log('  1. Instalar dependencias: npm run install:all');
  console.log('  2. Iniciar la aplicación: npm run dev');
  console.log('  3. Abrir http://localhost:3000 en tu navegador\n');
  console.log('Para más información, consulta QUICKSTART.md\n');

  rl.close();
}

setup().catch(error => {
  console.error('Error durante la configuración:', error);
  rl.close();
  process.exit(1);
});
