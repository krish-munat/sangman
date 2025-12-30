'use client'

import { useState, useEffect } from 'react'
import { X, User, Calendar, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { useFamilyStore, FamilyMember, calculateAge, AGE_LIMITS } from '@/lib/store/familyStore'
import toast from 'react-hot-toast'

interface AddChildProfileModalProps {
  isOpen: boolean
  onClose: () => void
  parentUserId: string
  editMember?: FamilyMember | null
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const RELATIONS = [
  { value: 'son', label: 'Son', icon: '👦' },
  { value: 'daughter', label: 'Daughter', icon: '👧' },
  { value: 'spouse', label: 'Spouse', icon: '💑' },
  { value: 'parent', label: 'Parent', icon: '👴' },
  { value: 'other', label: 'Other', icon: '👤' },
]

const getDefaultFormData = (editMember?: FamilyMember | null) => ({
  name: editMember?.name || '',
  dateOfBirth: editMember?.dateOfBirth || '',
  gender: editMember?.gender || 'male' as const,
  relation: editMember?.relation || 'son' as const,
  bloodGroup: editMember?.bloodGroup || '',
  allergies: editMember?.allergies || '',
  medicalHistory: editMember?.medicalHistory || '',
})

export default function AddChildProfileModal({
  isOpen,
  onClose,
  parentUserId,
  editMember,
}: AddChildProfileModalProps) {
  const { addMember, updateMember } = useFamilyStore()
  
  const [formData, setFormData] = useState(getDefaultFormData(editMember))

  // Sync form state when editMember changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getDefaultFormData(editMember))
      setErrors({})
    }
  }, [editMember, isOpen])
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    } else {
      const calculatedAge = calculateAge(formData.dateOfBirth)
      if (calculatedAge < 0) {
        newErrors.dateOfBirth = 'Invalid date of birth'
      }
      // For children (son/daughter), check age limit
      if ((formData.relation === 'son' || formData.relation === 'daughter') && calculatedAge > AGE_LIMITS.MAX_CHILD_AGE) {
        newErrors.dateOfBirth = `Children profiles are only allowed for dependents aged ${AGE_LIMITS.MAX_CHILD_AGE} or below`
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!formData.relation) {
      newErrors.relation = 'Relationship is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editMember) {
        updateMember(editMember.id, {
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          relation: formData.relation,
          bloodGroup: formData.bloodGroup || undefined,
          allergies: formData.allergies || undefined,
          medicalHistory: formData.medicalHistory || undefined,
        })
        toast.success('Profile updated successfully!')
      } else {
        addMember({
          parentUserId,
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          age: calculateAge(formData.dateOfBirth),
          gender: formData.gender,
          relation: formData.relation,
          bloodGroup: formData.bloodGroup || undefined,
          allergies: formData.allergies || undefined,
          medicalHistory: formData.medicalHistory || undefined,
        })
        toast.success('Family member added successfully!')
      }

      onClose()
    } catch (error) {
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {editMember ? 'Edit Family Member' : 'Add Family Member'}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">
                {editMember ? 'Update profile details' : 'Create a profile for your family member'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Relationship */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
            <div className="flex flex-wrap gap-2">
              {RELATIONS.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  onClick={() => handleChange('relation', rel.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.relation === rel.value
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{rel.icon}</span>
                  <span>{rel.label}</span>
                </button>
              ))}
            </div>
            {errors.relation && (
              <p className="text-red-500 text-xs mt-1">{errors.relation}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                placeholder="Enter full name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Date of Birth & Age Display */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`}
                />
              </div>
              {age !== null && (
                <div className={`px-4 py-3 rounded-xl flex items-center gap-2 ${
                  (formData.relation === 'son' || formData.relation === 'daughter') && age > AGE_LIMITS.MAX_CHILD_AGE
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <span className="font-bold">{age}</span>
                  <span className="text-sm">years</span>
                </div>
              )}
            </div>
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
            {(formData.relation === 'son' || formData.relation === 'daughter') && (
              <p className="text-xs text-gray-500 mt-1">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Children profiles are for dependents aged {AGE_LIMITS.MAX_CHILD_AGE} or below
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
            <div className="flex gap-2">
              {[
                { value: 'male', label: 'Male', icon: '👨' },
                { value: 'female', label: 'Female', icon: '👩' },
                { value: 'other', label: 'Other', icon: '🧑' },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => handleChange('gender', g.value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.gender === g.value
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => handleChange('bloodGroup', formData.bloodGroup === bg ? '' : bg)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    formData.bloodGroup === bg
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Known Allergies (Optional)</label>
            <textarea
              value={formData.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
              placeholder="e.g., Peanuts, Penicillin, Dust"
            />
          </div>

          {/* Medical History */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History (Optional)</label>
            <textarea
              value={formData.medicalHistory}
              onChange={(e) => handleChange('medicalHistory', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
              placeholder="Any previous surgeries, chronic conditions, or ongoing treatments"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                {editMember ? 'Update Profile' : 'Add Member'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}




