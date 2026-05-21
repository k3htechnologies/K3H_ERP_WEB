import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AddUpdateTicketRequest, DeleteTicketModelRequest, FilterWithPaginationTicket, TicketData } from '@/features/ticket/models/TicketModel';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { runApiWithLoader } from '@/core/utils';
import usePagination from '@/core/hooks/usePagination';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import * as E from 'fp-ts/Either';
import useToast from '@/core/hooks/useToast';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { handleExportFile } from '@/core/utils/exportFile';
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { Modal } from '@/ui/components/Modal/Modal';
import { updateFilter } from "@/core/utils/filterHelper";
import { Button, Input } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { MODULE_OPTIONS, PLATFORM_OPTIONS } from '@/core/constants';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useTicketListState } from '@/features/ticket/context/TicketListStateContext';
import { ticketService } from '@/features/ticket/services/TicketService';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, UserCheck } from 'lucide-react';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getTicketStatusColor } from "@/features/ticket/pages/TicketStatus";
import RadioPill from '@/ui/components/forms/RadioPill';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';

const initialFormState = (): AddUpdateTicketRequest => ({
    TicketId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    SystemGeneratedCode: "",
    Platform: '',
    Module: '',
    Priority: 'Low',
    TicketStatus: '',
    TicketDescription: '',
    TicketRemark: '',
    AttachmentURL: null,
    RemoveAttachmentURL: ''
});

