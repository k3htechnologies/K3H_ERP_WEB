import { Loader } from "@/core/utils/loader";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionData } from "../models/MaterialRequisitionModel";
import { useToast } from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import * as E from "fp-ts/Either";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import { usePagination } from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate } from "react-router-dom";
import { handleExportFile } from "@/core/utils/exportFile";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms/Button";
import { Trash2 } from "lucide-react";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import { MATERIAL_REQUISITION_STAGES_OPTIONS, MATERIAL_REQUISITION_STATUS_OPTIONS } from "@/core/constants/staticData";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import DatePickerInput from "@/ui/components/forms/Datepicker";

export const MaterialRequisition: React.FC = () => {

    //#region STATE MANAGEMENT
    const [materialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const navigate = useNavigate();

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();

    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [isShowCustomizeMaterialRequisitionColumnsModal, setIsShowCustomizeMaterialRequisitionColumnsModal] = useState(false);

    const { canAction, canExport } = useMenuPermissions();

    const { projectId } = useProject();

    const { listState, updateListState, resetFilters } = useMaterialRequisitionListState();
    const { page, filters, sortInfo, searchTerm } = listState;
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        if (searchTerm && searchTerm.trim()) {
            loadDetailsdata(page, { SystemGeneratedCode: searchTerm.trim() }, sortInfo);
        } else {
            loadDetailsdata(page, filters, sortInfo);
        }
    }, [projectId, page, filters, sortInfo, searchTerm]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    useEffect(() => {
        setTempFilters(filters);
    }, [filters]);
    //#endregion

    //#region SEARCH
    const debouncedSearch = useDebouncedCallback((value: string) => {
        if (value.trim() === "") {
            updateListState({ searchTerm: "", filters: {}, page: 1 });
            return;
        }
        updateListState({ searchTerm: value, filters: { SystemGeneratedCode: value.trim() }, page: 1 });
    }, 350);

    const searchMaterialRequisition = (searchValue: string) => {
        updateListState({ searchTerm: searchValue });
        debouncedSearch(searchValue);
    };
    //#endregion

    //#region CLEAR
    const clearSearchMaterialRequisition = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        setTempFilters({});
    };
    //#endregion

    //#region DATA LOADING
    const loadDetailsdata = async (
        page: number,
        filterParams: FilterInfo,
        sortInfo?: SortInfo,
    ) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisition = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MaterialRequisitionStatus: filterParams?.MaterialRequisitionStatus ?? undefined,
                    MaterialRequisitionStage: filterParams?.MaterialRequisitionStage ?? undefined,
                    SystemGeneratedCode: filterParams?.SystemGeneratedCode ?? undefined,
                    FromDate: filterParams?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialRequisitionColumns)
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisition(params);

                if (E.isRight(response)) {
                    setMaterialRequisitionData(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: "error", title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Material Requisition",
        );
    };
    //#endregion

    //#region EXPORT
    const handleExportMaterialRequisition = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisition = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    MaterialRequisitionStatus: filters?.MaterialRequisitionStatus ?? undefined,
                    MaterialRequisitionStage: filters?.MaterialRequisitionStage ?? undefined,
                    SystemGeneratedCode: filters?.SystemGeneratedCode ?? undefined,
                    FromDate: filters?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialRequisitionColumns),
                    ExportType: exportType
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisition(params);
                handleExportFile(response, exportType, 'Material Requisition', addToast);
                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportMaterialRequisitionsExcel = () => handleExportMaterialRequisition('Excel');
    const handleExportMaterialRequisitionPdf = () => handleExportMaterialRequisition('PDF');
    //#endregion

    //#region PAGE CHANGE
    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [updateListState]);
    //#endregion

    //#region SORT
    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
    }, [updateListState]);
    //#endregion

    //#region PAGINATION INFO
    const MaterialRequisitionPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
    );

    const MaterialRequisitionForTable = useMemo(() => materialRequisitionData, [materialRequisitionData]);
    //#endregion

    //#region NAVIGATE
    const handleNavigateToView = useCallback((row: MaterialRequisitionData) => {
        updateListState({
            MaterialRequisitionId: row.MaterialRequisitionId,
            MaterialRequisitionStage: row.MaterialRequisitionStage,
            SystemGeneratedCode: row.SystemGeneratedCode,
            Uniquekey:row.Uniquekey
        });
        navigate('/MaterialRequisition/view');
    }, [navigate, updateListState]);

    const handleAddMaterialRequisitionModal = useCallback(() => {
        navigate('/materialRequisition/add');
    }, [navigate]);
    //#endregion

    //#region TABLE COLUMNS  ← defined AFTER loadDetailsdata, same as Litigation pattern
    const MaterialRequisitionColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'SystemGeneratedCode',
            label: 'Unique Id',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'MaterialRequisitionStage',
            label: 'Stage',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'FinalVendor',
            label: 'Vendor Name',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'MaterialRequisitionStatus',
            label: 'Status',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'TotalPoAmount',
            label: 'Total Po Amount',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'TotalInvoiceAmount',
            label: 'Total Invoice Amount',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value) => {
                if (!canAction) return null;
                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            color='transparent'
                            isborderRadius
                            size='sm'
                            style={{ color: 'red', padding: '4px 8px' }}
                            title="Delete Material Requisition"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ], [handleNavigateToView, canAction]);
    //#endregion

    //#region COLUMN CUSTOMIZATION
    const requiredMaterialRequisitionColumnKeys: string[] = ['SystemGeneratedCode', 'Actions'];
    const allMaterialRequisitionKeys: string[] = MaterialRequisitionColumns.map(c => c.key);

    const [selectedMaterialRequisitionColumnKeys, setSelectedMaterialRequisitionColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getMaterialRequisitionTableColumns();
            if (saved) {
                const parsed = JSON.parse(saved) as string[];
                const withRequired = Array.from(new Set([...parsed, ...requiredMaterialRequisitionColumnKeys]));
                return withRequired.filter(k => allMaterialRequisitionKeys.includes(k));
            }
        } catch { }
        return allMaterialRequisitionKeys;
    });

    useEffect(() => {
        setSelectedMaterialRequisitionColumnKeys(prev =>
            Array.from(new Set([...prev, ...requiredMaterialRequisitionColumnKeys])).filter(k =>
                allMaterialRequisitionKeys.includes(k)
            )
        );
    }, [MaterialRequisitionColumns.length]);

    const visibleMaterialRequisitionColumns = useMemo(
        () => MaterialRequisitionColumns.filter(col => selectedMaterialRequisitionColumnKeys.includes(col.key)),
        [MaterialRequisitionColumns, selectedMaterialRequisitionColumnKeys]
    );
    //#endregion

    //#region FILTER
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };

    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        resetFilters();
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Unique Id"
                onSearchChange={searchMaterialRequisition}
                onClearSearch={clearSearchMaterialRequisition}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeMaterialRequisitionColumnsModal(true)}

                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddMaterialRequisitionModal}

                isShowImportButton={canAction}
                isShowExportButton={canExport && MaterialRequisitionForTable.length > 0}
                
                onExportExcel={handleExportMaterialRequisitionsExcel}
                onExportPdf={handleExportMaterialRequisitionPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={MaterialRequisitionForTable}
                columns={visibleMaterialRequisitionColumns}
                pagination={MaterialRequisitionPaginationInfo}
                emptyMessage="No Material Requisition Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeMaterialRequisitionColumnsModal}
                onClose={() => setIsShowCustomizeMaterialRequisitionColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(new Set([...keys, ...requiredMaterialRequisitionColumnKeys]));
                    setSelectedMaterialRequisitionColumnKeys(withRequired);
                    try {
                        LocalStorageHelper.storeMaterialRequisitionTableColumns?.(JSON.stringify(withRequired));
                    } catch { }
                }}
                columns={MaterialRequisitionColumns}
                selectedKeys={selectedMaterialRequisitionColumnKeys}
                requiredKeys={requiredMaterialRequisitionColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Material Requisition"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply"
                cancelText="Clear"
                onCancel={() => clearFilters()}
                size="small-half"
            >
                <div className="space-y-4">
                    <div>
                        <SinglePageSelection
                            label="Material Requisition Stage"
                            placeholder="Select Stage"
                            options={MATERIAL_REQUISITION_STAGES_OPTIONS?.map(stage => ({ label: stage.name, value: stage.id })) || []}
                            onChange={(value) => handleFilterChange('MaterialRequisitionStage', String(value))}
                        />
                    </div>
                    <div>
                        <SinglePageSelection
                            label="Material Requisition Status"
                            placeholder="Select Status"
                            options={MATERIAL_REQUISITION_STATUS_OPTIONS?.map(status => ({ label: status.name, value: status.id })) || []}
                            onChange={(value) => handleFilterChange('MaterialRequisitionStatus', String(value))}
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label='From Date'
                            value={tempFilters.FromDate || ''}
                            onChange={value => handleFilterChange('FromDate', value || '')}
                            placeholder="Select From Date"
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='To Date'
                            value={tempFilters.ToDate || ''}
                            onChange={value => handleFilterChange('ToDate', value || '')}
                            placeholder="Select To Date"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MaterialRequisition;