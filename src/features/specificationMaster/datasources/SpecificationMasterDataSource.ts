import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { SpecificationMasterApi } from "@/features/specificationMaster/api/SpecificationMasterApi";
import type { AddUpdateSpecificationMaster, DeleteSpecificationMasterRequest, DeleteSpecificationMasterResponse, filterwithPaginationSpecificationMasterRequest, SpecificationMasterListResponse, SpecificationMasterSaveResponse } from "@/features/specificationMaster/models/SpecificationMasterModel";

export abstract class SpecificationMasterDatasource {
    abstract pullSpecificationMaster(params: filterwithPaginationSpecificationMasterRequest, signal?: AbortSignal): Promise<SpecificationMasterListResponse>;
    abstract addUpdateSpecificationMaster(data: AddUpdateSpecificationMaster): Promise<SpecificationMasterSaveResponse>;
}

export class SpecificationMasterDatasourceImpl implements SpecificationMasterDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullSpecificationMaster(params: filterwithPaginationSpecificationMasterRequest, signal?: AbortSignal): Promise<SpecificationMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.SpecificationMasterId) queryParams.append("SpecificationMasterId", params.SpecificationMasterId.toString());
            if (params.LevelType) queryParams.append("LevelType", params.LevelType.trim());
            if (params.CategoryName) queryParams.append("CategoryName", params.CategoryName.trim());
            if (params.IsCheckPermission) queryParams.append('IsCheckPermission', params.IsCheckPermission.toString());
            if (params.IsExpandChild) queryParams.append('IsExpandChild', params.IsExpandChild.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SpecificationMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL SPECIFICATION MASTER:", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullSpecificationMaster(params);
            }
            throw error;
        }
    }

    async addUpdateSpecificationMaster(data: AddUpdateSpecificationMaster): Promise<SpecificationMasterSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                SpecificationMasterApi.ADD_UPDATE,
                data
            )
            return response

        } catch (error: any) {

            console.log("ERROR: ADD UPDATE SPECIFICATION MASTER", error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateSpecificationMaster(data);
            }
            throw error
        }
    }

    async deleteSpecificationMaster(params: DeleteSpecificationMasterRequest): Promise<DeleteSpecificationMasterResponse> {

        try {
            const queryParams = new URLSearchParams({
                SpecificationMasterId: (params.SpecificationMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? ""
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${SpecificationMasterApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error: any) {

            console.log("ERROR : DELETE SPECIFICATION MASTER", error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteSpecificationMaster(params);
            }
            throw error
        }
    }

}
