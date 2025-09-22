import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// --- CONSTANTS ---
const FALLBACK_NORMAL_HEADER_ROW_HEIGHT = 64;
const FALLBACK_LARGE_HEADER_ROW_HEIGHT = 96;
const FOLD_ANIMATION_DISTANCE = 50; // How many pixels to scroll to complete the fold
const FOLD_BORDER_RADIUS = 24; // Equivalent to rounded-3xl

// --- TYPE DEFINITIONS ---
type AppBarColor = "background" | "card" | "primary" | "secondary";
type AppBarScrollBehavior = "sticky" | "conditionally-sticky";
// Added 'fold' to the possible behaviors
type AppBarAnimatedBehavior = "none" | "appbar-color" | "fold";
type AppBarSize = "md" | "lg";
type StickyHideTarget = "main-row" | "full-appbar";

// --- CONTEXT (No changes) ---
interface AppBarContextProps {
  isScrolled: boolean;
  scrollY: MotionValue<number>;
  headerY: MotionValue<number>;
  setCollapseDistance: (distance: number) => void;
  setHeightToHideForSticky: (height: number) => void;
  setScrollBehavior: (behavior: AppBarScrollBehavior) => void;
}
const AppBarContext = createContext<AppBarContextProps | null>(null);
const useAppBarContext = () => {
  const context = useContext(AppBarContext);
  if (!context) {
    throw new Error(
      "AppBar components must be used within an <AppBar.Provider>"
    );
  }
  return context;
};

// --- PROVIDER (No changes) ---
interface AppBarProviderProps {
  children: React.ReactNode;
  mainContentColor?: AppBarColor;
}

const AppBarProvider: React.FC<AppBarProviderProps> = ({
  children,
  mainContentColor = "card",
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });

  const headerY = useMotionValue(0);
  const [collapseDistance, setCollapseDistance] = useState(0);
  const [heightToHideForSticky, setHeightToHideForSticky] = useState(
    FALLBACK_NORMAL_HEADER_ROW_HEIGHT
  );
  const [scrollBehavior, setScrollBehavior] =
    useState<AppBarScrollBehavior>("sticky");

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);

    if (scrollBehavior === "conditionally-sticky") {
      const scrollPastCollapse = latest - collapseDistance;

      if (scrollPastCollapse <= 0) {
        headerY.set(0);
        return;
      }

      const previous = scrollY.getPrevious() ?? 0;
      const previousScrollPastCollapse = Math.max(
        0,
        previous - collapseDistance
      );
      const delta = scrollPastCollapse - previousScrollPastCollapse;
      const newHeaderY = headerY.get() - delta;

      const clampedHeaderY = Math.max(
        -heightToHideForSticky,
        Math.min(newHeaderY, 0)
      );
      headerY.set(clampedHeaderY);
    } else {
      headerY.set(0);
    }
  });

  const backgroundClasses: Record<AppBarColor, string> = {
    background: "bg-graphite-background",
    card: "bg-graphite-card",
    primary: "bg-graphite-primary",
    secondary: "bg-graphite-secondary",
  };

  return (
    <AppBarContext.Provider
      value={{
        isScrolled,
        scrollY,
        headerY,
        setCollapseDistance,
        setHeightToHideForSticky,
        setScrollBehavior,
      }}
    >
      <div
        ref={scrollRef}
        className={clsx(
          "h-screen overflow-y-auto",
          backgroundClasses[mainContentColor]
        )}
      >
        {children}
      </div>
    </AppBarContext.Provider>
  );
};

// --- APP BAR ---
const appBarVariants = cva(
  "fixed top-0 z-40 w-full transition-colors duration-300 ease-in-out",
  {
    variants: {
      appBarColor: {
        background: "bg-graphite-background text-graphite-foreground",
        card: "bg-graphite-card text-graphite-foreground",
        primary: "bg-graphite-primary text-graphite-primaryForeground",
        secondary: "bg-graphite-secondary text-graphite-secondaryForeground",
      },
    },
    defaultVariants: {
      appBarColor: "card",
    },
  }
);

