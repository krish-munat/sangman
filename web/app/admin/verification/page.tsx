'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react'
import type { Doctor } from '../../../../shared/types'
import toast from 'react-hot-toast'

export default function VerificationPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    // Mock data - works without backend
    const mockDoctors: Doctor[] = [
      {
        id: '1',
        email: 'dr.sharma@example.com',
        phone: '+919876543210',
        role: 'doctor',
        name: 'Dr. Rajesh Sharma',
        specializations: ['Cardiology'],
        experience: 15,
        qualifications: ['MBBS', 'MD'],
        clinicAddress: {
          street: '123 Medical Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          coordinates: { latitude: 28.6139, longitude: 77.2090 },
        },
        consultationFee: 500,
        availability: { days: {}, timezone: 'Asia/Kolkata' },
        emergencyAvailable: true,
        verified: false,
        verificationStatus: 'pending',
        rating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    setDoctors(mockDoctors)
  }, [])

  const filteredDoctors = doctors.filter((doctor) => {
    if (filter === 'all') return true
    return doctor.verificationStatus === filter
  })

  const handleApprove = async (doctorId: string) => {
    try {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId
            ? { ...doc, verificationStatus: 'approved' as const, verified: true }
            : doc
        )
      )
      toast.success('Doctor verified successfully')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to approve doctor'
      toast.error(errorMessage)
    }
  }

  const handleReject = async (doctorId: string) => {
    try {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId ? { ...doc, verificationStatus: 'rejected' as const } : doc
        )
      )
      toast.success('Verification rejected')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to reject verification'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Doctor Verification
        </h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Doctors List */}
        {filteredDoctors.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">No doctors found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      {doctor.name}
                    </h3>
                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <p>Email: {doctor.email}</p>
                      <p>Phone: {doctor.phone}</p>
                      <p>Specializations: {doctor.specializations.join(', ')}</p>
                      <p>Experience: {doctor.experience} years</p>
                      <p>Qualifications: {doctor.qualifications.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doctor.verificationStatus === 'pending' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {doctor.verificationStatus === 'approved' && (
                      <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                    {doctor.verificationStatus === 'rejected' && (
                      <span className="px-2 py-1 bg-emergency-100 text-emergency-700 text-xs rounded flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <button className="btn-outline flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Documents
                  </button>
                  {doctor.verificationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReject(doctor.id)}
                        className="btn-outline text-emergency-500 border-emergency-500 hover:bg-emergency-50 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(doctor.id)}
                        className="btn-success flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
