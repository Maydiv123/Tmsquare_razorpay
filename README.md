# TMsquare Razorpay Backend

A Node.js Express backend for handling Razorpay payment gateway integration for the TMsquare mobile application.

## Features

- **Order Creation**: Create payment orders through Razorpay API
- **Payment Verification**: Verify payment signatures securely
- **Payment Details**: Retrieve payment and order information
- **Security**: API key authentication, rate limiting, CORS protection
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Global error handling with detailed error responses
- **Validation**: Request validation using Joi schemas

## Project Structure

```
backend2/
├── controllers/
│   └── razorpayController.js    # Business logic for Razorpay operations
├── middleware/
│   ├── auth.js                  # API key authentication
│   ├── errorHandler.js          # Global error handling
│   ├── notFound.js              # 404 handler
│   └── validation.js            # Request validation
├── routes/
│   ├── razorpay.js              # Razorpay API routes
│   └── health.js                # Health check routes
├── utils/
│   └── logger.js                # Winston logger configuration
├── logs/                        # Log files (created automatically)
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json                 # Dependencies and scripts
├── server.js                    # Main server file
└── README.md                    # This file
```

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Razorpay Configuration
   RAZORPAY_KEY_ID=rzp_live_8uoghStuI1Teoa
   RAZORPAY_KEY_SECRET=j5itlc9QmFlyoYApc1LVod7h
   RAZORPAY_ENVIRONMENT=LIVE

   # Security
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   API_KEY=your-api-key-for-mobile-app-razorpay

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Logging
   LOG_LEVEL=info

   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.5:3000,http://127.0.0.1:3000
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3001 (or the port specified in your .env file).

## API Endpoints

### Health Check (Public)
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system information

### Razorpay API (Protected - API Key Required)

#### Create Order
- **POST** `/api/razorpay/create-order`
- **Headers:** `x-api-key: your-api-key`
- **Body:**
  ```json
  {
    "amount": 1000,
    "currency": "INR",
    "receipt": "receipt_123",
    "notes": {
      "description": "Wallet top-up",
      "customer_id": "user123"
    },
    "partial_payment": false
  }
  ```

#### Verify Payment
- **POST** `/api/razorpay/verify-payment`
- **Headers:** `x-api-key: your-api-key`
- **Body:**
  ```json
  {
    "razorpay_order_id": "order_123",
    "razorpay_payment_id": "pay_123",
    "razorpay_signature": "signature_123"
  }
  ```

#### Get Payment Details
- **GET** `/api/razorpay/payment/:paymentId`
- **Headers:** `x-api-key: your-api-key`

#### Get Order Details
- **GET** `/api/razorpay/order/:orderId`
- **Headers:** `x-api-key: your-api-key`

#### Health Check
- **GET** `/api/razorpay/health`
- **Headers:** `x-api-key: your-api-key`

## Authentication

All Razorpay API endpoints require authentication using an API key. Include the API key in the request headers:

```
x-api-key: your-api-key-for-mobile-app-razorpay
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

## Testing

### Using cURL

1. **Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Create Order:**
   ```bash
   curl -X POST http://localhost:3001/api/razorpay/create-order \
     -H "Content-Type: application/json" \
     -H "x-api-key: your-api-key-for-mobile-app-razorpay" \
     -d '{
       "amount": 1000,
       "currency": "INR",
       "receipt": "test_receipt_123"
     }'
   ```

3. **Verify Payment:**
   ```bash
   curl -X POST http://localhost:3001/api/razorpay/verify-payment \
     -H "Content-Type: application/json" \
     -H "x-api-key: your-api-key-for-mobile-app-razorpay" \
     -d '{
       "razorpay_order_id": "order_123",
       "razorpay_payment_id": "pay_123",
       "razorpay_signature": "signature_123"
     }'
   ```

## Logging

Logs are written to:
- Console (development mode)
- `logs/error.log` (error logs)
- `logs/combined.log` (all logs)

Log levels: error, warn, info, debug

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Request rate limiting
- **API Key Authentication**: Secure API access
- **Input Validation**: Request data validation
- **Error Handling**: Secure error responses

## Development

### Adding New Endpoints

1. Create controller function in `controllers/razorpayController.js`
2. Add route in `routes/razorpay.js`
3. Add validation schema if needed in `middleware/validation.js`

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `RAZORPAY_KEY_ID`: Razorpay Key ID
- `RAZORPAY_KEY_SECRET`: Razorpay Key Secret
- `RAZORPAY_ENVIRONMENT`: Razorpay environment (TEST/LIVE)
- `API_KEY`: API key for mobile app authentication
- `LOG_LEVEL`: Logging level
- `ALLOWED_ORIGINS`: CORS allowed origins

## Deployment

1. Set `NODE_ENV=production`
2. Update `ALLOWED_ORIGINS` with your domain
3. Use a process manager like PM2
4. Set up reverse proxy (nginx)
5. Configure SSL certificates
6. Update Razorpay keys for production

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:3001 | xargs kill -9`

2. **CORS errors:**
   - Update `ALLOWED_ORIGINS` in .env
   - Check client URL

3. **Authentication errors:**
   - Verify API key in request headers
   - Check API_KEY in .env file

4. **Razorpay API errors:**
   - Verify Razorpay credentials
   - Check Razorpay account status
   - Review Razorpay API documentation

## Support

For issues related to:
- **Backend API**: Check logs in `logs/` directory
- **Razorpay Integration**: Refer to [Razorpay Documentation](https://razorpay.com/docs/)
- **General Issues**: Check console output and error logs