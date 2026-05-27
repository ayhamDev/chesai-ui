// src/lib/components/website-studio/store.ts

import { produce } from 'immer'
import { create } from 'zustand'
import type { StudioNode, WebsiteSchema } from './types'

// --- RECURSIVE HIERARCHY HELPERS ---

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

function isDescendant(node: StudioNode, possibleDescendantId: string): boolean {
  if (!node.children) return false
  for (const child of node.children) {
    if (child.id === possibleDescendantId) return true
    if (isDescendant(child, possibleDescendantId)) return true
  }
  return false
}

function cloneNodeWithNewIds(node: StudioNode): StudioNode {
  const newId = `${node.type.toLowerCase()}_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`
  return {
    ...node,
    id: newId,
    children: node.children ? node.children.map(cloneNodeWithNewIds) : undefined,
  }
}

// --- STORE DEFINITION ---

interface StudioState {
  // Data State
  website: WebsiteSchema | null
  activePageId: string | null

  // History State
  past: WebsiteSchema[]
  future: WebsiteSchema[]
  undo: () => void
  redo: () => void

  // Interactive UI State
  selectedNodeIds: string[]
  hoveredNodeId: string | null

  // Component Picker State (Insert / Replace)
  componentPicker: {
    isOpen: boolean
    action: 'before' | 'after' | 'inside' | 'replace' | null
    targetId: string | null
  }
  openComponentPicker: (action: 'before' | 'after' | 'inside' | 'replace', targetId: string) => void
  closeComponentPicker: () => void

  // Context tracking
  viewContext: {
    type: 'PAGE' | 'COMPONENT'
    id: string | null
  }

  // Clipboard & Node Actions
  clipboard: StudioNode[]
  copyNodes: (nodeIds: string[]) => void
  pasteNodes: (targetId: string | null, position?: 'inside' | 'after') => void
  duplicateNodes: (nodeIds: string[]) => void

  // Initialization
  initStudio: (schema: WebsiteSchema) => void
  setActivePage: (pageId: string) => void
  setViewContext: (type: 'PAGE' | 'COMPONENT', id: string | null) => void

  // Selection
  setSelectedNodes: (ids: string[]) => void
  toggleNodeSelection: (id: string, multi: boolean) => void
  setHoveredNode: (id: string | null) => void

  // Data Manipulation Actions (Canvas)
  addNode: (node: StudioNode, parentId?: string | null, index?: number) => void
  removeNodes: (nodeIds: string[]) => void
  moveNode: (nodeId: string, targetParentId: string | null, index?: number) => void
  moveNodes: (nodeIds: string[], targetParentId: string | null, index?: number) => void
  updateNodeProps: (nodeId: string, props: Record<string, any>) => void
  updateNodeId: (oldId: string, newId: string) => void // <-- NEW: Update Node ID action
  updateDesignSystemTokens: (tokens: Record<string, string | number>) => void
  insertNodeRelative: (node: StudioNode, targetId: string, position: 'before' | 'after' | 'inside') => void
  replaceNode: (targetId: string, newNode: StudioNode) => void

  // Page Management Actions
  addPage: (slug: string, title: string) => void
  updatePage: (id: string, slug: string, title: string) => void
  duplicatePage: (id: string) => void
  removePage: (id: string) => void
}

// Snapshot Helper
const saveSnapshot = (state: StudioState, draft: StudioState) => {
  if (state.website) {
    draft.past.push(JSON.parse(JSON.stringify(state.website)))
    if (draft.past.length > 50) draft.past.shift()
    draft.future = []
  }
}

