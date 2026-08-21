import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import type { DeleteTermSheetRequest, FilterWithPaginationTermSheetRequest, TermSheetData } from "@/features/termSheet/models/TermSheetModel";
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
import { FileText, GitCompare, Trash2 } from "lucide-react";
import { termSheetService } from "@/features/termSheet/services/TermSheetService";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useTermSheetListState } from "@/features/termSheet/context/TermSheetListStateContext";
import { formatCurrency } from "@/core/utils/comman";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { TERM_SHEET_APPROVAL_OPTIONS } from "@/core/constants";

export const TermSheet: React.FC = () => {

  const [termSheetList, setTermSheetList] = useState<TermSheetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();
  const { pagination, setPagination } = usePagination(20);
  const { addToast } = useToast();
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteTermSheetDetailsData, setDeleteTermSheetDetailsData] = useState<TermSheetData | null>(null);
  const [isShowCustomizeTermSheetColumnsModal, setIsShowCustomizeTermSheetColumnsModal] = useState(false);
  const { canAction, canExport } = useMenuPermissions();
  const { listState, updateListState, resetFilters, clearTermSheetContext } = useTermSheetListState();
  const { page, filters, sortInfo, searchTerm } = listState;

  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);

  const [nameOfInstitutionBankNBFC, setNameOfInstitutionBankNBFC] = useState<string | null>("");
  const [type, setType] = useState<string | null>("");
  const [facilityAmount, setFacilityAmount] = useState<number | null>(0);


  useEffect(() => {
    setPagination({ currentPage: listState.page });
    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadTermSheet(listState.page, { ProjectName: String(listState.searchTerm).trim() }, listState.sortInfo);
    } else {
      loadTermSheet(listState.page, listState.filters, listState.sortInfo);
    }
  }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm, clearTermSheetContext]);

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

      filterParams = { ProjectName: value.trim() };
    }
    updateListState({ searchTerm: value, filters: filterParams, page: 1 });
  },
    350,
  );

  const loadTermSheet = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(

      setIsLoading,
      setLoadingMessage,

      async () => {
        const params: FilterWithPaginationTermSheetRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          TermSheetId: filterParams.TermSheetId ? Number(filterParams.TermSheetId) : undefined,
          NameOfInstitutionBankNBFC: filterParams.NameOfInstitutionBankNBFC ?? undefined,
          ApprovalStatus: filterParams.ApprovalStatus ?? undefined,
          ProjectName: searchtext ?? filterParams.ProjectName ?? undefined,
          CompanyName: filterParams.CompanyName ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, TermSheetColumns)
        };

        const response = await termSheetService.apiCallPullTermSheet(params);

        if (E.isRight(response)) {

          setTermSheetList(response.right.Data);

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
      "Loading Term Sheet",
    );
  };

  const searchTermSheet = (searchValue: string) => {
    updateListState({ searchTerm: searchValue });
    debouncedSearch(searchValue, false);
  };

  const clearSearchTermSheet = () => {
    debouncedSearch.cancel?.();
    resetFilters();
    setTempFilters({});
  };

  const handleExportTermSheet = async (exportType: 'Excel' | 'PDF') => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTermSheetRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          NameOfInstitutionBankNBFC: filters.NameOfInstitutionBankNBFC?.trim() || undefined,
          ApprovalStatus: filters.ApprovalStatus ?? undefined,
          ProjectName: filters.ProjectName ?? undefined,
          CompanyName: filters.CompanyName ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, TermSheetColumns),
          ExportType: exportType,
        };

        const response = await termSheetService.apiCallPullTermSheet(params);

        handleExportFile(response, exportType, "TermSheet", addToast);

        return response;
      },
      undefined,
      (error: any) =>
        addToast({ type: "error", title: error.message || "Export failed" }),
      undefined,
      "Preparing Export",
    );
  }

  const handleExportTermSheetExcel = () => handleExportTermSheet("Excel");
  const handleExportTermSheetPdf = () => handleExportTermSheet("PDF");

  const handlePageChange = useCallback((newPage: number) => {
    updateListState({ page: newPage });
  }, [updateListState],
  );

  const handleSortColumn = useCallback((sort: SortInfo) => {
    updateListState({ sortInfo: sort, page: 1 });
  }, [updateListState],
  );

  const TermSheetPaginationInfo: PaginationInfo = useMemo(
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
  const TermSheetForTable = useMemo(() => termSheetList, [termSheetList]);

  const handleViewTermSheetDetails = useCallback((row: TermSheetData) => {

    updateListState({
      TermSheetId: row.TermSheetId ?? 0,
      TermSheetDetailsId: row.TermSheetDetailsId ?? 0,
      ProjectId: row.ProjectId ?? 0,
      NameOfInstitutionBankNBFC: row.NameOfInstitutionBankNBFC ?? "",
      ProjectName: row.ProjectName ?? "",
      ApprovalStatus: row.ApprovalStatus ?? "",
      uniquekey: row.Uniquekey
    });
    navigate("/termSheet/view");
  }, [navigate, updateListState],
  );

  const handleAddTermSheet = useCallback(() => {
    updateListState({

        TermSheetId: 0,
        TermSheetDetailsId: 0,
        ProjectId: 0,
        NameOfInstitutionBankNBFC:  "",
        ProjectName:  "",
        ApprovalStatus:  "",
        uniquekey: ""
      });
    navigate("/termSheet/add");

  }, [navigate,updateListState]);

  const handleCompareTermSheetDocument = useCallback(
    (row: TermSheetData) => {

      updateListState({

        TermSheetId: row.TermSheetId ?? 0,
        TermSheetDetailsId: row.TermSheetDetailsId ?? 0,
        ProjectId: row.ProjectId ?? 0,
        NameOfInstitutionBankNBFC: row.NameOfInstitutionBankNBFC ?? "",
        ProjectName: row.ProjectName ?? "",
        ApprovalStatus: row.ApprovalStatus ?? "",
        uniquekey: row.Uniquekey
      });

      navigate("/termSheet/compare");

    },
    [navigate, updateListState],
  );

  const handleViewTermSheetDocument = useCallback(
    (row: TermSheetData) => {

      updateListState({

        TermSheetId: row.TermSheetId ?? 0,
        TermSheetDetailsId: row.TermSheetDetailsId ?? 0,
        ProjectId: row.ProjectId ?? 0,
        NameOfInstitutionBankNBFC: row.NameOfInstitutionBankNBFC ?? "",
        ProjectName: row.ProjectName ?? "",
        ApprovalStatus: row.ApprovalStatus ?? "",
        uniquekey: row.Uniquekey
      });

      navigate("/termSheet/document");

    },
    [navigate, updateListState],
  );

  const handleConfirmationDialogBoxOpen = useCallback((row: TermSheetData) => {
    setDeleteTermSheetDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const handleApprovalLog = (row: TermSheetData) => {
    const request: ModulesApprovalStatusRequest = {
      ModuleName: "TERM SHEET APPROVAL",
      Id: row.TermSheetDetailsId ?? 0,
      ProjectId: row.ProjectId ?? 0,
    };
    setNameOfInstitutionBankNBFC(row.NameOfInstitutionBankNBFC);
    setType(row?.Type)
    setFacilityAmount(row?.FacilityAmount);

    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const TermSheetColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "ProjectName",
        label: "Project Name",
        width: "16",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "CompanyName",
        label: "Company Name",
        width: "16",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "NameOfInstitutionBankNBFC",
        label: "Name Of Institution / Bank / NBFC",
        width: "20",
        sortable: true,
        fixed: "left",
        align: "left",
        render: (value, row) => (
          <TooltipText
            text={value || "-"}
            maxWidth="250px"
            tooltipThreshold={25}
            onClick={() => handleViewTermSheetDetails(row)}
          />
        ),
      },
      {
        key: "LoanTakenBy",
        label: "Loan Taken By",
        width: "16",
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
        key: "Type",
        label: "Type",
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
        key: "TermSheetDate",
        label: "Term Sheet Date",
        width: "12",
        sortable: false,
        align: "center",
        render: (value?: string) =>
          value ? formatDate_dd_MonthName_yy(value) : "-",
      },
      {
        key: "SanctionDate",
        label: "Sanction Date",
        width: "12",
        sortable: false,
        align: "center",
        render: (value?: string) =>
          value ? formatDate_dd_MonthName_yy(value) : "-",
      },
      {
        key: 'FacilityAmount',
        label: 'Facility Amount (₹)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => formatCurrency(value ?? 0)
      },
      {
        key: 'TotalDisbursedAmount',
        label: 'Total Disbursed Amount (₹)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => formatCurrency(value ?? 0)
      },
      {
        key: 'TotalRepayLedgerAmount',
        label: 'Total Repay Amount (₹)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => formatCurrency(value ?? 0)
      },
      {
        key: 'RateOfInterestInPercentage',
        label: 'Rate Of Interest (%)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value} %` : '-'
      },
      {
        key: 'ProcessingFeesInPercentage',
        label: 'Processing Fees (%)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value} %` : '-'
      },
      {
        key: 'LegalAndDocumentationFees',
        label: 'Legal & Documentation (₹)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => formatCurrency(value ?? 0)
      },
      {
        key: 'MonotoriumPeriodInMonth',
        label: 'Monotorium Period (Months)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value || '-'
      },
      {
        key: 'LoanTenureInMonth',
        label: 'Loan Tenure (Months)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value || '-'
      },
      {
        key: 'MinimumSellingPrice',
        label: 'Minimum Selling Price (MSP) (₹)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => formatCurrency(value ?? 0)
      },
      {
        key: "LoanStartDate",
        label: "Loan Start Date",
        width: "12",
        sortable: false,
        align: "center",
        render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
      },
      {
        key: "LoanEndDate",
        label: "Loan End Date",
        width: "12",
        sortable: false,
        align: "center",
        render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
      },

      {
        key: "ApprovalStatus",
        label: "Approval Status",
        width: "18",
        sortable: false,
        align: "center",
        render: (value, row) => (

          <ApprovalActions
            approvalStatus={value || "-"}
            showApproval={row.IsApproval}
            isIcons={true}
            onHistory={
              value?.toUpperCase() === "CLOSED"
                ? undefined
                : () => handleApprovalLog(row)
            }
          />

        )
      },
      {
        key: "Actions",
        label: "Actions",
        width: "12",
        fixed: "right",
        align: "center",
        render: (_value, row) => {

          if (!canAction) return null;

          const status = String(row?.ApprovalStatus ?? "").trim().toUpperCase();

          const isApproved = status === "APPROVED" || status === "CLOSED";
          const isPending = status === "PENDING";

          const canDelete = !isApproved;
          const canViewDocument = !isPending;

          return (
            <div className="flex items-center justify-center gap-2">

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!canDelete) return;

                  handleCompareTermSheetDocument(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                disabled={!canDelete}
                style={{
                  color: canDelete ? "red" : "#9CA3AF",
                  cursor: canDelete ? "pointer" : "not-allowed",
                  opacity: canDelete ? 1 : 0.5,
                }}
                title={
                  isApproved
                    ? "Approved Term Sheet cannot be compare"
                    : "Compare Term Sheet"
                }
              >
                <GitCompare className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!canViewDocument) return;

                  handleViewTermSheetDocument(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                disabled={!canViewDocument}
                style={{
                  color: canViewDocument ? "green" : "#9CA3AF",
                  padding: "4px 8px",
                  cursor: canViewDocument ? "pointer" : "not-allowed",
                  opacity: canViewDocument ? 1 : 0.5,
                }}
                title={
                  isPending
                    ? "Pending Term Sheet document cannot be viewed"
                    : "Term Sheet Document"
                }
              >
                <FileText className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!canDelete) return;

                  handleConfirmationDialogBoxOpen(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                disabled={!canDelete}
                style={{
                  color: canDelete ? "red" : "#9CA3AF",
                  cursor: canDelete ? "pointer" : "not-allowed",
                  opacity: canDelete ? 1 : 0.5,
                }}
                title={
                  isApproved
                    ? "Approved Term Sheet cannot be deleted"
                    : "Delete Term Sheet"
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>

            </div>
          );
        },
      },
    ],
    [handleViewTermSheetDetails, handleViewTermSheetDocument, handleConfirmationDialogBoxOpen],
  );

  const requiredTermSheetColumnKeys: string[] = ["ProjectName", "NameOfInstitutionBankNBFC", "Actions"];

  const allTermSheetColumnKeys: string[] = TermSheetColumns.map((c) => c.key);

  const [selectedTermSheetColumnKeys, setSelectedTermSheetColumnKeys] =
    useState<string[]>(() => {
      try {
        const saved = LocalStorageHelper.getTermSheetTableColumns?.();

        if (saved) {
          const parsed = JSON.parse(saved) as string[];

          const withRequired = Array.from(
            new Set([...parsed, ...requiredTermSheetColumnKeys]),
          );

          return withRequired.filter((k) =>
            allTermSheetColumnKeys.includes(k),
          );
        }
      } catch { }
      return allTermSheetColumnKeys;
    });

  useEffect(() => {
    setSelectedTermSheetColumnKeys((prev) =>
      Array.from(new Set([...prev, ...requiredTermSheetColumnKeys])).filter(
        (k) => allTermSheetColumnKeys.includes(k),
      ),
    );
  }, [TermSheetColumns.length]);

  const visibleTermSheetColumns = useMemo(
    () =>
      TermSheetColumns.filter((col) =>
        selectedTermSheetColumnKeys.includes(col.key),
      ),

    [TermSheetColumns, selectedTermSheetColumnKeys],
  );

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };

  const handleDeleteTermSheet = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteTermSheetDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteTermSheetRequest = {
          TermSheetId: deleteTermSheetDetailsData.TermSheetId || 0,
          TermSheetDetailsId: deleteTermSheetDetailsData.TermSheetDetailsId || 0,

          ProjectId: deleteTermSheetDetailsData.ProjectId || 0,
        };

        const response =
          await termSheetService.apiCallDeleteTermSheet(params);

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
            termSheetList.length === 1 &&
            pagination.currentPage > 1
          ) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages,
          });
          await loadTermSheet(pageToShow, filters, sortInfo);

          addToast({
            type: "success",
            title: response.right.SuccessMessage?.[0],
          });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteTermSheetDetailsData(null);
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
      "Deleting Term Sheet",
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>  {" "}  <div></div>{" "} </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Project Name"
        onSearchChange={searchTermSheet}
        onClearSearch={clearSearchTermSheet}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeTermSheetColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddTermSheet}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && TermSheetForTable.length > 0}
        onExportExcel={handleExportTermSheetExcel}
        onExportPdf={handleExportTermSheetPdf}
        exportLoading={isLoading}
      />

      <DataTable
        data={TermSheetForTable}
        columns={visibleTermSheetColumns}
        pagination={TermSheetPaginationInfo}
        emptyMessage="No Term Sheet Data found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeTermSheetColumnsModal}
        onClose={() => setIsShowCustomizeTermSheetColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredTermSheetColumnKeys]),
          );
          setSelectedTermSheetColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeTermSheetTableColumns?.(
              JSON.stringify(withRequired),
            );
          } catch { }
        }}
        columns={TermSheetColumns}
        selectedKeys={selectedTermSheetColumnKeys}
        requiredKeys={requiredTermSheetColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Term Sheet "
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
              label="Project Name"
              value={tempFilters?.ProjectName ?? ""}
              onChange={(e) => handleFilterChange("ProjectName", e.target.value)}
              placeholder="Enter Project Name"
            />
          </div>
          <div>
            <Input
              type="text"
              label="Company Name"
              value={tempFilters?.CompanyName ?? ""}
              onChange={(e) => handleFilterChange("CompanyName", e.target.value)}
              placeholder="Enter Company Name"
            />
          </div>
          <div>
            <SinglePageSelection
              label="Status"
              placeholder="Select Status"
              value={tempFilters.ApprovalStatus || ''}
              onChange={e => handleFilterChange('ApprovalStatus', String(e))}
              options={TERM_SHEET_APPROVAL_OPTIONS.map(opt => ({
                label: opt.name,
                value: opt.id
              }))}
            />

          </div>
          <div>
            <Input
              type="text"
              label="Name of Institution / Bank / NBFC"
              value={tempFilters?.NameOfInstitutionBankNBFC ?? ""}
              onChange={(e) => handleFilterChange("NameOfInstitutionBankNBFC", e.target.value)}
              placeholder="Enter Name of Institution / Bank / NBFC"
            />
          </div>

        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteTermSheetDetailsData(null);
        }}
        onConfirm={handleDeleteTermSheet}
        loading={isLoading}
        pageName="Term Sheet"
      />

      <ApprovalLogModal
        isOpen={isApprovalLogModalOpen}
        title='Term Sheet'
        titleText={nameOfInstitutionBankNBFC ?? ""}
        subTitleText={type ?? ""}
        subSubTitleText={String(facilityAmount) ?? ""}
        onClose={() => setIsApprovalLogModalOpen(false)}
        request={approvalLogRequest} />
    </div>


  );
};
export default TermSheet;
