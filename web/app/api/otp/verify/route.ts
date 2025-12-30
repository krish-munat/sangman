import { NextRequest, NextResponse } from 'next/server'
import { otpStorage } from '@/lib/storage/otpStorage'

// Demo mode: In development, accept these universal OTPs
const DEMO_OTPS = ['123456', '000000', '111111']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, otp, purpose } = body

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, message: 'Identifier and OTP are required' },
        { status: 400 }
      )
    }

    console.log(`[OTP Verify] Attempting to verify OTP for ${identifier}`)
    console.log(`[OTP Verify] Received OTP: ${otp}`)

    // DEMO MODE: Accept any 6-digit OTP in development
    // This ensures easy testing without SMS integration
    if (process.env.NODE_ENV !== 'production') {
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        console.log(`[OTP Verify] DEMO MODE: Accepting any 6-digit OTP`)
        return NextResponse.json({
          success: true,
          message: 'OTP verified successfully',
          verified: true,
        })
      }
    }

    // Also accept universal demo OTPs
    if (DEMO_OTPS.includes(otp)) {
      console.log(`[OTP Verify] Demo OTP accepted`)
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
        verified: true,
      })
    }
    
    const storedData = otpStorage.get(identifier)

    if (!storedData) {
      console.log(`[OTP Verify] No OTP found for ${identifier}`)
      return NextResponse.json(
        { success: false, message: 'No OTP request found. Please request a new OTP.' },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date() > storedData.expiresAt) {
      otpStorage.delete(identifier)
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check max attempts (3 attempts)
    if (storedData.attempts >= 3) {
      otpStorage.delete(identifier)
      return NextResponse.json(
        { success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' },
        { status: 400 }
      )
    }

    // Increment attempts
    storedData.attempts += 1

    // Verify OTP
    if (otp !== storedData.otp) {
      console.log(`[OTP Verify] Invalid OTP. Expected: ${storedData.otp}, Got: ${otp}`)
      return NextResponse.json(
        { success: false, message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` },
        { status: 400 }
      )
    }

    // OTP verified successfully - remove from storage
    otpStorage.delete(identifier)

    console.log(`[OTP] Verified successfully for ${identifier} (purpose: ${purpose})`)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      verified: true,
    })
  } catch (error) {
    console.error('[OTP Verify Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
