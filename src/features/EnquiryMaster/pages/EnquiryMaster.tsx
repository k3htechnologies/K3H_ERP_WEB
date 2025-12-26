import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    DeleteEnquiryMasterRequest,
    EnquiryMasterData,
    FilterWithPaginationEnquiryMasterRequest
} from '@/features/EnquiryMaster/models/EnquiryMasterModel';
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import type { PaginationInfo } from "@/ui/components/Pagination/Pagination";
import useToast from "@/core/hooks/useToast";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { updateFilter } from "@/core/utils/filterHelper";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { runApiWithLoader } from "@/core/utils";
import { EnquiryMasterService } from "../services/EnquiryMasterServices";
import * as E from 'fp-ts/Either';
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Trash2 } from "lucide-react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";


export const EnquiryMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [EnquiryMasterList, setEnquiryMasterMasterList] = useState<EnquiryMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');

    // USE NAVIGATE
    const navigate = useNavigate();

    const { projectId } = useProject();
    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    //TABLE SORT INFO
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    // TOAST
    const { addToast } = useToast();

    // SINGLE SEARCH TEXT BOX
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchEnquiry(value)
    }, 350);

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    //DELETE ENQUIRY MASTER
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteEnquiryMasterData, setDeleteEnquiryMasterData] = useState<EnquiryMasterData | null>(null)

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeEnquiryColumnsModal, setIsShowCustomizeEnquiryColumnsModal] = useState(false);

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    const location = useLocation() as any;
    //#endregion

    //#region INIT
    
    useEffect(() => {
        const incoming = location.state?.listState;
        const listState = incoming ?? {
            page: 1, filters: {} as FilterInfo,
            sortInfo: undefined,
            searchTerm: ''
        };

        setPagination({ currentPage: listState.page ?? pagination.currentPage });

        setSortInfo(listState.sortInfo);

        setFilters(listState.filters ?? {});

        setTempFilters(listState.filters ?? {});

        setSearchTerm(listState.searchTerm ?? '');

        if (listState.searchTerm && String(listState.searchTerm).trim()) {

            loadEnquiry(listState.page ?? 1, {

                Name: String(listState.searchTerm).trim()
            });
            return;
        }

        loadEnquiry(listState.page ?? 1, listState.filters ?? {});
    }, [location.state]);

    //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const fetchEnquiryMasterList = async (page: number = pagination.currentPage) => {

        return await loadEnquiry(page, filters);
    }
    const loadEnquiry = async (page: number, filterParams: FilterInfo) => {
        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,

            async () => {
                let sortByParam = undefined;

                if (sortInfo) {
                    const column = EnquiryMasterColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }
                const params: FilterWithPaginationEnquiryMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    Name: filterParams.Name?.trim() || undefined,
                    EnquiryId: filterParams.EnquiryId ? Number(filterParams.EnquiryId) : undefined,
                    ProjectId: projectId || undefined,
                    Budget: filterParams.Budget?.trim() || undefined,
                    SortBy: sortByParam
                };
                const response = await EnquiryMasterService.apiCallPullEnquiryMaster(params);
                if (E.isRight(response)) {

                    setEnquiryMasterMasterList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Enquiry'
        );
    };
    //#endregion

    //#region SEARCH & CLEAR
    const searchEnquiry = async (searchValue: string) => {

        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {

            fetchEnquiryMasterList();

            return
        }
        const filterParams: FilterInfo = {
            Name: searchValue.trim(),
        };

        await loadEnquiry(1, filterParams);
    };

    //#endregion

    //#region CLEAR ENQUIRY MASTER 
    const clearSearchEnquiry = () => {
        setSearchTerm('');

        debouncedSearch.cancel?.();
        setFilters({});

        setTempFilters({});

        setPagination({ currentPage: 1 });

        loadEnquiry(1, {});
        try {
            navigate(location.pathname,
                {
                    replace: true,
                    state: {}
                });
        } catch {
        }
    };

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportEnquiry = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                let sortByParam;
                if (sortInfo) {
                    const column = EnquiryMasterColumns.find(col => col.key === sortInfo.column);
                    if (column) sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                }

                const params: FilterWithPaginationEnquiryMasterRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    Name: filters.Name?.trim() || undefined,
                    SortBy: sortByParam,
                    ExportType: exportType
                };

                const response = await getEnquiry(params);

                if (E.isRight(response)) {

                    handleExportFile(response.right.Data, exportType, 'Enquiry Master', addToast);

                } else {
                    addToast({ type: 'error', title: response.left.message || 'Export failed' });
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportEnquiryExcel = () => handleExportEnquiry('Excel')
    const handleExportEnquiryPdf = () => handleExportEnquiry('PDF')
    //#endregion

    //#region IMPORT EXCEL | DOWNLOAD

    const excelImportEnquiryMaster = async () => {

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,

            async () => {

                return null;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Import failed' })
            },
            undefined,
            'Preparing Import'
        )
    }

    const downloadExcelSampleEnquiryMaster = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                // Find the column label for sorting
                const params: FilterPullExcelSample = {
                    TableName: 'ENQUIRY'
                }

                const response = await technicalService.apiCallPullExcelSample(params);

                handleExportFile(response, 'Excel', 'Enquiry Master', addToast, 'Sample file download successfully')

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Downloading'
        )
    }

    const handleExcelImportEnquiryMaster = () => excelImportEnquiryMaster()
    const handleDownloadExcelSampleEnquiryMaster = () => downloadExcelSampleEnquiryMaster()
    //#endregion

    //#region API | SERVICES CALL TO GET ENQUIRY
    const getEnquiry = async (filterParams: FilterWithPaginationEnquiryMasterRequest) => {

        return await EnquiryMasterService.apiCallPullEnquiryMaster(filterParams);
    }
    //#endregion

    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((page: number) => {
        fetchEnquiryMasterList(page);
    }, []);

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sortInfo: SortInfo) => {

        setSortInfo(sortInfo);

        fetchEnquiryMasterList(1);

    }, []);

    //#region TABLE PAGINATION INFO
    const EnquiryPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const EnquiryForTable = useMemo(() => EnquiryMasterList, [EnquiryMasterList]);

    //#region NAVIGATE TO  VIEW ENQUIRY
    const handleNavigateToView = (row: EnquiryMasterData) => {
        navigate('/enquiry/view', {
            state: {
                editEnquiryData: row,
                listState: {
                    page: pagination.currentPage,
                    filters,
                    sortInfo,
                    searchTerm
                }
            }
        });
    };

    //#region NAVIGATE TO ADD ENQUIRY
    const handleAddEnquiryModal = useCallback(() => {
        navigate('/enquiry/add', {
            state: {
                fromList: true,
                listState: {
                    page: pagination.currentPage,
                    filters, sortInfo,
                    searchTerm
                }
            }
        });
    }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: EnquiryMasterData) => {
        setDeleteEnquiryMasterData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    //#region TABLE COLUMNS
    const EnquiryMasterColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'Name',
            label: 'Enquiry Name',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'ProjectName',
            label: 'Project Name',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="150px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'Requirement',
            label: 'Requirement',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="150px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'FinalStage',
            label: 'Final Stage',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'Source',
            label: 'Source',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="120px"
                    tooltipThreshold={12}
                />
            )
        },
        {
            key: 'NextFollowUpDate',
            label: 'Next Follow-Up Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : 'N/A'
        },
        {
            key: 'EnquiryDate',
            label: 'Enquiry Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : 'N/A'
        },

        {
            key: 'actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => (
                canAction ? (
                    <div className="flex items-center justify-center gap-2">

                        <Button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleConfirmationDialogBoxOpen(row)
                            }}
                            color='transparent'
                            isborderRadius
                            size='sm'
                            style={{
                                color: 'red',
                                padding: '4px 8px'
                            }}
                            title="Delete Enquiry"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null
            )
        }
    ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);
    //#endregion

    //#region COLUMN CUSTOMIZATION
    const requiredEnquiryColumnKeys: string[] = ['Name'];

    const allEnquiryColumnKeys: string[] = EnquiryMasterColumns.map(c => c.key);

    const [selectedEnquiryColumnKeys, setSelectedEnquiryColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getEnquiryMasterTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]
                // Ensure required columns are always present

                const withRequired = Array.from(new Set([...parsed, ...requiredEnquiryColumnKeys]));

                // Filter out any keys that no longer exist

                return withRequired.filter(k => allEnquiryColumnKeys.includes(k));
            }
        } catch { }
        return allEnquiryColumnKeys;
    });

    useEffect(() => {
        setSelectedEnquiryColumnKeys(prev => Array.from(new Set([...prev, ...requiredEnquiryColumnKeys])).filter(k => allEnquiryColumnKeys.includes(k)));

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [EnquiryMasterColumns.length])

    const visibleEnquiryColumns = useMemo(
        () => EnquiryMasterColumns.filter(col => selectedEnquiryColumnKeys.includes(col.key)),
        [EnquiryMasterColumns, selectedEnquiryColumnKeys]
    );
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        loadEnquiry(1, tempFilters);
        setShowFilterPopup(false);
    };
    //#endregion

    //#region CLEAR FILTER
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});

        // reset page
        setPagination({ currentPage: 1 });

        // load empty filters
        loadEnquiry(1, {});

        setShowFilterPopup(false);
        // clear router state (very important)

        navigate(location.pathname,
            {
                replace: true,
                state: {}
            });
    };
    //#endregion

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region DELETE ENQUIRY MASTER
    const handleDeleteEnquiryMaster = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteEnquiryMasterData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteEnquiryMasterRequest = {

                    EnquiryId: deleteEnquiryMasterData.EnquiryId || 0,

                    ProjectId: deleteEnquiryMasterData.ProjectId || 0,

                    Uniquekey: deleteEnquiryMasterData.Uniquekey || ""
                };

                const response = await EnquiryMasterService.apiCallDeleteEnquiryMaster(params);

                if (E.isRight(response)) {

                    setEnquiryMasterMasterList(prevData => prevData.filter(item => item.EnquiryId !== deleteEnquiryMasterData?.EnquiryId));

                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteEnquiryMasterData(null);

                } else {

                    addToast({ type: 'error', title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);

                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Enquiry"
        );
    };

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Enquiry Name"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchEnquiry}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeEnquiryColumnsModal(true)}

                //Add
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddEnquiryModal}

                // IMPORT
                isShowImportButton={canAction}
                onUploadExcel={handleExcelImportEnquiryMaster}
                onDownloadSampleExcel={handleDownloadExcelSampleEnquiryMaster}

                //EXPORT
                isShowExportButton={canExport}
                onExportExcel={handleExportEnquiryExcel}
                onExportPdf={handleExportEnquiryPdf}
                exportLoading={isLoading}
            />

            {/* DATA TABLE ENQUIRY*/}
            <DataTable
                data={EnquiryForTable}
                columns={visibleEnquiryColumns}
                pagination={EnquiryPaginationInfo}
                emptyMessage="No Enquiry Data Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* CUSTOMIZE COLUMNS MODAL */}

            <CustomizeColumnsModal
                isOpen={isShowCustomizeEnquiryColumnsModal}
                onClose={() => setIsShowCustomizeEnquiryColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredEnquiryColumnKeys])
                    );
                    setSelectedEnquiryColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeEarningMasterTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={EnquiryMasterColumns}
                selectedKeys={selectedEnquiryColumnKeys}
                requiredKeys={requiredEnquiryColumnKeys}
                title="Customize Table Columns"
            />
            {/* FILTER MODAL */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Enquiry Master"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply Filter"
                cancelText="Clear Filter"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Input type="text"
                            label="Enquiry Name"
                            value={tempFilters?.Name ?? ''}
                            onChange={e => handleFilterChange('Name', e.target.value)}
                            placeholder="Enter Enquiry Name" />
                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION ENQUIRY MODAL */}
            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => setIsConfirmationDialogBoxOpen(false)}
                onConfirm={handleDeleteEnquiryMaster}
                title="You are about to delete this Enquiry?"
                message="Deleting this Enquiry will permanently remove its data."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
            />
        </div>
    );
}
export default EnquiryMaster;