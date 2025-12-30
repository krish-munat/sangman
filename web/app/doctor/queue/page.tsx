'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Clock, CheckCircle, Video, FileText, AlertTriangle, 
  Phone, MessageSquare, ChevronRight, Activity, Calendar,
  Stethoscope, Pill, ClipboardList, User, MoreVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  status: 'waiting' | 'in-consult' | 'done' | 'no-show'
  appointmentTime: string
  appointmentType: 'video' | 'in-person'
  chiefComplaint: string
  severity: 'mild' | 'moderate' | 'severe'
  triageSummary?: {
    symptoms: string[]
    duration: string
    medications: string[]
    allergies: string[]
  }
  medicalHistory?: string[]
  documents?: { name: string; type: string; url: string }[]
  waitTime?: number // minutes
}

// Mock data for today's queue
const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Rahul Sharma',
    age: 35,
    gender: 'Male',
    phone: '+91 98765 43210',
    status: 'waiting',
    appointmentTime: '10:00 AM',
    appointmentType: 'video',
    chiefComplaint: 'Chest discomfort',
    severity: 'moderate',
    triageSummary: {
      symptoms: ['Chest tightness', 'Shortness of breath', 'Fatigue'],
      duration: '3 days',
      medications: ['Aspirin 75mg'],
      allergies: ['Penicillin'],
    },
    medicalHistory: ['Hypertension (2019)', 'Pre-diabetes'],
    documents: [
      { name: 'ECG Report', type: 'pdf', url: '/docs/ecg.pdf' },
      { name: 'Blood Test', type: 'pdf', url: '/docs/blood.pdf' },
    ],
    waitTime: 15,
  },
  {
    id: 'p2',
    name: 'Priya Patel',
    age: 28,
    gender: 'Female',
    phone: '+91 98765 12345',
    status: 'in-consult',
    appointmentTime: '10:30 AM',
    appointmentType: 'video',
    chiefComplaint: 'Migraine',
    severity: 'severe',
    triageSummary: {
      symptoms: ['Severe headache', 'Nausea', 'Light sensitivity'],
      duration: '2 days',
      medications: ['Paracetamol'],
      allergies: [],
    },
    medicalHistory: ['Chronic Migraine'],
  },
  {
    id: 'p3',
    name: 'Amit Kumar',
    age: 45,
    gender: 'Male',
    phone: '+91 91234 56789',
    status: 'waiting',
    appointmentTime: '11:00 AM',
    appointmentType: 'in-person',
    chiefComplaint: 'Back pain',
    severity: 'moderate',
    triageSummary: {
      symptoms: ['Lower back pain', 'Stiffness'],
      duration: '1 week',
      medications: [],
      allergies: ['Sulfa drugs'],
    },
    waitTime: 5,
  },
  {
    id: 'p4',
    name: 'Sunita Verma',
    age: 52,
    gender: 'Female',
    phone: '+91 99887 76655',
    status: 'done',
    appointmentTime: '09:30 AM',
    appointmentType: 'video',
    chiefComplaint: 'Diabetes follow-up',
    severity: 'mild',
    triageSummary: {
      symptoms: ['Routine checkup'],
      duration: 'N/A',
      medications: ['Metformin 500mg', 'Glimepiride 1mg'],
      allergies: [],
    },
    medicalHistory: ['Type 2 Diabetes (2015)', 'Hypothyroidism'],
  },
  {
    id: 'p5',
    name: 'Vikram Singh',
    age: 60,
    gender: 'Male',
    phone: '+91 88776 65544',
    status: 'waiting',
    appointmentTime: '11:30 AM',
    appointmentType: 'video',
    chiefComplaint: 'Breathing difficulty',
    severity: 'severe',
    triageSummary: {
      symptoms: ['Shortness of breath', 'Wheezing', 'Cough'],
      duration: '5 days',
      medications: ['Inhaler'],
      allergies: [],
    },
    medicalHistory: ['COPD', 'Ex-smoker'],
    waitTime: 0,
  },
]

const statusConfig = {
  waiting: { color: 'bg-amber-100 text-amber-700', label: 'Waiting', icon: Clock },
  'in-consult': { color: 'bg-blue-100 text-blue-700', label: 'In Consultation', icon: Video },
  done: { color: 'bg-green-100 text-green-700', label: 'Done', icon: CheckCircle },
  'no-show': { color: 'bg-gray-100 text-gray-500', label: 'No Show', icon: User },
}

const severityConfig = {
  mild: { color: 'bg-green-100 text-green-700', label: 'Mild' },
  moderate: { color: 'bg-amber-100 text-amber-700', label: 'Moderate' },
  severe: { color: 'bg-red-100 text-red-700', label: 'Severe' },
}

