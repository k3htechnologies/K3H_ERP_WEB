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

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectProfessionalDetailsApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT PROFESSIONAL DETAILS:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullprojectProfessionalDetails(params);
            }
            throw error
        }
    }

    async addUpdateprojectProfessionalDetails(data: AddUpdateProjectProfessionalDetails): Promise<ProjectProfessionalDetailsSaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProjectProfessionalDetailsApi.ADD_UPDATE,
                data
            )
            return response
        } catch (error: any) {

            console.error('ERROR : ADD UPDATE PROJECT PROFESSIONAL DETAILS:', error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateprojectProfessionalDetails(data);
            }
            throw error
        }
    }

    async deleteProjectProfessionalDetails(params: DeleteProjectProfessionalDetailsRequest): Promise<ProjectProfessionalDetailsResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectProfessionalDetailsApi.DELETE}${queryParams.toString()}`
            )
            return response
        } catch (error: any) {

            console.error('ERROR: DELETE PROJECT PROFESSIONAL DETAILS: ', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteProjectProfessionalDetails(params);
            }
            throw error
        }
    }
}