export const useStudioStore = create<StudioState>(set => ({
  website: null,
  activePageId: null,
  selectedNodeIds: [],
  hoveredNodeId: null,
  viewContext: { type: 'PAGE', id: null },

  componentPicker: { isOpen: false, action: null, targetId: null },
  openComponentPicker: (action, targetId) => set({ componentPicker: { isOpen: true, action, targetId } }),
  closeComponentPicker: () => set({ componentPicker: { isOpen: false, action: null, targetId: null } }),

  past: [],
  future: [],
  clipboard: [],

  undo: () =>
    set(state => {
      if (state.past.length === 0 || !state.website) return state
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, -1)
      return {
        ...state,
        website: previous,
        past: newPast,
        future: [state.website, ...state.future],
      }
    }),

  redo: () =>
    set(state => {
      if (state.future.length === 0 || !state.website) return state
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      return {
        ...state,
        website: next,
        past: [...state.past, state.website],
        future: newFuture,
      }
    }),

  copyNodes: nodeIds =>
    set(state => {
      if (!state.website || !state.activePageId || nodeIds.length === 0) return state
      const page = state.website.pages.find(p => p.id === state.activePageId)
      if (!page) return state

      const topLevelIds = new Set<string>()
      function findTopLevel(nodes: StudioNode[], hasActiveAncestor: boolean) {
        for (const node of nodes) {
          const isActive = nodeIds.includes(node.id)
          if (isActive && !hasActiveAncestor) {
            topLevelIds.add(node.id)
          }
          if (node.children) {
            findTopLevel(node.children, hasActiveAncestor || isActive)
          }
        }
      }
      findTopLevel(page.content, false)

      const copied: StudioNode[] = []
      for (const id of Array.from(topLevelIds)) {
        const node = findNodeById(page.content, id)
        if (node) copied.push(JSON.parse(JSON.stringify(node)))
      }
      return { clipboard: copied }
    }),

  pasteNodes: (targetId, position = 'inside') =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId || draft.clipboard.length === 0) return
        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        const newNodes = draft.clipboard.map(cloneNodeWithNewIds)

        if (!targetId || targetId === 'ROOT') {
          page.content.push(...newNodes)
          return
        }

        if (position === 'inside') {
          const targetNode = findNodeById(page.content, targetId)
          if (targetNode) {
            if (!targetNode.children) targetNode.children = []
            targetNode.children.push(...newNodes)
          } else {
            page.content.push(...newNodes)
          }
        } else if (position === 'after') {
          const lookup = findNodeAndParent(page.content, targetId)
          if (lookup) {
            const { parentArray, index } = lookup
            parentArray.splice(index + 1, 0, ...newNodes)
          } else {
            page.content.push(...newNodes)
          }
        }
      }),
    ),

  duplicateNodes: nodeIds =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId || nodeIds.length === 0) return
        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        const topLevelIds = new Set<string>()
        function findTopLevel(nodes: StudioNode[], hasActiveAncestor: boolean) {
          for (const node of nodes) {
            const isActive = nodeIds.includes(node.id)
            if (isActive && !hasActiveAncestor) {
              topLevelIds.add(node.id)
            }
            if (node.children) {
              findTopLevel(node.children, hasActiveAncestor || isActive)
            }
          }
        }
        findTopLevel(page.content, false)

        for (const id of Array.from(topLevelIds)) {
          const lookup = findNodeAndParent(page.content, id)
          if (lookup) {
            const { node, parentArray, index } = lookup
            const cloned = cloneNodeWithNewIds(node)
            parentArray.splice(index + 1, 0, cloned)
          }
        }
      }),
    ),

  initStudio: schema =>
    set({
      website: schema,
      activePageId: schema.pages[0]?.id || null,
      viewContext: { type: 'PAGE', id: schema.pages[0]?.id || null },
      selectedNodeIds: [],
      hoveredNodeId: null,
      past: [],
      future: [],
    }),

  setActivePage: pageId =>
    set({
      activePageId: pageId,
      viewContext: { type: 'PAGE', id: pageId },
      selectedNodeIds: [],
      hoveredNodeId: null,
    }),

  setViewContext: (type, id) =>
    set({
      viewContext: { type, id },
      selectedNodeIds: [],
      hoveredNodeId: null,
    }),

  setSelectedNodes: ids => set({ selectedNodeIds: ids }),

  toggleNodeSelection: (id, multi) =>
    set(state => {
      if (!multi) return { selectedNodeIds: [id] }
      if (state.selectedNodeIds.includes(id)) {
        return { selectedNodeIds: state.selectedNodeIds.filter(i => i !== id) }
      }
      return { selectedNodeIds: [...state.selectedNodeIds, id] }
    }),

  setHoveredNode: id => set({ hoveredNodeId: id }),

  addNode: (node, parentId = null, index) =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId) return

        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        if (!parentId || parentId === 'ROOT') {
          if (typeof index === 'number') {
            page.content.splice(index, 0, node)
          } else {
            page.content.push(node)
          }
        } else {
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

  insertNodeRelative: (node, targetId, position) =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId) return

        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        if (targetId === 'ROOT') {
          page.content.push(node)
          return
        }

        if (position === 'inside') {
          const targetNode = findNodeById(page.content, targetId)
          if (targetNode) {
            if (!targetNode.children) targetNode.children = []
            targetNode.children.push(node)
          }
        } else {
          const lookup = findNodeAndParent(page.content, targetId)
          if (lookup) {
            const { parentArray, index } = lookup
            const insertIndex = position === 'before' ? index : index + 1
            parentArray.splice(insertIndex, 0, node)
          }
        }
      }),
    ),

  replaceNode: (targetId, newNode) =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId) return

        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        const lookup = findNodeAndParent(page.content, targetId)
        if (lookup) {
          const { parentArray, index } = lookup
          parentArray[index] = newNode
          if (draft.selectedNodeIds.includes(targetId)) {
            draft.selectedNodeIds = [newNode.id]
          }
          if (draft.hoveredNodeId === targetId) {
            draft.hoveredNodeId = null
          }
        }
      }),
    ),

  removeNodes: nodeIds =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId) return

        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        for (const nodeId of nodeIds) {
          const lookup = findNodeAndParent(page.content, nodeId)
          if (lookup) {
            const { parentArray, index } = lookup
            parentArray.splice(index, 1)
          }
        }

        draft.selectedNodeIds = draft.selectedNodeIds.filter(id => !nodeIds.includes(id))
        if (draft.hoveredNodeId && nodeIds.includes(draft.hoveredNodeId)) {
          draft.hoveredNodeId = null
        }
      }),
    ),

  moveNode: (nodeId, targetParentId, index) =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId) return

        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        const sourceLookup = findNodeAndParent(page.content, nodeId)
        if (!sourceLookup) return

        const { node: sourceNode, parentArray: sourceParentArray, index: sourceIndex } = sourceLookup

        if (targetParentId === nodeId) return
        if (targetParentId && isDescendant(sourceNode, targetParentId)) return

        sourceParentArray.splice(sourceIndex, 1)

        if (!targetParentId || targetParentId === 'ROOT') {
          const targetIndex = typeof index === 'number' ? index : page.content.length
          page.content.splice(targetIndex, 0, sourceNode)
        } else {
          const targetParentNode = findNodeById(page.content, targetParentId)
          if (!targetParentNode) {
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

  moveNodes: (nodeIds, targetParentId, index) =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId || nodeIds.length === 0) return

        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        const topLevelActiveIds = new Set<string>()
        function findTopLevel(nodes: StudioNode[], hasActiveAncestor: boolean) {
          for (const node of nodes) {
            const isActive = nodeIds.includes(node.id)
            if (isActive && !hasActiveAncestor) {
              topLevelActiveIds.add(node.id)
            }
            if (node.children) {
              findTopLevel(node.children, hasActiveAncestor || isActive)
            }
          }
        }
        findTopLevel(page.content, false)

        const nodesToMove: StudioNode[] = []
        let targetIndex = typeof index === 'number' ? index : -1

        function extract(nodes: StudioNode[], currentParentId: string | null) {
          for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i]
            if (topLevelActiveIds.has(node.id)) {
              const [removed] = nodes.splice(i, 1)
              nodesToMove.unshift(removed)
              if (currentParentId === targetParentId && targetIndex !== -1 && i < targetIndex) {
                targetIndex--
              }
            } else if (node.children) {
              extract(node.children, node.id)
            }
          }
        }
        extract(page.content, null)

        if (targetParentId === null || targetParentId === 'ROOT') {
          const insertIndex = targetIndex === -1 ? page.content.length : targetIndex
          page.content.splice(insertIndex, 0, ...nodesToMove)
        } else {
          const targetNode = findNodeById(page.content, targetParentId)
          if (targetNode) {
            if (!targetNode.children) targetNode.children = []
            const insertIndex = targetIndex === -1 ? targetNode.children.length : targetIndex
            targetNode.children.splice(insertIndex, 0, ...nodesToMove)
          } else {
            page.content.push(...nodesToMove)
          }
        }
      }),
    ),

  updateNodeProps: (nodeId, props) =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website || !draft.activePageId) return

        const page = draft.website.pages.find(p => p.id === draft.activePageId)
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

  // --- NEW: Implement updateNodeId safely ---
  updateNodeId: (oldId, newId) =>
    set(state =>
      produce(state, draft => {
        if (!draft.website || !draft.activePageId || oldId === newId || !newId.trim()) return

        const page = draft.website.pages.find(p => p.id === draft.activePageId)
        if (!page) return

        // Validate uniqueness: Abort if newId is already taken anywhere on the page
        if (findNodeById(page.content, newId.trim())) return

        // We only save snapshot if the validation passes
        saveSnapshot(state, draft)

        const lookup = findNodeAndParent(page.content, oldId)
        if (lookup) {
          lookup.node.id = newId.trim()

          // Sync interactive selections so the user doesn't lose focus
          if (draft.selectedNodeIds.includes(oldId)) {
            draft.selectedNodeIds = draft.selectedNodeIds.map(id => (id === oldId ? newId.trim() : id))
          }
          if (draft.hoveredNodeId === oldId) {
            draft.hoveredNodeId = newId.trim()
          }
        }
      }),
    ),

  updateDesignSystemTokens: tokens =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website) return
        draft.website.designSystem.tokens = {
          ...draft.website.designSystem.tokens,
          ...tokens,
        }
      }),
    ),

  addPage: (slug, title) =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website) return
        draft.website.pages.push({
          id: `page_${Date.now()}`,
          slug: slug.startsWith('/') ? slug : `/${slug}`,
          title: title || 'New Page',
          content: [],
        })
      }),
    ),

  updatePage: (id, slug, title) =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website) return
        const page = draft.website.pages.find(p => p.id === id)
        if (page) {
          page.slug = slug
          page.title = title
        }
      }),
    ),

  duplicatePage: id =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website) return
        const pageToDup = draft.website.pages.find(p => p.id === id)
        if (pageToDup) {
          draft.website.pages.push({
            ...JSON.parse(JSON.stringify(pageToDup)),
            id: `page_${Date.now()}`,
            slug: `${pageToDup.slug}-copy`,
            title: `${pageToDup.title} (Copy)`,
          })
        }
      }),
    ),

  removePage: id =>
    set(state =>
      produce(state, draft => {
        saveSnapshot(state, draft)
        if (!draft.website) return
        draft.website.pages = draft.website.pages.filter(p => p.id !== id)
        if (draft.activePageId === id) {
          draft.activePageId = draft.website.pages[0]?.id || null
          if (draft.activePageId) {
            draft.viewContext = { type: 'PAGE', id: draft.activePageId }
          }
        }
      }),
    ),
}))
