import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import ClosingTarget from "@/features/target/components/ClosingTarget";
import SourcingTarget from "@/features/target/components/SourcingTarget";

export const Target: React.FC = () => {

    const TargetTabList = [
        { id: 'Sourcing Target', label: 'Sourcing Target' },
        { id: 'Closing Target', label: 'Closing Target' },
    ];

    const [activeTab, setActiveTab] = useState(TargetTabList[0].id);


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">


            <div className="pt-3">
                <Tabs
                    tabs={TargetTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>
            

            {activeTab === 'Closing Target' && <ClosingTarget />}
            {activeTab === 'Sourcing Target' && <SourcingTarget />}


        </div>
    );
};

export default Target;