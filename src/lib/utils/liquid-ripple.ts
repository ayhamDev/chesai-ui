import type { RippleSettings } from './ripple-settings'
type Press = { x: number; y: number; rMax: number; start: number; released: number | null; seed: number }
type Host = {
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  dpr: number
  rgb: number[]
  opacity: number
  ripples: Press[]
  tiles: HTMLCanvasElement[] | null
}
/* ---- Material standard easing: cubic-bezier(0.2, 0, 0, 1) ---- */
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x,
    bx = 3 * (p2x - p1x) - cx,
    ax = 1 - cx - bx
  const cy = 3 * p1y,
    by = 3 * (p2y - p1y) - cy,
    ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 6; i++) {
      const err = sampleX(t) - x
      const d = sampleDX(t)
      if (Math.abs(err) < 1e-5 || d === 0) break
      t -= err / d
    }
    return sampleY(Math.min(1, Math.max(0, t)))
  }
}
const easeExpand = cubicBezier(0.2, 0, 0, 1)

/* ---- 2D value noise (2 octaves) for the liquid edge ---- */
const perm = new Uint8Array(512)
{
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
}
const fade = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const grid = (x: number, y: number) => perm[(perm[x & 255] + (y & 255)) & 255] / 255
function vnoise(x: number, y: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y)
  const u = fade(x - xi),
    v = fade(y - yi)
  return lerp(lerp(grid(xi, yi), grid(xi + 1, yi), u), lerp(grid(xi, yi + 1), grid(xi + 1, yi + 1), u), v) * 2 - 1
}
// Seamless around the circle: sample noise on a ring in 2D space.
function ringNoise(theta: number, freq: number, time: number, seed: number) {
  const cx = Math.cos(theta) * freq + seed
  const cy = Math.sin(theta) * freq + seed * 1.7
  return vnoise(cx + time, cy + time * 0.8) * 0.68 + vnoise(cx * 2.3 - time * 1.3, cy * 2.3 + time) * 0.32
}

function makeSparkleTiles(rgb: number[]) {
  const tiles = []
  for (let f = 0; f < 3; f++) {
    const t = document.createElement('canvas')
    t.width = t.height = 128
    const c = t.getContext('2d')!
    for (let i = 0; i < 240; i++) {
      const a = 0.12 + Math.random() * 0.55
      c.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
      const s = Math.random() < 0.85 ? 1 : 2
      c.fillRect((Math.random() * 128) | 0, (Math.random() * 128) | 0, s, s)
    }
    tiles.push(t)
  }
  return tiles
}

