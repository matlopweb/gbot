import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKENS_DIR = path.join(__dirname, '../../tokens');

// Asegurar que el directorio existe
async function ensureTokensDir() {
  try {
    await fs.access(TOKENS_DIR);
  } catch {
    await fs.mkdir(TOKENS_DIR, { recursive: true });
  }
}

/**
 * Guarda los tokens de un usuario
 */
export async function saveUserTokens(userId, tokens) {
  await ensureTokensDir();
  const filePath = path.join(TOKENS_DIR, `${userId}.json`);
  
  await fs.writeFile(
    filePath,
    JSON.stringify({
      ...tokens,
      updatedAt: new Date().toISOString()
    }, null, 2)
  );
}

/**
 * Obtiene los tokens de un usuario
 */
export async function getUserTokens(userId) {
  try {
    const filePath = path.join(TOKENS_DIR, `${userId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Elimina los tokens de un usuario
 */
export async function deleteUserTokens(userId) {
  try {
    const filePath = path.join(TOKENS_DIR, `${userId}.json`);
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Lista todos los usuarios con tokens guardados
 */
export async function listUsers() {
  await ensureTokensDir();
  const files = await fs.readdir(TOKENS_DIR);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
}

// Nota: En producción, usar una base de datos real (Supabase, MongoDB, etc.)
// Este es solo un almacenamiento temporal en archivos para desarrollo
