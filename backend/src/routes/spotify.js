import express from 'express';
import { SpotifyService } from '../services/spotifyService.js';
import { logger } from '../utils/logger.js';
import { encryptToken, decryptToken } from '../utils/encryption.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * Inicia el flujo de autenticación de Spotify
 */
router.get('/auth', (req, res) => {
  const spotifyService = new SpotifyService();
  const authUrl = spotifyService.getAuthUrl();
  res.redirect(authUrl);
});

/**
 * Callback de autenticación de Spotify
 */
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    logger.error('Spotify auth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?spotify_error=${error}`);
  }

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    const spotifyService = new SpotifyService();
    const tokens = await spotifyService.exchangeCodeForTokens(code);

    // Obtener userId del estado de sesión (deberías pasarlo en el state parameter)
    const userId = req.session?.userId || req.query.state;

    if (!userId) {
      throw new Error('No user ID found');
    }

    // Encriptar tokens
    const encryptedAccessToken = encryptToken(tokens.accessToken);
    const encryptedRefreshToken = encryptToken(tokens.refreshToken);

    // Guardar tokens en Supabase
    const { error: dbError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: userId,
        service: 'spotify',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      throw dbError;
    }

    logger.info('Spotify tokens saved successfully for user:', userId);

    // Redirigir al frontend con éxito
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?spotify_connected=true`);

  } catch (error) {
    logger.error('Error in Spotify callback:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?spotify_error=auth_failed`);
  }
});

/**
 * Verifica el estado de conexión de Spotify
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.json({ connected: false });
    }

    const { data, error } = await supabase
      .from('user_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('service', 'spotify')
      .single();

    if (error || !data) {
      return res.json({ connected: false });
    }

    res.json({ connected: true });

  } catch (error) {
    logger.error('Error checking Spotify status:', error);
    res.json({ connected: false });
  }
});

/**
 * Desconecta Spotify
 */
router.post('/disconnect', async (req, res) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { error } = await supabase
      .from('user_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('service', 'spotify');

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Spotify disconnected' });

  } catch (error) {
    logger.error('Error disconnecting Spotify:', error);
    res.status(500).json({ error: 'Failed to disconnect Spotify' });
  }
});

export default router;
