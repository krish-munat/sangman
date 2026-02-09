# Quick Reference Guide

Essential commands and tips for working with SANGMAN Healthcare Platform.

## 🚀 Getting Started

```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
npm run dev          # Runs on http://localhost:3001

# Terminal 2 - Frontend
cd web
npm install
npm run dev          # Runs on http://localhost:3000
```

## 🔑 Test Accounts

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Patient | patient@example.com      | password123  |
| Doctor  | dr.sharma@example.com    | password123  |
| Admin   | admin@sangman.com        | admin123     |

## 📍 Key URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health
- **Patient Portal:** http://localhost:3000/patient
- **Doctor Portal:** http://localhost:3000/doctor
- **Admin Panel:** http://localhost:3000/admin

## 🛠️ Common Commands

### Backend
```bash
npm run dev          # Start with auto-reload
npm start            # Production mode
npm test             # Run tests
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm test             # Run Jest tests
npm run test:watch   # Watch mode
npm run test:e2e     # Cypress E2E tests
```

## 🔍 API Testing

### Using curl

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

**Get Doctors:**
```bash
curl http://localhost:3001/api/doctors
```

**Send OTP:**
```bash
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "channel": "sms"
  }'
```

## 🐛 Troubleshooting

### Backend won't start

**Problem:** Port 3001 already in use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Problem:** Missing dependencies
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start

**Problem:** Port 3000 already in use
```bash
# Change port temporarily
PORT=3001 npm run dev

# Or kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -ti:3000 | xargs kill -9
```

**Problem:** Build errors
```bash
cd web
rm -rf .next node_modules
npm install
npm run dev
```

### Database issues

**Problem:** Data lost after restart
- Backend uses in-memory storage - this is expected
- Data reseeds automatically on startup

### OTP not working

**Problem:** OTP not received
- Check backend console logs for the OTP
- OTP is logged to console in development mode
- In production, integrate with SMS/email service

## 📊 Monitoring

### View Logs

**Backend logs:**
```bash
# If running in background
tail -f /path/to/backend/output.log

# If running in terminal, logs appear directly
```

**Frontend logs:**
```bash
# Check browser console (F12)
# Or check terminal where npm run dev is running
```

### Check Server Status

**Backend Health:**
```bash
curl http://localhost:3001/api/health | jq
```

**Frontend Status:**
```bash
curl -I http://localhost:3000
```

## 🔐 Security Reminders

### Before Committing

- [ ] No `.env` files in commits
- [ ] No API keys or secrets in code
- [ ] No console.logs with sensitive data
- [ ] Run `npm run lint`
- [ ] Update `.gitignore` if needed

### Before Deploying

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Update `ALLOWED_ORIGINS` to production domains
- [ ] Enable HTTPS/SSL
- [ ] Change all default passwords
- [ ] Review security headers (Helmet.js)

## 📝 Quick Tips

### Performance
- Use Next.js `Image` component for images
- Lazy load heavy components with `dynamic()`
- Memoize expensive calculations with `useMemo`
- Debounce search inputs (300ms recommended)

### Code Quality
- Use TypeScript types, avoid `any`
- Follow existing component patterns
- Add error handling to all API calls
- Write meaningful commit messages

### API Development
- Always validate inputs with `express-validator`
- Use the centralized API client (`web/lib/api/client.ts`)
- Add proper error responses
- Document new endpoints in README

## 🎯 Next Steps After Setup

1. **Explore the platform:**
   - Login as patient → book appointment
   - Login as doctor → manage appointments
   - Login as admin → view analytics

2. **Read the docs:**
   - `CLAUDE.md` - Development guide
   - `RECOMMENDATIONS.md` - Best practices
   - `backend/README.md` - API docs

3. **Start developing:**
   - Pick a feature from the roadmap
   - Create a feature branch
   - Follow coding standards
   - Write tests
   - Submit PR

## 📚 Documentation Structure

```
sangman/
├── README.md                    # Project overview & setup
├── CLAUDE.md                    # AI development guide
├── RECOMMENDATIONS.md           # Comprehensive best practices
├── QUICK_REFERENCE.md          # This file - quick tips
├── BACKEND_IMPROVEMENTS.md     # Security changelog
├── PROJECT_STRUCTURE.md        # Architecture details
├── TEST_PLAN.md               # Testing strategy
└── backend/README.md           # Backend API docs
```

## 🆘 Getting Help

1. Check existing documentation
2. Search issues in repository
3. Review test cases for examples
4. Check backend logs for errors
5. Use browser DevTools (F12)

## 🔗 Useful Links

- Next.js Docs: https://nextjs.org/docs
- Express.js Docs: https://expressjs.com
- Tailwind CSS: https://tailwindcss.com/docs
- Leaflet Maps: https://leafletjs.com/reference.html
- Zustand: https://github.com/pmndrs/zustand

---

**Pro Tip:** Keep this file open in a separate tab while developing! 🚀