export const Ticket: React.FC = () => {

    const [ticketList, setTicketList] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [isShowCustomizeCallLogColumnsModal, setIsShowCustomizeCallLogColumnsModal] = useState(false);
    const [documentURLFiles, setDocumentURLFiles] = useState<(File | string)[]>([]);
    const [documentURL, setDocumentURL] = useState<string>("");
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [editingTicketData, setEditingTicketData] = useState<TicketData | null>(null);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteTicketMasterData, setDeleteTicketMasterData] = useState<TicketData | null>(null)
    const [formData, setFormData] = useState<AddUpdateTicketRequest>(() => initialFormState());
    const { listState, updateListState, resetFilters, clearTicketContext } = useTicketListState();
    const { page, filters, sortInfo, searchTerm } = listState;
    const { pagination, setPagination } = usePagination(20);
    const { canExport, canAction } = useMenuPermissions('/ticket');
    const { addToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchTerm && searchTerm.trim()) {
            loadTicketMasterList(page, { SystemGeneratedCode: searchTerm.trim() }, sortInfo, searchTerm);
        } else {
            loadTicketMasterList(page, filters, sortInfo, searchTerm);
        }
    }, [page, filters, sortInfo, searchTerm, clearTicketContext]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    useEffect(() => {
        setTempFilters(filters);
    }, [filters]);

    const debouncedSearch = useDebouncedCallback(
        (value: string, isSearch: boolean = true) => {
            let filterParams: FilterInfo = {};

            if (value.trim() === '') {
                updateListState({ searchTerm: '', filters: {}, page: 1 });
                return;
            }
            if (isSearch) {
                filterParams = { SystemGeneratedCode: value.trim() };
            }
            updateListState({ searchTerm: value, filters: filterParams, page: 1 });
        },
        350
    );

    const loadTicketMasterList = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTicket = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    SystemGeneratedCode: searchText ?? filterParams.SystemGeneratedCode ?? undefined,
                    Platform: filterParams.Platform ?? undefined,
                    Module: filterParams.Module ?? undefined,
                    Priority: filterParams.Priority ?? undefined,
                    DepartmentName: filterParams.DepartmentName ?? undefined,
                    TicketStatus: filterParams.TicketStatus ?? undefined,
                    TicketId: filterParams.TicketId
                        ? Number(filterParams.TicketId)
                        : 0,
                    SortBy: getSortByParam(sortInfo ?? null, ticketColumns),
                }

                const response = await ticketService.apiCallPullTicket(params);

                if (E.isRight(response)) {
                    setTicketList(response.right.Data || []);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Ticket'
        );
    };

    const PushTicketData = (): FormData => {
        const fd = new FormData();

        fd.append('TicketId', String(formData.TicketId ?? 0));
        fd.append('Uniquekey', formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6');
        fd.append('Platform', formData.Platform || '');
        fd.append('Module', formData.Module || '');
        fd.append('Priority', formData.Priority || '');
        fd.append('TicketDescription', formData.TicketDescription || '');
        fd.append('TicketRemark', formData.TicketRemark || '');
        fd.append('TicketStatus', formData.TicketStatus || 'Open');

        documentURLFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('AttachmentURL', file);
            }
        });

        const hasExistingFile = documentURL && documentURL.trim() !== "" && !removedDocumentURLs.includes(documentURL);

        if (hasExistingFile) {
            fd.append('AttachmentURL', documentURL);
        }

        fd.append('RemoveAttachmentURL', removedDocumentURLs.join(','));

        return fd;
    };

    const validationAddUpdateTicketMasterForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (formData.Platform?.trim() === "") {
            newErrors.Platform = "Platform is required";
        }

        if (formData.Module?.trim() === "") {
            newErrors.Module = "Module is required";
        }

        if (!formData.Priority || formData.Priority.trim() === "") {
            newErrors.Priority = "Priority is required";
        }

        if (formData.TicketDescription?.trim() === "") {
            newErrors.TicketDescription = "Description is required";
        }

        if (!hasAnyDocumentFile(documentURLFiles, documentURL, removedDocumentURLs)) {
            newErrors.DocumentURL = "File is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddTicketMaster = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validationAddUpdateTicketMasterForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushTicketData();

                const response = await ticketService.apiCallAddUpdateTicket(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.TicketId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as TicketData
                        setTicketList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as TicketData;
                        setTicketList(prevData =>
                            prevData.map(item =>
                                item.TicketId === formData.TicketId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setEditingTicketData(null)
                    setFormData(initialFormState())

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
            'Ticket added successfully '
        )
    };

    const handleDeleteTicketMaster = async () => {
        setIsConfirmationDialogBoxOpen(false);
        if (!deleteTicketMasterData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteTicketModelRequest = {
                    TicketId: deleteTicketMasterData.TicketId,
                    Uniquekey: deleteTicketMasterData.Uniquekey || '',
                }
                const response = await ticketService.apiCallDeleteTicket(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (ticketList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadTicketMasterList(pageToShow, {}, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteTicketMasterData(null);
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
            'Delete Ticket'
        )
    }

    const handleSearchChange = (value: string) => {
        updateListState({ searchTerm: value });
        debouncedSearch(value, false);
    };

    const handleClearSearch = () => {
        debouncedSearch.cancel?.();
        resetFilters();
        setTempFilters({});
    }

    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [sortInfo, updateListState]);

    const handleSortColumn = useCallback(
        (sort: SortInfo) => {
            updateListState({ sortInfo: sort, page: 1 });
            loadTicketMasterList(1, filters, sort, searchTerm || undefined);
        },
        [filters, updateListState, searchTerm],
    );

    const handleAssignTicketMaster = useCallback((row: TicketData) => {
        updateListState({
            TicketId: row.TicketId ?? 0,
            SystemGeneratedCode: row.SystemGeneratedCode ?? '',
            Platform: row.Platform ?? ''
        });

        navigate('/ticket/assignTicketView')
    }, [navigate, updateListState])

    const handleEditTicketMaster = useCallback((row: TicketData) => {
        setEditingTicketData(row);
        setFormData({
            ...initialFormState(),
            TicketId: row.TicketId,
            Uniquekey: row.Uniquekey ?? '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            Platform: row.Platform ?? '',
            Module: row.Module ?? '',
            Priority: row.Priority ?? '',
            TicketDescription: row.TicketDescription ?? '',
            TicketRemark: row.TicketRemark ?? '',
            TicketStatus: row.TicketStatus ?? 'Open',

        });
        setRemovedDocumentURLs([]);
        setDocumentURLFiles([]);
        setDocumentURL(row.AttachmentURL ?? "");

        setIsAddUpdateModalOpen(true);
    }, []);

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteTicketMasterData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteTicketMasterData]);

    const handleConfirmationDialogBoxOpen = useCallback((row: TicketData) => {
        setDeleteTicketMasterData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const handleFieldChange = (field: keyof AddUpdateTicketRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleExportTicketMaster = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTicket = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    TicketId: filters.TicketId ? Number(filters.TicketId) : 0,
                    SystemGeneratedCode: searchTerm?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ticketColumns),
                    ExportType: exportType
                };

                const response = await ticketService.apiCallPullTicket(params);

                handleExportFile(response, exportType, 'Tickets', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportCallLogExcel = () => handleExportTicketMaster('Excel')
    const handleExportCallLogPdf = () => handleExportTicketMaster('PDF')

    const handleNavigateToView = useCallback((row: TicketData) => {
        updateListState({ TicketId: row.TicketId ?? 0, SystemGeneratedCode: row.SystemGeneratedCode ?? '', Platform: row.Platform ?? '' });

        navigate('/ticket/view');
    }, [navigate, updateListState]);

    const ticketColumns = useMemo<TableColumn[]>(() => {
        const userDept = LocalStorageHelper.getStoredEmployeeData()?.Department;
        const isITDept = userDept === "Information Technology";

        const columns: TableColumn[] = [
            {
                key: 'SystemGeneratedCode',
                label: 'Ticket Id',
                width: '20',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value, row) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="250px"
                        tooltipThreshold={25}
                        onClick={() => handleNavigateToView(row)}
                    />
                )
            },
            {
                key: 'Platform',
                label: 'Platform',
                width: '15',
                render: (value) => value || ''
            },
            {
                key: 'Module',
                label: 'Module',
                width: '15',
                render: (value) => value || ''
            },
            {
                key: 'Priority',
                label: 'Priority',
                width: '15',
                sortable: true,
                render: (value) => {
                    return (
                        <div
                            className={`font-medium ${value === 'High'
                                ? 'text-red-500'
                                : value === 'Medium'
                                    ? 'text-yellow-500'
                                    : value === 'Low'
                                        ? 'text-green-500'
                                        : 'text-gray-500'
                                }`}
                        >
                            {value || '-'}
                        </div>
                    );
                }
            }
        ];

        if (isITDept) {
            columns.push(
                {
                    key: 'CreatedBy',
                    label: 'Raised By',
                    width: '15',
                    render: (value) => value || ''
                },
                {
                    key: 'DepartmentName',
                    label: 'Department',
                    width: '15',
                    render: (value) => value || ''
                }
            );
        }
        columns.push(
            {
                key: 'TicketStatus',
                label: 'Status',
                width: '15',
                render: (_value, row: TicketData) => {
                    const displayStatus = row.AssignedStatus || row.TicketStatus || "-";
                    const { bg, text } = getTicketStatusColor(displayStatus);
                    return (
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{ backgroundColor: bg, color: text }}
                        >
                            {displayStatus}
                        </span>
                    );
                },
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '15',
                align: 'center',
                render: (_value, row) => {
                    const isDisabled = row.AssignedStatus !== "Open" && row.AssignedStatus !== "";

                    return (
                        <div className="flex items-center justify-center">
                            {canAction && (
                                <>
                                    {isITDept ? (
                                        <Button
                                            color="transparent"
                                            size="sm"
                                            style={{ color: 'blue', padding: '0px 8px' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleAssignTicketMaster(row);
                                            }}
                                            leftIcon={<UserCheck className="h-4 w-4" />}
                                        />
                                    ) : (
                                        <>
                                            <Button
                                                color="transparent"
                                                size="sm"
                                                style={{
                                                    color: (!isDisabled) ? 'blue' : '#9CA3AF',
                                                    cursor: (!isDisabled) ? 'pointer' : 'not-allowed',
                                                    opacity: (!isDisabled) ? 1 : 0.5,
                                                    padding: '0px 8px'
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleEditTicketMaster(row);
                                                }}
                                                leftIcon={<Edit className="h-4 w-4" />}
                                                disabled={isDisabled}
                                            />

                                            <Button
                                                color="transparent"
                                                size="sm"
                                                style={{
                                                    color: (!isDisabled) ? 'red' : '#9CA3AF',
                                                    cursor: (!isDisabled) ? 'pointer' : 'not-allowed',
                                                    opacity: (!isDisabled) ? 1 : 0.5
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleConfirmationDialogBoxOpen(row);
                                                }}
                                                leftIcon={<Trash2 className="h-4 w-4" />}
                                                disabled={isDisabled}
                                            />
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    );
                }
            }
        );

        return columns;
    }, [canAction, handleEditTicketMaster, handleAssignTicketMaster, handleConfirmationDialogBoxOpen]);


    const requiredTicketMasterColumnKeys: string[] = ['SystemGeneratedCode', 'Actions'];

    const allTicketMasterColumnKeys: string[] = ticketColumns.map(c => c.key);

    const [selectedTicketMasterColumnKeys, setSelectedTicketMasterColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getTicketMasterTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredTicketMasterColumnKeys]));

                return withRequired.filter(k => allTicketMasterColumnKeys.includes(k));
            }
        } catch { }
        return allTicketMasterColumnKeys;
    });

    useEffect(() => {
        setSelectedTicketMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredTicketMasterColumnKeys])).filter(k => allTicketMasterColumnKeys.includes(k)));
    }, [ticketColumns.length])

    const visibleticketColumns = useMemo(
        () => ticketColumns.filter(col => selectedTicketMasterColumnKeys.includes(col.key)),
        [ticketColumns, selectedTicketMasterColumnKeys]
    );

    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        resetFilters();
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleAddTicketMasterModal = () => {
        setFormData(initialFormState());
        setDocumentURLFiles([]);
        setDocumentURL('');
        setRemovedDocumentURLs([]);
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    const TicketMasterPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )

    const ticketListForTable = useMemo(() => ticketList, [ticketList]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Ticket Id"
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
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddTicketMasterModal}
                isShowExportButton={canExport}
                onExportExcel={handleExportCallLogExcel}
                onExportPdf={handleExportCallLogPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={ticketListForTable}
                columns={visibleticketColumns}
                pagination={TicketMasterPaginationInfo}
                emptyMessage="No Ticket Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingTicketData(null);
                    setFormData(initialFormState());
                    setDocumentURL('');
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingTicketData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}

                title={editingTicketData ? 'Update Ticket' : 'Add Ticket'}
                onSubmit={handleAddTicketMaster}
                saveText={editingTicketData ? 'Update' : 'Add'}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-4 p-6 bg-blue-100">
                    <div>
                        <SinglePageSelection
                            label="Platform"
                            required
                            placeholder='Select Platform'
                            value={formData.Platform || ''}
                            onChange={(e) => {
                                handleFieldChange('Platform', String(e));
                                handleFieldChange('Module', '');
                            }}
                            options={PLATFORM_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                            error={errors.Platform}
                        />
                    </div>
                    <div>
                        {formData.Platform === 'Website' ? (
                            <Input
                                type='text'
                                label="Module"
                                required
                                placeholder="Module Name"
                                value={formData.Module || ''}
                                onChange={(e) => handleFieldChange('Module', e.target.value)}
                                error={errors.Module}
                            />
                        ) : (
                            <SinglePageSelection
                                label="Module"
                                required
                                placeholder='Select Module'
                                value={formData.Module || ''}
                                onChange={(e) => handleFieldChange('Module', String(e))}
                                options={MODULE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.Module}
                            />
                        )}
                    </div>

                    <div>
                        <TextArea
                            label="Description"
                            required
                            placeholder="Enter Description"
                            value={formData.TicketDescription || ''}
                            onChange={(e) => handleFieldChange("TicketDescription", e.target.value)}
                            error={errors.TicketDescription}
                        />
                    </div>

                    <div>
                        <MultiFilePicker
                            label="Upload Document"
                            required
                            placeholder="Select files"
                            value={documentURLFiles}
                            onChange={setDocumentURLFiles}
                            availableFilesURL={documentURL ?? ""}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                            maxFiles={5}
                            maxSizeMB={10}
                            error={errors.DocumentURL}
                            onRemoveExisting={(url) => {
                                setRemovedDocumentURLs((prev) => [...prev, url]);
                            }}
                        />
                    </div>

                    <div className="items-center gap-10">
                        <h2 className="font-medium text-gray-500">Set Priority <span className="text-red-500">*</span> </h2>
                        <div className="flex gap-2 mt-4">
                            <RadioPill
                                name="Priority"
                                label="High"
                                value="High"
                                checked={formData.Priority === "High"}
                                onChange={() =>
                                    handleFieldChange("Priority", "High")
                                }
                            />

                            <RadioPill
                                name="Priority"
                                label="Medium"
                                value="Medium"
                                checked={formData.Priority === "Medium"}
                                onChange={() =>
                                    handleFieldChange("Priority", "Medium")
                                }
                            />

                            <RadioPill
                                name="Priority"
                                label="Low"
                                value="Low"
                                checked={formData.Priority === "Low"}
                                onChange={() =>
                                    handleFieldChange("Priority", "Low")
                                }
                            />
                        </div>

                        <div className="mt-4">
                            <TextArea
                                label="Remark"
                                placeholder="Enter Remark"
                                value={formData.TicketRemark || ''}
                                onChange={(e) => handleFieldChange("TicketRemark", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            <CustomizeColumnsModal
                isOpen={isShowCustomizeCallLogColumnsModal}
                onClose={() => setIsShowCustomizeCallLogColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredTicketMasterColumnKeys])
                    );
                    setSelectedTicketMasterColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storePayTrackCallLogTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={ticketColumns}
                selectedKeys={selectedTicketMasterColumnKeys}
                requiredKeys={requiredTicketMasterColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Ticket"
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
                            label="Platform"
                            value={tempFilters?.Platform ?? ''}
                            onChange={e => handleFilterChange('Platform', e.target.value)}
                            placeholder="Enter Platform"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Module"
                            value={tempFilters?.Module ?? ''}
                            onChange={e => handleFilterChange('Module', e.target.value)}
                            placeholder="Enter Module"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Priority"
                            value={tempFilters?.Priority ?? ''}
                            onChange={e => handleFilterChange('Priority', e.target.value)}
                            placeholder="Enter Priority"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Department"
                            value={tempFilters?.DepartmentName ?? ''}
                            onChange={e => handleFilterChange('DepartmentName', e.target.value)}
                            placeholder="Enter Department Name"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Status"
                            value={tempFilters?.TicketStatus ?? ''}
                            onChange={e => handleFilterChange('TicketStatus', e.target.value)}
                            placeholder="Enter Ticket Status"
                        />
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteTicketMaster}
                loading={isLoading}
                pageName='Ticket'
            />
        </div>
    );
}

export default Ticket;