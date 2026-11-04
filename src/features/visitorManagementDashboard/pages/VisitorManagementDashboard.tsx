import GatePassApprovalModal from '@/features/gatePass/components/GatePassApprovalModal';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as E from 'fp-ts/Either';

import { runApiWithLoader } from '@/core/utils'
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import Visitors from "@/features/visitorManagementDashboard/components/Visitors";
import TodaysVisitorTimeline from "@/features/visitorManagementDashboard/components/TodaysVisitorTimeline";
import Tabs from "@/ui/components/Tab/Tab";
import { DateRangeWithActions } from "@/ui/components/DateRangeWithActions";
import OverviewCards from "@/features/visitorManagementDashboard/components/OverviewCards";
import { Button } from "@/ui/components/forms";
import PurposeWiseVisitors from "@/features/visitorManagementDashboard/components/PurposeWiseVisitors";
import VisitorAlerts from "@/features/visitorManagementDashboard/components/VisitorAlerts";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { gatePassService } from "@/features/gatePass/services/GatePassService";
import type { UpdateGatePassApprovalRequest, UpdateGatePassOutRequest } from "@/features/gatePass/models/GatePassModel";
import { visitorManagementDashboardService } from "@/features/visitorManagementDashboard/services/VisitorManagementDashboardService";
import type { 
    FilterVisitorManagementDashboardRequest, 
    VisitorManagementDashboardFilterType, 
    VisitorManagementDashboardModel, 
    VisitorTable,
    OverviewTable
} from "@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel";
import { 
    getVisitorOverviewCardData, 
    getVisitorTimelineData 
} from "@/features/visitorManagementDashboard/utils/visitorManagementDashboardUtils";
import VisitorOverviewModal from "@/features/visitorManagementDashboard/components/VisitorOverviewModal";

const VisitorManagementDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    
    
    const [dashboardData, setDashboardData] = useState<VisitorManagementDashboardModel | null>(null);
    const [filterType, setFilterType] = useState<VisitorManagementDashboardFilterType>("TODAY");
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("Today");
    const [selectedVisitorData, setSelectedVisitorData] = useState<VisitorTable | null>(null);
    const [isConfirmationDialogBoxOpenforOut, setIsConfirmationDialogBoxOpenforOut] = useState(false);
    const [isConfirmationDialogBoxOpenforBell, setIsConfirmationDialogBoxOpenforBell] = useState(false);
    const [isConfirmationDialogBoxOpenforLogin, setIsConfirmationDialogBoxOpenforLogin] = useState(false);
    const [selectedOverviewCard, setSelectedOverviewCard] = useState<{ key: keyof OverviewTable; title: string } | null>(null);
    const { canAction: canActionDashboard } = useMenuPermissions();
    const { canAction: canActionVisitorDashboard } = useMenuPermissions("/visitorManagementDashboard");
    const { canAction: canActionGatePass } = useMenuPermissions("/gatePass");
    const { canAction: canActionGatePassAdministrativeAccess } = useMenuPermissions("/gatePassAdministrativeAccess");
    const canAction = Boolean(
        canActionDashboard || 
        canActionVisitorDashboard || 
        canActionGatePass || 
        canActionGatePassAdministrativeAccess
    );
    
    const { addToast } = useToast();
    const navigate = useNavigate();

    const visitorManagementDashboardTabList = [
        { id: "Today", label: "Today" },
        { id: "Weekly", label: "This Week" },
        { id: "Monthly", label: "This Month" },
        { id: "Datewise", label: "Datewise" },
    ];

    const loadVisitorManagementDashboardData = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterVisitorManagementDashboardRequest = {
                    Type: filterType,
                    FromDate: filterType === "DATEWISE" ? fromDate : "",
                    ToDate: filterType === "DATEWISE" ? toDate : "",
                };

                const response = await visitorManagementDashboardService.apiCallPullVisitorManagementDashboard(params);

                if (E.isRight(response)) {   
                    setDashboardData(response.right.Data);
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
    }, [addToast, filterType, fromDate, toDate]);

    useEffect(() => {
        if (filterType === "DATEWISE" && (!fromDate || !toDate)) return;
        loadVisitorManagementDashboardData();
    }, [filterType, fromDate, toDate, loadVisitorManagementDashboardData]);

    const overviewData = dashboardData?.Table0?.[0]; 
    const visitorsList = dashboardData?.Table1 || []; 
    const timelineRawData = dashboardData?.Table2 || []; 
    const purposeWiseVisitorData = dashboardData?.Table3 || []; 
    const visitorAlertData = dashboardData?.Table4 || []; 

    const visitorTimelineData = useMemo(() => getVisitorTimelineData(timelineRawData), [timelineRawData]);
    
    const visitorOverviewCardData = useMemo(() => 
        selectedOverviewCard ? getVisitorOverviewCardData(selectedOverviewCard.key, visitorsList) : [], 
    [selectedOverviewCard, visitorsList]);

    const handleOpenOverviewModal = useCallback((cardKey: keyof OverviewTable, cardTitle: string) => {
        setSelectedOverviewCard({ key: cardKey, title: cardTitle });
    }, []);

    const handleCloseOverviewModal = useCallback(() => {
        setSelectedOverviewCard(null);
    }, []);

    const handleNavigateToView = () => navigate(`/gatePass`);

    const handleClearDateRange = useCallback(() => {
        setActiveTab("Today");
        setFilterType("TODAY");
        setFromDate(null);
        setToDate(null);
    }, []);

    const handleConfirmationDialogBoxOpenforOut = useCallback((row: VisitorTable) => {
        setSelectedVisitorData(row);
        setIsConfirmationDialogBoxOpenforOut(true);
    }, []);

    const handleConfirmationDialogBoxOpenforBell = useCallback((row: VisitorTable) => {
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

        const handleConfirmationDialogBoxOpenforLogin = useCallback((row: VisitorTable) => {
        setSelectedVisitorData(row);
        setIsConfirmationDialogBoxOpenforLogin(true);
    }, []);

    const handleConfirmationDialogBoxCloseforLogin = useCallback(() => {
        setIsConfirmationDialogBoxOpenforLogin(false);
        setSelectedVisitorData(null);
    }, []);

    const handleLoginGatePass = async (action: 'Accept' | 'Reject', remark: string = '') => {
        setIsConfirmationDialogBoxOpenforLogin(false);

        if (!selectedVisitorData) return;

        let isSuccess = false;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: UpdateGatePassApprovalRequest = {
                    ExternalId: selectedVisitorData.ExternalId,
                    Uniquekey: selectedVisitorData.Uniquekey,
                    ApprovalStatus: action === 'Accept' ? 'Approved' : 'Rejected',
                    ApprovalRemark: remark
                };

                const response = await gatePassService.apiCallUpdateGatePassApproval(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    isSuccess = true;
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            action === 'Accept' ? 'Approving Visitor' : 'Rejecting Visitor'
        );

        if (isSuccess) {
            await loadVisitorManagementDashboardData();
        }
    };

    const handleOutGatePass = async (action: 'Out' | 'Bell') => {
        if (action === 'Out') setIsConfirmationDialogBoxOpenforOut(false);
        else setIsConfirmationDialogBoxOpenforBell(false);

        if (!selectedVisitorData) return;

        let isSuccess = false;

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
                    addToast({ type: 'success', title: response.right.SuccessMessage[0]});
                    isSuccess = true;
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            action === 'Bell' ? 'Notify Visitor' : 'Out Visitor Details'
        );

        if (isSuccess) {
            await loadVisitorManagementDashboardData();
        }
    };

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
                            const tabValue = t.id.toUpperCase() as VisitorManagementDashboardFilterType;
                            setFilterType(tabValue);
                            if (tabValue !== "DATEWISE") {
                                setFromDate(null);
                                setToDate(null);
                            }
                        }}
                        istoggleTab={true}
                    />
                </div>

                {filterType === "DATEWISE" && (
                    <div className="flex items-center gap-2">
                        <DateRangeWithActions
                            fromDate={fromDate}
                            toDate={toDate}
                            onBothDatesChange={(f, t) => {
                                if (!f && !t) {
                                    handleClearDateRange();
                                } else {
                                    setFromDate(f);
                                    setToDate(t);
                                }
                            }}
                            onFromDateChange={(f) => {
                                if (!f && !toDate) {
                                    handleClearDateRange();
                                } else {
                                    setFromDate(f);
                                }
                            }}
                            onToDateChange={(t) => {
                                if (!t && !fromDate) {
                                    handleClearDateRange();
                                } else {
                                    setToDate(t);
                                }
                            }}
                            exportLoading={isLoading}
                        />
                    </div>
                )}

                <div className="ml-auto flex justify-end">
                    <div className="flex gap-5 justify-end">
                        {canAction && (
                            <Button onClick={handleNavigateToView} size="sm">
                                + Add Visitor
                            </Button>
                        )}

                    </div>
                </div>
            </div>

            {dashboardData && (
                <div>
                    {overviewData && (
                        <OverviewCards filterType={filterType} overViewData={overviewData} onOpenModal={handleOpenOverviewModal} />
                    )}

                    <Visitors
                        visitorData={visitorsList}
                        filterType={filterType}
                        onLogin={handleConfirmationDialogBoxOpenforLogin}
                        onLogout={handleConfirmationDialogBoxOpenforOut}
                        onBell={handleConfirmationDialogBoxOpenforBell}
                    />

                    {filterType === "TODAY" && (
                        <TodaysVisitorTimeline timelineData={visitorTimelineData} />
                    )}

                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12 lg:col-span-6">
                            <PurposeWiseVisitors purposeWiseVisitorData={purposeWiseVisitorData} visitorsList={visitorsList} />
                        </div>
                        <div className="col-span-12 lg:col-span-6">
                            <VisitorAlerts visitorAlertData={visitorAlertData} />
                        </div>
                    </div>
                </div>
            )}

            {selectedOverviewCard && (
                <VisitorOverviewModal
                    isOpen={!!selectedOverviewCard}
                    title={selectedOverviewCard.title}
                    visitorData={visitorOverviewCardData}
                    filterType={filterType}
                    onClose={handleCloseOverviewModal}
                />
            )}

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
                title="Notify Appointment Person"
                message="The appointment contact will be notified that their visitor has arrived at reception"
                confirmText="Notify"
            />

            <GatePassApprovalModal
                isOpen={isConfirmationDialogBoxOpenforLogin}
                onClose={handleConfirmationDialogBoxCloseforLogin}
                onSubmit={handleLoginGatePass}
                loading={isLoading}
            />
        </div>
    )
}

export default VisitorManagementDashboard;