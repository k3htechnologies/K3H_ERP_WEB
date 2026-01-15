import React from 'react'
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { useViewportHeight } from '@/core/utils/useViewportHeight'
import NoDataView from '@/ui/components/NoDataView/NoDataView'

export interface TableColumn {
  key: string
  label: string
  render?: (value: any, row: any, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  truncate?: boolean
  maxWidth?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalRecords: number
  pageSize: number
  onPageChange: (page: number) => void
}

export interface SortInfo {
  column: string
  direction: 'asc' | 'desc'
}

export interface FilterInfo {
  [key: string]: string
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
}

export const DataTable: React.FC<DataTableProps> = ({
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
  onSort
}) => {

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!onSort || !column?.sortable) return

    const newDirection = sortInfo?.column === columnKey && sortInfo?.direction === 'asc' ? 'desc' : 'asc'
    // Pass the column key for internal sorting logic
    onSort({ column: columnKey, direction: newDirection })
  }


  const renderPagination = () => {
    if (!pagination) return null

    const { currentPage, totalPages, totalRecords, pageSize, onPageChange } = pagination
    const startRecord = totalRecords===0 ? 0 :(currentPage - 1) * pageSize + 1
    const endRecord = Math.min(currentPage * pageSize, totalRecords)

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {startRecord} to {endRecord} of {totalRecords} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={totalRecords===0 ? true : currentPage === 1}
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
            disabled={totalRecords===0 ? true :currentPage === totalPages}
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

      {/* Table Container with Fixed Height */}
      <div className={`overflow-x-auto thin-scroll ${fixedHeight ? 'flex-1 overflow-y-auto' : ''}`} style={fixedHeight ? {
        maxHeight: recordsPerPage === 10 ? 'calc(10 * 2.5rem + 2.5rem)' : maxHeight
      } : {}}>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead
            className={`${fixedHeight ? 'sticky top-0 z-40' : ''} shadow-sm`}
            style={{
              backgroundColor: '#E5E5E5',
              position: fixedHeight ? 'sticky' : 'static',
              top: 0,
              zIndex: 30,
            }}
          >
            <tr
              className="h-10"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '1.4',
                letterSpacing: '0%',
                paddingTop: '6px',
                paddingBottom: '6px',
              }}
            >
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-2 text-gray-800 tracking-wider whitespace-nowrap
                  ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                  ${column.width ? `w-${column.width}` : ''}
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}
                  ${column.fixed === 'left'
                      ? 'sticky left-0 z-35 shadow-[2px_0_4px_rgba(0,0,0,0.1)]'
                      : column.fixed === 'right'
                        ? 'sticky right-0 z-35 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]'
                        : ''
                    }
        `}
                  style={{
                    ...(column.width ? { width: column.width } : {}),
                    fontSize: '14px',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    letterSpacing: '0%',
                    backgroundColor: '#E4F0FF',
                    borderBottom: '1px solid #D1D5DB', // ✅ Only bottom border (prevents double)
                    borderRight: '1px solid #D1D5DB',  // ✅ Keep vertical separation
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div
                    className={`flex items-center space-x-1 ${column.align === 'center'
                      ? 'justify-center'
                      : column.align === 'right'
                        ? 'justify-end'
                        : 'justify-start'
                      }`}
                  >
                    <span className="truncate">{column.label}</span>
                    {column.sortable && (
                      <ArrowUpDown className="h-3 w-3 flex-shrink-0" />
                    )}
                    {sortInfo?.column === column.key && (
                      <span className="text-blue-500 flex-shrink-0">
                        {sortInfo.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}

            </tr>
          </thead>

          <tbody className="bg-white">
            {!loading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10"
                >
                  <NoDataView
                    message={emptyMessage}
                  />
                </td>
              </tr>
            )
              :
              (
                data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 h-10 border-b border-gray-200">
                    {columns.map((column) => {
                      const cellValue = column.render ?  column.render(row[column.key], row, index): row[column.key]

                      return (
                        <td
                          key={column.key}
                          className={`px-4 py-2 text-gray-900 border-r border-gray-200 ${column.align === 'center' ? 'text-center' :
                            column.align === 'right' ? 'text-right' : 'text-left'
                            } ${column.fixed === 'left' ? 'sticky left-0 bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.1)] border-r-2 border-r-gray-100' :
                              column.fixed === 'right' ? 'sticky right-0 bg-white z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] border-l-2 border-l-gray-100' : ''
                            }`}
                          style={{
                            ...(column.width ? { width: column.width } : {}),
                            fontSize: '14px',
                            fontWeight: '400',
                            lineHeight: '1.5',
                            letterSpacing: '0%',
                            minHeight: '40px',
                            verticalAlign: 'middle'
                          }}
                          title=""
                        >
                          <div
                            className={`${column.truncate !== false ? 'truncate whitespace-nowrap' : ''} max-w-full`}
                            style={{
                              maxWidth: column.maxWidth || column.width || '200px',
                              lineHeight: '1.5'
                            }}
                          >
                            {cellValue}
                          </div>
                        </td>
                      )
                    })}

                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex-shrink-0">
          {renderPagination()}
        </div>
      )}
    </div>
  )
}
