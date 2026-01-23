import React, {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import useShallowRouter from "../../hooks/useShallowRouter";

// --- TYPE DEFINITIONS ---

type RouterMode = "search" | "pathname";

interface RouterOptions {
  mode: RouterMode;
  paramName: string;
  basePath: string;
}

interface ShallowRouterContextType {
  router: ReturnType<typeof useShallowRouter>;
  options: RouterOptions;
}

// --- CONTEXT CREATION & HOOKS ---

const ShallowRouterContext = createContext<ShallowRouterContextType | null>(
  null
);

/**
 * A custom hook to consume the ShallowRouter context.
 * Provides access to routing functions like `push`, `replace`, and the current `path`.
 *
 * @returns {ReturnType<typeof useShallowRouter>} The router instance.
 * @throws {Error} If used outside of a `<ShallowRouter>` provider.
 */
export const useRouter = (): ReturnType<typeof useShallowRouter> => {
  const context = useContext(ShallowRouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a <ShallowRouter> provider");
  }
  return context.router;
};

/**
 * A custom hook to access the configuration options of the nearest ShallowRouter provider.
 * Useful for components that need to behave differently based on the routing mode.
 *
 * @returns {RouterOptions} The router's configuration options.
 * @throws {Error} If used outside of a `<ShallowRouter>` provider.
 */
export const useRouterOptions = (): RouterOptions => {
  const context = useContext(ShallowRouterContext);
  if (!context) {
    throw new Error(
      "useRouterOptions must be used within a <ShallowRouter> provider"
    );
  }
  return context.options;
};

// --- MAIN PROVIDER COMPONENT ---

interface ShallowRouterProps {
  children: ReactNode;
  mode?: RouterMode;
  paramName?: string;
  basePath?: string;
}

/**
 * A provider component that initializes the shallow router and makes its
 * state and methods available to all descendant components.
 */
export const ShallowRouter: React.FC<ShallowRouterProps> = ({
  children,
  mode = "search",
  paramName = "path",
  basePath = "/",
}) => {
  const router = useShallowRouter({ mode, paramName, basePath });
  const options = useMemo(
    () => ({ mode, paramName, basePath }),
    [mode, paramName, basePath]
  );

  const contextValue = useMemo(() => ({ router, options }), [router, options]);

  return (
    <ShallowRouterContext.Provider value={contextValue}>
      {children}
    </ShallowRouterContext.Provider>
  );
};

// --- NEW: ShallowRoute Component ---
interface ShallowRouteProps {
  /** The path to match. Supports a trailing wildcard `*` for prefix matching. */
  path: string;
  children: ReactNode;
}

/**
 * Conditionally renders its children only when its `path` prop matches the current router path.
 * Supports a trailing wildcard `*` for prefix matching (e.g., `/users/*`).
 */
export const ShallowRoute: React.FC<ShallowRouteProps> = ({
  path,
  children,
}) => {
  const { path: currentPath } = useRouter();

  const isWildcard = path.endsWith("/*");
  const basePath = isWildcard ? path.slice(0, -2) : path;

  const isActive = isWildcard
    ? currentPath.startsWith(basePath)
    : currentPath === path;

  return isActive ? <>{children}</> : null;
};

// --- NEW: ShallowPage Component ---
interface ShallowPageProps extends HTMLAttributes<HTMLDivElement> {
  /** The path that this page corresponds to. Used by `ShallowSwitch` to identify the active page. */
  path: string;
}

/**
 * A simple container for a page's content.
 * It should be used as a direct child of `ShallowSwitch`.
 */
export const ShallowPage = React.forwardRef<HTMLDivElement, ShallowPageProps>(
  ({ children, path, ...props }, ref) => {
    return (
      <div ref={ref} key={path} {...props}>
        {children}
      </div>
    );
  }
);
ShallowPage.displayName = "ShallowPage";

// --- NEW: ShallowSwitch Component ---
interface ShallowSwitchProps {
  children:
    | React.ReactElement<ShallowPageProps>
    | React.ReactElement<ShallowPageProps>[];
}

/**
 * Manages rendering `<ShallowPage>` components. It identifies the active
 * page based on the current route and renders only that page.
 */
export const ShallowSwitch: React.FC<ShallowSwitchProps> = ({ children }) => {
  const { path } = useRouter();

  const pages = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<ShallowPageProps> =>
      React.isValidElement(child) && child.type === ShallowPage
  );

  const activePage = pages.find((page) => page.props.path === path) || null;

  return <>{activePage}</>;
};
