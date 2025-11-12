import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { memoryService } from '../services/memoryService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const MAX_LIMIT = 200;

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, MAX_LIMIT);
    const conversations = await memoryService.getRecentConversations(req.user.userId, limit);

    const messages = conversations
      .flatMap(entry => (entry.messages || []).map(message => ({
        ...message,
        timestamp: message.timestamp || entry.created_at
      })))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load conversations'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.role || !message?.content) {
      return res.status(400).json({
        success: false,
        message: 'Message role and content are required'
      });
    }

    const payload = {
      id: message.id || Date.now(),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp || new Date().toISOString(),
      metadata: message.metadata || null,
      isProactive: message.isProactive || false
    };

    await memoryService.saveConversation(req.user.userId, [payload]);

    res.json({
      success: true
    });
  } catch (error) {
    logger.error('Error saving conversation message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save conversation message'
    });
  }
});

export default router;
