import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { DeleteProjectLandRequest, DeleteProjectLandResponse, FilterWithPaginationProjectLandRequest, ProjectLandListResponse, ProjectLandSaveResponse } from "../models/ProjectLandModel";
import { ProjectLandApi } from "../api/ProjectLandApi";

export abstract class ProjectLandDatasource {
    abstract pullProjectLand(params: FilterWithPaginationProjectLandRequest, signal?: AbortSignal): Promise<ProjectLandListResponse>;
    abstract addUpdateProjectLand(data: FormData): Promise<ProjectLandSaveResponse>;
    abstract deleteProjectLand(params: DeleteProjectLandRequest): Promise<DeleteProjectLandResponse>;
}

export class ProjectLandDatasourceImpl implements ProjectLandDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullProjectLand(params: FilterWithPaginationProjectLandRequest, signal?: AbortSignal): Promise<ProjectLandListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectLandId) queryParams.append('ProjectLandId', params.ProjectLandId.toString());
            if (params.ContactPersonName?.trim()) queryParams.append("ContactPersonName", params.ContactPersonName.trim());
            if (params.ContactPersonMobile?.trim()) queryParams.append("ContactPersonMobile", params.ContactPersonMobile.trim());
            if (params.LandOwnerName?.trim()) queryParams.append("LandOwnerName", params.LandOwnerName.trim());
            if (params.LandAddress?.trim()) queryParams.append("LandAddress", params.LandAddress.trim());
            if (params.PinCode?.trim()) queryParams.append("PinCode", params.PinCode.trim());
            if (params.PlotNumber?.trim()) queryParams.append("PlotNumber", params.PlotNumber.trim());
            if (params.WardNumberZone?.trim()) queryParams.append("WardNumberZone", params.WardNumberZone.trim());
            if (params.PlotShape?.trim()) queryParams.append("PlotShape", params.PlotShape.trim());
            if (params.LandOwnershipType?.trim()) queryParams.append("LandOwnershipType", params.LandOwnershipType.trim());
            if (params.FromDate?.trim()) queryParams.append("FromDate", params.FromDate.trim());
            if (params.ToDate?.trim()) queryParams.append("ToDate", params.ToDate.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectLandApi.PULL_PROJECT_LAND}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT LAND:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullProjectLand(params);
            }
            throw error
        }
    }

    async addUpdateProjectLand(data: FormData): Promise<ProjectLandSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ProjectLandApi.ADD_UPDATE_PROJECT_LAND,
                data
            )
            return response

        } catch (error) {

            console.error('ERROR : ADD UPDATE PROJECT LAND :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateProjectLand(data);
            }
            throw error
        }
    }

    async deleteProjectLand(params: DeleteProjectLandRequest): Promise<DeleteProjectLandResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectLandId: (params.ProjectLandId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectLandApi.DELETE_PROJECT_LAND}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error("ERROR : DELETE PROJECT LAND:", error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteProjectLand(params);
            }
            throw error
        }
    }
}