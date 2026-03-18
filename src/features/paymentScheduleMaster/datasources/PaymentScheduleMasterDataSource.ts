
import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    PaymentScheduleMasterDeleteResponse,
    PaymentScheduleMasterListResponse,
    DeletePaymentScheduleMasterRequest,
    FilterWithPaginationPaymentScheduleMasterRequest,
    AddUpdatePaymentScheduleMasterRequest,

} from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import { PaymentScheduleMasterApi } from "@/features/paymentScheduleMaster/api/PaymentScheduleMasterApi";

export abstract class PaymentScheduleMasterDatasource {

    abstract pullPaymentScheduleMaster(params: FilterWithPaginationPaymentScheduleMasterRequest, signal?: AbortSignal): Promise<PaymentScheduleMasterListResponse>;
    abstract addUpdatePaymentScheduleMaster(data: AddUpdatePaymentScheduleMasterRequest): Promise<PaymentScheduleMasterListResponse>;
    abstract deletePaymentScheduleMaster(params: DeletePaymentScheduleMasterRequest): Promise<PaymentScheduleMasterDeleteResponse>;

}

export class PaymentScheduleMasterDatasourceImpl implements PaymentScheduleMasterDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPaymentScheduleMaster(params: FilterWithPaginationPaymentScheduleMasterRequest, signal?: AbortSignal): Promise<PaymentScheduleMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.InventoryBuildingId) queryParams.append("InventoryBuildingId", params.InventoryBuildingId.toString());
             if (params.InventoryFlatFloorBasementPodiumWingId) queryParams.append("InventoryFlatFloorBasementPodiumWingId", params.InventoryFlatFloorBasementPodiumWingId.toString());
            if (params.PaymentScheduleMasterId) queryParams.append("PaymentScheduleMasterId", params.PaymentScheduleMasterId.toString());
            if (params.PaymentScheduleSchemeMasterId) queryParams.append("PaymentScheduleSchemeMasterId", params.PaymentScheduleSchemeMasterId.toString());
            if (params.Stage) queryParams.append('Stage', params.Stage.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentScheduleMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT SCHEDULE MASTER :", error);

            if (error === TokenExpiredException) {

                await this.pullPaymentScheduleMaster(params);
            }
            throw error;
        }
    }

    async addUpdatePaymentScheduleMaster(params: AddUpdatePaymentScheduleMasterRequest): Promise<PaymentScheduleMasterListResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                PaymentScheduleMasterApi.ADD_UPDATE,
                params
            );

            return response;
        } catch (error) {
            console.error('ERROR: ADD UPDATE PAYMENT SCHEDULE MASTER:', error);
            if (error === TokenExpiredException) {
                await this.addUpdatePaymentScheduleMaster(params);
            }
            throw error;
        }
    }

    async deletePaymentScheduleMaster(params: DeletePaymentScheduleMasterRequest): Promise<PaymentScheduleMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                PaymentScheduleMasterId: (params.PaymentScheduleMasterId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PaymentScheduleMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE PAYMENT SCHEDULE MASTER:', error);

                await this.deletePaymentScheduleMaster(params);
            }
            throw error
        }
    }
}
