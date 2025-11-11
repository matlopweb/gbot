import express from 'express';
import { getAuthUrl, getTokensFromCode, refreshAccessToken } from '../config/google.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { encryptToken, decryptToken } from '../utils/encryption.js';
import { logger } from '../utils/logger.js';
import { getUserTokens, saveUserTokens, deleteUserTokens } from '../utils/tokenStore.js';

const router = express.Router();

/**
 * Inicia el flujo de OAuth2
 */
router.get('/google', (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    logger.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL'
    });
  }
});

/**
 * Callback de OAuth2
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    // Obtener tokens de Google
    const tokens = await getTokensFromCode(code);

    // Generar un ID de usuario único (en producción, usar el ID de Google)
    const userId = `user_${Date.now()}`;

    // Encriptar y guardar tokens
    const encryptedTokens = {
      access_token: encryptToken(tokens.access_token),
      refresh_token: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
      expiry_date: tokens.expiry_date
    };

    await saveUserTokens(userId, encryptedTokens);

    // Generar JWT para la aplicación
    const jwtToken = generateToken({
      userId,
      scope: 'full'
    });

    logger.info(`User authenticated: ${userId}`);

    // Redirigir al frontend con el token
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${jwtToken}`;
    res.redirect(redirectUrl);

  } catch (error) {
    logger.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

/**
 * Refresca el access token
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const { userId } = req.user;

    // Obtener tokens guardados
    const storedTokens = await getUserTokens(userId);

    if (!storedTokens || !storedTokens.refresh_token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token available'
      });
    }

    // Desencriptar refresh token
    const refreshToken = decryptToken(storedTokens.refresh_token);

    // Obtener nuevos tokens
    const newTokens = await refreshAccessToken(refreshToken);

    // Encriptar y guardar nuevos tokens
    const encryptedTokens = {
      access_token: encryptToken(newTokens.access_token),
      refresh_token: storedTokens.refresh_token, // Mantener el mismo refresh token
      expiry_date: newTokens.expiry_date
    };

    await saveUserTokens(userId, encryptedTokens);

    logger.info(`Tokens refreshed for user: ${userId}`);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully'
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh tokens'
    });
  }
});

/**
 * Verifica el estado de autenticación
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const { userId } = req.user;
    const tokens = await getUserTokens(userId);

    res.json({
      success: true,
      authenticated: !!tokens,
      userId,
      hasRefreshToken: !!tokens?.refresh_token,
      tokenExpiry: tokens?.expiry_date
    });
  } catch (error) {
    logger.error('Auth status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check authentication status'
    });
  }
});

/**
 * Cierra sesión
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { userId } = req.user;
    await deleteUserTokens(userId);

    logger.info(`User logged out: ${userId}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
});

export default router;
