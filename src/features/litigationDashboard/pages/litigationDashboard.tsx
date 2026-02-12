import { useCallback, useEffect, useState } from "react";
import OverviewCards from "@/features/litigationDashboard/components/OverviewCards";
import CaseTypeDistribution from "../components/CaseTypeDistribution";
import CourtDistribution from "../components/CourtDistribution";
import ActiveCases from "../components/ActiveCases";
import UpComingHearing from "../components/UpComingHearing";
import UploadedDocument from "../components/UploadedDocumnet";
import CaseAnalysis from "../components/CaseAnalysis";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { litigationDashboardService } from "../services/litigationDashboardService";
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
        fetchLitigation();
    }, [projectId]);

    const fetchLitigation = useCallback(async () => {
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
            "Loading Data"
        );
    }, [projectId, addToast]);

    const courtStaticData = [
        {
            CourtName: "Civil Court",
            TotalCase: 240,
            OpenCase: 74,
        },
        {
            CourtName: "District Court",
            TotalCase: 180,
            OpenCase: 74,
        },
        {
            CourtName: "High Court",
            TotalCase: 280,
            OpenCase: 70,
        },
        {
            CourtName: "Session Court",
            TotalCase: 100,
            OpenCase: 60,
        },
        {
            CourtName: "Supreme Court",
            TotalCase: 240,
            OpenCase: 74,
        },
    ];

    const upComingHearingStaticData = [
        {
            CaseNumber: "CN-2024-001",
            CaseType: "Civil Suit",
            CourtType: "District Court",
            Location: "Borivali",
            HearingDate: "2026-02-15",
        },
        {
            CaseNumber: "CN-2024-002",
            CaseType: "Criminal Appeal",
            CourtType: "District Court",
            Location: "Mumbai",
            HearingDate: "2026-02-18",
        },
        {
            CaseNumber: "CN-2024-003",
            CaseType: "Writ Petition",
            CourtType: "District Court",
            Location: "Borivali",
            HearingDate: "2026-02-20",
        },
    ];

    const ActiveCasesStaticData = [
        {
            CaseTitle: "Smith vs. Johnson",
            CaseNumber: "CN-2024-001",
            CaseType: "Civil Suit",
            HearingDate: "2026-02-15",
            Status: "Open",
        },
        {
            CaseTitle: "Brown vs. State",
            CaseNumber: "CN-2024-002",
            CaseType: "Criminal Appeal",
            HearingDate: "2026-02-20",
            Status: "Open",
        }
    ];

    const uploadedDocumentStaticData = [
        {
            CaseNumber: "CN-2024-001",
            DocumentName: "Case Summary",
        },
        {
            CaseNumber: "CN-2024-002",
            DocumentName: "Evidence",
        },
    ]

    const caseTypeStaticData = [
        {
            TotalCases: 450,
            CivilCases: 280,
            CriminalCases: 170,
        }
    ];

    const data = [
        { Month: "JAN", OpenCases: 28, ClosedCases: 20 },
        { Month: "FEB", OpenCases: 30, ClosedCases: 24 },
        { Month: "MAR", OpenCases: 25, ClosedCases: 5 },
        { Month: "APR", OpenCases: 40, ClosedCases: 35 },
        { Month: "MAY", OpenCases: 45, ClosedCases: 80 },
        { Month: "JUN", OpenCases: 18, ClosedCases: 40 },
        { Month: "JUL", OpenCases: 42, ClosedCases: 65 },
        { Month: "AUG", OpenCases: 60, ClosedCases: 95 },
        { Month: "SEP", OpenCases: 55, ClosedCases: 65 },
        { Month: "OCT", OpenCases: 75, ClosedCases: 75 },
        { Month: "NOV", OpenCases: 100, ClosedCases: 90 },
        { Month: "DEC", OpenCases: 102, ClosedCases: 92 },
    ];

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <div className="cursor-pointer" onClick={() => navigate("/litigation")}>
                <OverviewCards overViewData={overViewData} />

                <div className="grid grid-cols-2 gap-4">
                    <CaseTypeDistribution CaseTypeData={caseTypeStaticData} />
                    <CourtDistribution courtData={courtStaticData} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ActiveCases activeCaseData={ActiveCasesStaticData} />
                    <UpComingHearing upComingHearingData={upComingHearingStaticData} />

                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CaseAnalysis CaseAnalysisData={data} />
                    <UploadedDocument uploadedDocumentData={uploadedDocumentStaticData} />

                </div>
            </div>
        </div>
    )
}
export default LitigationDashboard;