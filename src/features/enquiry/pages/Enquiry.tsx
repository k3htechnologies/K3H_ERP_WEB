import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    DeleteEnquiryRequest,
    EnquiryData,
    FilterWithPaginationEnquiryRequest
} from '@/features/enquiry/models/EnquiryModel';
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
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
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { runApiWithLoader } from "@/core/utils";
import { EnquiryService } from "@/features/enquiry/services/EnquiryServices";
import * as E from 'fp-ts/Either';
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Copy, Trash2 } from "lucide-react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { useEnquiryListState } from "@/features/enquiry/context/EnquiryListStateContext";
import { getStatusColor } from "./Status";
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { SOURCE_TYPE_OPTIONS, SUB_SUB_SOURCE_CHANNEL_PARTNER_OPTIONS, SUB_SUB_SOURCE_TYPE_OPTIONS, SUBSOURCE_TYPE_OPTIONS } from "@/core/constants/staticData";
import { copyToClipboard } from "@/core/utils/comman";

export const Enquiry: React.FC = () => {

    //#region STATE MANAGEMENT
    const [EnquiryList, setEnquiryMasterList] = useState<EnquiryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

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

    //MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    const { listState, updateListState, resetFilters } = useEnquiryListState();
    const { page, filters, sortInfo, searchTerm } = listState;
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const loadEnquiry = useCallback(async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {

                const params: FilterWithPaginationEnquiryRequest = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,

                    ProjectId: Number(projectId),
                    EnquiryId: filterParams.EnquiryId ? Number(filterParams.EnquiryId) : undefined,

                    SystemGeneratedCode: filterParams.SystemGeneratedCode?.trim() || undefined,
                    Name: filterParams.Name?.trim() || undefined,
                    MobileNumber: filterParams.MobileNumber || undefined,
                    Budget: filterParams.Budget?.trim() || undefined,
                    RequirementType: filterParams.RequirementType || undefined,

                    Source: filterParams.Source || undefined,
                    SubSource: filterParams.SubSource || undefined,
                    SubSubSource: filterParams.SubSubSource || undefined,
                    ChannelPartnerMobileNumber: filterParams.ChannelPartnerMobileNumber?.trim() || undefined,

                    Nationality: filterParams.Nationality?.trim() || undefined,
                    CurrentLocation: filterParams.CurrentLocation?.trim() || undefined,
                    CustomerClassification: filterParams.CustomerClassification?.trim() || undefined,
                    Ethnicity: filterParams.Ethnicity?.trim() || undefined,

                    SalesAdvisor: filterParams.SalesAdvisor?.trim() || undefined,
                    SourcingManager: filterParams.SourcingManager?.trim() || undefined,

                    FromDate: filterParams.FromDate || undefined,
                    ToDate: filterParams.ToDate || undefined,

                    Accommodation: filterParams.Accommodation?.trim() || undefined,

                    Stage: filterParams.Stage || undefined,
                    EnquiryFollowUpDays: filterParams.EnquiryFollowUpDays || undefined,
                    FinalStage: filterParams.FinalStage || undefined,

                    SortBy: getSortByParam(sortInfo ?? null, EnquiryColumns)
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

        if (searchTerm && searchTerm.trim()) {

            loadEnquiry(page, { Name: searchTerm.trim() }, sortInfo);

        } else {

            loadEnquiry(page, filters, sortInfo);

        }
    }, [projectId, page, filters, sortInfo, searchTerm, loadEnquiry]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    useEffect(() => {
        setTempFilters(filters);
    }, [filters]);

    //#endregion

    //#region SEARCH & CLEAR
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const trimmed = value.trim();

        if (trimmed === '') {
            updateListState({ searchTerm: '', page: 1 });
            return;
        }

        updateListState({ searchTerm: trimmed, page: 1 });
    }, 350);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.();
        };
    }, [debouncedSearch]);

    const handleSearchEnquiry = (searchValue: string) => {
        updateListState({ searchTerm: searchValue });
        debouncedSearch(searchValue);
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
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationEnquiryRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,

                    SystemGeneratedCode: filters.SystemGeneratedCode?.trim() || undefined,
                    Name: filters.Name?.trim() || undefined,
                    MobileNumber: filters.MobileNumber || undefined,
                    Budget: filters.Budget?.trim() || undefined,
                    RequirementType: filters.RequirementType || undefined,

                    Source: filters.Source || undefined,
                    SubSource: filters.SubSource || undefined,
                    SubSubSource: filters.SubSubSource || undefined,
                    ChannelPartnerMobileNumber: filters.ChannelPartnerMobileNumber?.trim() || undefined,

                    Nationality: filters.Nationality?.trim() || undefined,
                    CurrentLocation: filters.CurrentLocation?.trim() || undefined,
                    CustomerClassification: filters.CustomerClassification?.trim() || undefined,
                    Ethnicity: filters.Ethnicity?.trim() || undefined,

                    SalesAdvisor: filters.SalesAdvisor?.trim() || undefined,
                    SourcingManager: filters.SourcingManager?.trim() || undefined,

                    FromDate: filters.FromDate || undefined,
                    ToDate: filters.ToDate || undefined,

                    Accommodation: filters.Accommodation?.trim() || undefined,

                    Stage: filters.Stage || undefined,
                    EnquiryFollowUpDays: filters.EnquiryFollowUpDays || undefined,
                    FinalStage: filters.FinalStage || undefined,

                    SortBy: getSortByParam(sortInfo ?? null, EnquiryColumns),
                    ExportType: exportType,
                    ProjectId: Number(projectId)
                };

                const response = await EnquiryService.apiCallPullEnquiry(params);

                handleExportFile(response, exportType, 'Enquiry Master', addToast);
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
            label: 'Enquiry Code',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value) => {
                return (
                    <div className="flex items-center gap-2">

                        <TooltipText
                            text={value || '-'}
                            maxWidth="150px"
                            tooltipThreshold={20}
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                        />

                        {value && (
                            <Button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const success = await copyToClipboard(value);
                                    if (success) {
                                        addToast({ type: 'success', title: `${value} Copied!`});
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
            key: 'Name',
            label: 'Name',
            sortable: true,
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
            key: 'MobileNumber',
            label: 'Mobile Number',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value ? `+91 ${value}` : '-'

        },
        {
            key: 'EnquiryDate',
            label: 'Enquiry Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
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
            key: 'NextFollowUpDate',
            label: 'Next Follow-Up Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'FinalStage',
            label: 'Stage',
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
            label: 'Email-Id',
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
            key: 'Timeline',
            label: 'Timeline',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Ethnicity',
            label: 'Ethnicity',
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
            key: 'SubSubSource',
            label: 'Sub Sub Source',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value, row) => row?.Source === 'Channel Partner' ? '-' : value || '-'
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
            render: value => value ? `+91 ${value}` : '-'
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
            key: 'Nationality',
            label: 'Nationality',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'DateOfBirth',
            label: 'Date Of Birth',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
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
            key: 'SourceOfFunding',
            label: 'Source Of Funding',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'FinalStageDetail',
            label: 'Stage Detail',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
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
            key: 'Actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {

                const canDelete = canAction && row?.FinalStage?.toUpperCase() == "";

                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!canDelete) return;
                                handleConfirmationDialogBoxOpen(row)
                            }}
                            color="transparent"
                            isborderRadius
                            disabled={!canDelete}
                            size="sm"
                            style={{
                                color: canDelete ? 'red' : '#9CA3AF',
                                padding: '4px 8px',
                                cursor: canDelete ? 'pointer' : 'not-allowed',
                                opacity: canDelete ? 1 : 0.5
                            }}
                            title="Delete Enquiry"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            }
        }

    ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);
    //#endregion

    //#region COLUMN CUSTOMIZATION
    const requiredEnquiryColumnKeys: string[] = ['Name', 'Actions'];

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

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        resetFilters();
    };
    //#endregion

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string | null) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region DELETE ENQUIRY MASTER
    const handleDeleteEnquiry = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteEnquiryData) return;

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Name"
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
                isShowImportButton={false}

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
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-6">
                    <div>
                        <Input type="text" label="Enquiry Code" value={tempFilters?.SystemGeneratedCode ?? ''} onChange={e => handleFilterChange('SystemGeneratedCode', e.target.value)} placeholder="Enter System Code" />
                    </div>

                    <div>
                        <Input type="text" label="Enquiry Name" value={tempFilters?.Name ?? ''} onChange={e => handleFilterChange('Name', e.target.value)} placeholder="Enter Enquiry Name" />
                    </div>

                    <div>
                        <Input type="text" label="Mobile Number" value={tempFilters?.MobileNumber ?? ''} onChange={e => handleFilterChange('MobileNumber', e.target.value)} placeholder="Enter Mobile Number" />
                    </div>

                    <div>
                        <Input type="text" label="Budget" value={tempFilters?.Budget ?? ''} onChange={e => handleFilterChange('Budget', e.target.value)} placeholder="Enter Budget" />
                    </div>

                    <div>
                        <Input type="text" label="Requirement Type" value={tempFilters?.RequirementType ?? ''} onChange={e => handleFilterChange('RequirementType', e.target.value)} placeholder="Enter Requirement Type" />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Source"
                            placeholder="Select Source"
                            value={tempFilters.Source || ''}
                            onChange={e => handleFilterChange('Source', String(e))}
                            options={SOURCE_TYPE_OPTIONS.map(opt => ({
                                label: opt.name,
                                value: opt.id
                            }))}
                        />

                    </div>
                    {/* SUB SOURCE */}
                    {tempFilters.Source === 'Direct Walking' && (
                        <div>
                            <SinglePageSelection
                                label="Sub Source"
                                placeholder="Select Sub Source"
                                value={tempFilters.SubSource || ''}
                                onChange={e => handleFilterChange('SubSource', String(e))}
                                options={SUBSOURCE_TYPE_OPTIONS.map(opt => ({
                                    label: opt.name,
                                    value: opt.id
                                }))}
                            />
                        </div>
                    )}

                    {/* SUB SUB SOURCE */}
                    {tempFilters.Source === 'Direct Walking' &&
                        tempFilters.SubSource === 'Advertisement' && (
                            <div>
                                <SinglePageSelection
                                    label="Sub Sub Source"
                                    placeholder="Select Sub Sub Source"
                                    value={tempFilters.SubSubSource || ''}
                                    onChange={e => handleFilterChange('SubSubSource', String(e))}
                                    options={SUB_SUB_SOURCE_TYPE_OPTIONS.map(opt => ({
                                        label: opt.name,
                                        value: opt.id
                                    }))}
                                />
                            </div>
                        )}

                    {/* CHANNEL PARTNER SUB SOURCE */}
                    {tempFilters.Source === 'Channel Partner' && (
                        <div>
                            <SinglePageSelection
                                label="Sub Source"
                                placeholder="Select Sub Source"
                                value={tempFilters.SubSource || ''}
                                onChange={e => handleFilterChange('SubSource', String(e))}
                                options={SUB_SUB_SOURCE_CHANNEL_PARTNER_OPTIONS.map(opt => ({
                                    label: opt.name,
                                    value: opt.id
                                }))}
                            />
                        </div>
                    )}

                    <div>
                        <Input type="text" label="Channel Partner Mobile" value={tempFilters?.ChannelPartnerMobileNumber ?? ''} onChange={e => handleFilterChange('ChannelPartnerMobileNumber', e.target.value)} placeholder="Enter Channel Partner Mobile" />
                    </div>

                    <div>
                        <Input type="text" label="Nationality" value={tempFilters?.Nationality ?? ''} onChange={e => handleFilterChange('Nationality', e.target.value)} placeholder="Enter Nationality" />
                    </div>

                    <div>
                        <Input type="text" label="Current Location" value={tempFilters?.CurrentLocation ?? ''} onChange={e => handleFilterChange('CurrentLocation', e.target.value)} placeholder="Enter Current Location" />
                    </div>

                    <div>
                        <Input type="text" label="Customer Classification" value={tempFilters?.CustomerClassification ?? ''} onChange={e => handleFilterChange('CustomerClassification', e.target.value)} placeholder="Enter Classification" />
                    </div>

                    <div>
                        <Input type="text" label="Ethnicity" value={tempFilters?.Ethnicity ?? ''} onChange={e => handleFilterChange('Ethnicity', e.target.value)} placeholder="Enter Ethnicity" />
                    </div>

                    <div>
                        <Input type="text" label="Sales Advisor" value={tempFilters?.SalesAdvisor ?? ''} onChange={e => handleFilterChange('SalesAdvisor', e.target.value)} placeholder="Enter Sales Advisor" />
                    </div>

                    <div>
                        <Input type="text" label="Sourcing Manager" value={tempFilters?.SourcingManager ?? ''} onChange={e => handleFilterChange('SourcingManager', e.target.value)} placeholder="Enter Sourcing Manager" />
                    </div>

                    <div>
                        <DatePickerInput
                            label="From Date"
                            value={formatDate_dd_mm_yyyy(tempFilters.FromDate)}
                            onChange={(val) => handleFilterChange('FromDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}

                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="To Date"
                            value={formatDate_dd_mm_yyyy(tempFilters.ToDate)}
                            onChange={(val) => handleFilterChange('ToDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        />
                    </div>

                    <div>
                        <Input type="text" label="Accommodation" value={tempFilters?.Accommodation ?? ''} onChange={e => handleFilterChange('Accommodation', e.target.value)} placeholder="Enter Accommodation" />
                    </div>

                    <div>
                        <Input type="text" label="Follow Up Days" value={tempFilters?.EnquiryFollowUpDays ?? ''} onChange={e => handleFilterChange('EnquiryFollowUpDays', e.target.value)} placeholder="Enter Follow Up Days" />
                    </div>

                    <div>
                        <Input type="text" label="Final Stage" value={tempFilters?.FinalStage ?? ''} onChange={e => handleFilterChange('FinalStage', e.target.value)} placeholder="Enter Final Stage" />
                    </div>

                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => setIsConfirmationDialogBoxOpen(false)}
                onConfirm={handleDeleteEnquiry}
                loading={isLoading}
                pageName='Enquiry'
                message={`Deleting this Enquiry ${deleteEnquiryData?.SystemGeneratedCode} will permanently remove all associated data.`}

            />
        </div>
    );
}
export default Enquiry;