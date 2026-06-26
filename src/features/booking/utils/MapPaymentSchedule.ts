import type {  PaymentScheduleMasterData } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import type { AddUpdateBookingPaymentScheduleRequest } from "@/features/booking/models/BookingModel";

export const mapPaymentScheduleToBookingPaymentSchedule = (
    data: PaymentScheduleMasterData[],
    agreementValue: number,
    agreementGSTPercentage: number,
    agreementValueWithoutTDS: number
): AddUpdateBookingPaymentScheduleRequest[] => {

      const roundoff2 = (value: number) => Number(value.toFixed(2));

    return data.map((item): AddUpdateBookingPaymentScheduleRequest => {

        const percentage = Number(item.PaymentSchedulePercentage ?? 0); 
        const amount = roundoff2((agreementValue * percentage) / 100);
        const amountWithoutTDS = roundoff2((agreementValueWithoutTDS * percentage) / 100);

        return {
            BookingPaymentScheduleId: 0,
            Type: 'Stage',
            Name: item.Stage ?? '',
            Date:  null,
            PaymentSchedulePercentage: roundoff2(percentage),
            PaymentScheduleAmount: roundoff2(amountWithoutTDS),
            PaymentScheduleGSTAmount: roundoff2((amount * agreementGSTPercentage) / 100),
            PaymentScheduleTDSAmount: roundoff2(agreementValue > 4999999.99 ? (amount * 1) / 100 : 0),
        };
    });
};