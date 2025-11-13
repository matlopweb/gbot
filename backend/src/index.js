import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import calendarRoutes from './routes/calendar.js';
import tasksRoutes from './routes/tasks.js';
import spotifyRoutes from './routes/spotify.js';
import conversationsRoutes from './routes/conversations.js';
import savedItemsRoutes from './routes/savedItems.js';
import scenariosRoutes from './routes/scenarios.js';
import { setupWebSocket } from './websocket/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger, withRequestLogger } from './utils/logger.js';
import { metricsMiddleware, metricsRouter } from './middleware/metrics.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : ['http://localhost:3000'];

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(metricsMiddleware);

app.use((req, res, next) => {
  const requestLogger = withRequestLogger(req);
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    requestLogger.info({
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    }, 'HTTP request completed');
  });
  next();
});

// Rate limiting: 100 requests per 15-minute window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/saved-items', savedItemsRoutes);
app.use('/api/scenarios', scenariosRoutes);
app.use('/metrics', metricsRouter);

// WebSocket setup
if (process.env.NODE_ENV !== 'test') {
  setupWebSocket(wss);
}

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
const shouldStartServer = process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test';

if (shouldStartServer) {
  server.listen(PORT, () => {
    logger.info({ port: Number(PORT) }, 'HTTP server running');
    logger.info('WebSocket server ready');
    logger.info({ env: process.env.NODE_ENV || 'development' }, 'Environment');
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

export default app;

