import { useNavigate } from 'react-router-dom';
import { Edit, Eye, Trash } from "lucide-react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Button } from "@/ui/components/forms";
import type { InventoryFlatData } from "@/features/inventory/models/InventoryMasterModel";
import { colorsForFlatComponent } from "@/features/inventory/utils/flatColors";
import { useBookingListState } from "@/features/booking/context/BookingListStateContext";
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';

interface FlatCardProps {
    flat: InventoryFlatData;
    projectId: number;
    onDelete: (flat: InventoryFlatData) => void;
    wing?: string;
    floor?: string;
    buildingNumber?: string;
    canAction?: boolean;
    canBookingAction?: boolean;
    approvalStatus?: string;
}

export const FlatCard = ({ flat, projectId, onDelete, wing, floor, buildingNumber, canAction, canBookingAction, approvalStatus }: FlatCardProps) => {
    const navigate = useNavigate();

    const { updateListState } = useBookingListState();

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
                "approvalStatus": approvalStatus

            },
        });
    };

    const handleDelete = () => {
        onDelete(flat);
    };

    const handleBook = () => {

        updateListState({
            bookingId: 0,
            bookingName: ""
        });

        navigate('/booking/add', {

            state: {
                flatData: {
                    InventoryFlatId: flat.InventoryFlatId,
                    Flat: flat.Flat,
                    FlatType: flat.FlatType,
                    RERACarpetAreaSqFt: flat.RERACarpetAreaSqFt,
                    FlatConfiguration: flat.FlatConfiguration,
                    Wing: wing || flat.Wing,
                    Floor: floor || flat.Floor,
                    BuildingNumber: buildingNumber || flat.BuildingNumber,
                    PageName: "UNIT BOOK",
                    InventoryFlatFloorBasementPodiumWingId: flat.InventoryFlatFloorBasementPodiumWingId,
                    InventoryBuildingId: flat.InventoryBuildingId,
                    bookingId: 0,
                    bookingName: ""
                }
            }
        });
    };

    const getOwnerLabel = () => {
        if (flat.FlatStatus === "Booked") return "Owner : ";
        if (flat.FlatStatus === "Alloted") return "Alloted : ";
        if (flat.FlatStatus === "Blocked") return "Blocked By : ";
        return "";
    };

    const handleOwnerNameClick = () => {

        if (flat.BookingId && flat.BookingId > 0) {

            updateListState({
                bookingId: flat.BookingId,
                bookingName: flat.OwnerName || '',
            });

            navigate('/booking/view', {
                state: { sourcePage: 'inventory' }
            });

        }
    };

    return (
        <div
            className={`flex flex-col justify-evenly ${flat.FlatStatus === "Available" ? "min-h-[250px]" : "h-[250px]"} w-[250px] rounded-[8px] border ${colorsForFlatComponent[flat.FlatStatus].Border} border-[0.3px] px-2`}
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

                {(flat.FlatStatus === "Booked" || flat.FlatStatus === "Alloted") && <Eye size={16} onClick={handleEdit} />}

                {canAction ? (
                    <>
                        {(flat.FlatStatus === "Blocked" || flat.FlatStatus === "Available" || flat.FlatStatus === "Hold") && (
                            <Edit className="cursor-pointer" onClick={handleEdit} size={16} />
                        )}

                        {(flat.FlatStatus === "Available" && approvalStatus?.toUpperCase() !== "APPROVED") && (
                            <Trash onClick={handleDelete} color="red" size={16} />
                        )}
                    </>
                )
                    : canBookingAction ? (
                        <>
                            {(flat.FlatStatus === "Blocked" || flat.FlatStatus === "Available" || flat.FlatStatus === "Hold") && (
                                <Edit className="cursor-pointer" onClick={handleEdit} size={16} />
                            )}
                        </>
                    ) : null
                }

            </div>

            {flat.FlatStatus === "Available" && approvalStatus?.toUpperCase() === "APPROVED" && flat.FlatType !== "" && flat.RERACarpetAreaSqFt > 0 && canBookingAction && (
                <div className="flex items-center justify-center mt-2">
                    <Button
                        onClick={handleBook}
                        color="blue"
                        size="sm"
                        className="w-full"
                    >
                        Book
                    </Button>
                </div>
            )}


            {flat.OwnerName && (flat.FlatStatus === "Booked" || flat.FlatStatus === "Alloted") ? (
                <p
                    className="text-center text-[#135BEC] font-semibold cursor-pointer hover:underline"
                    onClick={handleOwnerNameClick}
                    title="Click to view booking details"
                >
                    {getOwnerLabel()}{flat.OwnerName}
                </p>
            ) : flat.FlatStatus === "Blocked" || flat.FlatStatus === "Hold" ? (
                <p className={`text-center ${colorsForFlatComponent[flat.FlatStatus].buttonText}`}>
                    {flat.FlatStatus} by {flat.CreatedBy} on {formatDate_dd_MonthName_yy_hh_mm(flat.CreatedDate ?? "-")}
                </p>
            ) : (
                <p className="text-center text-[#135BEC] font-semibold">
                     &nbsp;
                </p>
            )}


        </div>
    );
};

