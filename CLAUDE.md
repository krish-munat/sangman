# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SANGMAN is a comprehensive digital healthcare platform connecting patients with doctors based on specialty, location, urgency, and availability. It's a monorepo containing a Next.js web application, an Express.js backend API, and shared TypeScript types.

## Architecture

### Monorepo Structure
- **web/** - Next.js 14 web application (App Router)
- **backend/** - Express.js REST API with in-memory database
- **shared/** - Shared TypeScript types and constants
- **mobile/** - Placeholder for React Native app (not yet implemented)

### Frontend Architecture (Next.js)

**Three Role-Based Portals:**
- `/patient` - Patient portal for discovering doctors, booking appointments, managing subscriptions
- `/doctor` - Doctor portal for managing appointments, verification, earnings
- `/admin` - Admin panel for verification, analytics, platform configuration

**State Management:**
- Uses Zustand with persistence for auth state (`web/lib/store/authStore.ts`)
- Auth state persisted to localStorage under key `sangman-auth`
- Selector hooks: `useIsAuthenticated()`, `useUserRole()`, `useCurrentUser()`

**API Communication:**
- Centralized API client at `web/lib/api/client.ts`
- Automatically injects JWT token from auth store
- Built-in retry logic, timeout handling, and error transformation
- Base URL: `http://localhost:3001/api` (configurable via `NEXT_PUBLIC_API_URL`)

**Key Features:**
- OTP-based authentication (login and appointment verification)
- GPS-based doctor discovery with interactive Leaflet maps
- Emergency appointments with surge pricing
- Subscription system (10% discount on appointments)
- Payment calculations: base fee + 7% platform fee
- Escrow payment system for appointment transactions
- Pharmacy integration with prescription OCR
- AI-powered symptom triage

**Internationalization:**
- Uses `next-intl` for multi-language support
- Configuration in `web/i18n/request.ts`
- Integrated via `next.config.js`

### Backend Architecture (Express.js)

**In-Memory Database:**
- All data stored in memory (resets on restart)
- Seeded with sample doctors, patients, and admin user on startup
- Production requires replacing with actual database

**Security Features:**
- Helmet.js for security headers (XSS, clickjacking protection)
- Rate limiting: 100 req/15min (general), 5 req/15min (OTP endpoints)
- Cryptographically secure OTP generation using `crypto.randomInt()`
- OTP brute force protection (max 3 attempts)
- Password validation (min 8 chars, letter + number required)
- Input validation on all endpoints using `express-validator`
- Request body size limits (10MB)
- CORS configurable via environment variables
- Response compression with gzip

**Authentication:**
- JWT-based auth with 7-day expiration
- Middleware: `authenticateToken()` validates JWT from Authorization header
- Secret key: `JWT_SECRET` env var (warns if using default in production)
- Password hashing with bcrypt (10 rounds)

**API Endpoints:**
- `/api/auth/*` - Registration, login, OTP management
- `/api/doctors/*` - Doctor CRUD, search by specialty/location
- `/api/patients/*` - Patient management (admin access required)
- `/api/appointments/*` - Appointment booking, OTP verification, status updates
- `/api/admin/*` - Analytics, doctor verification
- `/api/escrow/*` - Payment escrow lifecycle (initiate, release, dispute)
- `/api/pharmacy/*` - Medicine search, prescription processing, orders
- `/api/triage/*` - AI-powered symptom analysis

**CORS Configuration:**
- Allows `http://localhost:3000` and `http://127.0.0.1:3000`
- Credentials enabled

**Default Test Accounts (seeded on startup):**
- Admin: `admin@sangman.com` / `admin123`
- Doctor: `dr.sharma@example.com` / `password123`
- Patient: `patient@example.com` / `password123`

### Shared Types

TypeScript interfaces defined in `shared/types/index.ts`:
- Core: `User`, `Patient`, `Doctor`, `Appointment`, `Payment`
- Support: `Review`, `Subscription`, `Notification`, `Analytics`
- Config: `PlatformConfig`, `EmergencyPricing`, `FAQItem`, `HealthTip`

All portals and the backend reference these types for consistency.

## Common Commands

### Web Application
```bash
cd web
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm start                # Start production server
npm run lint             # Run ESLint
npm test                 # Run Jest unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Cypress E2E tests
npm run test:e2e:open    # Open Cypress interactive mode
```

### Backend API
```bash
cd backend
npm install              # Install dependencies
cp .env.example .env     # Copy environment template (first time only)
# Edit .env with your configuration
npm run dev              # Start dev server with nodemon (http://localhost:3001)
npm start                # Start production server
npm test                 # Run tests
```

### Root (Monorepo)
```bash
npm run dev:web          # cd web && npm run dev
npm run dev:mobile       # cd mobile && npm run start
npm run build:web        # cd web && npm run build
npm run build:mobile     # cd mobile && npm run build
```

## Development Workflow

### Starting the Full Stack
1. Terminal 1: `cd backend && npm run dev` (starts API on :3001)
2. Terminal 2: `cd web && npm run dev` (starts Next.js on :3000)
3. Access portals:
   - Patient: http://localhost:3000/patient
   - Doctor: http://localhost:3000/doctor
   - Admin: http://localhost:3000/admin

### Making Changes

**Adding New API Endpoints:**
1. Add route handler in `backend/server.js`
2. Update types in `shared/types/index.ts` if needed
3. Add API client method in `web/lib/api/client.ts` (or use generic `api.get/post/etc`)

**Adding New Features to Web:**
1. Create components in `web/components/`
2. Add pages in appropriate portal directory (`web/app/patient|doctor|admin/`)
3. Use `useAuthStore()` for auth state, `api.*` for backend calls
4. Follow existing patterns for error handling and loading states

**Role-Based Access:**
- Portal layouts (`web/app/{role}/layout.tsx`) handle role verification
- Backend routes check `req.user.role` from JWT
- Shared components should check `useUserRole()` for conditional rendering

### Important Patterns

**Error Handling:**
- API client transforms HTTP errors to typed errors (`AuthenticationError`, `NetworkError`, etc.)
- Use try/catch with `handleApiError()` utility for user-friendly messages
- Components use `ErrorBoundary` and `ErrorToast` for UI error display

**Authentication Flow:**
1. User submits credentials → `/api/auth/login`
2. Backend returns JWT + user object
3. Frontend calls `authStore.login(user, token)`
4. Subsequent API calls auto-inject token via API client
5. On 401, user should be logged out

**Appointment Booking Flow:**
1. Patient discovers doctor on map → `/api/doctors`
2. Patient books appointment → `/api/appointments` (returns OTP)
3. Payment held in escrow → `/api/escrow/initiate`
4. Doctor verifies patient OTP at visit → `/api/appointments/:id/verify-otp`
5. Payment released to doctor → `/api/escrow/:id/release`

**Payment Calculation:**
- Base fee: `doctor.consultationFee` (normal) or `doctor.emergencyFee` (emergency)
- Platform fee: 7% of base fee
- Subscription discount: 10% off base fee if patient has active subscription
- Emergency surge: varies by time and availability

## Design System

- **Colors:** Healthcare Blue (#0EA5E9), Trust Green (#10B981), Alert Red (#EF4444)
- **Typography:** Inter font family
- **Styling:** Tailwind CSS with custom config in `web/tailwind.config.js`
- **Dark Mode:** Supported via ThemeProvider in `web/components/providers/`

## Testing

### Unit Tests (Jest)
- Config: `web/jest.config.js`
- Coverage threshold: 70% for branches/functions/lines/statements
- Run single test: `npm test -- path/to/test.spec.tsx`

### E2E Tests (Cypress)
- Config: `web/cypress.config.ts`
- Tests should cover critical user flows (booking, verification, payments)

## Known Limitations

- Backend uses in-memory storage (data lost on restart)
- OTP is logged to console instead of being sent via SMS/email
- Payment gateway not integrated (mock implementation)
- Map tiles use OpenStreetMap (no API key required)
- Authentication is currently mocked in frontend - backend integration in progress

## Security Notes

- JWT secret must be changed in production via `JWT_SECRET` env var
- File uploads (doctor documents) need proper validation and storage
- Rate limiting not implemented on OTP endpoints
- CORS is restricted to localhost - update for production domains
- All passwords hashed with bcrypt (10 rounds)

## Environment Variables

**Backend:**
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing key (required for production)
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `OTP_EXPIRY_MINUTES` - OTP expiration time (default: 10)

**Web:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001/api)

## Additional Resources

- **RECOMMENDATIONS.md** - Comprehensive development and deployment recommendations
- **BACKEND_IMPROVEMENTS.md** - Security improvements changelog
- **backend/README.md** - Complete backend API documentation
- **PROJECT_STRUCTURE.md** - Detailed project architecture
- **TEST_PLAN.md** - Testing strategy and test cases
