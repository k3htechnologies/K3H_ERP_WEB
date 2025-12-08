import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  WeekOffMasterData,
  FilterWithPaginationWeekOffMasterRequest,
  DeleteWeekOffMasterRequest,
  AddUpdateWeekOffMasterRequest
} from '@/features/weekOffMaster/models/WeekOffMasterModel';

import { WeekOffMasterService } from '@/features/weekOffMaster/services/WeekOffMasterService'
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
import { FieldItem } from '@/ui/components/forms/FieldItem';


export const WeekOffMasterMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [weekOffMasterList, setWeekOffMasterList] = useState<WeekOffMasterData[]>([]);
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
    searchWeekOffs(value)
  }, 350)

  //VIEW BRANCH MASTER MODAL STATES
  const [viewWeekOffMasterDetailsData, setViewWeekOffMasterDetailsData] = useState<WeekOffMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeWeekOffMasterColumnsModal, setIsShowCustomizeWeekOffMasterColumnsModal] = useState(false);

  // Edit WEEK OFF MASTER
  const [editingWeekOffMasterData, setEditingWeekOffMasterData] = useState<WeekOffMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [WeekOffMasterFormData, setWeekOffMasterFormData] = useState<AddUpdateWeekOffMasterRequest>({
    WeekOffPolicyMasterId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    WeekOffPolicyCode: "",
    WeekOffPolicyName: "",
    WeekDays: 0,
    WeekDaysStartsOn: "",
    WeeklyOff: "",
    WeeklyOff2: "",
    WeeklyOff2Type: "",
    NotApplicableForMonths: ""
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  //DELETE WEEK OFF MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteWeekOffMasterDetailsData, setDeleteWeekOffMasterDetailsData] = useState<WeekOffMasterData | null>(null)

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialWeekOffs = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialWeekOffs.current) return
    hasFetchedInitialWeekOffs.current = true;
    fetchWeekOffList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH

  const fetchWeekOffList = async (page: number = pagination.currentPage) => {
    return await loadWeekOffs(page, filters);
  }

  const loadWeekOffs = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = weekOffMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }
        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          WeekOffPolicyMasterId: filterParams.WeekOffPolicyMasterId ? Number(filterParams.WeekOffPolicyMasterId) : undefined,
          WeekOffPolicyName: filterParams.WeekOffPolicyName?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getWeekOffs(params);
        if (E.isRight(response)) {
          setWeekOffMasterList(response.right.Data);
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
      'Loading Week Off Data...'
    )
  }

  // SERACH LEAVE TYPE
  const searchWeekOffs = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchWeekOffList();

      return
    }
    const filterParams: FilterInfo = {
      WeekOffPolicyName: searchValue.trim(),
    };

    await loadWeekOffs(1, filterParams)
  }

  const clearsearchWeekOffs = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchWeekOffList();
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportWeekOffs = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = weekOffMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          WeekOffPolicyName: filters.WeekOffPolicyName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getWeekOffs(params);

        handleExportFile(response, exportType, 'Week Off Master', addToast)

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

  const handleExportWeekOffExcel = () => handleExportWeekOffs('Excel')
  const handleExportWeekOffPdf = () => handleExportWeekOffs('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET BRANCH
  const getWeekOffs = async (filterParams: FilterWithPaginationWeekOffMasterRequest) => {

    return await WeekOffMasterService.apiCallPullWeekOffMaster(filterParams);
  }

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchWeekOffList(page);
  };


  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchWeekOffList(1);
  }

  const weekOffMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const weekOffListForTable = useMemo(() => weekOffMasterList, [weekOffMasterList]);

  // STABLE HANDLER VIEW EDIT CONFIRMATION DIALOG BOX
  const handleViewWeekOffDetails = useCallback((row: WeekOffMasterData) => {
    setViewWeekOffMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])


  const handleConfirmationDialogBoxOpen = useCallback((row: WeekOffMasterData) => {
    setDeleteWeekOffMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  const weekOffMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'WeekOffPolicyName',
        label: 'Week Off Policy Name',
        width: '30',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
            <TooltipText
              text={value || 'N/A'}
              maxWidth="300px"
              tooltipThreshold={30}
              onClick={() => handleViewWeekOffDetails(row)}
            />

          </div>
        )
      },
      {
        key: 'WeekOffPolicyCode',
        label: 'Week Off Policy Code',
        width: '20',
        sortable: false,
        fixed: 'left',
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'WeeklyOff',
        label: 'Weekly Off',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'WeeklyOff2',
        label: 'Weekly Off 2',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {value || 'N/A'}
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
    [handleViewWeekOffDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredWeekOffMasterColumnKeys: string[] = ['WeekOffPolicyName'];

  const allWeekOffMasterColumnKeys: string[] = weekOffMasterColumns.map(c => c.key)

  const [selectedWeekOffMasterColumnKeys, setSelectedWeekOffMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getWeekOffMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredWeekOffMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allWeekOffMasterColumnKeys.includes(k));
      }
    } catch { }
    return allWeekOffMasterColumnKeys
  })


  useEffect(() => {
    setSelectedWeekOffMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredWeekOffMasterColumnKeys])).filter(k => allWeekOffMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffMasterColumns.length])

  const visibleWeekOffMasterColumns = useMemo(
    () => weekOffMasterColumns.filter(col => selectedWeekOffMasterColumnKeys.includes(col.key)),
    [weekOffMasterColumns, selectedWeekOffMasterColumnKeys]
  )

  //#endregion

  //#region VIEW LEAVE TYPE DETAILS MODAL COMPONENT
  interface ViewWeekOffDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: WeekOffMasterData | null
  }

  const ViewWeekOffDetailsModal: React.FC<ViewWeekOffDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Week Off Details"
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

            <FieldItem label="Week Off Policy Name" value={data.WeekOffPolicyName} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Week Off Policy Code" value={data.WeekOffPolicyCode} isRow withBorder={true} />
            <FieldItem label="Week Days" value={data.WeekDays} isRow withBorder={true} />
            <FieldItem label="Week Days Starts On" value={data.WeekDaysStartsOn} isRow withBorder={true} />
            <FieldItem label="Weekly Off" value={data.WeeklyOff} isRow withBorder={true} />
            <FieldItem label="Weekly Off2" value={data.WeeklyOff2} isRow withBorder={true} />
            <FieldItem label="Weekly Off2 Type" value={data.WeeklyOff2Type} isRow withBorder={true} />
            <FieldItem label="Not Applicable For Months" value={data.NotApplicableForMonths} isRow withBorder={true} />

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
                      handleEditWeekOffMasterData(data)
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
 
  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadWeekOffs(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadWeekOffs(1, {})
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

  //#region ADD UPDATE WEEK OFF MASTER
  const handleAddWeekOffMaster = () => {
    setEditingWeekOffMasterData(null);
    setWeekOffMasterFormData({
      WeekOffPolicyMasterId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      WeekOffPolicyCode: "",
      WeekOffPolicyName: "",
      WeekDays: 0,
      WeekDaysStartsOn: "",
      WeeklyOff: "",
      WeeklyOff2: "",
      WeeklyOff2Type: "",
      NotApplicableForMonths: ""
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const handleEditWeekOffMasterData = (row: WeekOffMasterData) => {
    setEditingWeekOffMasterData(row);
    setWeekOffMasterFormData({
      WeekOffPolicyMasterId:row.WeekOffPolicyMasterId || 0,
      Uniquekey:row.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      WeekOffPolicyCode:row.WeekOffPolicyCode || "",
      WeekOffPolicyName:row.WeekOffPolicyName || "",
      WeekDays: row.WeekDays || 0,
      WeekDaysStartsOn:row.WeekDaysStartsOn || "",
      WeeklyOff:row.WeeklyOff || "",
      WeeklyOff2:row.WeeklyOff2 || "",
      WeeklyOff2Type:row.WeeklyOff2Type || "",
      NotApplicableForMonths:row.NotApplicableForMonths || ""
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }


  const handleFieldChange = (field: keyof AddUpdateWeekOffMasterRequest, value: string | number | null | boolean) => {
    setWeekOffMasterFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateWeekOffMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!WeekOffMasterFormData.WeekOffPolicyName?.trim()) {
      newErrors.WeekOffPolicyName = "Week Off Policy Name is required.";
    }

    if (!WeekOffMasterFormData.WeekOffPolicyCode?.trim()) {
      newErrors.WeekOffPolicyCode = "Week Off Policy Code is required.";
    }

    if (!WeekOffMasterFormData.WeekDays) {
      newErrors.WeekDays = "Week Days is required.";
    }
    if (!WeekOffMasterFormData.WeekDaysStartsOn?.trim()) {
      newErrors.WeekDaysStartsOn = "Week Days Starts On is required.";
    }
    if (!WeekOffMasterFormData.WeeklyOff?.trim()) {
      newErrors.WeeklyOff = "Weekly Off is required.";
    }
    if (!WeekOffMasterFormData.WeeklyOff2?.trim()) {
      newErrors.WeeklyOff2 = "Weekly Off2 is required.";
    }
    if (!WeekOffMasterFormData.WeeklyOff2Type?.trim()) {
      newErrors.WeeklyOff2Type = "Weekly Off2 Type is required.";
    }
    if (!WeekOffMasterFormData.NotApplicableForMonths?.trim()) {
      newErrors.NotApplicableForMonths = "Not Applicable For Months is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushWeekOffMasterFormData = (): AddUpdateWeekOffMasterRequest => {
    return {
      WeekOffPolicyMasterId: WeekOffMasterFormData.WeekOffPolicyMasterId || 0,
      Uniquekey: WeekOffMasterFormData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      WeekOffPolicyCode: WeekOffMasterFormData.WeekOffPolicyCode || "",
      WeekOffPolicyName: WeekOffMasterFormData.WeekOffPolicyName || "",
      WeekDays: WeekOffMasterFormData.WeekDays || 0,
      WeekDaysStartsOn: WeekOffMasterFormData.WeekDaysStartsOn || "",
      WeeklyOff: WeekOffMasterFormData.WeeklyOff || "",
      WeeklyOff2: WeekOffMasterFormData.WeeklyOff2 || "",
      WeeklyOff2Type: WeekOffMasterFormData.WeeklyOff2Type || "",
      NotApplicableForMonths: WeekOffMasterFormData.NotApplicableForMonths || ""
    };
  };

  const handleAddUpdateWeekOffMaster = async () => {

    setFormErrors({});

    const validation = validateWeekOffMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushWeekOffMasterFormData();
        const response = await WeekOffMasterService.apiCallAddUpdateWeekOffMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = WeekOffMasterFormData.WeekOffPolicyMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as WeekOffMasterData

            setWeekOffMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Week Off added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as WeekOffMasterData;

            setWeekOffMasterList(prevData =>
              prevData.map(item =>
                item.WeekOffPolicyMasterId === WeekOffMasterFormData.WeekOffPolicyMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingWeekOffMasterData(null);

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
      WeekOffMasterFormData.WeekOffPolicyMasterId === 0 ? 'Add Week Off' : 'Update Week Off...'
    )
  }

  //#region DELETE Week Off MASTER
  const handleDeleteWeekOffMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteWeekOffMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteWeekOffMasterRequest = {
          WeekOffPolicyMasterId: deleteWeekOffMasterDetailsData.WeekOffPolicyMasterId || 0,
          UniqueKey: deleteWeekOffMasterDetailsData.Uniquekey || ""
        }
        const response = await WeekOffMasterService.apiCallDeleteWeekOffMaster(params);

        if (E.isRight(response)) {
          setWeekOffMasterList(prevData => prevData.filter(item => item.WeekOffPolicyMasterId !== deleteWeekOffMasterDetailsData.WeekOffPolicyMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteWeekOffMasterDetailsData(null);
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
      'Delete Week Off master data...'
    )
  }

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
          searchPlaceholder="Search By week off policy name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchWeekOffs}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeWeekOffMasterColumnsModal(true)}
          isShowAddButton={canAction}
          isShowImportButton={false}
          isShowExportButton={canExport}
          addTitle='Add Week Off'
          onAdd={handleAddWeekOffMaster}
          onExportExcel={handleExportWeekOffExcel}
          onExportPdf={handleExportWeekOffPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={weekOffListForTable}
          columns={visibleWeekOffMasterColumns}
          pagination={weekOffMasterPaginationInfo}
          emptyMessage="No week off policies found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewWeekOffDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewWeekOffMasterDetailsData(null)
          }}
          data={viewWeekOffMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE WEEK OFF MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingWeekOffMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingWeekOffMasterData(null)
            setFormErrors({})
          }}
          title={editingWeekOffMasterData ? 'Update Week Off Master Details' : 'Add Week Off Master Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateWeekOffMaster()
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
                  label='Week Off Policy Name'
                  value={WeekOffMasterFormData.WeekOffPolicyName ?? ""}
                  onChange={(e) => handleFieldChange("WeekOffPolicyName", e.target.value)}
                  placeholder="Enter Week Off Policy Name"
                  maxLength={250}
                  error={formErrors.WeekOffPolicyName}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Week Off Policy Code'
                  value={WeekOffMasterFormData.WeekOffPolicyCode ?? ""}
                  onChange={(e) => handleFieldChange("WeekOffPolicyCode", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Week Off Policy Code"
                  error={formErrors.WeekOffPolicyCode}
                />

              </div>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Week Days'
                  value={WeekOffMasterFormData.WeekDays ?? ""}
                  onChange={(e) => handleFieldChange("WeekDays", e.target.value)}
                  placeholder="Enter Week Days"
                  maxLength={250}
                  error={formErrors.WeekDays}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Week Days Starts On'
                  value={WeekOffMasterFormData.WeekDaysStartsOn ?? ""}
                  onChange={(e) => handleFieldChange("WeekDaysStartsOn", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Week Days StartsOn"
                  error={formErrors.WeekDaysStartsOn}
                />

              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Week Off '
                  value={WeekOffMasterFormData.WeeklyOff ?? ""}
                  onChange={(e) => handleFieldChange("WeeklyOff", e.target.value)}
                  placeholder="Enter Weekly Off"
                  maxLength={250}
                  error={formErrors.WeeklyOff}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Weekly Off2'
                  value={WeekOffMasterFormData.WeeklyOff2 ?? ""}
                  onChange={(e) => handleFieldChange("WeeklyOff2", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Weekly Off2"
                  error={formErrors.WeeklyOff2}
                />

              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Weekly Off2 Type'
                  value={WeekOffMasterFormData.WeeklyOff2Type ?? ""}
                  onChange={(e) => handleFieldChange("WeeklyOff2Type", e.target.value)}
                  placeholder="Enter Weekly Off2 Type"
                  maxLength={250}
                  error={formErrors.WeeklyOff2Type}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Not Applicable For Months'
                  value={WeekOffMasterFormData.NotApplicableForMonths ?? ""}
                  onChange={(e) => handleFieldChange("NotApplicableForMonths", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Not Applicable For Months"
                  error={formErrors.NotApplicableForMonths}
                />

              </div>
            </div>
          </div>
        </Modal>

        {/* CUSTOMIZE COLUMNS MODAL */}
        <CustomizeColumnsModal
          isOpen={isShowCustomizeWeekOffMasterColumnsModal}
          onClose={() => setIsShowCustomizeWeekOffMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredWeekOffMasterColumnKeys]))
            setSelectedWeekOffMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeWeekOffMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={weekOffMasterColumns}
          selectedKeys={selectedWeekOffMasterColumnKeys}
          requiredKeys={requiredWeekOffMasterColumnKeys}
          title="Customize Week Off Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Week Off Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Week Off Policy Name</label>
                <Input
                  type="text"
                  value={tempFilters.WeekOffPolicyName || ''}
                  onChange={(e) => handleFilterChange('WeekOffPolicyName', e.target.value)}
                  placeholder="Enter week off policy name"
                />
              </div>
            </div>
          </div>
        </Modal>
        {/* DELETE CONFIRMATION  week off MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteWeekOffMasterDetailsData(null)
          }}
          onConfirm={handleDeleteWeekOffMaster}
          title="You are about to delete a  week off?"
          message="Deleting this  week off will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  )
}

export default WeekOffMasterMaster


