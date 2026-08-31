import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { Tabs, type TabItem } from "@/ui/components/Tab/Tab";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { fetchDrawingDocumentCategoryDropdown } from "@/features/drawingDocumentCategory/drawingDocumentCategoryDropDown";
import { runApiWithLoader } from "@/core/utils";
import type {
  AddUpdateDrawingDocumentRequest,
  DeleteDrawingDocumentRequest,
  FilterWithPaginationDrawingDocument,
  DrawingDocumentData,
} from "@/features/drawingDocument/models/DrawingDocumentModel";
import usePagination from "@/core/hooks/usePagination";
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import * as E from "fp-ts/Either";
import { drawingDocumentService } from "@/features/drawingDocument/services/DrawingDocumentService";
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
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { DRAWING_DOCUMENT_STATUS } from "@/core/constants";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { handleExportFile } from "@/core/utils/exportFile";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { getDocumentStatusColor } from "./DrawingDocumentStatus";
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
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { fetchPaginatedFloorDropdown } from "@/features/inventory/PaginatedFloorDropDown";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { updateFilter } from "@/core/utils/filterHelper";

const initialFormState = (): AddUpdateDrawingDocumentRequest => ({
  DrawingDocumentId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ProjectId: 0,
  DrawingDocumentCategoryId: 0,
  DrawingDocumentName: "",
  DrawingDocumentRevisionDate: "",
  DrawingDocumentStatus: "",
  IsMaster: 0,
  DrawingDocumentURL: null,
  RemoveDrawingDocumentURL: "",

  DrawingDocumentDWGURL: null,
  RemoveDrawingDocumentDWGURL: "",

  DrawingDocumentRemark: "",
});

