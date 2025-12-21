# SANGMAN Healthcare Platform - Complete Project Structure

## 📁 Project Overview

This is a comprehensive healthcare platform with separate portals for Patients, Doctors, and Admins.

## 🗂️ Directory Structure

```
sangman-platform/
├── README.md
├── package.json
├── .gitignore
├── shared/
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types
│   └── constants/
│       └── index.ts          # Shared constants
│
├── web/                       # Next.js Web Application
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── postcss.config.js
│   │
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── globals.css       # Global styles
│   │   │
│   │   ├── auth/             # Authentication
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── patient/          # Patient Portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Patient dashboard
│   │   │   ├── discover/     # Find doctors
│   │   │   ├── booking/      # Book appointment
│   │   │   ├── appointments/ # View appointments
│   │   │   ├── profile/      # Patient profile
│   │   │   ├── subscription/# Subscription plans
│   │   │   ├── health-content/# Health tips
│   │   │   └── support/      # Support & FAQ
│   │   │
│   │   ├── doctor/          # Doctor Portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/   # Doctor dashboard
│   │   │   ├── appointments/ # Manage appointments
│   │   │   ├── verification/ # Document verification
│   │   │   ├── earnings/     # Earnings dashboard
│   │   │   ├── profile/      # Doctor profile
│   │   │   └── settings/     # Settings
│   │   │
│   │   └── admin/           # Admin Panel
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── dashboard/   # Admin dashboard
│   │       ├── verification/# Verify doctors
│   │       ├── doctors/     # Manage doctors
│   │       ├── patients/    # Manage patients
│   │       ├── appointments/# View all appointments
│   │       ├── analytics/    # Analytics
│   │       └── config/      # Platform configuration
│   │
│   ├── components/           # Reusable components
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   └── map/
│   │       └── DoctorMap.tsx
│   │
│   └── lib/                  # Utilities
│       ├── store/
│       │   └── authStore.ts  # Zustand auth store
│       └── utils/
│           ├── calculations.ts # Payment calculations
│           └── format.ts      # Formatting utilities
│
└── mobile/                   # React Native Mobile App (to be implemented)
    └── src/
        ├── screens/
        ├── components/
        ├── navigation/
        └── services/
```

## 🎯 Key Features Implemented

### ✅ Patient Portal
- [x] Landing page with hero section
- [x] Authentication (Login/Register with OTP)
- [x] Doctor discovery with GPS location
- [x] Interactive map with Leaflet.js
- [x] Appointment booking (normal & emergency)
- [x] Payment calculation with platform fee & subscription discount
- [x] OTP-based visit confirmation
- [x] Appointment management
- [x] Patient profile management
- [x] Subscription system (monthly/yearly)
- [x] Health content library (Vedic, Wellness, Lifestyle)
- [x] Support & FAQ page
- [x] Responsive sidebar navigation
- [x] Dark mode support

### ✅ Doctor Portal
- [x] Doctor dashboard with stats
- [x] Appointment management (accept/reject)
- [x] OTP verification for patient visits
- [x] Document verification upload
- [x] Earnings dashboard with transaction history
- [x] Profile management
- [x] Emergency availability toggle
- [x] Responsive sidebar navigation

### ✅ Admin Panel
- [x] Admin dashboard with analytics
- [x] Doctor verification system
- [x] Revenue tracking by region
- [x] Usage analytics
- [x] User management (doctors & patients)
- [x] Platform configuration
- [x] Responsive sidebar navigation

### ✅ Core Features
- [x] Role-based authentication
- [x] Theme system (Light/Dark mode)
- [x] GPS location integration
- [x] Map integration (OpenStreetMap/Leaflet)
- [x] Payment calculation logic
- [x] Emergency surge pricing
- [x] Subscription discount system
- [x] OTP generation & verification
- [x] Responsive design
- [x] Healthcare color palette
- [x] Accessibility features

## 🎨 Design System

### Colors
- **Primary**: Healthcare Blue (#0EA5E9)
- **Success**: Trust Green (#10B981)
- **Emergency**: Alert Red (#EF4444)
- **Neutral**: Gray scale for backgrounds and text

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scaling

### Components
- Card-based layouts
- Consistent button styles
- Form inputs with validation
- Toast notifications
- Loading states

## 🔐 Security Features

- Role-based access control
- OTP verification for appointments
- Encrypted document storage (ready for implementation)
- Secure authentication flow
- Privacy-first architecture

## 📱 Next Steps

### To Complete:
1. **Backend API Integration**
   - Replace mock data with actual API calls
   - Implement authentication endpoints
   - Payment gateway integration
   - OTP service integration

2. **Mobile App** (React Native)
   - Patient mobile app
   - Doctor mobile app
   - Push notifications
   - Offline support

3. **Additional Features**
   - Real-time notifications
   - Video consultation (optional)
   - Prescription management
   - Medical records storage
   - Review & rating system

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

## 🚀 Getting Started

```bash
# Install dependencies
cd web
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📝 Notes

- All authentication is currently mocked - integrate with your backend
- Payment processing needs gateway integration
- OTP service needs SMS/Email provider integration
- Map tiles use OpenStreetMap (free, no API key needed)
- All data is currently stored in component state - needs backend integration

## 🎯 Production Checklist

- [ ] Backend API setup
- [ ] Database configuration
- [ ] Payment gateway integration
- [ ] OTP service integration
- [ ] Email service setup
- [ ] File storage (for documents)
- [ ] SSL certificates
- [ ] Environment variables
- [ ] Error logging
- [ ] Analytics integration
- [ ] Performance optimization
- [ ] SEO optimization

