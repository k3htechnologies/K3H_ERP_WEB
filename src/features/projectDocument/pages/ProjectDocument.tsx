import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { Tabs, type TabItem } from '@/ui/components/Tab/Tab';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchProjectDocumentCategoryDropdown } from '@/features/projectDocumentCategory/projectDocumentCategoryDropDown';
import { runApiWithLoader } from '@/core/utils';
import type { AddUpdateProjectDocumentRequest, DeleteProjectDocumentRequest, FilterWithPaginationProjectDocument, ProjectDocumentData } from '@/features/projectDocument/models/ProjectDocumentModel';
import usePagination from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import * as E from 'fp-ts/Either';
import { ProjectDocumentService } from '../services/ProjectDocumentService';
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
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { PROJECT_DOCUMENT_STATUS } from '@/core/constants';
import { useProject } from '@/features/projectMaster/context/ProjectContext';


const initialFormState = (): AddUpdateProjectDocumentRequest => ({
  ProjectDocumentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  ProjectDocumentCategoryId: 0,
  ProjectDocumentName: '',
  ProjectDocumentExpiryDate: '',
  ProjectDocumentStatus: '',
  IsMaster: 0,
  ProjectDocumentURL: null,
  RemoveProjectDocumentURL: '',
  ProjectDocumentRemark: ''
});

