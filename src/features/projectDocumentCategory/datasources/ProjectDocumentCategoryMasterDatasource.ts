import baseClient from "@/core/config/baseClient";
import type { AddUpdateProjectDocumentCategoryMasterRequest, DeleteProjectDocumentCategoryMasterRequest, FilterWithPaginationProjectDocumentCategoryMaster, ProjectDocumentCategoryMasterDeleteResponse, ProjectDocumentCategoryMasterListResponse, ProjectDocumentCategoryMasterSaveReponse } from "../models/ProjectDocumentCategoryMasterModel";
import { ProjectDocumentCategoryMasterApi } from "@/features/projectDocumentCategory/api/ProjectDocumentCategoryMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ProjectDocumentCategoryMasterDatasource {
    abstract pullProjectDocumentCategoryMaster(params: FilterWithPaginationProjectDocumentCategoryMaster, signal?: AbortSignal): Promise<ProjectDocumentCategoryMasterListResponse>;
    abstract addUpdateProjectDocumentCategoryMaster(payload: AddUpdateProjectDocumentCategoryMasterRequest): Promise<ProjectDocumentCategoryMasterSaveReponse>;
    abstract deleteProjectDocumentCategoryMaster(params: DeleteProjectDocumentCategoryMasterRequest): Promise<ProjectDocumentCategoryMasterDeleteResponse>;
}

export class ProjectDocumentCategoryMasterDatasourceImpl implements ProjectDocumentCategoryMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullProjectDocumentCategoryMaster(params: FilterWithPaginationProjectDocumentCategoryMaster, signal?: AbortSignal): Promise<ProjectDocumentCategoryMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectDocumentCategoryId) queryParams.append('ProjectDocumentCategoryId', params.ProjectDocumentCategoryId.toString());
            if (params.ProjectDocumentCategory?.trim()) queryParams.append('ProjectDocumentCategory', params.ProjectDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectDocumentCategoryMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT DOCUMENT CATEGORY MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullProjectDocumentCategoryMaster(params);
            }

            throw error
        }
    }
    async addUpdateProjectDocumentCategoryMaster(params: AddUpdateProjectDocumentCategoryMasterRequest): Promise<ProjectDocumentCategoryMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProjectDocumentCategoryMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT DOCUMENT CATEGORY MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectDocumentCategoryMaster(params);
            }
            throw error
        }
    }

    async deleteProjectDocumentCategoryMaster(params: DeleteProjectDocumentCategoryMasterRequest): Promise<ProjectDocumentCategoryMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectDocumentCategoryId: (params.ProjectDocumentCategoryId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectDocumentCategoryMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PROJECT DOCUMENT CATEGORY MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteProjectDocumentCategoryMaster(params);

            }

            throw error
        }
    }

}