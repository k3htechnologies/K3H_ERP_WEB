import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateSubMaterialMasterRequest,
  DeleteSubMaterialMasterRequest,
  SubMaterialMasterData,
  FilterWithPaginationSubMaterialMaster
} from '@/features/subMaterialMaster/models/SubMaterialMasterModel';

import { subMaterialMasterService } from '@/features/subMaterialMaster/services/SubMaterialMasterService'
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
import { fetchMaterialMasterDropdown } from '@/features/materialMaster/materialMasterDropdown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchUOMMasterDropdown } from '@/features/uomMaster/uomMasterDropdown';


const initialFormState = (): AddUpdateSubMaterialMasterRequest => ({
  SubMaterialMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  MaterialMasterId: 0,
  SubMaterialName: '',
  UomMasterId: 0
});

export const SubMaterialMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [subMaterialMasterList, setSubMaterialMasterList] = useState<SubMaterialMasterData[]>([]);
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
    searchSubMaterials(value)
  }, 350)

  //VIEW SUB MATERIAL MASTER MODAL STATES
  const [viewSubMaterialMasterDetailsData, setViewSubMaterialMasterDetailsData] = useState<SubMaterialMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT SUB MATERIAL MASTER
  const [editingSubMaterialMasterData, setEditingSubMaterialMasterData] = useState<SubMaterialMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);


  //ADD UPDATE SUB MATERIAL MASTER
  const [formData, setFormData] = useState<AddUpdateSubMaterialMasterRequest>(() => initialFormState());

  //DELETE SUB MATERIAL MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteSubMaterialMasterDetailsData, setDeleteSubMaterialMasterDetailsData] = useState<SubMaterialMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeSubMaterialMasterColumnsModal, setIsShowCustomizeSubMaterialMasterColumnsModal] = useState(false);

  const [dropdownLabels, setDropdownLabels] = useState<{
    materialName?: string;
    uom?: string;
  }>({});

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialSubMaterials = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialSubMaterials.current) return

    hasFetchedInitialSubMaterials.current = true;

    fetchSubMaterialList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingSubMaterialMasterData) {
        setFormData({
          SubMaterialMasterId: editingSubMaterialMasterData.SubMaterialMasterId,
          Uniquekey: editingSubMaterialMasterData.Uniquekey || initialFormState().Uniquekey,
          MaterialMasterId: editingSubMaterialMasterData.MaterialMasterId || 0,
          SubMaterialName: editingSubMaterialMasterData.SubMaterialName || '',
          UomMasterId: editingSubMaterialMasterData.UomMasterId || 0
        });

        setDropdownLabels({
          materialName: editingSubMaterialMasterData.MaterialName || "",
          uom: editingSubMaterialMasterData.UomCode || ""
        });

      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingSubMaterialMasterData]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchSubMaterialList = async (page: number = pagination.currentPage) => {
    return await loadSubMaterials(page, filters);
  }

  const loadSubMaterials = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = subMaterialMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationSubMaterialMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          SubMaterialMasterId: filterParams.SubMaterialMasterId ? Number(filterParams.SubMaterialMasterId) : 0,
          SubMaterialName: filterParams.SubMaterialName?.trim() || undefined,
          MaterialName: filterParams.MaterialName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getSubMaterials(params);

        if (E.isRight(response)) {

          setSubMaterialMasterList(response.right.Data);

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
      'Loading Sub Material'
    )
  }
  //#endregion

  //#region SERACH SUB MATERIAL 
  const searchSubMaterials = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchSubMaterialList();

      return
    }

    const filterParams: FilterInfo = {
      SubMaterialName: searchValue.trim(),
    };

    await loadSubMaterials(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH SUB MATERIAL 
  const clearsearchSubMaterials = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchSubMaterialList();
  }

  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportSubMaterials = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = subMaterialMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationSubMaterialMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          SubMaterialName: filters.SubMaterialName?.trim() || undefined,
          MaterialName: filters.MaterialName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getSubMaterials(params);

        handleExportFile(response, exportType, 'Sub Material Master', addToast)

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

  const handleExportSubMaterialExcel = () => handleExportSubMaterials('Excel')
  const handleExportSubMaterialPdf = () => handleExportSubMaterials('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET SUB MATERIAL 

  const getSubMaterials = async (filterParams: FilterWithPaginationSubMaterialMaster) => {

    return await subMaterialMasterService.apiCallPullSubMaterialMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchSubMaterialList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchSubMaterialList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const subMaterialMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const subMaterialListForTable = useMemo(() => subMaterialMasterList, [subMaterialMasterList]);
  //#endregion

  //#region VIEW EDIT
  const handleViewSubMaterialDetails = useCallback((row: SubMaterialMasterData) => {
    setViewSubMaterialMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  //#endregion

  //#region EDIT SUB MATERIAL MASTER

  const handleEditSubMaterialMaster = useCallback((row: SubMaterialMasterData) => {
    setEditingSubMaterialMasterData({
      ...row,
      MaterialMasterId: row.MaterialMasterId || 0,
      SubMaterialName: row.SubMaterialName || '',
      UomMasterId: row.UomMasterId || 0
    })
    setIsAddUpdateModalOpen(true);

  }, [])


  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: SubMaterialMasterData) => {
    setDeleteSubMaterialMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const subMaterialMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'SubMaterialName',
        label: 'Sub Material Name',
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
              onClick={() => handleViewSubMaterialDetails(row)} // just pass a function, no need for e.preventDefault here
            />

          </div>
        )
      },
      {
        key: 'MaterialName',
        label: 'Material Name',
        width: '30',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      },
      {
        key: 'Uom',
        label: 'UOM',
        width: '20',
        sortable: false,
        align: 'center',
        render: (value) => value || '0'

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
                title="Delete Sub Material"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        )
      }
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleViewSubMaterialDetails, handleEditSubMaterialMaster, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredSubMaterialMasterColumnKeys: string[] = ['SubMaterialName'];

  const allSubMaterialMasterColumnKeys: string[] = subMaterialMasterColumns.map(c => c.key)

  const [selectedSubMaterialMasterColumnKeys, setSelectedSubMaterialMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getSubMaterialMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredSubMaterialMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allSubMaterialMasterColumnKeys.includes(k));

      }
    } catch { }
    return allSubMaterialMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedSubMaterialMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredSubMaterialMasterColumnKeys])).filter(k => allSubMaterialMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subMaterialMasterColumns.length])

  const visibleSubMaterialMasterColumns = useMemo(
    () => subMaterialMasterColumns.filter(col => selectedSubMaterialMasterColumnKeys.includes(col.key)),
    [subMaterialMasterColumns, selectedSubMaterialMasterColumnKeys]
  )

  //#endregion

  //#region VIEW SUB MATERIAL DETAILS MODAL COMPONENT

  interface ViewSubMaterialDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: SubMaterialMasterData | null
  }

  const ViewSubMaterialDetailsModal: React.FC<ViewSubMaterialDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Sub Material Master Details"
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
            <FieldItem label="Material Name" value={data.MaterialName} isRow withBorder={true} />
            <FieldItem label="Sub Material Name" value={data.SubMaterialName} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="UOM" value={data.Uom} isRow withBorder={true} />
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
                    handleEditSubMaterialMaster(data)
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
    loadSubMaterials(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadSubMaterials(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT SUB MATERIAL MASTER

  const handleFieldChange = (field: keyof AddUpdateSubMaterialMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddSubMaterialModal = () => {
    setEditingSubMaterialMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddSubMaterialMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.SubMaterialName.trim() === "") {

      newErrors.SubMaterialName = "Sub Material Name is required"
    }
    else if (formData.SubMaterialName.length < 3) {
      newErrors.SubMaterialName = "Sub Material Name must be at least 3 characters long"
    }

    if (formData.MaterialMasterId === 0) {
      newErrors.MaterialMasterId = "Material is required";
    }

    if (formData.UomMasterId === 0) {
      newErrors.UomMasterId = "UOM is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushSubMaterialMasterFormData = (): AddUpdateSubMaterialMasterRequest => {
    return {
      SubMaterialMasterId: formData.SubMaterialMasterId,
      Uniquekey: formData.Uniquekey,
      MaterialMasterId: formData.MaterialMasterId,
      SubMaterialName: formData.SubMaterialName,
      UomMasterId: formData.UomMasterId
    };

  };

  const handleAddUpdateSubMaterialMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddSubMaterialMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushSubMaterialMasterFormData();

        const response = await subMaterialMasterService.apiCallAddUpdateSubMaterialMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.SubMaterialMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as SubMaterialMasterData

            setSubMaterialMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as SubMaterialMasterData;

            setSubMaterialMasterList(prevData =>
              prevData.map(item =>
                item.SubMaterialMasterId === formData.SubMaterialMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingSubMaterialMasterData(null);
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

      Number(formData.SubMaterialMasterId) === 0 ? 'Add Sub Material' : 'Update Sub Material'
    )

  };

  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const excelImportSubMaterialMaster = async () => {

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


  const downloadExcelSampleSubMaterialMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'SUB MATERIAL MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'Sub Material Master', addToast, 'Sample file download successfully')

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

  const handleExcelImportSubMaterialMaster = () => excelImportSubMaterialMaster()
  const handleDownloadExcelSampleSubMaterialMaster = () => downloadExcelSampleSubMaterialMaster()



  //#endregion

  //#region DELETE SUB MATERIAL MASTER
  const handleDeleteSubMaterialMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteSubMaterialMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteSubMaterialMasterRequest = {
          SubMaterialMasterId: deleteSubMaterialMasterDetailsData.SubMaterialMasterId,
          Uniquekey: deleteSubMaterialMasterDetailsData.Uniquekey
        }

        const response = await subMaterialMasterService.apiCallDeleteSubMaterialMaster(params);

        if (E.isRight(response)) {

          setSubMaterialMasterList(prevData => prevData.filter(item => item.SubMaterialMasterId !== deleteSubMaterialMasterDetailsData.SubMaterialMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteSubMaterialMasterDetailsData(null);

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
      'Delete Sub Material'
    )
  }

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
        searchPlaceholder="Search By Sub Material Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchSubMaterials}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeSubMaterialMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddSubMaterialModal}

        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={handleExcelImportSubMaterialMaster}
        onDownloadSampleExcel={handleDownloadExcelSampleSubMaterialMaster}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportSubMaterialExcel}
        onExportPdf={handleExportSubMaterialPdf}
        exportLoading={isLoading}
      />


      {/* DATA TABLE SUB MATERIAL */}
      <DataTable
        data={subMaterialListForTable}
        columns={visibleSubMaterialMasterColumns}
        pagination={subMaterialMasterPaginationInfo}
        emptyMessage="No Sub Materials Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />

      {/* VIEW SUB MATERIAL MODAL */}
      <ViewSubMaterialDetailsModal isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewSubMaterialMasterDetailsData(null)
        }}
        data={viewSubMaterialMasterDetailsData}
      />

      {/*  ADD EDIT UPDATE SUB MATERIAL MODAL */}
      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingSubMaterialMasterData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingSubMaterialMasterData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        title={editingSubMaterialMasterData ? 'Update Sub Material' : 'Add Sub Material'}
        onSubmit={handleAddUpdateSubMaterialMaster}
        saveText={editingSubMaterialMasterData ? 'Update Sub Material' : 'Save Sub Material'}
        resetText='Reset'
        loading={isLoading}
        size='xl'
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              <Input
                label='Sub Material Name'
                required
                error={errors.SubMaterialName}
                type="text"
                value={formData.SubMaterialName}
                maxLength={100}
                onChange={(e) => handleFieldChange('SubMaterialName', e.target.value)}
                placeholder="Enter Sub Material Name"
              />

            </div>

            <div>

              <SingleSelectDropdownWithPagination
                required
                label="Material"
                title="Select Material"
                size="lg"
                dataFetchCallBack={fetchMaterialMasterDropdown}
                onSelected={(item) => handleFieldChange("MaterialMasterId", Number(item.value))}
                initialValue={createDropdownInitialValue(formData.MaterialMasterId, dropdownLabels.materialName)}
                error={errors.MaterialMasterId}
              />

            </div>

            <div>
              <SingleSelectDropdownWithPagination
                required
                label="UOM"
                title="Select UOM"
                size="lg"
                dataFetchCallBack={fetchUOMMasterDropdown}
                onSelected={(item) => handleFieldChange("UomMasterId", Number(item.value))}
                initialValue={createDropdownInitialValue(formData.UomMasterId, dropdownLabels.uom)}
                error={errors.UomMasterId}
              />
            </div>
          </div>
        </div>

      </Modal>
      {/* CUSTOMIZE COLUMNS MODAL */}


      <CustomizeColumnsModal
        isOpen={isShowCustomizeSubMaterialMasterColumnsModal}
        onClose={() => setIsShowCustomizeSubMaterialMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredSubMaterialMasterColumnKeys]),
          )

          setSelectedSubMaterialMasterColumnKeys(withRequired)

          try {
            LocalStorageHelper.storeSubMaterialMasterTableColumns(
              JSON.stringify(withRequired),
            )
          } catch { }
        }}
        columns={subMaterialMasterColumns}
        selectedKeys={selectedSubMaterialMasterColumnKeys}
        requiredKeys={requiredSubMaterialMasterColumnKeys}
        title="Customize Table Columns"
      />

      {/* FILTER SUB MATERIAL MODAL */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Sub Material Master"
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
                label='Sub Material Name'
                type="text"
                value={tempFilters.SubMaterialName || ''}
                onChange={(e) => handleFilterChange('SubMaterialName', e.target.value)}
                placeholder="Enter sub material name"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION SUB MATERIAL MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteSubMaterialMasterDetailsData(null)
        }}
        onConfirm={handleDeleteSubMaterialMaster}
        title="You are about to delete a sub material?"
        message="Deleting this sub material will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />


    </div>

  )
}

export default SubMaterialMaster
