export type NodeType = string

export interface BuilderNode {
  id: string
  type: NodeType
  props: Record<string, any>
  children: string[]
  parent: string | null
  isCanvas?: boolean
}

export interface DesignSystem {
  seedColor: string
  fonts: {
    brand: string
    plain: string
    expressiveButtons: boolean
  }
}

export interface BuilderPage {
  id: string
  name: string
  path: string
  nodes: Record<string, BuilderNode>
}

export interface BuilderState {
  siteId: string
  designSystem: DesignSystem
  pages: Record<string, BuilderPage>

  activePageId: string
  selectedNodeId: string | null
  editingNodeId: string | null

  selectNode: (nodeId: string | null) => void
  setEditingNode: (nodeId: string | null) => void
  updateNodeProp: (nodeId: string, propKey: string, value: any) => void
  updateDesignSystem: (data: Partial<DesignSystem>) => void // Updated signature

  addNode: (node: Omit<BuilderNode, 'id'>, parentId: string, index?: number) => void
  addNodeTree: (nodes: Record<string, BuilderNode>, rootNodeId: string, parentId: string, index?: number) => void
  removeNode: (nodeId: string) => void
  moveNode: (nodeId: string, targetParentId: string, index?: number) => void
}
