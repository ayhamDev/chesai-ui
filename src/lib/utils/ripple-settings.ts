export type RippleStyle = 'classic' | 'liquid'

export interface RippleSettings {
  /** Classic solid ripple or the liquid gradient, waves and shimmer. */
  style: RippleStyle
  /** Fraction of the current radius (0.04 = 4%). */
  waveAmp: number
  waveFreq: number
  waveSpeed: number
  expandMs: number
  fadeMs: number
  opacityInMs: number
  minPressMs: number
  sparkle: boolean
  drift: boolean
  driftAmount: number
  timeScale: number
}

export const defaultRippleSettings: Readonly<RippleSettings> = {
  style: 'liquid',
  waveAmp: 0.04,
  waveFreq: 3,
  waveSpeed: 1,
  expandMs: 520,
  fadeMs: 340,
  opacityInMs: 90,
  minPressMs: 240,
  sparkle: true,
  drift: true,
  driftAmount: 0.7,
  timeScale: 1,
}

/** Ignore malformed persisted values and bound settings to safe rendering ranges. */
export function normalizeRippleSettings(value: unknown, base: RippleSettings = defaultRippleSettings): RippleSettings {
  const result = { ...base }
  if (!value || typeof value !== 'object') return result
  const style = (value as Record<string, unknown>).style
  if (style === 'classic' || style === 'liquid') result.style = style
  const ranges = {
    waveAmp: [0, 0.12],
    waveFreq: [1, 8],
    waveSpeed: [0, 3],
    expandMs: [150, 1600],
    fadeMs: [100, 1200],
    opacityInMs: [1, 1200],
    minPressMs: [0, 1600],
    driftAmount: [0, 1],
    timeScale: [0.25, 3],
  } as const
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
    const n = (value as Record<string, unknown>)[key]
    if (typeof n === 'number' && Number.isFinite(n)) result[key] = Math.min(ranges[key][1], Math.max(ranges[key][0], n))
  }
  for (const key of ['sparkle', 'drift'] as const) {
    const b = (value as Record<string, unknown>)[key]
    if (typeof b === 'boolean') result[key] = b
  }
  return result
}
