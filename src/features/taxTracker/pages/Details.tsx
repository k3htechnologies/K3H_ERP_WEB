import { useParams } from "react-router-dom";
import { useTaxTrackerListState } from "../context/TaxTrackerListStateContext";
import { useEffect, useState } from "react";
import type { FilterWithPaginationTaxTrackerRequest, TaxTrackerData } from "../models/TaxTrackerModel";
import { runApiWithLoader } from "@/core/utils";
import { taxTrackerService } from "../services/TaxTrackerService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Loader } from "@/core/utils/loader";


export const Details: React.FC = () => {

    const [detailsData, setDetailsData] = useState<TaxTrackerData>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { TaxTrackerId } = useParams<{ TaxTrackerId: string }>();
    const { listState } = useTaxTrackerListState();
    const currentTaxTrackerId = TaxTrackerId ? Number(TaxTrackerId) : listState.TaxTrackerId;


    useEffect(() => {
        loadDetailsData();
    }, []);

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

                    setDetailsData(response.right.Data?.[0] || null);

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

    return (
        <div>
            <div className="grid grid-cols-2 gap-4">

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

                    <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

                    <div className="bg-blue-50 px-4 py-2">
                        <h2 className="text-sm font-semibold text-blue-700">
                            Basic Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-10 p-4">

                        <FieldItem label="Company Name" value={detailsData?.CompanyName || "-"} />
                        <FieldItem label="Government Compliance" value={detailsData?.GovernmentCompliance} />
                        <FieldItem label="Financial Year" value={detailsData?.FinancialYear} />
                        <FieldItem label="Notice U/S" value={detailsData?.NoticeSection} />
                        <FieldItem label="Responsible Person" value={detailsData?.ResponsiblePerson} />
                        <FieldItem label="Notice Status" value={detailsData?.NoticeStatus} />
                    </div>
                </div>


                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ">
                    <div className="bg-violet-50 px-4 py-2">
                        <h2 className="text-sm font-semibold text-violet-700">
                            Notice Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-10 p-4">
                        <FieldItem label="Notice Date" value={formatDate_dd_MonthName_yy(detailsData?.NoticeDate ?? '')} />
                        <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(detailsData?.DueDate ?? '')} />
                        <FieldItem label="Authority" value={detailsData?.Authority} />
                        <FieldItem label="Notice Type" value={detailsData?.NoticeType} />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

                    <div className="bg-orange-50 px-4 py-2">
                        <h2 className="text-sm font-semibold text-orange-700">
                            Reply and Compliance Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-10 p-4">
                        {/* <FieldItem label="Reply Date" value={formatDate_dd_MonthName_yy(detailsData?.ReplyDate ?? '')} />
                        <FieldItem label="Reply Submitted By" value={detailsData?.ReplyRefNo} /> */}
                        <FieldItem label="Reply Date" value="16 June 2026" />
                        <FieldItem label="Reply Submitted By" value="Akansha Yadav" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-y-auto h-[200px] ">
                    <div className="bg-indigo-50 px-4 py-2">
                        <h2 className="text-sm font-semibold text-indigo-700">
                            Remarks
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-10 p-4">
                        <FieldItem label="Remark Type" value="Notice" />
                        <FieldItem label="Date" value="23 June 2026" />
                        <FieldItem label="Remarks" value="Tax is paid" />

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Details;