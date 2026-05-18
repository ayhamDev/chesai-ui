import type React from 'react'

// --- 1. Property Control Schemas ---
export type ControlType = 'text' | 'textarea' | 'number' | 'color' | 'select' | 'boolean' | 'image' | 'link' | 'slider'

export interface ComponentControl {
  type: ControlType
  label: string
  defaultValue?: any
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
  description?: string
}

// --- 2. Registry Schema ---
export interface RegistryComponent {
  name: string
  /**
   * Folder-like categorization for the future Builder UI.
   * e.g., "Primitives/Typography", "Blocks/Navbars", "Blocks/Pricing"
   */
  category: string
  thumbnail?: string
  render: React.FC<any>
  controls: Record<string, ComponentControl>
}

export type ComponentRegistry = Record<string, RegistryComponent>

// --- 3. JSON Node & Page Schemas ---
export interface StudioNode {
  id: string
  type: string
  props: Record<string, any>
  children?: StudioNode[]
}

export interface PageSchema {
  id: string
  slug: string
  title: string
  description?: string
  content: StudioNode[]
}

export interface DesignSystemSchema {
  seedColor?: string | null
  theme?: 'light' | 'dark' | 'system'
  contrast?: 'standard' | 'medium' | 'high'
  fonts?: {
    brand: string
    plain: string
  }
}

export interface WebsiteSchema {
  projectSettings: {
    name: string
    domain?: string
  }
  designSystem: DesignSystemSchema
  pages: PageSchema[]
}
