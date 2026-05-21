import { useEffect, useState } from "react";
import type { FilterWithPaginationInwardAndOutWardRequest, InwardAndOutWardData, InwardOutwardDocumentHistory, InwardOutwardRevertHistory, } from "@/features/inwardOutward/models/InwardOutwardModel";
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
import { getInwardOutwardStatusColor } from "@/features/inwardOutward/utils/Status";
import { inwardOutwardService } from "@/features/inwardOutward/services/InwardOutwardService";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { formatCurrency } from "@/core/utils/comman";

const ViewInwardOutward: React.FC = () => {

    const [inwardOutwardData, setInwardOutwardData] = useState<InwardAndOutWardData | null>(null);
    const [trackingList, setTrackingList] = useState<InwardAndOutWardData[]>([]);
    const [inwardOutwardRevertHistory, setInwardOutwardRevertHistory] = useState<InwardOutwardRevertHistory[]>([]);
    const [inwardOutwardDocumentData, setInwardOutwardDocumentData] = useState<InwardOutwardDocumentHistory[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { InwardOutwardId } = useParams<{ InwardOutwardId?: string }>();
    const { listState } = useInwardOutwardListState();
    const currentInwardOutwardId = InwardOutwardId ? Number(InwardOutwardId) : listState.InwardOutwardId;

    const InwardTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Document", label: "Document" },
    ];

    const [activeTab, setActiveTab] = useState<string>(InwardTabList[0].id);

    const inwardDocs = trackingList.filter(d =>
        parseDocumentUrls(d.DocumentURL ?? "").filter(x => x?.trim()?.length).length > 0
    );

    const acknowledgementDocs = trackingList.filter(d =>
        parseDocumentUrls(d.AcknowledgementURL ?? "").filter(x => x?.trim()?.length).length > 0
    );

    useEffect(() => {

        if (!currentInwardOutwardId || currentInwardOutwardId === 0) return;

        fetchInwardOutwardData();
    }, [currentInwardOutwardId])

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

                    const firstItem = Array.isArray(data) ? (data[0] ?? null) : data;

                    setInwardOutwardData(firstItem);

                    setTrackingList(response.right.Data);

                    setInwardOutwardRevertHistory(firstItem?.InwardOutwardRevertHistory ?? []);

                    setInwardOutwardDocumentData(firstItem?.InwardOutwardDocumentHistory ?? []);
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

    const handleBackToInwardList = () => {
        navigate("/inwardOutward");
    };

    const handleEditInward = (row: InwardAndOutWardData) => {
        if (!row?.InwardOutwardId) return;
        navigate(`/inwardOutward/add/${row.InwardOutwardId}`);
    };

    const trackingData = [
        {
            DeliveryStatus: inwardOutwardData?.DeliveryStatus,
            DeliveryDate: inwardOutwardData?.CreatedDate,
        },
        ...(inwardOutwardDocumentData || []),
    ].filter(item => item?.DeliveryStatus);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

            <HeaderActionBar
                subTitleText={inwardOutwardData?.SystemGeneratedCode ?? ""}
                subSubTitleText={inwardOutwardData?.DocumentType ?? ""}
                cancelText="Cancel"
                onCancel={() => handleBackToInwardList()}
                EditText="Edit"
                canAction={(inwardOutwardData?.DeliveryStatus || "") === "" ? true : false}
                onEdit={() => {
                    if (inwardOutwardData) {
                        handleEditInward(inwardOutwardData);
                    }
                }}
                isLoading={false}
            />

            <div className="pt-5 ">
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
                                    <FieldItem label="Invoice Number" value={inwardOutwardData?.InVoiceNumber} />
                                    <FieldItem label="Invoice Date" value={inwardOutwardData?.InVoiceDate ? formatDate_dd_MonthName_yy(inwardOutwardData.InVoiceDate) : ""} />

                                </div>
                            </section>

                            {/* ================= SENDER DETAILS ================= */}
                            <section className="bg-white border-b border-[#135bec2e] p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Sender Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Name" value={inwardOutwardData?.SenderName} />
                                        <FieldItem label="Mobile No." value={`+91 ${inwardOutwardData?.SenderMobileNo}`} />
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
                                        <FieldItem label="Mobile No." value={`+91 ${inwardOutwardData?.ReceiverMobileNo}`} />
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
                                        <FieldItem label="Amount" value={formatCurrency(inwardOutwardData?.Amount)}/>
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
                            <section className="bg-white  border-b border-[#135bec2e]  p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Acknowledgement Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Received By" value={inwardOutwardData?.ReceivedBy} />
                                        <FieldItem label="Handover To" value={inwardOutwardData?.HandOverTo} />
                                        <FieldItem label="Handover Date" value={formatDate_dd_MonthName_yy(inwardOutwardData?.HandOverDate ?? '')} />

                                    </div>
                                </div>
                            </section>

                            <section className="bg-white  p-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Action Details</h4>
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Created By" value={inwardOutwardData?.CreatedBy} />
                                        <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(inwardOutwardData?.CreatedDate ?? '')} />
                                        <FieldItem label="Modified By" value={inwardOutwardData?.ModifiedBy} />
                                        <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(inwardOutwardData?.ModifiedDate ?? '')} />

                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>


                    {/* RIGHT SIDE */}
                    <div className="col-span-5">
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-[420px]">
                            <h1 className="text-lg font-semibold text-black mb-3 border-b border-gray-400 pb-2">
                                Document Tracking
                            </h1>

                            <div className="overflow-y-auto h-[240px] thin-scroll pr-2 pt-2">
                                {trackingData?.map((item, index) => {
                                    const { bg, text } = getInwardOutwardStatusColor(item.DeliveryStatus || '');
                                    const isLast = index === trackingData.length - 1;

                                    return (
                                        <div key={index} className="flex items-start gap-3">

                                            <div className="flex flex-col items-center self-stretch">
                                                <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />

                                                {!isLast && (
                                                    <div className="w-[3px] flex-1 bg-blue-300" />
                                                )}
                                            </div>

                                            <div className={`flex-1 ${!isLast ? 'pb-6' : 'pb-1'}`}>
                                                <p className="text-sm font-semibold text-gray-900 leading-tight">
                                                    {item.DeliveryDate ? formatDate_dd_MonthName_yy(item.DeliveryDate): '-'}
                                                </p>

                                                <span
                                                    className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium"
                                                    style={{ backgroundColor: bg, color: text }}
                                                >
                                                    {item.DeliveryStatus || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mt-4 h-[420px]">
                            <h1 className="text-lg font-semibold text-black border-b border-gray-400 pb-2">
                                Assigned Employees
                            </h1>

                            <div className="mt-1 overflow-y-auto h-[350px] thin-scroll pr-2 pt-2">
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
                                        <div key={index} className="flex gap-4 relative">

                                            <div className="flex flex-col items-center">

                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                                    {employeeName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 3)}
                                                </div>

                                                {index !== employeeNames.length - 1 && (
                                                    <div className="w-px bg-blue-500 flex-1"></div>
                                                )}

                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pb-6">
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

                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mt-4 h-[499px]">
                            <h1 className="text-lg font-semibold text-black border-b border-gray-400 pb-2">
                                Revert
                            </h1>

                            <div className="mt-1 overflow-y-auto h-[420px] thin-scroll pr-2 pt-2">
                                {inwardOutwardRevertHistory.length > 0 ? (
                                    inwardOutwardRevertHistory.map((item) => {
                                        return (
                                            <div
                                                key={item.InwardOutwardRevertId}
                                                className="mb-4 pb-4 border-b border-gray-300 last:border-b-0 last:pb-0"
                                            >
                                                <div className="flex pb-2 justify-between">
                                                    <FieldItem
                                                        label="Date"
                                                        value={formatDate_dd_MonthName_yy(item.RevertDate || "-")}
                                                    />
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
                                    })
                                ) : (
                                    <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                                        No revert data found
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {activeTab === "Document" && (
                <div className="pt-5 space-y-4">
                    {inwardDocs.length === 0 && acknowledgementDocs.length === 0 && (
                        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <NoDataView message="No Documents Found" />
                        </section>
                    )}

                    {inwardDocs.length > 0 && (
                        <ExpandableCard
                            showline={false}
                            defaultOpen={true}
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
                            defaultOpen={true}
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
