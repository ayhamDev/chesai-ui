'use client'

import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'

interface DataTableContextProps<TData> {
  table: Table<TData>
}

const DataTableContext = createContext<DataTableContextProps<any> | null>(null)

export function useDataTable<TData>() {
  const context = useContext(DataTableContext)
  if (!context) {
    throw new Error('useDataTable must be used within a DataTable provider')
  }
  return context as DataTableContextProps<TData>
}

export { DataTableContext }
