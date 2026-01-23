import { clsx } from 'clsx'

export const CHART_COLORS = [
  'var(--md-sys-color-primary)',
  'var(--md-sys-color-secondary)',
  'var(--md-sys-color-tertiary)',
  'var(--md-sys-color-error)',
  'var(--md-sys-color-outline)',
  'var(--md-sys-color-inverse-primary)',
]

export const getColorForIndex = (index: number) => {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export const chartGridConfig = {
  stroke: 'var(--md-sys-color-outline-variant)',
  strokeDasharray: '4 4',
  vertical: false,
  opacity: 0.4,
}

export const chartAxisConfig = {
  stroke: 'var(--md-sys-color-outline-variant)',
  tick: { fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 },
  axisLine: false,
  tickLine: false,
  tickMargin: 10,
}
