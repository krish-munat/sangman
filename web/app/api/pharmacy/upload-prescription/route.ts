import { NextRequest, NextResponse } from 'next/server'

interface ExtractedMedicine {
  name: string
  dosage: string
  quantity: string
  frequency: string
  duration: string
}

// Mock OCR extraction (in production, use GPT-4o or Gemini Pro Vision)
function extractMedicinesFromImage(fileName: string): ExtractedMedicine[] {
  // Simulated extraction based on common prescriptions
  const mockExtractions: Record<string, ExtractedMedicine[]> = {
    'fever': [
      { name: 'Dolo 650mg', dosage: '650mg', quantity: '10 tablets', frequency: 'Twice daily', duration: '5 days' },
      { name: 'Crocin Advance', dosage: '500mg', quantity: '10 tablets', frequency: 'As needed', duration: '3 days' },
    ],
    'cold': [
      { name: 'Cetirizine', dosage: '10mg', quantity: '10 tablets', frequency: 'Once daily', duration: '5 days' },
      { name: 'Sinarest', dosage: '-', quantity: '10 tablets', frequency: 'Twice daily', duration: '3 days' },
      { name: 'Vitamin C', dosage: '500mg', quantity: '30 tablets', frequency: 'Once daily', duration: '1 month' },
    ],
    'gastric': [
      { name: 'Omeprazole', dosage: '20mg', quantity: '14 capsules', frequency: 'Before breakfast', duration: '2 weeks' },
      { name: 'Antacid Gel', dosage: '10ml', quantity: '1 bottle', frequency: 'After meals', duration: '1 week' },
    ],
    'default': [
      { name: 'Paracetamol', dosage: '500mg', quantity: '10 tablets', frequency: 'Three times daily', duration: '3 days' },
      { name: 'Vitamin B Complex', dosage: '-', quantity: '30 tablets', frequency: 'Once daily', duration: '1 month' },
    ],
  }
  
  // Determine type based on filename or random
  const lowerName = fileName.toLowerCase()
  if (lowerName.includes('fever') || lowerName.includes('bukhar')) {
    return mockExtractions['fever']
  } else if (lowerName.includes('cold') || lowerName.includes('cough')) {
    return mockExtractions['cold']
  } else if (lowerName.includes('gastric') || lowerName.includes('stomach')) {
    return mockExtractions['gastric']
  }
  
  return mockExtractions['default']
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('prescription') as File | null
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No prescription image provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only image or PDF files are allowed' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }
    
    // In production: Use Vision LLM for OCR
    // const base64Image = await fileToBase64(file)
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o',
    //   messages: [
    //     {
    //       role: 'user',
    //       content: [
    //         { type: 'text', text: 'Extract all medicine names, dosages, and quantities from this prescription image. Return as JSON array.' },
    //         { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64Image}` } },
    //       ],
    //     },
    //   ],
    // })
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Extract medicines (mock)
    const extractedMedicines = extractMedicinesFromImage(file.name)
    
    console.log(`[Prescription OCR] Extracted ${extractedMedicines.length} medicines from ${file.name}`)
    
    return NextResponse.json({
      success: true,
      message: 'Prescription processed successfully',
      data: {
        medicines: extractedMedicines,
        prescriptionId: `rx_${Date.now()}`,
        processedAt: new Date().toISOString(),
        confidence: 0.92, // Mock confidence score
      },
    })
  } catch (error) {
    console.error('[Prescription OCR Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process prescription' },
      { status: 500 }
    )
  }
}

