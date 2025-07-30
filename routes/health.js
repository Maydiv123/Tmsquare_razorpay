const express = require('express');
const router = express.Router();

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Fastag Bajaj Razorpay Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with system info
 * @access  Public
 */
router.get('/detailed', (req, res) => {
  const healthInfo = {
    success: true,
    message: 'Detailed health check',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
      }
    },
    services: {
      razorpay: {
        environment: process.env.RAZORPAY_ENVIRONMENT || 'LIVE',
        keyId: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured',
        baseUrl: 'https://api.razorpay.com/v1'
      }
    }
  };

  res.json(healthInfo);
});

module.exports = router;