import type { ColumnDef } from '@tanstack/react-table'
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DataTable } from './index'
import { defaultDataTableState } from './types'
import { useInfiniteLoading } from './use-infinite-loading'
import { StrictMode } from 'react'

const data = Array.from({ length: 1000 }, (_, id) => ({ id: String(id), name: `Record ${id}` }))
const columns: ColumnDef<(typeof data)[number]>[] = [{ accessorKey: 'name', header: 'Name' }]
const visibility = { toolbar: false }

// jsdom omits the SVG geometry APIs used by the shared morphing loader.
Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
  configurable: true,
  value: () => 100,
})
Object.defineProperty(SVGElement.prototype, 'getPointAtLength', {
  configurable: true,
  value: (length: number) => ({ x: length, y: length }),
})

beforeEach(() => {
  vi.stubGlobal('scrollY', 0)
  vi.stubGlobal('innerHeight', 280)
  vi.stubGlobal(
    'scrollTo',
    vi.fn((options: ScrollToOptions) => {
      vi.stubGlobal('scrollY', options.top ?? 0)
      fireEvent.scroll(window)
    }),
  )
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const outer = this.closest('[data-testid="outer"]')
    return new DOMRect(0, this.tagName === 'THEAD' ? 100 - (outer?.scrollTop ?? window.scrollY) : 0, 600, 56)
  })
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.tagName === 'DIV' ? 280 : 56
  })
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600)
  HTMLElement.prototype.scrollTo = vi.fn()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('DataTable scrolling', () => {
  it('switches modes and renders a bounded window over all client rows', async () => {
    const { container } = render(<DataTable data={data} columns={columns} showModeSwitch visibility={visibility} />)
    expect(screen.getByText('Rows per page')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Display mode'), { target: { value: 'infinite' } })
    expect(screen.queryByText('Rows per page')).toBeNull()
    const scroller = container.querySelector('[data-table-body]')!.parentElement!
    await waitFor(() => expect(container.querySelectorAll('tbody[data-index]').length).toBeGreaterThan(0))
    expect(container.querySelectorAll('tbody[data-index]').length).toBeLessThan(30)
    expect(scroller.style.height).toBe('')
    fireEvent.scroll(window, { target: { scrollY: 28000 } })
    await waitFor(() => expect(screen.queryByText('Record 500')).toBeTruthy())
    expect(screen.queryByText('Record 0')).toBeNull()
    fireEvent.change(screen.getByLabelText('Display mode'), { target: { value: 'pagination' } })
    expect(screen.getByText('Record 0')).toBeTruthy()
    expect(screen.queryByText('Record 10')).toBeNull()
  })

  it('respects controlled mode and notifies its owner', () => {
    const onModeChange = vi.fn()
    render(
      <DataTable
        data={data}
        columns={columns}
        mode="pagination"
        showModeSwitch
        onModeChange={onModeChange}
        visibility={visibility}
      />,
    )
    fireEvent.change(screen.getByLabelText('Display mode'), { target: { value: 'infinite' } })
    expect(onModeChange).toHaveBeenCalledWith('infinite')
    expect(screen.getByText('Rows per page')).toBeTruthy()
  })

  it('keeps expanded content and selection attached to stable row IDs while virtualizing', async () => {
    const { container } = render(
      <DataTable
        data={data}
        columns={columns}
        mode="infinite"
        visibility={visibility}
        getRowId={row => row.id}
        initialState={{ expanded: { '0': true }, rowSelection: { '0': true } }}
        renderExpandedRow={row => <div>Details for {row.original.name}</div>}
      />,
    )
    const group = container.querySelector('tbody[data-index="0"]')!
    expect(group.querySelectorAll('tr')).toHaveLength(2)
    expect(group.querySelector('[data-state="selected"]')).toBeTruthy()
    fireEvent.scroll(window, { target: { scrollY: 28000 } })
    await waitFor(() => expect(screen.queryByText('Details for Record 0')).toBeNull())
    fireEvent.scroll(window, { target: { scrollY: 0 } })
    await waitFor(() => expect(screen.getByText('Details for Record 0')).toBeTruthy())
    expect(container.querySelector('tbody[data-index="0"] [data-state="selected"]')).toBeTruthy()
  })

  it('does not duplicate automatic loading under StrictMode effect replay', async () => {
    const onLoadMore = vi.fn(async () => undefined)
    render(
      <StrictMode>
        <DataTable
          data={data.slice(0, 1)}
          columns={columns}
          mode="infinite"
          visibility={visibility}
          infiniteScroll={{ hasNextPage: true, onLoadMore }}
        />
      </StrictMode>,
    )
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1))
    await act(async () => undefined)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('filters all client data before virtualizing and resets the scroll position', async () => {
    const { container, rerender } = render(
      <DataTable data={data} columns={columns} mode="infinite" visibility={visibility} />,
    )
    fireEvent.scroll(window, { target: { scrollY: 20000 } })
    rerender(
      <DataTable
        data={data}
        columns={columns}
        mode="infinite"
        visibility={visibility}
        state={{ globalFilter: 'Record 999' }}
      />,
    )
    await waitFor(() => expect(screen.getByText('Record 999')).toBeTruthy())
    expect(container.querySelectorAll('tbody[data-index]')).toHaveLength(1)
    expect(window.scrollY).toBe(100)
  })

  it('follows an outer page container and preserves the existing outer sticky header', async () => {
    const { container, rerender } = render(
      <div data-testid="outer" style={{ height: 280, overflowY: 'auto' }}>
        <DataTable data={data} columns={columns} mode="infinite" stickyHeader visibility={visibility} />
      </div>,
    )
    expect(container.querySelector('[data-sticky-header]')).toBeTruthy()
    const outer = screen.getByTestId('outer')
    const tableContainer = container.querySelector('[data-table-body]')!.parentElement!
    expect(tableContainer.style.height).toBe('')
    fireEvent.scroll(outer, { target: { scrollTop: 28000 } })
    await waitFor(() => expect(screen.getByText('Record 500')).toBeTruthy())
    expect(screen.queryByText('Record 0')).toBeNull()
    expect(tableContainer.scrollTop).toBe(0)
    vi.mocked(outer.scrollTo).mockClear()
    rerender(
      <div data-testid="outer" style={{ height: 280, overflowY: 'auto' }}>
        <DataTable
          data={[...data, { id: '1000', name: 'Record 1000' }]}
          columns={columns}
          mode="infinite"
          stickyHeader
          visibility={visibility}
          virtualization={{ getScrollElement: () => outer }}
        />
      </div>,
    )
    expect(outer.scrollTop).toBe(28000)
    expect(outer.scrollTo).not.toHaveBeenCalled()
  })

  it('loads a short server page once, preserves it while fetching, and stops at the end', async () => {
    const onLoadMore = vi.fn()
    const props = {
      data: data.slice(0, 2),
      columns,
      mode: 'infinite' as const,
      serverSide: true as const,
      state: { ...defaultDataTableState, globalFilter: 'server-only-filter' },
      onStateChange: vi.fn(),
      visibility,
    }
    const { rerender } = render(<DataTable {...props} infiniteScroll={{ hasNextPage: true, onLoadMore }} />)
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1))
    rerender(<DataTable {...props} isLoading infiniteScroll={{ hasNextPage: true, onLoadMore, isFetching: true }} />)
    expect(screen.getByText('Record 0')).toBeTruthy()
    rerender(<DataTable {...props} infiniteScroll={{ hasNextPage: false, onLoadMore }} />)
    expect(screen.getByText('All rows loaded.')).toBeTruthy()
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('uses cursor availability and callbacks without exposing invalid random access', () => {
    const onNextPage = vi.fn()
    render(
      <DataTable
        data={data.slice(0, 2)}
        columns={columns}
        serverSide
        state={defaultDataTableState}
        onStateChange={vi.fn()}
        visibility={visibility}
        cursorPagination={{ hasNextPage: true, hasPreviousPage: false, onNextPage, onPreviousPage: vi.fn() }}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Go to last page' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Go to first page' })).toBeNull()
    expect((screen.getByRole('textbox', { name: 'Current page' }) as HTMLInputElement).readOnly).toBe(true)
    expect((screen.getByRole('button', { name: 'Go to previous page' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))
    expect(onNextPage).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('of -1')).toBeNull()
  })
})

