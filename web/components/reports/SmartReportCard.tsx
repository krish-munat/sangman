'use client'

import { useState } from 'react'
import { FileText, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus, ShoppingCart, Calendar, Download, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface LabValue {
  name: string
  value: number
  unit: string
  normalRange: { min: number; max: number }
  status: 'normal' | 'low' | 'high' | 'critical'
}

interface Recommendation {
  issue: string
  action: string
  priority: 'low' | 'medium' | 'high'
  actionType?: 'medicine' | 'lifestyle' | 'consultation'
  relatedProduct?: { name: string; id: string }
}

interface ReportAnalysis {
  summary: string
  values: LabValue[]
  recommendations: Recommendation[]
  overallHealth: 'excellent' | 'good' | 'attention_needed' | 'concerning'
  reportType?: string
  analyzedAt?: string
}

interface SmartReportCardProps {
  reportUrl?: string
  reportName?: string
  uploadDate?: string
  analysis?: ReportAnalysis | null
  onAnalyze?: () => void
  isAnalyzing?: boolean
}

const healthColors: Record<string, { bg: string; text: string; label: string }> = {
  excellent: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Excellent' },
  good: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Good' },
  attention_needed: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Needs Attention' },
  concerning: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Concerning' },
}

export default function SmartReportCard({
  reportUrl,
  reportName = 'Lab Report',
  uploadDate,
  analysis,
  onAnalyze,
  isAnalyzing = false,
}: SmartReportCardProps) {
  const router = useRouter()
  const [showAllValues, setShowAllValues] = useState(false)
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
        return <TrendingDown className="w-4 h-4 text-blue-500" />
      case 'high':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/30'
      case 'critical':
        return 'text-red-700 bg-red-100 dark:bg-red-900/50'
      default:
        return 'text-green-600 bg-green-50 dark:bg-green-900/30'
    }
  }

  const handleAddToCart = (product: { name: string; id: string }) => {
    router.push(`/patient/pharmacy?add=${product.id}`)
  }

  const handleBookConsultation = (specialty?: string) => {
    router.push(`/patient/discover${specialty ? `?specialty=${specialty}` : ''}`)
  }

  const displayedValues = showAllValues ? analysis?.values : analysis?.values?.slice(0, 4)
  const displayedRecommendations = showAllRecommendations ? analysis?.recommendations : analysis?.recommendations?.slice(0, 3)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{reportName}</h3>
              {uploadDate && (
                <p className="text-white/70 text-sm">Uploaded {uploadDate}</p>
              )}
            </div>
          </div>
          
          {analysis && (
            <div className={`px-3 py-1.5 rounded-full ${healthColors[analysis.overallHealth].bg}`}>
              <span className={`text-sm font-medium ${healthColors[analysis.overallHealth].text}`}>
                {healthColors[analysis.overallHealth].label}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Analyze Button */}
        {!analysis && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Report Analysis
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Get a human-readable summary of your lab results with actionable recommendations
            </p>
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white 
                rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 
                transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🤖</span>
                  Decode My Report
                </>
              )}
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Human Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 
              rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
                <span>🧠</span> Human Summary
              </h4>
              <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Lab Values */}
            {analysis.values && analysis.values.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>📊</span> Key Values
                </h4>
                <div className="space-y-2">
                  <AnimatePresence>
                    {displayedValues?.map((value, index) => (
                      <motion.div
                        key={value.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${getStatusColor(value.status)}`}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(value.status)}
                          <span className="font-medium">{value.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{value.value} {value.unit}</span>
                          <p className="text-xs opacity-70">
                            Normal: {value.normalRange.min}-{value.normalRange.max}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {analysis.values.length > 4 && (
                  <button
                    onClick={() => setShowAllValues(!showAllValues)}
                    className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {showAllValues ? (
                      <>Show Less <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show All ({analysis.values.length}) <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Action Items / Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>✅</span> Action Items
                </h4>
                <div className="space-y-3">
                  {displayedRecommendations?.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        rec.priority === 'high'
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                          : rec.priority === 'medium'
                            ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={`font-medium ${
                            rec.priority === 'high'
                              ? 'text-red-800 dark:text-red-300'
                              : rec.priority === 'medium'
                                ? 'text-amber-800 dark:text-amber-300'
                                : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {rec.issue}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {rec.action}
                          </p>
                        </div>
                        
                        {/* Action Button */}
                        {rec.actionType === 'medicine' && rec.relatedProduct && (
                          <button
                            onClick={() => handleAddToCart(rec.relatedProduct!)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white 
                              rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex-shrink-0"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        )}
                        {rec.actionType === 'consultation' && (
                          <button
                            onClick={() => handleBookConsultation()}
                            className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 text-white 
                              rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors flex-shrink-0"
                          >
                            <Calendar className="w-4 h-4" />
                            Book
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {analysis.recommendations.length > 3 && (
                  <button
                    onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                    className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {showAllRecommendations ? (
                      <>Show Less <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show All ({analysis.recommendations.length}) <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Download Original */}
            {reportUrl && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                    dark:hover:text-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download Original Report</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

