import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import PaymentScheduleCrm from "@/features/crmPayTrackScreen/components/PaymentScheduleCrm";
import PaymentLedgerCrm from "@/features/crmPayTrackScreen/components/PaymentLedgerCrm";

export const Account: React.FC = () => {

    const AccountTabList = [
        { id: 'PaymentSchedule', label: 'Payment Schedule' },
        { id: 'PaymentLedger', label: 'Payment Ledger' },
    ];

    const [activeTab, setActiveTab] = useState(AccountTabList[0].id);

    return (
        <div>

            <div className="pt-3">
                <Tabs
                    tabs={AccountTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === "PaymentSchedule" && <PaymentScheduleCrm />}
            {activeTab === "PaymentLedger" && <PaymentLedgerCrm />}


        </div>
    )
}

export default Account