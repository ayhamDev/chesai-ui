import { create } from 'zustand'
import type { BuilderNode, BuilderState } from './types'

export const generateId = () => `node_${Math.random().toString(36).substring(2, 9)}`

const INITIAL_ROOT_NODE: BuilderNode = {
  id: 'ROOT',
  type: 'Container',
  props: {
    className: 'w-full min-h-screen bg-background flex flex-col p-8 gap-4',
    style: {},
  },
  children: [],
  parent: null,
  isCanvas: true,
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  siteId: 'site_new',
  designSystem: {
    seedColor: '#8F4C38', // Default Chesai UI color
    fonts: {
      brand: 'Manrope',
      plain: 'Inter',
      expressiveButtons: true,
    },
  },
  pages: {
    page_home: {
      id: 'page_home',
      name: 'Home',
      path: '/',
      nodes: {
        ROOT: INITIAL_ROOT_NODE,
      },
    },
  },
  activePageId: 'page_home',
  selectedNodeId: null,
  editingNodeId: null,

  selectNode: nodeId =>
    set(state => ({
      selectedNodeId: nodeId,
      editingNodeId: state.editingNodeId !== nodeId ? null : state.editingNodeId,
    })),

  setEditingNode: nodeId => set({ editingNodeId: nodeId }),

  updateNodeProp: (nodeId, propKey, value) =>
    set(state => {
      const activePage = state.pages[state.activePageId]
      const node = activePage.nodes[nodeId]
      if (!node) return state

      return {
        pages: {
          ...state.pages,
          [state.activePageId]: {
            ...activePage,
            nodes: {
              ...activePage.nodes,
              [nodeId]: {
                ...node,
                props: { ...node.props, [propKey]: value },
              },
            },
          },
        },
      }
    }),

  updateDesignSystem: data =>
    set(state => ({
      designSystem: {
        ...state.designSystem,
        ...data,
      },
    })),

  addNode: (nodeData, parentId, index) =>
    set(state => {
      const activePage = state.pages[state.activePageId]
      const parentNode = activePage.nodes[parentId]

      if (!parentNode || !parentNode.isCanvas) return state

      const newNodeId = generateId()
      const newNode: BuilderNode = { ...nodeData, id: newNodeId, parent: parentId }

      const newChildren = [...parentNode.children]
      if (index !== undefined) {
        newChildren.splice(index, 0, newNodeId)
      } else {
        newChildren.push(newNodeId)
      }

      return {
        pages: {
          ...state.pages,
          [state.activePageId]: {
            ...activePage,
            nodes: {
              ...activePage.nodes,
              [newNodeId]: newNode,
              [parentId]: { ...parentNode, children: newChildren },
            },
          },
        },
      }
    }),

  addNodeTree: (nodes, rootNodeId, parentId, index) =>
    set(state => {
      const activePage = state.pages[state.activePageId]
      const parentNode = activePage.nodes[parentId]

      if (!parentNode || !parentNode.isCanvas) return state

      const newChildren = [...parentNode.children]
      if (index !== undefined) {
        newChildren.splice(index, 0, rootNodeId)
      } else {
        newChildren.push(rootNodeId)
      }

      nodes[rootNodeId].parent = parentId

      return {
        pages: {
          ...state.pages,
          [state.activePageId]: {
            ...activePage,
            nodes: {
              ...activePage.nodes,
              ...nodes,
              [parentId]: { ...parentNode, children: newChildren },
            },
          },
        },
      }
    }),

  removeNode: nodeId =>
    set(state => {
      if (nodeId === 'ROOT') return state

      const activePage = state.pages[state.activePageId]
      const nodeToRemove = activePage.nodes[nodeId]
      if (!nodeToRemove) return state

      const parentNode = activePage.nodes[nodeToRemove.parent!]
      const newNodes = { ...activePage.nodes }

      const deleteRecursively = (id: string) => {
        const node = newNodes[id]
        if (node) {
          node.children.forEach(deleteRecursively)
          delete newNodes[id]
        }
      }

      deleteRecursively(nodeId)

      if (parentNode) {
        newNodes[parentNode.id] = {
          ...parentNode,
          children: parentNode.children.filter(id => id !== nodeId),
        }
      }

      return {
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        editingNodeId: state.editingNodeId === nodeId ? null : state.editingNodeId,
        pages: {
          ...state.pages,
          [state.activePageId]: {
            ...activePage,
            nodes: newNodes,
          },
        },
      }
    }),

  moveNode: (nodeId, targetParentId, index) =>
    set(state => {
      const activePage = state.pages[state.activePageId]
      const nodeToMove = activePage.nodes[nodeId]
      const targetParent = activePage.nodes[targetParentId]

      if (!nodeToMove || !targetParent || !targetParent.isCanvas || nodeId === 'ROOT') {
        return state
      }

      if (nodeId === targetParentId) return state

      const oldParentId = nodeToMove.parent!
      const oldParent = activePage.nodes[oldParentId]

      const oldParentChildren = oldParent.children.filter(id => id !== nodeId)
      const newParentChildren = [...targetParent.children]

      if (oldParentId === targetParentId) {
        newParentChildren.splice(newParentChildren.indexOf(nodeId), 1)
      }

      if (index !== undefined) {
        newParentChildren.splice(index, 0, nodeId)
      } else {
        newParentChildren.push(nodeId)
      }

      return {
        pages: {
          ...state.pages,
          [state.activePageId]: {
            ...activePage,
            nodes: {
              ...activePage.nodes,
              [oldParentId]: { ...oldParent, children: oldParentChildren },
              [targetParentId]: { ...targetParent, children: newParentChildren },
              [nodeId]: { ...nodeToMove, parent: targetParentId },
            },
          },
        },
      }
    }),
}))
