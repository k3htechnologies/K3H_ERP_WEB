import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DeleteMaterialRequisitionRequest, FilterWithPaginationMaterialRequisition, MaterialRequisitionData } from "../models/MaterialRequisitionModel";
import { useToast } from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import * as E from "fp-ts/Either";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate } from "react-router-dom";
import { handleExportFile } from "@/core/utils/exportFile";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms/Button";
import { Edit, Trash2 } from "lucide-react";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import { MATERIAL_REQUISITION_STAGES_OPTIONS, MATERIAL_REQUISITION_STATUS_OPTIONS } from "@/core/constants/staticData";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { DateInput } from "@/ui/components/forms/DateInput";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { getMaterialRequisitionStatusColor } from "../utils/materialRequisitionUtils";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";


export const MaterialRequisition: React.FC = () => {
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const { pagination, setPagination } = usePagination(20);
    const [materialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData[]>([]);
    const { listState, updateListState } = useMaterialRequisitionListState();
    const { searchTerm, filters, sortInfo } = listState;
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [isShowCustomizeMaterialRequisitionColumnsModal, setIsShowCustomizeMaterialRequisitionColumnsModal] = useState(false);
    const navigate = useNavigate();
    const { canAction, canExport } = useMenuPermissions();
    const [selectedRow, setSelectedRow] = useState<MaterialRequisitionData | null>(null);
    const { projectId } = useProject();
    const [deleteData, setDeleteData] = useState<MaterialRequisitionData | null>(null)
    const requiredMaterialRequisitionColumnKeys: string[] = ['SystemGeneratedCode', 'Actions'];
    //#endregion

    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        loadDetailsdata(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        updateListState({ filters: {}, page: 1 });
        loadDetailsdata(1, {});
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchMaterialRequisition(value)
    }, 350);

    //#region SEARCH & CLEAR
    const searchMaterialRequisition = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue });

        if (searchValue.trim() === '') {
            fetchLoadDetailsList();
            return
        }

        updateListState({ filters, page: 1, searchTerm: searchValue });
        await loadDetailsdata(1, filters, sortInfo, searchValue);
    };
    const handleConfirmationDialogBoxOpen = useCallback((row: MaterialRequisitionData) => {
        setDeleteData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);


    const handleNavigateToView = (row: MaterialRequisitionData) => {
        updateListState({ MaterialRequisitionId: row.MaterialRequisitionId, MaterialRequisitionStage: row.MaterialRequisitionStage, MaterialRequisitionStatus: row.MaterialRequisitionStatus, Uniquekey: row.Uniquekey, SystemGeneratedCode: row.SystemGeneratedCode });
        navigate('/MaterialRequisition/view');
    };
    const handleDeleteRequest = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: DeleteMaterialRequisitionRequest = {
                    MaterialRequisitionId: deleteData.MaterialRequisitionId,
                    Uniquekey: deleteData.Uniquekey,
                    ProjectId: Number(projectId)
                };

                const response = await materialRequisitionService.apiCallDeleteMaterialRequisition(payload);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (materialRequisitionData.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadDetailsdata(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteData(null);

                } else {

                    addToast({ type: 'error', title: response.left.message });

                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Deleting Requisition'
        );
    };
    const handlePageChange = useCallback((page: number) => {
        fetchLoadDetailsList(page);
    }, []);

    const handleMaterialRequisitionEdit = useCallback((row: MaterialRequisitionData) => {
        updateListState({ MaterialRequisitionId: row.MaterialRequisitionId });
        navigate(`/materialRequisition/add/${row.MaterialRequisitionId}`);
    }, [navigate, updateListState]);

    const MaterialRequisitionPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

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
            sortable: true,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'MaterialRequisitionStatus',
            label: 'Status',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => {
                const { bg, text } = getMaterialRequisitionStatusColor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text,
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            },
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
            width: '20',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {
                const canActionStage = row.MaterialRequisitionStage === 'Get Quotation';

                return (
                    <div className="flex items-center justify-center gap-1">
                        {canAction && (
                            <>
                                <Button
                                    type="button"
                                    color="transparent"
                                    size="sm"
                                    disabled={!canActionStage}
                                    style={{
                                        color: canActionStage ? '#2563eb' : '#9CA3AF',
                                        padding: '4px 8px',
                                        cursor: canActionStage ? 'pointer' : 'not-allowed',
                                        opacity: canActionStage ? 1 : 0.5
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleMaterialRequisitionEdit(row);
                                    }}
                                    leftIcon={<Edit className="h-4 w-4" />}
                                />

                                <Button
                                    type="button"
                                    color="transparent"
                                    size="sm"
                                    disabled={!canActionStage}
                                    style={{
                                        color: canActionStage ? '#dc2626' : '#9CA3AF',
                                        padding: '4px 8px',
                                        cursor: canActionStage ? 'pointer' : 'not-allowed',
                                        opacity: canActionStage ? 1 : 0.5
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirmationDialogBoxOpen(row);
                                    }}
                                    leftIcon={<Trash2 className="h-4 w-4" />}
                                />
                            </>
                        )}
                    </div>
                );
            }
        }
    ], [handleNavigateToView, handleMaterialRequisitionEdit, canAction]);

    const allMaterialRequisitioKeys: string[] = MaterialRequisitionColumns.map(c => c.key);

    const [selectedMaterialRequisitionColumnKeys, setSelectedMaterialRequisitionColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getMaterialRequisitionTableColumns();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]
                // Ensure required columns are always present

                const withRequired = Array.from(new Set([...parsed, ...requiredMaterialRequisitionColumnKeys]));

                // Filter out any keys that no longer exist
                return withRequired.filter(k => allMaterialRequisitioKeys.includes(k));
            }
        } catch { }
        return allMaterialRequisitioKeys;
    });

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
        loadDetailsdata(1, filters, sort, searchTerm || undefined);
    }, [filters, updateListState, searchTerm]);

    useEffect(() => {
        setPagination({ currentPage: listState.page });
        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadDetailsdata(listState.page, { SystemGeneratedCode: String(listState.searchTerm).trim() }, listState.sortInfo);
        } else {
            loadDetailsdata(listState.page, listState.filters, listState.sortInfo);
        }
    }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

    const fetchLoadDetailsList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadDetailsdata(page, filters, sort ?? sortInfo);
    }

    const loadDetailsdata = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
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
                    SystemGeneratedCode: searchtext ?? filterParams?.SystemGeneratedCode ?? undefined,
                    FromDate: filterParams?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MaterialRequisitionColumns)

                };
                debugger

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
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Material Requisition",
        );
    };



    const clearSearchMaterialRequisition = () => {
        debouncedSearch.cancel?.();
        updateListState({ searchTerm: '', filters: {}, page: 1 });
        setTempFilters({});
        loadDetailsdata(1, { SystemGeneratedCode: '' }, sortInfo, undefined);
    };
    const handleAddMaterialRequisitionModal = useCallback(() => {
        navigate('/materialRequisition/add');
    }, [navigate]);

    const getMaterialRequisition = async (filterParams: FilterWithPaginationMaterialRequisition) => {

        return await materialRequisitionService.apiCallPullMaterialRequisition(filterParams);
    }
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
                    SystemGeneratedCode: searchTerm ?? filters?.SystemGeneratedCode ?? undefined,
                    FromDate: filters?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,

                    ExportType: exportType
                };

                const response = await getMaterialRequisition(params);

                handleExportFile(response, exportType, 'Material Requisition', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportMaterialRequisitionsExcel = () => handleExportMaterialRequisition('Excel')
    const handleExportMaterialRequisitionPdf = () => handleExportMaterialRequisition('PDF')
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>
            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Unique Id"
                onSearchChange={(v) => {
                    updateListState({ searchTerm: v });
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchMaterialRequisition}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters)
                    setShowFilterPopup(true)
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeMaterialRequisitionColumnsModal(true)}

                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddMaterialRequisitionModal}

                // IMPORT 
                isShowImportButton={canAction}

                // EXPORT
                isShowExportButton={canExport && materialRequisitionData.length > 0}
                onExportExcel={handleExportMaterialRequisitionsExcel}
                onExportPdf={handleExportMaterialRequisitionPdf}
                exportLoading={isLoading}
            />
            <DataTable
                data={materialRequisitionData}
                columns={MaterialRequisitionColumns}
                pagination={MaterialRequisitionPaginationInfo}
                emptyMessage="No Material Requisition Off Found"
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
                    const withRequired = Array.from(

                        new Set([...keys, ...requiredMaterialRequisitionColumnKeys])
                    );
                    setSelectedMaterialRequisitionColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeMaterialRequisitionTableColumns?.(

                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={MaterialRequisitionColumns}
                selectedKeys={selectedMaterialRequisitionColumnKeys}
                requiredKeys={requiredMaterialRequisitionColumnKeys}
                title="Customize Table Columns"
            />
            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteData(null)
                }}
                onConfirm={handleDeleteRequest}
                loading={isLoading}
                pageName='Material Requisition'
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

                    {/* Material Requisition Status */}
                    <div>
                        <SinglePageSelection
                            label="Material Requisition Status"
                            placeholder="Select Status"
                            options={MATERIAL_REQUISITION_STATUS_OPTIONS?.map(status => ({ label: status.name, value: status.id })) || []}
                            onChange={(value) => handleFilterChange('MaterialRequisitionStatus', String(value))}
                        />
                    </div>

                    <div>
                        <DateInput
                            label="From Date"
                            value={tempFilters?.FromDate || ""}
                            onChange={(value: any) => handleFilterChange('FromDate', value)}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>

                    <div>
                        <DateInput
                            label="To Date"
                            value={tempFilters?.ToDate || ""}
                            onChange={(value: any) => handleFilterChange('ToDate', value)}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
export default MaterialRequisition;