import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateAssetMappingMasterRequest,
  AssetMappingMasterData,
  DeleteAssetMappingMasterRequest,
  FilterWithPaginationAssetMappingMasterRequest
} from '@/features/assetMappingMaster/models/AssetMappingMasterModel';

import { assetMappingMasterService } from '@/features/assetMappingMaster/services/AssetMappingMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { Edit, Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { assetMasterService } from '@/features/assetMaster/services/AssetMasterService';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';



export const AssetMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [assetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
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
    searchAssetMappings(value)
  }, 350)

  //VIEW ASSET MAPPING MASTER MODAL STATES
  const [viewAssetMappingMasterDetailsData, setViewAssetMappingMasterDetailsData] = useState<AssetMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeAssetMappingMasterColumnsModal, setIsShowCustomizeAssetMappingMasterColumnsModal] = useState(false);

  // EDIT ASSET MAPPING MASTER 
  const [editingAssetMappingMasterData, setEditingAssetMappingMasterData] = useState<AssetMappingMasterData | null>(null)
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [AssetMappingMasterFormData, setAssetMappingMasterFormData] = useState<AddUpdateAssetMappingMasterRequest>({
    AssetMasterMappingId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    AssetMasterId: 0,
    AssignedDate: "",
    EmployeeId: 0,
    ReturnDate: "",
    ConditionOnIssue: "",
    ConditionOnReturn: "",
    Remarks: ""
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});


  //DELETE ASSET MAPPING MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteAssetMappingMasterDetailsData, setDeleteAssetMappingMasterDetailsData] = useState<AssetMappingMasterData | null>(null)

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialAssetMappings = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialAssetMappings.current) return

    hasFetchedInitialAssetMappings.current = true;

    fetchAssetMappingList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  //#endregion


  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchAssetMappingList = async (page: number = pagination.currentPage) => {
    return await loadAssetMappings(page, filters);
  }

  const loadAssetMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = assetMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          AssetMasterMappingId: filterParams.AssetMasterMappingId ? Number(filterParams.AssetMasterMappingId) : undefined,
          AssetName: filterParams.AssetName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getAssetMappings(params);

        if (E.isRight(response)) {

          setAssetMappingMasterList(response.right.Data);

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
      'Loading Asset Mapping Data...'
    )
  }

  // SEARCH ASSET MAPPING 
  const searchAssetMappings = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchAssetMappingList();

      return
    }

    const filterParams: FilterInfo = {
      AssetName: searchValue.trim(),
    };

    await loadAssetMappings(1, filterParams)

  }

  const clearsearchAssetMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchAssetMappingList();
  }
  //#endregion 

  //#region EXPORT EXCEL | PDF
  const handleExportAssetMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        // Find the column label for sorting

        let sortByParam = undefined
        if (sortInfo) {
          const column = assetMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          AssetName: filters.AssetName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getAssetMappings(params);

        handleExportFile(response, exportType, 'Asset Mapping Master', addToast)

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

  const handleExportAssetMappingExcel = () => handleExportAssetMappings('Excel')
  const handleExportAssetMappingPdf = () => handleExportAssetMappings('PDF')

  //#endregion


  //#region API | SERVICES CALL TO GET ASSET MAPPING 

  const getAssetMappings = async (filterParams: FilterWithPaginationAssetMappingMasterRequest) => {

    return await assetMappingMasterService.apiCallPullAssetMappingMaster(filterParams);
  }

  //END API | SERVICES CALL TO GET ASSET MAPPING


  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchAssetMappingList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchAssetMappingList(1);

  }

  const assetMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const assetMappingListForTable = useMemo(() => assetMappingMasterList, [assetMappingMasterList]);

  // STABLE HANDLER VIEW EDIT CONFIRMATION DIALOG BOX
  const handleViewAssetMappingDetails = useCallback((row: AssetMappingMasterData) => {
    setViewAssetMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])


  const handleConfirmationDialogBoxOpen = useCallback((row: AssetMappingMasterData) => {
    setDeleteAssetMappingMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  const assetMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'AssetName',
        label: 'Asset Name',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewAssetMappingDetails(row)}
            />

          </div>
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
        key: 'AssetCode',
        label: 'Asset Code',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'AssignedDate',
        label: 'Assigned Date',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : 'N/A'
      },
      {
        key: 'ReturnDate',
        label: 'Return Date',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : 'N/A'
      },
      {
        key: 'Status',
        label: 'Status',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'Active' ? 'bg-green-100 text-green-800' :
            value === 'Inactive' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '12',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '12',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    // dependencies: include everything used inside that might change
    [handleViewAssetMappingDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredAssetMappingMasterColumnKeys: string[] = ['AssetName'];

  const allAssetMappingMasterColumnKeys: string[] = assetMappingMasterColumns.map(c => c.key)

  const [selectedAssetMappingMasterColumnKeys, setSelectedAssetMappingMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getAssetMappingMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredAssetMappingMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allAssetMappingMasterColumnKeys.includes(k));

      }
    } catch { }
    return allAssetMappingMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedAssetMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredAssetMappingMasterColumnKeys])).filter(k => allAssetMappingMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetMappingMasterColumns.length])

  const visibleAssetMappingMasterColumns = useMemo(
    () => assetMappingMasterColumns.filter(col => selectedAssetMappingMasterColumnKeys.includes(col.key)),
    [assetMappingMasterColumns, selectedAssetMappingMasterColumnKeys]
  )

  //#endregion

  //#region VIEW ASSET MAPPING DETAILS MODAL COMPONENT

  interface ViewAssetMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: AssetMappingMasterData | null
  }

  const ViewAssetMappingDetailsModal: React.FC<ViewAssetMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Asset Mapping Details"
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

            <FieldItem label="Asset Name" value={data.AssetName} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Employee Name" value={data.EmployeeName} isRow withBorder={true} />
            <FieldItem label="Asset Code" value={data.AssetCode} isRow withBorder={true} />
            <FieldItem label="Condition On Return" value={data.ConditionOnReturn} isRow withBorder={true} />
            <FieldItem label="Condition On Issue" value={data.ConditionOnIssue} isRow withBorder={true} />
            <FieldItem label="Assigned Date" value={formatDate_dd_MonthName_yy_hh_mm(data.AssignedDate || '-')} isRow withBorder={true} />
            <FieldItem label="Return Date" value={formatDate_dd_MonthName_yy_hh_mm(data.ReturnDate || '-')} isRow withBorder={true} />
            <FieldItem label="Remarks" value={data.Remarks} isRow withBorder={true} />

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
                      handleEditAssetMappingMasterData(data)
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
    loadAssetMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadAssetMappings(1, {})
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

  //#region ADD UPDATE EDIT ASSET Mapping MASTER
  const handleAddAssetMappingMaster = () => {
    setEditingAssetMappingMasterData(null);
    setAssetMappingMasterFormData({
      AssetMasterMappingId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      AssetMasterId: 0,
      AssignedDate: "",
      EmployeeId: 0,
      ReturnDate: "",
      ConditionOnIssue: "",
      ConditionOnReturn: "",
      Remarks: ""
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const handleEditAssetMappingMasterData = (row: AssetMappingMasterData) => {
    setEditingAssetMappingMasterData(row);
    setAssetMappingMasterFormData({
      AssetMasterMappingId: row.AssetMasterMappingId || 0,
      Uniquekey: row.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      AssetMasterId: row.AssetMasterId || 0,
      AssignedDate: row.AssignedDate || "",
      EmployeeId: row.EmployeeId || 0,
      ReturnDate: row.ReturnDate || "",
      ConditionOnIssue: row.ConditionOnIssue || "",
      ConditionOnReturn: row.ConditionOnReturn || "",
      Remarks: row.Remarks || ""
    });
    setDropdownLabels({
      assetName: row.AssetName ?? "",
      employeeName: row.EmployeeName ?? ""
    });
    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }


  const handleFieldChange = (field: keyof AddUpdateAssetMappingMasterRequest, value: string | number | null | boolean) => {
    setAssetMappingMasterFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateAssetMappingMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!AssetMappingMasterFormData.AssetMasterId) {
      newErrors.AssetMasterId = "Asset Name is required.";
    }

    if (!AssetMappingMasterFormData.EmployeeId) {
      newErrors.EmployeeId = "Employee Name is required.";
    }

    if (!AssetMappingMasterFormData.ConditionOnReturn?.trim()) {
      newErrors.ConditionOnReturn = "Condition On Return is required.";
    }
    if (!AssetMappingMasterFormData.ConditionOnIssue?.trim()) {
      newErrors.ConditionOnIssue = "Condition On Issue is required.";
    }
    if (!AssetMappingMasterFormData.AssignedDate?.trim()) {
      newErrors.AssignedDate = "Assigned Date is required.";
    }
    if (!AssetMappingMasterFormData.ReturnDate?.trim()) {
      newErrors.ReturnDate = "Return Date is required.";
    }
    if (!AssetMappingMasterFormData.Remarks?.trim()) {
      newErrors.Remarks = "Remarks is required.";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushWeekAssetMappingFormData = (): AddUpdateAssetMappingMasterRequest => {
    return {
      AssetMasterMappingId: AssetMappingMasterFormData.AssetMasterMappingId || 0,
      Uniquekey: AssetMappingMasterFormData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      AssetMasterId: AssetMappingMasterFormData.AssetMasterId || 0,
      AssignedDate: AssetMappingMasterFormData.AssignedDate || "",
      EmployeeId: AssetMappingMasterFormData.EmployeeId || 0,
      ReturnDate: AssetMappingMasterFormData.ReturnDate || "",
      ConditionOnIssue: AssetMappingMasterFormData.ConditionOnIssue || "",
      ConditionOnReturn: AssetMappingMasterFormData.ConditionOnReturn || "",
      Remarks: AssetMappingMasterFormData.Remarks || ""
    };
  };

  const fetchEmployeeOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await employeeMasterService.apiCallPullEmployeeMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      EmployeeName: params?.value || "",
    });

    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };

    const apiResponse = responseEither.right;
    const employeeList = apiResponse?.Data?.map((item: any) => ({
      label: `${item.FirstName} ${item.MiddleName || ""} ${item.LastName || ""}`.trim(),
      value: String(item.EmployeeId),
    })) || [];

    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? employeeList.length,
      itemList: employeeList,
    };
  };

  const fetchAssetNameOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await assetMasterService.apiCallPullAssetMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      AssetName: params?.value || "",
    });
    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
    const apiResponse = responseEither.right;
    const assetList = apiResponse?.Data?.map((item: any) => ({ label: item.AssetName, value: String(item.AssetMasterId) })) || [];
    return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? assetList.length, itemList: assetList };
  };
  const toDropdownInitialValue = (
    id?: number | null,
    label?: string
  ): { label: string; value: string | number } | null => {
    if (!id) return null;
    return {
      label: label || String(id),
      value: String(id),
    };
  };

  const [dropdownLabels, setDropdownLabels] = useState<{
    assetName?: string;
    employeeName?: string;
  }>({});

  const handleAddUpdateAssetMappingMaster = async () => {

    setFormErrors({});

    const validation = validateAssetMappingMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsAddUpdateModalOpen(false);
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushWeekAssetMappingFormData();
        const response = await assetMappingMasterService.apiCallAddUpdateAssetMappingMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = AssetMappingMasterFormData.AssetMasterMappingId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as AssetMappingMasterData

            setAssetMappingMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Asset added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as AssetMappingMasterData;

            setAssetMappingMasterList(prevData =>
              prevData.map(item =>
                item.AssetMasterMappingId === AssetMappingMasterFormData.AssetMasterMappingId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingAssetMappingMasterData(null);

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
      AssetMappingMasterFormData.AssetMasterMappingId === 0 ? 'Add Asset' : 'Update Asset...'
    )
  }

  //#region DELETE Asset Mapping MASTER
  const handleDeleteAssetMappingMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteAssetMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteAssetMappingMasterRequest = {
          AssetMasterMappingId: deleteAssetMappingMasterDetailsData.AssetMasterMappingId || 0,
          UniqueKey: deleteAssetMappingMasterDetailsData.Uniquekey || ""
        }
        const response = await assetMappingMasterService.apiCallDeleteAssetMappingMaster(params);

        if (E.isRight(response)) {
          setAssetMappingMasterList(prevData => prevData.filter(item => item.AssetMasterMappingId !== deleteAssetMappingMasterDetailsData.AssetMasterMappingId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteAssetMappingMasterDetailsData(null);
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
      'Delete Asset Mapping Master data...'
    )
  }

  //#endregion
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

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
          searchPlaceholder="Search By Asset Name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchAssetMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeAssetMappingMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Asset Mapping"
          onAdd={handleAddAssetMappingMaster}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportAssetMappingExcel}
          onExportPdf={handleExportAssetMappingPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE ASSET MAPPING */}
        <DataTable
          data={assetMappingListForTable}
          columns={visibleAssetMappingMasterColumns}
          pagination={assetMappingMasterPaginationInfo}
          emptyMessage="No asset mappings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW ASSET MAPPING MODAL */}
        <ViewAssetMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewAssetMappingMasterDetailsData(null)
          }}
          data={viewAssetMappingMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE ASSET MAPPING MASTER */}

        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingAssetMappingMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingAssetMappingMasterData(null)
            setFormErrors({})
          }}
          title={editingAssetMappingMasterData ? 'Update Asset Mapping Master Details' : 'Add Asset Mapping Master Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateAssetMappingMaster()
          }}
          saveText="Save"
          cancelText="Cancel"
          loading={isLoading}
          size="large75"
        >
          <div className="space-y-6 p-6 bg-blue-50">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SingleSelectDropdownWithPagination
                  label="Asset"
                  title="Select..."
                  size="lg"
                  dataFetchCallBack={fetchAssetNameOptions}
                  onSelected={(item) => handleFieldChange("AssetMasterId", Number(item.value))}
                  initialValue={toDropdownInitialValue(AssetMappingMasterFormData.AssetMasterId, dropdownLabels.assetName)}
                  error={formErrors.AssetMasterId}
                />
              </div>
              <SingleSelectDropdownWithPagination
                label="Employees"
                title="Select..."
                size="lg"
                required
                dataFetchCallBack={fetchEmployeeOptions}
                onSelected={(item) => handleFieldChange("EmployeeId", Number(item.value))}
                initialValue={toDropdownInitialValue(AssetMappingMasterFormData.EmployeeId, dropdownLabels.employeeName)}
                error={formErrors.EmployeeId}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Condition On Return'
                  value={AssetMappingMasterFormData.ConditionOnReturn ?? ""}
                  onChange={(e) => handleFieldChange("ConditionOnReturn", e.target.value)}
                  placeholder="Enter Condition On Return"
                  maxLength={250}
                  error={formErrors.ConditionOnReturn}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Condition On Issue'
                  value={AssetMappingMasterFormData.ConditionOnIssue ?? ""}
                  onChange={(e) => handleFieldChange("ConditionOnIssue", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Condition On Issue"
                  error={formErrors.ConditionOnIssue}
                />

              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DatePickerInput
                  label="Assigned Date"
                  value={formatDate_dd_mm_yyyy(AssetMappingMasterFormData.AssignedDate)}
                  onChange={(val) => handleFieldChange('AssignedDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  required
                  error={formErrors.AssignedDate}
                />
              </div>

              <div>
                <DatePickerInput
                  label="Return Date"
                  value={formatDate_dd_mm_yyyy(AssetMappingMasterFormData.ReturnDate)}
                  onChange={(val) => handleFieldChange('ReturnDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  required
                  error={formErrors.ReturnDate}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label='Remarks'
                  value={AssetMappingMasterFormData.Remarks ?? ""}
                  onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Remarks"
                  error={formErrors.Remarks}
                />
              </div>
            </div>

          </div>
        </Modal>

        {/* CUSTOMIZE COLUMNS MODAL */}

        <CustomizeColumnsModal
          isOpen={isShowCustomizeAssetMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeAssetMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredAssetMappingMasterColumnKeys]),
            )

            setSelectedAssetMappingMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeAssetMappingMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={assetMappingMasterColumns}
          selectedKeys={selectedAssetMappingMasterColumnKeys}
          requiredKeys={requiredAssetMappingMasterColumnKeys}
          title="Customize Asset Mapping Master Table Columns"
        />

        {/* FILTER ASSET MAPPING MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Asset Mapping Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name
                </label>
                <Input
                  type="text"
                  value={tempFilters.AssetName || ''}
                  onChange={(e) => handleFilterChange('AssetName', e.target.value)}
                  placeholder="Enter asset name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
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

        {/* DELETE CONFIRMATION ASSET MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteAssetMappingMasterDetailsData(null)
          }}
          onConfirm={handleDeleteAssetMappingMaster}
          title="You are about to delete a asset mapping?"
          message="Deleting this Asset Mapping Data will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  );
};

export default AssetMappingMaster;

