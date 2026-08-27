import { useCallback, useEffect, useMemo, useState } from "react";
import type { DeleteProjectProfessionalDetailsRequest, FilterWithPaginationProjectProfessionalDetails, ProjectProfessionalDetailsData } from "@/features/projectProfessionalDetails/models/ProjectProfessionalDetailsModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils";
import { projectProfessionalDetailsService } from "@/features/projectProfessionalDetails/services/ProjectProfessionalDetailsService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import usePagination from "@/core/hooks/usePagination";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProjectProfessionalDetailsListState } from "@/features/projectProfessionalDetails/context/ProjectProfessionalDetailsListStateContext";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate } from "react-router-dom";
import { updateFilter } from "@/core/utils/filterHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Trash2 } from "lucide-react";
import { handleExportFile } from "@/core/utils/exportFile";

export const ProjectProfessionalDetails: React.FC = () => {

    const [projectProfessionalDetailsList, setProjectProfessionalDetailsList] = useState<ProjectProfessionalDetailsData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { projectId } = useProject();
    const { addToast } = useToast();
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const { pagination, setPagination } = usePagination(20);
    const [isShowCustomizeColumnsModal, setIsShowCustomizeColumnsModal] = useState(false);
    const { canAction, canExport } = useMenuPermissions('/');

    console.log('CanAction', canAction);
    const navigate = useNavigate();
    const { listState, resetFilters, clearProjectProfessionalDetailsContext, updateListState } = useProjectProfessionalDetailsListState();
    const { page, filters, sortInfo, searchTerm } = listState;
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteProjectProfessionalDetailsData, setDeleteProjectProfessionalDetailsData] = useState<ProjectProfessionalDetailsData | null>(null);

    useEffect(() => {
        if (!projectId) return

        if (searchTerm && searchTerm.trim()) {
            loadProjectProfessionalDetails(page, { ProfessionalType: searchTerm.trim() }, sortInfo);
        } else {
            loadProjectProfessionalDetails(page, filters, sortInfo);
        }
    }, [projectId, filters, sortInfo, searchTerm, clearProjectProfessionalDetailsContext]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    useEffect(() => {
        setTempFilters(filters);
    }, [filters]);

    const debouncedSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {

        let filterParams: FilterInfo = {};

        if (value.trim() === "") {
            updateListState({ searchTerm: "", filters: {}, page: 1 });
            return;
        }

        if (isSerach) {
            filterParams = { ProfessionalType: value.trim() };
        }
        updateListState({ searchTerm: value, filters: filterParams, page: 1 });
    }, 350);

    const loadProjectProfessionalDetails = useCallback(async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {

        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectProfessionalDetails = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    ProjectProfessionalDetailsId: filterParams.ProjectProfessionalDetailsId ? Number(filterParams.ProjectProfessionalDetailsId) : undefined,
                    ProfessionalType: searchtext ?? filterParams.ProfessionalType ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ProjectProfessionalDetailsColunm)
                }
                const response = await projectProfessionalDetailsService.apiCallPullProjectProfessionalDetails(params);

                if (E.isRight(response)) {

                    setProjectProfessionalDetailsList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: "error", title: response.left.message });
                    return response
                }
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            'loading Project Professional Details'
        )
    }, [projectId]);

    const handleDeleteProjectProfessionalDetails = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteProjectProfessionalDetailsData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteProjectProfessionalDetailsRequest = {

                    ProjectProfessionalDetailsId: deleteProjectProfessionalDetailsData.ProjectProfessionalDetailsId || 0,

                    Uniquekey: deleteProjectProfessionalDetailsData.Uniquekey || "",

                    ProjectId: deleteProjectProfessionalDetailsData.ProjectId || 0,
                };

                const response = await projectProfessionalDetailsService.apiCallDeleteProjectProfessionalDettails(params);

                if (E.isRight(response)) {
                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize),);

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;

                    } else if (
                        projectProfessionalDetailsList.length === 1 &&
                        pagination.currentPage > 1
                    ) { pageToShow = pagination.currentPage - 1; }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });

                    await loadProjectProfessionalDetails(pageToShow, filters, sortInfo);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteProjectProfessionalDetailsData(null);
                } else {
                    addToast({ type: "error", title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Deleting Project Professional Details",
        );
    };

    const handleViewProjectProfessionalDetails = useCallback((row: ProjectProfessionalDetailsData) => {
        updateListState({
            ProjectProfessionalDetailsId: row.ProjectProfessionalDetailsId ?? 0,
            projectId: row.ProjectId ?? 0,
        })
        navigate('/projectProfessionalDetails/view')
    }, [navigate, updateListState],);

    const handleConfirmationDialogBoxOpen = useCallback((row: ProjectProfessionalDetailsData) => {
        setDeleteProjectProfessionalDetailsData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const ProjectProfessionalDetailsColunm = useMemo<TableColumn[]>(
        () => [
            {
                key: 'ProfessionalType',
                label: 'Professional Type',
                width: '30',
                align: 'left',
                sortable: true,
                render: (value, row) => (
                    <TooltipText
                        text={value || ""}
                        maxWidth="250px"
                        tooltipThreshold={25}
                        onClick={() => handleViewProjectProfessionalDetails(row)}
                    />
                )
            },
            {
                key: 'Type',
                label: 'Type',
                width: '30',
                align: 'left',
                sortable: true,
                render: value => value || '-',
            },
            {
                key: "UnitNumber",
                label: "Unit Number",
                width: '30',
                align: 'right',
                sortable: true,
                render: value => value || ""
            },
            {
                key: "BuildingName",
                label: "Building Name",
                width: '30',
                align: 'right',
                sortable: true,
                render: value => value || ""
            },
            {
                key: "StreetName",
                label: "Street Name",
                width: '30',
                align: 'right',
                sortable: true,
                render: value => value || ""
            },
            {
                key: "Locality",
                label: "Locality",
                width: '30',
                align: 'right',
                sortable: true,
                render: value => value || ""
            },
            {
                key: "RegistrationNumber",
                label: "Registration Number",
                width: '30',
                align: 'right',
                sortable: true,
                render: value => value || ""
            },
            {
                key: "Actions",
                label: "Actions",
                width: "12",
                fixed: "right",
                align: "center",
                render: (_value, row) => {
                    if (!canAction) return null;

                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationDialogBoxOpen(row);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                disabled={!row?.canAction}
                                style={{
                                    color: row?.canAction ? 'red' : '#9CA3AF',
                                    cursor: row?.canAction ? 'pointer' : 'not-allowed',
                                    opacity: row?.canAction ? 1 : 0.5
                                }}
                                title="Delete Project Professional Details"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ], [projectId]);

    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [updateListState]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
    }, [updateListState],);

    const ProjectProfessionalDetailsPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }), [
        pagination.currentPage,
        pagination.totalPages,
        pagination.totalRecords,
        pagination.pageSize
    ]);

    const ProjectProfessionalDetailsForTable = useMemo(() => projectProfessionalDetailsList, [projectProfessionalDetailsList]);

    const searchProjectProfessionalDetails = (searchValue: string) => {
        updateListState({ searchTerm: searchValue });
        debouncedSearch(searchValue, false);
    };

    const clearSearchProjectProfessionalDetails = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        setTempFilters({});
    };

    const handleAddProjectProfessionalDetails = useCallback(() => {
        navigate("/projectProfessionalDetails/add")
    }, [navigate]);

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => updateFilter(prev, key, value));
    };

    const requiredProjectProfessionalDetailsColumnKeys: string[] = ["ProfessionalType", "BuildingName", "Actions"];

    const allProjectProfessionalDetailsColumnKeys: string[] = ProjectProfessionalDetailsColunm.map((c) => c.key);

    const [selectedProjectProfessionalDetailsColumnKeys, setSelectedProjectProfessionalDetailsColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getProjectProfessionalDetailsTableColumns?.();

            if (saved) {
                const parsed = JSON.parse(saved) as string[];

                const withRequired = Array.from(
                    new Set([...parsed, ...requiredProjectProfessionalDetailsColumnKeys]),
                );

                return withRequired.filter((k) =>
                    allProjectProfessionalDetailsColumnKeys.includes(k),
                );
            }
        } catch { }
        return allProjectProfessionalDetailsColumnKeys;
    });

    useEffect(() => {
        setSelectedProjectProfessionalDetailsColumnKeys((prev) =>
            Array.from(new Set([...prev, ...requiredProjectProfessionalDetailsColumnKeys])).filter(
                (k) => allProjectProfessionalDetailsColumnKeys.includes(k),
            ),
        );
    }, [ProjectProfessionalDetailsColunm.length]);

    const visibleProjectProfessionalDetailsColumns = useMemo(
        () => ProjectProfessionalDetailsColunm.filter((col) =>
            selectedProjectProfessionalDetailsColumnKeys.includes(col.key),
        ), [ProjectProfessionalDetailsColunm, selectedProjectProfessionalDetailsColumnKeys],
    );

    const handleExportProjectProfessionalDetails = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectProfessionalDetails = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    SortBy: getSortByParam(sortInfo ?? null, ProjectProfessionalDetailsColunm),
                    ExportType: exportType,
                };

                const response = await projectProfessionalDetailsService.apiCallPullProjectProfessionalDetails(params);

                handleExportFile(response, exportType, "Project Professional Details", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportProjectProfessionalDetailsExcel = () => handleExportProjectProfessionalDetails("Excel");
    const handleExportProjectProfessionalDetailsPdf = () => handleExportProjectProfessionalDetails("PDF");

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>  {" "}<div></div>{" "} </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Professional Type"
                onSearchChange={searchProjectProfessionalDetails}
                onClearSearch={clearSearchProjectProfessionalDetails}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeColumnsModal(true)}
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddProjectProfessionalDetails}

                isShowImportButton={false}
                isShowExportButton={canExport && ProjectProfessionalDetailsForTable.length > 0}
                onExportExcel={handleExportProjectProfessionalDetailsExcel}
                onExportPdf={handleExportProjectProfessionalDetailsPdf}
                exportLoading={isLoading}
            />

            <DataTable
                columns={visibleProjectProfessionalDetailsColumns}
                data={ProjectProfessionalDetailsForTable}
                pagination={ProjectProfessionalDetailsPaginationInfo}
                loading={isLoading}
                emptyMessage="No Project Professional Details Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Project Professional Details"
                onSubmit={(e) => {
                    e.preventDefault();
                    updateListState({ filters: tempFilters, page: 1 });
                    setShowFilterPopup(false);
                }}
                saveText="Apply"
                cancelText="Clear"
                onCancel={() => {
                    setTempFilters({});
                    resetFilters();
                }}
                size="small-half"
            >
                <div className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            label="Professional Type"
                            value={tempFilters?.ProfessionalType ?? ""}
                            onChange={(e) => handleFilterChange("ProfessionalType", e.target.value)}
                            placeholder="Enter Professional Type"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Type"
                            value={tempFilters?.Type ?? ""}
                            onChange={(e) => handleFilterChange("Type", e.target.value)}
                            placeholder="Enter Type"
                        />
                    </div>
                </div>
            </Modal>

            <CustomizeColumnsModal
                isOpen={isShowCustomizeColumnsModal}
                onClose={() => setIsShowCustomizeColumnsModal(false)}
                onApply={(keys) => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredProjectProfessionalDetailsColumnKeys]),
                    );
                    setSelectedProjectProfessionalDetailsColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeProjectProfessionalDetailsTableColumns?.(
                            JSON.stringify(withRequired),
                        );
                    } catch { }
                }}
                columns={ProjectProfessionalDetailsColunm}
                selectedKeys={selectedProjectProfessionalDetailsColumnKeys}
                requiredKeys={requiredProjectProfessionalDetailsColumnKeys}
                title="Customize Table Columns"
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteProjectProfessionalDetailsData(null);
                }}
                onConfirm={handleDeleteProjectProfessionalDetails}
                loading={isLoading}
                pageName="Project Professional Details"
            />
        </div>
    )
}
export default ProjectProfessionalDetails;