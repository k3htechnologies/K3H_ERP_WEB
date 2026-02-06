import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { Tabs, type TabItem } from '@/ui/components/Tab/Tab';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchProjectRERADocumentCategoryDropdown } from '@/features/projectRERADocumentCategory/projectRERADocumentCategoryDropDown';
import { runApiWithLoader } from '@/core/utils';
import type { AddUpdateProjectRERADocumentRequest, DeleteProjectRERADocumentRequest, FilterWithPaginationProjectRERADocument, ProjectRERADocumentData } from '@/features/projectRERADocument/models/ProjectRERADocumentModel';
import usePagination from '@/core/hooks/usePagination';
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import * as E from 'fp-ts/Either';
import { projectRERADocumentService } from '@/features/projectRERADocument/services/ProjectRERADocumentService';
import DataTableExpandable, { type DataTableExpandableRef } from '@/ui/components/DataTable/DataTableExpandable';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button, Input } from '@/ui/components/forms';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { Edit, Plus, Trash2 } from 'lucide-react';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { PROJECT_DOCUMENT_STATUS } from '@/core/constants';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { DataTableWithOutBorder } from '@/ui/components/DataTable/DataTableWithoutBorder';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { getDocumentStatusColor } from '@/features/projectDocument/pages/ProjectDocumentStatus';
import { TextArea } from '@/ui/components/forms/Textarea';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';


const initialFormState = (): AddUpdateProjectRERADocumentRequest => ({
  ProjectRERADocumentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  ProjectRERADocumentCategoryId: 0,
  ProjectRERADocumentName: '',
  ProjectRERADocumentStatus: '',
  ProjectRERADocumentRemark: '',
  IsMaster: 0,
  ProjectRERADocumentURL: null,
  RemoveProjectRERADocumentURL: '',
  RERAPortalScreenShotURL: null,
  RemoveRERAPortalScreenShotURL: '',
});

