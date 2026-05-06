import { Loader } from "@/core/utils/loader"
import { useCallback, useEffect, useState } from "react";
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from "@/core/utils";
import useToast from "@/core/hooks/useToast";
import OverviewCards from "@/features/crmDashboard/components/OverviewCards";
import type { Table0, Table1, Table2, Table3, Table4, Table5, Table6 } from "@/features/crmDashboard/models/CrmDashboardModel";
import { crmDashboardService } from "@/features/crmDashboard/services/CrmDashboardService";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import BookingOverview from "@/features/crmDashboard/components/BookingOverview";
import AgreementTDSGSTCollectionSummary from "@/features/crmDashboard/components/AgreementTDSGSTCollectionSummary";
import ModifiedRequests from "@/features/crmDashboard/components/ModifiedRequests";
import RecentBooking from "@/features/crmDashboard/components/RecentBooking";
import BrokerageSummary from "@/features/crmDashboard/components/BrokerageSummary";
import RecentTransaction from "@/features/crmDashboard/components/RecentTransaction";
import MilestoneCollection from "@/features/crmDashboard/components/MilestoneCollection";
import { DateRangeWithActions } from "@/ui/components/DateRangeWithActions";
import AgreementGstTdsTotalReceivedSummary from "@/features/crmDashboard/components/AgreementGstTdsTotalReceivedSummary";


const CrmDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();
    const { projectId } = useProject();

    const [filterType, setFilterType] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE">("WEEKLY");
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);

    const [overViewCardData, setOverViewCardData] = useState<Table0[]>([]);
    const [topChannelPartnerNameData, setTopChannelPartnerNameData] = useState<Table1[]>([]);
    const [bookingData, setBookingData] = useState<Table2[]>([]);
    const [payTrackPaymentLedgerData, setPayTrackPaymentLedgerData] = useState<Table3[]>([]);
    const [agreementTDSGSTCollectionData, setAgreementTDSGSTCollectionData] = useState<Table4[]>([]);
    const [milestoneCollectionData, setMilestoneCollectionData] = useState<Table5[]>([]);
    const [modifiedRequestesData, setModifiedRequestesData] = useState<Table6[]>([]);


    useEffect(() => {
        if (!projectId) return;

        if (filterType.toUpperCase() === "DATEWISE" && (!fromDate || !toDate)) return;

        fetchCrmDashboard();
    }, [projectId, filterType, fromDate, toDate]);


    const fetchCrmDashboard = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {


                const response = await crmDashboardService.apiCallPullCrmDashboard(
                    Number(projectId),
                    filterType.toUpperCase(),
                    filterType.toUpperCase() === "DATEWISE" ? fromDate : "",
                    filterType.toUpperCase() === "DATEWISE" ? toDate : ""
                );

                if (E.isRight(response)) {

                    const e = response.right.Data;
                    setOverViewCardData(e.Table0 || []);
                    setTopChannelPartnerNameData(e.Table1 || []);
                    setBookingData(e.Table2 || []);
                    setPayTrackPaymentLedgerData(e.Table3 || []);
                    setAgreementTDSGSTCollectionData(e.Table4 || []);
                    setMilestoneCollectionData(e.Table5 || []);
                    setModifiedRequestesData(e.Table6 || []);
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
            "Loading CRM Dashboard "
        );
    }, [addToast, projectId, filterType, fromDate, toDate]);


    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>


            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

                <div className="flex gap-2">

                    {["Today", "Weekly", "Monthly", "Datewise","Overall"].map((tab) => (

                        <button
                            key={tab}
                            onClick={() => {
                                setFilterType(tab as any);

                                if (tab.toUpperCase() !== "DATEWISE") {
                                    setFromDate(null);
                                    setToDate(null);
                                }
                            }}
                            className={`px-6 py-3 rounded-md text-sm font-medium transition-all  ${filterType === tab ? "bg-blue-600 text-white shadow" : "bg-gray-200 hover:bg-gray-200 text-gray-700"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>


                {filterType.toUpperCase() === "DATEWISE" && (
                    <div className="flex items-center gap-2">
                        <DateRangeWithActions
                            fromDate={fromDate}
                            toDate={toDate}
                            onBothDatesChange={(f, t) => {
                                setFromDate(f);
                                setToDate(t);
                            }}
                            onFromDateChange={(f) => setFromDate(f)}
                            onToDateChange={(t) => setToDate(t)}
                            exportLoading={isLoading}
                        />
                    </div>
                )}

            </div>

            
            <div className="pb-1">
                <OverviewCards overViewData={overViewCardData} />
            </div>


            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-3">
                    <BookingOverview bookingRegisteredData={overViewCardData} />
                </div>
                <div className="col-span-12 lg:col-span-9">
                    <AgreementTDSGSTCollectionSummary agreementTDSGSTCollectionData={agreementTDSGSTCollectionData} bookingRegisteredData={overViewCardData} />
                </div>
            </div>


            <div className="grid grid-cols-12 gap-4">

                <div className="col-span-12 lg:col-span-4">
                    <ModifiedRequests data={modifiedRequestesData} />
                    <RecentBooking data={bookingData} />
                    <BrokerageSummary summary={overViewCardData} topBroker={topChannelPartnerNameData} />
                </div>

                <div className="col-span-12 lg:col-span-8">
                    <AgreementGstTdsTotalReceivedSummary bookingRegisteredData={overViewCardData} />
                    <MilestoneCollection data={milestoneCollectionData} />
                    <RecentTransaction data={payTrackPaymentLedgerData} />
                </div>

            </div>
        </div>
    )
}
export default CrmDashboard