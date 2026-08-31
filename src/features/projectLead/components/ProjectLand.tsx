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
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Trash2 } from "lucide-react";
import type { DeleteProjectLandRequest, FilterWithPaginationProjectLandRequest, ProjectLandData } from "@/features/projectLead/models/ProjectLandModel";
import { projectLandService } from "@/features/projectLead/services/ProjectLandService";
import { useProjectLandListState } from "@/features/projectLead/context/ProjectLandListStateContext";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";

export const ProjectLand: React.FC = () => {

    const [ProjectLandList, setProjectLandList] = useState<ProjectLandData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const { canAction, canExport } = useMenuPermissions();
    const [isShowCustomizeProjectLandColumnsModal, setIsShowCustomizeProjectLandColumnsModal] = useState(false);
    const [deleteProjectLandData, setDeleteProjectLandData] = useState<ProjectLandData | null>(null);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const { listState, updateListState } = useProjectLandListState();
    const { searchTerm, filters, sortInfo } = listState;
    const navigate = useNavigate();

    const debouncedSearch = useDebouncedCallback((value: string) => {
        SearchProjectLand(value)
    }, 350);

    useEffect(() => {
        setPagination({ currentPage: listState.page });

        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadProjectLand(listState.page, { LandOwnerName: String(listState.searchTerm).trim() }, listState.sortInfo);

        } else {
            loadProjectLand(listState.page, listState.filters, listState.sortInfo);
        }
    }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    const loadProjectLand = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectLandRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectLandId: filterParams.ProjectLandId ? Number(filterParams.ProjectLandId) : undefined,
                    LandOwnerName: searchtext ?? filterParams.LandOwnerName?.trim() ?? undefined,
                    LandAddress: filterParams.LandAddress?.trim() || undefined,
                    ContactPersonName: filterParams.ContactPersonName?.trim() || undefined,
                    ContactPersonMobile: filterParams.ContactPersonMobile?.trim() || undefined,
                    PinCode: filterParams.PinCode?.trim() || undefined,
                    PlotNumber: filterParams.PlotNumber?.trim() || undefined,
                    WardNumberZone: filterParams.WardNumberZone?.trim() || undefined,
                    PlotShape: filterParams.PlotShape?.trim() || undefined,
                    LandOwnershipType: filterParams.LandOwnershipType?.trim() || undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ProjectLandColumns),
                    IsCheckPermission: false
                }

                const response = await projectLandService.apiCallPullProjectLand(params);

                if (E.isRight(response)) {
                    setProjectLandList(response.right.Data);
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
            'Loading Project Land'
        )
    }

    const SearchProjectLand = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue, page: 1 });

        if (searchValue.trim() === '') {
            updateListState({ filters: {}, searchTerm: '' });
            return
        }
        await loadProjectLand(1, filters, sortInfo, searchValue);
    };

    const clearSearchProjectLand = () => {
        debouncedSearch.cancel?.();
        updateListState({ searchTerm: '', filters: {}, page: 1, sortInfo: undefined });
        setTempFilters({});
        loadProjectLand(1, {}, undefined, undefined);
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
        loadProjectLand(1, filters, sort, searchTerm || undefined);
    }, [filters, searchTerm, updateListState]);

    const handlePageChange = useCallback((page: number) => {
        updateListState({ page });
    }, [sortInfo, updateListState]);

    const ProjectLandPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }), [pagination, handlePageChange]);

    const ProjectLandForTable = useMemo(() => ProjectLandList, [ProjectLandList]);

    const handleDeleteProjectLand = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteProjectLandData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteProjectLandRequest = {
                    ProjectLandId: deleteProjectLandData.ProjectLandId || 0,
                    Uniquekey: deleteProjectLandData.Uniquekey || "",
                };

                const response = await projectLandService.apiCallDeleteProjectLand(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1,
                        Math.ceil(newTotalRecords / pagination.pageSize),
                    );

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (
                        ProjectLandList.length === 1 &&
                        pagination.currentPage > 1

                    ) { pageToShow = pagination.currentPage - 1; }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });

                    await loadProjectLand(pageToShow, filters, sortInfo);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteProjectLandData(null);

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
            "Deleting Project Land",
        );
    };

    const handleConfirmationDialogBoxOpen = useCallback((row: ProjectLandData) => {
        setDeleteProjectLandData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const handleViewProjectLandDetails = useCallback((row: ProjectLandData) => {
        updateListState({
            ProjectLandId: row.ProjectLandId ?? 0,
            LandOwnerName: row.LandOwnerName ?? "",
        });
        navigate("/projectLead/viewProjectLand");
    }, [navigate, updateListState],);

    const ProjectLandColumns = useMemo<TableColumn[]>(() => [
        {
            key: "LandOwnerName",
            label: "Land Owner Name",
            width: "15",
            sortable: true,
            align: "left",
            fixed: "left",
            render: (value, row) => (
                <TooltipText
                    text={value || "-"}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleViewProjectLandDetails(row)}
                />
            ),
        },
        {
            key: "LandAddress",
            label: "Land Address",
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
            label: "Country Name",
            width: "15",
            sortable: true,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "StateName",
            label: "State Name",
            width: "15",
            sortable: true,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "DistrictName",
            label: "District Name",
            width: "15",
            sortable: true,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "CityName",
            label: "City Name",
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
            label: "Plot Number / CTS Number",
            width: "20",
            sortable: true,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "WardNumberZone",
            label: "Ward Number Zone",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "TotalPlotAreaSqM",
            label: "Total Plot Area (Sq. M)",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "IdentificationLocation",
            label: "Identification Location",
            width: "20",
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
            key: "LatitudeLongitude",
            label: "Latitude / Longitude",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
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
            label: "Contact Person Mobile",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "ContactPersonEmail",
            label: "Contact Person Email",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "IsAnyPowerofAttorneyInvolved",
            label: "Power Of Attorney Involved",
            width: "15",
            sortable: false,
            align: "center",
            render: (value) => value === true ? "Yes" : value === false ? "No" : "-"
        },
        {
            key: "IsFencingBoundaryWallPresent",
            label: "Fencing Boundary Wall Present",
            width: "15",
            sortable: false,
            align: "center",
            render: (value) => value === true ? "Yes" : value === false ? "No" : "-"
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
            key: "SoilType",
            label: "Soil Type",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "ExistingGroundCondition",
            label: "Existing Ground Condition",
            width: "20",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "IsLandConvertedToNonAgricultural",
            label: "Land Converted To Non-Agricultural",
            width: "20",
            sortable: false,
            align: "center",
            render: (value) => value === true ? "Yes" : value === false ? "No" : "-"
        },
        {
            key: "IsAccessRoadAvailable",
            label: "Access Road Available",
            width: "15",
            sortable: false,
            align: "center",
            render: (value) => value === true ? "Yes" : value === false ? "No" : "-"
        },
        {
            key: "IsElectricityConnectionNearby",
            label: "Electricity Connection Nearby",
            width: "20",
            sortable: false,
            align: "center",
            render: (value) => value === true ? "Yes" : value === false ? "No" : "-"
        },
        {
            key: "IsUnderLitigationOrStayOrder",
            label: "Under Litigation Stay Order",
            width: "20",
            sortable: false,
            align: "center",
            render: (value) => value === true ? "Yes" : value === false ? "No" : "-"
        },
        {
            key: "Is712Available",
            label: "7/12 Available",
            width: "15",
            sortable: false,
            align: "center",
            render: (value) => value === true ? "Yes" : value === false ? "No" : "-"
        },
        {
            key: "FSIPermissible",
            label: "FSI Permissible",
            width: "15",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "WaterSupplyAvailable",
            label: "Water Supply Available",
            width: "20",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "SurroundingLandUse",
            label: "Surrounding Land Use",
            width: "20",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "TypeOfLandTenureType",
            label: "Type Of Land Tenure",
            width: "20",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "LandOwnershipType",
            label: "Land Ownership Type",
            width: "20",
            sortable: false,
            align: "left",
            render: (value) => value || "-"
        },
        {
            key: "DistanceFromNearestTownKM",
            label: "Distance From Nearest Town (KM)",
            width: "20",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "DistanceFromHighwayKM",
            label: "Distance From Highway (KM)",
            width: "20",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "DistanceFromRailwayStationKM",
            label: "Distance From Railway Station (KM)",
            width: "20",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "DistanceFromAirportKM",
            label: "Distance From Airport (KM)",
            width: "20",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "TotalNumberOfTreesonSite",
            label: "Total Number Of Trees On Site",
            width: "20",
            sortable: false,
            align: "right",
            render: (value) => value ?? "-"
        },
        {
            key: "Remark",
            label: "Remark",
            width: "20",
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
                            title="Delete Project Land"
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
        loadProjectLand(1, tempFilters, sortInfo);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        updateListState({ filters: {}, page: 1, searchTerm: '', sortInfo: undefined });
        loadProjectLand(1, {}, undefined);
        navigate(location.pathname, { replace: true, state: {} });
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleExportProjectLand = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectLandRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    LandOwnerName: filters.LandOwnerName?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ProjectLandColumns),
                    ExportType: exportType
                }

                const response = await projectLandService.apiCallPullProjectLand(params);

                handleExportFile(response, exportType, 'Project Land', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportProjectLandExcel = () => handleExportProjectLand('Excel')
    const handleExportProjectLandPdf = () => handleExportProjectLand('PDF')

    const requiredProjectLandColumnKeys: string[] = ["LandOwnerName", "Actions"];

    const allProjectLandColumnKeys: string[] = ProjectLandColumns.map((c) => c.key);

    const [selectedProjectLandColumnKeys, setSelectedProjectLandColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getProjectLandTableColumns?.();

            if (saved) {
                const parsed = JSON.parse(saved) as string[];

                const withRequired = Array.from(
                    new Set([...parsed, ...requiredProjectLandColumnKeys]),
                );

                return withRequired.filter((k) =>
                    allProjectLandColumnKeys.includes(k),
                );
            }
        } catch { }
        return allProjectLandColumnKeys
    });

    useEffect(() => {
        setSelectedProjectLandColumnKeys((prev) =>
            Array.from(new Set([...prev, ...requiredProjectLandColumnKeys])).filter(
                (k) => allProjectLandColumnKeys.includes(k),
            ),
        );
    }, [ProjectLandColumns.length]);

    const VisibleProjectLandColumns = useMemo(
        () => ProjectLandColumns.filter((col) =>
            selectedProjectLandColumnKeys.includes(col.key)),
        [ProjectLandColumns, selectedProjectLandColumnKeys]);

    const handleAddProjectLand = useCallback(() => {
        navigate("/projectLead/addProjectLand");
    }, [navigate]);

    return (
        <div >
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Land Owner Name"
                onSearchChange={v => {
                    updateListState({ searchTerm: v });
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchProjectLand}

                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddProjectLand}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true)
                }}

                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeProjectLandColumnsModal(true)}
                isShowExportButton={canExport && ProjectLandColumns.length > 0}
                onExportExcel={handleExportProjectLandExcel}
                onExportPdf={handleExportProjectLandPdf}
            />

            <DataTable
                data={ProjectLandForTable}
                columns={VisibleProjectLandColumns}
                pagination={ProjectLandPaginationInfo}
                emptyMessage="No Project Land Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeProjectLandColumnsModal}
                onClose={() => setIsShowCustomizeProjectLandColumnsModal(false)}
                onApply={(keys) => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredProjectLandColumnKeys]),
                    );
                    setSelectedProjectLandColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeProjectLandTableColumns?.(
                            JSON.stringify(withRequired),
                        );
                    } catch { }
                }}
                columns={ProjectLandColumns}
                selectedKeys={selectedProjectLandColumnKeys}
                requiredKeys={requiredProjectLandColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Project Land Data"
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
                            label="Land Owner Name"
                            value={tempFilters.LandOwnerName ?? ""}
                            onChange={e => handleFilterChange("LandOwnerName", e.target.value)}
                            placeholder="Enter Land Owner Name"
                            maxLength={100}
                        />
                    </div>
                    

                    <div>
                        <Input
                            type="text"
                            label="Land Address"
                            value={tempFilters.LandAddress ?? ""}
                            onChange={e => handleFilterChange("LandAddress", e.target.value)}
                            placeholder="Enter Land Address"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Contact Person Name"
                            value={tempFilters.ContactPersonName ?? ""}
                            onChange={e => handleFilterChange("ContactPersonName", e.target.value)}
                            placeholder="Enter Contact Person Name"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Contact Person Mobile"
                            value={tempFilters.ContactPersonMobile ?? ""}
                            onChange={e => handleFilterChange("ContactPersonMobile", e.target.value)}
                            placeholder="Enter Contact Person Mobile"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Pin Code"
                            value={tempFilters.PinCode ?? ""}
                            onChange={e => handleFilterChange("PinCode", e.target.value)}
                            placeholder="Enter Pin Code"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Plot Number"
                            value={tempFilters.PlotNumber ?? ""}
                            onChange={e => handleFilterChange("PlotNumber", e.target.value)}
                            placeholder="Enter Plot Number"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Ward Number Zone"
                            value={tempFilters.WardNumberZone ?? ""}
                            onChange={e => handleFilterChange("WardNumberZone", e.target.value)}
                            placeholder="Enter Ward Number Zone"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Plot Shape"
                            value={tempFilters.PlotShape ?? ""}
                            onChange={e => handleFilterChange("PlotShape", e.target.value)}
                            placeholder="Enter Plot Shape"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Land Ownership Type"
                            value={tempFilters.LandOwnershipType ?? ""}
                            onChange={e => handleFilterChange("LandOwnershipType", e.target.value)}
                            placeholder="Enter Land Ownership Type"
                            maxLength={100}
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
                    setDeleteProjectLandData(null);
                }}
                onConfirm={handleDeleteProjectLand}
                loading={isLoading}
                pageName="Project Land"
            />
        </div>
    )
}
export default ProjectLand;