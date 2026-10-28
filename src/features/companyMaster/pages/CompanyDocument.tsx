import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateCompanyDocumentRequest,
  DeleteCompanyDocumentRequest,
  CompanyDocumentData,
  FilterWithPaginationCompanyDocumentRequest
} from '@/features/companyMaster/models/CompanyDocumentModel';

import { companyDocumentService } from '@/features/companyMaster/services/CompanyDocumentService'
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
import { useCompanyListState } from '@/features/companyMaster/context/CompanyListStateContext';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { COMPANY_DOCUMENT, FINANCIAL_YEAR } from '@/core/constants';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';


const initialFormState = (): AddUpdateCompanyDocumentRequest => ({
  CompanyDocumentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  CompanyId: 0,
  FinancialYear: '',
  DocumentName: '',
  DocumentURL: null,
  RemoveDocumentURL: null
});

export const CompanyDocument: React.FC = () => {

  //#region STATE MANAGEMENT
  const [companyDocumentList, setCompanyDocumentList] = useState<CompanyDocumentData[]>([]);
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
    searchCompanyDocuments(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT EMPLOYEE DOCUMENT
  const [editingCompanyDocumentData, setEditingCompanyDocumentData] = useState<CompanyDocumentData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);


  //ADD UPDATE EMPLOYEE DOCUMENT
  const [formData, setFormData] = useState<AddUpdateCompanyDocumentRequest>(() => initialFormState());

  //DELETE EMPLOYEE DOCUMENT STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteCompanyDocumentDetailsData, setDeleteCompanyDocumentDetailsData] = useState<CompanyDocumentData | null>(null)

  //FILE STATES
  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>();

  // NAVIGATION
  const navigate = useNavigate();

  const { listState } = useCompanyListState();
  const companyName = listState.companyName || '';
  const companyId = listState.companyId || 0;

  const { canAction, canExport } = useMenuPermissions('/companyMaster');


  const hasFetchedInitialCompanyDocuments = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialCompanyDocuments.current) return

    hasFetchedInitialCompanyDocuments.current = true;

    fetchCompanyDocumentList()
  }, [])


  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingCompanyDocumentData) {
        setFormData({
          CompanyDocumentId: editingCompanyDocumentData.CompanyDocumentId,
          Uniquekey: editingCompanyDocumentData.Uniquekey || initialFormState().Uniquekey,
          FinancialYear: editingCompanyDocumentData.FinancialYear || '',
          CompanyId: editingCompanyDocumentData.CompanyId,
          DocumentName: editingCompanyDocumentData.DocumentName || '',
          DocumentURL: null,
          RemoveDocumentURL: null
        });
        setDocumentFiles([]);
        setDocumentURL(editingCompanyDocumentData.DocumentURL || '');
        setRemovedDocumentURLs([]);
      } else {
        setFormData({
          ...initialFormState(),
          CompanyId: companyId
        });
        setDocumentFiles([]);
        setDocumentURL('');
        setRemovedDocumentURLs([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingCompanyDocumentData, companyId]);


  const fetchCompanyDocumentList = async (page: number = pagination.currentPage) => {
    return await loadCompanyDocuments(page, filters);
  }

  const loadCompanyDocuments = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const params: FilterWithPaginationCompanyDocumentRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          CompanyId: companyId,
          CompanyDocumentId: filterParams.CompanyDocumentId ? Number(filterParams.CompanyDocumentId) : undefined,
          DocumentName: searchtext ?? filterParams.DocumentName?.trim() ?? undefined,
          FinancialYear: filterParams.FinancialYear?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, companyDocumentColumns)
        }

        const response = await getCompanyDocuments(params);

        if (E.isRight(response)) {

          setCompanyDocumentList(response.right.Data);

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
      'Loading Company Document'
    )
  }

  const searchCompanyDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchCompanyDocumentList();

      return
    }

    await loadCompanyDocuments(1, filters, sortInfo, searchValue)

  }
  const clearsearchCompanyDocuments = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadCompanyDocuments(1, { DocumentName: '' }, sortInfo, undefined);
  }

  const handleExportCompanyDocuments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const params: FilterWithPaginationCompanyDocumentRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          CompanyId: companyId || undefined,
          DocumentName: filters.DocumentName?.trim() || undefined,
          FinancialYear: filters.FinancialYear?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, companyDocumentColumns),
          ExportType: exportType
        }

        const response = await getCompanyDocuments(params);

        handleExportFile(response, exportType, 'Company Document', addToast)

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

  const handleExportCompanyDocumentExcel = () => handleExportCompanyDocuments('Excel')
  const handleExportCompanyDocumentPdf = () => handleExportCompanyDocuments('PDF')


  const getCompanyDocuments = async (filterParams: FilterWithPaginationCompanyDocumentRequest) => {

    return await companyDocumentService.apiCallPullCompanyDocument(filterParams);
  }


  const handlePageChange = (page: number) => {
    loadCompanyDocuments(page, filters, sortInfo, searchTerm || undefined);
  };

  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadCompanyDocuments(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);

  const companyDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const companyDocumentListForTable = useMemo(() => companyDocumentList, [companyDocumentList]);

  const handleEditCompanyDocument = useCallback((row: CompanyDocumentData) => {
    setEditingCompanyDocumentData({
      ...row,
      DocumentName: row.DocumentName || '',
      FinancialYear: row.FinancialYear || '',
    })
    setIsAddUpdateModalOpen(true);

  }, [])



  const handleConfirmationDialogBoxOpen = useCallback((row: CompanyDocumentData) => {
    setDeleteCompanyDocumentDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])


  const companyDocumentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'FinancialYear',
        label: 'Financial Year',
        width: '20',
        sortable: false,
        align: 'left',
         render: (value) => {
          return (
            <div className="flex items-center gap-2">

              {value && (
                <TooltipText
                  text={value || '-'}
                  tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                />
              )}
              
              
            </div>
          );
        }
      },
      {
        key: 'DocumentName',
        label: 'Document Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value) => {


          return (
            

              <TooltipText
                text={value || '-'}
                maxWidth="300px"
                tooltipThreshold={40}
              />
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
              title="Company Document"
              triggerLabel={`View (${urls.length})`}
            />
          );
        }

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
        fixed: "right",
        align: "center",
        sortable: false,
        render: (_value, row) => {

          const canEditDelete = canAction;

          return (
            <div className="flex items-center justify-center gap-2">

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()

                  if (!canEditDelete) return;
                  setIsAddUpdateModalOpen(false)
                  handleEditCompanyDocument(row)


                  handleEditCompanyDocument(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                disabled={!canEditDelete}
                style={{
                  color: canEditDelete ? "#0B3251" : "#9CA3AF",
                  cursor: canEditDelete ? "pointer" : "not-allowed",
                  opacity: canEditDelete ? 1 : 0.5,
                  padding: "4px 8px",
                }}

              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!canEditDelete) return;
                  setIsAddUpdateModalOpen(false)
                  handleConfirmationDialogBoxOpen(row)
                }}
                color="transparent"
                isborderRadius
                size="sm"
                disabled={!canEditDelete}
                style={{
                  color: canEditDelete ? "red" : "#9CA3AF",
                  cursor: canEditDelete ? "pointer" : "not-allowed",
                  opacity: canEditDelete ? 1 : 0.5,
                  padding: "4px 8px",
                }}
                
              >
                <Trash2 className="h-4 w-4" />
              </Button>

            </div>
          );
        },
      },
    ],

    [canAction, handleEditCompanyDocument, handleConfirmationDialogBoxOpen]
  )

  const applyFilters = () => {
    setFilters(tempFilters)
    loadCompanyDocuments(1, tempFilters)
    setShowFilterPopup(false)
  }


  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadCompanyDocuments(1, {})
  }

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };


  const handleFieldChange = (field: keyof AddUpdateCompanyDocumentRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddCompanyDocumentModal = () => {
    setEditingCompanyDocumentData(null);
    setFormData({
      ...initialFormState(),
      CompanyId: companyId
    });
    setErrors({});
    setDocumentFiles([]);
    setDocumentURL('');
    setRemovedDocumentURLs([]);
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddCompanyDocumentForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.DocumentName || formData.DocumentName.trim() === "") {

      newErrors.DocumentName = "Document Name is required"
    } else if (formData.DocumentName.trim().length < 3) {
      newErrors.DocumentName = "Document Name must be at least 3 characters long"
    }

    if (!formData.FinancialYear || formData.FinancialYear.trim() === "") {

      newErrors.FinancialYear = "Financial Year is required"
    }

    if (!hasAnyDocumentFile(documentFiles, documentURL, removedDocumentURLs)) {
      newErrors.DocumentURL = "Document File is required.";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushCompanyDocumentFormData = (): FormData => {
    const fd = new FormData();
    fd.append('CompanyDocumentId', String(formData.CompanyDocumentId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey ?? '');
    fd.append('CompanyId', String(companyId));
    fd.append('DocumentName', formData.DocumentName ?? '');
    fd.append('FinancialYear', formData.FinancialYear ?? '');

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

  const handleAddUpdateCompanyDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddCompanyDocumentForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushCompanyDocumentFormData();

        const response = await companyDocumentService.apiCallAddUpdateCompanyDocument(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.CompanyDocumentId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as CompanyDocumentData

            setCompanyDocumentList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as CompanyDocumentData;

            setCompanyDocumentList(prevData =>
              prevData.map(item =>
                item.CompanyDocumentId === formData.CompanyDocumentId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingCompanyDocumentData(null);
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

      Number(formData.CompanyDocumentId) === 0 ? 'Add Company Document' : 'Update Company Document'
    )

  };


  const handleDeleteCompanyDocument = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteCompanyDocumentDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteCompanyDocumentRequest = {
          CompanyDocumentId: deleteCompanyDocumentDetailsData.CompanyDocumentId,
          UniqueKey: deleteCompanyDocumentDetailsData.Uniquekey || '',
          CompanyId: deleteCompanyDocumentDetailsData.CompanyId
        }

        const response = await companyDocumentService.apiCallDeleteCompanyDocument(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (companyDocumentList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadCompanyDocuments(pageToShow, filters);


          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteCompanyDocumentDetailsData(null);

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
      'Delete Company Document'
    )
  }


  const handleBackToListCompany = () => {
    if (listState.pageName?.toUpperCase() === 'PROFILE') {
      navigate('/profile');
    } else {
      navigate('/companyMaster');
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Document Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchCompanyDocuments}
        isShowFilterButton={true}
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        isShowCustomizeButton={false}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddCompanyDocumentModal}

        // IMPORT
        isShowImportButton={false}

        // EXPORT
        isShowExportButton={canExport && companyDocumentListForTable.length >0}
        onExportExcel={handleExportCompanyDocumentExcel}
        onExportPdf={handleExportCompanyDocumentPdf}
        exportLoading={isLoading}
      />
      <div className="flex items-center gap-3 mb-6 border-b border-gray-500 pb-3">
        <HeaderActionBar
          titleText="Company Name : "
          subTitleText={companyName}
          cancelText="Cancel"
          onCancel={() => handleBackToListCompany()}
          canAction={false}
          isLoading={isLoading}
        />
      </div>


      <DataTable
        data={companyDocumentListForTable}
        columns={companyDocumentColumns}
        pagination={companyDocumentPaginationInfo}
        emptyMessage="No Company Documents Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />


      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingCompanyDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingCompanyDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        title={editingCompanyDocumentData ? 'Update Company Document' : 'Add Company Document'}
        onSubmit={handleAddUpdateCompanyDocument}
        saveText={editingCompanyDocumentData ? 'Update' : 'Add'}
        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >

            <div>
              <SinglePageSelection
                label="Financial Year"
                placeholder="Select Financial Year"
                required
                error={errors.FinancialYear}
                value={formData.FinancialYear || ""}
                onChange={(e) => {
                  handleFieldChange("FinancialYear", String(e));
                }}
                options={FINANCIAL_YEAR.map((opt) => ({
                  label: opt.name,
                  value: opt.id,
                }))}
              />

            </div>
            <div>
              <SinglePageSelection
                label="Document Name"
                placeholder="Select Document Name"
                required
                error={errors.DocumentName}
                value={formData.DocumentName || ""}
                onChange={(e) => {
                  handleFieldChange("DocumentName", String(e));
                }}
                options={COMPANY_DOCUMENT.map((opt) => ({
                  label: opt.name,
                  value: opt.id,
                }))}
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
                onRemoveExisting={(url) => {
                  setRemovedDocumentURLs((prev) => [...prev, url])
                }}
              />
            </div>
          </div>
        </div>

      </Modal>

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Company Document"
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
            <div>
              <Input
                label='Financial Year'
                type="text"
                value={tempFilters.FinancialYear || ''}
                onChange={(e) => handleFilterChange('FinancialYear', e.target.value)}
                placeholder="Enter Financial Year"
              />
            </div>
          </div>
        </div>
      </Modal>


      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteCompanyDocumentDetailsData(null)
        }}
        onConfirm={handleDeleteCompanyDocument}
        loading={isLoading}
        pageName='company document'
      />


    </div >
  )
}

export default CompanyDocument
