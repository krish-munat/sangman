import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (use AWS S3 + PostgreSQL in production)
const documents: Array<{
  id: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  category: string
  uploadedAt: string
}> = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string
    const category = formData.get('category') as string || 'medical_report'
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only PDF and image files are allowed' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }
    
    // In production: Upload to AWS S3
    // const s3Url = await uploadToS3(file)
    
    // For demo: Create a mock URL
    const mockUrl = `/uploads/${Date.now()}-${file.name}`
    
    const document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: mockUrl,
      category,
      uploadedAt: new Date().toISOString(),
    }
    
    documents.push(document)
    
    console.log(`[Upload] Document ${file.name} uploaded for user ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    })
  } catch (error) {
    console.error('[Upload Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const userDocs = documents.filter(d => d.userId === userId)
    
    return NextResponse.json({
      success: true,
      data: userDocs,
    })
  } catch (error) {
    console.error('[Upload GET Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

