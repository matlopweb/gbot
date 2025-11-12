import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'gbot-backend',
    env: process.env.NODE_ENV || 'development'
  },
  transport: !isProd
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard'
        }
      }
    : undefined
});

export function withRequestLogger(req) {
  return logger.child({
    reqId: req.id || req.headers['x-request-id'] || undefined,
    path: req.path,
    method: req.method
  });
}
