const { logger } = require('../utils/logger');

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.url,
    method: req.method
  });
};

module.exports = { notFound };