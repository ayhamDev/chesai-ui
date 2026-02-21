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

type Theme = "dark" | "light" | "system";
type Contrast = "standard" | "medium" | "high";

export interface FontSettings {
  brand: string;
  plain: string;
  /**
   * If true, buttons use the Brand font.
   * If false, buttons use the Plain font.
   */
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
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultContrast?: Contrast;
  defaultFonts?: FontSettings;
  storageKey?: string;
  contrastStorageKey?: string;
  fontStorageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultContrast = "standard",
  defaultFonts = defaultFontSettings,
  storageKey = "chesai-ui-theme",
  contrastStorageKey = "chesai-ui-contrast",
  fontStorageKey = "chesai-ui-fonts",
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

  const [fonts, setFontsState] = useState<FontSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(fontStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return { ...defaultFonts, ...parsed }; // Merge to ensure new keys exist
        } catch (e) {
          // ignore error
        }
      }
    }
    return defaultFonts;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const isInternalUpdate = useRef(false);

  // --- 2. THEME CLASS LOGIC ---

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

  // --- 3. EFFECTS ---

  // A. Apply Fonts & CSS Variables
  useEffect(() => {
    const root = window.document.documentElement;

    const getFontValue = (key: string) =>
      PRESET_FONTS[key]?.value || (key.includes(" ") ? `'${key}'` : key);

    // 1. Load Fonts
    loadGoogleFont(fonts.brand);
    loadGoogleFont(fonts.plain);

    // 2. Set Base Variables
    root.style.setProperty("--font-brand", getFontValue(fonts.brand));
    root.style.setProperty("--font-plain", getFontValue(fonts.plain));

    // 3. Set Button Variable based on "Expressive" toggle
    const buttonFontSource = fonts.expressiveButtons
      ? fonts.brand
      : fonts.plain;
    root.style.setProperty("--font-button", getFontValue(buttonFontSource));

    // 4. Persist
    localStorage.setItem(fontStorageKey, JSON.stringify(fonts));
  }, [fonts, fontStorageKey]);

  // B. Apply Theme/Contrast changes
  useEffect(() => {
    applyClasses(theme, contrast);
  }, [theme, contrast, applyClasses]);

  // C. System Preference Listener
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

  // D. Mutation Observer (External Class Changes)
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

          const hasHigh = classList.contains("high-contrast");
          const hasMedium = classList.contains("medium-contrast");
          let newContrast: Contrast = "standard";
          if (hasHigh) newContrast = "high";
          else if (hasMedium) newContrast = "medium";

          if (newContrast !== contrast) {
            setContrastState(newContrast);
          }
        }
      });
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [contrast]);

  // E. Initial Mount Check
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    fonts,
    setFonts: (newFonts: Partial<FontSettings>) => {
      setFontsState((prev) => ({ ...prev, ...newFonts }));
    },
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
