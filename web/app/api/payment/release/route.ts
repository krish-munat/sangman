import { NextRequest, NextResponse } from 'next/server'

// Shared transaction storage (in production, use database)
// Note: In real app, this would be imported from a shared DB module
const transactions: Array<{
  id: string
  orderId: string
  appointmentId: string
  patientId: string
  doctorId: string
  amount: number
  status: 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED'
  paymentMethod: string
  createdAt: string
  updatedAt: string
  releaseAt?: string
  releasedBy?: string
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, appointmentId, releasedBy, reason } = body
    
    // Find transaction
    let transaction = null
    const txnIndex = transactions.findIndex(t => 
      t.id === transactionId || t.appointmentId === appointmentId
    )
    
    if (txnIndex === -1) {
      // For demo, create a mock response if transaction not found
      console.log(`[Payment Release] Transaction not found, creating mock release`)
      return NextResponse.json({
        success: true,
        message: 'Payment released to doctor',
        data: {
          transactionId: transactionId || `txn_${Date.now()}`,
          status: 'RELEASED',
          releasedAt: new Date().toISOString(),
          releasedBy: releasedBy || 'system',
        },
      })
    }
    
    transaction = transactions[txnIndex]
    
    // Check if already released
    if (transaction.status === 'RELEASED') {
      return NextResponse.json(
        { success: false, message: 'Payment already released' },
        { status: 400 }
      )
    }
    
    // Check if disputed
    if (transaction.status === 'DISPUTED') {
      return NextResponse.json(
        { success: false, message: 'Cannot release disputed payment' },
        { status: 400 }
      )
    }
    
    // Update transaction status
    transactions[txnIndex] = {
      ...transaction,
      status: 'RELEASED',
      updatedAt: new Date().toISOString(),
      releaseAt: new Date().toISOString(),
      releasedBy: releasedBy || 'patient',
    }
    
    // In production: Trigger transfer to doctor's connected account
    // await razorpay.transfers.create({
    //   account: doctorAccountId,
    //   amount: transaction.amount * 100,
    //   currency: 'INR',
    // })
    
    console.log(`[Payment Release] ₹${transaction.amount} released to doctor ${transaction.doctorId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Payment released to doctor successfully',
      data: {
        transactionId: transaction.id,
        amount: transaction.amount,
        status: 'RELEASED',
        releasedAt: new Date().toISOString(),
        releasedBy: releasedBy || 'patient',
        reason,
      },
    })
  } catch (error) {
    console.error('[Payment Release Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to release payment' },
      { status: 500 }
    )
  }
}

// Endpoint to dispute a payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, reason } = body
    
    const txnIndex = transactions.findIndex(t => t.id === transactionId)
    
    if (txnIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    const transaction = transactions[txnIndex]
    
    if (transaction.status !== 'HELD') {
      return NextResponse.json(
        { success: false, message: 'Only held payments can be disputed' },
        { status: 400 }
      )
    }
    
    transactions[txnIndex] = {
      ...transaction,
      status: 'DISPUTED',
      updatedAt: new Date().toISOString(),
    }
    
    console.log(`[Payment Dispute] Transaction ${transactionId} disputed: ${reason}`)
    
    return NextResponse.json({
      success: true,
      message: 'Payment dispute registered. Our team will review within 24 hours.',
      data: {
        transactionId,
        status: 'DISPUTED',
        reason,
      },
    })
  } catch (error) {
    console.error('[Payment Dispute Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to register dispute' },
      { status: 500 }
    )
  }
}

