import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateDeductionMasterRequest,
  DeductionMasterData,
  DeleteDeductionMasterRequest,
  FilterWithPaginationDeductionMasterRequest
} from '@/features/deductionMaster/models/DeductionMasterModel';

import { DeductionMasterService } from '@/features/deductionMaster/services/DeductionMasterService'
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


export const DeductionMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [deductionMasterList, setDeductionMasterList] = useState<DeductionMasterData[]>([]);
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
    searchDeductions(value)
  }, 350)

  //VIEW DEDUCTION MASTER MODAL STATES
  const [viewDeductionMasterDetailsData, setViewDeductionMasterDetailsData] = useState<DeductionMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeDeductionMasterColumnsModal, setIsShowCustomizeDeductionMasterColumnsModal] = useState(false);


  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialDeductions = useRef(false)


  // EDIT ASSET MASTER
  const [editingDeductionMasterData, setEditingDeductionMasterData] = useState<DeductionMasterData | null>(null)
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE ASSET MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteDeductionMasterDetailsData, setDeleteDeductionMasterDetailsData] = useState<DeductionMasterData | null>(null)

  useEffect(() => {

    if (hasFetchedInitialDeductions.current) return

    hasFetchedInitialDeductions.current = true;

    fetchDeductionList()
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

  const fetchDeductionList = async (page: number = pagination.currentPage) => {
    return await loadDeductions(page, filters);
  }

  const loadDeductions = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = deductionMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          DeductionMasterId: filterParams.DeductionMasterId ? Number(filterParams.DeductionMasterId) : undefined,
          Name: filterParams.Name?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getDeductions(params);

        if (E.isRight(response)) {

          setDeductionMasterList(response.right.Data);

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
      'Loading Deduction Data...'
    )
  }

  // SEARCH DEDUCTION 
  const searchDeductions = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchDeductionList();

      return
    }

    const filterParams: FilterInfo = {
      Name: searchValue.trim(),
    };

    await loadDeductions(1, filterParams)

  }

  const clearsearchDeductions = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchDeductionList();
  }
  // END SEARCH DEDUCTION 

  // EXPORT EXCEL | PDF
  const handleExportDeductions = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = deductionMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Name: filters.Name?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getDeductions(params);

        handleExportFile(response, exportType, 'Deduction Master', addToast)

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

  const handleExportDeductionExcel = () => handleExportDeductions('Excel')
  const handleExportDeductionPdf = () => handleExportDeductions('PDF')

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET DEDUCTION 

  const getDeductions = async (filterParams: FilterWithPaginationDeductionMasterRequest) => {

    return await DeductionMasterService.apiCallPullDeductionMaster(filterParams);
  }

  //END API | SERVICES CALL TO GET DEDUCTION

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchDeductionList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchDeductionList(1);

  }

  const deductionMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const deductionListForTable = useMemo(() => deductionMasterList, [deductionMasterList]);


  // STABLE HANDLER VIEW
  const handleViewDeductionDetails = useCallback((row: DeductionMasterData) => {
    setViewDeductionMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditDeductionMaster = useCallback((row: DeductionMasterData) => {
    setEditingDeductionMasterData({
      ...row,

    })
    setIsAddUpdateModalOpen(true);

  }, [])

  const handleConfirmationDialogBoxOpen = useCallback((row: DeductionMasterData) => {
    setDeleteDeductionMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  const deductionMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Name',
        label: 'Deduction Name',
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
              onClick={() => handleViewDeductionDetails(row)}
            />
            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditDeductionMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Asset"
                    style={{
                      color: '#0B3251',
                      padding: '0px 8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
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
                    title="Delete Asset"
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
        key: 'Type',
        label: 'Type',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
          />
        )
      },
      {
        key: 'Value',
        label: 'Value',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value || 0}
          </span>
        )
      },
      {
        key: 'BranchName',
        label: 'Branch Name',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
          />
        )
      },
      {
        key: 'MinSalary',
        label: 'Min Salary',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'
      },
      {
        key: 'MaxSalary',
        label: 'Max Salary',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'
      },
      {
        key: 'Gender',
        label: 'Gender',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'StateName',
        label: 'State',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="120px"
            tooltipThreshold={12}
          />
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
    [handleViewDeductionDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredDeductionMasterColumnKeys: string[] = ['Name'];

  const allDeductionMasterColumnKeys: string[] = deductionMasterColumns.map(c => c.key)

  const [selectedDeductionMasterColumnKeys, setSelectedDeductionMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getDeductionMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredDeductionMasterColumnKeys]));
        return withRequired.filter(k => allDeductionMasterColumnKeys.includes(k));

      }
    } catch { }
    return allDeductionMasterColumnKeys
  })

  useEffect(() => {
    setSelectedDeductionMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredDeductionMasterColumnKeys])).filter(k => allDeductionMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deductionMasterColumns.length])

  const visibleDeductionMasterColumns = useMemo(
    () => deductionMasterColumns.filter(col => selectedDeductionMasterColumnKeys.includes(col.key)),
    [deductionMasterColumns, selectedDeductionMasterColumnKeys]
  )

  //#endregion

  //#region VIEW DEDUCTION DETAILS MODAL COMPONENT

  interface ViewDeductionDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: DeductionMasterData | null
  }

  const ViewDeductionDetailsModal: React.FC<ViewDeductionDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Deduction Details)"
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
              <span className="text-sm font-medium text-gray-700">Deduction Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.Name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Type</span>
              <span className="text-sm text-blue-600 font-medium">{data.Type || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Value</span>
              <span className="text-sm text-blue-600 font-medium">{data.Value || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Branch Name</span>
              <span className="text-sm text-blue-600 font-medium">{data.BranchName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Min Salary</span>
              <span className="text-sm text-blue-600 font-medium">{data.MinSalary ? `₹${data.MinSalary.toLocaleString('en-IN')}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Max Salary</span>
              <span className="text-sm text-blue-600 font-medium">{data.MaxSalary ? `₹${data.MaxSalary.toLocaleString('en-IN')}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Gender</span>
              <span className="text-sm text-blue-600 font-medium">{data.Gender || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">State</span>
              <span className="text-sm text-blue-600 font-medium">{data.StateName || 'N/A'}</span>
            </div>
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

  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadDeductions(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadDeductions(1, {})
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

  //#region ADD UPDATE EDIT ASSET MASTER
  const handleAddDeductionModal = () => {
    setEditingDeductionMasterData(null);
    setIsAddUpdateModalOpen(true);
  };

  interface AddUpdateDeductionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddUpdateDeductionMasterRequest) => void;
    data?: DeductionMasterData | null;
    loading?: boolean;
  }

  const AddUpdateDeductionModel: React.FC<AddUpdateDeductionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateDeductionMasterRequest>({
      DeductionMasterId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      Name: "",
      Type: "",
      Value: 0,
      BranchMasterId: 0,
      MinSalary: 0,
      MaxSalary: 0,
      Gender: "",
      StateMasterId: 0,
      BranchName: "",
      StateName: "",

    });
    // Single error object for all fields
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
      if (isOpen) {
        if (data) {
          // EDIT Deduction
          setFormData({
            DeductionMasterId: data.DeductionMasterId ?? 0,
            Uniquekey: data.Uniquekey ?? "",
            Name: data.Name ?? "",
            Type: data.Type ?? "",
            Value: data.Value ?? 0,
            BranchMasterId: data.BranchMasterId ?? 0,
            MinSalary: data.MinSalary ?? 0,
            MaxSalary: data.MaxSalary ?? 0,
            Gender: data.Gender ?? "",
            StateMasterId: data.StateMasterId ?? 0,
            BranchName: data.BranchName ?? "",
            StateName: data.StateName ?? "",

          });
        } else {
          // ADD Deduction 
          setFormData({
            DeductionMasterId: 0,
            Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            Name: "",
            Type: "",
            Value: 0,
            BranchMasterId: 0,
            MinSalary: 0,
            MaxSalary: 0,
            Gender: "",
            StateMasterId: 0,
            BranchName: "",
            StateName: "",

          });
        }
        setErrors({});
      }
    }, [isOpen, data]);

    //handle input change
    const handleFieldChange = (
      field: keyof AddUpdateDeductionMasterRequest,
      value: any
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // Submit handler
    const handleSubmitAddUpdateAsset = (e: React.FormEvent) => {
      e.preventDefault();
      const requiredFields = [
        "Name",
        "Value",
        "Type",
        "Gender",
        "MinSalary",
        "MaxSalary",
        "StateMasterId",
      ];

      const newErrors: any = {};
      requiredFields.forEach((field) => {
        const value = formData[field as keyof AddUpdateDeductionMasterRequest];
        if (value === null || value === undefined || value.toString().trim() === "") {
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
        title={formData.DeductionMasterId === 0 ? "Add Deduction Master " : "Update Deduction Master"}
        onSubmit={handleSubmitAddUpdateAsset}
        saveText={formData.DeductionMasterId === 0 ? "Save" : "Update"}
        cancelText="Cancel"
        loading={loading}
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span></label>
              <Input
                value={formData.Name ?? ""}
                onChange={(e) => handleFieldChange("Name", e.target.value)}
                className={`w-full p-2 rounded border ${errors.Name ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.Name && (
                <p className="text-red-500 text-xs mt-1">{errors.Name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Type <span className="text-red-500">*</span></label>
              <Input
                value={formData.Type ?? ""}
                onChange={(e) => handleFieldChange("Type", e.target.value)}
                className={`w-full p-2 rounded border ${errors.Type ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.Type && (
                <p className="text-red-500 text-xs mt-1">{errors.Type}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Value <span className="text-red-500">*</span></label>
              <Input
                value={formData.Value ?? ""}
                onChange={(e) => handleFieldChange("Value", e.target.value)}
                className={`w-full p-2 rounded border ${errors.Value ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.Value && (
                <p className="text-red-500 text-xs mt-1">{errors.Value}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.Gender ?? ""}
                onChange={(e) => handleFieldChange("Gender", e.target.value)}
                className={`w-full p-2 rounded-md border  
                 ${errors.Gender ? "border-gray-500" : "border-gray-500"}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {errors.Gender && (
                <p className="text-red-500 text-xs mt-1">{errors.Gender}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                MinSalary <span className="text-red-500">*</span></label>
              <Input
                value={formData.MinSalary ?? ""}
                onChange={(e) => handleFieldChange("MinSalary", e.target.value)}
                className={`w-full p-2 rounded border ${errors.MinSalary ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.MinSalary && (
                <p className="text-red-500 text-xs mt-1">{errors.MinSalary}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                MaxSalary <span className="text-red-500">*</span></label>
              <Input
                value={formData.MaxSalary ?? ""}
                onChange={(e) => handleFieldChange("MaxSalary", e.target.value)}
                className={`w-full p-2 rounded border ${errors.MaxSalary ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.MaxSalary && (
                <p className="text-red-500 text-xs mt-1">{errors.MaxSalary}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label className="block text-sm font-medium mb-1">
                StateName <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.StateMasterId ?? ""}
                onChange={(e) => handleFieldChange("StateMasterId", Number(e.target.value))}
                className={`w-full p-2 rounded-md border  
                 ${errors.StateMasterId ? "border-gray-500" : "border-gray-500"}`}
              >
                <option value="">Select StateName</option>
                <option value="1">Andhra Pradesh</option>
                <option value="2">Maharashtra</option>
                <option value="3">Assam</option>
                <option value="4">Bihar</option>
                <option value="5">Uttar Pradesh</option>
              </select>

              {errors.StateMasterId && (
                <p className="text-red-500 text-xs mt-1">{errors.StateMasterId}</p>
              )}
            </div>
            </div>
        </div>
      </Modal>
    );
  };

  const handleAddUpdateDeductionMaster = async (formData: AddUpdateDeductionMasterRequest) => {

    setIsAddUpdateModalOpen(false);
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const response = await DeductionMasterService.apiCallAddUpdateDeductionMaster(formData);
        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);
          const isAdd = formData.DeductionMasterId === 0
          if (isAdd) {
            const newRecord = response.right.Data[0] as DeductionMasterData

            setDeductionMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: 'Asset added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as DeductionMasterData;

            setDeductionMasterList(prevData =>
              prevData.map(item =>
                item.DeductionMasterId === formData.DeductionMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingDeductionMasterData(null);

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
      formData.DeductionMasterId === 0 ? 'Add Asset' : 'Update Asset...'
    )
  }
  //#region DELETE Deduction MASTER
  const handleDeleteDeductionMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);
    if (!deleteDeductionMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteDeductionMasterRequest = {
          DeductionMasterId: deleteDeductionMasterDetailsData.DeductionMasterId ?? 0,
          UniqueKey: deleteDeductionMasterDetailsData.Uniquekey ?? ""
        }
        const response = await DeductionMasterService.apiCallDeleteDeductionMaster(params);
        if (E.isRight(response)) {
          setDeductionMasterList(prevData => prevData.filter(item => item.DeductionMasterId! == deleteDeductionMasterDetailsData.DeductionMasterId));
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteDeductionMasterDetailsData(null);
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
      'Delete Deduction Master Data...'
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
          searchPlaceholder="Search by deduction name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchDeductions}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeDeductionMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Deduction"
          onAdd={handleAddDeductionModal}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportDeductionExcel}
          onExportPdf={handleExportDeductionPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={deductionListForTable}
          columns={visibleDeductionMasterColumns}
          pagination={deductionMasterPaginationInfo}
          emptyMessage="No deductions found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewDeductionDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewDeductionMasterDetailsData(null)
          }}
          data={viewDeductionMasterDetailsData}
        />


        {/*  ADD EDIT UPDATE TNC MODAL */}
        <AddUpdateDeductionModel
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingDeductionMasterData(null)
          }}
          onSubmit={handleAddUpdateDeductionMaster}
          data={editingDeductionMasterData}
          loading={isLoading}
        />
        {/* CUSTOMIZE COLUMNS MODAL */}
        <CustomizeColumnsModal
          isOpen={isShowCustomizeDeductionMasterColumnsModal}
          onClose={() => setIsShowCustomizeDeductionMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredDeductionMasterColumnKeys]))
            setSelectedDeductionMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeDeductionMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={deductionMasterColumns}
          selectedKeys={selectedDeductionMasterColumnKeys}
          requiredKeys={requiredDeductionMasterColumnKeys}
          title="Customize Deduction Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Deduction Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Deduction Name</label>
                <Input
                  type="text"
                  value={tempFilters.Name || ''}
                  onChange={(e) => handleFilterChange('Name', e.target.value)}
                  placeholder="Enter deduction name"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION deduction Master MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteDeductionMasterDetailsData(null)
          }}
          onConfirm={handleDeleteDeductionMaster}
          title="You are about to delete a deduction?"
          message="Deleting this deduction Master Data will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  );
};

export default DeductionMaster


