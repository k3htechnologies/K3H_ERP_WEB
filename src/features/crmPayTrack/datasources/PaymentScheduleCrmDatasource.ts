import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { FilterWithPaginationPaymentScheduleCrm, PaymentScheduleCrmListResponse } from "@/features/crmPayTrack/models/PaymentScheduleCrmModel";

import { PaymentScheduleCrmApi } from "@/features/crmPayTrack/api/PaymentScheduleCrmApi";

export abstract class PaymentScheduleCrmDatasource {
    abstract pullPaymentScheduleCrm(params: FilterWithPaginationPaymentScheduleCrm, signal?: AbortSignal): Promise<PaymentScheduleCrmListResponse>;
}

export class PaymentScheduleCrmDatasourceImpl implements PaymentScheduleCrmDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPaymentScheduleCrm(params: FilterWithPaginationPaymentScheduleCrm, signal?: AbortSignal): Promise<PaymentScheduleCrmListResponse> {
        try {
            const queryParams = new URLSearchParams({
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentScheduleCrmApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT SCHEDULE CRM :", error);

            if (error instanceof TokenExpiredException) {
              return  await this.pullPaymentScheduleCrm(params);
            }
            throw error;
        }
    }

}


