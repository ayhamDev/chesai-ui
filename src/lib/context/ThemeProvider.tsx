"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Theme = "dark" | "light" | "system";
type Contrast = "standard" | "medium" | "high";

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  contrast: Contrast;
  setContrast: (contrast: Contrast) => void;
  /** The resolved theme (light or dark), regardless of 'system' preference */
  resolvedTheme: "light" | "dark";
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  contrast: "standard",
  setContrast: () => null,
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultContrast?: Contrast;
  storageKey?: string;
  contrastStorageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultContrast = "standard",
  storageKey = "chesai-ui-theme",
  contrastStorageKey = "chesai-ui-contrast",
  ...props
}: ThemeProviderProps) {
  // 1. Initialize state from storage or default
  const [theme, setThemeState] = useState<Theme>(
    () =>
      (typeof window !== "undefined"
        ? (localStorage.getItem(storageKey) as Theme)
        : defaultTheme) || defaultTheme
  );

  const [contrast, setContrastState] = useState<Contrast>(
    () =>
      (typeof window !== "undefined"
        ? (localStorage.getItem(contrastStorageKey) as Contrast)
        : defaultContrast) || defaultContrast
  );

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Ref to prevent infinite loops when we apply the class ourselves
  const isInternalUpdate = useRef(false);

  // Helper to apply classes to DOM
  const applyClasses = useCallback(
    (targetTheme: Theme, targetContrast: Contrast) => {
      const root = window.document.documentElement;
      isInternalUpdate.current = true; // Flag start

      // Determine actual theme (light vs dark)
      let appliedTheme: "light" | "dark" = "light";
      if (targetTheme === "system") {
        appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        appliedTheme = targetTheme;
      }

      // Clean up old classes
      root.classList.remove(
        "theme-light",
        "theme-dark",
        "light",
        "dark",
        "medium-contrast",
        "high-contrast"
      );

      // Add new theme classes
      root.classList.add(`theme-${appliedTheme}`);
      root.classList.add(appliedTheme);

      // Add contrast classes
      if (targetContrast === "medium") {
        root.classList.add("medium-contrast");
      } else if (targetContrast === "high") {
        root.classList.add("high-contrast");
      }

      setResolvedTheme(appliedTheme);

      // Short timeout to allow MutationObserver to fire and be ignored
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 10);
    },
    []
  );

  // 2. Effect: Apply changes when state changes
  useEffect(() => {
    applyClasses(theme, contrast);
  }, [theme, contrast, applyClasses]);

  // 3. Effect: Watch for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyClasses("system", contrast);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, contrast, applyClasses]);

  // 4. Effect: MutationObserver for external class changes
  useEffect(() => {
    const root = window.document.documentElement;

    const observer = new MutationObserver((mutations) => {
      if (isInternalUpdate.current) return;

      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const classList = root.classList;

          // Detect Theme Change
          const hasDark =
            classList.contains("dark") || classList.contains("theme-dark");
          const hasLight =
            classList.contains("light") || classList.contains("theme-light");

          // FIX: Explicitly type this as "light" | "dark" | null so it satisfies setResolvedTheme
          let newTheme: "light" | "dark" | null = null;
          if (hasDark && !hasLight) newTheme = "dark";
          else if (hasLight && !hasDark) newTheme = "light";

          // If DOM explicitly changed to a specific mode, update state
          if (newTheme && newTheme !== theme) {
            setThemeState(newTheme);
            setResolvedTheme(newTheme);
            localStorage.setItem(storageKey, newTheme);
          }

          // Detect Contrast Change
          const hasHigh = classList.contains("high-contrast");
          const hasMedium = classList.contains("medium-contrast");

          let newContrast: Contrast = "standard";
          if (hasHigh) newContrast = "high";
          else if (hasMedium) newContrast = "medium";

          if (newContrast !== contrast) {
            setContrastState(newContrast);
            localStorage.setItem(contrastStorageKey, newContrast);
          }
        }
      });
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, [theme, contrast, storageKey, contrastStorageKey]);

  // 5. Initial Mount Check
  // If the user manually added a class to HTML before React hydrated, sync state to match.
  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect is intended to run only once on mount to sync with pre-rendered HTML classes.
  useEffect(() => {
    const root = window.document.documentElement;
    const classList = root.classList;

    // Check for existing theme classes
    if (classList.contains("dark") || classList.contains("theme-dark")) {
      if (theme !== "dark") {
        setThemeState("dark");
        setResolvedTheme("dark");
      }
    } else if (
      classList.contains("light") ||
      classList.contains("theme-light")
    ) {
      if (theme !== "light") {
        setThemeState("light");
        setResolvedTheme("light");
      }
    } else {
      // If no classes exist yet, apply the default/storage state
      applyClasses(theme, contrast);
    }
  }, []);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    },
    contrast,
    setContrast: (newContrast: Contrast) => {
      localStorage.setItem(contrastStorageKey, newContrast);
      setContrastState(newContrast);
    },
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
