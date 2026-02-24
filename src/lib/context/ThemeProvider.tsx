"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { loadGoogleFont, PRESET_FONTS } from "../utils/font-loader";
import {
  applyThemeVariables,
  clearThemeVariables,
  type ThemeOverrides,
  type ThemeColorKey,
} from "../utils/theme-generator";

type Theme = "dark" | "light" | "system";
type Contrast = "standard" | "medium" | "high";

export interface FontSettings {
  brand: string;
  plain: string;
  expressiveButtons: boolean;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  contrast: Contrast;
  setContrast: (contrast: Contrast) => void;
  resolvedTheme: "light" | "dark";
  fonts: FontSettings;
  setFonts: (fonts: Partial<FontSettings>) => void;

  // Dynamic Theme
  seedColor: string | null;
  setSeedColor: (color: string | null) => void;

  // Manual Overrides
  overrides: ThemeOverrides;
  setOverride: (key: ThemeColorKey, value: string | null) => void;
  resetOverrides: () => void;
}

const defaultFontSettings: FontSettings = {
  brand: "Manrope",
  plain: "Manrope",
  expressiveButtons: false,
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  contrast: "standard",
  setContrast: () => null,
  resolvedTheme: "light",
  fonts: defaultFontSettings,
  setFonts: () => null,
  seedColor: null,
  setSeedColor: () => null,
  overrides: {},
  setOverride: () => null,
  resetOverrides: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultContrast?: Contrast;
  defaultFonts?: FontSettings;
  defaultSeedColor?: string | null;
  defaultOverrides?: ThemeOverrides;
  storageKey?: string;
  contrastStorageKey?: string;
  fontStorageKey?: string;
  seedColorStorageKey?: string;
  overridesStorageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultContrast = "standard",
  defaultFonts = defaultFontSettings,
  defaultSeedColor = null,
  defaultOverrides = {},
  storageKey = "chesai-ui-theme",
  contrastStorageKey = "chesai-ui-contrast",
  fontStorageKey = "chesai-ui-fonts",
  seedColorStorageKey = "chesai-ui-seed-color",
  overridesStorageKey = "chesai-ui-overrides",
  ...props
}: ThemeProviderProps) {
  // --- 1. STATE INITIALIZATION ---

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [contrast, setContrastState] = useState<Contrast>(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem(contrastStorageKey) as Contrast) ||
        defaultContrast
      );
    }
    return defaultContrast;
  });

  const [seedColor, setSeedColorState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(seedColorStorageKey) || defaultSeedColor;
    }
    return defaultSeedColor;
  });

  const [overrides, setOverridesState] = useState<ThemeOverrides>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(overridesStorageKey);
      if (stored) {
        try {
          return { ...defaultOverrides, ...JSON.parse(stored) };
        } catch {
          return defaultOverrides;
        }
      }
    }
    return defaultOverrides;
  });

  const [fonts, setFontsState] = useState<FontSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(fontStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return { ...defaultFonts, ...parsed };
        } catch (e) {
          // ignore
        }
      }
    }
    return defaultFonts;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const isInternalUpdate = useRef(false);

  // --- 2. LOGIC ---

  const applyClasses = useCallback(
    (targetTheme: Theme, targetContrast: Contrast) => {
      const root = window.document.documentElement;
      isInternalUpdate.current = true;

      let appliedTheme: "light" | "dark" = "light";
      if (targetTheme === "system") {
        appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        appliedTheme = targetTheme;
      }

      root.classList.remove(
        "theme-light",
        "theme-dark",
        "light",
        "dark",
        "medium-contrast",
        "high-contrast",
      );

      root.classList.add(`theme-${appliedTheme}`);
      root.classList.add(appliedTheme);

      if (targetContrast === "medium") {
        root.classList.add("medium-contrast");
      } else if (targetContrast === "high") {
        root.classList.add("high-contrast");
      }

      setResolvedTheme(appliedTheme);

      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 10);
    },
    [],
  );

  const setOverride = useCallback(
    (key: ThemeColorKey, value: string | null) => {
      setOverridesState((prev) => {
        const next = { ...prev };
        if (value === null) delete next[key];
        else next[key] = value;
        localStorage.setItem(overridesStorageKey, JSON.stringify(next));
        return next;
      });
    },
    [overridesStorageKey],
  );

  const resetOverrides = useCallback(() => {
    setOverridesState({});
    localStorage.removeItem(overridesStorageKey);
  }, [overridesStorageKey]);

  // --- 3. EFFECTS ---

  // Apply Fonts
  useEffect(() => {
    const root = window.document.documentElement;
    const getFontValue = (key: string) =>
      PRESET_FONTS[key]?.value || (key.includes(" ") ? `'${key}'` : key);

    loadGoogleFont(fonts.brand);
    loadGoogleFont(fonts.plain);

    root.style.setProperty("--font-brand", getFontValue(fonts.brand));
    root.style.setProperty("--font-plain", getFontValue(fonts.plain));

    const buttonFontSource = fonts.expressiveButtons
      ? fonts.brand
      : fonts.plain;
    root.style.setProperty("--font-button", getFontValue(buttonFontSource));

    localStorage.setItem(fontStorageKey, JSON.stringify(fonts));
  }, [fonts, fontStorageKey]);

  // Apply Classes
  useEffect(() => {
    applyClasses(theme, contrast);
  }, [theme, contrast, applyClasses]);

  // Apply Colors (Seed + Overrides)
  useEffect(() => {
    applyThemeVariables(
      seedColor,
      resolvedTheme === "dark",
      contrast,
      overrides,
    );
  }, [seedColor, resolvedTheme, contrast, overrides]);

  // System Preference Listener
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

  // Mutation Observer
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
          const isDark =
            classList.contains("dark") || classList.contains("theme-dark");
          const newResolved: "light" | "dark" = isDark ? "dark" : "light";

          setResolvedTheme((prev) =>
            prev !== newResolved ? newResolved : prev,
          );
          setThemeState((prev) => (prev !== newResolved ? newResolved : prev));
          // Contrast logic...
        }
      });
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Initial Mount
  useEffect(() => {
    const root = window.document.documentElement;
    const classList = root.classList;
    if (classList.contains("dark") || classList.contains("theme-dark")) {
      setThemeState("dark");
      setResolvedTheme("dark");
    } else if (
      classList.contains("light") ||
      classList.contains("theme-light")
    ) {
      setThemeState("light");
      setResolvedTheme("light");
    } else {
      applyClasses(theme, contrast);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    fonts,
    setFonts: (newFonts: Partial<FontSettings>) => {
      setFontsState((prev) => ({ ...prev, ...newFonts }));
    },
    seedColor,
    setSeedColor: (color: string | null) => {
      if (color) localStorage.setItem(seedColorStorageKey, color);
      else localStorage.removeItem(seedColorStorageKey);
      setSeedColorState(color);
    },
    overrides,
    setOverride,
    resetOverrides,
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