describe('infinite request lifecycle', () => {
  it('deduplicates an in-flight request and the same loaded range, then allows appended data', async () => {
    let resolve!: () => void
    const onLoadMore = vi.fn(
      () =>
        new Promise<void>(done => {
          resolve = done
        }),
    )
    const { result, rerender } = renderHook(
      ({ count }) =>
        useInfiniteLoading({
          enabled: true,
          config: { hasNextPage: true, onLoadMore },
          rowCount: count,
          resetKey: 'a',
          isLoading: false,
        }),
      { initialProps: { count: 20 } },
    )
    act(() => {
      result.current.loadMore()
      result.current.loadMore()
    })
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    await act(async () => resolve())
    act(() => result.current.loadMore())
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    rerender({ count: 40 })
    act(() => result.current.loadMore())
    expect(onLoadMore).toHaveBeenCalledTimes(2)
    await act(async () => resolve())
  })

  it('pauses on rejection, supports retry and ignores stale query failures', async () => {
    let reject!: (error: Error) => void
    const onLoadMore = vi.fn(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail
        }),
    )
    const { result, rerender } = renderHook(
      ({ key }) =>
        useInfiniteLoading({
          enabled: true,
          config: { hasNextPage: true, onLoadMore },
          rowCount: 0,
          resetKey: key,
          isLoading: false,
        }),
      { initialProps: { key: 'a' } },
    )
    act(() => result.current.loadMore())
    await act(async () => reject(new Error('offline')))
    expect(result.current.error).toBeInstanceOf(Error)
    act(() => result.current.loadMore())
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    act(() => result.current.retry())
    expect(onLoadMore).toHaveBeenCalledTimes(2)
    rerender({ key: 'b' })
    await act(async () => reject(new Error('stale')))
    expect(result.current.error).toBeFalsy()
  })
})
