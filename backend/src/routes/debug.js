import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Endpoint de debug para verificar configuración
 */
router.get('/config', (req, res) => {
  try {
    const config = {
      environment: process.env.NODE_ENV || 'development',
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      port: process.env.PORT || 3001,
      timestamp: new Date().toISOString()
    };

    logger.info('Debug config requested:', config);
    
    res.json({
      status: 'ok',
      config,
      message: 'Configuration check completed'
    });
  } catch (error) {
    logger.error('Error in debug config:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Test de OpenAI
 */
router.post('/test-openai', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'OPENAI_API_KEY not configured'
      });
    }

    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    logger.info('Testing OpenAI connection...');

    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a test assistant.' },
        { role: 'user', content: 'Say "Hello, this is a test!" in Spanish.' }
      ],
      max_tokens: 50,
      temperature: 0.7
    });

    const duration = Date.now() - startTime;
    const response = completion.choices[0]?.message?.content;

    logger.info(`OpenAI test completed in ${duration}ms: ${response}`);

    res.json({
      status: 'success',
      response,
      duration,
      model: 'gpt-4-turbo-preview',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('OpenAI test failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      type: error.type,
      status_code: error.status
    });
  }
});

/**
 * Verificar rutas disponibles
 */
router.get('/routes', (req, res) => {
  try {
    const routes = [];
    
    // Obtener todas las rutas registradas
    req.app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        routes.push({
          path: middleware.route.path,
          methods: Object.keys(middleware.route.methods)
        });
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            routes.push({
              path: handler.route.path,
              methods: Object.keys(handler.route.methods)
            });
          }
        });
      }
    });

    res.json({
      status: 'success',
      message: 'Available routes',
      routes: routes,
      companion_routes_available: routes.some(r => r.path && r.path.includes('companion')),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting routes:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Ruta de prueba de conexión
 */
router.get('/ping', (req, res) => {
  res.json({ 
    message: 'pong', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
