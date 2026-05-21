import { produce } from 'immer'
import { create } from 'zustand'
import type { StudioNode, WebsiteSchema } from './types'

// --- RECURSIVE HIERARCHY HELPERS ---

/**
 * Searches a node tree to locate a specific node, its parent array, and its current index.
 */
function findNodeAndParent(
  nodes: StudioNode[],
  targetId: string,
): { node: StudioNode; parentArray: StudioNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      return { node: nodes[i], parentArray: nodes, index: i }
    }
    if (nodes[i].children) {
      const result = findNodeAndParent(nodes[i].children, targetId)
      if (result) return result
    }
  }
  return null
}

/**
 * Simple recursive lookup to find a specific node by ID.
 */
function findNodeById(nodes: StudioNode[], targetId: string): StudioNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return node
    if (node.children) {
      const found = findNodeById(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

/**
 * Failsafe to verify if a node is an ancestor of a targeted parent candidate.
 * Prevents circular node structures.
 */
function isDescendant(node: StudioNode, possibleDescendantId: string): boolean {
  if (!node.children) return false
  for (const child of node.children) {
    if (child.id === possibleDescendantId) return true
    if (isDescendant(child, possibleDescendantId)) return true
  }
  return false
}

// --- STORE DEFINITION ---

interface StudioState {
  // Data State
  website: WebsiteSchema | null
  activePageId: string | null

  // Interactive UI State
  selectedNodeId: string | null
  hoveredNodeId: string | null

  // Initialization & Context Actions
  initStudio: (schema: WebsiteSchema) => void
  setActivePage: (pageId: string) => void
  selectNode: (id: string | null) => void
  setHoveredNode: (id: string | null) => void

  // Data Manipulation Actions
  addNode: (node: StudioNode, parentId?: string | null, index?: number) => void
  removeNode: (nodeId: string) => void
  moveNode: (nodeId: string, targetParentId: string | null, index?: number) => void
  updateNodeProps: (nodeId: string, props: Record<string, any>) => void
  updateDesignSystemTokens: (tokens: Record<string, string | number>) => void
}

export const useStudioStore = create<StudioState>(set => ({
  website: null,
  activePageId: null,
  selectedNodeId: null,
  hoveredNodeId: null,

  initStudio: schema =>
    set({
      website: schema,
      activePageId: schema.pages[0]?.id || null,
      selectedNodeId: null,
      hoveredNodeId: null,
    }),

  setActivePage: pageId =>
    set({
      activePageId: pageId,
      selectedNodeId: null,
      hoveredNodeId: null,
    }),

  selectNode: id => set({ selectedNodeId: id }),
  setHoveredNode: id => set({ hoveredNodeId: id }),

  /**
   * Adds a node into the active page layout tree.
   * If parentId is null/undefined, it is appended to the root level.
   */
  addNode: (node, parentId = null, index) =>
    set(
      produce((state: StudioState) => {
        if (!state.website || !state.activePageId) return

        const page = state.website.pages.find(p => p.id === state.activePageId)
        if (!page) return

        if (!parentId) {
          // Add to page root
          if (typeof index === 'number') {
            page.content.splice(index, 0, node)
          } else {
            page.content.push(node)
          }
        } else {
          // Add inside another node's children list
          const parentNode = findNodeById(page.content, parentId)
          if (!parentNode) return

          if (!parentNode.children) {
            parentNode.children = []
          }

          if (typeof index === 'number') {
            parentNode.children.splice(index, 0, node)
          } else {
            parentNode.children.push(node)
          }
        }
      }),
    ),

  /**
   * Removes a node recursively by ID from the active page layout tree.
   */
  removeNode: nodeId =>
    set(
      produce((state: StudioState) => {
        if (!state.website || !state.activePageId) return

        const page = state.website.pages.find(p => p.id === state.activePageId)
        if (!page) return

        const lookup = findNodeAndParent(page.content, nodeId)
        if (!lookup) return

        const { parentArray, index } = lookup
        parentArray.splice(index, 1)

        // Clear selection if the active selection was deleted
        if (state.selectedNodeId === nodeId) {
          state.selectedNodeId = null
        }
        if (state.hoveredNodeId === nodeId) {
          state.hoveredNodeId = null
        }
      }),
    ),

  /**
   * Moves an existing node to a new parent and index in the active page layout tree.
   */
  moveNode: (nodeId, targetParentId, index) =>
    set(
      produce((state: StudioState) => {
        if (!state.website || !state.activePageId) return

        const page = state.website.pages.find(p => p.id === state.activePageId)
        if (!page) return

        // 1. Locate the source node and its reference parent array
        const sourceLookup = findNodeAndParent(page.content, nodeId)
        if (!sourceLookup) return

        const { node: sourceNode, parentArray: sourceParentArray, index: sourceIndex } = sourceLookup

        // 2. Prevent structural loops (cannot drop parent inside itself or its children)
        if (targetParentId === nodeId) return
        if (targetParentId && isDescendant(sourceNode, targetParentId)) return

        // 3. Remove node from original location
        sourceParentArray.splice(sourceIndex, 1)

        // 4. Insert node into the target destination
        if (!targetParentId) {
          // Insert at page root level
          const targetIndex = typeof index === 'number' ? index : page.content.length
          page.content.splice(targetIndex, 0, sourceNode)
        } else {
          // Insert inside another node
          const targetParentNode = findNodeById(page.content, targetParentId)
          if (!targetParentNode) {
            // Rollback delete if target parent is invalid
            sourceParentArray.splice(sourceIndex, 0, sourceNode)
            return
          }

          if (!targetParentNode.children) {
            targetParentNode.children = []
          }

          const targetIndex = typeof index === 'number' ? index : targetParentNode.children.length
          targetParentNode.children.splice(targetIndex, 0, sourceNode)
        }
      }),
    ),

  /**
   * Merges custom properties into the selected node.
   */
  updateNodeProps: (nodeId, props) =>
    set(
      produce((state: StudioState) => {
        if (!state.website || !state.activePageId) return

        const page = state.website.pages.find(p => p.id === state.activePageId)
        if (!page) return

        const node = findNodeById(page.content, nodeId)
        if (node) {
          node.props = {
            ...node.props,
            ...props,
          }
        }
      }),
    ),

  /**
   * Updates style tokens globally in the active design system configuration.
   */
  updateDesignSystemTokens: tokens =>
    set(
      produce((state: StudioState) => {
        if (!state.website) return
        state.website.designSystem.tokens = {
          ...state.website.designSystem.tokens,
          ...tokens,
        }
      }),
    ),
}))
