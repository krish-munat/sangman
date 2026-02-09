require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sangman-secret-key-change-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security: Warn if using default JWT secret
if (JWT_SECRET === 'sangman-secret-key-change-in-production' && NODE_ENV === 'production') {
  console.error('⚠️  WARNING: Using default JWT_SECRET in production! Set JWT_SECRET environment variable.');
}

// Security Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests per 15 minutes
  message: 'Too many OTP requests, please try again later.',
});

// Apply general rate limiter to all routes
app.use('/api/', limiter);

// In-memory database (replace with actual database in production)
const db = {
  users: [],
  doctors: [],
  patients: [],
  appointments: [],
  otps: new Map(),
};

// Utility Functions
function generateSecureOTP(length = 6) {
  // Generate cryptographically secure random OTP
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

function validatePassword(password) {
  // Minimum 8 characters, at least one letter and one number
  const minLength = 8;
  if (!password || password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

// Seed some initial data
seedDatabase();

function seedDatabase() {
  // Seed doctors
  db.doctors = [
    {
      id: 'doc-1',
      email: 'dr.sharma@example.com',
      phone: '+919876543210',
      password: bcrypt.hashSync('password123', 10),
      role: 'doctor',
      name: 'Dr. Rajesh Sharma',
      profilePhoto: null,
      specializations: ['Cardiology', 'General Medicine'],
      experience: 15,
      qualifications: ['MBBS', 'MD Cardiology'],
      clinicAddress: {
        street: '123 Medical Street',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        coordinates: { latitude: 28.6139, longitude: 77.2090 },
      },
      consultationFee: 500,
      emergencyFee: 1000,
      availability: {
        days: {
          monday: { available: true, slots: [
            { start: '09:00', end: '10:00', available: true },
            { start: '10:00', end: '11:00', available: true },
            { start: '14:00', end: '15:00', available: true },
          ]},
          tuesday: { available: true, slots: [
            { start: '09:00', end: '10:00', available: true },
            { start: '11:00', end: '12:00', available: true },
          ]},
          wednesday: { available: true, slots: [
            { start: '10:00', end: '11:00', available: true },
            { start: '15:00', end: '16:00', available: true },
          ]},
          thursday: { available: true, slots: [
            { start: '09:00', end: '10:00', available: true },
            { start: '14:00', end: '15:00', available: true },
          ]},
          friday: { available: true, slots: [
            { start: '10:00', end: '11:00', available: true },
            { start: '16:00', end: '17:00', available: true },
          ]},
        },
        timezone: 'Asia/Kolkata',
      },
      emergencyAvailable: true,
      verified: true,
      verificationStatus: 'approved',
      rating: 4.8,
      totalReviews: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'doc-2',
      email: 'dr.patel@example.com',
      phone: '+919876543211',
      password: bcrypt.hashSync('password123', 10),
      role: 'doctor',
      name: 'Dr. Anita Patel',
      profilePhoto: null,
      specializations: ['Pediatrics'],
      experience: 10,
      qualifications: ['MBBS', 'MD Pediatrics'],
      clinicAddress: {
        street: '456 Health Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        coordinates: { latitude: 19.076, longitude: 72.8777 },
      },
      consultationFee: 600,
      emergencyFee: 1200,
      availability: {
        days: {
          monday: { available: true, slots: [
            { start: '10:00', end: '11:00', available: true },
            { start: '15:00', end: '16:00', available: true },
          ]},
        },
        timezone: 'Asia/Kolkata',
      },
      emergencyAvailable: false,
      verified: true,
      verificationStatus: 'approved',
      rating: 4.9,
      totalReviews: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'doc-3',
      email: 'dr.singh@example.com',
      phone: '+919876543212',
      password: bcrypt.hashSync('password123', 10),
      role: 'doctor',
      name: 'Dr. Vikram Singh',
      profilePhoto: null,
      specializations: ['Orthopedics'],
      experience: 20,
      qualifications: ['MBBS', 'MS Orthopedics'],
      clinicAddress: {
        street: '789 Care Center',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
      },
      consultationFee: 800,
      emergencyFee: 1600,
      availability: {
        days: {
          tuesday: { available: true, slots: [
            { start: '09:00', end: '10:00', available: true },
            { start: '14:00', end: '15:00', available: true },
          ]},
          thursday: { available: true, slots: [
            { start: '11:00', end: '12:00', available: true },
          ]},
        },
        timezone: 'Asia/Kolkata',
      },
      emergencyAvailable: true,
      verified: true,
      verificationStatus: 'approved',
      rating: 4.7,
      totalReviews: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Seed patients
  db.patients = [
    {
      id: 'pat-1',
      email: 'patient@example.com',
      phone: '+919876543220',
      password: bcrypt.hashSync('password123', 10),
      role: 'patient',
      name: 'Test Patient',
      age: 30,
      gender: 'male',
      medicalHistory: null,
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+919876543221',
        relation: 'spouse',
      },
      subscription: null,
      location: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Seed admin
  db.users.push({
    id: 'admin-1',
    email: 'admin@sangman.com',
    phone: '+919876543200',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    name: 'Admin User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('Database seeded with initial data');
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ================== AUTH ROUTES ==================

// Register
app.post('/api/auth/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['patient', 'doctor']).withMessage('Invalid role'),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, phone, password, role = 'patient' } = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user exists
    const existingUser = [...db.patients, ...db.doctors, ...db.users].find(
      u => u.email === email || u.phone === phone
    );
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = `${role}-${uuidv4()}`;
    const now = new Date().toISOString();

    const newUser = {
      id,
      email,
      phone,
      password: hashedPassword,
      role,
      name,
      createdAt: now,
      updatedAt: now,
    };

    if (role === 'patient') {
      db.patients.push({
        ...newUser,
        age: null,
        gender: null,
        medicalHistory: null,
        emergencyContact: null,
        subscription: null,
        location: null,
      });
    } else if (role === 'doctor') {
      db.doctors.push({
        ...newUser,
        specializations: [],
        experience: 0,
        qualifications: [],
        clinicAddress: null,
        consultationFee: 0,
        emergencyFee: 0,
        availability: { days: {}, timezone: 'Asia/Kolkata' },
        emergencyAvailable: false,
        verified: false,
        verificationStatus: 'pending',
        rating: 0,
        totalReviews: 0,
      });
    }

    // Generate token
    const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, phone, otp, role = 'patient' } = req.body;

    // Find user
    let user = null;
    if (role === 'patient') {
      user = db.patients.find(u => u.email === email || u.phone === phone);
    } else if (role === 'doctor') {
      user = db.doctors.find(u => u.email === email || u.phone === phone);
    } else if (role === 'admin') {
      user = db.users.find(u => u.email === email && u.role === 'admin');
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password (if using password login)
    if (password) {
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Verify OTP (if using OTP login)
    if (otp && phone) {
      const storedOTP = db.otps.get(phone);
      if (!storedOTP || storedOTP.otp !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
      }
      if (new Date() > storedOTP.expiresAt) {
        db.otps.delete(phone);
        return res.status(401).json({ message: 'OTP expired' });
      }
      db.otps.delete(phone);
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { id, role } = req.user;
  let user = null;

  if (role === 'patient') {
    user = db.patients.find(u => u.id === id);
  } else if (role === 'doctor') {
    user = db.doctors.find(u => u.id === id);
  } else if (role === 'admin') {
    user = db.users.find(u => u.id === id);
  }

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ================== DOCTOR ROUTES ==================

// Get all doctors
app.get('/api/doctors', (req, res) => {
  const { specialty, emergency, search, verified = 'true' } = req.query;

  let doctors = db.doctors.filter(d => verified === 'false' || d.verified);

  if (specialty) {
    doctors = doctors.filter(d => 
      d.specializations.some(s => s.toLowerCase() === specialty.toLowerCase())
    );
  }

  if (emergency === 'true') {
    doctors = doctors.filter(d => d.emergencyAvailable);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    doctors = doctors.filter(d =>
      d.name.toLowerCase().includes(searchLower) ||
      d.specializations.some(s => s.toLowerCase().includes(searchLower))
    );
  }

  // Remove passwords from response
  const doctorsWithoutPasswords = doctors.map(({ password, ...d }) => d);

  res.json(doctorsWithoutPasswords);
});

// Get doctor by ID
app.get('/api/doctors/:id', (req, res) => {
  const doctor = db.doctors.find(d => d.id === req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const { password: _, ...doctorWithoutPassword } = doctor;
  res.json(doctorWithoutPassword);
});

// Update doctor profile
app.put('/api/doctors/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const doctorIndex = db.doctors.findIndex(d => d.id === id);
  if (doctorIndex === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  // Check authorization
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  db.doctors[doctorIndex] = {
    ...db.doctors[doctorIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const { password: _, ...doctorWithoutPassword } = db.doctors[doctorIndex];
  res.json(doctorWithoutPassword);
});

// ================== PATIENT ROUTES ==================

// Get all patients (admin only)
app.get('/api/patients', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const patientsWithoutPasswords = db.patients.map(({ password, ...p }) => p);
  res.json(patientsWithoutPasswords);
});

// Get patient by ID
app.get('/api/patients/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Check authorization
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const patient = db.patients.find(p => p.id === id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const { password: _, ...patientWithoutPassword } = patient;
  res.json(patientWithoutPassword);
});

// Update patient profile
app.put('/api/patients/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const patientIndex = db.patients.findIndex(p => p.id === id);
  if (patientIndex === -1) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  db.patients[patientIndex] = {
    ...db.patients[patientIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const { password: _, ...patientWithoutPassword } = db.patients[patientIndex];
  res.json(patientWithoutPassword);
});

// ================== APPOINTMENT ROUTES ==================

// Create appointment
app.post('/api/appointments', authenticateToken, (req, res) => {
  try {
    const { doctorId, date, timeSlot, type = 'normal' } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const doctor = db.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Calculate payment
    const baseFee = type === 'emergency' ? (doctor.emergencyFee || doctor.consultationFee * 2) : doctor.consultationFee;
    const platformFee = baseFee * 0.07;
    const totalAmount = baseFee + platformFee;

    // Generate OTP for appointment
    const otp = generateSecureOTP(6);

    const appointment = {
      id: `apt-${uuidv4()}`,
      patientId,
      doctorId,
      date,
      timeSlot,
      type,
      status: 'pending',
      otp,
      otpVerified: false,
      payment: {
        consultationFee: baseFee,
        platformFee,
        emergencySurcharge: type === 'emergency' ? baseFee - doctor.consultationFee : 0,
        subscriptionDiscount: 0,
        totalAmount,
        status: 'pending',
        paymentMethod: 'card',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.appointments.push(appointment);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
});

// Get appointments
app.get('/api/appointments', authenticateToken, (req, res) => {
  const { status, type } = req.query;
  const { id, role } = req.user;

  let appointments = db.appointments;

  // Filter by user role
  if (role === 'patient') {
    appointments = appointments.filter(a => a.patientId === id);
  } else if (role === 'doctor') {
    appointments = appointments.filter(a => a.doctorId === id);
  }

  // Apply filters
  if (status) {
    appointments = appointments.filter(a => a.status === status);
  }
  if (type) {
    appointments = appointments.filter(a => a.type === type);
  }

  // Enrich with doctor/patient info
  const enrichedAppointments = appointments.map(apt => {
    const doctor = db.doctors.find(d => d.id === apt.doctorId);
    const patient = db.patients.find(p => p.id === apt.patientId);
    return {
      ...apt,
      doctor: doctor ? { id: doctor.id, name: doctor.name, specializations: doctor.specializations } : null,
      patient: patient ? { id: patient.id, name: patient.name } : null,
    };
  });

  res.json(enrichedAppointments);
});

// Get appointment by ID
app.get('/api/appointments/:id', authenticateToken, (req, res) => {
  const appointment = db.appointments.find(a => a.id === req.params.id);
  
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  // Check authorization
  if (
    req.user.id !== appointment.patientId &&
    req.user.id !== appointment.doctorId &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const doctor = db.doctors.find(d => d.id === appointment.doctorId);
  const patient = db.patients.find(p => p.id === appointment.patientId);

  res.json({
    ...appointment,
    doctor: doctor ? { id: doctor.id, name: doctor.name, specializations: doctor.specializations } : null,
    patient: patient ? { id: patient.id, name: patient.name } : null,
  });
});

// Update appointment status
app.patch('/api/appointments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const appointmentIndex = db.appointments.findIndex(a => a.id === id);
  if (appointmentIndex === -1) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const appointment = db.appointments[appointmentIndex];

  // Check authorization
  if (
    req.user.id !== appointment.patientId &&
    req.user.id !== appointment.doctorId &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  db.appointments[appointmentIndex] = {
    ...appointment,
    status,
    updatedAt: new Date().toISOString(),
  };

  res.json(db.appointments[appointmentIndex]);
});

// Verify appointment OTP
app.post('/api/appointments/:id/verify-otp', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;

  const appointmentIndex = db.appointments.findIndex(a => a.id === id);
  if (appointmentIndex === -1) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const appointment = db.appointments[appointmentIndex];

  if (appointment.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  db.appointments[appointmentIndex] = {
    ...appointment,
    otpVerified: true,
    status: 'confirmed',
    updatedAt: new Date().toISOString(),
  };

  res.json({
    message: 'OTP verified successfully',
    appointment: db.appointments[appointmentIndex],
  });
});

// ================== ADMIN ROUTES ==================

// Get analytics
app.get('/api/admin/analytics', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const totalPatients = db.patients.length;
  const totalDoctors = db.doctors.length;
  const activeDoctors = db.doctors.filter(d => d.verified).length;
  const totalAppointments = db.appointments.length;
  const emergencyAppointments = db.appointments.filter(a => a.type === 'emergency').length;

  const totalRevenue = db.appointments
    .filter(a => a.payment.status === 'completed')
    .reduce((sum, a) => sum + a.payment.totalAmount, 0);

  const platformFee = db.appointments
    .filter(a => a.payment.status === 'completed')
    .reduce((sum, a) => sum + a.payment.platformFee, 0);

  res.json({
    totalPatients,
    totalDoctors,
    activeDoctors,
    totalAppointments,
    emergencyAppointments,
    revenue: {
      total: totalRevenue,
      platformFee,
      byRegion: {
        'Delhi': totalRevenue * 0.3,
        'Mumbai': totalRevenue * 0.25,
        'Bangalore': totalRevenue * 0.2,
        'Chennai': totalRevenue * 0.15,
        'Other': totalRevenue * 0.1,
      },
    },
    regionWiseUsage: {
      'Delhi': Math.floor(totalAppointments * 0.3),
      'Mumbai': Math.floor(totalAppointments * 0.25),
      'Bangalore': Math.floor(totalAppointments * 0.2),
      'Chennai': Math.floor(totalAppointments * 0.15),
      'Other': Math.floor(totalAppointments * 0.1),
    },
  });
});

// Get pending doctor verifications
app.get('/api/admin/verifications', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const pendingDoctors = db.doctors
    .filter(d => d.verificationStatus === 'pending')
    .map(({ password, ...d }) => d);

  res.json(pendingDoctors);
});

// Approve/reject doctor verification
app.post('/api/admin/verifications/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  const doctorIndex = db.doctors.findIndex(d => d.id === id);
  if (doctorIndex === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  db.doctors[doctorIndex] = {
    ...db.doctors[doctorIndex],
    verified: action === 'approve',
    verificationStatus: action === 'approve' ? 'approved' : 'rejected',
    updatedAt: new Date().toISOString(),
  };

  const { password: _, ...doctorWithoutPassword } = db.doctors[doctorIndex];
  res.json({
    message: `Doctor ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    doctor: doctorWithoutPassword,
  });
});

// ================== OTP ROUTES ==================

// Send OTP
app.post('/api/otp/send', otpLimiter, [
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('channel').isIn(['sms', 'email']).withMessage('Channel must be sms or email'),
], (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { phone, email, channel } = req.body;
  const identifier = channel === 'sms' ? phone : email;

  if (!identifier) {
    return res.status(400).json({ message: 'Phone or email is required' });
  }

  // Generate secure 6-digit OTP
  const otp = generateSecureOTP(6);
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  db.otps.set(identifier, { otp, expiresAt, attempts: 0 });

  console.log(`[OTP] Sent ${otp} to ${identifier}`);

  res.json({
    success: true,
    message: channel === 'sms'
      ? `OTP sent to ${phone.slice(0, 3)}****${phone.slice(-3)}`
      : `OTP sent to ${email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
  });
});

// Verify OTP
app.post('/api/otp/verify', otpLimiter, [
  body('identifier').notEmpty().withMessage('Identifier is required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
], (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { identifier, otp } = req.body;

  const storedOTP = db.otps.get(identifier);

  if (!storedOTP) {
    return res.status(400).json({ success: false, message: 'No OTP request found' });
  }

  if (new Date() > storedOTP.expiresAt) {
    db.otps.delete(identifier);
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  // Check attempts to prevent brute force
  if (storedOTP.attempts >= 3) {
    db.otps.delete(identifier);
    return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
  }

  if (otp !== storedOTP.otp) {
    storedOTP.attempts = (storedOTP.attempts || 0) + 1;
    db.otps.set(identifier, storedOTP);
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  db.otps.delete(identifier);
  res.json({ success: true, message: 'OTP verified successfully' });
});

// ================== ESCROW ROUTES ==================

// In-memory escrow storage
const escrowTransactions = new Map();

// Initiate escrow for appointment
app.post('/api/escrow/initiate', authenticateToken, (req, res) => {
  try {
    const { appointmentId, amount, paymentMethod = 'card' } = req.body;
    const patientId = req.user.id;

    if (!appointmentId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const appointment = db.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const platformFee = Math.round(amount * 0.07);
    const doctorPayout = amount - platformFee;

    const escrowId = `escrow-${Date.now()}`;
    const transaction = {
      id: escrowId,
      appointmentId,
      patientId,
      doctorId: appointment.doctorId,
      amount,
      platformFee,
      doctorPayout,
      status: 'HELD_IN_ESCROW',
      paymentMethod,
      createdAt: new Date().toISOString(),
      heldAt: new Date().toISOString(),
    };

    escrowTransactions.set(escrowId, transaction);

    res.status(201).json({
      message: 'Payment held in escrow',
      transaction,
    });
  } catch (error) {
    console.error('Escrow initiation error:', error);
    res.status(500).json({ message: 'Failed to initiate escrow' });
  }
});

// Get escrow transaction
app.get('/api/escrow/:id', authenticateToken, (req, res) => {
  const transaction = escrowTransactions.get(req.params.id);
  
  if (!transaction) {
    return res.status(404).json({ message: 'Escrow transaction not found' });
  }

  // Check authorization
  if (
    req.user.id !== transaction.patientId &&
    req.user.id !== transaction.doctorId &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(transaction);
});

// Release escrow to doctor
app.post('/api/escrow/:id/release', authenticateToken, (req, res) => {
  const transaction = escrowTransactions.get(req.params.id);
  
  if (!transaction) {
    return res.status(404).json({ message: 'Escrow transaction not found' });
  }

  if (req.user.role !== 'admin' && req.user.id !== transaction.doctorId) {
    return res.status(403).json({ message: 'Not authorized to release escrow' });
  }

  transaction.status = 'RELEASED_TO_DOCTOR';
  transaction.releasedAt = new Date().toISOString();
  escrowTransactions.set(req.params.id, transaction);

  res.json({
    message: 'Payment released to doctor',
    transaction,
  });
});

// Raise dispute
app.post('/api/escrow/:id/dispute', authenticateToken, (req, res) => {
  const { reason } = req.body;
  const transaction = escrowTransactions.get(req.params.id);
  
  if (!transaction) {
    return res.status(404).json({ message: 'Escrow transaction not found' });
  }

  if (req.user.id !== transaction.patientId) {
    return res.status(403).json({ message: 'Only patient can raise dispute' });
  }

  transaction.status = 'DISPUTED';
  transaction.disputedAt = new Date().toISOString();
  transaction.disputeReason = reason;
  escrowTransactions.set(req.params.id, transaction);

  res.json({
    message: 'Dispute raised successfully',
    transaction,
  });
});

// Get patient's escrow transactions
app.get('/api/escrow/patient/:patientId', authenticateToken, (req, res) => {
  if (req.user.id !== req.params.patientId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const transactions = Array.from(escrowTransactions.values())
    .filter(t => t.patientId === req.params.patientId);

  res.json(transactions);
});

// Get doctor's escrow transactions
app.get('/api/escrow/doctor/:doctorId', authenticateToken, (req, res) => {
  if (req.user.id !== req.params.doctorId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const transactions = Array.from(escrowTransactions.values())
    .filter(t => t.doctorId === req.params.doctorId);

  res.json(transactions);
});

// ================== PHARMACY ROUTES ==================

// Mock pharmacy inventory
const pharmacyInventory = [
  { id: 'med-1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', price: 25, mrp: 30, prescriptionRequired: false, inStock: true, packSize: 'Strip of 10 tablets' },
  { id: 'med-2', name: 'Azithromycin 500mg', genericName: 'Azithromycin', price: 89, mrp: 120, prescriptionRequired: true, inStock: true, packSize: 'Strip of 3 tablets' },
  { id: 'med-3', name: 'Cetirizine 10mg', genericName: 'Cetirizine', price: 35, mrp: 45, prescriptionRequired: false, inStock: true, packSize: 'Strip of 10 tablets' },
  { id: 'med-4', name: 'Omeprazole 20mg', genericName: 'Omeprazole', price: 65, mrp: 85, prescriptionRequired: true, inStock: true, packSize: 'Strip of 15 capsules' },
  { id: 'med-5', name: 'Vitamin D3 60K', genericName: 'Cholecalciferol', price: 120, mrp: 150, prescriptionRequired: false, inStock: true, packSize: 'Strip of 4 capsules' },
];

// Search medicines
app.get('/api/pharmacy/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json(pharmacyInventory);
  }

  const searchLower = q.toLowerCase();
  const results = pharmacyInventory.filter(med =>
    med.name.toLowerCase().includes(searchLower) ||
    med.genericName.toLowerCase().includes(searchLower)
  );

  res.json(results);
});

// Get medicine by ID
app.get('/api/pharmacy/medicine/:id', (req, res) => {
  const medicine = pharmacyInventory.find(m => m.id === req.params.id);
  
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  res.json(medicine);
});

// Process prescription (OCR simulation)
app.post('/api/pharmacy/prescription/process', authenticateToken, async (req, res) => {
  try {
    // In production, this would:
    // 1. Accept image upload
    // 2. Run OCR to extract medicine names
    // 3. Match with inventory

    // Mock response
    const extractedMedicines = [
      { name: 'Paracetamol 500mg', found: true, medicine: pharmacyInventory[0] },
      { name: 'Azithromycin 500mg', found: true, medicine: pharmacyInventory[1] },
      { name: 'Rare Medicine XYZ', found: false, medicine: null },
    ];

    res.json({
      message: 'Prescription processed',
      extractedMedicines,
      availableCount: extractedMedicines.filter(m => m.found).length,
      unavailableCount: extractedMedicines.filter(m => !m.found).length,
    });
  } catch (error) {
    console.error('Prescription processing error:', error);
    res.status(500).json({ message: 'Failed to process prescription' });
  }
});

// Place pharmacy order
app.post('/api/pharmacy/order', authenticateToken, (req, res) => {
  try {
    const { items, deliveryAddress, deliverySlot, prescriptionId } = req.body;
    const patientId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const total = subtotal + deliveryFee;

    const order = {
      id: `order-${Date.now()}`,
      patientId,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      deliverySlot,
      prescriptionId,
      status: 'confirmed',
      estimatedDelivery: '15-30 minutes',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

// ================== AI TRIAGE ROUTES ==================

// Generate doctor brief from triage data
app.post('/api/triage/generate-brief', authenticateToken, (req, res) => {
  try {
    const { symptoms, duration, severity, medications, allergies, additionalNotes } = req.body;

    // In production, this would use an LLM to generate a proper medical brief
    const brief = {
      id: `brief-${Date.now()}`,
      patientId: req.user.id,
      summary: `Patient reports ${symptoms} for ${duration}. Severity: ${severity}/10.`,
      symptoms: symptoms.split(',').map(s => s.trim()),
      duration,
      severity: parseInt(severity),
      currentMedications: medications,
      knownAllergies: allergies,
      additionalContext: additionalNotes,
      suggestedSpecialty: determineSuggestedSpecialty(symptoms),
      urgencyLevel: determineUrgencyLevel(severity, symptoms),
      createdAt: new Date().toISOString(),
    };

    res.json({
      message: 'Doctor brief generated',
      brief,
    });
  } catch (error) {
    console.error('Brief generation error:', error);
    res.status(500).json({ message: 'Failed to generate brief' });
  }
});

function determineSuggestedSpecialty(symptoms) {
  const s = symptoms.toLowerCase();
  if (s.includes('fever') || s.includes('cold') || s.includes('cough')) return 'General Physician';
  if (s.includes('skin') || s.includes('rash')) return 'Dermatologist';
  if (s.includes('stomach') || s.includes('digestion')) return 'Gastroenterologist';
  if (s.includes('joint') || s.includes('bone')) return 'Orthopedic';
  if (s.includes('heart') || s.includes('chest')) return 'Cardiologist';
  return 'General Physician';
}

function determineUrgencyLevel(severity, symptoms) {
  const sev = parseInt(severity);
  const s = symptoms.toLowerCase();
  
  if (s.includes('breathing') || s.includes('chest pain') || sev >= 9) return 'emergency';
  if (sev >= 7) return 'high';
  if (sev >= 4) return 'medium';
  return 'low';
}

// ================== HEALTH CHECK ==================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

// ================== ERROR HANDLING ==================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS policy violation',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SANGMAN Backend API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET === 'sangman-secret-key-change-in-production' ? '⚠️  DEFAULT (change for production)' : '✓ Custom'}`);
});

