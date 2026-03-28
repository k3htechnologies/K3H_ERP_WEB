import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {
    FilterWithPaginationPaymentLedgerCrm, PaymentLedgerCrmListResponse, PaymentLedgerCrmSaveResponse, DeletePaymentLedgerCrmRequest,
    PaymentLedgerCrmDeleteResponse
} from "@/features/crmPayTrackScreen/models/PaymentLedgerCrmModel";

import { PaymentLedgerApi } from "@/features/crmPayTrackScreen/api/PaymentLedgerApi";

export abstract class PaymentLedgerCrmDatasource {
    abstract pullPaymentLedgerCrm(params: FilterWithPaginationPaymentLedgerCrm, signal?: AbortSignal): Promise<PaymentLedgerCrmListResponse>;
    abstract addUpdatePaymentLedgerCrm(data: FormData): Promise<PaymentLedgerCrmSaveResponse>;
    abstract deletePaymentLedgerCrm(params: DeletePaymentLedgerCrmRequest): Promise<PaymentLedgerCrmDeleteResponse>;
}

export class PaymentLedgerCrmDatasourceImpl implements PaymentLedgerCrmDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPaymentLedgerCrm(params: FilterWithPaginationPaymentLedgerCrm, signal?: AbortSignal): Promise<PaymentLedgerCrmListResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentLedgerApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT LEDGER CRM :", error);

            if (error === TokenExpiredException) {
                await this.pullPaymentLedgerCrm(params);
            }
            throw error;
        }
    }

    async addUpdatePaymentLedgerCrm(formData: FormData): Promise<PaymentLedgerCrmSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                PaymentLedgerApi.ADD_UPDATE,
                formData
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE PAYMENT LEDGER CRM :", error);

            if (error instanceof TokenExpiredException) {
                await this.addUpdatePaymentLedgerCrm(formData);
            }
            throw error;
        }
    }

    async deletePaymentLedgerCrm(params: DeletePaymentLedgerCrmRequest): Promise<PaymentLedgerCrmDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                PayTrackPaymentLedgerId: (params.PayTrackPaymentLedgerId ?? 0).toString(),
                BookingId: (params.BookingId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PaymentLedgerApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            if (error === TokenExpiredException) {

                console.error("ERROR: DELETE PAYMENT LEDGER CRM :", error);

                await this.deletePaymentLedgerCrm(params);
            }
            throw error;
        }
    }





}


