import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import PaymentScheduleCrm from "@/features/crmPayTrack/components/PaymentScheduleCrm";
import PaymentLedgerCrm from "@/features/crmPayTrack/components/PaymentLedgerCrm";

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
                {activeTab === "PaymentSchedule" && <PaymentScheduleCrm />}
                {activeTab === "PaymentLedger" && <PaymentLedgerCrm />}
            </div>

        </div>
    )
}

export default Account