const ProjectDocument: React.FC = () => {

  //#region STATE
  const [projectDocumentList, setProjectDocumentList] = useState<ProjectDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [expandHeaderProjectDocumentName, setExpandHeaderProjectDocumentName] = useState<string>('');
  const [expandHeaderProjectDocumentId, setExpandHeaderProjectDocumentId] = useState<number>(0);

  //SET AND REMOVE URL FILE
  const [projectDocumentFiles, setProjectDocumentFiles] = useState<(File | string)[]>([]);
  const [RemoveProjectDocumentUrls, setRemoveProjectDocumentUrls] = useState<string[]>([]);
  const [projectDocumentURL, setProjectDocumentURL] = useState<string>();

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
  const [projectDocumentTabList, setProjectDocumentTabList] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  //DATATABLE EXPANDABLE REF
  const dtRef = useRef<DataTableExpandableRef | null>(null)


  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ADD EDIT UPDATE DOCUMENT
  const [editingDocumentData, setEditingDocumentData] = useState<ProjectDocumentData | null>(null);

  const [isAddUpdateDocumentModalOpen, setIsAddUpdateDocumentModalOpen] = useState(false);

  // ADD EDIT UPDATE DOCUMENT DETAILS
  const [isAddUpdateDocumentDetailsModalOpen, setIsAddUpdateDocumentDetailsModalOpen] = useState(false);

  //DELETE DEPARTMENT MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteProjectDocumentDetailsData, setDeleteProjectDocumentDetailsData] = useState<ProjectDocumentData | null>(null)

  //ADD UPDATE DEPARTMENT MASTER
  const [formData, setFormData] = useState<AddUpdateProjectDocumentRequest>(() => initialFormState());
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
    loadProjectDocumentTabs()

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
          ProjectDocumentId: editingDocumentData.ProjectDocumentId,
          Uniquekey: editingDocumentData.Uniquekey || initialFormState().Uniquekey,
          ProjectDocumentName: editingDocumentData.ProjectDocumentName || '',
          ProjectId: Number(projectId),
          ProjectDocumentCategoryId: editingDocumentData.ProjectDocumentCategoryId,
          ProjectDocumentExpiryDate: editingDocumentData.ProjectDocumentExpiryDate || undefined,
          ProjectDocumentStatus: editingDocumentData.ProjectDocumentStatus,
          IsMaster: 0,
          ProjectDocumentRemark: editingDocumentData.ProjectDocumentRemark,

        });

        setProjectDocumentFiles([]);
        setProjectDocumentURL(editingDocumentData.ProjectDocumentURL || '')
        setRemoveProjectDocumentUrls([]);


      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateDocumentModalOpen, isAddUpdateDocumentDetailsModalOpen, editingDocumentData]);

  //#endregion
  //#region ACTIVE TAB IF FIND OUT
  const getActiveTabId = (filterParams?: FilterInfo): number => {
    if (filterParams && filterParams.ProjectDocumentCategoryId != null) {
      const raw = filterParams.ProjectDocumentCategoryId;
      const num = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isNaN(num)) return num;
    }


    if (activeTab !== '' && !Number.isNaN(Number(activeTab))) {
      return Number(activeTab);
    }


    return 0;
  };
  //#endregion
  //#region LOAD TAB PROJECT DOCUMENT CATEGORY
  const loadProjectDocumentTabs = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await fetchProjectDocumentCategoryDropdown(1, Number(projectId));

        const items = Array.isArray(response?.itemList) ? response.itemList : [];

        const tabs: TabItem[] = items.map((x) => ({
          id: x.value,
          label: x.label,
        }))

        setProjectDocumentTabList(tabs);

        if (tabs.length > 0) {

          setActiveTab(tabs[0].id);

          const newFilters: FilterInfo = {
            ...filters,
            ProjectDocumentCategoryId: tabs[0].id,
          };

          await loadProjectDocument(1, newFilters);
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
  const fetchProjectDocumentList = async (page: number = pagination.currentPage) => {
    return await loadProjectDocument(page, filters);
  };

  const loadProjectDocument = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = projectDocumentColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationProjectDocument = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          ProjectDocumentId: Number(filterParams.ProjectDocumentId) ?? undefined,
          ProjectDocumentName: filterParams.ProjectDocumentName,
          ProjectDocumentStatus: filterParams.ProjectDocumentStatus,
          ProjectDocumentCategory: filterParams.ProjectDocumentCategory,
          ProjectDocumentCategoryId: Number(getActiveTabId(filterParams)),
          SortBy: sortByParam
        };

        const response = await ProjectDocumentService.apiCallPullProjectDocument(params);

        if (E.isRight(response)) {

          setProjectDocumentList(response.right.Data);
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
      'Loading Project Document'
    );
  };
  //#endregion

  //#region SERACH Document 
  const searchDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchProjectDocumentList();

      return
    }

    const filterParams: FilterInfo = {
      ProjectDocumentName: searchValue.trim(),
    };

    await loadProjectDocument(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH Document 
  const clearsearchDocumnets = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchProjectDocumentList();
  }

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = useCallback((page: number) => {
    fetchProjectDocumentList(page);
  }, [fetchProjectDocumentList]);

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchProjectDocumentList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const projectDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const projectDocumentListForTable = useMemo(() => projectDocumentList, [projectDocumentList]);

  //#endregion

  //#region EDIT PROJECT DOCUMENT
  const handleEditProjectDocument = useCallback((row: ProjectDocumentData) => {
    setEditingDocumentData({
      ...row,
      ProjectDocumentName: row.ProjectDocumentName || ''
    })
    setIsAddUpdateDocumentModalOpen(true);

  }, [])

  //#endregion

  //#region EDIT PROJECT DOCUMENT DETAILS
  const handleEditProjectDocumentDetails = useCallback((row: ProjectDocumentData) => {
    setEditingDocumentData({
      ...row,
      ProjectDocumentName: row.ProjectDocumentName || '',
      ProjectDocumentExpiryDate: row.ProjectDocumentExpiryDate || null,
      ProjectDocumentStatus: row.ProjectDocumentStatus || '',
      ProjectDocumentRemark: row.ProjectDocumentRemark || '',
    })
    setIsAddUpdateDocumentDetailsModalOpen(true);

  }, [])

  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: ProjectDocumentData) => {
    setDeleteProjectDocumentDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const projectDocumentColumns = useMemo<TableColumn[]>(
    () => [

      {
        key: 'ProjectDocumentName',
        label: 'Project Document Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => {
          const showEdit = canAction ? true : false;
          const showDelete = canAction ? (row.UploadedProjectDocumentCount || 0) === 0 : false;

          return (
            <div className="flex items-center justify-end ml-2 gap-1">

              <TooltipText
                text={value || ''}
                maxWidth="250px"
                tooltipThreshold={40}
              />


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
                      handleEditProjectDocument(row)
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

              <TooltipText
                text={`${row.UploadedProjectDocumentCount ?? 0} Uploaded`}
                tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 overflow-hidden text-ellipsis whitespace-nowrap'
              />

              <TooltipText
                text={`${row.UploadedProjectDocumentCount ?? 0} Approval Pending`}
                tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
              />
            </div>

          )
        }

      },

    ],
    // dependencies: include everything used inside that might change
    [canAction, handleEditProjectDocument, handleConfirmationDialogBoxOpen]
  )
  //#endregion

  // #region STATUS COLOR 
  const getStatusColor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {
      "Applied": { bg: "bg-green-100", text: "text-green-800" },
      "Doc Missing": { bg: "bg-red-100", text: "text-red-800" },
      "In Process": { bg: "bg-yellow-100", text: "text-yellow-800" },
      "Issued": { bg: "bg-blue-100", text: "text-blue-800" },
      "Not Applied": { bg: "bg-gray-100", text: "text-gray-800" },
      "Not Applicable": { bg: "bg-gray-200", text: "text-gray-900" },
      "Paid": { bg: "bg-emerald-100", text: "text-emerald-800" },
      "Payment Due": { bg: "bg-orange-100", text: "text-orange-800" },
      "Rejected": { bg: "bg-red-200", text: "text-red-900" },
    };

    return map[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  };
  //#endregion

  //#region TABLE COLUMN DOCUMENT DETAILS

  const projectDocumentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ProjectDocumentName',
        label: 'Document',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value: string, row: any) => {
          const showEdit = canAction ? true : false;

          return (
            <div className="flex items-center justify-between w-full">

              <div className="truncate max-w-[400px]">
                <MultiImageViewer
                  images={parseDocumentUrls(row.ProjectDocumentURL)}
                  title="Document"
                  triggerLabel={value || '-'}
                />
              </div>

              {/* RIGHT SIDE — Fixed Edit Button */}
              <div className="flex-shrink-0 ml-2">
                {showEdit ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditProjectDocumentDetails(row);
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
            </div>
          );
        }
      },
      {
        key: 'ProjectDocumentExpiryDate',
        label: 'Expiry Date',
        width: '18',
        sortable: false,
        align: 'left',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
      },
      {
        key: 'ProjectDocumentStatus',
        label: 'Status',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => {
          const { bg, text } = getStatusColor(value);

          return (
            <TooltipText
              text={value || "-"}
              maxWidth="180px"
              tooltipThreshold={18}
              tooltipClassName={`inline-block px-2 py-1 rounded-full text-xs font-medium ${bg} ${text} overflow-hidden text-ellipsis whitespace-nowrap`}
            />
          );
        }
      },
      {
        key: 'ProjectDocumentRemark',
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
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '33',
        sortable: false,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '33',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }

    ],
    // dependencies: include everything used inside that might change
    [canAction, handleEditProjectDocument]
  )
  //#endregion

  //#region ADD UPDATE EDIT DOCUMENT

  const handleAddDocumentDetailsModal = useCallback((row: ProjectDocumentData) => {
    setExpandHeaderProjectDocumentName(row.ProjectDocumentName);
    setExpandHeaderProjectDocumentId(row.ProjectDocumentId);

    setProjectDocumentFiles([]);
    setProjectDocumentURL('')
    setRemoveProjectDocumentUrls([]);

    setEditingDocumentData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateDocumentDetailsModalOpen(true);


  }, [])

  const handleFieldChange = (field: keyof AddUpdateProjectDocumentRequest, value: any) => {

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

    if (formData.ProjectDocumentName?.trim() === '') {

      newErrors.ProjectDocumentName = "Document Name is required"
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

    if (formData.ProjectDocumentStatus?.trim() === '') {

      newErrors.ProjectDocumentStatus = "Status is required"
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushDocumentFormData = (): FormData => {


    const fd = new FormData();

    fd.append('ProjectDocumentId', String(formData.ProjectDocumentId ?? 0)),
      fd.append('Uniquekey', formData.Uniquekey ?? ''),
      fd.append('ProjectDocumentName', formData.ProjectDocumentName ?? ''),
      fd.append('ProjectId', String(projectId)),
      fd.append('ProjectDocumentCategoryId', String(getActiveTabId() ?? 0)),
      fd.append('IsMaster', String(1))

    return fd;

  };

  const PushDocumentDetailsFormData = (): FormData => {


    const fd = new FormData();

    fd.append('ProjectDocumentId', editingDocumentData ? String(formData.ProjectDocumentId) : String(expandHeaderProjectDocumentId ?? 0)),
      fd.append('Uniquekey', formData.Uniquekey ?? ''),
      fd.append('ProjectDocumentName', expandHeaderProjectDocumentName ?? ""),
      fd.append('ProjectId', String(projectId)),
      fd.append('ProjectDocumentCategoryId', String(getActiveTabId() ?? 0)),
      fd.append('ProjectDocumentExpiryDate', formData.ProjectDocumentExpiryDate ?? ""),
      fd.append('ProjectDocumentStatus', formData.ProjectDocumentStatus ?? ''),
      fd.append('ProjectDocumentRemark', formData.ProjectDocumentRemark ?? ''),
      fd.append('IsMaster', String(0)),

      projectDocumentFiles.forEach(file => {
        if (file instanceof File) {
          fd.append('ProjectDocumentURL', file);
        }
      });

    fd.append('RemoveProjectDocumentURL', RemoveProjectDocumentUrls.join(','));


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

      setIsLoadingMessage,

      async () => {

        const payload = ismaster === 1 ? PushDocumentFormData() : PushDocumentDetailsFormData();

        const response = await ProjectDocumentService.apiCallAddUpdateProjectDocument(payload);

        if (E.isRight(response)) {

          ismaster === 1 ? setIsAddUpdateDocumentModalOpen(false) : setIsAddUpdateDocumentDetailsModalOpen(false);

          const isAdd = formData.ProjectDocumentId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as ProjectDocumentData

            if (ismaster === 1) {

              setProjectDocumentList(prevData => [newRecord, ...prevData]);

              setPagination({
                currentPage: pagination.currentPage,
                totalRecords: pagination.totalRecords + 1,
                totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
              });
            }

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as ProjectDocumentData;

            if (ismaster === 1) {

              setProjectDocumentList(prevData =>
                prevData.map(item =>
                  item.ProjectDocumentId === formData.ProjectDocumentId
                    ? updatedRecord
                    : item
                )
              )
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

      Number(formData.ProjectDocumentId) === 0 ? 'Add Document' : 'Update Document'
    )

  };

  //#endregion

  //#region DELETE DOCUMENT
  const handleDeleteDocument = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteProjectDocumentDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteProjectDocumentRequest = {
          ProjectDocumentId: deleteProjectDocumentDetailsData.ProjectDocumentId,
          projectId: Number(projectId),
          Uniquekey: deleteProjectDocumentDetailsData.Uniquekey ?? '',
          ProjectDocumentCategoryId: deleteProjectDocumentDetailsData.ProjectDocumentCategoryId
        }

        const response = await ProjectDocumentService.apiCallDeleteProjectDocument(params);

        if (E.isRight(response)) {

          setProjectDocumentList(prevData => prevData.filter(item => item.ProjectDocumentId !== deleteProjectDocumentDetailsData.ProjectDocumentId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteProjectDocumentDetailsData(null);

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
        isShowAddButton={projectDocumentTabList.length > 0 ? true : false}
        addTitle="Add Document"
        onAdd={handleAddDocumentModal}

        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={false}
        exportLoading={isLoading}
      />


      {projectDocumentTabList.length > 0 && (
        <Tabs
          tabs={projectDocumentTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {
            setActiveTab(t.id);

            const newFilters: FilterInfo = {
              ...filters,
              ProjectDocumentCategoryId: t.id,
            };

            loadProjectDocument(1, newFilters);
          }}

        />
      )}


      <DataTableExpandable
        ref={dtRef}
        data={projectDocumentListForTable}
        columns={projectDocumentColumns}
        pagination={projectDocumentPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        emptyMessage='No Document Data Found'
        loading={isLoading}
        fixedHeight
        recordsPerPage={20}
        expandable={{

          keyField: 'ProjectDocumentId',
          alwaysFetchOnOpen: true,
          fetchRow: async (row) => {

            const params: FilterWithPaginationProjectDocument = {
              PageNumber: 1,
              PageSize: pagination.pageSize,
              ProjectId: Number(projectId),
              ProjectDocumentId: Number(row.ProjectDocumentId),
              ProjectDocumentName: row.ProjectDocumentName,
              ProjectDocumentStatus: row.ProjectDocumentStatus,
              ProjectDocumentCategory: row.ProjectDocumentCategory,
              ProjectDocumentCategoryId: row.ProjectDocumentCategoryId
            };


            const response = await ProjectDocumentService.apiCallPullProjectDocument(params);

            if (E.isRight(response)) {

              return response.right.Data ?? [];
            }
            return [];

          },


          renderRow: (fetchedData) => {

            const details: ProjectDocumentData[] = Array.isArray(fetchedData) ? fetchedData : (fetchedData ? [fetchedData] : []);
            if (!details || details.length === 0) {

              return (
                <div className="p-1 text-xs text-gray-600 text-center">
                  No Document Found.
                </div>
              );
            }

            return (
              <DataTable
                data={details}
                columns={projectDocumentDetailsColumns}
                emptyMessage="No Departments Data Found"
                fixedHeight={true}
                maxHeight="calc(100vh - 255px)"
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
        title={editingDocumentData ? 'Update Document' : 'Add Document'}
        onSubmit={(e) => handleAddUpdateDocument(1, e)}
        saveText={editingDocumentData ? 'Update Document' : 'Save Document'}
        resetText='Reset'
        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              <Input
                label='Document'
                required
                error={errors.ProjectDocumentName}
                type="text"
                value={formData.ProjectDocumentName}
                maxLength={250}
                onChange={(e) => handleFieldChange('ProjectDocumentName', e.target.value)}
                placeholder="Enter Document"
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
        saveText={editingDocumentData ? 'Update Document' : 'Save Document'}
        resetText='Reset'
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
                  value={formData.ProjectDocumentName}
                  maxLength={250}
                  placeholder="Enter Document"
                />
                : ""}

            </div>
            <div>
              <DatePickerInput
                label="Expiry Date"
                value={formatDate_dd_mm_yyyy(formData.ProjectDocumentExpiryDate)}
                onChange={(val) => handleFieldChange('ProjectDocumentExpiryDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
              />
            </div>
            <div>
              <SinglePageSelection
                label="Status"
                required
                value={formData.ProjectDocumentStatus}
                onChange={(e) => handleFieldChange('ProjectDocumentStatus', String(e))}
                options={PROJECT_DOCUMENT_STATUS.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errors.ProjectDocumentStatus}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Documents"
                value={projectDocumentFiles}
                onChange={setProjectDocumentFiles}
                availableFilesURL={projectDocumentURL ?? ""}
                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => {
                  setRemoveProjectDocumentUrls((prev) => [...prev, url])
                }}
              />
            </div>
            <div>
              <Input
                label='Remark'

                type="text"
                value={formData.ProjectDocumentRemark}
                maxLength={250}
                onChange={(e) => handleFieldChange('ProjectDocumentRemark', e.target.value)}
                placeholder="Enter Remarks"
              />

            </div>

          </div>
        </div>

      </Modal>

      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteProjectDocumentDetailsData(null)
        }}
        onConfirm={handleDeleteDocument}
        title="You are about to delete a document?"
        message="Deleting this document will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />
    </div>
  );
};

export default ProjectDocument;
