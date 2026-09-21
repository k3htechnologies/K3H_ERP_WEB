import { Loader } from "@/core/utils/loader";
import { useState } from "react";
import FinanceDashboardHeader from "../components/FinanceDashboardHeader";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import OverviewCards from "../components/OverviewCards";
import LoanPortfoioByBank from "../components/LoanPortfoioByBank";
import LoanPortfolioByType from "../components/LoanPortfolioByType";
import ProjectWiseFinanceStatus from "../components/ProjectWiseFinanceStatus";
import DisbursementOverview from "../components/DisbursementOverview";
import RepaymentOverview from "../components/RepaymentOverview";
import DsaPaymentTrack from "../components/DsaPaymentTrack";
import DebtServiceReserveAccount from "../components/DebtServiceReserveAccount";
import RateOfIntrest from "../components/RateOfInterest";
import Alerts from "../components/Alerts";

const FinanceDashboard: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);

    const { projectId, setProjectId } = useProject();

    return (

        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <>
                <FinanceDashboardHeader onCompanyChange={setSelectedCompanyId} onProjectChange={setProjectId} />
                <OverviewCards />
                <div className="flex gap-4">
                    <div className="w-3/5"><LoanPortfoioByBank /></div>
                    <div className="w-2/5">
                        <LoanPortfolioByType />
                    </div>
                </div>
                <ProjectWiseFinanceStatus />
                <div className="grid grid-cols-2 gap-5 ">
                    <DisbursementOverview />
                    <RepaymentOverview />
                </div>
                <div className="mt-4">
                    <DsaPaymentTrack />
                </div>
                <div className="mt-4">
                    <DebtServiceReserveAccount />
                </div>
                <div className="flex gap-4">
                    <div className="w-2/5">
                        <RateOfIntrest />
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