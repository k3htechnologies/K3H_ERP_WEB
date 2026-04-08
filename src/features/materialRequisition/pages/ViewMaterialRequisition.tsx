import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Details from "../components/Details";

export const MaterialRequisition: React.FC = () => {

    const MaterialRequisitionTabList = [
        { id: 'Details', label: 'Details' },
        { id: 'Finalize Vendor', label: 'Finalize Vendor' },
        { id: 'Purchase Order', label: 'Purchase Order' },
        { id: 'GRN', label: 'GRN' },
        { id: 'Invoice', label: 'Invoice' },
    ];

    const [activeTab, setActiveTab] = useState(MaterialRequisitionTabList[0].id);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="pt-3 pb-5">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Details' && <Details />}

        </div>
    );
};

export default MaterialRequisition;
