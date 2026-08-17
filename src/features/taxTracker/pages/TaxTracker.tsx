import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddUpdateTaxTrackerRequest, DeleteTaxTrackerRequest, FilterWithPaginationTaxTrackerRequest, TaxTrackerData } from "@/features/taxTracker/models/TaxTrackerModel";
import usePagination from "@/core/hooks/usePagination";
import { useTaxTrackerListState } from "@/features/taxTracker/context/TaxTrackerListStateContext";
import { taxTrackerService } from "@/features/taxTracker/services/TaxTrackerService";
import { handleExportFile } from "@/core/utils/exportFile";
import useToast from "@/core/hooks/useToast";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import { AUTHORITY_OPTIONS, NOTICE_STATUS_OPTIONS, ORDER_STATUS_OPTIONS, REQUEST_TYPE_OPTIONS } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import * as E from 'fp-ts/Either';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { useNavigate } from "react-router-dom";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Modal } from "@/ui/components/Modal/Modal";
import type { AddUpdateTaxTrackerDocumentRequest } from "@/features/taxTracker/models/TaxTrackerDocumentModel";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { TextArea } from "@/ui/components/forms/Textarea";
import { taxTrackerDocumentService } from "@/features/taxTracker/services/TaxTrackerDocumentService";
import { filterNumbersWithDecimal, hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { getNoticeStatusColor } from "@/features/taxTracker/utils/Status";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { updateFilter } from "@/core/utils/filterHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";

const initialFormState = (): AddUpdateTaxTrackerRequest => ({
    TaxTrackerId: 0,
    Uniquekey: null,
    GovernmentCompliance: null,
    CompanyId: 0,
    FinancialYear: '',
    ResponsiblePersonId: null,
    NoticeType: null,
    NoticeSectionMasterId: 0,
    Authority: null,
    NoticeDate: null,
    DueDate: null,
    NoticeStatus: null,
    NoticeDocumentURL: [],
    RemoveNoticeDocumentURL: null,
    OfficerName: null,
    OfficerAddress: null,
    NoticeDescription: null,
    ReplyDocumentURL: [],
    RemoveReplyDocumentURL: null,
    RequestType: null
});

const getInitialRequestFormState = (): AddUpdateTaxTrackerDocumentRequest => ({
    TaxTrackerDocumentId: 0,
    Uniquekey: null,
    TaxTrackerId: 0,
    RequestType: null,
    AuthorityType: '',
    NoticeDocumentURL: [],
    RemoveNoticeDocumentURL: null,
    NoticeDescription: null,
    OfficerName: null,
    OfficerAddress: null,
    OrderStatus: null,
    AmountUnderDisputeDate: null,
    AmountUnderDispute: 0,
    NoticeStatus: null,
});

export const TaxTracker: React.FC = () => {

    const [taxTrackerList, setTaxTrackerList] = useState<TaxTrackerData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteTaxTrackerData, setDeleteTaxTrackerData] = useState<TaxTrackerData | null>(null);
    const [requestFormData, setRequestFormData] = useState<AddUpdateTaxTrackerDocumentRequest>(() => getInitialRequestFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isAddUpdateRequestAppealModalOpen, setIsAddUpdateRequestAppealModalOpen] = useState(false);
    const [noticeDocumentURLFiles, setNoticeDocumentURLFiles] = useState<(File | string)[]>([]);
    const [noticeDocumentURL, setNoticeDocumentURL] = useState<string>("");
    const [removedNoticeDocumentURLs, setRemovedNoticeDocumentURLs] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [isShowCustomizeTaxTrackerColumnsModal, setIsShowCustomizeTaxTrackerColumnsModal] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchTaxTrackerRecords(value);
    }, 350);

    const { canAction, canExport } = useMenuPermissions();
    const { pagination, setPagination } = usePagination(20);
    const { listState, updateListState } = useTaxTrackerListState();
    const { page } = listState;
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<AddUpdateTaxTrackerRequest>(() => ({
        ...initialFormState(),
        CompanyId: listState.CompanyId || 0,
        CompanyName: listState.CompanyName || null,
        FinancialYear: listState.FinancialYear || '',
    }));

    useEffect(() => {
        loadTaxTrackerList(page, filters);
    }, [page, filters]);

    const loadTaxTrackerList = async (
        page: number,
        filterParams: FilterInfo,
        sortInfo?: SortInfo,
        searchtext?: string,
        companyId?: number,
        financialYear?: string
    ) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTaxTrackerRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    GovernmentCompliance: filterParams.GovernmentCompliance,
                    NoticeSection: searchtext ?? filterParams.NoticeSection ?? undefined,
                    NoticeType: filterParams.NoticeType ?? "",
                    Authority: filterParams.Authority ?? undefined,
                    FromNoticeDate: filterParams.FromNoticeDate ?? '',
                    ToNoticeDate: filterParams.ToNoticeDate ?? undefined,
                    NoticeStatus: filterParams.NoticeStatus ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, noticeSectionColumns),
                    CompanyId: companyId ?? (filterParams.CompanyId ? Number(filterParams.CompanyId) : undefined),
                    FinancialYear: financialYear ?? filterParams.FinancialYear ?? undefined,
                }

                const response = await taxTrackerService.apiCallPullTaxTracker(params);

                if (E.isRight(response)) {

                    setTaxTrackerList(response.right.Data);

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
            'Loading Tax Tracker'
        )
    }

    const handleAddTaxTracker = useCallback(() => {
        navigate("/taxTracker/add/");
    }, [navigate]);

    const handleViewTaxTracker = useCallback((item: TaxTrackerData) => {
        updateListState({
            TaxTrackerId: item.TaxTrackerId ?? 0,
            NoticeType: item.NoticeType ?? "",
            CompanyName: item.CompanyName ?? "",
            FinancialYear: item.FinancialYear ?? "",
            GovernmentCompliance: item.GovernmentCompliance ?? ""
        });
        navigate('/taxTracker/view');
    }, [navigate, updateListState],);

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }


    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadTaxTrackerList(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });

        loadTaxTrackerList(1, {}, sortInfo, searchTerm);
    };

    const searchTaxTrackerRecords = async (searchValue: string) => {
        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {
            await loadTaxTrackerList(1, filters);
            return;
        }

        await loadTaxTrackerList(1, filters, sortInfo, searchValue);
    };

    const clearSearchTaxTrackerRecords = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        loadTaxTrackerList(1, { NoticeSection: '' }, sortInfo, undefined);
    };

    const handleConfirmationDialogBoxOpen = useCallback((row: TaxTrackerData) => {
        setDeleteTaxTrackerData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const handleExportTaxTracker = async (exportType: 'Excel' | 'PDF') => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaxTrackerRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    GovernmentCompliance: filters.GovernmentCompliance || undefined,
                    CompanyName: filters.CompanyName ?? undefined,
                    NoticeSection: filters.NoticeSection || "",
                    FinancialYear: filters.FinancialYear || undefined,
                    NoticeType: filters.NoticeType || "",
                    NoticeStatus: filters.NoticeStatus || undefined,
                    FromNoticeDate: filters.FromNoticeDate || null,
                    ToNoticeDate: filters.ToNoticeDate || null,
                    ExportType: exportType,
                };

                const response = await taxTrackerService.apiCallPullTaxTracker(params);

                handleExportFile(response, exportType, "Tax Tracker", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportTaxTrackerExcel = () => handleExportTaxTracker("Excel");
    const handleExportTaxTrackerPdf = () => handleExportTaxTracker("PDF");

    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [updateListState],
    );


    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);

        loadTaxTrackerList(1, filters, sort);
    }, [filters]);


    const taxTrackerPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [
            pagination.currentPage,
            pagination.totalPages,
            pagination.totalRecords,
            pagination.pageSize,
        ],
    );

    const handleAddAppealModal = useCallback((row: TaxTrackerData) => {
        setIsAddUpdateRequestAppealModalOpen(true);
        setRequestFormData(() => ({
            ...getInitialRequestFormState(),
            TaxTrackerId: row.TaxTrackerId ?? 0,
        }));

        setNoticeDocumentURL("");
        setNoticeDocumentURLFiles([]);
        setRemovedNoticeDocumentURLs([]);
        setErrors({});
        setFormData(prev => ({
            ...prev,
            Uniquekey: row.Uniquekey ?? null,
        }));
    }, [])

    const noticeSectionColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'CompanyName',
                label: 'Company Name',
                width: '30',
                fixed: 'left',
                align: 'left',
                render: value => value || ''
            },
            {
                key: 'NoticeType',
                label: 'Notice Title',
                width: '30',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value, row) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                        onClick={() => handleViewTaxTracker(row)}
                    />
                ),
            },
            {
                key: 'GovernmentCompliance',
                label: 'Government Compliance',
                width: '30',
                fixed: 'left',
                align: 'left',
                render: value => value || ''
            },
            {
                key: 'NoticeSection',
                label: 'Notice U / S',
                width: '30',
                fixed: 'left',
                align: 'left',
                render: value => value || ''
            },
            {
                key: 'FinancialYear',
                label: 'Financial Year',
                width: '30',
                fixed: 'left',
                align: 'left',
                render: value => value || ''
            },

            {
                key: 'Authority',
                label: 'Authority',
                width: '30',
                fixed: 'left',
                align: 'left',
                render: value => value || ''
            },

            {
                key: 'NoticeDate',
                label: 'Notice Date',
                width: '30',
                fixed: 'left',
                align: 'left',
                render: (value: any) => formatDate_dd_MonthName_yy(value),

            },
            {
                key: 'DueDate',
                label: 'Reply Due Date',
                width: '30',
                fixed: 'left',
                align: 'left',
                render: (value: any) => formatDate_dd_MonthName_yy(value),

            },
            {
                key: "NoticeStatus",
                label: "Notice Status",

                render: (_, row) => {

                    const { bg, text } = getNoticeStatusColor(row.NoticeStatus);

                    return (
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                                backgroundColor: bg,
                                color: text,
                            }}
                        >
                            {row.NoticeStatus}
                        </span>
                    );
                }
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '12',
                sortable: false,
                fixed: 'right',
                align: 'center',
                render: (_value, row) => {

                    if (!canAction) return null;

                    const isClosed = row.NoticeStatus === 'Closed';

                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (!isClosed) handleAddAppealModal(row)
                                }}
                                color="transparent"
                                style={{
                                    color: isClosed ? '#9ca3af' : 'blue',
                                    opacity: isClosed ? 0.5 : 1,
                                    cursor: isClosed ? 'not-allowed' : 'pointer',
                                }}
                                isborderRadius
                                size="sm"
                                title={isClosed ? 'Notice is closed' : 'Request Appeal'}
                                disabled={isClosed}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>


                            {row?.IsDelete === true && (
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (!row.IsDelete) {
                                            handleConfirmationDialogBoxOpen(row);
                                        }
                                    }}
                                    color="transparent"
                                    style={{
                                        color: row.IsDelete ? '#9ca3af' : 'red',
                                        opacity: row.IsDelete ? 0.5 : 1,
                                        cursor: row.IsDelete ? 'not-allowed' : 'pointer',
                                    }}
                                    isborderRadius
                                    size="sm"
                                    title={row.IsDelete ? 'Notice is already deleted' : 'Delete Tax Notice'}
                                    disabled={row.IsDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )
                }
            },
        ],
        [handleConfirmationDialogBoxOpen, handleAddAppealModal, handleViewTaxTracker]
    );

    const requiredTaxTrackerColumnKeys: string[] = ['NoticeType', 'GovernmentCompliance', 'Authority', 'NoticeDate', 'DueDate', 'NoticeStatus', 'Actions'];

    const allTaxTrackerColumnKeys: string[] = noticeSectionColumns.map(c => c.key);

    const [selectedTaxTrackerColumnKeys, setSelectedTaxTrackerColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getTaxTrackerTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredTaxTrackerColumnKeys]));

                return withRequired.filter(k => allTaxTrackerColumnKeys.includes(k));
            }
        } catch { }
        return allTaxTrackerColumnKeys;
    });

    useEffect(() => {
        setSelectedTaxTrackerColumnKeys(prev => Array.from(new Set([...prev, ...requiredTaxTrackerColumnKeys])).filter(k => allTaxTrackerColumnKeys.includes(k)));
    }, [noticeSectionColumns.length])

    const visibleTaxTrackerColumns = useMemo(
        () => noticeSectionColumns.filter(col => selectedTaxTrackerColumnKeys.includes(col.key)),
        [noticeSectionColumns, selectedTaxTrackerColumnKeys]
    );

    const handleDeleteTaxTracker = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteTaxTrackerData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteTaxTrackerRequest = {
                    TaxTrackerId: deleteTaxTrackerData.TaxTrackerId || 0,
                    Uniquekey: deleteTaxTrackerData.Uniquekey || "",

                };

                const response = await taxTrackerService.apiCallDeleteTaxTracker(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (taxTrackerList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });

                    await loadTaxTrackerList(pageToShow, filters, sortInfo);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteTaxTrackerData(null);
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
            "Deleting Tax Tracker",
        );
    };

    const handleRequestFieldChange = (field: keyof AddUpdateTaxTrackerDocumentRequest, value: any) => {
        setRequestFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };


    const validateRequestForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!requestFormData.RequestType) {
            newErrors.RequestType = "Request Type is required.";
        }

        if (!requestFormData.NoticeDescription) {
            newErrors.NoticeDescription = "Description is required.";
        }

        switch (requestFormData.RequestType) {

            case "Notice":
                if (!requestFormData.AuthorityType)
                    newErrors.AuthorityType = "Authority Type is required.";

                if (!requestFormData.AmountUnderDisputeDate)
                    newErrors.AmountUnderDisputeDate = "Notice Date is required.";

                if (!hasAnyDocumentFile(noticeDocumentURLFiles, noticeDocumentURL, removedNoticeDocumentURLs))
                    newErrors.NoticeDocumentURL = "Document is required.";

                if (!requestFormData.OfficerName)
                    newErrors.OfficerName = "Officer Name is required.";

                if (!requestFormData.OfficerAddress)
                    newErrors.OfficerAddress = "Officer Address is required.";

                break;

            case "Reply":
                if (!requestFormData.AmountUnderDisputeDate)
                    newErrors.AmountUnderDisputeDate = "Reply Date is required.";

                if (!hasAnyDocumentFile(noticeDocumentURLFiles, noticeDocumentURL, removedNoticeDocumentURLs))
                    newErrors.NoticeDocumentURL = "Document is required.";

                break;

            case "Order":
                if (!requestFormData.OrderStatus)
                    newErrors.OrderStatus = "Order Status is required.";

                if (
                    requestFormData.OrderStatus === "Non-Favourable" &&
                    !requestFormData.AuthorityType
                ) {
                    newErrors.AuthorityType = "Authority Type is required.";
                }

                if (!requestFormData.AmountUnderDisputeDate)
                    newErrors.AmountUnderDisputeDate =
                        requestFormData.OrderStatus === "Non-Favourable"
                            ? "Appeal Date is required."
                            : "Order Date is required.";

                if (
                    requestFormData.OrderStatus === "Non-Favourable" &&
                    !requestFormData.AmountUnderDispute
                ) {
                    newErrors.AmountUnderDispute = "Amount Under Dispute is required.";
                }

                if (
                    !hasAnyDocumentFile(
                        noticeDocumentURLFiles,
                        noticeDocumentURL,
                        removedNoticeDocumentURLs
                    )
                ) {
                    newErrors.NoticeDocumentURL = "Document is required.";
                }

                break;


            case "Close-Notice":
                if (!hasAnyDocumentFile(noticeDocumentURLFiles, noticeDocumentURL, removedNoticeDocumentURLs))
                    newErrors.NoticeDocumentURL = "Document is required.";
                break;

            default:
                break;
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushAddUpdateRequestForm = (): FormData => {

        switch (requestFormData.RequestType) {
            case "Reply":
                requestFormData.NoticeStatus = "Reply Submitted";
                break;

            case "Order":
                requestFormData.NoticeStatus = requestFormData.OrderStatus || "Reply Pending";
                break;

            case "Appeal":
                requestFormData.NoticeStatus = "Appeal Filed";
                break;

            case "Close-Notice":
                requestFormData.NoticeStatus = "Closed";
                break;

            case "Notice":
            default:
                requestFormData.NoticeStatus = "Reply Pending";
                break;

            case "Reopen":
                requestFormData.NoticeStatus = "Reopened";
                break;
        }

        const fd = new FormData();

        fd.append('TaxTrackerDocumentId', String(requestFormData.TaxTrackerDocumentId ?? 0));
        fd.append('Uniquekey', formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6');
        fd.append('TaxTrackerId', requestFormData.TaxTrackerId.toString());
        fd.append('AuthorityType', requestFormData.AuthorityType || '');
        fd.append('RequestType', requestFormData.RequestType || '');
        fd.append('NoticeDescription', requestFormData.NoticeDescription || '');
        fd.append('OfficerName', requestFormData.OfficerName || '');
        fd.append('OfficerAddress', requestFormData.OfficerAddress || '');
        fd.append('AmountUnderDisputeDate', requestFormData.AmountUnderDisputeDate || '');
        fd.append('AmountUnderDispute', requestFormData.AmountUnderDispute.toString());
        fd.append('OrderStatus', requestFormData.OrderStatus || '');
        fd.append('NoticeStatus', requestFormData.NoticeStatus || '');

        noticeDocumentURLFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('NoticeDocumentURL', file);
            }

        });

        const hasExistingFile = noticeDocumentURL && noticeDocumentURL.trim() !== "" && !removedNoticeDocumentURLs.includes(noticeDocumentURL);

        if (hasExistingFile) {
            fd.append('NoticeDocumentURL', noticeDocumentURL);
        }
        fd.append('RemoveNoticeDocumentURL', removedNoticeDocumentURLs.join(','));

        return fd;
    }

    const handleRequestForm = async (e?: React.FormEvent) => {

        e?.preventDefault();

        setErrors({});

        const validation = validateRequestForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload = PushAddUpdateRequestForm();

                const response = await taxTrackerDocumentService.apiCallAddUpdateTaxTrackerDocument(payload);

                if (E.isRight(response)) {

                    setTaxTrackerList((prev) =>
                        prev.map((row) =>
                            row.TaxTrackerId === requestFormData.TaxTrackerId
                                ? {
                                    ...row,
                                    NoticeStatus: requestFormData.NoticeStatus,
                                }
                                : row
                        )
                    );

                    setIsAddUpdateRequestAppealModalOpen(false);
                    setNoticeDocumentURL('');
                    setNoticeDocumentURLFiles([]);
                    setRemovedNoticeDocumentURLs([]);

                    setErrors({});
                    addToast({ type: "success", title: response.right.SuccessMessage[0] });
                    navigate(`/taxTracker`);

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },

            undefined,

            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}>{" "}  <div></div>{" "}  </Loader>

            <div>
                <div>
                    <TableActionToolbar
                        isShowSearchBar
                        searchTerm={searchTerm}
                        searchPlaceholder="Search By Notice Type"
                        onSearchChange={v => {
                            setSearchTerm(v);
                            debouncedSearch(v);
                        }}
                        onClearSearch={clearSearchTaxTrackerRecords}

                        isShowCustomizeButton
                        onCustomize={() => setIsShowCustomizeTaxTrackerColumnsModal(true)}

                        isShowFilterButton
                        filters={filters}
                        onOpenFilter={() => {
                            setTempFilters(filters);
                            setShowFilterPopup(true);
                        }}
                        isShowAddButton={canAction}
                        addTitle="Add "
                        onAdd={handleAddTaxTracker}
                        isShowImportButton={false}
                        isShowExportButton={canExport && taxTrackerList.length > 0}
                        onExportExcel={handleExportTaxTrackerExcel}
                        onExportPdf={handleExportTaxTrackerPdf}
                        exportLoading={isLoading}
                    />
                </div>
            </div>

            <CustomizeColumnsModal
                isOpen={isShowCustomizeTaxTrackerColumnsModal}
                onClose={() => setIsShowCustomizeTaxTrackerColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredTaxTrackerColumnKeys])
                    );
                    setSelectedTaxTrackerColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeTaxTrackerTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={noticeSectionColumns}
                selectedKeys={selectedTaxTrackerColumnKeys}
                requiredKeys={requiredTaxTrackerColumnKeys}
                title="Customize Table Columns"
            />

            <div className="">

                <DataTable
                    data={taxTrackerList}
                    columns={visibleTaxTrackerColumns}
                    pagination={taxTrackerPaginationInfo}
                    emptyMessage="No Tax Tracker Found"
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                />

                <DeleteDialog
                    isOpen={isConfirmationDialogBoxOpen}
                    onClose={() => {
                        setIsConfirmationDialogBoxOpen(false);
                        setDeleteTaxTrackerData(null);
                        setErrors({});
                        setNoticeDocumentURL('');
                        setNoticeDocumentURLFiles([])
                    }}
                    onConfirm={handleDeleteTaxTracker}
                    loading={isLoading}
                    pageName="Tax Tracker"
                />
            </div>

            <Modal
                isOpen={isAddUpdateRequestAppealModalOpen}
                onClose={() => {
                    setIsAddUpdateRequestAppealModalOpen(false)
                    setErrors({})
                    setRequestFormData(getInitialRequestFormState());

                    setNoticeDocumentURL("");
                    setNoticeDocumentURLFiles([]);
                    setRemovedNoticeDocumentURLs([]);
                }
                }
                title={
                    requestFormData.RequestType
                        ? `${requestFormData.RequestType}`
                        : "Requests"
                }
                onSubmit={handleRequestForm}
                saveText="Save"
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-4 p-6 bg-blue-100">

                    <div>
                        <SinglePageSelection
                            label="Request Type"
                            placeholder='Select Request Type'
                            required
                            value={requestFormData.RequestType || ''}
                            onChange={(e) =>
                                handleRequestFieldChange('RequestType', String(e))}
                            options={REQUEST_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                            error={errors.RequestType}
                        />
                    </div>

                    {requestFormData.RequestType === 'Notice' && (
                        <>
                            <div>
                                <SinglePageSelection
                                    label="Select Authority"
                                    placeholder='Select Authority'
                                    required
                                    value={requestFormData.AuthorityType || ''}
                                    onChange={(e) => handleRequestFieldChange('AuthorityType', String(e))}
                                    options={AUTHORITY_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.AuthorityType}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    label="Officer Name"
                                    placeholder="Officer Name"
                                    required
                                    value={requestFormData.OfficerName ?? ""}
                                    onChange={(e) => handleRequestFieldChange("OfficerName", e.target.value)}
                                    error={errors.OfficerName} />
                            </div>

                            <div>
                                <TextArea
                                    label="Divisional Address"
                                    placeholder="Divisional Address"
                                    required
                                    className='thin-scroll'
                                    value={requestFormData.OfficerAddress || ''}
                                    onChange={(e) => handleRequestFieldChange("OfficerAddress", e.target.value)}
                                    error={errors.OfficerAddress} />
                            </div>

                            <div>
                                <DatePickerInput
                                    label={`${requestFormData.RequestType} Date`}
                                    placeholder={`Enter ${requestFormData.RequestType} Date`}
                                    value={formatDate_dd_mm_yyyy(requestFormData.AmountUnderDisputeDate)}
                                    onChange={(val) => handleRequestFieldChange("AmountUnderDisputeDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                    required
                                    error={errors.AmountUnderDisputeDate} />
                            </div>

                            <div className="mt-5">
                                <MultiFilePicker
                                    label={`${requestFormData.RequestType} Document`}
                                    required
                                    placeholder={`Select ${requestFormData.RequestType} Document`}
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedNoticeDocumentURLs((prev) => [...prev, url]);
                                    }}
                                    error={errors.NoticeDocumentURL}
                                />
                            </div>
                        </>
                    )}

                    {requestFormData.RequestType === 'Reply' && (
                        <>
                            <div>
                                <DatePickerInput
                                    label="Date"
                                    placeholder="Enter Date"
                                    value={formatDate_dd_mm_yyyy(requestFormData.AmountUnderDisputeDate)}
                                    onChange={(val) => handleRequestFieldChange("AmountUnderDisputeDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                    required
                                    error={errors.AmountUnderDisputeDate} />
                            </div>
                            <div className="mt-5">
                                <MultiFilePicker
                                    label="Documents"
                                    required
                                    placeholder="Select Documents"
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedNoticeDocumentURLs((prev) => [...prev, url]);
                                    }}
                                    error={errors.NoticeDocumentURL}

                                />
                            </div>
                        </>
                    )}

                    {requestFormData.RequestType === 'Order' && (
                        <>
                            <div>
                                <SinglePageSelection
                                    label="Status"
                                    placeholder="Select Order Status"
                                    required
                                    value={requestFormData.OrderStatus || ""}
                                    onChange={(e) => handleRequestFieldChange("OrderStatus", String(e))}
                                    options={ORDER_STATUS_OPTIONS.map((opt) => ({
                                        label: opt.name,
                                        value: opt.id,
                                    }))}
                                    error={errors.OrderStatus}
                                />
                            </div>

                            {requestFormData.OrderStatus && (
                                <div>
                                    <DatePickerInput
                                        label={
                                            requestFormData.OrderStatus === "Non-Favourable"
                                                ? "Appeal Date"
                                                : "Order Date"
                                        }
                                        placeholder="Enter Date"
                                        value={formatDate_dd_mm_yyyy(requestFormData.AmountUnderDisputeDate)}
                                        onChange={(val) =>
                                            handleRequestFieldChange(
                                                "AmountUnderDisputeDate",
                                                convert_dd_mm_yyyy_To_Yyyy_mm_dd(val)
                                            )
                                        }
                                        required
                                        error={errors.AmountUnderDisputeDate}
                                    />
                                </div>
                            )}

                            {requestFormData.OrderStatus === "Non-Favourable" && (
                                <div>
                                    <div>
                                        <SinglePageSelection
                                            label="Select Authority"
                                            placeholder='Select Authority'
                                            required
                                            value={requestFormData.AuthorityType || ''}
                                            onChange={(e) => handleRequestFieldChange('AuthorityType', String(e))}
                                            options={AUTHORITY_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                            error={errors.AuthorityType}
                                        />
                                    </div>

                                    <div className="mt-5">
                                        <Input
                                            label="Amount Under Dispute"
                                            placeholder="Enter Amount"
                                            value={requestFormData.AmountUnderDispute || ''}
                                            required
                                            onChange={(e) =>
                                                handleRequestFieldChange(
                                                    "AmountUnderDispute",
                                                    filterNumbersWithDecimal(e.target.value) || ""
                                                )
                                            }
                                            error={errors.AmountUnderDispute}
                                            rightIcon="₹"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-5">
                                <MultiFilePicker
                                    label={
                                        requestFormData.OrderStatus === "Non-Favourable"
                                            ? "Appeal Document"
                                            : requestFormData.OrderStatus === "Favourable"
                                                ? "Document"
                                                : `${requestFormData.RequestType} Document`
                                    }
                                    required
                                    placeholder={`Select ${requestFormData.RequestType} Document`}
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedNoticeDocumentURLs((prev) => [...prev, url]);
                                    }}
                                    error={errors.NoticeDocumentURL}
                                />
                            </div>
                        </>
                    )}

                    {requestFormData.RequestType === 'Close-Notice' && (
                        <>
                            <div className="mt-5">
                                <MultiFilePicker
                                    label={`${requestFormData.RequestType} Document`}
                                    required
                                    placeholder={`Select ${requestFormData.RequestType} Document`}
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedNoticeDocumentURLs((prev) => [...prev, url]);
                                    }}
                                    error={errors.NoticeDocumentURL}

                                />
                            </div>

                        </>
                    )}

                    <div className="mt-5">
                        <TextArea
                            label="Description"
                            placeholder="Enter Description"
                            required
                            className='thin-scroll'
                            value={requestFormData.NoticeDescription || ''}
                            onChange={(e) => handleRequestFieldChange("NoticeDescription", e.target.value)}
                            error={errors.NoticeDescription} />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showFilterPopup}
                onClose={() => {
                    setShowFilterPopup(false);
                }}
                title="Filter By Notice Sections"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply"
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"

            >
                <div className="space-y-10">
                    <div className="space-y-4">
                        <div>
                            <SingleSelectDropdownWithPagination
                                label="Company Name"
                                title="All Companies"
                                size="lg"
                                dataFetchCallBack={fetchCompanyMasterDropdown}
                                onSelected={(item) => {
                                    const companyId = item ? Number(item.value) : 0;
                                    const companyName = item?.label || "";

                                    setTempFilters((prev) => ({
                                        ...prev,
                                        CompanyId: companyId ? String(companyId) : "",
                                        CompanyName: companyName || "",
                                    }));
                                }}
                                initialValue={
                                    tempFilters.CompanyId && tempFilters.CompanyName
                                        ? { value: tempFilters.CompanyId, label: tempFilters.CompanyName }
                                        : undefined
                                }
                            />
                            <div className="mt-5">
                                <Input
                                    type="text"
                                    label='Notice Title'
                                    value={tempFilters.NoticeType || ''}
                                    onChange={(e) => {
                                        setTempFilters({
                                            ...tempFilters,
                                            NoticeType: e.target.value
                                        });
                                    }}
                                    placeholder="Enter Notice Title"
                                    maxLength={70}

                                />
                            </div>
                            <div className="mt-5">

                                <Input
                                    label='Notice U/S'
                                    type="text"
                                    value={tempFilters.NoticeSection}
                                    maxLength={100}
                                    onChange={e => handleFilterChange("NoticeSection", e.target.value)}
                                    placeholder="Enter Notice U/S"
                                />
                            </div>
                            <div className="mt-5">
                                <Input
                                    label='Authority'
                                    type="text"
                                    value={tempFilters.Authority || ''}
                                    onChange={e => handleFilterChange("Authority", e.target.value)}
                                    placeholder="Enter Authority"
                                    maxLength={70}
                                />
                            </div>
                            <div className="mt-5">
                                <Input
                                    label='Financial Year'
                                    type="text"
                                    value={tempFilters.FinancialYear || ''}
                                    onChange={e => handleFilterChange("FinancialYear", e.target.value)}
                                    placeholder="Enter Financial Year"
                                    maxLength={7}
                                />
                            </div>
                            <div className="mt-5">
                                <Input
                                    label='Government Compliance'
                                    type="text"
                                    value={tempFilters.GovernmentCompliance || ''}
                                    onChange={e => handleFilterChange("GovernmentCompliance", e.target.value)}
                                    placeholder="Enter Government Compliance"
                                    maxLength={70}
                                />
                            </div>

                            <div className="mt-5">
                                <DatePickerInput
                                    label='From Notice Date'
                                    value={formatDate_dd_mm_yyyy(tempFilters.FromNoticeDate)}
                                    onChange={(value) => handleFilterChange('FromNoticeDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) ?? '')}
                                />
                            </div>

                            <div className="mt-5">
                                <DatePickerInput
                                    label='To Notice Date'
                                    value={formatDate_dd_mm_yyyy(tempFilters.ToNoticeDate)}
                                    onChange={(value) => handleFilterChange('ToNoticeDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) ?? '')}
                                />
                            </div>

                            <div className="mt-5">
                                <SinglePageSelection
                                    label="Status"
                                    onChange={(e) => {
                                        setTempFilters({
                                            ...tempFilters,
                                            NoticeStatus: String(e)
                                        });
                                    }}
                                    options={NOTICE_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    value={tempFilters.NoticeStatus}
                                    placeholder="Select Status"
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default TaxTracker;