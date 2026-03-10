import { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Inward from "@/features/inwardOutward/components/InwardTab";
import Outward from "@/features/inwardOutward/components/OutwardTab";
import InwardOutwardPage from "@/features/inwardOutward/components/InwardOutwardTable";
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';


export const InwardOutward: React.FC = () => {

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    const InwardOutwardTabList = [
        { id: 'All', label: 'All' },
        { id: 'Inward', label: 'Inward' },
        { id: 'Outward', label: 'Outward' },
    ];

    const [activeTab, setActiveTab] = useState(InwardOutwardTabList[0].id);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">




            <div className="pt-3">

                <Tabs
                    tabs={InwardOutwardTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />

                <TableActionToolbar
                    isShowSearchBar={false}
                    //Add
                    isShowAddButton={true}
                    addTitle="Add"
                    onAdd={() => {
                        // Your logic to open an add modal or navigate to an add page
                        console.log("Add button clicked");
                    }}
                />
            </div>

            {activeTab === 'All' && <InwardOutwardPage />}
            {activeTab === 'Inward' && <Inward />}
            {activeTab === 'Outward' && <Outward />}


        </div>
    );
};

export default InwardOutward;