// src/lib/components/website-studio/canvas/artboard-types.ts

export type InteractionState =
  | { type: 'idle' }
  | { type: 'marquee_prep'; startCoords: { x: number; y: number } }
  | {
      type: 'marquee'
      startCoords: { x: number; y: number }
      currentCoords: { x: number; y: number }
    }
  | { type: 'drag_prep'; startCoords: { x: number; y: number } }
  | {
      type: 'drag'
      startCoords: { x: number; y: number }
      currentCoords: { x: number; y: number }
    }

export type DropTarget = {
  parentId: string | null
  index?: number
  type: 'line' | 'box'
  rect: { top: number; left: number; width: number; height: number }
}

export type ArtboardData = {
  label: string
  width: number
  height: number
  isIsolationMode?: boolean
  componentId?: string
}
