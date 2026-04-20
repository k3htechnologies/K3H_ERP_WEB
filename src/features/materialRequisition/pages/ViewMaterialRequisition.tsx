import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Details from "../components/Details";
import { Overview } from "../components/Overview";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { useNavigate } from "react-router-dom";
import { Invoice } from "../components/invoice/Invoice";
import PurchaseOrder from "../components/PurchaseOrder";
import { Button } from "@/ui/components/forms";
import useToast from "@/core/hooks/useToast";
import { copyToClipboard } from "@/core/utils/comman";
import { Copy } from "lucide-react";
import GRN from "../components/GRN/GRN";

export const ViewMaterialRequisition: React.FC = () => {

    const { addToast } = useToast();
    const navigate = useNavigate();
    const { listState } = useMaterialRequisitionListState();
    const systemGeneratedCode = listState.SystemGeneratedCode;

    const MaterialRequisitionTabList = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Details', label: 'Details' },
        { id: 'Finalize Vendor', label: 'Finalize Vendor' },
        { id: 'Purchase Order', label: 'Purchase Order' },
        { id: 'GRN', label: 'GRN' },
        { id: 'Invoice', label: 'Invoice' },
    ];

    const [activeTab, setActiveTab] = useState(MaterialRequisitionTabList[0].id);

    const handleBackToListMaterialRequisition = () => {
        navigate('/materialRequisition');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="flex">
                <HeaderActionBar
                    titleText={systemGeneratedCode ?? "-"}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => handleBackToListMaterialRequisition()}
                />

                <Button
                    onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const success = await copyToClipboard(systemGeneratedCode);
                        if (success) {
                            addToast({ type: 'success', title: `${systemGeneratedCode} Copied!` });
                        }
                    }}
                    color="transparent"
                    size="sm"
                    style={{
                        padding: '2px 6px',
                        color: '#6B7280',
                        cursor: 'pointer'
                    }}
                    title="Copy"
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>

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
            {activeTab === 'GRN' && <GRN />}

        </div>
    );
};

export default ViewMaterialRequisition;
