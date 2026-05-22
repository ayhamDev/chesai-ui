import { useCallback, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'

// --- TYPE DEFINITIONS ---
type HistoryMode = 'search' | 'pathname' | 'memory'

interface UseHistoryOptions {
  mode?: HistoryMode
  paramName?: string
  basePath?: string
  /**
   * Enable View Transitions automatically on browser back/forward buttons
   * Defaults to true to make it universal
   */
  enableViewTransitions?: boolean
}

type Params = Record<string, string | number | boolean | null | undefined>

// --- HOOK IMPLEMENTATION ---
const useShallowRouter = (options: UseHistoryOptions = {}) => {
  const { mode = 'search', paramName = 'path', basePath = '/', enableViewTransitions = true } = options

  const [searchParams, setSearchParams] = useState(
    () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),
  )
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : ''))

  // Internal isolated state for memory mode
  const [memoryStack, setMemoryStack] = useState<string[]>(['/'])
  const [memoryIndex, setMemoryIndex] = useState(0)

  // Get current path based on mode
  const currentPath = useMemo(() => {
    if (mode === 'memory') {
      return memoryStack[memoryIndex]
    }
    if (mode === 'pathname') {
      if (pathname === basePath || pathname === `${basePath}/`) {
        return '/'
      }
      if (pathname.startsWith(basePath)) {
        return pathname.slice(basePath.length) || '/'
      }
      return '/'
    }
    return searchParams.get(paramName) || '/'
  }, [mode, pathname, searchParams, paramName, basePath, memoryStack, memoryIndex])

  const otherParams = useMemo(() => {
    const params = new URLSearchParams(searchParams)
    if (mode !== 'memory') {
      params.delete(paramName)
    }
    return params
  }, [searchParams, paramName, mode])

  // --- Wrap popstate in a View Transition ---
  useEffect(() => {
    if (mode === 'memory') return // Do not attach browser listeners in memory mode

    const handlePopState = () => {
      const updateState = () => {
        setSearchParams(new URLSearchParams(window.location.search))
        setPathname(window.location.pathname)
      }

      // Intercept the browser back/forward buttons with View Transitions
      if (enableViewTransitions && document.startViewTransition) {
        document.startViewTransition(() => {
          flushSync(() => {
            updateState()
          })
        })
      } else {
        updateState()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [enableViewTransitions, mode])

  // Push new path to history
  const push = useCallback(
    (path: string, additionalParams: Params = {}, state: any = null) => {
      if (mode === 'memory') {
        setMemoryStack(prev => [...prev.slice(0, memoryIndex + 1), path || '/'])
        setMemoryIndex(prev => prev + 1)
        return
      }

      if (mode === 'pathname') {
        const newPathname = path === '/' || !path ? basePath : `${basePath}${path}`
        const newParams = new URLSearchParams()
        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) newParams.set(key, String(value))
        })
        const newSearch = newParams.toString()
        const newUrl = `${newPathname}${newSearch ? `?${newSearch}` : ''}`

        window.history.pushState(state, '', newUrl)
        setPathname(newPathname)
        setSearchParams(newParams)
      } else {
        const newParams = new URLSearchParams(window.location.search)
        if (path) {
          newParams.set(paramName, path)
        } else {
          newParams.delete(paramName)
        }

        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            newParams.set(key, String(value))
          } else {
            newParams.delete(key)
          }
        })

        const newUrl = `${window.location.pathname}?${newParams.toString()}`
        window.history.pushState(state, '', newUrl)
        setSearchParams(newParams)
      }
    },
    [mode, basePath, paramName, memoryIndex],
  )

  // Replace current path in history
  const replace = useCallback(
    (path: string, additionalParams: Params = {}, state: any = null) => {
      if (mode === 'memory') {
        setMemoryStack(prev => [...prev.slice(0, memoryIndex), path || '/'])
        return
      }

      if (mode === 'pathname') {
        const newPathname = path === '/' || !path ? basePath : `${basePath}${path}`
        const newParams = new URLSearchParams()
        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) newParams.set(key, String(value))
        })
        const newSearch = newParams.toString()
        const newUrl = `${newPathname}${newSearch ? `?${newSearch}` : ''}`

        window.history.replaceState(state, '', newUrl)
        setPathname(newPathname)
        setSearchParams(newParams)
      } else {
        const newParams = new URLSearchParams(window.location.search)
        if (path) {
          newParams.set(paramName, path)
        } else {
          newParams.delete(paramName)
        }

        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            newParams.set(key, String(value))
          } else {
            newParams.delete(key)
          }
        })

        const newUrl = `${window.location.pathname}?${newParams.toString()}`
        window.history.replaceState(state, '', newUrl)
        setSearchParams(newParams)
      }
    },
    [mode, basePath, paramName, memoryIndex],
  )

  const updateParams = useCallback(
    (params: Params, replaceHistory = false) => {
      if (mode === 'memory') return

      const newParams = new URLSearchParams(window.location.search)
      Object.entries(params).forEach(([key, value]) => {
        if (key !== paramName) {
          if (value !== null && value !== undefined) {
            newParams.set(key, String(value))
          } else {
            newParams.delete(key)
          }
        }
      })

      const newUrl = `${window.location.pathname}?${newParams.toString()}`

      if (replaceHistory) {
        window.history.replaceState(null, '', newUrl)
      } else {
        window.history.pushState(null, '', newUrl)
      }
      setSearchParams(newParams)
    },
    [paramName, mode],
  )

  const clearParams = useCallback(
    (keepPath = true) => {
      if (mode === 'memory') return

      const newParams = new URLSearchParams()
      let newUrl = window.location.pathname

      if (mode === 'search' && keepPath && currentPath && currentPath !== '/') {
        newParams.set(paramName, currentPath)
      }

      const newSearchString = newParams.toString()
      if (newSearchString) {
        newUrl = `${newUrl}?${newSearchString}`
      }

      window.history.pushState(null, '', newUrl)
      setSearchParams(newParams)
    },
    [currentPath, paramName, mode],
  )

  const getParam = useCallback(
    (key: string) => {
      if (mode === 'memory') return null
      return searchParams.get(key)
    },
    [searchParams, mode],
  )

  const hasParam = useCallback(
    (key: string) => {
      if (mode === 'memory') return false
      return searchParams.has(key)
    },
    [searchParams, mode],
  )

  const goBack = useCallback(() => {
    if (mode === 'memory') {
      setMemoryIndex(prev => Math.max(0, prev - 1))
      return
    }
    window.history.back()
  }, [mode])

  const goForward = useCallback(() => {
    if (mode === 'memory') {
      setMemoryIndex(prev => Math.min(memoryStack.length - 1, prev + 1))
      return
    }
    window.history.forward()
  }, [mode, memoryStack.length])

  const go = useCallback(
    (n: number) => {
      if (mode === 'memory') {
        setMemoryIndex(prev => Math.max(0, Math.min(memoryStack.length - 1, prev + n)))
        return
      }
      window.history.go(n)
    },
    [mode, memoryStack.length],
  )

  return {
    path: currentPath,
    searchParams,
    otherParams,
    push,
    replace,
    goBack,
    goForward,
    go,
    updateParams,
    clearParams,
    getParam,
    hasParam,
    length: mode === 'memory' ? memoryStack.length : typeof window !== 'undefined' ? window.history.length : 0,
    href: typeof window !== 'undefined' ? window.location.href : '',
    basename: typeof window !== 'undefined' ? window.location.pathname : '',
  }
}

export default useShallowRouter
