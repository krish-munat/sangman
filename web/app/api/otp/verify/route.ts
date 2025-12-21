import { NextRequest, NextResponse } from 'next/server'

// ================================
// OTP Verify API Route
// ================================

interface VerifyOTPRequest {
  channel: 'sms' | 'email'
  identifier: string
  otp: string
}

interface VerifyOTPResponse {
  success: boolean
  message: string
  verified: boolean
  remainingAttempts?: number
}

// OTP Configuration
const OTP_CONFIG = {
  maxAttempts: 3,
  demoMode: process.env.OTP_DEMO_MODE !== 'false',
  demoOTP: '123456',
}

// In-memory OTP storage (should match send route - use Redis in production)
const otpStorage = new Map<string, { otp: string; expiresAt: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json()
    const { channel, identifier, otp } = body

    // Validate input
    if (!channel || !identifier || !otp) {
      return NextResponse.json<VerifyOTPResponse>(
        { success: false, message: 'Missing required fields', verified: false },
        { status: 400 }
      )
    }

    // Validate OTP format
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json<VerifyOTPResponse>(
        { success: false, message: 'OTP must be 6 digits', verified: false },
        { status: 400 }
      )
    }

    const storageKey = `${channel}:${identifier}`

    // In demo mode, accept the demo OTP
    if (OTP_CONFIG.demoMode && otp === OTP_CONFIG.demoOTP) {
      // Clean up storage if exists
      otpStorage.delete(storageKey)
      
      return NextResponse.json<VerifyOTPResponse>({
        success: true,
        message: 'OTP verified successfully',
        verified: true,
      })
    }

    // Get stored OTP
    const stored = otpStorage.get(storageKey)

    // Check if OTP exists
    if (!stored) {
      // In demo mode, if no stored OTP but demo OTP was already checked above
      return NextResponse.json<VerifyOTPResponse>(
        { 
          success: false, 
          message: 'OTP not found or expired. Please request a new one.', 
          verified: false 
        },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (Date.now() > stored.expiresAt) {
      otpStorage.delete(storageKey)
      return NextResponse.json<VerifyOTPResponse>(
        { 
          success: false, 
          message: 'OTP has expired. Please request a new one.', 
          verified: false 
        },
        { status: 400 }
      )
    }

    // Check attempts
    if (stored.attempts >= OTP_CONFIG.maxAttempts) {
      otpStorage.delete(storageKey)
      return NextResponse.json<VerifyOTPResponse>(
        { 
          success: false, 
          message: 'Too many failed attempts. Please request a new OTP.', 
          verified: false 
        },
        { status: 429 }
      )
    }

    // Verify OTP
    if (otp !== stored.otp) {
      // Increment attempts
      stored.attempts++
      otpStorage.set(storageKey, stored)
      
      const remainingAttempts = OTP_CONFIG.maxAttempts - stored.attempts
      
      return NextResponse.json<VerifyOTPResponse>(
        { 
          success: false, 
          message: remainingAttempts > 0 
            ? `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
            : 'Invalid OTP. No attempts remaining.',
          verified: false,
          remainingAttempts,
        },
        { status: 400 }
      )
    }

    // Success! Clean up storage
    otpStorage.delete(storageKey)

    return NextResponse.json<VerifyOTPResponse>({
      success: true,
      message: 'OTP verified successfully',
      verified: true,
    })
  } catch (error) {
    console.error('Verify OTP Error:', error)
    return NextResponse.json<VerifyOTPResponse>(
      { success: false, message: 'Internal server error', verified: false },
      { status: 500 }
    )
  }
}
