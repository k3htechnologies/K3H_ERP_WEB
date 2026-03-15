import { Trash} from "lucide-react";
import type { InventoryFlatFloorBasementPodiumWingData } from "@/features/inventory/models/InventoryMasterModel";

interface WingTabsProps {
    wings: InventoryFlatFloorBasementPodiumWingData[];
    activeWingTab: string;
    onWingChange: (index: number) => void;
    onDeleteWing?: (wing: InventoryFlatFloorBasementPodiumWingData) => void;
    canAction?:boolean;
    approvalStatus?:string;
}

export const WingTabs = ({ wings, activeWingTab, onWingChange, onDeleteWing,canAction,approvalStatus }: WingTabsProps) => {
    const handleTabClick = (index: number) => {
        onWingChange(index);
    };

    const handleDeleteClick = (e: React.MouseEvent, wing: InventoryFlatFloorBasementPodiumWingData) => {
        e.stopPropagation();
        onDeleteWing?.(wing);
    };

    return (
        <div className="w-full pb-2">
            <div className="flex gap-2">
                {wings.map((wing, index) => {

                    const isActive = activeWingTab === String(index);

                    return (
                        <div
                            key={index}
                            onClick={() => handleTabClick(index)}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded  cursor-pointer transition-all duration-200 ${
                                isActive
                                    ? 'bg-[#135bec29] border border-blue-600'
                                    : 'transparent border border-[#00000040] '
                            }`}
                        >
                            <span
                                className={`text-sm font-medium ${
                                    isActive
                                        ? 'text-blue-600 font-semibold'
                                        : 'text-gray-600'
                                }`}
                            >
                                {wing.Wing}
                            </span>
                            
                            {onDeleteWing && canAction && isActive && approvalStatus?.toUpperCase()!=="APPROVED" && (
                                <button
                                    onClick={(e) => handleDeleteClick(e, wing)}
                                    className="ml-1 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                                    title="Delete Wing"
                                >
                                    <Trash color="red" size={14} className="text-gray-500 hover:text-red-600" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

