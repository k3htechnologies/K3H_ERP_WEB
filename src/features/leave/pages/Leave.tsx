import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateLeaveRequest,
  DeleteLeaveRequest,
  FilterWithPaginationLeaveRequest,
  LeaveData,
} from '@/features/leave/models/LeaveModel';
import { LeaveService } from '@/features/leave/services/LeaveService';
import { formatDateDisplay, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { Button, Input } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import { DateRangePickerModal } from '@/ui/components/forms/DateRangePickerModal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchLeaveTypeMasterDropdown } from '@/features/leaveTypeMaster/leaveTypeMasterDropdown';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { usePagination } from '@/core/hooks/usePagination';

const initialFormState = (): AddUpdateLeaveRequest => ({
  LeaveId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  LeaveTypeMasterId: 0,
  StartDate: null,
  EndDate: null,
  StartDateLeaveDuration: 'Full',
  EndDateLeaveDuration: 'Full',
  Reason: '',
  LeaveDocumentFiles: [],
});

const LEAVE_DURATION_OPTIONS = [
  { label: 'Full Day', value: 'Full' },
  { label: 'Half Day (First Half)', value: 'HalfFirst' },
  { label: 'Half Day (Second Half)', value: 'HalfSecond' },
];

export const Leave: React.FC = () => {
  const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const networkErrorNotified = useRef(false);
  const isLoadingRef = useRef(false);
  const lastLoadParamsRef = useRef<{ page: number; pageSize: number; search: string; sortColumn?: string } | null>(null);

  const { pagination, setPagination } = usePagination(20);

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, addToast, removeToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    // When search changes, reset to first page; list will reload via effect
    setPagination({ currentPage: 1 });
    setSearchTerm(value);
  }, 350);

  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<LeaveData | null>(null);
  const [formData, setFormData] = useState<AddUpdateLeaveRequest>(initialFormState());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePayload, setDeletePayload] = useState<DeleteLeaveRequest | null>(null);

  const { canAction, canExport } = useMenuPermissions();

  const handleFieldChange = (key: keyof AddUpdateLeaveRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const computeNoOfDays = useCallback(
    (start?: string | null, end?: string | null, startDur?: string, endDur?: string): number => {
      if (!start || !end) return 0;
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
      const diff = endDate.getTime() - startDate.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
      const startHalf = startDur?.startsWith('Half') ? 0.5 : 1;
      const endHalf = endDur?.startsWith('Half') ? 0.5 : 1;
      if (days <= 1) {
        return Math.max(startHalf, endHalf);
      }
      return (days - 2) + startHalf + endHalf;
    },
    [],
  );

  const loadLeaveList = useCallback(
    async () => {
      // Prevent concurrent calls
      if (isLoadingRef.current) return;
      
      try {
        isLoadingRef.current = true;
        setIsLoading(true);
        setIsLoadingMessage('Loading leave...');
        const payload: FilterWithPaginationLeaveRequest = {
          PageNumber: pagination.currentPage,
          PageSize: pagination.pageSize,
          SortBy: sortInfo?.column,
        };
        if (searchTerm.trim()) {
          payload.LeaveType = searchTerm.trim();
        }
        const responseEither = await LeaveService.apiCallPullLeave(payload);
        if (E.isRight(responseEither)) {
          const resp = responseEither.right;
          networkErrorNotified.current = false; // reset on success
          setLeaveList(resp.Data || []);
          const totalRecords = resp.TotalNumberOfRecord ?? 0;
          const totalPages = Math.ceil(totalRecords / pagination.pageSize) || 0;
          // Only update pagination if values actually changed to prevent infinite loop
          setPagination((prev) => {
            if (
              prev.currentPage === pagination.currentPage &&
              prev.pageSize === pagination.pageSize &&
              prev.totalPages === totalPages &&
              prev.totalRecords === totalRecords
            ) {
              return prev; // Return same object to prevent re-render
            }
            return {
              currentPage: pagination.currentPage,
              pageSize: pagination.pageSize,
              totalPages,
              totalRecords,
            };
          });
        } else {
          if (!networkErrorNotified.current) {
            addToast({ type: 'error', title: 'Failed to load leave', message: responseEither.left.message });
            networkErrorNotified.current = true;
          }
        }
      } catch (error: any) {
        if (!networkErrorNotified.current) {
          addToast({ type: 'error', title: 'Failed to load leave', message: error?.message || 'Network error' });
          networkErrorNotified.current = true;
        }
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMessage('');
      }
    },
    [addToast, pagination.currentPage, pagination.pageSize, searchTerm, sortInfo?.column],
  );

  const loadLeaveListRef = useRef(loadLeaveList);
  loadLeaveListRef.current = loadLeaveList;

  useEffect(() => {
    const currentParams = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      search: searchTerm,
      sortColumn: sortInfo?.column,
    };
    
    // Only load if parameters actually changed
    const lastParams = lastLoadParamsRef.current;
    if (
      lastParams &&
      lastParams.page === currentParams.page &&
      lastParams.pageSize === currentParams.pageSize &&
      lastParams.search === currentParams.search &&
      lastParams.sortColumn === currentParams.sortColumn
    ) {
      return; // Parameters haven't changed, skip loading
    }
    
    lastLoadParamsRef.current = currentParams;
    void loadLeaveListRef.current();
  }, [pagination.currentPage, pagination.pageSize, searchTerm, sortInfo?.column]);

  const handleAddUpdate = async (overrideStartDate?: string | null, overrideEndDate?: string | null) => {
    const finalStartDate = overrideStartDate !== undefined ? overrideStartDate : formData.StartDate;
    const finalEndDate = overrideEndDate !== undefined ? overrideEndDate : formData.EndDate;
    
    const newErrors: { [key: string]: string } = {};
    if (!formData.LeaveTypeMasterId) newErrors.LeaveTypeMasterId = 'Leave Type is required';
    if (!finalStartDate) newErrors.StartDate = 'Start Date is required';
    if (!finalEndDate) newErrors.EndDate = 'End Date is required';
    if (!formData.StartDateLeaveDuration) newErrors.StartDateLeaveDuration = 'Start duration required';
    if (!formData.EndDateLeaveDuration) newErrors.EndDateLeaveDuration = 'End duration required';
    if (!formData.Reason || formData.Reason.trim() === '') newErrors.Reason = 'Reason is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const payload: AddUpdateLeaveRequest = {
      ...formData,
      StartDate: finalStartDate,
      EndDate: finalEndDate,
      LeaveDocumentFiles: formData.LeaveDocumentFiles || [],
    };
    const responseEither = await LeaveService.apiCallAddUpdateLeave(payload);
    if (E.isRight(responseEither)) {
      addToast({ type: 'success', title: 'Leave saved', message: 'Leave saved successfully' });
      setIsAddUpdateModalOpen(false);
      setEditingData(null);
      setFormData(initialFormState());
      setErrors({});
      loadLeaveList();
    } else {
      addToast({ type: 'error', title: 'Failed to save leave', message: responseEither.left.message });
    }
  };

  const handleDelete = async () => {
    if (!deletePayload) return;
    const responseEither = await LeaveService.apiCallDeleteLeave(deletePayload);
    if (E.isRight(responseEither)) {
      addToast({ type: 'success', title: 'Leave deleted', message: 'Leave deleted successfully' });
      setIsDeleteDialogOpen(false);
      setDeletePayload(null);
      loadLeaveList();
    } else {
      addToast({ type: 'error', title: 'Failed to delete leave', message: responseEither.left.message });
    }
  };

  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: 'LeaveType',
        label: 'Leave Type',
        width: '180px',
      },
      {
        key: 'StartDate',
        label: 'Start Date',
          render: (value) => formatDateDisplay(value as string),
      },
      {
        key: 'EndDate',
        label: 'End Date',
          render: (value) => formatDateDisplay(value as string),
      },
      {
        key: 'NoOfDays',
        label: 'No Of Days',
        width: '120px',
      },
      {
        key: 'Reason',
        label: 'Reason',
        width: '240px',
      },
      {
        key: 'CreatedDate',
        label: 'Created On',
          render: (value) => formatDateDisplay(value as string),
        width: '160px',
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '160px',
        render: (_value, row) => (
          <div className="flex gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
            const currentRow = row as LeaveData;
            setEditingData(currentRow);
                setFormData({
              LeaveId: currentRow.LeaveId,
              Uniquekey: currentRow.Uniquekey,
              LeaveTypeMasterId: currentRow.LeaveTypeMasterId,
              StartDate: currentRow.StartDate,
              EndDate: currentRow.EndDate,
              StartDateLeaveDuration: currentRow.StartDateLeaveDuration,
              EndDateLeaveDuration: currentRow.EndDateLeaveDuration,
              Reason: currentRow.Reason,
                  LeaveDocumentFiles: [],
                });
                setErrors({});
                setIsAddUpdateModalOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                const currentRow = row as LeaveData;
                setDeletePayload({ LeaveId: currentRow.LeaveId, Uniquekey: currentRow.Uniquekey });
                setIsDeleteDialogOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const leaveListForTable = useMemo(() => leaveList ?? [], [leaveList]);

  const paginationInfo: PaginationInfo = {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalRecords: pagination.totalRecords,
    pageSize: pagination.pageSize,
    onPageChange: (page: number) => setPagination({ currentPage: page }),
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>
          <div />
        </Loader>

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={() => {
            setSearchTerm('');
            debouncedSearch('');
          }}
          // ADD
          isShowAddButton={canAction}
          addTitle="Add Leave"
          onAdd={() => {
            setEditingData(null);
            setFormData(initialFormState());
            setErrors({});
            setIsAddUpdateModalOpen(true);
          }}
          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={() => {
            loadLeaveList();
          }}
          onExportPdf={() => {
            loadLeaveList();
          }}
        />

        <DataTable
          data={leaveListForTable}
          columns={columns}
          pagination={paginationInfo}
          emptyMessage="No leave found"
          fixedHeight
          recordsPerPage={pagination.pageSize}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={(info) => setSortInfo(info)}
          loading={isLoading}
        />

        <DateRangePickerModal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false);
            setEditingData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          onConfirm={(startDate, endDate) => {
            setFormData((prev) => ({ ...prev, StartDate: startDate, EndDate: endDate }));
            // Clear date errors if dates are set
            if (startDate && endDate) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.StartDate;
                delete newErrors.EndDate;
                return newErrors;
              });
            }
            // Call handleAddUpdate with the new dates
            void handleAddUpdate(startDate, endDate);
          }}
          startDate={formData.StartDate || null}
          endDate={formData.EndDate || null}
          title={editingData ? 'Update Leave' : 'Add Leave'}
          confirmText={editingData ? 'Update Leave' : 'Save Leave'}
          cancelText="Cancel"
          loading={isLoading}
          showSummary={false}
          renderChildren={({ startDate, endDate, onSelectField, onClearField }) => (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={startDate ? formatDate_dd_mm_yyyy(startDate) : ''}
                    placeholder="Select start date"
                    onClick={() => onSelectField?.('start')}
                    className="cursor-pointer"
                  />
                  {startDate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onClearField?.('start')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {errors.StartDate && <p className="text-sm text-red-600 mt-1">{errors.StartDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={endDate ? formatDate_dd_mm_yyyy(endDate) : ''}
                    placeholder="Select end date"
                    onClick={() => onSelectField?.('end')}
                    className="cursor-pointer"
                  />
                  {endDate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onClearField?.('end')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {errors.EndDate && <p className="text-sm text-red-600 mt-1">{errors.EndDate}</p>}
              </div>

              <SingleSelectDropdownWithPagination
                label="Leave Type"
                title="Select Leave Type"
                size="lg"
                required
                dataFetchCallBack={async (pageNumber: number, params?: { value?: string }) => fetchLeaveTypeMasterDropdown(pageNumber, params)}
                onSelected={(item) => handleFieldChange('LeaveTypeMasterId', Number(item.value))}
                initialValue={
                  formData.LeaveTypeMasterId
                    ? {
                        label: editingData?.LeaveType || String(formData.LeaveTypeMasterId),
                        value: String(formData.LeaveTypeMasterId),
                      }
                    : null
                }
                error={errors.LeaveTypeMasterId}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleSelectDropdownWithPagination
                  label="Start Date Duration"
                  title="Select Duration"
                  size="lg"
                  required
                  dataFetchCallBack={async () => ({
                    totalNumberOfRecord: LEAVE_DURATION_OPTIONS.length,
                    itemList: LEAVE_DURATION_OPTIONS,
                  })}
                  onSelected={(item) => handleFieldChange('StartDateLeaveDuration', item.value)}
                  initialValue={
                    formData.StartDateLeaveDuration
                      ? {
                          label:
                            LEAVE_DURATION_OPTIONS.find((d) => d.value === formData.StartDateLeaveDuration)?.label ||
                            formData.StartDateLeaveDuration,
                          value: formData.StartDateLeaveDuration,
                        }
                      : null
                  }
                  error={errors.StartDateLeaveDuration}
                />

                <SingleSelectDropdownWithPagination
                  label="End Date Duration"
                  title="Select Duration"
                  size="lg"
                  required
                  dataFetchCallBack={async () => ({
                    totalNumberOfRecord: LEAVE_DURATION_OPTIONS.length,
                    itemList: LEAVE_DURATION_OPTIONS,
                  })}
                  onSelected={(item) => handleFieldChange('EndDateLeaveDuration', item.value)}
                  initialValue={
                    formData.EndDateLeaveDuration
                      ? {
                          label:
                            LEAVE_DURATION_OPTIONS.find((d) => d.value === formData.EndDateLeaveDuration)?.label ||
                            formData.EndDateLeaveDuration,
                          value: formData.EndDateLeaveDuration,
                        }
                      : null
                  }
                  error={errors.EndDateLeaveDuration}
                />
              </div>

              <Input
                label="Total Days (auto)"
                value={computeNoOfDays(
                  startDate || undefined,
                  endDate || undefined,
                  formData.StartDateLeaveDuration || undefined,
                  formData.EndDateLeaveDuration || undefined,
                ).toString()}
                readOnly
              />

              <TextArea
                label="Reason"
                required
                value={formData.Reason || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('Reason', e.target.value)}
                error={errors.Reason}
                placeholder="Enter reason"
                rows={3}
              />

              <MultiFilePicker
                label="Leave Documents"
                value={formData.LeaveDocumentFiles || []}
                onChange={(files) => handleFieldChange('LeaveDocumentFiles', files)}
              />
            </div>
          )}
        />

        <ConfirmationDialogBox
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeletePayload(null);
          }}
          onConfirm={handleDelete}
          title="Delete Leave"
          message="Are you sure you want to delete this leave?"
          loading={isLoading}
        />
      </div>
    </>
  );
};

export default Leave;

