'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface EarningsData {
  totalEarnings: number
  platformFee: number
  netEarnings: number
  thisMonth: number
  lastMonth: number
  growth: number
  transactions: {
    id: string
    date: string
    patientName: string
    amount: number
    platformFee: number
    netAmount: number
    type: 'normal' | 'emergency'
  }[]
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    platformFee: 0,
    netEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    transactions: [],
  })
  const [filter, setFilter] = useState<'all' | 'month' | 'week'>('month')

  useEffect(() => {
    // TODO: Fetch earnings data from API
    setEarnings({
      totalEarnings: 125000,
      platformFee: 8750,
      netEarnings: 116250,
      thisMonth: 45000,
      lastMonth: 39000,
      growth: 15.38,
      transactions: [
        {
          id: '1',
          date: new Date().toISOString(),
          patientName: 'John Doe',
          amount: 500,
          platformFee: 35,
          netAmount: 465,
          type: 'normal',
        },
        {
          id: '2',
          date: new Date().toISOString(),
          patientName: 'Jane Smith',
          amount: 1000,
          platformFee: 70,
          netAmount: 930,
          type: 'emergency',
        },
      ],
    })
  }, [])

  const stats = [
    {
      title: 'Total Earnings',
      value: formatCurrency(earnings.totalEarnings),
      icon: DollarSign,
      color: 'primary',
    },
    {
      title: 'Platform Fee (7%)',
      value: formatCurrency(earnings.platformFee),
      icon: TrendingUp,
      color: 'neutral',
    },
    {
      title: 'Net Earnings',
      value: formatCurrency(earnings.netEarnings),
      icon: DollarSign,
      color: 'success',
    },
    {
      title: 'This Month',
      value: formatCurrency(earnings.thisMonth),
      icon: Calendar,
      color: 'primary',
      change: `+${earnings.growth.toFixed(1)}% from last month`,
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Earnings Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Track your earnings and payment history
            </p>
          </div>
          <button className="btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stat.color === 'primary'
                        ? 'bg-primary-100 dark:bg-primary-900'
                        : stat.color === 'success'
                        ? 'bg-success-100 dark:bg-success-900'
                        : 'bg-neutral-100 dark:bg-neutral-700'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        stat.color === 'primary'
                          ? 'text-primary-500'
                          : stat.color === 'success'
                          ? 'text-success-500'
                          : 'text-neutral-500'
                      }`}
                    />
                  </div>
                </div>
                <h3 className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {stat.value}
                </p>
                {stat.change && (
                  <p className="text-xs text-success-600">{stat.change}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'month', 'week'] as const).map((f) => (
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

        {/* Transactions Table */}
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
            Transaction History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Patient
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Consultation Fee
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Platform Fee
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Net Amount
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {earnings.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-neutral-600 dark:text-neutral-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  earnings.transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-neutral-200 dark:border-neutral-700"
                    >
                      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(transaction.date, 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-900 dark:text-neutral-100">
                        {transaction.patientName}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-neutral-600 dark:text-neutral-400">
                        {formatCurrency(transaction.platformFee)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-success-600">
                        {formatCurrency(transaction.netAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            transaction.type === 'emergency'
                              ? 'bg-emergency-100 text-emergency-700'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

