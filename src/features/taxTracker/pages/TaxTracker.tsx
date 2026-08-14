import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddUpdateTaxTrackerRequest, DeleteTaxTrackerRequest, FilterWithPaginationTaxTrackerRequest, TaxTrackerData, TaxTrackerDocumentDetailsData } from "@/features/taxTracker/models/TaxTrackerModel";
import usePagination from "@/core/hooks/usePagination";
import { useTaxTrackerListState } from "@/features/taxTracker/context/TaxTrackerListStateContext";
import { taxTrackerService } from "@/features/taxTracker/services/TaxTrackerService";
import { handleExportFile } from "@/core/utils/exportFile";
import useToast from "@/core/hooks/useToast";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { AUTHORITY_OPTIONS, ORDER_STATUS_OPTIONS, REQUEST_TYPE_OPTIONS } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import * as E from 'fp-ts/Either';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { useNavigate } from "react-router-dom";
import Tabs from "@/ui/components/Tab/Tab";
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
    const [filters, setFilters] = useState<FilterInfo>({});
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteTaxTrackerData, setDeleteTaxTrackerData] = useState<TaxTrackerData | null>(null);
    const [requestFormData, setRequestFormData] = useState<AddUpdateTaxTrackerDocumentRequest>(() => getInitialRequestFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isAddUpdateRequestAppealModalOpen, setIsAddUpdateRequestAppealModalOpen] = useState(false);
    const [noticeDocumentURLFiles, setNoticeDocumentURLFiles] = useState<(File | string)[]>([]);
    const [noticeDocumentURL, setNoticeDocumentURL] = useState<string>("");
    const [removedNoticeDocumentURLs, setRemovedNoticeDocumentURLs] = useState<string[]>([]);

    const { canAction, canExport } = useMenuPermissions();
    const { pagination, setPagination } = usePagination(20);
    const { listState, updateListState } = useTaxTrackerListState();
    const { page } = listState;
    const { addToast } = useToast();
    const navigate = useNavigate();

    const noticeSectionList = [
        { id: "Income Tax", label: "Income Tax" },
        { id: "GST", label: "GST" },
        { id: "PT", label: "PT" },
        { id: "PF", label: "PF" },
        { id: "ESIC", label: "ESIC" },
        { id: "Other", label: "Other" },
    ];

    const [activeTab, setActiveTab] = useState<string>(noticeSectionList[0].id);

    const [dropdownLabels, setDropdownLabels] = useState<{ companyName?: string; }>(() => ({
        companyName: listState.CompanyName || undefined,
    }));
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

                const newActiveTab = filterParams.GovernmentCompliance?.toString().trim() ||
                    activeTab?.trim() ||
                    undefined;

                const params: FilterWithPaginationTaxTrackerRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    GovernmentCompliance: newActiveTab,
                    NoticeSection: searchtext ?? filterParams.NoticeSection ?? undefined,
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

                if (!requestFormData.AmountUnderDispute)
                    newErrors.AmountUnderDispute = "Amount is required.";

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

            case "Other":
                if (!requestFormData.AuthorityType)
                    newErrors.AuthorityType = "Authority Type is required.";

                if (!requestFormData.AmountUnderDisputeDate)
                    newErrors.AmountUnderDisputeDate = "Date is required.";

                if (!requestFormData.AmountUnderDispute)
                    newErrors.AmountUnderDispute = "Amount is required.";

                if (!hasAnyDocumentFile(noticeDocumentURLFiles, noticeDocumentURL, removedNoticeDocumentURLs))
                    newErrors.NoticeDocumentURL = "Document is required.";

                break;
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushAddUpdateRequestForm = (): FormData => {

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

    const handleAddTaxTracker = useCallback(() => {
        navigate("/taxTracker/add/");
    }, [navigate]);

    const handleViewTaxTracker = useCallback((item: TaxTrackerData) => {
        updateListState({
            TaxTrackerId: item.TaxTrackerId ?? 0,
            NoticeType: item.NoticeType ?? "",
            CompanyName: item.CompanyName ?? "",
            FinancialYear: item.FinancialYear ?? ""
        });
        navigate('/taxTracker/view');
    }, [navigate, updateListState],);

    const handleAddAppealModal = useCallback((row: TaxTrackerData) => {
        setIsAddUpdateRequestAppealModalOpen(true);
        setRequestFormData(() => ({
            ...getInitialRequestFormState(),
            TaxTrackerId: row.TaxTrackerId ?? 0,
        }));
    }, [])


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

    const handleFieldChange = (field: keyof AddUpdateTaxTrackerRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleRequestFieldChange = (field: keyof AddUpdateTaxTrackerDocumentRequest, value: any) => {
        setRequestFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);

        const updatedFilters = {
            ...filters,
            ModuleName: filters.ModuleName || activeTab
        };

        loadTaxTrackerList(1, updatedFilters, sort);
    }, [filters, activeTab]);


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



                    const newEntry: TaxTrackerDocumentDetailsData = {
                        TaxTrackerDocumentId: null,
                        Uniquekey: null,
                        TaxTrackerId: requestFormData.TaxTrackerId,
                        RequestType: requestFormData.RequestType,
                        AuthorityType: requestFormData.AuthorityType,
                        NoticeDocumentURL: null,
                        NoticeDescription: requestFormData.NoticeDescription,
                        OfficerName: requestFormData.OfficerName,
                        OfficerAddress: requestFormData.OfficerAddress,
                        AmountUnderDisputeDate: requestFormData.AmountUnderDisputeDate,
                        AmountUnderDispute: requestFormData.AmountUnderDispute,
                        OrderStatus: requestFormData.OrderStatus,
                        NoticeStatus: requestFormData.NoticeStatus,
                        Description: null,
                        CreatedById: 0,
                        CreatedBy: '',
                        CreatedDate: null,
                        ModifiedById: 0,
                        ModifiedBy: '',
                        ModifiedDate: null,
                    };

                    setTaxTrackerList((prev) =>
                        prev.map((row) =>
                            row.TaxTrackerId === requestFormData.TaxTrackerId
                                ? {
                                    ...row,
                                    TaxTrackerDocumentDetailsData: [
                                        ...(row.TaxTrackerDocumentDetailsData ?? []),
                                        newEntry,
                                    ],
                                }
                                : row
                        )
                    );

                    setIsAddUpdateRequestAppealModalOpen(false);
                    setNoticeDocumentURL('');
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

    const noticeSectionColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'NoticeType',
                label: 'Notice Type',
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
                key: 'CompanyName',
                label: 'Company Name',
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
                key: 'NoticeSection',
                label: 'Notice U / S',
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
                label: 'Due Date',
                width: '30',
                fixed: 'left',
                align: 'left',
                render: (value: any) => formatDate_dd_MonthName_yy(value),

            },
            {
                key: "NoticeStatus",
                label: "Notice Status",

                render: (_, row) => {
                    const latestRequest = row.TaxTrackerDocumentDetailsData?.[row.TaxTrackerDocumentDetailsData.length - 1];

                    let status = "Reply Pending";

                    switch (latestRequest?.RequestType) {
                        case "Reply":
                            status = "Reply Submitted";
                            break;

                        case "Order":
                            status = latestRequest.OrderStatus || "Reply Pending";
                            break;

                        case "Appeal":
                            status = "Appeal Filed";
                            break;

                        case "Close-Notice":
                            status = "Closed";
                            break;

                        case "Notice":
                        default:
                            status = "Reply Pending";
                            break;
                    }

                    const { bg, text } = getNoticeStatusColor(status);

                    return (
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                                backgroundColor: bg,
                                color: text,
                            }}
                        >
                            {status}
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

                    const isClosed = Array.isArray(row.TaxTrackerDocumentDetailsData) &&
                        row.TaxTrackerDocumentDetailsData.some((item: any) => item.RequestType === 'Close-Notice');
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

                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (!isClosed) handleConfirmationDialogBoxOpen(row)
                                }}
                                color="transparent"
                                style={{
                                    color: isClosed ? '#9ca3af' : 'red',
                                    opacity: isClosed ? 0.5 : 1,
                                    cursor: isClosed ? 'not-allowed' : 'pointer',
                                }}
                                isborderRadius
                                size="sm"
                                title={isClosed ? 'Notice is closed' : 'Delete Tax Notice'}
                                disabled={isClosed}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                }
            },
        ],
        [handleConfirmationDialogBoxOpen, handleAddAppealModal, handleViewTaxTracker]
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}>{" "}  <div></div>{" "}  </Loader>

            <div className="flex flex-row items-end justify-between gap-4 w-full flex-wrap md:flex-nowrap">

                <div className="flex gap-3 flex-1 min-w-[200px]">
                    <div className="w-full md:w-[450px] lg:w-[550px]">

                        <SingleSelectDropdownWithPagination
                            label="Company"
                            title="All Companies"
                            size="lg"
                            dataFetchCallBack={fetchCompanyMasterDropdown}
                            onSelected={(item) => {
                                const companyId = item ? Number(item.value) : 0;
                                const companyName = item?.label || "";

                                handleFieldChange("CompanyId", companyId);

                                setDropdownLabels((prev) => ({
                                    ...prev,
                                    companyName: companyName,
                                }));

                                updateListState({
                                    page: 1,
                                    CompanyId: companyId,
                                    CompanyName: companyName,
                                    filters: {
                                        ...listState.filters,
                                        CompanyId: String(companyId),
                                        CompanyName: companyName,
                                    },
                                });

                                loadTaxTrackerList(
                                    1,
                                    { ...filters, CompanyId: String(companyId) },
                                    sortInfo,
                                    undefined,
                                    companyId,
                                    formData.FinancialYear || undefined
                                );
                            }}
                            initialValue={createDropdownInitialValue(formData.CompanyId, dropdownLabels.companyName)}
                        />
                    </div>
                </div>

                <div className="flex-shrink-0 pb-1">
                    <TableActionToolbar
                        isShowSearchBar={false}
                        isShowFilterButton={false}
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

            <div className="mt-5">
                <Tabs
                    tabs={noticeSectionList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                        setFormData((prev) => ({
                            ...prev,
                            CompanyId: 0,
                            FinancialYear: '',
                        }));
                        setDropdownLabels({ companyName: undefined });

                        const newFilters: FilterInfo = {
                            GovernmentCompliance: t.id,
                        };
                        setFilters(newFilters);
                        updateListState({
                            filters: newFilters,
                            page: 1,
                            CompanyId: 0,
                            CompanyName: '',
                            FinancialYear: '',
                        });
                        loadTaxTrackerList(1, newFilters);
                    }}
                />
            </div>

            <div className="mt-5">
                <DataTable
                    data={taxTrackerList}
                    columns={noticeSectionColumns}
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

                            <div>
                                <Input
                                    label="Amount Under Dispute (₹)"
                                    placeholder="Enter Amount"
                                    value={requestFormData.AmountUnderDispute || ''}
                                    onChange={(e) => handleRequestFieldChange('AmountUnderDispute', filterNumbersWithDecimal(e.target.value) || "")}
                                    error={errors.AmountUnderDispute}
                                    rightIcon="₹"
                                    required
                                />
                            </div>


                            <div className="mt-5">
                                <MultiFilePicker
                                    label={`${requestFormData.RequestType} Document`}
                                    required
                                    placeholder={`Select ${requestFormData.RequestType} Document`}
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
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
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
                                    onRemoveExisting={(url) => {
                                        setRemovedNoticeDocumentURLs((prev) => [...prev, url]);
                                    }}
                                    error={errors.NoticeDocumentURL}

                                />
                            </div>
                        </>
                    )}
                    {requestFormData.RequestType === 'Other' && (
                        <>
                            <div>
                                <SinglePageSelection
                                    label="Authority"
                                    placeholder='Select Authority'
                                    required
                                    value={requestFormData.AuthorityType || ''}
                                    onChange={(e) => handleRequestFieldChange('AuthorityType', String(e))}
                                    options={AUTHORITY_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.AuthorityType}
                                />
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

                            <div>
                                <Input
                                    label="Amount Under Dispute"
                                    placeholder="Enter Amount"
                                    value={requestFormData.AmountUnderDispute || ''}
                                    onChange={(e) => handleRequestFieldChange('AmountUnderDispute', e.target.value)}
                                    error={errors.AmountUnderDispute}
                                    type='number'
                                />
                            </div>

                            <div className="mt-5">
                                <MultiFilePicker
                                    label={`${requestFormData.RequestType} Document`}
                                    required
                                    placeholder={`Select ${requestFormData.RequestType} Document`}
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
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
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
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
        </div>
    )
}

export default TaxTracker;