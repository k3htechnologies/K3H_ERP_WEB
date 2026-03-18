import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import {
  DataTable,
  type FilterInfo,
  type PaginationInfo,
  type SortInfo,
  type TableColumn,
} from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import type {
  DeleteLitigationRequest,
  FilterWithPaginationLitigationRequest,
  LitigationData,
} from "@/features/litigation/models/LitigationModel";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { Button, Input } from "@/ui/components/forms";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { useNavigate } from "react-router-dom";
import { updateFilter } from "@/core/utils/filterHelper";
import { FileText, Trash2 } from "lucide-react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { getLitigationStatuscolor } from "./Status";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useLitigationListState } from "@/features/litigation/context/LitigationListStateContext";
import { litigationService } from "../services/LitigationService";

export const Litigation: React.FC = () => {
  //#region STATE MANAGEMENT
  const [litigationList, setLitigationList] = useState<LitigationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // USE NAVIGATE
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast();

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //DELETE LITIGATION
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] =
    useState(false);
  const [deleteLitigationDetailsData, setDeleteLitigationDetailsData] =
    useState<LitigationData | null>(null);

  //CUSTOMIZE COLUMN MODAL
  const [
    isShowCustomizeLitigationColumnsModal,
    setIsShowCustomizeLitigationColumnsModal,
  ] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region LITIGATION LIST STATE CONTEXT
  const { listState, updateListState, resetFilters, clearLitigationContext } =
    useLitigationListState();
  const { page, filters, sortInfo, searchTerm } = listState;
  //#endregion

  //#region INIT
  useEffect(() => {
    if (!projectId) return;

    if (searchTerm && searchTerm.trim()) {
      loadLitigation(page, { Title: searchTerm.trim() }, sortInfo);
    } else {
      loadLitigation(page, filters, sortInfo);
    }
  }, [projectId, page, filters, sortInfo, searchTerm, clearLitigationContext]);

  useEffect(() => {
    setPagination({ currentPage: page });
  }, [page]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);
  //#endregion

  const debouncedSearch = useDebouncedCallback(
    (value: string, isSerach: boolean = true) => {
      let filterParams: FilterInfo = {};

      if (value.trim() === "") {
        updateListState({ searchTerm: "", filters: {}, page: 1 });
        return;
      }
      if (isSerach) {
        filterParams = { Title: value.trim() };
      }
      updateListState({ searchTerm: value, filters: filterParams, page: 1 });
    },
    350,
  );
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const loadLitigation = async (
    page: number,
    filterParams: FilterInfo,
    sortInfo?: SortInfo,
    searchtext?: string,
  ) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLitigationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          LitigationId: filterParams.LitigationId
            ? Number(filterParams.LitigationId)
            : undefined,
          Title: searchtext ?? filterParams.Title ?? undefined,
          CaseNumber: filterParams.CaseNumber ?? undefined,
          CourtName: filterParams.CourtName ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, LitigationColumns),
          ProjectId: Number(projectId),
        };

        const response = await litigationService.apiCallPullLitigation(params);

        if (E.isRight(response)) {

          setLitigationList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(
              response.right.TotalNumberOfRecord / pagination.pageSize,
            ),
          });

        } else {
          addToast({ type: "error", title: response.left.message });
          return response;
        }
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Litigation",
    );
  };
  //#endregion

  //#region SEARCH LITIGATION
  const searchLitigation = (searchValue: string) => {
    updateListState({ searchTerm: searchValue });
    debouncedSearch(searchValue, false);
  };
  //#endregion

  //#region CLEAR LITIGATION
  const clearSearchLitigation = () => {
    debouncedSearch.cancel?.();
    resetFilters();
    setTempFilters({});
  };
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const handleExportLitigation = async (exportType: 'Excel' | 'PDF') => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLitigationRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Title: filters.Title?.trim() || undefined,
          CaseNumber: filters.CaseNumber ?? undefined,
          CourtName: filters.CourtName ?? undefined,
          ProjectId: Number(projectId),
          SortBy: getSortByParam(sortInfo ?? null, LitigationColumns),
          ExportType: exportType,
        };

        const response =
          await litigationService.apiCallPullLitigation(params);

        handleExportFile(response, exportType, "Litigation", addToast);

        return response;
      },
      undefined,
      (error: any) =>
        addToast({ type: "error", title: error.message || "Export failed" }),
      undefined,
      "Preparing Export",
    );
  }

  const handleExportLitigationExcel = () => handleExportLitigation("Excel");
  const handleExportLitigationPdf = () => handleExportLitigation("PDF");
  //#endregion

  //#region HANDLE PAGE CHNAGE
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateListState({ page: newPage });
    },
    [updateListState],
  );

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      updateListState({ sortInfo: sort, page: 1 });
    },
    [updateListState],
  );
  //#endregion

  //#region TABLE PAGINATION INFO
  const LitigationPaginationInfo: PaginationInfo = useMemo(
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
  const LitigationForTable = useMemo(() => litigationList, [litigationList]);

  //#endregion

  //#region NAVIGATE TO  VIEW LITIGATION
  const handleViewLitigationDetails = useCallback(
    (row: LitigationData) => {
      updateListState({
        LitigationId: row.LitigationId ?? 0,
        Title: row.Title ?? "",
      });
      navigate("/litigation/view");
    },
    [navigate, updateListState],
  );
  //#endregion

  //#region NAVIGATE TO ADD LITIGATION
  const handleAddLitigation = useCallback(() => {
    navigate("/litigation/add");
  }, [navigate]);
  //#endregion

  //#region NAVIGATE TO LITIGATION DOCUMENT
  const handleViewLitigationDocument = useCallback(
    (row: LitigationData) => {
      updateListState({ LitigationId: row.LitigationId, Title: row.Title });
      navigate("/litigation/document");
    },
    [navigate, updateListState],
  );
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: LitigationData) => {
    setDeleteLitigationDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region TABLE COLUMNS
  const LitigationColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "Title",
        label: "Title",
        width: "20",
        sortable: true,
        fixed: "left",
        align: "left",
        render: (value, row) => (
          <TooltipText
            text={value || "-"}
            maxWidth="250px"
            tooltipThreshold={25}
            onClick={() => handleViewLitigationDetails(row)}
          />
        ),
      },
      {
        key: "CaseNumber",
        label: "Case / Petition / Dispute Number",
        width: "16",
        sortable: false,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "CaseType",
        label: "Case Type",
        width: "15",
        sortable: true,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "HearingDate",
        label: "Hearing Date",
        width: "12",
        sortable: false,
        align: "center",
        render: (value?: string) =>
          value ? formatDate_dd_MonthName_yy(value) : "-",
      },
      {
        key: "ClosureDate",
        label: "Closure Date",
        width: "12",
        sortable: false,
        align: "center",
        render: (value?: string) =>
          value ? formatDate_dd_MonthName_yy(value) : "-",
      },
      {
        key: "DateOfFilling",
        label: "Date Of Filling",
        width: "12",
        sortable: false,
        align: "center",
        render: (value?: string) =>
          value ? formatDate_dd_MonthName_yy(value) : "-",
      },
      {
        key: "Status",
        label: "Status",
        width: "14",
        sortable: false,
        align: "center",
        render: (value) => {
          const { bg, text } = getLitigationStatuscolor(value);

          return (
            <span
              className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: bg,
                color: text,
              }}
            >
              {value || "-"}
            </span>
          );
        },
      },
      {
        key: "CourtName",
        label: "Court Name",
        width: "15",
        sortable: true,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "CourtLocation",
        label: "Court Location",
        width: "15",
        sortable: false,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "CourtType",
        label: "Court Type",
        width: "16",
        sortable: false,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "Plantiff",
        label: "Plaintiff / Complaint / Petitioner",
        width: "15",
        sortable: false,
        align: "center",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        ),
      },
      {
        key: "Defendant",
        label: "Defendant / Opposite Party / Respondent",
        width: "15",
        sortable: false,
        align: "center",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        ),
      },
      {
        key: "AssignedRepresentative",
        label: "Assigned Representative",
        width: "15",
        sortable: false,
        align: "center",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="250px"
            tooltipThreshold={25}
          />
        ),
      },
      {
        key: "OpposingRepresentative",
        label: "Opposing Representative",
        width: "15",
        sortable: false,
        align: "center",
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
                  handleViewLitigationDocument(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                style={{
                  color: "green",
                  padding: "4px 8px",
                }}
                title="Litigation Document"
              >
                <FileText className="h-4 w-4" />
              </Button>

              {row?.IsDelete && (
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
                  title="Delete Litigation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [
      handleViewLitigationDetails,
      handleViewLitigationDocument,
      handleConfirmationDialogBoxOpen,
    ],
  );
  //#endregion

  //#region COLUMN CUSTOMIZATION
  const requiredLitigationColumnKeys: string[] = ["Title", "Actions"];

  const allLitigationColumnKeys: string[] = LitigationColumns.map((c) => c.key);

  const [selectedLitigationColumnKeys, setSelectedLitigationColumnKeys] =
    useState<string[]>(() => {
      try {
        const saved = LocalStorageHelper.getLitigationTableColumns?.();

        if (saved) {
          const parsed = JSON.parse(saved) as string[];

          const withRequired = Array.from(
            new Set([...parsed, ...requiredLitigationColumnKeys]),
          );

          return withRequired.filter((k) =>
            allLitigationColumnKeys.includes(k),
          );
        }
      } catch { }
      return allLitigationColumnKeys;
    });

  useEffect(() => {
    setSelectedLitigationColumnKeys((prev) =>
      Array.from(new Set([...prev, ...requiredLitigationColumnKeys])).filter(
        (k) => allLitigationColumnKeys.includes(k),
      ),
    );
  }, [LitigationColumns.length]);

  const visibleLitigationColumns = useMemo(
    () =>
      LitigationColumns.filter((col) =>
        selectedLitigationColumnKeys.includes(col.key),
      ),

    [LitigationColumns, selectedLitigationColumnKeys],
  );
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };
  //#endregion

  //#region DELETE LITIGATION
  const handleDeleteLitigation = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLitigationDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteLitigationRequest = {
          LitigationId: deleteLitigationDetailsData.LitigationId || 0,

          Uniquekey: deleteLitigationDetailsData.Uniquekey || "",

          ProjectId: deleteLitigationDetailsData.ProjectId || 0,
        };

        const response =
          await litigationService.apiCallDeleteLitigation(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(
            1,
            Math.ceil(newTotalRecords / pagination.pageSize),
          );

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (
            litigationList.length === 1 &&
            pagination.currentPage > 1
          ) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages,
          });
          await loadLitigation(pageToShow, filters, sortInfo);

          addToast({
            type: "success",
            title: response.right.SuccessMessage?.[0],
          });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteLitigationDetailsData(null);
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
      "Deleting Litigation",
    );
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Loader */}
      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Title"
        onSearchChange={searchLitigation}
        onClearSearch={clearSearchLitigation}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeLitigationColumnsModal(true)}
        // ADD
        isShowAddButton={canAction && Number(projectId) > 0}
        addTitle="Add"
        onAdd={handleAddLitigation}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && LitigationForTable.length > 0}
        onExportExcel={handleExportLitigationExcel}
        onExportPdf={handleExportLitigationPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE LITIGATION*/}
      <DataTable
        data={LitigationForTable}
        columns={visibleLitigationColumns}
        pagination={LitigationPaginationInfo}
        emptyMessage="No Litigation Data found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* CUSTOMIZE COLUMNS MODAL */}

      <CustomizeColumnsModal
        isOpen={isShowCustomizeLitigationColumnsModal}
        onClose={() => setIsShowCustomizeLitigationColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredLitigationColumnKeys]),
          );
          setSelectedLitigationColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeLitigationTableColumns?.(
              JSON.stringify(withRequired),
            );
          } catch { }
        }}
        columns={LitigationColumns}
        selectedKeys={selectedLitigationColumnKeys}
        requiredKeys={requiredLitigationColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER LITIGATION MODAL */}

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Litigation "
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
              label="Title"
              value={tempFilters?.Title ?? ""}
              onChange={(e) => handleFilterChange("Title", e.target.value)}
              placeholder="Enter Title"
            />
          </div>

          <div>
            <Input
              type="text"
              label="Case Number"
              value={tempFilters?.CaseNumber ?? ""}
              onChange={(e) => handleFilterChange("CaseNumber", e.target.value)}
              placeholder="Enter Case Number"
            />
          </div>

          <div>
            <Input
              type="text"
              label="Court Name"
              value={tempFilters?.CourtName ?? ""}
              onChange={(e) => handleFilterChange("CourtName", e.target.value)}
              placeholder="Enter Court Name"
            />
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION LITIGATION MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteLitigationDetailsData(null);
        }}
        onConfirm={handleDeleteLitigation}
        loading={isLoading}
        pageName="Litigation"
      />
    </div>
  );
};
export default Litigation;
