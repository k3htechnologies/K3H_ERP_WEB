import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import BankDetails from "@/features/crmPayTrackScreen/components/BankDetails";
import BankDocuments from "@/features/crmPayTrackScreen/components/BankDocuments";

export const BankLoans: React.FC = () => {

    const BankLoansTabList = [
        { id: 'BankDetails', label: 'Bank Details' },
        { id: 'BankDocuments', label: 'Bank Documents' },
    ];

    const [activeTab, setActiveTab] = useState(BankLoansTabList[0].id);

    return (
        <div>

            <div className="pt-3">
                <Tabs
                    tabs={BankLoansTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === "BankDetails" && <BankDetails />}
            {activeTab === "BankDocuments" && <BankDocuments />}


        </div>
    )
}

export default BankLoans