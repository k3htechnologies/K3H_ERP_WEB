import usePagination from "@/core/hooks/usePagination";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import * as E from 'fp-ts/Either';
import type { PaginationInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { Loader } from "@/core/utils/loader";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { inwardOutwardService } from "@/features/inwardOutward/services/InwardOutwardService";
import type { DeleteInwardAndOutWardRequest, FilterWithPaginationInwardAndOutWardRequest, InwardAndOutWardData } from "@/features/inwardOutward/models/InwardOutwardModel";
import { useInwardOutwardListState } from "../context/InwardOutwardListStateContext";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { updateFilter } from "@/core/utils/filterHelper";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Trash2 } from "lucide-react";
import Tabs from "@/ui/components/Tab/Tab";
import { getInwardOutwardStatusColor } from "@/features/inwardOutward/utils/Status";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { getPriorityStatusColor } from "../utils/PriorityStatus";

export const InwardOutward: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [inwardOutwardDataList, setInwardOutwardDataList] = useState<InwardAndOutWardData[]>([]);

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    // TOAST
    const { addToast } = useToast();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    const location = useLocation() as any;
    //#endregion

    // USE NAVIGATE
    const navigate = useNavigate();

    //DELETE INWARD OUTWARD
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteInwardOutwardData, setDeleteInwardOutwardData] = useState<InwardAndOutWardData | null>(null);

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeInwardOutwardColumnsModal, setIsShowCustomizeInwardOutwardColumnsModal] = useState(false);

    //#region TAB ACTIVITY
    const InwardOutwardTabList = [
        { id: "All", label: "All" },
        { id: "Inward", label: "Inward" },
        { id: "Outward", label: "Outward" },
    ];

    const [activeTab, setActiveTab] = useState<string>(InwardOutwardTabList[0].id);

    // CONTEXT STATE
    const { listState, updateListState } = useInwardOutwardListState();
    const { searchTerm, filters, sortInfo } = listState;

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchInwardOutward(value)
    }, 350);

    //#region INIT
    useEffect(() => {
        setPagination({ currentPage: listState.page });

        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadInwardOutward(listState.page, { Name: String(listState.searchTerm).trim() }, listState.sortInfo);
        } else {
            loadInwardOutward(listState.page, listState.filters, listState.sortInfo);
        }
    }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);
    //#endregion

    //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])
    //#endregion

    //#region FETCH INWARD OUTWARD
    const fetchInwardOutwardList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadInwardOutward(page, filters, sort);
    }
    const loadInwardOutward = async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationInwardAndOutWardRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    InwardOutwardId: filterParams.InwardOutwardId ? Number(filterParams.InwardOutwardId) : undefined,
                    SenderName: searchtext ?? filterParams.SenderName?.trim() ?? undefined,
                    ReceiverName: filterParams.ReceiverName ?? undefined,
                    DeliveryType: filterParams.DeliveryType ?? undefined,
                    SortBy: getSortByParam(sort ?? null, InwardOutwardDataColumns),
                }

                const response = await inwardOutwardService.apiCallPullInwardOutward(params);

                if (E.isRight(response)) {
                    setInwardOutwardDataList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Inward Outward Data'
        );
        [pagination.currentPage, pagination.pageSize, addToast, setPagination]
    };
    //#endregion

    //#region NAVIGATE TO  VIEW INWARD OUTWARD
    const handleNavigateToView = (row: InwardAndOutWardData) => {
        updateListState({
            InwardOutwardId: row.InwardOutwardId,
            DocumentTitle: row.DocumentTitle ?? '',
        });
        navigate('/inwardOutward/view');
    };
    //#endregion

    //#region NAVIGATE TO ADD INWARD OUTWARD
    const handleAddInwardOutward = useCallback(() => {
        navigate('/inwardOutward/add', {
            state: {
                fromList: true
            }
        });
    }, [navigate]);
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: InwardAndOutWardData) => {
        setDeleteInwardOutwardData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);
    //#endregion

    //#region INWARD OUTWARD TABLE COLUMNS
    const InwardOutwardDataColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'SystemGeneratedCode',
            label: 'Document ID',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    tooltipThreshold={20}
                    maxWidth="180px"
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'DocumentTitle',
            label: 'Title',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'DocumentType',
            label: 'Type',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'SenderName',
            label: 'Sender Name',
            width: '15',
            sortable: true,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'SenderEmailId',
            label: 'Sender Email Id',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'SenderMobileNo',
            label: 'Sender Mobile No',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value ? `+91 ${value}` : '-'

        },
        {
            key: 'SenderAddress',
            label: 'Sender Address',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'ReceiverName',
            label: 'Receiver Name',
            width: '15',
            sortable: true,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'ReceiverEmailId',
            label: 'Receiver Email Id',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'ReceiverMobileNo',
            label: 'Receiver Mobile No',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value ? `+91 ${value}` : '-'
        },
        {
            key: 'ReceiverAddress',
            label: 'Receiver Address',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'InwardOutwardDate',
            label: 'Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'Priority',
            label: 'Priority',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => {
                const { bg, text } = getPriorityStatusColor(value);
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
            key: 'Amount',
            label: 'Amount',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value ? `₹ ${value}` : '-'
        },
        {
            key: 'DeliveryMode',
            label: 'DeliveryMode',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'DeliveryType',
            label: 'Delivery Type',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'DeliveryStatus',
            label: 'Status',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => {
                const { bg, text } = getInwardOutwardStatusColor(value);
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
            key: 'EmployeeNames',
            label: 'Assigned To',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    tooltipThreshold={20}
                    maxWidth="180px"
                />
            )
        },
        {
            key: 'DepartmentName',
            label: 'Department Name',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    tooltipThreshold={20}
                    maxWidth="180px"
                />
            )
        },
        {
            key: 'InvoiceDate',
            label: 'Invoice Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '15',
            sortable: false,
            align: 'center',
            render: (_value, row) => {
                if (!canAction) return null;

                return (
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleConfirmationDialogBoxOpen(row);
                        }}
                        color="transparent"
                        isborderRadius
                        size="sm"
                        style={{
                            color: "red",
                            padding: "4px 8px",
                        }}
                        title="Delete Inward Outward"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                );
            }
        },
    ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);
    //#endregion

    //#region COLUMN CUSTOMIZATION
    const requiredInwardOutwardColumnKeys: string[] = ['SenderName', 'Actions'];

    const allInwardOutwardColumnKeys: string[] = InwardOutwardDataColumns.map(c => c.key);

    const [selectedInwardOutwardColumnKeys, setSelectedInwardOutwardColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getInwardOutwardTableColumns?.();
            if (saved) {

                const parsed = JSON.parse(saved) as string[]
                const withRequired = Array.from(new Set([...parsed, ...requiredInwardOutwardColumnKeys]));

                return withRequired.filter(k => allInwardOutwardColumnKeys.includes(k));
            }
        } catch { }
        return allInwardOutwardColumnKeys;
    });

    useEffect(() => {
        setSelectedInwardOutwardColumnKeys(prev => Array.from(new Set([...prev, ...requiredInwardOutwardColumnKeys])).filter(k => allInwardOutwardColumnKeys.includes(k)));
    }, [InwardOutwardDataColumns.length])

    const visibleInwardOutwardColumns = useMemo(
        () => InwardOutwardDataColumns.filter(col => selectedInwardOutwardColumnKeys.includes(col.key)),

        [InwardOutwardDataColumns, selectedInwardOutwardColumnKeys]
    );
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        loadInwardOutward(1, tempFilters, sortInfo);
        setShowFilterPopup(false);
    };
    //#endregion

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        updateListState({ filters: {}, page: 1, searchTerm: '', sortInfo: undefined });
        loadInwardOutward(1, {}, undefined);
        navigate(location.pathname, { replace: true, state: {} });
    };
    //#endregion

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region SEARCH & CLEAR
    const searchInwardOutward = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue, page: 1 });

        if (searchValue.trim() === '') {

            updateListState({ filters: {}, searchTerm: '' });
            fetchInwardOutwardList(1);
            return
        }
        await loadInwardOutward(1, filters, sortInfo, searchValue);
    };
    //#endregion

    //#region CLEAR INWARD OUTWARD 
    const clearSearchInwardOutward = () => {
        debouncedSearch.cancel?.();
        updateListState({ searchTerm: '', filters: {}, page: 1, sortInfo: undefined });
        setTempFilters({});
        loadInwardOutward(1, {}, undefined, undefined);
        try {
            navigate(location.pathname, {
                replace: true,
                state: {}
            });
        } catch {
        }
    };
    //#endregion

    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((page: number) => {

        updateListState({ page });
        fetchInwardOutwardList(page);
    }, [updateListState]);
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {

        updateListState({ sortInfo: sort, page: 1 });
        loadInwardOutward(1, filters, sort, searchTerm || undefined);
    }, [filters, searchTerm, updateListState]);
    //#endregion

    const InwardOutwardDataPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const InwardOutwardDataForTable = useMemo(() => inwardOutwardDataList, [inwardOutwardDataList]);
    //#endregion

    //#region DELETE INWARD OUTWARD
    const handleDeleteInwardOutward = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteInwardOutwardData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteInwardAndOutWardRequest = {
                    InwardOutwardId: deleteInwardOutwardData.InwardOutwardId || 0,
                    UniqueKey: deleteInwardOutwardData.UniqueKey || "",
                };

                const response = await inwardOutwardService.apiCallDeleteInwardOutward(params);

                if (E.isRight(response)) {
                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (
                        inwardOutwardDataList.length === 1 &&
                        pagination.currentPage > 1
                    ) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });
                    await loadInwardOutward(pageToShow, filters, sortInfo);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteInwardOutwardData(null);
                } else {
                    addToast({ type: "error", title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Deleting Inward Outward",
        );
    };
    //#endregion

    //#region 
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Sender Name"
                onSearchChange={v => {
                    updateListState({ searchTerm: v });
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchInwardOutward}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters || {});
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeInwardOutwardColumnsModal(true)}

                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddInwardOutward}
            />

            <div className="p-2">
                <Tabs
                    tabs={InwardOutwardTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                        if (t.id === "All") {
                            fetchInwardOutwardList();
                        } else if (t.id === "Inward") {
                            fetchInwardOutwardList();
                        }
                    }}
                />
            </div>

            {/* CUSTOMIZE COLUMNS MODAL */}

            <CustomizeColumnsModal
                isOpen={isShowCustomizeInwardOutwardColumnsModal}
                onClose={() => setIsShowCustomizeInwardOutwardColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(

                        new Set([...keys, ...requiredInwardOutwardColumnKeys])
                    );
                    setSelectedInwardOutwardColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeInwardOutwardTableColumns?.(

                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={InwardOutwardDataColumns}
                selectedKeys={selectedInwardOutwardColumnKeys}
                requiredKeys={requiredInwardOutwardColumnKeys}
                title="Customize Table Columns"
            />

            {/* FILTER INWARD OUTWARD MODAL */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Inward Outward"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}

                size="small-half">
                <div className="space-y-6">
                    <div>
                        <Input type="text"
                            label='Sender Name'
                            value={tempFilters?.SenderName ?? ''}
                            onChange={e => handleFilterChange('SenderName', e.target.value)}
                            placeholder="Enter Sender Name" />
                    </div>

                    <div>
                        <Input type="text"
                            label='Receiver Name'
                            value={tempFilters?.ReceiverName ?? ''}
                            onChange={e => handleFilterChange('ReceiverName', e.target.value)}
                            placeholder="Enter Receiver Name" />
                    </div>

                    <div>
                        <Input type="text"
                            label='Delivery Type'
                            value={tempFilters?.DeliveryType ?? ''}
                            onChange={e => handleFilterChange('DeliveryType', e.target.value)}
                            placeholder="Enter Delivery Type" />
                    </div>

                </div>
            </Modal>

            {/* DATA TABLE */}
            <DataTable
                data={InwardOutwardDataForTable}
                columns={visibleInwardOutwardColumns}
                pagination={InwardOutwardDataPaginationInfo}
                emptyMessage="No Inward Outward Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* DELETE CONFIRMATION INWARD OUTWARD MODAL */}
            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteInwardOutwardData(null);
                }}
                onConfirm={handleDeleteInwardOutward}
                loading={isLoading}
                pageName="Inward Outward"
            />
        </div>
    )
}
export default InwardOutward;
