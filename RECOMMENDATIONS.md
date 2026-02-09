# SANGMAN Platform - Comprehensive Recommendations

This document provides detailed recommendations for development, deployment, and maintenance of the SANGMAN Healthcare Platform.

## 📋 Table of Contents

1. [Development Workflow](#development-workflow)
2. [Code Quality Standards](#code-quality-standards)
3. [Security Best Practices](#security-best-practices)
4. [Performance Optimization](#performance-optimization)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Scaling Strategy](#scaling-strategy)

---

## 🛠️ Development Workflow

### Local Development Setup

**Recommended Environment:**
- **OS:** macOS, Linux, or Windows with WSL2
- **Node.js:** v18.0.0 or higher (use nvm for version management)
- **Editor:** VS Code with recommended extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense
  - Thunder Client (API testing)

**Daily Workflow:**
```bash
# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
cd web && npm run dev

# Run tests (Terminal 3)
cd web && npm run test:watch
```

### Branch Strategy

**Recommended Git Flow:**
```
main (production)
├── develop (integration)
│   ├── feature/patient-dashboard
│   ├── feature/doctor-verification
│   └── bugfix/otp-validation
└── hotfix/security-patch
```

**Branch Naming:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### Commit Message Convention

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions/updates
- `chore:` - Build process or auxiliary tool changes

**Examples:**
```
feat(patient): add appointment booking with OTP verification

fix(backend): resolve rate limiting issue on OTP endpoint

docs(readme): update installation instructions
```

---

## ✅ Code Quality Standards

### TypeScript Best Practices

**✅ DO:**
```typescript
// Use explicit types
interface DoctorProfile {
  id: string;
  name: string;
  specializations: string[];
}

// Use type inference where obvious
const doctors = await fetchDoctors(); // Type inferred from function

// Use const for functions
const calculateFee = (baseAmount: number, hasSubscription: boolean): number => {
  return hasSubscription ? baseAmount * 0.9 : baseAmount;
};
```

**❌ DON'T:**
```typescript
// Avoid 'any' type
const data: any = await fetchData(); // ❌

// Don't use implicit any
function process(data) { // ❌
  return data;
}

// Use proper types instead
interface ApiResponse {
  data: Doctor[];
}
const response: ApiResponse = await fetchData(); // ✅
```

### React Component Patterns

**✅ Preferred Structure:**
```typescript
// components/DoctorCard.tsx
import { FC } from 'react';
import { Doctor } from '@/shared/types';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (id: string) => void;
}

export const DoctorCard: FC<DoctorCardProps> = ({ doctor, onBook }) => {
  // Hooks at top
  const [isLoading, setIsLoading] = useState(false);

  // Event handlers
  const handleBook = () => {
    setIsLoading(true);
    onBook(doctor.id);
  };

  // Render
  return (
    <div className="doctor-card">
      {/* Component JSX */}
    </div>
  );
};
```

### API Client Usage

**✅ Proper Error Handling:**
```typescript
import { api } from '@/lib/api/client';
import { handleApiError } from '@/lib/utils/errorHandler';
import toast from 'react-hot-toast';

const bookAppointment = async (data: AppointmentData) => {
  try {
    const response = await api.post('/appointments', data);
    toast.success('Appointment booked successfully!');
    return response;
  } catch (error) {
    const message = handleApiError(error);
    toast.error(message);
    throw error;
  }
};
```

### State Management

**When to use what:**

1. **Local State (useState)** - Component-specific data
   ```typescript
   const [isOpen, setIsOpen] = useState(false);
   ```

2. **Zustand Store** - Global app state (auth, user preferences)
   ```typescript
   const { user, isAuthenticated } = useAuthStore();
   ```

3. **Server State (SWR/React Query)** - API data (future recommendation)
   ```typescript
   // Recommended for future: use SWR or React Query
   const { data, error, isLoading } = useSWR('/api/doctors', fetcher);
   ```

---

## 🔐 Security Best Practices

### Authentication & Authorization

**✅ DO:**
```typescript
// Always validate tokens server-side
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Check user roles
const requireRole = (role: string) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};
```

**❌ DON'T:**
```typescript
// Never trust client-side role checks alone
if (localStorage.getItem('role') === 'admin') { // ❌ Can be manipulated
  showAdminPanel();
}

// Always verify on backend
const isAdmin = await verifyUserRole(token); // ✅
```

### Input Validation

**Backend Validation (Required):**
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/appointments', [
  body('doctorId').isUUID(),
  body('date').isISO8601(),
  body('timeSlot.start').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('type').isIn(['normal', 'emergency']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
```

**Frontend Validation (UX):**
```typescript
import { z } from 'zod';

const appointmentSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().datetime(),
  type: z.enum(['normal', 'emergency']),
});

// Validate before sending
const result = appointmentSchema.safeParse(formData);
if (!result.success) {
  // Show validation errors
}
```

### Sensitive Data Handling

**✅ Environment Variables:**
```env
# .env (NEVER COMMIT THIS FILE)
JWT_SECRET=super-secure-random-string-min-32-chars
DATABASE_URL=postgresql://user:password@localhost:5432/db
STRIPE_SECRET_KEY=sk_test_xxx
```

**❌ Hardcoded Secrets:**
```typescript
// NEVER do this
const secret = 'my-secret-key'; // ❌
const apiKey = 'sk_live_123456'; // ❌

// Use environment variables
const secret = process.env.JWT_SECRET; // ✅
```

### SQL Injection Prevention

**When you add database:**
```typescript
// ✅ Use parameterized queries
const doctor = await db.query(
  'SELECT * FROM doctors WHERE id = $1',
  [doctorId]
);

// ❌ Never use string concatenation
const doctor = await db.query(
  `SELECT * FROM doctors WHERE id = '${doctorId}'` // VULNERABLE!
);
```

### XSS Prevention

**✅ Sanitize User Input:**
```typescript
import DOMPurify from 'dompurify';

// When displaying user-generated content
const sanitizedContent = DOMPurify.sanitize(userInput);

// In React (already safe by default)
<div>{userInput}</div> // ✅ React escapes by default

// Only use dangerouslySetInnerHTML when absolutely necessary
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(htmlContent)
}} />
```

---

## ⚡ Performance Optimization

### Frontend Performance

**1. Image Optimization:**
```typescript
// ✅ Use Next.js Image component
import Image from 'next/image';

<Image
  src="/doctor-profile.jpg"
  alt="Doctor Profile"
  width={300}
  height={300}
  priority // For above-the-fold images
  placeholder="blur"
/>

// ❌ Don't use regular img tags for dynamic images
<img src="/doctor-profile.jpg" /> // ❌
```

**2. Code Splitting:**
```typescript
// ✅ Lazy load heavy components
import dynamic from 'next/dynamic';

const DoctorMap = dynamic(() => import('@/components/map/DoctorMap'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Disable SSR for map components
});

// ✅ Lazy load routes
const AdminPanel = dynamic(() => import('./admin/AdminPanel'));
```

**3. Memoization:**
```typescript
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive calculations
const sortedDoctors = useMemo(() => {
  return doctors.sort((a, b) => b.rating - a.rating);
}, [doctors]);

// Memoize callbacks to prevent re-renders
const handleBook = useCallback((id: string) => {
  bookAppointment(id);
}, []);

// Memoize components
export const DoctorCard = memo(({ doctor }) => {
  return <div>{doctor.name}</div>;
});
```

**4. Debouncing & Throttling:**
```typescript
import { debounce } from 'lodash';

// Debounce search input
const handleSearch = debounce((query: string) => {
  searchDoctors(query);
}, 300);

// Throttle scroll events
const handleScroll = throttle(() => {
  trackScrollPosition();
}, 100);
```

### Backend Performance

**1. Database Indexing:**
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_doctors_location ON doctors USING GIST (location);
CREATE INDEX idx_appointments_date ON appointments (date);
CREATE INDEX idx_doctors_specialty ON doctors USING GIN (specializations);
```

**2. Caching Strategy:**
```typescript
import Redis from 'ioredis';
const redis = new Redis();

// Cache doctor list
const getCachedDoctors = async () => {
  const cached = await redis.get('doctors:all');
  if (cached) return JSON.parse(cached);

  const doctors = await db.query('SELECT * FROM doctors');
  await redis.setex('doctors:all', 300, JSON.stringify(doctors)); // 5 min cache
  return doctors;
};

// Invalidate cache on updates
const updateDoctor = async (id, data) => {
  await db.query('UPDATE doctors SET ... WHERE id = $1', [id]);
  await redis.del('doctors:all'); // Clear cache
};
```

**3. Connection Pooling:**
```typescript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

**Security:**
- [ ] All environment variables set in production
- [ ] JWT_SECRET is strong and unique (32+ characters)
- [ ] Default passwords changed
- [ ] Database credentials secured
- [ ] API keys rotated
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting enabled
- [ ] HTTPS/SSL configured
- [ ] Security headers verified (Helmet.js)

**Performance:**
- [ ] Database indexes created
- [ ] Caching layer configured (Redis)
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] Response compression enabled
- [ ] Connection pooling configured

**Infrastructure:**
- [ ] Health check endpoints working
- [ ] Monitoring configured
- [ ] Error tracking set up (Sentry)
- [ ] Logging configured
- [ ] Backup strategy implemented
- [ ] Auto-scaling configured
- [ ] Load balancer set up

**Testing:**
- [ ] All tests passing
- [ ] E2E tests run successfully
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Accessibility audit completed

### Deployment Platforms

**Recommended Options:**

1. **Vercel (Frontend) + Railway/Render (Backend)**
   - ✅ Easy deployment
   - ✅ Good free tier
   - ✅ Auto-scaling
   - ❌ Limited backend customization

2. **AWS (Full Stack)**
   - ✅ Full control
   - ✅ Best scaling options
   - ✅ Many services available
   - ❌ More complex setup
   - Services: EC2, RDS, S3, CloudFront, Route 53

3. **DigitalOcean (Full Stack)**
   - ✅ Good balance of control and ease
   - ✅ Predictable pricing
   - ✅ Good documentation
   - Services: Droplets, Managed Databases, Spaces

### Environment Variables Management

**Production .env structure:**
```env
# Server
NODE_ENV=production
PORT=3001

# Security
JWT_SECRET=<STRONG_SECRET_32_PLUS_CHARS>
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379

# APIs
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
SENDGRID_API_KEY=SG.xxxx
STRIPE_SECRET_KEY=sk_live_xxxx

# AWS
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
AWS_S3_BUCKET=sangman-documents

# Monitoring
SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

**1. Error Tracking (Sentry):**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Capture custom errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

**2. Performance Monitoring:**
```typescript
// Track API response times
const logPerformance = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);

    // Alert if slow
    if (duration > 1000) {
      alertSlowEndpoint(req.path, duration);
    }
  });

  next();
};
```

**3. Health Checks:**
```typescript
app.get('/health', async (req, res) => {
  const checks = {
    server: 'ok',
    database: await checkDatabase(),
    redis: await checkRedis(),
    external: await checkExternalAPIs(),
  };

  const isHealthy = Object.values(checks).every(v => v === 'ok');

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

### Maintenance Schedule

**Daily:**
- Review error logs
- Check uptime status
- Monitor disk space
- Review security alerts

**Weekly:**
- Review performance metrics
- Check for dependency updates
- Review user feedback
- Analyze usage patterns

**Monthly:**
- Security audit
- Performance optimization review
- Backup verification test
- Cost optimization review
- Update dependencies

**Quarterly:**
- Comprehensive security review
- Disaster recovery drill
- Infrastructure scaling review
- User satisfaction survey

---

## 📈 Scaling Strategy

### Horizontal Scaling

**Application Tier:**
```
Load Balancer (nginx)
    ├── Backend Instance 1
    ├── Backend Instance 2
    ├── Backend Instance 3
    └── Backend Instance N
```

**Database Scaling:**
```
Primary DB (Write)
    ├── Replica 1 (Read)
    ├── Replica 2 (Read)
    └── Replica N (Read)
```

**Caching Layer:**
```
Redis Cluster
    ├── Master Node
    └── Replica Nodes
```

### Performance Targets

**Target Metrics:**
- API Response Time: < 200ms (p95)
- Page Load Time: < 2s (p95)
- Time to Interactive: < 3s
- Uptime: > 99.9%
- Error Rate: < 0.1%

**Scaling Triggers:**
- CPU > 70% for 5 minutes → Scale up
- Memory > 80% for 5 minutes → Scale up
- Request queue > 100 → Scale up
- Response time > 500ms → Investigate/Scale

---

## 🎯 Summary

### Priority Order

**Immediate (Before Launch):**
1. Set up production database
2. Configure environment variables
3. Enable HTTPS/SSL
4. Set up monitoring & alerts
5. Integrate OTP service (SMS/Email)

**Short Term (1-3 months):**
1. Implement caching layer
2. Set up CI/CD pipeline
3. Add comprehensive test coverage
4. Optimize database queries
5. Configure CDN

**Long Term (3-6 months):**
1. Implement horizontal scaling
2. Add advanced analytics
3. Optimize for mobile performance
4. Implement advanced security features
5. Add ML-based features

---

**Remember:** Security and performance should always be top priorities. Monitor continuously, optimize regularly, and scale proactively.

For questions or clarifications, refer to:
- `CLAUDE.md` - AI development guide
- `backend/README.md` - API documentation
- `BACKEND_IMPROVEMENTS.md` - Security enhancements
