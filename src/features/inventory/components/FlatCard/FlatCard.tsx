import { useNavigate } from 'react-router-dom';
import { Edit, Eye, Trash } from "lucide-react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { InventoryFlatData } from "@/features/inventory/models/InventoryMasterModel";
import { colorsForFlatComponent } from "@/features/inventory/utils/flatColors";

interface FlatCardProps {
    flat: InventoryFlatData;
    projectId: number;
    onDelete: (flat: InventoryFlatData) => void;
}

export const FlatCard = ({ flat, projectId, onDelete }: FlatCardProps) => {
    const navigate = useNavigate();

    const hexToRgba = (hex: string, alpha: number = 0.12) => {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const bgColor = colorsForFlatComponent[flat.FlatStatus].Background.replace('#', '');
    const fromColor = hexToRgba(`#${bgColor.substring(0, 6)}`, 0.12);
    const toColor = 'rgba(51, 51, 51, 0.067)';

    const gradientStyle = {
        background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`
    };

    const handleEdit = () => {
        navigate('/inventory/inventorySpecification', {
            state: {
                "flat": flat,
                "projectId": projectId,
            },
        });
    };

    const handleDelete = () => {
        onDelete(flat);
    };

    const getOwnerLabel = () => {
        if (flat.FlatStatus === "Booked") return "Owner : ";
        if (flat.FlatStatus === "Alloted") return "Alloted : ";
        return "";
    };

    return (
        <div
            className={`flex flex-col justify-evenly h-[200px] w-[250px] rounded-[8px] border ${colorsForFlatComponent[flat.FlatStatus].Border} border-[0.3px] px-2`}
            style={gradientStyle}
        >
            <FieldItem label="Unit No " value={flat.Flat} isRow={true} isUsedForInventoryFlat={true} />
            <FieldItem label="Type " value={flat.FlatType} isRow={true} isUsedForInventoryFlat={true} />
            <FieldItem label="Area (SqFt) " value={flat.RERACarpetAreaSqFt} isRow={true} isUsedForInventoryFlat={true} />
            <FieldItem label="Configuration " value={flat.FlatConfiguration} isRow={true} isUsedForInventoryFlat={true} />
            
            <div className="flex items-center justify-evenly gap-2">
                <div
                    className={`
                        flex h-[30px] w-[207px]
                        ${colorsForFlatComponent[flat.FlatStatus].Button}
                        ${colorsForFlatComponent[flat.FlatStatus].buttonText}
                        rounded-[6px]
                        items-center justify-center
                    `}
                >
                    {flat.FlatStatus}
                </div>
                
                {(flat.FlatStatus === "Booked" || flat.FlatStatus === "Alloted" ) && <Eye size={16}  onClick={handleEdit}/>}
                
                {(flat.FlatStatus === "Blocked" || flat.FlatStatus === "Available" || flat.FlatStatus === "Hold") && (
                    <Edit className="cursor-pointer" onClick={handleEdit} size={16} />
                )}
                
                {(flat.FlatStatus === "Blocked" || flat.FlatStatus === "Available") && (
                    <Trash onClick={handleDelete} color="red" size={16} />
                )}
            </div>

            <p className="text-center text-[#135BEC] font-semibold">
                {getOwnerLabel()}{flat.OwnerName}
            </p>
        </div>
    );
};

