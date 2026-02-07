import type { FilterFn } from '@tanstack/react-table'

/**
 * Enhanced Filter Types to support UI logic
 */
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    filterType?: 'text' | 'number' | 'date' | 'select'
  }
}

export type FilterOperator =
  | 'contains'
  | 'notContains'
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'startsWith'
  | 'endsWith'

export interface AdvancedFilterValue {
  operator: FilterOperator
  value: string | number
}

/**
 * A robust filter function that handles strings, numbers, and null values safely.
 */
export const advancedFilterFn: FilterFn<any> = (row, columnId, filterValue: AdvancedFilterValue) => {
  const rowValue = row.getValue(columnId)
  const { operator, value } = filterValue

  // 1. Handle Empty/Null search values - show everything
  if (value === '' || value === null || value === undefined) return true

  // 2. Handle Null row data - hide if filtering for a specific value
  if (rowValue === null || rowValue === undefined) return false

  const rowString = String(rowValue).toLowerCase()
  const valueString = String(value).toLowerCase()
  const rowNum = Number(rowValue)
  const valueNum = Number(value)
  const isNumeric = !isNaN(rowNum) && !isNaN(valueNum) && String(value).trim() !== ''

  switch (operator) {
    case 'contains':
      return rowString.includes(valueString)
    case 'notContains':
      return !rowString.includes(valueString)
    case 'startsWith':
      return rowString.startsWith(valueString)
    case 'endsWith':
      return rowString.endsWith(valueString)
    case 'eq':
      return isNumeric ? rowNum === valueNum : rowString === valueString
    case 'neq':
      return isNumeric ? rowNum !== valueNum : rowString !== valueString
    case 'gt':
      return isNumeric && rowNum > valueNum
    case 'lt':
      return isNumeric && rowNum < valueNum
    case 'gte':
      return isNumeric && rowNum >= valueNum
    case 'lte':
      return isNumeric && rowNum <= valueNum
    default:
      return true
  }
}
