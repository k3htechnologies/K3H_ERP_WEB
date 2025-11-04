import React, { useState } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    ArrowUpDown,
    FileSpreadsheet,
    FileText,
    X,
    Filter,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*                            TYPE DEFINITION                                 */
/* -------------------------------------------------------------------------- */
export interface TableColumn {
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
    sortable?: boolean
    width?: string
    fixed?: 'left' | 'right'
    align?: 'left' | 'center' | 'right'
    truncate?: boolean
    maxWidth?: string
}

export interface TableAction {
    label: string
    icon: React.ReactNode
    onClick: (row: any) => void
    className?: string
    variant?: 'primary' | 'secondary' | 'danger'
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

export interface ExportOptions {
    onExportExcel?: () => void
    onExportPdf?: () => void
    exportLoading?: boolean
}

export interface DataTableProps {
    data: any[]
    columns: TableColumn[]
    actions?: TableAction[]
    pagination?: PaginationInfo
    loading?: boolean
    emptyMessage?: string
    onAdd?: () => void
    addButtonText?: string
    className?: string
    fixedHeight?: boolean
    maxHeight?: string
    recordsPerPage?: number
    sortInfo?: SortInfo
    onSort?: (sortInfo: SortInfo) => void
    filters?: FilterInfo
    onFilter?: (filters: FilterInfo) => void
    exportOptions?: ExportOptions
    filterFields?: Array<{ key: string; label: string; placeholder?: string }>
}

/* -------------------------------------------------------------------------- */
/*                              DATATABLE COMPNENT                          */
/* -------------------------------------------------------------------------- */
export const DataTable: React.FC<DataTableProps> = ({
    data,
    columns,
    actions = [],
    pagination,
    loading = false,
    emptyMessage = 'No data available',
    onAdd,
    addButtonText = 'Add New',
    className = '',
    fixedHeight = false,
    maxHeight = 'calc(100vh - 200px)',
    sortInfo,
    onSort,
    filters,
    onFilter,
    exportOptions,
    filterFields,
}) => {
    const [localFilters, setLocalFilters] = useState<FilterInfo>(filters || {})
    const [popupFilters, setPopupFilters] = useState<FilterInfo>(filters || {})
    const [showFilterPopup, setShowFilterPopup] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    /* ---------------------------- SORTING HANDLER ---------------------------- */
    const handleSort = (columnKey: string) => {
        const column = columns.find((col) => col.key === columnKey)
        if (!onSort || !column?.sortable) return

        const newDirection =
            sortInfo?.column === columnKey && sortInfo?.direction === 'asc' ? 'desc' : 'asc'
        onSort({ column: columnKey, direction: newDirection })
    }

    /* ---------------------------- FILTER HANDLERS ---------------------------- */
    const handlePopupFilterChange = (key: string, value: string) => {
        const newFilters = { ...popupFilters }

        if (value.trim()) newFilters[key] = value.trim()
        else delete newFilters[key]

        setPopupFilters(newFilters)
        if (validationErrors[key]) {
            const updatedErrors = { ...validationErrors }
            delete updatedErrors[key]
            setValidationErrors(updatedErrors)
        }
    }

    const validateFilters = (filters: FilterInfo): Record<string, string> => {
        const errors: Record<string, string> = {}
        Object.keys(filters).forEach((key) => {
            const value = filters[key]
            if (value && value.length < 2) errors[key] = 'Minimum 2 characters required'
            if (value && /[<>{}[\]\\|`~!@#$%^&*()+=]/.test(value))
                errors[key] = 'Special characters not allowed'
            if (value && value.length > 50) errors[key] = 'Maximum 50 characters allowed'
        })
        return errors
    }

    const applyPopupFilters = () => {
        const errors = validateFilters(popupFilters)
        setValidationErrors(errors)

        if (Object.keys(errors).length === 0) {
            setLocalFilters(popupFilters)
            onFilter?.(popupFilters)
            setShowFilterPopup(false)
        }
    }

    const clearFilters = () => {
        setLocalFilters({})
        setPopupFilters({})
        setValidationErrors({})
        onFilter?.({})
    }

    /* ---------------------------- BUTTON VARIANTS ---------------------------- */
    const getActionButtonClass = (variant: string = 'secondary') => {
        const base = 'p-1.5 rounded-md transition-colors duration-200 touch-manipulation'
        switch (variant) {
            case 'primary':
                return `${base} bg-blue-500 hover:bg-blue-600 text-white`
            case 'danger':
                return `${base} bg-red-500 hover:bg-red-600 text-white`
            default:
                return `${base} bg-gray-100 hover:bg-gray-200 text-gray-600`
        }
    }

    /* ---------------------------- PAGINATION RENDERER ---------------------------- */
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
                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum =
                            totalPages <= 5
                                ? i + 1
                                : currentPage <= 3
                                    ? i + 1
                                    : currentPage >= totalPages - 2
                                        ? totalPages - 4 + i
                                        : currentPage - 2 + i
                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`px-3 py-1 text-sm rounded-md ${currentPage === pageNum
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        )
                    })}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        )
    }

    /* ---------------------------- LOADING STATE ---------------------------- */
    if (loading)
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        )

