import { createContext } from 'react'

export interface ListContextProps {
  isSelectionMode: boolean
  setIsSelectionMode: (value: boolean) => void
  selectedItems: Set<string | number>
  toggleSelection: (id: string | number) => void
  isReorderable: boolean
  startReorder: (id: string | number) => void
}

export const ListContext = createContext<ListContextProps | null>(null)
