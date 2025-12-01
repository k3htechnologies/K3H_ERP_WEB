import baseClient from "@/core/config/baseClient";
import type { AddUpdateUomMasterRequest, DeleteUomMasterRequest, FilterWithPaginationUomMaster, UomMasterDeleteResponse, UomMasterListResponse, UomMasterSaveReponse } from "../models/UomMasterModel";
import { UomMasterApi } from "@/features/uomMaster/api/UOMMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class UomMasterDatasource {
    abstract pullUomMaster(params: FilterWithPaginationUomMaster, signal?: AbortSignal): Promise<UomMasterListResponse>;
    abstract addUpdateUomMaster(payload: AddUpdateUomMasterRequest): Promise<UomMasterSaveReponse>;
    abstract deleteUomMaster(params: DeleteUomMasterRequest): Promise<UomMasterDeleteResponse>;
}

export class UomMasterDatasourceImpl implements UomMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullUomMaster(params: FilterWithPaginationUomMaster, signal?: AbortSignal): Promise<UomMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.UomMasterId) queryParams.append('UomMasterId', params.UomMasterId.toString());
            if (params.UomName?.trim()) queryParams.append('UomName', params.UomName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${UomMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL UOM MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullUomMaster(params);
            }

            throw error
        }
    }
    async addUpdateUomMaster(params: AddUpdateUomMasterRequest): Promise<UomMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                UomMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE UOM MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateUomMaster(params);
            }
            throw error
        }
    }

    async deleteUomMaster(params: DeleteUomMasterRequest): Promise<UomMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                UomMasterId: (params.UomMasterId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${UomMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE UOM MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteUomMaster(params);

            }

            throw error
        }
    }

}