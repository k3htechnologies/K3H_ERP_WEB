import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateHolidayMasterRequest,
  DeleteHolidayMasterRequest,
  HolidayMasterData,
  FilterWithPaginationHolidayMasterRequest
} from '@/features/holidayMaster/models/HolidayMasterModel';
import { HolidayMasterService } from '@/features/holidayMaster/services/HolidayMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getHolidayMasterColumns } from '@/features/holidayMaster/constants/holidayMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';

export const useHolidayMaster = () => {
  //#region STATE MANAGEMENT
  const [holidayMasterList, setHolidayMasterList] = useState<HolidayMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchHolidays(value)
  }, 350)
  const [viewHolidayMasterDetailsData, setViewHolidayMasterDetailsData] = useState<HolidayMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ADD UPDATE HOLIDAY URL
  const [holidayFiles, setHolidayFiles] = useState<(File | string)[]>([]);
  const [removedHolidayUrls, setRemovedHolidayUrls] = useState<string[]>([]);
  const [holidayURL, setHolidayURL] = useState<string>();

  // EDIT HOLIDAY MASTER
  const [editingHolidayMasterData, setEditingHolidayMasterData] = useState<HolidayMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE HOLIDAY MASTER
  const [formData, setFormData] = useState<AddUpdateHolidayMasterRequest>(() => getInitialFormState());

  //DELETE HOLIDAY MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteHolidayMasterDetailsData, setDeleteHolidayMasterDetailsData] = useState<HolidayMasterData | null>(null)

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialHolidays = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialHolidays.current) return
    hasFetchedInitialHolidays.current = true;
    fetchHolidayList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingHolidayMasterData) {
        setFormData({
          HolidayMasterId: editingHolidayMasterData.HolidayMasterId,
          Uniquekey: editingHolidayMasterData.Uniquekey || getInitialFormState().Uniquekey,
          HolidayName: editingHolidayMasterData.HolidayName || "",
          HolidayURL: null,
          RemoveHolidayURL: '',
        });
        setHolidayURL(editingHolidayMasterData.HolidayURL);
        setHolidayFiles(editingHolidayMasterData.HolidayURL ? [editingHolidayMasterData.HolidayURL] : []);
        setRemovedHolidayUrls([]);
      } else {
        setFormData(getInitialFormState());
        setHolidayFiles([]);
        setHolidayURL("");
        setRemovedHolidayUrls([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingHolidayMasterData]);

  //#endregion

  //#region TABLE COLUMN DEFINITION

  const holidayMasterColumns = useMemo<TableColumn[]>(
    () => getHolidayMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchHolidayList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadHolidays(page, "", sort);
  }

  const loadHolidays = async (page: number, searchValue?: string, sortInfo?: SortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationHolidayMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          HolidayName: searchValue?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, holidayMasterColumns)
        }

        const response = await HolidayMasterService.apiCallPullHolidayMaster(params);

        if (E.isRight(response)) {
          setHolidayMasterList(response.right.Data);
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
      'Loading Holiday'
    )
  }
  //#endregion

  //#region SEARCH HOLIDAY MASTER 
  const searchHolidays = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchHolidayList();
      return
    }

    await loadHolidays(1, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH HOLIDAY MASTER 
  const clearsearchHolidays = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadHolidays(1,'');
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportHolidays = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationHolidayMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          SortBy: getSortByParam(sortInfo ?? null, holidayMasterColumns),
          ExportType: exportType
        }

        const response = await HolidayMasterService.apiCallPullHolidayMaster(params);
        handleExportFile(response, exportType, 'Holiday Master', addToast)
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

  const handleExportHolidayExcel = () => handleExportHolidays('Excel')
  const handleExportHolidayPdf = () => handleExportHolidays('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchHolidayList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadHolidays(1, searchTerm || undefined, sort);
  }, [searchTerm]);
  //#endregion

  //#region VIEW EDIT
  const handleViewHolidayDetails = useCallback((row: HolidayMasterData) => {
    setViewHolidayMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT HOLIDAY  MASTER
  const handleEditHolidayMaster = useCallback((row: HolidayMasterData) => {
    setEditingHolidayMasterData({
      ...row,
      HolidayName: row.HolidayName || '',
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: HolidayMasterData) => {
    setDeleteHolidayMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region ADD UPDATE EDIT HOLIDAY MASTER
  const handleFieldChange = (field: keyof AddUpdateHolidayMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddHolidayMasterModal = () => {
    setEditingHolidayMasterData(null);
    setFormData(getInitialFormState());
    setHolidayFiles([]);
    setHolidayURL('')
    setRemovedHolidayUrls([]);
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddHolidayMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.HolidayName?.trim()) {
      newErrors.HolidayName = "Holiday name is required";
    } else if (formData.HolidayName.trim().length > 50) {
      newErrors.HolidayName = 'Holiday Name must be at most 50 characters'
    }

    if (!hasAnyDocumentFile(holidayFiles, holidayURL, removedHolidayUrls)) {
      newErrors.HolidayURL = "File is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushHolidayFormData = (): FormData => {
    const fd = new FormData();
    fd.append('HolidayMasterId', formData.HolidayMasterId.toString());
    fd.append('Uniquekey', formData.Uniquekey ?? '');
    fd.append('HolidayName', formData.HolidayName.trim() ?? '');

    holidayFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('HolidayURL', file);
      }
    });

    fd.append('RemoveHolidayURL', removedHolidayUrls.join(','));

    return fd;
  };

  const handleAddUpdateHolidayMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateAddHolidayMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushHolidayFormData();
        const response = await HolidayMasterService.apiCallAddUpdateHolidayMaster(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.HolidayMasterId === 0

          if (isAdd) {
            const newRecord = response.right.Data[0] as HolidayMasterData
            setHolidayMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as HolidayMasterData;
            setHolidayMasterList(prevData =>
              prevData.map(item =>
                item.HolidayMasterId === formData.HolidayMasterId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);
          setEditingHolidayMasterData(null);
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
      formData.HolidayMasterId === 0 ? 'Add HolidayMaster' : 'Update HolidayMaster...'
    )
  };
  //#endregion

  //#region DELETE HOLIDAY MASTER
  const handleDeleteHolidayMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteHolidayMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteHolidayMasterRequest = {
          HolidayMasterId: deleteHolidayMasterDetailsData.HolidayMasterId,
          UniqueKey: deleteHolidayMasterDetailsData.Uniquekey ?? ""
        }

        const response = await HolidayMasterService.apiCallDeleteHolidayMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (holidayMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadHolidays(pageToShow);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteHolidayMasterDetailsData(null);
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
      'Delete Holiday Master'
    )
  }
  //#endregion

  return {
    holidayMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewHolidayMasterDetailsData,
    isViewModalOpen,
    errors,
    editingHolidayMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteHolidayMasterDetailsData,
    canAction,
    canExport,
    holidayMasterColumns,
    holidayFiles,
    removedHolidayUrls,
    holidayURL,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewHolidayMasterDetailsData,
    setErrors,
    setEditingHolidayMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteHolidayMasterDetailsData,
    setHolidayFiles,
    setRemovedHolidayUrls,
    setHolidayURL,

    // Actions
    fetchHolidayList,
    handlePageChange,
    handleSortColumn,
    handleViewHolidayDetails,
    handleEditHolidayMaster,
    handleConfirmationDialogBoxOpen,
    handleFieldChange,
    handleAddHolidayMasterModal,
    handleAddUpdateHolidayMaster,
    handleDeleteHolidayMaster,
    handleExportHolidayExcel,
    handleExportHolidayPdf,
    debouncedSearch,
    clearsearchHolidays,
  }
}
