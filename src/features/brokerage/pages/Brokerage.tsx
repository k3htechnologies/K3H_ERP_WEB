import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import usePagination from "@/core/hooks/usePagination";
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
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
import type { BrokerageBookingData, FilterWithPaginationBrokerageBookingRequest } from "@/features/brokerage/models/BrokerageInvoiceModel";
import { brokerageInvoiceService } from "@/features/brokerage/services/BrokerageInvoiceService";
import {  Input } from "@/ui/components/forms";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";
import { formatCurrency } from "@/core/utils/comman";
import { useBookingBrokerageListState } from "@/features/brokerage/context/BookingBrokerageListStateContext";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";

export const Brokerage: React.FC = () => {

    const [BrokerageBookingList, setBrokerageBookingList] = useState<BrokerageBookingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const { listState, updateListState } = useBookingBrokerageListState();

    const { pagination, setPagination } = usePagination(20);
    const sortInfo = listState.sortInfo;
    const searchTerm = listState.searchTerm;
    const filters = listState.filters;

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchCpName(value);
    }, 350);

    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const { projectId } = useProject();

    const navigate = useNavigate();

    const { canExport } = useMenuPermissions('/bookingBrokerage');

    const { addToast } = useToast();

    const [isShowCustomizeBrokerageBookingColumnsModal, setIsShowCustomizeBrokerageBookingColumnsModal] = useState(false);

    useEffect(() => {
        
        if (listState.searchTerm && String(listState.searchTerm).trim()) {

            loadBrokerageBooking(listState.page,{ ChannelPartnerName: String(listState.searchTerm).trim() },listState.sortInfo);
        
        } else {

            loadBrokerageBooking(listState.page, listState.filters, listState.sortInfo);

        }
    }, [
        listState.page,
        listState.filters,
        listState.sortInfo,
        listState.searchTerm,
    ]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.();
        };
    }, [debouncedSearch]);


    const loadBrokerageBooking = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBrokerageBookingRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    ChannelPartnerName: searchText?.trim() ?? filterParams.ChannelPartnerName?.trim() ?? undefined,
                    ChannelPartnerMobileNumber: tempFilters.ChannelPartnerMobileNumber?.trim() || undefined,
                    ChannelPartnerCompanyName: tempFilters.ChannelPartnerCompanyName?.trim() || undefined,
                    ApplicantMobileNumber: tempFilters.ApplicantMobileNumber?.trim() || undefined,
                    ApplicantName: tempFilters.ApplicantName?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    Wing: tempFilters.Wing?.trim() || undefined,
                    Flat: tempFilters.Flat?.trim() || undefined,
                    Floor: tempFilters.Floor?.trim() || undefined,
                    AgreementValue: tempFilters.AgreementValue ? Number(tempFilters.AgreementValue) : undefined,
                    BookingType: tempFilters.BookingType?.trim() || undefined,
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


    const searchCpName = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue });

        if (searchValue.trim() === "") {
            updateListState({ searchTerm: "", page: 1 });
            return;
        }

        updateListState({ searchTerm: searchValue, page: 1 });
    };

    const clearSearchCpName = () => {
        debouncedSearch.cancel?.();
        updateListState({ searchTerm: "", filters: {}, page: 1 });
        setTempFilters({});
    };


    const handleExportBrokerageBooking = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBrokerageBookingRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    ChannelPartnerName: filters.ChannelPartnerName?.trim() ?? undefined,
                    ChannelPartnerMobileNumber: filters.ChannelPartnerMobileNumber?.trim() || undefined,
                    ChannelPartnerCompanyName: filters.ChannelPartnerCompanyName?.trim() || undefined,
                    ApplicantMobileNumber: filters.ApplicantMobileNumber?.trim() || undefined,
                    ApplicantName: filters.ApplicantName?.trim() || undefined,
                    FromDate: filters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
                    ToDate: filters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,
                    Wing: filters.Wing?.trim() || undefined,
                    Flat: filters.Flat?.trim() || undefined,
                    Floor: filters.Floor?.trim() || undefined,
                    AgreementValue: filters.AgreementValue ? Number(filters.AgreementValue) : undefined,
                    BookingType: filters.BookingType?.trim() || undefined,
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

    const handlePageChange = useCallback(
        (page: number) => {
            updateListState({ page });
        },
        [sortInfo, updateListState],
    );

    const handleSortColumn = useCallback(
        (sort: SortInfo) => {
            updateListState({ sortInfo: sort, page: 1 });
            loadBrokerageBooking(1, filters, sort, searchTerm || undefined);
        },
        [filters, updateListState, searchTerm],
    );

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


    const handleViewBrokerageBookingDetails = useCallback((row: BrokerageBookingData) => {

        updateListState({
            bookingId: row.BookingId,
            bookingName: row.ApplicantName ?? "",
            cpName: row.ChannelPartnerName ?? "",
            cpMobileNumber: row.ChannelPartnerMobileNumber ?? "",
            cpCompany: row.ChannelPartnerCompany ?? ""
        });
        navigate("/brokerage/brokerageInvoice/view");

    }, [navigate]);


    const BrokerageBookingColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ChannelPartnerName',
            label: 'CP Name',
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
            key: 'ChannelPartnerCompany',
            label: 'CP Company',
            width: '25',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ChannelPartnerMobileNumber',
            label: 'CP Mobile Number',
            width: '25',
            sortable: false,
            align: 'left',
            render: (value) => (value ? `+91 ${value}` : "-"),
        },
        {
            key: 'SystemGeneratedCode',
            label: 'Enquiry Code',
            width: '20',
            sortable: false,
            align: 'left',
            render: value => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="150px"
                    tooltipThreshold={20}
                    tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                />
            )
        },
        {
            key: 'ApplicantName',
            label: 'Applicant Name',
            width: '25',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ApplicantMobileNumber',
            label: 'Mobile Number',
            width: '25',
            sortable: false,
            align: 'left',
            render: (value) => (value ? `+91 ${value}` : "-"),
        },
        {
            key: "UnitGroup",
            label: "Unit",
            align: "center",
            children: [
                {
                    key: 'BuildingNumber',
                    label: 'Building',
                    width: '25',
                    sortable: false,
                    align: 'left',
                    render: value => value || '-'
                },
                {
                    key: 'Wing',
                    label: 'Wing',
                    width: '25',
                    sortable: false,
                    align: 'left',
                    render: value => value || '-'
                },
                {
                    key: 'Flat',
                    label: 'Flat',
                    width: '25',
                    sortable: false,
                    align: 'left',
                    render: value => value || '-'
                },
                {
                    key: 'FlatType',
                    label: 'Type',
                    width: '25',
                    sortable: false,
                    align: 'left',
                    render: value => value || '-'
                },
                {
                    key: 'FlatConfiguration',
                    label: 'Configuration',
                    width: '25',
                    sortable: false,
                    align: 'left',
                    render: value => value || '-'
                },
                {
                    key: 'RERACarpetAreaSqFt',
                    label: 'RERA Carpet Area (SqFt)',
                    width: '25',
                    sortable: false,
                    align: 'left',
                    render: (value) => value ? `${value} Sq ft` : '-'
                },
            ]
        },
        {
            key: 'BrokeragePercentage',
            label: 'Brokerage (%)',
            width: '25',
            sortable: false,
            align: 'right',
            render: (value) => value ? `${value}%` : '-'
        },

        {
            key: "AmountGroup",
            label: "Amount",
            align: "center",
            children: [
                {
                    key: "AgreementValue",
                    label: "Agreement (₹)",
                    align: "right",
                    render: value => value ? formatCurrency(value) : '0'
                },
                {
                    key: "BrokerageAmount",
                    label: "Brokerage (₹)",
                    align: "right",
                    render: value => value ? formatCurrency(value) : '0'
                },
                {
                    key: "InvoiceAmount",
                    label: "Raise Invoice (₹)",
                    align: "right",
                    render: value => value ? formatCurrency(value) : '0'
                },
                
                {
                    key: "PaymentPaidAmount",
                    label: "Account Paid (₹)",
                    align: "right",
                    render: value => value ? formatCurrency(value) : '0'
                },
                {
                    key: "OutstandingAmount",
                    label: "Pending (₹)",
                    align: "right",
                    render: (_value, row) => {
                        const brokerageAmount = Number(row.BrokerageAmount) || 0
                        const paidBrokerageAmount = Number(row.PaymentPaidAmount) || 0
                        const outstandingAmount = brokerageAmount - paidBrokerageAmount
                        return `₹ ${outstandingAmount.toFixed(2)}`
                    }
                }
            ]
        },
    ], [handleViewBrokerageBookingDetails]);

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

    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        loadBrokerageBooking(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        updateListState({ filters: {}, page: 1 });
        loadBrokerageBooking(1, {});
    };

    const handleFilterChange = (key: string, value: string | null) => {
        setTempFilters((prev) => updateFilter(prev, key, value));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>


            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By CP Name"
                onSearchChange={(v) => {
                    updateListState({ searchTerm: v });
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchCpName}

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

            <CustomTable
                data={BrokerageBookingForTable}
                columns={visibleBrokerageBookingColumns}
                pagination={BrokerageBookingPaginationInfo}
                emptyMessage="No Brokerage Data Found"
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
                        <Input
                            label='CP Name'
                            type="text"
                            value={tempFilters.ChannelPartnerName || ''}
                            onChange={e => handleFilterChange('ChannelPartnerName', e.target.value)}
                            placeholder="Enter CP name"
                        />
                    </div>

                    <div>
                        <Input
                            label='CP Company'
                            type="text"
                            value={tempFilters.ChannelPartnerCompanyName || ''}
                            onChange={e => handleFilterChange('ChannelPartnerCompanyName', e.target.value)}
                            placeholder="Enter Company"
                        />
                    </div>
                    <div>
                        <Input
                            label='CP Mobile Number'
                            type="text"
                            value={tempFilters.ChannelPartnerMobileNumber || ''}
                            onChange={e => handleFilterChange('ChannelPartnerMobileNumber', e.target.value)}
                            placeholder="Enter CP Mobile Number"
                        />
                    </div>
                    <div>
                        <Input
                            label='Applicant Name'
                            type="text"
                            value={tempFilters.ApplicantName || ''}
                            onChange={e => handleFilterChange('ApplicantName', e.target.value)}
                            placeholder="Enter Applicant name"
                        />
                    </div>

                    <div>
                        <Input
                            label='Applicant Mobile Number'
                            type="text"
                            value={tempFilters.ApplicantMobileNumber || ''}
                            onChange={e => handleFilterChange('ApplicantMobileNumber', e.target.value)}
                            placeholder="Enter Mobile Number"
                        />
                    </div>
                    <div>
                        <Input
                            label='Wing'
                            type="text"
                            value={tempFilters.Wing || ''}
                            onChange={e => handleFilterChange('Wing', e.target.value)}
                            placeholder="Enter Wing"
                        />
                    </div>

                    <div>
                        <Input
                            label='Flat'
                            type="text"
                            value={tempFilters.Flat || ''}
                            onChange={e => handleFilterChange('Flat', e.target.value)}
                            placeholder="Enter Flat"
                        />
                    </div>

                    <div>
                        <Input
                            label='Floor'
                            type="text"
                            value={tempFilters.Floor || ''}
                            onChange={e => handleFilterChange('Floor', e.target.value)}
                            placeholder="Enter Floor"
                        />
                    </div>
                    <div>
                        <Input
                            label='Agreement Value'
                            type="number"
                            value={tempFilters.AgreementValue || ''}
                            onChange={e => handleFilterChange('AgreementValue', e.target.value)}
                            placeholder="Enter Agreement Value"
                        />
                    </div>

                    <div>
                        <Input
                            label='Booking Type'
                            type="text"
                            value={tempFilters.BookingType || ''}
                            onChange={e => handleFilterChange('BookingType', e.target.value)}
                            placeholder="Enter Booking Type"
                        />
                    </div>
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


                </div>
            </Modal >
        </div >
    );
}
export default Brokerage;