import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpDown, ChevronDown } from 'lucide-react'
import { useViewportHeight } from '@/core/utils/useViewportHeight'
import type { PaginationInfo, SortInfo, TableColumn } from './DataTable'


interface ExpandableConfig {
  keyField?: string
  fetchRow?: (row: any) => Promise<any>
  renderRow: (data: any, row: any) => React.ReactNode
  expandButton?: { openText?: string; closeText?: string }
  alwaysFetchOnOpen?: boolean
}

interface DataTableProps {
  data: any[]
  columns: TableColumn[]
  pagination?: PaginationInfo
  loading?: boolean
  emptyMessage?: string
  className?: string
  fixedHeight?: boolean
  maxHeight?: string
  recordsPerPage?: number
  sortInfo?: SortInfo
  onSort?: (sortInfo: SortInfo) => void
  expandable?: ExpandableConfig
  alwaysFetchOnOpen?: boolean
}

export interface DataTableExpandableRef {
  collapseRow: (id: string) => void
  collapseAll: () => void
}

export const DataTableExpandable= forwardRef<DataTableExpandableRef, DataTableProps>(({
  data,
  columns,
  pagination,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  fixedHeight = false,
  maxHeight = useViewportHeight(255, 350, 900),
  recordsPerPage = 10,
  sortInfo,
  onSort,
  expandable,
  alwaysFetchOnOpen
}, ref) => {

  const [expandedMap, setExpandedMap] = useState<Record<string, { open: boolean; loading: boolean; data?: any; error?: string }>>({})

  // compute a stable key name
  const keyField = expandable?.keyField ?? 'id'

  // If expandable enabled inject an expand column at first position
  const effectiveColumns = useMemo(() => {
    if (!expandable) return columns
    const expandCol: TableColumn = {
      key: '__expand',
      label: '',
      width: '6',
      align: 'center',
      render: (_v, row) => {
        const rowId = String(row[keyField] ?? JSON.stringify(row))
        const state = expandedMap[rowId]
        const isOpen = !!state?.open
        const openLabel = expandable?.expandButton?.openText
        const closeLabel = expandable?.expandButton?.closeText

        return (
          <button
            onClick={(e) => { e.stopPropagation(); toggleExpand(row) }}
            className="p-1 rounded hover:bg-gray-100"
            aria-label={isOpen ? (openLabel ?? 'Collapse') : (closeLabel ?? 'Expand')}
          >
            {state?.loading ? <span className="text-xs">...</span>
              : isOpen
                ? (openLabel ? <span className="text-sm">{openLabel}</span> : <ChevronDown size={16} className="text-gray-600" />)
                : (closeLabel ? <span className="text-sm">{closeLabel}</span> : <ChevronRight size={16} className="text-gray-600" />)
            }
          </button>
        )
      }

    }
    return [expandCol, ...columns]
  }, [columns, expandable, expandedMap, keyField])

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!onSort || !column?.sortable) return

    const newDirection = sortInfo?.column === columnKey && sortInfo?.direction === 'asc' ? 'desc' : 'asc'
    onSort({ column: columnKey, direction: newDirection })
  }

  // Toggle expand and optionally call API
  const toggleExpand = async (row: any) => {
    if (!expandable) return
    const id = String(row[keyField] ?? JSON.stringify(row))
    const current = expandedMap[id]

    // If already open -> close
    if (current?.open) {
      setExpandedMap(prev => ({ ...prev, [id]: { ...(prev[id] || {}), open: false } }))
      return
    }

    // decide whether to always fetch (priority: expandable.alwaysFetchOnOpen -> top-level alwaysFetchOnOpen)
    const shouldAlwaysFetch = !!(expandable?.alwaysFetchOnOpen ?? alwaysFetchOnOpen)

    // If we have cached data and we DON'T need to always fetch -> just open and reuse
    if (!shouldAlwaysFetch && current && current.data !== undefined && !current.error) {
      setExpandedMap(prev => ({ ...prev, [id]: { ...(prev[id] || {}), open: true } }))
      return
    }

    // Start loading (clear any previous error)
    setExpandedMap(prev => ({ ...prev, [id]: { ...(prev[id] || {}), open: true, loading: true, error: undefined } }))

    if (expandable.fetchRow) {
      try {
        const result = await expandable.fetchRow(row)
        // store fetched result and open
        setExpandedMap(prev => ({ ...prev, [id]: { ...(prev[id] || {}), data: result, loading: false, open: true, error: undefined } }))
      } catch (err: any) {
        setExpandedMap(prev => ({ ...prev, [id]: { ...(prev[id] || {}), error: err?.message || 'Load failed', loading: false, open: true } }))
      }
    } else {
      // no fetcher configured: just open (no async data)
      setExpandedMap(prev => ({ ...prev, [id]: { ...(prev[id] || {}), data: undefined, loading: false, open: true } }))
    }
  }

    // expose imperative API to parent
  useImperativeHandle(ref, () => ({
    collapseRow: (id: string) => {
      setExpandedMap(prev => {
        if (!prev[id]) return prev
        return { ...prev, [id]: { ...prev[id], open: false } }
      })
    },
    collapseAll: () => {
      setExpandedMap(prev => {
        const next: typeof prev = {}
        Object.keys(prev).forEach(k => {
          next[k] = { ...prev[k], open: false }
        })
        return next
      })
    }
  }), [])

  const renderPagination = () => {
    if (!pagination) return null

    const { currentPage, totalPages, totalRecords, pageSize, onPageChange } = pagination
    const startRecord = (currentPage - 1) * pageSize + 1
    const endRecord = Math.min(currentPage * pageSize, totalRecords)

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {startRecord} to {endRecord} of {totalRecords} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${currentPage === pageNum
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${fixedHeight ? 'h-full' : ''} ${className}`}>
      <div className={`overflow-x-auto thin-scroll ${fixedHeight ? 'flex-1 overflow-y-auto' : ''}`} style={fixedHeight ? {
        maxHeight: recordsPerPage === 10 ? 'calc(10 * 2.5rem + 2.5rem)' : maxHeight
      } : {}}>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className={`${fixedHeight ? 'sticky top-0 z-40' : ''} shadow-sm`} style={{
            backgroundColor: '#E5E5E5',
            position: fixedHeight ? 'sticky' : 'static',
            top: 0,
            zIndex: 50,
          }}>
            <tr className="h-10" style={{
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.4',
              letterSpacing: '0%',
              paddingTop: '6px',
              paddingBottom: '6px',
            }}>
              {effectiveColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-2 text-gray-800 tracking-wider whitespace-nowrap
                    ${column.align === 'center' ? 'text-center' :
                      column.align === 'right' ? 'text-right' : 'text-left'}
                    ${column.width ? `w-${column.width}` : ''}
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}
                    ${column.fixed === 'left' ? 'sticky left-0 z-40 shadow-[2px_0_4px_rgba(0,0,0,0.1)]' :
                      column.fixed === 'right' ? 'sticky right-0 z-40 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]' : ''}
                  `}
                  style={{
                    ...(column.width ? { width: column.width } : {}),
                    fontSize: '14px',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    letterSpacing: '0%',
                    backgroundColor: '#E4F0FF',
                    borderBottom: '1px solid #D1D5DB',
                    borderRight: '1px solid #D1D5DB',
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={`flex items-center space-x-1 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <span className="truncate">{column.label}</span>
                    {column.sortable && <ArrowUpDown className="h-3 w-3 flex-shrink-0" />}
                    {sortInfo?.column === column.key && <span className="text-blue-500 flex-shrink-0">{sortInfo.direction === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={effectiveColumns.length} className="py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="No Data" className="w-32 h-32 opacity-80" />
                    <p className="mt-4 text-gray-600 text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowKey = String(row[keyField] ?? index)
                return (
                  <React.Fragment key={rowKey}>
                    <tr className="hover:bg-gray-50 h-10 border-b border-gray-200">
                      {effectiveColumns.map((column) => {
                        // special-case the injected expand column
                        if (expandable && column.key === '__expand') {
                          const state = expandedMap[rowKey]
                          const isOpen = !!state?.open
                          return (
                            <td key={column.key} className="px-4 py-2 text-center" style={{ minWidth: '40px', verticalAlign: 'middle' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleExpand(row)
                                }}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                {state?.loading ? <span className="text-xs">...</span> : (isOpen ? (<ChevronDown size={16} className="text-gray-600" />) : (<ChevronRight size={16} className="text-gray-600" />))}
                              </button>
                            </td>
                          )
                        }

                        const value = column.render ? column.render(row[column.key], row) : row[column.key]
                        return (
                          <td key={column.key}
                            className={`px-4 py-2 text-gray-900 border-r border-gray-200 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'} ${column.fixed === 'left' ? 'sticky left-0 bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.1)] border-r-2 border-r-gray-100' : column.fixed === 'right' ? 'sticky right-0 bg-white z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] border-l-2 border-l-gray-100' : ''}`}
                            style={{ ...(column.width ? { width: column.width } : {}), fontSize: '14px', fontWeight: '400', lineHeight: '1.5', letterSpacing: '0%', minHeight: '40px', verticalAlign: 'middle' }}>
                            <div className={`${column.truncate !== false ? 'truncate whitespace-nowrap' : ''} max-w-full`} style={{ maxWidth: column.maxWidth || column.width || '200px', lineHeight: '1.5' }}>
                              {value}
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Expanded row (single row spanning columns) */}
                    {expandable && expandedMap[rowKey]?.open && (
                      <tr className="bg-gray-50">
                        <td colSpan={effectiveColumns.length} className="px-4 py-3 border-b border-gray-200">
                          {
                          expandedMap[rowKey].loading ? (
                            <div className="py-6 text-center">Loading...</div>
                          ) : expandedMap[rowKey].error ? (
                            <div className="py-4 text-red-500">{expandedMap[rowKey].error}</div>
                          ) : (
                            // render fetched data (or undefined) through provided renderRow
                            expandable.renderRow(expandedMap[rowKey].data, row)
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex-shrink-0">
          {renderPagination()}
        </div>
      )}
    </div>
  )
})

export default DataTableExpandable
