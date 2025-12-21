'use client'

import { useState } from 'react'
import { Users, Plus, Edit2, Trash2, Calendar, Heart, AlertTriangle, User } from 'lucide-react'
import { useFamilyStore, FamilyMember, AGE_LIMITS } from '@/lib/store/familyStore'
import AddChildProfileModal from './AddChildProfileModal'
import toast from 'react-hot-toast'

interface FamilyMembersListProps {
  parentUserId: string
}

export default function FamilyMembersList({ parentUserId }: FamilyMembersListProps) {
  const { getMembersByParent, removeMember } = useFamilyStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const members = getMembersByParent(parentUserId)

  const handleDelete = async (member: FamilyMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name}'s profile?`)) return
    
    setDeletingId(member.id)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      removeMember(member.id)
      toast.success(`${member.name}'s profile removed`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingMember(null)
  }

  const getRelationEmoji = (relation: FamilyMember['relation']) => {
    switch (relation) {
      case 'son': return '👦'
      case 'daughter': return '👧'
      case 'spouse': return '💑'
      case 'parent': return '👴'
      default: return '👤'
    }
  }

  const getGenderColor = (gender: FamilyMember['gender']) => {
    switch (gender) {
      case 'male': return 'from-blue-500 to-cyan-500'
      case 'female': return 'from-pink-500 to-rose-500'
      default: return 'from-purple-500 to-indigo-500'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Family Members</h2>
              <p className="text-sm text-gray-500">Manage profiles for your dependents</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Child Profile Guidelines</p>
            <p className="text-xs text-amber-700 mt-1">
              You can create profiles for children under {AGE_LIMITS.MAX_CHILD_AGE} years of age. 
              These profiles allow you to book appointments and manage healthcare for your dependents.
            </p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="p-6">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Family Members Added</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Add profiles for your children or other dependents to manage their healthcare from your account.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Family Member
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {members.map((member) => (
              <div
                key={member.id}
                className={`relative p-4 rounded-xl border-2 border-gray-100 hover:border-sky-200 transition-all group ${
                  deletingId === member.id ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-sky-50 hover:border-sky-200 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${getGenderColor(member.gender)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl">{getRelationEmoji(member.relation)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate">{member.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                        {member.relation}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{member.age} years old</span>
                      </div>
                      {member.bloodGroup && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{member.bloodGroup}</span>
                        </div>
                      )}
                    </div>

                    {member.allergies && (
                      <p className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg inline-block">
                        ⚠️ Allergies: {member.allergies}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddChildProfileModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        parentUserId={parentUserId}
        editMember={editingMember}
      />
    </div>
  )
}

