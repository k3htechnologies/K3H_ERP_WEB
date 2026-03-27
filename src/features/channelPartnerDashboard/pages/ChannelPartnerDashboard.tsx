import { Loader } from "@/core/utils/loader"
import { useCallback, useEffect, useState } from "react";
import { channelPartnerDashboardService } from "@/features/channelPartnerDashboard/services/ChannelPartnerDashboardService";
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from "@/core/utils";
import useToast from "@/core/hooks/useToast";
import OverviewCards from "@/features/channelPartnerDashboard/components/OverviewCards";
import FirmTypeDistribution from "@/features/channelPartnerDashboard/components/FirmTypeDistribution";
import CityWiseDistribution from "@/features/channelPartnerDashboard/components/CityWiseDistribution";
import NewAddedChannelPartner from "@/features/channelPartnerDashboard/components/NewAddedChannelPartner";
import MissingDetails from "@/features/channelPartnerDashboard/components/MissingDetails";
import { Button } from "@/ui/components/forms";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PartnerTypeDistribution from "@/features/channelPartnerDashboard/components/PartnerTypeDistribution";
import type { Table0, Table1, Table2, Table3, Table4, Table5 } from "@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel";


const ChannelPartnerDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();

    const [overViewCardData, setOverViewCardData] = useState<Table0[]>([]);
    const [partnerTypeDistributionData, setPartnerTypeDistributionData] = useState<Table2[]>([]);
    const [firmTypeDistributionData, setFirmTypeDistributionData] = useState<Table1[]>([]);
    const [cityWiseDistributionData, setCityWiseDistributionData] = useState<Table3[]>([]);
    const [newAddedChannelPartnerData, setNewAddedChannelPartnerdata] = useState<Table4[]>([]);
    const [teamMemberOverviewData, setTeamMemberOverview] = useState<Table5[]>([]);

    useEffect(() => {
        fetchChannelPartnerDashboard();
    }, []);

    // USE NAVIGATE
    const navigate = useNavigate();

    //#region NAVIGATE TO ADD CHANNEL PARTNER
    const handleAddChannelPartnerModal = useCallback(() => {
        navigate('/channelPartner/add',)
    }, [navigate]);
    //#endregion

    const fetchChannelPartnerDashboard = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await channelPartnerDashboardService.apiCallPullChannelPartnerDashboard();

                if (E.isRight(response)) {

                    const e = response.right.Data;
                    setOverViewCardData(e.Table0 || []);
                    setPartnerTypeDistributionData(e.Table2 || []);
                    setFirmTypeDistributionData(e.Table1 || []);
                    setCityWiseDistributionData(e.Table3 || []);
                    setNewAddedChannelPartnerdata(e.Table4 || []);
                    setTeamMemberOverview(e.Table5 || []);
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
            "Loading Channel Partner Dashboard "
        );
    }, [addToast]);
    //#endregion

    //#region
    return (
       <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <div className="cursor-pointer">
                <div className="flex justify-end pb-1">
                    <Button
                        onClick={() => {
                            handleAddChannelPartnerModal();
                        }}
                        color="blue"
                        size="sm"
                        variant="solid"
                        colorMode="gradient_dark"
                        defineWidth
                        style={{ width: '190px' }}
                        leftIcon={<Plus className="h-4 w-4" />}
                    >
                        Add Channel Partner
                    </Button>
                </div>

                <div className="pb-1">
                    <OverviewCards overViewData={overViewCardData} />
                </div>

                <h2 className="text-lg font-semibold text-gray-800 pt-2">
                    Channel Partner Distribution
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
                    <PartnerTypeDistribution partnerTypeDistributionData={partnerTypeDistributionData} />
                    <FirmTypeDistribution firmTypeData={firmTypeDistributionData} />
                    <CityWiseDistribution cityWiseDistributionData={cityWiseDistributionData} />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-8">
                    <NewAddedChannelPartner NewAddedChannelPartnerData={newAddedChannelPartnerData} />
                </div>
                
                <div className="col-span-12 lg:col-span-4">
                    <MissingDetails MissingDetailsData={teamMemberOverviewData} />
                </div>
            </div>
        </div>
    )
}
export default ChannelPartnerDashboard