import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { FilterWithPaginationPaymentSchedule, FilterWithPaginationPaymentScheduleDemandSummary, PaymentScheduleDemandSummaryListResponse, PaymentScheduleListResponse } from "@/features/crmPayTrack/models/PaymentScheduleModel";

import { PaymentScheduleApi } from "@/features/crmPayTrack/api/PaymentScheduleApi";

export abstract class PaymentScheduleDatasource {
    abstract pullPaymentSchedule(params: FilterWithPaginationPaymentSchedule, signal?: AbortSignal): Promise<PaymentScheduleListResponse>;
    abstract pullPaymentScheduleDemandSummary(params: FilterWithPaginationPaymentScheduleDemandSummary, signal?: AbortSignal): Promise<PaymentScheduleDemandSummaryListResponse>;
}

export class PaymentScheduleDatasourceImpl implements PaymentScheduleDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPaymentSchedule(params: FilterWithPaginationPaymentSchedule, signal?: AbortSignal): Promise<PaymentScheduleListResponse> {
        try {
            const queryParams = new URLSearchParams({
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.Name) queryParams.append("Name", params.Name);                     
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentScheduleApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT SCHEDULE :", error);

            if (error instanceof TokenExpiredException) {
              return  await this.pullPaymentSchedule(params);
            }
            throw error;
        }
    }

    async pullPaymentScheduleDemandSummary(params: FilterWithPaginationPaymentScheduleDemandSummary, signal?: AbortSignal): Promise<PaymentScheduleDemandSummaryListResponse> {
        try {
            const queryParams = new URLSearchParams({
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.BookingPaymentScheduleId) queryParams.append("BookingPaymentScheduleId", params.BookingPaymentScheduleId.toString());
            if (params.Name) queryParams.append("Name", params.Name);                     
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentScheduleApi.PULL_DEMAND_SUMMARY}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT SCHEDULE DEMAND SUMMARY:", error);

            if (error instanceof TokenExpiredException) {
                
              return  await this.pullPaymentScheduleDemandSummary(params);
            }
            throw error;
        }
    }

}


