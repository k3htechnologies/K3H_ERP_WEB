    import React, { useEffect, useRef, useState } from 'react'
    import { Search, X, Filter, Plus, Upload, Download, FileSpreadsheet, FileText, Table } from 'lucide-react'
    import type { FilterInfo } from '@/ui/components/DataTable/DataTable'
    import { Button, Input } from '@/ui/components/forms'

    export interface TableActionToolbarProps {
        isShowSearchBar?: boolean
        searchTerm?: string
        searchPlaceholder?: string
        onSearchChange?: (value: string) => void
        onClearSearch?: () => void

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

        /** IMPORT BUTTON */
        isShowImportButton?: boolean
        importTitle?: string
        onImport?: () => void

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

        // IMPORT
        isShowImportButton = true,
        importTitle = 'Import',
        onImport,

        // EXPORT
        isShowExportButton = true,
        onExportExcel,
        onExportPdf,
        exportLoading = false,
    }) => {
        const [isExportOpen, setIsExportOpen] = useState(false)
        const exportRef = useRef<HTMLDivElement | null>(null)

        // Close export dropdown when clicked outside
        useEffect(() => {
            function handleDocClick(e: MouseEvent) {
                if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                    setIsExportOpen(false)
                }
            }
            if (isExportOpen) {
                document.addEventListener('mousedown', handleDocClick)
            }
            return () => {
                document.removeEventListener('mousedown', handleDocClick)
            }
        }, [isExportOpen])

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
            <div className="pb-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* SEARCH BAR */}
                    {isShowSearchBar && (
                        <div className="relative min-w-0 w-[526px]">
                            <Input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value
                                    onSearchChange?.(value)
                                }}
                                placeholder={searchPlaceholder}
                                leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                                rightIcon={
                                    <div className="flex items-center space-x-1 pr-8">
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
                                            >
                                                <X className="" />
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
                                                className={`flex items-center p-1.5 rounded-md transition-colors relative bg-blue-100`}

                                                title={computedFilterTooltip}
                                            >
                                                <Filter className="h-4 w-4 text-black" />
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
                    )}

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
                                    //className="px-3 py-2 mr-2 rounded-md flex items-center gap-2"
                                    className="flex px-3 py-2 mr-2 border border-blue-500 text-black-600 bg-white hover:bg-black-50 rounded-md gap-2"
                                    title={customizeLabel}
                                >
                                    <Table className=" w-4" />
                                    <span>{customizeLabel}</span>
                                </button>

                            )}

                            {/* EXPORT BUTTON + DROPDOWN */}
                            {isShowExportButton && (onExportExcel || onExportPdf) && (
                                <div className="relative" ref={exportRef}>
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsExportOpen((s) => !s)
                                        }}
                                        className="text-black gap-2"
                                        color="purple"
                                        colorMode="light"
                                        size="mxs"
                                        defineWidth
                                        title="Export"
                                        style={{width:"95px",border:'1px solid blue'}}
                                    >
                                        <Download className="h-4 w-4 text-black" /> <span className="text-black">Export</span>
                                    </Button>

                                    {isExportOpen && (
                                        <div className="absolute right-0 mt-2 w-42 bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-150 z-50">
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
                                                    >
                                                        <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
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
                                                    >
                                                        <FileText className="h-4 w-4 mr-2 text-red-600" />
                                                        Export as PDF
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* ADD BUTTON */}
                            {isShowAddButton && onAdd && (
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onAdd()
                                    }}
                                    color="blue"
                                    size="mxs"
                                    variant="solid"
                                    colorMode="light"
                                    defineWidth
                                    title={addTitle}
                                >
                                    <Plus className="h-4 w-4" /> <span>{addTitle}</span>
                                </Button>
                            )}

                            {/* IMPORT BUTTON */}
                            {isShowImportButton && onImport && (
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onImport()
                                    }}
                                    color="green"
                                    colorMode="light"
                                    size="xs"
                                    defineWidth
                                    title={importTitle}
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            )}


                        </div>
                    )}
                </div>
            </div>
        )
    }

    export default TableActionToolbar
