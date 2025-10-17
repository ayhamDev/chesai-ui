"use client";

import {
  AnimatePresence,
  motion,
  type Easing,
  type Transition,
} from "framer-motion";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { EASING } from "../stack-router/transitions";

// --- TYPES & CONSTANTS ---
const defaultEasing: Easing | Easing[] = EASING.iOS;
const defaultDuration = 0.5;

// --- CONTEXTS ---
interface LayoutRouterContextType {
  selectedId: string | null;
  navigate: (id: string) => void;
  goBack: () => void;
}
const LayoutRouterContext = createContext<LayoutRouterContextType | null>(null);

interface LayoutRouterConfigContextType {
  transition: Transition;
}
const LayoutRouterConfigContext = createContext<LayoutRouterConfigContextType>({
  transition: { duration: defaultDuration, ease: defaultEasing },
});

interface LayoutIdContextType {
  baseId: string;
}
const LayoutIdContext = createContext<LayoutIdContextType | null>(null);

// --- HOOKS ---
export const useLayoutRouter = () => {
  const context = useContext(LayoutRouterContext);
  if (!context) {
    throw new Error("useLayoutRouter must be used within a LayoutRouter.Root");
  }
  return context;
};

// --- COMPOUND COMPONENTS ---
interface LayoutRouterRootProps {
  children: ReactNode;
  duration?: number;
  easing?: Easing | Easing[];
}
const LayoutRouterRoot = ({
  children,
  duration = defaultDuration,
  easing = defaultEasing,
}: LayoutRouterRootProps) => {
  const [stack, setStack] = useState<string[]>(
    () => (typeof window !== "undefined" && window.history.state?.stack) || []
  );

  const selectedId = stack.length > 0 ? stack[stack.length - 1] : null;

  useLayoutEffect(() => {
    if (typeof window !== "undefined" && !window.history.state?.stack) {
      window.history.replaceState({ ...window.history.state, stack }, "");
    }
  }, [stack]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && Array.isArray(event.state.stack)) {
        setStack(event.state.stack);
      } else if (event.state === null || event.state?.stack === undefined) {
        setStack([]);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigationValue = useMemo(
    () => ({
      selectedId,
      navigate: (id: string) => {
        const newStack = [...stack, id];
        window.history.pushState(
          { ...window.history.state, stack: newStack },
          ""
        );
        setStack(newStack);
      },
      goBack: () => {
        window.history.back();
      },
    }),
    [selectedId, stack]
  );

  // --- NEW: Escape Key Listener ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedId) {
        navigationValue.goBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, navigationValue]);
  // --- END NEW ---

  const configValue = useMemo(
    () => ({
      transition: { duration, ease: easing },
    }),
    [duration, easing]
  );

  const listChild = React.Children.toArray(children).find(
    (child): child is ReactElement =>
      React.isValidElement(child) && child.type === LayoutRouterList
  );
  const screenChildren = React.Children.toArray(children).filter(
    (child): child is ReactElement<{ id: string }> =>
      React.isValidElement(child) && child.type === LayoutRouterScreen
  );

  const activeScreen = screenChildren.find(
    (child) => child.props.id === selectedId
  );

  return (
    <LayoutRouterContext.Provider value={navigationValue}>
      <LayoutRouterConfigContext.Provider value={configValue}>
        {listChild}
        <AnimatePresence>{activeScreen}</AnimatePresence>
      </LayoutRouterConfigContext.Provider>
    </LayoutRouterContext.Provider>
  );
};
LayoutRouterRoot.displayName = "LayoutRouter.Root";

const LayoutRouterList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
LayoutRouterList.displayName = "LayoutRouter.List";

const LayoutRouterLink = ({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) => {
  const { navigate } = useLayoutRouter();
  const { transition } = useContext(LayoutRouterConfigContext);
  return (
    <LayoutIdContext.Provider value={{ baseId: id }}>
      <motion.div
        layoutId={`card-${id}`}
        onClick={() => navigate(id)}
        className={className}
        transition={transition}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </LayoutIdContext.Provider>
  );
};
LayoutRouterLink.displayName = "LayoutRouter.Link";

const LayoutRouterSharedElement = ({
  tag,
  children,
  className,
}: {
  tag: string;
  children: ReactNode;
  className?: string;
}) => {
  const context = useContext(LayoutIdContext);
  const { transition } = useContext(LayoutRouterConfigContext);
  if (!context) {
    throw new Error("SharedElement must be used inside a Link or Screen");
  }
  return (
    <motion.div
      layoutId={`${context.baseId}-${tag}`}
      className={className}
      transition={transition}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
};
LayoutRouterSharedElement.displayName = "LayoutRouter.SharedElement";

// --- MODIFIED: LayoutRouterScreen ---
const LayoutRouterScreen = ({
  id,
  children,
  presentation = "fullscreen",
}: {
  id: string;
  children: ReactNode;
  presentation?: "fullscreen" | "modal";
}) => {
  const { transition } = useContext(LayoutRouterConfigContext);
  const { goBack } = useLayoutRouter();

  const containerClasses =
    presentation === "fullscreen"
      ? "absolute inset-0 z-50 pointer-events-auto"
      : "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto";

  const contentClasses =
    presentation === "fullscreen"
      ? "w-full h-full bg-graphite-background"
      : "w-full max-w-lg rounded-2xl bg-graphite-card shadow-2xl overflow-hidden";

  return (
    <LayoutIdContext.Provider value={{ baseId: id }}>
      <div className={containerClasses}>
        {/* Backdrop for modal presentation */}
        {presentation === "modal" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={goBack}
          />
        )}
        <motion.div
          layoutId={`card-${id}`}
          className={contentClasses}
          transition={transition}
          style={{ willChange: "transform, opacity" }}
        >
          {children}
        </motion.div>
      </div>
    </LayoutIdContext.Provider>
  );
};
LayoutRouterScreen.displayName = "LayoutRouter.Screen";
// --- END MODIFICATION ---

export const LayoutRouter = Object.assign(LayoutRouterRoot, {
  List: LayoutRouterList,
  Link: LayoutRouterLink,
  Screen: LayoutRouterScreen,
  SharedElement: LayoutRouterSharedElement,
});
