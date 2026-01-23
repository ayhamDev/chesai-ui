import { useEffect, useState } from 'react'

export type WindowSizeClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extra-large'

// MD3 Breakpoints
const BREAKPOINTS = {
  compact: 600,
  medium: 840,
  expanded: 1200,
  large: 1600,
}

export function useWindowSizeClass(): WindowSizeClass {
  const [sizeClass, setSizeClass] = useState<WindowSizeClass>('compact')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSizeClass = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.compact) setSizeClass('compact')
      else if (width < BREAKPOINTS.medium) setSizeClass('medium')
      else if (width < BREAKPOINTS.expanded) setSizeClass('expanded')
      else if (width < BREAKPOINTS.large) setSizeClass('large')
      else setSizeClass('extra-large')
    }

    // Initial check
    updateSizeClass()

    // Debounced resize handler could be added here for performance
    window.addEventListener('resize', updateSizeClass)
    return () => window.removeEventListener('resize', updateSizeClass)
  }, [])

  return sizeClass
}
