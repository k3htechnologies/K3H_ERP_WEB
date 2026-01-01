import baseClient from "@/core/config/baseClient";
import type { DeleteApprovalDocumentRequest, FilterWithPaginationApprovalDocument, ApprovalDocumentDeleteResponse, ApprovalDocumentListResponse, ApprovalDocumentSaveReponse } from "@/features/approvalDocument/models/ApprovalDocumentModel";
import { ApprovalDocumentApi } from "@/features/approvalDocument/api/ApprovalDocumentApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ApprovalDocumentDatasource {
    abstract pullApprovalDocument(params: FilterWithPaginationApprovalDocument, signal?: AbortSignal): Promise<ApprovalDocumentListResponse>;
    abstract addUpdateApprovalDocument(formData: FormData): Promise<ApprovalDocumentSaveReponse>;
    abstract deleteApprovalDocument(params: DeleteApprovalDocumentRequest): Promise<ApprovalDocumentDeleteResponse>;
}

export class ApprovalDocumentDatasourceImpl implements ApprovalDocumentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullApprovalDocument(params: FilterWithPaginationApprovalDocument, signal?: AbortSignal): Promise<ApprovalDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ApprovalDocumentId) queryParams.append('ApprovalDocumentId', params.ApprovalDocumentId.toString());
            if (params.ApprovalDocumentCategoryId) queryParams.append('ApprovalDocumentCategoryId', params.ApprovalDocumentCategoryId.toString());
            if (params.ApprovalDocumentName?.trim()) queryParams.append('ApprovalDocumentName', params.ApprovalDocumentName.trim());
            if (params.ApprovalDocumentStatus?.trim()) queryParams.append('ApprovalDocumentStatus', params.ApprovalDocumentStatus.trim());
            if (params.ApprovalDocumentCategory?.trim()) queryParams.append('ApprovalDocumentCategory', params.ApprovalDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ApprovalDocumentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL APPROVAL DOCUMENT :', error);

            if (error === TokenExpiredException) {
                await this.pullApprovalDocument(params);
            }

            throw error
        }
    }
    async addUpdateApprovalDocument(formData: FormData): Promise<ApprovalDocumentSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ApprovalDocumentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE APPROVAL DOCUMENT :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateApprovalDocument(formData);
            }
            throw error
        }
    }

    async deleteApprovalDocument(params: DeleteApprovalDocumentRequest): Promise<ApprovalDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ApprovalDocumentId: (params.ApprovalDocumentId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                projectId: (params.projectId ?? 0).toString(),
                ApprovalDocumentCategoryId: (params.ApprovalDocumentCategoryId ?? 0).toString(),

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ApprovalDocumentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE APPROVAL DOCUMENT :', error)

            if (error === TokenExpiredException) {

                await this.deleteApprovalDocument(params);

            }

            throw error
        }
    }

}

