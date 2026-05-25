// src/lib/components/website-studio/builder/types.ts
import type React from 'react'
import type { PageSchema } from '../types'

export interface PageAction {
  id: string
  label: string
  icon?: React.ReactNode
  destructive?: boolean
  run: (pageId: string, page: PageSchema) => void
}

export interface PageNode {
  id: string
  slug: string
  name: string
  title: string
  children: PageNode[]
  pageId: string
}

export interface ComponentTreeNode {
  id: string
  name: string
  isCategory: boolean
  children?: ComponentTreeNode[]
}
