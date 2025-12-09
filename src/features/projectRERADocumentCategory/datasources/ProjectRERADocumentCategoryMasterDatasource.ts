import baseClient from "@/core/config/baseClient";
import type { AddUpdateProjectRERADocumentCategoryMasterRequest, DeleteProjectRERADocumentCategoryMasterRequest, FilterWithPaginationProjectRERADocumentCategoryMaster, ProjectRERADocumentCategoryMasterDeleteResponse, ProjectRERADocumentCategoryMasterListResponse, ProjectRERADocumentCategoryMasterSaveReponse } from "../models/ProjectRERADocumentCategoryMasterModel";
import { ProjectRERADocumentCategoryMasterApi } from "@/features/projectRERADocumentCategory/api/ProjectRERADocumentCategoryMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ProjectRERADocumentCategoryMasterDatasource {
    abstract pullProjectRERADocumentCategoryMaster(params: FilterWithPaginationProjectRERADocumentCategoryMaster, signal?: AbortSignal): Promise<ProjectRERADocumentCategoryMasterListResponse>;
    abstract addUpdateProjectRERADocumentCategoryMaster(payload: AddUpdateProjectRERADocumentCategoryMasterRequest): Promise<ProjectRERADocumentCategoryMasterSaveReponse>;
    abstract deleteProjectRERADocumentCategoryMaster(params: DeleteProjectRERADocumentCategoryMasterRequest): Promise<ProjectRERADocumentCategoryMasterDeleteResponse>;
}

export class ProjectRERADocumentCategoryMasterDatasourceImpl implements ProjectRERADocumentCategoryMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullProjectRERADocumentCategoryMaster(params: FilterWithPaginationProjectRERADocumentCategoryMaster, signal?: AbortSignal): Promise<ProjectRERADocumentCategoryMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectRERADocumentCategoryId) queryParams.append('ProjectRERADocumentCategoryId', params.ProjectRERADocumentCategoryId.toString());
            if (params.ProjectRERADocumentCategory?.trim()) queryParams.append('ProjectRERADocumentCategory', params.ProjectRERADocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectRERADocumentCategoryMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT RERA DOCUMENT CATEGORY MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullProjectRERADocumentCategoryMaster(params);
            }

            throw error
        }
    }
    async addUpdateProjectRERADocumentCategoryMaster(params: AddUpdateProjectRERADocumentCategoryMasterRequest): Promise<ProjectRERADocumentCategoryMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProjectRERADocumentCategoryMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT RERA DOCUMENT CATEGORY MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectRERADocumentCategoryMaster(params);
            }
            throw error
        }
    }

    async deleteProjectRERADocumentCategoryMaster(params: DeleteProjectRERADocumentCategoryMasterRequest): Promise<ProjectRERADocumentCategoryMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectRERADocumentCategoryId: (params.ProjectRERADocumentCategoryId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectRERADocumentCategoryMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PROJECT RERA DOCUMENT CATEGORY MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteProjectRERADocumentCategoryMaster(params);

            }

            throw error
        }
    }

}