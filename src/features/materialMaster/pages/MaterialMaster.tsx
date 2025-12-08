import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateMaterialMasterRequest,
  DeleteMaterialMasterRequest,
  MaterialMasterData,
  FilterWithPaginationMaterialMaster
} from '@/features/materialMaster/models/MaterialMasterModel';

import { materialMasterService } from '@/features/materialMaster/services/MaterialMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Edit, Trash2, } from 'lucide-react';
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


const initialFormState = (): AddUpdateMaterialMasterRequest => ({
  MaterialMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  MaterialCode: '',
  MaterialName: ''
});

export const MaterialMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [materialMasterList, setMaterialMasterList] = useState<MaterialMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchMaterials(value)
  }, 350)

  //VIEW MATERIAL MASTER MODAL STATES
  const [viewMaterialMasterDetailsData, setViewMaterialMasterDetailsData] = useState<MaterialMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT MATERIAL MASTER
  const [editingMaterialMasterData, setEditingMaterialMasterData] = useState<MaterialMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  
  //ADD UPDATE MATERIAL MASTER
    const [formData, setFormData] = useState<AddUpdateMaterialMasterRequest>(() => initialFormState());
  
  //DELETE MATERIAL MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteMaterialMasterDetailsData, setDeleteMaterialMasterDetailsData] = useState<MaterialMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeMaterialMasterColumnsModal, setIsShowCustomizeMaterialMasterColumnsModal] = useState(false);


  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialMaterials = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialMaterials.current) return

    hasFetchedInitialMaterials.current = true;

    fetchMaterialList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingMaterialMasterData) {
        setFormData({
          MaterialMasterId: editingMaterialMasterData.MaterialMasterId,
          Uniquekey: editingMaterialMasterData.Uniquekey || initialFormState().Uniquekey,
          MaterialCode: editingMaterialMasterData.MaterialCode?.toString() || '',
          MaterialName: editingMaterialMasterData.MaterialName || ''
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingMaterialMasterData]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchMaterialList = async (page: number = pagination.currentPage) => {
    return await loadMaterials(page, filters);
  }

  const loadMaterials = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = materialMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationMaterialMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          MaterialMasterId: filterParams.MaterialMasterId ? Number(filterParams.MaterialMasterId) : 0,
          MaterialName: filterParams.MaterialName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getMaterials(params);

        if (E.isRight(response)) {

          setMaterialMasterList(response.right.Data);

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
      'Loading Material'
    )
  }
  //#endregion

  //#region SERACH MATERIAL 
  const searchMaterials = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchMaterialList();

      return
    }

    const filterParams: FilterInfo = {
      MaterialName: searchValue.trim(),
    };

    await loadMaterials(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH MATERIAL 
  const clearsearchMaterials = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchMaterialList();
  }

  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportMaterials = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = materialMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationMaterialMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          MaterialName: filters.MaterialName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getMaterials(params);

        handleExportFile(response, exportType, 'Material Master', addToast)

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

  const handleExportMaterialExcel = () => handleExportMaterials('Excel')
  const handleExportMaterialPdf = () => handleExportMaterials('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET MATERIAL 

  const getMaterials = async (filterParams: FilterWithPaginationMaterialMaster) => {

    return await materialMasterService.apiCallPullMaterialMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchMaterialList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchMaterialList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const materialMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const materialListForTable = useMemo(() => materialMasterList, [materialMasterList]);
  //#endregion

  //#region VIEW EDIT
  const handleViewMaterialDetails = useCallback((row: MaterialMasterData) => {
    setViewMaterialMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  //#endregion

  //#region EDIT MATERIAL MASTER

  const handleEditMaterialMaster = useCallback((row: MaterialMasterData) => {
    setEditingMaterialMasterData({
      ...row,
      MaterialCode: row.MaterialCode || '',
      MaterialName: row.MaterialName || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])


  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: MaterialMasterData) => {
    setDeleteMaterialMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const materialMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'MaterialName',
        label: 'Material Name',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>

            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={30}
              onClick={() => handleViewMaterialDetails(row)} // just pass a function, no need for e.preventDefault here
            />

          </div>
        )
      },
      {
        key: 'MaterialCode',
        label: 'Material Code',
        width: '30',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      }
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleViewMaterialDetails, handleEditMaterialMaster, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredMaterialMasterColumnKeys: string[] = ['MaterialName'];

  const allMaterialMasterColumnKeys: string[] = materialMasterColumns.map(c => c.key)

  const [selectedMaterialMasterColumnKeys, setSelectedMaterialMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getMaterialMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredMaterialMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allMaterialMasterColumnKeys.includes(k));

      }
    } catch { }
    return allMaterialMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedMaterialMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredMaterialMasterColumnKeys])).filter(k => allMaterialMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialMasterColumns.length])

  const visibleMaterialMasterColumns = useMemo(
    () => materialMasterColumns.filter(col => selectedMaterialMasterColumnKeys.includes(col.key)),
    [materialMasterColumns, selectedMaterialMasterColumnKeys]
  )

  //#endregion

  //#region VIEW MATERIAL DETAILS MODAL COMPONENT

  interface ViewMaterialDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: MaterialMasterData | null
  }

  const ViewMaterialDetailsModal: React.FC<ViewMaterialDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Material Master Details"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
        size='xl'
      >
        <div className="space-y-6">

          <div className="space-y-4">
            <FieldItem label="Material Code" value={data.MaterialCode?.toString()} isRow withBorder={true} />
            <FieldItem label="Material Name" value={data.MaterialName} isRow withBorder={true} className='font-medium text-blue-900 ' />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold pb-2">
              Action Details
            </h4>

            <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />

            {data.ModifiedBy !== '' ?
              <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />

              :
              ''}
          </div>
          <div className="flex justify-between items-center pt-4">

            {canAction && (
              <>
                <Button
                  color='red'
                  variant='solid'
                  colorMode="light"
                  size='sm'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleConfirmationDialogBoxOpen(data)
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                  Delete
                </Button>


                <Button
                  color='blue'
                  size='sm'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleEditMaterialMaster(data)
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
    )
  }


  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadMaterials(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadMaterials(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT MATERIAL MASTER

  const handleFieldChange = (field: keyof AddUpdateMaterialMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddMaterialModal = () => {
    setEditingMaterialMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddMaterialMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.MaterialName.trim() === "") {

      newErrors.MaterialName = "Material Name is required"
    }
    else if (formData.MaterialName.length < 3) {
      newErrors.MaterialName = "Material Name must be at least 3 characters long"
    }

    if (formData.MaterialCode.trim() === "") {
      newErrors.MaterialCode = "Material Code is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushMaterialMasterFormData = (): AddUpdateMaterialMasterRequest => {
    return {
      MaterialMasterId: formData.MaterialMasterId,
      Uniquekey: formData.Uniquekey,
      MaterialCode: formData.MaterialCode,
      MaterialName: formData.MaterialName
    };

  };

  const handleAddUpdateMaterialMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddMaterialMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushMaterialMasterFormData();

        const response = await materialMasterService.apiCallToAddUpdateMaterialMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.MaterialMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as MaterialMasterData

            setMaterialMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as MaterialMasterData;

            setMaterialMasterList(prevData =>
              prevData.map(item =>
                item.MaterialMasterId === formData.MaterialMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingMaterialMasterData(null);
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

      Number(formData.MaterialMasterId) === 0 ? 'Add Material' : 'Update Material'
    )

  };

  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const excelImportMaterialMaster = async () => {

    await runApiWithLoader(

      setIsLoading,

      setIsLoadingMessage,

      async () => {


        return null;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Import failed' })
      },
      undefined,
      'Preparing Import'
    )
  }


  const downloadExcelSampleMaterialMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'MATERIAL MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Material Master', addToast, 'Sample file download successfully')

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Downloading'
    )
  }

  const handleExcelImportMaterialMaster = () => excelImportMaterialMaster()
  const handleDownloadExcelSampleMaterialMaster = () => downloadExcelSampleMaterialMaster()



  //#endregion

  //#region DELETE MATERIAL MASTER
  const handleDeleteMaterialMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteMaterialMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteMaterialMasterRequest = {
          MaterialMasterId: deleteMaterialMasterDetailsData.MaterialMasterId,
          Uniquekey: deleteMaterialMasterDetailsData.Uniquekey
        }

        const response = await materialMasterService.apiCallDeleteMaterialMaster(params);

        if (E.isRight(response)) {

          setMaterialMasterList(prevData => prevData.filter(item => item.MaterialMasterId !== deleteMaterialMasterDetailsData.MaterialMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteMaterialMasterDetailsData(null);

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
      'Delete Material'
    )
  }

  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
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
          searchPlaceholder="Search By Material Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchMaterials}
          isShowFilterButton={false}
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeMaterialMasterColumnsModal(true)}
          // ADD
          isShowAddButton={canAction}
          addTitle="Add Material"
          onAdd={handleAddMaterialModal}

          // IMPORT
          isShowImportButton={canAction}
          onUploadExcel={handleExcelImportMaterialMaster}
          onDownloadSampleExcel={handleDownloadExcelSampleMaterialMaster}

          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportMaterialExcel}
          onExportPdf={handleExportMaterialPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE MATERIAL */}
        <DataTable
          data={materialListForTable}
          columns={visibleMaterialMasterColumns}
          pagination={materialMasterPaginationInfo}
          emptyMessage="No Materials Data Found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
          loading={isLoading}
        />

        {/* VIEW MATERIAL MODAL */}
        <ViewMaterialDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewMaterialMasterDetailsData(null)
          }}
          data={viewMaterialMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE MATERIAL MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false);
            setEditingMaterialMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false);
            setEditingMaterialMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          title={editingMaterialMasterData ? 'Update Material' : 'Add Material'}
          onSubmit={handleAddUpdateMaterialMaster}
          saveText={editingMaterialMasterData ? 'Update Material' : 'Save Material'}
          resetText='Reset'
          loading={isLoading}
          size='xl'
        >
          <div className="space-y-10 p-6 bg-blue-100">
            <div className="space-y-4" >
              <div>
                <Input
                  label='Material Code'
                  required
                  error={errors.MaterialCode}
                  type="text"
                  value={formData.MaterialCode.toUpperCase()}
                  maxLength={4}
                  onChange={(e) => handleFieldChange('MaterialCode', e.target.value)}
                  placeholder="Enter Material Code"
                />

              </div>

              <div>
                <Input
                  label='Material Name'
                  required
                  error={errors.MaterialName}
                  type="text"
                  value={formData.MaterialName}
                  maxLength={500}
                  onChange={(e) => handleFieldChange('MaterialName', e.target.value)}
                  placeholder="Enter Material Name"
                />

              </div>
            </div>
          </div>

        </Modal>
        {/* CUSTOMIZE COLUMNS MODAL */}


        <CustomizeColumnsModal
          isOpen={isShowCustomizeMaterialMasterColumnsModal}
          onClose={() => setIsShowCustomizeMaterialMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredMaterialMasterColumnKeys]),
            )

            setSelectedMaterialMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeMaterialMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={materialMasterColumns}
          selectedKeys={selectedMaterialMasterColumnKeys}
          requiredKeys={requiredMaterialMasterColumnKeys}
          title="Customize Table Columns"
        />

        {/* FILTER MATERIAL MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Material Master"
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
                  label='Material Name'
                  type="text"
                  value={tempFilters.MaterialName || ''}
                  onChange={(e) => handleFilterChange('MaterialName', e.target.value)}
                  placeholder="Enter material name"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION MATERIAL MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteMaterialMasterDetailsData(null)
          }}
          onConfirm={handleDeleteMaterialMaster}
          title="You are about to delete a material?"
          message="Deleting this material will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />


      </div>
    </>

  )
}

export default MaterialMaster
