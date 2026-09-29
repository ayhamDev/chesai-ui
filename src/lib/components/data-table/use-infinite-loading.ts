import { useLayoutEffect, useRef, useState } from 'react'
import type { DataTableInfiniteScroll } from './types'

/** Latch each loaded range, including callbacks that schedule work and return void. */
export function useInfiniteLoading({
  enabled,
  config,
  rowCount,
  resetKey,
  isLoading,
}: {
  enabled: boolean
  config?: DataTableInfiniteScroll
  rowCount: number
  resetKey: string
  isLoading: boolean
}) {
  const request = useRef<{ key: string; count: number } | null>(null)
  const generation = useRef(0)
  const previousKey = useRef(resetKey)
  const mounted = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  useLayoutEffect(() => {
    mounted.current = true
    if (previousKey.current !== resetKey) {
      previousKey.current = resetKey
      generation.current++
      request.current = null
      setPending(false)
      setError(null)
    }
    return () => {
      mounted.current = false
    }
  }, [resetKey])
  const loadMore = (retry = false) => {
    if (!enabled || !config?.hasNextPage || config.isFetching || isLoading || pending) return
    if (!retry && (error || config.error || (request.current?.key === resetKey && request.current.count === rowCount)))
      return
    request.current = { key: resetKey, count: rowCount }
    const currentGeneration = generation.current
    setError(null)
    setPending(true)
    try {
      Promise.resolve(config.onLoadMore())
        .catch(reason => {
          if (mounted.current && generation.current === currentGeneration)
            setError(reason || new Error('Loading failed'))
        })
        .finally(() => {
          if (mounted.current && generation.current === currentGeneration) setPending(false)
        })
    } catch (reason) {
      setError(reason || new Error('Loading failed'))
      setPending(false)
    }
  }
  return {
    loadMore,
    retry: () => loadMore(true),
    error: error || config?.error,
    isFetching: pending || config?.isFetching,
  }
}
