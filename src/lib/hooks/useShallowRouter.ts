import { useCallback, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom' // <-- ADD THIS IMPORT

// --- TYPE DEFINITIONS ---
type HistoryMode = 'search' | 'pathname'

interface UseHistoryOptions {
  mode?: HistoryMode
  paramName?: string
  basePath?: string
  /**
   * NEW: Enable View Transitions automatically on browser back/forward buttons
   * Defaults to true to make it universal
   */
  enableViewTransitions?: boolean
}

type Params = Record<string, string | number | boolean | null | undefined>

// --- HOOK IMPLEMENTATION ---
const useShallowRouter = (options: UseHistoryOptions = {}) => {
  const {
    mode = 'search',
    paramName = 'path',
    basePath = '/',
    enableViewTransitions = true, // <-- NEW DEFAULT
  } = options

  const [searchParams, setSearchParams] = useState(
    () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),
  )
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : ''))

  // Get current path based on mode
  const currentPath = useMemo(() => {
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
  }, [mode, pathname, searchParams, paramName, basePath])

  const otherParams = useMemo(() => {
    const params = new URLSearchParams(searchParams)
    params.delete(paramName)
    return params
  }, [searchParams, paramName])

  // --- THE FIX: Wrap popstate in a View Transition ---
  useEffect(() => {
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
  }, [enableViewTransitions])

  // Push new path to history
  const push = useCallback(
    (path: string, additionalParams: Params = {}, state: any = null) => {
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
    [mode, basePath, paramName],
  )

  // Replace current path in history
  const replace = useCallback(
    (path: string, additionalParams: Params = {}, state: any = null) => {
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
    [mode, basePath, paramName],
  )

  const updateParams = useCallback(
    (params: Params, replaceHistory = false) => {
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
    [paramName],
  )

  const clearParams = useCallback(
    (keepPath = true) => {
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

  const getParam = useCallback((key: string) => searchParams.get(key), [searchParams])

  const hasParam = useCallback((key: string) => searchParams.has(key), [searchParams])

  const goBack = useCallback(() => window.history.back(), [])
  const goForward = useCallback(() => window.history.forward(), [])
  const go = useCallback((n: number) => window.history.go(n), [])

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
    length: typeof window !== 'undefined' ? window.history.length : 0,
    href: typeof window !== 'undefined' ? window.location.href : '',
    basename: typeof window !== 'undefined' ? window.location.pathname : '',
  }
}

export default useShallowRouter
