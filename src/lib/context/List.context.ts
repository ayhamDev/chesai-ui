import { createContext } from 'react'

export interface ListContextProps {
  // Selection Mode
  isSelectionMode: boolean
  setIsSelectionMode: (value: boolean) => void
  selectedItems: Set<string | number>
  toggleSelection: (id: string | number) => void
  isSelectable: boolean

  // Reorder Mode
  isReorderable: boolean
}

export const ListContext = createContext<ListContextProps | null>(null)