export interface AppBarProps
  extends Omit<React.ComponentProps<typeof motion.header>, "color">,
    VariantProps<typeof appBarVariants> {
  children?: React.ReactNode;
  startAdornment?: React.ReactNode;
  centerAdornment?: React.ReactNode;
  endAdornments?: React.ReactNode[];
  scrollBehavior?: AppBarScrollBehavior;
  // Prop is now an array of behaviors
  animatedBehavior?: AppBarAnimatedBehavior[];
  animatedColor?: AppBarColor;
  size?: AppBarSize;
  largeHeaderContent?: React.ReactNode;
  smallHeaderContent?: React.ReactNode;
  stickyHideTarget?: StickyHideTarget;
}

const AppBarRoot = React.forwardRef<HTMLElement, AppBarProps>(
  (
    {
      className,
      children,
      appBarColor = "card",
      startAdornment,
      centerAdornment,
      endAdornments = [],
      scrollBehavior = "sticky",
      // Default to an empty array for safety
      animatedBehavior = [],
      animatedColor = "secondary",
      size = "md",
      largeHeaderContent,
      smallHeaderContent,
      stickyHideTarget,
      ...props
    },
    ref
  ) => {
    const {
      isScrolled,
      scrollY,
      headerY,
      setCollapseDistance,
      setHeightToHideForSticky,
      setScrollBehavior,
    } = useAppBarContext();

    const mainRowRef = useRef<HTMLDivElement>(null);
    const largeHeaderRef = useRef<HTMLDivElement>(null);

    const [measuredHeights, setMeasuredHeights] = useState({
      mainRow:
        size === "lg"
          ? FALLBACK_LARGE_HEADER_ROW_HEIGHT
          : FALLBACK_NORMAL_HEADER_ROW_HEIGHT,
      largeContent: 0,
    });

    const isCollapsible =
      size === "lg" && !!largeHeaderContent && !!smallHeaderContent;
    const shouldRenderLargeContent = size === "lg" && !!largeHeaderContent;

    useEffect(() => {
      setScrollBehavior(scrollBehavior);
    }, [scrollBehavior, setScrollBehavior]);

    useLayoutEffect(() => {
      const measuredMainRow = mainRowRef.current?.offsetHeight;
      const measuredLargeContent = largeHeaderRef.current?.offsetHeight;
      if (
        (measuredMainRow && measuredMainRow !== measuredHeights.mainRow) ||
        (measuredLargeContent !== undefined &&
          measuredLargeContent !== measuredHeights.largeContent)
      ) {
        setMeasuredHeights({
          mainRow: measuredMainRow || measuredHeights.mainRow,
          largeContent: measuredLargeContent || 0,
        });
      }
    });

    useEffect(() => {
      const { mainRow, largeContent } = measuredHeights;
      const currentCollapseDistance = isCollapsible ? largeContent : 0;
      setCollapseDistance(currentCollapseDistance);
      let heightToHide: number;
      if (isCollapsible) {
        heightToHide = FALLBACK_NORMAL_HEADER_ROW_HEIGHT;
      } else {
        heightToHide = mainRow + largeContent;
      }
      if (stickyHideTarget === "full-appbar" && size === "lg") {
        heightToHide = mainRow + largeContent;
      } else if (stickyHideTarget === "main-row") {
        heightToHide = isCollapsible
          ? FALLBACK_NORMAL_HEADER_ROW_HEIGHT
          : mainRow;
      }
      setHeightToHideForSticky(heightToHide);
    }, [
      measuredHeights,
      isCollapsible,
      size,
      stickyHideTarget,
      setCollapseDistance,
      setHeightToHideForSticky,
    ]);

    // --- REFACTORED ANIMATION LOGIC ---
    const shouldAnimateColor = animatedBehavior.includes("appbar-color");
    const shouldFold = animatedBehavior.includes("fold");

    const finalColor =
      shouldAnimateColor && isScrolled ? animatedColor : appBarColor;

    // New animation for the folding effect
    const animatedBorderRadius = useTransform(
      scrollY,
      [0, FOLD_ANIMATION_DISTANCE],
      [0, FOLD_BORDER_RADIUS],
      { clamp: true }
    );

    // --- (Rest of the animation logic is unchanged) ---
    const collapseAnimDistance = measuredHeights.largeContent;
    const largeRowHeight = measuredHeights.mainRow;
    const totalExpandedHeight = largeRowHeight + collapseAnimDistance;
    const animatedTotalHeight = useTransform(
      scrollY,
      [0, collapseAnimDistance],
      [totalExpandedHeight, FALLBACK_NORMAL_HEADER_ROW_HEIGHT],
      { clamp: true }
    );
    const smoothAnimatedTotalHeight = useSpring(animatedTotalHeight, {
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    });
    const animatedMainRowHeight = useTransform(
      scrollY,
      [0, collapseAnimDistance],
      [largeRowHeight, FALLBACK_NORMAL_HEADER_ROW_HEIGHT],
      { clamp: true }
    );
    const headerRowHeight = isCollapsible
      ? animatedMainRowHeight
      : measuredHeights.mainRow;
    const largeHeaderOpacity = useTransform(
      scrollY,
      [0, collapseAnimDistance * 0.75],
      [1, 0],
      { clamp: true }
    );
    const largeHeaderY = useTransform(
      scrollY,
      [0, collapseAnimDistance],
      [0, -40],
      { clamp: true }
    );
    const titleCrossFadeStart = collapseAnimDistance * 0.4;
    const titleCrossFadeEnd = collapseAnimDistance * 0.9;
    const childrenOpacity = useTransform(
      scrollY,
      [titleCrossFadeStart, titleCrossFadeEnd],
      [1, 0],
      { clamp: true }
    );
    const smallHeaderOpacity = useTransform(
      scrollY,
      [titleCrossFadeStart, titleCrossFadeEnd],
      [0, 1],
      { clamp: true }
    );

    return (
      <motion.header
        ref={ref}
        className={clsx(
          appBarVariants({ appBarColor: finalColor, className }),
          // Add overflow-hidden when folding or collapsing to clip content
          (isCollapsible || shouldFold) && "overflow-hidden"
        )}
        style={{
          y: headerY,
          height: isCollapsible ? smoothAnimatedTotalHeight : undefined,
          // Conditionally apply the folding animation style
          borderBottomLeftRadius: shouldFold ? animatedBorderRadius : undefined,
          borderBottomRightRadius: shouldFold
            ? animatedBorderRadius
            : undefined,
        }}
        {...props}
      >
        <motion.div
          ref={mainRowRef}
          className="flex w-full items-center "
          style={{ height: headerRowHeight }}
        >
          {/* ... (inner content is unchanged) ... */}
          <div className="flex flex-1 items-center gap-2 px-4 min-w-0">
            {startAdornment && (
              <div className="flex justify-center items-center min-w-max">
                {startAdornment}
              </div>
            )}
            <div className="min-w-0 relative flex-1">
              <motion.div
                style={{ opacity: isCollapsible ? childrenOpacity : 1 }}
              >
                {children}
              </motion.div>
              {isCollapsible && (
                <motion.div
                  style={{ opacity: smallHeaderOpacity }}
                  className="absolute inset-0 flex items-center"
                >
                  {smallHeaderContent}
                </motion.div>
              )}
            </div>
          </div>
          {centerAdornment && (
            <div className="flex justify-center items-center min-w-max flex-1 ">
              {centerAdornment}
            </div>
          )}
          <div className="flex items-center justify-end gap-1 px-4">
            {endAdornments.map((adornment, index) => (
              <React.Fragment key={index}>{adornment}</React.Fragment>
            ))}
          </div>
        </motion.div>

        {shouldRenderLargeContent && (
          <motion.div
            ref={largeHeaderRef}
            style={{
              opacity: isCollapsible ? largeHeaderOpacity : 1,
              y: isCollapsible ? largeHeaderY : 0,
              pointerEvents: isScrolled && isCollapsible ? "none" : "auto",
            }}
            className="px-4 pb-4"
          >
            {largeHeaderContent}
          </motion.div>
        )}
      </motion.header>
    );
  }
);
AppBarRoot.displayName = "AppBar";

export const AppBar = Object.assign(AppBarRoot, {
  Provider: AppBarProvider,
});
