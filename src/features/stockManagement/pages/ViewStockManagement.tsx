import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { Tabs } from "@/ui/components/Tab/Tab";
import { useState } from "react";
import { useNavigate, } from "react-router-dom";
import { useStockManagementListState } from "@/features/stockManagement/context/StockManagementListStateContext";
import StocksHistory from "@/features/stockManagement/components/StocksHistory";
import { MaterialOut } from "@/features/stockManagement/components/Materialout";
import MaterialIn from "@/features/stockManagement/components/Materialin";
import StockSummary from "@/features/stockManagement/components/StockSummary";

export const ViewStockManagement: React.FC = () => {

    const navigate = useNavigate();
    const { listState } = useStockManagementListState();
    const materialName = listState.MaterialName;
    const subMaterialName = listState.SubMaterialName;

    const MaterialRequisitionTabList = [
        { id: 'Summary', label: 'Summary' },
        { id: 'History', label: 'History' },
        { id: 'MaterialIn', label: 'Material In' },
        { id: 'MaterialIssued', label: 'Material Issued' },
    ];

    const [activeTab, setActiveTab] = useState<string>(MaterialRequisitionTabList[0].id);

    const handleBackToStockManagement = () => {
        navigate("/stock");
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="flex justify-between">
                <HeaderActionBar
                    subTitleText={materialName ?? ""}
                    subSubTitleText={subMaterialName ?? ""}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => handleBackToStockManagement()}
                />
            </div>

            <div className="pt-3 pb-3">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Summary' && <StockSummary />}
            {activeTab === 'History' && <StocksHistory />}
            {activeTab === 'MaterialIn' && <MaterialIn />}
            {activeTab === 'MaterialIssued' && <MaterialOut />}

        </div>
    )
}

export default ViewStockManagement;