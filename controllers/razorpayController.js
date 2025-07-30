const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Razorpay configuration
const RAZORPAY_CONFIG = {
  BASE_URL: 'https://api.razorpay.com/v1',
  KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_live_8uoghStuI1Teoa',
  KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'j5itlc9QmFlyoYApc1LVod7h',
};

// Create axios instance with basic auth
const razorpayApi = axios.create({
  baseURL: RAZORPAY_CONFIG.BASE_URL,
  auth: {
    username: RAZORPAY_CONFIG.KEY_ID,
    password: RAZORPAY_CONFIG.KEY_SECRET,
  },
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Create a new order
 * @route POST /api/razorpay/create-order
 */
const createOrder = async (req, res, next) => {
  try {
    const { amount, currency, receipt, notes, partial_payment, first_payment_min_amount } = req.body;

    // Generate unique receipt if not provided
    const orderReceipt = receipt || `receipt_${uuidv4().replace(/-/g, '')}`;

    // Extract customer_id from notes if present
    const customerId = notes?.customer_id || 'user';

    const orderData = {
      amount: parseInt(amount * 100), // Convert to paise
      currency: currency || 'INR',
      receipt: orderReceipt,
      notes: {
        description: 'Fastag Bajaj wallet topup',
        customer_id: customerId,
        ...notes // Include any additional notes
      },
      partial_payment: partial_payment || false,
      ...(first_payment_min_amount && { first_payment_min_amount: parseInt(first_payment_min_amount * 100) })
    };

    logger.info('Creating Razorpay order', { amount, currency, receipt: orderReceipt, customerId });

    const response = await razorpayApi.post('/orders', orderData);

    logger.info('Order created successfully', { 
      orderId: response.data.id,
      amount: response.data.amount 
    });

    res.status(201).json({
      success: true,
      data: {
        id: response.data.id,
        entity: response.data.entity,
        amount: response.data.amount,
        amount_paid: response.data.amount_paid,
        amount_due: response.data.amount_due,
        currency: response.data.currency,
        receipt: response.data.receipt,
        status: response.data.status,
        attempts: response.data.attempts,
        notes: response.data.notes,
        created_at: response.data.created_at
      },
      message: 'Order created successfully'
    });

  } catch (error) {
    logger.error('Error creating order', { 
      error: error.response?.data || error.message,
      orderData: req.body 
    });

    if (error.response?.data) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error?.description || 'Failed to create order',
        code: error.response.data.error?.code || 'ORDER_CREATION_FAILED',
        details: error.response.data
      });
    }

    next(error);
  }
};

/**
 * Verify payment signature
 * @route POST /api/razorpay/verify-payment
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    logger.info('Verifying payment signature', { 
      orderId: razorpay_order_id, 
      paymentId: razorpay_payment_id 
    });

    // Create signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.KEY_SECRET)
      .update(text)
      .digest('hex');

    const isValid = signature === razorpay_signature;

    if (!isValid) {
      logger.warn('Invalid payment signature', { 
        orderId: razorpay_order_id, 
        paymentId: razorpay_payment_id 
      });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
        code: 'INVALID_SIGNATURE'
      });
    }

    // Get payment details from Razorpay
    const paymentResponse = await razorpayApi.get(`/payments/${razorpay_payment_id}`);

    logger.info('Payment verified successfully', { 
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: paymentResponse.data.status 
    });

    res.json({
      success: true,
      data: {
        payment_id: paymentResponse.data.id,
        order_id: paymentResponse.data.order_id,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        status: paymentResponse.data.status,
        method: paymentResponse.data.method,
        captured: paymentResponse.data.captured,
        description: paymentResponse.data.description,
        email: paymentResponse.data.email,
        contact: paymentResponse.data.contact,
        name: paymentResponse.data.name,
        created_at: paymentResponse.data.created_at
      },
      message: 'Payment verified successfully'
    });

  } catch (error) {
    logger.error('Error verifying payment', { 
      error: error.response?.data || error.message,
      paymentData: req.body 
    });

    if (error.response?.data) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error?.description || 'Failed to verify payment',
        code: error.response.data.error?.code || 'PAYMENT_VERIFICATION_FAILED',
        details: error.response.data
      });
    }

    next(error);
  }
};

/**
 * Get payment details
 * @route GET /api/razorpay/payment/:paymentId
 */
const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    logger.info('Getting payment details', { paymentId });

    const response = await razorpayApi.get(`/payments/${paymentId}`);

    logger.info('Payment details retrieved', { paymentId });

    res.json({
      success: true,
      data: response.data,
      message: 'Payment details retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting payment details', { 
      error: error.response?.data || error.message,
      paymentId: req.params.paymentId 
    });

    if (error.response?.data) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error?.description || 'Failed to get payment details',
        code: error.response.data.error?.code || 'PAYMENT_DETAILS_FAILED',
        details: error.response.data
      });
    }

    next(error);
  }
};

/**
 * Get order details
 * @route GET /api/razorpay/order/:orderId
 */
const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    logger.info('Getting order details', { orderId });

    const response = await razorpayApi.get(`/orders/${orderId}`);

    logger.info('Order details retrieved', { orderId });

    res.json({
      success: true,
      data: response.data,
      message: 'Order details retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting order details', { 
      error: error.response?.data || error.message,
      orderId: req.params.orderId 
    });

    if (error.response?.data) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error?.description || 'Failed to get order details',
        code: error.response.data.error?.code || 'ORDER_DETAILS_FAILED',
        details: error.response.data
      });
    }

    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  getOrderDetails
};