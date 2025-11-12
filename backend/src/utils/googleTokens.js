import { decryptToken, encryptToken } from './encryption.js';
import { saveUserTokens } from './tokenStore.js';
import { refreshAccessToken } from '../config/google.js';
import { logger } from './logger.js';

const REFRESH_THRESHOLD_MS = 60 * 1000; // 1 minuto

export async function ensureFreshGoogleTokens(userId, storedTokens) {
  if (!storedTokens) {
    return null;
  }

  if (!storedTokens.expiry_date || !storedTokens.refresh_token) {
    return storedTokens;
  }

  const expiresAt = new Date(storedTokens.expiry_date).getTime();
  if (Number.isNaN(expiresAt) || expiresAt - Date.now() > REFRESH_THRESHOLD_MS) {
    return storedTokens;
  }

  try {
    const refreshToken = decryptToken(storedTokens.refresh_token);
    if (!refreshToken) {
      return storedTokens;
    }

    const refreshed = await refreshAccessToken(refreshToken);

    const updatedTokens = {
      access_token: encryptToken(refreshed.access_token),
      refresh_token: storedTokens.refresh_token,
      expiry_date: refreshed.expiry_date ?? new Date(Date.now() + 55 * 60 * 1000).toISOString()
    };

    await saveUserTokens(userId, updatedTokens);
    logger.info(`Google tokens refreshed automatically for user ${userId}`);
    return updatedTokens;
  } catch (error) {
    logger.error('Automatic Google token refresh failed', error);
    return storedTokens;
  }
}

export function decryptGoogleTokens(storedTokens) {
  if (!storedTokens) {
    return null;
  }

  return {
    access_token: decryptToken(storedTokens.access_token),
    refresh_token: storedTokens.refresh_token ? decryptToken(storedTokens.refresh_token) : null,
    expiry_date: storedTokens.expiry_date
  };
}
