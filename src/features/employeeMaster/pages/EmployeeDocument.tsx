import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateEmployeeDocumentRequest,
  DeleteEmployeeDocumentRequest,
  EmployeeDocumentData,
  FilterWithPaginationEmployeeDocumentRequest
} from '@/features/employeeMaster/models/EmployeeDocumentModel';

import { employeeDocumentService } from '@/features/employeeMaster/services/EmployeeDocumentService'
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
import { useEmployeeListState } from '@/features/employeeMaster/context/EmployeeListStateContext';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';


const initialFormState = (): AddUpdateEmployeeDocumentRequest => ({
  EmployeeDocumentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  EmployeeId: 0,
  DocumentName: '',
  DocumentURL: null,
  RemoveDocumentURL: null
});

export const EmployeeDocument: React.FC = () => {

  //#region STATE MANAGEMENT
  const [employeeDocumentList, setEmployeeDocumentList] = useState<EmployeeDocumentData[]>([]);
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
    searchEmployeeDocuments(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT EMPLOYEE DOCUMENT
  const [editingEmployeeDocumentData, setEditingEmployeeDocumentData] = useState<EmployeeDocumentData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);


  //ADD UPDATE EMPLOYEE DOCUMENT
  const [formData, setFormData] = useState<AddUpdateEmployeeDocumentRequest>(() => initialFormState());

  //DELETE EMPLOYEE DOCUMENT STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteEmployeeDocumentDetailsData, setDeleteEmployeeDocumentDetailsData] = useState<EmployeeDocumentData | null>(null)

  //FILE STATES
  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>();

  // NAVIGATION
  const navigate = useNavigate();

  const { listState } = useEmployeeListState();
  const employeeName = listState.employeeName || '';
  const employeeId = listState.employeeId || 0;

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions('/employeeMaster');
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialEmployeeDocuments = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialEmployeeDocuments.current) return

    hasFetchedInitialEmployeeDocuments.current = true;

    fetchEmployeeDocumentList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingEmployeeDocumentData) {
        setFormData({
          EmployeeDocumentId: editingEmployeeDocumentData.EmployeeDocumentId,
          Uniquekey: editingEmployeeDocumentData.Uniquekey || initialFormState().Uniquekey,
          EmployeeId: editingEmployeeDocumentData.EmployeeId,
          DocumentName: editingEmployeeDocumentData.DocumentName || '',
          DocumentURL: null,
          RemoveDocumentURL: null
        });
        setDocumentFiles([]);
        setDocumentURL(editingEmployeeDocumentData.DocumentURL || '');
        setRemovedDocumentURLs([]);
      } else {
        setFormData({
          ...initialFormState(),
          EmployeeId: employeeId
        });
        setDocumentFiles([]);
        setDocumentURL('');
        setRemovedDocumentURLs([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingEmployeeDocumentData, employeeId]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchEmployeeDocumentList = async (page: number = pagination.currentPage) => {
    return await loadEmployeeDocuments(page, filters);
  }

  const loadEmployeeDocuments = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const params: FilterWithPaginationEmployeeDocumentRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          EmployeeId: employeeId,
          EmployeeDocumentId: filterParams.EmployeeDocumentId ? Number(filterParams.EmployeeDocumentId) : undefined,
          DocumentName: searchtext ?? filterParams.DocumentName?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, employeeDocumentColumns)
        }

        const response = await getEmployeeDocuments(params);

        if (E.isRight(response)) {

          setEmployeeDocumentList(response.right.Data);

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
      'Loading Employee Document'
    )
  }
  //#endregion

  //#region SERACH EMPLOYEE DOCUMENT 
  const searchEmployeeDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchEmployeeDocumentList();

      return
    }

    await loadEmployeeDocuments(1, filters, sortInfo, searchValue)

  }
  //#endregion

  //#region CLEAR SERACH EMPLOYEE DOCUMENT 
  const clearsearchEmployeeDocuments = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadEmployeeDocuments(1, { DocumentName: '' }, sortInfo, undefined);
  }

  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportEmployeeDocuments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const params: FilterWithPaginationEmployeeDocumentRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          EmployeeId: employeeId || undefined,
          DocumentName: filters.DocumentName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, employeeDocumentColumns),
          ExportType: exportType
        }

        const response = await getEmployeeDocuments(params);

        handleExportFile(response, exportType, 'Employee Document', addToast)

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

  const handleExportEmployeeDocumentExcel = () => handleExportEmployeeDocuments('Excel')
  const handleExportEmployeeDocumentPdf = () => handleExportEmployeeDocuments('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET EMPLOYEE DOCUMENT 

  const getEmployeeDocuments = async (filterParams: FilterWithPaginationEmployeeDocumentRequest) => {

    return await employeeDocumentService.apiCallPullEmployeeDocument(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchEmployeeDocumentList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadEmployeeDocuments(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);
  //#endregion

  //#region TABLE PAGINATION INFO

  const employeeDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const employeeDocumentListForTable = useMemo(() => employeeDocumentList, [employeeDocumentList]);
  //#endregion

  //#region EDIT EMPLOYEE DOCUMENT

  const handleEditEmployeeDocument = useCallback((row: EmployeeDocumentData) => {
    setEditingEmployeeDocumentData({
      ...row,
      DocumentName: row.DocumentName || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])


  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: EmployeeDocumentData) => {
    setDeleteEmployeeDocumentDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const employeeDocumentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'DocumentName',
        label: 'Document Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => {

          const isAction =
            listState.pageName?.toUpperCase() === 'PROFILE'
              ? true
              : canAction;

          return (
            <div className={`flex items-center ${isAction ? 'justify-between' : 'justify-start'}`}>

              <TooltipText
                text={value || '-'}
                maxWidth="300px"
                tooltipThreshold={40}
              />

              {isAction && (
                <div className="flex justify-between items-center">

                  <Button
                    color='transparent'
                    size='sm'
                    style={{ color: '#0B3251', padding: '0px 8px' }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsAddUpdateModalOpen(false)
                      handleEditEmployeeDocument(row)
                    }}
                    leftIcon={<Edit className="h-4 w-4" />}
                  />
                  
                  {false && (
                    <Button
                      color='transparent'
                      size='sm'
                      style={{ color: 'red', padding: '0px 8px' }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsAddUpdateModalOpen(false)
                        handleConfirmationDialogBoxOpen(row)
                      }}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    />
                  )}

                </div>
              )}

            </div>
          );
        }
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
              title="Employee Document"
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
       render: value => value || '-'
      },
      {
        key: 'ModifiedDate',
        label: 'Last Modified Date',
        width: '33',
        sortable: false,
        align: 'left',
        render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleEditEmployeeDocument, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadEmployeeDocuments(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region Clear 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadEmployeeDocuments(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT EMPLOYEE DOCUMENT

  const handleFieldChange = (field: keyof AddUpdateEmployeeDocumentRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddEmployeeDocumentModal = () => {
    setEditingEmployeeDocumentData(null);
    setFormData({
      ...initialFormState(),
      EmployeeId: employeeId
    });
    setErrors({});
    setDocumentFiles([]);
    setDocumentURL('');
    setRemovedDocumentURLs([]);
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddEmployeeDocumentForm = (): {

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
      newErrors.DocumentURL = "Document File is required.";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushEmployeeDocumentFormData = (): FormData => {
    const fd = new FormData();
    fd.append('EmployeeDocumentId', String(formData.EmployeeDocumentId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey ?? '');
    fd.append('EmployeeId', String(employeeId));
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

  const handleAddUpdateEmployeeDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddEmployeeDocumentForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushEmployeeDocumentFormData();

        const response = await employeeDocumentService.apiCallAddUpdateEmployeeDocument(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.EmployeeDocumentId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as EmployeeDocumentData

            setEmployeeDocumentList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as EmployeeDocumentData;

            setEmployeeDocumentList(prevData =>
              prevData.map(item =>
                item.EmployeeDocumentId === formData.EmployeeDocumentId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingEmployeeDocumentData(null);
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

      Number(formData.EmployeeDocumentId) === 0 ? 'Add Employee Document' : 'Update Employee Document'
    )

  };

  //#endregion

  //#region DELETE EMPLOYEE DOCUMENT
  const handleDeleteEmployeeDocument = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteEmployeeDocumentDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteEmployeeDocumentRequest = {
          EmployeeDocumentId: deleteEmployeeDocumentDetailsData.EmployeeDocumentId,
          UniqueKey: deleteEmployeeDocumentDetailsData.Uniquekey || '',
          EmployeeId: deleteEmployeeDocumentDetailsData.EmployeeId
        }

        const response = await employeeDocumentService.apiCallDeleteEmployeeDocument(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (employeeDocumentList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadEmployeeDocuments(pageToShow, filters);


          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteEmployeeDocumentDetailsData(null);

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
      'Delete Employee Document'
    )
  }

  //#endregion

  //#region BACK EMPLOYEE MASTER PAGE

  const handleBackToListEmployee = () => {
    if (listState.pageName?.toUpperCase() === 'PROFILE') {
      navigate('/profile');
    } else {
      navigate('/employeeMaster');
    }
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
        onClearSearch={clearsearchEmployeeDocuments}
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
        onAdd={handleAddEmployeeDocumentModal}

        // IMPORT
        isShowImportButton={false}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportEmployeeDocumentExcel}
        onExportPdf={handleExportEmployeeDocumentPdf}
        exportLoading={isLoading}
      />
      <div className="flex items-center gap-3 mb-6 border-b border-gray-500 pb-3">
        <HeaderActionBar
          titleText="Employee Name : "
          subTitleText={employeeName}
          cancelText="Cancel"
          onCancel={() => handleBackToListEmployee()}
          canAction={false}
          isLoading={isLoading}
        />
      </div>


      {/* DATA TABLE EMPLOYEE DOCUMENT */}
      <DataTable
        data={employeeDocumentListForTable}
        columns={employeeDocumentColumns}
        pagination={employeeDocumentPaginationInfo}
        emptyMessage="No Employee Documents Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />


      {/*  ADD EDIT UPDATE EMPLOYEE DOCUMENT MODAL */}
      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingEmployeeDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingEmployeeDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        title={editingEmployeeDocumentData ? 'Update Employee Document' : 'Add Employee Document'}
        onSubmit={handleAddUpdateEmployeeDocument}
        saveText={editingEmployeeDocumentData ? 'Update' : 'Add'}
        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              <Input
                label='Document Name'
                required
                disabled={editingEmployeeDocumentData ? true : false}
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
                label="File"
                placeholder='Select File'
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

      {/* FILTER EMPLOYEE DOCUMENT MODAL */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Employee Document"
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

      {/* DELETE CONFIRMATION EMPLOYEE DOCUMENT MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteEmployeeDocumentDetailsData(null)
        }}
        onConfirm={handleDeleteEmployeeDocument}
        loading={isLoading}
        pageName='employee document'
      />


    </div >
  )
}

export default EmployeeDocument
