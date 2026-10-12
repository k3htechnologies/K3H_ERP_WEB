import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import * as E from 'fp-ts/Either';

import { runApiWithLoader } from '@/core/utils'
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import Visitors from "@/features/visitorManagementDashboard/components/Visitors";
import TodaysVisitorTimeline from "@/features/visitorManagementDashboard/components/TodaysVisitorTimeline";
import Tabs from "@/ui/components/Tab/Tab";
import OverviewCards from "@/features/visitorManagementDashboard/components/OverviewCards";
import { Button } from "@/ui/components/forms";
import PurposeWiseVisitors from "@/features/visitorManagementDashboard/components/PurposeWiseVisitors";
import VisitorAlerts from "@/features/visitorManagementDashboard/components/VisitorAlerts";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { gatePassService } from "@/features/gatePass/services/GatePassService";
import type { UpdateGatePassOutRequest } from "@/features/gatePass/models/GatePassModel";
import { visitorManagementDashboardService } from "@/features/visitorManagementDashboard/services/VisitorManagementDashboardService";
import type { FilterVisitorManagementDashboardRequest, Table0, VisitorManagementDashboardFilterType } from "@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel";
import { getPurposeWiseVisitorData, getVisitorAlertData, getVisitorOverviewData, getVisitorTimelineData } from "@/features/visitorManagementDashboard/utils/visitorManagementDashboardUtils";
import { isToday } from "@/core/utils/dateFormat";

const VisitorManagementDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [visitorData, setVisitorData] = useState<Table0[]>([]);
    const [filterType, setFilterType] = useState<VisitorManagementDashboardFilterType>("MONTHLY");
    const [activeTab, setActiveTab] = useState<string>("Monthly");
    const [selectedVisitorData, setSelectedVisitorData] = useState<Table0 | null>(null);
    const [isConfirmationDialogBoxOpenforOut, setIsConfirmationDialogBoxOpenforOut] = useState(false);
    const [isConfirmationDialogBoxOpenforBell, setIsConfirmationDialogBoxOpenforBell] = useState(false);
    
    const { canAction: canActionGatePass } = useMenuPermissions("/gatePass");
    const { canAction: canActionGatePassAdministrativeAccess } = useMenuPermissions("/gatePassAdministrativeAccess");
    
    const { addToast } = useToast();
    const navigate = useNavigate();

    const visitorManagementDashboardTabList = [
        { id: "Today", label: "Today" },
        { id: "Weekly", label: "Weekly" },
        { id: "Monthly", label: "Monthly" },
    ];

    const loadVisitorManagementDashboardData = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterVisitorManagementDashboardRequest = {
                    Type: filterType,
                };

                const response = await visitorManagementDashboardService.apiCallPullVisitorManagementDashboard(params);

                if (E.isRight(response)) {

                    const e = response.right.Data;

                    setVisitorData(e.Table0);

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
    }, [addToast, filterType]);

    useEffect(() => {
        loadVisitorManagementDashboardData();
    }, [loadVisitorManagementDashboardData]);

    const { todaysVisitorData, purposeWiseVisitorData, visitorAlertData } = useMemo(() => ({
        todaysVisitorData: visitorData.filter((row) => isToday(new Date(row.PassDateTime))),
        purposeWiseVisitorData: getPurposeWiseVisitorData(visitorData),
        visitorAlertData: getVisitorAlertData(visitorData),
    }), [visitorData]);

    const visitorOverviewData = useMemo(() => getVisitorOverviewData(visitorData, todaysVisitorData), [visitorData, todaysVisitorData]);

    const visitorTimelineData = useMemo(() => getVisitorTimelineData(todaysVisitorData), [todaysVisitorData]);

    const handleNavigateToView = () => {
        navigate(`/gatePass`);
    }

    const handleConfirmationDialogBoxOpenforOut = useCallback((row: Table0) => {
        setSelectedVisitorData(row);
        setIsConfirmationDialogBoxOpenforOut(true);
    }, []);

    const handleConfirmationDialogBoxOpenforBell = useCallback((row: Table0) => {
        setSelectedVisitorData(row);
        setIsConfirmationDialogBoxOpenforBell(true);
    }, []);

    const handleConfirmationDialogBoxCloseforOut = useCallback(() => {
        setIsConfirmationDialogBoxOpenforOut(false);
        setSelectedVisitorData(null);
    }, []);

    const handleConfirmationDialogBoxCloseforBell = useCallback(() => {
        setIsConfirmationDialogBoxOpenforBell(false);
        setSelectedVisitorData(null);
    }, []);

    const handleOutGatePass = async (action: 'Out' | 'Bell') => {

        if (action === 'Out') {
            setIsConfirmationDialogBoxOpenforOut(false);
        } else {
            setIsConfirmationDialogBoxOpenforBell(false);
        }

        if (!selectedVisitorData) return;

        await runApiWithLoader(setIsLoading,
            setLoadingMessage,
            async () => {

                const params: UpdateGatePassOutRequest = {
                    ExternalId: selectedVisitorData.ExternalId,
                    Uniquekey: selectedVisitorData.Uniquekey,
                    Type: action
                };

                const response = await gatePassService.apiCallUpdateGatePassOutRequest(params);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    loadVisitorManagementDashboardData();

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
            action === 'Bell' ? 'Notify Visitor' : 'Out Visitor Details'
        );
    }

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    <Tabs
                        tabs={visitorManagementDashboardTabList}
                        defaultActive={activeTab}
                        islarge={true}
                        onTabChange={(t) => {
                            setActiveTab(t.id);
                            setFilterType(t.id.toUpperCase() as VisitorManagementDashboardFilterType);
                        }}
                        istoggleTab={true}
                    />
                </div>

                <div className="flex justify-end">
                    <div className="w-full md:w-100 flex gap-5 justify-end">
                        <Button
                            onClick={() => handleNavigateToView()}
                            size="md">
                            + Add Visitor
                        </Button>
                        <Button
                            color="blue"
                            variant="solid"
                            colorMode="extraLight"
                            leftIcon={<FileText size={14} />}
                        >
                            Generate Report
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                <OverviewCards filterType={filterType} overViewData={visitorOverviewData} />

                <Visitors
                    visitorData={visitorData}
                    filterType={filterType}
                    canAction={canActionGatePass || canActionGatePassAdministrativeAccess}
                    onLogout={handleConfirmationDialogBoxOpenforOut}
                    onBell={handleConfirmationDialogBoxOpenforBell}
                />

                <TodaysVisitorTimeline timelineData={visitorTimelineData} />

                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-6">
                        <PurposeWiseVisitors purposeWiseVisitorData={purposeWiseVisitorData} />
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <VisitorAlerts visitorAlertData={visitorAlertData} />
                    </div>
                </div>
            </div>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenforOut}
                onClose={handleConfirmationDialogBoxCloseforOut}
                onConfirm={() => handleOutGatePass('Out')}
                loading={isLoading}
                pageName='Gate Pass Out'
                title="You are about to mark this Gate Pass Out?"
                message="Marking this Gate Pass Out will confirm that the visitor has exited. Do you want to continue?"
                confirmText="Out"
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenforBell}
                onClose={handleConfirmationDialogBoxCloseforBell}
                onConfirm={() => handleOutGatePass('Bell')}
                loading={isLoading}
                pageName="Gate Pass Bell"
                title="Notify Appointment person"
                message="The appointment contact will be notified that their visitor has arrived at reception"
                confirmText="Notify"
            />
        </div>
    )
}

export default VisitorManagementDashboard
