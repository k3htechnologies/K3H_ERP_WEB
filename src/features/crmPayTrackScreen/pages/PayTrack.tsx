import React, { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type SortInfo, type TableColumn, type FilterInfo, type PaginationInfo } from '@/ui/components/DataTable/DataTable';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import type {
    PayTrackBookingData,
    FilterWithPaginationPayTrackBooking
} from '@/features/crmPayTrackScreen/models/PayTrackBookingModel';

import { payTrackBookingService } from '@/features/crmPayTrackScreen/services/PayTrackBookingService';
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

const PayTrack: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [payTrackList, setPayTrackList] = useState<PayTrackBookingData[]>([]);
    const { pagination, setPagination } = usePagination(20);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    const navigate = useNavigate();

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchApplicantsName(value);
    }, 350);

    const { addToast } = useToast();

    const { projectId } = useProject();

    //#region MENU PERMISSIONS
    const { canExport } = useMenuPermissions();
    //#endregion

    const payTrackListForTable = useMemo(() => payTrackList, [payTrackList]);

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizePayTrackColumnsModal, setIsShowCustomizePayTrackColumnsModal] = useState(false);

    //#region VIEW BOOKING DETAILS
    const handleViewPayTrackBookingDetails = (row: PayTrackBookingData) => {
        navigate(`/viewPayTrack/${row.BookingId}`)
    }

    function getAgreementDetails(agreement: number, received: number) {
        const agreementK = Math.round(agreement / 1000);
        const receivedK = Math.round(received / 1000);

        const receivedPercentage = agreement ? Math.round((received / agreement) * 100) : 0;

        return {
            agreementText: `₹${agreementK}k / ₹${receivedK}k`,
            percentageText: `${receivedPercentage}%`,
            percentage: receivedPercentage
        };
    }

    function getGstAmountDetails(agreementValueGST: number, receivedValueGST: number) {
        const agreementGSTk = Math.round(agreementValueGST / 1000);
        const receivedGSTk = Math.round(receivedValueGST / 1000);

        const receivedGSTPercentage = agreementValueGST ? Math.round((receivedValueGST / agreementValueGST) * 100) : 0;

        return {
            agreementGSTText: `₹${agreementGSTk}k / ₹${receivedGSTk}k`,
            receivedGSTPercentageText: `${receivedGSTPercentage}%`,
            receivedGSTPercentage: receivedGSTPercentage
        };
    }

    function getStampDutyDetails(agreementValueStampDuty: number, receivedValueStampDuty: number) {
        const agreementStampDutyk = Math.round(agreementValueStampDuty / 1000);
        const receivedStampDutyk = Math.round(receivedValueStampDuty / 1000);

        const receivedStampDutyPercentage = agreementValueStampDuty ? Math.round((receivedValueStampDuty / agreementValueStampDuty) * 100) : 0;

        return {
            agreementStampDutyText: `₹${agreementStampDutyk}k / ₹${receivedStampDutyk}k`,
            receivedStampDutyPercentageText: `${receivedStampDutyPercentage}%`,
            receivedStampDutyPercentage: receivedStampDutyPercentage
        };
    }

    function getTDSDetails(agreementValueTDS: number, receivedValueTDS: number) {
        const agreementTDSk = Math.round(agreementValueTDS / 1000);
        const receivedTDSk = Math.round(receivedValueTDS / 1000);

        const receivedTDSPercentage = agreementValueTDS ? Math.round((receivedValueTDS / agreementValueTDS) * 100) : 0;

        return {
            agreementTDSText: `₹${agreementTDSk}k / ₹${receivedTDSk}k`,
            receivedTDSPercentageText: `${receivedTDSPercentage}%`,
            receivedTDSPercentage: receivedTDSPercentage
        };
    }

    function getRegistrationFeesDetails(agreementValueRegistrationFees: number, receivedValueRegistrationFees: number) {
        const agreementRegistrationFeesk = Math.round(agreementValueRegistrationFees / 1000);
        const receivedRegistrationFeesk = Math.round(receivedValueRegistrationFees / 1000);

        const receivedRegistrationFeesPercentage = agreementValueRegistrationFees ? Math.round((receivedValueRegistrationFees / agreementValueRegistrationFees) * 100) : 0;

        return {
            agreementRegistrationFeesText: `₹${agreementRegistrationFeesk}k / ₹${receivedRegistrationFeesk}k`,
            receivedRegistrationFeesPercentageText: `${receivedRegistrationFeesPercentage}%`,
            receivedRegistrationFeesPercentage: receivedRegistrationFeesPercentage
        };
    }


    //#region TABLE COLUMN
    const payTrackColumns = useMemo<TableColumn[]>(
        () => [


            {
                key: 'ApplicantName',
                label: 'Applicant Name',
                width: '14',
                align: 'left',
                // Tooltip
                render: (value, row) => (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="min-w-0">
                                <TooltipText
                                    text={value || '-'}
                                    maxWidth="260px"
                                    tooltipThreshold={26}
                                    onClick={() => handleViewPayTrackBookingDetails(row)}
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
                align: 'left',
                render: value => value || '-'

            },
            {
                key: 'ApplicantMobileNumber',
                label: 'Applicant Mobile Number',
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
                key: 'Flat',
                label: 'Flat',
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
                key: 'FlatConfiguration',
                label: 'Configuration ',
                width: '14',
                align: 'left',
                render: value => value || '-'

            },
            {
                key: 'RegistrationDate',
                label: 'Registration Date ',
                width: '14',
                align: 'left',
                render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')


            },
            {
                key: 'AgreementValue',
                label: 'Agreement Value',
                width: '14',
                align: 'left',
                render: (_, row) => {
                    const { agreementText, percentageText, percentage } = getAgreementDetails(row.AgreementValue, row.ReceivedAgreementValue);
                    let fillColor = 'bg-red-500';
                    let trackColor = 'bg-red-100';

                    if (percentage <= 50) {
                        fillColor = 'bg-red-500';
                        trackColor = 'bg-red-100';
                    } else if (percentage < 100) {
                        fillColor = 'bg-yellow-500';
                        trackColor = 'bg-yellow-100';
                    } else {
                        fillColor = 'bg-green-500';
                        trackColor = 'bg-green-100';
                    }

                    return (
                        <div className="flex flex-col gap-1 w-full min-w-[140px]">
                            <span className="text-[14px] text-gray-800">{agreementText}</span>

                            <div className="flex items-center gap-2">

                                <div className={`flex-1 h-2.5 rounded-full ${trackColor} overflow-hidden`}>
                                    <div
                                        className={`h-full rounded-full ${fillColor}`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>

                                <span className="text-[14px] text-gray-800">{percentageText}</span>

                            </div>
                        </div>
                    );
                }

            },
            {
                key: 'AgreementValueGSTAmount',
                label: 'GST',
                width: '14',
                align: 'left',
                render: (_, row) => {
                    const { agreementGSTText, receivedGSTPercentageText, receivedGSTPercentage } = getGstAmountDetails(row.AgreementValueGSTAmount, row.ReceivedAgreementValueGSTAmount);
                    let fillColor = 'bg-red-500';
                    let trackColor = 'bg-red-100';

                    if (receivedGSTPercentage <= 50) {
                        fillColor = 'bg-red-500';
                        trackColor = 'bg-red-100';
                    } else if (receivedGSTPercentage < 100) {
                        fillColor = 'bg-yellow-500';
                        trackColor = 'bg-yellow-100';
                    } else {
                        fillColor = 'bg-green-500';
                        trackColor = 'bg-green-100';
                    }

                    return (
                        <div className="flex flex-col gap-1 w-full min-w-[140px]">
                            <span className="text-[14px] text-gray-800">{agreementGSTText}</span>

                            <div className="flex items-center gap-2">

                                <div className={`flex-1 h-2.5 rounded-full ${trackColor} overflow-hidden`}>
                                    <div
                                        className={`h-full rounded-full ${fillColor}`}
                                        style={{ width: `${Math.min(receivedGSTPercentage, 100)}%` }}
                                    />
                                </div>

                                <span className="text-[14px] text-gray-800">{receivedGSTPercentageText}</span>

                            </div>
                        </div>
                    );
                }

            },
            {
                key: 'StampDutyAmount',
                label: 'Stamp Duty',
                width: '14',
                align: 'left',
                render: (_, row) => {
                    const { agreementStampDutyText, receivedStampDutyPercentageText, receivedStampDutyPercentage } = getStampDutyDetails(row.StampDutyAmount, row.ReceivedStampDutyAmount);
                    let fillColor = 'bg-red-500';
                    let trackColor = 'bg-red-100';

                    if (receivedStampDutyPercentage <= 50) {
                        fillColor = 'bg-red-500';
                        trackColor = 'bg-red-100';
                    } else if (receivedStampDutyPercentage < 100) {
                        fillColor = 'bg-yellow-500';
                        trackColor = 'bg-yellow-100';
                    } else {
                        fillColor = 'bg-green-500';
                        trackColor = 'bg-green-100';
                    }

                    return (
                        <div className="flex flex-col gap-1 w-full min-w-[140px]">
                            <span className="text-[14px] text-gray-800">{agreementStampDutyText}</span>

                            <div className="flex items-center gap-2">

                                <div className={`flex-1 h-2.5 rounded-full ${trackColor} overflow-hidden`}>
                                    <div
                                        className={`h-full rounded-full ${fillColor}`}
                                        style={{ width: `${Math.min(receivedStampDutyPercentage, 100)}%` }}
                                    />
                                </div>

                                <span className="text-[14px] text-gray-800">{receivedStampDutyPercentageText}</span>

                            </div>
                        </div>
                    );
                }

            },
            {
                key: 'AgreementValueTDS',
                label: 'TDS',
                width: '14',
                align: 'left',
                render: (_, row) => {
                    const { agreementTDSText, receivedTDSPercentageText, receivedTDSPercentage } = getTDSDetails(row.AgreementValueTDS, row.ReceivedAgreementValueTDS);
                    let fillColor = 'bg-red-500';
                    let trackColor = 'bg-red-100';

                    if (receivedTDSPercentage <= 50) {
                        fillColor = 'bg-red-500';
                        trackColor = 'bg-red-100';
                    } else if (receivedTDSPercentage < 100) {
                        fillColor = 'bg-yellow-500';
                        trackColor = 'bg-yellow-100';
                    } else {
                        fillColor = 'bg-green-500';
                        trackColor = 'bg-green-100';
                    }

                    return (
                        <div className="flex flex-col gap-1 w-full min-w-[140px]">
                            <span className="text-[14px] text-gray-800">{agreementTDSText}</span>

                            <div className="flex items-center gap-2">

                                <div className={`flex-1 h-2.5 rounded-full ${trackColor} overflow-hidden`}>
                                    <div
                                        className={`h-full rounded-full ${fillColor}`}
                                        style={{ width: `${Math.min(receivedTDSPercentage, 100)}%` }}
                                    />
                                </div>

                                <span className="text-[14px] text-gray-800">{receivedTDSPercentageText}</span>

                            </div>
                        </div>
                    );
                }

            },
            {
                key: 'RegistrationFees',
                label: 'Registration Fees',
                width: '14',
                align: 'left',
                render: (_, row) => {
                    const { agreementRegistrationFeesText, receivedRegistrationFeesPercentageText, receivedRegistrationFeesPercentage } = getRegistrationFeesDetails(row.RegistrationFees, row.ReceivedRegistrationFees);
                    let fillColor = 'bg-red-500';
                    let trackColor = 'bg-red-100';

                    if (receivedRegistrationFeesPercentage <= 50) {
                        fillColor = 'bg-red-500';
                        trackColor = 'bg-red-100';
                    } else if (receivedRegistrationFeesPercentage < 100) {
                        fillColor = 'bg-yellow-500';
                        trackColor = 'bg-yellow-100';
                    } else {
                        fillColor = 'bg-green-500';
                        trackColor = 'bg-green-100';
                    }

                    return (
                        <div className="flex flex-col gap-1 w-full min-w-[140px]">
                            <span className="text-[14px] text-gray-800">{agreementRegistrationFeesText}</span>

                            <div className="flex items-center gap-2">

                                <div className={`flex-1 h-2.5 rounded-full ${trackColor} overflow-hidden`}>
                                    <div
                                        className={`h-full rounded-full ${fillColor}`}
                                        style={{ width: `${Math.min(receivedRegistrationFeesPercentage, 100)}%` }}
                                    />
                                </div>

                                <span className="text-[14px] text-gray-800">{receivedRegistrationFeesPercentageText}</span>

                            </div>
                        </div>
                    );
                }


            },

        ], []
    );

    const requiredPayTrackColumnKeys: string[] = ['ApplicantName', 'ApplicantMobileNumber', 'RegistrationDate', 'AgreementValue', 'AgreementValueGSTAmount', 'AgreementValueTDS', 'RegistrationFees', 'StampDutyAmount'];

    const allPayTrackColumnKeys: string[] = payTrackColumns.map(c => c.key);

    const [selectedPayTrackColumnKeys, setSelectedPayTrackColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getCallingDataTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([
                    ...parsed, ...requiredPayTrackColumnKeys]));

                return withRequired.filter(k => allPayTrackColumnKeys.includes(k));
            }
        } catch { }
        return allPayTrackColumnKeys;
    });

    useEffect(() => {
        setSelectedPayTrackColumnKeys(prev => Array.from(new Set([...prev, ...requiredPayTrackColumnKeys])).filter(k => allPayTrackColumnKeys.includes(k)));
    }, [payTrackColumns.length])

    const visiblePayTrackColumns = useMemo(
        () => payTrackColumns.filter(col => selectedPayTrackColumnKeys.includes(col.key)),
        [payTrackColumns, selectedPayTrackColumnKeys]
    );

    const searchApplicantsName = async (value: string) => {
        setSearchTerm(value);
        loadPayTrackList(1, tempFilters, sortInfo, value);
    }

    useEffect(() => {
        if (!projectId) return;

        loadPayTrackList(pagination.currentPage, tempFilters, sortInfo, searchTerm);

    }, [projectId]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.();
        };
    }, [debouncedSearch]);

    const handlePageChange = (page: number) => {
        loadPayTrackList(page, tempFilters, sortInfo, searchTerm);
    };

    const handleSortColumn = (sort: SortInfo) => {
        setSortInfo(sort);
        loadPayTrackList(1, tempFilters, sort, searchTerm);
    };

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion


    //#region PAGINATION
    const handlePaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const handleClearApplicantsName = () => {

        debouncedSearch.cancel?.();

        setSearchTerm('');

        setSortInfo(undefined);


        loadPayTrackList(1, tempFilters, undefined, '');
    }

    //#endregion

    const handleExportPayTrackExcelFile = () => handleExportPayTrackExcel('Excel');
    const handleExportPayTrackPdfFile = () => handleExportPayTrackExcel('PDF');

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

    //#region DATA LOADING |  LOAD | SEARCH 
    const loadPayTrackList = async (pageNum: number, filterParams: FilterInfo, sortInfoParam?: SortInfo, searchKeyword: string = searchTerm) => {
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
                    ApplicantName: searchKeyword || undefined,
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
            'Loading PayTrack List'
        )

    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Applicant Name"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}

                //Customize Table
                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizePayTrackColumnsModal(true);
                }}


                onClearSearch={handleClearApplicantsName}
                isShowFilterButton
                filters={tempFilters}
                onOpenFilter={() => {
                    setTempFilters(tempFilters);
                    setShowFilterPopup(true);
                }}
                // EXPORT
                isShowExportButton={canExport && payTrackListForTable.length === 0 ? false : true}
                onExportExcel={handleExportPayTrackExcelFile}
                onExportPdf={handleExportPayTrackPdfFile}
                exportLoading={isLoading}

            />

            <DataTable
                data={payTrackListForTable}
                columns={visiblePayTrackColumns}
                sortInfo={sortInfo}
                emptyMessage="No Pay Track List Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                onSort={handleSortColumn}
                pagination={handlePaginationInfo}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizePayTrackColumnsModal}
                onClose={() => setIsShowCustomizePayTrackColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredPayTrackColumnKeys])
                    );
                    setSelectedPayTrackColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeCallingDataTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={payTrackColumns}
                selectedKeys={selectedPayTrackColumnKeys}
                requiredKeys={requiredPayTrackColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title='CRM Pay Track Filter'
                onSubmit={e => {
                    e.preventDefault();
                    loadPayTrackList(1, tempFilters, sortInfo, searchTerm);
                    setShowFilterPopup(false);
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => {
                    setTempFilters({});
                    loadPayTrackList(1, {}, sortInfo, searchTerm);
                    setShowFilterPopup(false);
                }}
                size="small-half"

            >

                <div className="space-y-6">
                    <div className="space-y-4">
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
                    </div>
                </div>
            </Modal>
        </div>
    )
}
export default PayTrack;
