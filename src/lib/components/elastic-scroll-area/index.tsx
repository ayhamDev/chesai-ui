import { useDirection } from "../../context/direction";
// src/lib/components/elastic-scroll-area/index.tsx
'use client'

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { clsx } from 'clsx'
import { type MotionValue, motion, useMotionValue, useTransform } from 'framer-motion'
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ElementRef,
  forwardRef,
  type ForwardRefExoticComponent,
  type FC,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { LoadingIndicator } from '../loadingIndicator'
import { normalizePullThreshold, useElasticAndRefresh } from './use-elastic-scroll'

// --- CONSTANTS ---
const OVERSCROLL_DAMPING = 0.25
const DEFAULT_PULL_THRESHOLD = 80

// --- TYPE DEFINITIONS ---
interface RefreshIndicatorProps {
  pullProgress: MotionValue<number>
  isRefreshing: boolean
  pullThreshold?: number
}

export interface ElasticScrollAreaProps extends ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  orientation?: 'vertical' | 'horizontal'
  /** Enable content bounce. Pull-to-refresh works independently when false. */
  elasticity?: boolean
  dampingFactor?: number
  scrollbarVisibility?: 'auto' | 'always' | 'scroll' | 'hidden' | 'visible'
  /** Hide both scrollbars below the md breakpoint (768px by default), while keeping scrolling enabled. */
  hideScrollbarOnMobile?: boolean
  /** Enable top-edge touch refresh, including when elasticity is disabled. Requires onRefresh. */
  pullToRefresh?: boolean
  onRefresh?: () => Promise<unknown>
  onRefreshError?: (error: unknown) => void
  pullThreshold?: number
  RefreshIndicatorComponent?: ComponentType<RefreshIndicatorProps>
  onScrollUp?: () => void
  onScrollDown?: () => void
  /** Compose a primitive (for example Select.Viewport asChild) onto the actual scroll viewport. */
  renderViewport?: (viewport: ReactElement) => ReactNode
  viewportClassName?: string
  dimmingEdges?: boolean
}

// --- DEFAULT REFRESH INDICATOR ---
const DefaultRefreshIndicator: FC<RefreshIndicatorProps> = ({
  pullProgress,
  isRefreshing,
  pullThreshold = DEFAULT_PULL_THRESHOLD,
}) => {
  const rotation = useTransform(pullProgress, [0, pullThreshold], [0, 360])

  const scale = useTransform(pullProgress, [0, pullThreshold], [0, 1])

  return (
    <motion.div style={{ rotate: rotation, scale: isRefreshing ? 1 : scale }}>
      <LoadingIndicator
        variant="material-morph-background"
        className="w-10 h-10"
        isPlaying={isRefreshing}
        startingShape={1}
      />
    </motion.div>
  )
}

