import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateUomMasterRequest,
  DeleteUomMasterRequest,
  UomMasterData,
  FilterWithPaginationUomMaster
} from '@/features/uomMaster/models/UOMMasterModel';

import { uomMasterService } from '@/features/uomMaster/services/UOMMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { updateFilter } from '@/core/utils/filterHelper';
import { Input } from '@/ui/components/forms';


const initialFormState = (): AddUpdateUomMasterRequest => ({
  UomMasterId: 0,
  Uniquekey: null,
  UomCode: '',
  UomName: ''
});

export const UomMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [uomMasterList, setUomMasterList] = useState<UomMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const {  addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchUoms(value)
  }, 350)

  //VIEW UOM MASTER MODAL STATES
  const [viewUomMasterDetailsData, setViewUomMasterDetailsData] = useState<UomMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT UOM MASTER
  const [editingUomMasterData, setEditingUomMasterData] = useState<UomMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  
  //ADD UPDATE UOM MASTER
    const [formData, setFormData] = useState<AddUpdateUomMasterRequest>(() => initialFormState());
  
  //DELETE UOM MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteUomMasterDetailsData, setDeleteUomMasterDetailsData] = useState<UomMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeUomMasterColumnsModal, setIsShowCustomizeUomMasterColumnsModal] = useState(false);


  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialUoms = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialUoms.current) return

    hasFetchedInitialUoms.current = true;

    fetchUomList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingUomMasterData) {
        setFormData({
          UomMasterId: editingUomMasterData.UomMasterId,
          Uniquekey: editingUomMasterData.UniqueKey || null,
          UomCode: editingUomMasterData.UomCode?.toString() || '',
          UomName: editingUomMasterData.Uom || ''
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingUomMasterData]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchUomList = async (page: number = pagination.currentPage,sort?: SortInfo) => {
    return await loadUoms(page, filters,sort ?? sortInfo);
  }

  const loadUoms = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = uomMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationUomMaster = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          UomMasterId: filterParams.UomMasterId ? Number(filterParams.UomMasterId) : 0,
          UomName: filterParams.UomName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getUoms(params);

        if (E.isRight(response)) {

          setUomMasterList(response.right.Data);

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
      'Loading UOM'
    )
  }
  //#endregion

  //#region SERACH UOM 
  const searchUoms = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchUomList();

      return
    }

    const filterParams: FilterInfo = {
      UomName: searchValue.trim(),
    };

    await loadUoms(1, filterParams)

  }
  //#endregion

  //#region CLEAR SERACH UOM 
  const clearsearchUoms = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchUomList();
  }

  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportUoms = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = uomMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationUomMaster = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          UomName: filters.UomName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getUoms(params);

        handleExportFile(response, exportType, 'UOM Master', addToast)

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

  const handleExportUomExcel = () => handleExportUoms('Excel')
  const handleExportUomPdf = () => handleExportUoms('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET UOM 

  const getUoms = async (filterParams: FilterWithPaginationUomMaster) => {

    return await uomMasterService.apiCallPullUomMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchUomList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN
  
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadUoms(1, filters, sort);
  }, [filters]);
  //#endregion

  //#region TABLE PAGINATION INFO

  const uomMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const uomListForTable = useMemo(() => uomMasterList, [uomMasterList]);
  //#endregion

  //#region VIEW EDIT
  const handleViewUomDetails = useCallback((row: UomMasterData) => {
    setViewUomMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  //#endregion

  //#region EDIT UOM MASTER

  const handleEditUomMaster = useCallback((row: UomMasterData) => {
    setEditingUomMasterData({
      ...row,
      UomCode: row.UomCode?.toString() || '',
      Uom: row.Uom || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])


  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: UomMasterData) => {
    setDeleteUomMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const uomMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Uom',
        label: 'UOM',
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
              onClick={() => handleViewUomDetails(row)} // just pass a function, no need for e.preventDefault here
            />

          </div>
        )
      },
      {
        key: 'UomCode',
        label: 'UOM Code',
        width: '30',
        sortable: false,
        align: 'center',
        render: (value) => value || ''
      }
    ],
    // dependencies: include everything used inside that might change
    [canAction, handleViewUomDetails, handleEditUomMaster, handleConfirmationDialogBoxOpen]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredUomMasterColumnKeys: string[] = ['UomName'];

  const allUomMasterColumnKeys: string[] = uomMasterColumns.map(c => c.key)

  const [selectedUomMasterColumnKeys, setSelectedUomMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getUomMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredUomMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allUomMasterColumnKeys.includes(k));

      }
    } catch { }
    return allUomMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedUomMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredUomMasterColumnKeys])).filter(k => allUomMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uomMasterColumns.length])

  const visibleUomMasterColumns = useMemo(
    () => uomMasterColumns.filter(col => selectedUomMasterColumnKeys.includes(col.key)),
    [uomMasterColumns, selectedUomMasterColumnKeys]
  )

  //#endregion

  //#region VIEW UOM DETAILS MODAL COMPONENT

  interface ViewUomDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: UomMasterData | null
  }

  const ViewUomDetailsModal: React.FC<ViewUomDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="UOM Master Details"
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
            <FieldItem label="UOM Code" value={data.UomCode?.toString()} isRow withBorder={true} />
            <FieldItem label="UOM Name" value={data.Uom} isRow withBorder={true} className='font-medium text-blue-900 ' />
          </div>

          
        </div>
      </Modal>
    )
  }


  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadUoms(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER 

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadUoms(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT UOM MASTER

  const handleFieldChange = (field: keyof AddUpdateUomMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddUomModal = () => {
    setEditingUomMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddUomMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.UomName.trim() === "") {

      newErrors.UomName = "UOM Name is required"
    }
    else if (formData.UomName.length < 3) {
      newErrors.UomName = "UOM Name must be at least 3 characters long"
    }

    if (formData.UomCode.trim() === "") {
      newErrors.UomCode = "UOM Code is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushUomMasterFormData = (): AddUpdateUomMasterRequest => {
    return {
      UomMasterId: formData.UomMasterId,
      Uniquekey: formData.Uniquekey,
      UomCode: formData.UomCode,
      UomName: formData.UomName
    };

  };

  const handleAddUpdateUomMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddUomMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushUomMasterFormData();

        const response = await uomMasterService.apiCallAddUpdateUomMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.UomMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as UomMasterData

            setUomMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as UomMasterData;

            setUomMasterList(prevData =>
              prevData.map(item =>
                item.UomMasterId === formData.UomMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingUomMasterData(null);
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

      Number(formData.UomMasterId) === 0 ? 'Add UOM' : 'Update UOM'
    )

  };

  //#endregion

  //#region IMPORT EXCEL | DOWNLOAD

  const excelImportUomMaster = async () => {

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


  const downloadExcelSampleUomMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting

        const params: FilterPullExcelSample = {
          TableName: 'UOM MASTER'
        }

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(response, 'Excel', 'UOM Master', addToast, 'Sample file download successfully')

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

  const handleExcelImportUomMaster = () => excelImportUomMaster()
  const handleDownloadExcelSampleUomMaster = () => downloadExcelSampleUomMaster()



  //#endregion

  //#region DELETE UOM MASTER
  const handleDeleteUomMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteUomMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteUomMasterRequest = {
          UomMasterId: deleteUomMasterDetailsData.UomMasterId,
          Uniquekey: deleteUomMasterDetailsData.UniqueKey
        }

        const response = await uomMasterService.apiCallDeleteUomMaster(params);

        if (E.isRight(response)) {

          setUomMasterList(prevData => prevData.filter(item => item.UomMasterId !== deleteUomMasterDetailsData.UomMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteUomMasterDetailsData(null);

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
      'Delete UOM'
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
          searchPlaceholder="Search By UOM Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchUoms}
          isShowFilterButton={false}
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton={false}
          onCustomize={() => setIsShowCustomizeUomMasterColumnsModal(true)}
          // ADD
          isShowAddButton={false}
          addTitle="Add UOM"
          onAdd={handleAddUomModal}

          // IMPORT
          isShowImportButton={false}
          onUploadExcel={handleExcelImportUomMaster}
          onDownloadSampleExcel={handleDownloadExcelSampleUomMaster}

          // EXPORT
          isShowExportButton={canExport && uomListForTable.length >0}
          onExportExcel={handleExportUomExcel}
          onExportPdf={handleExportUomPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE UOM */}
        <DataTable
          data={uomListForTable}
          columns={visibleUomMasterColumns}
          pagination={uomMasterPaginationInfo}
          emptyMessage="No UOMs Data Found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
          loading={isLoading}
        />

        {/* VIEW UOM MODAL */}
        <ViewUomDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewUomMasterDetailsData(null)
          }}
          data={viewUomMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE UOM MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false);
            setEditingUomMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false);
            setEditingUomMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          title={editingUomMasterData ? 'Update UOM' : 'Add UOM'}
          onSubmit={handleAddUpdateUomMaster}
          saveText={editingUomMasterData ? 'Update UOM' : 'Save UOM'}
          resetText='Reset'
          loading={isLoading}
          size='xl'
        >
          <div className="space-y-10 p-6 bg-blue-100">
            <div className="space-y-4" >
              <div>
                <Input
                  label='UOM Code'
                  required
                  error={errors.UomCode}
                  type="text"
                  value={formData.UomCode}
                  maxLength={10}
                  onChange={(e) => handleFieldChange('UomCode', e.target.value)}
                  placeholder="Enter UOM Code"
                />

              </div>

              <div>
                <Input
                  label='UOM Name'
                  required
                  error={errors.UomName}
                  type="text"
                  value={formData.UomName}
                  maxLength={100}
                  onChange={(e) => handleFieldChange('UomName', e.target.value)}
                  placeholder="Enter UOM Name"
                />

              </div>
            </div>
          </div>

        </Modal>
        {/* CUSTOMIZE COLUMNS MODAL */}


        <CustomizeColumnsModal
          isOpen={isShowCustomizeUomMasterColumnsModal}
          onClose={() => setIsShowCustomizeUomMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredUomMasterColumnKeys]),
            )

            setSelectedUomMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeUomMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={uomMasterColumns}
          selectedKeys={selectedUomMasterColumnKeys}
          requiredKeys={requiredUomMasterColumnKeys}
          title="Customize Table Columns"
        />

        {/* FILTER UOM MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - UOM Master"
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
                  label='UOM Name'
                  type="text"
                  value={tempFilters.UomName || ''}
                  onChange={(e) => handleFilterChange('UomName', e.target.value)}
                  placeholder="Enter UOM name"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION UOM MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteUomMasterDetailsData(null)
          }}
          onConfirm={handleDeleteUomMaster}
          title="You are about to delete a UOM?"
          message="Deleting this UOM will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />


      </div>

  )
}

export default UomMaster
