import { useCallback, useEffect, useState } from "react";
import OverviewCards from "@/features/litigationDashboard/components/OverviewCards";
import CaseTypeDistribution from "@/features/litigationDashboard/components/CaseTypeDistribution";
import CourtDistribution from "@/features/litigationDashboard/components/CourtDistribution";
import ActiveCases from "@/features/litigationDashboard/components/ActiveCases";
import UpComingHearing from "@/features/litigationDashboard/components/UpComingHearing";
import UploadedDocument from "@/features/litigationDashboard/components/UploadedDocumnet";
import CaseAnalysis from "@/features/litigationDashboard/components/CaseAnalysis";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { litigationDashboardService } from "@/features/litigationDashboard/services/litigationDashboardService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";


const LitigationDashboard: React.FC = () => {

    const navigate = useNavigate();
    const { addToast } = useToast();
    const { projectId } = useProject();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [overViewData, setOverViewData] = useState<any[]>([]);
    const [caseAnalysisData, setCaseAnalysisData] = useState<any[]>([]);
    const [activeCaseData, setActiveCaseData] = useState<any[]>([]);
    const [upComingHearingData, setUpComingHearingData] = useState<any[]>([]);
    const [courtDistributionData, setCourtDistributionData] = useState<any[]>([]);
    const [uploadedDocumentData, setUploadedDocumentData] = useState<any[]>([]);
    const [caseTypeDistributionData, setCaseTypeDistributionData] = useState<any[]>([]);

    useEffect(() => {
        if (!projectId) return;
        fetchLitigationDashboard();
    }, [projectId]);

    const fetchLitigationDashboard = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await litigationDashboardService.apiCallPullLitigationDashboard(Number(projectId));

                if (E.isRight(response)) {

                    const e = response.right.Data;

                    setOverViewData(e.Table0 || []);
                    setCaseTypeDistributionData(e.Table1 || []);
                    setCourtDistributionData(e.Table2 || []);
                    setActiveCaseData(e.Table3 || []);
                    setUpComingHearingData(e.Table4 || []);
                    setCaseAnalysisData(e.Table5 || []);
                    setUploadedDocumentData(e.Table6 || []);

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
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <div className="cursor-pointer" onClick={() => navigate("/litigation")}>
                <OverviewCards overViewData={overViewData} />

                <div className="grid grid-cols-[0.8fr_1.2fr] gap-4">
                    <CaseTypeDistribution CaseTypeData={caseTypeDistributionData} />
                    <CourtDistribution courtData={courtDistributionData} />
                </div>

                <div className="grid grid-cols-[0.8fr_1.2fr] gap-4">
                    <ActiveCases activeCaseData={activeCaseData} />
                    <UpComingHearing upComingHearingData={upComingHearingData} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <CaseAnalysis CaseAnalysisData={caseAnalysisData} />
                    </div>

                    <div className="col-span-1">
                        <UploadedDocument uploadedDocumentData={uploadedDocumentData} />
                    </div>
                </div>

            </div>
        </div>
    )
}
export default LitigationDashboard;