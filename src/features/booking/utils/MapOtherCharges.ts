import type { OtherChargesData } from "@/features/otherCharges/models/OtherChargesModel";
import type { AddUpdateBookingOtherChargesRequest } from "@/features/booking/models/BookingModel";

export const mapOtherChargesToBookingOtherCharges = (
  agreementValue: number,
  rERACarpetAreaSqFt: number,
  data: OtherChargesData[],
): AddUpdateBookingOtherChargesRequest[] => {
  return data.map((item): AddUpdateBookingOtherChargesRequest => {
    
    const value =
      item.CalculatedOn === "Per Sq Ft" ? (agreementValue / rERACarpetAreaSqFt) * Number(item.Value ?? 0) : Number(item.Value ?? 0);

    const gstPercentage = Number(item.GSTPercentage ?? 0);

    const gstValue = (value * gstPercentage) / 100;

    return {
      BookingOtherChargesId: 0,
      Uniquekey: item.Uniquekey,
      ChargeName: item.ChargeName ?? "",
      CalculatedOn: item.CalculatedOn ?? null,
      Value: value,
      GSTPercentage: gstPercentage,
      GSTValue: gstValue,
    };
  });
};
