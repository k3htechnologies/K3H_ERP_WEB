import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateTenantDocumentRequest,
  DeleteTenantDocumentRequest,
  TenantDocumentData,
  FilterWithPaginationTenantDocumentRequest
} from '@/features/tenant/models/TenantModel';

import { tenantService } from '@/features/tenant/services/TenantService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Edit, Trash2, } from 'lucide-react';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { updateFilter } from '@/core/utils/filterHelper';
import { useNavigate } from 'react-router-dom';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useTenantListState } from '@/features/tenant/context/TenantListStateContext';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';


const initialFormState = (): AddUpdateTenantDocumentRequest => ({
  TenantDocumentId: null,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  TenantId: null,
  BuildingId: 0,
  ProjectId: 0,
  DocumentName: null,
  DocumentURL: null,
  RemoveDocumentURL: ''
});

export const TenantDocument: React.FC = () => {

  //#region STATE MANAGEMENT
  const [tenantDocumentList, setTenantDocumentList] = useState<TenantDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchTenantDocuments(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT TENANT DOCUMENT
  const [editingTenantDocumentData, setEditingTenantDocumentData] = useState<TenantDocumentData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);


  //ADD UPDATE TENANT DOCUMENT
  const [formData, setFormData] = useState<AddUpdateTenantDocumentRequest>(() => initialFormState());

  //DELETE TENANT DOCUMENT STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteTenantDocumentDetailsData, setDeleteTenantDocumentDetailsData] = useState<TenantDocumentData | null>(null)

  //FILE STATES
  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>();

  // NAVIGATION
  const navigate = useNavigate();
  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region TENANT LIST STATE CONTEXT
  const { listState } = useTenantListState();
  const { tenantId, buildingId, tenantName, buildingName } = listState;
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!projectId || !buildingId || !tenantId) return;
    fetchTenantDocumentList();
  }, [projectId, buildingId, tenantId])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingTenantDocumentData) {
        setFormData({
          TenantDocumentId: editingTenantDocumentData.TenantDocumentId,
          Uniquekey: editingTenantDocumentData.Uniquekey || initialFormState().Uniquekey,
          TenantId: editingTenantDocumentData.TenantId,
          BuildingId: editingTenantDocumentData.BuildingId,
          ProjectId: editingTenantDocumentData.ProjectId,
          DocumentName: editingTenantDocumentData.DocumentName || null,
          DocumentURL: null,
          RemoveDocumentURL: ''
        });
        setDocumentFiles([]);
        setDocumentURL(editingTenantDocumentData.DocumentURL || '');
        setRemovedDocumentURLs([]);
      } else {
        setFormData({
          ...initialFormState(),
          TenantId: tenantId,
          BuildingId: buildingId,
          ProjectId: Number(projectId)
        });
        setDocumentFiles([]);
        setDocumentURL('');
        setRemovedDocumentURLs([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingTenantDocumentData, tenantId, buildingId, projectId]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchTenantDocumentList = async (page: number = pagination.currentPage) => {
    return await loadTenantDocuments(page, filters);
  }

  const loadTenantDocuments = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = tenantDocumentColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationTenantDocumentRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectId: Number(projectId),
          BuildingId: buildingId,
          TenantId: tenantId,
          TenantDocumentId: filterParams.TenantDocumentId ? Number(filterParams.TenantDocumentId) : undefined,
          DocumentName: filterParams.DocumentName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await tenantService.apiCallPullTenantDocument(params);

        if (E.isRight(response)) {

          setTenantDocumentList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Tenant Document'
    )
  }
  //#endregion

  //#region SERACH TENANT DOCUMENT 
  const searchTenantDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchTenantDocumentList();

      return
    }

    const filterParams: FilterInfo = {
      DocumentName: searchValue.trim(),
    };

    await loadTenantDocuments(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH TENANT DOCUMENT 
  const clearsearchTenantDocuments = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchTenantDocumentList();
  }

  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportTenantDocuments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {

          const column = tenantDocumentColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTenantDocumentRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectId: projectId || undefined,
          BuildingId: buildingId || undefined,
          TenantId: tenantId || undefined,
          DocumentName: filters.DocumentName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await tenantService.apiCallPullTenantDocument(params);

        handleExportFile(response, exportType, 'Tenant Document', addToast)

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export'
    )
  }

  const handleExportTenantDocumentExcel = () => handleExportTenantDocuments('Excel')
  const handleExportTenantDocumentPdf = () => handleExportTenantDocuments('PDF')

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchTenantDocumentList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchTenantDocumentList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const tenantDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const tenantDocumentListForTable = useMemo(() => tenantDocumentList, [tenantDocumentList]);
  //#endregion

  //#region EDIT TENANT DOCUMENT

  const handleEditTenantDocument = useCallback((row: TenantDocumentData) => {
    setEditingTenantDocumentData({
      ...row,
      DocumentName: row.DocumentName || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])


  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: TenantDocumentData) => {
    setDeleteTenantDocumentDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const tenantDocumentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'DocumentName',
        label: 'Document Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>

            <TooltipText
              text={value || '-'}
              maxWidth="500px"
              tooltipThreshold={100}
            />

            <div className="flex justify-between items-center">

              {canAction && (
                <>
                  <Button
                    color='transparent'
                    size='sm'
                    style={{
                      color: '#0B3251',
                      padding: '0px 8px'
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsAddUpdateModalOpen(false)
                      handleEditTenantDocument(row)
                    }}
                    leftIcon={<Edit className="h-4 w-4" />}
                  >
                  </Button>


                  <Button
                    color='transparent'
                    size='sm'
                    style={{
                      color: 'red',
                      padding: '0px 8px'
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsAddUpdateModalOpen(false)

                      handleConfirmationDialogBoxOpen(row)
                    }}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                  </Button>
                </>
              )}
            </div>

          </div>
        )
      },
      {
        key: 'DocumentURL',
        label: 'Document',
        width: '20',
        sortable: false,
        align: 'center',
        render: (value: string) => {
          const urls = parseDocumentUrls(value);
          if (urls.length === 0) return '-';
          return (
            <MultiImageViewer
              images={urls}
              title="Tenant Document"
              triggerLabel={`View (${urls.length})`}
            />
          );
        }

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
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleEditTenantDocument, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadTenantDocuments(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region Clear 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadTenantDocuments(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT TENANT DOCUMENT

  const handleFieldChange = (field: keyof AddUpdateTenantDocumentRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddTenantDocumentModal = () => {
    setEditingTenantDocumentData(null);
    setFormData({
      ...initialFormState(),
      TenantId: tenantId,
      BuildingId: buildingId,
      ProjectId: Number(projectId)
    });
    setErrors({});
    setDocumentFiles([]);
    setDocumentURL('');
    setRemovedDocumentURLs([]);
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddTenantDocumentForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.DocumentName || formData.DocumentName.trim() === "") {

      newErrors.DocumentName = "Document Name is required"
    }
    else if (formData.DocumentName.trim().length < 3) {
      newErrors.DocumentName = "Document Name must be at least 3 characters long"
    }


    if (!hasAnyDocumentFile(documentFiles, documentURL, removedDocumentURLs)) {
      newErrors.DocumentURL = "File is required.";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushTenantDocumentFormData = (): FormData => {
    const fd = new FormData();
    fd.append('TenantDocumentId', String(formData.TenantDocumentId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey ?? '');
    fd.append('TenantId', String(tenantId));
    fd.append('BuildingId', String(buildingId));
    fd.append('ProjectId', String(projectId));
    fd.append('DocumentName', formData.DocumentName ?? '');

    documentFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('DocumentURL', file);
      }
    });

    const existingNames = documentFiles
      .filter(x => typeof x === 'string' && String(x).trim().length > 0)
      .map(x => String(x).trim())
      .join(',');

    if (existingNames) {
      fd.append('DocumentURL', existingNames);
    }

    fd.append('RemoveDocumentURL', removedDocumentURLs.join(','));

    return fd;
  };

  const handleAddUpdateTenantDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddTenantDocumentForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushTenantDocumentFormData();

        const response = await tenantService.apiCallAddUpdateTenantDocument(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.TenantDocumentId === null || formData.TenantDocumentId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as TenantDocumentData

            setTenantDocumentList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as TenantDocumentData;

            setTenantDocumentList(prevData =>
              prevData.map(item =>
                item.TenantDocumentId === formData.TenantDocumentId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingTenantDocumentData(null);
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
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

      formData.TenantDocumentId === null || formData.TenantDocumentId === 0 ? 'Add Tenant Document' : 'Update Tenant Document'
    )

  };

  //#endregion

  //#region DELETE TENANT DOCUMENT
  const handleDeleteTenantDocument = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteTenantDocumentDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteTenantDocumentRequest = {
          TenantDocumentId: deleteTenantDocumentDetailsData.TenantDocumentId,
          Uniquekey: deleteTenantDocumentDetailsData.Uniquekey || '',
          TenantId: deleteTenantDocumentDetailsData.TenantId,
          BuildingId: deleteTenantDocumentDetailsData.BuildingId,
          ProjectId: deleteTenantDocumentDetailsData.ProjectId
        }

        const response = await tenantService.apiCallDeleteTenantDocument(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (tenantDocumentList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadTenantDocuments(pageToShow, filters);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteTenantDocumentDetailsData(null);

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
      'Delete Tenant Document'
    )
  }

  //#endregion

  //#region BACK TENANT PAGE
  const handleBackToListTenant = () => {
    navigate('/tenant');
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}


      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Document Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchTenantDocuments}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        isShowCustomizeButton={false}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddTenantDocumentModal}

        // IMPORT
        isShowImportButton={false}

        // EXPORT
        isShowExportButton={false}
        onExportExcel={handleExportTenantDocumentExcel}
        onExportPdf={handleExportTenantDocumentPdf}
        exportLoading={isLoading}
      />

      <div className="flex items-center gap-3 mb-6 border-b border-gray-500 pb-3">

        <HeaderActionBar
          titleText={"Tenant Document : "}
          subTitleText={buildingName}
          subSubTitleText={tenantName}
          cancelText="Cancel"
          EditText=""
          onCancel={() => handleBackToListTenant()}
          canAction={false}
          isLoading={isLoading}
        />
      </div>



      {/* DATA TABLE TENANT DOCUMENT */}
      <DataTable
        data={tenantDocumentListForTable}
        columns={tenantDocumentColumns}
        pagination={tenantDocumentPaginationInfo}
        emptyMessage="No Tenant Documents Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />


      {/*  ADD EDIT UPDATE TENANT DOCUMENT MODAL */}
      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingTenantDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingTenantDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        title={editingTenantDocumentData ? 'Update Tenant Document' : 'Add Tenant Document'}
        onSubmit={handleAddUpdateTenantDocument}
        saveText={'Add'}

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
                value={formData.DocumentName || ''}
                maxLength={100}
                onChange={(e) => handleFieldChange('DocumentName', e.target.value)}
                placeholder="Enter Document Name"
              />

            </div>

            <div>
              <MultiFilePicker
                label="Files"
                placeholder="Select Files"
                required
                error={errors.DocumentURL}
                value={documentFiles}
                onChange={setDocumentFiles}
                availableFilesURL={documentURL ?? ""}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => {
                  setRemovedDocumentURLs((prev) => [...prev, url])
                }}
              />
            </div>
          </div>
        </div>

      </Modal>

      {/* FILTER TENANT DOCUMENT MODAL */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Tenant Document"
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
        saveText="Apply "
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label='Document Name'
                type="text"
                value={tempFilters.DocumentName || ''}
                onChange={(e) => handleFilterChange('DocumentName', e.target.value)}
                placeholder="Enter document name"
              />
            </div>
          </div>
        </div>
      </Modal>


      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteTenantDocumentDetailsData(null)
        }}
        onConfirm={handleDeleteTenantDocument}
        loading={isLoading}
        pageName='tenant document'
      />


    </div>
  )
}

export default TenantDocument
