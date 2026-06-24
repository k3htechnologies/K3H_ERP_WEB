import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Details from "./Details";
import DocumentTracking from "./DocumentTracking";
import { useTaxTrackerListState } from "../context/TaxTrackerListStateContext";
import { useNavigate } from "react-router-dom";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";

export const ViewTaxTracker: React.FC = () => {

    const { listState } = useTaxTrackerListState();
    const { NoticeType, CompanyName } = listState;
    const navigate = useNavigate();

    const TaxTrackerViewTabList = [
        { id: "Details", label: "Details" },
        { id: "Document Tracking", label: "Document Tracking" },
    ];

    const [activeTab, setActiveTab] = useState(TaxTrackerViewTabList[0].id);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <div>
                <HeaderActionBar
                    subTitleText={NoticeType}
                    subSubTitleText={CompanyName ?? "-"}
                    onCancel={() => {
                        navigate('/taxTracker');
                    }}
                />
            </div>
            <div className="pt-5">

                <Tabs
                    tabs={TaxTrackerViewTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            <div className="mt-6">
                {activeTab === "Details" && (
                    <Details />
                )}
                {activeTab === "Document Tracking" && (
                    <DocumentTracking />
                )}
            </div>

        </div>
    )
}

export default ViewTaxTracker;