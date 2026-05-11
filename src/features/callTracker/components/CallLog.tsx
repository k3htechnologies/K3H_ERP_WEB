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
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { fetchVillageDropdown } from "@/features/technical/villageDropDown";
import { BUDGET_TYPE_OPTIONS, CALL_STATUS_OPTIONS, COMMERCIAL_FLAT_CONFIGURATION, REQUIREMENT_TYPE_OPTIONS, RESIDENTIAL_FLAT_CONFIGURATION } from "@/core/constants";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";

const initialFormState = (): UpdateCallLogRequest => ({
    CallLogId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    RescheduleDate: '',
    Remark: '',
    Status: '',
    SiteVisitProposedDate: null,
    Budget: '',
    Requirement: '',
    RequirementType: '',
    VillageMasterId: ''
});

export const CallLog: React.FC = () => {

    const [callLogList, setCallLogList] = useState<CallLogData[]>([]);
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

    const { canExport, canAction } = useMenuPermissions();

    const { pagination, setPagination } = usePagination(20);

    const { projectId } = useProject();
    const { addToast } = useToast();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [selectedVillageValues, setSelectedVillageValues] = useState<string | number | null>(null);

    const villageDropdown = useMultiSelectDropdown({
        value: selectedVillageValues,
        fetchCallback: fetchVillageDropdown,
        autoFetchOptions: true,
    });

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
                    RescheduleDateFromDate: filterParams.RescheduleDateFromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.RescheduleDateFromDate) || undefined : undefined,
                    RescheduleDateToDate: filterParams.RescheduleDateToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.RescheduleDateToDate) || undefined : undefined,
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

    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadCallLogData(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingCallLogData) {
                setFormData({
                    CallLogId: editingCallLogData.CallLogId ?? 0,
                    Uniquekey: editingCallLogData.Uniquekey ?? initialFormState().Uniquekey,
                    Remark: editingCallLogData.Remark ?? '',
                    RescheduleDate: editingCallLogData.RescheduleDate ?? '',
                    ProjectId: Number(projectId),
                    Status: editingCallLogData.Status ?? '',
                    SiteVisitProposedDate: editingCallLogData.SiteVisitProposedDate ?? '',
                    Budget: editingCallLogData.Budget ?? '',
                    Requirement: editingCallLogData.Requirement ?? '',
                    RequirementType: editingCallLogData.RequirementType ?? '',
                    VillageMasterId: editingCallLogData.VillageMasterId ?? ''
                });
                setSelectedVillageValues(editingCallLogData.VillageMasterId || "");

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
                    Name: filters.Name?.trim() || undefined,
                    RescheduleDateFromDate: filters.RescheduleDateFromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.RescheduleDateFromDate) || undefined : undefined,
                    RescheduleDateToDate: filters.RescheduleDateToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.RescheduleDateToDate) || undefined : undefined,
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

        const callingDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(editingCallLogData?.CallDate ? new Date(editingCallLogData.CallDate) : undefined);
        const rescheduleDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.RescheduleDate ? new Date(formData.RescheduleDate) : undefined);

        if (!formData.Status) {
            newErrors.Status = "Status is required";
        }

        if (editingCallLogData?.CallDate && formData.RescheduleDate && !isToDateGreaterOrEqualFromDate(callingDate, rescheduleDate)) {
            newErrors.RescheduleDate = "Reschedule Date must be After Call Date";
        }

        if (formData.Requirement?.trim() !== "" && formData.RequirementType?.trim() === "") {
            newErrors.RequirementType = `${formData.Requirement} Type is required`;
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushCallLogFormData = (): UpdateCallLogRequest => {
        return {
            CallLogId: formData.CallLogId,
            Uniquekey: formData.Uniquekey,
            Remark: formData.Remark,
            RescheduleDate: formData.RescheduleDate === "" ? null : formData.RescheduleDate,
            ProjectId: Number(projectId),
            Status: formData.Status,
            SiteVisitProposedDate: formData.SiteVisitProposedDate === "" ? null : formData.SiteVisitProposedDate,
            Budget: formData.Budget ?? "",
            Requirement: formData.Requirement ?? "",
            RequirementType: formData.RequirementType ?? "",
            VillageMasterId: formData.VillageMasterId ?? ""
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
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'MobileNumber',
            label: 'Mobile Number',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? `+91 ${value}` : '-'
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
            key: 'VillageName',
            label: 'Location',
            width: '30',
            fixed: 'left',
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Budget',
            label: 'Budget (In CR)',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Requirement',
            label: 'Requirement',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'RequirementType',
            label: 'Requirement Type',
            width: '14',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'SiteVisitProposedDate',
            label: 'Site Visit Proposed Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
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

                return (
                    <div className="flex items-center justify-center">

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={isLocked}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (isLocked) return;
                                handleEditCallLog(row)
                            }}
                            style={{
                                color: isLocked ? '#9CA3AF' : '',
                                padding: '4px 8px',
                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                opacity: isLocked ? 0.5 : 1
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={isLocked}
                            style={{
                                color: isLocked ? '#9CA3AF' : 'red',
                                padding: '4px 8px',
                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                opacity: isLocked ? 0.5 : 1
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (isLocked) return;
                                handleConfirmationDialogBoxOpen(row)
                            }}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                        />

                    </div>
                )
            }
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

    return (
        <div>

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
                title={editingCallLogData ? 'Update Call Log' : 'Add Call Log'}
                onSubmit={handleAddEditCallLog}
                saveText={editingCallLogData ? 'Update ' : 'Add '}
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
                                value={formData.Status ?? ""}
                                onChange={(e) => handleFieldChange("Status", String(e))}
                                options={CALL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.Status} />
                        </div>
                        <div>

                            <SinglePageSelection
                                label="Budget (In Cr)"
                                placeholder="Select Budget"
                                value={formData.Budget ?? ""}
                                onChange={(value) => handleFieldChange("Budget", value)}
                                options={BUDGET_TYPE_OPTIONS.map((opt) => ({
                                    label: opt.name,
                                    value: opt.id,
                                }))}
                                error={errors.Budget}
                            />

                        </div>
                        <div>
                            <SinglePageSelection
                                label="Requirement"
                                placeholder="Select Requirement"
                                value={formData.Requirement ?? ""}

                                onChange={(item) => {

                                    if (!item) {
                                        handleFieldChange("Requirement", "");
                                        handleFieldChange("RequirementType", "");
                                        return;
                                    }

                                    handleFieldChange("Requirement", item)
                                    handleFieldChange("RequirementType", "");

                                }}

                                options={REQUIREMENT_TYPE_OPTIONS.map((opt) => ({
                                    label: opt.name,
                                    value: opt.id,
                                }))}
                                error={errors.Requirement}
                            />
                        </div>

                        {formData.Requirement && (
                            <div>
                                <SinglePageSelection
                                    label={formData.Requirement === "Residential" ? "Residential Type" : formData.Requirement === "Commercial" ? "Commercial Type" : "Commercial Leasing Type"}
                                    placeholder={`Select ${formData.Requirement === "Residential" ? "Residential Type" : formData.Requirement === "Commercial" ? "Commercial Type" : "Commercial Leasing Type"}`}

                                    value={formData.RequirementType ?? ""}
                                    onChange={(value) => handleFieldChange("RequirementType", value)}
                                    options={
                                        formData.Requirement === "Residential"
                                            ? RESIDENTIAL_FLAT_CONFIGURATION.map((opt) => ({
                                                label: opt.name,
                                                value: opt.id,
                                            }))
                                            : formData.Requirement === "Commercial" || formData.Requirement === "Commercial Leasing"
                                                ? COMMERCIAL_FLAT_CONFIGURATION.map((opt) => ({
                                                    label: opt.name,
                                                    value: opt.id,
                                                }))
                                                : []
                                    }
                                    error={errors.RequirementType}
                                />
                            </div>
                        )}

                        <div>
                            <MultiSelectPagination
                                label="Location"
                                dataFetchCallBack={fetchVillageDropdown}

                                selectedValues={villageDropdown.selectedValues}
                                options={villageDropdown.initialOptions}
                                onChange={(values) => {
                                    const { idsString } = villageDropdown.handleChange(values);
                                    handleFieldChange("VillageMasterId", idsString || null);
                                }}
                                error={errors.VillageMasterId}
                            />
                        </div>

                        <div>
                            <DatePickerInput
                                label="Site Visit Proposed Date"
                                value={formatDate_dd_mm_yyyy(formData.SiteVisitProposedDate)}
                                onChange={(val) => handleFieldChange('SiteVisitProposedDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                error={errors.SiteVisitProposedDate}
                            />
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
export default CallLog;
