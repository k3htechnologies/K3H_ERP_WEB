import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { runApiWithLoader } from '@/core/utils';
import type { AddUpdateBuildingDocumentRequest, DeleteBuildingDocumentRequest, FilterWithPaginationBuildingDocumentRequest, BuildingDocumentData } from '@/features/building/models/BuildingModel';
import usePagination from '@/core/hooks/usePagination';
import { type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import * as E from 'fp-ts/Either';
import { buildingService } from '@/features/building/services/BuildingService';
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
import { useNavigate } from 'react-router-dom';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { DataTableWithOutBorder } from '@/ui/components/DataTable/DataTableWithoutBorder';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useBuildingListState } from '@/features/building/context/BuildingListStateContext';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';


const initialFormState = (): AddUpdateBuildingDocumentRequest => ({
  BuildingDocumentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  DocumentName: '',
  IsMaster: 0,
  DocumentURL: null,
  RemoveDocumentURL: '',
  DocumentRemark: ''
});

const BuildingDocument: React.FC = () => {

  //#region STATE
  const [buildingDocumentList, setBuildingDocumentList] = useState<BuildingDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [expandHeaderDocumentName, setExpandHeaderDocumentName] = useState<string>('');
  const [expandHeaderBuildingDocumentId, setExpandHeaderBuildingDocumentId] = useState<number>(0);

  //SET AND REMOVE URL FILE
  const [buildingDocumentFiles, setBuildingDocumentFiles] = useState<(File | string)[]>([]);
  const [RemoveBuildingDocumentUrls, setRemoveBuildingDocumentUrls] = useState<string[]>([]);
  const [buildingDocumentURL, setBuildingDocumentURL] = useState<string>();

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

  //DATATABLE EXPANDABLE REF
  const dtRef = useRef<DataTableExpandableRef | null>(null)

  //DATATABLE EXPANDED ROW AND PARENT ID

  const [expandedParentRow, setExpandedParentRow] = useState<any>(null);


  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ADD EDIT UPDATE DOCUMENT
  const [editingDocumentData, setEditingDocumentData] = useState<BuildingDocumentData | null>(null);

  const [isAddUpdateDocumentModalOpen, setIsAddUpdateDocumentModalOpen] = useState(false);

  // ADD EDIT UPDATE DOCUMENT DETAILS
  const [isAddUpdateDocumentDetailsModalOpen, setIsAddUpdateDocumentDetailsModalOpen] = useState(false);

  //DELETE BUILDING DOCUMENT STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteBuildingDocumentDetailsData, setDeleteBuildingDocumentDetailsData] = useState<BuildingDocumentData | null>(null)

  //ADD UPDATE BUILDING DOCUMENT
  const [formData, setFormData] = useState<AddUpdateBuildingDocumentRequest>(() => initialFormState());
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions();
  //#endregion

  //#region NAVIGATION
  const navigate = useNavigate();
  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region BUILDING LIST STATE CONTEXT
  const { listState } = useBuildingListState();
  const { buildingId, buildingName } = listState;
  //#endregion

  //#region INIT

  useEffect(() => {
    if (!buildingId || !projectId) return;
    fetchBuildingDocumentList();
  }, [buildingId, projectId])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateDocumentModalOpen || isAddUpdateDocumentDetailsModalOpen) {
      if (editingDocumentData) {
        setFormData({
          BuildingDocumentId: editingDocumentData.BuildingDocumentId,
          Uniquekey: editingDocumentData.Uniquekey || initialFormState().Uniquekey,
          DocumentName: editingDocumentData.DocumentName || '',
          BuildingId: Number(buildingId),
          ProjectId: Number(projectId),
          IsMaster: 0,
          DocumentRemark: editingDocumentData.DocumentRemark,

        });

        setBuildingDocumentFiles([]);
        setBuildingDocumentURL(editingDocumentData.DocumentURL || '')
        setRemoveBuildingDocumentUrls([]);


      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateDocumentModalOpen, isAddUpdateDocumentDetailsModalOpen, editingDocumentData, buildingId, projectId]);

  //#endregion

  //#region DATA LOAD
  const fetchBuildingDocumentList = async (page: number = pagination.currentPage) => {
    return await loadBuildingDocument(page, filters);
  };

  const loadBuildingDocument = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = buildingDocumentColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }
        const params: FilterWithPaginationBuildingDocumentRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectId: Number(projectId),
          BuildingId: Number(buildingId),
          BuildingDocumentId: Number(filterParams.BuildingDocumentId) ?? undefined,
          DocumentName: filterParams.DocumentName,
          SortBy: sortByParam
        };

        const response = await buildingService.apiCallPullBuildingDocument(params);

        if (E.isRight(response)) {

          setBuildingDocumentList(response.right.Data);

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
      'Loading Building Document'
    );
  };
  //#endregion

  //#region SERACH Document 
  const searchDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchBuildingDocumentList();

      return
    }

    const filterParams: FilterInfo = {
      DocumentName: searchValue.trim(),
    };

    await loadBuildingDocument(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH Document 
  const clearsearchDocumnets = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchBuildingDocumentList();
  }

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = useCallback((page: number) => {
    fetchBuildingDocumentList(page);
  }, [fetchBuildingDocumentList]);

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchBuildingDocumentList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const buildingDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const buildingDocumentListForTable = useMemo(() => buildingDocumentList, [buildingDocumentList]);

  //#endregion

  //#region EDIT BUILDING DOCUMENT
  const handleEditBuildingDocument = useCallback((row: BuildingDocumentData) => {
    setEditingDocumentData({
      ...row,
      DocumentName: row.DocumentName || ''
    })
    setIsAddUpdateDocumentModalOpen(true);

  }, [])

  //#endregion

  //#region EDIT BUILDING DOCUMENT DETAILS
  const handleEditBuildingDocumentDetails = useCallback((row: BuildingDocumentData) => {
    setEditingDocumentData({
      ...row,
      DocumentName: row.DocumentName || '',
      DocumentRemark: row.DocumentRemark || '',
    })
    setIsAddUpdateDocumentDetailsModalOpen(true);

  }, [])

  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: BuildingDocumentData) => {
    setDeleteBuildingDocumentDetailsData({
      ...row,
      IsMaster: row.IsMaster
    })

    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region ADD DOCUMENT DETAILS MODAL
  const handleAddDocumentDetailsModal = useCallback((row: BuildingDocumentData) => {
    setExpandHeaderDocumentName(row.DocumentName ?? "");
    setExpandHeaderBuildingDocumentId(row.BuildingDocumentId);

    setBuildingDocumentFiles([]);
    setBuildingDocumentURL('')
    setRemoveBuildingDocumentUrls([]);

    setEditingDocumentData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateDocumentDetailsModalOpen(true);
  }, [])
  //#endregion

  //#region TABLE COLUMN

  const buildingDocumentColumns = useMemo<TableColumn[]>(
    () => [

      {
        key: 'DocumentName',
        label: 'Document Name',
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
        }

      },
      {
        key: 'UploadedBuildingDocumentCount',
        label: 'Document Count',
        width: '30',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row) => {
          const showEdit = canAction ? true : false;
          const showDelete = canAction ? (row.UploadedBuildingDocumentCount || 0) === 0 : false;

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
                      handleEditBuildingDocument(row)
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
    [canAction, handleEditBuildingDocument, handleConfirmationDialogBoxOpen, handleAddDocumentDetailsModal]
  )
  //#endregion



  //#region TABLE COLUMN DOCUMENT DETAILS

  const buildingDocumentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'DocumentName',
        label: 'Document Version',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value: string, row: any) => {
          return (
            <div className="flex items-center justify-between w-full">

              <div className="truncate max-w-[400px]">
                <MultiImageViewer
                  images={parseDocumentUrls(row.DocumentURL)}
                  title="Document"
                  triggerLabel={value || '-'}
                />
              </div>
            </div>
          );
        }
      },
      {
        key: 'DocumentRemark',
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
        align: 'left',
        fixed: 'right',
        render: (_value, row) => {
          const showEdit = canAction ? true : false;
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
                      handleEditBuildingDocumentDetails(row);
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
    [canAction, handleEditBuildingDocument]
  )
  //#endregion

  //#region ADD UPDATE EDIT DOCUMENT

  const handleFieldChange = (field: keyof AddUpdateBuildingDocumentRequest, value: any) => {

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

    if (formData.DocumentName?.trim() === '') {

      newErrors.DocumentName = "Document Name is required"
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

    if (!hasAnyDocumentFile(buildingDocumentFiles, buildingDocumentURL, RemoveBuildingDocumentUrls)) {
      newErrors.BuildingDocumentURL = "File is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushDocumentFormData = (): FormData => {


    const fd = new FormData();

    fd.append('BuildingDocumentId', String(formData.BuildingDocumentId ?? 0)),
      fd.append('Uniquekey', formData.Uniquekey ?? ''),
      fd.append('DocumentName', formData.DocumentName ?? ''),
      fd.append('BuildingId', String(buildingId)),
      fd.append('ProjectId', String(projectId)),
      fd.append('IsMaster', String(1))

    return fd;

  };

  const PushDocumentDetailsFormData = (): FormData => {


    const fd = new FormData();

    fd.append('BuildingDocumentId', editingDocumentData ? String(formData.BuildingDocumentId) : String(expandHeaderBuildingDocumentId ?? 0)),
      fd.append('Uniquekey', formData.Uniquekey ?? ''),
      fd.append('DocumentName', expandHeaderDocumentName ?? ""),
      fd.append('BuildingId', String(buildingId)),
      fd.append('ProjectId', String(projectId)),
      fd.append('DocumentRemark', formData.DocumentRemark ?? ''),
      fd.append('IsMaster', String(0)),

      buildingDocumentFiles.forEach(file => {
        if (file instanceof File) {
          fd.append('DocumentURL', file);
        }
      });

    fd.append('RemoveDocumentURL', RemoveBuildingDocumentUrls.join(','));


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

        const response = await buildingService.apiCallAddUpdateBuildingDocument(payload);

        if (E.isRight(response)) {

          ismaster === 1 ? setIsAddUpdateDocumentModalOpen(false) : setIsAddUpdateDocumentDetailsModalOpen(false);

          const isAdd = formData.BuildingDocumentId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as BuildingDocumentData

            if (ismaster === 1) {

              setBuildingDocumentList(prevData => [newRecord, ...prevData]);

              setPagination({
                currentPage: pagination.currentPage,
                totalRecords: pagination.totalRecords + 1,
                totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
              });
            }

            else {

              const parentId = expandedParentRow?.BuildingDocumentId;

              await fetchBuildingDocumentList(pagination.currentPage);

              if (parentId) {
                dtRef.current?.expandRow?.(
                  String(parentId),
                  expandedParentRow
                );
              }
            }

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as BuildingDocumentData;

            if (ismaster === 1) {

              setBuildingDocumentList(prevData =>
                prevData.map(item =>
                  item.BuildingDocumentId === formData.BuildingDocumentId
                    ? updatedRecord
                    : item
                )
              )
            }

            else {

              const parentId = expandedParentRow?.BuildingDocumentId;

              await fetchBuildingDocumentList(pagination.currentPage);

              if (parentId) {
                dtRef.current?.expandRow?.(
                  String(parentId),
                  expandedParentRow
                );
              }
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

      Number(formData.BuildingDocumentId) === 0 ? 'Add Document' : 'Update Document'
    )

  };

  //#endregion

  //#region DELETE DOCUMENT
  const handleDeleteDocument = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteBuildingDocumentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: DeleteBuildingDocumentRequest = {
          BuildingDocumentId: deleteBuildingDocumentDetailsData.BuildingDocumentId,
          BuildingId: Number(buildingId),
          ProjectId: Number(projectId),
          UniqueKey: deleteBuildingDocumentDetailsData.Uniquekey ?? '',
        };

        const response = await buildingService.apiCallDeleteBuildingDocument(params);

        if (E.isRight(response)) {

          // 👇 CASE-1: MASTER DOCUMENT DELETE
          if (deleteBuildingDocumentDetailsData.IsMaster === 1) {

            setBuildingDocumentList(prev =>
              prev.filter(x =>
                x.BuildingDocumentId !== deleteBuildingDocumentDetailsData.BuildingDocumentId
              )
            );

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords - 1,
              totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
            });
          }


          else {

            const parentId = expandedParentRow.BuildingDocumentId;

            await fetchBuildingDocumentList(pagination.currentPage);

            if (parentId) {
              dtRef.current?.expandRow?.(
                String(parentId),
                expandedParentRow
              );
            }

          }

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setDeleteBuildingDocumentDetailsData(null);
          setIsConfirmationDialogBoxOpen(false);
        }
        else {
          addToast({ type: 'error', title: response.left.message });
          setIsConfirmationDialogBoxOpen(false);
        }
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Delete Document'
    );
  };

  //#endregion

  //#region BACK BUILDING PAGE
  const handleBackToListBuilding = () => {
    navigate('/building');
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="flex items-center gap-3 mb-6 border-b border-gray-500 pb-3">

        <HeaderActionBar
          titleText={"Building Name : "}
          subTitleText={buildingName}
          cancelText="Cancel"
          EditText=""
          onCancel={() => handleBackToListBuilding()}
          canAction={false}
          isLoading={isLoading}
        />
      </div>

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
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddDocumentModal}

        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={false}
        exportLoading={isLoading}
      />


      <DataTableExpandable
        ref={dtRef}
        data={buildingDocumentListForTable}
        columns={buildingDocumentColumns}
        pagination={buildingDocumentPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        emptyMessage='No Document Data Found'
        loading={isLoading}
        fixedHeight
        recordsPerPage={20}

        expandable={{

          keyField: 'BuildingDocumentId',

          alwaysFetchOnOpen: true,

          fetchRow: async (row) => {

            setExpandedParentRow(row);

            const params: FilterWithPaginationBuildingDocumentRequest = {
              PageNumber: 1,
              PageSize: pagination.pageSize,
              IsCheckPermission: true,
              ProjectId: Number(projectId),
              BuildingId: Number(buildingId),
              BuildingDocumentId: Number(row.BuildingDocumentId),
              DocumentName: row.DocumentName,
            };


            const response = await buildingService.apiCallPullBuildingDocument(params);

            if (E.isRight(response)) {

              return response.right.Data ?? [];
            }
            return [];

          },


          renderRow: (fetchedData) => {

            const details: BuildingDocumentData[] = Array.isArray(fetchedData) ? fetchedData : (fetchedData ? [fetchedData] : []);

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
                columns={buildingDocumentDetailsColumns}
                emptyMessage="No Building Documents Data Found"
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
        saveText={editingDocumentData ? 'Update Document' : 'Save Document'}
        resetText='Reset'
        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              <Input
                label='Document Name'
                required
                error={errors.DocumentName}
                type="text"
                value={formData.DocumentName ?? ""}
                maxLength={250}
                onChange={(e) => handleFieldChange('DocumentName', e.target.value)}
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
                  disabled
                  type="text"
                  value={formData.DocumentName ?? ""}
                  maxLength={250}
                  placeholder="Enter Document"
                />
                : ""}

            </div>

            <div>
              <MultiFilePicker
                label="Files"
                placeholder='Select Files'
                required
                value={buildingDocumentFiles}
                onChange={setBuildingDocumentFiles}
                availableFilesURL={buildingDocumentURL ?? ""}
                error={errors.BuildingDocumentURL}
                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => {
                  setRemoveBuildingDocumentUrls((prev) => [...prev, url])
                }}
              />
            </div>
            <div>
              <Input
                label='Remark'

                type="text"
                value={formData.DocumentRemark ?? ""}
                maxLength={250}
                onChange={(e) => handleFieldChange('DocumentRemark', e.target.value)}
                placeholder="Enter Remarks"
              />

            </div>

          </div>
        </div>

      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteBuildingDocumentDetailsData(null)
        }}
        onConfirm={handleDeleteDocument}
        loading={isLoading}
        pageName='document'
      />

    </div>
  );
};

export default BuildingDocument;
