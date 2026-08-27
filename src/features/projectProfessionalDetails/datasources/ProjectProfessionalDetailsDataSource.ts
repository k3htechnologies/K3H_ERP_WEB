import baseClient from "@/core/config/baseClient";
import type { AddUpdateProjectProfessionalDetails, DeleteProjectProfessionalDetailsRequest, FilterWithPaginationProjectProfessionalDetails, ProjectProfessionalDetailsListResponse, ProjectProfessionalDetailsResponse, ProjectProfessionalDetailsSaveResponse } from "@/features/projectProfessionalDetails/models/ProjectProfessionalDetailsModel";
import { ProjectProfessionalDetailsApi } from "@/features/projectProfessionalDetails/api/ProjectProfessionalDetailsApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ProjectProfessionalDetailsDatasource {
    abstract pullprojectProfessionalDetails(params: FilterWithPaginationProjectProfessionalDetails, signal?: AbortSignal): Promise<ProjectProfessionalDetailsListResponse>;
    abstract addUpdateprojectProfessionalDetails(data: AddUpdateProjectProfessionalDetails): Promise<ProjectProfessionalDetailsSaveResponse>;
    abstract deleteProjectProfessionalDetails(params: DeleteProjectProfessionalDetailsRequest): Promise<ProjectProfessionalDetailsResponse>;
}

export class ProjectProfessionalDetailsDatasourceImpl implements ProjectProfessionalDetailsDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullprojectProfessionalDetails(params: FilterWithPaginationProjectProfessionalDetails, signal?: AbortSignal): Promise<ProjectProfessionalDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.ProjectProfessionalDetailsId) queryParams.append('ProjectProfessionalDetailsId', params.ProjectProfessionalDetailsId.toString());
            if (params.ProfessionalType) queryParams.append("ProfessionalType", params.ProfessionalType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectProfessionalDetailsApi.PULL}?${queryParams.toString()}`, { signal }
            )
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT PROFESSIONAL DETAILS:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullprojectProfessionalDetails(params);
            }
            throw error
        }
    }

    async addUpdateprojectProfessionalDetails(params: AddUpdateProjectProfessionalDetails): Promise<ProjectProfessionalDetailsSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProjectProfessionalDetailsApi.ADD_UPDATE,
                params
            )
        } catch (error: any) {

            console.error('ERROR : ADD UPDATE PROJECT PROFESSIONAL DETAILS:', error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateprojectProfessionalDetails(params);
            }
            throw error
        }
    }

    async deleteProjectProfessionalDetails(params: DeleteProjectProfessionalDetailsRequest): Promise<ProjectProfessionalDetailsResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectProfessionalDetailsId: (params.ProjectProfessionalDetailsId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: (params.Uniquekey ?? 0),
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectProfessionalDetailsApi.DELETE}${queryParams.toString()}`
            )
        } catch (error: any) {

            console.error('ERROR: DELETE PROJECT PROFESSIONAL DETAILS: ', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteProjectProfessionalDetails(params);
            }
            throw error
        }
    }
}