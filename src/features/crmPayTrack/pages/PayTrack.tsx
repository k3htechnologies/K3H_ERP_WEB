import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { type SortInfo, type TableColumn, type FilterInfo, type PaginationInfo } from '@/ui/components/DataTable/DataTable';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import type { PayTrackBookingData, FilterWithPaginationPayTrackBooking, PayTrackRow } from '@/features/crmPayTrack/models/PayTrackBookingModel';
import { payTrackBookingService } from '@/features/crmPayTrack/services/PayTrackBookingService';
import { Modal } from '@/ui/components/Modal/Modal';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from '@/core/utils';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { useNavigate } from 'react-router-dom';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { updateFilter } from "@/core/utils/filterHelper";
import { Input } from '@/ui/components/forms';
import DataTableExpandable from '@/ui/components/DataTable/DataTableExpandable';
import { DataTableWithOutBorder } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { usePayTrackBookingListState } from '../context/PayTrackBookingListStateContext';

const PayTrack: React.FC = () => {

    //#region STATE
    const [payTrackList, setPayTrackList] = useState<PayTrackBookingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();


    const [showFilterPopup, setShowFilterPopup] = useState(false);

    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [isShowCustomizePayTrackColumnsModal, setIsShowCustomizePayTrackColumnsModal] = useState(false);

    const { canExport } = useMenuPermissions("/bookingPayTrack");

    const { projectId } = useProject();

    const { listState, updateListState, resetFilters, clearPayTrackBookingContext } = usePayTrackBookingListState();

    const { page, filters, sortInfo, searchTerm } = listState;

    const loadPayTrackList = async (pageNum: number, filterParams: FilterInfo, sortInfoParam?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPayTrackBooking = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    Wing: filterParams.Wing || undefined,
                    Flat: filterParams.Flat || undefined,
                    Floor: filterParams.Floor || undefined,
                    ApplicantName: filterParams.ApplicantName?.trim() || undefined,
                    ApplicantMobileNumber: filterParams.ApplicantMobileNumber || undefined,
                    Configuration: filterParams.Configuration || undefined,
                    SortBy: getSortByParam(sortInfoParam ?? null, payTrackColumns),
                };

                const response = await payTrackBookingService.apiCallPullPayTrackBooking(params);

                if (E.isRight(response)) {
                    setPayTrackList(response.right.Data);

                    setPagination({
                        currentPage: pageNum,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;

            }, undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Pay Track Booking'
        )

    }
    //#endregion

    //#region INIT
    useEffect(() => {

        if (!projectId) return;

        clearPayTrackBookingContext();

        if (searchTerm && searchTerm.trim()) {

            loadPayTrackList(page, { ApplicantName: searchTerm.trim() }, sortInfo);

        } else {

            loadPayTrackList(page, filters, sortInfo);

        }
    }, [projectId, page, filters, sortInfo, searchTerm, clearPayTrackBookingContext]);


    useEffect(() => {

        setPagination({ currentPage: page });

    }, [page]);

    useEffect(() => {

        setTempFilters(filters);

    }, [filters]);

    //#endregion

    //#region SEARCH PAY TRACK BOOKING FILTER

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

    const searchPayTrackBookings = (searchValue: string) => {

        updateListState({ searchTerm: searchValue });

        debouncedSearch(searchValue, false);
    };

    //#endregion

    //#region CLEAR SEARCH PAY TRACK BOOKING
    const clearPayTrackSearchBookings = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        setTempFilters({});
    };

    //#endregion
    //#region EXPORT EXCEL AND PDF
    const handleExportPayTrackExcel = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPayTrackBooking = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    ProjectId: Number(projectId),
                    Wing: tempFilters.wing || undefined,
                    Flat: tempFilters.Flat || undefined,
                    Floor: tempFilters.Floor || undefined,
                    ApplicantName: searchTerm || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, payTrackColumns),
                    ExportType: exportType
                }

                const response = await payTrackBookingService.apiCallPullPayTrackBooking(params);
                handleExportFile(response, exportType, 'PayTrack', addToast)
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Export'
        )
    }

    const handleExportPayTrackExcelFile = () => handleExportPayTrackExcel('Excel');
    const handleExportPayTrackPdfFile = () => handleExportPayTrackExcel('PDF');
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

    const payTrackBookingPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const payTrackBookingsForTable = useMemo(() => payTrackList, [payTrackList]);
    //#endregion

    //#region VIEW BOOKING DETAILS
    const handleViewpayTrackBDetails = useCallback((row: PayTrackBookingData) => {
        updateListState({
            bookingId: row.BookingId ?? 0,
            bookingName: row.ApplicantName ?? '',
            bookingType: row.BookingType ?? '',
            flat: row.Flat ?? '',
            bookingOtherChargesData: row.BookingOtherChargesData ?? [],
            bookingData: row ?? [],
            totalUnitCost:
                (row.AgreementValue || 0) +
                (row.AgreementValueGSTAmount || 0) +
                (row.StampDutyAmount || 0) +
                (row.RegistrationFees || 0) +
                (row.OtherChargesAmount || 0) +
                (row.OtherChargesGSTAmount || 0),
        });
        navigate('/payTrack/view');
    }, [navigate, updateListState]);
    //#endregion

    //#region TABLE COLUMN


    const payTrackColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'SystemGeneratedCode',
                label: 'Enquiry Code',
                width: '30',
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
                width: '14',
                render: (value, row) => (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="min-w-0">
                                <TooltipText
                                    text={value || '-'}
                                    maxWidth="260px"
                                    tooltipThreshold={26}
                                    onClick={() => handleViewpayTrackBDetails(row)}
                                />
                            </div>
                        </div>
                    </div>
                )

            },
            {
                key: "ApplicantMobileNumber",
                label: "Applicant Mobile Number",
                width: "14",
                sortable: false,
                align: "left",
                render: (value) => (value ? `+91 ${value}` : "-"),
            },
            {
                key: 'BookingType',
                label: 'Booking Type',
                width: '14',
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'BuildingNumber',
                label: 'Building Number',
                width: '14',
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'Wing',
                label: 'Wing',
                width: '14',
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'Floor',
                label: 'Floor',
                width: '14',
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'Flat',
                label: 'Flat',
                width: '14',
                align: 'left',
                render: value => value || '-'
            },

            {
                key: 'FlatConfiguration',
                label: 'Configuration ',
                width: '14',
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'RegistrationDate',
                label: 'Expected Registration Date ',
                width: '14',
                align: 'left',
                render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
            },
            {
                key: 'FinalRegistrationDate',
                label: 'Final Registration Date ',
                width: '14',
                align: 'left',
                render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
            },
            {
                key: "ApprovalGroup",
                label: "Approval Details",
                align: "center",
                children: [
                    {
                        key: 'PendingLedgerApprovalCount',
                        label: 'Pending Ledger',
                        width: '14',
                        align: 'left',
                        render: (v) => v || '0'
                    },
                    {
                        key: 'FlatAlterationRequestIsApproval',
                        label: 'Flat Alteration',
                        width: '14',
                        align: 'left',
                        render: (v) => v ? 'Yes' : 'No'
                    },
                    {
                        key: 'ParkingModificationRequestIsApproval',
                        label: 'Parking Modification',
                        width: '14',
                        align: 'left',
                        render: (v) => v ? 'Yes' : 'No'
                    },
                    {
                        key: 'BookingApplicantModificationRequestIsApproval',
                        label: 'Applicant Modification',
                        width: '14',
                        align: 'left',
                        render: (v) => v ? 'Yes' : 'No'
                    }
                ]
            }


        ], [handleViewpayTrackBDetails]
    );

    const payTrackPaymentColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'type',
            label: 'Type',
            align: 'left',
            width: "200px",
            render: (value, row) => (
                <span className={row.isTotal ? 'font-bold text-gray-500' : ''}>
                    {value}
                </span>
            )
        },
        {
            key: 'total',
            label: 'Total Amount',
            align: 'right',
            width: "300px",
            render: (value, row) => (
                <span className={row.isTotal ? 'font-bold text-gray-500' : ''}>
                    ₹ {value.toLocaleString()}
                </span>
            )
        },
        {
            key: 'paid',
            label: 'Paid Amount',
            align: 'right',
            width: "300px",
            render: (value, row) => (
                <span className={row.isTotal ? 'font-bold text-gray-500' : ''}>
                    ₹ {value.toLocaleString()}
                </span>
            )
        },
        {
            key: 'pending',
            label: 'Outstanding Amount',
            align: 'right',
            width: "300px",
            render: (_, row) => {
                const pending = (row.total || 0) - (row.paid || 0);

                return (
                    <span className={row.isTotal ? 'font-bold text-gray-500' : ''}>
                        ₹ {pending.toLocaleString()}
                    </span>
                );
            }
        }

    ], []);

    const requiredPayTrackBookingColumnKeys: string[] = ['ApplicantName', 'Actions'];

    const allPayTrackBookingColumnKeys: string[] = payTrackColumns.map(c => c.key);

    const [selectedPayTrackBookingColumnKeys, setSelectedPayTrackBookingColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getPayTrackBookingTableColumns?.();
            if (saved) {
                const parsed = JSON.parse(saved) as string[];
                const withRequired = Array.from(new Set([...parsed, ...requiredPayTrackBookingColumnKeys]));
                return withRequired.filter(k => allPayTrackBookingColumnKeys.includes(k));
            }
        } catch {
            // ignore
        }
        return allPayTrackBookingColumnKeys;
    });

    useEffect(() => {
        setSelectedPayTrackBookingColumnKeys(prev =>
            Array.from(new Set([...prev, ...requiredPayTrackBookingColumnKeys])).filter(k =>
                allPayTrackBookingColumnKeys.includes(k)
            )
        );

    }, [payTrackColumns.length]);

    const visiblepayTrackBookingColumns = useMemo(
        () => payTrackColumns.filter(col => selectedPayTrackBookingColumnKeys.includes(col.key)),
        [payTrackColumns, selectedPayTrackBookingColumnKeys]
    );


    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };



    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Applicant Name"
                onSearchChange={searchPayTrackBookings}
                onClearSearch={clearPayTrackSearchBookings}
                isShowCustomizeButton
                filters={tempFilters}
                onOpenFilter={() => {
                    setTempFilters(tempFilters);
                    setShowFilterPopup(true);
                }}


                isShowFilterButton
                onCustomize={() => setIsShowCustomizePayTrackColumnsModal(true)}
                // IMPORT
                isShowImportButton={false}
                // EXPORT
                isShowExportButton={canExport && payTrackBookingsForTable.length > 0}
                onExportExcel={handleExportPayTrackExcelFile}
                onExportPdf={handleExportPayTrackPdfFile}
                exportLoading={isLoading}

            />

            <DataTableExpandable
                data={payTrackBookingsForTable}
                columns={visiblepayTrackBookingColumns}
                pagination={payTrackBookingPaginationInfo}
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                emptyMessage='No Pay Track Booking Data Found'
                loading={isLoading}
                fixedHeight
                recordsPerPage={20}
                expandable={{
                    keyField: 'BookingId',
                    alwaysFetchOnOpen: false,

                    fetchRow: async (row) => {
                        return [
                            {
                                type: 'Stamp Duty',
                                total: row.StampDutyAmount || 0,
                                paid: row.ReceivedStampDutyAmount || 0,
                            },
                            {
                                type: 'Registration Fees',
                                total: row.RegistrationFees || 0,
                                paid: row.ReceivedRegistrationFees || 0,
                            },
                            {
                                type: 'Agreement Value',
                                total: row.AgreementValue || 0,
                                paid: row.ReceivedAgreementValue || 0,
                            },
                            {
                                type: 'Agreement Value GST',
                                total: row.AgreementValueGSTAmount || 0,
                                paid: row.ReceivedAgreementValueGSTAmount || 0,
                            },
                            {
                                type: 'Agreement Value TDS',
                                total: row.AgreementValueTDS || 0,
                                paid: row.ReceivedAgreementValueTDS || 0,
                            },

                            {
                                type: 'Other Charges Value',
                                total: row.OtherChargesAmount || 0,
                                paid: row.ReceivedOtherChargesAmount || 0,
                            },
                            {
                                type: 'Other Charges GST',
                                total: row.OtherChargesGSTAmount || 0,
                                paid: row.ReceivedOtherChargesGSTAmount || 0,
                            },


                        ];
                    },

                    renderRow: (fetchedData: PayTrackRow[]) => {

                        const totalAmount = fetchedData.reduce((sum, r) => sum + r.total, 0);
                        const totalPaid = fetchedData.reduce((sum, r) => sum + r.paid, 0);

                        const totalPending = totalAmount - totalPaid;

                        const dataWithTotal = [
                            ...fetchedData,
                            {
                                type: 'Total',
                                total: totalAmount,
                                paid: totalPaid,
                                pending: totalPending,
                                isTotal: true
                            }
                        ];

                        return (
                            <DataTableWithOutBorder
                                data={dataWithTotal}
                                columns={payTrackPaymentColumns}
                                emptyMessage="No Data Found"
                                recordsPerPage={20}
                                className="flex-1"
                                sortInfo={sortInfo}
                                onSort={handleSortColumn}
                                loading={isLoading}
                            />
                        );
                    },

                    expandButton: { openText: 'Hide', closeText: 'Show' }
                }}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizePayTrackColumnsModal}
                onClose={() => setIsShowCustomizePayTrackColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredPayTrackBookingColumnKeys])
                    );
                    setSelectedPayTrackBookingColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storePayTrackBookingTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={payTrackColumns}
                selectedKeys={selectedPayTrackBookingColumnKeys}
                requiredKeys={requiredPayTrackBookingColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Pay Track"
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
                size="small-half">

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Input
                                type="text"
                                label='Applicants Name'
                                value={tempFilters.ApplicantName || ''}
                                onChange={e => handleFilterChange('ApplicantName', e.target.value)}
                                placeholder="Enter Applicants Name"
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                label='Applicants Mobile Number'
                                value={tempFilters.ApplicantMobileNumber || ''}
                                onChange={e => handleFilterChange('ApplicantMobileNumber', e.target.value)}
                                placeholder="Enter Applicants Mobile Number"
                            />
                        </div>
                        <div>
                            <Input
                                type="text"
                                label='Wing'
                                value={tempFilters.Wing || ''}
                                onChange={e => handleFilterChange('Wing', e.target.value)}
                                placeholder="Enter Wing"
                            />
                        </div>
                        <div>
                            <Input
                                type="text"
                                label='Flat'
                                value={tempFilters.Flat || ''}
                                onChange={e => handleFilterChange('Flat', e.target.value)}
                                placeholder="Enter Flat"
                            />
                        </div>
                        <div>
                            <Input
                                type="text"
                                label='Floor'
                                value={tempFilters.Floor || ''}
                                onChange={e => handleFilterChange('Floor', e.target.value)}
                                placeholder="Enter Floor"
                            />
                        </div>
                        <div>
                            <Input
                                type="text"
                                label='Configuration'
                                value={tempFilters.Configuration || ''}
                                onChange={e => handleFilterChange('Configuration', e.target.value)}
                                placeholder="Enter Configuration"
                            />
                        </div>
                    </div>
                </div>
            </Modal>


        </div>
    )
}
export default PayTrack;
