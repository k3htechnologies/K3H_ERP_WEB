import React, { useCallback, useEffect, useState } from "react";
import { runApiWithLoader } from '@/core/utils'
import { salesDashboardService } from '@/features/salesDashboard/services/SalesDashboardServices';
import { useToast } from '@/core/hooks/useToast';
import * as E from 'fp-ts/Either';
import { Loader } from '@/core/utils/loader';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import GenerateReport from "@/features/salesDashboard/components/GenerateReport";
import Enquiries from "@/features/salesDashboard/components/Enquiries";
import FollowUp from "@/features/salesDashboard/components/FollowUp";
import type { Table0, Table1, Table2, Table3 } from "@/features/salesDashboard/models/SalesDashboardModel";
import ClosingTarget from "@/features/salesDashboard/components/ClosingTarget";
import SourcingTarget from "@/features/salesDashboard/components/SourcingTarget";

const SalesDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [enquiryData, setEnquiryData] = useState<Table0[]>([]);
    const [enquiryFollowUpData, setEnquiryFollowUpData] = useState<Table1[]>([]);
    const [performanceReportClosingData, setPerformanceReportClosingData] = useState<Table2[]>([]);
    const [performanceReportSourcingData, setPerformanceReportSourcingData] = useState<Table3[]>([]);
    

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

                    setEnquiryData(e.Table0 || []);

                    setEnquiryFollowUpData(e.Table1 || []);

                    setPerformanceReportClosingData(e.Table2 || []);

                    setPerformanceReportSourcingData(e.Table3 || []);

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
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <GenerateReport />
            <div className="cursor-pointer">

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                    <Enquiries enquiryData={enquiryData} />
                    <FollowUp enquiryFollowUpData={enquiryFollowUpData} />
                    <ClosingTarget performanceReportClosingData={performanceReportClosingData} />
                    <SourcingTarget performanceReportSourcingData={performanceReportSourcingData} />
                </div>
            </div>
        </div>
    )
}

export default SalesDashboard