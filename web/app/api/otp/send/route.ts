import { NextRequest, NextResponse } from 'next/server'

// ================================
// OTP Send API Route
// ================================
// This endpoint handles sending OTPs via SMS or Email
// 
// Supported Providers:
// - SMS: Twilio (via REST API), MSG91, AWS SNS
// - Email: Resend, SendGrid, AWS SES
//
// All integrations use fetch() - no npm packages required!

interface SendOTPRequest {
  channel: 'sms' | 'email'
  identifier: string
  purpose: 'login' | 'register' | 'reset-password' | 'verify-phone' | 'verify-email'
}

interface SendOTPResponse {
  success: boolean
  message: string
  otp?: string
  expiresAt?: number
}

// OTP Configuration
const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 5,
  // Demo mode - set OTP_DEMO_MODE=false in env to enable real sending
  demoMode: process.env.OTP_DEMO_MODE !== 'false',
  demoOTP: '123456',
}

// In-memory OTP storage (use Redis/database in production)
const otpStorage = new Map<string, { otp: string; expiresAt: number; attempts: number }>()

function generateOTP(): string {
  if (OTP_CONFIG.demoMode) {
    return OTP_CONFIG.demoOTP
  }
  let otp = ''
  for (let i = 0; i < OTP_CONFIG.length; i++) {
    otp += Math.floor(Math.random() * 10).toString()
  }
  return otp
}

// ================================
// SMS Sending via Twilio REST API
// ================================
async function sendSMSViaTwilio(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, message: 'Twilio not configured' }
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: `Your SANGMAN verification code is: ${otp}. Valid for ${OTP_CONFIG.expiryMinutes} minutes. Do not share this code with anyone.`,
      }),
    })

    if (response.ok) {
      return { success: true, message: 'OTP sent successfully' }
    } else {
      const error = await response.json()
      console.error('Twilio Error:', error)
      return { success: false, message: error.message || 'Failed to send SMS' }
    }
  } catch (error) {
    console.error('Twilio SMS Error:', error)
    return { success: false, message: 'Failed to send SMS' }
  }
}

// ================================
// SMS Sending via MSG91 (Popular in India)
// ================================
async function sendSMSViaMSG91(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  const authKey = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  const senderId = process.env.MSG91_SENDER_ID || 'SANGMN'

  if (!authKey || !templateId) {
    return { success: false, message: 'MSG91 not configured' }
  }

  try {
    // Remove + from phone number for MSG91
    const cleanPhone = phone.replace('+', '')
    
    const response = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: cleanPhone,
        sender: senderId,
        otp: otp,
        otp_length: OTP_CONFIG.length,
        otp_expiry: OTP_CONFIG.expiryMinutes,
      }),
    })

    const data = await response.json()
    
    if (data.type === 'success') {
      return { success: true, message: 'OTP sent successfully' }
    } else {
      console.error('MSG91 Error:', data)
      return { success: false, message: data.message || 'Failed to send SMS' }
    }
  } catch (error) {
    console.error('MSG91 SMS Error:', error)
    return { success: false, message: 'Failed to send SMS' }
  }
}

// ================================
// Main SMS Handler
// ================================
async function sendSMS(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  // Try Twilio first
  if (process.env.TWILIO_ACCOUNT_SID) {
    const result = await sendSMSViaTwilio(phone, otp)
    if (result.success) return result
  }

  // Try MSG91 as fallback
  if (process.env.MSG91_AUTH_KEY) {
    const result = await sendSMSViaMSG91(phone, otp)
    if (result.success) return result
  }

  // Demo mode fallback
  if (OTP_CONFIG.demoMode) {
    console.log(`[DEMO SMS] OTP ${otp} for ${phone}`)
    return { 
      success: true, 
      message: `Demo Mode: Use OTP ${OTP_CONFIG.demoOTP}` 
    }
  }

  return { success: false, message: 'No SMS provider configured' }
}

// ================================
// Email Sending via Resend
// ================================
async function sendEmailViaResend(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL || 'SANGMAN <noreply@sangman.health>'

  if (!apiKey) {
    return { success: false, message: 'Resend not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `Your SANGMAN Verification Code: ${otp}`,
        html: generateEmailHTML(otp),
      }),
    })

    if (response.ok) {
      return { success: true, message: 'OTP sent successfully' }
    } else {
      const error = await response.json()
      console.error('Resend Error:', error)
      return { success: false, message: error.message || 'Failed to send email' }
    }
  } catch (error) {
    console.error('Resend Email Error:', error)
    return { success: false, message: 'Failed to send email' }
  }
}

