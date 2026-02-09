# SANGMAN - Healthcare Platform

A comprehensive digital healthcare platform connecting patients with doctors based on specialty, location, urgency, and availability.

## 🏗️ Project Structure

```
sangman/
├── web/                    # Next.js Web Application
│   ├── app/               # Next.js App Router
│   ├── components/        # Reusable UI components
│   ├── lib/              # Utilities and helpers
│   └── styles/           # Global styles and themes
├── mobile/                # React Native Mobile App
│   ├── src/
│   │   ├── screens/      # Screen components
│   │   ├── components/   # Reusable components
│   │   ├── navigation/   # Navigation setup
│   │   └── services/     # API services
│   └── assets/           # Images, fonts, etc.
└── shared/                # Shared types and utilities
    ├── types/            # TypeScript types
    └── constants/        # Shared constants
```

## 🎯 Features

### Patient Features
- GPS-based doctor discovery
- Appointment booking (normal & emergency)
- OTP-based visit confirmation
- Reviews & ratings
- Subscription management
- Health content library

### Doctor Features
- Profile management
- Document verification
- Appointment management
- Earnings dashboard
- Emergency availability toggle

### Admin Features
- Doctor verification
- Platform configuration
- Analytics dashboard
- User management
- Dynamic content management

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sangman
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```
   Backend runs on http://localhost:3001

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd web
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:3000

4. **Access the Platform**
   - Landing Page: http://localhost:3000
   - Patient Portal: http://localhost:3000/patient
   - Doctor Portal: http://localhost:3000/doctor
   - Admin Panel: http://localhost:3000/admin

### Test Accounts

**Patient:**
- Email: `patient@example.com`
- Password: `password123`

**Doctor:**
- Email: `dr.sharma@example.com`
- Password: `password123`

**Admin:**
- Email: `admin@sangman.com`
- Password: `admin123`

## 🎨 Design System

- **Primary Color**: Healthcare Blue (#0EA5E9)
- **Secondary Color**: Trust Green (#10B981)
- **Emergency**: Alert Red (#EF4444)
- **Background**: Clean White / Dark Gray
- **Typography**: Inter, System fonts

## 🔐 Security

- Encrypted document storage
- OTP verification
- Role-based access control
- Audit logging
- Privacy-first architecture

## 📱 Platforms

- Web (Next.js)
- Android (React Native)
- iOS (React Native)

## ⚡ Recent Improvements

### Backend Security Enhancements (Latest)
- ✅ **Helmet.js** - Security headers for XSS, clickjacking protection
- ✅ **Rate Limiting** - 100 req/15min (general), 5 req/15min (OTP)
- ✅ **Secure OTP** - Cryptographically secure random generation
- ✅ **Brute Force Protection** - Max 3 OTP verification attempts
- ✅ **Password Validation** - Min 8 chars, letter + number required
- ✅ **Input Validation** - express-validator on all endpoints
- ✅ **Response Compression** - Gzip compression for performance
- ✅ **Error Handling** - Centralized error handler with proper types

See `BACKEND_IMPROVEMENTS.md` for full details.

## 📚 Documentation

- **CLAUDE.md** - AI assistant guidance for this codebase
- **backend/README.md** - Complete backend API documentation
- **BACKEND_IMPROVEMENTS.md** - Security improvements changelog
- **PROJECT_STRUCTURE.md** - Detailed project architecture
- **TEST_PLAN.md** - Testing strategy and test cases

## 🎯 Recommendations

### For Development

1. **Environment Variables**
   - Always use `.env` files (never commit them!)
   - Update `JWT_SECRET` immediately for any non-local environment
   - Configure `ALLOWED_ORIGINS` for your deployment domains

2. **Code Quality**
   - Run `npm run lint` before commits
   - Write tests for new features (`npm test`)
   - Use TypeScript strictly - avoid `any` types
   - Follow existing component patterns

3. **API Development**
   - Always validate inputs with `express-validator`
   - Use the centralized API client (`web/lib/api/client.ts`)
   - Add proper error handling on all endpoints
   - Document new endpoints in backend README

4. **Security Best Practices**
   - Never log sensitive data (passwords, tokens, OTPs in production)
   - Always sanitize user inputs
   - Use parameterized queries when adding database
   - Implement CSRF protection for production
   - Keep dependencies updated (`npm audit`)

5. **Testing**
   - Write unit tests for utilities and API functions
   - Add E2E tests for critical user flows
   - Test with rate limiting enabled
   - Verify OTP flows thoroughly

### For Production Deployment

#### Critical (Must Do)

1. **Security**
   - [ ] Set strong `JWT_SECRET` (32+ random characters)
   - [ ] Enable HTTPS/SSL with valid certificates
   - [ ] Update `ALLOWED_ORIGINS` to production domains only
   - [ ] Change all default passwords
   - [ ] Set `NODE_ENV=production`
   - [ ] Disable database seeding

2. **Database**
   - [ ] Replace in-memory storage with MongoDB/PostgreSQL
   - [ ] Set up database backups (automated)
   - [ ] Configure connection pooling
   - [ ] Add database indexes for performance
   - [ ] Implement data retention policies

3. **Infrastructure**
   - [ ] Set up monitoring (New Relic, DataDog, or similar)
   - [ ] Configure error tracking (Sentry, Rollbar)
   - [ ] Set up logging service (CloudWatch, Papertrail)
   - [ ] Implement health checks and auto-restart
   - [ ] Configure CDN for static assets
   - [ ] Set up load balancing

4. **Third-Party Integrations**
   - [ ] Integrate SMS provider (Twilio, AWS SNS) for OTP
   - [ ] Integrate email service (SendGrid, AWS SES)
   - [ ] Set up payment gateway (Razorpay, Stripe)
   - [ ] Configure file storage (AWS S3, Cloudinary) for documents
   - [ ] Implement push notifications (FCM, APNs)

#### Important (Should Do)

5. **Performance**
   - [ ] Enable Redis for caching and sessions
   - [ ] Implement CDN for static assets
   - [ ] Optimize images (WebP, lazy loading)
   - [ ] Add service worker for PWA
   - [ ] Implement database query optimization

6. **Monitoring & Analytics**
   - [ ] Set up application performance monitoring
   - [ ] Configure uptime monitoring
   - [ ] Implement user analytics (privacy-compliant)
   - [ ] Set up alerting for errors and downtime
   - [ ] Add audit logging for sensitive operations

7. **Scalability**
   - [ ] Implement horizontal scaling
   - [ ] Set up message queue (RabbitMQ, Redis Queue)
   - [ ] Add WebSocket for real-time features
   - [ ] Implement API versioning
   - [ ] Set up staging environment

#### Nice to Have

8. **Features**
   - [ ] Video consultation integration
   - [ ] Prescription management
   - [ ] Medical records storage
   - [ ] Multi-language support (expand beyond current i18n)
   - [ ] Mobile app release (React Native)
   - [ ] SMS appointment reminders
   - [ ] Email notifications
   - [ ] In-app chat support

9. **DevOps**
   - [ ] CI/CD pipeline (GitHub Actions, Jenkins)
   - [ ] Automated testing in pipeline
   - [ ] Blue-green deployment
   - [ ] Rollback strategy
   - [ ] Infrastructure as Code (Terraform, CloudFormation)

### Performance Recommendations

1. **Frontend Optimization**
   - Use Next.js Image component for all images
   - Implement lazy loading for maps and heavy components
   - Enable response compression on API
   - Use React.memo for expensive components
   - Implement code splitting

2. **Backend Optimization**
   - Add Redis caching for frequent queries
   - Implement database connection pooling
   - Use indexes on frequently queried fields
   - Optimize OTP storage (Redis with TTL)
   - Implement request debouncing

3. **Database Optimization**
   - Index: doctor location (geospatial index)
   - Index: appointment dates, patient/doctor IDs
   - Implement pagination for large lists
   - Use aggregation for analytics
   - Regular database cleanup jobs

### Compliance & Legal

- [ ] HIPAA compliance (if operating in US)
- [ ] GDPR compliance (if serving EU users)
- [ ] Data encryption at rest and in transit
- [ ] Privacy policy and terms of service
- [ ] Cookie consent management
- [ ] Data breach response plan
- [ ] Regular security audits
- [ ] User data export/deletion features

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Backend**
   - Uses in-memory storage (data lost on restart)
   - OTP logged to console (no real SMS/email integration)
   - Payment gateway is mocked
   - No file upload handling for documents
   - No real-time notifications

2. **Frontend**
   - Map requires internet connection (uses OpenStreetMap)
   - No offline support
   - Limited accessibility features
   - No PWA support yet

3. **General**
   - Mobile app not implemented
   - No automated tests yet
   - No CI/CD pipeline
   - No staging environment

### Roadmap

**Q1 2026**
- [ ] Database integration (MongoDB)
- [ ] Payment gateway integration
- [ ] OTP service integration
- [ ] File upload for doctor documents
- [ ] Basic test coverage (>70%)

**Q2 2026**
- [ ] Mobile app MVP (React Native)
- [ ] Video consultation feature
- [ ] Advanced analytics dashboard
- [ ] Multi-language support expansion
- [ ] PWA support

**Q3 2026**
- [ ] AI-powered symptom checker enhancement
- [ ] Prescription management
- [ ] Medical records storage
- [ ] Insurance integration
- [ ] Telemedicine compliance certification

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style (ESLint configuration)
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- No console.logs in production code

## 📞 Support

For questions or support:
- Create an issue in the repository
- Check existing documentation
- Review test cases for examples

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for better healthcare access**

