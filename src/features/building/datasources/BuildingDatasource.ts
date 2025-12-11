import baseClient from '@/core/config/baseClient'
import { BuildingApi } from '@/features/building/api/BuildingApi'
import type {
    FilterWithPaginationBuildingRequest,
    AddUpdateBuildingRequest,
    BuildingListResponse,
    DeleteBuildingRequest,
    BuildingDeleteResponse,
} from '@/features/building/models/BuildingModel'

export abstract class BuildingDatasource {

    abstract pullBuilding(params: FilterWithPaginationBuildingRequest): Promise<BuildingListResponse>;
    abstract addUpdateBuilding(data: AddUpdateBuildingRequest): Promise<BuildingListResponse>;
    abstract deleteBuilding(params: DeleteBuildingRequest): Promise<BuildingDeleteResponse>;
}

export class BuildingDatasourceImpl implements BuildingDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullBuilding(params: FilterWithPaginationBuildingRequest): Promise<BuildingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString());
            if (params.BuildingName?.trim()) queryParams.append('BuildingName', params.BuildingName.trim());
            if (params.CTSNumber?.trim()) queryParams.append('CTSNumber', params.CTSNumber.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BuildingApi.PULL}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull BUILDING:', error);
            throw error
        }
    }

    async addUpdateBuilding(params: AddUpdateBuildingRequest): Promise<BuildingListResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BuildingApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update BUILDING:', error)
            throw error
        }
    }

    async deleteBuilding(params: DeleteBuildingRequest): Promise<BuildingDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                BuildingId: (params.BuildingId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${BuildingApi.DELETE}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE BUILDING:', error)
            throw error
        }
    }

}
