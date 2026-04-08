import { useEffect, useState } from "react";
import type { FilterWithPaginationInwardAndOutWardRequest, InwardAndOutWardData, } from "@/features/inwardOutward/models/InwardOutwardModel";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { Tabs } from "@/ui/components/Tab/Tab";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import { useInwardOutwardListState } from "@/features/inwardOutward/context/InwardOutwardListStateContext";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { getInwardOutwardStatusColor } from "@/features/inwardOutward/utils/Status";
import { inwardOutwardService } from "@/features/inwardOutward/services/InwardOutwardService";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";

const ViewInwardOutward: React.FC = () => {

    //#region STATE MANAGEMENT
    const [inwardOutwardData, setInwardOutwardData] = useState<InwardAndOutWardData | null>(null);
    const [trackingList, setTrackingList] = useState<InwardAndOutWardData[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // NAVIGATE
    const navigate = useNavigate();

    // TOAST
    const { addToast } = useToast();

    //#region TAB ACTIVITY
    const InwardTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Document", label: "Document" },
    ];

    const [activeTab, setActiveTab] = useState<string>(InwardTabList[0].id);

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/inwardOutword');

    // EDIT INWARD OUTWARD DATA FROM STATE
    const { InwardOutwardId } = useParams<{ InwardOutwardId?: string }>();
    const { listState } = useInwardOutwardListState();
    const currentInwardOutwardId = InwardOutwardId ? Number(InwardOutwardId) : listState.InwardOutwardId;

    //#region DOCUMENT GROUPS
    const inwardDocs = trackingList.filter(d =>
        parseDocumentUrls(d.DocumentURL ?? "").filter(x => x?.trim()?.length).length > 0
    );

    const acknowledgementDocs = trackingList.filter(d =>
        parseDocumentUrls(d.AcknowledgementURL ?? "").filter(x => x?.trim()?.length).length > 0
    );
    //#endregion

    //#region API CALL
    useEffect(() => {

        if (!currentInwardOutwardId || currentInwardOutwardId === 0) return;

        fetchInwardOutwardData();
    }, [currentInwardOutwardId])
    //#endregion

    //#region FETCH INWARD OUTWARD LIST
    const fetchInwardOutwardData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationInwardAndOutWardRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    InwardOutwardId: currentInwardOutwardId
                };

                const response = await inwardOutwardService.apiCallPullInwardOutward(params);

                if (E.isRight(response)) {
                    const data = response.right.Data;

                    setInwardOutwardData(Array.isArray(data) ? (data[0] ?? null) : data);
                    setTrackingList(response.right.Data);

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
            "Loading Inward Outward",
        );
    };
    //#endregion

    //#region BACK INWARD OUTWARD PAGE
    const handleBackToInwardList = () => {
        navigate("/inwardoutword");
    };
    //#endregion

    //#region EDIT INWARD OUTWARD PAGE
    const handleEditInward = (row: InwardAndOutWardData) => {
        if (!row?.InwardOutwardId) return;
        navigate(`/inwardOutward/add/${row.InwardOutwardId}`);
    };
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

            {/* Header Details*/}

            <HeaderActionBar
                subTitleText={inwardOutwardData?.DocumentTitle ?? ""}
                subSubTitleText={inwardOutwardData?.DeliveryStatus ?? ""}
                cancelText="Cancel"
                onCancel={() => handleBackToInwardList()}
                EditText="Edit"
                canAction={canAction}
                onEdit={() => {
                    if (inwardOutwardData) {
                        handleEditInward(inwardOutwardData);
                    }
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
                            fetchInwardOutwardData();
                        } else if (t.id === "Document") {
                            fetchInwardOutwardData();
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
                                    <FieldItem label="Document Title" value={inwardOutwardData?.DocumentTitle} />
                                    <FieldItem label="Document Type" value={inwardOutwardData?.DocumentType} />
                                    <FieldItem label="Delivery Type" value={inwardOutwardData?.DeliveryType} />
                                    <FieldItem label="Inward Number" value={inwardOutwardData?.InwardNumber} />
                                    <FieldItem label="Date" value={inwardOutwardData?.InwardOutwardDate ? formatDate_dd_MonthName_yy(inwardOutwardData.InwardOutwardDate) : ""} />
                                    <FieldItem label="Invoice Number" value={inwardOutwardData?.InvoiceNumber} />
                                    <FieldItem label="Invoice Date" value={inwardOutwardData?.InvoiceDate ? formatDate_dd_MonthName_yy(inwardOutwardData.InvoiceDate) : ""} />

                                </div>
                            </section>

                            {/* ================= SENDER DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Sender Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Name" value={inwardOutwardData?.SenderName} />
                                        <FieldItem label="Mobile No." value={inwardOutwardData?.SenderMobileNo} />
                                        <FieldItem label="E-mail ID" value={inwardOutwardData?.SenderEmailId} />
                                        <FieldItem label="Address" value={inwardOutwardData?.SenderAddress} />

                                    </div>
                                </div>
                            </section>

                            {/* ================= RECEIVER DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Receiver Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Name" value={inwardOutwardData?.ReceiverName} />
                                        <FieldItem label="Mobile No." value={inwardOutwardData?.ReceiverMobileNo} />
                                        <FieldItem label="E-mail ID" value={inwardOutwardData?.ReceiverEmailId} />
                                        <FieldItem label="Address" value={inwardOutwardData?.ReceiverAddress} />

                                    </div>
                                </div>
                            </section>

                            {/* ================= DOCUMENT DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Cheque No." value={inwardOutwardData?.ChequeNo} />
                                        <FieldItem label="Amount" value={inwardOutwardData?.Amount} />
                                        <FieldItem label="Document Description" value={inwardOutwardData?.DocumentDescription ?? ''} />

                                    </div>
                                </div>
                            </section>

                            {/* ================= DELIVERY DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Delivery Mode" value={inwardOutwardData?.DeliveryMode} />
                                        <FieldItem label="Status" value={inwardOutwardData?.DeliveryStatus} />

                                    </div>
                                </div>
                            </section>

                            {/* ================= ACKNOWLEDGEMENT DETAILS ================= */}
                            <section className="bg-white  p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Acknowledgement Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Received By" value={inwardOutwardData?.ReceivedBy} />
                                        <FieldItem label="Handover To" value={inwardOutwardData?.HandOverTo} />
                                        <FieldItem label="Handover Date" value={formatDate_dd_MonthName_yy(inwardOutwardData?.HandOverDate ?? '')} />

                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>


                    {/* RIGHT SIDE */}
                    <div className="col-span-5">
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-[310px]">
                            <h1 className="text-lg font-semibold text-black mb-3 border-b border-gray-400 pb-1">
                                Document Tracking
                            </h1>

                            <div className="overflow-y-auto h-[240px] thin-scroll pr-2">
                                {(() => {
                                    const inwardOutwardDate = inwardOutwardData?.InwardOutwardDate?.split(',').map(date => date.trim()).filter(date => date) || [];
                                    const deliveryStatus = inwardOutwardData?.DeliveryStatus?.split(',').map(status => status.trim()).filter(status => status) || [];

                                    if (inwardOutwardDate.length === 0) {
                                        return (
                                            <div className="text-center text-gray-500 py-10">
                                                No Document found
                                            </div>
                                        );
                                    }

                                    return inwardOutwardDate.map((date, index) => {
                                        const statusValue = deliveryStatus[index] || deliveryStatus[0] || '';

                                        const { bg, text } = getInwardOutwardStatusColor(statusValue);

                                        return (
                                            <div key={index} className="flex gap-4 relative mb-4">

                                                <div className="flex flex-col items-center">

                                                    {/* DOT */}
                                                    <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                                                    <div className="w-[3px] bg-blue-600 flex-1"></div>

                                                    {index !== inwardOutwardDate.length - 1 && (
                                                        <div className="w-[3px] bg-blue-600 flex-1"></div>
                                                    )}
                                                </div>

                                                {/* RIGHT CONTENT */}
                                                <div className="flex-1 pb-2">
                                                    <div className="font-semibold text-gray-900">
                                                        {formatDate_dd_MonthName_yy(date)}
                                                    </div>

                                                    <span
                                                        className="inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: bg, color: text }}
                                                    >
                                                        {statusValue || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mt-4 h-[350px]">
                            <h1 className="text-lg font-semibold text-black border-b border-gray-400 pb-1">
                                Assigned Employees
                            </h1>

                            <div className="mt-1 overflow-y-auto h-[350px] thin-scroll pr-2">
                                {(() => {
                                    const employeeNames = inwardOutwardData?.EmployeeNames?.split(',').map(name => name.trim()).filter(name => name) || [];
                                    const departmentNames = inwardOutwardData?.DepartmentName?.split(',').map(dept => dept.trim()).filter(dept => dept) || [];

                                    if (employeeNames.length === 0) {
                                        return (
                                            <div className="text-center text-gray-500 py-10">
                                                No assigned employees found
                                            </div>
                                        );
                                    }

                                    return employeeNames.map((employeeName, index) => (
                                        <div key={index} className="flex gap-4 relative mb-4">

                                            <div className="flex flex-col items-center">

                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                                    {employeeName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 3)}
                                                </div>

                                                {index !== employeeNames.length - 1 && (
                                                    <div className="w-px bg-blue-500 flex-1 mt-1"></div>
                                                )}

                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pb-4">
                                                <div className="font-semibold text-gray-900">
                                                    {employeeName}

                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {departmentNames[index] || departmentNames[0] || '-'}
                                                </div>
                                            </div>

                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mt-4 h-[260px]">
                            <h1 className="text-lg font-semibold text-black border-b border-gray-400 pb-1">
                                Revert
                            </h1>

                            <div className="mt-1 overflow-y-auto h-[200px] thin-scroll pr-2">
                                {(() => {
                                    return trackingList.map((item) => {
                                        return (
                                            <div key={item.RevertedInwardOutwardId} className="mb-4 pb-4 border-b border-gray-300 last:border-b-0 last:pb-0">
                                                <div className="flex pb-2 justify-between">
                                                    <FieldItem label=" Date" value={formatDate_dd_MonthName_yy(item.InwardOutwardRevertDate || '-')} />

                                                </div>

                                                <FieldItem label="Remark" value={item.RevertRemark || "-"} />
                                                {parseDocumentUrls(item.RevertDocumentURL).length > 0 && (
                                                    <div className="inline-flex items-end gap-1 px-2 py-2 border border-blue-500 text-blue-600 rounded-[4px] mt-2 text-sm font-medium cursor-pointer hover:bg-blue-50 transition">
                                                        <p>Document</p>
                                                        <MultiImageViewer
                                                            images={parseDocumentUrls(item.RevertDocumentURL)}
                                                            title="Revert Document"
                                                            isIcon={false}
                                                            triggerLabel="Document"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {activeTab === "Document" && (
                <div className="pt-2 space-y-4">
                    {inwardDocs.length === 0 && acknowledgementDocs.length === 0 && (
                        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <NoDataView message="No Documents Found" />
                        </section>
                    )}

                    {inwardDocs.length > 0 && (
                        <ExpandableCard
                            showline={false}
                            title={
                                <div className="flex items-center gap-2 w-full pt-3 p-2">
                                    <span className="text-base font-semibold text-gray-900">Inward Document</span>
                                </div>
                            }
                            child={
                                <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {inwardDocs.map((d, index) => {
                                        const urls = parseDocumentUrls(d.DocumentURL ?? "").filter(x => x?.trim()?.length);

                                        return (
                                            <div key={index} className="border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
                                                <div className="flex items-start justify-between p-2 gap-2">

                                                    <span className="text-sm text-gray-500 mt-1">
                                                        Document Count: {urls.length}
                                                    </span>

                                                    <MultiImageViewer
                                                        images={urls}
                                                        title="Inward Document"
                                                        triggerLabel="View"
                                                        isIcon={false}
                                                    />
                                                </div>

                                                <div className="bg-gray-50 p-2">
                                                    <FieldItem
                                                        label="Uploaded By / Date"
                                                        value={`${d?.ModifiedBy || d?.CreatedBy || "-"} / ${d?.ModifiedDate
                                                            ? formatDate_dd_MonthName_yy_hh_mm(d.ModifiedDate)
                                                            : d?.CreatedDate
                                                                ? formatDate_dd_MonthName_yy_hh_mm(d.CreatedDate)
                                                                : "-"
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            }
                        />
                    )}

                    {acknowledgementDocs.length > 0 && (
                        <ExpandableCard
                            showline={false}
                            title={
                                <div className="flex items-center gap-2 w-full pt-3 p-2">
                                    <span className="text-base font-semibold text-gray-900">Acknowledgement</span>
                                </div>
                            }
                            child={
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-5">

                                    {acknowledgementDocs.map((d, index) => {
                                        const urls = parseDocumentUrls(d.AcknowledgementURL ?? "").filter(x => x?.trim()?.length);

                                        return (
                                            <div key={index} className="border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
                                                <div className="flex items-start justify-between p-2 gap-2">

                                                    <span className="text-sm text-gray-500 mt-1">
                                                        Document Count: {urls.length}
                                                    </span>

                                                    <MultiImageViewer
                                                        images={urls}
                                                        title="Acknowledgement"
                                                        triggerLabel="View"
                                                        isIcon={false}
                                                    />
                                                </div>

                                                <div className="bg-gray-50 p-2 mt-auto">
                                                    <FieldItem
                                                        label="Uploaded By / Date"
                                                        value={`${d?.ModifiedBy || d?.CreatedBy || "-"} / ${d?.ModifiedDate
                                                            ? formatDate_dd_MonthName_yy_hh_mm(d.ModifiedDate)
                                                            : d?.CreatedDate
                                                                ? formatDate_dd_MonthName_yy_hh_mm(d.CreatedDate)
                                                                : "-"
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            }
                        />
                    )}

                </div>
            )}

        </div>
    )
}
export default ViewInwardOutward;
