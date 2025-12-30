import { NextRequest, NextResponse } from 'next/server'

interface LabValue {
  name: string
  value: number
  unit: string
  normalRange: { min: number; max: number }
  status: 'normal' | 'low' | 'high' | 'critical'
}

interface ReportAnalysis {
  summary: string
  values: LabValue[]
  recommendations: Array<{
    issue: string
    action: string
    priority: 'low' | 'medium' | 'high'
    actionType?: 'medicine' | 'lifestyle' | 'consultation'
    relatedProduct?: { name: string; id: string }
  }>
  overallHealth: 'excellent' | 'good' | 'attention_needed' | 'concerning'
}

// Mock lab report analysis
function analyzeLabReport(reportType: string): ReportAnalysis {
  const analyses: Record<string, ReportAnalysis> = {
    'cbc': {
      summary: 'Your Complete Blood Count shows mostly normal values with slightly low Hemoglobin levels, indicating mild anemia. Vitamin supplementation is recommended.',
      values: [
        { name: 'Hemoglobin', value: 11.2, unit: 'g/dL', normalRange: { min: 12, max: 16 }, status: 'low' },
        { name: 'WBC Count', value: 7500, unit: '/µL', normalRange: { min: 4000, max: 11000 }, status: 'normal' },
        { name: 'Platelet Count', value: 250000, unit: '/µL', normalRange: { min: 150000, max: 400000 }, status: 'normal' },
        { name: 'RBC Count', value: 4.2, unit: 'million/µL', normalRange: { min: 4.5, max: 5.5 }, status: 'low' },
      ],
      recommendations: [
        { issue: 'Low Hemoglobin', action: 'Consider iron-rich foods and iron supplements', priority: 'high', actionType: 'medicine', relatedProduct: { name: 'Iron + Folic Acid', id: 'iron-folic' } },
        { issue: 'Mild Anemia', action: 'Eat leafy greens, beetroot, and pomegranate', priority: 'medium', actionType: 'lifestyle' },
        { issue: 'Follow-up', action: 'Repeat CBC after 3 months', priority: 'medium', actionType: 'consultation' },
      ],
      overallHealth: 'attention_needed',
    },
    'lipid': {
      summary: 'Your Lipid Profile shows elevated LDL cholesterol and slightly low HDL. Lifestyle modifications and dietary changes are recommended to improve cardiovascular health.',
      values: [
        { name: 'Total Cholesterol', value: 220, unit: 'mg/dL', normalRange: { min: 0, max: 200 }, status: 'high' },
        { name: 'LDL Cholesterol', value: 145, unit: 'mg/dL', normalRange: { min: 0, max: 100 }, status: 'high' },
        { name: 'HDL Cholesterol', value: 38, unit: 'mg/dL', normalRange: { min: 40, max: 60 }, status: 'low' },
        { name: 'Triglycerides', value: 160, unit: 'mg/dL', normalRange: { min: 0, max: 150 }, status: 'high' },
      ],
      recommendations: [
        { issue: 'High LDL', action: 'Reduce saturated fats, increase fiber intake', priority: 'high', actionType: 'lifestyle' },
        { issue: 'Low HDL', action: 'Regular exercise (30 mins daily), include healthy fats', priority: 'high', actionType: 'lifestyle' },
        { issue: 'Omega-3', action: 'Consider Omega-3 supplements', priority: 'medium', actionType: 'medicine', relatedProduct: { name: 'Omega-3 Fish Oil', id: 'omega3' } },
        { issue: 'Cardiology Consult', action: 'Consult a cardiologist if family history of heart disease', priority: 'medium', actionType: 'consultation' },
      ],
      overallHealth: 'attention_needed',
    },
    'vitamin': {
      summary: 'Your Vitamin Panel shows significant Vitamin D deficiency and borderline low Vitamin B12. This can cause fatigue, weakness, and bone health issues.',
      values: [
        { name: 'Vitamin D (25-OH)', value: 15, unit: 'ng/mL', normalRange: { min: 30, max: 100 }, status: 'low' },
        { name: 'Vitamin B12', value: 220, unit: 'pg/mL', normalRange: { min: 200, max: 900 }, status: 'low' },
        { name: 'Folate', value: 8.5, unit: 'ng/mL', normalRange: { min: 3, max: 17 }, status: 'normal' },
        { name: 'Iron', value: 65, unit: 'µg/dL', normalRange: { min: 60, max: 170 }, status: 'normal' },
      ],
      recommendations: [
        { issue: 'Vitamin D Deficiency', action: '15-20 mins morning sunlight daily, Vitamin D3 60K weekly', priority: 'high', actionType: 'medicine', relatedProduct: { name: 'Vitamin D3 60000 IU', id: 'vitamin-d3' } },
        { issue: 'Low B12', action: 'Include eggs, dairy, fortified cereals or B12 supplements', priority: 'medium', actionType: 'medicine', relatedProduct: { name: 'Vitamin B12 Methylcobalamin', id: 'vitamin-b12' } },
        { issue: 'Lifestyle', action: 'Regular outdoor physical activity', priority: 'low', actionType: 'lifestyle' },
      ],
      overallHealth: 'attention_needed',
    },
    'thyroid': {
      summary: 'Your Thyroid Function Test shows subclinical hypothyroidism with elevated TSH. This may cause fatigue, weight gain, and cold sensitivity.',
      values: [
        { name: 'TSH', value: 6.5, unit: 'mIU/L', normalRange: { min: 0.4, max: 4.0 }, status: 'high' },
        { name: 'T3', value: 95, unit: 'ng/dL', normalRange: { min: 80, max: 200 }, status: 'normal' },
        { name: 'T4', value: 7.0, unit: 'µg/dL', normalRange: { min: 5.0, max: 12.0 }, status: 'normal' },
      ],
      recommendations: [
        { issue: 'Elevated TSH', action: 'Consult an Endocrinologist for evaluation', priority: 'high', actionType: 'consultation' },
        { issue: 'Diet', action: 'Limit goitrogenic foods (cabbage, broccoli) if raw', priority: 'medium', actionType: 'lifestyle' },
        { issue: 'Selenium', action: 'Consider selenium-rich foods (Brazil nuts)', priority: 'low', actionType: 'lifestyle' },
      ],
      overallHealth: 'attention_needed',
    },
    'default': {
      summary: 'Your lab report has been analyzed. Most values are within normal range. Continue maintaining a healthy lifestyle.',
      values: [
        { name: 'Blood Sugar (Fasting)', value: 95, unit: 'mg/dL', normalRange: { min: 70, max: 100 }, status: 'normal' },
        { name: 'Creatinine', value: 0.9, unit: 'mg/dL', normalRange: { min: 0.7, max: 1.3 }, status: 'normal' },
      ],
      recommendations: [
        { issue: 'General Health', action: 'Continue balanced diet and regular exercise', priority: 'low', actionType: 'lifestyle' },
        { issue: 'Annual Checkup', action: 'Schedule annual health checkup', priority: 'low', actionType: 'consultation' },
      ],
      overallHealth: 'good',
    },
  }
  
  return analyses[reportType] || analyses['default']
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportUrl, reportType, reportText } = body
    
    if (!reportUrl && !reportText) {
      return NextResponse.json(
        { success: false, message: 'Report URL or text is required' },
        { status: 400 }
      )
    }
    
    // In production: Extract text from PDF
    // const pdfText = await extractTextFromPDF(reportUrl)
    // Then send to AI for analysis
    
    // Determine report type from URL or text
    let detectedType = reportType || 'default'
    const searchText = (reportUrl || reportText || '').toLowerCase()
    
    if (searchText.includes('cbc') || searchText.includes('blood count') || searchText.includes('hemoglobin')) {
      detectedType = 'cbc'
    } else if (searchText.includes('lipid') || searchText.includes('cholesterol')) {
      detectedType = 'lipid'
    } else if (searchText.includes('vitamin') || searchText.includes('d3') || searchText.includes('b12')) {
      detectedType = 'vitamin'
    } else if (searchText.includes('thyroid') || searchText.includes('tsh') || searchText.includes('t3') || searchText.includes('t4')) {
      detectedType = 'thyroid'
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const analysis = analyzeLabReport(detectedType)
    
    console.log(`[Report Analysis] Analyzed ${detectedType} report -> ${analysis.overallHealth}`)
    
    return NextResponse.json({
      success: true,
      message: 'Report analyzed successfully',
      data: {
        ...analysis,
        reportType: detectedType,
        analyzedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[Report Analysis Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to analyze report' },
      { status: 500 }
    )
  }
}

