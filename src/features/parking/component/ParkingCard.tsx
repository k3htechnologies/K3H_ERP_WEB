import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { ParkingData } from "@/features/parking/models/ParkingModel";
import { colorsForParkingComponent } from "@/features/parking/utils/parkingColors";
import { Edit, Eye } from "lucide-react";

interface ParkingCardProps {
  parking: ParkingData;
  onEdit: (parking: ParkingData) => void;
  canAction?: boolean
}

export const ParkingCard = ({ parking, onEdit,canAction }: ParkingCardProps) => {

  const hexToRgba = (hex: string, alpha: number = 0.12) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const bgColor = colorsForParkingComponent[parking.ParkingStatus ?? "Available"].Background.replace('#', '');
  const fromColor = hexToRgba(`#${bgColor.substring(0, 6)}`, 0.12);
  const toColor = 'rgba(51, 51, 51, 0.067)';

  const gradientStyle = {
    background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`
  };

  return (
    <div
      className={`flex flex-col justify-evenly h-[200px] w-[300px] rounded-[8px] border ${colorsForParkingComponent[parking.ParkingStatus ?? "Available"].Border} border-[0.3px] px-2 `} style={gradientStyle}>

      <FieldItem label="Parking No" value={parking.ParkingNumber} isRow={true} isUsedForInventoryFlat={true} />
      <FieldItem label="Category" value={parking.ParkingCategory} isRow={true} isUsedForInventoryFlat={true} />
      <FieldItem label="Type" value={parking.ParkingType} isRow={true} isUsedForInventoryFlat={true} />
      <FieldItem label="EV Charging " value={parking.IsEVChargingAvailable ? 'Yes' : 'No'} isRow={true} isUsedForInventoryFlat={true} />

      <div className="flex items-center justify-evenly gap-2">
        <div className={`
                        flex h-[30px] w-[207px]
                        ${colorsForParkingComponent[parking.ParkingStatus ?? "Available"].Button}
                        ${colorsForParkingComponent[parking.ParkingStatus ?? "Available"].buttonText}
                        rounded-[6px]
                        items-center justify-center
                    `}
        >
          {parking.ParkingStatus}
        </div>

        {(parking.ParkingStatus === "Booked" || parking.ParkingStatus === "Member") && <Eye size={16} onClick={() => onEdit(parking)} />}

        {(parking.ParkingStatus === "Blocked" || parking.ParkingStatus === "Available" || parking.ParkingStatus === "Hold") && canAction && (
          <Edit className="cursor-pointer" onClick={() => onEdit(parking)} size={16} />
        )}

      </div>

    </div>
  );
};