import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { technicalService } from "@/features/technical/services/TechnicalService";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import type { FilterWithPaginationClosingTargetRequest, ClosingTargetData } from "@/features/target/models/ClosingTargetModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Button } from "@/ui/components/forms";
import { closingTargetService } from "../services/ClosingTargetService";
import MonthPicker from "@/ui/components/forms/MonthPicker";

export const ClosingTarget: React.FC = () => {
    //#region STATE
    const [closingTargetList, setClosingTargetList] = useState<ClosingTargetData[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
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

    //#endregion

    //#region DATA LOAD

    const fetchClosingTargetList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadClosingTarget(page, sort ?? sortInfo);
    };

    const loadClosingTarget = async (page: number, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationClosingTargetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    EmployeeName: searchtext?.trim() ?? undefined,
                    MonthYear: monthYear || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, closingTargetColumns),
                };

                const response = await closingTargetService.apiCallPullClosingTarget(params);

                if (E.isRight(response)) {

                    setClosingTargetList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(
                            response.right.TotalNumberOfRecord / pagination.pageSize,
                        ),
                    });

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
            "Loading Closing Target",
        );
    };

    //#endregion

    //#region SEARCH EMPLOYEE FILTER

    const searchEmployee = async (searchValue: string) => {

        setSearchTerm(searchValue);

        if (searchValue.trim() === "") {
            await loadClosingTarget(1, sortInfo, "");
            return;
        }

        await loadClosingTarget(1, sortInfo, searchValue);
    };

    //#endregion

    //#region CLAER SERACH EMPLOYEE
    const clearSearchEmployees = async () => {
        debouncedSearch.cancel?.();
        setSearchTerm("");
        await loadClosingTarget(1, sortInfo, undefined);
    };

    //#endregion

    //#region  EXCEL EXPORT TO EXCEL | PDF
    const handleExportClosingTarget = async (exportType: "Excel" | "PDF") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationClosingTargetRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    EmployeeName: searchTerm?.trim() ?? undefined,
                    MonthYear: monthYear || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, closingTargetColumns),
                    ExportType: exportType,
                };

                const response = await closingTargetService.apiCallPullClosingTarget(params);

                handleExportFile(response, exportType, "Sales Closing Target", addToast);

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message || "Export failed" });
            },
            undefined,
            "Preparing Export",
        );
    };

    const handleClosingTargetExportExcel = () => handleExportClosingTarget("Excel");
    const handleExportClosingTargetPdf = () => handleExportClosingTarget("PDF");

    //#endregion

    //#region TABLE CONFIG
    const handlePageChange = useCallback((page: number) => {
        fetchClosingTargetList(page);
    }, [sortInfo, searchTerm, monthYear, projectId]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadClosingTarget(1, sort, searchTerm?.trim());
    }, [searchTerm, monthYear, projectId]);

    const closingTargetPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [
            pagination.currentPage,
            pagination.totalPages,
            pagination.totalRecords,
            pagination.pageSize,
        ],
    );

    const closingTargetForTable = useMemo(
        () => closingTargetList,
        [closingTargetList],
    );
    //#endregion

    //#region TABLE COLUMN
    const closingTargetColumns: TableColumn[] = [
        {
            key: "EmployeeName",
            label: "Employee Name",
            sortable: true,
            width: "180px",
            fixed: "left",
        },
        { key: "DesignationName", label: "Designation Name", sortable: false },
        { key: "WalkinsByCP", label: "Walkins CP", sortable: false },
        { key: "WalkinsDirect", label: "Walkins Direct", sortable: false },
        { key: "FreshVisits", label: "Fresh Visits", sortable: false },
        { key: "Revisits", label: "Revisits", sortable: false },
        { key: "BookingByCP", label: "Bookings CP", sortable: false },
        { key: "BookingDirect", label: "Bookings Direct", sortable: false },
    ];
    //#endregion

    //#region IMPORT EXCEL | DOWNLOAD

    const downloadExcelSampleClosingTarget = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationClosingTargetRequest = {
                    PageNumber: 1,
                    PageSize: 10000000,
                    ProjectId: Number(projectId),
                    MonthYear: monthYear || undefined,
                    IsSampleDownload: true,
                    ExportType: "Excel",
                };

                const response =
                    await closingTargetService.apiCallPullClosingTarget(params);

                handleExportFile(
                    response,
                    "Excel",
                    "Sale Closing Target",
                    addToast,
                    "Sample file download successfully",
                );

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message || "Export failed" });
            },
            undefined,
            "Preparing Downloading",
        );
    };

    const handleDownloadExcelSampleClosingTarget = () =>
        downloadExcelSampleClosingTarget();

    const uploadExcel = async (file: File, mergeExisting: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const fd = new FormData();

                fd.append("ExcelFile", file);
                fd.append("IsAllDelete", mergeExisting);
                fd.append("TableName", "SALES TARGET CLOSING");
                fd.append("ProjectId", String(projectId));
                fd.append("MonthYear", String(monthYear));

                const response = await technicalService.apiCallExcelImport(fd);

                if (E.isRight(response)) {
                    addToast({ type: "success", title: "Excel imported sucessfully" });

                    fetchClosingTargetList();
                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (err: any) => addToast({ type: "error", title: err.message }),
            undefined,
            "Importing Excel",
        );
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
                searchPlaceholder="Search By Employee Name"
                onSearchChange={(v) => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchEmployees}
                isShowFilterButton={false}
                // IMPORT
                isShowImportButton={canAction && !!monthYear && !!projectId}
                onUploadExcel={() => setShowImportModal(true)}
                onDownloadSampleExcel={handleDownloadExcelSampleClosingTarget}
                // EXPORT
                isShowExportButton={canExport && closingTargetForTable.length > 0}
                onExportExcel={handleClosingTargetExportExcel}
                onExportPdf={handleExportClosingTargetPdf}
                exportLoading={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MonthPicker
                    label="Select Month"
                    value={monthYear || ""}
                    onChange={(val) => setMonthYear(val)}
                />

                {monthYear && projectId && (
                    <div className="pt-6">
                        <Button
                            color="blue"
                            size="md"
                            onClick={() => loadClosingTarget(1, sortInfo, searchTerm)}
                        >
                            Search
                        </Button>
                    </div>
                )}
            </div>
            <div className="pt-5">
                <DataTable
                    data={closingTargetForTable}
                    columns={closingTargetColumns}
                    pagination={closingTargetPaginationInfo}
                    emptyMessage="No Closing Target found"
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

export default ClosingTarget;
