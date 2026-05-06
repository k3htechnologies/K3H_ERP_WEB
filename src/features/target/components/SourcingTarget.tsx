import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { technicalService } from '@/features/technical/services/TechnicalService';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import type { FilterWithPaginationSourcingTargetRequest, SourcingTargetData } from '@/features/target/models/SourcingTargetModel';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { sourcingTargetService } from '@/features/target/services/SourcingTargetService';
import MonthPicker from '@/ui/components/forms/MonthPicker';

export const SourcingTarget: React.FC = () => {
    //#region STATE
    const [sourcingTargetList, setSourcingTargetList] = useState<SourcingTargetData[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [monthYear, setMonthYear] = useState<string | null>(null);
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchEmployee(value);
    }, 350);

    //EXCEL IMPORT 
    const [showImportModal, setShowImportModal] = useState(false);

    const { canAction, canExport } = useMenuPermissions();

    const { projectId } = useProject();

    //#endregion

    //#region INIT

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.();
        };
    }, [debouncedSearch]);


    useEffect(() => {
        
        if (!monthYear || !projectId) return;

        loadSourcingTarget(1, sortInfo, searchTerm?.trim());

    }, [projectId,monthYear]);
    //#endregion

    //#region DATA LOAD
    const fetchSourcingTargetList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadSourcingTarget(page, sort ?? sortInfo);
    };


    const loadSourcingTarget = async (page: number, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationSourcingTargetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    EmployeeName: searchtext?.trim() ?? undefined,
                    MonthYear: monthYear || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, sourcingTargetColumns),
                }

                const response = await sourcingTargetService.apiCallPullSourcingTarget(params);

                if (E.isRight(response)) {

                    setSourcingTargetList(response.right.Data);

                    setPagination({
                        currentPage: page,
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
            'Loading Sourcing Target'
        );
    };

    //#endregion

    //#region SEARCH EMPLOYEE FILTER

    const searchEmployee = async (searchValue: string) => {

        setSearchTerm(searchValue);


        if (searchValue.trim() === '') {
            await loadSourcingTarget(1, sortInfo, "");
            return;
        }

        await loadSourcingTarget(1, sortInfo, searchValue)
    };

    //#endregion

    //#region CLAER SERACH EMPLOYEE
    const clearSearchEmployees = async () => {
        debouncedSearch.cancel?.();
        setSearchTerm("");
        await loadSourcingTarget(1, sortInfo, undefined)
    };

    //#endregion

    //#region  EXCEL EXPORT TO EXCEL | PDF
    const handleExportSourcingTarget = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationSourcingTargetRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    EmployeeName: searchTerm?.trim() ?? undefined,
                    MonthYear: monthYear || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, sourcingTargetColumns),
                    ExportType: exportType
                };

                const response = await sourcingTargetService.apiCallPullSourcingTarget(params);


                handleExportFile(response, exportType, 'Sales Sourcing Target', addToast);

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

    const handleSourcingTargetExportExcel = () => handleExportSourcingTarget('Excel');
    const handleExportSourcingTargetPdf = () => handleExportSourcingTarget('PDF');

    //#endregion


    //#region TABLE CONFIG
    const handlePageChange = useCallback((page: number) => {
        fetchSourcingTargetList(page);
    }, [sortInfo, searchTerm, monthYear, projectId]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadSourcingTarget(1, sort, searchTerm?.trim());
    }, [searchTerm, monthYear, projectId]);

    const sourcingTargetPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const sourcingTargetForTable = useMemo(() => sourcingTargetList, [sourcingTargetList]);
    //#endregion

    //#region TABLE COLUMN
    const sourcingTargetColumns: TableColumn[] = [
        { key: 'EmployeeName', label: 'Employee Name', sortable: true, width: '180px', fixed: 'left' },
        { key: 'DesignationName', label: 'Designation Name', sortable: false },
        { key: 'WalkinsByCP', label: 'Walkins By CP', sortable: false },
        { key: 'FreshVisits', label: 'Fresh Visits', sortable: false },
        { key: 'Revisits', label: 'Revisits', sortable: false },
        { key: 'Bookings', label: 'Bookings', sortable: false },
        { key: 'TotalOBM', label: 'Total OBM', sortable: false },
        { key: 'TotalOBMFreshVisits', label: 'Total OBM Fresh Visits', sortable: false },
        { key: 'TotalOBMRevisits', label: 'Total OBM Revisits', sortable: false },
        { key: 'TotalIBM', label: 'Total IBM', sortable: false },
        { key: 'UniqueCPs', label: 'Unique CP', sortable: false },
        { key: 'ActiveCP', label: 'Active CP', sortable: false },
        { key: 'NewCP', label: 'New CP', sortable: false },
    ];
    //#endregion
    //#region IMPORT EXCEL | DOWNLOAD

    const downloadExcelSampleSourcingTarget = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationSourcingTargetRequest = {
                    PageNumber: 1,
                    PageSize: 10000000,
                    ProjectId: Number(projectId),
                    MonthYear: monthYear || undefined,
                    IsSampleDownload: true,
                    ExportType: "Excel"
                };

                const response = await sourcingTargetService.apiCallPullSourcingTarget(params);

                handleExportFile(response, 'Excel', 'Sales Sourcing Target', addToast, 'Sample file download successfully')

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

    const handleDownloadExcelSampleSourcingTarget = () => downloadExcelSampleSourcingTarget()

    const uploadExcel = async (file: File, mergeExisting: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const fd = new FormData();

                fd.append("ExcelFile", file);
                fd.append("IsAllDelete", mergeExisting);
                fd.append("TableName", 'SALES TARGET SOURCING');
                fd.append("ProjectId", String(projectId));
                fd.append("MonthYear", String(monthYear));

                const response = await technicalService.apiCallExcelImport(fd);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: "Excel imported sucessfully" })

                    fetchSourcingTargetList();

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

    //#endregion

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Employee Name"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchEmployees}
                isShowFilterButton={false}

                // IMPORT
                isShowImportButton={canAction && !!monthYear && !!projectId}
                onUploadExcel={() => setShowImportModal(true)}
                onDownloadSampleExcel={handleDownloadExcelSampleSourcingTarget}

                // EXPORT
                isShowExportButton={canExport && sourcingTargetForTable.length > 0}
                onExportExcel={handleSourcingTargetExportExcel}
                onExportPdf={handleExportSourcingTargetPdf}
                exportLoading={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MonthPicker
                    label="Select Month"
                    value={monthYear || ""}
                    onChange={(val) => {
                        setMonthYear(val);
                    }}
                />
                
            </div>

            <div className="pt-5">
                <DataTable
                    data={sourcingTargetForTable}
                    columns={sourcingTargetColumns}
                    pagination={sourcingTargetPaginationInfo}
                    emptyMessage="No Sourcing Target found"
                    fixedHeight
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                />
            </div>

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
};

export default SourcingTarget;

