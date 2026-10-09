import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useState } from "react";
import FinanceDashboardHeader from "../components/FinanceDashboardHeader";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import OverviewCards from "../components/OverviewCards";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { financeDashboardService } from "../services/FinanceDashboardService";
import * as E from "fp-ts/Either";
import LoanPortfoioByBank from "../components/LoanPortfoioByBank";
import LoanPortfolioByType from "../components/LoanPortfolioByType";
import ProjectWiseFinanceStatus from "../components/ProjectWiseFinanceStatus";
import DisbursementOverview from "../components/DisbursementOverview";
import RepaymentOverview from "../components/RepaymentOverview";
import RateOfInterest from "../components/RateOfInterest";
import DsaPaymentTrack from "../components/DsaPaymentTrack";
import DebtServiceReserveAccount from "../components/DebtServiceReserveAccount";
import Alerts from "../components/Alerts";

const FinanceDashboard: React.FC = () => {

    const { projectId, setProjectId } = useProject();
    const { addToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
    const [overviewData, setOverviewData] = useState<any>([]);
    const [loanPortfolioNBFC, setLoanPortfolioNBFC] = useState<any>([]);
    const [loanPortfolioByLoanType, setLoanPortfolioByLoanType] = useState<any>([]);
    const [projectWiseFinanceStatus, setProjectWiseFinanceStatus] = useState<any>([]);
    const [disbursementOverview, setDisbursementOverview] = useState<any>([]);
    const [repaymentOverview, setRepaymentOverview] = useState<any>([]);
    const [roiData, setRoiData] = useState<any>([]);
    const [dsaPaymentTrackData, setDsaPaymentTrackData] = useState<any>([]);
    const [alertData, setAlertData] = useState<any>([]);

    useEffect(() => {
        setSelectedCompanyId(0);
    }, [projectId]);

    const resetFinanceDashboardData = useCallback(() => {
        setOverviewData([]);
        setLoanPortfolioNBFC([]);
        setLoanPortfolioByLoanType([]);
        setProjectWiseFinanceStatus([]);
        setDisbursementOverview([]);
        setRepaymentOverview([]);
        setRoiData([]);
        setDsaPaymentTrackData([]);
        setAlertData([]);
    }, []);

    const fetchFinanaceDashboardData = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await financeDashboardService.apiCallPullFinanceDashboard(Number(projectId), selectedCompanyId);

                if (E.isRight(response)) {

                    const e = response.right.Data;

                    setOverviewData(e.Table0 || []);
                    setLoanPortfolioNBFC(e.Table1 || []);
                    setLoanPortfolioByLoanType(e.Table2 || []);
                    setProjectWiseFinanceStatus(e.Table3 || []);
                    setDisbursementOverview(e.Table4 || []);
                    setRepaymentOverview(e.Table5 || []);
                    setDsaPaymentTrackData(e.Table6 || []);
                    setRoiData(e.Table8 || []);
                    setAlertData(e.Table9 || []);

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
    }, [projectId, selectedCompanyId, addToast]);

    useEffect(() => {
        if (!projectId && !selectedCompanyId) {
            resetFinanceDashboardData();
            return;
        }

        fetchFinanaceDashboardData();
    }, [projectId, selectedCompanyId, resetFinanceDashboardData, fetchFinanaceDashboardData]);



    return (

        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <>
                <FinanceDashboardHeader selectedProjectId={projectId} onCompanyChange={setSelectedCompanyId} onProjectChange={setProjectId} />
                <OverviewCards overviewData={overviewData} />
                <div className="flex gap-4">
                    <div className="w-3/5"><LoanPortfoioByBank loanPortfolioNBFCData={loanPortfolioNBFC} /></div>
                    <div className="w-2/5">
                        <LoanPortfolioByType loanPortfolioByLoanTypeData={loanPortfolioByLoanType} />
                    </div>
                </div>
                <ProjectWiseFinanceStatus projectWiseFiananceStatusData={projectWiseFinanceStatus} />
                <div className="grid grid-cols-2 gap-5 ">
                    <DisbursementOverview disbursementOverViewData={disbursementOverview} />
                    <RepaymentOverview repaymentOverviewData={repaymentOverview} />
                </div>
                <div>
                    <DsaPaymentTrack dsaPaymentTrackData={dsaPaymentTrackData} />
                </div>
                <div className="mt-4">
                    <DebtServiceReserveAccount />
                </div>
                <div className="flex gap-4 mt-5">
                    <div className="w-2/5">
                        <RateOfInterest roiData={roiData} />
                    </div>
                    <div className="w-3/5">
                        <Alerts />
                    </div>
                </div>

            </>
        </div>
    )

}

export default FinanceDashboard;