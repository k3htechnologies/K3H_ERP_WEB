import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CallingDataData, FilterWithPaginationCallingDataRequest } from "@/features/callTracker/models/CallingDataModel";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { handleExportFile } from "@/core/utils/exportFile";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";
import { Modal } from "@/ui/components/Modal/Modal";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { callingDataService } from "@/features/callTracker/services/CallingDataService";
import * as E from 'fp-ts/Either';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";


export default function CallingData() {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [filters, setFilters] = useState<FilterInfo>({});

    //#region MENU PERMISSIONS
    const { canExport, canAction } = useMenuPermissions();
    //#endregion

    //EXCEL IMPORT 
    const [showImportModal, setShowImportModal] = useState(false);

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    const { projectId } = useProject();

    // TOAST
    const { addToast } = useToast();

    // STATE
    const [CallingDataList, setCallingDataList] = useState<CallingDataData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeCallingDataColumnsModal, setIsShowCustomizeCallingDataColumnsModal] = useState(false);

    //#region DATA LOADING | FETCH |  LOAD | SEARCH
    const fetchCallingData = async (page: number = pagination.currentPage) => {
        return await loadCallingData(page, filters);
    };

    const loadCallingData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCallingDataRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    Name: searchText?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    MobileNumber: filterParams.MobileNumber ? Number(filterParams.MobileNumber) : undefined,
                    SortBy: getSortByParam(sort ?? null, CallingDataColumns),
                };

                const response = await callingDataService.apiCallPullCallingData(params);

                if (E.isRight(response)) {
                    setCallingDataList(response.right.Data);
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
            'Loading Calling Data'
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadCallingData(1, filters, sortInfo, searchTerm);
    }, [projectId]);
    //#endregion

    //#region SEARCH HANDLERS
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadCallingData(1, filters, sortInfo, value);
    };

    //#region CLEAR HANDLERS
    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadCallingData(1, filters, sortInfo, '');
    };
    //#endregion

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadCallingData(page, filters, sortInfo, searchTerm);
    };
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });

        loadCallingData(1, filters, sort, searchTerm);
    }, [searchTerm]);
    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportCallingData = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCallingDataRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    Name: filters.Name?.trim() || undefined,
                    ProjectId: Number(projectId),
                    SortBy: getSortByParam(sortInfo ?? null, CallingDataColumns),
                    ExportType: exportType
                };

                const response = await callingDataService.apiCallPullCallingData(params);

                handleExportFile(response, exportType, 'Calling Data', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportCallingDataExcel = () => handleExportCallingData('Excel')
    const handleExportCallingDataPdf = () => handleExportCallingData('PDF')
    //#endregion

    //#region IMPORT EXCEL | DOWNLOAD
    const uploadExcel = async (file: File, mergeExisting: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const fd = new FormData();

                fd.append("ExcelFile", file);
                fd.append("IsAllDelete", mergeExisting);
                fd.append("TableName", 'Calling Data');
                fd.append("ProjectId", String(projectId));

                const response = await technicalService.apiCallExcelImport(fd);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: "Excel imported sucessfully" })

                    fetchCallingData();

                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (err: any) => addToast({ type: "error", title: err.message }),
            undefined,
            "Importing Excel"
        );
    };

    const downloadExcelSampleCallingData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterPullExcelSample = {
                    TableName: 'CALLING DATA'
                }

                const response = await technicalService.apiCallPullExcelSample(params);

                handleExportFile(response, 'Excel', 'Calling Data', addToast, 'Sample file download successfully')

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
    const handleDownloadExcelSampleCallingData = () => downloadExcelSampleCallingData()
    //#endregion

    //#region CALLIING DATA TABLE COLUMNS
    const CallingDataColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'Name',
            label: 'Customer Name',
            width: '25',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            ),
        },
        {
            key: 'Address',
            label: 'Location',
            width: '25',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            ),
        },
        {
            key: 'MobileNumber',
            label: 'Phone Number',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'EmailId',
            label: 'E-mail ID',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
    ], []);
    //#endregion

    //#region CALLING DATA COLUMN CUSTOMIZATION
    const requiredCallingDataColumnKeys: string[] = ['Name'];

    const allCallingDataColumnKeys: string[] = CallingDataColumns.map(c => c.key);

    const [selectedCallingDataColumnKeys, setSelectedCallingDataColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getCallingDataTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([
                    ...parsed, ...requiredCallingDataColumnKeys]));

                return withRequired.filter(k => allCallingDataColumnKeys.includes(k));
            }
        } catch { }
        return allCallingDataColumnKeys;
    });

    useEffect(() => {
        setSelectedCallingDataColumnKeys(prev => Array.from(new Set([...prev, ...requiredCallingDataColumnKeys])).filter(k => allCallingDataColumnKeys.includes(k)));
    }, [CallingDataColumns.length])

    const visibleCallingDataColumns = useMemo(
        () => CallingDataColumns.filter(col => selectedCallingDataColumnKeys.includes(col.key)),
        [CallingDataColumns, selectedCallingDataColumnKeys]
    );

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadCallingData(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };
    //#endregion

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });

        loadCallingData(1, {}, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region CALLING DATA TABLE PAGINATION INFO
    const CallingDataPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const CallingDataForTable = useMemo(() => CallingDataList, [CallingDataList]);
    //#region

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Customer Name"
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
                    setIsShowCustomizeCallingDataColumnsModal(true);
                }}

                isShowImportButton={canAction && CallingDataForTable.length > 0}
                onDownloadSampleExcel={handleDownloadExcelSampleCallingData}
                onUploadExcel={() => setShowImportModal(true)}

                // EXPORT
                isShowExportButton={canExport && CallingDataForTable.length > 0}
                onExportExcel={handleExportCallingDataExcel}
                onExportPdf={handleExportCallingDataPdf}
                exportLoading={isLoading}
            />

            {/* DATA TABLE */}

            <DataTable
                data={CallingDataForTable}
                columns={visibleCallingDataColumns}
                pagination={CallingDataPaginationInfo}
                emptyMessage="No Calling Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* CALLING DATA CUSTOMIZE COLUMNS MODAL */}

            <CustomizeColumnsModal
                isOpen={isShowCustomizeCallingDataColumnsModal}
                onClose={() => setIsShowCustomizeCallingDataColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredCallingDataColumnKeys])
                    );
                    setSelectedCallingDataColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeCallingDataTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={CallingDataColumns}
                selectedKeys={selectedCallingDataColumnKeys}
                requiredKeys={requiredCallingDataColumnKeys}
                title="Customize Table Columns"
            />


            {/* FILTER MODAL FOR CALLING DATA */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Calling Data"
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
                </div>
            </Modal>

            <ExportImport
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onUpload={(file, mergeExisting) => {
                    setShowImportModal(false);
                    uploadExcel(file, mergeExisting);
                }}
            />
        </div>
    );
}