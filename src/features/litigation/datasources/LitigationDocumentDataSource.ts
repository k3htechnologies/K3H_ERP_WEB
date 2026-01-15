import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    FilterWithPaginationLitigationDocumentRequest,
    LitigationDocumentListResponse,
    LitigationDocumentSaveResponse,
    LitigationDocumentDeleteResponse,
    DeleteLitigationDocumentRequest,

}from "@/features/litigation/models/LitigationDocumentModel";

import { LitigationDocumentApi } from "@/features/litigation/api/LitigationDocumentApi";

export abstract class LitigationDocumentDatasource {
    abstract pullLitigationDocument(params: FilterWithPaginationLitigationDocumentRequest, signal?: AbortSignal): Promise<LitigationDocumentListResponse>;
    abstract addUpadateLitigationDocument(data: FormData): Promise<LitigationDocumentSaveResponse>;
    abstract deleteLitigationDocument(params: DeleteLitigationDocumentRequest): Promise<LitigationDocumentDeleteResponse>;
}

export class LitigationDocumentDatasourceImpl implements LitigationDocumentDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullLitigationDocument(params: FilterWithPaginationLitigationDocumentRequest, signal?: AbortSignal): Promise<LitigationDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })
            if (params.LitigationDocumentId) queryParams.append('LitigationDocumentId', params.LitigationDocumentId.toString());
            if (params.LitigationId) queryParams.append('LitigationId', params.LitigationId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.DocumentName?.trim()) queryParams.append('DocumentName', params.DocumentName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LitigationDocumentApi.PULL_DOCUMENT}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LITIGATION DOCUMENT :', error);

            if (error === TokenExpiredException) {
                await this.pullLitigationDocument(params);
            }

            throw error
        }
    }
    async addUpadateLitigationDocument(formData: FormData): Promise<LitigationDocumentSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                LitigationDocumentApi.ADD_UPDATE_DOCUMENT,
                formData
            )
            return response

        } catch (error) {

            console.error('ERROR:ADD UPDATE LITIGATION DOCUMENT :', error)

            if (error === TokenExpiredException) {
                await this.addUpadateLitigationDocument(formData);
            }
            throw error
        }
    }

    async deleteLitigationDocument(params: DeleteLitigationDocumentRequest): Promise<LitigationDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                LitigationDocumentId: (params.LitigationDocumentId ?? 0).toString(),
                LitigationId: (params.LitigationId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${LitigationDocumentApi.DELETE_DOCUMENT}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE LITIGATION DOCUMENT :', error)

            if (error === TokenExpiredException) {

                await this.deleteLitigationDocument(params);
            }

            throw error
        }
    }

}

