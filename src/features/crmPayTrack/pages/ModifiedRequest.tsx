
import { useState, useEffect } from "react";
import Tabs from '@/ui/components/Tab/Tab';
import Summary from "@/features/crmPayTrack/components/Summary";
import Activity from "@/features/crmPayTrack/components/Activity";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import RequestsTab from "@/features/crmPayTrack/components/RequestsTab";
import RefundPaymentLedger from "../components/RefundPaymentLedger";

export const ModifiedRequest: React.FC = () => {

    const { listState, updateListState } = usePayTrackBookingListState();

    const modifiedRequestTabList = [
        { id: 'Summary', label: 'Summary' },
        { id: 'Requests', label: 'Requests' },
        { id: 'Activity', label: 'Activity' },
        ...(listState.bookingData?.BookingApprovalStatus?.toUpperCase() === 'REFUND'
            ? [{ id: 'Refund Payment Ledger', label: 'Refund Payment Ledger' }]
            : []),
    ];
    
    const [activeTab, setActiveTab] = useState<string>(listState.activeSubTab || modifiedRequestTabList[0].id);

    useEffect(() => {
        if (listState.activeSubTab && listState.activeSubTab !== activeTab) {
            setActiveTab(listState.activeSubTab);
        }
    }, [listState.activeSubTab]);

    return (
        <div className="relative">
            <div className='pt-5 flex justify-between items-center pr-2'>
                <Tabs
                    tabs={modifiedRequestTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                        updateListState({ activeSubTab: t.id });
                    }}
                    isChips={false}
                />
            </div>

            {activeTab === "Summary" && <Summary />}
            {activeTab === "Requests" && <RequestsTab />}
            {activeTab === "Activity" && <Activity />}
            {activeTab === "Refund Payment Ledger" && <RefundPaymentLedger />}

        </div>
    )
}

export default ModifiedRequest