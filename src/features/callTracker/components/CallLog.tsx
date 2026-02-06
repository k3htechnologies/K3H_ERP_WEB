import { useCallback, useEffect, useMemo, useState } from "react";
import type { CallLogData, DeleteCallLogRequest, FilterWithPaginationCallLogRequest, UpdateCallLogRequest } from "@/features/callTracker/models/CallLogModel";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import usePagination from "@/core/hooks/usePagination";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { callLogService } from "@/features/callTracker/services/CallLogService";
import * as E from 'fp-ts/Either';
import { Edit, Trash2 } from "lucide-react";
import { Button, Input } from "@/ui/components/forms";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { getCallTrackerStatuscolor } from "@/features/callTracker/utils/Status";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
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

const initialFormState = (): UpdateCallLogRequest => ({
    CallLogId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    RescheduleDate: '',
    Remark: '',
});

export default function CallLog() {

    // STATE
    const [callLogList, setCallLogList] = useState<CallLogData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();

    //DELETE CALL LOG DATA
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteCallLogData, setDeleteCallLogData] = useState<CallLogData | null>(null)

    // EDIT CALL LOG DATA
    const [editingCallLogData, setEditingCallLogData] = useState<CallLogData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<UpdateCallLogRequest>(() => initialFormState());

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeCallLogColumnsModal, setIsShowCustomizeCallLogColumnsModal] = useState(false);

    //#region MENU PERMISSIONS
    const { canExport, canAction } = useMenuPermissions();
    //#endregion

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    // TOAST
    const { addToast } = useToast();

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    //#region DATA LOADING | FETCH |  LOAD | SEARCH
    const loadCallLogData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCallLogRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    CallLogId: filterParams.CallLogId ? Number(filterParams.CallLogId) : undefined,
                    ProjectId: Number(projectId),
                    Name: searchText?.trim() || undefined,
                    MobileNumber: filterParams.MobileNumber ? Number(filterParams.MobileNumber) : undefined,
                    SortBy: getSortByParam(sort ?? null, CallLogColumns),
                };

                const response = await callLogService.apiCallPullCallLog(params);

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
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadCallLogData(1, filters, sortInfo, searchTerm);
    }, [projectId]);
    //#endregion

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingCallLogData) {
                setFormData({
                    CallLogId: editingCallLogData.CallLogId ?? 0,
                    Uniquekey: editingCallLogData.Uniquekey ?? initialFormState().Uniquekey,
                    Remark: editingCallLogData.Remark ?? '',
                    RescheduleDate: editingCallLogData.RescheduleDate ?? '',
                    ProjectId: Number(projectId),
                });
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingCallLogData, projectId]);
    //#endregion

    //#region SEARCH HANDLERS
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadCallLogData(1, filters, sortInfo, value)
    };

    //#region CLEAR HANDLERS
    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadCallLogData(1, filters, sortInfo, '');
    }

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadCallLogData(page, filters, sortInfo, searchTerm);
    };
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadCallLogData(1, filters, sort, searchTerm);
    }, [searchTerm]);
    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportCallLog = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCallLogRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    Name: filters.Name?.trim() || undefined,
                    ProjectId: Number(projectId),
                    SortBy: getSortByParam(sortInfo ?? null, CallLogColumns),
                    ExportType: exportType
                };

                const response = await callLogService.apiCallPullCallLog(params);

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
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: CallLogData) => {
        setDeleteCallLogData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    const handleFieldChange = (field: keyof UpdateCallLogRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //#region EDIT CALL LOG
    const handleEditCallLog = useCallback((row: CallLogData) => {
        setEditingCallLogData({
            ...row,
            Name: row.Name
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

        if (!formData.RescheduleDate) {
            newErrors.RescheduleDate = "Reschedule Date is required";
        }

        if (editingCallLogData?.CallDate && formData.RescheduleDate && !isToDateGreaterOrEqualFromDate(editingCallLogData.CallDate,
            formData.RescheduleDate)
        ) {
            newErrors.RescheduleDate =
                "Reschedule Date must be After Call Date";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    // PUSH FORM DATA
    const PushCallLogFormData = (): UpdateCallLogRequest => {
        return {
            CallLogId: formData.CallLogId,
            Uniquekey: formData.Uniquekey,
            Remark: formData.Remark,
            RescheduleDate: formData.RescheduleDate,
            ProjectId: Number(projectId),
        };
    };

    // UPDATE CALL LOG DATA
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

                const response = await callLogService.apiCallUpdateCallLog(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.CallLogId === 0;

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
                                item.CallLogId === formData.CallLogId
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
    //#endregion

    //#region CALL LOG TABLE COLUMNS
    const CallLogColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'CallerName',
            label: 'Sales Executive',
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
            key: 'ReceiverName',
            label: 'Receiver Name',
            width: '20',
            sortable: true,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'MobileNumber',
            label: 'Phone Number',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
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
            key: 'RescheduleDate',
            label: 'Reschedule Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
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
            key: 'Status',
            label: 'Status',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => {
                const { bg, text } = getCallTrackerStatuscolor(value);

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
            key: 'Remark',
            label: 'Remark',
            width: '15',
            sortable: false,
            align: 'center',
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
            render: (_value, row) => (
                <div className="flex items-center justify-center">
                    {canAction && (
                        <>
                            <Button
                                color="transparent"
                                size="sm"
                                style={{
                                    color: 'blue',
                                    padding: '0px 8px'
                                }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleEditCallLog(row)
                                }}
                                leftIcon={<Edit className="h-4 w-4" />}
                            />

                            <Button
                                color="transparent"
                                size="sm"
                                style={{
                                    color: 'red',
                                    padding: '0px 8px'
                                }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleConfirmationDialogBoxOpen(row)
                                }}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                            />
                        </>
                    )}
                </div>
            )
        },

    ], [canAction, handleEditCallLog, handleConfirmationDialogBoxOpen])
    //#endregion

    //#region CALL LOG COLUMN CUSTOMIZATION
    const requiredCallLogColumnKeys: string[] = ['CallerName', 'Actions'];

    const allCallLogColumnKeys: string[] = CallLogColumns.map(c => c.key);

    const [selectedCallLogColumnKeys, setSelectedCallLogColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getCallLogTableColumns?.();

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
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadCallLogData(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };
    //#endregion

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadCallLogData(1, {}, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region CALL LOG TABLE PAGINATION INFO
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
    //#endregion

    //#region DELETE CALL LOG 
    const handleDeleteCallLog = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteCallLogData) return;

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteCallLogRequest = {

                    CallLogId: deleteCallLogData.CallLogId || 0,

                    Uniquekey: deleteCallLogData.Uniquekey || "",

                    ProjectId: deleteCallLogData.ProjectId || 0
                };

                const response = await callLogService.apiCallDeleteCallLog(params);

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
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Receiver Name"
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

            {/* DATA TABLE */}

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

            {/* CALL LOG CUSTOMIZE COLUMNS MODAL */}

            <CustomizeColumnsModal
                isOpen={isShowCustomizeCallLogColumnsModal}
                onClose={() => setIsShowCustomizeCallLogColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredCallLogColumnKeys])
                    );
                    setSelectedCallLogColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeCallLogTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={CallLogColumns}
                selectedKeys={selectedCallLogColumnKeys}
                requiredKeys={requiredCallLogColumnKeys}
                title="Customize Table Columns"
            />

            {/* FILTER MODAL FOR CALL LOG */}

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
                        <Input
                            type="text"
                            label="Receiver Name"
                            value={tempFilters?.Name ?? ''}
                            onChange={e => handleFilterChange('Name', e.target.value)}
                            placeholder="Enter Receiver Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Mobile Number"
                            value={tempFilters?.MobileNumber ?? ''}
                            onChange={e => handleFilterChange('MobileNumber', e.target.value)}
                            placeholder="Enter Mobile Number"
                        />
                    </div>

                </div>
            </Modal>

            {/* UPDATE CALL LOG MODAL */}

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
                title={editingCallLogData ? 'Update' : 'Add '}
                onSubmit={handleAddEditCallLog}
                saveText={editingCallLogData ? 'Update ' : 'Add '}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <TextArea
                                label="Remark"
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
                                required
                                error={errors.RescheduleDate}
                            />
                        </div>

                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}

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




