import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const DEFAULT_PROFILE = {
  display_name: 'Explorador',
  avatar_style: 'classic',
  color_theme: 'aqua',
  voice_style: 'warm',
  speech_rate: 1.0,
  favorite_quote: null,
  preferences: {}
};

async function ensureProfile(userId) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (data) {
    return data;
  }

  const payload = {
    user_id: userId,
    ...DEFAULT_PROFILE
  };

  const { data: created, error: insertError } = await supabase
    .from('user_profiles')
    .insert([payload])
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return created;
}

router.use(authenticate);

router.get('/me', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Supabase is not configured'
      });
    }

    const profile = await ensureProfile(req.user.userId);
    res.json({
      success: true,
      profile
    });
  } catch (error) {
    logger.error('Error loading profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load profile'
    });
  }
});

router.put('/me', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Supabase is not configured'
      });
    }

    const allowedFields = [
      'display_name',
      'avatar_style',
      'color_theme',
      'voice_style',
      'speech_rate',
      'favorite_quote',
      'preferences'
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const payload = Object.keys(updates).length > 0 ? updates : {};
    payload.user_id = req.user.userId;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      profile: data
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

export default router;
