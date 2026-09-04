import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { Tabs, type TabItem } from "@/ui/components/Tab/Tab";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { fetchTestDocumentCategoryDropdown } from "@/features/testDocumentCategory/testDocumentCategoryDropDown";
import { runApiWithLoader } from "@/core/utils";
import type {
  AddUpdateTestDocumentRequest,
  DeleteTestDocumentRequest,
  FilterWithPaginationTestDocument,
  TestDocumentData,
} from "@/features/testDocument/models/TestDocumentModel";
import usePagination from "@/core/hooks/usePagination";
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import * as E from "fp-ts/Either";
import { testDocumentService } from "@/features/testDocument/services/TestDocumentService";
import DataTableExpandable, { type DataTableExpandableRef } from "@/ui/components/DataTable/DataTableExpandable";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { Edit, Plus, Trash2 } from "lucide-react";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { handleExportFile } from "@/core/utils/exportFile";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { TextArea } from "@/ui/components/forms/Textarea";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

const initialFormState = (): AddUpdateTestDocumentRequest => ({
  TestDocumentId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ProjectId: 0,
  TestDocumentCategoryId: 0,
  TestDocumentName: "",
  TestDocumentExpiryDate: "",
  IsMaster: 0,
  TestDocumentURL: null,
  RemoveTestDocumentURL: "",
  TestDocumentRemark: "",
});

