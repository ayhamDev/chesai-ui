import {
  type MotionStyle,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react' // Import useEffect
import type { AppBarSharedProps } from '../components/appbar'

// --- HOOK DEFINITION ---
export type UseAppBarOptions = AppBarSharedProps

export const useAppBar = (
  options: UseAppBarOptions & {
    // FIX: Added 'surface-container' and 'transparent' to match AppBar component props
    appBarColor?: 'background' | 'card' | 'primary' | 'secondary' | 'surface-container' | 'transparent'
  },
) => {
  const {
    scrollBehavior = 'sticky',
    animatedBehavior = [],
    animatedColor = 'secondary',
    appBarColor = 'card',
    size = 'md',
    largeHeaderContent,
    smallHeaderContent,
    stickyHideTarget,
    scrollContainerRef,
    normalHeaderRowHeight = 64,
    largeHeaderRowHeight = 96,
    foldAnimationDistance = 50,
    foldBorderRadius = 24,
    // --- MODIFICATION: Destructure the new routeKey prop ---
    routeKey,
  } = options

  // --- REFS & STATE ---
  const mainRowRef = useRef<HTMLDivElement>(null)
  const largeHeaderRef = useRef<HTMLDivElement>(null)

  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll({ container: scrollContainerRef })
  const headerY = useMotionValue(0)

  const [measuredHeights, setMeasuredHeights] = useState({
    mainRow: size === 'lg' ? largeHeaderRowHeight : normalHeaderRowHeight,
    largeContent: 0,
  })

  // --- BEHAVIOR LOGIC ---
  const isCollapsible = size === 'lg' && !!largeHeaderContent && !!smallHeaderContent
  const shouldRenderLargeContent = size === 'lg' && !!largeHeaderContent

  // --- MEASUREMENT EFFECTS ---
  useLayoutEffect(() => {
    const measuredMainRow = mainRowRef.current?.offsetHeight
    const measuredLargeContent = largeHeaderRef.current?.offsetHeight
    if (
      (measuredMainRow && measuredMainRow !== measuredHeights.mainRow) ||
      (measuredLargeContent !== undefined && measuredLargeContent !== measuredHeights.largeContent)
    ) {
      setMeasuredHeights({
        mainRow: measuredMainRow || measuredHeights.mainRow,
        largeContent: measuredLargeContent || 0,
      })
    }
  })

  // --- MODIFICATION: Add useEffect to reset AppBar position on route change ---
  useEffect(() => {
    // Reset the header's vertical position whenever the route changes.
    // This ensures the new screen's AppBar is always visible on mount.
    headerY.set(0)
  }, [routeKey, headerY])
  // --- END MODIFICATION ---

  // --- ANIMATION LOGIC ---
  useMotionValueEvent(scrollY, 'change', latest => {
    setIsScrolled(latest > 10)

    if (scrollBehavior === 'conditionally-sticky') {
      const { mainRow, largeContent } = measuredHeights
      const collapseDistance = isCollapsible ? largeContent : 0

      let heightToHide: number
      if (stickyHideTarget === 'full-appbar' && size === 'lg') {
        heightToHide = mainRow + largeContent
      } else if (stickyHideTarget === 'main-row') {
        heightToHide = isCollapsible ? normalHeaderRowHeight : mainRow
      } else {
        heightToHide = isCollapsible ? normalHeaderRowHeight : mainRow + largeContent
      }

      const scrollPastCollapse = latest - collapseDistance
      if (scrollPastCollapse <= 0) {
        headerY.set(0)
        return
      }

      const previous = scrollY.getPrevious() ?? 0
      const previousScrollPastCollapse = Math.max(0, previous - collapseDistance)
      const delta = scrollPastCollapse - previousScrollPastCollapse
      const newHeaderY = headerY.get() - delta

      const clampedHeaderY = Math.max(-heightToHide, Math.min(newHeaderY, 0))
      headerY.set(clampedHeaderY)
    } else {
      headerY.set(0)
    }
  })

  // --- DERIVED ANIMATION VALUES ---
  const shouldAnimateColor = animatedBehavior.includes('appbar-color')
  const shouldFold = animatedBehavior.includes('fold')
  const shouldAnimateShadow = animatedBehavior.includes('shadow')

  const finalColor = shouldAnimateColor && isScrolled ? animatedColor : appBarColor
  const finalShadow: 'md' | 'none' = shouldAnimateShadow && isScrolled ? 'md' : 'none'

  const animatedBorderRadius = useTransform(scrollY, [0, foldAnimationDistance], [0, foldBorderRadius], { clamp: true })

  const collapseAnimDistance = measuredHeights.largeContent
  const measuredLargeRowHeight = measuredHeights.mainRow
  const totalExpandedHeight = measuredLargeRowHeight + collapseAnimDistance

  const animatedTotalHeight = useTransform(
    scrollY,
    [0, collapseAnimDistance],
    [totalExpandedHeight, normalHeaderRowHeight],
    { clamp: true },
  )
  const smoothAnimatedTotalHeight = useSpring(animatedTotalHeight, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  })

  const animatedMainRowHeight = useTransform(
    scrollY,
    [0, collapseAnimDistance],
    [measuredLargeRowHeight, normalHeaderRowHeight],
    { clamp: true },
  )
  const headerRowHeight = isCollapsible ? animatedMainRowHeight : measuredHeights.mainRow

  const largeHeaderOpacity = useTransform(scrollY, [0, collapseAnimDistance * 0.75], [1, 0], { clamp: true })
  const largeHeaderY = useTransform(scrollY, [0, collapseAnimDistance], [0, -40], { clamp: true })

  const titleCrossFadeStart = collapseAnimDistance * 0.4
  const titleCrossFadeEnd = collapseAnimDistance * 0.9

  const childrenOpacity = useTransform(scrollY, [titleCrossFadeStart, titleCrossFadeEnd], [1, 0], { clamp: true })
  const smallHeaderOpacity = useTransform(scrollY, [titleCrossFadeStart, titleCrossFadeEnd], [0, 1], { clamp: true })

  const contentPaddingTop = shouldRenderLargeContent ? totalExpandedHeight + 10 : measuredHeights.mainRow + 20

  return {
    isScrolled,
    contentPaddingTop,
    headerProps: {
      style: {
        y: headerY,
        height: isCollapsible ? smoothAnimatedTotalHeight : undefined,
        borderBottomLeftRadius: shouldFold ? animatedBorderRadius : undefined,
        borderBottomRightRadius: shouldFold ? animatedBorderRadius : undefined,
      } as MotionStyle,
    },
    mainRowProps: {
      ref: mainRowRef,
      style: { height: headerRowHeight },
    },
    largeContentProps: {
      ref: largeHeaderRef,
      style: {
        opacity: isCollapsible ? largeHeaderOpacity : 1,
        y: isCollapsible ? largeHeaderY : 0,
        pointerEvents: isScrolled && isCollapsible ? 'none' : 'auto',
      } as MotionStyle,
    },
    childrenContainerProps: {
      style: { opacity: isCollapsible ? childrenOpacity : 1 },
    },
    smallHeaderProps: {
      style: { opacity: smallHeaderOpacity },
    },
    finalColor,
    finalShadow,
    isCollapsible,
    shouldRenderLargeContent,
  }
}
