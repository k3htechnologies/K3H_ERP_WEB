import { useCallback, useEffect, useMemo, useState } from "react";
import type { BrokerageInvoiceData, DeleteBrokerageInvoiceRequest, FilterWithPaginationBrokerageInvoiceRequest } from "@/features/brokerage/models/BrokerageInvoiceModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import { brokerageInvoiceService } from "@/features/brokerage/services/BrokerageInvoiceService";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useNavigate } from "react-router-dom";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Button } from "@/ui/components/forms";
import { Edit, Trash2 } from "lucide-react";
import Tabs from "@/ui/components/Tab/Tab";
import type { DeletePaidBrokerageBookingRequest, FilterWithPaginationPaidBrokerageBookingRequest, PaidBrokerageBookingData } from "@/features/brokerage/models/PaidBrokerageBookingModel";
import { PaidBrokerageBookingService } from "@/features/brokerage/services/PaidBrokerageBookingService";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { useBookingBrokerageListState } from "@/features/brokerage/context/BookingBrokerageListStateContext";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import DataTableExpandable from "@/ui/components/DataTable/DataTableExpandable";
import type { PaginationInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { formatCurrency, getSafeString } from "@/core/utils/comman";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { handleExportFile } from "@/core/utils/exportFile";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";

export const ViewBrokerageInvoice: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [brokerageInvoiceList, setBrokerageInvoiceList] = useState<BrokerageInvoiceData[]>([]);

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteBrokerageInvoiceData, setDeleteBrokerageInvoiceData] = useState<BrokerageInvoiceData | null>(null)

    const [paidBrokerageBookingList, setPaidBrokerageBookingList] = useState<PaidBrokerageBookingData[]>([]);


    const [isConfirmationDialogBoxOpenForPayment, setIsConfirmationDialogBoxOpenForPayment] = useState(false)
    const [deletePaidBrokerageBookingData, setDeletePaidBrokerageBookingData] = useState<PaidBrokerageBookingData | null>(null)

    const { canView: canInVoiceView } = useMenuPermissions('/invoice');

    const { canView: canMakePaymentView } = useMenuPermissions('/makePayment');

    const { projectId } = useProject();

    const navigate = useNavigate();

    const { addToast } = useToast();

    const { canAction, canExport } = useMenuPermissions('/invoice');
    const { canAction: canMakePaymentAction } = useMenuPermissions('/makePayment');
    const { canExport: canMakePaymentExport } = useMenuPermissions('/makePayment');

    const { pagination, setPagination } = usePagination(20);

    const { listState } = useBookingBrokerageListState();

    const channelPartnerName = listState.cpName || '';
    const channelPartnerCompanyName = listState.cpCompany || '';

    const bookingId = listState.bookingId || '';

    const brokerageTabList: { id: string; label: string }[] = [

        canInVoiceView ? { id: "Invoice", label: "Invoice" } : null,
        canMakePaymentView ? { id: "Payment", label: "Payment" } : null,

    ].filter(Boolean) as { id: string; label: string }[];

    const [activeTab, setActiveTab] = useState<string>(brokerageTabList[0]?.id ?? "");

    const [searchInvoiceNumber, setSearchInvoiceNumber] = useState('')
    const debouncedSearchForInvoiceNumber = useDebouncedCallback((value: string) => {
        searchByInvoiceNumber(value)
    }, 350)

    const [searchPaidInvoiceNumber, setSearchPaidInvoiceNumber] = useState('')
    const debouncedSearchForPaidInvoiceNumber = useDebouncedCallback((value: string) => {
        searchByPaidInvoiceNumber(value)
    }, 350)

    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [invoiceAmount, setInvoiceAmount] = useState<number | null>(0);

    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<BrokerageInvoiceData | null>(null);


    useEffect(() => {

        if (!projectId) return;

        loadBrokerageInvoice(1);

    }, [projectId]);

    const loadBrokerageInvoice = async (page: number, searchText = "") => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBrokerageInvoiceRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    InvoiceNumber: searchText,
                };

                const response = await brokerageInvoiceService.apiCallPullBrokerageInvoice(params);

                if (E.isRight(response)) {

                    setBrokerageInvoiceList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Brokerage Invoice'
        );
    };

    const handlePageChange = useCallback((newPage: number) => {
        loadBrokerageInvoice(newPage);
    }, [loadBrokerageInvoice]);

    const searchByInvoiceNumber = async (searchValue: string) => {

        setSearchInvoiceNumber(searchValue);
        await loadBrokerageInvoice(1, searchValue);

    }
    const clearSearchByInvoiceNumber = async () => {
        setSearchInvoiceNumber('');
        debouncedSearchForInvoiceNumber.cancel?.();
        await loadBrokerageInvoice(1, "");
    }

    const handleAddBrokerageInvoice = (BrokerageInvoiceId: number) => {
        navigate(`/brokerage/brokerageInvoice/add/${BrokerageInvoiceId}`);
    };

    const handleAddPaidBrokerageBooking = (row: BrokerageInvoiceData) => {
        navigate(`/brokerage/PaidBrokerageBooking/add/${row.BrokerageInvoiceId}`, {
            state: {
                InvoiceAmount: Number(row.InvoiceAmount || 0),
                PaidAmount: Number(row.PaymentAmount || 0),
            },
        });
    };


    const handleConfirmationDialogBoxOpen = useCallback((row: BrokerageInvoiceData) => {
        setDeleteBrokerageInvoiceData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const handleExportInvoice = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBrokerageInvoiceRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    InvoiceNumber: searchInvoiceNumber?.trim() || "",
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    ExportType: exportType
                };

                const response = await brokerageInvoiceService.apiCallPullBrokerageInvoice(params);

                handleExportFile(response, exportType, 'Invoice Summary', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportInvoiceExcel = () => handleExportInvoice('Excel')
    const handleExportInvoicePdf = () => handleExportInvoice('PDF')


    const invoicePaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const brokerageInvoiceListForTable = useMemo(() => brokerageInvoiceList, [brokerageInvoiceList]);

    const handleDeleteBrokerageInvoice = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteBrokerageInvoiceData) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteBrokerageInvoiceRequest = {

                    BookingId: deleteBrokerageInvoiceData.BookingId || 0,

                    Uniquekey: deleteBrokerageInvoiceData.Uniquekey || "",

                    ProjectId: deleteBrokerageInvoiceData.ProjectId || 0,

                    BrokerageInvoiceId: deleteBrokerageInvoiceData.BrokerageInvoiceId || 0,
                };

                const response = await brokerageInvoiceService.apiCallDeleteBrokerageInvoice(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (brokerageInvoiceList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadBrokerageInvoice(pageToShow);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteBrokerageInvoiceData(null);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Brokerage Invoice"
        );
    };

    const handleApprovalLog = (row: BrokerageInvoiceData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "BROKERAGE INVOICE APPROVAL",
            Id: row.BrokerageInvoiceId ?? 0,
            ProjectId: row.ProjectId ?? 0,
        };
        setInvoiceAmount(row?.InvoiceAmount ?? 0);

        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectDocument = (row: BrokerageInvoiceData, approvalType: "approve" | "reject") => {

        setApprovalRowData(row);
        setInvoiceAmount(row?.InvoiceAmount ?? 0);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const brokerageInvoiceColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'InvoiceNumber',
                label: 'Invoice Number',
                width: '30',
                sortable: false,
                fixed: 'left',
                align: 'left',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.UploadInvoiceURL)}
                            title="Invoice Document"
                            triggerLabel={value || '-'}
                            isWrap={false}
                        />
                    );
                }
            },
            {
                key: 'InvoiceDate',
                label: 'Invoice Date ',
                width: '14',
                align: 'left',
                render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
            },

            {
                key: "InvoiceAmount",
                label: "Invoice Amount",
                width: "14",
                sortable: false,
                align: "right",
                render: value => value || '0'
            },
            {
                key: "PaymentAmount",
                label: "Paid Invoice Amount",
                width: "14",
                sortable: false,
                align: "right",
                render: value => value || '0'
            },
            {
                key: "PendingAmount",
                label: "Pending Amount",
                width: "14",
                sortable: false,
                align: "right",
                render: (_, row) => {
                    const invoice = Number(row.InvoiceAmount || 0);
                    const paid = Number(row.PaymentAmount || 0);
                    const pending = invoice - paid;

                    return pending >= 0 ? pending : 0;
                }
            },

            {
                key: 'Actions',
                label: 'Actions',
                width: '12',
                fixed: 'right',
                align: 'center',
                render: (_value, row) => {

                    const status = row.ApprovalStatus?.toUpperCase() || "";

                    const isApproved = status.includes("APPROVED");

                    const isLocked = !canAction || isApproved;

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
                                    handleAddBrokerageInvoice(row.BrokerageInvoiceId)
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
            {
                key: "ApprovalStatus",
                label: "Approval Status",
                width: "18",
                sortable: false,
                align: "center",
                render: (value, row) => (

                    <ApprovalActions
                        approvalStatus={value || "-"}
                        showApproval={row.IsApproval}
                        isIcons={true}
                        onHistory={() => handleApprovalLog(row)}
                        onApprove={() => handleApproveRejectDocument(row, "approve")}
                        onReject={() => handleApproveRejectDocument(row, "reject")}
                    />

                )
            },


        ], [handleAddBrokerageInvoice, handleConfirmationDialogBoxOpen, handleApprovalLog, handleApproveRejectDocument]
    );

    const fetchPaidBrokerageBookingList = async (searchText = "") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPaidBrokerageBookingRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    InvoiceNumber: searchText,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                };
                const response = await PaidBrokerageBookingService.apiCallPullPaidBrokerageBooking(params);

                if (E.isRight(response)) {

                    setPaidBrokerageBookingList(response.right.Data);

                } else {

                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Paid Amount",
        );
    };

    const searchByPaidInvoiceNumber = async (searchValue: string) => {

        setSearchPaidInvoiceNumber(searchValue);
        await fetchPaidBrokerageBookingList(searchValue);

    }
    const clearSearchByPaidInvoiceNumber = async () => {
        setSearchPaidInvoiceNumber('');
        debouncedSearchForPaidInvoiceNumber.cancel?.();
        await fetchPaidBrokerageBookingList("");
    }

    const handleExportInvoicePaymentPaid = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationPaidBrokerageBookingRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    InvoiceNumber: searchPaidInvoiceNumber?.trim() || "",
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    ExportType: exportType
                };

                const response = await PaidBrokerageBookingService.apiCallPullPaidBrokerageBooking(params);

                handleExportFile(response, exportType, 'Invoice Paid Summary', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportInvoicePaymentPaidExcel = () => handleExportInvoicePaymentPaid('Excel')
    const handleExportInvoicePaymentPaidPdf = () => handleExportInvoicePaymentPaid('PDF')

    const handleConfirmationDialogBoxOpenForPayment = useCallback((row: PaidBrokerageBookingData) => {
        setDeletePaidBrokerageBookingData(row)
        setIsConfirmationDialogBoxOpenForPayment(true)
    }, [])

    const handleDeletePaidPayment = async () => {

        setIsConfirmationDialogBoxOpenForPayment(false);

        if (!deletePaidBrokerageBookingData) return;

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeletePaidBrokerageBookingRequest = {

                    PaidBrokerageBookingId: deletePaidBrokerageBookingData.PaidBrokerageBookingId || 0,

                    Uniquekey: deletePaidBrokerageBookingData.Uniquekey || "",

                    BookingId: deletePaidBrokerageBookingData.BookingId || 0,

                    ProjectId: deletePaidBrokerageBookingData.ProjectId || 0,

                    BrokerageInvoiceId: deletePaidBrokerageBookingData.BrokerageInvoiceId || 0,
                };

                const response = await PaidBrokerageBookingService.apiCallDeletePaidBrokerageBooking(params);

                if (E.isRight(response)) {

                    await fetchPaidBrokerageBookingList();

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpenForPayment(false);
                    setDeletePaidBrokerageBookingData(null);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Payment"
        );
    };

    const handleBackToListBrokerage = () => {
        navigate("/brokerage");
    };

    const handleApprovalSubmit = async (remark: string) => {

        if (!approvalRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "BROKERAGE INVOICE APPROVAL",
            Id: approvalRowData.BrokerageInvoiceId ?? 0,
            ProjectId: approvalRowData.ProjectId ?? 0,
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);

                    await loadBrokerageInvoice(1, searchInvoiceNumber?.trim() || "");

                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            approvalActionType === "approve" ? "Approving Booking" : "Rejecting Booking"
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 ">
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <HeaderActionBar
                titleText='Invoices : '
                subTitleText={channelPartnerName}
                subSubTitleText={channelPartnerCompanyName}
                onCancel={() => handleBackToListBrokerage()}
                cancelText="Cancel"
                isLoading={isLoading}
            />

            <div className="pt-5">
                <Tabs
                    tabs={brokerageTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                        if (t.id === "Invoice") {

                            loadBrokerageInvoice(1);

                        } else if (t.id === "Payment") {
                            fetchPaidBrokerageBookingList();
                        }
                    }}
                />
            </div>

            {activeTab === "Invoice" && (
                <div className="pt-5 space-y-4">
                    <TableActionToolbar
                        searchTerm={searchInvoiceNumber}
                        searchPlaceholder="Search By Invoice Number"
                        onSearchChange={(v) => {
                            setSearchInvoiceNumber(v)
                            debouncedSearchForInvoiceNumber(v)
                        }}
                        onClearSearch={clearSearchByInvoiceNumber}

                        isShowAddButton={canAction && activeTab === "Invoice" ? true : false}
                        addTitle="Add"
                        onAdd={() => handleAddBrokerageInvoice(0)}

                        // EXPORT
                        isShowExportButton={canExport && brokerageInvoiceListForTable.length > 0}
                        onExportExcel={handleExportInvoiceExcel}
                        onExportPdf={handleExportInvoicePdf}
                        exportLoading={isLoading}
                    />

                    <DataTableExpandable
                        data={brokerageInvoiceListForTable}
                        columns={brokerageInvoiceColumns}
                        pagination={invoicePaginationInfo}
                        emptyMessage='No Invoice Data Found'
                        loading={isLoading}
                        fixedHeight
                        recordsPerPage={20}
                        expandable={{
                            keyField: 'BrokerageInvoiceId',
                            alwaysFetchOnOpen: false,
                            fetchRow: async (row) => {
                                return row;
                            },

                            renderRow: (row: BrokerageInvoiceData) => {

                                const invoice = Number(row.InvoiceAmount || 0);
                                const paid = Number(row.PaymentAmount || 0);
                                const pending = invoice - paid;

                                return (

                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-700">
                                                <FieldItem label="Account Holder Name" value={row.AccountName} isRow />

                                                <FieldItem label="Invoice Amount" value={formatCurrency(row.InvoiceAmount)} isRow />

                                                <FieldItem label="Invoice Date" value={formatDate_dd_MonthName_yy(row.InvoiceDate ?? '')} isRow />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {canMakePaymentAction && row.ApprovalStatus.toUpperCase() === "APPROVED" && (
                                                    <div className="ml-4 whitespace-nowrap">

                                                        {pending > 0 ? (
                                                            <Button
                                                                color="green"
                                                                size="sm"
                                                                onClick={() => handleAddPaidBrokerageBooking(row)}
                                                            >
                                                                Make Payment
                                                            </Button>
                                                        ) : (
                                                            <span className="text-green-600 font-medium">
                                                                Fully Paid
                                                            </span>
                                                        )}

                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 text-sm pt-5">
                                            <div className="space-y-3">
                                                <h3 className="font-semibold mb-2">Invoice Details</h3>


                                                <FieldItem label="Account Number" value={row.AccountNumber} />
                                                <FieldItem label="Bank Name" value={row.BankName} />
                                                <FieldItem label="Remark" value={row.Remark} />
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="font-semibold mb-2">&nbsp;</h3>

                                                <FieldItem label="IFSC Code" value={row.IFSCCode} />
                                                <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(row.DueDate ?? '')} />
                                            </div>



                                            <div className="space-y-3">
                                                <h3 className="font-semibold mb-2">Action Details</h3>

                                                <FieldItem label="Created By" value={row?.CreatedBy ?? "-"} />
                                                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(row?.CreatedDate ?? "-")} />
                                                <FieldItem label="Modified By" value={row?.ModifiedBy ?? "-"} />
                                                <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(row?.ModifiedDate ?? "-")} />
                                            </div>
                                        </div>
                                    </div>

                                );
                            },

                            expandButton: { openText: 'Hide', closeText: 'Show' }
                        }}
                    />

                </div>
            )}

            {activeTab === 'Payment' && (
                <div className="space-y-3 pt-5">

                    <TableActionToolbar
                        searchTerm={searchPaidInvoiceNumber}
                        searchPlaceholder="Search By Invoice Number"
                        onSearchChange={(v) => {
                            setSearchPaidInvoiceNumber(v)
                            debouncedSearchForPaidInvoiceNumber(v)
                        }}
                        onClearSearch={clearSearchByPaidInvoiceNumber}

                        // EXPORT
                        isShowExportButton={canMakePaymentExport && paidBrokerageBookingList.length > 0}
                        onExportExcel={handleExportInvoicePaymentPaidExcel}
                        onExportPdf={handleExportInvoicePaymentPaidPdf}
                        exportLoading={isLoading}
                    />

                    {paidBrokerageBookingList?.length ? (
                        paidBrokerageBookingList.map((data, i) => (
                            <section key={i} className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">

                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        <FieldItem label="Invoice Number" value={data.InvoiceNumber} isRow />
                                        <FieldItem label="Invoice Amount" value={formatCurrency(data.InvoiceAmount)} isRow />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {i === 0 && (
                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!canMakePaymentAction) return;
                                                    handleConfirmationDialogBoxOpenForPayment(data);
                                                }}
                                                color="transparent"
                                                isborderRadius
                                                disabled={!canMakePaymentAction}
                                                size="sm"
                                                style={{
                                                    color: canMakePaymentAction ? "red" : "#9CA3AF",
                                                    cursor: canMakePaymentAction ? "pointer" : "not-allowed",
                                                    opacity: canMakePaymentAction ? 1 : 0.5,
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-5">
                                    <FieldItem label="Bank Name" value={data.BankName} />
                                    <FieldItem label="Payment Type" value={data.PaymentType} />
                                    <FieldItem label="Payment Mode" value={data.PaymentMode} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pt-4 pb-4">
                                    <FieldItem label="Account Number" value={data.AccountNumber} />
                                    <FieldItem label="IFSC Code" value={data.IFSCCode} />
                                    <FieldItem label="Date" value={formatDate_dd_MonthName_yy(data.CreatedDate ?? '')} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pt-4 pb-4" >
                                    <FieldItem label="Transaction Number / Receipt" value={data.TransactionNumber} urls={data.TransactionReceiptURL} isIcon />
                                    <FieldItem label="Amount Paid" value={formatCurrency(data.AmountPaid)} />
                                    <FieldItem label="TDS Amount" value={formatCurrency(data.TDSAmount)} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 pb-4">
                                    <FieldItem label="Created By" value={getSafeString(data.CreatedBy)} />
                                    <FieldItem
                                        label="Created Date"
                                        value={
                                            data.CreatedDate
                                                ? formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate)
                                                : '-'
                                        }
                                    />
                                </div>

                            </section>
                        ))
                    ) : (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <NoDataView message="No payment data found" />
                        </section>
                    )}
                </div>
            )}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setDeleteBrokerageInvoiceData(null);
                    setIsConfirmationDialogBoxOpen(false);
                }}
                onConfirm={handleDeleteBrokerageInvoice}
                loading={isLoading}
                pageName="Brokerage Invoice"
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenForPayment}
                onClose={() => {
                    setDeletePaidBrokerageBookingData(null);
                    setIsConfirmationDialogBoxOpenForPayment(false);
                }}
                onConfirm={handleDeletePaidPayment}
                loading={isLoading}
                pageName="Payment"
            />

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Invoice'
                titleText={channelPartnerName ?? ""}
                subTitleText={channelPartnerCompanyName ?? ""}
                subSubTitleText={`₹ ${invoiceAmount?.toString() ?? 0}`}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest} />

            <ApprovalActionModal
                title="Invoice"
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                titleText={channelPartnerName ?? ""}
                subTitleText={channelPartnerCompanyName ?? ""}
                subSubTitleText={`₹ ${invoiceAmount?.toString() ?? 0}`}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />
        </div>
    )
}

export default ViewBrokerageInvoice