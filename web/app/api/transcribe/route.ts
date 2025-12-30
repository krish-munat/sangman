import { NextResponse } from 'next/server'

// Whisper API transcription endpoint
// This serves as a fallback when Web Speech API fails
// For production, integrate with OpenAI Whisper or a self-hosted model

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('audio') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/m4a']
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      return NextResponse.json(
        { error: 'Invalid audio format. Supported: WAV, MP3, WebM, OGG, M4A' },
        { status: 400 }
      )
    }

    // Check file size (max 25MB for Whisper)
    const MAX_SIZE = 25 * 1024 * 1024 // 25MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // In production, send to OpenAI Whisper API or self-hosted model
    // Example with OpenAI:
    /*
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'hi', // Hindi - or let it auto-detect
      response_format: 'json',
    })
    
    return NextResponse.json({
      text: transcription.text,
      language: 'hi',
    })
    */

    // Mock response for development
    // Simulates Hindi/Hinglish transcription
    const mockResponses = [
      { text: 'दिल का डॉक्टर इंदौर में', language: 'hi' },
      { text: 'Cardiologist in Indore', language: 'en' },
      { text: 'pet dard ka doctor chahiye', language: 'hi' },
      { text: 'बच्चों का डॉक्टर नजदीक में', language: 'hi' },
      { text: 'skin specialist in Delhi', language: 'en' },
      { text: 'हड्डियों का डॉक्टर', language: 'hi' },
    ]

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Return random mock response
    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]

    return NextResponse.json({
      text: response.text,
      language: response.language,
      confidence: 0.95,
      processingTime: 500,
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'voice-transcription',
    supportedLanguages: ['hi', 'en', 'mr'],
    maxFileSize: '25MB',
    supportedFormats: ['wav', 'mp3', 'webm', 'ogg', 'm4a'],
  })
}
