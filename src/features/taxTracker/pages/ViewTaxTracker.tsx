import { useNavigate, useParams } from "react-router-dom";
import { useTaxTrackerListState } from "@/features/taxTracker/context/TaxTrackerListStateContext";
import { useEffect, useState } from "react";
import type { FilterWithPaginationTaxTrackerRequest, TaxTrackerData, TaxTrackerDocumentDetailsData } from "@/features/taxTracker/models/TaxTrackerModel";
import { runApiWithLoader } from "@/core/utils";
import { taxTrackerService } from "@/features/taxTracker/services/TaxTrackerService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import type { AddUpdateTaxTrackerDocumentRequest } from "@/features/taxTracker/models/TaxTrackerDocumentModel";
import { taxTrackerDocumentService } from "@/features/taxTracker/services/TaxTrackerDocumentService";
import { Button } from "@/ui/components/forms";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { getCardConfig, getNoticeStatusColor } from "@/features/taxTracker/utils/Status";
import { formatCurrency } from "@/core/utils/comman";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Accordion } from "@/ui/components/Card/Accordion";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

interface NoticeCycle {
    cycleKey: string;
    anchorDoc: TaxTrackerDocumentDetailsData;
    docs: TaxTrackerDocumentDetailsData[];
    cycleNumber: number;
}

function groupIntoCycles(docs: TaxTrackerDocumentDetailsData[]): NoticeCycle[] {
    if (!docs || docs.length === 0) return [];

    const cycles: NoticeCycle[] = [];
    let currentCycle: TaxTrackerDocumentDetailsData[] = [];
    let currentHasReopen = false;

    docs.forEach((doc) => {
        const rt = doc.RequestType;
        const isNotice = !rt || rt === "Notice";

        if (isNotice && currentCycle.length === 0) {
            currentCycle.push(doc);
        } else if (isNotice && currentHasReopen) {
            pushCycle(cycles, currentCycle);
            currentCycle = [doc];
            currentHasReopen = false;
        } else {
            currentCycle.push(doc);
            if (rt === "Reopen") currentHasReopen = true;
        }
    });

    if (currentCycle.length > 0) {
        pushCycle(cycles, currentCycle);
    }

    return cycles;
}

function pushCycle(cycles: NoticeCycle[], docs: TaxTrackerDocumentDetailsData[]) {
    const anchor = docs[0];
    cycles.push({
        cycleKey: String(anchor.TaxTrackerDocumentId ?? `cycle-${cycles.length}`),
        anchorDoc: anchor,
        docs,
        cycleNumber: cycles.length + 1,
    });
}

const getReopenRequestFormState = (): AddUpdateTaxTrackerDocumentRequest => ({
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
    DateOfAppeal: null,
});

