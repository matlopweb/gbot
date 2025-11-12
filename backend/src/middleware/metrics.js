import express from 'express';
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'gbot_' });

const httpRequestDuration = new client.Histogram({
  name: 'gbot_http_request_duration_ms',
  help: 'Duración de las solicitudes HTTP en milisegundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register]
});

const wsConnectionsGauge = new client.Gauge({
  name: 'gbot_ws_connections',
  help: 'Cantidad de conexiones WebSocket activas',
  registers: [register]
});

const wsMessageCounter = new client.Counter({
  name: 'gbot_ws_messages_total',
  help: 'Mensajes recibidos desde WebSocket por tipo',
  labelNames: ['type'],
  registers: [register]
});

const wsErrorCounter = new client.Counter({
  name: 'gbot_ws_errors_total',
  help: 'Errores en el canal WebSocket',
  registers: [register]
});

export function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => end({ status_code: res.statusCode }));
  next();
}

export const metricsRouter = express.Router();
metricsRouter.get('/', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

export function trackWsConnection(delta) {
  if (delta > 0) {
    wsConnectionsGauge.inc(delta);
  } else {
    wsConnectionsGauge.dec(Math.abs(delta));
  }
}

export function trackWsMessage(type = 'unknown') {
  wsMessageCounter.inc({ type });
}

export function trackWsError() {
  wsErrorCounter.inc();
}
