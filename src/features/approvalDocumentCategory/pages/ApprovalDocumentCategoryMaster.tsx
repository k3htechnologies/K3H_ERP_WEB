import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateApprovalDocumentCategoryMasterRequest,
  DeleteApprovalDocumentCategoryMasterRequest,
  ApprovalDocumentCategoryMasterData,
  FilterWithPaginationApprovalDocumentCategoryMaster
} from '@/features/approvalDocumentCategory/models/ApprovalDocumentCategoryMasterModel';

import { approvalDocumentCategoryMasterService } from '@/features/approvalDocumentCategory/services/ApprovalDocumentCategoryMasterService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Edit, Trash2 } from 'lucide-react';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { updateFilter } from '@/core/utils/filterHelper';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';

const initialFormState = (): AddUpdateApprovalDocumentCategoryMasterRequest => ({
  ApprovalDocumentCategoryId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  ApprovalDocumentCategory: '',
  OrderBy: 0
});


export const ApprovalDocumentCategoryMaster: React.FC = () => {
  //#region STATE MANAGEMENT
  const [approvalDocumentCategoryMasterList, setApprovalDocumentCategoryMasterList] = useState<ApprovalDocumentCategoryMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchApprovalDocumentCategories(value);
  }, 350);

  //VIEW APPROVAL DOCUMENT CATEGORY MASTER MODAL STATES
  const [viewApprovalDocumentCategoryMasterDetailsData, setViewApprovalDocumentCategoryMasterDetailsData] =
    useState<ApprovalDocumentCategoryMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT APPROVAL DOCUMENT CATEGORY MASTER
  const [editingApprovalDocumentCategoryMasterData, setEditingApprovalDocumentCategoryMasterData] =
    useState<ApprovalDocumentCategoryMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE APPROVAL DOCUMENT CATEGORY MASTER
  const [formData, setFormData] = useState<AddUpdateApprovalDocumentCategoryMasterRequest>(() => initialFormState());

  //DELETE APPROVAL DOCUMENT CATEGORY MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteApprovalDocumentCategoryMasterDetailsData, setDeleteApprovalDocumentCategoryMasterDetailsData] =
    useState<ApprovalDocumentCategoryMasterData | null>(null);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeApprovalDocumentCategoryMasterColumnsModal, setIsShowCustomizeApprovalDocumentCategoryMasterColumnsModal] = useState(false);

  //EXCEL IMPORT 
  const [showImportModal, setShowImportModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region INITIALIZATION

  useEffect(() => {
    if (!projectId) return;

    fetchApprovalDocumentCategoryList();
  }, [projectId]);

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingApprovalDocumentCategoryMasterData) {
        setFormData({
          ApprovalDocumentCategoryId: editingApprovalDocumentCategoryMasterData.ApprovalDocumentCategoryId,
          Uniquekey: editingApprovalDocumentCategoryMasterData.Uniquekey || initialFormState().Uniquekey,
          ProjectId: Number(projectId),
          ApprovalDocumentCategory: editingApprovalDocumentCategoryMasterData.ApprovalDocumentCategoryName || '',
          OrderBy: editingApprovalDocumentCategoryMasterData.OrderBy || 0
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingApprovalDocumentCategoryMasterData]);
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const fetchApprovalDocumentCategoryList = async (page: number = pagination.currentPage) => {
    return await loadApprovalDocumentCategories(page, filters);
  };

  const loadApprovalDocumentCategories = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {
          const column = approvalDocumentCategoryMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationApprovalDocumentCategoryMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ApprovalDocumentCategoryId: filterParams.ApprovalDocumentCategoryId ? Number(filterParams.ApprovalDocumentCategoryId) : 0,
          ApprovalDocumentCategory: filterParams.ApprovalDocumentCategory?.trim() || undefined,
          ProjectId: Number(projectId),
          SortBy: sortByParam
        };

        const response = await getApprovalDocumentCategories(params);

        if (E.isRight(response)) {
          setApprovalDocumentCategoryMasterList(response.right.Data);

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
      'Loading Approval Document Category'
    );
  };
  //#endregion

  //#region SERACH APPROVAL DOCUMENT CATEGORY
  const searchApprovalDocumentCategories = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchApprovalDocumentCategoryList();
      return;
    }

    const filterParams: FilterInfo = {
      ApprovalDocumentCategory: searchValue.trim()
    };

    await loadApprovalDocumentCategories(1, filterParams);
  };
  //#endregion

  //#region CLEAR SERACH APPROVAL DOCUMENT CATEGORY
  const clearsearchApprovalDocumentCategories = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchApprovalDocumentCategoryList();
  };
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportApprovalDocumentCategories = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined;
        if (sortInfo) {
          const column = approvalDocumentCategoryMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationApprovalDocumentCategoryMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ApprovalDocumentCategory: filters.ApprovalDocumentCategory?.trim() || undefined,
          ProjectId: Number(projectId),
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getApprovalDocumentCategories(params);

        handleExportFile(response, exportType, 'Approval Document Category Master', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export'
    );
  };

  const handleExportApprovalDocumentCategoryExcel = () => handleExportApprovalDocumentCategories('Excel');
  const handleExportApprovalDocumentCategoryPdf = () => handleExportApprovalDocumentCategories('PDF');
  //#endregion

  //#region API | SERVICES CALL TO GET APPROVAL DOCUMENT CATEGORY
  const getApprovalDocumentCategories = async (filterParams: FilterWithPaginationApprovalDocumentCategoryMaster) => {
    return await approvalDocumentCategoryMasterService.apiCallPullApprovalDocumentCategoryMaster(filterParams);
  };
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = (page: number) => {
    fetchApprovalDocumentCategoryList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchApprovalDocumentCategoryList(1);
  };
  //#endregion

  //#region TABLE PAGINATION INFO
  const approvalDocumentCategoryMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  );

  const approvalDocumentCategoryListForTable = useMemo(
    () => approvalDocumentCategoryMasterList,
    [approvalDocumentCategoryMasterList]
  );
  //#endregion

  //#region VIEW EDIT
  const handleViewApprovalDocumentCategoryDetails = useCallback((row: ApprovalDocumentCategoryMasterData) => {
    setViewApprovalDocumentCategoryMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);
  //#endregion

  //#region EDIT APPROVAL DOCUMENT CATEGORY MASTER
  const handleEditApprovalDocumentCategoryMaster = useCallback((row: ApprovalDocumentCategoryMasterData) => {
    setEditingApprovalDocumentCategoryMasterData({
      ...row,
      ProjectId: Number(projectId),
      ApprovalDocumentCategoryName: row.ApprovalDocumentCategoryName || '',
      OrderBy: row.OrderBy || 0
    });
    setIsAddUpdateModalOpen(true);
  }, []);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ApprovalDocumentCategoryMasterData) => {
    setDeleteApprovalDocumentCategoryMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region TABLE COLUMN
  const approvalDocumentCategoryMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ApprovalDocumentCategoryName',
        label: 'Approval Document Category',
        width: '40',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
            <TooltipText
              text={value || 'N/A'}
              maxWidth="500px"
              tooltipThreshold={30}
              onClick={() => handleViewApprovalDocumentCategoryDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'OrderBy',
        label: 'Order By',
        width: '20',
        sortable: false,
        align: 'center',
        render: value => value ?? ''
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row) => (
          canAction && !row.NumberOfEmployee ? (
            <div className="flex items-center justify-center gap-2">

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleConfirmationDialogBoxOpen(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'red',
                  padding: '4px 8px'
                }}
                title="Delete Department"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        )
      }
    ],
    [canAction, handleViewApprovalDocumentCategoryDetails, handleEditApprovalDocumentCategoryMaster, handleConfirmationDialogBoxOpen]
  );
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredApprovalDocumentCategoryMasterColumnKeys: string[] = ['ApprovalDocumentCategory'];

  const allApprovalDocumentCategoryMasterColumnKeys: string[] = approvalDocumentCategoryMasterColumns.map(c => c.key);

  const [selectedApprovalDocumentCategoryMasterColumnKeys, setSelectedApprovalDocumentCategoryMasterColumnKeys] = useState<string[]>(
    () => {
      try {
        const saved = LocalStorageHelper.getApprovalDocumentCategoryMasterTableColumns();

        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          // Ensure required columns are always present
          const withRequired = Array.from(new Set([...parsed, ...requiredApprovalDocumentCategoryMasterColumnKeys]));

          // Filter out any keys that no longer exist
          return withRequired.filter(k => allApprovalDocumentCategoryMasterColumnKeys.includes(k));
        }
      } catch { }
      return allApprovalDocumentCategoryMasterColumnKeys;
    }
  );

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere
    setSelectedApprovalDocumentCategoryMasterColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredApprovalDocumentCategoryMasterColumnKeys])).filter(k =>
        allApprovalDocumentCategoryMasterColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalDocumentCategoryMasterColumns.length]);

  const visibleApprovalDocumentCategoryMasterColumns = useMemo(
    () =>
      approvalDocumentCategoryMasterColumns.filter(col =>
        selectedApprovalDocumentCategoryMasterColumnKeys.includes(col.key)
      ),
    [approvalDocumentCategoryMasterColumns, selectedApprovalDocumentCategoryMasterColumnKeys]
  );
  //#endregion

  //#region VIEW APPROVAL DOCUMENT CATEGORY DETAILS MODAL COMPONENT
  interface ViewApprovalDocumentCategoryDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ApprovalDocumentCategoryMasterData | null;
  }

  const ViewApprovalDocumentCategoryDetailsModal: React.FC<ViewApprovalDocumentCategoryDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Approval Document Category Master Details"
        onSubmit={e => {
          e.preventDefault();
          onClose();
        }}
        cancelText="Close"
        loading={false}
        size="xl"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <FieldItem
              label="Document Category"
              value={data.ApprovalDocumentCategoryName}
              isRow
              withBorder
              className="font-medium text-blue-900 "
            />
            <FieldItem label="Order By" value={data.OrderBy} isRow withBorder />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold pb-2">Action Details</h4>

            <FieldItem
              label="Created By / Date"
              isRow={true}
              value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
              withBorder={data.ModifiedBy !== '' ? true : false}
            />

            {data.ModifiedBy !== '' ? (
              <FieldItem
                label="Modified By / Date"
                isRow={true}
                value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                withBorder={false}
              />
            ) : (
              ''
            )}
          </div>
          <div className="flex justify-between items-center pt-4">
            {canAction && (
              <>
                <Button
                  color="red"
                  variant="solid"
                  colorMode="light"
                  size="sm"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsViewModalOpen(false);
                    handleConfirmationDialogBoxOpen(data);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                  Delete
                </Button>

                <Button
                  color="blue"
                  size="sm"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsViewModalOpen(false);
                    handleEditApprovalDocumentCategoryMaster(data);
                  }}
                >
                  <Edit className="h-5 w-5" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    );
  };
  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadApprovalDocumentCategories(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadApprovalDocumentCategories(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT APPROVAL DOCUMENT CATEGORY MASTER
  const handleFieldChange = (field: keyof AddUpdateApprovalDocumentCategoryMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddApprovalDocumentCategoryModal = () => {
    setEditingApprovalDocumentCategoryMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddApprovalDocumentCategoryMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ApprovalDocumentCategory?.trim()) {
      newErrors.approvalDocumentCategory = 'Approval Document Category is required';
    }

    if (formData.OrderBy === 0) {
      newErrors.OrderBy = 'Order By is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushApprovalDocumentCategoryMasterFormData = (): AddUpdateApprovalDocumentCategoryMasterRequest => {
    return {
      ApprovalDocumentCategoryId: formData.ApprovalDocumentCategoryId,
      Uniquekey: formData.Uniquekey,
      ProjectId: Number(projectId),
      ApprovalDocumentCategory: formData.ApprovalDocumentCategory,
      OrderBy: formData.OrderBy
    };
  };

  const handleAddUpdateApprovalDocumentCategoryMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddApprovalDocumentCategoryMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const payload = PushApprovalDocumentCategoryMasterFormData();

        const response =
          await approvalDocumentCategoryMasterService.apiCallAddUpdateApprovalDocumentCategoryMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ApprovalDocumentCategoryId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ApprovalDocumentCategoryMasterData;

            setApprovalDocumentCategoryMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as ApprovalDocumentCategoryMasterData;

            setApprovalDocumentCategoryMasterList(prevData =>
              prevData.map(item =>
                item.ApprovalDocumentCategoryId === formData.ApprovalDocumentCategoryId ? updatedRecord : item
              )
            );

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingApprovalDocumentCategoryMasterData(null);
        } else {
          addToast({ type: 'error', title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      Number(formData.ApprovalDocumentCategoryId) === 0 ? 'Add Approval Document Category' : 'Update Approval Document Category'
    );
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const downloadExcelSampleApprovalDocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'APPROVAL DOCUMENT CATEGORY'
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          'Excel',
          'Approval Document Category',
          addToast,
          'Sample file download successfully'
        );

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Downloading'
    );
  };


  const handleDownloadExcelSampleApprovalDocumentCategoryMaster = () => downloadExcelSampleApprovalDocumentCategoryMaster();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", 'APPROVAL DOCUMENT CATEGORY');
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: "Excel imported sucessfully" })

          fetchApprovalDocumentCategoryList();

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

  //#region DELETE APPROVAL DOCUMENT CATEGORY MASTER
  const handleDeleteApprovalDocumentCategoryMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteApprovalDocumentCategoryMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: DeleteApprovalDocumentCategoryMasterRequest = {
          ApprovalDocumentCategoryId: deleteApprovalDocumentCategoryMasterDetailsData.ApprovalDocumentCategoryId,
          Uniquekey: deleteApprovalDocumentCategoryMasterDetailsData.Uniquekey,
          ProjectId: Number(projectId)
        };

        const response =
          await approvalDocumentCategoryMasterService.apiCallDeleteApprovalDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          setApprovalDocumentCategoryMasterList(prevData =>
            prevData.filter(
              item =>
                item.ApprovalDocumentCategoryId !==
                deleteApprovalDocumentCategoryMasterDetailsData.ApprovalDocumentCategoryId
            )
          );

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteApprovalDocumentCategoryMasterDetailsData(null);
        } else {
          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Delete Approval Document Category'
    );
  };
  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Approval Document Category"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchApprovalDocumentCategories}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeApprovalDocumentCategoryMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddApprovalDocumentCategoryModal}
        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleApprovalDocumentCategoryMaster}
        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportApprovalDocumentCategoryExcel}
        onExportPdf={handleExportApprovalDocumentCategoryPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE APPROVAL DOCUMENT CATEGORY */}
      <DataTable
        data={approvalDocumentCategoryListForTable}
        columns={visibleApprovalDocumentCategoryMasterColumns}
        pagination={approvalDocumentCategoryMasterPaginationInfo}
        emptyMessage="No Approval Document Category Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />

      {/* VIEW APPROVAL DOCUMENT CATEGORY MODAL */}
      <ViewApprovalDocumentCategoryDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewApprovalDocumentCategoryMasterDetailsData(null);
        }}
        data={viewApprovalDocumentCategoryMasterDetailsData}
      />

      {/*  ADD EDIT UPDATE APPROVAL DOCUMENT CATEGORY MODAL */}
      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingApprovalDocumentCategoryMasterData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingApprovalDocumentCategoryMasterData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        title={editingApprovalDocumentCategoryMasterData ? 'Update Approval Document Category' : 'Add Approval Document Category'}
        onSubmit={handleAddUpdateApprovalDocumentCategoryMaster}
        saveText={
          editingApprovalDocumentCategoryMasterData ? 'Update' : 'Add'
        }
        resetText="Reset"
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4">
            <div>
              <Input
                label="Approval Document Category"
                required
                error={errors.approvalDocumentCategory}
                type="text"
                value={formData.ApprovalDocumentCategory}
                maxLength={200}
                onChange={e => handleFieldChange('ApprovalDocumentCategory', e.target.value)}
                placeholder="Enter Approval Document Category"
              />
            </div>

            <div>
              <Input
                label="Order By"
                required
                error={errors.OrderBy}
                value={formData.OrderBy.toString()}
                onChange={e => handleFieldChange('OrderBy', Number(e.target.value))}
                placeholder="Enter Order"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* CUSTOMIZE COLUMNS MODAL */}
      <CustomizeColumnsModal
        isOpen={isShowCustomizeApprovalDocumentCategoryMasterColumnsModal}
        onClose={() => setIsShowCustomizeApprovalDocumentCategoryMasterColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredApprovalDocumentCategoryMasterColumnKeys])
          );

          setSelectedApprovalDocumentCategoryMasterColumnKeys(withRequired);

          try {
            LocalStorageHelper.storeApprovalDocumentCategoryMasterTableColumns(JSON.stringify(withRequired));
          } catch { }
        }}
        columns={approvalDocumentCategoryMasterColumns}
        selectedKeys={selectedApprovalDocumentCategoryMasterColumnKeys}
        requiredKeys={requiredApprovalDocumentCategoryMasterColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER APPROVAL DOCUMENT CATEGORY MODAL */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Approval Document Category Master"
        onSubmit={e => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply Filter"
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label="Approval Document Category"
                type="text"
                value={tempFilters.ApprovalDocumentCategory}
                onChange={e => handleFilterChange('approvalDocumentCategory', e.target.value)}
                placeholder="Enter approval document category"
              />
            </div>

          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION APPROVAL DOCUMENT CATEGORY MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteApprovalDocumentCategoryMasterDetailsData(null);
        }}
        onConfirm={handleDeleteApprovalDocumentCategoryMaster}
        title="You are about to delete an approval document category?"
        message="Deleting this approval document category will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

      <ExportImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={(file, mergeExisting) => {
          setShowImportModal(false);
          uploadExcel(file, mergeExisting);
        }}
      />
    </div>
  );
};

export default ApprovalDocumentCategoryMaster;

