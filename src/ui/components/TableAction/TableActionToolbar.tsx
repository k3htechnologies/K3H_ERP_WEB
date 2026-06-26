import React, { useEffect, useRef, useState } from 'react'
import { Search, X, Plus, Upload, Download, Table, SlidersHorizontal, Share2Icon } from 'lucide-react'
import type { FilterInfo } from '@/ui/components/DataTable/DataTable'
import { Button, Input } from '@/ui/components/forms'

export interface TableActionToolbarProps {
  isShowSearchBar?: boolean
  searchTerm?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  onClearSearch?: () => void
  addExtraIcon?: React.ReactNode
  addExtraWidth?: string | number
  /** FILTER BUTTON */
  isShowFilterButton?: boolean
  filters?: FilterInfo
  filterTooltipOverride?: string
  onOpenFilter?: () => void

  /** CUSTOMIZE TABLE BUTTON */
  isShowCustomizeButton?: boolean
  customizeLabel?: string
  onCustomize?: () => void

  /** ADD BUTTON */
  isShowAddButton?: boolean
  addTitle?: string
  onAdd?: () => void
  showMoreAddOptions?: React.ReactNode

  /** ADD EXTRA BUTTON */
  isShowAddExtraButton?: boolean
  addExtraTitle?: string
  onAddExtra?: () => void

  /** IMPORT BUTTON */
  isShowImportButton?: boolean
  importTitle?: string
  onUploadExcel?: () => void
  onDownloadSampleExcel?: () => void

  /** EXPORT BUTTON + DROPDOWN */
  isShowExportButton?: boolean
  onExportExcel?: () => void
  onExportPdf?: () => void
  exportLoading?: boolean
}

