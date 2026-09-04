import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { AddUpdateTermSheetDocumentRequest, DeleteTermSheetDocumentRequest, TermSheetDocumentData, FilterWithPaginationTermSheetDocumentRequest } from '@/features/termSheet/models/TermSheetDocumentModel';
import { termSheetDocumentService } from '@/features/termSheet/services/TermSheetDocumentService'
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
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useTermSheetListState } from '@/features/termSheet/context/TermSheetListStateContext';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { TERM_SHEET_DOCUMENT } from '@/core/constants';
import { TextArea } from '@/ui/components/forms/Textarea';
import Checkbox from '@/ui/components/forms/Checkbox';
import DatePickerInput from '@/ui/components/forms/Datepicker';


const initialFormState = (): AddUpdateTermSheetDocumentRequest => ({
  TermSheetDocumentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  TermSheetId: null,
  TermSheetDetailsId: 0,
  ProjectId: 0,
  DocumentName: null,
  DocumentURL: null,
  RemoveDocumentURL: '',
  DocumentRemark: '',
  IsCollectedOriginalDocument: false,
  IsSubmittedOriginalDocument: false,
  CollectedOriginalDocumentDate: null,
});

export const TermSheetDocument: React.FC = () => {

  const [termSheetDocumentList, setTermSheetDocumentList] = useState<TermSheetDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchTermSheetDocuments(value)
  }, 350)
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [editingTermSheetDocumentData, setEditingTermSheetDocumentData] = useState<TermSheetDocumentData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [formData, setFormData] = useState<AddUpdateTermSheetDocumentRequest>(() => initialFormState());

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteTermSheetDocumentDetailsData, setDeleteTermSheetDocumentDetailsData] = useState<TermSheetDocumentData | null>(null)

  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>();

  const navigate = useNavigate();

  const { listState } = useTermSheetListState();
  const { TermSheetId, TermSheetDetailsId, ProjectId, NameOfInstitutionBankNBFC, ProjectName } = listState;

  const { canAction } = useMenuPermissions();

  useEffect(() => {
    if (!TermSheetId || !TermSheetDetailsId || !ProjectId) return;
    fetchTermSheetDocumentList();
  }, [TermSheetId, TermSheetDetailsId, ProjectId])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingTermSheetDocumentData) {
        setFormData({
          TermSheetDocumentId: editingTermSheetDocumentData.TermSheetDocumentId,
          Uniquekey: editingTermSheetDocumentData.Uniquekey || initialFormState().Uniquekey,
          TermSheetId: editingTermSheetDocumentData.TermSheetId,
          TermSheetDetailsId: editingTermSheetDocumentData.TermSheetDetailsId,
          ProjectId: editingTermSheetDocumentData.ProjectId,
          DocumentName: editingTermSheetDocumentData.DocumentName || null,
          DocumentURL: null,
          RemoveDocumentURL: '',
          DocumentRemark: editingTermSheetDocumentData.DocumentRemark || '',
          IsCollectedOriginalDocument: editingTermSheetDocumentData.IsCollectedOriginalDocument || false,
          IsSubmittedOriginalDocument: editingTermSheetDocumentData.IsSubmittedOriginalDocument || false,
          CollectedOriginalDocumentDate: editingTermSheetDocumentData.CollectedOriginalDocumentDate || null,
        });
        setDocumentFiles([]);
        setDocumentURL(editingTermSheetDocumentData.DocumentURL || '');
        setRemovedDocumentURLs([]);
      } else {
        setFormData({
          ...initialFormState(),
          TermSheetId: TermSheetId,
          TermSheetDetailsId: TermSheetDetailsId,
          ProjectId: ProjectId
        });
        setDocumentFiles([]);
        setDocumentURL('');
        setRemovedDocumentURLs([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingTermSheetDocumentData, TermSheetId, TermSheetDetailsId, ProjectId]);

  const fetchTermSheetDocumentList = async (page: number = pagination.currentPage) => {
    return await loadTermSheetDocuments(page, filters);
  }

  const loadTermSheetDocuments = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTermSheetDocumentRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectId: Number(ProjectId),
          TermSheetDetailsId: Number(TermSheetDetailsId),
          TermSheetId: Number(TermSheetId),
          TermSheetDocumentId: filterParams.TermSheetDocumentId ? Number(filterParams.TermSheetDocumentId) : undefined,
          DocumentName: searchtext ?? filterParams.DocumentName?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, termSheetDocumentColumns)
        }
        const response = await termSheetDocumentService.apiCallPullTermSheetDocument(params);

        if (E.isRight(response)) {

          setTermSheetDocumentList(response.right.Data);

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
      'Loading Term Sheet Document'
    )
  }

  const searchTermSheetDocuments = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchTermSheetDocumentList();

      return
    }

    const filterParams: FilterInfo = {
      DocumentName: searchValue.trim(),
    };

    await loadTermSheetDocuments(1, filterParams)

  }

  const clearsearchTermSheetDocuments = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadTermSheetDocuments(1, { DocumentName: '' }, sortInfo, undefined);
  }

  const handleExportTermSheetDocuments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationTermSheetDocumentRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectId: Number(ProjectId),
          TermSheetDetailsId: Number(TermSheetDetailsId),
          TermSheetId: Number(TermSheetId),
          DocumentName: filters.DocumentName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, termSheetDocumentColumns),
          ExportType: exportType
        }

        const response = await termSheetDocumentService.apiCallPullTermSheetDocument(params);

        handleExportFile(response, exportType, 'Term Sheet Document', addToast)

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

  const handleExportTermSheetDocumentExcel = () => handleExportTermSheetDocuments('Excel')
  const handleExportTermSheetDocumentPdf = () => handleExportTermSheetDocuments('PDF')

  const handlePageChange = (page: number) => {
    loadTermSheetDocuments(page, filters, sortInfo, searchTerm || undefined);
  };

  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadTermSheetDocuments(1, filters, sort, searchTerm || undefined);

  }, [filters, searchTerm]);

  const termSheetDocumentPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const termSheetDocumentListForTable = useMemo(() => termSheetDocumentList, [termSheetDocumentList]);

  const handleEditTermSheetDocument = useCallback((row: TermSheetDocumentData) => {
    setEditingTermSheetDocumentData({
      ...row,
      DocumentName: row.DocumentName || '',
      DocumentRemark: row.DocumentRemark || ''
    })
    setIsAddUpdateModalOpen(true);

  }, []);

  const handleConfirmationDialogBoxOpen = useCallback((row: TermSheetDocumentData) => {
    setDeleteTermSheetDocumentDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, []);

  const termSheetDocumentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'DocumentName',
        label: 'Document Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => {

          const approvalStatus = listState?.ApprovalStatus?.toUpperCase() ?? "";

          const isClosed = approvalStatus === "CLOSED";

          const canEdit = isClosed ? canAction && Boolean(row.IsSubmittedOriginalDocument) : canAction;

          const canDelete = canAction && !isClosed;

          return (
            <div className="flex items-center justify-between">

              <TooltipText
                text={value || '-'}
                maxWidth="500px"
                tooltipThreshold={100}
              />

              <div className="flex justify-between items-center">

                <Button
                  color="transparent"
                  size="sm"
                  disabled={!canEdit}
                  style={{
                    color: canEdit ? '#0B3251' : '#9CA3AF',
                    padding: '0px 8px',
                    cursor: canEdit ? 'pointer' : 'not-allowed',
                    opacity: canEdit ? 1 : 0.5
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!canEdit) return;

                    setIsAddUpdateModalOpen(false);
                    handleEditTermSheetDocument(row);
                  }}
                  leftIcon={<Edit className="h-4 w-4" />}
                />

                <Button
                  color="transparent"
                  size="sm"
                  disabled={!canDelete}
                  style={{
                    color: canDelete ? 'red' : '#9CA3AF',
                    padding: '0px 8px',
                    cursor: canDelete ? 'pointer' : 'not-allowed',
                    opacity: canDelete ? 1 : 0.5
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!canDelete) return;

                    setIsAddUpdateModalOpen(false);
                    handleConfirmationDialogBoxOpen(row);
                  }}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                />

              </div>
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
              title="Term Sheet Document"
              triggerLabel={`View (${urls.length})`}
            />
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
        key: "IsSubmittedOriginalDocument",
        label: "Submitted Original",
        width: "120px",
        sortable: false,
        render: (value: boolean) => (value ? "Yes" : "No"),
      },
      {
        key: "IsCollectedOriginalDocument",
        label: "Collected Original",
        width: "120px",
        sortable: false,
        render: (value: boolean) => (value ? "Yes" : "No"),
      },
      {
        key: 'CollectedOriginalDocumentDate',
        label: 'Collected Original Document Date',
        width: '15',
        sortable: false,
        align: 'center',
        render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'ModifiedBy',
        label: 'Uploaded By',
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
        label: 'Uploaded Date',
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
    [canAction, handleEditTermSheetDocument, handleConfirmationDialogBoxOpen]
  )

  const applyFilters = () => {
    setFilters(tempFilters)
    loadTermSheetDocuments(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadTermSheetDocuments(1, {})
    setShowFilterPopup(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  const handleFieldChange = (field: keyof AddUpdateTermSheetDocumentRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddTermSheetDocumentModal = () => {
    setEditingTermSheetDocumentData(null);
    setFormData({
      ...initialFormState(),
      TermSheetId: TermSheetId,
      TermSheetDetailsId: TermSheetDetailsId,
      ProjectId: Number(ProjectId)
    });
    setErrors({});
    setDocumentFiles([]);
    setDocumentURL('');
    setRemovedDocumentURLs([]);
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddTermSheetDocumentForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.DocumentName || formData.DocumentName.trim() === "") {

      newErrors.DocumentName = "Document Name is required"
    } else if (formData.DocumentName.trim().length < 3) {
      newErrors.DocumentName = "Document Name must be at least 3 characters long"
    }

    if (!hasAnyDocumentFile(documentFiles, documentURL, removedDocumentURLs)) {
      newErrors.DocumentURL = "File is required.";
    }
    if (formData.IsCollectedOriginalDocument && !formData.CollectedOriginalDocumentDate) {
      newErrors.CollectedOriginalDocumentDate = "Collected Original Document Date is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushTermSheetDocumentFormData = (): FormData => {
    const fd = new FormData();
    fd.append('TermSheetDocumentId', String(formData.TermSheetDocumentId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey ?? '');
    fd.append('TermSheetId', String(TermSheetId));
    fd.append('TermSheetDetailsId', String(TermSheetDetailsId));
    fd.append('ProjectId', String(ProjectId));
    fd.append('DocumentName', formData.DocumentName ?? '');
    fd.append('DocumentRemark', formData.DocumentRemark ?? '');
    fd.append('IsCollectedOriginalDocument', String(formData.IsCollectedOriginalDocument ?? false));
    fd.append('IsSubmittedOriginalDocument', String(formData.IsSubmittedOriginalDocument ?? false));
    fd.append('CollectedOriginalDocumentDate', formData.IsCollectedOriginalDocument ? formData.CollectedOriginalDocumentDate ?? "" : "");

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

  const handleAddUpdateTermSheetDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddTermSheetDocumentForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushTermSheetDocumentFormData();

        const response = await termSheetDocumentService.apiCallAddUpdateTermSheetDocument(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.TermSheetDocumentId === null || formData.TermSheetDocumentId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as TermSheetDocumentData

            setTermSheetDocumentList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as TermSheetDocumentData;

            setTermSheetDocumentList(prevData =>
              prevData.map(item =>
                item.TermSheetDocumentId === formData.TermSheetDocumentId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingTermSheetDocumentData(null);
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

      formData.TermSheetDocumentId === null || formData.TermSheetDocumentId === 0 ? 'Add Term Sheet Document' : 'Update Term Sheet Document'
    )

  };

  const handleDeleteTermSheetDocument = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteTermSheetDocumentDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteTermSheetDocumentRequest = {
          TermSheetDocumentId: deleteTermSheetDocumentDetailsData.TermSheetDocumentId,
          Uniquekey: deleteTermSheetDocumentDetailsData.Uniquekey || '',
          TermSheetId: deleteTermSheetDocumentDetailsData.TermSheetId,
          TermSheetDetailsId: deleteTermSheetDocumentDetailsData.TermSheetDetailsId,
          ProjectId: deleteTermSheetDocumentDetailsData.ProjectId
        }

        const response = await termSheetDocumentService.apiCallDeleteTermSheetDocument(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (termSheetDocumentList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadTermSheetDocuments(pageToShow, filters);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteTermSheetDocumentDetailsData(null);

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
      'Delete Term Sheet Document'
    )
  }

  const handleBackToListTermSheet = () => {
    navigate('/termSheet');
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
        onClearSearch={clearsearchTermSheetDocuments}
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
        onAdd={handleAddTermSheetDocumentModal}

        // IMPORT
        isShowImportButton={false}

        // EXPORT
        isShowExportButton={false}
        onExportExcel={handleExportTermSheetDocumentExcel}
        onExportPdf={handleExportTermSheetDocumentPdf}
        exportLoading={isLoading}
      />

      <div className="flex items-center gap-3 mb-6 border-b border-gray-500 pb-3">

        <HeaderActionBar
          titleText={"Term Sheet Document : "}
          subTitleText={ProjectName ? ProjectName : ''}
          subSubTitleText={NameOfInstitutionBankNBFC ? NameOfInstitutionBankNBFC : ''}
          cancelText="Cancel"
          EditText=""
          onCancel={() => handleBackToListTermSheet()}
          canAction={false}
          isLoading={isLoading}
        />
      </div>


      <DataTable
        data={termSheetDocumentListForTable}
        columns={termSheetDocumentColumns}
        pagination={termSheetDocumentPaginationInfo}
        emptyMessage="No Term Sheet Documents Data Found"
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
          setEditingTermSheetDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingTermSheetDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        title={editingTermSheetDocumentData ? 'Update Term Sheet Document' : 'Add Term Sheet Document'}
        onSubmit={handleAddUpdateTermSheetDocument}
        saveText={'Add'}

        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>

              <SinglePageSelection
                label="Document Name"
                placeholder="Select Document Name"
                value={formData.DocumentName ?? ""}
                disabled={listState.ApprovalStatus.toUpperCase() === "CLOSED" && Number(formData.TermSheetDocumentId) > 0 ? true : false}
                required
                onChange={(val) => handleFieldChange("DocumentName", String(val))}
                options={TERM_SHEET_DOCUMENT.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errors.DocumentName} />

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
                disabled={listState.ApprovalStatus.toUpperCase() === "CLOSED" && Number(formData.TermSheetDocumentId) > 0 ? true : false}
                onRemoveExisting={(url) => {
                  setRemovedDocumentURLs((prev) => [...prev, url])
                }}
              />
            </div>
            <div>
              <TextArea
                label="Remark"
                placeholder="Enter Remark"
                className='thin-scroll'
                value={formData.DocumentRemark}
                disabled={listState.ApprovalStatus.toUpperCase() === "CLOSED" && Number(formData.TermSheetDocumentId) > 0 ? true : false}
                onChange={(e) => handleFieldChange("DocumentRemark", e.target.value)}
                error={errors.DocumentRemark} />
            </div>
            <div>
              <Checkbox
                label="Submitted Original?"
                checked={formData.IsSubmittedOriginalDocument === true}
                disabled={listState.ApprovalStatus.toUpperCase() === "CLOSED" ? true : false}
                onChange={(e) => handleFieldChange("IsSubmittedOriginalDocument", e.target.checked ? true : false)}
              />
            </div>
            <div>
              <Checkbox
                label="Collected Original?"
                checked={formData.IsCollectedOriginalDocument === true}
                disabled={listState.ApprovalStatus.toUpperCase() === "CLOSED" && Number(formData.TermSheetDocumentId) > 0 ? false : true}
                onChange={(e) => handleFieldChange("IsCollectedOriginalDocument", e.target.checked ? true : false)}
              />
            </div>
            {formData.IsCollectedOriginalDocument && (
              <div>
                <DatePickerInput
                  label="Collected Original Document Date"
                  required
                  value={formatDate_dd_mm_yyyy(formData.CollectedOriginalDocumentDate ?? "")}
                  onChange={(val) => handleFieldChange("CollectedOriginalDocumentDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  error={errors.CollectedOriginalDocumentDate}
                />
              </div>
            )}
          </div>
        </div>

      </Modal>

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Term Sheet Document"
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
          setDeleteTermSheetDocumentDetailsData(null)
        }}
        onConfirm={handleDeleteTermSheetDocument}
        loading={isLoading}
        pageName='Term Sheet Document'
      />


    </div>
  )
}

export default TermSheetDocument
