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


export const WeekOffMasterMaster: React.FC = () => {

  const [weekOffMasterList, setWeekOffMasterList] = useState<WeekOffMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchWeekOffs(value)
  }, 350)
  const [viewWeekOffMasterDetailsData, setViewWeekOffMasterDetailsData] = useState<WeekOffMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeWeekOffMasterColumnsModal, setIsShowCustomizeWeekOffMasterColumnsModal] = useState(false);
  const { canAction, canExport } = useMenuPermissions();
  const hasFetchedInitialWeekOffs = useRef(false)


  // Edit WEEK OFF MASTER
  const [editingWeekOffMasterData, setEditingWeekOffMasterData] = useState<WeekOffMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE WEEK OFF MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteWeekOffMasterDetailsData, setDeleteWeekOffMasterDetailsData] = useState<WeekOffMasterData | null>(null)


  useEffect(() => {
    if (hasFetchedInitialWeekOffs.current) return
    hasFetchedInitialWeekOffs.current = true;
    fetchWeekOffList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

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

  const handleExportWeekOffs = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
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

  const getWeekOffs = async (filterParams: FilterWithPaginationWeekOffMasterRequest) => {
    return await WeekOffMasterService.apiCallPullWeekOffMaster(filterParams);
  }

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

  const handleViewWeekOffDetails = useCallback((row: WeekOffMasterData) => {
    setViewWeekOffMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

   const handleEditLeaveEncashmentMaster = useCallback((row: WeekOffMasterData) => {
      setEditingWeekOffMasterData({
        ...row,
  
      })
      setIsAddUpdateModalOpen(true);
  
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
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="300px"
              tooltipThreshold={30}
              onClick={() => handleViewWeekOffDetails(row)}
            />
            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditLeaveEncashmentMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Week Off"
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
                    title="Delete Week Off"
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
        key: 'WeekOffPolicyCode',
        label: 'Week Off Policy Code',
        width: '20',
        sortable: false,
        align: 'center',
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
    [handleViewWeekOffDetails]
  )

  const requiredWeekOffMasterColumnKeys: string[] = ['WeekOffPolicyName'];
  const allWeekOffMasterColumnKeys: string[] = weekOffMasterColumns.map(c => c.key)
  const [selectedWeekOffMasterColumnKeys, setSelectedWeekOffMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getWeekOffMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredWeekOffMasterColumnKeys]));
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
        title="Settings - Company setup (Week Off Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
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

  //ADD UPDATE WEEK OFF MASTER
  const handleAddWeekOffModal = () => {
    setEditingWeekOffMasterData(null);
    setIsAddUpdateModalOpen(true);
  };

  interface AddUpdateWeekOffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddUpdateWeekOffMasterRequest) => void;
    data?: WeekOffMasterData | null;
    loading?: boolean;
  }

  const AddUpdateWeekOffModal: React.FC<AddUpdateWeekOffModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateWeekOffMasterRequest>({

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
    // Single error object for all fields
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
      if (isOpen) {
        if (data) {
          //Edit Week Off
          setFormData({
            WeekOffPolicyMasterId: data.WeekOffPolicyMasterId,
            Uniquekey: data.Uniquekey,
            WeekOffPolicyCode: data.WeekOffPolicyCode || "",
            WeekOffPolicyName: data.WeekOffPolicyName || "",
            WeekDays: data.WeekDays || 0,
            WeekDaysStartsOn: data.WeekDaysStartsOn || "",
            WeeklyOff: data.WeeklyOff || "",
            WeeklyOff2: data.WeeklyOff2 || "",
            WeeklyOff2Type: data.WeeklyOff2Type || "",
            NotApplicableForMonths: data.NotApplicableForMonths || ""
          });
        } else {
          // Add Week Off
          setFormData({
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
          })
        }
        setErrors({});
      }
    }, [isOpen, data]);

    // Handle input change
    const handleFieldChange = (
      field: keyof AddUpdateWeekOffMasterRequest,
      value: any
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };
    const handleSubmitAddWeekOff = (e: React.FormEvent) => {
      e.preventDefault();
      const requiredFields = [
        "WeekOffPolicyCode",
        "WeekOffPolicyName",
        "WeekDays",
        "WeekDaysStartsOn",
        "WeeklyOff",
        "WeeklyOff2",
        "WeeklyOff2Type",
        "NotApplicableForMonths"
      ];

      const newErrors: any = {};

      requiredFields.forEach((field) => {
        const value = formData[field as keyof AddUpdateWeekOffMasterRequest];
        if (value === null || value === undefined ||value===0 || value.toString().trim() === "") {
          const label = field.replace(/([A-Z])/g, " $1");
          newErrors[field] = `${label} is required`;
        }
      });
      setErrors(newErrors);

      // STOP submit if any error
      if (Object.keys(newErrors).length > 0) return;

      onSubmit(formData);
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onCancel={onClose}
        title={formData.WeekOffPolicyMasterId === 0 ? "Add Week Off" : "Update Week Off"}
        onSubmit={handleSubmitAddWeekOff}
        saveText={formData.WeekOffPolicyMasterId === 0 ? "Save" : "Update"}
        cancelText='Cancel'
        loading={loading}
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/*Week Off Policy Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Week Off Policy Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.WeekOffPolicyName ?? ""}
                onChange={(e) => handleFieldChange("WeekOffPolicyName", e.target.value)}
                className={`w-full p-2 rounded border ${errors.WeekOffPolicyName ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.WeekOffPolicyName && (
                <p className="text-red-500 text-xs mt-1">{errors.WeekOffPolicyName}</p>
              )}
            </div>

            {/* Week Off Policy Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Week Off Policy Code<span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.WeekOffPolicyCode ?? ""}
                onChange={(e) => handleFieldChange("WeekOffPolicyCode", e.target.value)}
                className={`w-full p-2 rounded border ${errors.WeekOffPolicyCode ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.WeekOffPolicyCode && (
                <p className="text-red-500 text-xs mt-1">{errors.WeekOffPolicyCode}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/*Week Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Week Days<span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.WeekDays ?? ""}
                onChange={(e) => handleFieldChange("WeekDays", e.target.value)}
                className={`w-full p-2 rounded border ${errors.WeekDays ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.WeekDays && (
                <p className="text-red-500 text-xs mt-1">{errors.WeekDays}</p>
              )}
            </div>

            {/* Week Days Starts On */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Week Days Starts On<span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.WeekDaysStartsOn ?? ""}
                onChange={(e) => handleFieldChange("WeekDaysStartsOn", e.target.value)}
                className={`w-full p-2 rounded border ${errors.WeekDaysStartsOn ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.WeekDaysStartsOn && (
                <p className="text-red-500 text-xs mt-1">{errors.WeekDaysStartsOn}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/*Weekly Off*/}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Off <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.WeeklyOff ?? ""}
                onChange={(e) => handleFieldChange("WeeklyOff", e.target.value)}
                className={`w-full p-2 rounded border ${errors.WeeklyOff ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.WeeklyOff && (
                <p className="text-red-500 text-xs mt-1">{errors.WeeklyOff}</p>
              )}
            </div>

            {/* Weekly Off2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Off2<span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.WeeklyOff2 ?? ""}
                onChange={(e) => handleFieldChange("WeeklyOff2", e.target.value)}
                className={`w-full p-2 rounded border ${errors.WeeklyOff2 ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.WeeklyOff2 && (
                <p className="text-red-500 text-xs mt-1">{errors.WeeklyOff2}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/*Weekly Off2 Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Off2 Type <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.WeeklyOff2Type ?? ""}
                onChange={(e) => handleFieldChange("WeeklyOff2Type", e.target.value)}
                className={`w-full p-2 rounded border ${errors.WeeklyOff2Type ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.WeeklyOff2Type && (
                <p className="text-red-500 text-xs mt-1">{errors.WeeklyOff2Type}</p>
              )}
            </div>

            {/* Not Applicable For Months */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Not Applicable For Months<span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.NotApplicableForMonths ?? ""}
                onChange={(e) => handleFieldChange("NotApplicableForMonths", e.target.value)}
                className={`w-full p-2 rounded border ${errors.NotApplicableForMonths ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.NotApplicableForMonths && (
                <p className="text-red-500 text-xs mt-1">{errors.NotApplicableForMonths}</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    )
  };

  const handleAddUpdateWeekOffMaster = async (formData: AddUpdateWeekOffMasterRequest) => {

    setIsAddUpdateModalOpen(false);

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await WeekOffMasterService.apiCallAddUpdateWeekOffMaster(formData);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.WeekOffPolicyMasterId === 0

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
                item.WeekOffPolicyMasterId === formData.WeekOffPolicyMasterId
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
      formData.WeekOffPolicyMasterId === 0 ? 'Add Week Off' : 'Update Week Off...'
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
          WeekOffPolicyMasterId: deleteWeekOffMasterDetailsData.WeekOffPolicyMasterId ?? 0,
          UniqueKey: deleteWeekOffMasterDetailsData.Uniquekey ?? ""
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
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by week off policy name..."
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
          onAdd={handleAddWeekOffModal}
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
        <AddUpdateWeekOffModal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingWeekOffMasterData(null)
          }}
          onSubmit={handleAddUpdateWeekOffMaster}
          data={editingWeekOffMasterData}
          loading={isLoading}
        />
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


