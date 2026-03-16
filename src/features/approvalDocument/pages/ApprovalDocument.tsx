import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { Tabs, type TabItem } from '@/ui/components/Tab/Tab';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchApprovalDocumentCategoryDropdown } from '@/features/approvalDocumentCategory/approvalDocumentCategoryDropDown';
import { runApiWithLoader } from '@/core/utils';
import type { AddUpdateApprovalDocumentRequest, DeleteApprovalDocumentRequest, FilterWithPaginationApprovalDocument, ApprovalDocumentData } from '@/features/approvalDocument/models/ApprovalDocumentModel';
import usePagination from '@/core/hooks/usePagination';
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import * as E from 'fp-ts/Either';
import { approvalDocumentService } from '@/features/approvalDocument/services/ApprovalDocumentService';
import DataTableExpandable, { type DataTableExpandableRef } from '@/ui/components/DataTable/DataTableExpandable';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button, Input } from '@/ui/components/forms';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { Edit, Plus, Trash2 } from 'lucide-react';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { PROJECT_DOCUMENT_STATUS } from '@/core/constants';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { handleExportFile } from '@/core/utils/exportFile';
import { DataTableWithOutBorder } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { getDocumentStatusColor } from '@/features/projectDocument/pages/ProjectDocumentStatus';
import { TextArea } from '@/ui/components/forms/Textarea';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import { modulesWorkflowApprovalService } from '@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService';
import { ApprovalLogModal } from '@/features/modulesWorkflowApproval/components/ApprovalLogModal';
import ApprovalActionModal from '@/features/modulesWorkflowApproval/components/ApprovalActionModal';
import ApprovalActions from '@/features/modulesWorkflowApproval/components/ApprovalActionsButton';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';


const initialFormState = (): AddUpdateApprovalDocumentRequest => ({
  ApprovalDocumentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  ApprovalDocumentCategoryId: 0,
  ApprovalDocumentName: '',
  ApprovalDocumentExpiryDate: '',
  ApprovalDocumentStatus: '',
  IsMaster: 0,
  ApprovalDocumentURL: null,
  RemoveApprovalDocumentURL: '',
  ApprovalDocumentRemark: ''
});

