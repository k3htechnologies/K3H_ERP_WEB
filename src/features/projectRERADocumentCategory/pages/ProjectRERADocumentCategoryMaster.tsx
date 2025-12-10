import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateProjectRERADocumentCategoryMasterRequest,
  DeleteProjectRERADocumentCategoryMasterRequest,
  ProjectRERADocumentCategoryMasterData,
  FilterWithPaginationProjectRERADocumentCategoryMaster
} from '@/features/projectRERADocumentCategory/models/ProjectRERADocumentCategoryMasterModel';

import { projectRERADocumentCategoryMasterService } from '@/features/projectRERADocumentCategory/services/ProjectRERADocumentCategoryMasterService';
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

const initialFormState = (): AddUpdateProjectRERADocumentCategoryMasterRequest => ({
  ProjectRERADocumentCategoryId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  ProjectRERADocumentCategory: '',
  OrderBy: 0
});

var projectId=5;

export const ProjectRERADocumentCategoryMaster: React.FC = () => {
  //#region STATE MANAGEMENT
  const [projectRERADocumentCategoryMasterList, setProjectRERADocumentCategoryMasterList] = useState<ProjectRERADocumentCategoryMasterData[]>([]);
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
    searchProjectRERADocumentCategories(value);
  }, 350);

  //VIEW PROJECT RERA DOCUMENT CATEGORY MASTER MODAL STATES
  const [viewProjectRERADocumentCategoryMasterDetailsData, setViewProjectRERADocumentCategoryMasterDetailsData] =
    useState<ProjectRERADocumentCategoryMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT PROJECT RERA DOCUMENT CATEGORY MASTER
  const [editingProjectRERADocumentCategoryMasterData, setEditingProjectRERADocumentCategoryMasterData] =
    useState<ProjectRERADocumentCategoryMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE PROJECT RERA DOCUMENT CATEGORY MASTER
  const [formData, setFormData] = useState<AddUpdateProjectRERADocumentCategoryMasterRequest>(() => initialFormState());

  //DELETE PROJECT RERA DOCUMENT CATEGORY MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteProjectRERADocumentCategoryMasterDetailsData, setDeleteProjectRERADocumentCategoryMasterDetailsData] =
    useState<ProjectRERADocumentCategoryMasterData | null>(null);

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeProjectRERADocumentCategoryMasterColumnsModal, setIsShowCustomizeProjectRERADocumentCategoryMasterColumnsModal] =
    useState(false);
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialProjectRERADocumentCategories = useRef(false);

  useEffect(() => {
    if (hasFetchedInitialProjectRERADocumentCategories.current) return;

    hasFetchedInitialProjectRERADocumentCategories.current = true;

    fetchProjectRERADocumentCategoryList();
  }, []);

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingProjectRERADocumentCategoryMasterData) {
        setFormData({
          ProjectRERADocumentCategoryId: editingProjectRERADocumentCategoryMasterData.ProjectRERADocumentCategoryId,
          Uniquekey: editingProjectRERADocumentCategoryMasterData.Uniquekey || initialFormState().Uniquekey,
          ProjectId: editingProjectRERADocumentCategoryMasterData.ProjectId || 0,
          ProjectRERADocumentCategory: editingProjectRERADocumentCategoryMasterData.ProjectRERADocumentCategoryName || '',
          OrderBy: editingProjectRERADocumentCategoryMasterData.OrderBy || 0
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingProjectRERADocumentCategoryMasterData]);
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const fetchProjectRERADocumentCategoryList = async (page: number = pagination.currentPage) => {
    return await loadProjectRERADocumentCategories(page, filters);
  };

  const loadProjectRERADocumentCategories = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {
          const column = projectRERADocumentCategoryMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationProjectRERADocumentCategoryMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectRERADocumentCategoryId: filterParams.ProjectRERADocumentCategoryId ? Number(filterParams.ProjectRERADocumentCategoryId) : 0,
          ProjectRERADocumentCategory: filterParams.ProjectRERADocumentCategory?.trim() || undefined,
          // ProjectId: filterParams.ProjectId ? Number(filterParams.ProjectId) : undefined,
          ProjectId: projectId,
          SortBy: sortByParam
        };

        const response = await getProjectRERADocumentCategories(params);

        if (E.isRight(response)) {
          setProjectRERADocumentCategoryMasterList(response.right.Data);

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
      'Loading Project RERA Document Category'
    );
  };
  //#endregion

  //#region SERACH PROJECT RERA DOCUMENT CATEGORY
  const searchProjectRERADocumentCategories = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchProjectRERADocumentCategoryList();
      return;
    }

    const filterParams: FilterInfo = {
      ProjectRERADocumentCategory: searchValue.trim()
    };

    await loadProjectRERADocumentCategories(1, filterParams);
  };
  //#endregion

  //#region CLEAR SERACH PROJECT RERA DOCUMENT CATEGORY
  const clearsearchProjectRERADocumentCategories = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchProjectRERADocumentCategoryList();
  };
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportProjectRERADocumentCategories = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined;
        if (sortInfo) {
          const column = projectRERADocumentCategoryMasterColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationProjectRERADocumentCategoryMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectRERADocumentCategory: filters.ProjectRERADocumentCategory?.trim() || undefined,
          ProjectId: filters.ProjectId ? Number(filters.ProjectId) : undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getProjectRERADocumentCategories(params);

        handleExportFile(response, exportType, 'Project RERA Document Category Master', addToast);

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

  const handleExportProjectRERADocumentCategoryExcel = () => handleExportProjectRERADocumentCategories('Excel');
  const handleExportProjectRERADocumentCategoryPdf = () => handleExportProjectRERADocumentCategories('PDF');
  //#endregion

  //#region API | SERVICES CALL TO GET PROJECT RERA DOCUMENT CATEGORY
  const getProjectRERADocumentCategories = async (filterParams: FilterWithPaginationProjectRERADocumentCategoryMaster) => {
    return await projectRERADocumentCategoryMasterService.apiCallPullProjectRERADocumentCategoryMaster(filterParams);
  };
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = (page: number) => {
    fetchProjectRERADocumentCategoryList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchProjectRERADocumentCategoryList(1);
  };
  //#endregion

  //#region TABLE PAGINATION INFO
  const projectRERADocumentCategoryMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  );

  const projectRERADocumentCategoryListForTable = useMemo(
    () => projectRERADocumentCategoryMasterList,
    [projectRERADocumentCategoryMasterList]
  );
  //#endregion

  //#region VIEW EDIT
  const handleViewProjectRERADocumentCategoryDetails = useCallback((row: ProjectRERADocumentCategoryMasterData) => {
    setViewProjectRERADocumentCategoryMasterDetailsData(row);
    setIsViewModalOpen(true);
  }, []);
  //#endregion

  //#region EDIT PROJECT RERA DOCUMENT CATEGORY MASTER
  const handleEditProjectRERADocumentCategoryMaster = useCallback((row: ProjectRERADocumentCategoryMasterData) => {
    setEditingProjectRERADocumentCategoryMasterData({
      ...row,
      ProjectId: row.ProjectId || 0,
      ProjectRERADocumentCategoryName: row.ProjectRERADocumentCategoryName || '',
      OrderBy: row.OrderBy || 0
    });
    setIsAddUpdateModalOpen(true);
  }, []);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: ProjectRERADocumentCategoryMasterData) => {
    setDeleteProjectRERADocumentCategoryMasterDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);
  //#endregion

  //#region TABLE COLUMN
  const projectRERADocumentCategoryMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ProjectRERADocumentCategoryName',
        label: 'Project RERA Document Category',
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
              onClick={() => handleViewProjectRERADocumentCategoryDetails(row)}
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
    [canAction, handleViewProjectRERADocumentCategoryDetails, handleEditProjectRERADocumentCategoryMaster, handleConfirmationDialogBoxOpen]
  );
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredProjectRERADocumentCategoryMasterColumnKeys: string[] = ['ProjectRERADocumentCategory'];

  const allProjectRERADocumentCategoryMasterColumnKeys: string[] = projectRERADocumentCategoryMasterColumns.map(c => c.key);

  const [selectedProjectRERADocumentCategoryMasterColumnKeys, setSelectedProjectRERADocumentCategoryMasterColumnKeys] = useState<string[]>(
    () => {
      try {
        const saved = LocalStorageHelper.getProjectRERADocumentCategoryMasterTableColumns();

        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          // Ensure required columns are always present
          const withRequired = Array.from(new Set([...parsed, ...requiredProjectRERADocumentCategoryMasterColumnKeys]));

          // Filter out any keys that no longer exist
          return withRequired.filter(k => allProjectRERADocumentCategoryMasterColumnKeys.includes(k));
        }
      } catch { }
      return allProjectRERADocumentCategoryMasterColumnKeys;
    }
  );

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere
    setSelectedProjectRERADocumentCategoryMasterColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredProjectRERADocumentCategoryMasterColumnKeys])).filter(k =>
        allProjectRERADocumentCategoryMasterColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectRERADocumentCategoryMasterColumns.length]);

  const visibleProjectRERADocumentCategoryMasterColumns = useMemo(
    () =>
      projectRERADocumentCategoryMasterColumns.filter(col =>
        selectedProjectRERADocumentCategoryMasterColumnKeys.includes(col.key)
      ),
    [projectRERADocumentCategoryMasterColumns, selectedProjectRERADocumentCategoryMasterColumnKeys]
  );
  //#endregion

  //#region VIEW PROJECT RERA DOCUMENT CATEGORY DETAILS MODAL COMPONENT
  interface ViewProjectRERADocumentCategoryDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ProjectRERADocumentCategoryMasterData | null;
  }

  const ViewProjectRERADocumentCategoryDetailsModal: React.FC<ViewProjectRERADocumentCategoryDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Project RERA Document Category Master Details"
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
              value={data.ProjectRERADocumentCategoryName}
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
                    handleEditProjectRERADocumentCategoryMaster(data);
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
    loadProjectRERADocumentCategories(1, tempFilters);
    setShowFilterPopup(false);
  };
  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadProjectRERADocumentCategories(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHNAGE
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT PROJECT RERA DOCUMENT CATEGORY MASTER
  const handleFieldChange = (field: keyof AddUpdateProjectRERADocumentCategoryMasterRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddProjectRERADocumentCategoryModal = () => {
    setEditingProjectRERADocumentCategoryMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  };

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddProjectRERADocumentCategoryMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (formData.ProjectRERADocumentCategory.trim() === '') {
      newErrors.ProjectRERADocumentCategory = 'Project RERA Document Category is required';
    } else if (formData.ProjectRERADocumentCategory.length < 3) {
      newErrors.ProjectRERADocumentCategory = 'Project RERA Document Category must be at least 3 characters long';
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

  const PushProjectRERADocumentCategoryMasterFormData = (): AddUpdateProjectRERADocumentCategoryMasterRequest => {
    return {
      ProjectRERADocumentCategoryId: formData.ProjectRERADocumentCategoryId,
      Uniquekey: formData.Uniquekey,
      ProjectId: formData.ProjectId,
      ProjectRERADocumentCategory: formData.ProjectRERADocumentCategory,
      OrderBy: formData.OrderBy
    };
  };

  const handleAddUpdateProjectRERADocumentCategoryMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddProjectRERADocumentCategoryMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const payload = PushProjectRERADocumentCategoryMasterFormData();

        const response =
          await projectRERADocumentCategoryMasterService.apiCallAddUpdateProjectRERADocumentCategoryMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.ProjectRERADocumentCategoryId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProjectRERADocumentCategoryMasterData;

            setProjectRERADocumentCategoryMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          } else {
            const updatedRecord = response.right.Data[0] as ProjectRERADocumentCategoryMasterData;

            setProjectRERADocumentCategoryMasterList(prevData =>
              prevData.map(item =>
                item.ProjectRERADocumentCategoryId === formData.ProjectRERADocumentCategoryId ? updatedRecord : item
              )
            );

            addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          }

          setEditingProjectRERADocumentCategoryMasterData(null);
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
      Number(formData.ProjectRERADocumentCategoryId) === 0 ? 'Add Project RERA Document Category' : 'Update Project RERA Document Category'
    );
  };
  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD
  const excelImportProjectRERADocumentCategoryMaster = async () => {
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

  const downloadExcelSampleProjectRERADocumentCategoryMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterPullExcelSample = {
          TableName: 'PROJECT RERA DOCUMENT CATEGORY MASTER'
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          'Excel',
          'Project RERA Document Category Master',
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

  const handleExcelImportProjectRERADocumentCategoryMaster = () => excelImportProjectRERADocumentCategoryMaster();
  const handleDownloadExcelSampleProjectRERADocumentCategoryMaster = () =>
    downloadExcelSampleProjectRERADocumentCategoryMaster();
  //#endregion

  //#region DELETE PROJECT RERA DOCUMENT CATEGORY MASTER
  const handleDeleteProjectRERADocumentCategoryMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteProjectRERADocumentCategoryMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: DeleteProjectRERADocumentCategoryMasterRequest = {
          ProjectRERADocumentCategoryId: deleteProjectRERADocumentCategoryMasterDetailsData.ProjectRERADocumentCategoryId,
          Uniquekey: deleteProjectRERADocumentCategoryMasterDetailsData.Uniquekey,
          ProjectId:1
        };

        const response =
          await projectRERADocumentCategoryMasterService.apiCallDeleteProjectRERADocumentCategoryMaster(params);

        if (E.isRight(response)) {
          setProjectRERADocumentCategoryMasterList(prevData =>
            prevData.filter(
              item =>
                item.ProjectRERADocumentCategoryId !==
                deleteProjectRERADocumentCategoryMasterDetailsData.ProjectRERADocumentCategoryId
            )
          );

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteProjectRERADocumentCategoryMasterDetailsData(null);
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
      'Delete Project RERA Document Category'
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
          searchPlaceholder="Search By Project RERA Document Category"
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearsearchProjectRERADocumentCategories}
          isShowFilterButton={false}
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters);
            setShowFilterPopup(true);
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeProjectRERADocumentCategoryMasterColumnsModal(true)}
          // ADD
          isShowAddButton={canAction}
          addTitle="Add"
          onAdd={handleAddProjectRERADocumentCategoryModal}
          // IMPORT
          isShowImportButton={canAction}
          onUploadExcel={handleExcelImportProjectRERADocumentCategoryMaster}
          onDownloadSampleExcel={handleDownloadExcelSampleProjectRERADocumentCategoryMaster}
          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportProjectRERADocumentCategoryExcel}
          onExportPdf={handleExportProjectRERADocumentCategoryPdf}
          exportLoading={isLoading}
        />

        {/* DATA TABLE PROJECT RERA DOCUMENT CATEGORY */}
        <DataTable
          data={projectRERADocumentCategoryListForTable}
          columns={visibleProjectRERADocumentCategoryMasterColumns}
          pagination={projectRERADocumentCategoryMasterPaginationInfo}
          emptyMessage="No Project RERA Document Category Data Found"
          fixedHeight={true}
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
          loading={isLoading}
        />

        {/* VIEW PROJECT RERA DOCUMENT CATEGORY MODAL */}
        <ViewProjectRERADocumentCategoryDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewProjectRERADocumentCategoryMasterDetailsData(null);
          }}
          data={viewProjectRERADocumentCategoryMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE PROJECT RERA DOCUMENT CATEGORY MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false);
            setEditingProjectRERADocumentCategoryMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false);
            setEditingProjectRERADocumentCategoryMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          title={editingProjectRERADocumentCategoryMasterData ? 'Update Project RERA Document Category' : 'Add Project RERA Document Category'}
          onSubmit={handleAddUpdateProjectRERADocumentCategoryMaster}
          saveText={
            editingProjectRERADocumentCategoryMasterData ? 'Update Project RERA Document Category' : 'Save Project RERA Document Category'
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
                  label="Project RERA Document Category"
                  required
                  error={errors.projectRERADocumentCategory}
                  type="text"
                  value={formData.ProjectRERADocumentCategory}
                  maxLength={200}
                  onChange={e => handleFieldChange('ProjectRERADocumentCategory', e.target.value)}
                  placeholder="Enter Project RERA Document Category"
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
          isOpen={isShowCustomizeProjectRERADocumentCategoryMasterColumnsModal}
          onClose={() => setIsShowCustomizeProjectRERADocumentCategoryMasterColumnsModal(false)}
          onApply={keys => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredProjectRERADocumentCategoryMasterColumnKeys])
            );

            setSelectedProjectRERADocumentCategoryMasterColumnKeys(withRequired);

            try {
              LocalStorageHelper.storeProjectRERADocumentCategoryMasterTableColumns(JSON.stringify(withRequired));
            } catch { }
          }}
          columns={projectRERADocumentCategoryMasterColumns}
          selectedKeys={selectedProjectRERADocumentCategoryMasterColumnKeys}
          requiredKeys={requiredProjectRERADocumentCategoryMasterColumnKeys}
          title="Customize Table Columns"
        />

        {/* FILTER PROJECT RERA DOCUMENT CATEGORY MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Project RERA Document Category Master"
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
                  label="Project RERA Document Category"
                  type="text"
                  value={tempFilters.ProjectRERADocumentCategory || ''}
                  onChange={e => handleFilterChange('ProjectRERADocumentCategory', e.target.value)}
                  placeholder="Enter project rera document category"
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

        {/* DELETE CONFIRMATION PROJECT RERA DOCUMENT CATEGORY MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false);
            setDeleteProjectRERADocumentCategoryMasterDetailsData(null);
          }}
          onConfirm={handleDeleteProjectRERADocumentCategoryMaster}
          title="You are about to delete a project rera document category?"
          message="Deleting this project rera document category will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
  );
};

export default ProjectRERADocumentCategoryMaster;
