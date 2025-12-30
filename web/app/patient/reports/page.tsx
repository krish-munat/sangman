'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import SmartReportCard from '@/components/reports/SmartReportCard'
import toast from 'react-hot-toast'

interface Report {
  id: string
  name: string
  type: string
  url: string
  uploadDate: string
  analysis: any | null
}

// Mock reports
const initialReports: Report[] = [
  {
    id: '1',
    name: 'Complete Blood Count (CBC)',
    type: 'cbc',
    url: '/reports/cbc-report.pdf',
    uploadDate: '2024-01-15',
    analysis: null,
  },
  {
    id: '2',
    name: 'Lipid Profile',
    type: 'lipid',
    url: '/reports/lipid-report.pdf',
    uploadDate: '2024-01-10',
    analysis: null,
  },
  {
    id: '3',
    name: 'Vitamin Panel',
    type: 'vitamin',
    url: '/reports/vitamin-report.pdf',
    uploadDate: '2024-01-05',
    analysis: null,
  },
]

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newReport: Report = {
      id: `report-${Date.now()}`,
      name: file.name.replace(/\.(pdf|jpg|png)$/i, ''),
      type: 'default',
      url: URL.createObjectURL(file),
      uploadDate: new Date().toISOString().split('T')[0],
      analysis: null,
    }

    setReports(prev => [newReport, ...prev])
    setIsUploading(false)
    toast.success('Report uploaded successfully!')
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAnalyze = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return

    setAnalyzingId(reportId)

    try {
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportUrl: report.url,
          reportType: report.type,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, analysis: result.data } : r
        ))
        toast.success('Report analyzed successfully!')
      } else {
        toast.error('Failed to analyze report')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze report')
    } finally {
      setAnalyzingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Health Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and analyze your lab reports with AI
            </p>
          </div>
          
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 
              text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload Report'}</span>
            </div>
          </label>
        </div>

        {/* AI Features Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">AI-Powered Report Analysis</h3>
              <p className="text-white/80">
                Our AI analyzes your lab reports and provides easy-to-understand summaries with actionable recommendations. 
                No more confusion over medical jargon!
              </p>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="space-y-6">
          {reports.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Reports Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload your first lab report to get started with AI analysis
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 
                text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-5 h-5" />
                <span>Upload Report</span>
              </label>
            </div>
          ) : (
            reports.map((report) => (
              <SmartReportCard
                key={report.id}
                reportUrl={report.url}
                reportName={report.name}
                uploadDate={report.uploadDate}
                analysis={report.analysis}
                onAnalyze={() => handleAnalyze(report.id)}
                isAnalyzing={analyzingId === report.id}
              />
            ))
          )}
        </div>

        {/* Upload Tips */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📋 Tips for Best Results</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Clear Scans</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload high-quality scans or photos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">PDF Preferred</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Digital PDFs give best results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Complete Reports</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Include all pages of your report</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

