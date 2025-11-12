import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKENS_DIR = path.join(__dirname, '../../tokens');
const DEFAULT_SERVICE = 'google';
const TABLE = 'user_tokens';

async function ensureTokensDir() {
  try {
    await fs.access(TOKENS_DIR);
  } catch {
    await fs.mkdir(TOKENS_DIR, { recursive: true });
  }
}

function sanitizeTokens(tokens) {
  if (!tokens) return null;
  return {
    access_token: tokens.access_token ?? null,
    refresh_token: tokens.refresh_token ?? null,
    expiry_date: tokens.expiry_date ?? (tokens.expires_at ? new Date(tokens.expires_at).toISOString() : null),
    metadata: tokens.metadata ?? {}
  };
}

export async function saveUserTokens(userId, tokens, service = DEFAULT_SERVICE) {
  if (supabase) {
    const payload = {
      user_id: userId,
      service,
      access_token: tokens.access_token ?? null,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      metadata: tokens.metadata ?? {},
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from(TABLE)
      .upsert(payload, { onConflict: 'user_id,service' });

    if (error) {
      logger.error('Error saving tokens to Supabase', error);
      throw error;
    }
    return;
  }

  await ensureTokensDir();
  const filePath = path.join(TOKENS_DIR, `${userId}_${service}.json`);
  await fs.writeFile(
    filePath,
    JSON.stringify(
      {
        ...tokens,
        service,
        updatedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
}

export async function getUserTokens(userId, service = DEFAULT_SERVICE) {
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('access_token, refresh_token, expires_at, metadata, updated_at')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching tokens from Supabase', error);
      throw error;
    }

    return sanitizeTokens(
      data
        ? {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_date: data.expires_at,
            metadata: data.metadata,
            updatedAt: data.updated_at
          }
        : null
    );
  }

  try {
    const filePath = path.join(TOKENS_DIR, `${userId}_${service}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function deleteUserTokens(userId, service = DEFAULT_SERVICE) {
  if (supabase) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('user_id', userId)
      .eq('service', service);

    if (error) {
      logger.error('Error deleting tokens from Supabase', error);
      throw error;
    }
    return;
  }

  try {
    const filePath = path.join(TOKENS_DIR, `${userId}_${service}.json`);
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function listUsers(service = DEFAULT_SERVICE) {
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('user_id')
      .eq('service', service);

    if (error) {
      logger.error('Error listing tokens from Supabase', error);
      throw error;
    }

    return Array.from(new Set((data || []).map(row => row.user_id)));
  }

  await ensureTokensDir();
  const files = await fs.readdir(TOKENS_DIR);
  return files
    .filter(file => file.endsWith(`_${service}.json`))
    .map(file => file.replace(`_${service}.json`, ''));
}
