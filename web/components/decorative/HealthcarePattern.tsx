'use client'

import { Heart, Activity, Shield, Stethoscope } from 'lucide-react'

interface HealthcarePatternProps {
  variant?: 'subtle' | 'moderate' | 'bold'
  className?: string
}

export function HealthcarePattern({ variant = 'subtle', className = '' }: HealthcarePatternProps) {
  const opacity = variant === 'subtle' ? 0.03 : variant === 'moderate' ? 0.05 : 0.08
  const icons = [Heart, Activity, Shield, Stethoscope]

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {icons.map((Icon, index) => {
        const positions = [
          { top: '10%', left: '5%', rotate: '15deg' },
          { top: '20%', right: '8%', rotate: '-20deg' },
          { bottom: '15%', left: '12%', rotate: '25deg' },
          { bottom: '25%', right: '6%', rotate: '-15deg' },
        ]
        const pos = positions[index % positions.length]
        
        return (
          <Icon
            key={index}
            className="absolute text-primary-400"
            style={{
              top: pos.top,
              left: pos.left,
              right: pos.right,
              bottom: pos.bottom,
              transform: `rotate(${pos.rotate})`,
              opacity,
              width: '120px',
              height: '120px',
            }}
          />
        )
      })}
    </div>
  )
}

