import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import ProjectRedevelopment from "../components/ProjectRedevelopment";
import ProjectLand from "../components/ProjectLand";
import { useLocation } from "react-router-dom";

export const ViewProjectLead: React.FC = () => {
    const location = useLocation();

    const ProjectLeadTabList = [
        { id: "Redevelopment", label: "Redevelopment" },
        { id: "Land", label: "Land" },
    ];

    const [activeTab, setActiveTab] = useState<string>(location.state?.activeTab || ProjectLeadTabList?.[0]?.id || '');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="pt-3 pb-5">
                <Tabs
                    tabs={ProjectLeadTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                    }}
                />
            </div>

            {activeTab === "Land" && <ProjectLand />}
            {activeTab === "Redevelopment" && <ProjectRedevelopment />}

        </div>
    )
}
export default ViewProjectLead;