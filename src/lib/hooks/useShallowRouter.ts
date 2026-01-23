import { useCallback, useEffect, useMemo, useState } from "react";

// --- TYPE DEFINITIONS (Fix for TypeScript errors) ---
type HistoryMode = "search" | "pathname";

interface UseHistoryOptions {
  mode?: HistoryMode;
  paramName?: string;
  basePath?: string;
}

type Params = Record<string, string | number | boolean | null | undefined>;

// --- HOOK IMPLEMENTATION ---

// Custom useHistory Hook with configurable routing modes
const useShallowRouter = (options: UseHistoryOptions = {}) => {
  const { mode = "search", paramName = "path", basePath = "/" } = options;

  const [searchParams, setSearchParams] = useState(
    () => new URLSearchParams(window.location.search)
  );
  const [pathname, setPathname] = useState(() => window.location.pathname);

  // Get current path based on mode
  const currentPath = useMemo(() => {
    if (mode === "pathname") {
      // Extract path relative to basePath
      // FIX: Used template literal instead of concatenation
      if (pathname === basePath || pathname === `${basePath}/`) {
        return "/";
      }
      if (pathname.startsWith(basePath)) {
        return pathname.slice(basePath.length) || "/";
      }
      return "/";
    }
    // Search param mode
    return searchParams.get(paramName) || "/";
  }, [mode, pathname, searchParams, paramName, basePath]);

  // Get all other params except the routing param
  const otherParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.delete(paramName);
    return params;
  }, [searchParams, paramName]);

  // Update state when browser navigation occurs (e.g., back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Push new path to history
  const push = useCallback(
    (path: string, additionalParams: Params = {}, state: any = null) => {
      if (mode === "pathname") {
        // --- FEATURE: Handle pathname mode navigation ---
        const newPathname =
          path === "/" || !path ? basePath : `${basePath}${path}`;
        const newParams = new URLSearchParams();
        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            // FIX: Ensure value is a string
            newParams.set(key, String(value));
          }
        });
        const newSearch = newParams.toString();
        const newUrl = `${newPathname}${newSearch ? `?${newSearch}` : ""}`;

        window.history.pushState(state, "", newUrl);
        setPathname(newPathname);
        setSearchParams(newParams);
      } else {
        // --- Original search mode logic ---
        const newParams = new URLSearchParams(window.location.search);
        if (path) {
          newParams.set(paramName, path);
        } else {
          newParams.delete(paramName);
        }

        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            // FIX: Ensure value is a string to prevent ts(2345)
            newParams.set(key, String(value));
          } else {
            newParams.delete(key);
          }
        });

        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        window.history.pushState(state, "", newUrl);
        setSearchParams(newParams);
      }
    },
    [mode, basePath, paramName] // Updated dependencies
  );

  // Replace current path in history
  const replace = useCallback(
    (path: string, additionalParams: Params = {}, state: any = null) => {
      if (mode === "pathname") {
        // --- FEATURE: Handle pathname mode navigation ---
        const newPathname =
          path === "/" || !path ? basePath : `${basePath}${path}`;
        const newParams = new URLSearchParams();
        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            newParams.set(key, String(value));
          }
        });
        const newSearch = newParams.toString();
        const newUrl = `${newPathname}${newSearch ? `?${newSearch}` : ""}`;

        window.history.replaceState(state, "", newUrl);
        setPathname(newPathname);
        setSearchParams(newParams);
      } else {
        // --- Original search mode logic ---
        const newParams = new URLSearchParams(window.location.search);
        if (path) {
          newParams.set(paramName, path);
        } else {
          newParams.delete(paramName);
        }

        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            // FIX: Ensure value is a string to prevent ts(2345)
            newParams.set(key, String(value));
          } else {
            newParams.delete(key);
          }
        });

        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        window.history.replaceState(state, "", newUrl);
        setSearchParams(newParams);
      }
    },
    [mode, basePath, paramName] // Updated dependencies
  );

  // Update only specific params without changing the path
  const updateParams = useCallback(
    (params: Params, replaceHistory = false) => {
      const newParams = new URLSearchParams(window.location.search);

      Object.entries(params).forEach(([key, value]) => {
        if (key !== paramName) {
          if (value !== null && value !== undefined) {
            // FIX: Ensure value is a string to prevent ts(2345)
            newParams.set(key, String(value));
          } else {
            newParams.delete(key);
          }
        }
      });

      const newUrl = `${window.location.pathname}?${newParams.toString()}`;

      if (replaceHistory) {
        window.history.replaceState(null, "", newUrl);
      } else {
        window.history.pushState(null, "", newUrl);
      }
      setSearchParams(newParams);
    },
    [paramName]
  );

  // Clear all params except the path
  const clearParams = useCallback(
    (keepPath = true) => {
      const newParams = new URLSearchParams();
      let newUrl = window.location.pathname;

      if (mode === "search" && keepPath && currentPath && currentPath !== "/") {
        newParams.set(paramName, currentPath);
      }

      const newSearchString = newParams.toString();
      if (newSearchString) {
        newUrl = `${newUrl}?${newSearchString}`;
      }

      window.history.pushState(null, "", newUrl);
      setSearchParams(newParams);
    },
    [currentPath, paramName, mode] // Updated dependencies
  );

  // Get a specific param value
  const getParam = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  );

  // Check if a param exists
  const hasParam = useCallback(
    (key: string) => searchParams.has(key),
    [searchParams]
  );

  // Navigation helpers
  const goBack = useCallback(() => window.history.back(), []);
  const goForward = useCallback(() => window.history.forward(), []);
  const go = useCallback((n: number) => window.history.go(n), []);

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
    // Note: These values are snapshots and won't update on their own.
    // They are provided for convenience but could become stale.
    length: window.history.length,
    href: window.location.href,
    basename: window.location.pathname,
  };
};

export default useShallowRouter;
