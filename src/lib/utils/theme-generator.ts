// src/lib/utils/theme-generator.ts

import {
  argbFromHex,
  blueFromArgb,
  greenFromArgb,
  Hct,
  MaterialDynamicColors,
  redFromArgb,
  SchemeContent,
  SchemeTonalSpot,
  TonalPalette,
} from '@material/material-color-utilities'

// Formats ARGB (number) to "R G B" string
function argbToRgbNumbers(argb: number) {
  return `${redFromArgb(argb)} ${greenFromArgb(argb)} ${blueFromArgb(argb)}`
}

// Helper to convert Hex string to "R G B" string if needed
function formatColorValue(value: string): string {
  if (value.startsWith('#')) {
    try {
      const argb = argbFromHex(value)
      return argbToRgbNumbers(argb)
    } catch {
      return value // Return as-is if parsing fails
    }
  }
  // Assume it's already "r g b" or "rgb(r g b)"
  return value.replace(/^rgb\((.+)\)$/, '$1').replace(/,/g, ' ')
}

// Maps Material Dynamic Color JavaScript keys to your CSS variable names
export const CSS_MAPPING = {
  primary: 'primary',
  onPrimary: 'on-primary',
  primaryContainer: 'primary-container',
  onPrimaryContainer: 'on-primary-container',
  secondary: 'secondary',
  onSecondary: 'on-secondary',
  secondaryContainer: 'secondary-container',
  onSecondaryContainer: 'on-secondary-container',
  tertiary: 'tertiary',
  onTertiary: 'on-tertiary',
  tertiaryContainer: 'tertiary-container',
  onTertiaryContainer: 'on-tertiary-container',
  error: 'error',
  onError: 'on-error',
  errorContainer: 'error-container',
  onErrorContainer: 'on-error-container',
  background: 'background',
  onBackground: 'on-background',
  surface: 'surface',
  onSurface: 'on-surface',
  surfaceVariant: 'surface-variant',
  onSurfaceVariant: 'on-surface-variant',
  outline: 'outline',
  outlineVariant: 'outline-variant',
  shadow: 'shadow',
  scrim: 'scrim',
  inverseSurface: 'inverse-surface',
  inverseOnSurface: 'inverse-on-surface',
  inversePrimary: 'inverse-primary',
  surfaceDim: 'surface-dim',
  surfaceBright: 'surface-bright',
  surfaceContainerLowest: 'surface-container-lowest',
  surfaceContainerLow: 'surface-container-low',
  surfaceContainer: 'surface-container',
  surfaceContainerHigh: 'surface-container-high',
  surfaceContainerHighest: 'surface-container-highest',
} as const

export type ThemeColorKey = keyof typeof CSS_MAPPING
export type ThemeOverrides = Partial<Record<ThemeColorKey, string>>

// Define the relationships between base colors and their dependent tokens
const ACCENT_FAMILIES = {
  primary: { on: 'onPrimary', container: 'primaryContainer', onContainer: 'onPrimaryContainer' },
  secondary: { on: 'onSecondary', container: 'secondaryContainer', onContainer: 'onSecondaryContainer' },
  tertiary: { on: 'onTertiary', container: 'tertiaryContainer', onContainer: 'onTertiaryContainer' },
  error: { on: 'onError', container: 'errorContainer', onContainer: 'onErrorContainer' },
} as const

/**
 * Generates an MD3 Palette from a hex color AND/OR applies manual overrides.
 */
