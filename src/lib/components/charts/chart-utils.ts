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

/**
 * Generates a cubic-bezier solver function mapping normalized time progress
 * t [0, 1] to physical visual progress. Highly robust and performs Newton-Raphson approximation.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    // Fast approximation of u coordinate
    let u = t;
    for (let i = 0; i < 8; i++) {
      const x = 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u;
      const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * u * (1 - u) * (x2 - x1) + 3 * u * u * (1 - x2);
      if (Math.abs(dx) < 1e-6) break;
      u -= (x - t) / dx;
    }

    // Solve for y coordinate at parameterized u
    return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u;
  };
}

// MD3 Standard/Emphasized Curve
export const EASE_EMPHASIZED = cubicBezier(0.2, 0, 0, 1);

// MD3 Expressive Default Spatial Curve (Elegant spring-loaded overshoot)
export const EASE_EXPRESSIVE_DEFAULT_SPATIAL = cubicBezier(0.38, 1.5, 0.22, 1);
