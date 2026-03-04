import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import CostSheetReport from "@/features/paymentScheduleMaster/components/CostSheetReport";
import PaymentScheduleMasterReport from "@/features/paymentScheduleMaster/components/PaymentScheduleMasterReport";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useLocation, useNavigate } from "react-router-dom";

export const PaymentScheduleTab: React.FC = () => {

    // USE NAVIGATE
    const navigate = useNavigate();
    const location = useLocation();
    const buildingName = location.state?.BuildingId || ''
    const wing = location.state?.Wing || ''
    const ratePerSqFt = location.state?.ratePerSqFt || 0;

    const PaymentScheduleTabList = [
        { id: 'Cost Sheet', label: 'Cost Sheet' },
        { id: 'Payment Schedule', label: 'Payment Schedule' },
    ];
    //#endregion
    const [activeTab, setActiveTab] = useState(PaymentScheduleTabList[0].id);

    //#region BACK PAYMENT SCHEDULE PAGE
    const handleBackToPaymentScheduleMaster = () => {
        navigate('/paymentSchedule');
    };
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <HeaderActionBar
                titleText={buildingName ?? ''}
                subTitleText={wing ?? ''}
                subSubTitleText={ratePerSqFt ?? ''}
                cancelText="Cancel"
                onCancel={() => handleBackToPaymentScheduleMaster()}
                isLoading={false}
            />

            <div className="pt-3">
                <Tabs
                    tabs={PaymentScheduleTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Cost Sheet' && <CostSheetReport />}
            {activeTab === 'Payment Schedule' && <PaymentScheduleMasterReport />}

        </div>
    );
};

export default PaymentScheduleTab;
