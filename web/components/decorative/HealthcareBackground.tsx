'use client'

import { HealthcarePattern } from './HealthcarePattern'

export function HealthcareBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-900">
      <HealthcarePattern variant="subtle" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

