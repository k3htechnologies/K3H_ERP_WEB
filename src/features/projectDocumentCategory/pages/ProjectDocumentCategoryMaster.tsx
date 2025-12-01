import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateProjectDocumentCategoryMasterRequest,
  DeleteProjectDocumentCategoryMasterRequest,
  ProjectDocumentCategoryMasterData,
  FilterWithPaginationProjectDocumentCategoryMaster
} from '@/features/projectDocumentCategory/models/ProjectDocumentCategoryMasterModel';

import { projectDocumentCategoryMasterService } from '@/features/projectDocumentCategory/services/ProjectDocumentCategoryMasterService';
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

const initialFormState = (): AddUpdateProjectDocumentCategoryMasterRequest => ({
  ProjectDocumentCategoryId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  ProjectDocumentCategory: '',
  OrderBy: 0
});

export const ProjectDocumentCategoryMaster: React.FC = () => {
  //#region STATE MANAGEMENT
  const [projectDocumentCategoryMasterList, setProjectDocumentCategoryMasterList] = useState<ProjectDocumentCategoryMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchProjectDocumentCategories(value);
  }, 350);

  //VIEW PROJECT DOCUMENT CATEGORY MASTER MODAL STATES
  const [viewProjectDocumentCategoryMasterDetailsData, setViewProjectDocumentCategoryMasterDetailsData] =
    useState<ProjectDocumentCategoryMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT PROJECT DOCUMENT CATEGORY MASTER
  const [editingProjectDocumentCategoryMasterData, setEditingProjectDocumentCategoryMasterData] =
    useState<ProjectDocumentCategoryMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE PROJECT DOCUMENT CATEGORY MASTER
  const [formData, setFormData] = useState<AddUpdateProjectDocumentCategoryMasterRequest>(() => initialFormState());

  //DELETE PROJECT DOCUMENT CATEGORY MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteProjectDocumentCategoryMasterDetailsData, setDeleteProjectDocumentCategoryMasterDetailsData] =
    useState<ProjectDocumentCategoryMasterData | null>(null);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeProjectDocumentCategoryMasterColumnsModal, setIsShowCustomizeProjectDocumentCategoryMasterColumnsModal] =
    useState(false);
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialProjectDocumentCategories = useRef(false);

  useEffect(() => {
    if (hasFetchedInitialProjectDocumentCategories.current) return;

    hasFetchedInitialProjectDocumentCategories.current = true;

    fetchProjectDocumentCategoryList();
  }, []);

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingProjectDocumentCategoryMasterData) {
        setFormData({
          ProjectDocumentCategoryId: editingProjectDocumentCategoryMasterData.ProjectDocumentCategoryId,
          Uniquekey: editingProjectDocumentCategoryMasterData.Uniquekey || initialFormState().Uniquekey,
          ProjectId: editingProjectDocumentCategoryMasterData.ProjectId || 0,
          ProjectDocumentCategory: editingProjectDocumentCategoryMasterData.ProjectDocumentCategoryName || '',
          OrderBy: editingProjectDocumentCategoryMasterData.OrderBy || 0
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingProjectDocumentCategoryMasterData]);
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const fetchProjectDocumentCategoryList = async (page: number = pagination.currentPage) => {
    return await loadProjectDocumentCategories(page, filters);
  };

  const loadProjectDocumentCategories = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {
          const column = projectDocumentCategoryMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationProjectDocumentCategoryMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectDocumentCategoryId: filterParams.ProjectDocumentCategoryId ? Number(filterParams.ProjectDocumentCategoryId) : 0,
          ProjectDocumentCategory: filterParams.ProjectDocumentCategory?.trim() || undefined,
          // ProjectId: filterParams.ProjectId ? Number(filterParams.ProjectId) : undefined,
          ProjectId: 1,
          SortBy: sortByParam
        };

        const response = await getProjectDocumentCategories(params);

        if (E.isRight(response)) {
          setProjectDocumentCategoryMasterList(response.right.Data);

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
      'Loading Project Document Category'
    );
  };
  //#endregion

  //#region SERACH PROJECT DOCUMENT CATEGORY
  const searchProjectDocumentCategories = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchProjectDocumentCategoryList();
      return;
    }

    const filterParams: FilterInfo = {
      ProjectDocumentCategory: searchValue.trim()
    };

    await loadProjectDocumentCategories(1, filterParams);
  };
  //#endregion

  //#region CLEAR SERACH PROJECT DOCUMENT CATEGORY
  const clearsearchProjectDocumentCategories = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchProjectDocumentCategoryList();
  };
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportProjectDocumentCategories = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined;
        if (sortInfo) {
          const column = projectDocumentCategoryMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationProjectDocumentCategoryMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectDocumentCategory: filters.ProjectDocumentCategory?.trim() || undefined,
          ProjectId: filters.ProjectId ? Number(filters.ProjectId) : undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getProjectDocumentCategories(params);

        handleExportFile(response, exportType, 'Project Document Category Master', addToast);

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

  const handleExportProjectDocumentCategoryExcel = () => handleExportProjectDocumentCategories('Excel');
  const handleExportProjectDocumentCategoryPdf = () => handleExportProjectDocumentCategories('PDF');
  //#endregion

  //#region API | SERVICES CALL TO GET PROJECT DOCUMENT CATEGORY
  const getProjectDocumentCategories = async (filterParams: FilterWithPaginationProjectDocumentCategoryMaster) => {
    return await projectDocumentCategoryMasterService.apiCallPullProjectDocumentCategoryMaster(filterParams);
  };
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = (page: number) => {
    fetchProjectDocumentCategoryList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchProjectDocumentCategoryList(1);
  };
  //#endregion

  //#region TABLE PAGINATION INFO
  const projectDocumentCategoryMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  );

  const projectDocumentCategoryListForTable = useMemo(
    () => projectDocumentCategoryMasterList,
    [projectDocumentCategoryMasterList]
  );
  //#endregion

  //#region VIEW EDIT
  const handleViewProjectDocumentCategoryDetails = useCallback((row: ProjectDocumentCategoryMasterData) => {
    setViewProjectDocumentCategoryMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);
  //#endregion

  //#region EDIT PROJECT DOCUMENT CATEGORY MASTER
  const handleEditProjectDocumentCategoryMaster = useCallback((row: ProjectDocumentCategoryMasterData) => {
    setEditingProjectDocumentCategoryMasterData({
      ...row,
      ProjectId: row.ProjectId || 0,
      ProjectDocumentCategoryName: row.ProjectDocumentCategoryName || '',
      OrderBy: row.OrderBy || 0
    });
    setIsAddUpdateModalOpen(true);
  }, []);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ProjectDocumentCategoryMasterData) => {
    setDeleteProjectDocumentCategoryMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region TABLE COLUMN
  const projectDocumentCategoryMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ProjectDocumentCategoryName',
        label: 'Project Document Category',
        width: '40',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={30}
              onClick={() => handleViewProjectDocumentCategoryDetails(row)}
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
      }
    ],
    [canAction, handleViewProjectDocumentCategoryDetails, handleEditProjectDocumentCategoryMaster, handleConfirmationDialogBoxOpen]
  );
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredProjectDocumentCategoryMasterColumnKeys: string[] = ['ProjectDocumentCategory'];

  const allProjectDocumentCategoryMasterColumnKeys: string[] = projectDocumentCategoryMasterColumns.map(c => c.key);

  const [selectedProjectDocumentCategoryMasterColumnKeys, setSelectedProjectDocumentCategoryMasterColumnKeys] = useState<string[]>(
    () => {
      try {
        const saved = LocalStorageHelper.getProjectDocumentCategoryMasterTableColumns();

        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          // Ensure required columns are always present
          const withRequired = Array.from(new Set([...parsed, ...requiredProjectDocumentCategoryMasterColumnKeys]));

          // Filter out any keys that no longer exist
          return withRequired.filter(k => allProjectDocumentCategoryMasterColumnKeys.includes(k));
        }
      } catch { }
      return allProjectDocumentCategoryMasterColumnKeys;
    }
  );

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere
    setSelectedProjectDocumentCategoryMasterColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredProjectDocumentCategoryMasterColumnKeys])).filter(k =>
        allProjectDocumentCategoryMasterColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDocumentCategoryMasterColumns.length]);

  const visibleProjectDocumentCategoryMasterColumns = useMemo(
    () =>
      projectDocumentCategoryMasterColumns.filter(col =>
        selectedProjectDocumentCategoryMasterColumnKeys.includes(col.key)
      ),
    [projectDocumentCategoryMasterColumns, selectedProjectDocumentCategoryMasterColumnKeys]
  );
  //#endregion

  //#region VIEW PROJECT DOCUMENT CATEGORY DETAILS MODAL COMPONENT
  interface ViewProjectDocumentCategoryDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ProjectDocumentCategoryMasterData | null;
  }

  const ViewProjectDocumentCategoryDetailsModal: React.FC<ViewProjectDocumentCategoryDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Project Document Category Master Details"
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
              value={data.ProjectDocumentCategoryName}
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
                    handleEditProjectDocumentCategoryMaster(data);
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
    loadProjectDocumentCategories(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadProjectDocumentCategories(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT PROJECT DOCUMENT CATEGORY MASTER
  const handleFieldChange = (field: keyof AddUpdateProjectDocumentCategoryMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddProjectDocumentCategoryModal = () => {
    setEditingProjectDocumentCategoryMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddProjectDocumentCategoryMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (formData.ProjectDocumentCategory.trim() === '') {
      newErrors.ProjectDocumentCategory = 'Project Document Category is required';
    } else if (formData.ProjectDocumentCategory.length < 3) {
      newErrors.ProjectDocumentCategory = 'Project Document Category must be at least 3 characters long';
    }

    if (formData.ProjectId === 0) {
      newErrors.ProjectId = 'Project Id is required';
    }

    if (formData.OrderBy === 0) {
      newErrors.OrderBy = 'Order By is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushProjectDocumentCategoryMasterFormData = (): AddUpdateProjectDocumentCategoryMasterRequest => {
    return {
      ProjectDocumentCategoryId: formData.ProjectDocumentCategoryId,
      Uniquekey: formData.Uniquekey,
      ProjectId: formData.ProjectId,
      ProjectDocumentCategory: formData.ProjectDocumentCategory,
      OrderBy: formData.OrderBy
    };
  };

  const handleAddUpdateProjectDocumentCategoryMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddProjectDocumentCategoryMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const payload = PushProjectDocumentCategoryMasterFormData();

        const response =
          await projectDocumentCategoryMasterService.apiCallAddUpdateProjectDocumentCategoryMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ProjectDocumentCategoryId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProjectDocumentCategoryMasterData;

            setProjectDocumentCategoryMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as ProjectDocumentCategoryMasterData;

            setProjectDocumentCategoryMasterList(prevData =>
              prevData.map(item =>
                item.ProjectDocumentCategoryId === formData.ProjectDocumentCategoryId ? updatedRecord : item
              )
            );

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingProjectDocumentCategoryMasterData(null);
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
      Number(formData.ProjectDocumentCategoryId) === 0 ? 'Add Project Document Category' : 'Update Project Document Category'
    );
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const excelImportProjectDocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        return null;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Import failed' });
      },
      undefined,
      'Preparing Import'
    );
  };

  const downloadExcelSampleProjectDocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'PROJECT DOCUMENT CATEGORY MASTER'
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          'Excel',
          'Project Document Category Master',
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

  const handleExcelImportProjectDocumentCategoryMaster = () => excelImportProjectDocumentCategoryMaster();
  const handleDownloadExcelSampleProjectDocumentCategoryMaster = () =>
    downloadExcelSampleProjectDocumentCategoryMaster();
  //#endregion

  //#region DELETE PROJECT DOCUMENT CATEGORY MASTER
  const handleDeleteProjectDocumentCategoryMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteProjectDocumentCategoryMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: DeleteProjectDocumentCategoryMasterRequest = {
          ProjectDocumentCategoryId: deleteProjectDocumentCategoryMasterDetailsData.ProjectDocumentCategoryId,
          Uniquekey: deleteProjectDocumentCategoryMasterDetailsData.Uniquekey,
          ProjectId:1
        };

        const response =
          await projectDocumentCategoryMasterService.apiCallDeleteProjectDocumentCategoryMaster(params);

        if (E.isRight(response)) {
          setProjectDocumentCategoryMasterList(prevData =>
            prevData.filter(
              item =>
                item.ProjectDocumentCategoryId !==
                deleteProjectDocumentCategoryMasterDetailsData.ProjectDocumentCategoryId
            )
          );

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteProjectDocumentCategoryMasterDetailsData(null);
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
      'Delete Project Document Category'
    );
  };
  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
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
          searchPlaceholder="Search By Project Document Category"
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearsearchProjectDocumentCategories}
          isShowFilterButton={false}
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters);
            setShowFilterPopup(true);
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeProjectDocumentCategoryMasterColumnsModal(true)}
          // ADD
          isShowAddButton={canAction}
          addTitle="Add Category"
          onAdd={handleAddProjectDocumentCategoryModal}
          // IMPORT
          isShowImportButton={canAction}
          onUploadExcel={handleExcelImportProjectDocumentCategoryMaster}
          onDownloadSampleExcel={handleDownloadExcelSampleProjectDocumentCategoryMaster}
          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportProjectDocumentCategoryExcel}
          onExportPdf={handleExportProjectDocumentCategoryPdf}
          exportLoading={isLoading}
        />

        {/* DATA TABLE PROJECT DOCUMENT CATEGORY */}
        <DataTable
          data={projectDocumentCategoryListForTable}
          columns={visibleProjectDocumentCategoryMasterColumns}
          pagination={projectDocumentCategoryMasterPaginationInfo}
          emptyMessage="No Project Document Category Data Found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
          loading={isLoading}
        />

        {/* VIEW PROJECT DOCUMENT CATEGORY MODAL */}
        <ViewProjectDocumentCategoryDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewProjectDocumentCategoryMasterDetailsData(null);
          }}
          data={viewProjectDocumentCategoryMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE PROJECT DOCUMENT CATEGORY MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false);
            setEditingProjectDocumentCategoryMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false);
            setEditingProjectDocumentCategoryMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          title={editingProjectDocumentCategoryMasterData ? 'Update Project Document Category' : 'Add Project Document Category'}
          onSubmit={handleAddUpdateProjectDocumentCategoryMaster}
          saveText={
            editingProjectDocumentCategoryMasterData ? 'Update Project Document Category' : 'Save Project Document Category'
          }
          resetText="Reset"
          loading={isLoading}
          size="xl"
        >
          <div className="space-y-10 p-6 bg-blue-100">
            <div className="space-y-4">
              <div>
                <Input
                  label="Project Id"
                  required
                  error={errors.ProjectId}
                  type="number"
                  value={formData.ProjectId.toString()}
                  onChange={e => handleFieldChange('ProjectId', Number(e.target.value))}
                  placeholder="Enter Project Id"
                />
              </div>

              <div>
                <Input
                  label="Project Document Category"
                  required
                  error={errors.projectDocumentCategory}
                  type="text"
                  value={formData.ProjectDocumentCategory}
                  maxLength={200}
                  onChange={e => handleFieldChange('ProjectDocumentCategory', e.target.value)}
                  placeholder="Enter Project Document Category"
                />
              </div>

              <div>
                <Input
                  label="Order By"
                  required
                  error={errors.OrderBy}
                  type="number"
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
          isOpen={isShowCustomizeProjectDocumentCategoryMasterColumnsModal}
          onClose={() => setIsShowCustomizeProjectDocumentCategoryMasterColumnsModal(false)}
          onApply={keys => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredProjectDocumentCategoryMasterColumnKeys])
            );

            setSelectedProjectDocumentCategoryMasterColumnKeys(withRequired);

            try {
              LocalStorageHelper.storeProjectDocumentCategoryMasterTableColumns(JSON.stringify(withRequired));
            } catch { }
          }}
          columns={projectDocumentCategoryMasterColumns}
          selectedKeys={selectedProjectDocumentCategoryMasterColumnKeys}
          requiredKeys={requiredProjectDocumentCategoryMasterColumnKeys}
          title="Customize Table Columns"
        />

        {/* FILTER PROJECT DOCUMENT CATEGORY MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Project Document Category Master"
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
                  label="Project Document Category"
                  type="text"
                  value={tempFilters.ProjectDocumentCategory || ''}
                  onChange={e => handleFilterChange('ProjectDocumentCategory', e.target.value)}
                  placeholder="Enter project document category"
                />
              </div>
              <div>
                <Input
                  label="Project Id"
                  type="number"
                  value={tempFilters.ProjectId || ''}
                  onChange={e => handleFilterChange('ProjectId', e.target.value)}
                  placeholder="Enter project id"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION PROJECT DOCUMENT CATEGORY MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false);
            setDeleteProjectDocumentCategoryMasterDetailsData(null);
          }}
          onConfirm={handleDeleteProjectDocumentCategoryMaster}
          title="You are about to delete a project document category?"
          message="Deleting this project document category will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  );
};

export default ProjectDocumentCategoryMaster;
