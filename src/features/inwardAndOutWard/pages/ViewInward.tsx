import { useEffect, useState } from "react";
import type { FilterWithPaginationInwardAndOutWardRequest, InwardAndOutWardData } from "../models/InwardAndOutWardModel";
import { useNavigate } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { InwardService } from "../services/InwardAndOutWardService";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { Tabs } from "@/ui/components/Tab/Tab";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { getInwardStatusColor } from "../utils/Status";

const ViewInward: React.FC = () => {

    //#region STATE MANAGEMENT
    const [inwardData, setInwardData] = useState<InwardAndOutWardData | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // NAVIGATE
    const navigate = useNavigate();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions("/inwardAndoutward");
    //#endregion

    // TOAST
    const { addToast } = useToast();

    //#region TAB ACTIVITY
    const InwardTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Document", label: "Document" },
    ];

    const [activeTab, setActiveTab] = useState<string>(InwardTabList[0].id);


    //#region API CALL
    useEffect(() => {
        fetchInwardData();
    }, [])
    //#endregion

    const fetchInwardData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationInwardAndOutWardRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                };
                const response = await InwardService.apiCallPullInward(params);

                if (E.isRight(response)) {
                    const data = response.right.Data;

                    setInwardData(Array.isArray(data) ? (data[0] ?? null) : data);
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
            "Loading Inward ",
        );
    };

    //#region BACK INWARD PAGE
    const handleBackToInwardList = () => {
        navigate("/inwardAndoutward");
    };
    //#endregion


    //#region EDIT INWARD PAGE
    const handleEditInward = (row: InwardAndOutWardData) => {
        if (!row?.DocumentId) return;
        navigate(`/inwardAndoutward/add/${row.DocumentId}`);
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div></div>{" "}
            </Loader>

            {/* Header Details*/}
            <HeaderActionBar
                subTitleText={inwardData?.Title ?? ""}
                subSubTitleText={inwardData?.Status ?? ""}
                cancelText="Cancel"
                onCancel={() => handleBackToInwardList()}
                onEdit={() => {
                    handleEditInward(inwardData as InwardAndOutWardData);
                }}
                isLoading={false}
            />

            <div className="pt-2 ">
                <Tabs
                    tabs={InwardTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                        if (t.id === "Overview") {
                            fetchInwardData();
                        } else if (t.id === "Document") {
                            // fetchInwardDocumentList();
                        }
                    }}
                />
            </div>

            {activeTab === "Overview" && (
                <div className="grid grid-cols-12 gap-4 pt-5">
                    {/* LEFT SIDE */}
                    <div className="col-span-7">
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                            {/* ================= BASIC DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] px-4 pt-1 pb-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Document Title" value={inwardData?.Title} />
                                    <FieldItem label="Document Type" value={inwardData?.Type}
                                    />
                                    <FieldItem label="Priority" value={inwardData?.Priority} />
                                    <FieldItem label="Date" value={inwardData?.InvoiceDate ? formatDate_dd_MonthName_yy(inwardData.InvoiceDate) : ""} />
                                </div>
                            </section>

                            {/* ================= SENDER DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Sender Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Name" value={inwardData?.SenderName} />
                                        <FieldItem label="Mobile No." value={inwardData?.SenderContactNumber} />
                                        <FieldItem label="E-mail ID" value={inwardData?.SenderEmail} />
                                        <FieldItem label="Address" value={inwardData?.senderAddress} />

                                    </div>
                                </div>
                            </section>

                            {/* ================= RECEIVER DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Receiver Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Name" value={inwardData?.ReceiverName} />
                                        <FieldItem label="Mobile No." value={inwardData?.ReceiverContactNumber} />
                                        <FieldItem label="E-mail ID" value={inwardData?.ReceiverEmail} />
                                        <FieldItem label="Address" value={inwardData?.ReceiverAddress} />

                                    </div>
                                </div>
                            </section>

                            {/* ================= DOCUMENT DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Cheque No." value={inwardData?.ReceiverContactNumber} />
                                        <FieldItem label="Amount" value={inwardData?.Amount} />
                                        <FieldItem label="Document Description" value={inwardData?.ReceiverEmail} />

                                    </div>
                                </div>
                            </section>

                            {/* ================= DELIVERY DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Delivery Mode" value={inwardData?.DeliveryMode} />
                                        <FieldItem label="Status" value={inwardData?.Status} />

                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="col-span-5">
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-[300px]">
                            <div className="border-b pb-2 mt-1">
                                <div className="flex items-start justify-between">

                                    <h1 className="text-lg font-semibold text-black"> Document Tracking</h1>
                                    <div className="mt-3 overflow-y-auto h-[600px] thin-scroll pr-2">
                                        {inwardData?.map((item, index) => (
                                            <div key={item.DocumentId} className="grid grid-cols-[24px_1fr] gap-3">
                                                {/* LEFT — DOT + LINE */}
                                                <div className="flex flex-col items-center">

                                                    {/* DOT */}
                                                    <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                                                    <div className="w-[3px] bg-blue-600 flex-1"></div>
                                                </div> {/* LINE (hide after last item) */}
                                                {index !== inwardData.length - 1 && (
                                                    <div className="w-[3px] bg-blue-600 flex-1"></div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-gray-900">{item.Status}</span>

                                                        <span className="text-xs text-gray-500 flex flex-col gap-1">
                                                            {(() => {
                                                                const { bg, text } = getInwardStatusColor(item.Status || '');
                                                                return (
                                                                    <span
                                                                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                                                        style={{ backgroundColor: bg, color: text }}
                                                                    >
                                                                        {item.Status || "-"}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            )}

        </div>
    )
}
export default ViewInward;