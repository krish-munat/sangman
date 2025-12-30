import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface TriageSummary {
  chiefComplaint: string
  duration: string
  severity: 'mild' | 'moderate' | 'severe'
  associatedSymptoms: string[]
  relevantHistory: string[]
  recommendations: string[]
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency'
  suggestedSpecialty: string
  doctorBrief: string // SOAP format
}

// Extract clinical entities from chat messages
function analyzeSymptoms(messages: ChatMessage[]): TriageSummary {
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase())
  const fullText = userMessages.join(' ')
  
  // Symptom detection patterns
  const symptomPatterns: Record<string, { severity: string; specialty: string; urgency: string }> = {
    'chest pain': { severity: 'severe', specialty: 'Cardiologist', urgency: 'urgent' },
    'heart pain': { severity: 'severe', specialty: 'Cardiologist', urgency: 'urgent' },
    'seene me dard': { severity: 'severe', specialty: 'Cardiologist', urgency: 'urgent' },
    'breathing difficulty': { severity: 'severe', specialty: 'Pulmonologist', urgency: 'urgent' },
    'saans': { severity: 'moderate', specialty: 'Pulmonologist', urgency: 'soon' },
    'headache': { severity: 'moderate', specialty: 'Neurologist', urgency: 'routine' },
    'sir me dard': { severity: 'moderate', specialty: 'Neurologist', urgency: 'routine' },
    'stomach pain': { severity: 'moderate', specialty: 'Gastroenterologist', urgency: 'routine' },
    'pet me dard': { severity: 'moderate', specialty: 'Gastroenterologist', urgency: 'routine' },
    'fever': { severity: 'moderate', specialty: 'General Physician', urgency: 'routine' },
    'bukhar': { severity: 'moderate', specialty: 'General Physician', urgency: 'routine' },
    'skin rash': { severity: 'mild', specialty: 'Dermatologist', urgency: 'routine' },
    'back pain': { severity: 'moderate', specialty: 'Orthopedic', urgency: 'routine' },
    'tooth pain': { severity: 'moderate', specialty: 'Dentist', urgency: 'soon' },
    'eye pain': { severity: 'moderate', specialty: 'Ophthalmologist', urgency: 'soon' },
    'anxiety': { severity: 'moderate', specialty: 'Psychiatrist', urgency: 'routine' },
    'depression': { severity: 'moderate', specialty: 'Psychiatrist', urgency: 'soon' },
    'child sick': { severity: 'moderate', specialty: 'Pediatrician', urgency: 'soon' },
    'pregnancy': { severity: 'moderate', specialty: 'Gynecologist', urgency: 'routine' },
  }
  
  // Find matching symptoms
  let detectedSymptom = 'General discomfort'
  let severity: 'mild' | 'moderate' | 'severe' = 'mild'
  let specialty = 'General Physician'
  let urgency: 'routine' | 'soon' | 'urgent' | 'emergency' = 'routine'
  
  for (const [symptom, data] of Object.entries(symptomPatterns)) {
    if (fullText.includes(symptom)) {
      detectedSymptom = symptom
      severity = data.severity as 'mild' | 'moderate' | 'severe'
      specialty = data.specialty
      urgency = data.urgency as 'routine' | 'soon' | 'urgent' | 'emergency'
      break
    }
  }
  
  // Extract duration from messages
  let duration = 'Not specified'
  const durationPatterns = [
    /(\d+)\s*(day|days|din)/i,
    /(\d+)\s*(week|weeks|hafta)/i,
    /(\d+)\s*(month|months|mahina)/i,
    /(\d+)\s*(hour|hours|ghante)/i,
    /(since|from)\s+(yesterday|kal)/i,
    /(since|from)\s+(morning|subah)/i,
  ]
  
  for (const pattern of durationPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      duration = match[0]
      break
    }
  }
  
  // Generate SOAP note (Doctor Brief)
  const doctorBrief = `
**SUBJECTIVE:**
Chief Complaint: ${detectedSymptom}
Duration: ${duration}
Patient reported symptoms via AI triage chat.

**OBJECTIVE:**
- Vitals: To be measured during consultation
- General appearance: To be assessed

**ASSESSMENT:**
- Primary concern: ${detectedSymptom}
- Severity: ${severity.toUpperCase()}
- Urgency Level: ${urgency.toUpperCase()}

**PLAN:**
1. Detailed physical examination required
2. May need diagnostic tests based on examination
3. Treatment plan to be determined after consultation
`.trim()
  
  return {
    chiefComplaint: detectedSymptom.charAt(0).toUpperCase() + detectedSymptom.slice(1),
    duration,
    severity,
    associatedSymptoms: [],
    relevantHistory: [],
    recommendations: [
      `Consult a ${specialty}`,
      'Keep track of symptoms',
      'Stay hydrated',
    ],
    urgency,
    suggestedSpecialty: specialty,
    doctorBrief,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body as { messages: ChatMessage[] }
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Chat messages are required' },
        { status: 400 }
      )
    }
    
    // In production: Send to OpenAI/Gemini for better analysis
    // const aiResponse = await openai.chat.completions.create({
    //   model: 'gpt-4',
    //   messages: [
    //     { role: 'system', content: 'Extract clinical entities...' },
    //     ...messages,
    //   ],
    // })
    
    // For demo: Use pattern matching
    const summary = analyzeSymptoms(messages)
    
    console.log(`[Triage] Analyzed ${messages.length} messages -> ${summary.chiefComplaint} (${summary.severity})`)
    
    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error('[Triage Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to analyze symptoms' },
      { status: 500 }
    )
  }
}

