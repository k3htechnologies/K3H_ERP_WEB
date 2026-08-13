import usePagination from "@/core/hooks/usePagination";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import * as E from 'fp-ts/Either';
import type { PaginationInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { Loader } from "@/core/utils/loader";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { inwardOutwardService } from "@/features/inwardOutward/services/InwardOutwardService";
import type { AddRevertInwardOutwardData, DeleteInwardAndOutWardRequest, FilterWithPaginationInwardAndOutWardRequest, InwardAndOutWardData } from "@/features/inwardOutward/models/InwardOutwardModel";
import { useInwardOutwardListState } from "@/features/inwardOutward/context/InwardOutwardListStateContext";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { updateFilter } from "@/core/utils/filterHelper";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { RotateCw, Trash2 } from "lucide-react";
import Tabs from "@/ui/components/Tab/Tab";
import { getInwardOutwardStatusColor } from "@/features/inwardOutward/utils/Status";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { TextArea } from "@/ui/components/forms/Textarea";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { formatCurrency } from "@/core/utils/comman";
import { toUpperCase } from "fp-ts/lib/string";
import { handleExportFile } from "@/core/utils/exportFile";
import { getNameInitials } from "@/core/utils/getNameInitials";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";

const initialFormState = (): AddRevertInwardOutwardData => ({
    InwardOutwardRevertId: 0,
    InwardOutwardId: 0,
    UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    RevertDate: null,
    RevertDocumentURL: [],
    RevertRemark: '',
});

export const InwardOutward: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [inwardOutwardDataList, setInwardOutwardDataList] = useState<InwardAndOutWardData[]>([]);
    const [, setRevertedInwardOutwardDataList] = useState<AddRevertInwardOutwardData[]>([]);

    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddRevertInwardOutwardData>(() => initialFormState());

    const [revertDocumentURLFiles, setRevertDocumentURLFiles] = useState<(File | string)[]>([]);
    const [revertDocumentURL, setRevertDocumentURL]= useState<string>("");
    const [removedRevertDocumentURLs, setRemovedRevertDocumentURLs]=useState<string[]>([]);


    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();

    const { canExport, canAction } = useMenuPermissions();

    const location = useLocation() as any;

    const navigate = useNavigate();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

    const [deleteInwardOutwardData, setDeleteInwardOutwardData] = useState<InwardAndOutWardData | null>(null);

    const [isShowCustomizeInwardOutwardColumnsModal, setIsShowCustomizeInwardOutwardColumnsModal] = useState(false);

    const InwardOutwardTabList = [
        { id: "All", label: "All" },
        { id: "Inward", label: "Inward" },
        { id: "Outward", label: "Outward" },
    ];

    const [activeTab, setActiveTab] = useState<string>(InwardOutwardTabList[0].id);

    const { listState, updateListState } = useInwardOutwardListState();
    const { searchTerm, filters, sortInfo } = listState;

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchInwardOutward(value)
    }, 350);

    useEffect(() => {
        setPagination({ currentPage: listState.page });

        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadInwardOutward(listState.page, { Name: String(listState.searchTerm).trim() }, listState.sortInfo);
        } else {
            loadInwardOutward(listState.page, listState.filters, listState.sortInfo);
        }
    }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    const fetchInwardOutwardList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadInwardOutward(page, filters, sort);
    }
    const loadInwardOutward = async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchtext?: string, DocumentType?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationInwardAndOutWardRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    InwardOutwardId: filterParams.InwardOutwardId ? Number(filterParams.InwardOutwardId) : undefined,
                    SystemGeneratedCode: searchtext ?? filterParams.SystemGeneratedCode?.trim() ?? undefined,
                    ReceiverName: filterParams.ReceiverName ?? undefined,
                    SenderName: filterParams.SenderName ?? undefined,
                    DocumentType: DocumentType ?? filterParams.DocumentType?.trim() ?? undefined,
                    DocumentTitle: filterParams.DocumentTitle ?? undefined,
                    DeliveryStatus: filterParams.DeliveryStatus ?? undefined,
                    ReceiverMobileNumber: filterParams.ReceiverMobileNumber ?? undefined,
                    SenderMobileNumber: filterParams.SenderMobileNumber ?? undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined, SortBy: getSortByParam(sort ?? null, InwardOutwardDataColumns),
                }

                const response = await inwardOutwardService.apiCallPullInwardOutward(params);

                if (E.isRight(response)) {
                    setInwardOutwardDataList(response.right.Data);
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
            'Loading Inward Outward Data'
        );
        [pagination.currentPage, pagination.pageSize, addToast, setPagination]
    };

    const handleFieldChange = (field: keyof AddRevertInwardOutwardData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleExportInwardOutward = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationInwardAndOutWardRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    InwardOutwardId: filters.InwardOutwardId ? Number(filters.InwardOutwardId) : 0,
                    SystemGeneratedCode: searchTerm?.trim() || undefined,
                    ReceiverName: filters.ReceiverName ?? undefined,
                    SenderName: filters.SenderName ?? undefined,
                    DocumentType: filters.DocumentType?.trim() ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, InwardOutwardDataColumns),
                    ExportType: exportType
                };

                const response = await inwardOutwardService.apiCallPullInwardOutward(params);

                handleExportFile(response, exportType, 'Inward Outward', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleRevert = (row: InwardAndOutWardData) => {
        setFormData({
            ...initialFormState(),
            UniqueKey: row.UniqueKey || "",
            InwardOutwardId: row.InwardOutwardId || 0,
        });
        setIsAddUpdateModalOpen(true);
    };

    const PushInwardOutwardRevertFormData = (): FormData => {

        const fd = new FormData();
        fd.append("InwardOutwardRevertId", formData.InwardOutwardRevertId.toString());
        fd.append("InwardOutwardId", formData.InwardOutwardId.toString());
        fd.append("UniqueKey", formData.UniqueKey ?? "");
        fd.append("RevertDate", formData.RevertDate ?? "");
        fd.append("RevertRemark", formData.RevertRemark ?? "");

        revertDocumentURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("RevertDocumentURL", file);
            }
        });

        const hasExistingFile = revertDocumentURL && revertDocumentURL.trim() !== "" &&  !removedRevertDocumentURLs.includes(revertDocumentURL);
        if (hasExistingFile) {
            fd.append('RevertDocumentURL', revertDocumentURL);
        }
 
        return fd;
    };

    const validateUpdateRevertForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.RevertRemark || !formData.RevertRemark.trim()) {
            newErrors.RevertRemark = "Remark is required";
        }

        if (!formData.RevertDate) {
            newErrors.RevertDate = "Revert Date is required";
        }

        if (!hasAnyDocumentFile(revertDocumentURLFiles, revertDocumentURL, removedRevertDocumentURLs)) {
            newErrors.RevertDocumentURL = "File is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const handleAddInwardOutwardRevert = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateUpdateRevertForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushInwardOutwardRevertFormData();

                const response = await inwardOutwardService.apiCallAddRevertInwardOutward(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const newRecord = response.right.Data[0] as AddRevertInwardOutwardData;

                    setRevertedInwardOutwardDataList(prev => [newRecord, ...prev]);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setRevertDocumentURL("");
                    setRevertDocumentURLFiles([]);
                    setRemovedRevertDocumentURLs([]);

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
            'Add Inward Outward Revert'
        )
    };

    const handleNavigateToView = (row: InwardAndOutWardData) => {
        updateListState({
            InwardOutwardId: row.InwardOutwardId,
            DocumentTitle: row.DocumentTitle ?? '',
        });
        navigate('/inwardOutward/view');
    };

    const handleAddInwardOutward = useCallback(() => {
        navigate('/inwardOutward/add', {
            state: {
                fromList: true
            }
        });
    }, [navigate]);

    const handleConfirmationDialogBoxOpen = useCallback((row: InwardAndOutWardData) => {
        setDeleteInwardOutwardData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const InwardOutwardDataColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'SystemGeneratedCode',
            label: 'Document Id',
            width: '15',
            sortable: true,
            align: 'left',
            fixed: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    tooltipThreshold={20}
                    maxWidth="180px"
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'DocumentType',
            label: 'Type',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'

        },
        {
            key: 'DocumentTitle',
            label: 'Title',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'DeliveryStatus',
            label: 'Status',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => {
                const { bg, text } = getInwardOutwardStatusColor(value);
                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text,
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            },
        },
        {
            key: 'EmployeeNames',
            label: 'Assigned To',
            width: '15',
            sortable: false,
            align: 'center',
            render: (_value, row) => {

                const employees = row.EmployeeNames
                    ?.split(",")
                    .map((e: string) => e.trim())
                    .filter(Boolean) || [];

                const maxVisible = 3;
                const visible = employees.slice(0, maxVisible);
                const remaining = employees.length > maxVisible
                    ? employees.length - maxVisible
                    : 0;

                return (
                    <div className="flex items-center -space-x-2">
                        {visible.map((emp: string, index: number) => (
                            <div
                                key={index}
                                className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs border-2 border-white"
                                title={emp}
                            >
                                {getNameInitials(emp)}
                            </div>
                        ))}

                        {remaining > 0 && (
                            <span
                                className="ml-2 text-md text-gray-700 font-medium"
                                title={employees.slice(maxVisible).join(", ")}
                            >
                                +{remaining}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'DepartmentName',
            label: 'Department',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    tooltipThreshold={20}
                    maxWidth="180px"
                />
            )
        },
        {
            key: 'SenderName',
            label: 'Sender Name',
            width: '15',
            sortable: true,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            )
        },
        {
            key: 'SenderEmailId',
            label: 'Sender E-Mail ID',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'SenderMobileNumber',
            label: 'Sender Mobile No',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? `${row.SenderMobileNumberCountryCode} ${value}` : '-'
        },
        {
            key: 'SenderAddress',
            label: 'Sender Address',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            )

        },
        {
            key: 'ReceiverName',
            label: 'Receiver Name',
            width: '15',
            sortable: true,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            )
        },
        {
            key: 'ReceiverEmailId',
            label: 'Receiver E-Mail ID',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ReceiverMobileNumber',
            label: 'Receiver Mobile No',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? `${row.ReceiverMobileNumberCountryCode} ${value}` : '-'
        },
        {
            key: 'ReceiverAddress',
            label: 'Receiver Address',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            )
        },
        {
            key: 'InwardOutwardDate',
            label: 'Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'InvoiceDate',
            label: 'Invoice Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'InvoiceNumber',
            label: 'Invoice Number',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Amount',
            label: 'Amount',
            width: '15',
            sortable: false,
            align: 'right',
            render: value => value ? formatCurrency(value) : '0'
        },
        {
            key: 'DeliveryMode',
            label: 'DeliveryMode',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'DeliveryType',
            label: 'Delivery Type',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'AcknowledgementBy',
            label: 'Acknowledged By',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'HandOverTo',
            label: 'HandOver To',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'HandOverDate',
            label: 'HandOver Date',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '15',
            sortable: false,
            align: 'center',
            fixed: 'right',
            render: (_value, row) => {

                const showDelete = ((row.DeliveryStatus || "") === "" && canAction) ? true : false;
                return (
                    <div className="flex justify-between">

                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!showDelete) return;
                                handleConfirmationDialogBoxOpen(row);
                            }}
                            color="transparent"
                            isborderRadius
                            disabled={!showDelete}
                            size="sm"
                            style={{
                                color: showDelete ? 'red' : '#9CA3AF',
                                cursor: showDelete ? 'pointer' : 'not-allowed',
                                opacity: showDelete ? 1 : 0.5
                            }}
                            title="Delete Inward Outward"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={!canAction}

                            style={{
                                color: canAction ? 'green' : '#9CA3AF',
                                cursor: canAction ? 'pointer' : 'not-allowed',
                                opacity: canAction ? 1 : 0.5
                            }}
                            title="Revert Inward Outward"

                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!canAction) return;
                                handleRevert(row)
                            }}
                            leftIcon={<RotateCw className="h-4 w-4" />}
                        />
                    </div>
                );
            }
        },
    ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);

    const requiredInwardOutwardColumnKeys: string[] = ['SystemGeneratedCode', 'Actions'];

    const allInwardOutwardColumnKeys: string[] = InwardOutwardDataColumns.map(c => c.key);

    const [selectedInwardOutwardColumnKeys, setSelectedInwardOutwardColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getInwardOutwardTableColumns?.();
            if (saved) {

                const parsed = JSON.parse(saved) as string[]
                const withRequired = Array.from(new Set([...parsed, ...requiredInwardOutwardColumnKeys]));

                return withRequired.filter(k => allInwardOutwardColumnKeys.includes(k));
            }
        } catch { }
        return allInwardOutwardColumnKeys;
    });

    useEffect(() => {
        setSelectedInwardOutwardColumnKeys(prev => Array.from(new Set([...prev, ...requiredInwardOutwardColumnKeys])).filter(k => allInwardOutwardColumnKeys.includes(k)));
    }, [InwardOutwardDataColumns.length])

    const visibleInwardOutwardColumns = useMemo(
        () => InwardOutwardDataColumns.filter(col => selectedInwardOutwardColumnKeys.includes(col.key)),

        [InwardOutwardDataColumns, selectedInwardOutwardColumnKeys]
    );

    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        loadInwardOutward(1, tempFilters, sortInfo);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        updateListState({ filters: {}, page: 1, searchTerm: '', sortInfo: undefined });
        loadInwardOutward(1, {}, undefined);
        navigate(location.pathname, { replace: true, state: {} });
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const searchInwardOutward = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue, page: 1 });

        if (searchValue.trim() === '') {

            updateListState({ filters: {}, searchTerm: '' });
            fetchInwardOutwardList(1);
            return
        }
        await loadInwardOutward(1, filters, sortInfo, searchValue);
    };

    const clearSearchInwardOutward = () => {
        debouncedSearch.cancel?.();
        updateListState({ searchTerm: '', filters: {}, page: 1, sortInfo: undefined });
        setTempFilters({});
        loadInwardOutward(1, {}, undefined, undefined);
        try {
            navigate(location.pathname, {
                replace: true,
                state: {}
            });
        } catch {
        }
    };

    const handlePageChange = useCallback((page: number) => {

        updateListState({ page });
        fetchInwardOutwardList(page);
    }, [updateListState]);

    const handleSortColumn = useCallback((sort: SortInfo) => {

        updateListState({ sortInfo: sort, page: 1 });
        loadInwardOutward(1, filters, sort, searchTerm || undefined);
    }, [filters, searchTerm, updateListState]);

    const InwardOutwardDataPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const InwardOutwardDataForTable = useMemo(() => {
        if (activeTab === 'All')

            return inwardOutwardDataList;

        return inwardOutwardDataList.filter(
            (item) => item.DocumentType === activeTab
        );

    }, [inwardOutwardDataList, activeTab]);

    const handleDeleteInwardOutward = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteInwardOutwardData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteInwardAndOutWardRequest = {
                    InwardOutwardId: deleteInwardOutwardData.InwardOutwardId || 0,
                    UniqueKey: deleteInwardOutwardData.UniqueKey || "",
                };

                const response = await inwardOutwardService.apiCallDeleteInwardOutward(params);

                if (E.isRight(response)) {
                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (
                        inwardOutwardDataList.length === 1 &&
                        pagination.currentPage > 1
                    ) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });
                    await loadInwardOutward(pageToShow, filters, sortInfo);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteInwardOutwardData(null);
                } else {
                    addToast({ type: "error", title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Deleting Inward Outward",
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Document Id"
                onSearchChange={v => {
                    updateListState({ searchTerm: v });
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchInwardOutward}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters || {});
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeInwardOutwardColumnsModal(true)}

                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddInwardOutward}

                isShowExportButton={canExport && inwardOutwardDataList.length > 0}
                onExportExcel={() => handleExportInwardOutward('Excel')}
                onExportPdf={() => handleExportInwardOutward('PDF')}
            />

            <div className="pt-1">

                <Tabs
                    tabs={InwardOutwardTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                        loadInwardOutward(1, {}, sortInfo, searchTerm, toUpperCase(t.label) === "ALL" ? "" : t.label);
                    }}
                />

            </div>

            <CustomizeColumnsModal
                isOpen={isShowCustomizeInwardOutwardColumnsModal}
                onClose={() => setIsShowCustomizeInwardOutwardColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(

                        new Set([...keys, ...requiredInwardOutwardColumnKeys])
                    );
                    setSelectedInwardOutwardColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeInwardOutwardTableColumns?.(

                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={InwardOutwardDataColumns}
                selectedKeys={selectedInwardOutwardColumnKeys}
                requiredKeys={requiredInwardOutwardColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setRevertDocumentURLFiles([]);
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setRevertDocumentURLFiles([]);
                }}
                title="Revert"
                saveText="Save"
                onSubmit={handleAddInwardOutwardRevert}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <DatePickerInput
                                label="Revert Date"
                                value={formatDate_dd_mm_yyyy(formData.RevertDate)}
                                onChange={(val) => handleFieldChange('RevertDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                required
                                isDisplayCurrentDate
                                minDate={new Date(new Date().setDate(new Date().getDate()))}
                                error={errors.RevertDate}
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Upload Document"
                                required
                                placeholder="Select files"
                                value={revertDocumentURLFiles}
                                onChange={setRevertDocumentURLFiles}
                                availableFilesURL={revertDocumentURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf", "application/vnd.ms-excel"]}
                                maxFiles={5}
                                onRemoveExisting={(url) => {
                                        setRemovedRevertDocumentURLs((prev) => [...prev, url]);
                                    }}
                                error={errors.RevertDocumentURL}
                            />
                        </div>

                        <div>
                            <TextArea
                                label="Remark"
                                required
                                className='thin-scroll'
                                value={formData.RevertRemark ?? ""}
                                placeholder="Enter Remark"
                                onChange={(e) => handleFieldChange("RevertRemark", e.target.value)}
                                error={errors.RevertRemark} />
                        </div>

                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Inward Outward"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                size="small-half">
                <div className="space-y-6">
                    <div>
                        <Input type="text"
                            label='Document Id'
                            value={tempFilters?.SystemGeneratedCode ?? ''}
                            onChange={e => handleFilterChange('SystemGeneratedCode', e.target.value)}
                            placeholder="Enter Document Id" />
                    </div>
                    <div>
                        <Input type="text"
                            label='Sender Name'
                            value={tempFilters?.SenderName ?? ''}
                            onChange={e => handleFilterChange('SenderName', e.target.value)}
                            placeholder="Enter Sender Name" />
                    </div>

                    <div>
                        <Input type="text"
                            label='Receiver Name'
                            value={tempFilters?.ReceiverName ?? ''}
                            onChange={e => handleFilterChange('ReceiverName', e.target.value)}
                            placeholder="Enter Receiver Name" />
                    </div>

                    <div>
                        {activeTab === "All" && (
                            <Input type="text"
                                label='Document Type'
                                value={tempFilters?.DocumentType ?? ''}
                                onChange={e => handleFilterChange('DocumentType', e.target.value)}
                                placeholder="Enter Document Type" />
                        )}
                    </div>

                    <div>
                        <Input type="text"
                            label='Document Title'
                            value={tempFilters?.DocumentTitle ?? ''}
                            onChange={e => handleFilterChange('DocumentTitle', e.target.value)}
                            placeholder="Enter Document Title" />
                    </div>
                    <div>
                        <Input type="text"
                            label='Status'
                            value={tempFilters?.DeliveryStatus ?? ''}
                            onChange={e => handleFilterChange('DeliveryStatus', e.target.value)}
                            placeholder="Enter Status" />
                    </div>

                    <div>
                        <Input type="text"
                            label='Sender Mobile No'
                            value={tempFilters?.SenderMobileNumber ?? ''}
                            onChange={e => handleFilterChange('SenderMobileNumber', e.target.value)}
                            placeholder="Enter Sender Mobile No"
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <Input type="text"
                            label='Receiver Mobile No'
                            value={tempFilters?.ReceiverMobileNumber ?? ''}
                            onChange={e => handleFilterChange('ReceiverMobileNumber', e.target.value)}
                            placeholder="Enter Receiver Mobile No"
                            maxLength={10} />
                    </div>

                    <div>
                        <DatePickerInput
                            label='From Date'
                            value={tempFilters.FromDate || ''}
                            onChange={(value) => handleFilterChange('FromDate', value || '')}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='To Date'
                            value={tempFilters.ToDate || ''}
                            onChange={(value) => handleFilterChange('ToDate', value || '')}
                        />
                    </div>

                </div>
            </Modal>

            <div className="pt-5">
                <DataTable
                    data={InwardOutwardDataForTable}
                    columns={visibleInwardOutwardColumns}
                    pagination={InwardOutwardDataPaginationInfo}
                    emptyMessage="No Inward Outward Data Found"
                    fixedHeight={true}
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                />
            </div>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteInwardOutwardData(null);
                }}
                onConfirm={handleDeleteInwardOutward}
                loading={isLoading}
                pageName="Inward Outward"
            />
        </div>
    )
}
export default InwardOutward;
