import baseClient from "@/core/config/baseClient";
import type { DeleteProjectRERADocumentRequest, FilterWithPaginationProjectRERADocument, ProjectRERADocumentDeleteResponse, ProjectRERADocumentListResponse, ProjectRERADocumentSaveReponse } from "@/features/projectRERADocument/models/ProjectRERADocumentModel";
import { ProjectRERADocumentApi } from "@/features/projectRERADocument/api/ProjectRERADocumentApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ProjectRERADocumentDatasource {
    abstract pullProjectRERADocument(params: FilterWithPaginationProjectRERADocument, signal?: AbortSignal): Promise<ProjectRERADocumentListResponse>;
    abstract addUpdateProjectRERADocument(formData: FormData): Promise<ProjectRERADocumentSaveReponse>;
    abstract deleteProjectRERADocument(params: DeleteProjectRERADocumentRequest): Promise<ProjectRERADocumentDeleteResponse>;
}

export class ProjectRERADocumentDatasourceImpl implements ProjectRERADocumentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullProjectRERADocument(params: FilterWithPaginationProjectRERADocument, signal?: AbortSignal): Promise<ProjectRERADocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectRERADocumentId) queryParams.append('ProjectRERADocumentId', params.ProjectRERADocumentId.toString());
            if (params.ProjectRERADocumentCategoryId) queryParams.append('ProjectRERADocumentCategoryId', params.ProjectRERADocumentCategoryId.toString());
            if (params.ProjectRERADocumentName?.trim()) queryParams.append('ProjectRERADocumentName', params.ProjectRERADocumentName.trim());
            if (params.ProjectRERADocumentCategory?.trim()) queryParams.append('ProjectRERADocumentCategory', params.ProjectRERADocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectRERADocumentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT RERA DOCUMENT :', error);

            if (error === TokenExpiredException) {
                await this.pullProjectRERADocument(params);
            }

            throw error
        }
    }
    async addUpdateProjectRERADocument(formData: FormData): Promise<ProjectRERADocumentSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ProjectRERADocumentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT RERA DOCUMENT :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectRERADocument(formData);
            }
            throw error
        }
    }

    async deleteProjectRERADocument(params: DeleteProjectRERADocumentRequest): Promise<ProjectRERADocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectRERADocumentId: (params.ProjectRERADocumentId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                projectId: (params.projectId ?? 0).toString(),
                ProjectRERADocumentCategoryId: (params.ProjectRERADocumentCategoryId ?? 0).toString(),

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectRERADocumentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PROJECT RERA DOCUMENT :', error)

            if (error === TokenExpiredException) {

                await this.deleteProjectRERADocument(params);

            }

            throw error
        }
    }

}