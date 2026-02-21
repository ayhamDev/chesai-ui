// src/lib/utils/font-loader.ts

export interface FontConfig {
  name: string
  value: string // The CSS font-family value
  url?: string // Optional Google Fonts URL parameter
  type: 'google' | 'local' | 'system'
}

export const PRESET_FONTS: Record<string, FontConfig> = {
  // Brand / Display Fonts
  Almarai: { name: 'Almarai', value: "'Almarai', sans-serif", type: 'google' },
  Manrope: { name: 'Manrope', value: "'Manrope', sans-serif", type: 'google' },
  Inter: { name: 'Inter', value: "'Inter', sans-serif", type: 'google' },
  Playfair: { name: 'Playfair Display', value: "'Playfair Display', serif", type: 'google' },
  Oswald: { name: 'Oswald', value: "'Oswald', sans-serif", type: 'google' },
  SpaceGrotesk: { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif", type: 'google' },
  Cairo: { name: 'Cairo', value: "'Cairo', sans-serif", type: 'google' },
  Roboto: { name: 'Roboto', value: "'Roboto', sans-serif", type: 'google' },
  Lato: { name: 'Lato', value: "'Lato', sans-serif", type: 'google' },
  Karla: { name: 'Karla', value: "'Karla', sans-serif", type: 'google' },
  'Noto Sans': { name: 'Noto Sans', value: "'Noto Sans', sans-serif", type: 'google' },
  Tajawal: { name: 'Tajawal', value: "'Tajawal', sans-serif", type: 'google' },
  'Readex Pro': { name: 'Readex Pro', value: "'Readex Pro', sans-serif", type: 'google' },
  'Noto Kufi Arabic': { name: 'Noto Kufi Arabic', value: "'Noto Kufi Arabic', sans-serif", type: 'google' },
  'Noto Sans Arabic': { name: 'Noto Sans Arabic', value: "'Noto Sans Arabic', sans-serif", type: 'google' },
  // System
  System: { name: 'System UI', value: 'system-ui, -apple-system, sans-serif', type: 'system' },
}

/**
 * Dynamically injects a Google Font link tag
 */
export const loadGoogleFont = (fontName: string) => {
  const font = PRESET_FONTS[fontName]
  if (!font || font.type !== 'google') return

  const id = `font-${fontName.toLowerCase().replace(/\s+/g, '-')}`
  if (document.getElementById(id)) return // Already loaded

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`
  document.head.appendChild(link)
}
