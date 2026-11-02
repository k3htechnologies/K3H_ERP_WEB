import baseClient from "@/core/config/baseClient";
import type { DeleteBaselineCostPlanDocumentRequest, FilterWithPaginationBaselineCostPlanDocument, BaselineCostPlanDocumentDeleteResponse, BaselineCostPlanDocumentListResponse, BaselineCostPlanDocumentSaveReponse } from "@/features/baselineCostPlanDocument/models/BaselineCostPlanDocumentModel";
import { BaselineCostPlanDocumentApi } from "@/features/baselineCostPlanDocument/api/BaselineCostPlanDocumentApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class BaselineCostPlanDocumentDatasource {
    abstract pullBaselineCostPlanDocument(params: FilterWithPaginationBaselineCostPlanDocument, signal?: AbortSignal): Promise<BaselineCostPlanDocumentListResponse>;
    abstract addUpdateBaselineCostPlanDocument(formData: FormData): Promise<BaselineCostPlanDocumentSaveReponse>;
    abstract deleteBaselineCostPlanDocument(params: DeleteBaselineCostPlanDocumentRequest): Promise<BaselineCostPlanDocumentDeleteResponse>;
}

export class BaselineCostPlanDocumentDatasourceImpl implements BaselineCostPlanDocumentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullBaselineCostPlanDocument(params: FilterWithPaginationBaselineCostPlanDocument, signal?: AbortSignal): Promise<BaselineCostPlanDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', String(params.ProjectId));
            if (params.BaselineCostPlanDocumentId) queryParams.append('BaselineCostPlanDocumentId', params.BaselineCostPlanDocumentId.toString());
            if (params.BaselineCostPlanDocumentCategoryId) queryParams.append('BaselineCostPlanDocumentCategoryId', params.BaselineCostPlanDocumentCategoryId.toString());
            if (params.BaselineCostPlanDocumentName?.trim()) queryParams.append('BaselineCostPlanDocumentName', params.BaselineCostPlanDocumentName.trim());
            if (params.BaselineCostPlanDocumentCategory?.trim()) queryParams.append('BaselineCostPlanDocumentCategory', params.BaselineCostPlanDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BaselineCostPlanDocumentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL TEST DOCUMENT :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullBaselineCostPlanDocument(params);
            }

            throw error
        }
    }
    async addUpdateBaselineCostPlanDocument(formData: FormData): Promise<BaselineCostPlanDocumentSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                BaselineCostPlanDocumentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE TEST DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateBaselineCostPlanDocument(formData);
            }
            throw error
        }
    }

    async deleteBaselineCostPlanDocument(params: DeleteBaselineCostPlanDocumentRequest): Promise<BaselineCostPlanDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                BaselineCostPlanDocumentId: (params.BaselineCostPlanDocumentId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                projectId: (params.projectId ?? 0).toString(),
                BaselineCostPlanDocumentCategoryId: (params.BaselineCostPlanDocumentCategoryId ?? 0).toString(),

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${BaselineCostPlanDocumentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE TEST DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteBaselineCostPlanDocument(params);

            }

            throw error
        }
    }

}