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
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';
import { departmentMasterService } from '@/features/departmentMaster/services/DepartmentMasterService';


export const WeekOffMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [weekOffMappingMasterList, setWeekOffMappingMasterList] = useState<WeekOffMappingMasterData[]>([]);
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
    searchWeekOffMappings(value)
  }, 350)

  //VIEW WEEKOFF MAPPING MASTER MODAL STATES
  const [viewWeekOffMappingMasterDetailsData, setViewWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeWeekOffMappingMasterColumnsModal, setIsShowCustomizeWeekOffMappingMasterColumnsModal] = useState(false);

  // Edit WEEKOFF MAPPING MASTER
  const [editingWeekOffMappingMasterData, setEditingWeekOffMappingMasterData] = useState<WeekOffMappingMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [WeekOffMappingMasterFormData, setWeekOffMappingMasterFormData] = useState<AddUpdateWeekOffMappingMasterRequest>({
    WeekOffPolicyMasterMappingId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    WeekOffPolicyMasterId: 0,
    DepartmentMasterId: "",
    EmployeeId: ""
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  //DELETE WEEKOFF MAPPING MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteWeekOffMappingMasterDetailsData, setDeleteWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();

  //#region INITIALIZATION
  const hasFetchedInitialWeekOffMappings = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialWeekOffMappings.current) return
    hasFetchedInitialWeekOffMappings.current = true;
    fetchWeekOffMappingList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

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

  // SEARCH WEEK OFF MAPPING 
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
  // END WEEK OFF MAPPING 

  // EXPORT EXCEL | PDF
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

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET WEEK OFF MAPPING
  const getWeekOffMappings = async (filterParams: FilterWithPaginationWeekOffMappingMasterRequest) => {

    return await WeekOffMappingMasterService.apiCallPullWeekOffMappingMaster(filterParams);
  }

  // END API | SERVICES CALL TO GET WEEK OFF MAPPING

  //#region TABLE CONFIGURATION
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

  // STABLE HANDLER VIEW
  const handleViewWeekOffMappingDetails = useCallback((row: WeekOffMappingMasterData) => {
    setViewWeekOffMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
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
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
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

  //#endregion

  //#region VIEW WEEK OFF MAPPING DETAILS MODAL COMPONENT

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
        title="Week Off Mapping Details"
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
            <FieldItem label="Department Name" value={data.DepartmentName} isRow withBorder={true} />
            <FieldItem label="Employee Name" value={data.EmployeeName} isRow withBorder={true} />
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
                      handleEditWeekOffMappingMasterData(data)
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
  const handleAddWeekOffMappingMaster = () => {
    setEditingWeekOffMappingMasterData(null);
    setWeekOffMappingMasterFormData({
      WeekOffPolicyMasterMappingId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      WeekOffPolicyMasterId: 0,
      DepartmentMasterId: "",
      EmployeeId: ""
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const handleEditWeekOffMappingMasterData = (row: WeekOffMappingMasterData) => {
    setEditingWeekOffMappingMasterData(row);
    setWeekOffMappingMasterFormData({
      WeekOffPolicyMasterMappingId: row.WeekOffPolicyMasterMappingId || 0,
      Uniquekey: row.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      WeekOffPolicyMasterId: row.WeekOffPolicyMasterId || 0,
      DepartmentMasterId: row.DepartmentMasterId || "",
      EmployeeId: row.EmployeeId || ""
    });
    setDropdownLabels({
      weekOffPolicyName: row.WeekOffPolicyName ?? "",
      employeeName: row.EmployeeName ?? "",
      departmentName: row.DepartmentName ?? ""

    });
    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const handleFieldChange = (field: keyof AddUpdateWeekOffMappingMasterRequest, value: string | number | null | boolean) => {
  setWeekOffMappingMasterFormData(prev => ({
    ...prev,
    [field]: typeof value === "number" ? String(value) : value
  }));
  if (formErrors[field]) {
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  }
}



  const validateWeekOffMappingMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!WeekOffMappingMasterFormData.DepartmentMasterId) {
      newErrors.DepartmentMasterId = "Department Name is required.";
    }

    if (!WeekOffMappingMasterFormData.EmployeeId) {
      newErrors.EmployeeId = "Employee Name is required.";
    }

    if (!WeekOffMappingMasterFormData.WeekOffPolicyMasterId) {
      newErrors.WeekOffPolicyMasterId = "Week Off Policy Name is required.";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushWeekWeekOffMappingFormData = (): AddUpdateWeekOffMappingMasterRequest => {
    return {
      WeekOffPolicyMasterMappingId: Number(WeekOffMappingMasterFormData.WeekOffPolicyMasterMappingId) || 0,
      Uniquekey: WeekOffMappingMasterFormData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      WeekOffPolicyMasterId: Number(WeekOffMappingMasterFormData.WeekOffPolicyMasterId) || 0,
      DepartmentMasterId: String(WeekOffMappingMasterFormData.DepartmentMasterId || ""),
      EmployeeId: String(WeekOffMappingMasterFormData.EmployeeId || "")
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

  const fetchDepartmentNameOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await departmentMasterService.apiCallPullDepartmentMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      DepartmentName: params?.value || "",
    });
    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
    const apiResponse = responseEither.right;
    const DepartmentNameList = apiResponse?.Data?.map((item: any) => ({ label: item.DepartmentName, value: String(item.DepartmentMasterId) })) || [];
    return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? DepartmentNameList.length, itemList: DepartmentNameList };
  };
  const toDropdownInitialValue = (
  id?: string | number,
  label?: string
): { label: string; value: string } | null => {
  if (id === undefined || id === null) return null;
  return {
    label: label || String(id),
    value: String(id),  // convert everything to string
  };
};


  const [dropdownLabels, setDropdownLabels] = useState<{
    weekOffPolicyName?: string;
    employeeName?: string
    departmentName?: string
  }>({});

  const handleAddUpdateWeekOffMappingMaster = async () => {
    console.log("FORM DATA BEFORE API:", WeekOffMappingMasterFormData);
    setFormErrors({});

    const validation = validateWeekOffMappingMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushWeekWeekOffMappingFormData();
        const response = await WeekOffMappingMasterService.apiCallAddUpdateWeekOffMappingMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = WeekOffMappingMasterFormData.WeekOffPolicyMasterMappingId === 0

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
                item.WeekOffPolicyMasterMappingId === WeekOffMappingMasterFormData.WeekOffPolicyMasterMappingId
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
      WeekOffMappingMasterFormData.WeekOffPolicyMasterMappingId === 0 ? 'Add Week Off Mapping' : 'Update Week Off Mapping...'
    )
  }

  //#region DELETE WEEK OFF MAPPING MASTER
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

        {/* COMMAN LOADER FOR PAGE */}

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

        {/* COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW */}

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
          addTitle='Add Week Off Name'
          onAdd={handleAddWeekOffMappingMaster}
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

        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingWeekOffMappingMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingWeekOffMappingMasterData(null)
            setFormErrors({})
          }}
          title={editingWeekOffMappingMasterData ? 'Update Week Off Mapping Master Details' : 'Add Week Off Mapping Master Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateWeekOffMappingMaster()
          }}
          saveText="Save"
          cancelText="Cancel"
          loading={isLoading}
          size="large75"
        >
          <div className="space-y-6 p-6 bg-blue-50">
            <div>
              <SingleSelectDropdownWithPagination
                label="Week Off Policy Name"
                title="Select Week Off Policy Name "
                size="lg"
                required
                dataFetchCallBack={fetchWeekOffPolicyNameOptions}
                onSelected={(item) => handleFieldChange("WeekOffPolicyMasterId", Number(item.value))}
                initialValue={toDropdownInitialValue(WeekOffMappingMasterFormData.WeekOffPolicyMasterId, dropdownLabels.weekOffPolicyName)}
                error={formErrors.WeekOffPolicyMasterId}
              />
            </div>
            <div>
              <SingleSelectDropdownWithPagination
                label="Employees"
                title="Select Employees"
                size="lg"
                required
                dataFetchCallBack={fetchEmployeeOptions}
                onSelected={(item) => handleFieldChange("EmployeeId", Number(item.value))}
                initialValue={toDropdownInitialValue(WeekOffMappingMasterFormData.EmployeeId, dropdownLabels.employeeName)}
                error={formErrors.EmployeeId}
              />
            </div>
            <div>
              <SingleSelectDropdownWithPagination
                label="Department"
                title="Select Department"
                size="lg"
                required
                dataFetchCallBack={fetchDepartmentNameOptions}
                onSelected={(item) => handleFieldChange("DepartmentMasterId", Number(item.value))}
                initialValue={toDropdownInitialValue(WeekOffMappingMasterFormData.DepartmentMasterId, dropdownLabels.departmentName)}
                error={formErrors.DepartmentMasterId}
              />
            </div>
          </div>
        </Modal>

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

      </div>
    </>
  )
}

export default WeekOffMappingMaster


