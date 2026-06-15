import { useCallback, useEffect, useMemo, useState } from "react";
import type { CallLogData, DeleteCallLogRequest, FilterWithPaginationCallLogRequest, UpdateCallLogRequest } from "@/features/crmPayTrack/models/CallLogModel";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { callLogService } from "@/features/crmPayTrack/services/CallLogService";
import * as E from 'fp-ts/Either';
import { Edit, Trash2 } from "lucide-react";
import { Button, Input } from "@/ui/components/forms";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { handleExportFile } from "@/core/utils/exportFile";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { CALL_PURPOSE_OPTIONS, CALL_STATUS_OPTIONS } from "@/core/constants";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { CallLogViewModal } from "./CallLogViewModal";
import { getCallStatuscolor } from "@/features/crmPayTrack/utils/Status";

const initialFormState = (): UpdateCallLogRequest => ({
    PayTrackCallLogId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    RescheduleDate: '',
    RegistrationDate: '',
    Remark: '',
    CallStatus: '',
    CallPurpose: '',
    PromiseAmount: null,
});

export const CallLog: React.FC = () => {

    const [callLogList, setCallLogList] = useState<CallLogData[]>([]);
    const [viewCallLogData, setViewCallLogData] = useState<CallLogData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteCallLogData, setDeleteCallLogData] = useState<CallLogData | null>(null)

    const [editingCallLogData, setEditingCallLogData] = useState<CallLogData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<UpdateCallLogRequest>(() => initialFormState());

    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    const [isShowCustomizeCallLogColumnsModal, setIsShowCustomizeCallLogColumnsModal] = useState(false);

    const { canExport, canAction } = useMenuPermissions('/payTrackCallLog');

    const { pagination, setPagination } = usePagination(20);

    const { projectId } = useProject();

    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingApprovalStatus } = listState;

    const { addToast } = useToast();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const loadCallLogData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCallLogRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    PayTrackCallLogId: filterParams.PayTrackCallLogId ? Number(filterParams.PayTrackCallLogId) : undefined,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    ApplicantName: searchText?.trim() || undefined,
                    CallStatus: filterParams.CallStatus || undefined,
                    CallPurpose: filterParams.CallPurpose ? String(filterParams.CallPurpose) : undefined,
                    ApplicantMobileNumber: filterParams.ApplicantMobileNumber ? Number(filterParams.ApplicantMobileNumber) : undefined,
                    RescheduleDateFromDate: filterParams.RescheduleDateFromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.RescheduleDateFromDate) || undefined : undefined,
                    RescheduleDateToDate: filterParams.RescheduleDateToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.RescheduleDateToDate) || undefined : undefined,
                    SortBy: getSortByParam(sort ?? null, CallLogColumns),
                };

                const response = await callLogService.apiCallPullPayTrackCallLog(params);

                if (E.isRight(response)) {

                    setCallLogList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {

                    addToast({ type: 'error', title: response.left.message });

                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Call Log'
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });

        loadCallLogData(1, filters, sortInfo, searchTerm);

    }, [projectId]);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingCallLogData) {
                setFormData({
                    PayTrackCallLogId: editingCallLogData.PayTrackCallLogId ?? 0,
                    Uniquekey: editingCallLogData.Uniquekey ?? initialFormState().Uniquekey,
                    Remark: editingCallLogData.Remark ?? '',
                    RescheduleDate: editingCallLogData.RescheduleDate ?? '',
                    ProjectId: Number(projectId),
                    CallStatus: editingCallLogData.CallStatus ?? '',
                    CallPurpose: editingCallLogData.CallPurpose ?? '',
                    RegistrationDate: editingCallLogData.RegistrationDate ?? '',
                    PromiseAmount: editingCallLogData.PromiseAmount ?? 0,
                });
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingCallLogData, projectId]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadCallLogData(1, filters, sortInfo, value)
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadCallLogData(1, filters, sortInfo, '');
    }

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadCallLogData(page, filters, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadCallLogData(1, filters, sort, searchTerm);
    }, [searchTerm]);

    const handleExportCallLog = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCallLogRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ApplicantName: filters.ApplicantName?.trim() || undefined,
                    ApplicantMobileNumber: filters.ApplicantMobileNumber ? Number(filters.ApplicantMobileNumber) : undefined,
                    BookingId: Number(bookingId),
                    ProjectId: Number(projectId),
                    CallStatus: filters.CallStatus ? String(filters.CallStatus) : undefined,
                    CallPurpose: filters.CallPurpose ? String(filters.CallPurpose) : undefined,
                    RescheduleDateFromDate: filters.RescheduleDateFromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.RescheduleDateFromDate) || undefined : undefined,
                    RescheduleDateToDate: filters.RescheduleDateToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.RescheduleDateToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, CallLogColumns),
                    ExportType: exportType
                };

                const response = await callLogService.apiCallPullPayTrackCallLog(params);

                handleExportFile(response, exportType, 'Call Log', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportCallLogExcel = () => handleExportCallLog('Excel')
    const handleExportCallLogPdf = () => handleExportCallLog('PDF')

    const handleConfirmationDialogBoxOpen = useCallback((row: CallLogData) => {
        setDeleteCallLogData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const handleFieldChange = (field: keyof UpdateCallLogRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleEditCallLog = useCallback((row: CallLogData) => {
        setEditingCallLogData({
            ...row,
            ApplicantName: row.ApplicantName,
            ApplicantMobileNumber: row.ApplicantMobileNumber,
            CallStatus: row.CallStatus,
            CallPurpose: row.CallPurpose,
            Remark: row.Remark,
            RescheduleDate: row.RescheduleDate,
            RegistrationDate: row.RegistrationDate,
            PromiseAmount: row.PromiseAmount,
        })
        setIsAddUpdateModalOpen(true);
    }, [])


    // ============================================================= [VALIDATION FUNCTION] =============================================================================================

    const validateUpdateCallLogForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.Remark || !formData.Remark.trim()) {
            newErrors.Remark = "Remark is required";
        }

        if (!formData.CallStatus || !formData.CallStatus.trim()) {
            newErrors.CallStatus = "Call Status is required";
        }

        if (!formData.CallPurpose || !formData.CallPurpose.trim()) {
            newErrors.CallPurpose = "Call Purpose is required";
        }

        const callingDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(editingCallLogData?.CallDate ? new Date(editingCallLogData.CallDate) : undefined);
        const rescheduleDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.RescheduleDate ? new Date(formData.RescheduleDate) : undefined);

        if (editingCallLogData?.CallDate && formData.RescheduleDate && !isToDateGreaterOrEqualFromDate(callingDate, rescheduleDate)) {
            newErrors.RescheduleDate = "Reschedule Date must be After Call Date";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushCallLogFormData = (): UpdateCallLogRequest => {
        return {
            PayTrackCallLogId: formData.PayTrackCallLogId,
            Uniquekey: formData.Uniquekey,
            Remark: formData.Remark,
            RescheduleDate: formData.RescheduleDate === "" ? null : formData.RescheduleDate,
            ProjectId: Number(projectId),
            CallStatus: formData.CallStatus,
            CallPurpose: formData.CallPurpose,
            RegistrationDate: formData.RescheduleDate === "" ? null : formData.RegistrationDate,
            PromiseAmount: formData.PromiseAmount,
        };
    };

    const handleAddEditCallLog = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateUpdateCallLogForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushCallLogFormData();

                const response = await callLogService.apiCallUpdatePayTrackCallLog(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.PayTrackCallLogId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as CallLogData

                        setCallLogList(prevData => [newRecord, ...prevData]);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {

                        const updatedRecord = response.right.Data[0] as CallLogData;

                        setCallLogList(prevData =>
                            prevData.map(item =>
                                item.PayTrackCallLogId === formData.PayTrackCallLogId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setEditingCallLogData(null);
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
            'Update Call Log'
        )
    };

    const handleViewCallLogDetails = useCallback((row: CallLogData) => {
        setViewCallLogData(row);
        setIsViewModalOpen(true);
    }, []);

    const handleViewModalClose = useCallback(() => {
        setIsViewModalOpen(false);
        setViewCallLogData(null);
    }, [setIsViewModalOpen, setViewCallLogData]);


    const CallLogColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ApplicantType',
            label: 'Applicant Type',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            ),
        },
        {
            key: 'ApplicantName',
            label: 'Applicant Name',
            width: '20',
            sortable: true,
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleViewCallLogDetails(row)}
                />
            ),
        },
        {
            key: 'ApplicantMobileNumber',
            label: 'Mobile Number',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? `+91 ${value}` : '-'
        },
        {
            key: 'CallStatus',
            label: 'Call Status',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => {
                const { bg, text } = getCallStatuscolor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            }
        },
        {
            key: 'CallDate',
            label: 'Call Time',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy_hh_mm(value) : '-'
        },
        {
            key: 'Duration',
            label: 'Duration',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'CallPurpose',
            label: 'Call Purpose',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'RescheduleDate',
            label: 'Reschedule Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
        },

        {
            key: 'RegistrationDate',
            label: 'Registration Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
        },

        {
            key: 'PromiseAmount',
            label: 'Promise Amount',
            width: '15',
            sortable: false,
            align: 'right',
            render: value => value || '0'
        },
        {
            key: 'Remark',
            label: 'Remark',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {

                const isLocked = !canAction || !!row.RescheduleDate || !!row.Remark;

                const isDisabled =
                    isLocked ||
                    bookingApprovalStatus?.toUpperCase() !== 'APPROVED';

                return (
                    <div className="flex items-center justify-center">

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={isDisabled}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (isDisabled) return;
                                handleEditCallLog(row)
                            }}
                            style={{
                                color: isDisabled ? '#9CA3AF' : '',
                                padding: '4px 8px',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                opacity: isDisabled ? 0.5 : 1
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={isDisabled}
                            style={{
                                color: isDisabled ? '#9CA3AF' : 'red',
                                padding: '4px 8px',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                opacity: isDisabled ? 0.5 : 1
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (isDisabled) return;
                                handleConfirmationDialogBoxOpen(row)
                            }}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                        />

                    </div>
                )
            }
        },

    ], [canAction, handleEditCallLog, handleConfirmationDialogBoxOpen, handleViewCallLogDetails])

    const requiredCallLogColumnKeys: string[] = ['CallerName', 'Actions'];

    const allCallLogColumnKeys: string[] = CallLogColumns.map(c => c.key);

    const [selectedCallLogColumnKeys, setSelectedCallLogColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getPayTrackCallLogTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredCallLogColumnKeys]));

                return withRequired.filter(k => allCallLogColumnKeys.includes(k));
            }
        } catch { }
        return allCallLogColumnKeys;
    });

    useEffect(() => {
        setSelectedCallLogColumnKeys(prev => Array.from(new Set([...prev, ...requiredCallLogColumnKeys])).filter(k => allCallLogColumnKeys.includes(k)));
    }, [CallLogColumns.length])

    const visibleCallLogColumns = useMemo(
        () => CallLogColumns.filter(col => selectedCallLogColumnKeys.includes(col.key)),
        [CallLogColumns, selectedCallLogColumnKeys]
    );

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadCallLogData(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadCallLogData(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const CallLogPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const CallLogForTable = useMemo(() => callLogList, [callLogList]);

    const handleDeleteCallLog = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteCallLogData) return;

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteCallLogRequest = {

                    PayTrackCallLogId: deleteCallLogData.PayTrackCallLogId || 0,

                    Uniquekey: deleteCallLogData.Uniquekey || "",

                    ProjectId: deleteCallLogData.ProjectId || 0
                };

                const response = await callLogService.apiCallDeletePayTrackCallLog(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (callLogList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadCallLogData(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteCallLogData(null);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Call Log"
        );
    };

    return (
        <div className="pt-5">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Applicant Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizeCallLogColumnsModal(true);
                }}

                // EXPORT
                isShowExportButton={canExport && CallLogForTable.length > 0}
                onExportExcel={handleExportCallLogExcel}
                onExportPdf={handleExportCallLogPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={CallLogForTable}
                columns={visibleCallLogColumns}
                pagination={CallLogPaginationInfo}
                emptyMessage="No Call Log Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />


            <CustomizeColumnsModal
                isOpen={isShowCustomizeCallLogColumnsModal}
                onClose={() => setIsShowCustomizeCallLogColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredCallLogColumnKeys])
                    );
                    setSelectedCallLogColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storePayTrackCallLogTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={CallLogColumns}
                selectedKeys={selectedCallLogColumnKeys}
                requiredKeys={requiredCallLogColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Call Log"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-6">
                    <div>
                        <SinglePageSelection
                            label="Call Status"
                            placeholder="Select Call Status"
                            required
                            value={tempFilters.CallStatus}
                            onChange={(e) => handleFilterChange("CallStatus", String(e))}
                            options={CALL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                            error={errors.CallStatus} />
                    </div>

                    <div>

                        <SinglePageSelection
                            label="Call Purpose"
                            placeholder="Select Call Purpose"
                            required
                            value={tempFilters.CallPurpose}
                            onChange={(e) => handleFilterChange("CallPurpose", String(e))}
                            options={CALL_PURPOSE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
                    </div>
                    <div>
                        <Input
                            type="text"
                            label="Applicant Name"
                            value={tempFilters?.ApplicantName ?? ''}
                            onChange={e => handleFilterChange('ApplicantName', e.target.value)}
                            placeholder="Enter Applicant Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Applicant Mobile Number"
                            value={tempFilters?.ApplicantMobileNumber ?? ''}
                            onChange={e => handleFilterChange('ApplicantMobileNumber', e.target.value)}
                            placeholder="Enter Applicant Mobile Number"
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label='Reschedule From Date'
                            value={tempFilters.RescheduleDateFromDate || ''}
                            onChange={(value) => handleFilterChange('RescheduleDateFromDate', value || '')}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='Reschedule To Date'
                            value={tempFilters.RescheduleDateToDate || ''}
                            onChange={(value) => handleFilterChange('RescheduleDateToDate', value || '')}
                        />
                    </div>

                </div>
            </Modal>

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingCallLogData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingCallLogData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title={editingCallLogData ? 'Update Call Log' : 'Add Call Log'}
                onSubmit={handleAddEditCallLog}
                saveText={bookingApprovalStatus?.toUpperCase() === 'APPROVED' ? editingCallLogData ? 'Update ' : 'Add ' : ""}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        <div>
                            <SinglePageSelection
                                label="Call Status"
                                placeholder="Select Call Status"
                                required
                                value={formData.CallStatus}
                                onChange={(e) => handleFieldChange("CallStatus", String(e))}
                                options={CALL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.CallStatus} />
                        </div>

                        <div>

                            <SinglePageSelection
                                label="Call Purpose"
                                placeholder="Select Call Purpose"
                                required
                                value={formData.CallPurpose}
                                onChange={(e) => handleFieldChange("CallPurpose", String(e))}
                                options={CALL_PURPOSE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.CallPurpose} />
                        </div>
                        <div>
                            <TextArea
                                label="Remark"
                                required
                                className='thin-scroll'
                                value={formData.Remark ?? ""}
                                placeholder="Enter Remark"
                                onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                error={errors.Remark} />
                        </div>

                        <div>
                            <DatePickerInput
                                label="Reschedule Date"
                                value={formatDate_dd_mm_yyyy(formData.RescheduleDate)}
                                onChange={(val) => handleFieldChange('RescheduleDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                error={errors.RescheduleDate}
                            />
                        </div>
                        <div>
                            <DatePickerInput
                                label="Registration Date"
                                value={formatDate_dd_mm_yyyy(formData.RegistrationDate)}
                                onChange={(val) => handleFieldChange('RegistrationDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                error={errors.RegistrationDate}
                            />
                        </div>
                        <div>
                            <Input
                                label="Promise Amount (₹)"
                                placeholder="Enter Promise Amount (₹)"
                                value={formData.PromiseAmount || ""}
                                onChange={(e) => {
                                    const val = filterNumbersWithDecimal(e.target.value);
                                    if (val !== null) {
                                        const promiseAmount = filterNumbersWithDecimal(e.target.value);

                                        handleFieldChange("PromiseAmount", promiseAmount);
                                    }
                                }}

                                rightIcon="₹"
                                error={errors.PromiseAmount}
                            />

                        </div>

                    </div>
                </div>
            </Modal>

            <CallLogViewModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                data={viewCallLogData}
                canAction={canAction}
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setDeleteCallLogData(null);
                    setIsConfirmationDialogBoxOpen(false);
                }}
                onConfirm={handleDeleteCallLog}
                loading={isLoading}
                pageName="Call Log"
            />
        </div>
    );
};
export default CallLog;
