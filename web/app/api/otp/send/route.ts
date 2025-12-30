import { NextRequest, NextResponse } from 'next/server'
import { otpStorage } from '@/lib/storage/otpStorage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, phone, email, otp } = body

    const identifier = channel === 'sms' ? phone : email

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Phone or email is required' },
        { status: 400 }
      )
    }

    if (!otp) {
      return NextResponse.json(
        { success: false, message: 'OTP is required' },
        { status: 400 }
      )
    }

    // Store OTP with 10 minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    otpStorage.set(identifier, { otp, expiresAt, attempts: 0 })

    // In production, send via actual SMS/Email provider:
    // - SMS: Twilio, MSG91, AWS SNS
    // - Email: SendGrid, AWS SES, Nodemailer
    
    console.log(`[OTP] Stored OTP ${otp} for ${identifier} via ${channel}`)

    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: channel === 'sms' 
        ? `OTP sent to ${phone?.slice(0, 3)}****${phone?.slice(-3)}`
        : `OTP sent to ${email?.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
    })
  } catch (error) {
    console.error('[OTP Send Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