const ProjectRERADocument: React.FC = () => {

  //#region STATE
  const [projectRERADocumentList, setProjectRERADocumentList] = useState<ProjectRERADocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [expandHeaderProjectRERADocumentName, setExpandHeaderProjectRERADocumentName] = useState<string>('');
  const [expandHeaderProjectRERADocumentId, setExpandHeaderProjectRERADocumentId] = useState<number>(0);

  //SET AND REMOVE URL FILE
  const [projectRERADocumentFiles, setProjectRERADocumentFiles] = useState<(File | string)[]>([]);
  const [RemoveProjectRERADocumentUrls, setRemoveProjectRERADocumentUrls] = useState<string[]>([]);
  const [projectRERADocumentURL, setProjectRERADocumentURL] = useState<string>();

  //SET AND REMOVE URL FILE
  const [rERAPortalScreenShotFiles, setRERAPortalScreenShotFiles] = useState<(File | string)[]>([]);
  const [RemoveRERAPortalScreenShotUrls, setRemoveRERAPortalScreenShotUrls] = useState<string[]>([]);
  const [rERAPortalScreenShotURL, setRERAPortalScreenShotURL] = useState<string>();

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
  const [projectRERADocumentTabList, setProjectRERADocumentTabList] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [activeTabName, setActiveTabName] = useState<string>('');

  const [inAllTabPlusButtonClickDocumentCategoryId, setInAllTabPlusButtonClickDocumentCategoryId] = useState<number>(0);

  //DATATABLE EXPANDABLE REF
  const dtRef = useRef<DataTableExpandableRef | null>(null)

  //DATATABLE EXPANDED ROW AND PARENT ID
  const [expandedParentRow, setExpandedParentRow] = useState<any>(null);
  const [expandedParentId, setExpandedParentId] = useState<number | null>(null);
  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ADD EDIT UPDATE DOCUMENT
  const [editingDocumentData, setEditingDocumentData] = useState<ProjectRERADocumentData | null>(null);

  // ADD EDIT UPDATE DOCUMENT DETAILS
  const [isAddUpdateDocumentDetailsModalOpen, setIsAddUpdateDocumentDetailsModalOpen] = useState(false);

  //DELETE PROJECT RERA DOCUMENT MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteProjectRERADocumentDetailsData, setDeleteProjectRERADocumentDetailsData] = useState<ProjectRERADocumentData | null>(null)


  //ADD UPDATE PROJECT RERA DOCUMENT MASTER
  const [formData, setFormData] = useState<AddUpdateProjectRERADocumentRequest>(() => initialFormState());
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

    setProjectRERADocumentList([]);

    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      pageSize: pagination.pageSize,
    });

    loadProjectRERADocumentTabs()

  }, [projectId])



  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateDocumentDetailsModalOpen) {
      if (editingDocumentData) {
        setFormData({
          ProjectRERADocumentId: editingDocumentData.ProjectRERADocumentId ?? 0,
          Uniquekey: editingDocumentData.Uniquekey || initialFormState().Uniquekey,
          ProjectRERADocumentName: editingDocumentData.ProjectRERADocumentName || '',
          ProjectId: Number(projectId),
          ProjectRERADocumentCategoryId: editingDocumentData.ProjectRERADocumentCategoryId ?? 0,
          ProjectRERADocumentStatus: editingDocumentData.ProjectRERADocumentStatus ?? '',
          IsMaster: 0,
          ProjectRERADocumentRemark: editingDocumentData.ProjectRERADocumentRemark ?? '',

        });

        setProjectRERADocumentFiles([]);
        setProjectRERADocumentURL(editingDocumentData.ProjectRERADocumentURL || '')
        setRemoveProjectRERADocumentUrls([]);

        setRERAPortalScreenShotFiles([]);
        setRERAPortalScreenShotURL(editingDocumentData.RERAPortalScreenShotURL || '')
        setRemoveRERAPortalScreenShotUrls([]);


      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateDocumentDetailsModalOpen, editingDocumentData]);

  //#endregion

  //#region ACTIVE TAB IF FIND OUT
  const getActiveTabId = (filterParams?: FilterInfo): number => {

    if (filterParams && filterParams.ProjectRERADocumentCategoryId != null) {

      const raw = filterParams.ProjectRERADocumentCategoryId;

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
  const loadProjectRERADocumentTabs = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await fetchProjectRERADocumentCategoryDropdown(1, Number(projectId));

        const items = Array.isArray(response?.itemList) ? response.itemList : [];

        const tabs: TabItem[] = items.map((x) => ({
          id: x.value,
          label: x.label,
        }))

        setProjectRERADocumentTabList(tabs);

        if (tabs.length > 0) {

          setActiveTab(tabs[0].id);

          setActiveTabName(tabs[0].label);

          const newFilters: FilterInfo = {
            ...filters,
            ProjectRERADocumentCategoryId: tabs[0].id,
          };

          await loadProjectRERADocument(1, newFilters);
        }
        else {

          setActiveTab('');

          setProjectRERADocumentList([]);

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
  const fetchProjectRERADocumentList = async (page: number = pagination.currentPage) => {
    return await loadProjectRERADocument(page, filters);
  };

  const loadProjectRERADocument = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        
        const params: FilterWithPaginationProjectRERADocument = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          ProjectRERADocumentId: Number(filterParams.ProjectRERADocumentId) ?? undefined,
          ProjectRERADocumentName: filterParams.ProjectRERADocumentName ?? "",
          ProjectRERADocumentStatus: filterParams.ProjectRERADocumentStatus ?? "",
          ProjectRERADocumentCategory: filterParams.ProjectRERADocumentCategory ?? "",
          ProjectRERADocumentCategoryId: Number(getActiveTabId(filterParams)),
          SortBy: getSortByParam(sortInfo ?? null, projectRERADocumentColumns)
        };

        const response = await projectRERADocumentService.apiCallPullProjectRERADocument(params);

        if (E.isRight(response)) {

          setProjectRERADocumentList(response.right.Data);

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
      'Loading ' + projectRERADocumentTabList.find(t => t.id === activeTab)?.label || 'Project RERA Document'
    );
  };
  //#endregion

  //#region SERACH Document 
  const searchDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchProjectRERADocumentList();

      return
    }

    const filterParams: FilterInfo = {
      ProjectRERADocumentName: searchValue.trim(),
    };

    await loadProjectRERADocument(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH Document 
  const clearsearchDocumnets = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchProjectRERADocumentList();
  }

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = useCallback((page: number) => {
    fetchProjectRERADocumentList(page);
  }, [fetchProjectRERADocumentList]);

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchProjectRERADocumentList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const projectRERADocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const projectRERADocumentListForTable = useMemo(() => projectRERADocumentList, [projectRERADocumentList]);

  //#endregion



  //#region EDIT PROJECT DOCUMENT DETAILS
  const handleEditProjectRERADocumentDetails = useCallback((row: ProjectRERADocumentData) => {
    setEditingDocumentData({
      ...row,
      ProjectRERADocumentName: row.ProjectRERADocumentName || '',
      ProjectRERADocumentStatus: row.ProjectRERADocumentStatus || '',
      ProjectRERADocumentRemark: row.ProjectRERADocumentRemark || '',
      ProjectRERADocumentCategoryId: row.ProjectRERADocumentCategoryId || 0,

    })
    setIsAddUpdateDocumentDetailsModalOpen(true);

  }, [])

  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ProjectRERADocumentData) => {
    setDeleteProjectRERADocumentDetailsData({
      ...row
    })

    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const projectRERADocumentColumns = useMemo<TableColumn[]>(
    () => [

      {
        key: 'ProjectRERADocumentName',
        label: 'Project RERA Document Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value) => {
          return (
            <div className="flex items-center justify-end ml-2 gap-1">
              <TooltipText
                text={value || ''}
                maxWidth="250px"
                tooltipThreshold={40}
              />
            </div>

          )
        },
      },
      {
        key: 'UploadedProjectRERADocumentCount',
        label: 'Document Count',
        width: '30',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },
      {
        key: 'ApprovalPendingProjectRERADocumentCount',
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
          const showEdit = canAction && row.IsMultiple ? true : false;

          return (
            <div className="flex items-center justify-end ml-2 gap-1">

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

            </div>

          )
        },
      }

    ],
    // dependencies: include everything used inside that might change
    [canAction, handleEditProjectRERADocumentDetails, handleConfirmationDialogBoxOpen]
  )
  //#endregion

  //#region TABLE COLUMN DOCUMENT DETAILS

  const projectRERADocumentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ProjectRERADocumentName',
        label: 'Document',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value: string, row: any) => {

          return (
            <div className="flex items-center justify-between w-full">

              <div className="truncate max-w-[400px]">
                <MultiImageViewer
                  images={parseDocumentUrls(row.ProjectRERADocumentURL)}
                  title="Document"
                  triggerLabel={value || '-'}
                />
              </div>

            </div>
          );
        }
      },
      {
        key: 'RERAPortalScreenShotURL',
        label: 'Screenshot',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value: string, row: any) => {
          return (
            <div className="flex items-center justify-between w-full">
              <MultiImageViewer
                images={parseDocumentUrls(row.RERAPortalScreenShotURL)}
                title="Screenshot Document"
                isIcon={false}
                triggerLabel={value === '' || 'Screenshot'}
              />

            </div>
          );
        }
      },
      {
        key: 'ProjectRERADocumentStatus',
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
              tooltipClassName={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClass} overflow-hidden text-ellipsis whitespace-nowrap`}
            />
          );
        }
      },
      {
        key: 'ProjectRERADocumentRemark',
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
        key: 'actions',
        label: 'Actions',
        width: '12',
        align: 'center',
        fixed: 'right',
        render: (_value, row) => {
          const showEdit = canAction ? true : false;
          return (
            <div className="flex items-center justify-end ml-2 gap-1">
              <div className="flex-shrink-0 ml-2">
                {showEdit ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditProjectRERADocumentDetails(row);
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
    [canAction, handleConfirmationDialogBoxOpen]
  )
  //#endregion

  //#region ADD UPDATE EDIT DOCUMENT

  const handleAddDocumentDetailsModal = useCallback((row: ProjectRERADocumentData) => {
    setExpandedParentRow(row);
    setExpandedParentId(row.ProjectRERADocumentId);
    setExpandHeaderProjectRERADocumentName(row.ProjectRERADocumentName ?? '');
    setExpandHeaderProjectRERADocumentId(row.ProjectRERADocumentId ?? 0);

    setProjectRERADocumentFiles([]);
    setProjectRERADocumentURL('')
    setRemoveProjectRERADocumentUrls([]);

    setRERAPortalScreenShotFiles([]);
    setRERAPortalScreenShotURL('')
    setRemoveRERAPortalScreenShotUrls([]);

    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateDocumentDetailsModalOpen(true);

    setInAllTabPlusButtonClickDocumentCategoryId(row.ProjectRERADocumentCategoryId ?? 0);


  }, [])

  const handleFieldChange = (field: keyof AddUpdateProjectRERADocumentRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================


  const validateAddDocumentDetailsForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.ProjectRERADocumentStatus?.trim() === '') {

      newErrors.ProjectRERADocumentStatus = "Status is required"
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }


  const PushDocumentDetailsFormData = (): FormData => {


    const fd = new FormData();

    fd.append('ProjectRERADocumentId', editingDocumentData ? String(formData.ProjectRERADocumentId) : String(expandHeaderProjectRERADocumentId ?? 0));

    fd.append('Uniquekey', formData.Uniquekey ?? '');

    fd.append('ProjectRERADocumentName', expandHeaderProjectRERADocumentName ?? "");

    fd.append('ProjectId', String(projectId));

    fd.append('ProjectRERADocumentCategoryId', activeTabName === "All" ? String(inAllTabPlusButtonClickDocumentCategoryId) : String(getActiveTabId() ?? 0));

    fd.append('ProjectRERADocumentStatus', formData.ProjectRERADocumentStatus ?? '');

    fd.append('ProjectRERADocumentRemark', formData.ProjectRERADocumentRemark ?? '');

    fd.append('IsMaster', String(0)),

      projectRERADocumentFiles.forEach(file => {
        if (file instanceof File) {
          fd.append('ProjectRERADocumentURL', file);
        }
      });

    fd.append('RemoveProjectRERADocumentURL', RemoveProjectRERADocumentUrls.join(','));

    rERAPortalScreenShotFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('RERAPortalScreenShotURL', file);
      }
    });

    fd.append('RemoveRERAPortalScreenShotURL', RemoveRERAPortalScreenShotUrls.join(','));


    return fd;

  };

  const handleAddUpdateDocument = async (e: React.FormEvent) => {

    e.preventDefault();

    setErrors({})

    const validation = validateAddDocumentDetailsForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }


    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,

      async () => {

        const payload = PushDocumentDetailsFormData();

        const response = await projectRERADocumentService.apiCallAddUpdateProjectRERADocument(payload);

        if (E.isRight(response)) {

          setIsAddUpdateDocumentDetailsModalOpen(false);

          const isAdd = formData.ProjectRERADocumentId === 0;

          if (isAdd) {

            const parentId = expandedParentId ?? expandedParentRow?.ProjectRERADocumentId;

            await fetchProjectRERADocumentList(pagination.currentPage);

            if (parentId) {
              dtRef.current?.expandRow?.(
                String(parentId),
                expandedParentRow
              );
            }
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {


            const parentId = expandedParentId ?? expandedParentRow?.ProjectRERADocumentId;

            await fetchProjectRERADocumentList(pagination.currentPage);

            if (parentId) {
              dtRef.current?.expandRow?.(
                String(parentId),
                expandedParentRow
              );
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

      Number(formData.ProjectRERADocumentId) === 0 ? 'Add Document' : 'Update Document'
    )

  };

  //#endregion

  //#region DELETE DOCUMENT
  const handleDeleteProjectRERADocument = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteProjectRERADocumentDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteProjectRERADocumentRequest = {

          ProjectRERADocumentId: deleteProjectRERADocumentDetailsData.ProjectRERADocumentId ?? 0,
          projectId: Number(projectId),
          Uniquekey: deleteProjectRERADocumentDetailsData.Uniquekey ?? '',
          ProjectRERADocumentCategoryId: deleteProjectRERADocumentDetailsData.ProjectRERADocumentCategoryId ?? 0,

        }

        const response = await projectRERADocumentService.apiCallDeleteProjectRERADocument(params);

        if (E.isRight(response)) {

          const parentId = expandedParentId ?? expandedParentRow?.ProjectRERADocumentId;

          await fetchProjectRERADocumentList(pagination.currentPage);

          if (parentId) {

            dtRef.current?.expandRow?.(String(parentId), expandedParentRow);

          }

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteProjectRERADocumentDetailsData(null);

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
        isShowAddButton={false}

        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={false}
        exportLoading={isLoading}
      />


      {projectRERADocumentTabList.length > 0 && (
        <Tabs
          tabs={projectRERADocumentTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {

            setSearchTerm('');

            setActiveTab(t.id);

            setActiveTabName(t.label);

            const newFilters: FilterInfo = {
              ...filters,
              ProjectRERADocumentCategoryId: t.id,
            };

            loadProjectRERADocument(1, newFilters);
          }}

        />
      )}


      <DataTableExpandable
        ref={dtRef}
        data={projectRERADocumentListForTable}
        columns={projectRERADocumentColumns}
        pagination={projectRERADocumentPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        emptyMessage='No RERA Document Data Found'
        loading={isLoading}
        fixedHeight
        recordsPerPage={20}
        expandable={{

          keyField: 'ProjectRERADocumentId',
          alwaysFetchOnOpen: true,
          fetchRow: async (row) => {

            setExpandedParentRow(row);
            setExpandedParentId(row.ProjectRERADocumentId);

            const params: FilterWithPaginationProjectRERADocument = {
              PageNumber: 1,
              PageSize: pagination.pageSize,
              ProjectId: Number(row.ProjectId),
              ProjectRERADocumentId: Number(row.ProjectRERADocumentId),
              ProjectRERADocumentCategoryId: row.ProjectRERADocumentCategoryId
            };


            const response = await projectRERADocumentService.apiCallPullProjectRERADocument(params);

            if (E.isRight(response)) {

              return response.right.Data ?? [];
            }
            return [];

          },


          renderRow: (fetchedData) => {

            const details: ProjectRERADocumentData[] = Array.isArray(fetchedData) ? fetchedData : (fetchedData ? [fetchedData] : []);
            if (!details || details.length === 0) {

              return (
                <div className="p-1 text-xs text-gray-600 text-center">
                  <NoDataView />
                </div>
              );
            }

            return (
              <DataTableWithOutBorder
                data={details}
                columns={projectRERADocumentDetailsColumns}
                emptyMessage="No RERA Document Data Found"
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
        onSubmit={(e) => handleAddUpdateDocument(e)}
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
                  value={formData.ProjectRERADocumentName}
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
                value={formData.ProjectRERADocumentStatus}
                onChange={(e) => handleFieldChange('ProjectRERADocumentStatus', String(e))}
                options={PROJECT_DOCUMENT_STATUS.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errors.ProjectRERADocumentStatus}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Files"
                value={projectRERADocumentFiles}
                onChange={setProjectRERADocumentFiles}
                availableFilesURL={projectRERADocumentURL ?? ""}
                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => {
                  setRemoveProjectRERADocumentUrls((prev) => [...prev, url])
                }}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Screenshot"
                value={rERAPortalScreenShotFiles}
                onChange={setRERAPortalScreenShotFiles}
                availableFilesURL={rERAPortalScreenShotURL ?? ""}
                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => {
                  setRemoveRERAPortalScreenShotUrls((prev) => [...prev, url])
                }}
              />
            </div>
            <div>
              <TextArea
                label="Remark"
                placeholder="Enter Remark"
                className='thin-scroll'
                value={formData.ProjectRERADocumentRemark}
                onChange={(e) => handleFieldChange("ProjectRERADocumentRemark", e.target.value)}
                error={errors.ProjectRERADocumentRemark} />
            </div>

          </div>
        </div>

      </Modal>
      {/* DELETE CONFIRMATION DIALOG BOX */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteProjectRERADocumentDetailsData(null)
        }}
        onConfirm={handleDeleteProjectRERADocument}
        loading={isLoading}
        pageName='RERA document'
      />
    </div>
  );
};

export default ProjectRERADocument;
