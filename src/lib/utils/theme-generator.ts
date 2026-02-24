// src/lib/utils/theme-generator.ts

import {
  argbFromHex,
  blueFromArgb,
  greenFromArgb,
  Hct,
  MaterialDynamicColors,
  redFromArgb,
  SchemeTonalSpot,
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
  // Assume it's already "r g b" or "rgb(r g b)" - strictly strictly we need "r g b" for Tailwind opacity
  // If user passes "rgb(0,0,0)", stripping "rgb(" and ")" is complex without regex,
  // but let's assume standard hex inputs for simplicity or direct r g b strings.
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

/**
 * Generates an MD3 Palette from a hex color AND/OR applies manual overrides.
 */
export function applyThemeVariables(
  seedColorHex: string | null,
  isDark: boolean,
  contrast: 'standard' | 'medium' | 'high',
  overrides: ThemeOverrides = {},
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

      const scheme = new SchemeTonalSpot(sourceColorHct, isDark, contrastLevel)

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
      console.error('Failed to generate Material Theme from color:', error)
    }
  }

  // 2. Apply Manual Overrides (Precedence over generated values)
  Object.entries(overrides).forEach(([key, value]) => {
    if (value && CSS_MAPPING[key as ThemeColorKey]) {
      const cssKey = CSS_MAPPING[key as ThemeColorKey]
      // Convert HEX to "rgb(r g b)" format for CSS var
      const formattedValue = formatColorValue(value)
      // Ensure it is wrapped in rgb() if it's just numbers, to match standard CSS syntax expected by browser
      // BUT Tailwind config usually expects just "r g b" if using <alpha-value>.
      // The theme.css uses rgb(r g b).
      // Let's ensure consistency:
      // If the utility generated it above, it wrapped in rgb().
      // If manual, we mimic that.

      const isRgbNumbers = /^\d{1,3}\s\d{1,3}\s\d{1,3}$/.test(formattedValue)
      const finalString = isRgbNumbers ? `rgb(${formattedValue})` : formattedValue

      computedValues[`--md-sys-color-${cssKey}`] = finalString
    }
  })

  // 3. Write to DOM
  // If no seed and no overrides, we might want to clear styles to revert to CSS file defaults.
  // But if we have *some* overrides, we set them.
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
