import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import useToast from "@/core/hooks/useToast";
import { handleExportFile } from "@/core/utils/exportFile";
import { updateFilter } from "@/core/utils/filterHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import * as E from 'fp-ts/Either';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useNavigate } from "react-router-dom";
import type { BrokerageBookingData, FilterWithPaginationBrokerageBookingRequest } from "../models/BrokerageInvoiceModel";
import { brokerageInvoiceService } from "../services/BrokerageInvoiceService";
import { Button, Input } from "@/ui/components/forms";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";

export const Brokerage: React.FC = () => {

    // STATE
    const [BrokerageBookingList, setBrokerageBookingList] = useState<BrokerageBookingData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    //#region MENU PERMISSIONS
    const { canExport } = useMenuPermissions();
    //#endregion

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    // USE NAVIGATE
    const navigate = useNavigate();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    // TOAST
    const { addToast } = useToast();

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeBrokerageBookingColumnsModal, setIsShowCustomizeBrokerageBookingColumnsModal] = useState(false);

    //#region DATA LOADING | FETCH |  LOAD | SEARCH
    const loadBrokerageBooking = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBrokerageBookingRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    ChannelPartnerName: searchText?.trim() ?? undefined,
                    ApplicantMobileNumber: filterParams.ApplicantMobileNumber?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sort ?? null, BrokerageBookingColumns),
                };

                const response = await brokerageInvoiceService.apiCallPullBrokerageBooking(params);

                if (E.isRight(response)) {
                    setBrokerageBookingList(response.right.Data);
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
            'Loading Brokerage Booking'
        );
    },
        [projectId, pagination.pageSize, addToast, setPagination]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadBrokerageBooking(1, filters, sortInfo, searchTerm);
    }, [projectId]);
    //#endregion

    //#region SEARCH HANDLERS
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadBrokerageBooking(1, filters, sortInfo, value);
    };
    //#endregion

    //#region CLEAR HANDLERS
    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadBrokerageBooking(1, filters, sortInfo, '');
    };
    //#endregion

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadBrokerageBooking(page, filters, sortInfo, searchTerm);
    };
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadBrokerageBooking(1, filters, sort, searchTerm);
    }, [searchTerm]);
    //#endregion

    //#region NAVIGATE TO VIEW BROKERAGE INVOICE
    const handleViewBrokerageBookingDetails = useCallback((row: BrokerageBookingData) => {
        navigate(`/brokerageInvoice/view/${row.BookingId}`);

    }, [navigate]);
    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportBrokerageBooking = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBrokerageBookingRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    ApplicantName: filters.ApplicantName?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, BrokerageBookingColumns),
                    ExportType: exportType
                };
                const response = await brokerageInvoiceService.apiCallPullBrokerageBooking(params);

                handleExportFile(response, exportType, 'Brokerage Booking', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportBrokerageBookingExcel = () => handleExportBrokerageBooking('Excel')
    const handleExportBrokerageBookingPdf = () => handleExportBrokerageBooking('PDF')
    //#endregion

    //#region BROKERAGE BOOKING TABLE COLUMNS
    const BrokerageBookingColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ChannelPartnerName',
            label: 'Broker Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleViewBrokerageBookingDetails(row)}
                />
            )
        },
        {
            key: 'ApplicantName',
            label: 'Applicant Name',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'ApplicantMobileNumber',
            label: 'Contact No.',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'BuildingNumber',
            label: 'Building',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'Wing',
            label: 'Wing',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'Flat',
            label: 'Flat',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'FlatType',
            label: 'Flat Type',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'FlatConfiguration',
            label: 'Flat Configuration',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'RERACarpetAreaSqFt',
            label: 'RERA Carpet Area SqFt',
            width: '25',
            sortable: false,
            align: 'center',
            render: (value) => value ? `${value} Sq ft` : '-'
        },
        {
            key: 'AgreementValue',
            label: 'Agreement Value',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value ? `₹ ${value.toFixed(2)}` : '-'
        },
        {
            key: 'BrokerageAmount',
            label: 'Brokerage Amount',
            width: '25',
            sortable: false,
            align: 'center',
            render: (value) => value ? `₹ ${value.toFixed(2)}` : '-'
        },
        {
            key: 'BrokeragePercentage',
            label: 'Brokerage Percentage',
            width: '25',
            sortable: false,
            align: 'center',
            render: (value) => value ? `${value}%` : '-'
        },
        {
            key: 'PaidBrokerageAmount',
            label: 'Paid Amount',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value ? `₹ ${value.toFixed(2)}` : '-'
        },
        {
            key: 'OutstandingAmount',
            label: 'Outstanding Amount',
            width: '25',
            sortable: false,
            align: 'center',
            render: (_value, row) => {
                const brokerageAmount = Number(row.BrokerageAmount) || 0
                const paidBrokerageAmount = Number(row.PaidBrokerageAmount) || 0
                const outstandingAmount = brokerageAmount - paidBrokerageAmount
                return `₹ ${outstandingAmount.toFixed(2)}`
            }
        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => (
                <div className="flex items-center justify-center">
                    {canAction && (
                        <>
                            <Button
                                color="blue"
                                size="sm"

                                onClick={() => {
                                    handleViewBrokerageBookingDetails(row)
                                }}
                            >
                                Invoices
                            </Button>
                        </>
                    )}
                </div>
            )
        },
    ], [handleViewBrokerageBookingDetails]);
    //#endregion

    //#region BROKERAGE BOOKING COLUMN CUSTOMIZATION
    const requiredBrokerageBookingColumnKeys: string[] = ['ChannelPartnerName', 'Actions'];

    const allBrokerageBookingColumnKeys: string[] = BrokerageBookingColumns.map(c => c.key);

    const [selectedBrokerageBookingColumnKeys, setSelectedBrokerageBookingColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getBrokerageBookingTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([
                    ...parsed, ...requiredBrokerageBookingColumnKeys]));

                return withRequired.filter(k => allBrokerageBookingColumnKeys.includes(k));
            }
        } catch { }
        return allBrokerageBookingColumnKeys;
    });

    useEffect(() => {
        setSelectedBrokerageBookingColumnKeys(prev => Array.from(new Set([...prev, ...requiredBrokerageBookingColumnKeys])).filter(k => allBrokerageBookingColumnKeys.includes(k)));
    }, [BrokerageBookingColumns.length])

    const visibleBrokerageBookingColumns = useMemo(
        () => BrokerageBookingColumns.filter(col => selectedBrokerageBookingColumnKeys.includes(col.key)),
        [BrokerageBookingColumns, selectedBrokerageBookingColumnKeys]
    );

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadBrokerageBooking(1, tempFilters);
        setShowFilterPopup(false);
    };
    //#endregion

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadBrokerageBooking(1, {}, sortInfo, searchTerm);
    };

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region BROKERAGE BOOKING TABLE PAGINATION INFO
    const BrokerageBookingPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const BrokerageBookingForTable = useMemo(() => BrokerageBookingList, [BrokerageBookingList]);
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>


            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizeBrokerageBookingColumnsModal(true);
                }}

                // EXPORT
                isShowExportButton={canExport && BrokerageBookingForTable.length > 0}
                onExportExcel={handleExportBrokerageBookingExcel}
                onExportPdf={handleExportBrokerageBookingPdf}
                exportLoading={isLoading}
            />

            {/* DATA TABLE */}

            <DataTable
                data={BrokerageBookingForTable}
                columns={visibleBrokerageBookingColumns}
                pagination={BrokerageBookingPaginationInfo}
                emptyMessage="No Brokerage Booking Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* BROKERAGE BOOKING CUSTOMIZE COLUMNS MODAL */}

            <CustomizeColumnsModal
                isOpen={isShowCustomizeBrokerageBookingColumnsModal}
                onClose={() => setIsShowCustomizeBrokerageBookingColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredBrokerageBookingColumnKeys])
                    );
                    setSelectedBrokerageBookingColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeBrokerageBookingTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={BrokerageBookingColumns}
                selectedKeys={selectedBrokerageBookingColumnKeys}
                requiredKeys={requiredBrokerageBookingColumnKeys}
                title="Customize Table Columns"
            />

            {/* FILTER MODAL FOR BROKERAGE BOOKING */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Brokerage Booking"
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
                <div className="space-y-4">

                    <div>
                        <DatePickerInput
                            label='From Date'
                            value={tempFilters.FromDate || ''}
                            onChange={(value) => handleFilterChange('FromDate', value || '')}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='To Date'
                            value={tempFilters.ToDate || ''}
                            onChange={(value) => handleFilterChange('ToDate', value || '')}
                        />
                    </div>

                    <div>
                        <Input type="text"
                            label='Mobile Number'
                            value={tempFilters?.ApplicantMobileNumber ?? ''}
                            onChange={e => handleFilterChange('ApplicantMobileNumber', e.target.value)}
                            placeholder="Enter Mobile Number" />
                    </div>
                </div>
            </Modal >
        </div >
    );
}
export default Brokerage;