    /* ---------------------------- RENDER TABLE ---------------------------- */
    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${fixedHeight ? 'h-full' : ''} ${className}`}
        >
            {/* HEADER ACTIONS */}
            {(onAdd || exportOptions || filterFields) && (
                <div className="border-b border-gray-200 flex-shrink-0 p-4 flex justify-between items-center">
                    {/* Filter Button */}
                    {filterFields?.length ? (
                        <button
                            onClick={() => {
                                setPopupFilters(localFilters)
                                setShowFilterPopup(true)
                            }}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${Object.keys(localFilters).length
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Filter className="h-4 w-4" />
                            <span className="text-sm font-medium">Filters</span>
                            {Object.keys(localFilters).length > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                                    {Object.keys(localFilters).length}
                                </span>
                            )}
                        </button>
                    ) : (
                        <div />
                    )}

                    {/* EXPORT + ADD */}
                    <div className="flex items-center space-x-2">
                        {exportOptions && (
                            <>
                                <button
                                    onClick={exportOptions.onExportExcel}
                                    disabled={exportOptions.exportLoading}
                                    className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span>Excel</span>
                                </button>
                                <button
                                    onClick={exportOptions.onExportPdf}
                                    disabled={exportOptions.exportLoading}
                                    className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>PDF</span>
                                </button>
                            </>
                        )}
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                            >
                                <Plus className="h-4 w-4" />
                                <span>{addButtonText}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div
                className={`overflow-x-auto ${fixedHeight ? 'flex-1 overflow-y-auto' : ''}`}
                style={fixedHeight ? { maxHeight } : {}}
            >
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead className={`${fixedHeight ? 'sticky top-0 z-40' : ''}`} style={{ backgroundColor: '#E5E5E5' }}>
                        <tr className="h-10 text-sm font-medium text-gray-800">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-2 whitespace-nowrap border-b border-gray-300 ${column.align === 'center'
                                            ? 'text-center'
                                            : column.align === 'right'
                                                ? 'text-right'
                                                : 'text-left'
                                        } ${column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.label}</span>
                                        {column.sortable && <ArrowUpDown className="h-3 w-3" />}
                                        {sortInfo?.column === column.key && (
                                            <span className="text-blue-500">
                                                {sortInfo.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions.length > 0 && <th className="px-4 py-2 text-left">Actions</th>}
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 border-b border-gray-200">
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-4 py-2 text-gray-900 ${column.align === 'center'
                                                    ? 'text-center'
                                                    : column.align === 'right'
                                                        ? 'text-right'
                                                        : 'text-left'
                                                }`}
                                            style={{ width: column.width, maxWidth: column.maxWidth }}
                                            title={String(row[column.key] ?? '')}
                                        >
                                            <div
                                                className={`${column.truncate !== false ? 'truncate' : ''
                                                    } overflow-hidden whitespace-nowrap`}
                                            >
                                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                                            </div>
                                        </td>
                                    ))}
                                    {actions.length > 0 && (
                                        <td className="px-4 py-2">
                                            <div className="flex items-center space-x-2">
                                                {actions.map((action, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => action.onClick(row)}
                                                        className={getActionButtonClass(action.variant)}
                                                        title={action.label}
                                                    >
                                                        {action.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && <div className="flex-shrink-0">{renderPagination()}</div>}

            {/* FILTER DRAWER */}
            {showFilterPopup && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black bg-opacity-50" onClick={() => setShowFilterPopup(false)} />
                    <div className="w-96 bg-white shadow-xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Filter</h3>
                            <button onClick={() => setShowFilterPopup(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {filterFields?.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                                    <input
                                        type="text"
                                        value={popupFilters[field.key] || ''}
                                        onChange={(e) => handlePopupFilterChange(field.key, e.target.value)}
                                        placeholder={field.placeholder || `Enter ${field.label}`}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none ${validationErrors[field.key]
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                    />
                                    {validationErrors[field.key] && (
                                        <p className="text-xs text-red-600 mt-1">{validationErrors[field.key]}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between p-4 border-t border-gray-200">
                            <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                                Clear All
                            </button>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowFilterPopup(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyPopupFilters}
                                    className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
