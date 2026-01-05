import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    DeleteEnquiryRequest,
    EnquiryData,
    FilterWithPaginationEnquiryRequest
} from '@/features/enquiry/models/EnquiryModel';
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import { useNavigate } from "react-router-dom";
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
import { EnquiryService } from "../services/EnquiryServices";
import * as E from 'fp-ts/Either';
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Trash2 } from "lucide-react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { useEnquiryListState } from "@/features/enquiry/context/EnquiryListStateContext";
import { getStatusColor } from "./Status";


export const Enquiry: React.FC = () => {

    //#region STATE MANAGEMENT
    const [EnquiryList, setEnquiryMasterList] = useState<EnquiryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');

    // USE NAVIGATE
    const navigate = useNavigate();

    const { projectId } = useProject();

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    // TOAST
    const { addToast } = useToast();

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    //DELETE ENQUIRY MASTER
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteEnquiryData, setDeleteEnquiryData] = useState<EnquiryData | null>(null)

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeEnquiryColumnsModal, setIsShowCustomizeEnquiryColumnsModal] = useState(false);

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    //#region ENQUIRY LIST STATE CONTEXT
    const { listState, updateListState, resetFilters, clearEnquiryContext } = useEnquiryListState();
    const { page, filters, sortInfo, searchTerm } = listState;
    //#endregion

    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const loadEnquiry = useCallback(async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,

            async () => {
                let sortByParam: string | undefined;
                if (sortInfo) {
                    const column = EnquiryColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }
                const params: FilterWithPaginationEnquiryRequest = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    Name: filterParams.Name?.trim() || undefined,
                    EnquiryId: filterParams.EnquiryId ? Number(filterParams.EnquiryId) : undefined,
                    ProjectId: Number(projectId),
                    Budget: filterParams.Budget?.trim() || undefined,
                    SortBy: sortByParam
                };
                const response = await EnquiryService.apiCallPullEnquiry(params);

                if (E.isRight(response)) {

                    setEnquiryMasterList(response.right.Data);

                    setPagination({
                        currentPage: pageNum,
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
    }, [projectId, pagination.pageSize, addToast]);

    //#endregion

    //#region INIT

    useEffect(() => {
        if (!projectId) return;

        // clearEnquiryContext();

        if (searchTerm && searchTerm.trim()) {
            loadEnquiry(page, { Name: searchTerm.trim() }, sortInfo);
        } else {
            loadEnquiry(page, filters, sortInfo);
        }
    }, [projectId, page, filters, sortInfo, searchTerm, clearEnquiryContext, loadEnquiry]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    useEffect(() => {
        setTempFilters(filters);
    }, [filters]);

    //#endregion

    //#region SEARCH & CLEAR
    const debouncedSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {
        let filterParams: FilterInfo = {};

        if (value.trim() === '') {
            updateListState({ searchTerm: '', filters: {}, page: 1 });
            return;
        }

        if (isSerach) {

            filterParams = { BuildingName: value.trim() };
        }

        updateListState({ searchTerm: value, filters: filterParams, page: 1 });
    }, 350);

    const handleSearchEnquiry = (searchValue: string) => {
        updateListState({ searchTerm: searchValue });
        debouncedSearch(searchValue, false);
    };
    //#endregion

    //#region CLEAR ENQUIRY MASTER 
    const clearSearchEnquiry = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        setTempFilters({});
    };

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportEnquiry = async (exportType: 'Excel' | 'PDF') => {

        await runApiWithLoader(

            setIsLoading,
            setIsLoadingMessage,
            async () => {

                let sortByParam;
                if (sortInfo) {
                    const column = EnquiryColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }
                const params: FilterWithPaginationEnquiryRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    Name: filters.Name?.trim() || undefined,
                    SortBy: sortByParam,
                    ExportType: exportType,
                    ProjectId: Number(projectId)
                };

                const response = await EnquiryService.apiCallPullEnquiry(params);

                handleExportFile(response, exportType, 'Enquiry', addToast);
                return response
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

    const excelImportEnquiry = async () => {

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

    const downloadExcelSampleEnquiry = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                // Find the column label for sorting
                const params: FilterPullExcelSample = {
                    TableName: 'ENQUIRY'
                }

                const response = await technicalService.apiCallPullExcelSample(params);

                handleExportFile(response, 'Excel', 'Enquiry', addToast, 'Sample file download successfully')

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

    const handleExcelImportEnquiry = () => excelImportEnquiry()
    const handleDownloadExcelSampleEnquiry = () => downloadExcelSampleEnquiry()
    //#endregion


    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [updateListState]);

    //#region TABLE SORT COLUMN

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
    }, [updateListState]);

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
    const EnquiryForTable = useMemo(() => EnquiryList, [EnquiryList]);

    //#region NAVIGATE TO  VIEW ENQUIRY
    const handleNavigateToView = useCallback((row: EnquiryData) => {
        updateListState({
            enquiryId: row.EnquiryId ?? 0,
            enquiryName: row.Name ?? '',
        });
        navigate('/enquiry/view');
    }, [navigate, updateListState]);

    //#region NAVIGATE TO ADD ENQUIRY
    const handleAddEnquiryModal = useCallback(() => {
        navigate('/enquiry/add');
    }, [navigate]);
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: EnquiryData) => {

        setDeleteEnquiryData(row)

        setIsConfirmationDialogBoxOpen(true)
    }, [])

    //#region TABLE COLUMNS
    const EnquiryColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'SystemGeneratedCode',
            label: 'Unique Code',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: value => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="140px"
                    tooltipThreshold={14}
                    tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                />
            )
        },
        {
            key: 'Name',
            label: 'Name',
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
            key: 'MobileNumber',
            label: 'Mobile Number',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value ? `+91 ${value}` : '-'

        },
        {
            key: 'EnquiryFollowUpDays',
            label: 'Enquiry Follow Up Days',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'FinalStage',
            label: 'Final Stage',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value) => {
                const { bg, text } = getStatusColor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            }
        },
        {
            key: 'EmailId',
            label: 'Email Id',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'OccupationType',
            label: 'Occupation Type',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Accommodation',
            label: 'Accommodation',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Budget',
            label: 'Budget (In CR)',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Requirement',
            label: 'Requirement',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'RequirementType',
            label: 'Requirement Type',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'AreaPreferred',
            label: 'Area Preferred',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'PossessionType',
            label: 'Possession Type',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Source',
            label: 'Source',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'SubSource',
            label: 'Sub Source',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Nationality',
            label: 'Nationality',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Age',
            label: 'Age',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'DesiredFloorBand',
            label: 'Desired Floor Band',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'NeighborhoodPlacesInterestedIn',
            label: 'Neighborhood Places',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'SourceOfFunding',
            label: 'Source Of Funding',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'CustomerClassification',
            label: 'Customer Classification',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'ChannelPartnerName',
            label: 'Channel Partner Name',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ChannelPartnerCompany',
            label: 'Channel Partner Company',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ChannelPartnerMobileNumber',
            label: 'Channel Partner Mobile No',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'FinalStageDetail',
            label: 'Final Stage Detail',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
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
            key: 'SalesAdvisor',
            label: 'Sales Advisor',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'SourcingManager',
            label: 'Sourcing Manager',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'PresalesExecutive',
            label: 'Presales Executive',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
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

    const allEnquiryColumnKeys: string[] = EnquiryColumns.map(c => c.key);

    const [selectedEnquiryColumnKeys, setSelectedEnquiryColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getEnquiryTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredEnquiryColumnKeys]));

                return withRequired.filter(k => allEnquiryColumnKeys.includes(k));
            }
        } catch { }
        return allEnquiryColumnKeys;
    });

    useEffect(() => {
        setSelectedEnquiryColumnKeys(prev => Array.from(new Set([...prev, ...requiredEnquiryColumnKeys])).filter(k => allEnquiryColumnKeys.includes(k)));
    }, [EnquiryColumns.length])

    const visibleEnquiryColumns = useMemo(
        () => EnquiryColumns.filter(col => selectedEnquiryColumnKeys.includes(col.key)),
        [EnquiryColumns, selectedEnquiryColumnKeys]
    );
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        setShowFilterPopup(false);
    };
    //#endregion

    //#region CLEAR FILTER
    const clearFilters = () => {
        setTempFilters({});
        resetFilters();
        setShowFilterPopup(false);
    };
    //#endregion

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region DELETE ENQUIRY MASTER
    const handleDeleteEnquiry = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteEnquiryData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteEnquiryRequest = {

                    EnquiryId: deleteEnquiryData.EnquiryId || 0,

                    ProjectId: Number(projectId),

                    Uniquekey: deleteEnquiryData.Uniquekey || ""
                };

                const response = await EnquiryService.apiCallDeleteEnquiry(params);

                if (E.isRight(response)) {

                    setEnquiryMasterList(prevData => prevData.filter(item => item.EnquiryId !== deleteEnquiryData?.EnquiryId));

                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteEnquiryData(null);

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
                searchPlaceholder="Search By Full Name"
                onSearchChange={handleSearchEnquiry}
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
                isShowAddButton={canAction && Number(projectId) > 0}
                addTitle="Add"
                onAdd={handleAddEnquiryModal}

                // IMPORT
                isShowImportButton={canAction}
                onUploadExcel={handleExcelImportEnquiry}
                onDownloadSampleExcel={handleDownloadExcelSampleEnquiry}

                //EXPORT
                isShowExportButton={canExport && EnquiryForTable.length > 0}
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
                        LocalStorageHelper.storeEnquiryTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={EnquiryColumns}
                selectedKeys={selectedEnquiryColumnKeys}
                requiredKeys={requiredEnquiryColumnKeys}
                title="Customize Table Columns"
            />
            {/* FILTER MODAL */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Enquiry"
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
                            label="Full Name"
                            value={tempFilters?.Name ?? ''}
                            onChange={e => handleFilterChange('Name', e.target.value)}
                            placeholder="Enter Full Name" />
                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION ENQUIRY MODAL */}
            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => setIsConfirmationDialogBoxOpen(false)}
                onConfirm={handleDeleteEnquiry}
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
export default Enquiry;