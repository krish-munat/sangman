'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

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
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: (user as any)?.name || '',
      age: (user as any)?.age || 0,
      gender: (user as any)?.gender || 'male',
      medicalHistory: (user as any)?.medicalHistory || '',
      emergencyContactName: (user as any)?.emergencyContact?.name || '',
      emergencyContactPhone: (user as any)?.emergencyContact?.phone || '',
      emergencyContactRelation: (user as any)?.emergencyContact?.relation || '',
    },
  })

  // Update form when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: (user as any)?.name || '',
        age: (user as any)?.age || 0,
        gender: (user as any)?.gender || 'male',
        medicalHistory: (user as any)?.medicalHistory || '',
        emergencyContactName: (user as any)?.emergencyContact?.name || '',
        emergencyContactPhone: (user as any)?.emergencyContact?.phone || '',
        emergencyContactRelation: (user as any)?.emergencyContact?.relation || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // TODO: Update profile via API
      updateUser({
        name: data.name,
        age: data.age,
        gender: data.gender,
        medicalHistory: data.medicalHistory,
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relation: data.emergencyContactRelation,
        },
      })
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update profile'
      toast.error(errorMessage)
    }
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
              className="btn-primary btn-icon"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  disabled={!isEditing}
                  className="input"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-emergency-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  {...register('age', {
                    required: 'Age is required',
                    min: { value: 1, message: 'Age must be at least 1' },
                    max: { value: 120, message: 'Age must be less than 120' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  disabled={!isEditing}
                  className="input"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-emergency-500">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  {...register('gender')}
                  disabled={!isEditing}
                  className="input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 icon-text-group">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input bg-neutral-100 dark:bg-neutral-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 icon-text-group">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>Phone</span>
                </label>
                <input
                  type="tel"
                  value={user?.phone || ''}
                  disabled
                  className="input bg-neutral-100 dark:bg-neutral-700"
                />
              </div>
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Medical History</h2>
            <textarea
              {...register('medicalHistory')}
              disabled={!isEditing}
              rows={4}
              className="input"
              placeholder="Enter your medical history (optional)"
            />
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 icon-text-group">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span>Emergency Contact</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contact Name</label>
                <input
                  {...register('emergencyContactName', {
                    required: 'Emergency contact name is required',
                  })}
                  disabled={!isEditing}
                  className="input"
                />
                {errors.emergencyContactName && (
                  <p className="mt-1 text-sm text-emergency-500">
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  {...register('emergencyContactPhone', {
                    required: 'Emergency contact phone is required',
                  })}
                  disabled={!isEditing}
                  className="input"
                />
                {errors.emergencyContactPhone && (
                  <p className="mt-1 text-sm text-emergency-500">
                    {errors.emergencyContactPhone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Relation</label>
                <input
                  {...register('emergencyContactRelation', {
                    required: 'Relation is required',
                  })}
                  disabled={!isEditing}
                  className="input"
                  placeholder="e.g., Father, Mother, Spouse"
                />
                {errors.emergencyContactRelation && (
                  <p className="mt-1 text-sm text-emergency-500">
                    {errors.emergencyContactRelation.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  reset()
                }}
                className="btn-outline flex items-center gap-2"
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

