import type { OtherChargesData } from "@/features/otherCharges/models/OtherChargesModel";
import type { AddUpdateBookingOtherChargesRequest } from "../models/BookingModel";

export const mapOtherChargesToBookingOtherCharges = (data: OtherChargesData[]): AddUpdateBookingOtherChargesRequest[] => {

    return data.map((item): AddUpdateBookingOtherChargesRequest => ({

        BookingOtherChargesId: 0,

        Uniquekey: item.Uniquekey,

        ChargeName: item.ChargeName ?? "",

        CalculatedOn: item.CalculatedOn ?? null,

        Value: Number(item.Value ?? 0),

        GSTPercentage: Number(item.GSTPercentage ?? 0),

        GSTValue: Number(item.GSTValue ?? 0),

    }));

};