const DrawingDocument: React.FC = () => {
  const [drawingDocumentList, setDrawingDocumentList] = useState<DrawingDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [expandHeaderDrawingDocumentName, setExpandHeaderDrawingDocumentName] = useState<string>("");
  const [expandHeaderDrawingDocumentId, setExpandHeaderDrawingDocumentId] = useState<number>(0);

  const [drawingDocumentFiles, setDrawingDocumentFiles] = useState<(File | string)[]>([]);
  const [RemoveDrawingDocumentUrls, setRemoveDrawingDocumentUrls] = useState<string[]>([]);
  const [drawingDocumentURL, setDrawingDocumentURL] = useState<string>();

  const [drawingDocumentDWGFiles, setDrawingDocumentDWGFiles] = useState<(File | string)[]>([]);
  const [RemoveDrawingDocumentDWGUrls, setRemoveDrawingDocumentDWGUrls] = useState<string[]>([]);
  const [drawingDocumentDWGURL, setDrawingDocumentDWGURL] = useState<string>();

  const { pagination, setPagination } = usePagination(20);

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDocuments(value);
  }, 350);

  const [drawingDocumentTabList, setDrawingDocumentTabList] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  const dtRef = useRef<DataTableExpandableRef | null>(null);


  const [expandedParentRow, setExpandedParentRow] = useState<any>(null);

  const [expandedParentId, setExpandedParentId] = useState<number | null>(null);

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [editingDocumentData, setEditingDocumentData] = useState<DrawingDocumentData | null>(null);

  const [isAddUpdateDocumentModalOpen, setIsAddUpdateDocumentModalOpen] = useState(false);

  const [isAddUpdateDocumentDetailsModalOpen, setIsAddUpdateDocumentDetailsModalOpen] = useState(false);

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

  const [deleteDrawingDocumentDetailsData, setDeleteDrawingDocumentDetailsData] = useState<DrawingDocumentData | null>(null);

  const [formData, setFormData] = useState<AddUpdateDrawingDocumentRequest>(() => initialFormState());

  const [showImportModal, setShowImportModal] = useState(false);

  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [documentName, setDocumentName] = useState<string | null>("");
  const [documentCategory, setDocumentCategory] = useState<string | null>("");

  const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
  const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
  const [approvalRowData, setApprovalRowData] = useState<DrawingDocumentData | null>(null);

  const [selectFloorValues, setSelectFloorValues] = useState<string | number | null>(null);

  const { canAction } = useMenuPermissions();

  const { projectId } = useProject();

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [filters, setTempFilters] = useState<FilterInfo>({});

  useEffect(() => {
    if (!projectId) return;

    setExpandedParentRow(null);
    setExpandedParentId(null);

    setActiveTab("");

    setDrawingDocumentList([]);

    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      pageSize: pagination.pageSize,
    });

    loadDrawingDocumentTabs();
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
          DrawingDocumentId: editingDocumentData.DrawingDocumentId,
          Uniquekey: editingDocumentData.Uniquekey || initialFormState().Uniquekey,
          DrawingDocumentName: editingDocumentData.DrawingDocumentName || "",
          ProjectId: Number(projectId),
          DrawingDocumentCategoryId: editingDocumentData.DrawingDocumentCategoryId,
          DrawingDocumentRevisionDate: editingDocumentData.DrawingDocumentRevisionDate || undefined,
          DrawingDocumentStatus: editingDocumentData.DrawingDocumentStatus,
          IsMaster: 0,
          DrawingDocumentRemark: editingDocumentData.DrawingDocumentRemark,
          InventoryFloorId: editingDocumentData.InventoryFloorId,
        });

        setDrawingDocumentFiles([]);
        setDrawingDocumentURL(editingDocumentData.DrawingDocumentURL || "");
        setRemoveDrawingDocumentUrls([]);

        setDrawingDocumentDWGFiles([]);
        setDrawingDocumentDWGURL(editingDocumentData.DrawingDocumentDWGURL || "");
        setRemoveDrawingDocumentDWGUrls([]);

        setSelectFloorValues(editingDocumentData.InventoryFloorId || null);


      } else {
        setFormData(initialFormState());
        setSelectFloorValues("");
      }
      setErrors({});
    }
  }, [isAddUpdateDocumentModalOpen, isAddUpdateDocumentDetailsModalOpen, editingDocumentData]);


  const getActiveTabId = (filterParams?: FilterInfo): number => {
    if (filterParams && filterParams.DrawingDocumentCategoryId != null) {
      const raw = filterParams.DrawingDocumentCategoryId;
      const num = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isNaN(num)) return num;
    }

    if (activeTab !== "" && !Number.isNaN(Number(activeTab))) {
      return Number(activeTab);
    }

    return 0;
  };

  const loadDrawingDocumentTabs = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await fetchDrawingDocumentCategoryDropdown(1, Number(projectId));

        const items = Array.isArray(response?.itemList) ? response.itemList : [];

        const tabs: TabItem[] = items.map((x) => ({
          id: x.value,
          label: x.label,
        }));

        setDrawingDocumentTabList(tabs);

        if (tabs.length > 0) {
          setActiveTab(tabs[0].id);

          const newFilters: FilterInfo = {
            ...filters,
            DrawingDocumentCategoryId: tabs[0].id,
          };

          await loadDrawingDocument(1, newFilters);
        } else {
          setActiveTab("");

          setDrawingDocumentList([]);
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

  const fetchDrawingDocumentList = async (page: number = pagination.currentPage, currentSortInfo: SortInfo | undefined = sortInfo) => {
    return await loadDrawingDocument(page, filters, currentSortInfo);
  };

  const loadDrawingDocument = async (page: number, filterParams: FilterInfo, currentSortInfo: SortInfo | undefined = sortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationDrawingDocument = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          DrawingDocumentId: Number(filterParams.DrawingDocumentId) ?? undefined,
          DrawingDocumentName: filterParams.DrawingDocumentName,
          DrawingDocumentStatus: filterParams.DrawingDocumentStatus,
          DrawingDocumentCategory: filterParams.DrawingDocumentCategory,
          DrawingDocumentCategoryId: Number(getActiveTabId(filterParams)),
          BuildingNumber: filterParams.BuildingNumber,
          Wing: filterParams.Wing,
          Floor: filterParams.Floor,
          SortBy: getSortByParam(currentSortInfo ?? null, drawingDocumentColumns),
        };

        const response = await drawingDocumentService.apiCallPullDrawingDocument(params);

        if (E.isRight(response)) {
          setDrawingDocumentList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

          if (dtRef.current) {
            dtRef.current.collapseAll?.();
          }

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
      "Loading Drawing Document",
    );
  };

  const searchDocuments = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === "") {
      fetchDrawingDocumentList();

      return;
    }

    const filterParams: FilterInfo = {
      DrawingDocumentName: searchValue.trim(),
    };

    await loadDrawingDocument(1, filterParams);
  };

  const clearsearchDocumnets = () => {
    setSearchTerm("");
    setTempFilters({});
    debouncedSearch.cancel?.();
    fetchDrawingDocumentList();
  };

  const handlePageChange = useCallback((page: number) => {
    fetchDrawingDocumentList(page);
  }, [sortInfo, fetchDrawingDocumentList]);

  const handleSortColumn = (newSortInfo: SortInfo) => {

    setSortInfo(newSortInfo);

    const newFilters: FilterInfo = {
      ...filters,
      DrawingDocumentCategoryId: activeTab,
    };

    loadDrawingDocument(1, newFilters, newSortInfo);
  };

  const drawingDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],
  );

  const drawingDocumentListForTable = useMemo(() => drawingDocumentList, [drawingDocumentList]);

  const handleEditDrawingDocument = useCallback((row: DrawingDocumentData) => {
    setEditingDocumentData({
      ...row,
      DrawingDocumentName: row.DrawingDocumentName || "",
    });
    setIsAddUpdateDocumentModalOpen(true);
  }, []);

  const handleEditDrawingDocumentDetails = useCallback((row: DrawingDocumentData) => {
    setEditingDocumentData({
      ...row,
      DrawingDocumentName: row.DrawingDocumentName || "",
      DrawingDocumentRevisionDate: row.DrawingDocumentRevisionDate || null,
      DrawingDocumentStatus: row.DrawingDocumentStatus || "",
      DrawingDocumentRemark: row.DrawingDocumentRemark || "",
    });
    setIsAddUpdateDocumentDetailsModalOpen(true);
  }, []);

  const handleConfirmationDialogBoxOpen = useCallback((row: DrawingDocumentData) => {
    setDeleteDrawingDocumentDetailsData({
      ...row,
      IsMaster: row.IsMaster,
    });

    setIsConfirmationDialogBoxOpen(true);
  }, []);


  const drawingDocumentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "DrawingDocumentName",
        label: "Drawing Document Name",
        width: "33",
        sortable: true,
        fixed: "left",
        align: "left",
        render: (value) => {
          return (
            <div className="flex items-center justify-end ml-2 gap-1">
              <TooltipText text={value || ""} maxWidth="500px" tooltipThreshold={60} />
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
                    handleEditDrawingDocument(row);
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

    [canAction, handleEditDrawingDocument, handleConfirmationDialogBoxOpen],
  );

  const handleApprovalLog = (row: DrawingDocumentData) => {
    const request: ModulesApprovalStatusRequest = {
      ModuleName: "DRAWING DOCUMENT APPROVAL",
      Id: row.DrawingDocumentId,
      ProjectId: row.ProjectId,
    };
    setDocumentName(row.DrawingDocumentName);
    setDocumentCategory(row.DrawingDocumentCategory);
    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const handleApproveRejectDocument = (row: DrawingDocumentData, approvalType: "approve" | "reject") => {

    setApprovalRowData(row);
    setDocumentName(row.DrawingDocumentName);
    setDocumentCategory(row.DrawingDocumentCategory);
    setApprovalActionType(approvalType);
    setIsApprovalActionModalOpen(true);

  };

  const drawingDocumentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "DrawingDocumentName",
        label: "Document Version",
        width: "15",
        sortable: false,
        align: "left",
        render: (value) => {
          return (
            <div className="flex items-center justify-end ml-2 gap-1">
              <TooltipText text={value || ""} maxWidth="500px" tooltipThreshold={60} />
            </div>
          );
        },
      },
       {
        key: 'DrawingDocumentURL',
        label: 'PDF',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value: string, row: any) => {
          return (
            <div className="flex items-center justify-between w-full">
              <MultiImageViewer
                images={parseDocumentUrls(row.DrawingDocumentURL)}
                title="PDF Document"
                isIcon={false}
                triggerLabel={value === '' || 'PDF'}
              />

            </div>
          );
        }
      },
      {
        key: 'DrawingDocumentDWGURL',
        label: 'DWG',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value: string, row: any) => {
          return (
            <div className="flex items-center justify-between w-full">
              <MultiImageViewer
                images={parseDocumentUrls(row.DrawingDocumentDWGURL)}
                title="DWG Document"
                isIcon={false}
                triggerLabel={value === '' || 'DWG'}
              />

            </div>
          );
        }
      },
      {
        key: "DrawingDocumentRevisionDate",
        label: "Revision Date",
        width: "15",
        sortable: false,
        align: "left",
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
      {
        key: "DrawingDocumentStatus",
        label: "Status",
        width: "15",
        sortable: false,
        align: "left",
        render: (value) => {
          const statusClass = getDocumentStatusColor(value);

          return (
            <TooltipText
              text={value || "-"}
              maxWidth="220px"
              tooltipThreshold={27}
              isApplyBgTextColor
              tooltipClassName={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClass} overflow-hidden text-ellipsis whitespace-nowrap`}
            />
          );
        },
      },
      {
        key: "Floor",
        label: "Floor",
        width: "15",
        sortable: false,
        align: "left",
       render: (value) => <TooltipText text={value} maxWidth="220px" tooltipThreshold={18} />,
      },
      {
        key: "DrawingDocumentRemark",
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
                    handleEditDrawingDocumentDetails(row);
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

    [canAction, handleEditDrawingDocument, handleApprovalLog, handleApproveRejectDocument],
  );

  const handleAddDocumentDetailsModal = useCallback((row: DrawingDocumentData) => {

    setExpandedParentRow(row);
    setExpandedParentId(row.DrawingDocumentId);
    setExpandHeaderDrawingDocumentName(row.DrawingDocumentName);
    setExpandHeaderDrawingDocumentId(row.DrawingDocumentId);

    setDrawingDocumentFiles([]);
    setDrawingDocumentURL("");
    setRemoveDrawingDocumentUrls([]);

    setDrawingDocumentDWGFiles([]);
    setDrawingDocumentDWGURL("");
    setRemoveDrawingDocumentDWGUrls([]);

    setEditingDocumentData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateDocumentDetailsModalOpen(true);

  }, []);

  const handleFieldChange = (field: keyof AddUpdateDrawingDocumentRequest, value: any) => {

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

    if (formData.DrawingDocumentName?.trim() === "") {
      newErrors.DrawingDocumentName = "Document Name is required";
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

    if (!formData.InventoryFloorId?.trim()) {
      newErrors.InventoryFloorId = "Floor is required";
    }

    if (!formData.DrawingDocumentStatus?.trim()) {
      newErrors.DrawingDocumentStatus = "Status is required";
    }

    if (!hasAnyDocumentFile(drawingDocumentFiles, drawingDocumentURL, RemoveDrawingDocumentUrls)) {
      newErrors.DrawingDocumentURL = "File (.PDF) is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const PushDocumentFormData = (): FormData => {
    const fd = new FormData();

    (fd.append("DrawingDocumentId", String(formData.DrawingDocumentId ?? 0)),
      fd.append("Uniquekey", formData.Uniquekey ?? ""),
      fd.append("DrawingDocumentName", formData.DrawingDocumentName ?? ""),
      fd.append("ProjectId", String(projectId)),
      fd.append("DrawingDocumentCategoryId", String(getActiveTabId() ?? 0)),
      fd.append("IsMaster", String(1)));

    return fd;
  };

  const PushDocumentDetailsFormData = (): FormData => {

    const floorIdsString = floorDropDown.selectedValues.length > 0 ? floorDropDown.selectedValues.join(",") : "";
    const fd = new FormData();

    (fd.append("DrawingDocumentId", editingDocumentData ? String(formData.DrawingDocumentId) : String(expandHeaderDrawingDocumentId ?? 0)),
      fd.append("Uniquekey", formData.Uniquekey ?? ""),
      fd.append("DrawingDocumentName", expandHeaderDrawingDocumentName ?? ""),
      fd.append("ProjectId", String(projectId)),
      fd.append("DrawingDocumentCategoryId", String(getActiveTabId() ?? 0)),
      fd.append("DrawingDocumentRevisionDate", formData.DrawingDocumentRevisionDate ?? ""),
      fd.append("DrawingDocumentStatus", formData.DrawingDocumentStatus ?? ""),
      fd.append("DrawingDocumentRemark", formData.DrawingDocumentRemark ?? ""),
      fd.append("InventoryFloorId", floorIdsString),

      fd.append("IsMaster", String(0)),

      drawingDocumentFiles.forEach((file) => {
        if (file instanceof File) {
          fd.append("DrawingDocumentURL", file);
        }
      }),

      drawingDocumentDWGFiles.forEach((file) => {
        if (file instanceof File) {
          fd.append("DrawingDocumentDWGURL", file);
        }
      })

    );

    fd.append("RemoveDrawingDocumentURL", RemoveDrawingDocumentUrls.join(","));

    fd.append("RemoveDrawingDocumentDWGURL", RemoveDrawingDocumentDWGUrls.join(","));

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

        const response = await drawingDocumentService.apiCallAddUpdateDrawingDocument(payload);

        if (E.isRight(response)) {

          ismaster === 1 ? setIsAddUpdateDocumentModalOpen(false) : setIsAddUpdateDocumentDetailsModalOpen(false);

          const isAdd = formData.DrawingDocumentId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as DrawingDocumentData;

            if (ismaster === 1) {

              setDrawingDocumentList((prevData) => [newRecord, ...prevData]);

              setPagination({
                currentPage: pagination.currentPage,
                totalRecords: pagination.totalRecords + 1,
                totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize),
              });
            } else {
              const parentId = expandedParentId;

              await fetchDrawingDocumentList(pagination.currentPage);


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
            const updatedRecord = response.right.Data[0] as DrawingDocumentData;

            if (ismaster === 1) {
              setDrawingDocumentList((prevData) =>
                prevData.map((item) => (item.DrawingDocumentId === formData.DrawingDocumentId ? updatedRecord : item)),
              );
            } else {
              const parentId = expandedParentId;

              await fetchDrawingDocumentList(pagination.currentPage);


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

      Number(formData.DrawingDocumentId) === 0 ? "Add Drawing" : "Update Drawing",
    );
  };

  const handleDeleteDocument = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteDrawingDocumentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {
        const params: DeleteDrawingDocumentRequest = {
          DrawingDocumentId: deleteDrawingDocumentDetailsData.DrawingDocumentId,
          projectId: Number(projectId),
          Uniquekey: deleteDrawingDocumentDetailsData.Uniquekey ?? "",
          DrawingDocumentCategoryId: deleteDrawingDocumentDetailsData.DrawingDocumentCategoryId,
        };

        const response = await drawingDocumentService.apiCallDeleteDrawingDocument(params);

        if (E.isRight(response)) {
          if (deleteDrawingDocumentDetailsData.IsMaster === 1) {
            const newTotalRecords = pagination.totalRecords - 1;

            const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

            let pageToShow = pagination.currentPage;

            if (pagination.currentPage > newTotalPages) {
              pageToShow = newTotalPages;
            } else if (drawingDocumentList.length === 1 && pagination.currentPage > 1) {
              pageToShow = pagination.currentPage - 1;
            }

            setPagination({
              currentPage: pageToShow,
              totalRecords: newTotalRecords,
              totalPages: newTotalPages,
            });

            await loadDrawingDocument(pageToShow, filters);
          } else {
            const parentId = expandedParentId;

            await fetchDrawingDocumentList(pagination.currentPage);


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

          setDeleteDrawingDocumentDetailsData(null);
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

  const downloadExcelSampleDrawingDocument = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterPullExcelSample = {
          TableName: "DRAWING DOCUMENT",
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, "Excel", "Drawing Document", addToast, "Sample file download successfully");

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

  const handleDownloadExcelSampleDrawingDocument = () => downloadExcelSampleDrawingDocument();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", "DRAWING DOCUMENT");
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: "success", title: "Excel imported sucessfully" });

          loadDrawingDocumentTabs();
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
      ModuleName: "DRAWING DOCUMENT APPROVAL",
      Id: approvalRowData.DrawingDocumentId,
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

          await fetchDrawingDocumentList(pagination.currentPage);

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

  const floorFetchParams = useMemo(() => ({
    projectId: String(projectId)
  }), [projectId]);

  const floorDropDown = useMultiSelectDropdown({
    value: selectFloorValues,
    fetchCallback: fetchPaginatedFloorDropdown,
    fetchParams: floorFetchParams,
    autoFetchOptions: true,
  });

  const fetchFlatsForModal = useCallback(
    (pageNumber: number, params?: { value?: string }) =>
      fetchPaginatedFloorDropdown(pageNumber, {
        projectId: Number(projectId),
        BuildingNumberWingFloor: params?.value,
      }),
    [projectId]
  );

  const applyFilters = () => {
    loadDrawingDocument(1, filters);
    setShowFilterPopup(false);
  }

  const clearFilters = () => {
    setTempFilters({});
    loadDrawingDocument(1, {});
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
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
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        isShowCustomizeButton={false}

        isShowAddButton={drawingDocumentTabList.length > 0 && canAction ? true : false}
        addTitle="Add"
        onAdd={handleAddDocumentModal}

        isShowImportButton={canAction && Number(projectId) > 0}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleDrawingDocument}

        isShowExportButton={false}
        exportLoading={isLoading}
      />

      {drawingDocumentTabList.length > 0 && (

        <Tabs
          tabs={drawingDocumentTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {
            setSearchTerm("");
            setActiveTab(t.id);

            const newFilters: FilterInfo = {
              ...filters,
              DrawingDocumentCategoryId: t.id,
            };

            loadDrawingDocument(1, newFilters);
          }}
        />
      )}
      <div className={`${drawingDocumentTabList.length > 0 ? 'pt-5' : ''}`}>
        <DataTableExpandable
          ref={dtRef}
          data={drawingDocumentListForTable}
          columns={drawingDocumentColumns}
          pagination={drawingDocumentPaginationInfo}
          sortInfo={sortInfo}
          onSort={handleSortColumn}
          emptyMessage="No Drawing Document Data Found"
          loading={isLoading}
          fixedHeight
          recordsPerPage={20}
          expandable={{
            keyField: "DrawingDocumentId",
            alwaysFetchOnOpen: true,
            fetchRow: async (row) => {
              setExpandedParentRow(row);
              setExpandedParentId(row.DrawingDocumentId);

              const params: FilterWithPaginationDrawingDocument = {
                PageNumber: 1,
                PageSize: pagination.pageSize,
                ProjectId: Number(row.ProjectId),
                DrawingDocumentId: Number(row.DrawingDocumentId),
                DrawingDocumentCategory: row.DrawingDocumentCategory,
                DrawingDocumentCategoryId: row.DrawingDocumentCategoryId,
                BuildingNumber: filters.BuildingNumber || "",
                Wing: filters.Wing || "",
                Floor: filters.Floor || "",
                SortBy: getSortByParam(sortInfo ?? null, drawingDocumentColumns),
              };
              const response = await drawingDocumentService.apiCallPullDrawingDocument(params);

              if (E.isRight(response)) {
                return response.right.Data ?? [];
              }
              return [];
            },

            renderRow: (fetchedData) => {
              const details: DrawingDocumentData[] = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];
              if (!details || details.length === 0) {
                return <div className="p-1 text-xs text-gray-600 text-center"><NoDataView /></div>;
              }

              return (
                <DataTableWithOutBorder
                  data={details}
                  columns={drawingDocumentDetailsColumns}
                  emptyMessage="No Drawing Document Data Found"
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
                error={errors.DrawingDocumentName}
                type="text"
                value={formData.DrawingDocumentName}
                maxLength={100}
                onChange={(e) => handleFieldChange("DrawingDocumentName", e.target.value)}
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
          setSelectFloorValues("");
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateDocumentDetailsModalOpen(false);
          setEditingDocumentData(null);
          setFormData(initialFormState());
          setSelectFloorValues("");
          setErrors({});
        }}
        title={editingDocumentData ? "Update Drawing" : "Add Drawing"}
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
                value={formData.DrawingDocumentName}
                maxLength={250}
                placeholder="Enter Document"
              />
            </div>
          ) : (
            ""
          )}

          <div>
            <MultiSelectPagination
              key={projectId}
              label="Floor"
              required
              title="Select Floor"
              style={{ height: 80 }}
              size="lg"
              dataFetchCallBack={fetchFlatsForModal}
              options={floorDropDown.initialOptions}
              selectedValues={floorDropDown.selectedValues}
              onChange={(values) => {

                const { idsString } = floorDropDown.handleChange(values);

                setSelectFloorValues(idsString || null);

                handleFieldChange("InventoryFloorId", idsString);

                if (errors.InventoryFloorId) {

                  setErrors((prev) => ({ ...prev, InventoryFloorId: "" }));
                }
              }}
              error={errors.InventoryFloorId}
            />
          </div>
          <div>
            <SinglePageSelection
              label="Status"
              placeholder="Select Status"
              required
              value={formData.DrawingDocumentStatus}
              onChange={(e) => handleFieldChange("DrawingDocumentStatus", String(e))}
              options={DRAWING_DOCUMENT_STATUS.map((opt) => ({ label: opt.name, value: opt.id }))}
              error={errors.DrawingDocumentStatus}
            />
          </div>
          <div>
            <MultiFilePicker
              label="Files (.PDF)"
              placeholder="Select Files (.PDF)"
              required
              value={drawingDocumentFiles}
              onChange={setDrawingDocumentFiles}
              availableFilesURL={drawingDocumentURL ?? ""}
              allowedTypes={["application/pdf"]}
              maxFiles={5}
              error={errors.DrawingDocumentURL}
              onRemoveExisting={(url) => {
                setRemoveDrawingDocumentUrls((prev) => [...prev, url]);
              }}
            />
          </div>
          <div>
            <MultiFilePicker
              label="Files (.DWG)"
              placeholder="Select Files (.DWG)"
              value={drawingDocumentDWGFiles}
              onChange={setDrawingDocumentDWGFiles}
              availableFilesURL={drawingDocumentDWGURL ?? ""}
              allowedTypes={[".dwg"]}
              maxFiles={1}
              error={errors.DrawingDocumentDWGURL}
              onRemoveExisting={(url) => {
                setRemoveDrawingDocumentDWGUrls((prev) => [...prev, url]);
              }}
            />
          </div>
          <div>
            <DatePickerInput
              label="Revision Date"
              value={formatDate_dd_mm_yyyy(formData.DrawingDocumentRevisionDate)}
              onChange={(val) => handleFieldChange("DrawingDocumentRevisionDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
            />
          </div>

          <div>
            <TextArea
              label="Remark"
              placeholder="Enter Remark"
              className="thin-scroll"
              value={formData.DrawingDocumentRemark}
              onChange={(e) => handleFieldChange("DrawingDocumentRemark", e.target.value)}
              error={errors.DrawingDocumentRemark}
            />
          </div>

        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteDrawingDocumentDetailsData(null);
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
        title='Drawing Document'
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

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Project Drawing"
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => clearFilters()}

        size="small-half"
      >
        <div className="space-y-6">
          <div className=" space-y-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
            <div>
              <Input
                label='Building Number'
                type="text"
                value={filters.BuildingNumber || ''}
                onChange={(e) => handleFilterChange('BuildingNumber', e.target.value)}
                placeholder="Enter Building Number"
              />
            </div>
            <div>
              <Input
                label='Wing'
                type="text"
                value={filters.Wing || ''}
                onChange={(e) => handleFilterChange('Wing', e.target.value)}
                placeholder="Enter Wing"
              />
            </div>

            <div>
              <Input
                label='Floor'
                type="text"
                value={filters.Floor || ''}
                onChange={(e) => handleFilterChange('Floor', e.target.value)}
                placeholder="Enter Floor"
              />
            </div>

          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DrawingDocument;