export function applyThemeVariables(
  seedColorHex: string | null,
  isDark: boolean,
  contrast: 'standard' | 'medium' | 'high',
  overrides: ThemeOverrides = {},
  colorMatch: boolean = false,
) {
  const root = document.documentElement
  const computedValues: Record<string, string> = {}

  // 1. Generate Base Palette from Seed (if present)
  if (seedColorHex) {
    try {
      const sourceColorHct = Hct.fromInt(argbFromHex(seedColorHex))
      let contrastLevel = 0.0
      if (contrast === 'medium') contrastLevel = 0.5
      if (contrast === 'high') contrastLevel = 1.0

      const scheme = colorMatch
        ? new SchemeContent(sourceColorHct, isDark, contrastLevel)
        : new SchemeTonalSpot(sourceColorHct, isDark, contrastLevel)

      Object.entries(CSS_MAPPING).forEach(([jsKey, cssKey]) => {
        // @ts-expect-error
        const colorDef = MaterialDynamicColors[jsKey]
        if (colorDef && typeof colorDef.getArgb === 'function') {
          const argb = colorDef.getArgb(scheme)
          computedValues[`--md-sys-color-${cssKey}`] = `rgb(${argbToRgbNumbers(argb)})`
        }
      })

      // Special case: Surface Tint usually matches Primary
      const primaryArgb = MaterialDynamicColors.primary.getArgb(scheme)
      computedValues['--md-sys-color-surface-tint'] = `rgb(${argbToRgbNumbers(primaryArgb)})`
    } catch (error) {
      console.error('Failed to generate Material Theme from seed color:', error)
    }
  }

  // 2. Auto-Generate Related Tokens for Accent Overrides
  // If a user overrides "primary", we automatically generate "onPrimary", "primaryContainer", etc.
  // to guarantee beautiful contrast, unless they explicitly override those too.
  Object.entries(ACCENT_FAMILIES).forEach(([baseKey, tokens]) => {
    const overrideVal = overrides[baseKey as ThemeColorKey]
    if (overrideVal && overrideVal.startsWith('#')) {
      try {
        const argb = argbFromHex(overrideVal)
        const hct = Hct.fromInt(argb)
        const palette = TonalPalette.fromHueAndChroma(hct.hue, hct.chroma)

        // Calculate accessible foreground text tone based on the user's custom background tone
        // If the color is dark (< 60 tone), use white (100). If light, use very dark (10).
        const onTone = hct.tone < 60 ? 100 : 10

        // Container colors: MD3 standard offset tones
        const containerTone = isDark ? 30 : 90
        const onContainerTone = isDark ? 90 : 10

        if (!overrides[tokens.on as ThemeColorKey]) {
          computedValues[`--md-sys-color-${CSS_MAPPING[tokens.on as ThemeColorKey]}`] =
            `rgb(${argbToRgbNumbers(palette.tone(onTone))})`
        }
        if (!overrides[tokens.container as ThemeColorKey]) {
          computedValues[`--md-sys-color-${CSS_MAPPING[tokens.container as ThemeColorKey]}`] =
            `rgb(${argbToRgbNumbers(palette.tone(containerTone))})`
        }
        if (!overrides[tokens.onContainer as ThemeColorKey]) {
          computedValues[`--md-sys-color-${CSS_MAPPING[tokens.onContainer as ThemeColorKey]}`] =
            `rgb(${argbToRgbNumbers(palette.tone(onContainerTone))})`
        }
      } catch (error) {
        console.warn(`Failed to auto-generate contrast palette for override ${baseKey}:`, error)
      }
    }
  })

  // 3. Apply Exact Manual Overrides
  // Explicit overrides take final precedence over both the Seed and the Auto-Generator.
  Object.entries(overrides).forEach(([key, value]) => {
    if (value && CSS_MAPPING[key as ThemeColorKey]) {
      const cssKey = CSS_MAPPING[key as ThemeColorKey]
      const formattedValue = formatColorValue(value)

      const isRgbNumbers = /^\d{1,3}\s\d{1,3}\s\d{1,3}$/.test(formattedValue)
      const finalString = isRgbNumbers ? `rgb(${formattedValue})` : formattedValue

      computedValues[`--md-sys-color-${cssKey}`] = finalString
    }
  })

  // 4. Write to DOM
  if (!seedColorHex && Object.keys(overrides).length === 0) {
    clearThemeVariables()
    return
  }

  // Write calculated values
  Object.entries(computedValues).forEach(([prop, val]) => {
    root.style.setProperty(prop, val)
  })
}

/**
 * Removes dynamically injected theme variables.
 */
export function clearThemeVariables() {
  const root = document.documentElement
  Object.values(CSS_MAPPING).forEach(cssKey => {
    root.style.removeProperty(`--md-sys-color-${cssKey}`)
  })
  root.style.removeProperty('--md-sys-color-surface-tint')
}
