"use client";

import type { Transition } from "framer-motion";
import type React from "react";
import {
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
  CSS_MAPPING,
  type ThemeColorKey,
  type ThemeOverrides,
} from "../utils/theme-generator";

type Theme = "dark" | "light" | "system";
type Contrast = "standard" | "medium" | "high";
type AnimationStyle = "expressive" | "standard";

export interface FontSettings {
  brand: string;
  plain: string;
}

export type ThemePalette = Record<ThemeColorKey, string>;

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  contrast: Contrast;
  setContrast: (contrast: Contrast) => void;
  resolvedTheme: "light" | "dark";
  fonts: FontSettings;
  setFonts: (fonts: Partial<FontSettings>) => void;
  animationStyle: AnimationStyle;
  setAnimationStyle: (style: AnimationStyle) => void;
  seedColor: string | null;
  setSeedColor: (color: string | null) => void;
  overrides: ThemeOverrides;
  setOverride: (key: ThemeColorKey, value: string | null) => void;
  resetOverrides: () => void;
  palette: ThemePalette;
  getComputedColor: (key: ThemeColorKey) => string;
  colorMatch: boolean;
  setColorMatch: (match: boolean) => void;
}

const defaultFontSettings: FontSettings = {
  brand: "Manrope",
  plain: "Manrope",
};

const staticPalette = Object.keys(CSS_MAPPING).reduce((acc, key) => {
  const cssKey = CSS_MAPPING[key as ThemeColorKey];
  acc[key as ThemeColorKey] = `var(--md-sys-color-${cssKey})`;
  return acc;
}, {} as ThemePalette);

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  contrast: "standard",
  setContrast: () => null,
  resolvedTheme: "light",
  fonts: defaultFontSettings,
  setFonts: () => null,
  animationStyle: "expressive",
  setAnimationStyle: () => null,
  seedColor: null,
  setSeedColor: () => null,
  overrides: {},
  setOverride: () => null,
  resetOverrides: () => null,
  palette: staticPalette,
  getComputedColor: () => "",
  colorMatch: false,
  setColorMatch: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultContrast?: Contrast;
  defaultFonts?: FontSettings;
  defaultAnimationStyle?: AnimationStyle;
  defaultSeedColor?: string | null;
  defaultOverrides?: ThemeOverrides;
  storageKey?: string;
  contrastStorageKey?: string;
  fontStorageKey?: string;
  animationStorageKey?: string;
  seedColorStorageKey?: string;
  overridesStorageKey?: string;
  colorMatchStorageKey?: string;
  defaultColorMatch?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultContrast = "standard",
  defaultFonts = defaultFontSettings,
  defaultAnimationStyle = "expressive",
  defaultSeedColor = null,
  defaultOverrides = {},
  storageKey = "chesai-ui-theme",
  contrastStorageKey = "chesai-ui-contrast",
  fontStorageKey = "chesai-ui-fonts",
  animationStorageKey = "chesai-ui-animation",
  seedColorStorageKey = "chesai-ui-seed-color",
  overridesStorageKey = "chesai-ui-overrides",
  colorMatchStorageKey = "chesai-ui-color-match",
  defaultColorMatch = false,
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

  const [animationStyle, setAnimationStyleState] = useState<AnimationStyle>(
    () => {
      if (typeof window !== "undefined") {
        return (
          (localStorage.getItem(animationStorageKey) as AnimationStyle) ||
          defaultAnimationStyle
        );
      }
      return defaultAnimationStyle;
    },
  );

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

  const [colorMatch, setColorMatchState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(colorMatchStorageKey);
      if (stored !== null) return stored === "true";
    }
    return defaultColorMatch;
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

  // Check the document element class list immediately on load to prevent light mode flash
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const classList = window.document.documentElement.classList;
      if (classList.contains("dark") || classList.contains("theme-dark")) {
        return "dark";
      }
    }
    return "light";
  });

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

  const setColorMatch = useCallback(
    (match: boolean) => {
      localStorage.setItem(colorMatchStorageKey, String(match));
      setColorMatchState(match);
    },
    [colorMatchStorageKey],
  );

  const getComputedColor = useCallback((key: ThemeColorKey): string => {
    if (typeof window === "undefined") return "";
    const cssKey = CSS_MAPPING[key];
    if (!cssKey) return "";
    const root = window.document.documentElement;
    return window
      .getComputedStyle(root)
      .getPropertyValue(`--md-sys-color-${cssKey}`)
      .trim();
  }, []);

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
    root.style.setProperty("--font-button", getFontValue(fonts.plain));

    localStorage.setItem(fontStorageKey, JSON.stringify(fonts));
  }, [fonts, fontStorageKey]);

  // Apply Animation Style HTML Attribute
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-animation-style", animationStyle);
    localStorage.setItem(animationStorageKey, animationStyle);
  }, [animationStyle, animationStorageKey]);

  // Apply Classes (Only run on mount or when theme/contrast changes)
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
      colorMatch,
    );
  }, [seedColor, resolvedTheme, contrast, overrides, colorMatch]);

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
        }
      });
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Sync state on Mount with what the head script evaluated
  useEffect(() => {
    const root = window.document.documentElement;
    const classList = root.classList;
    if (classList.contains("dark") || classList.contains("theme-dark")) {
      setThemeState((prev) =>
        prev !== "dark" && prev !== "system" ? "dark" : prev,
      );
      setResolvedTheme("dark");
    } else {
      setThemeState((prev) =>
        prev !== "light" && prev !== "system" ? "light" : prev,
      );
      setResolvedTheme("light");
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
    animationStyle,
    setAnimationStyle: (style: AnimationStyle) => setAnimationStyleState(style),
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
    palette: staticPalette,
    getComputedColor,
    colorMatch,
    setColorMatch,
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

export const useThemeTransition = (
  expressiveTransition: Transition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  standardTransition: Transition = {
    type: "tween",
    ease: [0.2, 0, 0, 1],
    duration: 0.25,
  },
): Transition => {
  const { animationStyle } = useTheme();
  return animationStyle === "expressive"
    ? expressiveTransition
    : standardTransition;
};
