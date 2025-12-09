import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  HolidayMappingMasterData,
  FilterWithPaginationHolidayMappingMasterRequest,
  DeleteHolidayMappingMasterRequest,
  AddUpdateHolidayMappingMasterRequest
} from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';

import { HolidayMappingMasterService } from '@/features/holidayMappingMaster/services/HolidayMappingMasterService'
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
import { HolidayMasterService } from '@/features/holidayMaster/services/HolidayMasterService';
import { BranchMasterService } from '@/features/branchMaster/services/BranchMasteService';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';


export const HolidayMappingMaster: React.FC = () => {

  const [holidayMappingMasterList, setHolidayMappingMasterList] = useState<HolidayMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchHolidayMappings(value)
  }, 350)
  const [viewHolidayMappingMasterDetailsData, setViewHolidayMappingMasterDetailsData] = useState<HolidayMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeHolidayMappingMasterColumnsModal, setIsShowCustomizeHolidayMappingMasterColumnsModal] = useState(false);
  const { canAction, canExport } = useMenuPermissions();
  const hasFetchedInitialHolidayMappings = useRef(false)


  // EDIT  Holiday Mapping MASTER STATES
  const [editingHolidayMappingMasterData, setEditingHolidayMappingMasterData] = useState<HolidayMappingMasterData | null>(null)
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE Holiday MappingMASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteHolidayMappingMasterDetailsData, setDeleteHolidayMappingMasterDetailsData] = useState<HolidayMappingMasterData | null>(null)

  useEffect(() => {
    if (hasFetchedInitialHolidayMappings.current) return
    hasFetchedInitialHolidayMappings.current = true;
    fetchHolidayMappingList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchHolidayMappingList = async (page: number = pagination.currentPage) => {
    return await loadHolidayMappings(page, filters);
  }

  const loadHolidayMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = holidayMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationHolidayMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          HolidayMappingMasterId: filterParams.HolidayMappingMasterId ? Number(filterParams.HolidayMappingMasterId) : undefined,
          BranchName: filterParams.BranchName?.trim() || undefined,
          HolidayName: filterParams.HolidayName?.trim() || undefined,
          FromHolidayDate: filterParams.FromHolidayDate?.trim() || undefined,
          ToHolidayDate: filterParams.ToHolidayDate?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getHolidayMappings(params);
        if (E.isRight(response)) {
          setHolidayMappingMasterList(response.right.Data);
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
      'Loading Holiday Mapping Data...'
    )
  }

  const searchHolidayMappings = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchHolidayMappingList();
      return
    }
    const filterParams: FilterInfo = {
      HolidayName: searchValue.trim(),
    };
    await loadHolidayMappings(1, filterParams)
  }

  const clearsearchHolidayMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchHolidayMappingList();
  }

  const handleExportHolidayMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = holidayMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationHolidayMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          BranchName: filters.BranchName?.trim() || undefined,
          HolidayName: filters.HolidayName?.trim() || undefined,
          FromHolidayDate: filters.FromHolidayDate?.trim() || undefined,
          ToHolidayDate: filters.ToHolidayDate?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getHolidayMappings(params);
        handleExportFile(response, exportType, 'Holiday Mapping Master', addToast)
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

  const handleExportHolidayMappingExcel = () => handleExportHolidayMappings('Excel')
  const handleExportHolidayMappingPdf = () => handleExportHolidayMappings('PDF')

  const getHolidayMappings = async (filterParams: FilterWithPaginationHolidayMappingMasterRequest) => {
    return await HolidayMappingMasterService.apiCallPullHolidayMappingMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchHolidayMappingList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchHolidayMappingList(1);
  }

  const holidayMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const holidayMappingListForTable = useMemo(() => holidayMappingMasterList, [holidayMappingMasterList]);

  const handleViewHolidayMappingDetails = useCallback((row: HolidayMappingMasterData) => {
    setViewHolidayMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditHolidayMappingMaster = useCallback((row: HolidayMappingMasterData) => {
    setEditingHolidayMappingMasterData({
      ...row,

    })
    setIsAddUpdateModalOpen(true);

  }, [])
  const handleConfirmationDialogBoxOpen = useCallback((row: HolidayMappingMasterData) => {
    setDeleteHolidayMappingMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  const holidayMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'HolidayName',
        label: 'Holiday Name',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewHolidayMappingDetails(row)}
            />
            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditHolidayMappingMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Holiday Mapping"
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
                    title="Delete Holiday Mapping"
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
        key: 'BranchName',
        label: 'Branch Name',
        width: '20',
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
        key: 'HolidayDate',
        label: 'Holiday Date',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : 'N/A'
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '20',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '20',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewHolidayMappingDetails]
  )

  const requiredHolidayMappingMasterColumnKeys: string[] = ['HolidayName'];
  const allHolidayMappingMasterColumnKeys: string[] = holidayMappingMasterColumns.map(c => c.key)
  const [selectedHolidayMappingMasterColumnKeys, setSelectedHolidayMappingMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getHolidayMappingMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredHolidayMappingMasterColumnKeys]));
        return withRequired.filter(k => allHolidayMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allHolidayMappingMasterColumnKeys
  })

  useEffect(() => {
    setSelectedHolidayMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredHolidayMappingMasterColumnKeys])).filter(k => allHolidayMappingMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidayMappingMasterColumns.length])

  const visibleHolidayMappingMasterColumns = useMemo(
    () => holidayMappingMasterColumns.filter(col => selectedHolidayMappingMasterColumnKeys.includes(col.key)),
    [holidayMappingMasterColumns, selectedHolidayMappingMasterColumnKeys]
  )

  interface ViewHolidayMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: HolidayMappingMasterData | null
  }

  const ViewHolidayMappingDetailsModal: React.FC<ViewHolidayMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Holiday Mapping Details)"
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
              <span className="text-sm font-medium text-gray-700">Holiday Name</span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.HolidayName || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Branch Name</span>
              <span className="text-sm text-blue-600 font-medium">{data.BranchName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Holiday Date</span>
              <span className="text-sm text-blue-600 font-medium">
                {data.HolidayDate ? formatDate_dd_MonthName_yy(data.HolidayDate) : 'N/A'}
              </span>
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

  const applyFilters = () => {
    setFilters(tempFilters)
    loadHolidayMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadHolidayMappings(1, {})
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


  //#region ADD UPDATE EDIT ASSET Mapping MASTER
  const handleAddHolidayMappingModal = () => {
    setEditingHolidayMappingMasterData(null);
    setIsAddUpdateModalOpen(true);
  };

  interface AddUpdateAssetMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddUpdateHolidayMappingMasterRequest) => void;
    data?: HolidayMappingMasterData | null;
    loading?: boolean;
  }

  const AddUpdateHolidayMappingModel: React.FC<AddUpdateAssetMappingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateHolidayMappingMasterRequest>({
      HolidayMappingMasterId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      HolidayMasterId: 0,
      BranchMasterId: "",
      HolidayDate: ""
    });
    // Single error object for all fields
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [dropdownLabels, setDropdownLabels] = useState<{
      branch?: string;
      holiday?: string;
    }>({});
    useEffect(() => {
      if (isOpen) {
        if (data) {
          //Edit Holiday Mapping
          setFormData({
            HolidayMappingMasterId: data.HolidayMappingMasterId || 0,
            Uniquekey: data.Uniquekey || "",
            HolidayMasterId: data.HolidayMasterId || 0,
            BranchMasterId: data.BranchMasterId || "",
            HolidayDate: data.HolidayDate || ""
          });
          setDropdownLabels({
            branch: data.BranchName ?? "",
            holiday: data.HolidayName ?? ""

          });
        } else {
          //Add  Holiday Mapping
          setFormData({
            HolidayMappingMasterId: 0,
            Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            HolidayMasterId: 0,
            BranchMasterId: "",
            HolidayDate: ""
          });
        } setErrors({});
      }
    }, [isOpen, data]);

    //handle input change
    const handleFieldChange = (
      field: keyof AddUpdateHolidayMappingMasterRequest,
      value: any
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // Submit handler
    const handleSubmitAddUpdateAsset = (e: React.FormEvent) => {
      e.preventDefault();
      const requiredFields = [
        "HolidayDate"
      ];

      const newErrors: any = {};
      requiredFields.forEach((field) => {
        const value = formData[field as keyof AddUpdateHolidayMappingMasterRequest];
        if (value === null || value === undefined || value === "" ||
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


    const fetchholidayOptions = async (pageNumber: number, params?: { value?: string }) => {
      const responseEither = await HolidayMasterService.apiCallPullHolidayMaster({
        PageSize: 10,
        PageNumber: pageNumber,
        HolidayName: params?.value || "",
      });
      if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
      const apiResponse = responseEither.right;
      const holidayList = apiResponse?.Data?.map((item: any) => ({ label: item.HolidayName, value: String(item.HolidayMasterId) })) || [];
      return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? holidayList.length, itemList: holidayList };
    };

    const fetchBranchNameOptions = async (pageNumber: number, params?: { value?: string }) => {
      const responseEither = await BranchMasterService.apiCallPullBranchMaster({
        PageSize: 10,
        PageNumber: pageNumber,
        BranchName: params?.value || "",
      });
      if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
      const apiResponse = responseEither.right;
      const branchList = apiResponse?.Data?.map((item: any) => ({ label: item.BranchName, value: String(item.BranchMasterId) })) || [];
      return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? branchList.length, itemList: branchList };
    };
    const toDropdownInitialValue = (
      id?: string | number | null,
      label?: string
    ) => {
      if (!id) return null;
      return {
        label: label || String(id),
        value: String(id),
      };
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onCancel={onClose}
        title={formData.HolidayMappingMasterId === 0 ? "Add HolidayMapping" : "Update HolidayMapping"}
        onSubmit={handleSubmitAddUpdateAsset}
        saveText={formData.HolidayMappingMasterId === 0 ? "Save" : "Update"}
        cancelText="Cancel"
        loading={loading}
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SingleSelectDropdownWithPagination
                label="Holiday"
                title="Select..."
                size="lg"
                dataFetchCallBack={fetchholidayOptions}
                onSelected={(item) => handleFieldChange("HolidayMasterId", Number(item.value))}
                initialValue={toDropdownInitialValue(formData.HolidayMasterId, dropdownLabels.holiday)}
              />
            </div>
            <div>
              <SingleSelectDropdownWithPagination
                label="Branch"
                title="Select..."
                size="lg"
                dataFetchCallBack={fetchBranchNameOptions}
                onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
                initialValue={toDropdownInitialValue(formData.BranchMasterId, dropdownLabels.branch)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Holiday Date <span className="text-red-500">*</span></label>
              <Input
                type="date"
                value={formData.HolidayDate?.substring(0, 10)}
                onChange={(e) => handleFieldChange("HolidayDate", e.target.value)}
                className={`w-full p-2 rounded border ${errors.HolidayDate ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.HolidayDate && (
                <p className="text-red-500 text-xs mt-1">{errors.HolidayDate}</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  const handleAddUpdateHolidayMappingMaster = async (formData: AddUpdateHolidayMappingMasterRequest) => {

    setIsAddUpdateModalOpen(false);
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const response = await HolidayMappingMasterService.apiCallAddUpdateHolidayMappingMaster(formData);
        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);
          const isAdd = formData.HolidayMappingMasterId === 0
          if (isAdd) {
            const newRecord = response.right.Data[0] as HolidayMappingMasterData

            setHolidayMappingMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Holiday Mapping added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as HolidayMappingMasterData;

            setHolidayMappingMasterList(prevData =>
              prevData.map(item =>
                item.HolidayMappingMasterId === formData.HolidayMappingMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingHolidayMappingMasterData(null);

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
      formData.HolidayMappingMasterId === 0 ? 'Add Holiday Mapping' : 'Update Holiday Mapping...'
    )
  }

  //#region DELETE Holiday Mapping MASTER
  const handleDeleteHolidayMappingMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteHolidayMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteHolidayMappingMasterRequest = {
          HolidayMappingMasterId: deleteHolidayMappingMasterDetailsData.HolidayMappingMasterId ?? 0,
          UniqueKey: deleteHolidayMappingMasterDetailsData.Uniquekey ?? ""
        }
        const response = await HolidayMappingMasterService.apiCallDeleteHolidayMappingMaster(params);

        if (E.isRight(response)) {
          setHolidayMappingMasterList(prevData => prevData.filter(item => item.HolidayMappingMasterId !== deleteHolidayMappingMasterDetailsData.HolidayMappingMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteHolidayMappingMasterDetailsData(null);
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
      'Delete Holiday Mapping Master data...'
    )
  }
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by holiday name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchHolidayMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeHolidayMappingMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Holiday Mapping"
          onAdd={handleAddHolidayMappingModal}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportHolidayMappingExcel}
          onExportPdf={handleExportHolidayMappingPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={holidayMappingListForTable}
          columns={visibleHolidayMappingMasterColumns}
          pagination={holidayMappingMasterPaginationInfo}
          emptyMessage="No Holiday Mappings Data Found"
          fixedHeight={true}
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewHolidayMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewHolidayMappingMasterDetailsData(null)
          }}
          data={viewHolidayMappingMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeHolidayMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeHolidayMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredHolidayMappingMasterColumnKeys]))
            setSelectedHolidayMappingMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeHolidayMappingMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={holidayMappingMasterColumns}
          selectedKeys={selectedHolidayMappingMasterColumnKeys}
          requiredKeys={requiredHolidayMappingMasterColumnKeys}
          title="Customize Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Holiday Mapping Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <Input
                  type="text"
                  value={tempFilters.HolidayName || ''}
                  onChange={(e) => handleFilterChange('HolidayName', e.target.value)}
                  placeholder="Enter holiday name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
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

        {/*  ADD EDIT UPDATE Holiday Mapping MODAL */}
        <AddUpdateHolidayMappingModel
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingHolidayMappingMasterData(null)
          }}
          onSubmit={handleAddUpdateHolidayMappingMaster}
          data={editingHolidayMappingMasterData}
          loading={isLoading}
        />
        {/* DELETE CONFIRMATION Holiday Mapping MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteHolidayMappingMasterDetailsData(null)
          }}
          onConfirm={handleDeleteHolidayMappingMaster}
          title="You are about to delete a Holiday Mapping?"
          message="Deleting this Holiday Mapping Data will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  )
}

export default HolidayMappingMaster


