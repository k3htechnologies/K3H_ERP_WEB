import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import PaymentSchedule from "@/features/crmPayTrack/components/PaymentSchedule";
import PaymentLedger from "@/features/crmPayTrack/components/PaymentLedger";

export const Account: React.FC = () => {

    const AccountTabList = [
        { id: 'PaymentSchedule', label: 'Payment Schedule' },
        { id: 'PaymentLedger', label: 'Payment Ledger' },
    ];

    const [activeTab, setActiveTab] = useState(AccountTabList[0].id);

    return (
        <div>

            <div className="pt-5">
                <Tabs
                    tabs={AccountTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            <div className="pt-5">
                {activeTab === "PaymentSchedule" && <PaymentSchedule />}
                {activeTab === "PaymentLedger" && <PaymentLedger />}
            </div>

        </div>
    )
}

export default Account