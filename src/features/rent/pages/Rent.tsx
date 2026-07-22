import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import type { TenantApplicantCharges, FilterWithPaginationTenantApplicantChargesRequest } from "@/features/rent/models/RentModel";

import { rentService } from "@/features/rent/services/RentService";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Button, Input } from "@/ui/components/forms";
import { updateFilter } from "@/core/utils/filterHelper";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBuildingDropdown } from "@/features/building/buildingDropdown";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import Tabs, { type TabItem } from "@/ui/components/Tab/Tab";
import { proposedOfferService } from "@/features/proposedOffer/services/ProposedOfferService";
import { Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRentListState } from "@/features/rent/context/RentListStateContext";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import type { DropdownItem } from "@/core/types/DropdownItem";

type PivotRentRow = {
  FlatNumber?: string;
  ApplicantType?: string;
  ApplicantName?: string;
  FlatCarpetAreaSqFt?: number;
  FlatConfiguration?: string;
  FlatType?: string;
  Tenure?: string;
  Stage?: string;
  ProposedOfferAmount?: number;
  Amount?: number;
  Unit?: string;
  TenantApplicantId?: number;
  TenantId?: number;
  [month: string]: any;
};

export const Rent: React.FC = () => {
  const { projectId } = useProject();
  const { addToast } = useToast();
  const { canAction, canExport } = useMenuPermissions();
  const navigate = useNavigate();
  const { listState, setPayTrackRentContext, updateListState } = useRentListState();

  const { pagination, setPagination } = usePagination(listState.pageSize || 20);
  const [sortInfo] = useState<SortInfo | undefined>(listState.sortInfo);

  const [tenantApplicantChargesList, setTenantApplicantChargesList] = useState<TenantApplicantCharges[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const rentTabList = [
    { id: "Additional TAA", label: "Additional TAA" },
    { id: "TAA", label: "TAA" },
    { id: "Hardship", label: "Hardship" },
    { id: "Brokerage", label: "Brokerage" },
    { id: "Shifting", label: "Shifting" },
  ];

  const buildingId = listState.buildingId || 0;
  const buildingName = listState.buildingName || "";
  const filters = listState.filters || {};
  const searchTerm = listState.searchTerm || "";
  const activeTab = listState.activeTab || rentTabList[0].id;
  const activeTenureTab = listState.tenure || "";

  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [tenureTabList, setTenureTabList] = useState<TabItem[]>([]);

  const isMonthBasedTab = ["TAA", "Additional TAA", "Brokerage"].includes(activeTab);
  const isStageBasedTab = ["Hardship", "Shifting"].includes(activeTab);

  const selectedBuilding = useMemo(() => {
    if (!projectId || !buildingId || buildingId <= 0) return null;
    return { label: buildingName || "", value: buildingId };
  }, [projectId, buildingId, buildingName]);

  const fetchBuildingCallback = useCallback((pageNumber: number) => fetchBuildingDropdown(pageNumber, { projectId: Number(projectId) }), [projectId]);
  
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setPagination({ currentPage: 1 });
    updateListState({
      searchTerm: value.trim(),
      filters: { ...filters, FlatNumber: value.trim() },
      page: 1,
    });
  }, 350);
  
  useEffect(() => {
    if (!projectId || buildingId <= 0) return;
    if (!["TAA", "Brokerage"].includes(activeTab)) {
      setTenureTabList([]);
      updateListState({ tenure: "" });
      return;
    }

    (async () => {
      const response = await proposedOfferService.apiCallPullTemporaryAccommodationAlternative({
        ProjectId: Number(projectId),
        BuildingId: buildingId,
      });

      if (E.isRight(response)) {
        const tenures = Array.from(new Set(response.right.Data?.map((d: any) => d?.Tenure).filter(Boolean)));

        const tabs = tenures.map((t) => ({ id: t, label: t }));
        setTenureTabList(tabs);

        if (tabs.length > 0) {
          const isTenureValid = activeTenureTab && tabs.some((t) => t.id === activeTenureTab);

          if (!isTenureValid) {
            updateListState({
              tenure: tabs[0].id,
              filters: { ...filters, Tenure: tabs[0].id },
            });
          }
        }
      }
    })();
  }, [activeTab, projectId, buildingId]);

  const prevProjectIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (listState.buildingId > 0) {
      setPagination({ currentPage: listState.page || 1 });
    }
    if (!listState.activeTab) {
      updateListState({
        activeTab: rentTabList[0].id,
        filters: { ...listState.filters, ChargeType: rentTabList[0].id },
      });
    }
    if (prevProjectIdRef.current === null) {
      prevProjectIdRef.current = projectId;
    }
  }, []);

  useEffect(() => {
    const prevProjectId = prevProjectIdRef.current;
    
    if (prevProjectId !== null && prevProjectId !== projectId) {
     
      if (listState.buildingId > 0) {
        updateListState({ buildingId: 0, buildingName: "", filters: {}, searchTerm: "", page: 1 });
      }
      prevProjectIdRef.current = projectId;
    } else if (prevProjectId === null) {
      
      prevProjectIdRef.current = projectId;
    }
    
  }, [projectId, listState.buildingId, updateListState]);

  
  const loadRents = useCallback(async () => {
    if (!projectId || buildingId <= 0) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTenantApplicantChargesRequest = {
          PageNumber: listState.page || pagination.currentPage,
          PageSize: listState.pageSize || pagination.pageSize,
          ProjectId: Number(projectId),
          BuildingId: buildingId,
          ...filters,
          SortBy: getSortByParam(sortInfo ?? null, columns),
        };

        const response = await rentService.apiCallPullTenantApplicantCharges(params);

        if (E.isRight(response)) {
          setTenantApplicantChargesList(response.right.Data);

          const currentPage = listState.page || pagination.currentPage;
          const pageSize = listState.pageSize || pagination.pageSize;
          setPagination({
            currentPage,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pageSize),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }
      },
      undefined,
      (e) => addToast({ type: "error", title: e.message }),
      undefined,
      "Loading " + activeTab,
    );
  }, [projectId, buildingId, filters, listState.page, listState.pageSize, sortInfo]);

  useEffect(() => {
    loadRents();
  }, [loadRents]);
  

  const handleBuildingChange = (item: DropdownItem | null) => {
    if (!item?.value) return;
    const id = Number(item?.value);
    if (isNaN(id)) return;

    updateListState({
      buildingId: id,
      buildingName: item?.label,
      searchTerm: "",
      filters: { ChargeType: activeTab },
      page: 1,
    });
    setPagination({ currentPage: 1 });
    setTenantApplicantChargesList([]);
  };

  const dynamicHeaders = useMemo(() => {
    const headers = new Set<string>();

    tenantApplicantChargesList.forEach((item) => {
      if (item.Date === "1997-01-01T00:00:00" || item.Date === "1997-01-02T00:00:00") return;

      if (isMonthBasedTab && item.Date) {
        headers.add(formatDate_dd_MonthName_yy(item.Date));
      }

      if (isStageBasedTab && item.Stage) {
        headers.add(item.Stage);
      }
    });

    const sorted = Array.from(headers).sort((a, b) => {
      if (isMonthBasedTab) {
        return new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime();
      }
      return a.localeCompare(b);
    });

    // ✅ ALWAYS ADD TOTAL COLUMNS
    if (tenantApplicantChargesList.length > 0) {
      sorted.push("Total", "Paid Total");
    }

    return sorted;
  }, [tenantApplicantChargesList, isMonthBasedTab, isStageBasedTab]);

  const tableData = useMemo<PivotRentRow[]>(() => {
    const map = new Map<string, PivotRentRow>();

    tenantApplicantChargesList.forEach((item) => {
      if (!item.FlatNumber) return;

      if (!map.has(item.FlatNumber)) {
        const row: PivotRentRow = {
          FlatNumber: item.FlatNumber,
          ApplicantName: item.ApplicantName,
          ApplicantType: item.ApplicantType,
          FlatCarpetAreaSqFt: Number(item.FlatCarpetAreaSqFt) || 0,
          FlatType: item.FlatType,
          Unit: item.Unit,
          ProposedOfferAmount: Number(item.ProposedOfferAmount) || 0,
          TenantApplicantId: item.TenantApplicantId,
          TenantId: item.TenantId,
          Total: 0,
          "Paid Total": 0,
        };

        dynamicHeaders.forEach((h) => {
          if (!(h in row)) row[h] = "-";
        });

        map.set(item.FlatNumber, row);
      }

      const row = map.get(item.FlatNumber)!;

      const amount = Number(item.Amount || 0);

      // MONTH BASED
      if (isMonthBasedTab && item.Date && item.Date !== "1997-01-01T00:00:00" && item.Date !== "1997-01-02T00:00:00") {
        const key = formatDate_dd_MonthName_yy(item.Date);
        row[key] = amount ? `₹${amount}` : "-";
      }

      // STAGE BASED
      if (isStageBasedTab && item.Stage) {
        row[item.Stage] = amount;
        row["Total"] += amount;
      }

      // ───────── TOTAL INDICATOR ─────────
      if (item.Date === "1997-01-01T00:00:00") {
        row.Total = amount; // ✅ ONLY HERE
      }

      // ───────── PAID TOTAL INDICATOR ─────────
      if (item.Date === "1997-01-02T00:00:00") {
        row["Paid Total"] = amount;
      }
    });

    return Array.from(map.values()).map((row) => ({
      ...row,
      Total: row.Total ? `₹${row.Total}` : "-",
      "Paid Total": row["Paid Total"] ? `₹${row["Paid Total"]}` : "-",
    }));
  }, [tenantApplicantChargesList, dynamicHeaders, isMonthBasedTab, isStageBasedTab]);

  //#endregion

  //#region EXCEL EXPORT TO EXCEL | PDF
  const handleExportRents = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTenantApplicantChargesRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ProjectId: Number(projectId),
          BuildingId: buildingId > 0 ? buildingId : undefined,
          TenantId: filters.TenantId ? Number(filters.TenantId) : undefined,
          TenantApplicantChargesId: filters.TenantApplicantChargesId ? Number(filters.TenantApplicantChargesId) : undefined,
          Tenure: filters.Tenure?.trim() || undefined,
          ChargeType: filters.ChargeType?.trim() || undefined,
          ApplicantType: filters.ApplicantType?.trim() || undefined,
          ApplicantName: filters.ApplicantName?.trim() || undefined,
          FlatNumber: filters.FlatNumber?.trim() || undefined,
          FlatCarpetAreaSqFt: filters.FlatCarpetAreaSqFt ? Number(filters.FlatCarpetAreaSqFt) : undefined,
          FlatType: filters.FlatType?.trim() || undefined,
          FlatConfiguration: filters.FlatConfiguration?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, columns),
          ExportType: exportType,
        };

        const response = await rentService.apiCallPullTenantApplicantCharges(params);

        handleExportFile(response, exportType, "TAA", addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message || "Export failed" });
      },
      undefined,
      "Preparing Export...",
    );
  };

  const handleExportRentExcel = () => handleExportRents("Excel");
  const handleExportRentPdf = () => handleExportRents("PDF");

  //#endregion

  //#region COLUMNS
  const columns = useMemo<TableColumn[]>(() => {
    const baseColumns: TableColumn[] = [
      { key: "FlatNumber", label: "Unit Number", fixed: "left", width: "14" },
      { key: "ApplicantName", label: "Applicant Name", width: "18" },
      { key: "ApplicantType", label: "Applicant Type", width: "18" },
      { key: "FlatType", label: "Existing Unit Type", width: "18" },
      { key: "FlatCarpetAreaSqFt", label: "Existing Carpet Area (SqFt)", width: "18" },
    ];

    const proposedOfferColumn: TableColumn[] = ["TAA", "Brokerage", "Additional TAA"].includes(activeTab)
      ? [
          {
            key: "ProposedOfferAmount",
            label: "Proposed Offer Amount (₹)",
            width: "20",
            align: "right",
            render: (_, row) => `${row.ProposedOfferAmount || 0} ${row.Unit || ""}`,
          },
        ]
      : [];

    const dynamicColumns: TableColumn[] = dynamicHeaders.map((h) => ({
      key: h,
      label: h,
      width: h === "Total" || h === "Paid Total" ? "16" : "12",
      align: "right" as const,
    }));

    const actionColumn: TableColumn[] = canAction
      ? [
          {
            key: "Actions",
            label: "Actions",
            width: "12",
            fixed: "right",
            align: "center",
            render: (_value, row: PivotRentRow) => {
              const handleAddPayTrackRent = () => {
                if (!row.TenantApplicantId || !buildingId) return;

                const totalAmount = Number(row["Total"].replace("₹", "") || 0);
                const paidTotalAmount = Number(row["Paid Total"].replace("₹", "") || 0);

                setPayTrackRentContext(row.TenantApplicantId, row.ApplicantName || "");
                updateListState({
                  buildingId,
                  buildingName,
                  activeTab,
                  tenure: activeTenureTab,
                  tenantId: row.TenantId || 0,
                  tenantName: row.ApplicantName || "",
                  tenantApplicantId: row.TenantApplicantId || 0,
                  flatNumber: row.FlatNumber || "",
                  applicantName: row.ApplicantName || "",
                  totalAmount: totalAmount,
                  paidTotalAmount: paidTotalAmount,
                });
                navigate("/rent/pay");
              };

              const handleViewPayTrackRent = () => {
                if (!row.TenantApplicantId || !buildingId) return;

                const totalAmount = Number(row["Total"].replace("₹", "") || 0);
                const paidTotalAmount = Number(row["Paid Total"].replace("₹", "") || 0);

                setPayTrackRentContext(row.TenantApplicantId, row.ApplicantName || "");
                updateListState({
                  buildingId,
                  buildingName,
                  activeTab,
                  tenure: activeTenureTab,
                  tenantId: row.TenantId || 0,
                  tenantName: row.ApplicantName || "",
                  tenantApplicantId: row.TenantApplicantId || 0,
                  flatNumber: row.FlatNumber || "",
                  applicantName: row.ApplicantName || "",
                  totalAmount: totalAmount,
                  paidTotalAmount: paidTotalAmount,
                });
                navigate("/rent/paymentLedger");
              };

              return (
                <div className="flex items-center justify-center">
                  {Number(String(row["Total"]).replace(/[₹,]/g, "") || 0) !== Number(String(row["Paid Total"]).replace(/[₹,]/g, "") || 0) && (
                    <Button color="transparent" isborderRadius size="sm" style={{ color: "red", padding: "4px 8px" }} onClick={handleAddPayTrackRent} title="Add Pay Track TAA">
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}

                  <Button color="transparent" isborderRadius size="sm" style={{ color: "blue", padding: "4px 8px" }} onClick={handleViewPayTrackRent} title="View Pay Track TAA">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              );
            },
          },
        ]
      : [];

    return [...baseColumns, ...proposedOfferColumn, ...dynamicColumns, ...actionColumn];
  }, [dynamicHeaders, canAction, activeTab, buildingId, buildingName, activeTab, activeTenureTab, navigate, setPayTrackRentContext, updateListState, filters]);

  const paginationInfo: PaginationInfo = {
    ...pagination,
    onPageChange: (p) => {
      setPagination({ currentPage: p });
      updateListState({ page: p });
    },
  };

  const clearSearchRents = () => {
    debouncedSearch.cancel?.();
    updateListState({
      searchTerm: "",
      filters: { ...filters, FlatNumber: "" },
      page: 1,
    });
    setPagination({ currentPage: 1 });
  };
  

  const applyFilters = () => {
    updateListState({
      filters: tempFilters,
      page: 1,
    });
    setPagination({ currentPage: 1 });
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    const resetFilters: FilterInfo = {
      ChargeType: activeTab,
      Tenure: activeTenureTab || "",
    };

    setTempFilters(resetFilters);
    updateListState({
      filters: resetFilters,
      searchTerm: "",
      page: 1,
    });
    setPagination({ currentPage: 1 });
    setShowFilterPopup(false);
    debouncedSearch.cancel?.();
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Flat Number"
        onSearchChange={(v) => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchRents}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        // NO ADD BUTTON - VIEW ONLY
        isShowAddButton={false}
        // NO IMPORT BUTTON - VIEW ONLY
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && tableData.length > 0}
        onExportExcel={handleExportRentExcel}
        onExportPdf={handleExportRentPdf}
        exportLoading={isLoading}
      />
      
      <div className="flex items-center gap-4 flex-nowrap">
        <div className={`relative w-[300px] flex-shrink-0 ${selectedBuilding ? "pb-0" : "pb-5"}`}>
          <SingleSelectDropdownWithPagination title="Select Building" size="lg" initialValue={selectedBuilding} dataFetchCallBack={fetchBuildingCallback} isShowClearSelection={false} onSelected={handleBuildingChange} className="Bold" />
        </div>

        {/* Tabs */}
        {selectedBuilding && activeTab && (
          <div className="flex-1 min-w-0 pt-2">
            <Tabs
              tabs={rentTabList}
              defaultActive={activeTab}
              onTabChange={(t) => {
                updateListState({
                  activeTab: t.id,
                  tenure: "",
                  filters: { ...filters, ChargeType: t.id, Tenure: "" },
                  page: 1,
                });
                setPagination({ currentPage: 1 });
              }}
              islarge
            />
          </div>
        )}
      </div>

      {tenureTabList.length > 0 && (
        <div className="pt-1">
          <div className="my-3 border-b border-gray-200" />
          <Tabs
            tabs={tenureTabList}
            defaultActive={activeTenureTab}
            onTabChange={(t) => {
              updateListState({
                tenure: t.id,
                filters: { ...filters, Tenure: t.id },
                page: 1,
              });
              setPagination({ currentPage: 1 });
            }}
            islarge={false}
            isChips={true}
          />
        </div>
      )}

      <div className="pt-5">
        <DataTable data={tableData} columns={columns} pagination={paginationInfo} emptyMessage="No Data Found" fixedHeight />
      </div>
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - TAA"
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
              <Input label="Flat Number" type="text" value={tempFilters.FlatNumber || ""} onChange={(e) => handleFilterChange("FlatNumber", e.target.value)} placeholder="Enter Flat Number" />
            </div>

            <div>
              <Input label="Applicant Name" type="text" value={tempFilters.ApplicantName || ""} onChange={(e) => handleFilterChange("ApplicantName", e.target.value)} placeholder="Enter Applicant Name" />
            </div>

            <div>
              <Input label="Applicant Type" type="text" value={tempFilters.ApplicantType || ""} onChange={(e) => handleFilterChange("ApplicantType", e.target.value)} placeholder="Enter Applicant Type" />
            </div>

            <div>
              <Input label="Tenure" type="text" disabled value={tempFilters.Tenure || ""} onChange={(e) => handleFilterChange("Tenure", e.target.value)} placeholder="Enter Tenure" />
            </div>

            <div>
              <Input label="Charge Type" type="text" disabled value={tempFilters.ChargeType || ""} onChange={(e) => handleFilterChange("ChargeType", e.target.value)} placeholder="Enter Charge Type" />
            </div>

            <div>
              <Input label="Flat Type" type="text" value={tempFilters.FlatType || ""} onChange={(e) => handleFilterChange("FlatType", e.target.value)} placeholder="Enter Flat Type" />
            </div>

            <div>
              <Input label="Flat Configuration" type="text" value={tempFilters.FlatConfiguration || ""} onChange={(e) => handleFilterChange("FlatConfiguration", e.target.value)} placeholder="Enter Flat Configuration" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Rent;