export default function DoctorQueuePage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [filter, setFilter] = useState<'all' | 'waiting' | 'in-consult' | 'done'>('all')

  // Stats
  const stats = {
    total: patients.length,
    waiting: patients.filter(p => p.status === 'waiting').length,
    inConsult: patients.filter(p => p.status === 'in-consult').length,
    done: patients.filter(p => p.status === 'done').length,
  }

  const filteredPatients = filter === 'all' 
    ? patients 
    : patients.filter(p => p.status === filter)

  const handleStartConsultation = (patient: Patient) => {
    setPatients(prev => prev.map(p => 
      p.id === patient.id ? { ...p, status: 'in-consult' as const } : p
    ))
    setSelectedPatient({ ...patient, status: 'in-consult' })
  }

  const handleEndConsultation = (patientId: string) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, status: 'done' as const } : p
    ))
    setSelectedPatient(null)
  }

  useEffect(() => {
    // Select first waiting patient by default
    const firstWaiting = patients.find(p => p.status === 'waiting')
    if (firstWaiting && !selectedPatient) {
      setSelectedPatient(firstWaiting)
    }
  }, [patients, selectedPatient])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Queue</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <p className="text-xs text-amber-600 dark:text-amber-400">Waiting</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{stats.waiting}</p>
            </div>
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">In Consult</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.inConsult}</p>
            </div>
            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{stats.done}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-100px)]">
        {/* Left Sidebar - Patient List */}
        <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {/* Filter Tabs */}
          <div className="flex p-2 gap-1 bg-gray-100 dark:bg-gray-700 m-4 rounded-lg">
            {(['all', 'waiting', 'in-consult', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'in-consult' ? 'Active' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Patient Cards */}
          <div className="px-4 space-y-2 pb-4">
            {filteredPatients.map((patient) => {
              const StatusIcon = statusConfig[patient.status].icon
              return (
                <motion.button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedPatient?.id === patient.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                      <p className="text-sm text-gray-500">{patient.age}y, {patient.gender}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[patient.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[patient.status].label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{patient.appointmentTime}</span>
                    {patient.appointmentType === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityConfig[patient.severity].color}`}>
                      {patient.chiefComplaint}
                    </span>
                    {patient.status === 'waiting' && patient.waitTime !== undefined && (
                      <span className="text-xs text-amber-600">
                        Waiting {patient.waitTime}m
                      </span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </aside>

        {/* Main Content - Patient Details */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div
                key={selectedPatient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Patient Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {selectedPatient.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedPatient.name}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                          {selectedPatient.age} years, {selectedPatient.gender} • {selectedPatient.phone}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedPatient.status].color}`}>
                            {statusConfig[selectedPatient.status].label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityConfig[selectedPatient.severity].color}`}>
                            {severityConfig[selectedPatient.severity].label} Severity
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {selectedPatient.status === 'waiting' && (
                        <button
                          onClick={() => handleStartConsultation(selectedPatient)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
                            rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all
                            flex items-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Start Consultation
                        </button>
                      )}
                      {selectedPatient.status === 'in-consult' && (
                        <>
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium 
                              hover:bg-blue-600 transition-all flex items-center gap-2"
                          >
                            <Video className="w-4 h-4" />
                            Join Video Call
                          </button>
                          <button
                            onClick={() => handleEndConsultation(selectedPatient.id)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                              rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                          >
                            End Consultation
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Triage Summary */}
                {selectedPatient.triageSummary && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 
                    rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" />
                      AI Triage Summary (Pre-Consultation)
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Chief Complaint</h4>
                        <p className="text-indigo-900 dark:text-indigo-100 font-medium">{selectedPatient.chiefComplaint}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Duration</h4>
                        <p className="text-indigo-900 dark:text-indigo-100">{selectedPatient.triageSummary.duration}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Symptoms</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedPatient.triageSummary.symptoms.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded text-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Current Medications</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedPatient.triageSummary.medications.length > 0 ? (
                            selectedPatient.triageSummary.medications.map((m, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded text-sm flex items-center gap-1">
                                <Pill className="w-3 h-3" /> {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-indigo-600 dark:text-indigo-400">None reported</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedPatient.triageSummary.allergies.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Allergies:</span>
                          {selectedPatient.triageSummary.allergies.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical History & Documents */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Medical History */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-sky-500" />
                      Medical History
                    </h3>
                    {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPatient.medicalHistory.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 bg-sky-500 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No medical history on record</p>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      Documents
                    </h3>
                    {selectedPatient.documents && selectedPatient.documents.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPatient.documents.map((doc, i) => (
                          <li key={i}>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg 
                                hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <FileText className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">{doc.name}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No documents uploaded</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                      rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Pill className="w-4 h-4" />
                      Write Prescription
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                      rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Activity className="w-4 h-4" />
                      Order Lab Tests
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                      rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Calendar className="w-4 h-4" />
                      Schedule Follow-up
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                      rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a patient to view details</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

