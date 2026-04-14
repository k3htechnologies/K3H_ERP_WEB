import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { ParkingData } from "@/features/parking/models/ParkingModel";
import { colorsForParkingComponent } from "@/features/parking/utils/parkingColors";
import { Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/components/forms";
import { useBookingListState } from "@/features/booking/context/BookingListStateContext";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";

interface ParkingCardProps {
  parking: ParkingData;
  onEdit: (parking: ParkingData) => void;
  canAction?: boolean
  canBookingAction?: boolean;
  approvalStatus?:string;
}

export const ParkingCard = ({ parking, onEdit, canAction, canBookingAction ,approvalStatus}: ParkingCardProps) => {
  const navigate = useNavigate();
  const { updateListState } = useBookingListState();

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

  const handleBook = () => {
    navigate('/booking/add', {
      state: {
        parkingData: {
          ParkingId: parking.ParkingId,
          ParkingNumber: parking.ParkingNumber,
          ParkingCategory: parking.ParkingCategory,
          ParkingType: parking.ParkingType,
          ParkingSubType: parking.ParkingSubType,
          ParkingDimensions: parking.ParkingDimensions,
          IsEVChargingAvailable: parking.IsEVChargingAvailable,
          BuildingNumber: parking.BuildingNumber,
          Floor: parking.Floor,
          Wing: parking.Wing,
          InventoryBuildingId: parking.InventoryBuildingId,
          InventoryFlatFloorBasementPodiumWingId: parking.InventoryFlatFloorBasementPodiumWingId,
          InventoryFloorId: parking.InventoryFloorId,
          PageName: "PARKING BOOK",
        }
      }
    });
  };

  const handleOwnerNameClick = () => {
    if (parking.BookingId && parking.BookingId > 0) {
      updateListState({
        bookingId: parking.BookingId,
        bookingName: parking.OwnerName || '',
      });
      navigate('/booking/view', {
        state: { sourcePage: 'parking' }
      });
    }
  };

  return (
    <div
      className={`flex flex-col justify-evenly ${parking.ParkingStatus === "Available" ? "min-h-[250px]" : "h-[250px]"} w-[300px] rounded-[8px] border ${colorsForParkingComponent[parking.ParkingStatus ?? "Available"].Border} border-[0.3px] px-2 `} style={gradientStyle}>

      <FieldItem label="Parking No" value={parking.ParkingNumber} isRow={true} isUsedForInventoryFlat={true} />
      <FieldItem label="Category" value={parking.ParkingCategory} isRow={true} isUsedForInventoryFlat={true} />
      <FieldItem label="Type" value={parking.ParkingType} isRow={true} isUsedForInventoryFlat={true} />
      <FieldItem label="EV Charging " value={parking.IsEVChargingAvailable ? 'Yes' : 'No'} isRow={true} isUsedForInventoryFlat={true} />
      <FieldItem label="Dimensions" value={parking.ParkingDimensions} isRow={true} isUsedForInventoryFlat={true} />
      <FieldItem label="Size" value={parking.ParkingSubType} isRow={true} isUsedForInventoryFlat={true} />

      <div className="flex items-center  gap-2">
        <div className={`
                        flex h-[30px] w-[250px]
                        ${colorsForParkingComponent[parking.ParkingStatus ?? "Available"].Button}
                        ${colorsForParkingComponent[parking.ParkingStatus ?? "Available"].buttonText}
                        rounded-[6px]
                        items-center justify-center
                    `}
        >
          {parking.ParkingStatus}
        </div>

        {approvalStatus?.toUpperCase()==="APPROVED" && <Eye size={16} onClick={() => onEdit(parking)} />}

        {!approvalStatus?.toUpperCase().includes("APPROVED") && canAction && (
          <Edit className="cursor-pointer" onClick={() => onEdit(parking)} size={16} />
        )}

      </div>

      {parking.ParkingStatus === "Available"  && approvalStatus?.toUpperCase()==="APPROVED" && parking.ParkingNumber !== "" && parking.ParkingCategory !== "" && canBookingAction && (
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



      {parking.OwnerName && (parking.ParkingStatus === "Booked" || parking.ParkingStatus === "Member") ? (
        <p
          className="text-center text-[#135BEC] font-medium text-sm cursor-pointer hover:underline"
          onClick={handleOwnerNameClick}
          title="Click to view booking details"
        >
          Owner : {parking.OwnerName}
        </p>
      ) : parking.ParkingStatus === "Blocked" || parking.ParkingStatus === "Hold" ? (
        <p className={`text-center font-medium text-sm ${colorsForParkingComponent[parking.ParkingStatus].buttonText}`}>
          {parking.ParkingStatus} by {parking.ModifiedBy} on {formatDate_dd_MonthName_yy_hh_mm(parking.ModifiedDate ?? "-")}
        </p>
      ) : (
        null
      )}

    </div>
  );
};