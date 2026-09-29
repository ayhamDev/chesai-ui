/** The original solid-disc effect and timing, with explicit lifecycle cleanup. */
export function createClassicRipple(el: HTMLElement, color: string, opacity?: number) {
  const win = el.ownerDocument.defaultView!
  const container = el.ownerDocument.createElement('div')
  container.dataset.chesaiClassicRipple = ''
  container.setAttribute('aria-hidden', 'true')
  container.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;overflow:hidden;'
  const oldPosition = el.style.position
  const positioned = win.getComputedStyle(el).position === 'static'
  if (positioned) el.style.position = 'relative'
  const frames = new Set<number>()
  const timers = new Set<number>()
  const duration = 400
  const later = (fn: () => void, delay: number) => {
    const id = win.setTimeout(() => {
      timers.delete(id)
      fn()
    }, delay)
    timers.add(id)
  }
  return {
    spawn(x: number, y: number) {
      if (!container.isConnected) el.append(container)
      const disc = el.ownerDocument.createElement('div')
      const diameter = 2 * Math.hypot(Math.max(x, el.clientWidth - x), Math.max(y, el.clientHeight - y))
      const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      disc.style.cssText = `position:absolute;pointer-events:none;border-radius:50%;width:${diameter}px;height:${diameter}px;left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(${reduced ? 1 : 0});opacity:${opacity ?? 0.6};transition:transform ${duration * 0.6}ms cubic-bezier(.42,.36,.28,.88);`
      disc.style.background = color
      container.append(disc)
      const begun = win.performance.now()
      const frame = win.requestAnimationFrame(() => {
        frames.delete(frame)
        disc.style.transform = 'translate(-50%,-50%) scale(1)'
      })
      frames.add(frame)
      let released = false
      return () => {
        if (released) return
        released = true
        later(
          () => {
            disc.style.transition = `transform ${duration * 0.6}ms cubic-bezier(.42,.36,.28,.88), opacity ${duration * 0.65}ms ease-in-out ${duration * 0.13}ms`
            disc.style.opacity = '0'
            later(() => {
              disc.remove()
              if (!container.childElementCount) container.remove()
            }, duration * 0.78)
          },
          Math.max(0, duration * 0.4 - (win.performance.now() - begun)),
        )
      }
    },
    dispose() {
      frames.forEach(id => win.cancelAnimationFrame(id))
      timers.forEach(id => win.clearTimeout(id))
      frames.clear()
      timers.clear()
      container.remove()
      if (positioned && el.style.position === 'relative') el.style.position = oldPosition
    },
  }
}
