const { logger } = require('../utils/logger');

/**
 * Middleware to validate API key from request headers
 */
const validateApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      logger.warn('API key missing', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        path: req.path 
      });
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        code: 'MISSING_API_KEY'
      });
    }

    const expectedApiKey = process.env.API_KEY;
    
    if (!expectedApiKey) {
      logger.error('API_KEY not configured in environment');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        code: 'SERVER_CONFIG_ERROR'
      });
    }

    if (apiKey !== expectedApiKey) {
      logger.warn('Invalid API key provided', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        path: req.path 
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
    }

    logger.info('API key validated successfully', { 
      ip: req.ip, 
      path: req.path 
    });
    
    next();
  } catch (error) {
    logger.error('Error in API key validation', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = { validateApiKey };