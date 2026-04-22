import { useState } from "react";
import Tabs from '@/ui/components/Tab/Tab';
import Summary from "@/features/crmPayTrack/components/Summary";
import Requests from "@/features/crmPayTrack/components/Requests";
import Activity from "@/features/crmPayTrack/components/Activity";

export const ModifiedRequest: React.FC = () => {

    const modifiedRequestTabList = [
        { id: 'Summary', label: 'Summary' },
        { id: 'Requests', label: 'Requests' },
        { id: 'Activity', label: 'Activity' },
    ];

    const [activeTab, setActiveTab] = useState<string>(modifiedRequestTabList[0].id);

    return (
        <div className="relative">
            <div className='pt-5 flex justify-between items-center pr-2'>
                <Tabs
                    tabs={modifiedRequestTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                    }}
                    isChips={false}
                />
            </div>

            {/* Tabs Content */}
            {activeTab === "Summary" && <Summary />}
            {activeTab === "Requests" && <Requests />}
            {activeTab === "Activity" && <Activity />}

        </div>
    )
}

export default ModifiedRequest