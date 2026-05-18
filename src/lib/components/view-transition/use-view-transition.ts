'use client'

import { useCallback } from 'react'
import { flushSync } from 'react-dom'

// Standardize TypeScript definitions for browsers that support the API
declare global {
  interface Document {
    startViewTransition?: (callback: () => void | Promise<void>) => {
      finished: Promise<void>
      ready: Promise<void>
      updateCallbackDone: Promise<void>
    }
  }
}

export function useViewTransition() {
  const startTransition = useCallback(<T>(callback: () => T | Promise<T>): Promise<void> => {
    // 1. Fallback for browsers (Safari/Firefox) that don't support View Transitions yet
    if (!document.startViewTransition) {
      const result = callback()
      return result instanceof Promise ? result.then(() => {}) : Promise.resolve()
    }

    // 2. Execute the transition
    return new Promise(resolve => {
      const transition = document.startViewTransition(() => {
        let result: T | Promise<T>

        // flushSync forces React to process the state change synchronously.
        // This is critical for the browser to snapshot the "After" DOM state accurately.
        flushSync(() => {
          result = callback()
        })

        // If the navigation returns a promise (e.g., Next.js chunk loading),
        // returning it tells the View Transition API to wait for the new page to load.
        return result instanceof Promise ? result : Promise.resolve()
      })

      // Resolve the wrapper promise when the animation completes
      transition.finished.then(resolve)
    })
  }, [])

  return startTransition
}
