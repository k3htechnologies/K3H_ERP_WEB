import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DeleteMaterialRequisitionRequest, FilterWithPaginationMaterialRequisition, MaterialRequisitionData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { useToast } from "@/core/hooks/useToast";
import type { FilterInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { materialRequisitionService } from "@/features/materialRequisition/services/MaterialRequisitionService";
import * as E from "fp-ts/Either";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useNavigate } from "react-router-dom";
import { handleExportFile } from "@/core/utils/exportFile";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms/Button";
import { Copy, Edit, ListChecks, Trash2 } from "lucide-react";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import { MATERIAL_REQUISITION_STATUS_OPTIONS } from "@/core/constants/staticData";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { getMaterialRequisitionStatusColor } from "@/features/materialRequisition/utils/materialRequisitionUtils";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { copyToClipboard, formatCurrency } from "@/core/utils/comman";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { Input } from "@/ui/components/forms";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";

export const MaterialRequisition: React.FC = () => {
    const emp = LocalStorageHelper.getStoredEmployeeData();
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const { pagination, setPagination } = usePagination(20);
    const [materialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData[]>([]);
    const { listState, updateListState, clearMaterialRequisitionContext } = useMaterialRequisitionListState();
    const { page, searchTerm, filters, sortInfo } = listState;
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [isShowCustomizeMaterialRequisitionColumnsModal, setIsShowCustomizeMaterialRequisitionColumnsModal] = useState(false);
    const navigate = useNavigate();
    const [deleteData, setDeleteData] = useState<MaterialRequisitionData | null>(null)
    const { canAction, canExport } = useMenuPermissions('Get Material Requisition');

    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [mrCode, setMrcode] = useState<string | null>("");
    const [projectName, setProjectName] = useState<string | null>("");
    const [createdBy, setCreatedBy] = useState<string | null>("");

    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<MaterialRequisitionData | null>(null);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchMaterialRequisition(value)
    }, 350);

    useEffect(() => {

        if (listState.searchTerm && String(listState.searchTerm).trim()) {

            loadDetailsdata(listState.page, { SystemGeneratedCode: String(listState.searchTerm).trim() }, listState.sortInfo);

        } else {
            loadDetailsdata(listState.page, listState.filters, listState.sortInfo);
        }
    }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm, clearMaterialRequisitionContext]);

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
                    ProjectId: Number(filterParams?.ProjectId ?? 0),
                    MaterialRequisitionType: filterParams?.MaterialRequisitionType ?? undefined,
                    Department: filterParams?.Department ?? undefined,
                    CompanyName: filterParams?.CompanyName ?? undefined,
                    ApprovalStatus: filterParams?.ApprovalStatus ?? undefined,
                    MaterialRequisitionStatus: filterParams?.MaterialRequisitionStatus ?? undefined,
                    SystemGeneratedCode: searchtext ?? filterParams?.SystemGeneratedCode ?? undefined,
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

    const handleConfirmationDialogBoxOpen = useCallback((row: MaterialRequisitionData) => {
        setDeleteData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const handleNavigateToView = useCallback((row: MaterialRequisitionData) => {
        updateListState({
            materialRequisitionId: row.MaterialRequisitionId ?? 0,
            systemGeneratedCode: row.SystemGeneratedCode ?? "",
            uniquekey: row.Uniquekey ?? "",
            projectId: row.ProjectId ?? 0,
            projectName: row.ProjectName ?? "",
            companyGSTNumber: row.CompanyGSTNumber ?? "",
            materialRequisitionStatus: row.MaterialRequisitionStatus ?? "",
            approvalStatus: row.ApprovalStatus ?? "",
            departmentMasterId: row.DepartmentMasterId ?? 0
        });
        navigate('/materialRequisition/view');
    }, [navigate, updateListState],);

    const handleNavigateToMaterialRequsitionStagesSummary = useCallback((row: MaterialRequisitionData) => {

        updateListState({
            materialRequisitionId: row.MaterialRequisitionId ?? 0,
            systemGeneratedCode: row.SystemGeneratedCode ?? "",
            uniquekey: row.Uniquekey ?? "",
            projectId: row.ProjectId ?? 0,
            projectName: row.ProjectName ?? "",
            materialRequisitionStatus: row.MaterialRequisitionStatus ?? "",
            approvalStatus: row.ApprovalStatus ?? ""
        });

        navigate("/materialRequisition/stagesSummary");

    },
        [navigate, updateListState]
    );

    const handlePageChange = (page: number) => {
        updateListState({ page });
    };

    const handleMaterialRequisitionEdit = useCallback((row: MaterialRequisitionData) => {
        updateListState({ materialRequisitionId: row.MaterialRequisitionId });
        navigate(`/materialRequisition/add/${row.MaterialRequisitionId}`);
    }, [navigate, updateListState]);

    const MaterialRequisitionPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }), [pagination, handlePageChange]);


    const handleApprovalLog = (row: MaterialRequisitionData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "MATERIAL REQUISITION APPROVAL",
            Id: row.MaterialRequisitionId ?? 0,
            ProjectId: row.ProjectId ?? 0,
        };
        setMrcode(row.SystemGeneratedCode);
        setProjectName(row.ProjectName);
        setCreatedBy(row.CreatedBy);

        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectMaterialRequisition = (row: MaterialRequisitionData, approvalType: "approve" | "reject") => {

        setApprovalRowData(row);
        setMrcode(row.SystemGeneratedCode);
        setProjectName(row.ProjectName);
        setCreatedBy(row.CreatedBy);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);

    };

    const MaterialRequisitionColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'SystemGeneratedCode',
            label: 'MR Code',
            sortable: true,
            width: '20',
            fixed: 'left',
            align: 'left',
            render: (value, row) => {
                return (
                    <div className="flex items-center gap-2">

                        <TooltipText
                            text={value || '-'}
                            maxWidth="180px"
                            tooltipThreshold={30}
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            onClick={() => handleNavigateToView(row)}
                        />


                        {value && (
                            <Button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const success = await copyToClipboard(value);
                                    if (success) {
                                        addToast({ type: 'success', title: `${value} Copied!` });
                                    }
                                }}
                                color="transparent"
                                size="sm"
                                style={{
                                    padding: '2px 6px',
                                    color: '#6B7280',
                                    cursor: 'pointer'
                                }}
                                title="Copy"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        )}


                    </div>

                );
            }
        },
        {
            key: 'ProjectName',
            label: 'Project Name',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (value) || '-'
        },
        {
            key: 'CompanyName',
            label: 'Company Name',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (value) || '-'
        },
        {
            key: "ApprovalStatus",
            label: "MR Approval Status",
            width: "18",
            sortable: false,
            align: "center",
            render: (value, row) => (

                <ApprovalActions
                    approvalStatus={value || "-"}
                    showApproval={row.IsApproval}
                    isIcons={true}
                    onHistory={() => handleApprovalLog(row)}
                    onApprove={() => handleApproveRejectMaterialRequisition(row, "approve")}
                    onReject={() => handleApproveRejectMaterialRequisition(row, "reject")}
                />

            )
        },
        {
            key: "RequisitionApprovedDate",
            label: "MR Approved Date",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) =>
                value ? formatDate_dd_MonthName_yy_hh_mm(value) : "-"
        },
        {
            key: 'MaterialRequisitionStatus',
            label: 'MR Status',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value, row) => {
                const { bg, text } = getMaterialRequisitionStatusColor(value);

                return (
                    <div className="flex items-center gap-2">
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                                backgroundColor: bg,
                                color: text,
                            }}
                        >
                            {value || "-"}
                        </span>
                        {["COMPLETED", "CLOSED"].includes(value?.toUpperCase()) && (
                            <FieldInfoTooltip value={row.CloseCompletionRemark} />
                        )}
                    </div>
                );
            },
        },
        {
            key: 'MaterialRequisitionType',
            label: 'Type',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (value) || '-'
        },
        {
            key: 'Department',
            label: 'Department',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (value) || '-'
        },
        {
            key: 'ModifiedBy',
            label: 'Last Modified By',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || row.CreatedBy || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'ModifiedDate',
            label: 'Last Modified Date',
            width: '33',
            sortable: false,
            align: 'center',
            render: (value, row) =>
                value
                    ? formatDate_dd_MonthName_yy_hh_mm(value)
                    : row.CreatedDate
                        ? formatDate_dd_MonthName_yy_hh_mm(row.CreatedDate)
                        : '-'
        },

        {
            key: 'TotalPoAmount',
            label: 'Total PO Amount (₹)',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => formatCurrency(value) || 0
        },
        {
            key: 'PendingPOAmount',
            label: 'Pending PO Amount (₹)',
            width: '15',
            sortable: false,
            align: 'left',
            render: (_, row) => {

                const pendingPOAmount =
                    Number(row.TotalPoAmount || 0) -
                    Number(row.TotalInvoiceAmount || 0);

                return formatCurrency(pendingPOAmount) || 0;
            }
        },
        {
            key: 'TotalInvoiceAmount',
            label: 'Total Invoice Amount (₹)',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => formatCurrency(value) || 0
        },
        {
            key: 'PaidAmount',
            label: 'Paid Amount (₹)',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => formatCurrency(value) || 0
        },
        {
            key: 'TDSPaidAmount',
            label: 'TDS Paid Amount (₹)',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => formatCurrency(value) || 0
        },
        {
            key: 'PendingInvoiceAmount',
            label: 'Pending Invoice Amount (₹)',
            width: '15',
            sortable: false,
            align: 'left',
            render: (_, row) => {

                const pendingInvoiceAmount =
                    Number(row.TotalInvoiceAmount || 0) -
                    (
                        Number(row.PaidAmount || 0) +
                        Number(row.TDSPaidAmount || 0)
                    );

                return formatCurrency(pendingInvoiceAmount) || 0;
            }
        },
        {
            key: 'TotalInvoice',
            label: 'No of Invoice',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || 0
        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '20',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {

                const canActionStage = canAction && Number(row.CreatedById) === Number(emp?.EmployeeId) &&
                    ["PENDING"].includes(row.ApprovalStatus?.toUpperCase()) &&
                    !["COMPLETED", "CLOSED"].includes(row.MaterialRequisitionStage?.toUpperCase());

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

                                <Button
                                    type="button"
                                    color="transparent"
                                    size="sm"
                                    title="View Material Requisition Stages"
                                    style={{
                                        color: "#2563eb",
                                        padding: "4px 8px",
                                        cursor: "pointer"
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        handleNavigateToMaterialRequsitionStagesSummary(row);
                                    }}
                                    leftIcon={<ListChecks className="h-4 w-4" />}
                                />


                            </>
                        )}
                    </div>

                );
            }
        },

    ], [handleNavigateToView, handleMaterialRequisitionEdit, canAction, handleApprovalLog, handleApproveRejectMaterialRequisition, handleNavigateToMaterialRequsitionStagesSummary]);

    const requiredMaterialRequisitionColumnKeys: string[] = ['SystemGeneratedCode', 'Actions'];

    const allMaterialRequisitioKeys: string[] = MaterialRequisitionColumns.map(c => c.key);

    const [selectedMaterialRequisitionColumnKeys, setSelectedMaterialRequisitionColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getMaterialRequisitionTableColumns();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredMaterialRequisitionColumnKeys]));

                return withRequired.filter(k => allMaterialRequisitioKeys.includes(k));
            }
        } catch { }
        return allMaterialRequisitioKeys;
    });

    useEffect(() => {
        setSelectedMaterialRequisitionColumnKeys((prev) =>
            Array.from(new Set([...prev, ...requiredMaterialRequisitionColumnKeys])).filter(
                (k) => allMaterialRequisitioKeys.includes(k),
            ),
        );
    }, [MaterialRequisitionColumns.length]);

    const visibleMaterialRequisitionColumns = useMemo(
        () => MaterialRequisitionColumns.filter((col) =>
            selectedMaterialRequisitionColumnKeys.includes(col.key),),
        [MaterialRequisitionColumns, selectedMaterialRequisitionColumnKeys],
    );

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
        loadDetailsdata(1, filters, sort, searchTerm || undefined);
    }, [filters, updateListState, searchTerm]);

    const searchMaterialRequisition = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue });

        if (searchValue.trim() === '') {
            fetchLoadDetailsList();
            return
        }
        updateListState({ filters, page: 1, searchTerm: searchValue });
        await loadDetailsdata(1, filters, sortInfo, searchValue);
    };

    const clearSearchMaterialRequisition = () => {
        debouncedSearch.cancel?.();
        updateListState({ searchTerm: '', filters: {}, page: 1, projectId: 0 });
        setTempFilters({});
        loadDetailsdata(1, { SystemGeneratedCode: '' }, sortInfo, undefined);
    };

    const handleAddMaterialRequisitionModal = useCallback(() => {
        navigate('/materialRequisition/add');
    }, [navigate]);

    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        updateListState({ filters: {}, page: 1, projectId: 0 });
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleDeleteRequest = async () => {

        if (!deleteData) return;

        setIsConfirmationDialogBoxOpen(false);

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: DeleteMaterialRequisitionRequest = {
                    MaterialRequisitionId: deleteData.MaterialRequisitionId,
                    Uniquekey: deleteData.Uniquekey,
                    ProjectId: Number(deleteData.ProjectId ?? 0)
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
                    ProjectId: Number(filters?.ProjectId ?? 0),
                    Department: filters?.Department ?? undefined,
                    CompanyName: filters?.CompanyName ?? undefined,
                    ApprovalStatus: filters?.ApprovalStatus ?? undefined,
                    MaterialRequisitionType: filters?.MaterialRequisitionType ?? undefined,
                    MaterialRequisitionStatus: filters?.MaterialRequisitionStatus ?? undefined,
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

    const handleApprovalSubmit = async (remark: string) => {

        if (!approvalRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "MATERIAL REQUISITION APPROVAL",
            Id: approvalRowData.MaterialRequisitionId ?? 0,
            ProjectId: approvalRowData.ProjectId ?? 0,
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);

                    await loadDetailsdata(page, filters, sortInfo);

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
            approvalActionType === "approve" ? "Approving Booking" : "Rejecting Booking"
        );
    };



    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>



            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By MR Code"
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
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddMaterialRequisitionModal}
                isShowImportButton={canAction}
                isShowExportButton={canExport && materialRequisitionData.length > 0}
                onExportExcel={handleExportMaterialRequisitionsExcel}
                onExportPdf={handleExportMaterialRequisitionPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={materialRequisitionData}
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
                        <Input type="text"
                            label='MR Code'
                            value={tempFilters?.SystemGeneratedCode ?? ''}
                            onChange={e => handleFilterChange('SystemGeneratedCode', e.target.value)}
                            placeholder="Enter MR Code" />
                    </div>
                    <div>
                        <SinglePageSelection
                            label="Project"
                            placeholder="Select Project"
                            options={(LocalStorageHelper.getStoredEmployeeData?.()?.ProjectData ?? []).map(opt => ({
                                label: opt.ProjectName,
                                value: String(opt.ProjectId)
                            }))}
                            value={String(tempFilters?.ProjectId ?? '')}
                            onChange={(value) => handleFilterChange('ProjectId', String(value))}
                        />
                    </div>

                    <div>
                        <Input type="text"
                            label='Company Name'
                            value={tempFilters?.CompanyName ?? ''}
                            onChange={e => handleFilterChange('CompanyName', e.target.value)}
                            placeholder="Enter Company Name" />
                    </div>

                    <div>
                        <Input type="text"
                            label='Department'
                            value={tempFilters?.Department ?? ''}
                            onChange={e => handleFilterChange('Department', e.target.value)}
                            placeholder="Enter Department" />
                    </div>

                    <div>
                        <Input type="text"
                            label='Approval Status'
                            value={tempFilters?.ApprovalStatus ?? ''}
                            onChange={e => handleFilterChange('ApprovalStatus', e.target.value)}
                            placeholder="Enter Approval Status" />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Material Requisition Type"
                            placeholder="Select Material Requisition Type"
                            value={tempFilters?.MaterialRequisitionType || ""}
                            options={[
                                { label: "Direct", value: "DIRECT" },
                                { label: "In - Direct", value: "IN - DIRECT" }
                            ]}
                            onChange={(value) =>
                                handleFilterChange('MaterialRequisitionType', String(value))
                            }
                        />
                    </div>


                    <div>
                        <SinglePageSelection
                            label="Requisition Status"
                            placeholder="Select Requisition Status"
                            value={tempFilters?.MaterialRequisitionStatus || ""}
                            options={MATERIAL_REQUISITION_STATUS_OPTIONS.map((status) => ({ label: status.name, value: status.id }))}
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

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Material Requisition'
                titleText={mrCode ?? ""}
                subTitleText={projectName ?? ""}
                subSubTitleText={createdBy ?? ""}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest} />

            <ApprovalActionModal
                title="Material Requisition"
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                titleText={mrCode ?? ""}
                subTitleText={projectName ?? ""}
                subSubTitleText={createdBy ?? ""}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />

        </div>
    )
}
export default MaterialRequisition;