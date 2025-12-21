'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Save, X, Edit, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PhoneInput from '@/components/auth/PhoneInput'
import { validatePhoneByCountry, validateDifferentPhones, COUNTRY_CODES } from '@/lib/utils/validation'

interface ProfileFormData {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  medicalHistory: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
}

export default function ProfilePage() {
  const { user, updateUser, isHydrated } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [emergencyCountryCode, setEmergencyCountryCode] = useState('+91')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [emergencyPhoneError, setEmergencyPhoneError] = useState<string | undefined>()
  const [saveSuccess, setSaveSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      age: 0,
      gender: 'male',
      medicalHistory: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
    },
  })

  // Update form when user changes
  useEffect(() => {
    if (user && isHydrated) {
      const userData = user as any
      const emergencyContact = userData?.emergencyContact || {}
      
      reset({
        name: userData?.name || '',
        age: userData?.age || 0,
        gender: userData?.gender || 'male',
        medicalHistory: userData?.medicalHistory || '',
        emergencyContactName: emergencyContact?.name || '',
        emergencyContactPhone: emergencyContact?.phone || '',
        emergencyContactRelation: emergencyContact?.relation || '',
      })

      // Parse emergency phone if exists
      if (emergencyContact?.phone) {
        // Extract country code and phone from stored value
        const storedPhone = emergencyContact.phone
        const matchedCountry = COUNTRY_CODES.find(c => storedPhone.startsWith(c.code))
        if (matchedCountry) {
          setEmergencyCountryCode(matchedCountry.code)
          setEmergencyPhone(storedPhone.replace(matchedCountry.code, ''))
        } else {
          setEmergencyPhone(storedPhone.replace(/^\+\d+/, ''))
        }
      }
    }
  }, [user, isHydrated, reset])

  const handleEmergencyPhoneChange = (phone: string) => {
    setEmergencyPhone(phone)
    setValue('emergencyContactPhone', phone)
    validateEmergencyPhone(phone, emergencyCountryCode)
  }

  const handleEmergencyCountryCodeChange = (code: string) => {
    setEmergencyCountryCode(code)
    validateEmergencyPhone(emergencyPhone, code)
  }

  const validateEmergencyPhone = (phone: string, countryCode: string) => {
    if (phone.length === 0) {
      setEmergencyPhoneError(undefined)
      return true
    }

    // Validate phone format
    const phoneValidation = validatePhoneByCountry(phone, countryCode)
    if (!phoneValidation.valid) {
      setEmergencyPhoneError(phoneValidation.error)
      return false
    }

    // Check if emergency phone is different from user's phone
    const fullEmergencyPhone = `${countryCode}${phone}`
    const userPhone = user?.phone || ''
    
    const differentCheck = validateDifferentPhones(userPhone, fullEmergencyPhone)
    if (!differentCheck.valid) {
      setEmergencyPhoneError(differentCheck.error)
      return false
    }

    setEmergencyPhoneError(undefined)
    return true
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Validate emergency phone
      if (emergencyPhone.length > 0) {
        const phoneValidation = validatePhoneByCountry(emergencyPhone, emergencyCountryCode)
        if (!phoneValidation.valid) {
          setEmergencyPhoneError(phoneValidation.error)
          toast.error(phoneValidation.error || 'Invalid emergency phone number')
          return
        }

        // Check if different from user phone
        const fullEmergencyPhone = `${emergencyCountryCode}${emergencyPhone}`
        const userPhone = user?.phone || ''
        const differentCheck = validateDifferentPhones(userPhone, fullEmergencyPhone)
        if (!differentCheck.valid) {
          setEmergencyPhoneError(differentCheck.error)
          toast.error(differentCheck.error || 'Emergency phone must be different')
          return
        }
      }

      const fullEmergencyPhone = emergencyPhone.length > 0 
        ? `${emergencyCountryCode}${emergencyPhone}`
        : ''

      // Update user in store (this persists to localStorage automatically)
      updateUser({
        name: data.name,
        age: data.age,
        gender: data.gender,
        medicalHistory: data.medicalHistory,
        emergencyContact: {
          name: data.emergencyContactName,
          phone: fullEmergencyPhone,
          relation: data.emergencyContactRelation,
        },
        updatedAt: new Date().toISOString(),
      })

      toast.success('Profile updated successfully!')
      setSaveSuccess(true)
      setIsEditing(false)

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update profile'
      toast.error(errorMessage)
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            My Profile
          </h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700 dark:text-green-300 font-medium">
              Your profile has been saved successfully!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <User className="w-5 h-5 text-primary-500" />
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                  Full Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 
                    text-neutral-900 dark:text-neutral-100
                    ${!isEditing ? 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed' : ''}
                    ${errors.name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
                    focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                  Age
                </label>
                <input
                  {...register('age', {
                    required: 'Age is required',
                    min: { value: 1, message: 'Age must be at least 1' },
                    max: { value: 120, message: 'Age must be less than 120' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 
                    text-neutral-900 dark:text-neutral-100
                    ${!isEditing ? 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed' : ''}
                    ${errors.age ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
                    focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                  Gender
                </label>
                <select
                  {...register('gender')}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 
                    text-neutral-900 dark:text-neutral-100
                    ${!isEditing ? 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed' : ''}
                    border-neutral-300 dark:border-neutral-600
                    focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border bg-neutral-100 dark:bg-neutral-700 
                    text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600
                    cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-neutral-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone</span>
                </label>
                <input
                  type="tel"
                  value={user?.phone || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border bg-neutral-100 dark:bg-neutral-700 
                    text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600
                    cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-neutral-500">Phone cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              Medical History
            </h2>
            <textarea
              {...register('medicalHistory')}
              disabled={!isEditing}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 
                text-neutral-900 dark:text-neutral-100
                ${!isEditing ? 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed' : ''}
                border-neutral-300 dark:border-neutral-600
                focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="Enter your medical history (allergies, chronic conditions, medications, etc.)"
            />
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Emergency Contact</span>
            </h2>

            {/* Warning about different phone numbers */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                ⚠️ Emergency contact phone number must be different from your registered phone number.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                  Contact Name
                </label>
                <input
                  {...register('emergencyContactName', {
                    required: 'Emergency contact name is required',
                  })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 
                    text-neutral-900 dark:text-neutral-100
                    ${!isEditing ? 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed' : ''}
                    ${errors.emergencyContactName ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
                    focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="e.g., John Doe"
                />
                {errors.emergencyContactName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              <div>
                <PhoneInput
                  label="Emergency Phone Number"
                  countryCode={emergencyCountryCode}
                  onCountryCodeChange={handleEmergencyCountryCodeChange}
                  onPhoneChange={handleEmergencyPhoneChange}
                  value={emergencyPhone}
                  error={emergencyPhoneError}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                  Relation
                </label>
                <input
                  {...register('emergencyContactRelation', {
                    required: 'Relation is required',
                  })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 
                    text-neutral-900 dark:text-neutral-100
                    ${!isEditing ? 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed' : ''}
                    ${errors.emergencyContactRelation ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'}
                    focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="e.g., Father, Mother, Spouse, Sibling"
                />
                {errors.emergencyContactRelation && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.emergencyContactRelation.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4">
              <button 
                type="submit" 
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  // Reset form to original values
                  if (user) {
                    const userData = user as any
                    reset({
                      name: userData?.name || '',
                      age: userData?.age || 0,
                      gender: userData?.gender || 'male',
                      medicalHistory: userData?.medicalHistory || '',
                      emergencyContactName: userData?.emergencyContact?.name || '',
                      emergencyContactPhone: userData?.emergencyContact?.phone || '',
                      emergencyContactRelation: userData?.emergencyContact?.relation || '',
                    })
                  }
                  setEmergencyPhoneError(undefined)
                }}
                className="flex items-center gap-2 px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