const ApprovalDocument: React.FC = () => {

  //#region STATE
  const [approvalDocumentList, setApprovalDocumentList] = useState<ApprovalDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [expandHeaderApprovalDocumentName, setExpandHeaderApprovalDocumentName] = useState<string>('');
  const [expandHeaderApprovalDocumentId, setExpandHeaderApprovalDocumentId] = useState<number>(0);

  //SET AND REMOVE URL FILE
  const [approvalDocumentFiles, setApprovalDocumentFiles] = useState<(File | string)[]>([]);
  const [RemoveApprovalDocumentUrls, setRemoveApprovalDocumentUrls] = useState<string[]>([]);
  const [approvalDocumentURL, setApprovalDocumentURL] = useState<string>();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  //FILTER STATE
  const [filters] = useState<FilterInfo>({});

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchDocuments(value)
  }, 350)

  // TAB LIST
  const [approvalDocumentTabList, setApprovalDocumentTabList] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  //DATATABLE EXPANDABLE REF
  const dtRef = useRef<DataTableExpandableRef | null>(null)

  //DATATABLE EXPANDED ROW AND PARENT ID

  const [expandedParentRow, setExpandedParentRow] = useState<any>(null);

  const [expandedParentId, setExpandedParentId] = useState<number | null>(null);

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ADD EDIT UPDATE DOCUMENT
  const [editingDocumentData, setEditingDocumentData] = useState<ApprovalDocumentData | null>(null);

  const [isAddUpdateDocumentModalOpen, setIsAddUpdateDocumentModalOpen] = useState(false);

  // ADD EDIT UPDATE DOCUMENT DETAILS
  const [isAddUpdateDocumentDetailsModalOpen, setIsAddUpdateDocumentDetailsModalOpen] = useState(false);

  //DELETE DEPARTMENT MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteApprovalDocumentDetailsData, setDeleteApprovalDocumentDetailsData] = useState<ApprovalDocumentData | null>(null)

  //ADD UPDATE DEPARTMENT MASTER
  const [formData, setFormData] = useState<AddUpdateApprovalDocumentRequest>(() => initialFormState());

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);

  // APPROVAL LOG MODAL
  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [approvalDocumentName, setApprovalDocumentName] = useState<string | null>("");
  const [approvalDocumentCategory, setApprovalDocumentCategory] = useState<string | null>("");

  // APPROVAL ACTION MODAL
  const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
  const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
  const [approvalRowData, setApprovalRowData] = useState<ApprovalDocumentData | null>(null);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions();
  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region INIT

  useEffect(() => {
    if (!projectId) return;

    setExpandedParentRow(null);
    setExpandedParentId(null);

    setActiveTab("");

    setApprovalDocumentList([]);


    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      pageSize: pagination.pageSize,
    });

    loadApprovalDocumentTabs();

  }, [projectId])



  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {

    if (isAddUpdateDocumentModalOpen || isAddUpdateDocumentDetailsModalOpen) {

      if (editingDocumentData) {

        setFormData({
          ApprovalDocumentId: editingDocumentData.ApprovalDocumentId,
          Uniquekey: editingDocumentData.Uniquekey || initialFormState().Uniquekey,
          ApprovalDocumentName: editingDocumentData.ApprovalDocumentName || '',
          ProjectId: Number(projectId),
          ApprovalDocumentCategoryId: editingDocumentData.ApprovalDocumentCategoryId,
          ApprovalDocumentExpiryDate: editingDocumentData.ApprovalDocumentExpiryDate || undefined,
          ApprovalDocumentStatus: editingDocumentData.ApprovalDocumentStatus,
          IsMaster: 0,
          ApprovalDocumentRemark: editingDocumentData.ApprovalDocumentRemark,

        });

        setApprovalDocumentFiles([]);
        setApprovalDocumentURL(editingDocumentData.ApprovalDocumentURL || '')
        setRemoveApprovalDocumentUrls([]);


      } else {

        setFormData(initialFormState());

      }
      setErrors({});
    }
  }, [isAddUpdateDocumentModalOpen, isAddUpdateDocumentDetailsModalOpen, editingDocumentData]);

  //#endregion

  //#region ACTIVE TAB IF FIND OUT
  const getActiveTabId = (filterParams?: FilterInfo): number => {

    if (filterParams && filterParams.ApprovalDocumentCategoryId != null) {
      const raw = filterParams.ApprovalDocumentCategoryId;
      const num = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isNaN(num)) return num;
    }
    if (activeTab !== '' && !Number.isNaN(Number(activeTab))) {
      return Number(activeTab);
    }
    return 0;
  };
  //#endregion

  //#region LOAD TAB APPROVAL DOCUMENT CATEGORY
  const loadApprovalDocumentTabs = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await fetchApprovalDocumentCategoryDropdown(1, Number(projectId));

        const items = Array.isArray(response?.itemList) ? response.itemList : [];

        const tabs: TabItem[] = items.map((x) => ({
          id: x.value,
          label: x.label,
        }))

        setApprovalDocumentTabList(tabs);

        if (tabs.length > 0) {

          setActiveTab(tabs[0].id);

          const newFilters: FilterInfo = {
            ...filters,
            ApprovalDocumentCategoryId: tabs[0].id,
          };

          await loadApprovalDocument(1, newFilters);
        }
        else {

          setActiveTab('');

        }

      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Category'
    );
  };

  //#endregion

  //#region DATA LOAD
  const fetchApprovalDocumentList = async (page: number = pagination.currentPage) => {
    return await loadApprovalDocument(page, filters);
  };

  const loadApprovalDocument = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationApprovalDocument = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          ApprovalDocumentId: Number(filterParams.ApprovalDocumentId) ?? undefined,
          ApprovalDocumentName: searchtext ?? filterParams.ApprovalDocumentName ?? undefined,
          ApprovalDocumentStatus: filterParams.ApprovalDocumentStatus,
          ApprovalDocumentCategory: filterParams.ApprovalDocumentCategory,
          ApprovalDocumentCategoryId: Number(getActiveTabId(filterParams)),
          SortBy: getSortByParam(sortInfo ?? null, approvalDocumentColumns),
        };

        const response = await approvalDocumentService.apiCallPullApprovalDocument(params);

        if (E.isRight(response)) {

          setApprovalDocumentList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Approval Document'
    );
  };
  //#endregion

  //#region SERACH Document 
  const searchDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchApprovalDocumentList();

      return
    }
    await loadApprovalDocument(1, filters, sortInfo, searchValue);

  }
  //#endregion

  //#region CLEAR SERACH Document 
  const clearsearchDocumnets = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadApprovalDocument(1, { ApprovalDocumentName: '' }, sortInfo, undefined);
  }

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = useCallback((page: number) => {
    fetchApprovalDocumentList(page);
  }, [fetchApprovalDocumentList]);

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);

    const newFilters: FilterInfo = {
      ...filters,
      ApprovalDocumentCategoryId: activeTab,
    };

    loadApprovalDocument(1, newFilters, sort, searchTerm || undefined);
  }, [filters, searchTerm]);
  //#endregion

  //#region TABLE PAGINATION INFO

  const approvalDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const approvalDocumentListForTable = useMemo(() => approvalDocumentList, [approvalDocumentList]);

  //#endregion

  //#region EDIT APPROVAL DOCUMENT
  const handleEditApprovalDocument = useCallback((row: ApprovalDocumentData) => {
    setEditingDocumentData({
      ...row,
      ApprovalDocumentName: row.ApprovalDocumentName || ''
    })
    setIsAddUpdateDocumentModalOpen(true);

  }, [])

  //#endregion

  //#region EDIT APPROVAL DOCUMENT DETAILS
  const handleEditApprovalDocumentDetails = useCallback((row: ApprovalDocumentData) => {
    setEditingDocumentData({
      ...row,
      ApprovalDocumentName: row.ApprovalDocumentName || '',
      ApprovalDocumentExpiryDate: row.ApprovalDocumentExpiryDate || null,
      ApprovalDocumentStatus: row.ApprovalDocumentStatus || '',
      ApprovalDocumentRemark: row.ApprovalDocumentRemark || '',
    })
    setIsAddUpdateDocumentDetailsModalOpen(true);

  }, [])

  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ApprovalDocumentData) => {

    setDeleteApprovalDocumentDetailsData({
      ...row,
      IsMaster: row.IsMaster
    })

    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const approvalDocumentColumns = useMemo<TableColumn[]>(
    () => [

      {
        key: 'ApprovalDocumentName',
        label: 'Approval Document Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value) => {
          return (
            <div className="flex items-center justify-end ml-2 gap-1">
              <TooltipText
                text={value || ''}
                maxWidth="700px"
                tooltipThreshold={100}
              />
            </div>

          )
        },
      },
      {
        key: 'UploadedApprovalDocumentCount',
        label: 'Document Count',
        width: '30',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },
      {
        key: 'ApprovalPendingApprovalDocumentCount',
        label: 'Approval',
        width: '30',
        sortable: false,
        align: 'center',
        render: (value) => {
          return (
            <TooltipText
              text={`${value} Pending` || "-"}
              maxWidth="180px"
              tooltipThreshold={18}
              tooltipClassName={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap`}
            />
          );
        }
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row) => {
          const showEdit = canAction ? true : false;
          const showDelete = canAction ? (row.UploadedApprovalDocumentCount || 0) === 0 : false;

          return (
            <div className="flex items-center justify-end ml-2 gap-1">


              {/* SLOT 1: ADD */}

              <div className="w-[34px] flex justify-center">

                {showEdit ? (
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddDocumentDetailsModal(row)
                    }}
                    color="transparent"
                    isborderRadius
                    size="sm"
                    title="Add"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="opacity-0 h-[32px] w-[34px]" />
                )}
              </div>

              <div className="w-[34px] flex justify-center">

                {showEdit ? (
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditApprovalDocument(row)
                    }}
                    color="transparent"
                    isborderRadius
                    size="sm"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="opacity-0 h-[32px] w-[34px]" />
                )}
              </div>

              {/* SLOT 3: DELETE */}
              <div className="w-[34px] flex justify-center">
                {showDelete ? (
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleConfirmationDialogBoxOpen(row)
                    }}
                    color="transparent"
                    isborderRadius
                    size="sm"
                    style={{ color: 'red' }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="opacity-0 h-[32px] w-[34px]" />
                )}
              </div>

            </div>

          )
        },
      }
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleEditApprovalDocument, handleConfirmationDialogBoxOpen]
  )
  //#endregion


  //#region TABLE COLUMN DOCUMENT DETAILS

  const handleApprovalLog = (row: ApprovalDocumentData) => {
    const request: ModulesApprovalStatusRequest = {
      ModuleName: "APPROVAL DOCUMENT APPROVAL",
      Id: row.ApprovalDocumentId,
      ProjectId: row.ProjectId,
    };
    setApprovalDocumentName(row.ApprovalDocumentName);
    setApprovalDocumentCategory(row.ApprovalDocumentCategory);
    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const handleApproveRejectDocument = (row: ApprovalDocumentData, approvalType: "approve" | "reject") => {

    setApprovalRowData(row);
    setApprovalActionType(approvalType);
    setIsApprovalActionModalOpen(true);

  };

  const approvalDocumentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ApprovalDocumentName',
        label: 'Document Version',
        width: '15',
        align: 'left',
        render: (value: string, row: any) => {
          return (
            <div className="flex items-center justify-between w-full">

              <div className="truncate max-w-[400px]">
                <MultiImageViewer
                  images={parseDocumentUrls(row.ApprovalDocumentURL)}
                  title="Document"
                  triggerLabel={value || '-'}
                />
              </div>

            </div>
          );
        }
      },
      {
        key: 'ApprovalDocumentExpiryDate',
        label: 'Expiry Date',
        width: '18',
        sortable: false,
        align: 'left',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
      },
      {
        key: 'ApprovalDocumentStatus',
        label: 'Status',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => {
          const statusClass = getDocumentStatusColor(value);

          return (
            <TooltipText
              text={value || "-"}
              maxWidth="180px"
              tooltipThreshold={18}
              isApplyBgTextColor
              tooltipClassName={`inline-block px-2 py-1 rounded-full text-sm font-medium ${statusClass} overflow-hidden text-ellipsis whitespace-nowrap`}
            />
          );
        },
      },
      {
        key: 'ApprovalDocumentRemark',
        label: 'Remark',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="180px"
            tooltipThreshold={18}
          />
        )
      },
      {
        key: "ApprovalDocumentApprovalStatus",
        label: "Approval Status",
        width: "18",
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
        key: 'ModifiedBy',
        label: 'Last Modified By',
        width: '33',
        sortable: false,
        align: 'left',
        render: (value, row) => (
          <TooltipText
            text={value || row.CreatedBy || '-'}
            maxWidth="180px"
            tooltipThreshold={18}
          />
        )
      },
      {
        key: 'ModifiedDate',
        label: 'Last Modified Date',
        width: '33',
        sortable: false,
        align: 'left',
        render: (value, row) =>
          value
            ? formatDate_dd_MonthName_yy(value)
            : row.CreatedDate
              ? formatDate_dd_MonthName_yy(row.CreatedDate)
              : '-'
      },
      {
        key: 'Actions',
        label: 'Actions',
        width: '12',
        align: 'center',
        fixed: 'right',
        render: (_value, row) => {
          const showEdit = canAction && row.ApprovalDocumentApprovalStatus !== "Approved" ? true : false;
          return (
            <div className="flex items-center justify-end ml-2 gap-1">
              {/* RIGHT SIDE — Fixed Edit Button */}
              <div className="flex-shrink-0 ml-2">
                {showEdit ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditApprovalDocumentDetails(row);
                    }}
                    color="transparent"
                    isborderRadius
                    size="sm"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="opacity-0 h-[32px] w-[34px]" />
                )}
              </div>

              <div className="w-[34px] flex justify-center">
                {showEdit ? (
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleConfirmationDialogBoxOpen(row)
                    }}
                    color="transparent"
                    isborderRadius
                    size="sm"
                    style={{ color: 'red' }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="opacity-0 h-[32px] w-[34px]" />
                )}
              </div>

            </div>

          )
        },
      }

    ],
    // dependencies: include everything used inside that might change
    [canAction, handleEditApprovalDocument, handleApprovalLog, handleApproveRejectDocument]
  )
  //#endregion

  //#region ADD UPDATE EDIT DOCUMENT

  const handleAddDocumentDetailsModal = useCallback((row: ApprovalDocumentData) => {
    setExpandedParentRow(row);
    setExpandedParentId(row.ApprovalDocumentId);
    setExpandHeaderApprovalDocumentName(row.ApprovalDocumentName);
    setExpandHeaderApprovalDocumentId(row.ApprovalDocumentId);

    setApprovalDocumentFiles([]);
    setApprovalDocumentURL('')
    setRemoveApprovalDocumentUrls([]);

    setEditingDocumentData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateDocumentDetailsModalOpen(true);

  }, [])

  const handleFieldChange = (field: keyof AddUpdateApprovalDocumentRequest, value: any) => {

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
  }, [])

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddDocumentForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.ApprovalDocumentName?.trim() === '') {

      newErrors.ApprovalDocumentName = "Document Name is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const validateAddDocumentDetailsForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.ApprovalDocumentStatus?.trim() === '') {

      newErrors.ApprovalDocumentStatus = "Status is required"
    }

    if (formData.ApprovalDocumentStatus?.toUpperCase() === "ISSUED" && !hasAnyDocumentFile(approvalDocumentFiles, approvalDocumentURL, RemoveApprovalDocumentUrls)) {
      newErrors.ApprovalDocumentURL = "File is required.";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushDocumentFormData = (): FormData => {


    const fd = new FormData();

    fd.append('ApprovalDocumentId', String(formData.ApprovalDocumentId ?? 0)),
      fd.append('Uniquekey', formData.Uniquekey ?? ''),
      fd.append('ApprovalDocumentName', formData.ApprovalDocumentName ?? ''),
      fd.append('ProjectId', String(projectId)),
      fd.append('ApprovalDocumentCategoryId', String(getActiveTabId() ?? 0)),
      fd.append('IsMaster', String(1))

    return fd;

  };

  const PushDocumentDetailsFormData = (): FormData => {
    const fd = new FormData();

    fd.append('ApprovalDocumentId', editingDocumentData ? String(formData.ApprovalDocumentId) : String(expandHeaderApprovalDocumentId ?? 0)),
      fd.append('Uniquekey', formData.Uniquekey ?? ''),
      fd.append('ApprovalDocumentName', expandHeaderApprovalDocumentName ?? ""),
      fd.append('ProjectId', String(projectId)),
      fd.append('ApprovalDocumentCategoryId', String(getActiveTabId() ?? 0)),
      fd.append('ApprovalDocumentExpiryDate', formData.ApprovalDocumentExpiryDate ?? ""),
      fd.append('ApprovalDocumentStatus', formData.ApprovalDocumentStatus ?? ''),
      fd.append('ApprovalDocumentRemark', formData.ApprovalDocumentRemark ?? ''),
      fd.append('IsMaster', String(0)),

      approvalDocumentFiles.forEach(file => {
        if (file instanceof File) {
          fd.append('ApprovalDocumentURL', file);
        }
      });

    fd.append('RemoveApprovalDocumentURL', RemoveApprovalDocumentUrls.join(','));


    return fd;

  };

  const handleAddUpdateDocument = async (ismaster: number, e: React.FormEvent) => {

    e.preventDefault();

    setErrors({})

    if (ismaster === 1) {

      const validation = validateAddDocumentForm()

      if (!validation.isValid) {

        setErrors(validation.errors)

        return
      }
    }
    else {

      const validation = validateAddDocumentDetailsForm()

      if (!validation.isValid) {

        setErrors(validation.errors)

        return
      }
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,

      async () => {

        const payload = ismaster === 1 ? PushDocumentFormData() : PushDocumentDetailsFormData();

        const response = await approvalDocumentService.apiCallAddUpdateApprovalDocument(payload);

        if (E.isRight(response)) {

          ismaster === 1 ? setIsAddUpdateDocumentModalOpen(false) : setIsAddUpdateDocumentDetailsModalOpen(false);

          const isAdd = formData.ApprovalDocumentId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as ApprovalDocumentData

            if (ismaster === 1) {

              setApprovalDocumentList(prevData => [newRecord, ...prevData]);

              setPagination({
                currentPage: pagination.currentPage,
                totalRecords: pagination.totalRecords + 1,
                totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
              });
            } else {

              const parentId = expandedParentId;

              await fetchApprovalDocumentList(pagination.currentPage);

              if (dtRef.current) {
                dtRef.current.collapseAll?.();
              }

              setTimeout(() => {
                if (parentId) {
                  dtRef.current?.expandRow?.(
                    String(parentId),
                    expandedParentRow
                  );
                }
              }, 50);
            }

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as ApprovalDocumentData;

            if (ismaster === 1) {

              setApprovalDocumentList(prevData =>
                prevData.map(item =>
                  item.ApprovalDocumentId === formData.ApprovalDocumentId
                    ? updatedRecord
                    : item
                )
              )
            }
            else {

              const parentId = expandedParentId;

              await fetchApprovalDocumentList(pagination.currentPage);

              if (dtRef.current) {
                dtRef.current.collapseAll?.();
              }

              setTimeout(() => {
                if (parentId) {
                  dtRef.current?.expandRow?.(
                    String(parentId),
                    expandedParentRow
                  );
                }
              }, 50);
            }
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
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

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      Number(formData.ApprovalDocumentId) === 0 ? 'Add Document' : 'Update Document'
    )

  };

  //#endregion

  //#region DELETE DOCUMENT
  const handleDeleteDocument = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteApprovalDocumentDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteApprovalDocumentRequest = {
          ApprovalDocumentId: deleteApprovalDocumentDetailsData.ApprovalDocumentId,
          projectId: Number(projectId),
          Uniquekey: deleteApprovalDocumentDetailsData.Uniquekey ?? '',
          ApprovalDocumentCategoryId: deleteApprovalDocumentDetailsData.ApprovalDocumentCategoryId
        }

        const response = await approvalDocumentService.apiCallDeleteApprovalDocument(params);

        if (E.isRight(response)) {

          if (deleteApprovalDocumentDetailsData.IsMaster === 1) {

            const newTotalRecords = pagination.totalRecords - 1;

            const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

            let pageToShow = pagination.currentPage;

            if (pagination.currentPage > newTotalPages) {
              pageToShow = newTotalPages;
            }

            else if (approvalDocumentList.length === 1 && pagination.currentPage > 1) {
              pageToShow = pagination.currentPage - 1;
            }

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords - 1,
              totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
            });

            await loadApprovalDocument(pageToShow, filters);

          }
          else {

            const parentId = expandedParentId;

            await fetchApprovalDocumentList(pagination.currentPage);

            if (dtRef.current) {
              dtRef.current.collapseAll?.();
            }

            setTimeout(() => {
              if (parentId) {
                dtRef.current?.expandRow?.(
                  String(parentId),
                  expandedParentRow
                );
              }
            }, 50);


          }

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteApprovalDocumentDetailsData(null);

        } else {
          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Delete Document'
    )
  }
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const downloadExcelSampleApprovalDocument = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'APPROVAL DOCUMENT'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Approval Document', addToast, 'Sample file download successfully')

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Downloading'
    )
  }

  const handleDownloadExcelSampleApprovalDocument = () => downloadExcelSampleApprovalDocument();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'APPROVAL DOCUMENT');
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: "Excel imported sucessfully" })

          loadApprovalDocumentTabs();

        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (err: any) => addToast({ type: "error", title: err.message }),
      undefined,
      "Importing Excel"
    );
  };

  //#endregion

  const handleApprovalSubmit = async (remark: string) => {

    if (!approvalRowData) return;

    const payload: UpdateModulesWorkflowApprovalRequest = {
      ModuleName: "APPROVAL DOCUMENT APPROVAL",
      Id: approvalRowData.ApprovalDocumentId ?? 0,
      ProjectId: approvalRowData.ProjectId ?? 0,
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

          await fetchApprovalDocumentList(pagination.currentPage);

          // collapse all first
          if (dtRef.current) {
            dtRef.current.collapseAll?.();
          }

          // reopen after table renders
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
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchDocumnets}
        isShowFilterButton={false}
        isShowCustomizeButton={false}
        // ADD
        isShowAddButton={approvalDocumentTabList.length > 0 && canAction ? true : false}
        addTitle="Add"
        onAdd={handleAddDocumentModal}

        // IMPORT
        isShowImportButton={canAction && Number(projectId) > 0}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleApprovalDocument}
        // EXPORT
        isShowExportButton={false}
        exportLoading={isLoading}
      />


      {approvalDocumentTabList.length > 0 && (
        <Tabs
          tabs={approvalDocumentTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {
            setSearchTerm('');
            setActiveTab(t.id);

            const newFilters: FilterInfo = {
              ...filters,
              ApprovalDocumentCategoryId: t.id,
            };

            loadApprovalDocument(1, newFilters);
          }}

        />
      )}


      <DataTableExpandable
        ref={dtRef}
        data={approvalDocumentListForTable}
        columns={approvalDocumentColumns}
        pagination={approvalDocumentPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        emptyMessage='No Approval Document Data Found'
        loading={isLoading}
        fixedHeight
        recordsPerPage={20}
        expandable={{

          keyField: 'ApprovalDocumentId',
          alwaysFetchOnOpen: true,
          fetchRow: async (row) => {

            setExpandedParentRow(row);
            setExpandedParentId(row.ApprovalDocumentId);

            const params: FilterWithPaginationApprovalDocument = {
              PageNumber: 1,
              PageSize: pagination.pageSize,
              ProjectId: Number(row.ProjectId),
              ApprovalDocumentId: Number(row.ApprovalDocumentId),
              ApprovalDocumentName: row.ApprovalDocumentName,
              ApprovalDocumentStatus: row.ApprovalDocumentStatus,
              ApprovalDocumentCategory: row.ApprovalDocumentCategory,
              ApprovalDocumentCategoryId: row.ApprovalDocumentCategoryId
            };


            const response = await approvalDocumentService.apiCallPullApprovalDocument(params);

            if (E.isRight(response)) {

              return response.right.Data ?? [];
            }
            return [];

          },


          renderRow: (fetchedData) => {

            const details: ApprovalDocumentData[] = Array.isArray(fetchedData) ? fetchedData : (fetchedData ? [fetchedData] : []);
            if (!details || details.length === 0) {

              return (
                <div className="p-1 text-xs text-gray-600 text-center">
                  No Document Found.
                </div>
              );
            }

            return (
              <DataTableWithOutBorder
                data={details}
                columns={approvalDocumentDetailsColumns}
                emptyMessage="No Approval Document Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
              />
            );
          },

          expandButton: { openText: 'Hide', closeText: 'Show' }
        }}
      />


      {/*  ADD EDIT UPDATE DOCUMENT */}
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
        title={editingDocumentData ? 'Update Document Name' : 'Add Document Name'}
        onSubmit={(e) => handleAddUpdateDocument(1, e)}
        saveText={editingDocumentData ? 'Update' : 'Add'}
        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              <Input
                label='Document Name'
                required
                error={errors.ApprovalDocumentName}
                type="text"
                value={formData.ApprovalDocumentName}
                maxLength={100}
                onChange={(e) => handleFieldChange('ApprovalDocumentName', e.target.value)}
                placeholder="Enter Document Name"
              />

            </div>

          </div>
        </div>

      </Modal>

      {/*  ADD EDIT UPDATE DOCUMENT DETAILS */}
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
        title={editingDocumentData ? 'Update Document' : 'Add Document'}
        onSubmit={(e) => handleAddUpdateDocument(0, e)}
        saveText={editingDocumentData ? 'Update' : 'Add'}

        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              {editingDocumentData ?
                <Input
                  label='Document'
                  required
                  readOnly
                  type="text"
                  value={formData.ApprovalDocumentName}
                  maxLength={250}
                  placeholder="Enter Document"
                />
                : ""}

            </div>
            <div>
              <SinglePageSelection
                label="Status"
                placeholder='Select Status'
                required
                value={formData.ApprovalDocumentStatus}
                onChange={(e) => handleFieldChange('ApprovalDocumentStatus', String(e))}
                options={PROJECT_DOCUMENT_STATUS.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errors.ApprovalDocumentStatus}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Files"
                placeholder='Select Files'
                required={formData.ApprovalDocumentStatus?.toUpperCase() === "ISSUED" ? true : false}
                value={approvalDocumentFiles}
                onChange={setApprovalDocumentFiles}
                availableFilesURL={approvalDocumentURL ?? ""}
                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                maxFiles={5}
                maxSizeMB={10}
                error={errors.ApprovalDocumentURL}
                onRemoveExisting={(url) => {
                  setRemoveApprovalDocumentUrls((prev) => [...prev, url])
                }}
              />
            </div>
            <div>
              <DatePickerInput
                label="Expiry Date"
                value={formatDate_dd_mm_yyyy(formData.ApprovalDocumentExpiryDate)}
                onChange={(val) => handleFieldChange('ApprovalDocumentExpiryDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
              />
            </div>
            <div>
              <TextArea
                label="Remark"
                placeholder="Enter Remark"
                className='thin-scroll'
                value={formData.ApprovalDocumentRemark}
                onChange={(e) => handleFieldChange("ApprovalDocumentRemark", e.target.value)}
                error={errors.ApprovalDocumentRemark} />


            </div>

          </div>
        </div>

      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteApprovalDocumentDetailsData(null)
        }}
        onConfirm={handleDeleteDocument}
        loading={isLoading}
        pageName='document'
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
        title='Approval Document'
        titleText={approvalDocumentCategory ?? ""}
        subTitleText={approvalDocumentName ?? ""}
        onClose={() => setIsApprovalLogModalOpen(false)}
        request={approvalLogRequest} />

      <ApprovalActionModal
        title='Document'
        isOpen={isApprovalActionModalOpen}
        onClose={() => setIsApprovalActionModalOpen(false)}
        actionType={approvalActionType}
        titleText={approvalDocumentCategory ?? ""}
        subTitleText={approvalDocumentName ?? ""}
        onSubmit={handleApprovalSubmit}
        loading={isLoading}
      />
    </div>
  );
};

export default ApprovalDocument;

