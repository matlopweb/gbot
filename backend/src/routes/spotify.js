import crypto from 'crypto';
import express from 'express';
import { SpotifyService } from '../services/spotifyService.js';
import { logger } from '../utils/logger.js';
import { encryptToken } from '../utils/encryption.js';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const STATE_SECRET = process.env.SPOTIFY_STATE_SECRET || process.env.JWT_SECRET || 'spotify-state-secret';

function buildState(payload) {
  const json = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', STATE_SECRET).update(json).digest('hex');
  const encoded = Buffer.from(json).toString('base64url');
  return `${encoded}.${signature}`;
}

function parseState(state) {
  if (!state || !state.includes('.')) {
    throw new Error('Invalid state payload');
  }
  const [encoded, signature] = state.split('.');
  const json = Buffer.from(encoded, 'base64url').toString('utf8');
  const expected = crypto.createHmac('sha256', STATE_SECRET).update(json).digest('hex');
  const providedBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new Error('Invalid state signature');
  }
  return JSON.parse(json);
}

function ensureSupabaseConfigured(res, redirectOnError = false) {
  if (!supabase) {
    if (redirectOnError) {
      res.redirect(`${FRONTEND_URL}?spotify_error=service_unavailable`);
    } else {
      res.status(503).json({
        success: false,
        message: 'Supabase is not configured. Spotify features are disabled.'
      });
    }
    return false;
  }
  return true;
}

router.get('/auth', authenticate, (req, res) => {
  if (!ensureSupabaseConfigured(res)) {
    return;
  }

  const spotifyService = new SpotifyService();
  const state = buildState({
    userId: req.user.userId,
    nonce: crypto.randomBytes(8).toString('hex'),
    ts: Date.now()
  });

  const authUrl = spotifyService.getAuthUrl(state);
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const { code, error, state } = req.query;

  if (error) {
    logger.error('Spotify auth error:', error);
    return res.redirect(`${FRONTEND_URL}?spotify_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.status(400).json({ success: false, error: 'No authorization code provided' });
  }

  if (!ensureSupabaseConfigured(res, true)) {
    return;
  }

  let statePayload;
  try {
    statePayload = parseState(state);
  } catch (stateError) {
    logger.error('Invalid Spotify state:', stateError);
    return res.redirect(`${FRONTEND_URL}?spotify_error=invalid_state`);
  }

  try {
    const spotifyService = new SpotifyService();
    const tokens = await spotifyService.exchangeCodeForTokens(code);

    const encryptedAccessToken = encryptToken(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;

    const upsertPayload = {
      user_id: statePayload.userId,
      service: 'spotify',
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: dbError } = await supabase
      .from('user_tokens')
      .upsert(upsertPayload);

    if (dbError) {
      throw dbError;
    }

    logger.info(`Spotify tokens saved successfully for user ${statePayload.userId}`);
    res.redirect(`${FRONTEND_URL}?spotify_connected=true`);
  } catch (callbackError) {
    logger.error('Error in Spotify callback:', callbackError);
    res.redirect(`${FRONTEND_URL}?spotify_error=auth_failed`);
  }
});

router.get('/status', authenticate, async (req, res) => {
  try {
    if (!ensureSupabaseConfigured(res)) {
      return;
    }

    const { data, error } = await supabase
      .from('user_tokens')
      .select('access_token')
      .eq('user_id', req.user.userId)
      .eq('service', 'spotify')
      .single();

    if (error || !data) {
      return res.json({ connected: false });
    }

    res.json({ connected: true });
  } catch (statusError) {
    logger.error('Error checking Spotify status:', statusError);
    res.json({ connected: false });
  }
});

router.post('/disconnect', authenticate, async (req, res) => {
  try {
    if (!ensureSupabaseConfigured(res)) {
      return;
    }

    const { error } = await supabase
      .from('user_tokens')
      .delete()
      .eq('user_id', req.user.userId)
      .eq('service', 'spotify');

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Spotify disconnected' });
  } catch (disconnectError) {
    logger.error('Error disconnecting Spotify:', disconnectError);
    res.status(500).json({ success: false, error: 'Failed to disconnect Spotify' });
  }
});

export default router;