const TestDocument: React.FC = () => {

  const [testDocumentList, setTestDocumentList] = useState<TestDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [expandHeaderTestDocumentName, setExpandHeaderTestDocumentName] = useState<string>("");
  const [expandHeaderTestDocumentId, setExpandHeaderTestDocumentId] = useState<number>(0);


  const [testDocumentFiles, setTestDocumentFiles] = useState<(File | string)[]>([]);
  const [RemoveTestDocumentUrls, setRemoveTestDocumentUrls] = useState<string[]>([]);
  const [testDocumentURL, setTestDocumentURL] = useState<string>();


  const { pagination, setPagination } = usePagination(20);


  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();


  const [filters] = useState<FilterInfo>({});


  const { addToast } = useToast();


  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDocuments(value);
  }, 350);


  const [testDocumentTabList, setTestDocumentTabList] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");


  const dtRef = useRef<DataTableExpandableRef | null>(null);



  const [expandedParentRow, setExpandedParentRow] = useState<any>(null);

  const [expandedParentId, setExpandedParentId] = useState<number | null>(null);


  const [errors, setErrors] = useState<{ [k: string]: string }>({});


  const [editingDocumentData, setEditingDocumentData] = useState<TestDocumentData | null>(null);

  const [isAddUpdateDocumentModalOpen, setIsAddUpdateDocumentModalOpen] = useState(false);


  const [isAddUpdateDocumentDetailsModalOpen, setIsAddUpdateDocumentDetailsModalOpen] = useState(false);



  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

  const [deleteTestDocumentDetailsData, setDeleteTestDocumentDetailsData] = useState<TestDocumentData | null>(null);


  const [formData, setFormData] = useState<AddUpdateTestDocumentRequest>(() => initialFormState());


  const [showImportModal, setShowImportModal] = useState(false);


  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [documentName, setDocumentName] = useState<string | null>("");
  const [documentCategory, setDocumentCategory] = useState<string | null>("");


  const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
  const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
  const [approvalRowData, setApprovalRowData] = useState<TestDocumentData | null>(null);

  const { canAction } = useMenuPermissions();
  const { projectId } = useProject();

  useEffect(() => {
    if (!projectId) return;

    setExpandedParentRow(null);
    setExpandedParentId(null);

    setActiveTab("");

    setTestDocumentList([]);

    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      pageSize: pagination.pageSize,
    });

    loadTestDocumentTabs();
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
          TestDocumentId: editingDocumentData.TestDocumentId,
          Uniquekey: editingDocumentData.Uniquekey || initialFormState().Uniquekey,
          TestDocumentName: editingDocumentData.TestDocumentName || "",
          ProjectId: Number(projectId),
          TestDocumentCategoryId: editingDocumentData.TestDocumentCategoryId,
          TestDocumentExpiryDate: editingDocumentData.TestDocumentExpiryDate || undefined,
          IsMaster: 0,
          TestDocumentRemark: editingDocumentData.TestDocumentRemark,
        });

        setTestDocumentFiles([]);
        setTestDocumentURL(editingDocumentData.TestDocumentURL || "");
        setRemoveTestDocumentUrls([]);
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateDocumentModalOpen, isAddUpdateDocumentDetailsModalOpen, editingDocumentData]);


  const getActiveTabId = (filterParams?: FilterInfo): number => {
    if (filterParams && filterParams.TestDocumentCategoryId != null) {
      const raw = filterParams.TestDocumentCategoryId;
      const num = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isNaN(num)) return num;
    }

    if (activeTab !== "" && !Number.isNaN(Number(activeTab))) {
      return Number(activeTab);
    }

    return 0;
  };


  const loadTestDocumentTabs = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await fetchTestDocumentCategoryDropdown(1, Number(projectId));

        const items = Array.isArray(response?.itemList) ? response.itemList : [];

        const tabs: TabItem[] = items.map((x) => ({
          id: x.value,
          label: x.label,
        }));

        setTestDocumentTabList(tabs);

        if (tabs.length > 0) {
          setActiveTab(tabs[0].id);

          const newFilters: FilterInfo = {
            ...filters,
            TestDocumentCategoryId: tabs[0].id,
          };

          await loadTestDocument(1, newFilters);
        } else {
          setActiveTab("");

          setTestDocumentList([]);
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

  const fetchTestDocumentList = async (page: number = pagination.currentPage, currentSortInfo: SortInfo | undefined = sortInfo) => {
    return await loadTestDocument(page, filters, currentSortInfo);
  };

  const loadTestDocument = async (page: number, filterParams: FilterInfo, currentSortInfo: SortInfo | undefined = sortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTestDocument = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          TestDocumentId: Number(filterParams.TestDocumentId) ?? undefined,
          TestDocumentName: filterParams.TestDocumentName,
          TestDocumentCategory: filterParams.TestDocumentCategory,
          TestDocumentCategoryId: Number(getActiveTabId(filterParams)),
          SortBy: getSortByParam(currentSortInfo ?? null, testDocumentColumns),
        };

        const response = await testDocumentService.apiCallPullTestDocument(params);

        if (E.isRight(response)) {
          setTestDocumentList(response.right.Data);

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
      "Loading Test Document",
    );
  };

  const searchDocuments = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === "") {
      fetchTestDocumentList();

      return;
    }

    const filterParams: FilterInfo = {
      TestDocumentName: searchValue.trim(),
    };

    await loadTestDocument(1, filterParams);
  };

  const clearsearchDocumnets = () => {
    setSearchTerm("");
    debouncedSearch.cancel?.();
    fetchTestDocumentList();
  };

  const handlePageChange = useCallback(
    (page: number) => {
      fetchTestDocumentList(page);
    },
    [fetchTestDocumentList],
  );

  const handleSortColumn = (newSortInfo: SortInfo) => {

    setSortInfo(newSortInfo);

    const newFilters: FilterInfo = {
      ...filters,
      TestDocumentCategoryId: activeTab,
    };

    loadTestDocument(1, newFilters, newSortInfo);
  };


  const testDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],
  );

  const testDocumentListForTable = useMemo(() => testDocumentList, [testDocumentList]);

  const handleEditTestDocument = useCallback((row: TestDocumentData) => {
    setEditingDocumentData({
      ...row,
      TestDocumentName: row.TestDocumentName || "",
    });
    setIsAddUpdateDocumentModalOpen(true);
  }, []);

  const handleEditTestDocumentDetails = useCallback((row: TestDocumentData) => {
    setEditingDocumentData({
      ...row,
      TestDocumentName: row.TestDocumentName || "",
      TestDocumentExpiryDate: row.TestDocumentExpiryDate || null,
      TestDocumentRemark: row.TestDocumentRemark || "",
    });
    setIsAddUpdateDocumentDetailsModalOpen(true);
  }, []);

  const handleConfirmationDialogBoxOpen = useCallback((row: TestDocumentData) => {
    setDeleteTestDocumentDetailsData({
      ...row,
      IsMaster: row.IsMaster,
    });

    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const testDocumentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "TestDocumentName",
        label: "Test Document Name",
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
        key: "UploadedApprovalDocumentCount",
        label: "Document Count",
        width: "30",
        sortable: false,
        align: "center",
        render: (value) => value || "",
      },
      {
        key: "ApprovalPendingApprovalDocumentCount",
        label: "Approval",
        width: "30",
        sortable: false,
        align: "center",
        render: (value) => {
          return (
            <TooltipText
              text={`${value} Pending` || "-"}
              maxWidth="180px"
              tooltipThreshold={18}
              tooltipClassName={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap`}
            />
          );
        },
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
                    handleEditTestDocument(row);
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

    [canAction, handleEditTestDocument, handleConfirmationDialogBoxOpen],
  );

  const handleApprovalLog = (row: TestDocumentData) => {
    const request: ModulesApprovalStatusRequest = {
      ModuleName: "TEST DOCUMENT APPROVAL",
      Id: row.TestDocumentId,
      ProjectId: row.ProjectId,
    };
    setDocumentName(row.TestDocumentName);
    setDocumentCategory(row.TestDocumentCategory);
    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const handleApproveRejectDocument = (row: TestDocumentData, approvalType: "approve" | "reject") => {

    setApprovalRowData(row);
    setDocumentName(row.TestDocumentName);
    setDocumentCategory(row.TestDocumentCategory);
    setApprovalActionType(approvalType);
    setIsApprovalActionModalOpen(true);

  };

  const testDocumentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "TestDocumentName",
        label: "Document Version",
        width: "15",
        sortable: false,
        align: "left",
        render: (value: string, row: any) => {
          return (
            <div className="flex items-center justify-between w-full">
              <div className="truncate max-w-[400px]">
                <MultiImageViewer images={parseDocumentUrls(row.TestDocumentURL)} title="Document" triggerLabel={value || "-"} />
              </div>
            </div>
          );
        },
      },
      {
        key: "TestDocumentExpiryDate",
        label: "Expiry Date",
        width: "15",
        sortable: false,
        align: "left",
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
      {
        key: "TestDocumentRemark",
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
        key: "ApprovalStatus",
        label: "Approval Status",
        width: "15",
        sortable: false,
        align: "left",
        render: (value, row) => (

          <ApprovalActions
            approvalStatus={value || "-"}
            showApproval={row.IsApproval}
            isIcons={true}
            onHistory={() => handleApprovalLog(row)}
            onApprove={() => handleApproveRejectDocument(row, "approve")}
            onReject={() => handleApproveRejectDocument(row, "reject")}
          />

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
                    handleEditTestDocumentDetails(row);
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

    [canAction, handleEditTestDocument, handleApprovalLog, handleApproveRejectDocument],
  );




  const handleAddDocumentDetailsModal = useCallback((row: TestDocumentData) => {
    setExpandedParentRow(row);
    setExpandedParentId(row.TestDocumentId);
    setExpandHeaderTestDocumentName(row.TestDocumentName);
    setExpandHeaderTestDocumentId(row.TestDocumentId);

    setTestDocumentFiles([]);
    setTestDocumentURL("");
    setRemoveTestDocumentUrls([]);

    setEditingDocumentData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateDocumentDetailsModalOpen(true);
  }, []);

  const handleFieldChange = (field: keyof AddUpdateTestDocumentRequest, value: any) => {
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

    if (formData.TestDocumentName?.trim() === "") {
      newErrors.TestDocumentName = "Document Name is required";
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


    if (!hasAnyDocumentFile(testDocumentFiles, testDocumentURL, RemoveTestDocumentUrls)) {
      newErrors.TestDocumentURL = "File is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const PushDocumentFormData = (): FormData => {
    const fd = new FormData();

    (fd.append("TestDocumentId", String(formData.TestDocumentId ?? 0)),
      fd.append("Uniquekey", formData.Uniquekey ?? ""),
      fd.append("TestDocumentName", formData.TestDocumentName ?? ""),
      fd.append("ProjectId", String(projectId)),
      fd.append("TestDocumentCategoryId", String(getActiveTabId() ?? 0)),
      fd.append("IsMaster", String(1)));

    return fd;
  };

  const PushDocumentDetailsFormData = (): FormData => {
    const fd = new FormData();

    (fd.append("TestDocumentId", editingDocumentData ? String(formData.TestDocumentId) : String(expandHeaderTestDocumentId ?? 0)),
      fd.append("Uniquekey", formData.Uniquekey ?? ""),
      fd.append("TestDocumentName", expandHeaderTestDocumentName ?? ""),
      fd.append("ProjectId", String(projectId)),
      fd.append("TestDocumentCategoryId", String(getActiveTabId() ?? 0)),
      fd.append("TestDocumentExpiryDate", formData.TestDocumentExpiryDate ?? ""),
      fd.append("TestDocumentRemark", formData.TestDocumentRemark ?? ""),
      fd.append("IsMaster", String(0)),
      testDocumentFiles.forEach((file) => {
        if (file instanceof File) {
          fd.append("TestDocumentURL", file);
        }
      }));

    fd.append("RemoveTestDocumentURL", RemoveTestDocumentUrls.join(","));

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

        const response = await testDocumentService.apiCallAddUpdateTestDocument(payload);

        if (E.isRight(response)) {

          ismaster === 1 ? setIsAddUpdateDocumentModalOpen(false) : setIsAddUpdateDocumentDetailsModalOpen(false);

          const isAdd = formData.TestDocumentId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as TestDocumentData;

            if (ismaster === 1) {

              setTestDocumentList((prevData) => [newRecord, ...prevData]);

              setPagination({
                currentPage: pagination.currentPage,
                totalRecords: pagination.totalRecords + 1,
                totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize),
              });
            } else {
              const parentId = expandedParentId;

              await fetchTestDocumentList(pagination.currentPage);


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
            const updatedRecord = response.right.Data[0] as TestDocumentData;

            if (ismaster === 1) {
              setTestDocumentList((prevData) =>
                prevData.map((item) => (item.TestDocumentId === formData.TestDocumentId ? updatedRecord : item)),
              );
            } else {
              const parentId = expandedParentId;

              await fetchTestDocumentList(pagination.currentPage);


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

      Number(formData.TestDocumentId) === 0 ? "Add Document" : "Update Document",
    );
  };

  const handleDeleteDocument = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteTestDocumentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {
        const params: DeleteTestDocumentRequest = {
          TestDocumentId: deleteTestDocumentDetailsData.TestDocumentId,
          projectId: Number(projectId),
          Uniquekey: deleteTestDocumentDetailsData.Uniquekey ?? "",
          TestDocumentCategoryId: deleteTestDocumentDetailsData.TestDocumentCategoryId,
        };

        const response = await testDocumentService.apiCallDeleteTestDocument(params);

        if (E.isRight(response)) {
          if (deleteTestDocumentDetailsData.IsMaster === 1) {
            const newTotalRecords = pagination.totalRecords - 1;

            const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

            let pageToShow = pagination.currentPage;

            if (pagination.currentPage > newTotalPages) {
              pageToShow = newTotalPages;
            } else if (testDocumentList.length === 1 && pagination.currentPage > 1) {
              pageToShow = pagination.currentPage - 1;
            }

            setPagination({
              currentPage: pageToShow,
              totalRecords: newTotalRecords,
              totalPages: newTotalPages,
            });

            await loadTestDocument(pageToShow, filters);
          } else {
            const parentId = expandedParentId;

            await fetchTestDocumentList(pagination.currentPage);


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

          setDeleteTestDocumentDetailsData(null);
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




  const downloadExcelSampleTestDocument = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const params: FilterPullExcelSample = {
          TableName: "PROJECT DOCUMENT",
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, "Excel", "Test Document", addToast, "Sample file download successfully");

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

  const handleDownloadExcelSampleTestDocument = () => downloadExcelSampleTestDocument();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", "TEST DOCUMENT");
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: "success", title: "Excel imported sucessfully" });

          loadTestDocumentTabs();
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



  const handleApprovalSubmit = async (remark: string) => {

    if (!approvalRowData) return;

    const payload: UpdateModulesWorkflowApprovalRequest = {
      ModuleName: "TEST DOCUMENT APPROVAL",
      Id: approvalRowData.TestDocumentId,
      ProjectId: approvalRowData.ProjectId,
      IsApproved: approvalActionType === "approve",
      Remarks: remark ?? null
    };

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsApprovalActionModalOpen(false);

          const parentId = expandedParentId;

          await fetchTestDocumentList(pagination.currentPage);


          if (dtRef.current) {
            dtRef.current.collapseAll?.();
          }


          setTimeout(() => {
            if (parentId) {
              dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
            }
          }, 50);

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
      approvalActionType === "approve" ? "Approving Document" : "Rejecting Document"
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
        searchPlaceholder="Search By Document Name"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchDocumnets}
        isShowFilterButton={false}
        isShowCustomizeButton={false}

        isShowAddButton={testDocumentTabList.length > 0 && canAction ? true : false}
        addTitle="Add"
        onAdd={handleAddDocumentModal}

        isShowImportButton={canAction && Number(projectId) > 0}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleTestDocument}

        isShowExportButton={false}
        exportLoading={isLoading}
      />

      {testDocumentTabList.length > 0 && (

        <Tabs
          tabs={testDocumentTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {
            setSearchTerm("");
            setActiveTab(t.id);

            const newFilters: FilterInfo = {
              ...filters,
              TestDocumentCategoryId: t.id,
            };

            loadTestDocument(1, newFilters);
          }}
        />
      )}
      <div className={`${testDocumentTabList.length > 0 ? 'pt-5' : ''}`}>
        <DataTableExpandable
          ref={dtRef}
          data={testDocumentListForTable}
          columns={testDocumentColumns}
          pagination={testDocumentPaginationInfo}
          sortInfo={sortInfo}
          onSort={handleSortColumn}
          emptyMessage="No Test Document Data Found"
          loading={isLoading}
          fixedHeight
          recordsPerPage={20}
          expandable={{
            keyField: "TestDocumentId",
            alwaysFetchOnOpen: true,
            fetchRow: async (row) => {
              setExpandedParentRow(row);
              setExpandedParentId(row.TestDocumentId);

              const params: FilterWithPaginationTestDocument = {
                PageNumber: 1,
                PageSize: pagination.pageSize,
                ProjectId: Number(row.ProjectId),
                TestDocumentId: Number(row.TestDocumentId),
                TestDocumentCategory: row.TestDocumentCategory,
                TestDocumentCategoryId: row.TestDocumentCategoryId,
              };
              const response = await testDocumentService.apiCallPullTestDocument(params);

              if (E.isRight(response)) {
                return response.right.Data ?? [];
              }
              return [];
            },

            renderRow: (fetchedData) => {
              const details: TestDocumentData[] = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];
              if (!details || details.length === 0) {
                return <div className="p-1 text-xs text-gray-600 text-center"><NoDataView /></div>;
              }

              return (
                <DataTableWithOutBorder
                  data={details}
                  columns={testDocumentDetailsColumns}
                  emptyMessage="No Test Document Data Found"
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

      { }
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
                error={errors.TestDocumentName}
                type="text"
                value={formData.TestDocumentName}
                maxLength={100}
                onChange={(e) => handleFieldChange("TestDocumentName", e.target.value)}
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
                value={formData.TestDocumentName}
                maxLength={250}
                placeholder="Enter Document"
              />
            </div>
          ) : (
            ""
          )}

          <div>
            <MultiFilePicker
              label="Files"
              placeholder="Select Files"
              required
              value={testDocumentFiles}
              onChange={setTestDocumentFiles}
              availableFilesURL={testDocumentURL ?? ""}
              allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
              maxFiles={5}
              error={errors.TestDocumentURL}
              onRemoveExisting={(url) => {
                setRemoveTestDocumentUrls((prev) => [...prev, url]);
              }}
            />
          </div>
          <div>
            <DatePickerInput
              label="Expiry Date"
              value={formatDate_dd_mm_yyyy(formData.TestDocumentExpiryDate)}
              onChange={(val) => handleFieldChange("TestDocumentExpiryDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
            />
          </div>

          <div>
            <TextArea
              label="Remark"
              placeholder="Enter Remark"
              className="thin-scroll"
              value={formData.TestDocumentRemark}
              onChange={(e) => handleFieldChange("TestDocumentRemark", e.target.value)}
              error={errors.TestDocumentRemark}
            />
          </div>

        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteTestDocumentDetailsData(null);
        }}
        onConfirm={handleDeleteDocument}
        loading={isLoading}
        pageName="document"
      />

      <ExportImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={(file, mergeExisting) => {
          setShowImportModal(false);
          uploadExcel(file, mergeExisting);
        }}
      />

      <ApprovalLogModal
        isOpen={isApprovalLogModalOpen}
        title='Test Document'
        titleText={documentCategory ?? ""}
        subTitleText={documentName ?? ""}
        onClose={() => setIsApprovalLogModalOpen(false)}
        request={approvalLogRequest} />

      <ApprovalActionModal
        title="Document"
        isOpen={isApprovalActionModalOpen}
        onClose={() => setIsApprovalActionModalOpen(false)}
        actionType={approvalActionType}
        titleText={documentCategory ?? ""}
        subTitleText={documentName ?? ""}
        onSubmit={handleApprovalSubmit}
        loading={isLoading}
      />
    </div>
  );
};

export default TestDocument;
