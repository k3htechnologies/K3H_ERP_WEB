import { useCallback, useEffect, useState } from "react";
import OverviewCards from "@/features/litigationDashboard/components/OverviewCards";
import CaseTypeDistribution from "@/features/litigationDashboard/components/CaseTypeDistribution";
import CourtDistribution from "@/features/litigationDashboard/components/CourtDistribution";
import ActiveCases from "@/features/litigationDashboard/components/ActiveCases";
import UpComingHearing from "@/features/litigationDashboard/components/UpComingHearing";
import CaseAnalysis from "@/features/litigationDashboard/components/CaseAnalysis";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { litigationDashboardService } from "@/features/litigationDashboard/services/litigationDashboardService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import type { Table0, Table1, Table2, Table3, Table4, Table5, Table6 } from "@/features/litigationDashboard/models/litigationDashboardModel";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";

const LitigationDashboard: React.FC = () => {

    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [projectId, setProjectId] = useState<number>(0);
    const [overViewData, setOverViewData] = useState<Table0[]>([]);
    const [hearingData, setHearingData] = useState<Table1[]>([])
    const [caseTypeDistributionData, setCaseTypeDistributionData] = useState<Table2[]>([]);
    const [courtDistributionData, setCourtDistributionData] = useState<Table3[]>([]);
    const [activeCaseData, setActiveCaseData] = useState<Table4[]>([]);
    const [upComingHearingData, setUpComingHearingData] = useState<Table5[]>([]);
    const [caseAnalysisData, setCaseAnalysisData] = useState<Table6[]>([]);

    useEffect(() => {
        fetchLitigationDashboard();
    }, [projectId]);

    const fetchLitigationDashboard = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await litigationDashboardService.apiCallPullLitigationDashboard(Number(projectId) ?? 0);

                if (E.isRight(response)) {

                    const e = response.right.Data;

                    setOverViewData(e.Table0 || []);
                    setHearingData(e.Table1 || []);
                    setCaseTypeDistributionData(e.Table2 || []);
                    setCourtDistributionData(e.Table3 || []);
                    setActiveCaseData(e.Table4 || []);
                    setUpComingHearingData(e.Table5 || []);
                    setCaseAnalysisData(e.Table6 || []);

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
            "Loading Litigation Dashboard"
        );
    }, [projectId, addToast]);

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <div className="flex justify-end">
                <div className="w-full md:w-100">
                    <SinglePageSelection
                        required
                        options={(LocalStorageHelper.getStoredEmployeeData?.()?.ProjectData ?? []).map(opt => ({
                            label: opt.ProjectName,
                            value: opt.ProjectId
                        }))}

                        value={projectId}
                        onChange={(value) => setProjectId(Number(value) || 0)}

                        placeholder="All Project"
                    />
                </div>
            </div>

            <div>

                <OverviewCards overViewData={overViewData} hearingData={hearingData} />

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                    <CaseTypeDistribution CaseTypeData={caseTypeDistributionData} />
                    <CourtDistribution courtData={courtDistributionData} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                    <div className="col-span-12 lg:col-span-7">
                        
                        <ActiveCases activeCaseData={activeCaseData} />

                        <CaseAnalysis CaseAnalysisData={caseAnalysisData} />
                    </div>

                    <div className="col-span-12 lg:col-span-5 flex">

                        <div className="flex-1">
                            
                            <UpComingHearing upComingHearingData={upComingHearingData} />
                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}
export default LitigationDashboard;