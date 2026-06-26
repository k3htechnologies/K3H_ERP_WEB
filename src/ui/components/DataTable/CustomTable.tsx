import React from "react"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { useViewportHeight } from "@/core/utils/useViewportHeight"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import { useHorizontalScroll } from "./useHorizontalScroll"

export interface TableColumn {
  key: string
  label: string
  render?: (value: any, row: any, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
  fixed?: "left" | "right"
  align?: "left" | "center" | "right"
  truncate?: boolean
  maxWidth?: string
  children?: TableColumn[]
  theadStyle?: React.CSSProperties
  tdStyle?: React.CSSProperties

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
  direction: "asc" | "desc"
}

interface Props {
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
  onSort?: (sort: SortInfo) => void
  theadStyle?: React.CSSProperties;
  tdStyle?: React.CSSProperties;
  rowStyle?: (row: any) => React.CSSProperties;

}

export const CustomTable: React.FC<Props> = ({
  data,
  columns,
  pagination,
  loading = false,
  emptyMessage = "No data available",
  className = "",
  fixedHeight = false,
  maxHeight = useViewportHeight(255, 350, 900),
  recordsPerPage = 10,
  sortInfo,
  onSort,
  theadStyle,
  rowStyle
}) => {
  const scrollRef = useHorizontalScroll();

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!onSort || !column?.sortable) return

    const newDirection =
      sortInfo?.column === columnKey && sortInfo?.direction === "asc"
        ? "desc"
        : "asc"

    onSort({ column: columnKey, direction: newDirection })
  }

  const flattenColumns = (cols: TableColumn[]): TableColumn[] => {
    let result: TableColumn[] = []

    cols.forEach(col => {
      if (col.children) {
        result = result.concat(flattenColumns(col.children))
      } else {
        result.push(col)
      }
    })

    return result
  }

  const leafColumns = flattenColumns(columns)

  const buildHeaderRows = () => {
    const rows: any[] = []

    const traverse = (cols: TableColumn[], level = 0) => {
      rows[level] = rows[level] || []

      cols.forEach(col => {
        const hasChildren = col.children && col.children.length > 0

        rows[level].push({
          ...col,
          colSpan: hasChildren ? flattenColumns(col.children!).length : 1,
          rowSpan: hasChildren ? 1 : 3
        })

        if (hasChildren) {
          traverse(col.children!, level + 1)
        }
      })
    }

    traverse(columns)

    return rows
  }

  const renderPagination = () => {
    if (!pagination) return null

    const { currentPage, totalPages, totalRecords, pageSize, onPageChange } = pagination
    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endRecord = Math.min(currentPage * pageSize, totalRecords)

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {startRecord} to {endRecord} of {totalRecords} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={totalRecords === 0 ? true : currentPage === 1}
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
                  type="button"
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
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={totalRecords === 0 ? true : currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (

    <div className={`bg-white rounded-lg shadow-sm  flex flex-col ${className}`} >

      <div ref={scrollRef}
        className={`overflow-x-auto thin-scroll ${fixedHeight ? "flex-1 overflow-y-auto" : ""
          }`}
        style={
          fixedHeight
            ? { maxHeight: recordsPerPage === 10 ? "calc(10 * 2.5rem + 2.5rem)" : maxHeight }
            : {}
        }
      >

        <table className="min-w-full border-collapse border border-gray-300">

          {/* HEADER */}

          <thead
            className={`${fixedHeight ? "sticky top-0 z-40" : ""}`}
            style={{ backgroundColor: "#E4F0FF", zIndex: 30, }}
          >

            {buildHeaderRows().map((row, rIndex) => (
              <tr key={rIndex}>

                {row.map((col: any, cIndex: number) => (

                  <th
                    key={cIndex}
                    colSpan={col.colSpan}
                    rowSpan={col.rowSpan}
                    className={`px-4 py-2 text-gray-800 tracking-wider whitespace-nowrap
                    ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}
                    ${col.width ? `w-${col.width}` : ''}
                    ${col.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}
                    ${col.fixed === 'left' ? 'sticky left-0 z-40 shadow-[2px_0_4px_rgba(0,0,0,0.1)]' : col.fixed === 'right' ? 'sticky right-0 z-40 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]' : ''}
               `}
                    style={{
                      ...(col.width ? { width: col.width } : {}),
                      fontSize: '14px',
                      fontWeight: '500',
                      lineHeight: '1.4',
                      backgroundColor: col.theadStyle?.backgroundColor || theadStyle?.backgroundColor || '#E4F0FF',
                      color: col.theadStyle?.color || theadStyle?.color || '#000',
                      borderBottom: '1px solid #D1D5DB',
                      borderRight: '1px solid #D1D5DB',

                    }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >


                    <div className={`flex items-center space-x-1  ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>

                      {col.label}

                      {col.sortable && (
                        <ArrowUpDown size={12} />
                      )}

                    </div>

                  </th>

                ))}
              </tr>
            ))}

          </thead>

          {/* BODY */}

          <tbody>

            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={leafColumns.length} className="py-10">
                  <NoDataView message={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((row, i) => (

                  <tr key={i} className="hover:bg-gray-50" style={rowStyle?.(row)}>

                  {leafColumns.map(col => {

                    const value = col.render
                      ? col.render(row[col.key], row, i)
                      : row[col.key]

                    return (
                      <td key={col.key}
                        className={`px-4 py-2 text-gray-900 border border-gray-200 
                           ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} 
                           ${col.fixed === 'left' ? 'sticky left-0 bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.1)] border-r-2 border-r-gray-100' : col.fixed === 'right' ? 'sticky right-0 bg-white z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] border-l-2 border-l-gray-100' : ''}`}

                        style={{
                          ...(col.width ? { width: col.width } : {}),
                          fontSize: '14px',
                          fontWeight: '400',
                          lineHeight: '1.5',
                          letterSpacing: '0%',
                          minHeight: '40px',
                          verticalAlign: 'middle',
                          backgroundColor: rowStyle?.(row)?.backgroundColor,
                          ...col.tdStyle
                        }}>
                          
                        <div className={`${col.truncate !== false ? 'truncate whitespace-nowrap' : ''} max-w-full`} style={{ maxWidth: col.maxWidth || col.width, lineHeight: '1.5' }}>
                          {value}
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

      {pagination && renderPagination()}

    </div>
  )
}