import type { Meta, StoryObj } from '@storybook/react'
import { functionalUpdate, type ColumnDef } from '@tanstack/react-table'
import { useEffect, useRef, useState } from 'react'
import { DataTable, DataTableColumnHeader, type DataTableMode } from './index'
import { defaultDataTableState } from './types'

type RecordItem = { id: string; name: string; description: string }
const records: RecordItem[] = Array.from({ length: 10000 }, (_, i) => ({
  id: String(i),
  name: `Record ${String(i + 1).padStart(5, '0')}`,
  description:
    i % 4 === 0
      ? 'A longer description that wraps when the column is narrow, demonstrating measured variable row heights.'
      : 'Short description',
}))
const columns: ColumnDef<RecordItem>[] = [
  { accessorKey: 'name', size: 240, header: ({ column }) => <DataTableColumnHeader column={column} title="Name" /> },
  { accessorKey: 'description', size: 400, header: 'Description' },
  {
    id: 'expand',
    size: 100,
    cell: ({ row }) => (
      <button type="button" onClick={row.getToggleExpandedHandler()}>
        {row.getIsExpanded() ? 'Collapse' : 'Expand'}
      </button>
    ),
  },
]

const meta: Meta<typeof DataTable> = { title: 'Components/Data/DataTable/Scrolling', component: DataTable }
export default meta
type Story = StoryObj

export const ClientSide: Story = {
  render: () => (
    <DataTable
      data={records}
      columns={columns}
      getRowId={row => row.id}
      defaultMode="infinite"
      showModeSwitch
      stickyHeader
      virtualization={{ overscan: 8 }}
      renderExpandedRow={row => (
        <div className="p-8">
          Expanded details for {row.original.name}. This content is measured together with its row.
        </div>
      )}
    />
  ),
}

function ServerDemo({ cursors }: { cursors: boolean }) {
  const [mode, setMode] = useState<DataTableMode>('infinite')
  const [state, setState] = useState({ ...defaultDataTableState, pagination: { pageIndex: 0, pageSize: 50 } })
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined])
  const pageCursor = cursors && mode === 'pagination' ? cursorHistory[state.pagination.pageIndex] : undefined
  const queryKey = JSON.stringify([
    mode,
    state.pagination,
    state.sorting,
    state.globalFilter,
    state.columnFilters,
    pageCursor,
  ])
  const currentKey = useRef(queryKey)
  currentKey.current = queryKey
  const [result, setResult] = useState<{ key: string; rows: RecordItem[]; total: number; nextCursor?: string }>({
    key: '',
    rows: [],
    total: 0,
  })
  const [fetching, setFetching] = useState(false)
  // This function stands in for a server endpoint. The table never parses the cursor.
  const fetchPage = async (cursorOrOffset?: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 350))
    let filtered = records.filter(row => row.name.toLowerCase().includes(state.globalFilter.toLowerCase()))
    if (state.sorting[0]?.desc) filtered = [...filtered].reverse()
    const offset =
      typeof cursorOrOffset === 'string'
        ? Number(atob(cursorOrOffset))
        : (cursorOrOffset ??
          (!cursors && mode === 'pagination' ? state.pagination.pageIndex * state.pagination.pageSize : 0))
    const end = Math.min(offset + state.pagination.pageSize, filtered.length)
    return {
      rows: filtered.slice(offset, end),
      total: filtered.length,
      nextCursor: end < filtered.length ? btoa(String(end)) : undefined,
    }
  }
  useEffect(() => {
    let active = true
    setFetching(true)
    void fetchPage(pageCursor).then(page => {
      if (active) {
        setResult({ key: queryKey, ...page })
        setFetching(false)
      }
    })
    return () => {
      active = false
    }
    // queryKey includes every server query input.
    // biome-ignore lint/correctness/useExhaustiveDependencies: queryKey represents the complete query.
  }, [queryKey])
  const rows = result.key === queryKey ? result.rows : []
  const isFetching = fetching || result.key !== queryKey
  const next = () => {
    setCursorHistory(history => [...history.slice(0, state.pagination.pageIndex + 1), result.nextCursor])
    setState(previous => ({
      ...previous,
      pagination: { ...previous.pagination, pageIndex: previous.pagination.pageIndex + 1 },
    }))
  }
  const previous = () =>
    setState(previous => ({
      ...previous,
      pagination: { ...previous.pagination, pageIndex: Math.max(0, previous.pagination.pageIndex - 1) },
    }))
  return (
    <DataTable
      data={rows}
      columns={columns}
      serverSide
      rowCount={cursors ? undefined : result.total}
      getRowId={row => row.id}
      renderExpandedRow={row => <div className="p-8">Details for {row.original.name}</div>}
      state={state}
      onStateChange={update => {
        const nextState = functionalUpdate(update, state)
        if (
          nextState.sorting !== state.sorting ||
          nextState.globalFilter !== state.globalFilter ||
          nextState.columnFilters !== state.columnFilters ||
          nextState.pagination.pageSize !== state.pagination.pageSize
        ) {
          setCursorHistory([undefined])
          nextState.pagination = { ...nextState.pagination, pageIndex: 0 }
        }
        setState(nextState)
      }}
      mode={mode}
      onModeChange={nextMode => {
        setCursorHistory([undefined])
        setMode(nextMode)
      }}
      showModeSwitch
      stickyHeader
      isLoading={isFetching}
      visibility={{ filters: false, export: false }}
      virtualization={mode === 'infinite' ? { overscan: 8 } : undefined}
      cursorPagination={
        cursors
          ? {
              hasNextPage: !!result.nextCursor,
              hasPreviousPage: state.pagination.pageIndex > 0,
              isFetching,
              onNextPage: next,
              onPreviousPage: previous,
            }
          : undefined
      }
      infiniteScroll={{
        hasNextPage: !!result.nextCursor,
        isFetching,
        onLoadMore: async () => {
          setFetching(true)
          const page = await fetchPage(cursors ? result.nextCursor : rows.length)
          if (currentKey.current === queryKey) {
            setResult(current => ({ key: queryKey, ...page, rows: [...current.rows, ...page.rows] }))
            setFetching(false)
          }
        },
      }}
    />
  )
}

export const ServerOffset: Story = { render: () => <ServerDemo cursors={false} /> }
export const ServerCursor: Story = { render: () => <ServerDemo cursors /> }
