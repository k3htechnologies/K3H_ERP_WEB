import { useParams } from "react-router-dom";
import { useTaxTrackerListState } from "../context/TaxTrackerListStateContext";
import { runApiWithLoader } from "@/core/utils";
import { useEffect, useState } from "react";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Loader } from "@/core/utils/loader";
import { taxTrackerDocumentService } from "../services/TaxTrackerDocumentService";
import type { FilterWithPaginationTaxTrackerDocumentRequest, TaxTrackerDocumentData } from "../models/TaxTrackerDocumentModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";


export const DocumentTracking: React.FC = () => {

    const [documentTrackingData, setDocumentTrackingData] = useState<TaxTrackerDocumentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { TaxTrackerId } = useParams<{ TaxTrackerId: string }>();
    const { listState } = useTaxTrackerListState();
    const currentTaxTrackerId = TaxTrackerId ? Number(TaxTrackerId) : listState.TaxTrackerId;


    useEffect(() => {
        loadDocumentTrackingData();
    }, [currentTaxTrackerId]);

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


    console.log("Viewing Tax Tracker Document Tracking for ID:", currentTaxTrackerId);
    return (
        <div className="mt-5 bg-white rounded-lg border border-gray-200 shadow-s h-140 overflow-y-auto thin-scroll">

            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div></div>{" "}
            </Loader>

            {/* Header */}
            <div className="bg-green-50 px-4 py-2">
                <h2 className="text-sm font-semibold text-green-700">
                    Activity Tracking
                </h2>
            </div>

            {/* Body */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-10 p-2">

                <div >
                    {documentTrackingData && documentTrackingData?.length > 0
                        ? (
                            documentTrackingData?.map((item, index) => (
                                <div key={index} className=" mt-3  ">
                                    <div className="rounded-xl rounded-tl-none border border-gray-200 p-4 bg-blue-50">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-sm">Notice Received</p>
                                            <div className="text-sm font-medium text-gray-600">{formatDate_dd_MonthName_yy(item.CreatedDate ?? '')}</div>
                                        </div>
                                        <div className="mt-3 flex justify-between">
                                            <FieldItem label="Officer Name" value={item.OfficerName} />
                                            <FieldItem label="Officer Address" value={item.OfficerAddress} />
                                        </div>
                                        <div className="mt-2">
                                            <FieldItem label="Remark" value="The Assesing Officer has raised a query regarding the GST return filed for the period 2021-22. The assessee is required to provide clarification within 15 days." />
                                        </div>
                                        {item.NoticeDocumentURL && (
                                            <div className="inline-flex items-end gap-1 px-2 py-2 border border-blue-500 text-blue-600 rounded mt-2 text-sm font-medium cursor-pointer hover:bg-blue-50 transition">
                                                <p className="break-all whitespace-normal max-w-full">Document</p>
                                                <MultiImageViewer
                                                    images={parseDocumentUrls(item.NoticeDocumentURL)}
                                                    title="Notice Document"
                                                    isIcon={false}
                                                    triggerLabel="Document"

                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between">
                                            <p className="font-semibold text-xs text-gray-600 ml-2">
                                                AUTHORITY : {" "}
                                                <span className="font-semibold text-xs">
                                                    {item?.OfficerName?.toUpperCase()}
                                                </span>
                                            </p>

                                            <p className="font-semibold text-xs text-gray-600 ml-2" >
                                                AUTHORITY NAME : {" "}
                                                <span className="font-semibold text-xs">
                                                    {item?.CreatedBy.toUpperCase()}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))

                        ) : (
                            <div>
                                No data is present.
                            </div>
                        )}

                </div>


            </div>

        </div>

    )
}

export default DocumentTracking;