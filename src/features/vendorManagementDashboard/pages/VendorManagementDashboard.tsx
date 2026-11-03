import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import { vendorManagementDashboardServices } from "@/features/vendorManagementDashboard/services/VendorManagementDashboardServices";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import VendorDashboardHeader from "@/features/vendorManagementDashboard/components/VendorDashboardHeader";
import OverviewCards from "@/features/vendorManagementDashboard/components/OverviewCards";
import type { Table0, Table1, Table2, Table3, Table4, Table5, Table6 } from "@/features/vendorManagementDashboard/models/VendorManagementDashboardModel";
import VendorDistribution from "@/features/vendorManagementDashboard/components/VendorDistribution";
import SourcingCoverage from "@/features/vendorManagementDashboard/components/SourcingCoverage";
import RecentVendorActivity from "@/features/vendorManagementDashboard/components/RecentVendorActivity";
import VendorsBusinessType from "@/features/vendorManagementDashboard/components/VendorsBusinessType";
import Alerts from "@/features/vendorManagementDashboard/components/Alerts";
import VendorsPerformanceRisk from "../components/VendorsPerformanceRisk";

const VendorManagementDashboard: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [overviewData, setOverviewData] = useState<Table0[]>([]);
    const [vendorDistributionData, setVendorDistributionData] = useState<Table1[]>([]);
    const [sourcingCoverageData, setSourcingCoverageData] = useState<Table2[]>([]);
    const [recentVendorActivity, setRecentVendorActivity] = useState<Table3[]>([]);
    const [vendorBusinessType, setVendorBusinessType] = useState<Table4[]>([]);
    // const [regulatoryVerificationPipeline, setRegulatoryVerficationPipeline] = useState<Table5[]>([]);
    const [vendorsPerformanceRiskData, setVendorsPerformanceRiskData] = useState<Table5[]>([]);
    const [alertsData, setAlertsData] = useState<Table6[]>([]);

    const { addToast } = useToast();

    useEffect(() => {
        loadVendorManagementDashboardData();
    }, []);

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
    const loadVendorManagementDashboardData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await vendorManagementDashboardServices.apiCallPullVendorManagementDashboard();

                if (E.isRight(response)) {

                    const e = response.right.Data;
                    setOverviewData(e.Table0 || []);
                    setVendorDistributionData(e.Table1 || []);
                    setSourcingCoverageData(e.Table2 || []);
                    setRecentVendorActivity(e.Table3 || []);
                    setVendorBusinessType(e.Table4 || []);
                    setVendorsPerformanceRiskData(e.Table5 || []);
                    setAlertsData(e.Table6 || []);


                } else {

                    addToast({ type: 'error', title: response.left.message });

                }
                return response;
            }
        )
    }

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

            <VendorDashboardHeader />
            <OverviewCards overViewData={overviewData} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                <div className="lg:col-span-5 w-full">
                    <VendorDistribution vendorDistributionData={vendorDistributionData} />
                </div>
                <div className="lg:col-span-7 w-full">
                    <SourcingCoverage sourcingCoverageData={sourcingCoverageData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 w-full">
                    <RecentVendorActivity
                        recentVendorActivity={recentVendorActivity}
                    />
                </div>

                <div className="lg:col-span-4 min-w-0 mt-5">
                    <VendorsBusinessType
                        vendorsBusinessTypeData={vendorBusinessType}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <VendorsPerformanceRisk vendorPerformanceRisk={vendorsPerformanceRiskData} />
                <Alerts alertData={alertsData} />
            </div>
        </div>
    )

}

export default VendorManagementDashboard;