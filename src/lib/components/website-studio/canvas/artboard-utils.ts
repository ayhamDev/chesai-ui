// src/lib/components/website-studio/canvas/artboard-utils.ts

import type { ComponentControl, StudioNode } from '../types'

export const isRectEqual = (a: DOMRect | null | undefined, b: DOMRect | null | undefined) => {
  if (!a && !b) return true
  if (!a || !b) return false
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  )
}

export const findNodeById = (nodes: StudioNode[], id: string): StudioNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNodeById(n.children, id)
      if (found) return found
    }
  }
  return null
}

export const getParentAndIndex = (
  nodes: StudioNode[],
  targetId: string,
  parentId: string | null = null,
): { parentId: string | null; index: number } | null => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      return { parentId, index: i }
    }
    if (nodes[i].children) {
      const res = getParentAndIndex(nodes[i].children || [], targetId, nodes[i].id)
      if (res) return res
    }
  }
  return null
}

export function generateSingleAxisVariations(controls: Record<string, ComponentControl>) {
  const propKeys = Object.keys(controls || {})
  const baselineProps: Record<string, any> = {}

  if (propKeys.length === 0) return { baselineProps: {}, groups: [] }

  propKeys.forEach(key => {
    const control = controls[key]
    if (control.defaultValue !== undefined) {
      baselineProps[key] = control.defaultValue
    } else if (control.type === 'select' && control.options?.length) {
      baselineProps[key] = control.options[0].value
    } else if (control.type === 'boolean') {
      baselineProps[key] = false
    } else if (control.type === 'text' || control.type === 'textarea') {
      baselineProps[key] = 'Sample Text'
    } else if (control.type === 'number' || control.type === 'slider') {
      baselineProps[key] = control.min || 0
    } else if (control.type === 'color') {
      baselineProps[key] = '#0070f3'
    } else {
      baselineProps[key] = null
    }
  })

  const groups: {
    propName: string
    variations: { props: Record<string, any>; value: any }[]
  }[] = []

  propKeys.forEach(key => {
    const control = controls[key]
    let values: any[] = []

    if (control.type === 'select' && control.options) {
      values = control.options.map(opt => opt.value)
    } else if (control.type === 'boolean') {
      values = [true, false]
    }

    values = Array.from(new Set(values))

    if (values.length > 1) {
      groups.push({
        propName: key,
        variations: values.map(v => ({
          props: { ...baselineProps, [key]: v },
          value: v,
        })),
      })
    }
  })

  return { baselineProps, groups }
}
