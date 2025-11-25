import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateEarningMasterRequest,
  DeleteEarningMasterRequest,
  EarningMasterData,
  FilterWithPaginationEarningMasterRequest
} from '@/features/earningMaster/models/EarningMasterModel';

import { EarningMasterService } from '@/features/earningMaster/services/EarningMasterService'
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


export const EarningMaster: React.FC = () => {

  const [earningMasterList, setEarningMasterList] = useState<EarningMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchEarnings(value)
  }, 350)
  const [viewEarningMasterDetailsData, setViewEarningMasterDetailsData] = useState<EarningMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isShowCustomizeEarningMasterColumnsModal, setIsShowCustomizeEarningMasterColumnsModal] = useState(false);
  const { canAction, canExport } = useMenuPermissions();
  const hasFetchedInitialEarnings = useRef(false)


  // Edit Earning MASTER
  const [editingEarningMasterData, setEditingEarningMasterData] = useState<EarningMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE Earning MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteEarningMasterDetailsData, setDeleteEarningMasterDetailsData] = useState<EarningMasterData | null>(null)


  useEffect(() => {
    if (hasFetchedInitialEarnings.current) return
    hasFetchedInitialEarnings.current = true;
    fetchEarningList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const fetchEarningList = async (page: number = pagination.currentPage) => {
    return await loadEarnings(page, filters);
  }

  const loadEarnings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = earningMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationEarningMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          EarningMasterId: filterParams.EarningMasterId ? Number(filterParams.EarningMasterId) : undefined,
          Name: filterParams.Name?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getEarnings(params);
        if (E.isRight(response)) {
          setEarningMasterList(response.right.Data);
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
      'Loading Earning Data...'
    )
  }

  const searchEarnings = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      fetchEarningList();
      return
    }
    const filterParams: FilterInfo = {
      Name: searchValue.trim(),
    };
    await loadEarnings(1, filterParams)
  }

  const clearsearchEarnings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchEarningList();
  }

  const handleExportEarnings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = earningMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationEarningMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Name: filters.Name?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getEarnings(params);
        handleExportFile(response, exportType, 'Earning Master', addToast)
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

  const handleExportEarningExcel = () => handleExportEarnings('Excel')
  const handleExportEarningPdf = () => handleExportEarnings('PDF')

  const getEarnings = async (filterParams: FilterWithPaginationEarningMasterRequest) => {
    return await EarningMasterService.apiCallPullEarningMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchEarningList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchEarningList(1);
  }

  const earningMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const earningListForTable = useMemo(() => earningMasterList, [earningMasterList]);

  const handleViewEarningDetails = useCallback((row: EarningMasterData) => {
    setViewEarningMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditEarningMaster = useCallback((row: EarningMasterData) => {
      setEditingEarningMasterData({
        ...row,
        Name: row.Name || ''
      })
      setIsAddUpdateModalOpen(true);
  
    }, [])
   const handleConfirmationDialogBoxOpen = useCallback((row: EarningMasterData) => {
      setDeleteEarningMasterDetailsData(row)
      setIsConfirmationDialogBoxOpen(true)
    }, [])
  const earningMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Name',
        label: 'Earning Name',
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
              onClick={() => handleViewEarningDetails(row)}
            />
            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditEarningMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Earning"
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
                    title="Delete Earning"
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
        width: '15',
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
        width: '20',
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
    [handleViewEarningDetails]
  )

  const requiredEarningMasterColumnKeys: string[] = ['Name'];
  const allEarningMasterColumnKeys: string[] = earningMasterColumns.map(c => c.key)
  const [selectedEarningMasterColumnKeys, setSelectedEarningMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getEarningMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredEarningMasterColumnKeys]));
        return withRequired.filter(k => allEarningMasterColumnKeys.includes(k));
      }
    } catch { }
    return allEarningMasterColumnKeys
  })

  useEffect(() => {
    setSelectedEarningMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredEarningMasterColumnKeys])).filter(k => allEarningMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earningMasterColumns.length])

  const visibleEarningMasterColumns = useMemo(
    () => earningMasterColumns.filter(col => selectedEarningMasterColumnKeys.includes(col.key)),
    [earningMasterColumns, selectedEarningMasterColumnKeys]
  )

  interface ViewEarningDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: EarningMasterData | null
  }

  const ViewEarningDetailsModal: React.FC<ViewEarningDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Earning Details)"
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
              <span className="text-sm font-medium text-gray-700">Earning Name</span>
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
    loadEarnings(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadEarnings(1, {})
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
  const handleAddEarningModal = () => {
    setEditingEarningMasterData(null);
    setIsAddUpdateModalOpen(true);
  };

  interface AddUpdateEarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddUpdateEarningMasterRequest) => void;
    data?: EarningMasterData | null;
    loading?: boolean;
  }

  const AddUpdateEarningModal: React.FC<AddUpdateEarningModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateEarningMasterRequest>({

      EarningMasterId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      Name: "",
      Type: "",
      Value: 0,
      BranchMasterId: 0
    });
    // Single error object for all fields
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
      if (isOpen) {
        if (data) {
          //Edit Earning 
          setFormData({
            EarningMasterId: data.EarningMasterId || 0,
            Uniquekey: data.Uniquekey,
            Name: data.Name || "",
            Type: data.Type || "",
            Value: data.Value || 0,
            BranchMasterId: data.BranchMasterId || 0
          });
        } else {
          // Add Earning
          setFormData({
            EarningMasterId: 0,
            Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            Name: "",
            Type: "",
            Value: 0,
            BranchMasterId: 0
          })
        }
        setErrors({});
      }
    }, [isOpen, data]);

    // Handle input change
    const handleFieldChange = (
      field: keyof AddUpdateEarningMasterRequest,
      value: any
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };
    const handleSubmitAddWeekOff = (e: React.FormEvent) => {
      e.preventDefault();
      const requiredFields = [
        "Name",
        "Type",
        "Value"
      ];

      const newErrors: any = {};

      requiredFields.forEach((field) => {
        const value = formData[field as keyof AddUpdateEarningMasterRequest];
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
        title={formData.EarningMasterId === 0 ? "Add Earning" : "Update Earning"}
        onSubmit={handleSubmitAddWeekOff}
        saveText={formData.EarningMasterId === 0 ? "Save" : "Update"}
        cancelText='Cancel'
        loading={loading}
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/*Earning Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Earning Name <span className="text-red-500">*</span>
              </label>
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

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type<span className="text-red-500">*</span>
              </label>
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

            {/*Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value<span className="text-red-500">*</span>
              </label>
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
          </div>
        </div>
      </Modal>
    )
  };

  const handleAddUpdateEarningMaster = async (formData: AddUpdateEarningMasterRequest) => {

    setIsAddUpdateModalOpen(false);

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await EarningMasterService.apiCallAddUpdateEarningMaster(formData);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.EarningMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as EarningMasterData

            setEarningMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Earning added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as EarningMasterData;

            setEarningMasterList(prevData =>
              prevData.map(item =>
                item.EarningMasterId === formData.EarningMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingEarningMasterData(null);

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
      formData.EarningMasterId === 0 ? 'Add Earning' : 'Update Earning...'
    )
  }

  //#region DELETE EARNING MASTER
  const handleDeleteEarningMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteEarningMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteEarningMasterRequest = {
          EarningMasterId: deleteEarningMasterDetailsData.EarningMasterId ?? 0,
          UniqueKey: deleteEarningMasterDetailsData.Uniquekey ?? ""
        }
        const response = await EarningMasterService.apiCallDeleteEarningMaster(params);

        if (E.isRight(response)) {
          setEarningMasterList(prevData => prevData.filter(item => item.EarningMasterId !== deleteEarningMasterDetailsData.EarningMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteEarningMasterDetailsData(null);
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
      'Delete Earning master data...'
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
          searchPlaceholder="Search by earning name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchEarnings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeEarningMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle='Add Earning'
          onAdd={handleAddEarningModal}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportEarningExcel}
          onExportPdf={handleExportEarningPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={earningListForTable}
          columns={visibleEarningMasterColumns}
          pagination={earningMasterPaginationInfo}
          emptyMessage="No earnings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewEarningDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewEarningMasterDetailsData(null)
          }}
          data={viewEarningMasterDetailsData}
        />

        <CustomizeColumnsModal
          isOpen={isShowCustomizeEarningMasterColumnsModal}
          onClose={() => setIsShowCustomizeEarningMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredEarningMasterColumnKeys]))
            setSelectedEarningMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeEarningMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={earningMasterColumns}
          selectedKeys={selectedEarningMasterColumnKeys}
          requiredKeys={requiredEarningMasterColumnKeys}
          title="Customize Earning Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Earning Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Earning Name</label>
                <Input
                  type="text"
                  value={tempFilters.Name || ''}
                  onChange={(e) => handleFilterChange('Name', e.target.value)}
                  placeholder="Enter earning name"
                />
              </div>
            </div>
          </div>
        </Modal>
        {/* DELETE CONFIRMATION  EARNING MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteEarningMasterDetailsData(null)
          }}
          onConfirm={handleDeleteEarningMaster}
          title="You are about to delete a  Earning?"
          message="Deleting this  Earning will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
        <AddUpdateEarningModal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingEarningMasterData(null)
          }}
          onSubmit={handleAddUpdateEarningMaster}
          data={editingEarningMasterData}
          loading={isLoading}
        />
      </div>
    </>
  )
}

export default EarningMaster


