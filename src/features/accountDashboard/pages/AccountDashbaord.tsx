import { Loader } from "@/core/utils/loader";
import type React from "react"
import { useState } from "react";
import AccountDashboardHeader from "@/features/accountDashboard/components/AccountDashboardHeader";
import OverviewCards from "../components/OverviewCards";
import NoticesTable from "../components/NoticesTable";
import TopCompaniesActiveNotices from "../components/TopCompaniesActiveNotices";
import NoticesByAuthority from "../components/NoticesByAuthority";
import NoticeStatusOverview from "../components/NoticeStatusOverview";
import RecentActivityTimeline from "../components/RecentActivityTimeline";
import UpcomingDeadlines from "../components/UpcomingDeadlines";

const AccountDashboard: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [companyData, setCompanyData] = useState<any[]>([]);

    const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <>
                <AccountDashboardHeader onCompanyChange={setSelectedCompanyId} />
                <OverviewCards />
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <NoticesTable />
                    </div>
                    <TopCompaniesActiveNotices />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <NoticesByAuthority />
                    <NoticeStatusOverview />
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div >
                        <RecentActivityTimeline/>
                    </div>
                    <div className="col-span-2">
                        <UpcomingDeadlines      />
                    </div>
                </div>
            </>
        </div>
    )
}

export default AccountDashboard;