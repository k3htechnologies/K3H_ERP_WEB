import { useState } from "react";
import CallingData from "@/features/callTracker/components/CallingData";
import CallLog from "@/features/callTracker/components/CallLog";
import Tabs from "@/ui/components/Tab/Tab";

export const CallTracker: React.FC = () => {

    const CallTrackerTabList = [
        { id: 'Calling Data', label: 'Calling Data' },
        { id: 'Call Log', label: 'Call Log' },
    ];

    const [activeTab, setActiveTab] = useState(CallTrackerTabList[0].id);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="pt-3 pb-5">
                <Tabs
                    tabs={CallTrackerTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Calling Data' && <CallingData />}
            {activeTab === 'Call Log' && <CallLog />}

        </div>
    );
};

export default CallTracker;
