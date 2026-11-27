
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    PreSaleEnquiryData,
    FilterWithPaginationPreSaleEnquiryRequest
} from '@/features/preSaleEnquiry/models/PreSaleEnquiryModel';
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import * as E from 'fp-ts/Either';
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Send } from "lucide-react";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { SOURCE_TYPE_OPTIONS, SUB_SUB_SOURCE_CHANNEL_PARTNER_OPTIONS, SUB_SUB_SOURCE_TYPE_OPTIONS, SUBSOURCE_TYPE_OPTIONS } from "@/core/constants/staticData";
import { filterNumbers } from "@/core/utils/fileValidation";
import { preSaleEnquiryService } from "@/features/preSaleEnquiry/services/PreSaleEnquiryService";
import { usePreSaleEnquiryListState } from "@/features/preSaleEnquiry/context/PreSaleEnquiryListStateContext";
import { getStatusColor } from "@/features/enquiry/pages/Status";

export const PreSaleEnquiry: React.FC = () => {

    const [preSaleEnquiryList, setPreSaleEnquiryList] = useState<PreSaleEnquiryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [isShowCustomizePreSaleEnquiryColumnsModal, setIsShowCustomizePreSaleEnquiryColumnsModal] = useState(false);
    const { canAction, canExport } = useMenuPermissions();
    const { listState, updateListState, resetFilters } = usePreSaleEnquiryListState();
    const { page, filters, sortInfo, searchTerm } = listState;
  
    const loadPreSaleEnquiry = useCallback(async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPreSaleEnquiryRequest = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    ProjectId: filterParams.ProjectId ? Number(filterParams.ProjectId) : undefined,
                    ProjectName: filterParams.ProjectName?.trim() || undefined,
                    PreSaleEnquiryId: filterParams.PreSaleEnquiryId ? Number(filterParams.PreSaleEnquiryId) : undefined,
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
                    FinalStage: filterParams.FinalStage || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, PreSaleEnquiryColumns)
                };

                const response = await preSaleEnquiryService.apiCallPullPreSaleEnquiry(params);

                if (E.isRight(response)) {

                    setPreSaleEnquiryList(response.right.Data);

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
            'Loading Pre Sale Enquiry'
        );
    }, [pagination.pageSize, addToast]);

    useEffect(() => {

        if (search && search.trim()) {
            updateListState({
                searchTerm: search.trim(),
                page: 1
            });
        }
    }, [search, updateListState]);

    useEffect(() => {

        const finalSearch = search || searchTerm;
        if (finalSearch && finalSearch.trim()) {

            loadPreSaleEnquiry(page, { Name: finalSearch.trim() }, sortInfo);
        } else {
            loadPreSaleEnquiry(page, filters, sortInfo);
        }
    }, [page, filters, sortInfo, searchTerm, search, loadPreSaleEnquiry]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    useEffect(() => {
        setTempFilters(filters);
    }, [filters]);

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

    const handleSearchPreSaleEnquiry = (searchValue: string) => {
        updateListState({ searchTerm: searchValue });
        debouncedSearch(searchValue);
    };

    const clearSearchPreSaleEnquiry = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        updateListState({
            searchTerm: '',
            page: 1
        });
        setTempFilters({});
        setSearchParams({});
    };

    const handleExportPreSaleEnquiry = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPreSaleEnquiryRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
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
                    FinalStage: filters.FinalStage || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, PreSaleEnquiryColumns),
                    ExportType: exportType,
                };

                const response = await preSaleEnquiryService.apiCallPullPreSaleEnquiry(params);

                handleExportFile(response, exportType, 'Pre Sale Enquiry', addToast);
                return response
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportPreSaleEnquiryExcel = () => handleExportPreSaleEnquiry('Excel')
    const handleExportPreSaleEnquiryPdf = () => handleExportPreSaleEnquiry('PDF')

    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [sortInfo, updateListState]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
    }, [updateListState]);

    const PreSaleEnquiryPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const PreSaleEnquiryForTable = useMemo(() => preSaleEnquiryList, [preSaleEnquiryList]);

    const handleNavigateToView = useCallback((row: PreSaleEnquiryData) => {
        updateListState({
            PreSaleEnquiryId: row.PreSaleEnquiryId ?? 0,
            Name: row.Name ?? '',
        });
        navigate('/customerInfo/view');
    }, [navigate, updateListState]);

    const handleAddPreSaleEnquiryModal = useCallback(() => {
        navigate('/customerInfo/add');
    }, [navigate]);

    const PreSaleEnquiryColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ProjectName',
            label: 'Project Name',
            sortable: true,
            align: 'left',
            render: (value,) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            )
        },
        {
            key: 'Name',
            label: 'Name',
            sortable: true,
            align: 'left',
            fixed: "left",
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
            render: (value, row) => value ? `${row.MobileNumberCountryCode || "+91"} ${value}` : '-'

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
            label: 'Timeline Of Purchase',
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
            render: (value, row) => value ? `${row.ChannelPartnerMobileNumberCountryCode || "+91"} ${value}` : '-'
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

                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            color="transparent"
                            isborderRadius
                            size="sm"
                            style={{
                                color: 'blue',
                                padding: '4px 8px',
                            }}
                            title="Send Pre Sale Enquiry"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                )
            }
        }

    ], [handleNavigateToView]);

    const requiredPreSaleEnquiryColumnKeys: string[] = ['Name', 'Actions'];

    const allPreSaleEnquiryColumnKeys: string[] = PreSaleEnquiryColumns.map(c => c.key);

    const [selectedPreSaleEnquiryColumnKeys, setSelectedPreSaleEnquiryColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getPreSaleEnquiryTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredPreSaleEnquiryColumnKeys]));

                return withRequired.filter(k => allPreSaleEnquiryColumnKeys.includes(k));
            }
        } catch { }
        return allPreSaleEnquiryColumnKeys;
    });

    useEffect(() => {
        setSelectedPreSaleEnquiryColumnKeys(prev => Array.from(new Set([...prev, ...requiredPreSaleEnquiryColumnKeys])).filter(k => allPreSaleEnquiryColumnKeys.includes(k)));
    }, [PreSaleEnquiryColumns.length])

    const VisiblePreSaleEnquiryColumns = useMemo(
        () => PreSaleEnquiryColumns.filter(col => selectedPreSaleEnquiryColumnKeys.includes(col.key)),
        [PreSaleEnquiryColumns, selectedPreSaleEnquiryColumnKeys]
    );

    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        resetFilters();
    };

    const handleFilterChange = (key: string, value: string | null) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={search || searchTerm}
                searchPlaceholder="Search By Name"
                onSearchChange={handleSearchPreSaleEnquiry}
                onClearSearch={clearSearchPreSaleEnquiry}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizePreSaleEnquiryColumnsModal(true)}

                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddPreSaleEnquiryModal}

                isShowImportButton={false}

                isShowExportButton={canExport && PreSaleEnquiryForTable.length > 0}
                onExportExcel={handleExportPreSaleEnquiryExcel}
                onExportPdf={handleExportPreSaleEnquiryPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={PreSaleEnquiryForTable}
                columns={VisiblePreSaleEnquiryColumns}
                pagination={PreSaleEnquiryPaginationInfo}
                emptyMessage="No Pre Sale Enquiry Data Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizePreSaleEnquiryColumnsModal}
                onClose={() => setIsShowCustomizePreSaleEnquiryColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredPreSaleEnquiryColumnKeys])
                    );
                    setSelectedPreSaleEnquiryColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storePreSaleEnquiryTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={PreSaleEnquiryColumns}
                selectedKeys={selectedPreSaleEnquiryColumnKeys}
                requiredKeys={requiredPreSaleEnquiryColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Pre Sale Enquiry"
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
                        <Input type="text" label="Project Name" value={tempFilters?.ProjectName ?? ''} onChange={e => handleFilterChange('ProjectName', e.target.value)} placeholder="Enter Project Name" />
                    </div>

                    <div>
                        <Input type="text" label="Name" value={tempFilters?.Name ?? ''} onChange={e => handleFilterChange('Name', e.target.value)} placeholder="Enter Name" />
                    </div>

                    <div>
                        <Input type="text" label="Mobile Number" value={tempFilters?.MobileNumber ?? ''} onChange={e => handleFilterChange('MobileNumber', filterNumbers(e.target.value))} placeholder="Enter Mobile Number" />
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

                    {tempFilters.Source === 'Direct Walkin' && (
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

                    {tempFilters.Source === 'Direct Walkin' &&
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
                        <Input type="text" label="Final Stage" value={tempFilters?.FinalStage ?? ''} onChange={e => handleFilterChange('FinalStage', e.target.value)} placeholder="Enter Final Stage" />
                    </div>

                </div>
            </Modal>

        </div>
    );
}
export default PreSaleEnquiry;