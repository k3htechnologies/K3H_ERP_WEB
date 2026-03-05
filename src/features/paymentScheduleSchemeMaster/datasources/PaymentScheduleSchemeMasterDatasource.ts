import baseClient from "@/core/config/baseClient";
import type { AddUpdatePaymentScheduleSchemeMasterRequest, DeletePaymentScheduleSchemeMasterRequest, FilterWithPaginationPaymentScheduleSchemeMaster, PaymentScheduleSchemeMasterDeleteResponse, PaymentScheduleSchemeMasterListResponse, PaymentScheduleSchemeMasterSaveReponse } from "../models/PaymentScheduleSchemeMasterModel";
import { PaymentScheduleSchemeMasterApi } from "@/features/paymentScheduleSchemeMaster/api/PaymentScheduleSchemeMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class PaymentScheduleSchemeMasterDatasource {
    abstract pullPaymentScheduleSchemeMaster(params: FilterWithPaginationPaymentScheduleSchemeMaster, signal?: AbortSignal): Promise<PaymentScheduleSchemeMasterListResponse>;
    abstract addUpdatePaymentScheduleSchemeMaster(payload: AddUpdatePaymentScheduleSchemeMasterRequest): Promise<PaymentScheduleSchemeMasterSaveReponse>;
    abstract deletePaymentScheduleSchemeMaster(params: DeletePaymentScheduleSchemeMasterRequest): Promise<PaymentScheduleSchemeMasterDeleteResponse>;
}

export class PaymentScheduleSchemeMasterDatasourceImpl implements PaymentScheduleSchemeMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPaymentScheduleSchemeMaster(params: FilterWithPaginationPaymentScheduleSchemeMaster, signal?: AbortSignal): Promise<PaymentScheduleSchemeMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.PaymentScheduleSchemeMasterId) queryParams.append('PaymentScheduleSchemeMasterId', params.PaymentScheduleSchemeMasterId.toString());
            if (params.PaymentScheduleScheme?.trim()) queryParams.append('PaymentScheduleScheme', params.PaymentScheduleScheme.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${PaymentScheduleSchemeMasterApi.PULL}?${queryParams.toString()}`, { signal })

            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PAYMENT SCHEDULE SCHEME MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullPaymentScheduleSchemeMaster(params);
            }

            throw error
        }
    }
    async addUpdatePaymentScheduleSchemeMaster(params: AddUpdatePaymentScheduleSchemeMasterRequest): Promise<PaymentScheduleSchemeMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                PaymentScheduleSchemeMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PAYMENT SCHEDULE SCHEME MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdatePaymentScheduleSchemeMaster(params);
            }
            throw error
        }
    }

    async deletePaymentScheduleSchemeMaster(params: DeletePaymentScheduleSchemeMasterRequest): Promise<PaymentScheduleSchemeMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                PaymentScheduleSchemeMasterId: (params.PaymentScheduleSchemeMasterId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PaymentScheduleSchemeMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PAYMENT SCHEDULE SCHEME MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deletePaymentScheduleSchemeMaster(params);

            }

            throw error
        }
    }

}


