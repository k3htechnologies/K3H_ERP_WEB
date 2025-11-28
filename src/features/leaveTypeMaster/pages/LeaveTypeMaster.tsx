import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  LeaveTypeMasterData,
  FilterWithPaginationLeaveTypeMasterRequest,
  DeleteLeaveTypeMasterRequest,
  AddUpdateLeaveTypeMasterRequest
} from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel';

import { LeaveTypeMasterService } from '@/features/leaveTypeMaster/services/LeaveTypeMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Edit, Trash2 } from 'lucide-react';
import Checkbox from '@/ui/components/forms/Checkbox';
import { FieldItem } from '@/ui/components/forms/FieldItem';


export const LeaveTypeMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [leaveTypeMasterList, setLeaveTypeMasterList] = useState<LeaveTypeMasterData[]>([]);
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
    searchLeaveTypes(value)
  }, 350)

  //VIEW BRANCH MASTER MODAL STATES
  const [viewLeaveTypeMasterDetailsData, setViewLeaveTypeMasterDetailsData] = useState<LeaveTypeMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeLeaveTypeMasterColumnsModal, setIsShowCustomizeLeaveTypeMasterColumnsModal] = useState(false);

  //EDIT LEAVETYPE MASTER
  const [editingLeaveTypeMasterData, setEditingLeaveTypeMasterData] = useState<LeaveTypeMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [leaveTypeMasterFormData, setLeaveTypeMasterFormData] = useState<AddUpdateLeaveTypeMasterRequest>({
    LeaveTypeMasterId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    LeaveType: "",
    LeaveTypeCode: "",
    IsCarryForward: false,
    MaxCarryForward: 0,
    IsEncashable: false,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  //DELETE LEAVETYPE MASTER
  const [deleteLeaveTypeMasterDetailsData, setDeleteLeaveTypeMasterDetailsData] = useState<LeaveTypeMasterData | null>(null);
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialLeaveTypes = useRef(false)


  useEffect(() => {
    if (hasFetchedInitialLeaveTypes.current) return

    hasFetchedInitialLeaveTypes.current = true;

    fetchLeaveTypeList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchLeaveTypeList = async (page: number = pagination.currentPage) => {
    return await loadLeaveTypes(page, filters);
  }

  const loadLeaveTypes = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = leaveTypeMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationLeaveTypeMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          LeaveTypeMasterId: filterParams.LeaveTypeMasterId ? Number(filterParams.LeaveTypeMasterId) : undefined,
          LeaveType: filterParams.LeaveType?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getLeaveTypes(params);

        if (E.isRight(response)) {

          setLeaveTypeMasterList(response.right.Data);

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
      'Loading Leave Type Data...'
    )
  }
  // SERACH LEAVE TYPE
  const searchLeaveTypes = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchLeaveTypeList();

      return
    }
    const filterParams: FilterInfo = {
      LeaveType: searchValue.trim(),
    };

    await loadLeaveTypes(1, filterParams)
  }

  const clearsearchLeaveTypes = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchLeaveTypeList();
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportLeaveTypes = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = leaveTypeMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationLeaveTypeMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          LeaveType: filters.LeaveType?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getLeaveTypes(params);

        handleExportFile(response, exportType, 'Leave Type Master', addToast)

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

  const handleExportLeaveTypeExcel = () => handleExportLeaveTypes('Excel')
  const handleExportLeaveTypePdf = () => handleExportLeaveTypes('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET BRANCH
  const getLeaveTypes = async (filterParams: FilterWithPaginationLeaveTypeMasterRequest) => {

    return await LeaveTypeMasterService.apiCallPullLeaveTypeMaster(filterParams);
  }

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchLeaveTypeList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchLeaveTypeList(1);

  }

  const leaveTypeMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const leaveTypeListForTable = useMemo(() => leaveTypeMasterList, [leaveTypeMasterList]);

  // STABLE HANDLER VIEW EDIT CONFIRMATION DIALOG BOX
  const handleViewLeaveTypeDetails = useCallback((row: LeaveTypeMasterData) => {
    setViewLeaveTypeMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveTypeMasterData) => {
    setDeleteLeaveTypeMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  const leaveTypeMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'LeaveType',
        label: 'Leave Type',
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
              onClick={() => handleViewLeaveTypeDetails(row)}
            />

          </div>
        )
      },
      {
        key: 'LeaveTypeCode',
        label: 'Leave Type Code',
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
        key: 'IsCarryForward',
        label: 'Carry Forward',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {value ? 'Yes' : 'No'}
          </span>
        )
      },
      {
        key: 'MaxCarryForward',
        label: 'Max Carry Forward',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {value || 0}
          </span>
        )
      },
      {
        key: 'IsEncashable',
        label: 'Encashable',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {value ? 'Yes' : 'No'}
          </span>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    // dependencies: include everything used inside that might change
    [handleViewLeaveTypeDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredLeaveTypeMasterColumnKeys: string[] = ['LeaveType'];

  const allLeaveTypeMasterColumnKeys: string[] = leaveTypeMasterColumns.map(c => c.key)

  const [selectedLeaveTypeMasterColumnKeys, setSelectedLeaveTypeMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getLeaveTypeMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredLeaveTypeMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allLeaveTypeMasterColumnKeys.includes(k));

      }
    } catch { }
    return allLeaveTypeMasterColumnKeys
  })

  useEffect(() => {

    setSelectedLeaveTypeMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredLeaveTypeMasterColumnKeys])).filter(k => allLeaveTypeMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveTypeMasterColumns.length])

  const visibleLeaveTypeMasterColumns = useMemo(
    () => leaveTypeMasterColumns.filter(col => selectedLeaveTypeMasterColumnKeys.includes(col.key)),
    [leaveTypeMasterColumns, selectedLeaveTypeMasterColumnKeys]
  )

  //#endregion


  //#region VIEW LEAVE TYPE DETAILS MODAL COMPONENT
  interface ViewLeaveTypeDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: LeaveTypeMasterData | null
  }

  const ViewLeaveTypeDetailsModal: React.FC<ViewLeaveTypeDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Leave Type Details"
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

            <FieldItem label="Leave Type" value={data.LeaveType} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Leave Type Code" value={data.LeaveTypeCode} isRow withBorder={true} />
            <FieldItem label="Carry Forward" value={data.IsCarryForward ? "Yes" : "No"} isRow withBorder={true} />
            <FieldItem label="Max Carry Forward" value={data.MaxCarryForward} isRow withBorder={true} />
            <FieldItem label="Encashable" value={data.IsEncashable ? "Yes" : "No"} isRow withBorder={true} />

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
                      handleEditLeaveTypeMasterData(data)
                    }}
                  >
                    <Edit className="h-5 w-5" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  //#endregion

  const applyFilters = () => {
    setFilters(tempFilters)
    loadLeaveTypes(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadLeaveTypes(1, {})
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


  //Add Update LEAVE TYPE Master
  const handleAddLeaveTypeMaster = () => {
    setEditingLeaveTypeMasterData(null);
    setLeaveTypeMasterFormData({
      LeaveTypeMasterId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      LeaveType: "",
      LeaveTypeCode: "",
      IsCarryForward: false,
      MaxCarryForward: 0,
      IsEncashable: false
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const handleEditLeaveTypeMasterData = (row: LeaveTypeMasterData) => {
    setEditingLeaveTypeMasterData(row);
    setLeaveTypeMasterFormData({
      LeaveTypeMasterId: row.LeaveTypeMasterId || 0,
      Uniquekey: row.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      LeaveType: row.LeaveType || "",
      LeaveTypeCode: row.LeaveTypeCode || "",
      IsCarryForward: row.IsCarryForward || false,
      MaxCarryForward: row.MaxCarryForward || 0,
      IsEncashable: row.IsEncashable || false
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }


  const handleFieldChange = (field: keyof AddUpdateLeaveTypeMasterRequest, value: string | number | null | boolean) => {
    setLeaveTypeMasterFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateLeaveTypeMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!leaveTypeMasterFormData.LeaveType?.trim()) {
      newErrors.LeaveType = "Leave Type is required.";
    }

    if (!leaveTypeMasterFormData.LeaveTypeCode?.trim()) {
      newErrors.LeaveTypeCode = "Leave Type Code is required.";
    }

    // Only validate MaxCarryForward if Carry Forward is checked
    if (leaveTypeMasterFormData.IsCarryForward) {
      if (!leaveTypeMasterFormData.MaxCarryForward || Number(leaveTypeMasterFormData.MaxCarryForward) <= 0) {
        newErrors.MaxCarryForward = "Max Carry Forward is required.";
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };


  const PushLeaveTypeMasterFormData = (): AddUpdateLeaveTypeMasterRequest => {
    return {
      LeaveTypeMasterId: leaveTypeMasterFormData.LeaveTypeMasterId || 0,
      Uniquekey: leaveTypeMasterFormData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      LeaveType: leaveTypeMasterFormData.LeaveType || "",
      LeaveTypeCode: leaveTypeMasterFormData.LeaveTypeCode || "",
      IsCarryForward: leaveTypeMasterFormData.IsCarryForward || false,
      MaxCarryForward: leaveTypeMasterFormData.MaxCarryForward || 0,
      IsEncashable: leaveTypeMasterFormData.IsEncashable || false
    };
  };

  const handleAddUpdateLeaveTypeMaster = async () => {
    console.log("ADD FORM DATA:", leaveTypeMasterFormData);

    setFormErrors({});

    const validation = validateLeaveTypeMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushLeaveTypeMasterFormData();
        const response = await LeaveTypeMasterService.apiCallAddUpdateLeaveTypeMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = leaveTypeMasterFormData.LeaveTypeMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as LeaveTypeMasterData

            setLeaveTypeMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Leave Type added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as LeaveTypeMasterData;

            setLeaveTypeMasterList(prevData =>
              prevData.map(item =>
                item.LeaveTypeMasterId === leaveTypeMasterFormData.LeaveTypeMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingLeaveTypeMasterData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Operation failed' })
      },
      undefined,
      leaveTypeMasterFormData.LeaveTypeMasterId === 0 ? 'Add Leave Type' : 'Update Leave Type...'
    )
  }

  //#region DELETE Leave Type MASTER
  const handleDeleteLeaveTypeMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLeaveTypeMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteLeaveTypeMasterRequest = {
          LeaveTypeMasterId: deleteLeaveTypeMasterDetailsData.LeaveTypeMasterId,
          UniqueKey: deleteLeaveTypeMasterDetailsData.Uniquekey || ""
        }
        const response = await LeaveTypeMasterService.apiCallDeleteLeaveTypeMaster(params);

        if (E.isRight(response)) {

          setLeaveTypeMasterList(prevData => prevData.filter(item => item.LeaveTypeMasterId !== deleteLeaveTypeMasterDetailsData.LeaveTypeMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteLeaveTypeMasterDetailsData(null);
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
      'Delete Leave Type master data...'
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
          searchPlaceholder="Search By leave type..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchLeaveTypes}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeLeaveTypeMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle='Add LeaveType'
          onAdd={handleAddLeaveTypeMaster}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportLeaveTypeExcel}
          onExportPdf={handleExportLeaveTypePdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE BRANCH */}
        <DataTable
          data={leaveTypeListForTable}
          columns={visibleLeaveTypeMasterColumns}
          pagination={leaveTypeMasterPaginationInfo}
          emptyMessage="No leave types found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW BRANCH MODAL */}
        <ViewLeaveTypeDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewLeaveTypeMasterDetailsData(null)
          }}
          data={viewLeaveTypeMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE LeaveType MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingLeaveTypeMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingLeaveTypeMasterData(null)
            setFormErrors({})
          }}
          title={editingLeaveTypeMasterData ? 'Update Leave Type Master Details' : 'Add Leave Type Master Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateLeaveTypeMaster()
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
                  label='Leave Type'
                  value={leaveTypeMasterFormData.LeaveType ?? ""}
                  onChange={(e) => handleFieldChange("LeaveType", e.target.value)}
                  placeholder="Enter Leave Type"
                  maxLength={250}
                  error={formErrors.LeaveType}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Leave Type Code'
                  value={leaveTypeMasterFormData.LeaveTypeCode ?? ""}
                  onChange={(e) => handleFieldChange("LeaveTypeCode", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Leave Type Code"
                  error={formErrors.LeaveTypeCode}
                />

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Checkbox
                  label="Carry Forward"
                  checked={leaveTypeMasterFormData.IsCarryForward ?? false}
                  onChange={(e) => handleFieldChange("IsCarryForward", e.target.checked)}
                />
              </div>
              {leaveTypeMasterFormData.IsCarryForward && (
                <div>
                  <Input
                    type="text"
                    label='MaxCarryForward'
                    value={leaveTypeMasterFormData.MaxCarryForward ?? ""}
                    onChange={(e) => handleFieldChange("MaxCarryForward", e.target.value)}
                    required
                    placeholder="Enter Max Carry Forward"
                    maxLength={250}
                    error={formErrors.MaxCarryForward}
                  />
                </div>
              )}
            </div>
            <div>
              <Checkbox
                label="Encashable"
                checked={leaveTypeMasterFormData.IsEncashable ?? false}
                onChange={(e) => handleFieldChange("IsEncashable", e.target.checked)}
              />
            </div>

          </div>
        </Modal>

        {/* CUSTOMIZE COLUMNS MODAL */}
        <CustomizeColumnsModal
          isOpen={isShowCustomizeLeaveTypeMasterColumnsModal}
          onClose={() => setIsShowCustomizeLeaveTypeMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredLeaveTypeMasterColumnKeys]))
            setSelectedLeaveTypeMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeLeaveTypeMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={leaveTypeMasterColumns}
          selectedKeys={selectedLeaveTypeMasterColumnKeys}
          requiredKeys={requiredLeaveTypeMasterColumnKeys}
          title="Customize Leave Type Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Leave Type Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          size="half-screen"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <Input
                  type="text"
                  value={tempFilters.LeaveType || ''}
                  onChange={(e) => handleFilterChange('LeaveType', e.target.value)}
                  placeholder="Enter leave type"
                />
              </div>
            </div>
          </div>
        </Modal>
        {/* DELETE CONFIRMATION LeaveType MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteLeaveTypeMasterDetailsData(null)
          }}
          onConfirm={handleDeleteLeaveTypeMaster}
          title="You are about to delete a Leave Type?"
          message="Deleting this Leave Type will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  )
}

export default LeaveTypeMaster


