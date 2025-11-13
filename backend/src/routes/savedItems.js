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

    const { type } = req.query;
    let query = supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      items: data || []
    });
  } catch (error) {
    logger.error('Error fetching saved items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load saved items'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { type, title, url, content } = req.body;

    if (!type || !['link', 'note', 'audio'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type'
      });
    }

    if (type === 'link' && !url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required for links'
      });
    }

    if (type !== 'link' && !content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const payload = {
      user_id: req.user.userId,
      type,
      title: title?.trim() || null,
      url: url?.trim() || null,
      content: content || null
    };

    const { data, error } = await supabase
      .from('saved_items')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      item: data
    });
  } catch (error) {
    logger.error('Error saving item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save item'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item'
    });
  }
});

export default router;
