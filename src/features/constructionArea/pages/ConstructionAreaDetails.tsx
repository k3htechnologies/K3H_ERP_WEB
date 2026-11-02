import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import { ConstructionAreaComparative } from "@/features/constructionArea/components/ConstructionAreaComparative";
import ConstructionArea from "@/features/constructionArea/components/ConstructionArea";

export const ConstructionAreaDetails: React.FC = () => {

    const ConstructionAreaTabList = [
        { id: 'Construction Area', label: 'Construction Area' },
        { id: 'Comparative', label: 'Comparative' },
    ];

    const [activeTab, setActiveTab] = useState(ConstructionAreaTabList[0].id);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="pt-3 pb-5">
                <Tabs
                    tabs={ConstructionAreaTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Construction Area' && <ConstructionArea />}
            {activeTab === 'Comparative' && <ConstructionAreaComparative />}

        </div>
    );
};

export default ConstructionAreaDetails;
