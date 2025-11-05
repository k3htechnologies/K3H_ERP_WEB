// ============================================================================
// REUSABLE DATA TABLE COMPONENT WITH PAGINATION
// ============================================================================

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, ArrowUpDown, FileSpreadsheet, FileText, X, Filter } from 'lucide-react'

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

interface DataTableProps {
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
  filterFields?: Array<{
    key: string
    label: string
    placeholder?: string
  }>
}

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
  recordsPerPage = 10,
  sortInfo,
  onSort,
  filters,
  onFilter,
  exportOptions,
  filterFields
}) => {
  const [localFilters, setLocalFilters] = useState<FilterInfo>(filters || {})
  const [popupFilters, setPopupFilters] = useState<FilterInfo>(filters || {})
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!onSort || !column?.sortable) return

    const newDirection = sortInfo?.column === columnKey && sortInfo?.direction === 'asc' ? 'desc' : 'asc'
    // Pass the column key for internal sorting logic
    onSort({ column: columnKey, direction: newDirection })
  }


  const handlePopupFilterChange = (key: string, value: string) => {
    const newFilters = { ...popupFilters }

    // Only add filter if value is not empty
    if (value.trim()) {
      newFilters[key] = value.trim()
    } else {
      // Remove filter if empty
      delete newFilters[key]
    }

    setPopupFilters(newFilters)

    // Clear validation error for this field when user types
    if (validationErrors[key]) {
      const newErrors = { ...validationErrors }
      delete newErrors[key]
      setValidationErrors(newErrors)
    }
  }

  const clearFilters = () => {
    setLocalFilters({})
    setPopupFilters({})
    setValidationErrors({})
    onFilter?.({})
  }

  const validateFilters = (filters: FilterInfo): { [key: string]: string } => {
    const errors: { [key: string]: string } = {}

    // Basic validation rules
    Object.keys(filters).forEach(key => {
      const value = filters[key]

      // Required field validation (if needed)
      if (value && value.length < 2) {
        errors[key] = 'Minimum 2 characters required'
      }

      // Special characters validation
      if (value && /[<>{}[\]\\|`~!@#$%^&*()+=]/.test(value)) {
        errors[key] = 'Special characters not allowed'
      }

      // Length validation
      if (value && value.length > 50) {
        errors[key] = 'Maximum 50 characters allowed'
      }
    })

    return errors
  }

  const applyPopupFilters = () => {
    // Validate filters before applying
    const errors = validateFilters(popupFilters)
    setValidationErrors(errors)

    // Only apply if no validation errors
    if (Object.keys(errors).length === 0) {
      setLocalFilters(popupFilters)
      onFilter?.(popupFilters)
      setShowFilterPopup(false)
      setValidationErrors({})
    }
  }


  const getActionButtonClass = (variant: string = 'secondary') => {
    const baseClass = 'p-1.5 rounded-md transition-colors duration-200 touch-manipulation'
    switch (variant) {
      case 'primary':
        return `${baseClass} bg-blue-500 hover:bg-blue-600 text-white`
      case 'danger':
        return `${baseClass} bg-red-500 hover:bg-red-600 text-white`
      default:
        return `${baseClass} bg-gray-100 hover:bg-gray-200 text-gray-600`
    }
  }

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

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${fixedHeight ? 'h-full' : ''} ${className}`}>
      {/* Header with Filter Toggle, Add Button and Export Options */}
      {(onAdd || exportOptions || filterFields) && (
        <div className="border-b border-gray-200 flex-shrink-0">
          {/* Main Header Row */}
          <div className="flex justify-between items-center p-4">
            {/* Filter Button - Direct Popup Open */}
            {filterFields && filterFields.length > 0 && (
              <button
                onClick={() => {
                  // Initialize popup filters with current applied filters
                  setPopupFilters(localFilters)
                  setShowFilterPopup(true)
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${Object.keys(localFilters).length > 0
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
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Export Buttons */}
              {exportOptions && (
                <>
                  <button
                    onClick={exportOptions.onExportExcel}
                    disabled={exportOptions.exportLoading}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-200 touch-manipulation disabled:opacity-50"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={exportOptions.onExportPdf}
                    disabled={exportOptions.exportLoading}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 touch-manipulation disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </button>
                </>
              )}
              {/* Add Button */}
              {onAdd && (
                <button
                  onClick={onAdd}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200 touch-manipulation"
                >
                  <Plus className="h-4 w-4" />
                  <span>{addButtonText}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}


      {/* Table Container with Fixed Height */}
      <div className={`overflow-x-auto ${fixedHeight ? 'flex-1 overflow-y-auto' : ''}`} style={fixedHeight ? {
        maxHeight: recordsPerPage === 10 ? 'calc(10 * 2.5rem + 2.5rem)' : maxHeight
      } : {}}>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead
            className={`${fixedHeight ? 'sticky top-0 z-40' : ''} shadow-sm`}
            style={{
              backgroundColor: '#E5E5E5',
              position: fixedHeight ? 'sticky' : 'static',
              top: 0,
              zIndex: 40,
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
          ${column.align === 'center' ? 'text-center' :
                      column.align === 'right' ? 'text-right' : 'text-left'}
          ${column.width ? `w-${column.width}` : ''}
          ${column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}
          ${column.fixed === 'left'
                      ? 'sticky left-0 z-40 shadow-[2px_0_4px_rgba(0,0,0,0.1)]'
                      : column.fixed === 'right'
                        ? 'sticky right-0 z-40 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]'
                        : ''
                    }
        `}
                  style={{
                    ...(column.width ? { width: column.width } : {}),
                    fontSize: '14px',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    letterSpacing: '0%',
                    backgroundColor: '#E5E5E5',
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

              {actions.length > 0 && (
                <th
                  className="px-4 py-2 text-left text-gray-800 uppercase tracking-wider w-24 whitespace-nowrap"
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    backgroundColor: '#E5E5E5',
                    borderBottom: '1px solid #D1D5DB',
                    borderRight: '1px solid #D1D5DB',
                  }}
                >
                  Actions
                </th>
              )}
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
                <tr key={index} className="hover:bg-gray-50 h-10 border-b border-gray-200">
                  {columns.map((column) => {
                    const cellValue = column.render ? column.render(row[column.key], row) : row[column.key]
                    // For tooltip, we need the raw data value, not the rendered JSX
                    const rawValue = row[column.key]
                    const displayValue = rawValue?.toString() || ''

                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-2 text-gray-900 h-10 border-r border-gray-200 ${column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : 'text-left'
                          } ${column.fixed === 'left' ? 'sticky left-0 bg-white z-20 shadow-[2px_0_4px_rgba(0,0,0,0.1)] border-r-2 border-r-gray-400' :
                            column.fixed === 'right' ? 'sticky right-0 bg-white z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] border-l-2 border-l-gray-400' : ''
                          }`}
                        style={{
                          ...(column.width ? { width: column.width } : {}),
                          fontSize: '14px',
                          fontWeight: '400',
                          lineHeight: '100%',
                          letterSpacing: '0%'
                        }}
                        title={displayValue}
                      >
                        <div
                          className={`${column.truncate !== false ? 'truncate overflow-hidden whitespace-nowrap' : ''} max-w-full`}
                          style={{
                            maxWidth: column.maxWidth || column.width || '200px'
                          }}
                        >
                          {cellValue}
                        </div>
                      </td>
                    )
                  })}
                  {actions.length > 0 && (
                    <td
                      className="px-4 py-2 whitespace-nowrap h-10"
                      style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        lineHeight: '100%',
                        letterSpacing: '0%'
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
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

      {/* Pagination */}
      {pagination && (
        <div className="flex-shrink-0">
          {renderPagination()}
        </div>
      )}

      {/* Right-side Filter Popup */}
      {showFilterPopup && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setShowFilterPopup(false)}
          />

          {/* Filter Popup */}
          <div className="w-96 bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
              <button
                onClick={() => setShowFilterPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Form */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {filterFields?.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={popupFilters[field.key] || ''}
                    onChange={(e) => handlePopupFilterChange(field.key, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${validationErrors[field.key]
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {validationErrors[field.key] && (
                    <p className="text-xs text-red-600 mt-1">
                      {validationErrors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Clear All
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilterPopup(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyPopupFilters}
                  className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
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
