import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { Tabs, type TabItem } from "@/ui/components/Tab/Tab";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { fetchBaselineCostPlanDocumentCategoryDropdown } from "@/features/baselineCostPlanDocumentCategory/baselineCostPlanDocumentCategoryDropDown";
import { runApiWithLoader } from "@/core/utils";
import type {
  AddUpdateBaselineCostPlanDocumentRequest,
  DeleteBaselineCostPlanDocumentRequest,
  FilterWithPaginationBaselineCostPlanDocument,
  BaselineCostPlanDocumentData,
} from "@/features/baselineCostPlanDocument/models/BaselineCostPlanDocumentModel";
import usePagination from "@/core/hooks/usePagination";
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import * as E from "fp-ts/Either";
import { baselineCostPlanDocumentService } from "@/features/baselineCostPlanDocument/services/BaselineCostPlanDocumentService";
import DataTableExpandable, { type DataTableExpandableRef } from "@/ui/components/DataTable/DataTableExpandable";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { Edit, Plus, Trash2 } from "lucide-react";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { handleExportFile } from "@/core/utils/exportFile";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { filterNumbersWithDecimal, hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { TextArea } from "@/ui/components/forms/Textarea";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

const initialFormState = (): AddUpdateBaselineCostPlanDocumentRequest => ({
  BaselineCostPlanDocumentId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ProjectId: 0,
  BaselineCostPlanDocumentCategoryId: 0,
  BaselineCostPlanDocumentName: "",
  BaselineCostPlanValue: 0,
  IsMaster: 0,
  BaselineCostPlanDocumentURL: null,
  RemoveBaselineCostPlanDocumentURL: "",
  BaselineCostPlanDocumentRemark: "",
});

const BaselineCostPlanDocument: React.FC = () => {

  const [baselineCostPlanDocumentList, setBaselineCostPlanDocumentList] = useState<BaselineCostPlanDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [expandHeaderBaselineCostPlanDocumentName, setExpandHeaderBaselineCostPlanDocumentName] = useState<string>("");
  const [expandHeaderBaselineCostPlanDocumentId, setExpandHeaderBaselineCostPlanDocumentId] = useState<number>(0);


  const [baselineCostPlanDocumentFiles, setBaselineCostPlanDocumentFiles] = useState<(File | string)[]>([]);
  const [RemoveBaselineCostPlanDocumentUrls, setRemoveBaselineCostPlanDocumentUrls] = useState<string[]>([]);
  const [baselineCostPlanDocumentURL, setBaselineCostPlanDocumentURL] = useState<string>();


  const { pagination, setPagination } = usePagination(20);


  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();


  const [filters] = useState<FilterInfo>({});


  const { addToast } = useToast();


  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDocuments(value);
  }, 350);


  const [baselineCostPlanDocumentTabList, setBaselineCostPlanDocumentTabList] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");


  const dtRef = useRef<DataTableExpandableRef | null>(null);



  const [expandedParentRow, setExpandedParentRow] = useState<any>(null);

  const [expandedParentId, setExpandedParentId] = useState<number | null>(null);


  const [errors, setErrors] = useState<{ [k: string]: string }>({});


  const [editingDocumentData, setEditingDocumentData] = useState<BaselineCostPlanDocumentData | null>(null);

  const [isAddUpdateDocumentModalOpen, setIsAddUpdateDocumentModalOpen] = useState(false);


  const [isAddUpdateDocumentDetailsModalOpen, setIsAddUpdateDocumentDetailsModalOpen] = useState(false);



  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

  const [deleteBaselineCostPlanDocumentDetailsData, setDeleteBaselineCostPlanDocumentDetailsData] = useState<BaselineCostPlanDocumentData | null>(null);


  const [formData, setFormData] = useState<AddUpdateBaselineCostPlanDocumentRequest>(() => initialFormState());

  const { canAction } = useMenuPermissions();
  const { projectId } = useProject();

  useEffect(() => {
    if (!projectId) return;

    setExpandedParentRow(null);
    setExpandedParentId(null);

    setActiveTab("");

    setBaselineCostPlanDocumentList([]);

    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      pageSize: pagination.pageSize,
    });

    loadBaselineCostPlanDocumentTabs();
  }, [projectId]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateDocumentModalOpen || isAddUpdateDocumentDetailsModalOpen) {
      if (editingDocumentData) {
        setFormData({
          BaselineCostPlanDocumentId: editingDocumentData.BaselineCostPlanDocumentId,
          Uniquekey: editingDocumentData.Uniquekey || initialFormState().Uniquekey,
          BaselineCostPlanDocumentName: editingDocumentData.BaselineCostPlanDocumentName || "",
          ProjectId: Number(projectId),
          BaselineCostPlanDocumentCategoryId: editingDocumentData.BaselineCostPlanDocumentCategoryId,
          BaselineCostPlanValue: editingDocumentData.BaselineCostPlanValue || 0,
          IsMaster: 0,
          BaselineCostPlanDocumentRemark: editingDocumentData.BaselineCostPlanDocumentRemark,
        });

        setBaselineCostPlanDocumentFiles([]);
        setBaselineCostPlanDocumentURL(editingDocumentData.BaselineCostPlanDocumentURL || "");
        setRemoveBaselineCostPlanDocumentUrls([]);
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateDocumentModalOpen, isAddUpdateDocumentDetailsModalOpen, editingDocumentData]);


  const getActiveTabId = (filterParams?: FilterInfo): number => {
    if (filterParams && filterParams.BaselineCostPlanDocumentCategoryId != null) {
      const raw = filterParams.BaselineCostPlanDocumentCategoryId;
      const num = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isNaN(num)) return num;
    }

    if (activeTab !== "" && !Number.isNaN(Number(activeTab))) {
      return Number(activeTab);
    }

    return 0;
  };


  const loadBaselineCostPlanDocumentTabs = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await fetchBaselineCostPlanDocumentCategoryDropdown(1, Number(projectId));

        const items = Array.isArray(response?.itemList) ? response.itemList : [];

        const tabs: TabItem[] = items.map((x) => ({
          id: x.value,
          label: x.label,
        }));

        setBaselineCostPlanDocumentTabList(tabs);

        if (tabs.length > 0) {
          setActiveTab(tabs[0].id);

          const newFilters: FilterInfo = {
            ...filters,
            BaselineCostPlanDocumentCategoryId: tabs[0].id,
          };

          await loadBaselineCostPlanDocument(1, newFilters);
        } else {
          setActiveTab("");

          setBaselineCostPlanDocumentList([]);
        }
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Category",
    );
  };

  const fetchBaselineCostPlanDocumentList = async (page: number = pagination.currentPage, currentSortInfo: SortInfo | undefined = sortInfo) => {
    return await loadBaselineCostPlanDocument(page, filters, currentSortInfo);
  };

  const loadBaselineCostPlanDocument = async (page: number, filterParams: FilterInfo, currentSortInfo: SortInfo | undefined = sortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationBaselineCostPlanDocument = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          BaselineCostPlanDocumentId: Number(filterParams.BaselineCostPlanDocumentId) ?? undefined,
          BaselineCostPlanDocumentName: filterParams.BaselineCostPlanDocumentName,
          BaselineCostPlanDocumentCategory: filterParams.BaselineCostPlanDocumentCategory,
          BaselineCostPlanDocumentCategoryId: Number(getActiveTabId(filterParams)),
          SortBy: getSortByParam(currentSortInfo ?? null, baselineCostPlanDocumentColumns),
        };

        const response = await baselineCostPlanDocumentService.apiCallPullBaselineCostPlanDocument(params);

        if (E.isRight(response)) {
          setBaselineCostPlanDocumentList(response.right.Data);

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
      "Loading BaselineCostPlan Document",
    );
  };

  const searchDocuments = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === "") {
      fetchBaselineCostPlanDocumentList();

      return;
    }

    const filterParams: FilterInfo = {
      BaselineCostPlanDocumentName: searchValue.trim(),
    };

    await loadBaselineCostPlanDocument(1, filterParams);
  };

  const clearsearchDocumnets = () => {
    setSearchTerm("");
    debouncedSearch.cancel?.();
    fetchBaselineCostPlanDocumentList();
  };

  const handlePageChange = useCallback(
    (page: number) => {
      fetchBaselineCostPlanDocumentList(page);
    },
    [fetchBaselineCostPlanDocumentList],
  );

  const handleSortColumn = (newSortInfo: SortInfo) => {

    setSortInfo(newSortInfo);

    const newFilters: FilterInfo = {
      ...filters,
      BaselineCostPlanDocumentCategoryId: activeTab,
    };

    loadBaselineCostPlanDocument(1, newFilters, newSortInfo);
  };


  const baselineCostPlanDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],
  );

  const baselineCostPlanDocumentListForTable = useMemo(() => baselineCostPlanDocumentList, [baselineCostPlanDocumentList]);

  const handleEditBaselineCostPlanDocument = useCallback((row: BaselineCostPlanDocumentData) => {
    setEditingDocumentData({
      ...row,
      BaselineCostPlanDocumentName: row.BaselineCostPlanDocumentName || "",
    });
    setIsAddUpdateDocumentModalOpen(true);
  }, []);

  const handleEditBaselineCostPlanDocumentDetails = useCallback((row: BaselineCostPlanDocumentData) => {
    setEditingDocumentData({
      ...row,
      BaselineCostPlanDocumentName: row.BaselineCostPlanDocumentName || "",
      BaselineCostPlanValue: row.BaselineCostPlanValue || 0,
      BaselineCostPlanDocumentRemark: row.BaselineCostPlanDocumentRemark || "",
    });
    setIsAddUpdateDocumentDetailsModalOpen(true);
  }, []);

  const handleConfirmationDialogBoxOpen = useCallback((row: BaselineCostPlanDocumentData) => {
    setDeleteBaselineCostPlanDocumentDetailsData({
      ...row,
      IsMaster: row.IsMaster,
    });

    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const baselineCostPlanDocumentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "BaselineCostPlanDocumentName",
        label: "Document Name",
        width: "33",
        sortable: true,
        fixed: "left",
        align: "left",
        render: (value) => {
          return (
            <div className="flex items-center justify-end ml-2 gap-1">
              <TooltipText text={value || ""} maxWidth="800px" tooltipThreshold={60} />
            </div>
          );
        },
      },
      {
        key: "UploadedDocumentCount",
        label: "Document Count",
        width: "30",
        sortable: false,
        align: "center",
        render: (value) => value || 0,
      },

      {
        key: "actions",
        label: "Actions",
        width: "12",
        fixed: "right",
        align: "center",
        render: (_value, row) => {
          const showEdit = canAction ? true : false;
          const showDelete = canAction ? (row.UploadedApprovalDocumentCount || 0) === 0 : false;

          return (
            <div className="flex items-center justify-end ml-2 gap-1">

              <div className="w-[34px] flex justify-center">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!showEdit) return;
                    handleAddDocumentDetailsModal(row);
                  }}
                  color="transparent"
                  isborderRadius
                  disabled={!showEdit}
                  size="sm"
                  title="Add"
                  style={{
                    color: showEdit ? '' : '#9CA3AF',
                    cursor: showEdit ? 'pointer' : 'not-allowed',
                    opacity: showEdit ? 1 : 0.5
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-[34px] flex justify-center">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!showEdit) return;
                    handleEditBaselineCostPlanDocument(row);
                  }}
                  color="transparent"
                  isborderRadius
                  disabled={!showEdit}
                  size="sm"
                  title="Edit"
                  style={{
                    color: showEdit ? '' : '#9CA3AF',
                    cursor: showEdit ? 'pointer' : 'not-allowed',
                    opacity: showEdit ? 1 : 0.5
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-[34px] flex justify-center">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!showDelete) return;
                    handleConfirmationDialogBoxOpen(row);
                  }}
                  color="transparent"
                  isborderRadius
                  disabled={!showDelete}
                  size="sm"
                  style={{
                    color: showDelete ? 'red' : '#9CA3AF',
                    cursor: showDelete ? 'pointer' : 'not-allowed',
                    opacity: showDelete ? 1 : 0.5
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

              </div>
            </div>
          );
        },
      },
    ],

    [canAction, handleEditBaselineCostPlanDocument, handleConfirmationDialogBoxOpen],
  );


  const baselineCostPlanDocumentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "BaselineCostPlanDocumentName",
        label: "Document Version",
        width: "15",
        sortable: false,
        align: "left",
        render: (value: string, row: any) => {
          return (
            <div className="flex items-center justify-between w-full">
              <div className="truncate max-w-[400px]">
                <MultiImageViewer images={parseDocumentUrls(row.BaselineCostPlanDocumentURL)} title="Document" triggerLabel={value || "-"} />
              </div>
            </div>
          );
        },
      },
      {
        key: "BaselineCostPlanValue",
        label: "Baseline Cost Plan Value",
        width: "15",
        sortable: false,
        align: "left",
        render: (value) => (value !== null ? value : 0),
      },
      {
        key: "BaselineCostPlanDocumentRemark",
        label: "Remark",
        width: "15",
        sortable: false,
        align: "left",
        render: (value) => (
          value?.length > 15 ?
            <FieldInfoTooltip value={value} /> : value
        )
      },

      {
        key: "ModifiedBy",
        label: "Last Modified By",
        width: "15",
        sortable: false,
        align: "left",
        render: (value, row) => <TooltipText text={value || row.CreatedBy || "-"} maxWidth="180px" tooltipThreshold={18} />,
      },
      {
        key: "ModifiedDate",
        label: "Last Modified Date",
        width: "15",
        sortable: false,
        align: "left",
        render: (value, row) =>
          value ? formatDate_dd_MonthName_yy(value) : row.CreatedDate ? formatDate_dd_MonthName_yy(row.CreatedDate) : "-",
      },
      {
        key: "Actions",
        label: "Actions",
        width: "12",
        align: "center",
        fixed: "right",
        render: (_value, row) => {

          const showEdit = canAction && !row.ApprovalStatus?.toUpperCase().includes("APPROVED") ? true : false;

          return (
            <div className="flex items-center justify-end ml-2 gap-1">

              <div className="flex-shrink-0 ml-2">

                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!showEdit) return;
                    handleEditBaselineCostPlanDocumentDetails(row);
                  }}
                  color="transparent"
                  isborderRadius
                  disabled={!showEdit}
                  size="sm"
                  style={{
                    color: showEdit ? '' : '#9CA3AF',
                    cursor: showEdit ? 'pointer' : 'not-allowed',
                    opacity: showEdit ? 1 : 0.5
                  }}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>

              </div>

              <div className="w-[34px] flex justify-center">

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!showEdit) return;
                    handleConfirmationDialogBoxOpen(row);
                  }}
                  color="transparent"
                  isborderRadius
                  disabled={!showEdit}
                  size="sm"
                  style={{
                    color: showEdit ? 'red' : '#9CA3AF',
                    cursor: showEdit ? 'pointer' : 'not-allowed',
                    opacity: showEdit ? 1 : 0.5
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

              </div>

            </div>
          );
        },
      },
    ],

    [canAction, handleEditBaselineCostPlanDocument],
  );




  const handleAddDocumentDetailsModal = useCallback((row: BaselineCostPlanDocumentData) => {
    setExpandedParentRow(row);
    setExpandedParentId(row.BaselineCostPlanDocumentId);
    setExpandHeaderBaselineCostPlanDocumentName(row.BaselineCostPlanDocumentName);
    setExpandHeaderBaselineCostPlanDocumentId(row.BaselineCostPlanDocumentId);

    setBaselineCostPlanDocumentFiles([]);
    setBaselineCostPlanDocumentURL("");
    setRemoveBaselineCostPlanDocumentUrls([]);

    setEditingDocumentData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateDocumentDetailsModalOpen(true);
  }, []);

  const handleFieldChange = (field: keyof AddUpdateBaselineCostPlanDocumentRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddDocumentModal = useCallback(() => {
    setEditingDocumentData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateDocumentModalOpen(true);
  }, []);


  const validateAddDocumentForm = (): {
    isValid: boolean;

    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (formData.BaselineCostPlanDocumentName?.trim() === "") {
      newErrors.BaselineCostPlanDocumentName = "Document Name is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const validateAddDocumentDetailsForm = (): {
    isValid: boolean;

    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};


    if (!hasAnyDocumentFile(baselineCostPlanDocumentFiles, baselineCostPlanDocumentURL, RemoveBaselineCostPlanDocumentUrls)) {
      newErrors.BaselineCostPlanDocumentURL = "File is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const PushDocumentFormData = (): FormData => {
    const fd = new FormData();

    (fd.append("BaselineCostPlanDocumentId", String(formData.BaselineCostPlanDocumentId ?? 0)),
      fd.append("Uniquekey", formData.Uniquekey ?? ""),
      fd.append("BaselineCostPlanDocumentName", formData.BaselineCostPlanDocumentName ?? ""),
      fd.append("ProjectId", String(projectId)),
      fd.append("BaselineCostPlanDocumentCategoryId", String(getActiveTabId() ?? 0)),
      fd.append("IsMaster", String(1)));

    return fd;
  };

  const PushDocumentDetailsFormData = (): FormData => {
    const fd = new FormData();

    (fd.append("BaselineCostPlanDocumentId", editingDocumentData ? String(formData.BaselineCostPlanDocumentId) : String(expandHeaderBaselineCostPlanDocumentId ?? 0)),
      fd.append("Uniquekey", formData.Uniquekey ?? ""),
      fd.append("BaselineCostPlanDocumentName", expandHeaderBaselineCostPlanDocumentName ?? ""),
      fd.append("ProjectId", String(projectId)),
      fd.append("BaselineCostPlanDocumentCategoryId", String(getActiveTabId() ?? 0)),
      fd.append("BaselineCostPlanValue", String(Number(formData.BaselineCostPlanValue ?? 0))),
      fd.append("BaselineCostPlanDocumentRemark", formData.BaselineCostPlanDocumentRemark ?? ""),
      fd.append("IsMaster", String(0)),
      baselineCostPlanDocumentFiles.forEach((file) => {
        if (file instanceof File) {
          fd.append("BaselineCostPlanDocumentURL", file);
        }
      }));

    fd.append("RemoveBaselineCostPlanDocumentURL", RemoveBaselineCostPlanDocumentUrls.join(","));

    return fd;
  };

  const handleAddUpdateDocument = async (ismaster: number, e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    if (ismaster === 1) {
      const validation = validateAddDocumentForm();

      if (!validation.isValid) {
        setErrors(validation.errors);

        return;
      }
    } else {
      const validation = validateAddDocumentDetailsForm();

      if (!validation.isValid) {
        setErrors(validation.errors);

        return;
      }
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,

      async () => {
        const payload = ismaster === 1 ? PushDocumentFormData() : PushDocumentDetailsFormData();

        const response = await baselineCostPlanDocumentService.apiCallAddUpdateBaselineCostPlanDocument(payload);

        if (E.isRight(response)) {

          ismaster === 1 ? setIsAddUpdateDocumentModalOpen(false) : setIsAddUpdateDocumentDetailsModalOpen(false);

          const isAdd = formData.BaselineCostPlanDocumentId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as BaselineCostPlanDocumentData;

            if (ismaster === 1) {

              setBaselineCostPlanDocumentList((prevData) => [newRecord, ...prevData]);

              setPagination({
                currentPage: pagination.currentPage,
                totalRecords: pagination.totalRecords + 1,
                totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize),
              });
            } else {
              const parentId = expandedParentId;

              await fetchBaselineCostPlanDocumentList(pagination.currentPage);


              if (dtRef.current) {
                dtRef.current.collapseAll?.();
              }


              setTimeout(() => {
                if (parentId) {
                  dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
                }
              }, 50);
            }

            addToast({ type: "success", title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as BaselineCostPlanDocumentData;

            if (ismaster === 1) {
              setBaselineCostPlanDocumentList((prevData) =>
                prevData.map((item) => (item.BaselineCostPlanDocumentId === formData.BaselineCostPlanDocumentId ? updatedRecord : item)),
              );
            } else {
              const parentId = expandedParentId;

              await fetchBaselineCostPlanDocumentList(pagination.currentPage);


              if (dtRef.current) {
                dtRef.current.collapseAll?.();
              }


              setTimeout(() => {
                if (parentId) {
                  dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
                }
              }, 50);
            }
            addToast({ type: "success", title: response.right.SuccessMessage[0] });
          }

          setEditingDocumentData(null);

          dtRef.current?.collapseAll?.();
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

      Number(formData.BaselineCostPlanDocumentId) === 0 ? "Add Document" : "Update Document",
    );
  };

  const handleDeleteDocument = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteBaselineCostPlanDocumentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {
        const params: DeleteBaselineCostPlanDocumentRequest = {
          BaselineCostPlanDocumentId: deleteBaselineCostPlanDocumentDetailsData.BaselineCostPlanDocumentId,
          projectId: Number(projectId),
          Uniquekey: deleteBaselineCostPlanDocumentDetailsData.Uniquekey ?? "",
          BaselineCostPlanDocumentCategoryId: deleteBaselineCostPlanDocumentDetailsData.BaselineCostPlanDocumentCategoryId,
        };

        const response = await baselineCostPlanDocumentService.apiCallDeleteBaselineCostPlanDocument(params);

        if (E.isRight(response)) {
          if (deleteBaselineCostPlanDocumentDetailsData.IsMaster === 1) {
            const newTotalRecords = pagination.totalRecords - 1;

            const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

            let pageToShow = pagination.currentPage;

            if (pagination.currentPage > newTotalPages) {
              pageToShow = newTotalPages;
            } else if (baselineCostPlanDocumentList.length === 1 && pagination.currentPage > 1) {
              pageToShow = pagination.currentPage - 1;
            }

            setPagination({
              currentPage: pageToShow,
              totalRecords: newTotalRecords,
              totalPages: newTotalPages,
            });

            await loadBaselineCostPlanDocument(pageToShow, filters);
          } else {
            const parentId = expandedParentId;

            await fetchBaselineCostPlanDocumentList(pagination.currentPage);


            if (dtRef.current) {
              dtRef.current.collapseAll?.();
            }


            setTimeout(() => {
              if (parentId) {
                dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
              }
            }, 50);
          }
          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteBaselineCostPlanDocumentDetailsData(null);
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
      "Delete Document",
    );
  };

  const downloadExcelSampleBaselineCostPlanDocument = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const params: FilterPullExcelSample = {
          TableName: "PROJECT DOCUMENT",
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, "Excel", "BaselineCostPlan Document", addToast, "Sample file download successfully");

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

  const handleDownloadExcelSampleBaselineCostPlanDocument = () => downloadExcelSampleBaselineCostPlanDocument();


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Document Name"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchDocumnets}
        isShowFilterButton={false}
        isShowCustomizeButton={false}

        isShowAddButton={baselineCostPlanDocumentTabList.length > 0 && canAction ? true : false}
        addTitle="Add"
        onAdd={handleAddDocumentModal}

        isShowImportButton={false}
        onDownloadSampleExcel={handleDownloadExcelSampleBaselineCostPlanDocument}

        isShowExportButton={false}
        exportLoading={isLoading}
      />

      {baselineCostPlanDocumentTabList.length > 0 && (

        <Tabs
          tabs={baselineCostPlanDocumentTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {
            setSearchTerm("");
            setActiveTab(t.id);

            const newFilters: FilterInfo = {
              ...filters,
              BaselineCostPlanDocumentCategoryId: t.id,
            };

            loadBaselineCostPlanDocument(1, newFilters);
          }}
        />
      )}
      <div className={`${baselineCostPlanDocumentTabList.length > 0 ? 'pt-5' : ''}`}>
        <DataTableExpandable
          ref={dtRef}
          data={baselineCostPlanDocumentListForTable}
          columns={baselineCostPlanDocumentColumns}
          pagination={baselineCostPlanDocumentPaginationInfo}
          sortInfo={sortInfo}
          onSort={handleSortColumn}
          emptyMessage="No BaselineCostPlan Document Data Found"
          loading={isLoading}
          fixedHeight
          recordsPerPage={20}
          expandable={{
            keyField: "BaselineCostPlanDocumentId",
            alwaysFetchOnOpen: true,
            fetchRow: async (row) => {
              setExpandedParentRow(row);
              setExpandedParentId(row.BaselineCostPlanDocumentId);

              const params: FilterWithPaginationBaselineCostPlanDocument = {
                PageNumber: 1,
                PageSize: pagination.pageSize,
                ProjectId: Number(row.ProjectId),
                BaselineCostPlanDocumentId: Number(row.BaselineCostPlanDocumentId),
                BaselineCostPlanDocumentCategory: row.BaselineCostPlanDocumentCategory,
                BaselineCostPlanDocumentCategoryId: row.BaselineCostPlanDocumentCategoryId,
              };
              const response = await baselineCostPlanDocumentService.apiCallPullBaselineCostPlanDocument(params);

              if (E.isRight(response)) {
                return response.right.Data ?? [];
              }
              return [];
            },

            renderRow: (fetchedData) => {
              const details: BaselineCostPlanDocumentData[] = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];
              if (!details || details.length === 0) {
                return <div className="p-1 text-xs text-gray-600 text-center"><NoDataView /></div>;
              }

              return (
                <DataTableWithOutBorder
                  data={details}
                  columns={baselineCostPlanDocumentDetailsColumns}
                  emptyMessage="No BaselineCostPlan Document Data Found"
                  fixedHeight={true}
                  recordsPerPage={20}
                  className="flex-1"
                  sortInfo={sortInfo}
                  onSort={handleSortColumn}
                  loading={isLoading}
                />
              );
            },

            expandButton: { openText: "Hide", closeText: "Show" },
          }}
        />
      </div>


      <Modal
        isOpen={isAddUpdateDocumentModalOpen}
        onClose={() => {
          setIsAddUpdateDocumentModalOpen(false);
          setEditingDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateDocumentModalOpen(false);
          setEditingDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        title={editingDocumentData ? "Update Document Name" : "Add Document Name"}
        onSubmit={(e) => handleAddUpdateDocument(1, e)}
        saveText={editingDocumentData ? "Update" : "Add"}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4">
            <div>
              <Input
                label="Document Name"
                required
                error={errors.BaselineCostPlanDocumentName}
                type="text"
                value={formData.BaselineCostPlanDocumentName}
                maxLength={100}
                onChange={(e) => handleFieldChange("BaselineCostPlanDocumentName", e.target.value)}
                placeholder="Enter Document Name"
              />
            </div>
          </div>
        </div>
      </Modal>

      { }
      <Modal
        isOpen={isAddUpdateDocumentDetailsModalOpen}
        onClose={() => {
          setIsAddUpdateDocumentDetailsModalOpen(false);
          setEditingDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateDocumentDetailsModalOpen(false);
          setEditingDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        title={editingDocumentData ? "Update Document" : "Add Document"}
        onSubmit={(e) => handleAddUpdateDocument(0, e)}
        saveText={editingDocumentData ? "Update" : "Add"}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-4 p-6 bg-blue-100">
          {editingDocumentData ? (
            <div>
              <Input
                label="Document"
                required
                disabled
                type="text"
                value={formData.BaselineCostPlanDocumentName}
                maxLength={250}
                placeholder="Enter Document"
              />
            </div>
          ) : (
            ""
          )}

          <div>
            <Input
              label="Baseline Cost Plan Value (₹)"
              value={formData.BaselineCostPlanValue?.toString() ?? ""}
              onChange={(e) => {
                const val = filterNumbersWithDecimal(e.target.value);
                if (val !== null) {
                  const baselineCostPlanValue = filterNumbersWithDecimal(e.target.value);

                  handleFieldChange("BaselineCostPlanValue", baselineCostPlanValue);
                }
              }}
              placeholder="Enter Baseline Cost Plan Value(₹)"
              rightIcon="₹"
              error={errors.BaselineCostPlanValue}
            />

          </div>
          <div>
            <MultiFilePicker
              label="Files"
              placeholder="Select Files"
              required
              value={baselineCostPlanDocumentFiles}
              onChange={setBaselineCostPlanDocumentFiles}
              availableFilesURL={baselineCostPlanDocumentURL ?? ""}
              allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
              maxFiles={5}
              error={errors.BaselineCostPlanDocumentURL}
              onRemoveExisting={(url) => {
                setRemoveBaselineCostPlanDocumentUrls((prev) => [...prev, url]);
              }}
            />
          </div>


          <div>
            <TextArea
              label="Remark"
              placeholder="Enter Remark"
              className="thin-scroll"
              value={formData.BaselineCostPlanDocumentRemark}
              onChange={(e) => handleFieldChange("BaselineCostPlanDocumentRemark", e.target.value)}
              error={errors.BaselineCostPlanDocumentRemark}
            />
          </div>

        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteBaselineCostPlanDocumentDetailsData(null);
        }}
        onConfirm={handleDeleteDocument}
        loading={isLoading}
        pageName="document"
      />


    </div>
  );
};

export default BaselineCostPlanDocument;