/** Adapted from the supplied liquid ripple demo, with per-host clocks and disposal. */
export function createLiquidRipple(
  el: HTMLElement,
  getSettings: () => RippleSettings,
  color: string,
  opacity?: number,
) {
  const doc = el.ownerDocument
  const win = doc.defaultView!
  const canvas = doc.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  canvas.setAttribute('aria-hidden', 'true')
  canvas.dataset.chesaiRipple = ''
  canvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;border-radius:inherit;'
  // Resolve CSS variables and sample modern CSS colors, retaining token alpha.
  function readColor() {
    const probe = doc.createElement('span')
    probe.style.color = color
    el.append(probe)
    const resolved = win.getComputedStyle(probe).color
    probe.remove()
    // Use a separate pixel so sampling cannot overwrite a held ripple.
    const sample = doc.createElement('canvas').getContext('2d')!
    sample.fillStyle = resolved
    sample.fillRect(0, 0, 1, 1)
    return sample.getImageData(0, 0, 1, 1).data
  }
  const pixel = readColor()
  const h: Host = {
    ctx,
    canvas,
    dpr: Math.min(2, win.devicePixelRatio || 1),
    rgb: Array.from(pixel.slice(0, 3)),
    opacity: opacity ?? (pixel[3] < 255 ? pixel[3] / 255 : 0.12),
    ripples: [],
    tiles: null,
  }
  const oldPosition = el.style.position
  const positioned = win.getComputedStyle(el).position === 'static'
  if (positioned) el.style.position = 'relative'
  el.append(canvas)
  let clock = 0,
    lastRaf: number | null = null,
    rafId = 0
  let settings = getSettings()
  const media = win.matchMedia?.('(prefers-reduced-motion: reduce)')
  function resize() {
    canvas.width = Math.max(1, Math.round(el.clientWidth * h.dpr))
    canvas.height = Math.max(1, Math.round(el.clientHeight * h.dpr))
  }
  resize()
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
  observer?.observe(el)
  function tick(now: number) {
    settings = getSettings()
    if (media?.matches) settings = { ...settings, waveAmp: 0, sparkle: false, drift: false }
    clock += (lastRaf === null ? 16 : Math.min(now - lastRaf, 64)) * settings.timeScale
    lastRaf = now
    drawHost(h)
    if (h.ripples.length) rafId = win.requestAnimationFrame(tick)
    else {
      rafId = 0
      lastRaf = null
      canvas.remove()
    }
  }
  function drawHost(h: Host) {
    const { ctx, canvas } = h
    const dpr = h.dpr
    const w = canvas.width / dpr,
      hh = canvas.height / dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, hh)

    let maxAlpha = 0

    for (let i = h.ripples.length - 1; i >= 0; i--) {
      const r = h.ripples[i]
      const t = clock - r.start

      // radius
      const p = Math.min(1, t / settings.expandMs)
      const eased = easeExpand(p)
      const radius = Math.max(1, r.rMax * eased)

      // center drift toward element center
      const driftK = settings.drift ? settings.driftAmount * eased : 0
      const cx = lerp(r.x, w / 2, driftK)
      const cy = lerp(r.y, hh / 2, driftK)

      // opacity envelope
      const aIn = Math.min(1, t / settings.opacityInMs)
      let aOut = 1
      if (r.released !== null) {
        const fadeStart = Math.max(r.released, r.start + settings.minPressMs)
        const fp = (clock - fadeStart) / settings.fadeMs
        if (fp >= 1) {
          h.ripples.splice(i, 1)
          continue
        }
        aOut = fp > 0 ? 1 - fade(Math.min(1, fp)) : 1
      }
      const alpha = h.opacity * aIn * aOut
      maxAlpha = Math.max(maxAlpha, aIn * aOut)

      // wavy edge path
      const ampEnv = fade(Math.min(1, Math.max(0, (p - 0.04) / 0.3)))
      const amp = settings.waveAmp * radius * ampEnv
      const time = clock * 0.0011 * settings.waveSpeed
      const N = 96
      ctx.beginPath()
      for (let k = 0; k <= N; k++) {
        const th = (k / N) * Math.PI * 2
        const n = amp ? ringNoise(th, settings.waveFreq, time, r.seed) : 0
        const rad = radius + n * amp
        const px = cx + Math.cos(th) * rad
        const py = cy + Math.sin(th) * rad
        k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()

      // non-solid gradient: dim core → bright rim → feathered edge
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius + amp)
      const [cr, cg, cb] = h.rgb
      const col = (a: number) => `rgba(${cr},${cg},${cb},${a.toFixed(4)})`
      g.addColorStop(0.0, col(alpha * 0.55))
      g.addColorStop(0.55, col(alpha * 0.8))
      g.addColorStop(0.8, col(alpha * 1.0))
      g.addColorStop(1.0, col(0))
      ctx.fillStyle = g
      ctx.fill()
    }

    // sparkle pass: only where ripple pixels already exist,
    // inheriting their alpha (fades out with the gradient)
    if (settings.sparkle && maxAlpha > 0 && h.ripples.length) {
      if (!h.tiles) h.tiles = makeSparkleTiles(h.rgb)
      const frame = ((clock / 90) | 0) % 3
      const drift = clock * 0.006
      ctx.save()
      ctx.globalCompositeOperation = 'source-atop'
      ctx.globalAlpha = 0.55 * maxAlpha
      const pat = ctx.createPattern(h.tiles[frame], 'repeat')
      ctx.translate(-drift % 128, (drift * 0.6) % 128)
      pat && ((ctx.fillStyle = pat), ctx.fillRect(-128, -256, w + 256, hh + 512))
      ctx.restore()
    }
  }

  return {
    spawn(x: number, y: number) {
      settings = getSettings()
      const pixel = readColor()
      const rgb = Array.from(pixel.slice(0, 3))
      if (rgb.some((channel, index) => channel !== h.rgb[index])) h.tiles = null
      h.rgb = rgb
      h.opacity = Math.min(1, Math.max(0, opacity ?? (pixel[3] < 255 ? pixel[3] / 255 : 0.12)))
      if (!canvas.isConnected) {
        el.append(canvas)
        resize()
      }
      const w = el.clientWidth,
        hh = el.clientHeight
      const dk = settings.drift && !media?.matches ? settings.driftAmount : 0
      const fx = lerp(x, w / 2, dk),
        fy = lerp(y, hh / 2, dk)
      const r: Press = {
        x,
        y,
        rMax:
          1.08 *
          Math.max(Math.hypot(fx, fy), Math.hypot(w - fx, fy), Math.hypot(fx, hh - fy), Math.hypot(w - fx, hh - fy)),
        start: clock,
        released: null,
        seed: Math.random() * 100,
      }
      h.ripples.push(r)
      if (!rafId) rafId = win.requestAnimationFrame(tick)
      return () => {
        if (r.released === null) r.released = clock
      }
    },
    dispose() {
      win.cancelAnimationFrame(rafId)
      observer?.disconnect()
      canvas.remove()
      if (positioned && el.style.position === 'relative') el.style.position = oldPosition
      h.ripples.length = 0
    },
  }
}
