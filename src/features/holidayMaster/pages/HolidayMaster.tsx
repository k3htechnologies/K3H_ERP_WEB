import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  HolidayMasterData,
  FilterWithPaginationHolidayMasterRequest,
  DeleteHolidayMasterRequest,
  AddUpdateHolidayMasterRequest
} from '@/features/holidayMaster/models/HolidayMasterModel';

import { HolidayMasterService } from '@/features/holidayMaster/services/HolidayMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { Edit, Trash2 } from 'lucide-react';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';

const initialFormState = (): AddUpdateHolidayMasterRequest => ({
  HolidayMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  HolidayName: "",
  HolidayURL: null,
  RemoveHolidayURL: "",
});

export const HolidayMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [holidayMasterList, setHolidayMasterList] = useState<HolidayMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchHolidays(value)
  }, 350)

  //VIEW HOLIDAY MASTER MODAL STATES
  const [viewHolidayMasterDetailsData, setViewHolidayMasterDetailsData] = useState<HolidayMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ADD UPDATE HOLIDAY URL
  const [holidayFiles, setHolidayFiles] = useState<(File | string)[]>([]);
  const [removedHolidayUrls, setRemovedHolidayUrls] = useState<string[]>([]);
  const [holidayURL, setHolidayURL] = useState<string>();

  // EDIT HOLIDAY MASTER
  const [editingHolidayMasterData, setEditingHolidayMasterData] = useState<HolidayMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE HOLIDAY MASTER
  const [formData, setFormData] = useState<AddUpdateHolidayMasterRequest>(() => initialFormState());

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

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
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
          Uniquekey: editingHolidayMasterData.Uniquekey || initialFormState().Uniquekey,
          HolidayName: editingHolidayMasterData.HolidayName || "",
          HolidayURL: null,
          RemoveHolidayURL: '',

        });

      } else {
        setFormData(initialFormState());
        setHolidayFiles([]);
        setHolidayURL("")
        setRemovedHolidayUrls([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingHolidayMasterData]);
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 
  const fetchHolidayList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadHolidays(page, "", sort);
  }

  const loadHolidays = async (page: number, searchValue?: string, sortInfo?: SortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = holidayMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationHolidayMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          HolidayName: searchValue?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getHolidays(params);

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

  //#region CLEAR SERACH HOLIDAY MASTER
  const clearsearchHolidays = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchHolidayList();
  }
  //#endregion 

  //#region EXPORT EXCEL | PDF
  const handleExportHolidays = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = holidayMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationHolidayMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getHolidays(params);

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

  //#region API | SERVICES CALL TO GET HOLIDAY MASTER
  const getHolidays = async (filterParams: FilterWithPaginationHolidayMasterRequest) => {

    return await HolidayMasterService.apiCallPullHolidayMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = (page: number) => {
    fetchHolidayList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN

  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sortInfo);

    loadHolidays(1, "", sort);

  }, []);

  //#endregion

  //#region TABLE PAGINATION INFO
  const holidayMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const holidayListForTable = useMemo(() => holidayMasterList, [holidayMasterList]);
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

  //#region TABLE COLUMN
  const holidayMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'HolidayName',
        label: 'Holiday Name',
        width: '30',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="400px"
              tooltipThreshold={50}
              onClick={() => handleViewHolidayDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'HolidayURL',
        label: 'Holiday File',
        width: '30',
        sortable: false,
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">


            <MultiImageViewer
              images={parseDocumentUrls(row.HolidayURL)}
              title="Holiday"
              isIcon={false}
              triggerLabel={value || '-'}
            />

          </div>
        )
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row) => (
          canAction && !row.NumberOfEmployee ? (
            <div className="flex items-center justify-center gap-2">

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleConfirmationDialogBoxOpen(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'red',
                  padding: '4px 8px'
                }}
                title="Delete Department"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        )
      }
    ],
    // dependencies: include everything used inside that might change
    [handleViewHolidayDetails, handleConfirmationDialogBoxOpen]
  )
  //#endregion

  //#region VIEW HOLIDAY DETAILS MODAL COMPONENT

  interface ViewHolidayDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: HolidayMasterData | null
  }

  const ViewHolidayDetailsModal: React.FC<ViewHolidayDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Holiday Details"
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

            <FieldItem label="Holiday Name" value={data.HolidayName} isRow withBorder={true} className='font-medium text-blue-900 ' />

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
                    color='red'
                    variant='solid'
                    colorMode="light"
                    size='md'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsViewModalOpen(false)
                      handleConfirmationDialogBoxOpen(data)
                    }}
                    leftIcon={<Trash2 className="h-5 w-5" />}
                  >
                    Delete
                  </Button>

                  <Button
                    color='blue'
                    size='md'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsViewModalOpen(false)
                      handleEditHolidayMaster(data)
                    }}
                    leftIcon={<Edit className="h-5 w-5" />}
                  >
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

  //#region  ADD UPDATE EDIT HOLIDAY MASTER
  const handleFieldChange = (field: keyof AddUpdateHolidayMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddHolidayMasterModal = () => {
    setEditingHolidayMasterData(null);
    setFormData(initialFormState());
    setHolidayFiles([]);
    setHolidayURL('')
    setRemovedHolidayUrls([]);
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
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
  //#region PUSH DATA

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
  //#endregion

  //#region HANDLE ADD AND UPDATE HOLIDAY MASTER

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

      setIsLoadingMessage,
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
  }

  //#endregion 

  //#region DELETE HOLIDAY MASTER
  const handleDeleteHolidayMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteHolidayMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {


        const params: DeleteHolidayMasterRequest = {
          HolidayMasterId: deleteHolidayMasterDetailsData.HolidayMasterId,
          UniqueKey: deleteHolidayMasterDetailsData.Uniquekey ?? ""
        }

        const response = await HolidayMasterService.apiCallDeleteHolidayMaster(params);

        if (E.isRight(response)) {

          setHolidayMasterList(prevData => prevData.filter(item => item.HolidayMasterId !== deleteHolidayMasterDetailsData.HolidayMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

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
  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* COMMAN LOADER FOR PAGE */}

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      {/* COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW */}

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Holiday Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchHolidays}

        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddHolidayMasterModal}

        // IMPORT
        isShowImportButton={false}

        // EXPORT 
        isShowExportButton={canExport && holidayListForTable.length > 0}
        onExportExcel={handleExportHolidayExcel}
        onExportPdf={handleExportHolidayPdf}
        exportLoading={isLoading}
      />

      {/* DATA TABLE HOLIDAY */}

      <DataTable
        data={holidayListForTable}
        columns={holidayMasterColumns}
        pagination={holidayMasterPaginationInfo}
        emptyMessage="No Holiday Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* VIEW HOLIDAY MODAL */}
      <ViewHolidayDetailsModal isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewHolidayMasterDetailsData(null)
        }}
        data={viewHolidayMasterDetailsData}
      />

      {/*  ADD EDIT UPDATE HOLIDAY MODAL */}
      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false)
          setEditingHolidayMasterData(null)
          setFormData(initialFormState());
          setErrors({})
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false)
          setEditingHolidayMasterData(null)
          setFormData(initialFormState());
        }}
        title={editingHolidayMasterData ? 'Update Holiday ' : 'Add Holiday'}
        onSubmit={handleAddUpdateHolidayMaster}
        saveText={editingHolidayMasterData ? 'Update' : 'Add'}
        resetText='Reset'
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-6 p-6 bg-blue-100">
          <div className='space-y-4'>
            <div>
              <Input
                type="text"
                label='Holiday Name'
                value={formData.HolidayName ?? ''}
                onChange={(e) => handleFieldChange("HolidayName", e.target.value)}
                required
                maxLength={100}
                placeholder="Enter Holiday Name"
                error={errors.HolidayName}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Holiday Photo"
                placeholder="Select Holiday Photo"
                required
                error={errors.HolidayURL}
                value={holidayFiles}
                onChange={setHolidayFiles}
                availableFilesURL={holidayURL ?? ""}
                allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => {
                  setRemovedHolidayUrls((prev) => [...prev, url])
                }}
              />
            </div>
          </div>
        </div>

      </Modal>

      {/* DELETE CONFIRMATION HOLIDAY MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteHolidayMasterDetailsData(null)
        }}
        onConfirm={handleDeleteHolidayMaster}
        title="You are about to delete a Holiday?"
        message="Deleting this Holiday will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />
    </div>
  )
}

export default HolidayMaster