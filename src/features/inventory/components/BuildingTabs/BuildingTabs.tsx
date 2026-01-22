import type { InventoryData } from "../../models/InventoryMasterModel";

interface BuildingTabsProps {
    inventory: InventoryData[];
    selectedBuildingIndex: number | null;
    onBuildingSelect: (index: number) => void;
}

export const BuildingTabs = ({
    inventory,
    selectedBuildingIndex,
    onBuildingSelect,
}: BuildingTabsProps) => {
    return (
        <div className="flex gap-5">
            {inventory.map((building, index) => (
                <span
                    key={index}
                    onClick={() => onBuildingSelect(index)}
                    className={`relative pb-2 text-sm font-medium transition-all duration-200 ${
                        selectedBuildingIndex === index
                            ? 'text-blue-600 font-medium text-[16px] leading-[140%] tracking-[0.01em]'
                            : 'text-gray-400 font-normal text-[14px] leading-[140%] tracking-[0.01em] hover:text-blue-500'
                    }`}
                >
                    {building.BuildingNumber}
                    {selectedBuildingIndex === index && (
                        <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />
                    )}
                </span>
            ))}
        </div>
    );
};

