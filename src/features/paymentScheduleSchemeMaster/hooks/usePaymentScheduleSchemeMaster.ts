import { useCallback, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import type { FilterInfo, SortInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import type {
  AddUpdatePaymentScheduleSchemeMasterRequest,
  DeletePaymentScheduleSchemeMasterRequest,
  PaymentScheduleSchemeMasterData,
  FilterWithPaginationPaymentScheduleSchemeMaster,
} from "@/features/paymentScheduleSchemeMaster/models/PaymentScheduleSchemeMasterModel";
import { paymentScheduleSchemeMasterService } from "@/features/paymentScheduleSchemeMaster/services/PaymentScheduleSchemeMasterService";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import {
  getInitialFormState,
  getPaymentScheduleSchemeMasterColumns,
  REQUIRED_COLUMN_KEYS,
} from "@/features/paymentScheduleSchemeMaster/constants/paymentScheduleSchemeMaster";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { handleExportFile } from "@/core/utils/exportFile";
import { fetchBuildingDropdown, fetchWingDropdown } from "@/features/inventory/InventoryDropdown";
import { updateFilter } from "@/core/utils/filterHelper";

export const usePaymentScheduleSchemeMaster = () => {
  //#region STATE MANAGEMENT
  const [paymentScheduleSchemeMasterList, setPaymentScheduleSchemeMasterList] = useState<PaymentScheduleSchemeMasterData[]>([]);
  const [viewPaymentScheduleSchemeMasterDetailsData, setViewPaymentScheduleSchemeMasterDetailsData] =
    useState<PaymentScheduleSchemeMasterData | null>(null);
  const { pagination, setPagination } = usePagination(20);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { addToast } = useToast();

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deletePaymentScheduleSchemeMasterDetailsData, setDeletePaymentScheduleSchemeMasterDetailsData] =
    useState<PaymentScheduleSchemeMasterData | null>(null);
  const [editingPaymentScheduleSchemeMasterData, setEditingPaymentScheduleSchemeMasterData] =
    useState<PaymentScheduleSchemeMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AddUpdatePaymentScheduleSchemeMasterRequest>(() => getInitialFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isShowCustomizePaymentScheduleSchemeMasterColumnsModal, setIsShowCustomizePaymentScheduleSchemeMasterColumnsModal] =
    useState(false);
  const [wingOptions, setWingOptions] = useState<{ label: string; value: number }[]>([]);
  const [buildingOptions, setBuildingOptions] = useState<{ label: string; value: number }[]>([]);
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchPaymentScheduleSchemeMaster(value);
  }, 350);
  const { canAction, canExport } = useMenuPermissions("/paymentScheduleScheme");
  const { projectId } = useProject();

  useEffect(() => {
    if (!projectId) return;

    fetchPaymentScheduleSchemeMasterList();
  }, [projectId]);

  useEffect(() => {
    setSelectedPaymentScheduleSchemeMasterColumnKeys((prev) =>
      Array.from(new Set([...prev, ...requiredPaymentScheduleSchemeMasterColumnKeys])).filter((k) =>
        allPaymentScheduleSchemeMasterColumnKeys.includes(k),
      ),
    );
  }, []);

  //Debounce search
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  //#region TABLE COLUMN DEFINITION
  const paymentScheduleSchemeMasterColumns = useMemo<TableColumn[]>(() => getPaymentScheduleSchemeMasterColumns(), []);
  //#endregion

  // BUILDINGS AND WINGS
  useEffect(() => {
    if (!projectId) return;
    fetchBuildingDropdown({ projectId: Number(projectId) }).then((res) => {
      setBuildingOptions(res.itemList);
    });
  }, [projectId]);

  //#region SEARCH PAYMENT SCHEDULE SCHEME MASTER
  const searchPaymentScheduleSchemeMaster = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === "") {
      fetchPaymentScheduleSchemeMasterList();
      return;
    }
    await loadPaymentScheduleSchemeMaster(1, filters, sortInfo, searchValue);
  };
  //#endregion

  //#region CLEAR SEARCH PAYMENT SCHEDULE SCHEME MASTER
  const clearsearchPaymentScheduleSchemeMaster = () => {
    debouncedSearch.cancel?.();
    setSearchTerm("");
    loadPaymentScheduleSchemeMaster(1, filters, sortInfo, undefined);
  };
  //#endregion

  const handleBuildingChange = async (buildingId: number) => {
    if (errors.InventoryBuildingId) {
      setErrors((prev) => ({ ...prev, InventoryBuildingId: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      InventoryBuildingId: buildingId || 0,
      InventoryFlatFloorBasementPodiumWingId: 0,
    }));

    if (!buildingId) {
      setWingOptions([]);
      return;
    }

    try {
      const res = await fetchWingDropdown({
        projectId: projectId ?? undefined,
        inventoryBuildingId: buildingId,
      });

      setWingOptions(res?.itemList ?? []);
    } catch (error) {
      console.error("Wing dropdown fetch failed", error);
      setWingOptions([]);
    }
  };

  const handleAddPaymentScheduleSchemeMasterModal = () => {
    setIsEditing(false);
    setEditingPaymentScheduleSchemeMasterData(null);
    setFormData(getInitialFormState());
    setWingOptions([]);
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  //#region ADD UPDATE EDIT PAYMENT SCHEDULE SCHEME MASTER
  const handleFieldChange = (field: keyof AddUpdatePaymentScheduleSchemeMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateAddPaymentScheduleSchemeMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.InventoryBuildingId) {
      newErrors.InventoryBuildingId = "Building is required";
    }

    if (!formData.InventoryFlatFloorBasementPodiumWingId) {
      newErrors.InventoryFlatFloorBasementPodiumWingId = "Wing is required";
    }

    if (!formData.PaymentScheduleScheme) {
      newErrors.PaymentScheduleScheme = "Scheme is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  //#region ADD | EDIT PAYMENT SCHEDULE SCHEME MASTER
  const handleAddEditPaymentScheduleSchemeMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateAddPaymentScheduleSchemeMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = {
          ...formData,
          ProjectId: Number(projectId),
        };

        const response = await paymentScheduleSchemeMasterService.apiCallAddUpdatePaymentScheduleSchemeMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.PaymentScheduleSchemeMasterId === 0 || !formData.PaymentScheduleSchemeMasterId;

          if (isAdd) {
            const newRecord = response.right.Data[0] as PaymentScheduleSchemeMasterData;

            setPaymentScheduleSchemeMasterList((prevData) => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize),
            });

            addToast({ type: "success", title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as PaymentScheduleSchemeMasterData;

            setPaymentScheduleSchemeMasterList((prevData) =>
              prevData.map((item) =>
                item.PaymentScheduleSchemeMasterId === formData.PaymentScheduleSchemeMasterId ? updatedRecord : item,
              ),
            );

            addToast({ type: "success", title: response.right.SuccessMessage[0] });
          }
          setEditingPaymentScheduleSchemeMasterData(null);
        } else {
          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      Number(formData.PaymentScheduleSchemeMasterId) === 0 ? "Add Scheme" : "Update Scheme",
    );
  };
  // #endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const fetchPaymentScheduleSchemeMasterList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadPaymentScheduleSchemeMaster(page, filters, sort ?? sortInfo);
  };

  const loadPaymentScheduleSchemeMaster = useCallback(
    async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,

        async () => {
          const params: FilterWithPaginationPaymentScheduleSchemeMaster = {
            PageNumber: page,
            PageSize: pagination.pageSize,
            IsCheckPermission: true,
            ProjectId: Number(projectId),
            PaymentScheduleSchemeMasterId: filterParams.PaymentScheduleSchemeMasterId
              ? Number(filterParams.PaymentScheduleSchemeMasterId)
              : 0,
            PaymentScheduleScheme: searchtext ?? filterParams.PaymentScheduleScheme ?? undefined,
            BuildingNumber: filterParams.BuildingNumber?.trim() || undefined,
            Wing: filterParams.Wing?.trim() || undefined,
            SortBy: getSortByParam(sortInfo ?? null, paymentScheduleSchemeMasterColumns),
          };

          const response = await paymentScheduleSchemeMasterService.apiCallPullPaymentScheduleSchemeMaster(params);
          if (E.isRight(response)) {
            setPaymentScheduleSchemeMasterList(response.right.Data);

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
        "Loading Payment Schedule Scheme",
      );
    },
    [projectId],
  );
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredPaymentScheduleSchemeMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allPaymentScheduleSchemeMasterColumnKeys: string[] = paymentScheduleSchemeMasterColumns.map((c) => c.key);

  const [selectedPaymentScheduleSchemeMasterColumnKeys, setSelectedPaymentScheduleSchemeMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getPaymentScheduleSchemeMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredPaymentScheduleSchemeMasterColumnKeys]));
        return withRequired.filter((k) => allPaymentScheduleSchemeMasterColumnKeys.includes(k));
      }
    } catch {}
    return allPaymentScheduleSchemeMasterColumnKeys;
  });

  const visiblePaymentScheduleSchemeMasterColumns = useMemo(
    () => paymentScheduleSchemeMasterColumns.filter((col) => selectedPaymentScheduleSchemeMasterColumnKeys.includes(col.key)),
    [paymentScheduleSchemeMasterColumns, selectedPaymentScheduleSchemeMasterColumnKeys],
  );
  //#endregion

  //#region VIEW EDIT
  const handleViewPaymentScheduleSchemeMasterDetails = useCallback((row: PaymentScheduleSchemeMasterData) => {
    setIsEditing(false);
    setViewPaymentScheduleSchemeMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);

  //#region EDIT DEPARTMENT MASTER
  const handleEditPaymentScheduleSchemeMasterDetails = useCallback((row: PaymentScheduleSchemeMasterData) => {
    setErrors({});
    setEditingPaymentScheduleSchemeMasterData(row);

    handleBuildingChange(row.InventoryBuildingId || 0);

    setFormData({
      PaymentScheduleSchemeMasterId: row.PaymentScheduleSchemeMasterId || 0,
      Uniquekey: row.Uniquekey || "",
      ProjectId: row.ProjectId || 0,
      InventoryBuildingId: row.InventoryBuildingId || 0,
      PaymentScheduleScheme: row.PaymentScheduleScheme || "",
      OrderBy: row.OrderBy || 0,
      InventoryFlatFloorBasementPodiumWingId: row.InventoryFlatFloorBasementPodiumWingId || 0,
    });
    setIsEditing(row.IsExistsPaymentScheduleScheme);
    setIsAddUpdateModalOpen(true);
  }, []);
  //#endregion

  //#region DELETE
  const handleConfirmationDialogBoxOpen = useCallback((row: PaymentScheduleSchemeMasterData) => {
    setDeletePaymentScheduleSchemeMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadPaymentScheduleSchemeMaster(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region Clear
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadPaymentScheduleSchemeMaster(1, {});
  };
  //#endregion

  //#region HANDLE FILTER CHANGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportPaymentScheduleSchemeMaster = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationPaymentScheduleSchemeMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectId: Number(projectId),
          PaymentScheduleScheme: filters.PaymentScheduleScheme?.trim() || undefined,
          BuildingNumber: filters.BuildingNumber?.trim() || undefined,
          Wing: filters.Wing?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, paymentScheduleSchemeMasterColumns),
          ExportType: exportType,
        };

        const response = await paymentScheduleSchemeMasterService.apiCallPullPaymentScheduleSchemeMaster(params);
        handleExportFile(response, exportType, "Payment Schedule Scheme Master", addToast);
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

  const handleExportPaymentScheduleSchemeMasterExcel = () => handleExportPaymentScheduleSchemeMaster("Excel");
  const handleExportPaymentScheduleSchemeMasterPdf = () => handleExportPaymentScheduleSchemeMaster("PDF");
  //#endregion

  //#region HANDLE PAGE CHANGE
  const handlePageChange = (page: number) => {
    fetchPaymentScheduleSchemeMasterList(page);
  };
  //#endregion

  //#region HANDLE SORT
  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      setSortInfo(sort);
      loadPaymentScheduleSchemeMaster(1, filters, sort, searchTerm || undefined);
    },
    [filters, searchTerm],
  );
  //#endregion

  //#region DELETE PAYMENT SCHEDULE SCHEME MASTER
  const handleDeletePaymentScheduleSchemeMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deletePaymentScheduleSchemeMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeletePaymentScheduleSchemeMasterRequest = {
          PaymentScheduleSchemeMasterId: deletePaymentScheduleSchemeMasterDetailsData.PaymentScheduleSchemeMasterId,
          ProjectId: Number(projectId),
          Uniquekey: deletePaymentScheduleSchemeMasterDetailsData.Uniquekey,
        };

        const response = await paymentScheduleSchemeMasterService.apiCallDeletePaymentScheduleSchemeMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (paymentScheduleSchemeMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages,
          });

          await loadPaymentScheduleSchemeMaster(pageToShow, filters, sortInfo);

          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeletePaymentScheduleSchemeMasterDetailsData(null);
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
      "Delete Payment Schedule Scheme Master",
    );
  };
  //#endregion

  return {
    paymentScheduleSchemeMasterList,
    isLoading,
    canExport,
    pagination,
    sortInfo,
    searchTerm,
    canAction,
    paymentScheduleSchemeMasterColumns,
    visiblePaymentScheduleSchemeMasterColumns,
    selectedPaymentScheduleSchemeMasterColumnKeys,
    requiredPaymentScheduleSchemeMasterColumnKeys,
    isShowCustomizePaymentScheduleSchemeMasterColumnsModal,
    debouncedSearch,
    isViewModalOpen,
    isConfirmationDialogBoxOpen,
    viewPaymentScheduleSchemeMasterDetailsData,
    deletePaymentScheduleSchemeMasterDetailsData,
    buildingOptions,
    wingOptions,
    isAddUpdateModalOpen,
    formData,
    errors,
    editingPaymentScheduleSchemeMasterData,
    showFilterPopup,
    filters,
    tempFilters,
    loadingMessage,
    isEditing,

    fetchPaymentScheduleSchemeMasterList,
    setIsShowCustomizePaymentScheduleSchemeMasterColumnsModal,
    setSelectedPaymentScheduleSchemeMasterColumnKeys,
    handleSortColumn,
    handlePageChange,
    setSearchTerm,
    clearsearchPaymentScheduleSchemeMaster,
    handleExportPaymentScheduleSchemeMasterExcel,
    handleExportPaymentScheduleSchemeMasterPdf,
    setIsViewModalOpen,
    handleViewPaymentScheduleSchemeMasterDetails,
    setViewPaymentScheduleSchemeMasterDetailsData,
    setIsConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    setDeletePaymentScheduleSchemeMasterDetailsData,
    handleConfirmationDialogBoxOpen,
    handleDeletePaymentScheduleSchemeMaster,
    handleAddPaymentScheduleSchemeMasterModal,
    handleEditPaymentScheduleSchemeMasterDetails,
    handleBuildingChange,
    setIsAddUpdateModalOpen,
    setFormData,
    handleFieldChange,
    handleAddEditPaymentScheduleSchemeMaster,
    setShowFilterPopup,
    setTempFilters,
    setFilters,
  };
};
