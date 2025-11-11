import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // Error de autenticación
  if (err.name === 'UnauthorizedError' || err.message.includes('token')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  // Error de Google API
  if (err.code && err.errors) {
    return res.status(err.code).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
