import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateLeaveEncashmentMasterRequest,
  DeleteLeaveEncashmentMasterRequest,
  LeaveEncashmentMasterData,
  FilterWithPaginationLeaveEncashmentMasterRequest
} from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel';
import { leaveEncashmentMasterService } from '@/features/leaveEncashmentMaster/services/LeaveEncashmentMasterService';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getLeaveEncashmentMasterColumns, REQUIRED_COLUMN_KEYS } from '@/features/leaveEncashmentMaster/constants/leaveEncashmentMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';

export const useLeaveEncashmentMaster = () => {
  //#region STATE MANAGEMENT
  const [leaveEncashmentMasterList, setLeaveEncashmentMasterList] = useState<LeaveEncashmentMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchLeaveEncashment(value)
  }, 350)

  const [viewLeaveEncashmentMasterDetailsData, setViewLeaveEncashmentMasterDetailsData] = useState<LeaveEncashmentMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT LEAVE ENCASHMENT MASTER
  const [editingLeaveEncashmentMasterData, setEditingLeaveEncashmentMasterData] = useState<LeaveEncashmentMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE LEAVE ENCASHMENT MASTER
  const [formData, setFormData] = useState<AddUpdateLeaveEncashmentMasterRequest>(() => getInitialFormState());

  //DELETE LEAVE ENCASHMENT MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteLeaveEncashmentMasterDetailsData, setDeleteLeaveEncashmentMasterDetailsData] = useState<LeaveEncashmentMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeLeaveEncashmentMasterColumnsModal, setIsShowCustomizeLeaveEncashmentMasterColumnsModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialLeaveEncashments = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialLeaveEncashments.current) return
    hasFetchedInitialLeaveEncashments.current = true;
    fetchLeaveEncashmentList()
  }, [])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingLeaveEncashmentMasterData) {
        setFormData({
          LeaveEncashmentMasterSlabsId: editingLeaveEncashmentMasterData.LeaveEncashmentMasterSlabsId,
          Uniquekey: editingLeaveEncashmentMasterData.Uniquekey || getInitialFormState().Uniquekey,
          EarningMasterName: editingLeaveEncashmentMasterData.EarningMasterName || '',
          MinSalary: editingLeaveEncashmentMasterData.MinSalary || 0,
          MaxSalary: editingLeaveEncashmentMasterData.MaxSalary || 0,
          EncashmentRate: editingLeaveEncashmentMasterData.EncashmentRate || 0,
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingLeaveEncashmentMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const leaveEncashmentMasterColumns = useMemo<TableColumn[]>(
    () => getLeaveEncashmentMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchLeaveEncashmentList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadLeaveEncashments(page, sort);
  }

  const loadLeaveEncashments = async (page: number, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationLeaveEncashmentMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          EarningName: searchtext?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, leaveEncashmentMasterColumns)
        }

        const response = await leaveEncashmentMasterService.apiCallPullLeaveEncashmentMaster(params);

        if (E.isRight(response)) {
          setLeaveEncashmentMasterList(response.right.Data);
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
      'Loading Leave Encashment'
    )
  }
  //#endregion

  //#region SEARCH LEAVE ENCASHMENT 
  const searchLeaveEncashment = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchLeaveEncashmentList();
      return
    }

    await loadLeaveEncashments(1, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH LEAVE ENCASHMENT 
  const clearsearchLeaveEncashment = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadLeaveEncashments(1, sortInfo, undefined);
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportLeaveEncashments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLeaveEncashmentMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          SortBy: getSortByParam(sortInfo ?? null, leaveEncashmentMasterColumns),
          ExportType: exportType
        }

        const response = await leaveEncashmentMasterService.apiCallPullLeaveEncashmentMaster(params);
        handleExportFile(response, exportType, 'Leave Encashment Master', addToast)
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export'
    )
  }

  const handleExportLeaveEncashmentExcel = () => handleExportLeaveEncashments('Excel')
  const handleExportLeaveEncashmentPdf = () => handleExportLeaveEncashments('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchLeaveEncashmentList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadLeaveEncashments(1, sort, searchTerm || undefined);

  }, [searchTerm]);
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredLeaveEncashmentMasterColumnKeys: string[] = REQUIRED_COLUMN_KEYS;

  const allLeaveEncashmentMasterColumnKeys: string[] = leaveEncashmentMasterColumns.map(c => c.key)

  const [selectedLeaveEncashmentMasterColumnKeys, setSelectedLeaveEncashmentMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getLeaveEncashmentMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredLeaveEncashmentMasterColumnKeys]));
        return withRequired.filter(k => allLeaveEncashmentMasterColumnKeys.includes(k));
      }
    } catch { }
    return allLeaveEncashmentMasterColumnKeys
  })

  useEffect(() => {
    setSelectedLeaveEncashmentMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredLeaveEncashmentMasterColumnKeys])).filter(k => allLeaveEncashmentMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveEncashmentMasterColumns.length])

  const visibleLeaveEncashmentMasterColumns = useMemo(
    () => leaveEncashmentMasterColumns.filter(col => selectedLeaveEncashmentMasterColumnKeys.includes(col.key)),
    [leaveEncashmentMasterColumns, selectedLeaveEncashmentMasterColumnKeys]
  )
  //#endregion

  //#region VIEW EDIT
  const handleViewLeaveEncashmentDetails = useCallback((row: LeaveEncashmentMasterData) => {
    setViewLeaveEncashmentMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT LEAVE ENCASHMENT MASTER
  const handleEditLeaveEncashmentMasterData = useCallback((row: LeaveEncashmentMasterData) => {
    setEditingLeaveEncashmentMasterData({
      ...row,
      EncashmentRate: row.EncashmentRate || 0,
      MaxSalary: row.MaxSalary || 0,
      MinSalary: row.MinSalary || 0,
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveEncashmentMasterData) => {
    setDeleteLeaveEncashmentMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region ADD UPDATE EDIT LEAVE ENCASHMENT MASTER
  const handleFieldChange = (field: keyof AddUpdateLeaveEncashmentMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  

  const handleAddLeaveEncashmentMasterModal = () => {
    setEditingLeaveEncashmentMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateLeaveEncashmentMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.EarningMasterName) {
      newErrors.EarningMasterName = "Earning Name is required";
    }

    if (!formData.EncashmentRate || Number(formData.EncashmentRate) <= 0) {
      newErrors.EncashmentRate = "Encashment Rate is required";
    }
    if (!formData.MinSalary || Number(formData.MinSalary) <= 0) {
      newErrors.MinSalary = "Min Salary is required";
    }
    if (!formData.MaxSalary || Number(formData.MaxSalary) <= 0) {
      newErrors.MaxSalary = "Max Salary is required";
    }

    if (Number(formData.MinSalary) >= Number(formData.MaxSalary)) {
      newErrors.MaxSalary = "Max Salary must be greater than Min Salary";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushLeaveEncashmentMasterFormData = (): AddUpdateLeaveEncashmentMasterRequest => {
    return {
      LeaveEncashmentMasterSlabsId: formData.LeaveEncashmentMasterSlabsId,

      Uniquekey: formData.Uniquekey,

      EarningMasterName: Array.isArray(formData.EarningMasterName)
        ? formData.EarningMasterName.join(",")
        : formData.EarningMasterName,

      MinSalary: Number(formData.MinSalary) || 0,
      MaxSalary: Number(formData.MaxSalary) || 0,
      
      EncashmentRate: Number(formData.EncashmentRate) || 0,
    };
  };

  const handleAddUpdateLeaveEncashmentMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateLeaveEncashmentMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushLeaveEncashmentMasterFormData();
        const response = await leaveEncashmentMasterService.apiCallAddUpdateLeaveEncashmentMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.LeaveEncashmentMasterSlabsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as LeaveEncashmentMasterData
            setLeaveEncashmentMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as LeaveEncashmentMasterData;
            setLeaveEncashmentMasterList(prevData =>
              prevData.map(item =>
                item.LeaveEncashmentMasterSlabsId === formData.LeaveEncashmentMasterSlabsId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingLeaveEncashmentMasterData(null);
        } else {
          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      Number(formData.LeaveEncashmentMasterSlabsId) === 0 ? 'Add Leave Encashment' : 'Update Leave Encashment'
    )
  };
  //#endregion

  //#region DELETE LEAVE ENCASHMENT MASTER
  const handleDeleteLeaveEncashmentMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLeaveEncashmentMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteLeaveEncashmentMasterRequest = {
          LeaveEncashmentMasterSlabsId: deleteLeaveEncashmentMasterDetailsData.LeaveEncashmentMasterSlabsId,
          UniqueKey: deleteLeaveEncashmentMasterDetailsData.Uniquekey || ""
        }

        const response = await leaveEncashmentMasterService.apiCallDeleteLeaveEncashmentMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (leaveEncashmentMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadLeaveEncashments(pageToShow, sortInfo);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteLeaveEncashmentMasterDetailsData(null);
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
      'Delete Leave Encashment'
    )
  }
  //#endregion

  return {
    leaveEncashmentMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewLeaveEncashmentMasterDetailsData,
    isViewModalOpen,
    errors,
    editingLeaveEncashmentMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteLeaveEncashmentMasterDetailsData,
    isShowCustomizeLeaveEncashmentMasterColumnsModal,
    canAction,
    canExport,
    leaveEncashmentMasterColumns,
    visibleLeaveEncashmentMasterColumns,
    selectedLeaveEncashmentMasterColumnKeys,
    requiredLeaveEncashmentMasterColumnKeys,
    allLeaveEncashmentMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewLeaveEncashmentMasterDetailsData,
    setErrors,
    setEditingLeaveEncashmentMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteLeaveEncashmentMasterDetailsData,
    setIsShowCustomizeLeaveEncashmentMasterColumnsModal,
    setSelectedLeaveEncashmentMasterColumnKeys,

    // Actions
    fetchLeaveEncashmentList,
    handlePageChange,
    handleSortColumn,
    handleViewLeaveEncashmentDetails,
    handleEditLeaveEncashmentMasterData,
    handleConfirmationDialogBoxOpen,
    handleFieldChange,
    handleAddLeaveEncashmentMasterModal,
    handleAddUpdateLeaveEncashmentMaster,
    handleDeleteLeaveEncashmentMaster,
    handleExportLeaveEncashmentExcel,
    handleExportLeaveEncashmentPdf,
    debouncedSearch,
    clearsearchLeaveEncashment,
  }
}