// ================================
// Email Sending via SendGrid
// ================================
async function sendEmailViaSendGrid(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.FROM_EMAIL || 'noreply@sangman.health'

  if (!apiKey) {
    return { success: false, message: 'SendGrid not configured' }
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: fromEmail, name: 'SANGMAN' },
        subject: `Your SANGMAN Verification Code: ${otp}`,
        content: [{ type: 'text/html', value: generateEmailHTML(otp) }],
      }),
    })

    if (response.ok || response.status === 202) {
      return { success: true, message: 'OTP sent successfully' }
    } else {
      const error = await response.json()
      console.error('SendGrid Error:', error)
      return { success: false, message: 'Failed to send email' }
    }
  } catch (error) {
    console.error('SendGrid Email Error:', error)
    return { success: false, message: 'Failed to send email' }
  }
}

// ================================
// Main Email Handler
// ================================
async function sendEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  // Try Resend first
  if (process.env.RESEND_API_KEY) {
    const result = await sendEmailViaResend(email, otp)
    if (result.success) return result
  }

  // Try SendGrid as fallback
  if (process.env.SENDGRID_API_KEY) {
    const result = await sendEmailViaSendGrid(email, otp)
    if (result.success) return result
  }

  // Demo mode fallback
  if (OTP_CONFIG.demoMode) {
    console.log(`[DEMO EMAIL] OTP ${otp} for ${email}`)
    return { 
      success: true, 
      message: `Demo Mode: Use OTP ${OTP_CONFIG.demoOTP}` 
    }
  }

  return { success: false, message: 'No email provider configured' }
}

// ================================
// Email HTML Template
// ================================
function generateEmailHTML(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #0ea5e9; font-size: 32px; margin: 0; font-weight: bold;">SANGMAN</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Healthcare Made Simple</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 24px; padding: 48px; text-align: center;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 36px;">🔐</span>
          </div>
          
          <h2 style="color: #0f172a; font-size: 24px; margin: 0 0 16px; font-weight: 600;">Verification Code</h2>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 32px;">Enter this code to verify your account</p>
          
          <div style="background: white; border-radius: 16px; padding: 24px 32px; display: inline-block; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #0ea5e9; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
            This code expires in <strong style="color: #0f172a;">${OTP_CONFIG.expiryMinutes} minutes</strong>
          </p>
        </div>
        
        <!-- Security Warning -->
        <div style="margin-top: 24px; padding: 20px; background: #fef3c7; border-radius: 16px; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. SANGMAN staff will never ask for your OTP via phone, email, or message.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 8px;">This email was sent by SANGMAN Healthcare Platform</p>
          <p style="margin: 0;">If you didn't request this code, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// ================================
// Utility Functions
// ================================
function maskPhone(phone: string): string {
  if (phone.length < 6) return phone
  const start = phone.slice(0, 4)
  const end = phone.slice(-2)
  return `${start}****${end}`
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  if (local.length <= 2) return `${local}***@${domain}`
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`
}

// ================================
// Main API Handler
// ================================
export async function POST(request: NextRequest) {
  try {
    const body: SendOTPRequest = await request.json()
    const { channel, identifier, purpose } = body

    // Validate input
    if (!channel || !identifier || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (channel !== 'sms' && channel !== 'email') {
      return NextResponse.json(
        { success: false, message: 'Invalid channel. Use "sms" or "email"' },
        { status: 400 }
      )
    }

    // Validate identifier format
    if (channel === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(identifier)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email address' },
          { status: 400 }
        )
      }
    } else {
      // Phone should start with + and have 10-15 digits
      const phoneRegex = /^\+\d{10,15}$/
      if (!phoneRegex.test(identifier.replace(/\s/g, ''))) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number format' },
          { status: 400 }
        )
      }
    }

    // Rate limiting - prevent spam
    const storageKey = `${channel}:${identifier}`
    const existing = otpStorage.get(storageKey)
    const now = Date.now()
    
    if (existing) {
      const timeSinceCreation = now - (existing.expiresAt - OTP_CONFIG.expiryMinutes * 60 * 1000)
      if (timeSinceCreation < 30000) { // 30 seconds cooldown
        return NextResponse.json(
          { success: false, message: 'Please wait 30 seconds before requesting a new OTP' },
          { status: 429 }
        )
      }
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = now + OTP_CONFIG.expiryMinutes * 60 * 1000

    // Store OTP
    otpStorage.set(storageKey, { otp, expiresAt, attempts: 0 })

    // Send OTP
    let result: { success: boolean; message: string }
    if (channel === 'sms') {
      result = await sendSMS(identifier, otp)
    } else {
      result = await sendEmail(identifier, otp)
    }

    if (!result.success) {
      otpStorage.delete(storageKey)
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      )
    }

    // Build response
    const response: SendOTPResponse = {
      success: true,
      message: result.message,
      expiresAt,
    }

    // Include OTP in demo mode for testing
    if (OTP_CONFIG.demoMode) {
      response.otp = otp
      response.message = `OTP sent to ${channel === 'sms' ? maskPhone(identifier) : maskEmail(identifier)}. Demo Mode: Use ${OTP_CONFIG.demoOTP}`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Send OTP Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export storage for verify route
export { otpStorage, OTP_CONFIG }
