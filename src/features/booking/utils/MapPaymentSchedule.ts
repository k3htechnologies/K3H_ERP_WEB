import type {  PaymentScheduleMasterData } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import type { AddUpdateBookingPaymentScheduleRequest } from "@/features/booking/models/BookingModel";

export const mapPaymentScheduleToBookingPaymentSchedule = (
    data: PaymentScheduleMasterData[],
    agreementValue: number,
    agreementGSTPercentage: number
): AddUpdateBookingPaymentScheduleRequest[] => {

    return data.map((item): AddUpdateBookingPaymentScheduleRequest => {

        const percentage = Number(item.PaymentSchedulePercentage ?? 0); 
        const amount = (agreementValue * percentage) / 100;

        return {
            BookingPaymentScheduleId: 0,
            Type: 'Stage',
            Name: item.Stage ?? '',
            Date:  null,
            PaymentSchedulePercentage: percentage,
            PaymentScheduleAmount: amount,
            PaymentScheduleGSTAmount: (amount * agreementGSTPercentage) / 100,
            PaymentScheduleTDSAmount: agreementValue > 4999999.99 ? (amount * 1) / 100 : 0,
        };
    });
};