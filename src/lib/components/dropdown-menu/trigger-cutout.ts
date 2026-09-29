/** Follow the trigger's CSS border box, including elliptical and unequal corners. */
export function triggerCutout(trigger: HTMLElement): string {
  const { left: x, top: y, right, bottom, width, height } = trigger.getBoundingClientRect()
  if (width <= 0 || height <= 0) return ''
  const style = getComputedStyle(trigger)
  const scaleX = trigger.offsetWidth ? width / trigger.offsetWidth : 1
  const scaleY = trigger.offsetHeight ? height / trigger.offsetHeight : 1
  const radius = (value: string): [number, number] => {
    const [horizontal = '0', vertical = horizontal] = value.split(/\s+/)
    const resolve = (v: string, size: number, scale: number) =>
      Math.max(0, (Number.parseFloat(v) || 0) * (v.endsWith('%') ? size / 100 : scale))
    return [resolve(horizontal, width, scaleX), resolve(vertical, height, scaleY)]
  }
  const corners = [style.borderTopLeftRadius, style.borderTopRightRadius,
    style.borderBottomRightRadius, style.borderBottomLeftRadius].map(radius)
  const [tl, tr, br, bl] = corners
  // CSS reduces all radii together when adjacent corners would overlap.
  const factor = Math.min(1, width / (tl[0] + tr[0]), width / (bl[0] + br[0]),
    height / (tl[1] + bl[1]), height / (tr[1] + br[1]))
  for (const corner of corners) { corner[0] *= factor; corner[1] *= factor }
  const arc = (r: number[], endX: number, endY: number) =>
    r[0] && r[1] ? `A ${r[0]} ${r[1]} 0 0 1 ${endX} ${endY}` : `L ${endX} ${endY}`
  const view = trigger.ownerDocument.defaultView!
  return `path(evenodd, "M 0 0 H ${view.innerWidth} V ${view.innerHeight} H 0 Z ` +
    `M ${x + tl[0]} ${y} H ${right - tr[0]} ${arc(tr, right, y + tr[1])} ` +
    `V ${bottom - br[1]} ${arc(br, right - br[0], bottom)} ` +
    `H ${x + bl[0]} ${arc(bl, x, bottom - bl[1])} ` +
    `V ${y + tl[1]} ${arc(tl, x + tl[0], y)} Z")`
}
