'use client'

import { useEffect, useState } from 'react'

export const BASEMAPS = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
  voyager: 'https://tiles.openfreemap.org/styles/liberty',
}

// --- HELPER: Resolve CSS Variables ---
export const useResolvedColor = (colorString: string) => {
  const [resolved, setResolved] = useState(() => (colorString?.startsWith('var(') ? 'rgba(0,0,0,0)' : colorString))

  useEffect(() => {
    if (!colorString || !colorString.startsWith('var(')) {
      setResolved(colorString)
      return
    }
    const tempEl = document.createElement('div')
    tempEl.style.color = colorString
    tempEl.style.display = 'none'
    document.body.appendChild(tempEl)
    const computedColor = getComputedStyle(tempEl).color
    setResolved(computedColor)
    document.body.removeChild(tempEl)
  }, [colorString])

  return resolved
}

// --- HELPER: Point in Polygon (Ray Casting) ---
export const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
  const x = point[0]
  const y = point[1]
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1]
    const xj = polygon[j][0],
      yj = polygon[j][1]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}
