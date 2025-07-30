const Joi = require('joi');
const { logger } = require('../utils/logger');

/**
 * Generic validation middleware using Joi schemas
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation error', {
        error: error.details[0].message,
        path: req.path,
        method: req.method,
        body: req.body
      });
      
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 'VALIDATION_ERROR',
        field: error.details[0].path.join('.')
      });
    }
    
    next();
  };
};

// Validation schemas
const orderSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().valid('INR').default('INR'),
  receipt: Joi.string().max(40).optional(),
  notes: Joi.object().max(15).optional(),
  partial_payment: Joi.boolean().default(false),
  first_payment_min_amount: Joi.number().positive().optional()
});

const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required()
});

module.exports = {
  validate,
  orderSchema,
  verifyPaymentSchema
};