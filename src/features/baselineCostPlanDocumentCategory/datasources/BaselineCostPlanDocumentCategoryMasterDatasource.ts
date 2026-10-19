import baseClient from "@/core/config/baseClient";
import type { AddUpdateBaselineCostPlanDocumentCategoryMasterRequest, DeleteBaselineCostPlanDocumentCategoryMasterRequest, FilterWithPaginationBaselineCostPlanDocumentCategoryMaster, BaselineCostPlanDocumentCategoryMasterDeleteResponse, BaselineCostPlanDocumentCategoryMasterListResponse, BaselineCostPlanDocumentCategoryMasterSaveReponse } from "../models/BaselineCostPlanDocumentCategoryMasterModel";
import { BaselineCostPlanDocumentCategoryMasterApi } from "@/features/baselineCostPlanDocumentCategory/api/BaselineCostPlanDocumentCategoryMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class BaselineCostPlanDocumentCategoryMasterDatasource {
    abstract pullBaselineCostPlanDocumentCategoryMaster(params: FilterWithPaginationBaselineCostPlanDocumentCategoryMaster, signal?: AbortSignal): Promise<BaselineCostPlanDocumentCategoryMasterListResponse>;
    abstract addUpdateBaselineCostPlanDocumentCategoryMaster(payload: AddUpdateBaselineCostPlanDocumentCategoryMasterRequest): Promise<BaselineCostPlanDocumentCategoryMasterSaveReponse>;
    abstract deleteBaselineCostPlanDocumentCategoryMaster(params: DeleteBaselineCostPlanDocumentCategoryMasterRequest): Promise<BaselineCostPlanDocumentCategoryMasterDeleteResponse>;
}

export class BaselineCostPlanDocumentCategoryMasterDatasourceImpl implements BaselineCostPlanDocumentCategoryMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullBaselineCostPlanDocumentCategoryMaster(params: FilterWithPaginationBaselineCostPlanDocumentCategoryMaster, signal?: AbortSignal): Promise<BaselineCostPlanDocumentCategoryMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BaselineCostPlanDocumentCategoryId) queryParams.append('BaselineCostPlanDocumentCategoryId', params.BaselineCostPlanDocumentCategoryId.toString());
            if (params.BaselineCostPlanDocumentCategory?.trim()) queryParams.append('BaselineCostPlanDocumentCategory', params.BaselineCostPlanDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BaselineCostPlanDocumentCategoryMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL BASELINE COST PLAN DOCUMENT CATEGORY MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullBaselineCostPlanDocumentCategoryMaster(params);
            }

            throw error
        }
    }
    async addUpdateBaselineCostPlanDocumentCategoryMaster(params: AddUpdateBaselineCostPlanDocumentCategoryMasterRequest): Promise<BaselineCostPlanDocumentCategoryMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BaselineCostPlanDocumentCategoryMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE BASELINE COST PLAN DOCUMENT CATEGORY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateBaselineCostPlanDocumentCategoryMaster(params);
            }
            throw error
        }
    }

    async deleteBaselineCostPlanDocumentCategoryMaster(params: DeleteBaselineCostPlanDocumentCategoryMasterRequest): Promise<BaselineCostPlanDocumentCategoryMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                BaselineCostPlanDocumentCategoryId: (params.BaselineCostPlanDocumentCategoryId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(`${BaselineCostPlanDocumentCategoryMasterApi.DELETE}?${queryParams.toString()}`)

            return response

        } catch (error) {

            console.error('ERROR: DELETE BASELINE COST PLAN DOCUMENT CATEGORY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteBaselineCostPlanDocumentCategoryMaster(params);

            }

            throw error
        }
    }

}