import Tabs from "@/ui/components/Tab/Tab";
import type { InventoryFlatFloorBasementPodiumWingData } from "@/features/inventory/models/InventoryMasterModel";

interface WingTabsProps {
    wings: InventoryFlatFloorBasementPodiumWingData[];
    activeWingTab: string;
    onWingChange: (index: number) => void;
}

export const WingTabs = ({ wings, activeWingTab, onWingChange }: WingTabsProps) => {
    const wingTabs = wings.map((wing, index) => ({
        id: String(index),
        label: wing.Wing,
        data: wing,
    }));

    return (
        <Tabs
            tabs={wingTabs}
            defaultActive={activeWingTab}
            islarge={true}
            onTabChange={(tab) => {
                const index = Number(tab.id);
                onWingChange(index);
            }}
        />
    );
};

