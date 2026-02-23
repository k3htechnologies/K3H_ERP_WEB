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




const SalesDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const { addToast } = useToast();

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
    const loadSalesDashboardData = async () => {
        await runApiWithLoader(setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await salesDashboardService.apiCallPullSalesDashboard();
                if (E.isRight(response)) {
                    const e = response.right.Data;
                    console.log('e >>>>', e);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    console.log('Respo', response);
                    return response;
                }
            }
        )
    }

    useEffect(() => {
        loadSalesDashboardData();
    }, []);

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            {/* <Loader loading={isLoading} title={loadingMessage}><div /></Loader> */}
            <div>
                <OverviewCards />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-5">
                <EnquiryLeadFunnel />
                <TargetPerformance />
            </div>
            <div >
                <CallTracker />
            </div>
            <div>
                <BookingOverview />
            </div>
            <div className="grid grid-cols-2 gap-5 mt-6">
                <ChannelPartner />
                <SalesAdvisorLeaderboard />
            </div>
        </div>
    )
}

export default SalesDashboard