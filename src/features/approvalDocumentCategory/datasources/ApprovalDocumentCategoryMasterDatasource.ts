import baseClient from "@/core/config/baseClient";
import type { AddUpdateApprovalDocumentCategoryMasterRequest, DeleteApprovalDocumentCategoryMasterRequest, FilterWithPaginationApprovalDocumentCategoryMaster, ApprovalDocumentCategoryMasterDeleteResponse, ApprovalDocumentCategoryMasterListResponse, ApprovalDocumentCategoryMasterSaveReponse } from "../models/ApprovalDocumentCategoryMasterModel";
import { ApprovalDocumentCategoryMasterApi } from "@/features/approvalDocumentCategory/api/ApprovalDocumentCategoryMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ApprovalDocumentCategoryMasterDatasource {
    abstract pullApprovalDocumentCategoryMaster(params: FilterWithPaginationApprovalDocumentCategoryMaster, signal?: AbortSignal): Promise<ApprovalDocumentCategoryMasterListResponse>;
    abstract addUpdateApprovalDocumentCategoryMaster(payload: AddUpdateApprovalDocumentCategoryMasterRequest): Promise<ApprovalDocumentCategoryMasterSaveReponse>;
    abstract deleteApprovalDocumentCategoryMaster(params: DeleteApprovalDocumentCategoryMasterRequest): Promise<ApprovalDocumentCategoryMasterDeleteResponse>;
}

export class ApprovalDocumentCategoryMasterDatasourceImpl implements ApprovalDocumentCategoryMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullApprovalDocumentCategoryMaster(params: FilterWithPaginationApprovalDocumentCategoryMaster, signal?: AbortSignal): Promise<ApprovalDocumentCategoryMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ApprovalDocumentCategoryId) queryParams.append('ApprovalDocumentCategoryId', params.ApprovalDocumentCategoryId.toString());
            if (params.ApprovalDocumentCategory?.trim()) queryParams.append('ApprovalDocumentCategory', params.ApprovalDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ApprovalDocumentCategoryMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL APPROVAL DOCUMENT CATEGORY MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullApprovalDocumentCategoryMaster(params);
            }

            throw error
        }
    }
    async addUpdateApprovalDocumentCategoryMaster(params: AddUpdateApprovalDocumentCategoryMasterRequest): Promise<ApprovalDocumentCategoryMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ApprovalDocumentCategoryMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE APPROVAL DOCUMENT CATEGORY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateApprovalDocumentCategoryMaster(params);
            }
            throw error
        }
    }

    async deleteApprovalDocumentCategoryMaster(params: DeleteApprovalDocumentCategoryMasterRequest): Promise<ApprovalDocumentCategoryMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ApprovalDocumentCategoryId: (params.ApprovalDocumentCategoryId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ApprovalDocumentCategoryMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE APPROVAL DOCUMENT CATEGORY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteApprovalDocumentCategoryMaster(params);

            }

            throw error
        }
    }

}


