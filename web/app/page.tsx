'use client'

import Link from 'next/link'
import { 
  ArrowRight, 
  Shield, 
  Clock, 
  MapPin, 
  Heart, 
  Star,
  Users,
  Building2,
  Headphones,
  CheckCircle,
  TrendingDown,
  Zap,
  MessageCircle,
  BarChart3,
  Globe,
  Phone
} from 'lucide-react'
import { useState, useEffect } from 'react'
import SimpleLanguageSwitcher from '@/components/SimpleLanguageSwitcher'
import MobileNav from '@/components/MobileNav'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-emerald-50 pointer-events-none" />
      
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-400/10 to-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-sky-400/10 to-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            SANGMAN
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="#features" className="text-gray-600 hover:text-sky-600 transition-colors font-medium">
            Features
          </Link>
          <Link href="#why-us" className="text-gray-600 hover:text-sky-600 transition-colors font-medium">
            Why Sangman
          </Link>
          <Link href="#hospitals" className="text-gray-600 hover:text-sky-600 transition-colors font-medium">
            For Hospitals
          </Link>
          <Link href="/auth/login?role=doctor" className="text-gray-600 hover:text-sky-600 transition-colors font-medium">
            Doctor Login
          </Link>
          {/* Language Switcher */}
          <SimpleLanguageSwitcher />
        </div>

        {/* Desktop Auth Buttons + Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            className="hidden md:block px-4 lg:px-5 py-2.5 text-sky-600 font-semibold hover:text-sky-700 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="hidden sm:block px-4 lg:px-5 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-emerald-600 transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 text-sm sm:text-base"
          >
            Get Started
          </Link>
          
          {/* Mobile Menu Button */}
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-sky-100 text-sky-700 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">India's Most Patient-Friendly Healthcare Platform</span>
            <span className="sm:hidden">Patient-Friendly Healthcare</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Reducing Hospital Queues,
            <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent"> One Booking at a Time</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
            Sync online + walk-in patients into one system. Real hospital queue management, verified doctors, and instant booking—all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-16 px-4">
            <Link 
              href="/auth/register?role=patient" 
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:from-sky-600 hover:to-emerald-600 transition-all shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 active:scale-95 sm:hover:scale-105"
            >
              Book Appointment
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/auth/register?role=doctor" 
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-gray-700 font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-sky-500 hover:text-sky-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Join as Doctor / Hospital
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-gray-500 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              <span>100% Verified Doctors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              <span>No Hidden Charges</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              <span>Fast Customer Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Inspired by Induction Healthcare */}
      <section className="relative z-10 py-10 sm:py-12 md:py-16 bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center text-white">
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">50%</div>
              <div className="text-sky-100 font-medium text-xs sm:text-sm md:text-base">Reduction in Wait Times</div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">10K+</div>
              <div className="text-sky-100 font-medium text-xs sm:text-sm md:text-base">Appointments Delivered</div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">500+</div>
              <div className="text-sky-100 font-medium text-xs sm:text-sm md:text-base">Verified Doctors</div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">
                4.9 <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-sky-100 font-medium text-xs sm:text-sm md:text-base">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different - Key Differentiators */}
      <section id="why-us" className="relative z-10 py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Why Sangman is <span className="text-sky-500">Different</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              We solve real problems that other platforms ignore—designed for Indian hospitals and patients.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Card 1 - Queue Management */}
            <div className="group p-5 sm:p-6 md:p-8 bg-gradient-to-br from-sky-50 to-white rounded-2xl sm:rounded-3xl border-2 border-sky-100 hover:border-sky-300 transition-all hover:shadow-2xl hover:shadow-sky-500/10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Real Queue Reduction
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                Unlike others, we sync <strong>online + walk-in patients</strong> into one unified system.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                  <span>Offline patients entered by admin</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                  <span>Real-time queue position</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                  <span>SMS queue updates</span>
                </li>
              </ul>
            </div>

            {/* Card 2 - Hospital Control */}
            <div className="group p-8 bg-gradient-to-br from-emerald-50 to-white rounded-3xl border-2 border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Hospital Admin Power
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We're <strong>hospital-centric</strong>, not just doctor-centric. Admins get full control to manage their operations efficiently.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Add/remove doctors instantly</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Block/unblock slots</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Shift patients between doctors</span>
                </li>
              </ul>
            </div>

            {/* Card 3 - Customer Support */}
            <div className="group p-8 bg-gradient-to-br from-amber-50 to-white rounded-3xl border-2 border-amber-100 hover:border-amber-300 transition-all hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Human Customer Support
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Our support team responds within <strong>30-60 minutes</strong>. Real humans, not bots. This is where competitors fail.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>SLA-based response times</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Call hospital directly</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>In-app chat support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A complete healthcare platform for patients, doctors, and hospitals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <Shield className="w-10 h-10 mb-4 text-sky-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Doctors</h3>
              <p className="text-gray-600 text-sm">Aadhaar, PAN, Medical License verified</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <Clock className="w-10 h-10 mb-4 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Booking</h3>
              <p className="text-gray-600 text-sm">Book in seconds with real-time slots</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <MapPin className="w-10 h-10 mb-4 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">GPS Navigation</h3>
              <p className="text-gray-600 text-sm">Find nearest doctors with directions</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <MessageCircle className="w-10 h-10 mb-4 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 text-sm">No hidden fees, clear breakdowns</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <BarChart3 className="w-10 h-10 mb-4 text-rose-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Doctor Analytics</h3>
              <p className="text-gray-600 text-sm">Insights on bookings and no-shows</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <Users className="w-10 h-10 mb-4 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Doctor Clinics</h3>
              <p className="text-gray-600 text-sm">Manage multiple doctors easily</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <Globe className="w-10 h-10 mb-4 text-teal-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Regional Languages</h3>
              <p className="text-gray-600 text-sm">Hindi and local language support</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <Phone className="w-10 h-10 mb-4 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SMS Reminders</h3>
              <p className="text-gray-600 text-sm">Automated appointment reminders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Accountability Section */}
      <section className="relative z-10 py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Doctor Accountability Built-In
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                If a doctor rejects or reschedules, they must provide a reason. Repeated rejections affect their visibility. This transparency builds patient trust.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mandatory Rejection Reason</h4>
                    <p className="text-gray-600">No silent cancellations—patients always know why</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Auto-Suggest Alternatives</h4>
                    <p className="text-gray-600">System suggests next available slot or another doctor</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality-Based Ratings</h4>
                    <p className="text-gray-600">Only verified completed appointments can rate</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-emerald-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" fill="white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Dr. Rating Dashboard</h3>
                    <p className="text-gray-500">Real-time performance metrics</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Punctuality Score</span>
                    <span className="font-semibold text-emerald-600">95%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rejection Rate</span>
                    <span className="font-semibold text-sky-600">Only 3%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Patient Satisfaction</span>
                    <span className="font-semibold text-amber-600">4.9/5</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Hospitals Section */}
      <section id="hospitals" className="relative z-10 py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              For Hospitals & Clinics
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get clear ROI with actionable analytics and full administrative control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <BarChart3 className="w-12 h-12 text-sky-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">Daily Queue Analytics</h3>
              <p className="text-slate-300">See queue load, peak hours, and slot utilization in real-time.</p>
            </div>
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <Users className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">No-Show Tracking</h3>
              <p className="text-slate-300">Reduce no-shows with automated reminders and penalty insights.</p>
            </div>
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <TrendingDown className="w-12 h-12 text-amber-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">Clear ROI Reports</h3>
              <p className="text-slate-300">Understand exactly what value you're getting from the platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-r from-sky-500 to-emerald-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers who trust Sangman for seamless care delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register?role=patient" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-600 font-semibold text-lg rounded-2xl hover:bg-gray-50 transition-all shadow-xl hover:scale-105"
            >
              Start as Patient
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/auth/register?role=doctor" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-semibold text-lg rounded-2xl border-2 border-white hover:bg-white/10 transition-all"
            >
              Register Hospital / Clinic
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" fill="white" />
                </div>
                <span className="text-2xl font-bold">SANGMAN</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                India's patient-first healthcare platform. Reducing queues, increasing transparency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">For Patients</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/patient/discover" className="hover:text-white transition-colors">Find Doctors</Link></li>
                <li><Link href="/auth/register?role=patient" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/patient/health-content" className="hover:text-white transition-colors">Health Tips</Link></li>
                <li><Link href="/patient/subscription" className="hover:text-white transition-colors">Subscription Plans</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">For Doctors & Hospitals</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/auth/register?role=doctor" className="hover:text-white transition-colors">Join as Doctor</Link></li>
                <li><Link href="/auth/login?role=doctor" className="hover:text-white transition-colors">Doctor Login</Link></li>
                <li><Link href="/doctor/verification" className="hover:text-white transition-colors">Get Verified</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/patient/support" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500">© 2024 SANGMAN. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Made with ❤️ in India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
