const express = require('express');
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  getOrderDetails
} = require('../controllers/razorpayController');

const { validate, orderSchema, verifyPaymentSchema } = require('../middleware/validation');

/**
 * @route   POST /api/razorpay/create-order
 * @desc    Create a new payment order
 * @access  Private (API Key required)
 */
router.post('/create-order', validate(orderSchema), createOrder);

/**
 * @route   POST /api/razorpay/verify-payment
 * @desc    Verify payment signature
 * @access  Private (API Key required)
 */
router.post('/verify-payment', validate(verifyPaymentSchema), verifyPayment);

/**
 * @route   GET /api/razorpay/payment/:paymentId
 * @desc    Get payment details
 * @access  Private (API Key required)
 */
router.get('/payment/:paymentId', getPaymentDetails);

/**
 * @route   GET /api/razorpay/order/:orderId
 * @desc    Get order details
 * @access  Private (API Key required)
 */
router.get('/order/:orderId', getOrderDetails);

/**
 * @route   GET /api/razorpay/health
 * @desc    Health check for Razorpay service
 * @access  Private (API Key required)
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Razorpay service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.RAZORPAY_ENVIRONMENT || 'LIVE'
  });
});

module.exports = router;