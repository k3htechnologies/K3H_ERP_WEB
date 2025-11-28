import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateBranchMasterRequest,
  DeleteBranchMasterRequest,
  BranchMasterData,
  FilterWithPaginationBranchMasterRequest
} from '@/features/branchMaster/models/BranchMasterModel';

import { BranchMasterService } from '@/features/branchMaster/services/BranchMasteService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Edit, Trash2, } from 'lucide-react';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import Checkbox from '@/ui/components/forms/Checkbox';
import { FieldItem } from '@/ui/components/forms/FieldItem';


export const BranchMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [branchMasterList, setBranchMasterList] = useState<BranchMasterData[]>([]);
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
    searchBranches(value)
  }, 350)

  //VIEW BRANCH MASTER MODAL STATES
  const [viewBranchMasterDetailsData, setViewBranchMasterDetailsData] = useState<BranchMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeBranchMasterColumnsModal, setIsShowCustomizeBranchMasterColumnsModal] = useState(false);

  // EDIT BRANCH MASTER
  const [editingBranchMasterData, setEditingBranchMasterData] = useState<BranchMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [branchMasterFormData, setBranchMasterFormData] = useState<AddUpdateBranchMasterRequest>({
    BranchMasterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    BranchCode: '',
    BranchName: '',
    IsHeadOffice: false,
    Location: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  //DELETE BRANCH MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteBranchMasterDetailsData, setDeleteBranchMasterDetailsData] = useState<BranchMasterData | null>(null)

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialBranches = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialBranches.current) return

    hasFetchedInitialBranches.current = true;

    fetchBranchList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion


  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchBranchList = async (page: number = pagination.currentPage) => {
    return await loadBranches(page, filters);
  }

  const loadBranches = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = branchMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationBranchMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          BranchMasterId: filterParams.BranchMasterId ? Number(filterParams.BranchMasterId) : 0,
          BranchName: filterParams.BranchName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getBranches(params);

        if (E.isRight(response)) {

          setBranchMasterList(response.right.Data);

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
      'Loading Branch Data...'
    )
  }

  // SERACH BRANCH 
  const searchBranches = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchBranchList();

      return
    }

    const filterParams: FilterInfo = {
      BranchName: searchValue.trim(),
    };

    await loadBranches(1, filterParams)

  }

  const clearsearchBranches = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchBranchList();
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportBranches = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = branchMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationBranchMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          BranchName: filters.BranchName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getBranches(params);

        handleExportFile(response, exportType, 'Branch Master', addToast)

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export...'
    )
  }

  const handleExportBranchExcel = () => handleExportBranches('Excel')
  const handleExportBranchPdf = () => handleExportBranches('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET BRANCH 

  const getBranches = async (filterParams: FilterWithPaginationBranchMasterRequest) => {

    return await BranchMasterService.apiCallPullBranchMaster(filterParams);
  }

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchBranchList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchBranchList(1);

  }

  const branchMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const branchListForTable = useMemo(() => branchMasterList, [branchMasterList]);


  // STABLE HANDLER VIEW EDIT CONFIRMATION DIALOG BOX
  const handleViewBranchDetails = useCallback((row: BranchMasterData) => {
    setViewBranchMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])


  const handleConfirmationDialogBoxOpen = useCallback((row: BranchMasterData) => {
    setDeleteBranchMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  const branchMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'BranchName',
        label: 'Branch Name',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>

            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewBranchDetails(row)} // just pass a function, no need for e.preventDefault here
            />

          </div>
        )
      },
      {
        key: 'BranchCode',
        label: 'Branch Code',
        width: '20',
        sortable: false,
        fixed: 'left',
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value}
            maxWidth="170px"
            tooltipThreshold={15}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'IsHeadOffice',
        label: 'Head Office',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
            {value ? 'Yes' : 'No'}
          </span>
        )
      },
      {
        key: 'Location',
        label: 'Location',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },
      {
        key: 'NumberOfEmployee',
        label: 'Employee Count',
        width: '20',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {value}
          </span>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '25',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '25',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],

    // dependencies: include everything used inside that might change
    [handleViewBranchDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredBranchMasterColumnKeys: string[] = ['BranchName'];

  const allBranchMasterColumnKeys: string[] = branchMasterColumns.map(c => c.key)

  const [selectedBranchMasterColumnKeys, setSelectedBranchMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getBranchMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredBranchMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allBranchMasterColumnKeys.includes(k));

      }
    } catch { }
    return allBranchMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedBranchMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredBranchMasterColumnKeys])).filter(k => allBranchMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchMasterColumns.length])

  const visibleBranchMasterColumns = useMemo(
    () => branchMasterColumns.filter(col => selectedBranchMasterColumnKeys.includes(col.key)),
    [branchMasterColumns, selectedBranchMasterColumnKeys]
  )

  //#endregion

  //#region VIEW BRANCH DETAILS MODAL COMPONENT

  interface ViewBranchDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: BranchMasterData | null
  }

  const ViewBranchDetailsModal: React.FC<ViewBranchDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Branch Details"
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

            <FieldItem label="BranchName" value={data.BranchName} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Branch Code" value={data.BranchCode} isRow withBorder={true} />
            <FieldItem label="HeadOffice" value={data.IsHeadOffice ? "Yes" : "No"} isRow withBorder={true} />
            <FieldItem label="Location" value={data.Location} isRow withBorder={true} />
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
                  color='gray'
                  variant='solid'
                  colorMode="light"
                  size='md'
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
                  size='md'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleEditBranchMasterData(data)
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
    loadBranches(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadBranches(1, {})
    setShowFilterPopup(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...tempFilters }
    if (value.trim()) {
      newFilters[key] = value.trim()
    } else {
      delete newFilters[key]
    }
    setTempFilters(newFilters)
  }
  //#endregion

  //#region ADD UPDATE EDIT BRANCH MASTER
  const handleAddBranchMaster = () => {
    setEditingBranchMasterData(null);
    setBranchMasterFormData({
      BranchMasterId: 0,
      Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      BranchCode: '',
      BranchName: '',
      IsHeadOffice: false,
      Location: ''
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const handleEditBranchMasterData = (row: BranchMasterData) => {
    setEditingBranchMasterData(row);
    setBranchMasterFormData({
      BranchMasterId: row.BranchMasterId || 0,
      Uniquekey: row.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      BranchCode: row.BranchCode || '',
      BranchName: row.BranchName || '',
      IsHeadOffice: row.IsHeadOffice || false,
      Location: row.Location || ''
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }


  const handleFieldChange = (field: keyof AddUpdateBranchMasterRequest, value: string | number | null | boolean) => {
    setBranchMasterFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateBranchMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!branchMasterFormData.BranchName?.trim()) {
      newErrors.BranchName = "Branch Name is required.";
    }

    if (!branchMasterFormData.BranchCode?.trim()) {
      newErrors.BranchCode = "Branch Code is required.";
    }

    if (!branchMasterFormData.Location?.trim()) {
      newErrors.Location = "Location is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushBranchMasterFormData = (): AddUpdateBranchMasterRequest => {
    return {
      BranchMasterId: branchMasterFormData.BranchMasterId || 0,
      Uniquekey: branchMasterFormData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      BranchCode: branchMasterFormData.BranchCode || '',
      BranchName: branchMasterFormData.BranchName || '',
      IsHeadOffice: branchMasterFormData.IsHeadOffice || false,
      Location: branchMasterFormData.Location || ''
    };
  };
  const handleAddUpdateBranchMaster = async () => {

    setFormErrors({});

    const validation = validateBranchMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushBranchMasterFormData();
        const response = await BranchMasterService.apiCallAddUpdateBranchMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = branchMasterFormData.BranchMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as BranchMasterData

            setBranchMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Branch added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as BranchMasterData;

            setBranchMasterList(prevData =>
              prevData.map(item =>
                item.BranchMasterId === branchMasterFormData.BranchMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingBranchMasterData(null);

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
      branchMasterFormData.BranchMasterId === 0 ? 'Add Branch' : 'Update Branch...'
    )
  }
  //#endregion 

  //#region DELETE BRANCH MASTER

  const handleDeleteBranchMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteBranchMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteBranchMasterRequest = {
          BranchMasterId: deleteBranchMasterDetailsData.BranchMasterId,
          UniqueKey: deleteBranchMasterDetailsData.Uniquekey || ''
        }

        const response = await BranchMasterService.apiCallDeleteBranchMaster(params);

        if (E.isRight(response)) {

          setBranchMasterList(prevData => prevData.filter(item => item.BranchMasterId !== deleteBranchMasterDetailsData.BranchMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteBranchMasterDetailsData(null);

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
      'Delete branch master data...'
    )
  }
  //#endregion
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="h-full flex flex-col">
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
          searchPlaceholder="Search By branch name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchBranches}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeBranchMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Branch"
          onAdd={handleAddBranchMaster}
          isShowImportButton={canAction}
          isShowExportButton={canExport}
          onExportExcel={handleExportBranchExcel}
          onExportPdf={handleExportBranchPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE BRANCH */}
        <DataTable
          data={branchListForTable}
          columns={visibleBranchMasterColumns}
          pagination={branchMasterPaginationInfo}
          emptyMessage="No branches found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW BRANCH MODAL */}
        <ViewBranchDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewBranchMasterDetailsData(null)
          }}
          data={viewBranchMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE BRANCH MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingBranchMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingBranchMasterData(null)
            setFormErrors({})
          }}
          title={editingBranchMasterData ? 'Update Branch Master Details' : 'Add Branch Master Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateBranchMaster()
          }}
          saveText="Save"
          cancelText="Cancel"
          loading={isLoading}
          size="large75"
        >
          <div className="space-y-6 p-6 bg-blue-50">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Branch Name'
                  value={branchMasterFormData.BranchName ?? ""}
                  onChange={(e) => handleFieldChange("BranchName", e.target.value)}
                  placeholder="Enter Branch Name"
                  maxLength={250}
                  error={formErrors.BranchName}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Branch Code'
                  value={branchMasterFormData.BranchCode ?? ""}
                  onChange={(e) => handleFieldChange("BranchCode", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Branch Code"
                  error={formErrors.BranchCode}
                />

              </div>
            </div>

            <div >
              <div>
                <Input
                  type="text"
                  label='Location'
                  value={branchMasterFormData.Location ?? ""}
                  onChange={(e) => handleFieldChange("Location", e.target.value)}
                  required
                  placeholder="Enter Location"
                  maxLength={250}
                  error={formErrors.Location}
                />
              </div>
            </div>
            <div>
              <Checkbox
                label="Head Office"
                checked={branchMasterFormData.IsHeadOffice ?? false}
                onChange={(e) => handleFieldChange("IsHeadOffice", e.target.checked)}
              />

            </div>

          </div>
        </Modal>

        {/* CUSTOMIZE COLUMNS MODAL */}


        <CustomizeColumnsModal
          isOpen={isShowCustomizeBranchMasterColumnsModal}
          onClose={() => setIsShowCustomizeBranchMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredBranchMasterColumnKeys]),
            )

            setSelectedBranchMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeBranchMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={branchMasterColumns}
          selectedKeys={selectedBranchMasterColumnKeys}
          requiredKeys={requiredBranchMasterColumnKeys}
          title="Customize Branch Master Table Columns"
        />

        {/* FILTER BRANCH MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Branch Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          resetText=''
          size="small-half"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <Input
                  type="text"
                  value={tempFilters.BranchName || ''}
                  onChange={(e) => handleFilterChange('BranchName', e.target.value)}
                  placeholder="Enter branch name"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION BRANCH MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteBranchMasterDetailsData(null)
          }}
          onConfirm={handleDeleteBranchMaster}
          title="You are about to delete a branch?"
          message="Deleting this branch will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />

      </div>
    </>

  )
}

export default BranchMaster


