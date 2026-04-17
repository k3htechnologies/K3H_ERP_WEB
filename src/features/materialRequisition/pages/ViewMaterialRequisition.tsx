import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Details from "../components/Details";
import { Overview } from "../components/Overview";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { useNavigate } from "react-router-dom";
import { Invoice } from "../components/invoice/Invoice";
import PurchaseOrder from "../components/PurchaseOrder";

export const ViewMaterialRequisition: React.FC = () => {

    const MaterialRequisitionTabList = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Details', label: 'Details' },
        { id: 'Finalize Vendor', label: 'Finalize Vendor' },
        { id: 'Purchase Order', label: 'Purchase Order' },
        { id: 'GRN', label: 'GRN' },
        { id: 'Invoice', label: 'Invoice' },
    ];

    const [activeTab, setActiveTab] = useState(MaterialRequisitionTabList[0].id);

    // NAVIGATION
    const navigate = useNavigate();
    const { listState } = useMaterialRequisitionListState();
    const systemGeneratedCode = listState.SystemGeneratedCode;
    const materialRequisitionStatus = listState.MaterialRequisitionStatus

    //#region BACK MATERIAL REQUISITION PAGE
    const handleBackToListMaterialRequisition = () => {
        navigate('/materialRequisition');
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <HeaderActionBar
                subTitleText={systemGeneratedCode ?? "-"}
                subSubTitleText={materialRequisitionStatus ?? '-'}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListMaterialRequisition()}
            />

            <div className="pt-3 pb-5">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Details' && <Details />}
            {activeTab === 'Overview' && <Overview />}
            {activeTab === 'Invoice' && <Invoice />}
            {activeTab === 'Purchase Order' && <PurchaseOrder />}

        </div>
    );
};

export default ViewMaterialRequisition;
