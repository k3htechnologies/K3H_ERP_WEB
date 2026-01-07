import baseClient from "@/core/config/baseClient";
import type { DeleteProjectDocumentRequest, FilterWithPaginationProjectDocument, ProjectDocumentDeleteResponse, ProjectDocumentListResponse, ProjectDocumentSaveReponse } from "@/features/projectDocument/models/ProjectDocumentModel";
import { ProjectDocumentApi } from "@/features/projectDocument/api/ProjectDocumentApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ProjectDocumentDatasource {
    abstract pullProjectDocument(params: FilterWithPaginationProjectDocument, signal?: AbortSignal): Promise<ProjectDocumentListResponse>;
    abstract addUpdateProjectDocument(formData: FormData): Promise<ProjectDocumentSaveReponse>;
    abstract deleteProjectDocument(params: DeleteProjectDocumentRequest): Promise<ProjectDocumentDeleteResponse>;
}

export class ProjectDocumentDatasourceImpl implements ProjectDocumentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullProjectDocument(params: FilterWithPaginationProjectDocument, signal?: AbortSignal): Promise<ProjectDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', String(params.ProjectId));
            if (params.ProjectDocumentId) queryParams.append('ProjectDocumentId', params.ProjectDocumentId.toString());
            if (params.ProjectDocumentCategoryId) queryParams.append('ProjectDocumentCategoryId', params.ProjectDocumentCategoryId.toString());
            if (params.ProjectDocumentName?.trim()) queryParams.append('ProjectDocumentName', params.ProjectDocumentName.trim());
            if (params.ProjectDocumentStatus?.trim()) queryParams.append('ProjectDocumentStatus', params.ProjectDocumentStatus.trim());
            if (params.ProjectDocumentCategory?.trim()) queryParams.append('ProjectDocumentCategory', params.ProjectDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectDocumentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT DOCUMENT :', error);

            if (error === TokenExpiredException) {
                await this.pullProjectDocument(params);
            }

            throw error
        }
    }
    async addUpdateProjectDocument(formData: FormData): Promise<ProjectDocumentSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ProjectDocumentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT DOCUMENT :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectDocument(formData);
            }
            throw error
        }
    }

    async deleteProjectDocument(params: DeleteProjectDocumentRequest): Promise<ProjectDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectDocumentId: (params.ProjectDocumentId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                projectId: (params.projectId ?? 0).toString(),
                ProjectDocumentCategoryId: (params.ProjectDocumentCategoryId ?? 0).toString(),

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectDocumentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PROJECT DOCUMENT :', error)

            if (error === TokenExpiredException) {

                await this.deleteProjectDocument(params);

            }

            throw error
        }
    }

}