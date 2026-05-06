import React from 'react'
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { useViewportHeight } from '@/core/utils/useViewportHeight'
import NoDataView from '@/ui/components/NoDataView/NoDataView'
import { useHorizontalScroll } from './useHorizontalScroll'

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

interface DataTableWithHeadColorProps {
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

export const DataTableWithHeadColor: React.FC<DataTableWithHeadColorProps> = ({
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
}) => {

    const scrollRef = useHorizontalScroll()

    const handleSort = (columnKey: string) => {
        const column = columns.find(col => col.key === columnKey)
        if (!onSort || !column?.sortable) return

        const newDirection =
            sortInfo?.column === columnKey && sortInfo?.direction === 'asc'
                ? 'desc'
                : 'asc'

        onSort({ column: columnKey, direction: newDirection })
    }

    const renderPagination = () => {
        if (!pagination) return null

        const { currentPage, totalPages, totalRecords, pageSize, onPageChange } = pagination
        const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1
        const endRecord = Math.min(currentPage * pageSize, totalRecords)

        return (
            <div className="flex justify-between items-center px-4 py-2 bg-white border-t">
                <div className="text-sm text-gray-600">
                    Showing {startRecord} to {endRecord} of {totalRecords}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border rounded disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`rounded-xl bg-white shadow-sm ${className}`}>

            <div
                ref={scrollRef}
                className={`overflow-x-auto ${fixedHeight ? 'overflow-y-auto' : ''}`}
                style={fixedHeight ? {
                    maxHeight: recordsPerPage === 10
                        ? 'calc(10 * 2.5rem + 2.5rem)'
                        : maxHeight
                } : {}}
            >
                <table className="min-w-full border-collapse">

                    {/* HEADER */}
                    <thead
                        className={`bg-[#2f4663] ${fixedHeight ? 'sticky top-0 z-40' : ''}`}
                    >
                        <tr className="h-10">
                            {columns.map((column, index) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    className={`px-4 py-2 text-white text-sm font-medium whitespace-nowrap
                                        
                                        ${column.align === 'center' ? 'text-center' :
                                            column.align === 'right' ? 'text-right' : 'text-left'}

                                        ${column.sortable ? 'cursor-pointer' : ''}

                                        ${index === 0 ? 'rounded-tl-lg' : ''}
                                        ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}

                                        ${column.fixed === 'left'
                                            ? 'sticky left-0 z-50 bg-[#2f4663]'
                                            : column.fixed === 'right'
                                                ? 'sticky right-0 z-50 bg-[#2f4663]'
                                                : ''
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-1">
                                        <span>{column.label}</span>

                                        {column.sortable && (
                                            <ArrowUpDown className="h-3 w-3 opacity-70" />
                                        )}

                                        {sortInfo?.column === column.key && (
                                            <span className="text-blue-200">
                                                {sortInfo.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/*  BODY */}
                    <tbody>
                        {!loading && data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-10">
                                    <NoDataView message={emptyMessage} />
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={index} className="h-10">
                                    {columns.map((column) => {
                                        const value = column.render
                                            ? column.render(row[column.key], row, index)
                                            : row[column.key]

                                        return (
                                            <td
                                                key={column.key}
                                                className={`px-4 py-2 text-sm text-gray-800
                                                    ${column.align === 'center' ? 'text-center' :
                                                        column.align === 'right' ? 'text-right' : 'text-left'}

                                                    ${column.fixed === 'left'
                                                        ? 'sticky left-0 bg-gray-100 z-20'
                                                        : column.fixed === 'right'
                                                            ? 'sticky right-0 bg-gray-100 z-20'
                                                            : ''
                                                    }
                                                `}
                                            >
                                                {value}
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