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

## 🚀 Getting Started

### Web Application
```bash
cd web
npm install
npm run dev
```

### Mobile Application
```bash
cd mobile
npm install
npm run android  # or npm run ios
```

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

