import { useNavigate, useParams } from "react-router-dom";
import { useTaxTrackerListState } from "@/features/taxTracker/context/TaxTrackerListStateContext";
import { useEffect, useState } from "react";
import type { FilterWithPaginationTaxTrackerRequest, TaxTrackerData, TaxTrackerDocumentDetailsData } from "../models/TaxTrackerModel";
import { runApiWithLoader } from "@/core/utils";
import { taxTrackerService } from "@/features/taxTracker/services/TaxTrackerService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import type { AddUpdateTaxTrackerDocumentRequest, FilterWithPaginationTaxTrackerDocumentRequest, TaxTrackerDocumentData } from "../models/TaxTrackerDocumentModel";
import { taxTrackerDocumentService } from "@/features/taxTracker/services/TaxTrackerDocumentService";
import { Button } from "@/ui/components/forms";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";

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
});

export const ViewTaxTracker: React.FC = () => {

    const [detailsData, setDetailsData] = useState<TaxTrackerData>();
    const [documentTrackingData, setDocumentTrackingData] = useState<TaxTrackerDocumentData[]>([]);
    const [taxTrackerDetailsData, setTaxTrackerDetailsData] = useState<TaxTrackerDocumentDetailsData[]>([]);
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
    const { NoticeType } = listState;
    const navigate = useNavigate();

    const noticeDetails = taxTrackerDetailsData.filter(
        (item) => !item.RequestType || item.RequestType === "Notice"
    );

    const orderDetails = taxTrackerDetailsData.filter(
        (item) => item.RequestType === "Order"
    );

    useEffect(() => {
        loadDocumentTrackingData();
        loadDetailsData();
    }, [currentTaxTrackerId]);


    // useEffect(() => {
    //     loadDocumentTrackingData();
    //     loadDetailsData();

    // }, [currentTaxTrackerId]);

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

                } else {
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

    const loadDocumentTrackingData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaxTrackerDocumentRequest = {
                    TaxTrackerId: currentTaxTrackerId,
                    TaxTrackerDocumentId: 0,
                };

                const response = await taxTrackerDocumentService.apiCallPullTaxTrackerDocument(params);

                if (E.isRight(response)) {

                    setDocumentTrackingData(response.right.Data);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Document Tracking'
        );
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

    }


    const PushAddUpdateRequestForm = (): FormData => {

        const fd = new FormData();
        fd.append('NoticeDescription', reopenFormData.NoticeDescription || '');
        fd.append('TaxTrackerId', currentTaxTrackerId.toString());
        fd.append('RequestType', 'Reopen');
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

    const handleReopenModal = () => {
        setReopenModalOpen(true);
    }

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

                    await loadDetailsData();

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
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <div className="flex justify-between items-center">
                <div>
                    <HeaderActionBar
                        subTitleText={NoticeType}
                        onCancel={() => {
                            navigate('/taxTracker');
                        }}
                    />
                </div>


                {documentTrackingData.some((item) => item.RequestType === 'Close-Notice') && (
                    <>
                        <div className="text-right">
                            <Button onClick={handleReopenModal}>Reopen</Button>
                        </div>
                    </>
                )}

            </div>

            <div className="bg-white w-full rounded-lg border border-gray-200 shadow-xs overflow-hidden mt-5">
                <div className="p-6 flex justify-between">
                    <FieldItem label="Company Name" value={detailsData?.CompanyName} />
                    <FieldItem label="Financial Year" value={detailsData?.FinancialYear} />
                    <FieldItem label="Responsible Person" value={detailsData?.ResponsiblePerson} />
                </div>
            </div>

            <div className="pt-5">
                <div className="grid grid-cols-2 gap-5 mt-5">

                    <div className="space-y-5">

                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                            <div className="bg-[#f3f0fe] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#8349df]">
                                    Notice Details
                                </h4>
                            </div>

                            {noticeDetails.length > 0 ? (
                                noticeDetails.map((item, key) => (
                                    <div key={key}>
                                        <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                            <FieldItem label="Notice U/S" value={detailsData?.NoticeSection} />
                                            <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(detailsData?.DueDate || '')} />
                                            <FieldItem label="Notice Type" value={detailsData?.NoticeType} />
                                            <FieldItem label="Office Address" value={item?.OfficerAddress || 'N/A'} />
                                            <FieldItem label="Notice Date" value={formatDate_dd_MonthName_yy(detailsData?.NoticeDate || '')} />
                                            <FieldItem label="Created By" value={item?.CreatedBy} />
                                        </div>

                                        {key !== noticeDetails.length - 1 && (
                                            <div className="border-t border-gray-300 mx-4" />
                                        )}
                                    </div>
                                ))
                            ) : (
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

                            {orderDetails.length > 0 ? (
                                orderDetails.map((item, key) => (
                                    <div key={key}>
                                        <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                            <FieldItem
                                                label={
                                                    item?.OrderStatus === "Non-Favourable"
                                                        ? "Appeal Date"
                                                        : "Order Date"
                                                }
                                                value={formatDate_dd_MonthName_yy(item?.AmountUnderDisputeDate || "")}
                                            />

                                            {item?.OrderStatus === "Non-Favourable" && (
                                                <>
                                                    <FieldItem
                                                        label="Demand Amount"
                                                        value={
                                                            item?.AmountUnderDispute
                                                                ? `₹ ${Number(item.AmountUnderDispute).toLocaleString("en-IN")}`
                                                                : ""
                                                        }
                                                    />
                                                    <FieldItem
                                                        label="Authority Type"
                                                        value={item?.AuthorityType || 'N/A'}
                                                    />

                                                </>

                                            )}
                                            {item?.OrderStatus === "Favourable" && (
                                                <FieldItem
                                                    label="Demand Amount"
                                                    value={
                                                        item?.AmountUnderDispute
                                                            ? `₹ ${Number(item.AmountUnderDispute).toLocaleString("en-IN")}`
                                                            : ""
                                                    }
                                                />
                                            )}

                                            <FieldItem
                                                label="Order Status"
                                                value={item?.OrderStatus || ""}
                                            />
                                        </div>

                                        {key !== orderDetails.length - 1 && (
                                            <div className="border-t border-gray-300 mx-4" />
                                        )}
                                    </div>
                                ))
                            ) : (

                                <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                    <FieldItem label="Order Date" value="-" />
                                    <FieldItem label="Demand Amount" value="-" />
                                    <FieldItem label="Order Status" value="-" />
                                </div>
                            )}
                        </section>

                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs">
                            <div className="bg-[#e1e2e4] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#5c5f63]">
                                    Action Details
                                </h4>
                            </div>

                            <div className="p-4 bg-white grid grid-cols-3 gap-4">
                                <FieldItem label="Created By" value={detailsData?.CreatedBy} />
                                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(detailsData?.CreatedDate || '')} />
                                <FieldItem label="Modified By" value={detailsData?.ModifiedBy} />
                                <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(detailsData?.ModifiedDate || '')} />
                            </div>
                        </section>
                    </div>

                    <div>
                        <section className="border-[0.1px] rounded-xl border-[#33333321] overflow-hidden shadow-2xs bg-white min-h-[500px] overflow-y-auto thin-scroll">
                            <div className="bg-[#edf7ed] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#1e4620]">
                                    Activity Tracker
                                </h4>
                            </div>

                            <div className="flex flex-col items-center w-full p-4">
                                <div className="w-full ml-1 h-[506px] overflow-y-auto pr-2 thin-scroll">
                                    {documentTrackingData && documentTrackingData.length > 0 ? (
                                        <div className="space-y-5">
                                            {documentTrackingData.map((item, index) => {

                                                const isLeftAligned = !item.RequestType || item.RequestType === "Notice" || item.RequestType === "Order";

                                                let cardConfig = {
                                                    title: "Initial Notice Received",
                                                    bgColor: "bg-[#e8eef9]",
                                                    textColor: "text-slate-900",
                                                    labelColor: "text-slate-500",
                                                    fieldTextColor: "text-slate-700",
                                                    footerColor: "text-slate-700",
                                                    borderColor: "border-[#d0ddf2]",
                                                    badgeColor: "border-[#a5c2f5] text-blue-600 bg-[#e8eef9] hover:bg-[#dbe6f8]" // Blue text & outline with matching fill
                                                };

                                                switch (item.OrderStatus) {
                                                    case "Non-Favourable":
                                                        cardConfig = {
                                                            title: "Appeal",
                                                            bgColor: "bg-[#f0f4f9]",
                                                            textColor: "text-gray-800",
                                                            labelColor: "text-gray-500",
                                                            fieldTextColor: "text-gray-900",
                                                            footerColor: "text-gray-700",
                                                            borderColor: "border-gray-200",
                                                            badgeColor: "border-blue-500 text-blue-600 hover:bg-blue-50"
                                                        };
                                                        break;
                                                    case "Favourable":
                                                        cardConfig = {
                                                            title: "Order Passed",
                                                            bgColor: "bg-blue-600",
                                                            textColor: "text-white",
                                                            labelColor: "text-blue-200",
                                                            fieldTextColor: "text-blue-100",
                                                            footerColor: "text-gray-600",
                                                            borderColor: "border-blue-600",
                                                            badgeColor: "border-white/40 text-white hover:bg-white/10"
                                                        };
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                if (item.OrderStatus === '') {
                                                    switch (item.RequestType) {

                                                        case "Reopen":
                                                            cardConfig = {
                                                                title: "Reopen TaxTracker",
                                                                bgColor: "bg-[#f0f4f9]",
                                                                textColor: "text-gray-800",
                                                                labelColor: "text-gray-500",
                                                                fieldTextColor: "text-gray-900",
                                                                footerColor: "text-gray-700",
                                                                borderColor: "border-gray-200",
                                                                badgeColor: "border-blue-500 text-blue-600 hover:bg-blue-50"
                                                            };
                                                            break;
                                                        case "Close-Notice":
                                                            cardConfig = {
                                                                title: "Closed",
                                                                bgColor: "bg-[#f0f4f9]",
                                                                textColor: "text-gray-800",
                                                                labelColor: "text-gray-500",
                                                                fieldTextColor: "text-gray-900",
                                                                footerColor: "text-gray-700",
                                                                borderColor: "border-gray-200",
                                                                badgeColor: "border-blue-500 text-blue-600 hover:bg-blue-50"
                                                            };
                                                            break;

                                                        case "Notice":
                                                            cardConfig = {
                                                                title: "Notice Received",
                                                                bgColor: "bg-[#e8eef9]",
                                                                textColor: "text-slate-900",
                                                                labelColor: "text-slate-500",
                                                                fieldTextColor: "text-slate-700",
                                                                footerColor: "text-slate-700",
                                                                borderColor: "border-[#d0ddf2]",
                                                                badgeColor: "border-[#a5c2f5] text-blue-600 bg-[#e8eef9] hover:bg-[#dbe6f8]"
                                                            };
                                                            break;
                                                        case "Reply":
                                                            cardConfig = {
                                                                title: "Reply Prepared",
                                                                bgColor: "bg-[#002060]",
                                                                textColor: "text-white",
                                                                labelColor: "text-gray-300",
                                                                fieldTextColor: "text-white",
                                                                footerColor: "text-black",
                                                                borderColor: "border-transparent",
                                                                badgeColor: "border-white text-white hover:bg-white/10"
                                                            };
                                                            break;
                                                        case "Order":

                                                            cardConfig = {
                                                                title: "Order Passed",
                                                                bgColor: "bg-[#1d4ed8]",
                                                                textColor: "text-white",
                                                                labelColor: "text-gray-300",
                                                                fieldTextColor: "text-white",
                                                                footerColor: "text-gray-300",
                                                                borderColor: "border-transparent",
                                                                badgeColor: "border-white text-white hover:bg-white/10"
                                                            };
                                                            break;


                                                        case "Appeal":
                                                            cardConfig = {
                                                                title: "Appeal Filed",
                                                                bgColor: "bg-[#e2e8f0]",
                                                                textColor: "text-gray-900",
                                                                labelColor: "text-gray-600",
                                                                fieldTextColor: "text-gray-900",
                                                                footerColor: "text-gray-600",
                                                                borderColor: "border-gray-300",
                                                                badgeColor: "border-gray-500 text-gray-700 hover:bg-gray-200"
                                                            };
                                                            break;
                                                    }


                                                }


                                                return (
                                                    <div key={index} className={`w-full flex ${isLeftAligned ? 'justify-start' : 'justify-end'} mb-6`}>
                                                        <div className="w-full max-w-[82%]">

                                                            <div className={`rounded-xl border p-4 shadow-xs w-full transition-all ${cardConfig.bgColor} ${cardConfig.borderColor} ${isLeftAligned ? 'rounded-tl-none' : 'rounded-tr-none'}`}>


                                                                <div className="flex items-center justify-between">
                                                                    <p className={`font-semibold text-sm ${cardConfig.textColor}`}>
                                                                        {cardConfig.title}
                                                                    </p>
                                                                    <div className={`text-xs font-medium ${item.RequestType === "Reply" || item.RequestType === "Order" ? 'text-gray-300' : 'text-gray-500'}`}>
                                                                        {formatDate_dd_MonthName_yy(item.CreatedDate ?? "")}
                                                                    </div>
                                                                </div>


                                                                {item.NoticeDescription && (
                                                                    <div className="mt-2 pt-2">
                                                                        <p className={`text-xs font-semibold ${cardConfig.labelColor}`}>
                                                                            Remark : <span className={`font-normal ${cardConfig.fieldTextColor}`}>{item.NoticeDescription}</span>
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


                                                            <div className="mt-1.5 px-1">
                                                                <div className="flex justify-between text-[10px] tracking-wider text-gray-500 font-bold">
                                                                    {item.OfficerName && (
                                                                        <p>
                                                                            AUTHORITY : <span className={cardConfig.footerColor}>{item?.OfficerName}</span>
                                                                        </p>
                                                                    )}
                                                                    <p>
                                                                        {item.RequestType === "Reply" ? "UPLOADED BY : " : "AUTHORITY NAME : "}
                                                                        <span className={cardConfig.footerColor}>
                                                                            {(item.CreatedBy || item.OfficerName || "").toUpperCase()}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>

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

                    <Modal
                        isOpen={reopenModalOpen}
                        onClose={
                            () => {
                                setReopenModalOpen(false);
                                setErrors({});
                                setReopenFormData(getReopenRequestFormState());
                                setNoticeDocumentURLFiles([]);
                                setNoticeDocumentURL("");
                                setRemovedNoticeDocumentURLs([]);
                            }
                        }
                        onCancel={
                            () => {
                                setReopenModalOpen(false);
                                setErrors({});
                                setReopenFormData(getReopenRequestFormState());
                                setNoticeDocumentURLFiles([]);
                                setNoticeDocumentURL("");
                                setRemovedNoticeDocumentURLs([]);
                            }
                        }
                        size="lg"
                        title="Reopen Tax Tracker"
                        loading={isLoading}
                        saveText="Reopen"
                        cancelText="Cancel"
                        onSubmit={handleReopenCaseForm}
                    >
                        <div className="space-y-10 p-6 bg-blue-100">
                            <div className="space-y-4" >
                                <div>
                                    <h1 className=''>Are you sure you want to reopen this case?</h1>
                                </div>

                                <div>
                                    <div className="mt-5">
                                        <MultiFilePicker
                                            label="Document"
                                            placeholder="Select Document"
                                            value={noticeDocumentURLFiles}
                                            onChange={setNoticeDocumentURLFiles}
                                            availableFilesURL={noticeDocumentURL ?? ""}
                                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
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

                </div>
            </div>
        </div>
    );
};

export default ViewTaxTracker;