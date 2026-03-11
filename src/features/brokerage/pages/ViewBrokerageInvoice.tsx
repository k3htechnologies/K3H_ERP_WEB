import { useCallback, useEffect, useState } from "react";
import type { BrokerageInvoiceData, DeleteBrokerageInvoiceRequest, FilterWithPaginationBrokerageInvoiceRequest } from "../models/BrokerageInvoiceModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import { brokerageInvoiceService } from "../services/BrokerageInvoiceService";
import * as E from 'fp-ts/Either';
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useNavigate, useParams } from "react-router-dom";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Button } from "@/ui/components/forms";
import { Trash2 } from "lucide-react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import Tabs from "@/ui/components/Tab/Tab";
import type { FilterWithPaginationPaidBrokerageBookingRequest, PaidBrokerageBookingData } from "../models/PaidBrokerageBookingModel";
import { PaidBrokerageBookingService } from "../services/PaidBrokerageBookingService";

export const ViewBrokerageInvoice: React.FC = () => {

    const [BrokerageInvoiceList, setBrokerageInvoiceList] = useState<BrokerageInvoiceData[]>([]);
    const [paidBrokerageBookingList, setPaidBrokerageBookingList] = useState<PaidBrokerageBookingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    //DELETE BROKERAGE INVOICE DATA
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteBrokerageInvoiceData, setDeleteBrokerageInvoiceData] = useState<BrokerageInvoiceData | null>(null)

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    // NAVIGATE
    const navigate = useNavigate();

    // TOAST
    const { addToast } = useToast();

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    const { BookingId, } = useParams<{ BookingId?: string; }>();

    const currentBookingId = BookingId ? Number(BookingId) : 0;

    //#region TAB ACTIVITY
    const brokerageTabList = [
        { id: "Invoice", label: "Invoice" },
        { id: "Payment", label: "Payment" },
    ];

    const [activeTab, setActiveTab] = useState<string>(brokerageTabList[0].id);

    const loadBrokerageInvoice = async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBrokerageInvoiceRequest = {
                    PageNumber: 1,
                    PageSize: 10,
                    ProjectId: Number(projectId),
                    BookingId: currentBookingId
                };

                const response = await brokerageInvoiceService.apiCallPullBrokerageInvoice(params);

                if (E.isRight(response)) {
                    setBrokerageInvoiceList(response.right.Data);
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
    //#endregion

    //#region FETCH PAID BROKERAGE BOOKING LIST
    const fetchPaidBrokerageBookingList = async (brokerageInvoiceId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPaidBrokerageBookingRequest = {
                    PageNumber: 1,
                    PageSize: 10,
                    ProjectId: Number(projectId),
                    BookingId: currentBookingId,
                    BrokerageInvoiceId: brokerageInvoiceId
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
            "Loading Brokerage Settlement",
        );
    };
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;
        setPagination({ currentPage: 1 });

        loadBrokerageInvoice();
    }, [projectId]);
    //#endregion

    //#region BACK BROKERAGE
    const handleBackToListBrokerage = () => {
        navigate("/brokerage");
    };
    //#endregion

    const handleAddBrokerageInvoice = (BookingId: number) => {
        navigate(`/brokerageInvoice/add/${BookingId}`);
    };

    const handleAddPaidBrokerageBooking = (BookingId: number, BrokerageInvoiceId: number) => {
        navigate(`/PaidBrokerageBooking/add/${BookingId}/${BrokerageInvoiceId}`);
    };
    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: BrokerageInvoiceData) => {
        setDeleteBrokerageInvoiceData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    //#region DELETE BROKERAGE INVOICE 
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

                    else if (BrokerageInvoiceList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadBrokerageInvoice();

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
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 ">
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <HeaderActionBar
                titleText='Invoices'
                onCancel={() => handleBackToListBrokerage()}
            />

            <div className="flex justify-end">
                <Button
                    color="blue"
                    size="sm"
                    onClick={() => handleAddBrokerageInvoice(currentBookingId)}                >
                    ADD
                </Button>
            </div>

            <div className="pt-2 ">
                <Tabs
                    tabs={brokerageTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                        if (t.id === "Invoice") {
                            loadBrokerageInvoice();
                        } else if (t.id === "Payment") {
                            const invoiceId = BrokerageInvoiceList[0]?.BrokerageInvoiceId ?? 0;
                            fetchPaidBrokerageBookingList(invoiceId);
                        }
                    }}
                />
            </div>

            {activeTab === "Invoice" && (
                <div className="pt-2 space-y-4">
                    {BrokerageInvoiceList.map((data) => (
                        <ExpandableCard
                            key={data.BrokerageInvoiceId}
                            showline={true}
                            title={
                                <div className="flex items-center justify-between w-full gap-4">
                                    <div className="grid grid-cols-4 gap-6 w-full">
                                        <FieldItem label="Invoice Number" value={data.InvoiceNumber} />
                                        <FieldItem label="Invoice Date" value={data.InvoiceDate} />
                                        <FieldItem label="Bank Name" value={data.BankName} />
                                        <FieldItem label="Account Name" value={data.AccountName} />
                                    </div>

                                    <Button
                                        color="transparent"
                                        size="sm"
                                        style={{ color: "red", padding: "0px 8px" }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleConfirmationDialogBoxOpen(data);
                                        }}
                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                    />
                                </div>
                            }
                            child={
                                <div className="space-y-6">
                                    <div className="space-y-0 p-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 border-b border-gray-200 pb-2">
                                            <FieldItem label="IFSCCode" value={data.IFSCCode} />
                                            <FieldItem label="Account Number" value={data.AccountNumber} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pb-2">
                                            <FieldItem label="Invoice Amount" value={data.InvoiceAmount} />
                                            <FieldItem label="Due Date" value={data.DueDate} />
                                            <FieldItem label="Remark" value={data.Remark} />
                                        </div>

                                        <Button
                                            color="green"
                                            size="md"
                                            onClick={() => handleAddPaidBrokerageBooking(currentBookingId, data.BrokerageInvoiceId)}
                                        >
                                            Make Payment
                                        </Button>
                                    </div>
                                </div>
                            }
                        />
                    ))}
                </div>
            )}

            {activeTab === 'Payment' && (
                <div className="pt-2 space-y-4">
                    {paidBrokerageBookingList.map((data) => (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="BankName" value={data.BankName} />
                                        <FieldItem label="Amount Paid" value={data.AmountPaid} />
                                        <FieldItem label="Payment Mode" value={data.PaymentMode} />

                                    </div>
                                </div>

                                <div className="lg:col-span-3 pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Payment Type" value={data.PaymentType} />
                                        <FieldItem label="TDS Amount" value={data.TDSAmount} />
                                        <FieldItem label="Transaction Number" value={data.TransactionNumber} />

                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}

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
        </div>
    )
}

export default ViewBrokerageInvoice