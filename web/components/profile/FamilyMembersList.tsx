'use client'

import { useState, useMemo } from 'react'
import { Users, Plus, Edit, Trash2, User, Calendar, Heart } from 'lucide-react'
import { useFamilyStore, FamilyMember, calculateAge, AGE_LIMITS } from '@/lib/store/familyStore'
import AddChildProfileModal from './AddChildProfileModal'

interface FamilyMembersListProps {
  parentUserId: string
}

export default function FamilyMembersList({ parentUserId }: FamilyMembersListProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  
  // Get family members from store using selector
  const familyMembers = useFamilyStore((state) => state.members)
  const removeMember = useFamilyStore((state) => state.removeMember)
  
  // Filter members for this parent
  const members = useMemo(() => {
    return familyMembers.filter((m) => m.parentUserId === parentUserId)
  }, [familyMembers, parentUserId])

  const handleDelete = (memberId: string) => {
    if (confirm('Are you sure you want to remove this family member?')) {
      removeMember(memberId)
    }
  }

  const getRelationBadgeColor = (relation: string) => {
    const relationLower = relation.toLowerCase()
    if (['son', 'daughter', 'child'].includes(relationLower)) {
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    if (['father', 'mother', 'parent'].includes(relationLower)) {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
    if (['husband', 'wife', 'spouse'].includes(relationLower)) {
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
    }
    if (['brother', 'sister', 'sibling'].includes(relationLower)) {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
    return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
          <Users className="w-5 h-5 text-primary-500" />
          <span>Family Members</span>
          {members.length > 0 && (
            <span className="text-sm font-normal text-neutral-500">
              ({members.length})
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg 
            font-medium hover:bg-primary-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400 mb-2">
            No family members added yet
          </p>
          <p className="text-sm text-neutral-500">
            Add children (under {AGE_LIMITS.MIN_ADULT_AGE} years) or elderly family members to manage their health profiles
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {members.map((member) => {
            const age = calculateAge(member.dateOfBirth)
            return (
              <div
                key={member.id}
                className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 
                  bg-neutral-50 dark:bg-neutral-800/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 
                      flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {member.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRelationBadgeColor(member.relation)}`}>
                        {member.relation}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingMember(member.id)}
                      className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                      aria-label="Edit member"
                    >
                      <Edit className="w-4 h-4 text-neutral-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      aria-label="Delete member"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Calendar className="w-4 h-4" />
                    <span>{age} years old</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <span className="capitalize">{member.gender}</span>
                  </div>
                  {member.bloodGroup && (
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{member.bloodGroup}</span>
                    </div>
                  )}
                </div>

                {member.allergies && (
                  <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Allergies:</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{member.allergies}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddChildProfileModal
        isOpen={showAddModal}
        parentUserId={parentUserId}
        onClose={() => setShowAddModal(false)}
      />
      
      <AddChildProfileModal
        isOpen={!!editingMember}
        parentUserId={parentUserId}
        editMember={members.find(m => m.id === editingMember) || null}
        onClose={() => setEditingMember(null)}
      />
    </div>
  )
}
