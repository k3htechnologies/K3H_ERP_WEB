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
import ReportsSection from "../components/ReportGridSection";


const SalesDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [enquiryModel, setEnquiryModel] = useState<any[]>([]);
    const [enquiryFollowUp, setEnquiryFollowUp] = useState<any[]>([]);


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

                    setEnquiryModel(e.Table0 || []);
                    setEnquiryFollowUp(e.Table1 || []);

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
           
            <div className=" mt-8 flex flex-row gap-5 items-stretch w-full min-w-0">
                <div className="w-2/3 min-w-0">
                    <Enquiries enquiryData={enquiryModel} />
                </div>
                <div className="w-1/3 min-w-0">
                    <FollowUp enquiryFollowUpData={enquiryFollowUp} />
                </div>
            </div>
            <div className="mt-8">
                <ReportsSection />
            </div>
            
        </div>
    )
}

export default SalesDashboard