import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { BookingData, FilterWithPaginationBookingRequest } from '@/features/booking/models/BookingModel';
import { bookingService } from '@/features/booking/services/BookingService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { useBookingListState } from '@/features/booking/context/BookingListStateContext';
import { SOURCE_TYPE_OPTIONS, SUB_SUB_SOURCE_CHANNEL_PARTNER_OPTIONS, SUB_SUB_SOURCE_TYPE_OPTIONS, SUBSOURCE_TYPE_OPTIONS } from '@/core/constants';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import ApprovalActions from '@/features/modulesWorkflowApproval/components/ApprovalActionsButton';
import { modulesWorkflowApprovalService } from '@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService';
import { ApprovalLogModal } from '@/features/modulesWorkflowApproval/components/ApprovalLogModal';
import ApprovalActionModal from '@/features/modulesWorkflowApproval/components/ApprovalActionModal';

export const Booking: React.FC = () => {
    //#region STATE
    const [bookingList, setBookingList] = useState<BookingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();

    const [showFilterPopup, setShowFilterPopup] = useState(false);

    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [isShowCustomizeBookingColumnsModal, setIsShowCustomizeBookingColumnsModal] = useState(false);

    const { canAction, canExport } = useMenuPermissions();

    // APPROVAL LOG MODAL
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [ownerName, setOwnerName] = useState<string | null>("");
    const [wing, setwing] = useState<string | null>("");
    const [unitNumber, setUnitNumber] = useState<string | null>("");

    // APPROVAL ACTION MODAL
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<BookingData | null>(null);

    //#endregion

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject()
    //#endregion

    //#region BOOKING LIST STATE CONTEXT
    const { listState, updateListState, resetFilters, clearBookingContext } = useBookingListState();

    const { page, filters, sortInfo, searchTerm } = listState;
    //#endregion

    //#region DATA LOAD BOOKING

    const loadBookings = async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBookingRequest = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    BookingId: filterParams.BookingId ? Number(filterParams.BookingId) : undefined,
                    ProjectId: projectId ?? undefined,
                    ApplicantMobileNumber: filterParams.ApplicantMobileNumber?.trim() || undefined,
                    ApplicantName: filterParams.ApplicantName?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) : undefined,
                    Wing: filterParams.Wing?.trim() || undefined,
                    Flat: filterParams.Flat?.trim() || undefined,
                    Floor: filterParams.Floor?.trim() || undefined,
                    Source: filterParams.Source || undefined,
                    SubSource: filterParams.SubSource || undefined,
                    SubSubSource: filterParams.SubSubSource || undefined,
                    AgreementValue: filterParams.AgreementValue ? Number(filterParams.AgreementValue) : undefined,
                    BookingType: filterParams.BookingType?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, bookingColumns)
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (E.isRight(response)) {

                    setBookingList(response.right.Data);

                    setPagination({
                        currentPage: pageNum,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    });

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
            'Loading Booking'
        );
    };

    //#endregion

    //#region INIT
    useEffect(() => {

        if (!projectId) return;

        clearBookingContext();

        if (searchTerm && searchTerm.trim()) {

            loadBookings(page, { ApplicantName: searchTerm.trim() }, sortInfo);

        } else {

            loadBookings(page, filters, sortInfo);

        }
    }, [projectId, page, filters, sortInfo, searchTerm, clearBookingContext]);


    useEffect(() => {

        setPagination({ currentPage: page });

    }, [page]);

    useEffect(() => {

        setTempFilters(filters);

    }, [filters]);

    //#endregion

    //#region SEARCH BOOKING FILTER

    const debouncedSearch = useDebouncedCallback((value: string, isSearch: boolean = true) => {

        let filterParams: FilterInfo = {};

        if (value.trim() === '') {

            updateListState({ searchTerm: '', filters: {}, page: 1 });

            return;
        }

        if (isSearch) {

            filterParams = { ApplicantName: value.trim() };
        }

        updateListState({ searchTerm: value, filters: filterParams, page: 1 });

    }, 350);

    const searchBookings = (searchValue: string) => {

        updateListState({ searchTerm: searchValue });

        debouncedSearch(searchValue, false);
    };

    //#endregion

    //#region CLEAR SEARCH BOOKING
    const clearSearchBookings = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        setTempFilters({});
    };

    //#endregion

    //#region  EXCEL EXPORT TO EXCEL | PDF
    const handleExportBookings = async (exportType: 'Excel' | 'PDF' | 'BOOKING FORM PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {


                const params: FilterWithPaginationBookingRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: projectId ?? undefined,
                    ApplicantMobileNumber: tempFilters.ApplicantMobileNumber?.trim() || undefined,
                    ApplicantName: tempFilters.ApplicantName?.trim() || undefined,
                    FromDate: tempFilters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(tempFilters.FromDate) : undefined,
                    ToDate: tempFilters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(tempFilters.ToDate) : undefined,
                    Wing: tempFilters.Wing?.trim() || undefined,
                    Flat: tempFilters.Flat?.trim() || undefined,
                    Floor: tempFilters.Floor?.trim() || undefined,
                    Source: tempFilters.Source || undefined,
                    SubSource: tempFilters.SubSource || undefined,
                    SubSubSource: tempFilters.SubSubSource || undefined,
                    AgreementValue: tempFilters.AgreementValue ? Number(tempFilters.AgreementValue) : undefined,
                    BookingType: tempFilters.BookingType?.trim() || undefined,
                    SortBy: getSortByParam(null, bookingColumns),
                    ExportType: exportType
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (exportType === 'BOOKING FORM PDF') {
                    // Handle PDF export differently if needed
                    handleExportFile(response, 'PDF', 'Booking Form', addToast);
                } else {
                    handleExportFile(response, exportType, 'Booking Master', addToast);
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' });
            },
            undefined,
            'Preparing Export'
        );
    };

    const handleExportBookingExcel = () => handleExportBookings('Excel');
    const handleExportBookingPdf = () => handleExportBookings('PDF');

    //#endregion

    //#region TABLE CONFIG
    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [updateListState]);

    const handleSortColumn = useCallback(
        (sort: SortInfo) => {
            updateListState({ sortInfo: sort, page: 1 });
        },
        [filters, updateListState, searchTerm],
    );

    const bookingPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const bookingsForTable = useMemo(() => bookingList, [bookingList]);
    //#endregion

    //#region VIEW BOOKING DETAILS
    const handleViewBookingDetails = useCallback((row: BookingData) => {
        updateListState({
            bookingId: row.BookingId ?? 0,
            bookingName: row.ApplicantName ?? '',
        });
        navigate('/booking/view');
    }, [navigate, updateListState]);
    //#endregion

    //#region TABLE COLUMN

    const handleApprovalLog = (row: BookingData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "BOOKING APPROVAL",
            Id: row.BookingId ?? 0,
            ProjectId: row.ProjectId ?? 0,
        };
        setOwnerName(row.ApplicantName);
        setwing(row?.Wing)
        setUnitNumber(row?.Flat);

        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectDocument = (row: BookingData, approvalType: "approve" | "reject") => {

        setApprovalRowData(row);
        setOwnerName(row.ApplicantName);
        setwing(row?.Wing)
        setUnitNumber(row?.Flat);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);

    };

    const bookingColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'SystemGeneratedCode',
                label: 'Enquiry Code',
                width: '20',
                sortable: false,
                fixed: 'left',
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
                width: '20',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value, row) => (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="min-w-0">
                                <TooltipText
                                    text={value || '-'}
                                    maxWidth="260px"
                                    tooltipThreshold={26}
                                    onClick={() => handleViewBookingDetails(row)}
                                />
                            </div>
                        </div>
                    </div>
                )
            },
            {
                key: 'BookingType',
                label: 'Booking Type',
                width: '14',
                sortable: false,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'Flat',
                label: 'Flat',
                width: '12',
                sortable: true,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'Wing',
                label: 'Wing',
                width: '10',
                sortable: false,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'Floor',
                label: 'Floor',
                width: '10',
                sortable: false,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'AgreementValue',
                label: 'Agreement Value (₹)',
                width: '18',
                sortable: false,
                align: 'right',
                render: value => value ? `₹${Number(value).toLocaleString('en-IN')}` : '-'
            },
            {
                key: 'RegistrationDate',
                label: 'Expected Registration Date',
                width: '16',
                sortable: false,
                align: 'center',
                render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
            {
                key: "ApprovalStatus",
                label: "Approval Status",
                width: "18",
                sortable: false,
                align: "left",
                render: (value, row) => (

                    <ApprovalActions
                        approvalStatus={value || "-"}
                        showApproval={row.IsApproval}
                        isIcons={true}
                        onHistory={() => handleApprovalLog(row)}
                        onApprove={() => handleApproveRejectDocument(row, "approve")}
                        onReject={() => handleApproveRejectDocument(row, "reject")}
                    />

                )
            },

        ],
        [canAction, handleViewBookingDetails, handleApprovalLog, handleApproveRejectDocument]
    );
    //#endregion

    //#region CUSTOMIZE COLUMNS
    const requiredBookingColumnKeys: string[] = ['ApplicantName', 'Actions'];

    const allBookingColumnKeys: string[] = bookingColumns.map(c => c.key);

    const [selectedBookingColumnKeys, setSelectedBookingColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getBookingTableColumns?.();
            if (saved) {
                const parsed = JSON.parse(saved) as string[];
                const withRequired = Array.from(new Set([...parsed, ...requiredBookingColumnKeys]));
                return withRequired.filter(k => allBookingColumnKeys.includes(k));
            }
        } catch {
            // ignore
        }
        return allBookingColumnKeys;
    });

    useEffect(() => {
        setSelectedBookingColumnKeys(prev =>
            Array.from(new Set([...prev, ...requiredBookingColumnKeys])).filter(k =>
                allBookingColumnKeys.includes(k)
            )
        );

    }, [bookingColumns.length]);

    const visibleBookingColumns = useMemo(
        () => bookingColumns.filter(col => selectedBookingColumnKeys.includes(col.key)),
        [bookingColumns, selectedBookingColumnKeys]
    );
    //#endregion

    //#region  HANDLE CHANGE EVENT

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };

    //#endregion

    const handleApprovalSubmit = async (remark: string) => {

        if (!approvalRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "BOOKING APPROVAL",
            Id: approvalRowData.BookingId ?? 0,
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

                    await loadBookings(page, filters, sortInfo);

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Applicant Name"
                onSearchChange={searchBookings}
                onClearSearch={clearSearchBookings}
                isShowFilterButton
                filters={tempFilters}
                onOpenFilter={() => {
                    setTempFilters(tempFilters);
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeBookingColumnsModal(true)}
                // IMPORT
                isShowImportButton={false}

                // EXPORT
                isShowExportButton={canExport && bookingsForTable.length > 0}
                onExportExcel={handleExportBookingExcel}
                onExportPdf={handleExportBookingPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={bookingsForTable}
                columns={visibleBookingColumns}
                pagination={bookingPaginationInfo}
                emptyMessage="No Booking Data Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={undefined}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeBookingColumnsModal}
                onClose={() => setIsShowCustomizeBookingColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(new Set([...keys, ...requiredBookingColumnKeys]));
                    setSelectedBookingColumnKeys(withRequired);
                    try {
                        LocalStorageHelper.storeBookingTableColumns?.(JSON.stringify(withRequired));
                    } catch {
                        // ignore
                    }
                }}
                columns={bookingColumns}
                selectedKeys={selectedBookingColumnKeys}
                requiredKeys={requiredBookingColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Booking"
                onSubmit={e => {
                    e.preventDefault();
                    updateListState({ filters: tempFilters, page: 1 });
                    setShowFilterPopup(false);
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => {
                    setTempFilters({});
                    resetFilters();
                }}


                size="small-half"
            >
                <div className="space-y-6">
                    <div className="space-y-4">
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
                    </div>
                </div>
            </Modal>


            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Booking'
                titleText={ownerName ?? ""}
                subTitleText={wing ?? ""}
                subSubTitleText={unitNumber ?? ""}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest} />

            <ApprovalActionModal
                title="Booking"
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                titleText={ownerName ?? ""}
                subTitleText={wing ?? ""}
                subSubTitleText={unitNumber ?? ""}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />
        </div >
    );
};

export default Booking;


