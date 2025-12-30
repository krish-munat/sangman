import { NextRequest, NextResponse } from 'next/server'

// In-memory transaction storage (use PostgreSQL in production)
const transactions: Array<{
  id: string
  orderId: string
  appointmentId: string
  patientId: string
  doctorId: string
  amount: number
  status: 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED'
  paymentMethod: string
  razorpayOrderId?: string
  createdAt: string
  updatedAt: string
  releaseAt?: string
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, patientId, doctorId, amount, paymentMethod } = body
    
    if (!appointmentId || !patientId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // In production: Create Razorpay order
    // const razorpay = new Razorpay({ key_id, key_secret })
    // const order = await razorpay.orders.create({
    //   amount: amount * 100, // paise
    //   currency: 'INR',
    //   receipt: `appt_${appointmentId}`,
    // })
    
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const mockRazorpayOrderId = `rzp_${Date.now()}`
    
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      orderId,
      appointmentId,
      patientId,
      doctorId: doctorId || 'doctor-1',
      amount,
      status: 'HELD' as const,
      paymentMethod: paymentMethod || 'upi',
      razorpayOrderId: mockRazorpayOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    transactions.push(transaction)
    
    console.log(`[Payment] Initiated ₹${amount} for appointment ${appointmentId} - Status: HELD in escrow`)
    
    return NextResponse.json({
      success: true,
      message: 'Payment initiated and held in escrow',
      data: {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        razorpayOrderId: mockRazorpayOrderId,
        amount,
        status: 'HELD',
        escrowMessage: 'Your payment is securely held in Sangman Vault until your consultation is complete.',
      },
    })
  } catch (error) {
    console.error('[Payment Initiate Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    const appointmentId = searchParams.get('appointmentId')
    
    let transaction = null
    
    if (transactionId) {
      transaction = transactions.find(t => t.id === transactionId)
    } else if (appointmentId) {
      transaction = transactions.find(t => t.appointmentId === appointmentId)
    }
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error('[Payment GET Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// Export for use by release endpoint
export { transactions }

