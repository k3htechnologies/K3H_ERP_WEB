import { Loader } from "@/core/utils/loader"
import { useCallback, useEffect, useState } from "react";
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from "@/core/utils";
import useToast from "@/core/hooks/useToast";
import OverviewCards from "@/features/crmDashboard/components/OverviewCards";
import type { Table0, Table1, Table2, Table3, Table4 } from "@/features/crmDashboard/models/CrmDashboardModel";
import { crmDashboardService } from "@/features/crmDashboard/services/CrmDashboardService";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import BookingOverview from "@/features/crmDashboard/components/BookingOverview";
import AgreementTDSGSTCollectionSummary from "@/features/crmDashboard/components/AgreementTDSGSTCollectionSummary";
import ModifiedRequests from "@/features/crmDashboard/components/ModifiedRequests";
import RecentBooking from "@/features/crmDashboard/components/RecentBooking";
import BrokerageSummary from "@/features/crmDashboard/components/BrokerageSummary";
import RecentTransaction from "@/features/crmDashboard/components/RecentTransaction";
import { DateRangeWithActions } from "@/ui/components/DateRangeWithActions";
import AgreementGstTdsTotalReceivedSummary from "@/features/crmDashboard/components/AgreementGstTdsTotalReceivedSummary";
import { Button } from "@/ui/components/forms";
import { useNavigate } from "react-router-dom";
import { Tabs, type TabItem } from "@/ui/components/Tab/Tab";
import Alert from "@/features/crmDashboard/components/Alert";
import type { Table5 } from "@/features/crmDashboard/models/CrmDashboardModel";

const FILTER_TABS: TabItem[] = [
    { id: "TODAY", label: "Today" },
    { id: "WEEKLY", label: "Weekly" },
    { id: "MONTHLY", label: "Monthly" },
    { id: "DATEWISE", label: "Datewise" },
    { id: "OVERALL", label: "Overall" },
];

const CrmDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();
    const { projectId } = useProject();
    const navigate = useNavigate();

    const [filterType, setFilterType] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE" | "OVERALL">("MONTHLY")
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);
    const [overViewCardData, setOverViewCardData] = useState<Table0[]>([]);
    const [topChannelPartnerNameData, setTopChannelPartnerNameData] = useState<Table1[]>([]);
    const [bookingData, setBookingData] = useState<Table2[]>([]);
    const [payTrackPaymentLedgerData, setPayTrackPaymentLedgerData] = useState<Table3[]>([]);
    const [modifiedRequestesData, setModifiedRequestesData] = useState<Table4[]>([]);
    const [alertData, setAlertData] = useState<Table5[]>([]);


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
                    setModifiedRequestesData(e.Table4 || []);
                    setAlertData(e.Table5 || []);

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


            <div className="bg-white h-[90px] rounded-lg">
                <div className="flex justify-between gap-3 p-6">

                    <div className="flex flex-1 justify-start">
                        <Tabs
                            tabs={FILTER_TABS}
                            defaultActive={filterType}
                            islarge={true}
                            istoggleTab={true}
                            onTabChange={(tab) => {
                                setFilterType(tab.id as any);

                                if (tab.id !== "DATEWISE") {
                                    setFromDate(null);
                                    setToDate(null);
                                }
                            }}
                        />
                    </div>

                    {filterType.toUpperCase() === "DATEWISE" && (
                        
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
                        
                    )}

                    <Button
                        onClick={() =>
                            navigate("/crmDashboard/collectionMilestone/view", {
                                state: {
                                    filterType,
                                    fromDate,
                                    toDate,
                                },
                            })
                        }
                        size="md"
                        style={{
                            padding: "4px 8px"
                        }}
                    >
                        View Milestone
                    </Button>
                </div>

            </div>

            <div className="pt-5">
                <OverviewCards overViewData={overViewCardData} />
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
                {/* Left side: Booking Overview */}
                <div className="col-span-12 lg:col-span-3">
                    <BookingOverview
                        bookingRegisteredData={overViewCardData}
                    />
                </div>

                {/* Right side: Collection Summary */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
                    <AgreementTDSGSTCollectionSummary
                        bookingRegisteredData={overViewCardData}
                        filterType={filterType}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                    <div className="-mt-5">
                        <AgreementGstTdsTotalReceivedSummary
                            bookingRegisteredData={overViewCardData}
                        />
                    </div>

                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <ModifiedRequests data={modifiedRequestesData} />
                </div>
                <div>
                    <BrokerageSummary summary={overViewCardData} topBroker={topChannelPartnerNameData} />
                </div>
                <div>
                    <Alert alertData={alertData} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RecentBooking data={bookingData} />
                <RecentTransaction data={payTrackPaymentLedgerData} />
            </div>
        </div>
    )
}
export default CrmDashboard