import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  WeekOffMappingMasterData,
  FilterWithPaginationWeekOffMappingMasterRequest,
  AddUpdateWeekOffMappingMasterRequest,
  DeleteWeekOffMappingMasterRequest
} from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';

import { WeekOffMappingMasterService } from '@/features/weekOffMappingMaster/services/WeekOffMappingMasterService'
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
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { WeekOffMasterService } from '@/features/weekOffMaster/services/WeekOffMasterService';


export const WeekOffMappingMaster: React.FC = () => {

  const [weekOffMappingMasterList, setWeekOffMappingMasterList] = useState<WeekOffMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchWeekOffMappings(value)
  }, 350)
  const [viewWeekOffMappingMasterDetailsData, setViewWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeWeekOffMappingMasterColumnsModal, setIsShowCustomizeWeekOffMappingMasterColumnsModal] = useState(false);
  const { canAction, canExport } = useMenuPermissions();
  const hasFetchedInitialWeekOffMappings = useRef(false)

  // Edit WeekOffMapping MASTER
  const [editingWeekOffMappingMasterData, setEditingWeekOffMappingMasterData] = useState<WeekOffMappingMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE WeekOffMapping MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteWeekOffMappingMasterDetailsData, setDeleteWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)



  useEffect(() => {
    if (hasFetchedInitialWeekOffMappings.current) return
    hasFetchedInitialWeekOffMappings.current = true;
    fetchWeekOffMappingList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchWeekOffMappingList = async (page: number = pagination.currentPage) => {
    return await loadWeekOffMappings(page, filters);
  }

  const loadWeekOffMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = weekOffMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationWeekOffMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          WeekOffPolicyMasterMappingId: filterParams.WeekOffPolicyMasterMappingId ? Number(filterParams.WeekOffPolicyMasterMappingId) : undefined,
          WeekOffPolicyName: filterParams.WeekOffPolicyName?.trim() || undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getWeekOffMappings(params);
        if (E.isRight(response)) {
          setWeekOffMappingMasterList(response.right.Data);
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
      'Loading Week Off Mapping Data...'
    )
  }

  const searchWeekOffMappings = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchWeekOffMappingList();
      return
    }
    const filterParams: FilterInfo = {
      WeekOffPolicyName: searchValue.trim(),
    };
    await loadWeekOffMappings(1, filterParams)
  }

  const clearsearchWeekOffMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchWeekOffMappingList();
  }

  const handleExportWeekOffMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = weekOffMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationWeekOffMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          WeekOffPolicyName: filters.WeekOffPolicyName?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getWeekOffMappings(params);
        handleExportFile(response, exportType, 'Week Off Mapping Master', addToast)
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

  const handleExportWeekOffMappingExcel = () => handleExportWeekOffMappings('Excel')
  const handleExportWeekOffMappingPdf = () => handleExportWeekOffMappings('PDF')

  const getWeekOffMappings = async (filterParams: FilterWithPaginationWeekOffMappingMasterRequest) => {
    return await WeekOffMappingMasterService.apiCallPullWeekOffMappingMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchWeekOffMappingList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchWeekOffMappingList(1);
  }

  const weekOffMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const weekOffMappingListForTable = useMemo(() => weekOffMappingMasterList, [weekOffMappingMasterList]);

  const handleViewWeekOffMappingDetails = useCallback((row: WeekOffMappingMasterData) => {
    setViewWeekOffMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditWeekOffMappingMaster = useCallback((row: WeekOffMappingMasterData) => {
    setEditingWeekOffMappingMasterData({
      ...row,
      WeekOffPolicyName: row.WeekOffPolicyName || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])
  const handleConfirmationDialogBoxOpen = useCallback((row: WeekOffMappingMasterData) => {
    setDeleteWeekOffMappingMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  const weekOffMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'WeekOffPolicyName',
        label: 'Week Off Policy Name',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewWeekOffMappingDetails(row)}
            />
            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditWeekOffMappingMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Week Off Mapping"
                    style={{
                      color: '#0B3251',
                      padding: '0px 8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleConfirmationDialogBoxOpen(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    style={{
                      color: 'red',
                      padding: '0px 8px'
                    }}
                    title="Delete Week Off Mapping"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              </div>
            )}
          </div>
        )
      },
      {
        key: 'DepartmentName',
        label: 'Department Name',
        width: '18',
        sortable: true,
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
        key: 'EmployeeName',
        label: 'Employee Name',
        width: '18',
        sortable: true,
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
        key: 'WeeklyOff',
        label: 'Weekly Off',
        width: '12',
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
        width: '12',
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
        width: '10',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '10',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewWeekOffMappingDetails]
  )

  const requiredWeekOffMappingMasterColumnKeys: string[] = ['WeekOffPolicyName'];
  const allWeekOffMappingMasterColumnKeys: string[] = weekOffMappingMasterColumns.map(c => c.key)
  const [selectedWeekOffMappingMasterColumnKeys, setSelectedWeekOffMappingMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getWeekOffMappingMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredWeekOffMappingMasterColumnKeys]));
        return withRequired.filter(k => allWeekOffMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allWeekOffMappingMasterColumnKeys
  })

  useEffect(() => {
    setSelectedWeekOffMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredWeekOffMappingMasterColumnKeys])).filter(k => allWeekOffMappingMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffMappingMasterColumns.length])

  const visibleWeekOffMappingMasterColumns = useMemo(
    () => weekOffMappingMasterColumns.filter(col => selectedWeekOffMappingMasterColumnKeys.includes(col.key)),
    [weekOffMappingMasterColumns, selectedWeekOffMappingMasterColumnKeys]
  )

  interface ViewWeekOffMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: WeekOffMappingMasterData | null
  }

  const ViewWeekOffMappingDetailsModal: React.FC<ViewWeekOffMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Week Off Mapping Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Department Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.DepartmentName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Employee Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.EmployeeName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Week Off Policy Code</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeekOffPolicyCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Week Off Policy Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.WeekOffPolicyName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Week Days</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeekDays || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Week Days Starts On</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeekDaysStartsOn || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Weekly Off</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeeklyOff || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Weekly Off 2</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeeklyOff2 || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Weekly Off 2 Type</span>
              <span className="text-sm text-blue-600 font-medium">{data.WeeklyOff2Type || 'N/A'}</span>
            </div>
            {data.NotApplicableForMonths && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Not Applicable For Months</span>
                <span className="text-sm text-blue-600 font-medium">{data.NotApplicableForMonths}</span>
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-blue-600 font-medium">{data.CreatedBy || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created Date</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified By</span>
                    <span className="text-sm text-blue-600 font-medium">{data.ModifiedBy}</span>
                  </div>
                )}
                {data.ModifiedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified Date</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    loadWeekOffMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadWeekOffMappings(1, {})
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

  //ADD UPDATE Earning MASTER
  const handleAddWeekOffMappingModal = () => {
    setEditingWeekOffMappingMasterData(null);
    setIsAddUpdateModalOpen(true);
  };

  interface AddUpdateEarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddUpdateWeekOffMappingMasterRequest) => void;
    data?: WeekOffMappingMasterData | null;
    loading?: boolean;
  }

  const AddUpdateWeekOffMappingModal: React.FC<AddUpdateEarningModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateWeekOffMappingMasterRequest>({
      WeekOffPolicyMasterMappingId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      WeekOffPolicyMasterId: 0,
      DepartmentMasterId: "",
      EmployeeId: ""
    });
    // Single error object for all fields
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
      if (isOpen) {
        if (data) {
          //Edit WeekOffMapping
          setFormData({
            WeekOffPolicyMasterMappingId: data.WeekOffPolicyMasterMappingId || 0,
            Uniquekey: data.Uniquekey,
            WeekOffPolicyMasterId: data.WeekOffPolicyMasterId || 0,
            DepartmentMasterId: data.DepartmentMasterId || "",
            EmployeeId: data.EmployeeId || ""

          });
          setDropdownLabels({
            WeekOffPolicyName: data.WeekOffPolicyName || "",
          });
        } else {
          // Add WeekOffMapping
          setFormData({
            WeekOffPolicyMasterMappingId: 0,
            Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            WeekOffPolicyMasterId: 0,
            DepartmentMasterId: "",
            EmployeeId: ""
          })
        }
        setErrors({});
      }
    }, [isOpen, data]);

    // Handle input change
    const handleFieldChange = (
      field: keyof AddUpdateWeekOffMappingMasterRequest,
      value: any
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };
    const handleSubmitAddWeekOffPolicyName = (e: React.FormEvent) => {
      debugger
      e.preventDefault();
      const requiredFields = [
       "WeekOffPolicyName"
      ];

      const newErrors: any = {};

      requiredFields.forEach((field) => {
        const value = formData[field as keyof AddUpdateWeekOffMappingMasterRequest];
        if (value === null || value === undefined ||
          value === 0 || value.toString().trim() === "") {
          const label = field.replace(/([A-Z])/g, " $1");
          newErrors[field] = `${label} is required`;
        }
      });
      setErrors(newErrors);

      // STOP submit if any error
      if (Object.keys(newErrors).length > 0) return;

      onSubmit(formData);
    };
    const fetchWeekOffPolicyNameOptions = async (pageNumber: number, params?: { value?: string }) => {
      const responseEither = await WeekOffMasterService.apiCallPullWeekOffMaster({
        PageSize: 10,
        PageNumber: pageNumber,
        WeekOffPolicyName: params?.value || "",
      });
      if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
      const apiResponse = responseEither.right;
      const WeekOffPolicyNameList = apiResponse?.Data?.map((item: any) => ({ label: item.WeekOffPolicyName, value: String(item.WeekOffPolicyMasterId) })) || [];
      return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? WeekOffPolicyNameList.length, itemList: WeekOffPolicyNameList };
    };
    const toDropdownInitialValue = (
      id?: number,
      label?: string
    ): { label: string; value: string | number } | null => {
      if (!id) return null;
      return {
        label: label || String(id),
        value: String(id),
      };
    };
    const [dropdownLabels, setDropdownLabels] = useState<{
      WeekOffPolicyName?: string;
    }>({});

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onCancel={onClose}
        title={formData.WeekOffPolicyMasterMappingId === 0 ? "Add Week Off Mapping" : "Update Week Off Mapping"}
        onSubmit={handleSubmitAddWeekOffPolicyName}
        saveText={formData.WeekOffPolicyMasterMappingId === 0 ? "Save" : "Update"}
        cancelText='Cancel'
        loading={loading}
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SingleSelectDropdownWithPagination
                label="WeekOffPolicyName"
                title="Select..."
                size="lg"
                dataFetchCallBack={fetchWeekOffPolicyNameOptions}
                onSelected={(item) => handleFieldChange("WeekOffPolicyMasterId", Number(item.value))}
                initialValue={toDropdownInitialValue(formData.WeekOffPolicyMasterId, dropdownLabels.WeekOffPolicyName)}
              />
            </div>
          </div>
        </div>
      </Modal>
    )
  };

  const handleAddUpdateWeekOffMappingMaster = async (formData: AddUpdateWeekOffMappingMasterRequest) => {

    setIsAddUpdateModalOpen(false);

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await WeekOffMappingMasterService.apiCallAddUpdateWeekOffMappingMaster(formData);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.WeekOffPolicyMasterMappingId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as WeekOffMappingMasterData

            setWeekOffMappingMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Week Off Mapping added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as WeekOffMappingMasterData;

            setWeekOffMappingMasterList(prevData =>
              prevData.map(item =>
                item.WeekOffPolicyMasterMappingId === formData.WeekOffPolicyMasterMappingId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingWeekOffMappingMasterData(null);

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
      formData.WeekOffPolicyMasterMappingId === 0 ? 'Add Week Off Mapping' : 'Update Week Off Mapping...'
    )
  }

  //#region DELETE Week Off Mapping MASTER
  const handleDeleteWeekOffMappingMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteWeekOffMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteWeekOffMappingMasterRequest = {
          WeekOffPolicyMasterMappingId: deleteWeekOffMappingMasterDetailsData.WeekOffPolicyMasterMappingId ?? 0,
          UniqueKey: deleteWeekOffMappingMasterDetailsData.Uniquekey ?? ""
        }
        const response = await WeekOffMappingMasterService.apiCallDeleteWeekOffMappingMaster(params);

        if (E.isRight(response)) {
          setWeekOffMappingMasterList(prevData => prevData.filter(item => item.WeekOffPolicyMasterMappingId !== deleteWeekOffMappingMasterDetailsData.WeekOffPolicyMasterMappingId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteWeekOffMappingMasterDetailsData(null);
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
      'Delete Week Off Mapping master data...'
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by week off policy name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchWeekOffMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeWeekOffMappingMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle='Add WeekOffName'
          onAdd={handleAddWeekOffMappingModal}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportWeekOffMappingExcel}
          onExportPdf={handleExportWeekOffMappingPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={weekOffMappingListForTable}
          columns={visibleWeekOffMappingMasterColumns}
          pagination={weekOffMappingMasterPaginationInfo}
          emptyMessage="No week off mappings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewWeekOffMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewWeekOffMappingMasterDetailsData(null)
          }}
          data={viewWeekOffMappingMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeWeekOffMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeWeekOffMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredWeekOffMappingMasterColumnKeys]))
            setSelectedWeekOffMappingMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeWeekOffMappingMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={weekOffMappingMasterColumns}
          selectedKeys={selectedWeekOffMappingMasterColumnKeys}
          requiredKeys={requiredWeekOffMappingMasterColumnKeys}
          title="Customize Week Off Mapping Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Week Off Mapping Master"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <Input
                  type="text"
                  value={tempFilters.DepartmentName || ''}
                  onChange={(e) => handleFilterChange('DepartmentName', e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <Input
                  type="text"
                  value={tempFilters.EmployeeName || ''}
                  onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
            </div>
          </div>
        </Modal>
        {/* DELETE CONFIRMATION  WeekOffMapping MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteWeekOffMappingMasterDetailsData(null)
          }}
          onConfirm={handleDeleteWeekOffMappingMaster}
          title="You are about to delete a  Week Off Mapping?"
          message="Deleting this  Week Off Mapping will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
        <AddUpdateWeekOffMappingModal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingWeekOffMappingMasterData(null)
          }}
          onSubmit={handleAddUpdateWeekOffMappingMaster}
          data={editingWeekOffMappingMasterData}
          loading={isLoading}
        />
      </div>
    </>
  )
}

export default WeekOffMappingMaster