export const ViewTaxTracker: React.FC = () => {

    const [detailsData, setDetailsData] = useState<TaxTrackerData>();
    const [taxTrackerDetailsData, setTaxTrackerDetailsData] = useState<TaxTrackerDocumentDetailsData[]>([]);
    const [openCycles, setOpenCycles] = useState<Set<string>>(new Set());
    const [reopenModalOpen, setReopenModalOpen] = useState(false);
    const [reopenFormData, setReopenFormData] = useState<AddUpdateTaxTrackerDocumentRequest>(() => getReopenRequestFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [noticeDocumentURLFiles, setNoticeDocumentURLFiles] = useState<(File | string)[]>([]);
    const [noticeDocumentURL, setNoticeDocumentURL] = useState<string>("");
    const [removedNoticeDocumentURLs, setRemovedNoticeDocumentURLs] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { TaxTrackerId } = useParams<{ TaxTrackerId: string }>();
    const { listState } = useTaxTrackerListState();
    const currentTaxTrackerId = TaxTrackerId ? Number(TaxTrackerId) : listState.TaxTrackerId;
    const { NoticeType, GovernmentCompliance } = listState;
    const navigate = useNavigate();

    const { canAction } = useMenuPermissions("/taxTracker");

    const appealItem = taxTrackerDetailsData?.find((item) => item.RequestType === "Appeal");
    const statusColor = getNoticeStatusColor(appealItem?.NoticeStatus ?? "");

    const latestRequest = taxTrackerDetailsData?.[taxTrackerDetailsData.length - 1];
    const showReopenButton = latestRequest?.RequestType === 'Close-Notice';

    const noticeStatusColor = getNoticeStatusColor(detailsData?.NoticeStatus ?? "");

    const firstDoc = taxTrackerDetailsData?.[0];

    const isInitialNotice =
        taxTrackerDetailsData.length === 1 &&
        (!firstDoc?.RequestType || firstDoc?.RequestType === "Notice" || firstDoc?.RequestType === "");


    const isEditable = canAction && isInitialNotice
    const isEditDisabled = !isEditable;

    const noticeCycles = groupIntoCycles(taxTrackerDetailsData);

    const getNoticeDocsForCycle = (cycle: NoticeCycle) =>
        cycle.docs.filter(d => !d.RequestType || d.RequestType === "Notice");

    const getOrderDocsForCycle = (cycle: NoticeCycle) =>
        cycle.docs.filter(d => d.RequestType === "Order");

    const toggleCycle = (key: string) => {
        setOpenCycles(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    useEffect(() => {
        loadDetailsData();
    }, [currentTaxTrackerId]);

    const loadDetailsData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaxTrackerRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    TaxTrackerId: currentTaxTrackerId
                };

                const response = await taxTrackerService.apiCallPullTaxTracker(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const item = Array.isArray(data) ? data[0] : data;

                    setDetailsData(item ?? null);
                    setTaxTrackerDetailsData(item?.TaxTrackerDocumentDetailsData ?? []);
                }
                else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Details Data'
        );
    };

    const handleReopenModal = () => {
        setReopenModalOpen(true);
    };

    const handleEditTaxTracker = (taxTrackerId: number) => {
        if (!taxTrackerId) return;
        navigate(`/taxTracker/add/${taxTrackerId}`);
    };

    const validateReopenRequestForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!reopenFormData.NoticeDescription || reopenFormData.NoticeDescription.trim() === "") {
            newErrors.NoticeDescription = "Remark is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };
    const PushAddUpdateRequestForm = (): FormData => {
        const fd = new FormData();
        fd.append('NoticeDescription', reopenFormData.NoticeDescription || '');
        fd.append('TaxTrackerId', currentTaxTrackerId.toString());
        fd.append('RequestType', 'Reopen');
        fd.append('NoticeStatus', 'Reopened');

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
    };

    const handleReopenCaseForm = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setErrors({});

        const validation = validateReopenRequestForm();

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
                    addToast({ type: "success", title: response.right.SuccessMessage[0] });
                    setReopenModalOpen(false);
                    setNoticeDocumentURL('');
                    setRemovedNoticeDocumentURLs([]);
                    setErrors({});

                    navigate("/taxTracker/");
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
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <HeaderActionBar
                        titleText={`${GovernmentCompliance} : `}
                        subTitleText={NoticeType}
                        EditText="Edit"
                        canAction={!isEditDisabled}
                        onEdit={() => {
                            if (detailsData?.TaxTrackerId) handleEditTaxTracker(detailsData.TaxTrackerId)
                        }}
                        onCancel={() => {
                            navigate('/taxTracker');
                        }}
                    />
                </div>

                {showReopenButton && (
                    <Button onClick={handleReopenModal}>
                        Reopen
                    </Button>
                )}
            </div>

            <div className="bg-white w-full rounded-lg border border-gray-200 shadow-xs overflow-hidden mt-5">
                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-4 items-start">
                    <FieldItem
                        label="Company Name"
                        value={detailsData?.CompanyName || '-'}
                    />

                    <FieldItem
                        label="Financial Year"
                        value={detailsData?.FinancialYear || '-'}
                    />


                    <FieldItem
                        label="Notice Status"
                        value={
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    backgroundColor: noticeStatusColor.bg,
                                    color: noticeStatusColor.text,
                                }}
                            >
                                {detailsData?.NoticeStatus || "-"}
                            </span>
                        }
                    />
                    <FieldItem
                        label="Authority"
                        value={detailsData?.Authority || '-'}
                    />
                </div>
                <div className="p-4 -mt-6">
                    <FieldItem
                        label="Responsible Person"
                        value={detailsData?.ResponsiblePerson || '-'}
                    />
                </div>
            </div>
            <Accordion
                className="mt-5 space-y-3"
                items={noticeCycles.map((cycle) => ({
                    key: cycle.cycleKey,
                    title: `Cycle ${cycle.cycleNumber}`,
                }))}
                openMap={Object.fromEntries([...openCycles].map(k => [k, true]))}
                onToggle={(key) => {
                    toggleCycle(key);
                }}
                renderItem={(item, isOpen, toggle) => {
                    const cycle = noticeCycles.find(c => c.cycleKey === item.key)!;
                    const noticeDocsInCycle = getNoticeDocsForCycle(cycle);
                    const orderDocsInCycle = getOrderDocsForCycle(cycle);
                    const cycleNotice = noticeDocsInCycle[0];

                    return (
                        <>
                            <div
                                className="relative cursor-pointer overflow-hidden rounded-xl bg-white"
                                onClick={toggle}
                            >

                                {!isOpen && <div className="absolute inset-y-0 left-0 w-1 bg-[#2563EB]" />}
                                <div className="flex items-center justify-between px-5 py-3 pl-6 pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1">




                                        <FieldItem
                                            label="Notice Title"
                                            value={detailsData?.NoticeType || '-'}
                                        />
                                        <div className="-ml-2">
                                            <FieldItem
                                                label="Government Compliance"
                                                value={detailsData?.GovernmentCompliance || '-'}
                                            />
                                        </div>

                                        <FieldItem
                                            label="Notice U/S"
                                            value={detailsData?.NoticeSection || '-'}
                                        />
                                        <FieldItem
                                            label="Notice Date"
                                            value={formatDate_dd_MonthName_yy(
                                                cycleNotice?.RequestType === "Notice"
                                                    ? cycleNotice?.AmountUnderDisputeDate || ''
                                                    : detailsData?.NoticeDate || ''
                                            )}
                                        />
                                        <FieldItem
                                            label="Reply Due Date"
                                            value={formatDate_dd_MonthName_yy(detailsData?.DueDate || '')}
                                        />
                                    </div>
                                    <span className="ml-6 flex-shrink-0">
                                        {isOpen ? (
                                            <ChevronDownIcon className="h-5 w-5" />
                                        ) : (
                                            <ChevronRightIcon className="h-5 w-5" />
                                        )}
                                    </span>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3 pt-3 pb-3 items-stretch">
                                    <div className="space-y-3 flex flex-col">

                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#f3f0fe] px-3 py-2 border-b border-[#D0D7DE]">
                                                <h4 className="text-sm font-semibold text-[#8349df]">
                                                    Authority Details
                                                </h4>
                                            </div>

                                            {noticeDocsInCycle.map((item, key) => (
                                                <div key={key}>
                                                    <div className={`p-4 bg-white grid grid-cols-3 gap-4 ${key !== noticeDocsInCycle.length - 1 && 'border-b border-gray-300'}`}>
                                                        <FieldItem label="Officer Name" value={item?.OfficerName || '-'} />

                                                        <div className="col-span-2 ">
                                                            <FieldItem label="Divisional Address" value={item?.OfficerAddress || '-'} />
                                                        </div>

                                                    </div>


                                                </div>
                                            ))}

                                            {!noticeDocsInCycle?.length && (
                                                <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                                    <FieldItem label="Notice U/S" value="-" />
                                                    <FieldItem label="Due Date" value="-" />
                                                    <FieldItem label="Notice Type" value="-" />
                                                    <FieldItem label="Office Address" value="-" />
                                                    <FieldItem label="Notice Date" value="-" />
                                                    <FieldItem label="Created By" value="-" />
                                                </div>
                                            )}
                                        </section>

                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#ffffe4] px-3 py-2 border-b border-[#D0D7DE]">
                                                <h4 className="text-sm font-semibold text-[#8b7d3f]">
                                                    Order Details
                                                </h4>
                                            </div>

                                            {orderDocsInCycle.map((item, key) => (
                                                <div key={key}>
                                                    <div className={`p-4 bg-white grid grid-cols-3 gap-4 ${key !== orderDocsInCycle.length - 1 ? 'border-b border-gray-300' : ''}`}>
                                                        <FieldItem
                                                            label={
                                                                item?.OrderStatus === "Non-Favourable"
                                                                    ? "Order Date"
                                                                    : "Order Date"
                                                            }
                                                            value={
                                                                item?.AmountUnderDisputeDate
                                                                    ? formatDate_dd_MonthName_yy(item.AmountUnderDisputeDate)
                                                                    : "-"
                                                            }
                                                        />

                                                        {item?.OrderStatus !== "Favourable" && (
                                                            <FieldItem
                                                                label="Amount Under Dispute"
                                                                value={formatCurrency(item.AmountUnderDispute)}
                                                            />
                                                        )}

                                                        {item?.OrderStatus === "Non-Favourable" && (
                                                            <FieldItem
                                                                label="Authority Type"
                                                                value={item?.AuthorityType || "-"}
                                                            />
                                                        )}

                                                        <FieldItem
                                                            label="Order Status"
                                                            value={
                                                                (() => {
                                                                    const orderStatusColor = getNoticeStatusColor(item?.OrderStatus ?? "");
                                                                    return (
                                                                        <span
                                                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                                                            style={{
                                                                                backgroundColor: orderStatusColor.bg,
                                                                                color: orderStatusColor.text,
                                                                            }}
                                                                        >
                                                                            {item?.OrderStatus || "-"}
                                                                        </span>
                                                                    );
                                                                })()
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {(!orderDocsInCycle || orderDocsInCycle.length === 0) && (
                                                <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                                    <FieldItem label="Order Date" value="-" />
                                                    <FieldItem label="Amount Under Dispute" value="-" />
                                                    <FieldItem label="Order Status" value="-" />
                                                </div>
                                            )}
                                        </section>


                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#F5F8FD] px-3 py-2 border-b border-[#D9E1EC]">
                                                <h4 className="text-sm font-semibold text-[#123B7A]">Appeal Details</h4>
                                            </div>

                                            <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                                <FieldItem
                                                    label="Request Type"
                                                    value={appealItem?.RequestType || "-"}
                                                />
                                                <FieldItem
                                                    label="Appeal Due Date"
                                                    value={appealItem?.AmountUnderDisputeDate ? formatDate_dd_MonthName_yy(appealItem.AmountUnderDisputeDate) : "-"}
                                                />
                                                <FieldItem
                                                    label="Date Of Appeal"
                                                    value={appealItem?.DateOfAppeal ? formatDate_dd_MonthName_yy(appealItem.DateOfAppeal) : "-"}
                                                />
                                                <FieldItem
                                                    label="Status"
                                                    value={
                                                        appealItem?.NoticeStatus ? (
                                                            <span
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                                                style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                                            >
                                                                {appealItem.NoticeStatus}
                                                            </span>
                                                        ) : "-"
                                                    }
                                                />
                                            </div>
                                        </section>

                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#F5F8FD] px-3 py-2 border-b border-[#D9E1EC]">
                                                <h4 className="text-sm font-semibold text-[#5c5f63]">
                                                    Other Details
                                                </h4>
                                            </div>

                                            <div className="p-3">
                                                <FieldItem
                                                    label="Description"
                                                    value={
                                                        taxTrackerDetailsData?.find((item) => item.RequestType === "Others")
                                                            ?.NoticeDescription || "-"
                                                    }
                                                />
                                            </div>
                                        </section>

                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#e1e2e4] px-3 py-2 border-b border-[#D0D7DE]">
                                                <h4 className="text-sm font-semibold text-[#5c5f63]">
                                                    Action Details
                                                </h4>
                                            </div>

                                            <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                                <FieldItem label="Created By" value={detailsData?.CreatedBy} />
                                                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(detailsData?.CreatedDate || '')} />
                                                <FieldItem label="Modified By" value={detailsData?.ModifiedBy} />
                                                <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(detailsData?.ModifiedDate || '')} />
                                            </div>
                                        </section>
                                    </div>

                                    <div className="pr-4 md:pr-0 flex flex-col md:block md:relative min-h-[400px] md:min-h-0">
                                        <div className="md:absolute md:inset-0 md:pr-4 flex flex-col h-full w-full">
                                            <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden flex flex-col h-full shadow-2xs bg-white">
                                                <div className="bg-[#edf7ed] px-3 py-2 border-b border-[#D0D7DE]">
                                                    <h4 className="text-sm font-semibold text-[#1e4620]">
                                                        Activity Tracker
                                                    </h4>
                                                </div>

                                                <div className="flex flex-col items-center w-full p-4 flex-1 overflow-hidden">
                                                    <div className="w-full ml-1 flex-1 overflow-y-auto pr-2 thin-scroll">
                                                        {cycle.docs.length > 0 ? (
                                                            <div className="space-y-5">
                                                                {cycle.docs.map((item, index) => {
                                                                    const isLeftAligned = !item.RequestType || item.RequestType === "Notice" || item.RequestType === "Order";

                                                                    const cardConfig = getCardConfig(item.OrderStatus ?? undefined, item.RequestType ?? undefined);

                                                                    return (
                                                                        <div key={index} className={`w-full flex ${isLeftAligned ? 'justify-start' : 'justify-end'} mb-6`}>
                                                                            <div className="w-full max-w-[82%]">
                                                                                <div className={`rounded-xl borderv p-4 shadow-xs w-full transition-all ${cardConfig.bgColor} ${cardConfig.borderColor} ${isLeftAligned ? 'rounded-tl-none' : 'rounded-tr-none'}`}>

                                                                                    <div className="flex items-center justify-between">
                                                                                        <p className={`font-semibold text-sm ${cardConfig.textColor}`}>
                                                                                            {cardConfig.title}
                                                                                        </p>
                                                                                        <div className={`text-xs font-medium ${item.RequestType === "Reply" || item.RequestType === "Order" ? 'text-white' : 'text-slate-500'}`}>
                                                                                            {formatDate_dd_MonthName_yy(item.AmountUnderDisputeDate ?? "")}
                                                                                        </div>
                                                                                    </div>

                                                                                    {item.NoticeDescription && (
                                                                                        <div className="pt-2">
                                                                                            <p className={`text-sm font-semibold break-words whitespace-normal ${cardConfig.labelColor}`}>
                                                                                                Description : <span className={`font-normal ${cardConfig.fieldTextColor}`}>{item.NoticeDescription}</span>
                                                                                            </p>
                                                                                        </div>
                                                                                    )}

                                                                                    {item.NoticeDocumentURL && (
                                                                                        <div className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-md mt-3 text-xs font-medium cursor-pointer transition ${cardConfig.badgeColor}`}>
                                                                                            <MultiImageViewer
                                                                                                images={parseDocumentUrls(item.NoticeDocumentURL)}
                                                                                                title="Document"
                                                                                                isIcon={true}
                                                                                                triggerLabel="Document"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div>


                                                                                {(!item.RequestType || item.RequestType === "Notice" || item.RequestType === "Reply") && (
                                                                                    <div className="mt-1.5 px-1">
                                                                                        <div className="flex justify-between text-[10px] tracking-wider text-gray-500 font-bold">
                                                                                            {detailsData?.Authority && (
                                                                                                <p>
                                                                                                    AUTHORITY : <span className={cardConfig.footerColor}>{detailsData?.Authority}</span>
                                                                                                </p>
                                                                                            )}
                                                                                            {(!item.RequestType || item.RequestType === "Notice") && (
                                                                                                <p>
                                                                                                    OFFICER NAME : <span className={cardConfig.footerColor}>{(item.OfficerName || "").toUpperCase()}</span>
                                                                                                </p>
                                                                                            )}
                                                                                            {item.RequestType === "Reply" && (
                                                                                                <p>
                                                                                                    REPLIED BY : <span className={cardConfig.footerColor}>{(item.CreatedBy || "").toUpperCase()}</span>
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-400 italic text-center w-full py-10">
                                                                No data is present.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    );
                }}
            />
            <Modal
                isOpen={reopenModalOpen}
                onClose={() => {
                    setReopenModalOpen(false);
                    setErrors({});
                    setReopenFormData(getReopenRequestFormState());
                    setNoticeDocumentURLFiles([]);
                    setNoticeDocumentURL("");
                    setRemovedNoticeDocumentURLs([]);
                }}
                onCancel={() => {
                    setReopenModalOpen(false);
                    setErrors({});
                    setReopenFormData(getReopenRequestFormState());
                    setNoticeDocumentURLFiles([]);
                    setNoticeDocumentURL("");
                    setRemovedNoticeDocumentURLs([]);
                }}
                size="lg"
                title="Reopen Tax Tracker"
                loading={isLoading}
                saveText="Reopen"
                cancelText="Cancel"
                onSubmit={handleReopenCaseForm}
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4">
                        <div>
                            <h1>Are you sure you want to reopen this case?</h1>
                        </div>

                        <div>
                            <div className="mt-5">
                                <MultiFilePicker
                                    label="Document"
                                    placeholder="Select Document"
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedNoticeDocumentURLs((prev) => [...prev, url]);
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <TextArea
                                label="Remark"
                                required
                                placeholder="Enter Remark"
                                value={reopenFormData?.NoticeDescription || ''}
                                onChange={(e) => setReopenFormData({ ...reopenFormData, NoticeDescription: e.target.value })}
                                error={errors?.NoticeDescription}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default ViewTaxTracker;