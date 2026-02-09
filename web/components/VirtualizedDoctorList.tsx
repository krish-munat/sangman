'use client'

import { useRef, useEffect, useState } from 'react'
import type { Doctor } from '../../../shared/types'

interface VirtualizedDoctorListProps {
  doctors: Doctor[]
  renderItem: (doctor: Doctor, distance: number | null) => React.ReactNode
  calculateDistance: (doctor: Doctor) => number | null
}

/**
 * Virtualized list for doctors using Intersection Observer
 * Only renders items when they're near the viewport for better performance
 */
export function VirtualizedDoctorList({
  doctors,
  renderItem,
  calculateDistance,
}: VirtualizedDoctorListProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: Math.min(10, doctors.length) })
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    // Create intersection observer for top sentinel (load previous items)
    if (visibleRange.start > 0) {
      const topObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisibleRange((prev) => ({
              start: Math.max(0, prev.start - 5),
              end: prev.end,
            }))
          }
        },
        { rootMargin: '200px' }
      )

      if (sentinelRefs.current[0]) {
        topObserver.observe(sentinelRefs.current[0])
        observers.push(topObserver)
      }
    }

    // Create intersection observer for bottom sentinel (load more items)
    if (visibleRange.end < doctors.length) {
      const bottomObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisibleRange((prev) => ({
              start: prev.start,
              end: Math.min(doctors.length, prev.end + 10),
            }))
          }
        },
        { rootMargin: '200px' }
      )

      if (sentinelRefs.current[1]) {
        bottomObserver.observe(sentinelRefs.current[1])
        observers.push(bottomObserver)
      }
    }

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [visibleRange, doctors.length])

  // Reset visible range when doctors list changes
  useEffect(() => {
    setVisibleRange({ start: 0, end: Math.min(10, doctors.length) })
  }, [doctors.length])

  const visibleDoctors = doctors.slice(visibleRange.start, visibleRange.end)

  return (
    <div className="grid gap-4">
      {/* Top sentinel for loading previous items */}
      {visibleRange.start > 0 && (
        <div
          ref={(el) => (sentinelRefs.current[0] = el)}
          className="h-4 flex items-center justify-center"
        >
          <div className="text-xs text-neutral-400">Loading...</div>
        </div>
      )}

      {/* Render visible doctors */}
      {visibleDoctors.map((doctor) => (
        <div key={doctor.id}>{renderItem(doctor, calculateDistance(doctor))}</div>
      ))}

      {/* Bottom sentinel for loading more items */}
      {visibleRange.end < doctors.length && (
        <div
          ref={(el) => (sentinelRefs.current[1] = el)}
          className="h-4 flex items-center justify-center"
        >
          <div className="text-xs text-neutral-400">Loading more...</div>
        </div>
      )}
    </div>
  )
}
