import baseClient from "@/core/config/baseClient";
import type { AddUpdateMaterialMasterRequest, DeleteMaterialMasterRequest, FilterWithPaginationMaterialMaster, MaterialMasterDeleteResponse, MaterialMasterListResponse, MaterialMasterSaveReponse } from "@/features/materialMaster/models/MaterialMasterModel";
import { MaterialMasterApi } from "@/features/materialMaster/api/MaterialMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class MaterialMasterDatasource {
    abstract pullMaterialMaster(params: FilterWithPaginationMaterialMaster, signal?: AbortSignal): Promise<MaterialMasterListResponse>;
    abstract addUpdateMaterialMaster(payload: AddUpdateMaterialMasterRequest): Promise<MaterialMasterSaveReponse>;
    abstract deleteMaterialMaster(params: DeleteMaterialMasterRequest): Promise<MaterialMasterDeleteResponse>;
}

export class MaterialMasterDatasourceImpl implements MaterialMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialMaster(params: FilterWithPaginationMaterialMaster, signal?: AbortSignal): Promise<MaterialMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.MaterialMasterId) queryParams.append('MaterialMasterId', params.MaterialMasterId.toString());
            if (params.MaterialName?.trim()) queryParams.append('MaterialName', params.MaterialName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialMaster(params);
            }

            throw error
        }
    }
    async addUpdateMaterialMaster(params: AddUpdateMaterialMasterRequest): Promise<MaterialMasterSaveReponse> {
        try {
            
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                MaterialMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE MATERIAL MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateMaterialMaster(params);
            }
            throw error
        }
    }

    async deleteMaterialMaster(params: DeleteMaterialMasterRequest): Promise<MaterialMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialMasterId: (params.MaterialMasterId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MaterialMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE MATERIAL MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return  await this.deleteMaterialMaster(params);

            }

            throw error
        }
    }

}