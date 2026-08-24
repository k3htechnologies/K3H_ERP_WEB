import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { ProjectRedevelopmentApi } from "../api/ProjectRedevelopmentApi";
import type { DeleteProjectRedevelopmentRequest, DeleteProjectRedevelopmentResponse, FilterWithPaginationProjectRedevelopmentRequest, ProjectRedevelopmentListResponse, ProjectRedevelopmentSaveResponse } from "../models/ProjectRedevelopmentModel";

export abstract class ProjectRedevelopmentDatasource {
    abstract pullProjectRedevelopment(params: FilterWithPaginationProjectRedevelopmentRequest, signal?: AbortSignal): Promise<ProjectRedevelopmentListResponse>;
    abstract addUpdateProjectRedevelopment(data: FormData): Promise<ProjectRedevelopmentSaveResponse>;
    abstract deleteProjectRedevelopment(params: DeleteProjectRedevelopmentRequest): Promise<DeleteProjectRedevelopmentResponse>
}

export class ProjectRedevelopmentDatasourceImpl implements ProjectRedevelopmentDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullProjectRedevelopment(params: FilterWithPaginationProjectRedevelopmentRequest, signal?: AbortSignal): Promise<ProjectRedevelopmentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectRedevelopmentId) queryParams.append('ProjectRedevelopmentId', params.ProjectRedevelopmentId.toString());
            if (params.BuildingName?.trim()) queryParams.append("BuildingName", params.BuildingName.trim());
            if (params.BuildingAddress?.trim()) queryParams.append("BuildingAddress", params.BuildingAddress.trim());
            if (params.ContactPersonName?.trim()) queryParams.append("ContactPersonName", params.ContactPersonName.trim());
            if (params.ContactPersonMobile?.trim()) queryParams.append("ContactPersonMobile", params.ContactPersonMobile.trim());
            if (params.PinCode?.trim()) queryParams.append("PinCode", params.PinCode.trim());
            if (params.PlotNumber?.trim()) queryParams.append("PlotNumber", params.PlotNumber.trim());
            if (params.WardNumberZone?.trim()) queryParams.append("WardNumberZone", params.WardNumberZone.trim());
            if (params.ExistingBuildingType?.trim()) queryParams.append("ExistingBuildingType", params.ExistingBuildingType.trim());
            if (params.ConstructionType?.trim()) queryParams.append("ConstructionType", params.ConstructionType.trim());
            if (params.TypeOfLandTenure?.trim()) queryParams.append("TypeOfLandTenure", params.TypeOfLandTenure.trim());
            if (params.FromDate?.trim()) queryParams.append("FromDate", params.FromDate.trim());
            if (params.ToDate?.trim()) queryParams.append("ToDate", params.ToDate.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectRedevelopmentApi.PULL_PROJECT_REDEVELOPMENT}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT REDEVELOPMENT:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullProjectRedevelopment(params);
            }
            throw error
        }
    }

    async addUpdateProjectRedevelopment(data: FormData): Promise<ProjectRedevelopmentSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ProjectRedevelopmentApi.ADD_UPDATE_PROJECT_REDEVELOPMENT,
                data
            )
            return response

        } catch (error) {

            console.error('ERROR : ADD UPDATE  PROJECT REDEVELOPMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateProjectRedevelopment(data);
            }
            throw error
        }
    }

    async deleteProjectRedevelopment(params: DeleteProjectRedevelopmentRequest): Promise<DeleteProjectRedevelopmentResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectRedevelopmentId: (params.ProjectRedevelopmentId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectRedevelopmentApi.DELETE_PROJECT_REDEVELOPMENT}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error("ERROR : DELETE PROJECT REDEVELOPMENT:", error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteProjectRedevelopment(params);
            }
            throw error
        }
    }
}