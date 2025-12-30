import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (use PostgreSQL in production)
const familyMembers: Array<{
  id: string
  parentUserId: string
  name: string
  age: number
  dateOfBirth: string
  gender: string
  relation: string
  bloodGroup?: string
  allergies?: string
  createdAt: string
}> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentUserId = searchParams.get('parentUserId')
    
    if (!parentUserId) {
      return NextResponse.json(
        { success: false, message: 'Parent user ID is required' },
        { status: 400 }
      )
    }
    
    const members = familyMembers.filter(m => m.parentUserId === parentUserId)
    
    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error('[Family GET Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch family members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentUserId, name, age, dateOfBirth, gender, relation, bloodGroup, allergies } = body
    
    if (!parentUserId || !name || !dateOfBirth || !gender || !relation) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const newMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      parentUserId,
      name,
      age: age || calculateAge(dateOfBirth),
      dateOfBirth,
      gender,
      relation,
      bloodGroup,
      allergies,
      createdAt: new Date().toISOString(),
    }
    
    familyMembers.push(newMember)
    
    console.log(`[Family] Added member ${name} for user ${parentUserId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Family member added successfully',
      data: newMember,
    })
  } catch (error) {
    console.error('[Family POST Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add family member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')
    
    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'Member ID is required' },
        { status: 400 }
      )
    }
    
    const index = familyMembers.findIndex(m => m.id === memberId)
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      )
    }
    
    familyMembers.splice(index, 1)
    
    return NextResponse.json({
      success: true,
      message: 'Family member removed successfully',
    })
  } catch (error) {
    console.error('[Family DELETE Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove family member' },
      { status: 500 }
    )
  }
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

