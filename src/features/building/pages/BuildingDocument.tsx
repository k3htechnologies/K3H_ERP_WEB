import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateBuildingDocumentRequest,
  DeleteBuildingDocumentRequest,
  BuildingDocumentData,
  FilterWithPaginationBuildingDocumentRequest
} from '@/features/building/models/BuildingModel';

import { buildingService } from '@/features/building/services/BuildingService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { ArrowLeft, Edit, Trash2, } from 'lucide-react';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { updateFilter } from '@/core/utils/filterHelper';
import { useLocation, useNavigate } from 'react-router-dom';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';


const initialFormState = (): AddUpdateBuildingDocumentRequest => ({
  BuildingDocumentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  DocumentName: '',
  DocumentURL: null,
  RemoveDocumentURL: null
});

export const BuildingDocument: React.FC = () => {

  //#region STATE MANAGEMENT
  const [buildingDocumentList, setBuildingDocumentList] = useState<BuildingDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchBuildingDocuments(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT BUILDING DOCUMENT
  const [editingBuildingDocumentData, setEditingBuildingDocumentData] = useState<BuildingDocumentData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);


  //ADD UPDATE BUILDING DOCUMENT
  const [formData, setFormData] = useState<AddUpdateBuildingDocumentRequest>(() => initialFormState());

  //DELETE BUILDING DOCUMENT STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteBuildingDocumentDetailsData, setDeleteBuildingDocumentDetailsData] = useState<BuildingDocumentData | null>(null)

  //FILE STATES
  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>();

  // NAVIGATION
  const navigate = useNavigate();

  //LOCATION STATE
  const location = useLocation() as {
    state?: {
      listState?: {
        page?: number;
        filters?: any;
        sortInfo?: any;
        searchTerm?: string;
        buildingId?: number;
        projectId?: number;
        buildingName?: string;
      };
    };
  };
  const preservedListState = location.state?.listState;
  const buildingId = preservedListState?.buildingId || 0;
  const projectId = preservedListState?.projectId || 0;
  const buildingName = preservedListState?.buildingName || 0;

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions('/building');
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialBuildingDocuments = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialBuildingDocuments.current) return

    hasFetchedInitialBuildingDocuments.current = true;

    fetchBuildingDocumentList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingBuildingDocumentData) {
        setFormData({
          BuildingDocumentId: editingBuildingDocumentData.BuildingDocumentId,
          Uniquekey: editingBuildingDocumentData.Uniquekey || initialFormState().Uniquekey,
          BuildingId: editingBuildingDocumentData.BuildingId,
          ProjectId: editingBuildingDocumentData.ProjectId,
          DocumentName: editingBuildingDocumentData.DocumentName || '',
          DocumentURL: null,
          RemoveDocumentURL: null
        });
        setDocumentFiles([]);
        setDocumentURL(editingBuildingDocumentData.DocumentURL || '');
        setRemovedDocumentURLs([]);
      } else {
        setFormData({
          ...initialFormState(),
          BuildingId: buildingId,
          ProjectId: projectId
        });
        setDocumentFiles([]);
        setDocumentURL('');
        setRemovedDocumentURLs([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingBuildingDocumentData, buildingId, projectId]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchBuildingDocumentList = async (page: number = pagination.currentPage) => {
    return await loadBuildingDocuments(page, filters);
  }

  const loadBuildingDocuments = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = buildingDocumentColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationBuildingDocumentRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectId: projectId,
          BuildingId: buildingId,
          BuildingDocumentId: filterParams.BuildingDocumentId ? Number(filterParams.BuildingDocumentId) : undefined,
          DocumentName: filterParams.DocumentName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getBuildingDocuments(params);

        if (E.isRight(response)) {

          setBuildingDocumentList(response.right.Data);

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
      'Loading Building Document'
    )
  }
  //#endregion

  //#region SERACH BUILDING DOCUMENT 
  const searchBuildingDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchBuildingDocumentList();

      return
    }

    const filterParams: FilterInfo = {
      DocumentName: searchValue.trim(),
    };

    await loadBuildingDocuments(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH BUILDING DOCUMENT 
  const clearsearchBuildingDocuments = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchBuildingDocumentList();
  }

  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportBuildingDocuments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = buildingDocumentColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationBuildingDocumentRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectId: projectId || undefined,
          BuildingId: buildingId || undefined,
          DocumentName: filters.DocumentName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getBuildingDocuments(params);

        handleExportFile(response, exportType, 'Building Document', addToast)

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

  const handleExportBuildingDocumentExcel = () => handleExportBuildingDocuments('Excel')
  const handleExportBuildingDocumentPdf = () => handleExportBuildingDocuments('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET BUILDING DOCUMENT 

  const getBuildingDocuments = async (filterParams: FilterWithPaginationBuildingDocumentRequest) => {

    return await buildingService.apiCallPullBuildingDocument(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchBuildingDocumentList(page);
  };

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
    setEditingBuildingDocumentData({
      ...row,
      DocumentName: row.DocumentName || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])


  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: BuildingDocumentData) => {
    setDeleteBuildingDocumentDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
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
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>

            <TooltipText
              text={value || 'N/A'}
              maxWidth="300px"
              tooltipThreshold={40}
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
                      handleConfirmationDialogBoxOpen(row)
                    }}
                    leftIcon={<Trash2 className="h-4 w-4" />}
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
                      handleEditBuildingDocument(row)
                    }}
                    leftIcon={<Edit className="h-4 w-4" />}
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
              title="Building Document"
              triggerLabel={`View (${urls.length})`}
            />
          );
        }

      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '33',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '33',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleEditBuildingDocument, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadBuildingDocuments(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadBuildingDocuments(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT BUILDING DOCUMENT

  const handleFieldChange = (field: keyof AddUpdateBuildingDocumentRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddBuildingDocumentModal = () => {
    setEditingBuildingDocumentData(null);
    setFormData({
      ...initialFormState(),
      BuildingId: buildingId,
      ProjectId: projectId
    });
    setErrors({});
    setDocumentFiles([]);
    setDocumentURL('');
    setRemovedDocumentURLs([]);
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddBuildingDocumentForm = (): {

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

    if (!documentFiles.length && !documentURL) {
      newErrors.DocumentURL = "Document file is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushBuildingDocumentFormData = (): FormData => {
    const fd = new FormData();
    fd.append('BuildingDocumentId', String(formData.BuildingDocumentId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey ?? '');
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

  const handleAddUpdateBuildingDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddBuildingDocumentForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushBuildingDocumentFormData();

        const response = await buildingService.apiCallAddUpdateBuildingDocument(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.BuildingDocumentId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as BuildingDocumentData

            setBuildingDocumentList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as BuildingDocumentData;

            setBuildingDocumentList(prevData =>
              prevData.map(item =>
                item.BuildingDocumentId === formData.BuildingDocumentId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingBuildingDocumentData(null);
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

      Number(formData.BuildingDocumentId) === 0 ? 'Add Building Document' : 'Update Building Document'
    )

  };

  //#endregion

  //#region DELETE BUILDING DOCUMENT
  const handleDeleteBuildingDocument = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteBuildingDocumentDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteBuildingDocumentRequest = {
          BuildingDocumentId: deleteBuildingDocumentDetailsData.BuildingDocumentId,
          UniqueKey: deleteBuildingDocumentDetailsData.Uniquekey || '',
          BuildingId: deleteBuildingDocumentDetailsData.BuildingId,
          ProjectId: deleteBuildingDocumentDetailsData.ProjectId
        }

        const response = await buildingService.apiCallDeleteBuildingDocument(params);

        if (E.isRight(response)) {

          setBuildingDocumentList(prevData => prevData.filter(item => item.BuildingDocumentId !== deleteBuildingDocumentDetailsData.BuildingDocumentId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteBuildingDocumentDetailsData(null);

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
      'Delete Building Document'
    )
  }

  //#endregion

  //#region BACK PROJECT PAGE
  //#region BACK PROJECT PAGE
  const handleBackToListBuilding = () => {
    navigate('/building', {
      state: {
        listState: preservedListState ?? {
          page: 1,
          filters: {},
          sortInfo: undefined,
          searchTerm: '',
          buildingId,
          projectId,
          buildingName
        }
      }
    });
  };
  //#endregion

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
        onClearSearch={clearsearchBuildingDocuments}
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
        onAdd={handleAddBuildingDocumentModal}

        // IMPORT
        isShowImportButton={false}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportBuildingDocumentExcel}
        onExportPdf={handleExportBuildingDocumentPdf}
        exportLoading={isLoading}
      />

      <div className="flex items-center gap-3 mb-6 border-b border-gray-300 pb-3">
        <Button
          onClick={handleBackToListBuilding}
          color="cancel"
          type="button"
          size="sm"
          className="hover:bg-gray-100 rounded-md"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>

        <h1 className="text-lg font-semibold text-gray-800">
          Building Name: <span className="text-blue-700">{buildingName}</span>
        </h1>
      </div>


      {/* DATA TABLE BUILDING DOCUMENT */}
      <DataTable
        data={buildingDocumentListForTable}
        columns={buildingDocumentColumns}
        pagination={buildingDocumentPaginationInfo}
        emptyMessage="No Building Documents Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />


      {/*  ADD EDIT UPDATE BUILDING DOCUMENT MODAL */}
      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingBuildingDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingBuildingDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        title={editingBuildingDocumentData ? 'Update Building Document' : 'Add Building Document'}
        onSubmit={handleAddUpdateBuildingDocument}
        saveText={'Save'}
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
                value={formData.DocumentName || ''}
                maxLength={100}
                onChange={(e) => handleFieldChange('DocumentName', e.target.value)}
                placeholder="Enter Document Name"
              />

            </div>

            <div>
              <MultiFilePicker
                label="Document"
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

      {/* FILTER BUILDING DOCUMENT MODAL */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Building Document"
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
        saveText="Apply Filter"
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

      {/* DELETE CONFIRMATION BUILDING DOCUMENT MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteBuildingDocumentDetailsData(null)
        }}
        onConfirm={handleDeleteBuildingDocument}
        title="You are about to delete a building document?"
        message="Deleting this building document will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />


    </div>
  )
}

export default BuildingDocument