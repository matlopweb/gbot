import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

function ensureSupabase(res) {
  if (!supabase) {
    res.status(503).json({
      success: false,
      message: 'Supabase is not configured'
    });
    return false;
  }
  return true;
}

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { data, error } = await supabase
      .from('user_scenarios')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('is_active', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      scenarios: data || []
    });
  } catch (error) {
    logger.error('Error fetching scenarios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load scenarios'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { name, description, tone = 'neutral', widgets = [], automations = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const payload = {
      user_id: req.user.userId,
      name,
      description,
      tone,
      widgets,
      automations,
      is_active: false
    };

    const { data, error } = await supabase
      .from('user_scenarios')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, scenario: data });
  } catch (error) {
    logger.error('Error creating scenario:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scenario'
    });
  }
});

router.patch('/:id/activate', async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const scenarioId = req.params.id;
    const userId = req.user.userId;

    const { data: scenario, error: fetchError } = await supabase
      .from('user_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    const { error: deactivateError } = await supabase
      .from('user_scenarios')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) throw deactivateError;

    const { data: updated, error } = await supabase
      .from('user_scenarios')
      .update({ is_active: true })
      .eq('id', scenarioId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      scenario: updated
    });
  } catch (error) {
    logger.error('Error activating scenario:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate scenario'
    });
  }
});

export default router;
