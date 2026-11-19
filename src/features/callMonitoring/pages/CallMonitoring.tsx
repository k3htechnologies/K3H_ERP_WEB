import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import usePagination from "@/core/hooks/usePagination";
import { runApiWithLoader } from "@/core/utils";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useCallback, useEffect, useMemo, useState } from "react"
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { getCallTrackerStatuscolor } from "@/features/callTracker/utils/Status";
import { handleExportFile } from "@/core/utils/exportFile";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import { Edit, Trash2 } from "lucide-react";
import { Button, Input } from "@/ui/components/forms";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import { filterNumbers } from "@/core/utils/fileValidation";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { CALL_PURPOSE_OPTIONS, CALL_STATUS_OPTIONS } from "@/core/constants";
import { TextArea } from "@/ui/components/forms/Textarea";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import type { CallMonitoringData, DeleteCallMonitoring, FilterWithPaginationCallMonitoring, UpdateCallMonitoring } from "@/features/callMonitoring/models/CallMonitoringModel";
import { callMonitoringService } from "@/features/callMonitoring/services/CallMonitoringService";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

const initialFormState = (): UpdateCallMonitoring => ({
    CallMonitoringId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    RescheduleDate: '',
    Remark: '',
    CallStatus: '',
    CallPurpose: '',
});

type CallMonitoringsProps = {
    pageName: string;
    id: number
};

