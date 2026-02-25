import React, { useCallback, useEffect, useState } from "react";
import OverviewCards from "@/features/salesDashboard/components/OverviewCards";
import EnquiryLeadFunnel from "@/features/salesDashboard/components/EnquiryLeadFunnel";
import TargetPerformance from "@/features/salesDashboard/components/TargetPerformance";
import CallTracker from "@/features/salesDashboard/components/CallTracker";
import BookingOverview from "@/features/salesDashboard/components/BookingOverview";
import ChannelPartner from "@/features/salesDashboard/components/ChannelPartner";
import SalesAdvisorLeaderboard from "@/features/salesDashboard/components/SalesAdvisorLeaderboard";
import { runApiWithLoader } from '@/core/utils'
import { salesDashboardService } from '@/features/salesDashboard/services/SalesDashboardServices';
import { useToast } from '@/core/hooks/useToast';
import * as E from 'fp-ts/Either';
import { Loader } from '@/core/utils/loader';
import { useProject } from '@/features/projectMaster/context/ProjectContext';


const SalesDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [overViewCardData, setOverviewCardData] = useState<any[]>([]);
    const [enquiryLeadFunnelData, setEnquiryLeadFunnelData] = useState<any[]>([]);
    const [targetPerfomanceData, setTargetPerformanceData] = useState<any[]>([]);
    const [enquiryHotWarmColdData, setEnquiryHotWarmColdData] = useState<any[]>([]);
    const [callTrackerData, setCallTrackerData] = useState<any[]>([]);
    const [salesDashboardData, setSalesDashboardData] = useState<any[]>([]);
    const [topCallersTodayData, setTopCallersTodayData] = useState<any[]>([]);
    const [bookingOverviewData, setBookingOverviewData] = useState<any[]>([]);
    const [bookingConversionRate, setBookingConversionRate] = useState<any[]>([]);
    const [sourceWiseDistribution, setSourceWiseDistribution] = useState<any[]>([]);
    const [residentialData, setResidentialData] = useState<any[]>([]);
    const [channelPartnerName, setChannelPartnerName] = useState<any[]>([]);
    const [budgetWiseDistribution, setBudgetWiseDistribution] = useState<any[]>([]);
    const [channelPartnerIBMOBMdata, setChannelPartnerIBMOBMdata] = useState<any[]>([]);

    const { addToast } = useToast();
    const { projectId } = useProject();

    useEffect(() => {
        if (!projectId) return;
        loadSalesDashboardData();
    }, [projectId]);

    //#region DATA LOADING | FETCH |  LOAD 

    const loadSalesDashboardData = useCallback(async () => {
        await runApiWithLoader(setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await salesDashboardService.apiCallPullSalesDashboard(Number(projectId));
                if (E.isRight(response)) {
                    const e = response.right.Data;
                    setOverviewCardData(e.Table0 || []);
                    setEnquiryLeadFunnelData(e.Table1 || []);
                    setTargetPerformanceData(e.Table3 || []);
                    setEnquiryHotWarmColdData(e.Table2 || []);
                    setCallTrackerData(e.Table6 || []);
                    setSalesDashboardData(e.Table4 || []);
                    setTopCallersTodayData(e.Table8 || []);
                    setBookingOverviewData(e.Table9 || []);
                    setBookingConversionRate(e.Table15 || []);
                    setSourceWiseDistribution(e.Table12 || []);
                    setResidentialData(e.Table13 || []);
                    setChannelPartnerName(e.Table17 || []);
                    setBudgetWiseDistribution(e.Table10 || []);
                    setChannelPartnerIBMOBMdata(e.Table18 || []);

                } else {
                    addToast({ type: 'error', title: response.left.message });

                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Data"
        );
    }, [projectId, addToast]);

    //#endregion

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>
            <div>
                <OverviewCards overViewCardData={overViewCardData} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-5">
                <EnquiryLeadFunnel enquiryLeadFunnelData={enquiryLeadFunnelData} enquiryHotWarmColdData={enquiryHotWarmColdData} />
                <TargetPerformance targetPerformanceData={targetPerfomanceData} />
            </div>
            <div className="mt-8">
                <CallTracker callTrackerData={callTrackerData} topCallersTodayData={topCallersTodayData} overviewCardData={overViewCardData} />
            </div>
            <div>
                <BookingOverview bookingOverviewData={bookingOverviewData} sourceWiseDistribution={sourceWiseDistribution} bookingConversionRate={bookingConversionRate} residentialData={residentialData} budgetWiseDistribution={budgetWiseDistribution} />
            </div>
            <div className="grid grid-cols-2 gap-5 mt-6">
                <ChannelPartner channelPartnerData={channelPartnerName} channelPartnerIBMOBMdata={channelPartnerIBMOBMdata} />
                <SalesAdvisorLeaderboard leaderBoardData={salesDashboardData} />
            </div>
        </div>
    )
}

export default SalesDashboard