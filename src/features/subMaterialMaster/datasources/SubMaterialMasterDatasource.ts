import baseClient from "@/core/config/baseClient";
import type { AddUpdateSubMaterialMasterRequest, DeleteSubMaterialMasterRequest, FilterWithPaginationSubMaterialMaster, SubMaterialMasterDeleteResponse, SubMaterialMasterListResponse, SubMaterialMasterSaveReponse } from "../models/SubMaterialMasterModel";
import { SubMaterialMasterApi } from "@/features/subMaterialMaster/api/SubMaterialMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class SubMaterialMasterDatasource {
    abstract pullSubMaterialMaster(params: FilterWithPaginationSubMaterialMaster, signal?: AbortSignal): Promise<SubMaterialMasterListResponse>;
    abstract addUpdateSubMaterialMaster(payload: AddUpdateSubMaterialMasterRequest): Promise<SubMaterialMasterSaveReponse>;
    abstract deleteSubMaterialMaster(params: DeleteSubMaterialMasterRequest): Promise<SubMaterialMasterDeleteResponse>;
}

export class SubMaterialMasterDatasourceImpl implements SubMaterialMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullSubMaterialMaster(params: FilterWithPaginationSubMaterialMaster, signal?: AbortSignal): Promise<SubMaterialMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.MaterialName?.trim()) queryParams.append('MaterialName', params.MaterialName.trim());
            if (params.SubMaterialMasterId) queryParams.append('SubMaterialMasterId', params.SubMaterialMasterId.toString());
            if (params.SubMaterialName?.trim()) queryParams.append('SubMaterialName', params.SubMaterialName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SubMaterialMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL SUB MATERIAL MASTER :', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullSubMaterialMaster(params);
            }

            throw error
        }
    }
    async addUpdateSubMaterialMaster(params: AddUpdateSubMaterialMasterRequest): Promise<SubMaterialMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                SubMaterialMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE SUB MATERIAL MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return  await this.addUpdateSubMaterialMaster(params);
            }
            throw error
        }
    }

    async deleteSubMaterialMaster(params: DeleteSubMaterialMasterRequest): Promise<SubMaterialMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                SubMaterialMasterId: (params.SubMaterialMasterId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${SubMaterialMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE SUB MATERIAL MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteSubMaterialMaster(params);

            }

            throw error
        }
    }

}