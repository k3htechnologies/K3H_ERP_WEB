import Tabs from "@/ui/components/Tab/Tab";
import { useState } from "react";
import CompanyMaster from "./CompanyMaster";
import CompanyBankDetails from "@/features/companyMaster/pages/CompanyBankDetails";

export const ViewCompanyMasterWithBank: React.FC = () => {

    const CompanyMasterWithBankTabList = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Bank Details', label: 'Bank Details' },
    ];

    const [activeTab, setActiveTab] = useState(CompanyMasterWithBankTabList[0].id);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="pt-3 pb-5">
                <Tabs
                    tabs={CompanyMasterWithBankTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Overview' && <CompanyMaster />}
            {activeTab === 'Bank Details' && <CompanyBankDetails />}

        </div>
    );
};

export default ViewCompanyMasterWithBank