# SANGMAN Backend API

Express.js REST API for the SANGMAN Healthcare Platform.

## Recent Security & Quality Improvements ✨

### Security Enhancements
- ✅ **Helmet.js** - Security headers to protect against common vulnerabilities
- ✅ **Rate Limiting** - Global rate limiting (100 req/15min) and strict OTP rate limiting (5 req/15min)
- ✅ **Secure OTP Generation** - Using `crypto.randomInt()` instead of `Math.random()` for cryptographically secure OTPs
- ✅ **OTP Brute Force Protection** - Maximum 3 verification attempts per OTP
- ✅ **Password Validation** - Minimum 8 characters with at least one letter and one number
- ✅ **Input Validation** - Using `express-validator` for request validation
- ✅ **Body Size Limits** - 10MB limit to prevent payload attacks
- ✅ **Environment-based CORS** - Configurable allowed origins via environment variables
- ✅ **JWT Secret Warning** - Alerts when using default secret in production

### Code Quality Improvements
- ✅ **Request Logging** - Morgan logging (dev mode for development, combined for production)
- ✅ **Response Compression** - Gzip compression for better performance
- ✅ **Centralized Error Handling** - Global error handler with proper error types
- ✅ **Environment Configuration** - dotenv support for environment variables
- ✅ **Input Sanitization** - Validation on all user inputs
- ✅ **Better Health Check** - Enhanced health endpoint with uptime and environment info

## Setup

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Change JWT_SECRET for production!
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Security (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
```

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (patient/doctor)
- `POST /api/auth/login` - Login with email/phone and password or OTP
- `GET /api/auth/me` - Get current user (requires auth token)

### OTP Management
- `POST /api/otp/send` - Send OTP to phone/email (rate limited: 5 req/15min)
- `POST /api/otp/verify` - Verify OTP (rate limited: 5 req/15min, max 3 attempts)

### Doctors
- `GET /api/doctors` - Get all verified doctors (supports filtering)
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor profile (requires auth)

### Patients
- `GET /api/patients` - Get all patients (admin only)
- `GET /api/patients/:id` - Get patient by ID (requires auth)
- `PUT /api/patients/:id` - Update patient profile (requires auth)

### Appointments
- `POST /api/appointments` - Create appointment (requires auth)
- `GET /api/appointments` - Get appointments (filtered by user role)
- `GET /api/appointments/:id` - Get appointment by ID
- `PATCH /api/appointments/:id` - Update appointment status
- `POST /api/appointments/:id/verify-otp` - Verify appointment OTP

### Escrow Payments
- `POST /api/escrow/initiate` - Hold payment in escrow
- `GET /api/escrow/:id` - Get escrow transaction
- `POST /api/escrow/:id/release` - Release payment to doctor
- `POST /api/escrow/:id/dispute` - Raise dispute
- `GET /api/escrow/patient/:patientId` - Get patient's transactions
- `GET /api/escrow/doctor/:doctorId` - Get doctor's transactions

### Pharmacy
- `GET /api/pharmacy/search` - Search medicines
- `GET /api/pharmacy/medicine/:id` - Get medicine by ID
- `POST /api/pharmacy/prescription/process` - Process prescription (OCR)
- `POST /api/pharmacy/order` - Place pharmacy order

### AI Triage
- `POST /api/triage/generate-brief` - Generate doctor brief from symptoms

### Admin
- `GET /api/admin/analytics` - Get platform analytics (admin only)
- `GET /api/admin/verifications` - Get pending doctor verifications (admin only)
- `POST /api/admin/verifications/:id` - Approve/reject doctor (admin only)

### Health Check
- `GET /api/health` - Server health status and uptime

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Flow
1. Register/Login to receive a JWT token
2. Include token in subsequent requests:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
3. Token expires after 7 days (configurable via `JWT_EXPIRES_IN`)

## Rate Limiting

To prevent abuse, the API implements rate limiting:

- **General API**: 100 requests per 15 minutes per IP
- **OTP Endpoints**: 5 requests per 15 minutes per IP
- **OTP Verification**: Maximum 3 attempts per OTP

## Security Best Practices

### For Production Deployment

1. **Change JWT Secret**
   - Set a strong, random `JWT_SECRET` in environment variables
   - Never commit the secret to version control

2. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Force HTTPS redirects

3. **Update CORS**
   - Set `ALLOWED_ORIGINS` to your production domain(s)
   - Remove localhost from allowed origins

4. **Database**
   - Replace in-memory storage with a real database (MongoDB, PostgreSQL, etc.)
   - Use database connection pooling
   - Implement proper indexes

5. **OTP Service**
   - Integrate with SMS provider (Twilio, AWS SNS, etc.)
   - Integrate with email provider (SendGrid, AWS SES, etc.)
   - Remove console.log statements

6. **Payment Gateway**
   - Integrate real payment gateway (Razorpay, Stripe, etc.)
   - Implement webhook handlers for payment confirmations

7. **Monitoring & Logging**
   - Use production-grade logging (Winston, Bunyan)
   - Set up error tracking (Sentry, Rollbar)
   - Monitor API performance (New Relic, DataDog)

8. **Additional Security**
   - Implement CSRF protection
   - Add API versioning
   - Use request ID tracking
   - Implement audit logging for sensitive operations

## Default Test Accounts

The server seeds the following accounts on startup:

**Admin:**
- Email: `admin@sangman.com`
- Password: `admin123`

**Doctor:**
- Email: `dr.sharma@example.com`
- Password: `password123`

**Patient:**
- Email: `patient@example.com`
- Password: `password123`

⚠️ **Note:** These are for development only. Disable seeding in production!

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Development

### Project Structure
```
backend/
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (not committed)
├── .env.example      # Environment template
├── .gitignore        # Git ignore rules
└── migrations/       # Database migrations (future use)
```

### Adding New Endpoints

1. Add route handler in `server.js`
2. Add input validation using `express-validator`
3. Implement business logic
4. Add error handling
5. Update this README
6. Add corresponding types in `../shared/types/index.ts`

## Known Limitations

- Uses in-memory storage (data resets on server restart)
- OTP is logged to console (needs SMS/email integration)
- Payment gateway is mocked (needs real integration)
- No database persistence layer
- No file upload handling (for doctor documents)
- No real-time notifications (WebSockets/SSE)

## License

MIT
