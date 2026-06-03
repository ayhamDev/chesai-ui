import { useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { StackNavigationState } from '../types'

/**
 * Official Adapter Hook for TanStack Router
 * Intercepts TanStack history events and translates them into an array-based
 * state object that the `ControlledStackNavigator` can animate perfectly.
 */
export function useTanStackRouterAdapter<T extends Record<string, object | undefined>>(initialRouteName: keyof T) {
  const router = useRouter()

  const [state, setState] = useState<StackNavigationState<T>>({
    index: 0,
    routes: [{ key: `initial-${Date.now()}`, name: initialRouteName, params: {} as T[keyof T] }],
  })

  useEffect(() => {
    // Listen to TanStack history changes to update our internal array of screens
    return router.history.subscribe((evt: any) => {
      // Safely extract action whether it's an object { type: 'PUSH' } or string 'PUSH'
      const action = evt?.action?.type || evt?.action
      const location = evt.location

      if (action === 'PUSH' || action === 'FORWARD') {
        setState(prev => ({
          index: prev.index + 1,
          routes: [
            ...prev.routes,
            {
              // The key must be completely unique so Framer Motion mounts a new instance
              key: `${location.pathname}-${Date.now()}-${Math.random()}`,
              name: location.pathname as keyof T,
              params: (location.state || {}) as T[keyof T],
            },
          ],
        }))
      } else if (action === 'POP' || action === 'BACK') {
        setState(prev => ({
          index: Math.max(0, prev.index - 1),
          routes: prev.routes.slice(0, Math.max(1, prev.routes.length - 1)),
        }))
      } else if (action === 'REPLACE') {
        setState(prev => {
          const newRoutes = [...prev.routes]
          newRoutes[newRoutes.length - 1] = {
            key: `${location.pathname}-${Date.now()}-${Math.random()}`,
            name: location.pathname as keyof T,
            params: (location.state || {}) as T[keyof T],
          }
          return { index: prev.index, routes: newRoutes }
        })
      }
    })
  }, [router.history])

  // Helper to force TanStack to treat identical routes as a new PUSH
  const injectUniqueState = (params?: any) => ({
    ...(params || {}),
    _stackKey: Date.now(), // This forces the router to see the state as "different"
  })

  return {
    state,
    // Forward StackRouter navigation requests to TanStack Router, forcing unique state
    onNavigate: (name: keyof T, params?: T[keyof T]) =>
      router.navigate({ to: name as string, state: injectUniqueState(params) }),
    onPush: (name: keyof T, params?: T[keyof T]) =>
      router.navigate({ to: name as string, state: injectUniqueState(params) }),
    onReplace: (name: keyof T, params?: T[keyof T]) =>
      router.navigate({ to: name as string, replace: true, state: injectUniqueState(params) }),
    onGoBack: () => router.history.back(),
    onPop: () => router.history.back(),
    onPopToTop: () => router.navigate({ to: initialRouteName as string }),
    canGoBack: () => state.index > 0,
  }
}
