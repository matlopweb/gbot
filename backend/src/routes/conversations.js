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
    logger.info(`Fetching conversations for user: ${req.user.userId}, limit: ${limit}`);
    
    const conversations = await memoryService.getRecentConversations(req.user.userId, limit);
    logger.info(`Found ${conversations.length} conversation entries for user: ${req.user.userId}`);

    const messages = conversations
      .flatMap(entry => (entry.messages || []).map(message => ({
        ...message,
        timestamp: message.timestamp || entry.created_at
      })))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    logger.info(`Returning ${messages.length} total messages for user: ${req.user.userId}`);

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

    logger.info(`Saving conversation message for user: ${req.user.userId}, role: ${payload.role}, content length: ${payload.content.length}`);
    
    await memoryService.saveConversation(req.user.userId, [payload]);
    
    logger.info(`Successfully saved conversation message for user: ${req.user.userId}`);

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
