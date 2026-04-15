import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import BankDetails from "@/features/crmPayTrack/components/BankDetails";
import BankLoanDocuments from "@/features/crmPayTrack/components/BankLoanDocuments";

export const BankLoans: React.FC = () => {

    const BankLoansTabList = [
        { id: 'BankDetails', label: 'Details' },
        { id: 'BankDocuments', label: 'Documents' },
    ];

    const [activeTab, setActiveTab] = useState(BankLoansTabList[0].id);

    return (
        <div>

            <div className="pt-5">
                <Tabs
                    tabs={BankLoansTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            <div>
                {activeTab === "BankDetails" && <BankDetails />}
                {activeTab === "BankDocuments" && <BankLoanDocuments/>}
                
            </div>

        </div>
    )
}

export default BankLoans