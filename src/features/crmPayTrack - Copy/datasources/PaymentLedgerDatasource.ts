import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {
    DeletePaymentLedgerRequest,
    FilterWithPaginationPaymentLedger,
    PaymentLedgerDeleteResponse,
    PaymentLedgerListResponse,
    PaymentLedgerSummaryListResponse
} from "@/features/crmPayTrack/models/PaymentLedgerModel";

import { PaymentLedgerApi } from "@/features/crmPayTrack/api/PaymentLedgerApi";

export abstract class PaymentLedgerDatasource {

    abstract pullPaymentLedger(params: FilterWithPaginationPaymentLedger, signal?: AbortSignal): Promise<PaymentLedgerListResponse>;
    abstract pullPaymentLedgerSummary(params: FilterWithPaginationPaymentLedger, signal?: AbortSignal): Promise<PaymentLedgerSummaryListResponse>;
    abstract addUpdatePaymentLedger(data: FormData): Promise<PaymentLedgerSummaryListResponse>;
    abstract deletePaymentLedger(params: DeletePaymentLedgerRequest): Promise<PaymentLedgerDeleteResponse>;
}

export class PaymentLedgerDatasourceImpl implements PaymentLedgerDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPaymentLedger(params: FilterWithPaginationPaymentLedger, signal?: AbortSignal): Promise<PaymentLedgerListResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.PaymentFor) queryParams.append("PaymentFor", params.PaymentFor);
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentLedgerApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response;

        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT LEDGER SUMMARY:", error);

            if (error instanceof TokenExpiredException) {
                return await this.pullPaymentLedger(params);
            }

            throw error;
        }
    }


    async pullPaymentLedgerSummary(params: FilterWithPaginationPaymentLedger, signal?: AbortSignal): Promise<PaymentLedgerSummaryListResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.PaymentFor) queryParams.append("PaymentFor", params.PaymentFor);
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentLedgerApi.PULL_SUMMARY}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT LEDGER :", error);

            if (error instanceof TokenExpiredException) {
                return await this.pullPaymentLedgerSummary(params);
            }
            throw error;
        }
    }

    async addUpdatePaymentLedger(formData: FormData): Promise<PaymentLedgerSummaryListResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                PaymentLedgerApi.ADD_UPDATE,
                formData
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE PAYMENT LEDGER :", error);

            if (error instanceof TokenExpiredException) {
                return await this.addUpdatePaymentLedger(formData);
            }
            throw error;
        }
    }

    async deletePaymentLedger(params: DeletePaymentLedgerRequest): Promise<PaymentLedgerDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                PayTrackPaymentLedgerId: (params.PayTrackPaymentLedgerId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PaymentLedgerApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            console.error("ERROR: DELETE PAYMENT LEDGER :", error);
            
            if (error instanceof TokenExpiredException) {
                return await this.deletePaymentLedger(params);
            }
            throw error;
        }
    }





}


