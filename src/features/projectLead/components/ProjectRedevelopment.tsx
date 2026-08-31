import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import useToast from "@/core/hooks/useToast";
import * as E from 'fp-ts/Either';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { updateFilter } from "@/core/utils/filterHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { handleExportFile } from "@/core/utils/exportFile";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useNavigate } from "react-router-dom";
import type { DeleteProjectRedevelopmentRequest, FilterWithPaginationProjectRedevelopmentRequest, ProjectRedevelopmentData } from "@/features/projectLead/models/ProjectRedevelopmentModel";
import { projectRedevelopmentService } from "@/features/projectLead/services/ProjectRedevelopmentService";
import { useProjectRedevelopmentListState } from "@/features/projectLead/context/ProjectRedevelopmentListStateContext";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Trash2 } from "lucide-react";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";

export const ProjectRedevelopment: React.FC = () => {

    const [ProjectRedevelopmentList, setProjectRedevelopmentList] = useState<ProjectRedevelopmentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const { canAction, canExport } = useMenuPermissions();
    const [isShowCustomizeProjectRedevelopmentColumnsModal, setIsShowCustomizeProjectRedevelopmentColumnsModal] = useState(false);
    const [deleteProjectRedevelopmentData, setDeleteProjectRedevelopmentData] = useState<ProjectRedevelopmentData | null>(null);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const { listState, updateListState } = useProjectRedevelopmentListState();
    const { searchTerm, filters, sortInfo } = listState;
    const navigate = useNavigate();

    const debouncedSearch = useDebouncedCallback((value: string) => {
        SearchProjectRedevelopment(value)
    }, 350);

    useEffect(() => {
        setPagination({ currentPage: listState.page });

        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadProjectRedevelopment(listState.page, { BuildingName: String(listState.searchTerm).trim() }, listState.sortInfo);

        } else {
            loadProjectRedevelopment(listState.page, listState.filters, listState.sortInfo);
        }
    }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])
    

    const loadProjectRedevelopment = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectRedevelopmentRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    BuildingName: searchtext ?? filterParams.BuildingName?.trim() ?? undefined,
                    BuildingAddress: filterParams.BuildingAddress?.trim() || undefined,
                    ContactPersonName: filterParams.ContactPersonName?.trim() || undefined,
                    ContactPersonMobile: filterParams.ContactPersonMobile?.trim() || undefined,
                    PinCode: filterParams.PinCode?.trim() || undefined,
                    PlotNumber: filterParams.PlotNumber?.trim() || undefined,
                    WardNumberZone: filterParams.WardNumberZone?.trim() || undefined,
                    ExistingBuildingType: filterParams.ExistingBuildingType?.trim() || undefined,
                    ConstructionType: filterParams.ConstructionType?.trim() || undefined,
                    TypeOfLandTenure: filterParams.TypeOfLandTenure?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ProjectRedevelopmentColumns),
                    IsCheckPermission: false
                }

                const response = await projectRedevelopmentService.apiCallPullProjectRedevelopment(params);

                if (E.isRight(response)) {
                    setProjectRedevelopmentList(response.right.Data);
                    setPagination({
                        currentPage: page,
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
            'Loading Project Redevelopment'
        )
    }

    const SearchProjectRedevelopment = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue, page: 1 });

        if (searchValue.trim() === '') {
            updateListState({ filters: {}, searchTerm: '' });
            return
        }
        await loadProjectRedevelopment(1, filters, sortInfo, searchValue);
    };

    const clearSearchProjectRedevelopment = () => {
        debouncedSearch.cancel?.();
        updateListState({ searchTerm: '', filters: {}, page: 1, sortInfo: undefined });
        setTempFilters({});
        loadProjectRedevelopment(1, {}, undefined, undefined);
        try {
            navigate(location.pathname, {
                replace: true,
                state: {}
            });
        } catch {
        }
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
        loadProjectRedevelopment(1, filters, sort, searchTerm || undefined);
    }, [filters, searchTerm, updateListState]);

    const handlePageChange = useCallback((page: number) => {
        updateListState({ page });
    }, [sortInfo, updateListState]);

    const ProjectRedevelopmentPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }), [pagination, handlePageChange]);

    const ProjectRedevelopmentForTable = useMemo(() => ProjectRedevelopmentList, [ProjectRedevelopmentList]);

    const handleDeleteProjectRedevelopment = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteProjectRedevelopmentData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteProjectRedevelopmentRequest = {
                    ProjectRedevelopmentId: deleteProjectRedevelopmentData.ProjectRedevelopmentId || 0,
                    Uniquekey: deleteProjectRedevelopmentData.Uniquekey || "",
                };

                const response = await projectRedevelopmentService.apiCallDeleteProjectRedevelopment(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1,
                        Math.ceil(newTotalRecords / pagination.pageSize),
                    );

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (
                        ProjectRedevelopmentList.length === 1 &&
                        pagination.currentPage > 1

                    ) { pageToShow = pagination.currentPage - 1; }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });

                    await loadProjectRedevelopment(pageToShow, filters, sortInfo);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteProjectRedevelopmentData(null);

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
            "Deleting Project Redevelopment",
        );
    };

    const handleConfirmationDialogBoxOpen = useCallback((row: ProjectRedevelopmentData) => {
        setDeleteProjectRedevelopmentData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const handleViewProjectRedevelopmentDetails = useCallback((row: ProjectRedevelopmentData) => {
        updateListState({
            ProjectRedevelopmentId: row.ProjectRedevelopmentId ?? 0,
            BuildingName: row.BuildingName ?? "",
        });
        navigate("/projectLead/viewProjectRedevelopment");
    }, [navigate, updateListState],);

    const ProjectRedevelopmentColumns = useMemo<TableColumn[]>(() => [
        {
            key: "BuildingName",
            label: "Building Name",
            width: "15",
            sortable: true,
            align: "left",
            fixed: "left",
            render: (value, row) => (
                <TooltipText
                    text={value || "-"}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleViewProjectRedevelopmentDetails(row)}
                />
            ),
        },
        {
            key: "BuildingAddress",
            label: "Building Address",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => (
                <TooltipText
                    text={value || "-"}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            ),
        },
        {
            key: "CountryName",
            label: "Country",
            width: "15",
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "StateName",
            label: "State",
            width: "15",
            sortable: true,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "DistrictName",
            label: "District",
            width: "15",
            sortable: true,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "CityName",
            label: "City",
            width: "15",
            sortable: true,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "PinCode",
            label: "Pin Code",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber",
            label: "Plot / CTS /Survey /Sub Division Number",
            width: "20",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "WardNumberZone",
            label: "Ward Number (Zone)",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "TotalPlotAreaSqM",
            label: "Total Plot Area (SqMt)",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "YearOfOriginalConstruction",
            label: "Year Of Original Construction",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "ExistingBuildingType",
            label: "Existing Building Type",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "NumberOfExistingFloors",
            label: "Number Of Existing Floors",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "TotalNumberExistingFlatsUnits",
            label: "Total Number Existing Flats / Units",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "ContactPersonName",
            label: "Contact Person Name",
            width: "15",
            sortable: true,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "ContactPersonMobile",
            label: "Contact Person Mobile Number",
            width: "15",
            sortable: false,
            align: "left",
             render: (value) => (value ? `+91 ${value}` : "-"),
        },
        {
            key: "ContactPersonEmail",
            label: "Contact Person E-Mail ID",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "PercentageMemberInFavor",
            label: "Member In Favor (%)",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "TypeOfLandTenure",
            label: "Type Of Land Tenure",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "PlotShape",
            label: "Plot Shape",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "PlotDepth",
            label: "Plot Depth",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "RoadWidth",
            label: "Road Width",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "NumberOfExistingBuildingsWings",
            label: "Number Of Existing Buildings / Wings",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "NumberOfFloorsPerWing",
            label: "Number Of Floors Per Wing",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "TotalBuildUpArea",
            label: "Total Build Up Area (SqFt)",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "TotalCarpetArea",
            label: "Total Carpet Area (SqFt)",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "TotalCommonArea",
            label: "Total Common Area (SqFt)",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "ConstructionType",
            label: "Construction Type",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value ?? "-",
        },
        {
            key: "Actions",
            label: "Actions",
            width: "15",
            sortable: false,
            align: "center",
            fixed: "right",
            render: (_value, row) => {
                if (!canAction) return null;

                return (
                    <div>
                        <Button
                            color="transparent"
                            size="sm"
                            style={{
                                color: 'red',
                                padding: '0px 8px'
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleConfirmationDialogBoxOpen(row)

                            }}
                            title="Delete Project Redevelopment"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ], [canAction, handleConfirmationDialogBoxOpen]);

    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        loadProjectRedevelopment(1, tempFilters, sortInfo);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        debouncedSearch.cancel?.();
        setTempFilters({});
        updateListState({ filters: {}, page: 1, searchTerm: '', sortInfo: undefined });
    };
    

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleExportProjectRedevelopment = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectRedevelopmentRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    BuildingName: filters.BuildingName?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ProjectRedevelopmentColumns),
                    ExportType: exportType
                }

                const response = await projectRedevelopmentService.apiCallPullProjectRedevelopment(params);

                handleExportFile(response, exportType, 'Project Redevelopment', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportProjectRedevelopmentExcel = () => handleExportProjectRedevelopment('Excel')
    const handleExportProjectRedevelopmentPdf = () => handleExportProjectRedevelopment('PDF')

    const requiredProjectRedevelopmentColumnKeys: string[] = ["BuildingName", "Actions"];

    const allProjectRedevelopmentColumnKeys: string[] = ProjectRedevelopmentColumns.map((c) => c.key);

    const [selectedProjectRedevelopmentColumnKeys, setSelectedProjectRedevelopmentColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getProjectRedevelopmentTableColumns?.();

            if (saved) {
                const parsed = JSON.parse(saved) as string[];

                const withRequired = Array.from(
                    new Set([...parsed, ...requiredProjectRedevelopmentColumnKeys]),
                );

                return withRequired.filter((k) =>
                    allProjectRedevelopmentColumnKeys.includes(k),
                );
            }
        } catch { }
        return allProjectRedevelopmentColumnKeys
    });

    useEffect(() => {
        setSelectedProjectRedevelopmentColumnKeys((prev) =>
            Array.from(new Set([...prev, ...requiredProjectRedevelopmentColumnKeys])).filter(
                (k) => allProjectRedevelopmentColumnKeys.includes(k),
            ),
        );
    }, [ProjectRedevelopmentColumns.length]);

    const VisibleProjectRedevelopmentColumns = useMemo(
        () => ProjectRedevelopmentColumns.filter((col) =>
            selectedProjectRedevelopmentColumnKeys.includes(col.key)),
        [ProjectRedevelopmentColumns, selectedProjectRedevelopmentColumnKeys]);

    const handleAddProjectRedevelopment = useCallback(() => {
        navigate("/projectLead/addProjectRedevelopment");
    }, [navigate]);

    return (
        <div >
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Building Name"
                onSearchChange={v => {
                    updateListState({ searchTerm: v });
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchProjectRedevelopment}

                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddProjectRedevelopment}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true)
                }}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeProjectRedevelopmentColumnsModal(true)}
                isShowExportButton={canExport && ProjectRedevelopmentColumns.length > 0}
                onExportExcel={handleExportProjectRedevelopmentExcel}
                onExportPdf={handleExportProjectRedevelopmentPdf}
            />

            <DataTable
                data={ProjectRedevelopmentForTable}
                columns={VisibleProjectRedevelopmentColumns}
                pagination={ProjectRedevelopmentPaginationInfo}
                emptyMessage="No Project Redevelopment Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeProjectRedevelopmentColumnsModal}
                onClose={() => setIsShowCustomizeProjectRedevelopmentColumnsModal(false)}
                onApply={(keys) => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredProjectRedevelopmentColumnKeys]),
                    );
                    setSelectedProjectRedevelopmentColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeProjectRedevelopmentTableColumns?.(
                            JSON.stringify(withRequired),
                        );
                    } catch { }
                }}
                columns={ProjectRedevelopmentColumns}
                selectedKeys={selectedProjectRedevelopmentColumnKeys}
                requiredKeys={requiredProjectRedevelopmentColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Project Redevelopment"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply"
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-4">

                    <div>
                        <Input
                            type="text"
                            label="Building Name"
                            value={tempFilters.BuildingName  ?? ""}
                            onChange={e => handleFilterChange("BuildingName", e.target.value)}
                            placeholder="Enter Building Name"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Building Address"
                            value={tempFilters.BuildingAddress ?? ""}
                            onChange={e => handleFilterChange("BuildingAddress", e.target.value)}
                            placeholder="Enter Building Address"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Contact Person Name"
                            value={tempFilters.ContactPersonName ?? ""}
                            onChange={e => handleFilterChange("ContactPersonName", e.target.value)}
                            placeholder="Enter Contact Person Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Contact Person Mobile Number"
                            value={tempFilters.ContactPersonMobile ?? ""}
                            onChange={e => handleFilterChange("ContactPersonMobile", e.target.value)}
                            placeholder="Enter Contact Person Mobile"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Pin Code"
                            value={tempFilters.PinCode ?? ""}
                            onChange={e => handleFilterChange("PinCode", e.target.value)}
                            placeholder="Enter Pin Code"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Plot Number"
                            value={tempFilters.PlotNumber ?? ""}
                            onChange={e => handleFilterChange("PlotNumber", e.target.value)}
                            placeholder="Enter Plot Number"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Ward Number (Zone)"
                            value={tempFilters.WardNumberZone ?? ""}
                            onChange={e => handleFilterChange("WardNumberZone", e.target.value)}
                            placeholder="Enter Ward Number Zone"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Existing Building Type"
                            value={tempFilters.ExistingBuildingType ?? ""}
                            onChange={e => handleFilterChange("ExistingBuildingType", e.target.value)}
                            placeholder="Enter Existing Building Type"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Construction Type"
                            value={tempFilters.ConstructionType ?? ""}
                            onChange={e => handleFilterChange("ConstructionType", e.target.value)}
                            placeholder="Enter Construction Type"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Type Of Land Tenure"
                            value={tempFilters.TypeOfLandTenure ?? ""}
                            onChange={e => handleFilterChange("TypeOfLandTenure", e.target.value)}
                            placeholder="Enter Type Of Land Tenure"
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='From Date'
                            value={tempFilters.FromDate ?? ''}
                            onChange={(value) => handleFilterChange('FromDate', value || '')}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='To Date'
                            value={tempFilters.ToDate ?? ''}
                            onChange={(value) => handleFilterChange('ToDate', value || '')}
                        />
                    </div>

                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteProjectRedevelopmentData(null);
                }}
                onConfirm={handleDeleteProjectRedevelopment}
                loading={isLoading}
                pageName="Project Redevelopment"
            />

        </div>
    )
}
export default ProjectRedevelopment;