export const CallMonitoring: React.FC<CallMonitoringsProps> = ({ pageName, id }) => {

    const [callMonitoringList, setCallMonitoringList] = useState<CallMonitoringData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const { projectId } = useProject();
    const [sortInfo, setSortInfo] = useState<SortInfo>();

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteCallMonitoring, setDeleteCallMonitoring] = useState<CallMonitoringData | null>(null)

    const [editingCallMonitoring, setEditingCallMonitoring] = useState<CallMonitoringData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<UpdateCallMonitoring>(() => initialFormState());

    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    const [isShowCustomizeCallMonitoringsColumnsModal, setIsShowCustomizeCallMonitoringsColumnsModal] = useState(false);

    const { canExport, canAction } = useMenuPermissions();
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    useEffect(() => {
        if (!projectId) return
        setPagination({ currentPage: 1 });
        loadCallMonitoring(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    const loadCallMonitoring = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCallMonitoring = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    Id: id,
                    PageName: pageName,
                    CallMonitoringId: filterParams.CallMonitoringId ? Number(filterParams.CallMonitoringId) : undefined,
                    Name: searchText || filterParams.Name?.trim() || undefined,
                    CallPurpose: filterParams.CallPurpose?.trim() || undefined,
                    CallStatus: filterParams.CallStatus?.trim() || undefined,
                    MobileNumber: filterParams.MobileNumber ? (filterParams.MobileNumber) : undefined,
                    RescheduleDateFromDate: filterParams.RescheduleDateFromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.RescheduleDateFromDate) || undefined : undefined,
                    RescheduleDateToDate: filterParams.RescheduleDateToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.RescheduleDateToDate) || undefined : undefined,
                    SortBy: getSortByParam(sort ?? null, CallMonitoringColumn)
                }

                const response = await callMonitoringService.apiCallPullCallMonitoring(params);

                if (E.isRight(response)) {

                    setCallMonitoringList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    })
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
    }, [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingCallMonitoring) {
                setFormData({
                    CallMonitoringId: editingCallMonitoring.CallMonitoringId ?? 0,
                    Uniquekey: editingCallMonitoring.Uniquekey ?? initialFormState().Uniquekey,
                    Remark: editingCallMonitoring.Remark ?? '',
                    RescheduleDate: editingCallMonitoring.RescheduleDate ?? '',
                    ProjectId: Number(projectId),
                    CallStatus: editingCallMonitoring.CallStatus ?? '',
                    CallPurpose: editingCallMonitoring.CallPurpose ?? ""
                });
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingCallMonitoring, projectId]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadCallMonitoring(1, filters, sort, searchTerm)
    }, [searchTerm]);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadCallMonitoring(page, filters, sortInfo, searchTerm)
    }

    const handleConfirmationDialogBoxOpen = useCallback((row: CallMonitoringData) => {
        setDeleteCallMonitoring(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const handleFieldChange = (field: keyof UpdateCallMonitoring, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleEditCallMonitoring = useCallback((row: CallMonitoringData) => {
        setEditingCallMonitoring({
            ...row,
            Name: row.Name
        })
        setIsAddUpdateModalOpen(true);
    }, [])

    const ValidateUpdateCallMonitoringForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {

        const newErrors: { [key: string]: string } = {};

        if (!formData.Remark || !formData.Remark.trim()) {
            newErrors.Remark = "Remark is required";
        }

        const callingDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(editingCallMonitoring?.CallDate ? new Date(editingCallMonitoring.CallDate) : undefined);
        const rescheduleDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.RescheduleDate ? new Date(formData.RescheduleDate) : undefined);

        if (!formData.CallStatus) {
            newErrors.CallStatus = "Status is required";
        }

        if (!formData.CallPurpose) {
            newErrors.CallPurpose = "Call Purpose is required";
        }

        if (editingCallMonitoring?.CallDate && formData.RescheduleDate && !isToDateGreaterOrEqualFromDate(callingDate, rescheduleDate)) {
            newErrors.RescheduleDate = "Reschedule Date must be After Call Date";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushCallMonitoringFormData = (): UpdateCallMonitoring => {
        return {
            CallMonitoringId: formData.CallMonitoringId,
            Uniquekey: formData.Uniquekey,
            Remark: formData.Remark,
            RescheduleDate: formData.RescheduleDate === "" ? null : formData.RescheduleDate,
            ProjectId: Number(projectId),
            CallStatus: formData.CallStatus,
            CallPurpose: formData.CallPurpose
        };
    };

    const handleAddEditCallMonitoring = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({});

        const validation = ValidateUpdateCallMonitoringForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushCallMonitoringFormData();

                const response = await callMonitoringService.apiCallUpdateCallMonitoring(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.CallMonitoringId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as CallMonitoringData

                        setCallMonitoringList(prevData => [newRecord, ...prevData]);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    } else {

                        const updatedRecord = response.right.Data[0] as CallMonitoringData;

                        setCallMonitoringList(prevData =>
                            prevData.map(item =>
                                item.CallMonitoringId === formData.CallMonitoringId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setEditingCallMonitoring(null);
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

    const CallMonitoringColumn = useMemo<TableColumn[]>(() => [
        {
            key: 'Name',
            label: 'Name',
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
            key: "MobileNumber",
            label: "Mobile Number",
            width: "15",
            sortable: false,
            align: "center",
            render: (value) => `+91 ${value}` || ""
        },
        {
            key: 'CallStatus',
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
            key: 'CallDate',
            label: 'Call Time',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy_hh_mm(value) : '-'
        },
        {
            key: "Duration",
            label: "Duration",
            sortable: false,
            width: "15",
            align: "center",
            render: value => value || ""
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
            key: "CallPurpose",
            label: "Call Purpose",
            sortable: false,
            width: "15",
            align: "center",
            render: value => value || ""
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

                const isEditDelete = !!row.CallStatus?.trim();

                return (
                    <div className="flex items-center justify-center">

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={isEditDelete}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (isEditDelete) return;
                                handleEditCallMonitoring(row)
                            }}
                            style={{
                                color: isEditDelete ? '#9CA3AF' : '',
                                padding: '4px 8px',
                                cursor: isEditDelete ? 'not-allowed' : 'pointer',
                                opacity: isEditDelete ? 0.5 : 1
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={isEditDelete}
                            style={{
                                color: isEditDelete ? '#9CA3AF' : 'red',
                                padding: '4px 8px',
                                cursor: isEditDelete ? 'not-allowed' : 'pointer',
                                opacity: isEditDelete ? 0.5 : 1
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (isEditDelete) return;
                                handleConfirmationDialogBoxOpen(row)
                            }}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                        />

                    </div>
                )
            }
        },

    ], [canAction, handleEditCallMonitoring, handleConfirmationDialogBoxOpen])

    const requiredCallMonitoringColumnKeys: string[] = ['Name', 'Actions'];

    const allCallMonitoringColumnKeys: string[] = CallMonitoringColumn.map(c => c.key);

    const [selectedCallMonitoringColumnKeys, setSelectedCallMonitoringColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getCallMonitoringTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredCallMonitoringColumnKeys]));

                return withRequired.filter(k => allCallMonitoringColumnKeys.includes(k));
            }
        } catch { }
        return allCallMonitoringColumnKeys;
    });

    useEffect(() => {
        setSelectedCallMonitoringColumnKeys(prev => Array.from(new Set([...prev, ...requiredCallMonitoringColumnKeys])).filter(k => allCallMonitoringColumnKeys.includes(k)));
    }, [CallMonitoringColumn.length])

    const VisibleCallMonitoringColumns = useMemo(
        () => CallMonitoringColumn.filter(col => selectedCallMonitoringColumnKeys.includes(col.key)),
        [CallMonitoringColumn, selectedCallMonitoringColumnKeys]
    );

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadCallMonitoring(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadCallMonitoring(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleDeleteCallMonitoring = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteCallMonitoring) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteCallMonitoring = {

                    CallMonitoringId: deleteCallMonitoring.CallMonitoringId || 0,
                    Uniquekey: deleteCallMonitoring.Uniquekey || "",
                    ProjectId: deleteCallMonitoring.ProjectId || 0
                };

                const response = await callMonitoringService.apiCallDeleteCallMonitoring(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (callMonitoringList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadCallMonitoring(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteCallMonitoring(null);
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

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadCallMonitoring(1, filters, sortInfo, value)
    }

    const handleClearSearch = () => {
        setSearchTerm("");
        setPagination({ currentPage: 1 });
        loadCallMonitoring(1, filters, sortInfo, "")
    }

    const CallMonitoringPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }), [pagination, handlePageChange]
    )

    const CallMonitoringForTable = useMemo(() => callMonitoringList, [callMonitoringList]);

    const handleExportCallMonitoring = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCallMonitoring = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    Id: id,
                    PageName: pageName,
                    Name: filters.Name?.trim() || undefined,
                    RescheduleDateFromDate: filters.RescheduleDateFromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.RescheduleDateFromDate) || undefined : undefined,
                    RescheduleDateToDate: filters.RescheduleDateToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filters.RescheduleDateToDate) || undefined : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, CallMonitoringColumn),
                    ExportType: exportType
                };

                const response = await callMonitoringService.apiCallPullCallMonitoring(params);

                handleExportFile(response, exportType, 'Call Log', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportCallMonitoringExcel = () => handleExportCallMonitoring('Excel')
    const handleExportCallMonitoringPdf = () => handleExportCallMonitoring('PDF')

    return (
        <div className="pt-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Name"
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
                    setIsShowCustomizeCallMonitoringsColumnsModal(true);
                }}

                isShowExportButton={canExport && CallMonitoringForTable.length > 0}
                onExportExcel={handleExportCallMonitoringExcel}
                onExportPdf={handleExportCallMonitoringPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={CallMonitoringForTable}
                columns={VisibleCallMonitoringColumns}
                pagination={CallMonitoringPaginationInfo}
                recordsPerPage={20}
                fixedHeight={true}
                emptyMessage="No Call Logs Data Found"
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeCallMonitoringsColumnsModal}
                onClose={() => setIsShowCustomizeCallMonitoringsColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredCallMonitoringColumnKeys])
                    );
                    setSelectedCallMonitoringColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeCallMonitoringTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={CallMonitoringColumn}
                selectedKeys={selectedCallMonitoringColumnKeys}
                requiredKeys={requiredCallMonitoringColumnKeys}
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
                        <Input
                            type="text"
                            label="Name"
                            value={tempFilters?.Name ?? ''}
                            onChange={e => handleFilterChange('Name', e.target.value)}
                            placeholder="Enter Name"
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label='Call Status'
                            value={tempFilters.CallStatus || ''}
                            placeholder="Select Call Status"
                            onChange={e => handleFilterChange('CallStatus', String(e))}
                            options={CALL_STATUS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label='Call Purpose'
                            value={tempFilters.CallPurpose || ''}
                            placeholder="Select Call Purpose"
                            onChange={e => handleFilterChange('CallPurpose', String(e))}
                            options={CALL_PURPOSE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Mobile Number"
                            value={tempFilters?.MobileNumber ?? ''}
                            onChange={e => handleFilterChange('MobileNumber', filterNumbers(e.target.value))}
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

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingCallMonitoring(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingCallMonitoring(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title={editingCallMonitoring ? 'Update Call Log' : 'Add Call Log'}
                onSubmit={handleAddEditCallMonitoring}
                saveText={editingCallMonitoring ? 'Update ' : 'Add '}
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
                                value={formData.CallStatus ?? ""}
                                onChange={(e) => handleFieldChange("CallStatus", String(e))}
                                options={CALL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.CallStatus} />
                        </div>

                        <div>
                            <SinglePageSelection
                                label="Call Purpose"
                                placeholder="Select Call Purpose"
                                required
                                value={formData.CallPurpose ?? ""}
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

                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setDeleteCallMonitoring(null);
                    setIsConfirmationDialogBoxOpen(false);
                }}
                onConfirm={handleDeleteCallMonitoring}
                loading={isLoading}
                pageName="Call Log"
            />

        </div>
    )
}
export default CallMonitoring