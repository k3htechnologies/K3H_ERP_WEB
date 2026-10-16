import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";

import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";
import type {
  ContractRequisitionData, DeleteContractRequisitionRequest, FilterWithPaginationContractRequisition,
} from "@/features/contractRequisition/models/ContractRequisitionModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { updateFilter } from "@/core/utils/filterHelper";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { runApiWithLoader } from "@/core/utils";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { Button, Input } from "@/ui/components/forms";
import { Edit, Trash2 } from "lucide-react";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { handleExportFile } from "@/core/utils/exportFile";
import { contractRequisitionService } from "../services/ContractRequisitionService";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Modal } from "@/ui/components/Modal/Modal";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { MATERIAL_REQUISITION_STAGES_OPTIONS, MATERIAL_REQUISITION_STATUS_OPTIONS } from "@/core/constants";
import { DateInput } from "@/ui/components/forms/DateInput";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

export const ContractRequisition: React.FC = () => {
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [contractRequisitionData, setContractRequisitionData] = useState<ContractRequisitionData[]>([]);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [deleteData, setDeleteData] = useState<ContractRequisitionData | null>(null);

  const { addToast } = useToast();
  const { pagination, setPagination } = usePagination(20);
  const { listState, updateListState, clearContractRequisitionContext } = useContractRequisitionListState();
  const { searchTerm, filters, sortInfo } = listState;
  const [isShowCustomizeContractRequisitionColumnsModal, setIsShowCustomizeContractRequisitionColumnsModal] = useState(false);
  const navigate = useNavigate();
  const { canAction, canExport } = useMenuPermissions();
  const { projectId } = useProject();

  const fetchLoadDetailsList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadDetailsdata(page, filters, sort ?? sortInfo);
  };

  const loadDetailsdata = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationContractRequisition = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          ContractRequisitionStatus: filterParams?.ContractRequisitionStatus ?? undefined,
          ContractRequisitionStage: filterParams?.ContractRequisitionStage ?? undefined,
          SystemGeneratedCode: searchtext ?? filterParams?.SystemGeneratedCode ?? undefined,
          FromDate: filterParams?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
          ToDate: filterParams?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
          SortBy: getSortByParam(sortInfo ?? null, ContractRequisitionColumns),
        };

        const response = await contractRequisitionService.apiCallPullContractRequisition(params);

        if (E.isRight(response)) {
          setContractRequisitionData(response.right.Data);

          setPagination({
            currentPage: page,
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
      "Loading Contract Requisition",
    );
  };

  useEffect(() => {
    if (!projectId) return;

    if (listState.searchTerm && listState.searchTerm.trim()) {
      loadDetailsdata(listState.page, { SystemGeneratedCode: listState.searchTerm.trim() }, listState.sortInfo);
    } else {
      loadDetailsdata(listState.page, listState.filters, listState.sortInfo);
    }
  }, [projectId, listState.page, listState.filters, listState.sortInfo, listState.searchTerm, clearContractRequisitionContext]);

  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {}, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchContractRequisition(value);
  }, 350);

  const searchContractRequisition = async (searchValue: string) => {
    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === "") {
      fetchLoadDetailsList();
      return;
    }

    updateListState({ filters, page: 1, searchTerm: searchValue });
    await loadDetailsdata(1, filters, sortInfo, searchValue);
  };

  const handleNavigateToView = useCallback(
    (row: ContractRequisitionData) => {
      updateListState({
        ContractRequisitionId: row.ContractRequisitionId ?? 0,
        Uniquekey: row.UniqueKey,
        IsLockAndKeyContract: row.IsLockAndKey,
        SystemGeneratedCode: row.SystemGeneratedCode,
        ContractRequisitionStatus: row.ContractStatus,
        VendorFinalizationApprovalStatus: row.VendorFinalizationApprovalStatus,
        VendorName: row.FinalVendor,
      });
      navigate("/contractRequisition/view");
    },
    [navigate, updateListState],
  );

  const handleDeleteRequest = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteData) return;
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: DeleteContractRequisitionRequest = {
          ContractRequisitionId: deleteData.ContractRequisitionId,
          UniqueKey: deleteData.UniqueKey,
          ProjectId: String(projectId)
        };

        const response = await contractRequisitionService.apiCallDeleteContractRequisition(payload);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (contractRequisitionData.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages,
          });

          await loadDetailsdata(pageToShow, filters, sortInfo);

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteData(null);
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
      "Deleting Requisition",
    );
  };

  const handlePageChange = (page: number) => {
    updateListState({ page });
  };

  const handleContractRequisitionEdit = useCallback(
    (row: ContractRequisitionData) => {
      updateListState({ ContractRequisitionId: row.ContractRequisitionId });
      navigate(`/contractRequisition/add/${row.ContractRequisitionId}`);
    },
    [navigate, updateListState],
  );

  const ContractRequisitionPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination, handlePageChange],
  );

  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      updateListState({ sortInfo: sort, page: 1 });
      loadDetailsdata(1, filters, sort, searchTerm || undefined);
    },
    [filters, updateListState, searchTerm],
  );

  const handleConfirmationDialogBoxOpen = useCallback((row: ContractRequisitionData) => {
    setDeleteData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const getContractRequisition = async (filterParams: FilterWithPaginationContractRequisition) => {
    return await contractRequisitionService.apiCallPullContractRequisition(filterParams);
  };

  const clearSearchContractRequisition = () => {
    debouncedSearch.cancel?.();
    updateListState({ searchTerm: "", filters: {}, page: 1 });
    setTempFilters({});
    loadDetailsdata(1, { SystemGeneratedCode: "" }, sortInfo, undefined);
  };

  const handleAddContractRequisitionModal = useCallback(() => {
    navigate("/contractRequisition/add");
  }, [navigate]);

  const handleExportContractRequisition = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationContractRequisition = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ProjectId: Number(projectId),
          ContractRequisitionStatus: filters?.ContractRequisitionStatus ?? undefined,
          ContractRequisitionStage: filters?.ContractRequisitionStage ?? undefined,
          SystemGeneratedCode: searchTerm ?? filters?.SystemGeneratedCode ?? undefined,
          FromDate: filters?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.FromDate) || undefined : undefined,
          ToDate: filters?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.ToDate) || undefined : undefined,

          ExportType: exportType,
        };

        const response = await getContractRequisition(params);

        handleExportFile(response, exportType, "Contract Requisition", addToast);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message || "Export failed" }),
      undefined,
      "Preparing Export",
    );
  };

  const handleExportContractRequisitionsExcel = () => handleExportContractRequisition("Excel");
  const handleExportContractRequisitionPdf = () => handleExportContractRequisition("PDF");

  const getContractRequisitionStatusColor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {
      "Completed": { bg: "#51E5514A", text: "#48C848" },
      "Closed": { bg: "#FF003726", text: "#FF0037" },
      "Ongoing": { bg: "#DBEAFE", text: "#2563EB" },
    };
    return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
  };


  const ContractRequisitionColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "SystemGeneratedCode",
        label: "Unique Id",
        width: "20",
        sortable: true,
        fixed: "left",
        align: "left",
        render: (value, row) => (
          <TooltipText text={value || "-"} maxWidth="250px" tooltipThreshold={25} onClick={() => handleNavigateToView(row)} />
        ),
      },
      {
        key: "ContractType",
        label: "Contract Type",
        width: "15",
        sortable: false,
        align: "left",
        render: (value) => value.toUpperCase() || "-",
      },
      {
        key: "ContractStatus",
        label: "Status",
        width: "15",
        sortable: false,
        align: "left",
        render: (value, row) => {
          const { bg, text } = getContractRequisitionStatusColor(value);

          return (
                    <div className="flex items-center gap-2">
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                                backgroundColor: bg,
                                color: text,
                            }}
                        >
                            {value || "-"}
                        </span>
                        {["COMPLETED", "CLOSED"].includes(value?.toUpperCase()) && (
                            <FieldInfoTooltip value={row.CloseCompletionRemark} />
                        )}
                    </div>
          );
        },
      },
      {
        key: "EstimatedDate",
        label: "Start Date",
        width: "15",
        sortable: true,
        align: "left",
        render: value => value ? formatDate_dd_MonthName_yy(value) : '-'

      },
      {
        key: "WorkOrderURL",
        label: "Work Order",
        width: "15",
        sortable: false,
        align: "left",
        render: (_value: string, row: any) => {
          const urls = parseDocumentUrls(row.PurchaseOrderURL);

          if (!urls || urls.length === 0) {
            return <span>-</span>;
          }

          return (
            <div className="flex items-center justify-between gap-2 w-full">
              <MultiImageViewer
                images={urls}
                title="Document"
                triggerLabel={<TooltipText text="View" maxWidth="250px" tooltipThreshold={25} />}
              />
            </div>
          );
        },
      },
      {
        key: "Actions",
        label: "Actions",
        width: "20",
        fixed: "right",
        align: "center",
        render: (_value, row) => {
          const isLockAndKeyContract = row.ContractType === "lock and key";
          return (
            <div className="flex items-center justify-center gap-1">
              {true && (
                <>
                  <Button
                    type="button"
                    color="transparent"
                    size="sm"
                    disabled={isLockAndKeyContract}
                    style={{
                      color: isLockAndKeyContract ? "#9CA3AF" : "#2563eb",
                      padding: "4px 8px",
                      cursor: isLockAndKeyContract ? "not-allowed" : "pointer",
                      opacity: isLockAndKeyContract ? 0.5 : 1,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleContractRequisitionEdit(row);
                    }}
                    leftIcon={<Edit className="h-4 w-4" />}
                  />

                  <Button
                    type="button"
                    color="transparent"
                    size="sm"
                    // disabled={!canActionStage}
                    // style={{
                    //   color: canActionStage ? "#dc2626" : "#9CA3AF",
                    //   padding: "4px 8px",
                    //   cursor: canActionStage ? "pointer" : "not-allowed",
                    //   opacity: canActionStage ? 1 : 0.5,
                    // }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleConfirmationDialogBoxOpen(row);
                    }}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  />
                </>
              )}
            </div>
          );
        },
      },
    ],
    [handleNavigateToView, handleContractRequisitionEdit, canAction],
  );

  const requiredContractRequisitionColumnKeys: string[] = ["SystemGeneratedCode", "Actions"];

  const allContractRequisitioKeys: string[] = ContractRequisitionColumns.map((c) => c.key);

  const [selectedContractRequisitionColumnKeys, setSelectedContractRequisitionColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getContractRequisitionTableColumns();

      if (saved) {
        const parsed = JSON.parse(saved) as string[];

        const withRequired = Array.from(new Set([...parsed, ...requiredContractRequisitionColumnKeys]));

        return withRequired.filter((k) => allContractRequisitioKeys.includes(k));
      }
    } catch { }
    return allContractRequisitioKeys;
  });

  useEffect(() => {
    setSelectedContractRequisitionColumnKeys((prev) =>
      Array.from(new Set([...prev, ...requiredContractRequisitionColumnKeys])).filter((k) => allContractRequisitioKeys.includes(k)),
    );
  }, [ContractRequisitionColumns.length]);

  const visibleContractRequisitionColumns = useMemo(
    () => ContractRequisitionColumns.filter((col) => selectedContractRequisitionColumnKeys.includes(col.key)),

    [ContractRequisitionColumns, selectedContractRequisitionColumnKeys],
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Unique Id"
        onSearchChange={(v) => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchContractRequisition}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeContractRequisitionColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddContractRequisitionModal}
        isShowImportButton={canAction}
        isShowExportButton={canExport && contractRequisitionData.length > 0}
        onExportExcel={handleExportContractRequisitionsExcel}
        onExportPdf={handleExportContractRequisitionPdf}
        exportLoading={isLoading}
      />

      <DataTable
        data={contractRequisitionData}
        columns={visibleContractRequisitionColumns}
        pagination={ContractRequisitionPaginationInfo}
        emptyMessage="No Contract Requisition Found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeContractRequisitionColumnsModal}
        onClose={() => setIsShowCustomizeContractRequisitionColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredContractRequisitionColumnKeys]));
          setSelectedContractRequisitionColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeContractRequisitionTableColumns?.(JSON.stringify(withRequired));
          } catch { }
        }}
        columns={ContractRequisitionColumns}
        selectedKeys={selectedContractRequisitionColumnKeys}
        requiredKeys={requiredContractRequisitionColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Contract Requisition"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-4">
          <div>
            <Input
              label='Contract Requisition Id'
              type="text"
              value={tempFilters.ContractRequisitionId || ''}
              onChange={e => handleFilterChange('ContractRequisitionId', e.target.value)}
              placeholder="Contract Requisition Id"
            />
          </div>
          <div>
            <SinglePageSelection
              label="Contract Requisition Stage"
              placeholder="Select Stage"
              value={tempFilters?.ContractRequisitionStage || ""}
              options={MATERIAL_REQUISITION_STAGES_OPTIONS.map((stage) => ({ label: stage.name, value: stage.id }))}
              onChange={(value) => handleFilterChange("ContractRequisitionStage", String(value))}
            />
          </div>
          <div>
            <SinglePageSelection
              label="Contract Requisition Status"
              placeholder="Select Status"
              value={tempFilters?.ContractRequisitionStatus || ""}
              options={MATERIAL_REQUISITION_STATUS_OPTIONS.map((status) => ({ label: status.name, value: status.id }))}
              onChange={(value) => handleFilterChange("ContractRequisitionStatus", String(value))}
            />
          </div>
          <div>
            <DateInput
              label="Start Date"
              value={tempFilters?.FromDate || ""}
              onChange={(value: any) => handleFilterChange("FromDate", value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
          <div>
            <DateInput
              label="To Date"
              value={tempFilters?.ToDate || ""}
              onChange={(value: any) => handleFilterChange("ToDate", value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteData(null);
        }}
        onConfirm={handleDeleteRequest}
        loading={isLoading}
        pageName="Contract Requisition"
      />
    </div>
  );
};
