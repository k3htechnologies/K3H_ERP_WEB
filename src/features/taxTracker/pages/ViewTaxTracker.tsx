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
import Checkbox from "@/ui/components/forms/Checkbox";

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
    const [confirmReopen, setConfirmReopen] = useState(false);
    const { addToast } = useToast();
    const { TaxTrackerId } = useParams<{ TaxTrackerId: string }>();
    const { listState } = useTaxTrackerListState();
    const currentTaxTrackerId = TaxTrackerId ? Number(TaxTrackerId) : listState.TaxTrackerId;
    const { NoticeType, GovernmentCompliance } = listState;
    const navigate = useNavigate();

    const { canAction } = useMenuPermissions("/taxTracker");



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

        if (!noticeDocumentURLFiles || noticeDocumentURLFiles.length === 0) {
            newErrors.NoticeDocumentURLFiles = "Document is required";
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

        const latestAuthority = taxTrackerDetailsData.slice().reverse().find(d => d.AuthorityType)?.AuthorityType || detailsData?.Authority || '';
        fd.append('AuthorityType', latestAuthority);

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
                    <Button
                        color="blue"
                        size="sm"
                        onClick={handleReopenModal}>
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
                        label="Authority Type"
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

                    const cycleAppealItems = cycle.docs.filter(d => d.RequestType === "Appeal");
                    const cycleAppealItem = cycleAppealItems[cycleAppealItems.length - 1];
                    const cycleAppealStatusColor = getNoticeStatusColor(cycleAppealItem?.NoticeStatus ?? "");

                    const cycleOthersItems = cycle.docs.filter(d => d.RequestType === "Others");
                    const cycleOthersItem = cycleOthersItems[cycleOthersItems.length - 1];

                    const cycleCloseItems = cycle.docs.filter(d => d.RequestType === "Close-Notice");
                    const cycleCloseItem = cycleCloseItems[cycleCloseItems.length - 1];

                    const cycleReopenItems = cycle.docs.filter(d => d.RequestType === "Reopen");
                    const cycleReopenItem = cycleReopenItems[cycleReopenItems.length - 1];

                    return (
                        <>
                            <div
                                className="relative cursor-pointer overflow-hidden rounded-xl bg-white"
                                onClick={toggle}
                            >

                                {!isOpen && <div className="absolute inset-y-0 left-0 w-1 bg-[#2563EB]" />}
                                <div className="flex items-center justify-between px-5 py-3 pl-6 pt-5">
                                    <div className="flex-1 min-w-0">

                                        {/* Notice Title */}
                                        <div className="mb-4">
                                            <FieldItem

                                                label="Notice Title"
                                                value={detailsData?.NoticeType || '-'}
                                            />
                                        </div>

                                        {/* Other Details */}
                                        <div className="grid grid-cols-4 gap-0 w-full mt-6">
                                            <div className="pr-6">
                                                <FieldItem
                                                    label="Government Compliance"
                                                    value={detailsData?.GovernmentCompliance || '-'}
                                                />
                                            </div>

                                            <div className="px-15">
                                                <FieldItem
                                                    label="Notice U/S"
                                                    value={detailsData?.NoticeSection || '-'}
                                                />
                                            </div>

                                            <div className="px-20">
                                                <FieldItem
                                                    label="Notice Date"
                                                    value={formatDate_dd_MonthName_yy(
                                                        cycleNotice?.RequestType === "Notice"
                                                            ? cycleNotice?.AmountUnderDisputeDate || ''
                                                            : detailsData?.NoticeDate || ''
                                                    )}
                                                />
                                            </div>

                                            <div className="pl-30">
                                                <FieldItem
                                                    label="Reply Due Date"
                                                    value={formatDate_dd_MonthName_yy(
                                                        detailsData?.DueDate || ''
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <span className="mb-15">
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
                                                    Latest Authority Details
                                                </h4>
                                            </div>

                                            {(() => {
                                                const latestNoticeDoc = noticeDocsInCycle[noticeDocsInCycle.length - 1];
                                                return latestNoticeDoc ? (
                                                    <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                                        <FieldItem label="Officer Name" value={latestNoticeDoc?.OfficerName || '-'} />
                                                        <FieldItem label="Divisional Address" value={latestNoticeDoc?.OfficerAddress || '-'} />
                                                        <FieldItem label="Notice Document" value={latestNoticeDoc?.NoticeDocumentURL ? "View" : "-"} urls={latestNoticeDoc?.NoticeDocumentURL} isIcon />
                                                        <div className="col-span-3">
                                                            <FieldItem label="Description" value={latestNoticeDoc?.NoticeDescription || '-'} />

                                                        </div>
                                                    </div>

                                                ) : (
                                                    <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                                        <FieldItem label="Officer Name" value="-" />
                                                        <div className="col-span-2">
                                                            <FieldItem label="Divisional Address" value="-" />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </section>

                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            {/* Header */}
                                            <div className="bg-[#ffffe4] px-3 py-2 border-b border-[#D0D7DE]">
                                                <h4 className="text-sm font-semibold text-[#8b7d3f]">
                                                    Latest Order Details
                                                </h4>
                                            </div>

                                            {(() => {
                                                const latestOrderDoc = orderDocsInCycle[orderDocsInCycle.length - 1];
                                                return latestOrderDoc ? (
                                                    <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                                                        {/* Order Date */}
                                                        <FieldItem
                                                            label="Date"
                                                            value={
                                                                latestOrderDoc?.AmountUnderDisputeDate
                                                                    ? formatDate_dd_MonthName_yy(latestOrderDoc.AmountUnderDisputeDate)
                                                                    : "-"
                                                            }
                                                        />

                                                        {/* Amount Under Dispute */}
                                                        {latestOrderDoc?.OrderStatus !== "Favourable" && (
                                                            <div className="">
                                                                <FieldItem
                                                                    label="Amount Under Dispute (₹)"
                                                                    value={formatCurrency(Number(latestOrderDoc.AmountUnderDispute?.toFixed(2)) ?? 0)}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Order Status */}
                                                        <FieldItem
                                                            label="Status"
                                                            value={
                                                                (() => {
                                                                    const color = getNoticeStatusColor(latestOrderDoc?.OrderStatus ?? "");
                                                                    return (
                                                                        <span
                                                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                                                            style={{ backgroundColor: color.bg, color: color.text }}
                                                                        >
                                                                            {latestOrderDoc?.OrderStatus || "-"}
                                                                        </span>
                                                                    );
                                                                })()
                                                            }
                                                        />

                                                        {/* Authority Type */}
                                                        {latestOrderDoc?.OrderStatus === "Non-Favourable" && (
                                                            <FieldItem
                                                                label="Authority Type"
                                                                value={latestOrderDoc?.AuthorityType || "-"}
                                                            />
                                                        )}


                                                        <FieldItem label="Document" value={latestOrderDoc?.NoticeDocumentURL ? "View" : "-"} urls={latestOrderDoc?.NoticeDocumentURL} isIcon />


                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-4">
                                                        <FieldItem label="Order Date" value="-" />
                                                        <div className="col-span-2">
                                                            <FieldItem label="Amount Under Dispute (₹)" value="-" />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </section>


                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#F5F8FD] px-3 py-2 border-b border-[#D9E1EC]">
                                                <h4 className="text-sm font-semibold text-[#123B7A]">Latest Appeal Details</h4>
                                            </div>

                                            <div className="p-4 bg-white grid grid-cols-3 gap-4">

                                                <FieldItem
                                                    label="Date Of Appeal"
                                                    value={cycleAppealItem?.AmountUnderDisputeDate ? formatDate_dd_MonthName_yy(cycleAppealItem.AmountUnderDisputeDate) : "-"}
                                                />
                                                <FieldItem
                                                    label="Appeal Due Date"
                                                    value={cycleAppealItem?.DateOfAppeal ? formatDate_dd_MonthName_yy(cycleAppealItem.DateOfAppeal) : "-"}
                                                />

                                                <FieldItem
                                                    label="Status"
                                                    value={
                                                        cycleAppealItem?.NoticeStatus ? (
                                                            <span
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                                                style={{ backgroundColor: cycleAppealStatusColor.bg, color: cycleAppealStatusColor.text }}
                                                            >
                                                                {cycleAppealItem.NoticeStatus}
                                                            </span>
                                                        ) : "-"
                                                    }
                                                />

                                                <FieldItem label="Document" value={cycleAppealItem?.NoticeDocumentURL ? "View" : "-"} urls={cycleAppealItem?.NoticeDocumentURL} isIcon />

                                            </div>

                                            <div className="px-4 py-3 -mt-3">
                                                <FieldItem
                                                    label="Description"
                                                    value={cycleAppealItem?.NoticeDescription || "-"}
                                                />
                                            </div>
                                        </section>

                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#F5F8FD] px-3 py-2 border-b border-[#D9E1EC]">
                                                <h4 className="text-sm font-semibold text-[#5c5f63]">
                                                    Latest Other Details
                                                </h4>
                                            </div>

                                            <div className="p-3">
                                                <FieldItem
                                                    label="Created Date"
                                                    value={cycleOthersItem?.CreatedDate ? formatDate_dd_MonthName_yy(cycleOthersItem.CreatedDate) : "-"}
                                                />

                                                <div className="mt-2">
                                                    <FieldItem
                                                        label="Description"
                                                        value={cycleOthersItem?.NoticeDescription || "-"}
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        {/* Latest Close Details */}
                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#fff0f0] px-3 py-2 border-b border-[#f5c6cb]">
                                                <h4 className="text-sm font-semibold text-[#c0392b]">Latest Close Details</h4>
                                            </div>
                                            <div className="p-3 grid grid-cols-3 gap-4">
                                                <FieldItem
                                                    label="Closed Date"
                                                    value={cycleCloseItem?.CreatedDate ? formatDate_dd_MonthName_yy(cycleCloseItem.CreatedDate) : "-"}
                                                />
                                                <FieldItem
                                                    label="Closed By"
                                                    value={cycleCloseItem?.CreatedBy || "-"}
                                                />
                                                <FieldItem
                                                    label="Document"
                                                    value={cycleCloseItem?.NoticeDocumentURL ? "View" : "-"}
                                                    urls={cycleCloseItem?.NoticeDocumentURL}
                                                    isIcon
                                                />
                                                {cycleCloseItem?.NoticeDescription && (
                                                    <div className="col-span-3">
                                                        <FieldItem
                                                            label="Description"
                                                            value={cycleCloseItem.NoticeDescription}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* Latest Reopen Details */}
                                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                                            <div className="bg-[#e8f5e9] px-3 py-2 border-b border-[#a5d6a7]">
                                                <h4 className="text-sm font-semibold text-[#1b5e20]">Latest Reopen Details</h4>
                                            </div>
                                            <div className="p-3 grid grid-cols-3 gap-4">
                                                <FieldItem
                                                    label="Reopened Date"
                                                    value={cycleReopenItem?.CreatedDate ? formatDate_dd_MonthName_yy(cycleReopenItem.CreatedDate) : "-"}
                                                />
                                                <FieldItem
                                                    label="Reopened By"
                                                    value={cycleReopenItem?.CreatedBy || "-"}
                                                />
                                                <FieldItem
                                                    label="Document"
                                                    value={cycleReopenItem?.NoticeDocumentURL ? "View" : "-"}
                                                    urls={cycleReopenItem?.NoticeDocumentURL}
                                                    isIcon
                                                />
                                                {cycleReopenItem?.NoticeDescription && (
                                                    <div className="col-span-3">
                                                        <FieldItem
                                                            label="Description"
                                                            value={cycleReopenItem.NoticeDescription}
                                                        />
                                                    </div>
                                                )}
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

                                                                                        {item.RequestType === "Others" && item.CreatedDate && (
                                                                                            <div className="pt-1">
                                                                                                <p className={`text-xs font-medium ${cardConfig.labelColor}`}>
                                                                                                    {formatDate_dd_MonthName_yy(item.CreatedDate)}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}
                                                                                        {item.RequestType === "Reopen" && item.CreatedDate && (
                                                                                            <div className="pt-1">
                                                                                                <p className={`text-xs font-medium ${cardConfig.labelColor}`}>
                                                                                                    {formatDate_dd_MonthName_yy(item.CreatedDate)}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}
                                                                                        {item.RequestType === "Close-Notice" && item.CreatedDate && (
                                                                                            <div className="pt-1">
                                                                                                <p className={`text-xs font-medium ${cardConfig.labelColor}`}>
                                                                                                    {formatDate_dd_MonthName_yy(item.CreatedDate)}
                                                                                                </p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>

                                                                                    {item.NoticeDescription && (
                                                                                        <div className="pt-2">
                                                                                            <p className={`text-sm font-semibold wrap-break-words whitespace-normal ${cardConfig.labelColor}`}>
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


                                                                                {(!item.RequestType || item.RequestType === "Notice" || item.RequestType === "Order" || item.RequestType === "Appeal" || item.RequestType === "Others" || item.RequestType === "Close-Notice" || item.RequestType === "Reopen" || item.RequestType === "Reply") && (
                                                                                    <div className="mt-1.5 px-1">
                                                                                        <div className="flex flex-col gap-1 text-[10px] tracking-wider text-gray-500 font-bold">
                                                                                            {item.AuthorityType && (item.RequestType !== "Reply") && (
                                                                                                <div className="flex items-start">
                                                                                                    <span className="w-28 shrink-0">AUTHORITY TYPE</span>
                                                                                                    <span className="mr-1.5">:</span>
                                                                                                    <span className={`break-words ${cardConfig.footerColor}`}>
                                                                                                        {item.AuthorityType}
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {(!item.RequestType || item.RequestType === "Notice") && (
                                                                                                <div className="flex items-start">
                                                                                                    <span className="w-28 shrink-0">OFFICER NAME</span>
                                                                                                    <span className="mr-1.5">:</span>
                                                                                                    <span className={`break-words ${cardConfig.footerColor}`}>
                                                                                                        {(item.OfficerName || "").toUpperCase()}
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {item.RequestType === "Reply" && (
                                                                                                <div className="flex items-start">
                                                                                                    <span className="w-28 shrink-0">REPLIED BY</span>
                                                                                                    <span className="mr-1.5">:</span>
                                                                                                    <span className={`break-words ${cardConfig.footerColor}`}>
                                                                                                        {(item.CreatedBy || "").toUpperCase()}
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {item.RequestType === "Order" && (item.OrderStatus === "Favourable" || item.OrderStatus === "Non-Favourable") && (
                                                                                                <div className="flex items-start">
                                                                                                    <span>ORDER SUBMITTED BY</span>
                                                                                                    <span className="mr-1">:</span>
                                                                                                    <span className={`break-words ${cardConfig.footerColor}`}>
                                                                                                        {(item.CreatedBy || "").toUpperCase()}
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {item.RequestType === "Appeal" && (
                                                                                                <div className="flex items-start">
                                                                                                    <span className="w-32 shrink-0">APPEAL FILED BY</span>
                                                                                                    <span className="mr-1.5">:</span>
                                                                                                    <span className={`break-words ${cardConfig.footerColor}`}>
                                                                                                        {(item.CreatedBy || "").toUpperCase()}
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {item.RequestType === "Close-Notice" && (
                                                                                                <div className="flex items-start">
                                                                                                    <span className="w-32 shrink-0">NOTICE CLOSED BY</span>
                                                                                                    <span className="mr-1.5">:</span>
                                                                                                    <span className={`break-words ${cardConfig.footerColor}`}>
                                                                                                        {(item.CreatedBy || "").toUpperCase()}
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {item.RequestType === "Reopen" && (
                                                                                                <div className="flex items-start">
                                                                                                    <span className="w-32 shrink-0">NOTICE REOPENED BY</span>
                                                                                                    <span className="mr-1.5">:</span>
                                                                                                    <span className={`break-words ${cardConfig.footerColor}`}>
                                                                                                        {(item.CreatedBy || "").toUpperCase()}
                                                                                                    </span>
                                                                                                </div>
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
                    setConfirmReopen(false);
                }}
                onCancel={() => {
                    setReopenModalOpen(false);
                    setErrors({});
                    setReopenFormData(getReopenRequestFormState());
                    setNoticeDocumentURLFiles([]);
                    setNoticeDocumentURL("");
                    setRemovedNoticeDocumentURLs([]);
                    setConfirmReopen(false);
                }}
                size="lg"
                title="Reopen Tax Tracker"
                loading={isLoading}
                saveText={confirmReopen ? "Reopen" : ""}
                onSubmit={handleReopenCaseForm}
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4">
                        <div>
                            <div className="">
                                <MultiFilePicker
                                    label="Document"
                                    placeholder="Select Document"
                                    required
                                    value={noticeDocumentURLFiles}
                                    onChange={setNoticeDocumentURLFiles}
                                    availableFilesURL={noticeDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedNoticeDocumentURLs((prev) => [...prev, url]);
                                    }}
                                    error={errors?.NoticeDocumentURLFiles}
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

                        <div>
                            <Checkbox
                                label="Are you sure you want to reopen this case?"
                                checked={confirmReopen}
                                required
                                onChange={(e) => {
                                    setConfirmReopen(e.target.checked)
                                    setErrors({});
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default ViewTaxTracker;