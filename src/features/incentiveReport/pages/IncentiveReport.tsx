import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { IncentiveReportData, FilterWithPaginationIncentiveReportRequest } from '@/features/incentiveReport/models/IncentiveReportModel';
import { incentiveReportService } from '@/features/incentiveReport/services/IncentiveReportService';
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
import { useIncentiveReportListState } from '@/features/incentiveReport/context/IncentiveReportListStateContext';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { SOURCE_TYPE_OPTIONS, SUB_SUB_SOURCE_CHANNEL_PARTNER_OPTIONS, SUBSOURCE_TYPE_OPTIONS } from '@/core/constants';

export const IncentiveReport: React.FC = () => {
    //#region STATE
    const [incentiveReportList, setIncentiveReportList] = useState<IncentiveReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();

    const [showFilterPopup, setShowFilterPopup] = useState(false);

    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [isShowCustomizeIncentiveReportColumnsModal, setIsShowCustomizeIncentiveReportColumnsModal] = useState(false);

    const { canAction, canExport } = useMenuPermissions();

    //#endregion

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject()
    //#endregion

    //#region BOOKING LIST STATE CONTEXT
    const { listState, updateListState, resetFilters, clearIncentiveReportContext } = useIncentiveReportListState();

    const { page, filters, sortInfo, searchTerm } = listState;
    //#endregion

    //#region DATA LOAD INCENTIVE REPORT

    const loadIncentiveReport = async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationIncentiveReportRequest = {
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
                    SortBy: getSortByParam(sortInfo ?? null, incentiveReportColumns)
                };

                const response = await incentiveReportService.apiCallPullIncentiveReport(params);

                if (E.isRight(response)) {

                    setIncentiveReportList(response.right.Data);

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
            'Loading Incentive Report'
        );
    };

    //#endregion

    //#region INIT
    useEffect(() => {

        if (!projectId) return;

        clearIncentiveReportContext();

        if (searchTerm && searchTerm.trim()) {

            loadIncentiveReport(page, { ApplicantName: searchTerm.trim() }, sortInfo);

        } else {

            loadIncentiveReport(page, filters, sortInfo);

        }
    }, [projectId, page, filters, sortInfo, searchTerm, clearIncentiveReportContext]);


    useEffect(() => {

        setPagination({ currentPage: page });

    }, [page]);

    useEffect(() => {

        setTempFilters(filters);

    }, [filters]);

    //#endregion

    //#region SEARCH INCENTIVE REPORT FILTER

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

    const searchIncentiveReport = (searchValue: string) => {

        updateListState({ searchTerm: searchValue });

        debouncedSearch(searchValue, false);
    };

    //#endregion

    //#region CLEAR SEARCH INCENTIVE REPORT
    const clearSearchIncentiveReport = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        setTempFilters({});
    };

    //#endregion

    //#region  EXCEL EXPORT TO EXCEL | PDF
    const handleExportIncentiveReport = async (exportType: 'Excel' | 'PDF' | 'BOOKING FORM PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {


                const params: FilterWithPaginationIncentiveReportRequest = {
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
                    SortBy: getSortByParam(null, incentiveReportColumns),
                    ExportType: exportType
                };

                const response = await incentiveReportService.apiCallPullIncentiveReport(params);

                if (exportType === 'BOOKING FORM PDF') {

                    handleExportFile(response, 'PDF', 'Incentive Report Form', addToast);
                } else {
                    handleExportFile(response, exportType, 'Incentive Report', addToast);
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

    const handleExportIncentiveReportExcel = () => handleExportIncentiveReport('Excel');
    const handleExportIncentiveReportPdf = () => handleExportIncentiveReport('PDF');

    //#endregion

    //#region TABLE CONFIG
    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [updateListState]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
    }, [updateListState]);

    const incentiveReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const incentiveReportForTable = useMemo(() => incentiveReportList, [incentiveReportList]);
    //#endregion

    //#region VIEW INCENTIVE DETAILS
    const handleViewIncentiveReportDetails = useCallback((row: IncentiveReportData) => {
        updateListState({
            bookingId: row.BookingId ?? 0,
            bookingName: row.ApplicantName ?? '',
        });
        navigate('/incentiveReport/view');
    }, [navigate, updateListState]);
    //#endregion



    //#region TABLE COLUMN
    const incentiveReportColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'SystemGeneratedCode',
                label: 'Enquiry Code',
                width: '20',
                sortable: true,
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
                                    onClick={() => handleViewIncentiveReportDetails(row)}
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
                sortable: true,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'BuildingNumber',
                label: 'Building',
                width: '10',
                sortable: false,
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
                key: 'Flat',
                label: 'Flat',
                width: '12',
                sortable: true,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'RERACarpetAreaSqFt',
                label: 'RERA Carpet Area (SqFt )',
                width: '12',
                sortable: true,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'FlatConfiguration',
                label: 'Flat Configuration',
                width: '12',
                sortable: true,
                align: 'left',
                render: value => value || '-'
            },
            {
                key: 'AgreementValue',
                label: 'Agreement Value (₹)',
                width: '18',
                sortable: true,
                align: 'right',
                render: value => value ? `₹${Number(value).toLocaleString('en-IN')}` : '-'
            },
            {
                key: 'Brokerage',
                label: 'Brokerage (%) / Amount (₹)',
                width: '22',
                sortable: false,
                align: 'right',
                render: (_, row) => {
                    if (!row.BrokeragePercentage && !row.BrokerageAmount) return '-';

                    return `${Number(row.BrokeragePercentage ?? 0).toFixed(2)}% / ₹${Number(row.BrokerageAmount ?? 0).toLocaleString('en-IN')}`;
                }
            },
            {
                key: 'Referral',
                label: 'Referral (%) / Amount (₹)',
                width: '22',
                sortable: false,
                align: 'right',
                render: (_, row) => {
                    if (!row.ReferralPercentage && !row.ReferralAmount) return '-';

                    return `${Number(row.ReferralPercentage ?? 0).toFixed(2)}% / ₹${Number(row.ReferralAmount ?? 0).toLocaleString('en-IN')}`;
                }
            },
            {
                key: 'Loyalty',
                label: 'Loyalty (%) / Amount (₹)',
                width: '22',
                sortable: false,
                align: 'right',
                render: (_, row) => {
                    if (!row.LoyaltyPercentage && !row.LoyaltyAmount) return '-';

                    return `${Number(row.LoyaltyPercentage ?? 0).toFixed(2)}% / ₹${Number(row.LoyaltyAmount ?? 0).toLocaleString('en-IN')}`;
                }
            },
            {
                key: 'EmployeeReferencePercentage',
                label: 'Employee Reference (%) / Amount (₹)',
                width: '22',
                sortable: false,
                align: 'right',
                render: (_, row) => {
                    if (!row.EmployeeReferencePercentage && !row.EmployeeReferenceAmount) return '-';

                    return `${Number(row.EmployeeReferencePercentage ?? 0).toFixed(2)}% / ₹${Number(row.EmployeeReferenceAmount ?? 0).toLocaleString('en-IN')}`;
                }
            },


        ],
        [canAction, handleViewIncentiveReportDetails]
    );
    //#endregion

    //#region CUSTOMIZE COLUMNS
    const requiredIncentiveReportColumnKeys: string[] = ['ApplicantName', 'Actions'];

    const allIncentiveReportColumnKeys: string[] = incentiveReportColumns.map(c => c.key);

    const [selectedIncentiveReportColumnKeys, setSelectedIncentiveReportColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getIncentiveReportTableColumns?.();
            if (saved) {
                const parsed = JSON.parse(saved) as string[];
                const withRequired = Array.from(new Set([...parsed, ...requiredIncentiveReportColumnKeys]));
                return withRequired.filter(k => allIncentiveReportColumnKeys.includes(k));
            }
        } catch {
            // ignore
        }
        return allIncentiveReportColumnKeys;
    });

    useEffect(() => {
        setSelectedIncentiveReportColumnKeys(prev =>
            Array.from(new Set([...prev, ...requiredIncentiveReportColumnKeys])).filter(k =>
                allIncentiveReportColumnKeys.includes(k)
            )
        );

    }, [incentiveReportColumns.length]);

    const visibleIncentiveReportColumns = useMemo(
        () => incentiveReportColumns.filter(col => selectedIncentiveReportColumnKeys.includes(col.key)),
        [incentiveReportColumns, selectedIncentiveReportColumnKeys]
    );
    //#endregion

    //#region  HANDLE CHANGE EVENT

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };

    //#endregion


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Applicant Name"
                onSearchChange={searchIncentiveReport}
                onClearSearch={clearSearchIncentiveReport}
                isShowFilterButton
                filters={tempFilters}
                onOpenFilter={() => {
                    setTempFilters(tempFilters);
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeIncentiveReportColumnsModal(true)}
                // IMPORT
                isShowImportButton={false}

                // EXPORT
                isShowExportButton={canExport && incentiveReportForTable.length > 0}
                onExportExcel={handleExportIncentiveReportExcel}
                onExportPdf={handleExportIncentiveReportPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={incentiveReportForTable}
                columns={visibleIncentiveReportColumns}
                pagination={incentiveReportPaginationInfo}
                emptyMessage="No Data Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={undefined}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeIncentiveReportColumnsModal}
                onClose={() => setIsShowCustomizeIncentiveReportColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(new Set([...keys, ...requiredIncentiveReportColumnKeys]));
                    setSelectedIncentiveReportColumnKeys(withRequired);
                    try {
                        LocalStorageHelper.storeIncentiveReportTableColumns?.(JSON.stringify(withRequired));
                    } catch {
                        // ignore
                    }
                }}
                columns={incentiveReportColumns}
                selectedKeys={selectedIncentiveReportColumnKeys}
                requiredKeys={requiredIncentiveReportColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Incentive Report"
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
                    setShowFilterPopup(false);
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
                                    options={SUBSOURCE_TYPE_OPTIONS.filter(opt => opt.id !== 'Advertisement' && opt.id !== 'Exhibition' && opt.id !== 'HRR Website' && opt.id !== 'HRR Website' && opt.id !== 'Management Reference' && opt.id !== 'Property Search Portal' && opt.id !== 'SMS' && opt.id !== 'Site Branding' && opt.id !== 'Other')
                                        .map(opt => ({
                                            label: opt.name,
                                            value: opt.id
                                        }))
                                    }
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
            </Modal >
        </div >
    );
};

export default IncentiveReport;


