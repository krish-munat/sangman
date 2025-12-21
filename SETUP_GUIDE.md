# SANGMAN Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git (optional)

### Installation Steps

1. **Navigate to the web directory**
   ```bash
   cd web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📋 Available Routes

### Public Routes
- `/` - Landing page
- `/auth/login?role=patient` - Patient login
- `/auth/login?role=doctor` - Doctor login
- `/auth/login?role=admin` - Admin login

### Patient Routes (requires authentication)
- `/patient` - Patient dashboard
- `/patient/discover` - Find doctors
- `/patient/booking?doctorId=xxx` - Book appointment
- `/patient/appointments` - View appointments
- `/patient/profile` - Manage profile
- `/patient/subscription` - Subscription plans
- `/patient/health-content` - Health tips
- `/patient/support` - Support & FAQ

### Doctor Routes (requires authentication)
- `/doctor/dashboard` - Doctor dashboard
- `/doctor/appointments` - Manage appointments
- `/doctor/verification` - Document verification
- `/doctor/earnings` - Earnings dashboard
- `/doctor/profile` - Doctor profile

### Admin Routes (requires authentication)
- `/admin/dashboard` - Admin dashboard
- `/admin/verification` - Verify doctors
- `/admin/doctors` - Manage doctors
- `/admin/patients` - Manage patients
- `/admin/appointments` - View all appointments
- `/admin/analytics` - Analytics
- `/admin/config` - Platform configuration

## 🔧 Configuration

### Environment Variables (Create `.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Payment Gateway
PAYMENT_GATEWAY_KEY=your-payment-key

# OTP Service
OTP_SERVICE_API_KEY=your-otp-key

# File Storage
STORAGE_BUCKET=your-storage-bucket
```

## 🎨 Customization

### Colors
Edit `web/tailwind.config.js` to customize the color palette:
- Primary colors (Healthcare Blue)
- Success colors (Trust Green)
- Emergency colors (Alert Red)

### Content
- Health tips: Edit `web/app/patient/health-content/page.tsx`
- FAQ: Edit `web/app/patient/support/page.tsx`
- Specializations: Edit `shared/constants/index.ts`

## 🔌 Backend Integration

### API Endpoints to Implement

1. **Authentication**
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `POST /api/auth/otp/send`
   - `POST /api/auth/otp/verify`

2. **Doctors**
   - `GET /api/doctors` - List doctors
   - `GET /api/doctors/:id` - Get doctor details
   - `POST /api/doctors/verification` - Submit documents

3. **Appointments**
   - `POST /api/appointments` - Create appointment
   - `GET /api/appointments` - List appointments
   - `PATCH /api/appointments/:id` - Update appointment
   - `POST /api/appointments/:id/verify-otp` - Verify OTP

4. **Payments**
   - `POST /api/payments` - Process payment
   - `GET /api/payments/:id` - Get payment status

5. **Subscriptions**
   - `POST /api/subscriptions` - Create subscription
   - `GET /api/subscriptions` - Get subscription status

## 📱 Mobile App Setup (Future)

```bash
cd mobile
npm install
npm run android  # For Android
npm run ios      # For iOS
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Map Not Loading
- Ensure Leaflet CSS is imported
- Check browser console for CORS errors
- Verify OpenStreetMap tiles are accessible

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Leaflet](https://react-leaflet.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## 🆘 Support

For issues or questions:
1. Check the `PROJECT_STRUCTURE.md` file
2. Review code comments
3. Check browser console for errors
4. Verify all dependencies are installed

## ✅ Next Steps

1. Set up backend API
2. Configure environment variables
3. Integrate payment gateway
4. Set up OTP service
5. Configure file storage
6. Deploy to production

