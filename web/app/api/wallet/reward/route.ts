import { NextRequest, NextResponse } from 'next/server'

// In-memory storage (use PostgreSQL in production)
const wallets: Map<string, {
  balance: number
  totalEarned: number
  streak: number
  lastRewardDate: string | null
  todayRewardCount: number
  todayRewardDate: string | null
}> = new Map()

const medicationLogs: Array<{
  id: string
  userId: string
  medicineName: string
  scheduledTime: string
  takenAt: string
  rewardEarned: number
  onTime: boolean
}> = []

const MAX_DAILY_REWARD = 5 // ₹5 per day limit
const BASE_REWARD = 1 // ₹1 per dose
const ON_TIME_BONUS = 0.5 // Extra ₹0.50 for on-time
const STREAK_BONUS_THRESHOLD = 7 // Days for bonus
const STREAK_BONUS = 5 // ₹5 weekly bonus
const TIME_WINDOW_HOURS = 2 // 2 hour window for marking

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, medicineName, scheduledTime, markedAt } = body
    
    if (!userId || !medicineName || !scheduledTime) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const now = new Date()
    const markedTime = markedAt ? new Date(markedAt) : now
    const scheduled = new Date(scheduledTime)
    const today = now.toISOString().split('T')[0]
    
    // Get or create wallet
    let wallet = wallets.get(userId)
    if (!wallet) {
      wallet = {
        balance: 0,
        totalEarned: 0,
        streak: 0,
        lastRewardDate: null,
        todayRewardCount: 0,
        todayRewardDate: null,
      }
      wallets.set(userId, wallet)
    }
    
    // Reset daily count if new day
    if (wallet.todayRewardDate !== today) {
      wallet.todayRewardCount = 0
      wallet.todayRewardDate = today
    }
    
    // Check daily limit
    if (wallet.todayRewardCount >= MAX_DAILY_REWARD) {
      return NextResponse.json({
        success: false,
        message: 'Daily reward limit reached (₹5/day)',
        data: {
          balance: wallet.balance,
          todayEarned: wallet.todayRewardCount,
          maxDaily: MAX_DAILY_REWARD,
        },
      })
    }
    
    // Check time window (2 hours before/after scheduled time)
    const timeDiffHours = Math.abs(markedTime.getTime() - scheduled.getTime()) / (1000 * 60 * 60)
    
    if (timeDiffHours > TIME_WINDOW_HOURS) {
      return NextResponse.json({
        success: false,
        message: `Medicine can only be marked within ${TIME_WINDOW_HOURS} hours of scheduled time`,
        data: {
          scheduledTime,
          markedTime: markedTime.toISOString(),
          windowHours: TIME_WINDOW_HOURS,
        },
      })
    }
    
    // Calculate reward
    let reward = BASE_REWARD
    const onTime = timeDiffHours <= 0.5 // Within 30 mins is "on time"
    
    if (onTime) {
      reward += ON_TIME_BONUS
    }
    
    // Update streak
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (wallet.lastRewardDate === yesterdayStr || wallet.lastRewardDate === today) {
      // Continue streak
      if (wallet.lastRewardDate === yesterdayStr) {
        wallet.streak += 1
      }
    } else if (wallet.lastRewardDate !== today) {
      // Reset streak
      wallet.streak = 1
    }
    
    // Check for streak bonus
    let streakBonus = 0
    if (wallet.streak > 0 && wallet.streak % STREAK_BONUS_THRESHOLD === 0) {
      streakBonus = STREAK_BONUS
      reward += streakBonus
    }
    
    // Cap at daily limit
    const availableReward = MAX_DAILY_REWARD - wallet.todayRewardCount
    const actualReward = Math.min(reward, availableReward)
    
    // Update wallet
    wallet.balance += actualReward
    wallet.totalEarned += actualReward
    wallet.todayRewardCount += actualReward
    wallet.lastRewardDate = today
    
    // Log the medication
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId,
      medicineName,
      scheduledTime,
      takenAt: markedTime.toISOString(),
      rewardEarned: actualReward,
      onTime,
    }
    medicationLogs.push(log)
    
    console.log(`[Wallet] Rewarded ₹${actualReward} to user ${userId} for taking ${medicineName}. Streak: ${wallet.streak} days`)
    
    return NextResponse.json({
      success: true,
      message: `₹${actualReward} added to your Sangman Health Wallet!`,
      data: {
        reward: actualReward,
        baseReward: BASE_REWARD,
        onTimeBonus: onTime ? ON_TIME_BONUS : 0,
        streakBonus,
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        streak: wallet.streak,
        todayEarned: wallet.todayRewardCount,
        maxDaily: MAX_DAILY_REWARD,
        onTime,
        logId: log.id,
      },
    })
  } catch (error) {
    console.error('[Wallet Reward Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process reward' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const wallet = wallets.get(userId) || {
      balance: 0,
      totalEarned: 0,
      streak: 0,
      lastRewardDate: null,
      todayRewardCount: 0,
      todayRewardDate: null,
    }
    
    const userLogs = medicationLogs
      .filter(l => l.userId === userId)
      .slice(-10) // Last 10 logs
    
    // Calculate punctuality score
    const last30Logs = medicationLogs.filter(l => l.userId === userId).slice(-30)
    const onTimeLogs = last30Logs.filter(l => l.onTime).length
    const punctualityScore = last30Logs.length > 0 
      ? Math.round((onTimeLogs / last30Logs.length) * 100) 
      : 0
    
    // Calculate discount (up to 15% based on punctuality and streak)
    const punctualityDiscount = Math.floor(punctualityScore / 10) // 1% per 10% score
    const streakDiscount = Math.min(Math.floor(wallet.streak / 7), 5) // 1% per week, max 5%
    const totalDiscount = Math.min(punctualityDiscount + streakDiscount, 15)
    
    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          balance: wallet.balance,
          totalEarned: wallet.totalEarned,
          streak: wallet.streak,
          todayEarned: wallet.todayRewardCount,
          maxDaily: MAX_DAILY_REWARD,
        },
        punctualityScore,
        discounts: {
          punctuality: punctualityDiscount,
          streak: streakDiscount,
          total: totalDiscount,
        },
        recentLogs: userLogs,
      },
    })
  } catch (error) {
    console.error('[Wallet GET Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}

