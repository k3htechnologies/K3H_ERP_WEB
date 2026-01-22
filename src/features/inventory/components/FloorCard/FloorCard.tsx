import { Plus } from "lucide-react";
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import { FlatCard } from "../FlatCard";
import type { InventoryFloorData } from "../../models/InventoryMasterModel";

interface FloorCardProps {
    floor: InventoryFloorData;
    projectId: number;
}

export const FloorCard = ({ floor, projectId }: FloorCardProps) => {
    return (
        <div className="pt-2">
            <ExpandableCard
                key={floor.InventoryFloorId}
                title={floor.Floor}
                showline={true}
                customizedIcon={<Plus className="p-1.5" size={28} />}
                child={
                    <div className="flex flex-1 gap-5 thin-scroll">
                        {floor.InventoryFlatData?.map((flat, flatIndex) => (
                            <FlatCard
                                key={flatIndex}
                                flat={flat}
                                projectId={projectId}
                            />
                        ))}
                    </div>
                }
            />
        </div>
    );
};