export const TableActionToolbar: React.FC<TableActionToolbarProps> = ({
  // SEARCH
  isShowSearchBar = true,
  searchTerm = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  onClearSearch,

  // FILTER
  isShowFilterButton = true,
  filters = {},
  filterTooltipOverride,
  onOpenFilter,

  // CUSTOMIZE
  isShowCustomizeButton = true,
  customizeLabel = 'Customize',
  onCustomize,

  // ADD
  isShowAddButton = true,
  addTitle = 'Add',
  onAdd,
  showMoreAddOptions = [],

  // IMPORT
  isShowImportButton = true,
  importTitle = 'Import',
  onUploadExcel,
  onDownloadSampleExcel,

  // EXPORT
  isShowExportButton = true,
  onExportExcel,
  onExportPdf,
  exportLoading = false,

  // EXTRA ADD
  isShowAddExtraButton = true,
  addExtraTitle = 'Add',
  onAddExtra,
  addExtraIcon,
  addExtraWidth,

}) => {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [showIsAddMore, setShowIsAddMore] = useState(false)

  const exportRef = useRef<HTMLDivElement | null>(null)
  const importRef = useRef<HTMLDivElement | null>(null)
  const addMoreRef = useRef<HTMLDivElement | null>(null)
  const addExtraRef = useRef<HTMLDivElement | null>(null)

  // Close export/import/add dropdown when clicked outside or Escape pressed.
  useEffect(() => {
    if (!isExportOpen && !isImportOpen && !showIsAddMore) return

    function handleDocClick(e: MouseEvent) {
      const target = e.target as Node | null

      // click inside export menu -> do nothing
      if (exportRef.current && exportRef.current.contains(target!)) return
      // click inside import menu -> do nothing
      if (importRef.current && importRef.current.contains(target!)) return
      // click inside add more options menu -> do nothing
      if (addMoreRef.current && addMoreRef.current.contains(target!)) return

      // otherwise close all
      setIsExportOpen(false)
      setIsImportOpen(false)
      setShowIsAddMore(false)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsExportOpen(false)
        setIsImportOpen(false)
        setShowIsAddMore(false)
      }
    }

    document.addEventListener('mousedown', handleDocClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExportOpen, isImportOpen, showIsAddMore])

  const activeFilterCount = Object.values(filters || {}).filter(
    (value) => value && String(value).trim() !== ''
  ).length

  const hasFilters = activeFilterCount > 0

  const computedFilterTooltip =
    filterTooltipOverride ??
    (hasFilters && Object.keys(filters).length > 0
      ? `Active filters: ${Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')}`
      : 'Filter')

  const hasAnyActions =
    isShowCustomizeButton ||
    isShowAddButton ||
    isShowImportButton ||
    (isShowExportButton && (onExportExcel || onExportPdf))

  return (
    <div className="pb-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* SEARCH BAR */}
        <div className={`relative min-w-0 w-[526px] ${isShowSearchBar ? 'block' : 'invisible'}`}>

          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            maxLength={40}
            rightIcon={
              <div className={`flex items-center space-x-1 ${searchTerm && isShowFilterButton ? 'pr-8' : 'pr-2'}`}>
                {/* CLEAR SEARCH */}
                {searchTerm && onClearSearch && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onClearSearch()
                    }}
                    color="transparent"
                    fullWidth
                    isborderRadius
                    size="sm"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {/* FILTER BUTTON */}
                {isShowFilterButton && onOpenFilter && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onOpenFilter()
                    }}
                    className="flex items-center p-1.5 rounded-md transition-colors relative bg-blue-100"
                    title={computedFilterTooltip}
                    aria-label="Open filters"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-black" />
                    {hasFilters && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {activeFilterCount}
                        </span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            }
          />
        </div>

        {/* RIGHT SIDE ACTIONS */}
        {hasAnyActions && (
          <div className="flex items-center space-x-1">
            {/* CUSTOMIZE TABLE BUTTON */}
            {isShowCustomizeButton && onCustomize && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCustomize()
                }}
                className="flex px-3 py-2 mr-2 border border-blue-500 text-black-600 bg-white hover:bg-black-50 rounded-md gap-2"
                title={customizeLabel}
                aria-label={customizeLabel}
              >
                <Table className="w-4" />
                <span>{customizeLabel}</span>
              </button>
            )}

            {/* EXPORT */}
            {isShowExportButton && (onExportExcel || onExportPdf) && (
              <div className="relative" ref={exportRef}>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsExportOpen((s) => !s)
                    setIsImportOpen(false)
                  }}
                  color="blue"
                  colorMode="gradient_light"
                  size="mxs"
                  defineWidth
                  title="Export"
                  aria-expanded={isExportOpen}
                  aria-haspopup="menu"
                  style={{ width: '95px' }}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  <span>Export</span>
                </Button>

                {isExportOpen && (
                  <div
                    className="absolute right-0 mt-2 min-w-[168px] bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-150 z-100"
                    role="menu"
                    aria-label="Export options"
                  >
                    <div className="py-1">
                      {onExportExcel && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onExportExcel()
                            setIsExportOpen(false)
                          }}
                          disabled={exportLoading}
                          color="transparent"
                          fullWidth
                          isborderRadius
                          size="sm"
                          title="Export as Excel"
                          style={{ justifyContent: "left" }}
                        >

                          Export as Excel
                        </Button>
                      )}

                      {onExportPdf && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onExportPdf()
                            setIsExportOpen(false)
                          }}
                          disabled={exportLoading}
                          color="transparent"
                          fullWidth
                          isborderRadius
                          size="sm"
                          title="Export as PDF"
                          style={{ justifyContent: "left" }}
                        >

                          Export as PDF
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* IMPORT */}
            {isShowImportButton && (onUploadExcel || onDownloadSampleExcel) && (
              <div className="relative" ref={importRef}>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsImportOpen((s) => !s)
                    setIsExportOpen(false) // close export when opening import
                  }}
                  color="green"
                  colorMode="gradient"
                  size="mxs"
                  defineWidth
                  title={importTitle}
                  aria-expanded={isImportOpen}
                  aria-haspopup="menu"
                  style={{ width: '95px' }}
                  leftIcon={<Upload className="h-4 w-4 " />}
                >
                  <span>{importTitle}</span>
                </Button>

                {isImportOpen && (
                  <div
                    className="absolute right-0 mt-2 min-w-[168px] bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-150 z-100"
                    role="menu"
                    aria-label="Import options"
                  >
                    <div className="py-1">
                      {onUploadExcel && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onUploadExcel()
                            setIsImportOpen(false)
                          }}
                          disabled={exportLoading}
                          color="transparent"
                          fullWidth
                          isborderRadius
                          size="sm"
                          title="Upload Excel"
                          style={{ justifyContent: "left" }}
                        >
                          Upload Excel
                        </Button>
                      )}

                      {onDownloadSampleExcel && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onDownloadSampleExcel()
                            setIsImportOpen(false)
                          }}
                          disabled={exportLoading}
                          color="transparent"
                          fullWidth
                          isborderRadius
                          size="sm"
                          title="Download Sample Excel"
                          style={{ justifyContent: "left" }}
                        >
                          Sample Excel
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADD BUTTON */}
            {isShowAddButton && onAdd && (
              <div ref={addMoreRef} className='relative'>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const hasMoreAddOptions = React.Children.count(showMoreAddOptions) > 0;
                    if (hasMoreAddOptions) {
                      setShowIsAddMore((s) => !s)
                    } else {
                      onAdd()
                    }
                  }}
                  color="blue"
                  size="mxs"
                  variant="solid"
                  colorMode="gradient_dark"
                  defineWidth
                  title={addTitle}
                  aria-label={addTitle}
                  style={{ width: '95px' }}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  <span>{addTitle}</span>
                </Button>
                {showIsAddMore && <div className='absolute z-100 mt-2 right-0'>{showMoreAddOptions}</div>}
              </div>
            )}

            {/* ADD EXTRA */}
            {isShowAddExtraButton && onAddExtra && (
              <div ref={addExtraRef} className='relative'>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    onAddExtra()

                  }}
                  color="blue"
                  size="mxs"
                  variant="solid"
                  colorMode="gradient_dark"
                  defineWidth
                  title={addExtraTitle}
                  aria-label={addExtraTitle}
                  style={{ width: addExtraWidth || '95px' }}
                  leftIcon={addExtraIcon}
                >
                  <span>{addExtraTitle}</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TableActionToolbar