// --- MAIN COMPONENT ---
const ElasticScrollAreaRoot = forwardRef<HTMLDivElement, ElasticScrollAreaProps>(
  (
    {
      className,
      children,
      orientation = 'vertical',
      elasticity = true,
      dampingFactor = OVERSCROLL_DAMPING,
      scrollbarVisibility = 'auto',
      hideScrollbarOnMobile = false,
      pullToRefresh = false,
      onRefresh,
      onRefreshError,
      pullThreshold = DEFAULT_PULL_THRESHOLD,
      RefreshIndicatorComponent = DefaultRefreshIndicator,
      onScrollUp,
      onScrollDown,
      viewportClassName,
      renderViewport = viewport => viewport,
      dimmingEdges = false,
      ...props
    },
    ref,
  ) => {
    const localViewportRef = useRef<HTMLDivElement>(null)
    const isRtl = useDirection(localViewportRef, props.dir) === "rtl"
    useImperativeHandle(ref, () => localViewportRef.current as HTMLDivElement, [])

    const motionValue = useMotionValue(0)
    const indicatorY = useMotionValue(0)
    const isVertical = orientation === 'vertical'
    const refreshEnabled = isVertical && pullToRefresh && typeof onRefresh === 'function'
    const refreshThreshold = normalizePullThreshold(pullThreshold)

    const { isRefreshing } = useElasticAndRefresh(localViewportRef, motionValue, indicatorY, {
      orientation,
      elasticity,
      damping: dampingFactor,
      isRefreshEnabled: refreshEnabled,
      onRefresh,
      onRefreshError,
      pullThreshold: refreshThreshold,
    })

    // Dynamic Edge Dimming State
    const [edges, setEdges] = useState({
      top: false,
      bottom: false,
      left: false,
      right: false,
    })

    const updateEdgeStates = useCallback(() => {
      const viewport = localViewportRef.current
      if (!viewport || !dimmingEdges) return

      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = viewport

      const hasScrollY = scrollHeight > clientHeight
      const hasScrollX = scrollWidth > clientWidth

      setEdges({
        top: hasScrollY && scrollTop > 4,
        bottom: hasScrollY && scrollTop < scrollHeight - clientHeight - 4,
        left: hasScrollX && (isRtl ? -scrollLeft < scrollWidth - clientWidth - 4 : scrollLeft > 4),
        right: hasScrollX && (isRtl ? -scrollLeft > 4 : scrollLeft < scrollWidth - clientWidth - 4),
      })
    }, [dimmingEdges, isRtl])

    useEffect(() => {
      const viewport = localViewportRef.current
      if (!viewport || !dimmingEdges) return

      updateEdgeStates()
      const observer = new ResizeObserver(updateEdgeStates)
      observer.observe(viewport)
      if (viewport.firstElementChild) {
        observer.observe(viewport.firstElementChild)
      }
      return () => observer.disconnect()
    }, [dimmingEdges, updateEdgeStates])

    const indicatorOpacity = useTransform(indicatorY, [0, refreshThreshold * 0.5], [0, 1])

    const lastScrollTop = useRef(0)
    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        updateEdgeStates()
        const currentScrollTop = event.currentTarget.scrollTop
        const scrollDelta = currentScrollTop - lastScrollTop.current

        if (Math.abs(scrollDelta) < 5) return

        if (scrollDelta > 0) {
          onScrollDown?.()
        } else {
          onScrollUp?.()
        }

        lastScrollTop.current = Math.max(0, currentScrollTop)
      },
      [onScrollDown, onScrollUp, updateEdgeStates],
    )

    // Generate dynamic gradients for dynamic edge dimming using CSS mask-image
    const getMaskStyle = () => {
      if (!dimmingEdges) return undefined
      const direction = isVertical ? 'to bottom' : 'to right'
      const startGradient = isVertical
        ? edges.top
          ? 'transparent, rgba(0,0,0,1) 24px'
          : 'rgba(0,0,0,1)'
        : edges.left
          ? 'transparent, rgba(0,0,0,1) 24px'
          : 'rgba(0,0,0,1)'
      const endGradient = isVertical
        ? edges.bottom
          ? 'rgba(0,0,0,1) calc(100% - 24px), transparent'
          : 'rgba(0,0,0,1)'
        : edges.right
          ? 'rgba(0,0,0,1) calc(100% - 24px), transparent'
          : 'rgba(0,0,0,1)'

      const mask = `linear-gradient(${direction}, ${startGradient}, ${endGradient})`
      return {
        WebkitMaskImage: mask,
        maskImage: mask,
      }
    }

    return (
      <ScrollAreaPrimitive.Root className={clsx('relative isolate h-full w-full overflow-hidden!', className)} {...props}>
        {refreshEnabled && (
          <motion.div
            key={'refresh'}
            className="pointer-events-none absolute inset-x-0 top-[-10px] z-50 flex justify-center"
            style={{
              y: indicatorY,
              opacity: indicatorOpacity,
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent">
              <RefreshIndicatorComponent
                pullProgress={indicatorY}
                isRefreshing={isRefreshing}
                pullThreshold={refreshThreshold}
              />
            </div>
          </motion.div>
        )}

        <motion.div
          style={{
            [isVertical ? 'y' : 'x']: elasticity ? motionValue : 0,
            ...getMaskStyle(),
          }}
          className="h-full w-full"
        >
          {renderViewport(<ScrollAreaPrimitive.Viewport
            ref={localViewportRef}
            className={clsx('h-full w-full rounded-[inherit]', viewportClassName)}
            style={{
              touchAction: 'pan-x pan-y pinch-zoom',
              // Prevent native bounce from combining with the synthetic pull.
              overscrollBehaviorX: !isVertical && elasticity ? 'none' : undefined,
              overscrollBehaviorY: isVertical && (elasticity || refreshEnabled) ? 'none' : undefined,
            }}
            onScroll={handleScroll}
          >
            {children}
          </ScrollAreaPrimitive.Viewport>)}
        </motion.div>
        {/* Keep the bars mounted: Radix uses their presence to enable viewport scrolling. */}
        <ScrollBar scrollbarVisibility={scrollbarVisibility} hideScrollbarOnMobile={hideScrollbarOnMobile} orientation="vertical" />
        <ScrollBar scrollbarVisibility={scrollbarVisibility} hideScrollbarOnMobile={hideScrollbarOnMobile} orientation="horizontal" />
        <ScrollAreaPrimitive.Corner className={clsx(scrollbarVisibility === 'hidden' && 'hidden!', hideScrollbarOnMobile && 'max-md:hidden!')} />
      </ScrollAreaPrimitive.Root>
    )
  },
)
ElasticScrollAreaRoot.displayName = 'ElasticScrollArea'

// --- STYLED SUB-COMPONENTS ---
const ScrollBar: ForwardRefExoticComponent<
  ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar> & {
    scrollbarVisibility?: ElasticScrollAreaProps['scrollbarVisibility']
    hideScrollbarOnMobile?: boolean
  } & RefAttributes<ElementRef<typeof ScrollAreaPrimitive.Scrollbar>>
> = forwardRef(
  ({ className, orientation = 'vertical', scrollbarVisibility = 'auto', hideScrollbarOnMobile = false, onWheelCapture, ...props }, ref) => (
    <ScrollAreaPrimitive.Scrollbar
      ref={ref}
      orientation={orientation}
      onWheelCapture={event => {
        onWheelCapture?.(event)
        // Radix's document wheel listener scrolls the bar and cancels zoom otherwise.
        if (event.ctrlKey || event.metaKey) event.stopPropagation()
      }}
      className={clsx(
        'flex touch-none select-none transition-opacity duration-200 z-10',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-[1px]',
        orientation === 'horizontal' && 'h-2.5 border-t border-t-transparent p-[1px]',
        {
          'opacity-100': scrollbarVisibility === 'always' || scrollbarVisibility === 'visible',
          // Radix sets display:flex inline; hiding must take precedence over that style.
          'hidden!': scrollbarVisibility === 'hidden',
          'max-md:hidden!': hideScrollbarOnMobile,
          'data-[state=hidden]:opacity-0': scrollbarVisibility === 'scroll',
          'opacity-0 data-[state=visible]:opacity-100': scrollbarVisibility === 'auto',
        },
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-graphite-primary/30" />
    </ScrollAreaPrimitive.Scrollbar>
  ),
)
ScrollBar.displayName = ScrollAreaPrimitive.Scrollbar.displayName

export const ElasticScrollArea = Object.assign(ElasticScrollAreaRoot, {
  ScrollBar,
}) as typeof ElasticScrollAreaRoot & {
  ScrollBar: typeof ScrollBar
}
