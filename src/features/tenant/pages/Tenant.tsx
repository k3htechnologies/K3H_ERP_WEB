import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import {  type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import type { TenantData, FilterWithPaginationTenantRequest, DeleteTenantRequest } from "@/features/tenant/models/TenantModel";

import { tenantService } from "@/features/tenant/services/TenantService";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@/ui/components/forms";
import { updateFilter } from "@/core/utils/filterHelper";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBuildingDropdown } from "@/features/building/buildingDropdown";
import { Copy, FileText, Trash2 } from "lucide-react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { useTenantListState } from "@/features/tenant/context/TenantListStateContext";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { copyToClipboard } from "@/core/utils/comman";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";

export const Tenant: React.FC = () => {
  //#region STATE
  const [tenantList, setTenantList] = useState<TenantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeTenantColumnsModal, setIsShowCustomizeTenantColumnsModal] = useState(false);

  //EXCEL IMPORT
  const [showImportModal, setShowImportModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

  const [deleteTenantData, setDeleteTenantData] = useState<TenantData | null>(null);

  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region TENANT LIST STATE CONTEXT
  const { listState, updateListState, resetFilters, setBuildingContext } = useTenantListState();
  const { page, filters, sortInfo, searchTerm, buildingId, buildingName } = listState;
  //#endregion

  //#region DATA LOAD
  const loadTenants = useCallback(
    async (pageNum: number, filterParams: FilterInfo, buildingIdNum: number) => {
      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {
          const params: FilterWithPaginationTenantRequest = {
            PageNumber: pageNum,
            PageSize: pagination.pageSize,
            IsCheckPermission: true,
            TenantId: filterParams.TenantId ? Number(filterParams.TenantId) : undefined,
            ProjectId: Number(projectId),
            BuildingId: buildingIdNum,

            UnitAnnexureSurveyNumber: filterParams.UnitAnnexureSurveyNumber?.trim() || undefined,
            ApplicantName: filterParams.ApplicantName?.trim() || undefined,
            UnitType: filterParams.UnitType?.trim() || undefined,
            UnitCarpetAreaSqFt: Number(filterParams.UnitCarpetAreaSqFt),
            BuildingNumber: filterParams.BuildingNumber?.trim() || undefined,
            Wing: filterParams.Wing?.trim() || undefined,
            Flat: filterParams.Flat?.trim() || undefined,
            ParkingNumber: filterParams.ParkingNumber?.trim() || undefined,

            UnitFacing: filterParams.UnitFacing?.trim() || undefined,
            UnitConfiguration: filterParams.UnitConfiguration?.trim() || undefined,

            FlatNumber: filterParams.FlatNumber?.trim() || undefined,
            FlatConfiguration: filterParams.FlatConfiguration?.trim() || undefined,
            FlatType: filterParams.FlatType?.trim() || undefined,
            FlatCarpetAreaSqFt: filterParams.FlatCarpetAreaSqFt?.trim() || undefined,

            SortBy: getSortByParam(sortInfo ?? null, tenantColumns),
          };

          const response = await tenantService.apiCallPullTenant(params);

          if (E.isRight(response)) {
            setTenantList(response.right.Data);

            setPagination({
              currentPage: pageNum,
              totalRecords: response.right.TotalNumberOfRecord,
              totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
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
        "Loading Tenant",
      );
    },
    [projectId, pagination.pageSize, addToast, sortInfo],
  );

  //#endregion

  //#region INIT
  useEffect(() => {
    if (!projectId) return;

    if (buildingId && buildingId > 0) {
      if (searchTerm && searchTerm.trim()) {
        loadTenants(page, { FlatNumber: searchTerm.trim() }, buildingId);
      } else {
        loadTenants(page, filters, buildingId);
      }
    }
  }, [projectId, page, filters, sortInfo, searchTerm, buildingId, loadTenants]);

  useEffect(() => {
    setPagination({ currentPage: page });
  }, [page]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  //#endregion

  //#region SEARCH TENANT FILTER
  const debouncedSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {
    let filterParams: FilterInfo = {};
    if (value.trim() === "") {
      updateListState({ searchTerm: "", filters: {}, page: 1 });
      return;
    }

    if (isSerach) {
      filterParams = { BuildingName: value.trim() };
    }

    updateListState({ searchTerm: value, filters: filterParams, page: 1 });
  }, 350);

  const searchTenants = (searchValue: string) => {
    updateListState({ searchTerm: searchValue });
    debouncedSearch(searchValue, false);
  };
  //#endregion

  //#region CLEAR SEARCH TENANT
  const clearSearchTenants = () => {
    debouncedSearch.cancel?.();
    resetFilters();
    setTempFilters({});
  };

  //#endregion

  //#region  EXCEL EXPORT TO EXCEL | PDF
  const handleExportTenants = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTenantRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectId: Number(projectId),
          BuildingId: buildingId,
          FlatNumber: filters.FlatNumber?.trim() || undefined,
          ApplicantName: filters.ApplicantName?.trim() || undefined,
          FlatConfiguration: filters.FlatConfiguration?.trim() || undefined,
          FlatType: filters.FlatType?.trim() || undefined,
          FlatCarpetAreaSqFt: filters.FlatCarpetAreaSqFt?.trim() || undefined,
          BuildingNumber: filters.BuildingNumber?.trim() || undefined,
          Wing: filters.Wing?.trim() || undefined,
          Flat: filters.Flat?.trim() || undefined,
          ParkingNumber: filters.ParkingNumber?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, tenantColumns),
          ExportType: exportType,
        };

        const response = await tenantService.apiCallPullTenant(params);

        handleExportFile(response, exportType, "Tenant", addToast);

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

  const handleExportTenantExcel = () => handleExportTenants("Excel");
  const handleExportTenantPdf = () => handleExportTenants("PDF");

  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateListState({ page: newPage });
    },
    [updateListState],
  );

  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      updateListState({ sortInfo: sort, page: 1 });
    },
    [updateListState],
  );

  const tenantPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
  );

  const tenantsForTable = useMemo(() => tenantList, [tenantList]);

  const handleViewTenantDetails = useCallback(
    (row: TenantData) => {
      updateListState({
        tenantId: row.TenantId,
        tenantName: row.UnitAnnexureSurveyNumber || "",
        applicantName: row.ApplicantName || "",
      });
      navigate("/tenant/view");
    },
    [navigate, updateListState],
  );

  const handleViewTenantDocument = useCallback(
    (row: TenantData) => {
      updateListState({
        tenantId: row.TenantId,
        tenantName: row.UnitAnnexureSurveyNumber || "",
        applicantName: row.ApplicantName || "",
      });
      navigate("/tenant/document");
    },
    [navigate, updateListState],
  );


  const handleConfirmationDialogBoxOpen = useCallback((row: TenantData) => {
    setDeleteTenantData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const tenantColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "SystemGeneratedCode",
        label: "Tenant Code",
        sortable: true,
        fixed: "left",
        align: "left",
        render: (value) => {
          return (
            <div className="flex items-center gap-2">
              <TooltipText
                text={value || "-"}
                maxWidth="150px"
                tooltipThreshold={20}
                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
              />

              {value && (
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const success = await copyToClipboard(value);
                    if (success) {
                      addToast({ type: "success", title: `${value} Copied!` });
                    }
                  }}
                  color="transparent"
                  size="sm"
                  style={{
                    padding: "2px 6px",
                    color: "#6B7280",
                    cursor: "pointer",
                  }}
                  title="Copy"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        },
      },
      {
        key: "UnitAnnexureSurveyNumber",
        label: "Unit / Annx / Svy No.",
        width: "18",
        sortable: true,
        fixed: "left",
        align: "left",
        truncate:false,
        render: (value, row) => (
          <TooltipText text={value || "-"} maxWidth="160px" tooltipThreshold={16} onClick={() => handleViewTenantDetails(row)} />
        ),
      },
      {
        key: "ExisitingUnitGroup",
        label: "Existing Unit Details",
        align: "center",
        theadStyle: {
          backgroundColor: '#EEF5FF',
          color: '#135BEC'
        },
        children: [
          {
            key: "ApplicantName",
            label: "Applicant Name",
            width: "18",
            align: "left",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#EEF5FF'
            },
            render: (value) => value ?? "-",
          },

          {
            key: "UnitType",
            label: "Unit Type",
            width: "16",
            align: "left",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#EEF5FF'
            },
            render: (value) => <TooltipText text={value || "-"} maxWidth="160px" tooltipThreshold={16} />,
          },
          {
            key: "UnitConfiguration",
            label: "Configuration",
            width: "18",
            sortable: false,
            align: "left",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#EEF5FF'
            },
            render: (value) => <TooltipText text={value || "-"} maxWidth="160px" tooltipThreshold={16} />,
          },
          {
            key: "UnitCarpetAreaSqFt",
            label: "Carpet Area",
            width: "18",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#EEF5FF'
            },
             render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "UnitFacing",
            label: "Unit Facing",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#EEF5FF'
            },
            render: (value) => value || "-",
          },
        ]
      },
      {
        key: "Eligibility Group",
        label: "Eligibility  Details in Carpet Area (SqFt)",
        align: "center",
        theadStyle: {
          backgroundColor: '#FBF5FF',
          color: '#8A38F5'
        },
        children: [
          {
            key: "ExtraFreeCarpetAreaOfferedPercent",
            label: "Free Area Offered (%)",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} %` : "-"),
          },
          {
            key: "FreeMOFACarpetAreaSqFt",
            label: "Free MOFA ",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "NewEligibilityMOFACarpetAreaSqFt",
            label: "New Eligibility MOFA",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "NewEligibilityRERACarpetAreaSqFt",
            label: "New Eligibility RERA",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "MOFACarpetAreaPurchasedSqFt",
            label: "MOFA Purchased",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "RERACarpetAreaPurchasedSqFt",
            label: "RERA Purchased",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "TotalNewMOFACarpetAreaSqFt",
            label: "Total New MOFA",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
           render: (value) => (value ? `${value} SqFt` : "-"),
          },


          {
            key: "TotalNewRERACarpetAreaSqFt",
            label: "Total New RERA (A)",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "DeckAreaSqFt",
            label: "Deck Area (B)",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "ExistingTerraceAreaSqFt",
            label: "Existing Terrace Area",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },
          {
            key: "AreaAgainstTerraceSqFt",
            label: "Area Against Terrace (C)",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (value) => (value ? `${value} SqFt` : "-"),
          },


          {
            key: "TotalNewRERACarpetAreaWithDeckSqFt",
            label: "Total (A + B + C)",
            width: "25",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#FBF5FF'
            },
            render: (_value, row) => {
              const total =
                Number(row.TotalNewRERACarpetAreaSqFt || 0) +
                Number(row.DeckAreaSqFt || 0) +
                Number(row.AreaAgainstTerraceSqFt || 0);

              return total > 0 ? `${total.toFixed(2)} SqFt` : "-";
            },
          },

        ]
      },
      {
        key: "NewUnitGroup",
        label: "New Unit Details",
        align: "center",
        theadStyle: {
          backgroundColor: '#F0FDF4',
          color: '#60D669'
        },
        children: [
          {
            key: "BuildingNumber",
            label: "Building Number",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#F0FDF4'
            },
            render: (value) => value || "-",
          },

          {
            key: "Wing",
            label: "Wing",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#F0FDF4'
            },
            render: (value) => value || "-",
          },
          {
            key: "Floor",
            label: "Floor",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#F0FDF4'
            },
            render: (value) => value || "-",
          },
          {
            key: "Flat",
            label: "Unit Number",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#F0FDF4'
            },
            render: (value) => value || "-",
          },
          {
            key: "RERACarpetAreaSqFt",
            label: "RERA Carpet Area (SqFt)",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#F0FDF4'
            },
            render: (value) => value || "-",
          },
          {
            key: "InventoryFlatType",
            label: "Unit Type",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#F0FDF4'
            },
            render: (value) => value || "-",
          },
          {
            key: "InventoryFlatConfiguration",
            label: "Configuration",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#F0FDF4'
            },
            render: (value) => value || "-",
          },
          {
            key: "ParkingNumber",
            label: "Parking Number",
            width: "12",
            sortable: false,
            align: "center",
            theadStyle: {
              backgroundColor: '#FFF',
              color: '#64748B'
            },
            tdStyle: {
              backgroundColor: '#F0FDF4'
            },
            render: (value) => value || "-",
          },
        ]
      },

      {
        key: "actions",
        label: "Actions",
        width: "12",
        fixed: "right",
        align: "center",
        render: (_value, row) =>
          canAction ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewTenantDocument(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                style={{
                  color: "green",
                  padding: "4px 8px",
                }}
                title="Tenant Document"
              >
                <FileText className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmationDialogBoxOpen(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                style={{
                  color: "red",
                  padding: "4px 8px",
                }}
                title="Delete Tenant"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null,
      },
    ],
    [handleViewTenantDetails, handleViewTenantDocument, handleConfirmationDialogBoxOpen, canAction],
  );

  const requiredTenantColumnKeys: string[] = [
    "UnitAnnexureSurveyNumber",
    "ApplicantName",
    "UnitType",
    "UnitConfiguration",
    "UnitCarpetAreaSqFt",
    "UnitFacing",
    "DeckAreaSqFt",
    "ParkingNumber",
    "BuildingNumber",
    "Wing",
    "Flat",
    "actions",
  ];

  const allTenantColumnKeys: string[] = tenantColumns.map((c) => c.key);

  const [selectedTenantColumnKeys, setSelectedTenantColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getTenantTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredTenantColumnKeys]));
        return withRequired.filter((k) => allTenantColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allTenantColumnKeys;
  });

  useEffect(() => {
    setSelectedTenantColumnKeys((prev) =>
      Array.from(new Set([...prev, ...requiredTenantColumnKeys])).filter((k) => allTenantColumnKeys.includes(k)),
    );
  }, [tenantColumns.length]);

  const visibleTenantColumns = useMemo(
    () => tenantColumns.filter((col) => selectedTenantColumnKeys.includes(col.key)),
    [tenantColumns, selectedTenantColumnKeys],
  );

  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    resetFilters();
    setShowFilterPopup(false);
  };

  const handleAddTenantModal = () => {
    if (!buildingId || Number(buildingId) === 0) {
      addToast({ type: "error", title: "Please select Building first" });

      return;
    }
    navigate("/tenant/add");
  };


  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };


  const downloadExcelSampleTenant = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: "TENANT",
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, "Excel", "Tenant", addToast, "Sample file download successfully");

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

  const handleDownloadExcelSampleTenant = () => downloadExcelSampleTenant();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", "Tenant");
        fd.append("ProjectId", String(projectId));
        fd.append("BuildingId", String(buildingId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: "success", title: "Excel imported sucessfully" });

          // Reload tenants with current state
          if (buildingId && buildingId > 0) {
            if (searchTerm && searchTerm.trim()) {
              loadTenants(page, { FlatNumber: searchTerm.trim() }, buildingId);
            } else {
              loadTenants(page, filters, buildingId);
            }
          }
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


  const handleDeleteTenant = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteTenantData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteTenantRequest = {
          TenantId: deleteTenantData.TenantId,
          UniqueKey: deleteTenantData.Uniquekey ?? "",
          BuildingId: Number(buildingId),
          ProjectId: Number(projectId),
        };

        const response = await tenantService.apiCallDeleteTenant(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (tenantList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages,
          });

          await loadTenants(pageToShow, filters, buildingId);

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteTenantData(null);
        } else {
          addToast({ type: "error", title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }

        return response;
      },
      undefined,
      (error: unknown) => {
        const err = error as { message?: string };
        addToast({ type: "error", title: err.message || "An error occurred" });
      },
      undefined,
      "Delete Tenant",
    );
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Flat Number"
        onSearchChange={searchTenants}
        onClearSearch={clearSearchTenants}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton={Number(buildingId) > 0 ? true : false}
        onCustomize={() => setIsShowCustomizeTenantColumnsModal(true)}
        // ADD
        isShowAddButton={canAction && Number(buildingId) > 0 ? true : false}
        addTitle="Add"
        onAdd={handleAddTenantModal}
        // IMPORT
        isShowImportButton={canAction && Number(buildingId) > 0 ? true : false}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleTenant}
        // EXPORT
        isShowExportButton={canExport && Number(buildingId) > 0 && tenantsForTable.length > 0 ? true : false}
        onExportExcel={handleExportTenantExcel}
        onExportPdf={handleExportTenantPdf}
        exportLoading={isLoading}
      />

      <div className="pb-5 flex">
        <div className="relative min-w-0 w-[526px]">
          <SingleSelectDropdownWithPagination
            key={projectId}
            label="Building"
            title="Select Building"
            isShowClearSelection={false}
            size="lg"
            initialValue={buildingName ? { label: buildingName ?? "", value: buildingId } : undefined}
            dataFetchCallBack={(pageNumber) => fetchBuildingDropdown(pageNumber, { projectId: Number(projectId) })}
            onSelected={(item) => {
              const selectedBuildingId = Number(item?.value ?? 0);
              const selectedBuildingName = item?.label ?? "";

              setBuildingContext(selectedBuildingId, selectedBuildingName);
            }}
          />
        </div>
      </div>

      <CustomTable
        data={tenantsForTable}
        columns={visibleTenantColumns}
        pagination={tenantPaginationInfo}
        emptyMessage="No Tenants Found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeTenantColumnsModal}
        onClose={() => setIsShowCustomizeTenantColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredTenantColumnKeys]));
          setSelectedTenantColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeTenantTableColumns?.(JSON.stringify(withRequired));
          } catch {
            // ignore
          }
        }}
        columns={tenantColumns}
        selectedKeys={selectedTenantColumnKeys}
        requiredKeys={requiredTenantColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Tenant"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply "
        cancelText="Clear"
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label="Unit / Annexure / Survey Number"
                type="text"
                value={tempFilters.UnitAnnexureSurveyNumber || ""}
                onChange={(e) => handleFilterChange("UnitAnnexureSurveyNumber", e.target.value)}
                placeholder="Enter Unit / Annexure / Survey Number"
              />
            </div>
            <div>
              <Input
                label="Applicant Name"
                type="text"
                value={tempFilters.ApplicantName || ""}
                onChange={(e) => handleFilterChange("ApplicantName", e.target.value)}
                placeholder="Enter Applicant Name"
              />
            </div>
            <div>
              <Input
                label="Exisiting Unit Type"
                type="text"
                value={tempFilters.UnitType || ""}
                onChange={(e) => handleFilterChange("UnitType", e.target.value)}
                placeholder="Enter Exisiting Unit Type"
              />
            </div>
            <div>
              <Input
                label="Existing Configuration"
                type="text"
                value={tempFilters.UnitConfiguration || ""}
                onChange={(e) => handleFilterChange("UnitConfiguration", e.target.value)}
                placeholder="Enter Existing Configuration"
              />
            </div>
            <div>
              <Input
                label="Existing Carpet Area (SqFt)"
                type="text"
                value={tempFilters.UnitCarpetAreaSqFt || ""}
                onChange={(e) => handleFilterChange("UnitCarpetAreaSqFt", e.target.value)}
                placeholder="Enter Existing Carpet Area (SqFt)"
              />
            </div>

            <div>
              <Input
                label="Building Number"
                type="text"
                value={tempFilters.BuildingNumber || ""}
                onChange={(e) => handleFilterChange("BuildingNumber", e.target.value)}
                placeholder="Enter Building Number"
              />
            </div>
            <div>
              <Input
                label="Wing"
                type="text"
                value={tempFilters.Wing || ""}
                onChange={(e) => handleFilterChange("Wing", e.target.value)}
                placeholder="Enter Wing"
              />
            </div>
            <div>
              <Input
                label="New Unit Number"
                type="text"
                value={tempFilters.Flat || ""}
                onChange={(e) => handleFilterChange("Flat", e.target.value)}
                placeholder="Enter New Unit Number"
              />
            </div>
            <div>
              <Input
                label="Parking Number"
                type="text"
                value={tempFilters.ParkingNumber || ""}
                onChange={(e) => handleFilterChange("ParkingNumber", e.target.value)}
                placeholder="Enter Parking Number"
              />
            </div>
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

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteTenantData(null);
        }}
        onConfirm={handleDeleteTenant}
        loading={isLoading}
        pageName="tenant"
      />
    </div>
  );
};

export default Tenant;
