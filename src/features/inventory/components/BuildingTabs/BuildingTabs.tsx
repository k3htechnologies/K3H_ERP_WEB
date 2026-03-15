import { Trash } from "lucide-react";
import type { InventoryData } from "@/features/inventory/models/InventoryMasterModel";

interface BuildingTabsProps {
    inventory: InventoryData[];
    selectedBuildingIndex: number | null;
    onBuildingSelect: (index: number) => void;
    onDeleteBuilding?: (building: InventoryData) => void;
    canAction?:boolean;
    approvalStatus?:string;
}

export const BuildingTabs = ({
    inventory,
    selectedBuildingIndex,
    onBuildingSelect,
    onDeleteBuilding,
    canAction,
    approvalStatus,
}: BuildingTabsProps) => {
    const handleDeleteClick = (e: React.MouseEvent, building: InventoryData) => {
        e.stopPropagation();
        onDeleteBuilding?.(building);
    };

    return (
        <div className="flex gap-5">
            {inventory.map((building, index) => (
                <span
                    key={index}
                    onClick={() => onBuildingSelect(index)}
                    className={`relative pb-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        selectedBuildingIndex === index
                            ? 'text-blue-600 font-medium text-[16px] leading-[140%] tracking-[0.01em]'
                            : 'text-gray-400 font-normal text-[14px] leading-[140%] tracking-[0.01em] hover:text-blue-500'
                    }`}
                >
                    {building.BuildingNumber}
                    {selectedBuildingIndex === index && (
                        <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />
                    )}
                    {onDeleteBuilding && canAction && approvalStatus?.toUpperCase()!=="APPROVED" && selectedBuildingIndex === index && (
                        <button
                            onClick={(e) => handleDeleteClick(e, building)}
                            className="ml-1 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                            title="Delete Building"
                        >
                            <Trash color="red" size={14} className="text-gray-500 hover:text-red-600" />
                        </button>
                    )}
                </span>
            ))}
        </div>
    );
};

