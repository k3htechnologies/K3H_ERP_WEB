import Tabs from "@/ui/components/Tab/Tab";
import { useState } from "react";
import VendorWiseMaterialCountReport from "../components/VendorWiseMaterialCountReport";
import MaterialRequisitionReport from "../components/MaterialRequisitionReport";
import MaterialPurchaseReport from "../components/MaterialPurchaseReport";

export const ViewMaterialRequisitionReport: React.FC = () => {

    const MaterialReportList = [
        { id: "VendorWiseMaterialCountReport", label: "Vendor", },
        { id: "MaterialRequisitionReport", label: "Material Requisition", },
        { id: "MaterialPurchaseReport", label: "Purchase Order", },
    ];

    const [activeTab, setActiveTab] = useState<string>(MaterialReportList[0].id);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="pt-3 pb-5">
                <Tabs
                    tabs={MaterialReportList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(tab) => {
                        setActiveTab(tab.id);
                    }}
                />
            </div>

            {activeTab === "VendorWiseMaterialCountReport" && (<VendorWiseMaterialCountReport />)}

            {activeTab === "MaterialRequisitionReport" && (<MaterialRequisitionReport />)}

            {activeTab === "MaterialPurchaseReport" && (<MaterialPurchaseReport />)}

        </div>
    );
};

export default ViewMaterialRequisitionReport;
