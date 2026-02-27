
import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    OtherChargesDeleteResponse,
    OtherChargesListResponse,
    DeleteOtherChargesRequest,
    FilterWithPaginationOtherChargesRequest,
    AddUpdateOtherChargesRequest,
    
} from "@/features/otherCharges/models/OtherChargesModel";
import { OtherChargesApi } from "@/features/otherCharges/api/OtherChargesApi";

export abstract class OtherChargesDatasource {

    abstract pullOtherCharges(params: FilterWithPaginationOtherChargesRequest, signal?: AbortSignal): Promise<OtherChargesListResponse>;
    abstract addUpdateOtherCharges(data: AddUpdateOtherChargesRequest): Promise<OtherChargesListResponse>;
    abstract deleteOtherCharges(params: DeleteOtherChargesRequest): Promise<OtherChargesDeleteResponse>;
}

export class OtherChargesDatasourceImpl implements OtherChargesDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullOtherCharges(params: FilterWithPaginationOtherChargesRequest, signal?: AbortSignal): Promise<OtherChargesListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.ChargeName) queryParams.append('ChargeName', params.ChargeName.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${OtherChargesApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL OTHER CHARGES :", error);

            if (error === TokenExpiredException) {

                await this.pullOtherCharges(params);
            }
            throw error;
        }
    }

    async addUpdateOtherCharges(params: AddUpdateOtherChargesRequest): Promise<OtherChargesListResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                OtherChargesApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD OTHER CHARGES:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateOtherCharges(params);
            }
            throw error
        }
    }

    async deleteOtherCharges(params: DeleteOtherChargesRequest): Promise<OtherChargesDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                OtherChargesId: (params.OtherChargesId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${OtherChargesApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE OTHER CHARGES:', error);

                await this.deleteOtherCharges(params);
            }
            throw error
        }
    }
}
