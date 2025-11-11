import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { CalendarService } from '../services/calendarService.js';
import { getUserTokens } from '../utils/tokenStore.js';
import { decryptToken } from '../utils/encryption.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Middleware para obtener el servicio de calendario
async function getCalendarService(req, res, next) {
  try {
    const { userId } = req.user;
    const storedTokens = await getUserTokens(userId);

    if (!storedTokens) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated with Google'
      });
    }

    // Desencriptar tokens
    const tokens = {
      access_token: decryptToken(storedTokens.access_token),
      refresh_token: storedTokens.refresh_token ? decryptToken(storedTokens.refresh_token) : null,
      expiry_date: storedTokens.expiry_date
    };

    req.calendarService = new CalendarService(tokens);
    next();
  } catch (error) {
    logger.error('Error initializing calendar service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize calendar service'
    });
  }
}

router.use(authenticate);
router.use(getCalendarService);

/**
 * Crear evento
 */
router.post('/events', async (req, res, next) => {
  try {
    const { summary, description, start, end, attendees } = req.body;

    if (!summary || !start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: summary, start, end'
      });
    }

    const result = await req.calendarService.createEvent({
      summary,
      description,
      start,
      end,
      attendees
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Listar eventos
 */
router.get('/events', async (req, res, next) => {
  try {
    const { timeMin, timeMax, maxResults } = req.query;

    const result = await req.calendarService.listEvents({
      timeMin,
      timeMax,
      maxResults: maxResults ? parseInt(maxResults) : 10
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Obtener evento específico
 */
router.get('/events/:eventId', async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const result = await req.calendarService.getEvent(eventId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Actualizar evento
 */
router.put('/events/:eventId', async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;

    const result = await req.calendarService.updateEvent(eventId, updates);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Eliminar evento
 */
router.delete('/events/:eventId', async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const result = await req.calendarService.deleteEvent(eventId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Buscar eventos
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await req.calendarService.searchEvents(q);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Obtener eventos próximos
 */
router.get('/upcoming', async (req, res, next) => {
  try {
    const { minutes = 60 } = req.query;
    const events = await req.calendarService.getUpcomingEvents(parseInt(minutes));
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    next(error);
  }
});

export default router;
