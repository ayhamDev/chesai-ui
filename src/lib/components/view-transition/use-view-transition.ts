'use client'

import { useCallback } from 'react'
import { flushSync } from 'react-dom'

export function useViewTransition() {
  const startTransition = useCallback(<T>(callback: () => T | Promise<T>): Promise<void> => {
    const startViewTransition = document.startViewTransition;
    if (!startViewTransition) {
      const result = callback()
      return (result as any) instanceof Promise ? (result as any).then(() => {}) : Promise.resolve()
    }

    return new Promise(resolve => {
      const transition = startViewTransition.call(document, () => {
        let result: T | Promise<T> | undefined = undefined;

        flushSync(() => {
          result = callback()
        })

        return (result as any) instanceof Promise ? (result as any) : Promise.resolve()
      })

      transition.finished.then(resolve)
    })
  }, [])

  return startTransition
}
