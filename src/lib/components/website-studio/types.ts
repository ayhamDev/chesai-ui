// src/lib/components/website-studio/types.ts
import type React from 'react'

// --- 1. Property Control Schemas ---
// --- 1. Property Control Schemas ---
export type ControlType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'color'
  | 'select'
  | 'boolean'
  | 'image'
  | 'link'
  | 'slider'
  | 'custom'

export interface ComponentControl {
  type: ControlType
  label: string
  defaultValue?: any
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
  description?: string

  // --- NEW: Advanced Panel Features ---
  group?: string // Groups controls together in an Accordion (e.g., "Layout", "Links")
  supportsCMS?: boolean // Shows the CMS binding toggle icon
  readOnly?: boolean // Shows the value but prevents editing

  // Conditional Logic (Evaluated against the node's current props)
  hidden?: boolean | ((currentProps: Record<string, any>) => boolean)
  disabled?: boolean | ((currentProps: Record<string, any>) => boolean)

  // Escape hatch for completely custom UI in the properties panel
  render?: (args: {
    value: any
    onChange: (val: any) => void
    currentProps: Record<string, any>
    nodeId: string
  }) => React.ReactNode
}

// --- NEW: Agnostic Theme Registry ---
// The developer defines what theme variables exist for their library.
export type ThemeRegistry = Record<
  string, // Group Name (e.g., "Colors", "Typography", "Spacing")
  Record<string, ComponentControl> // The CSS Variable Name mapped to an input control
>

// --- 2. Component Registry ---
export interface RegistryComponent {
  name: string
  category: string
  thumbnail?: string
  render: React.FC<any>
  controls: Record<string, ComponentControl>
  acceptsChildren?: boolean // Determines if elements can be dropped inside this component
}

export type ComponentRegistry = Record<string, RegistryComponent>

// --- 3. JSON Node & Page Schemas ---
export interface StudioNode {
  id: string
  type: string
  props: Record<string, any>
  events?: Record<string, StudioEventAction[]> // NEW: Added event schema
  children?: StudioNode[]
}

// NEW: Event Action Schema
export interface StudioEventAction {
  actionId: string // Refers to the developer's Actions Registry OR "$customCode"
  args?: any[] // Arguments passed into the action
  code?: string // Used ONLY if actionId is "$customCode"
}

export interface PageSchema {
  id: string
  slug: string
  title: string
  description?: string
  content: StudioNode[]
}

// --- UPDATED: 100% Agnostic Design System Schema ---
export interface DesignSystemSchema {
  // Stored values map directly to the keys defined in the ThemeRegistry
  // Example: { "--color-primary": "#3b82f6", "--font-base": "Inter" }
  tokens: Record<string, string | number>
  // Allow for dark/light mode toggles if the developer's system supports it
  mode?: string
}

export interface WebsiteSchema {
  projectSettings: {
    name: string
    domain?: string
  }
  designSystem: DesignSystemSchema
  pages: PageSchema[]
}
