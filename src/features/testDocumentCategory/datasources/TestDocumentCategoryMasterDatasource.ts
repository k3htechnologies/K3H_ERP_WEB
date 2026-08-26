import baseClient from "@/core/config/baseClient";
import type { AddUpdateTestDocumentCategoryMasterRequest, DeleteTestDocumentCategoryMasterRequest, FilterWithPaginationTestDocumentCategoryMaster, TestDocumentCategoryMasterDeleteResponse, TestDocumentCategoryMasterListResponse, TestDocumentCategoryMasterSaveReponse } from "../models/TestDocumentCategoryMasterModel";
import { TestDocumentCategoryMasterApi } from "@/features/testDocumentCategory/api/TestDocumentCategoryMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class TestDocumentCategoryMasterDatasource {
    abstract pullTestDocumentCategoryMaster(params: FilterWithPaginationTestDocumentCategoryMaster, signal?: AbortSignal): Promise<TestDocumentCategoryMasterListResponse>;
    abstract addUpdateTestDocumentCategoryMaster(payload: AddUpdateTestDocumentCategoryMasterRequest): Promise<TestDocumentCategoryMasterSaveReponse>;
    abstract deleteTestDocumentCategoryMaster(params: DeleteTestDocumentCategoryMasterRequest): Promise<TestDocumentCategoryMasterDeleteResponse>;
}

export class TestDocumentCategoryMasterDatasourceImpl implements TestDocumentCategoryMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullTestDocumentCategoryMaster(params: FilterWithPaginationTestDocumentCategoryMaster, signal?: AbortSignal): Promise<TestDocumentCategoryMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.TestDocumentCategoryId) queryParams.append('TestDocumentCategoryId', params.TestDocumentCategoryId.toString());
            if (params.TestDocumentCategory?.trim()) queryParams.append('TestDocumentCategory', params.TestDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TestDocumentCategoryMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL TEST DOCUMENT CATEGORY MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullTestDocumentCategoryMaster(params);
            }

            throw error
        }
    }
    async addUpdateTestDocumentCategoryMaster(params: AddUpdateTestDocumentCategoryMasterRequest): Promise<TestDocumentCategoryMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                TestDocumentCategoryMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE TEST DOCUMENT CATEGORY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateTestDocumentCategoryMaster(params);
            }
            throw error
        }
    }

    async deleteTestDocumentCategoryMaster(params: DeleteTestDocumentCategoryMasterRequest): Promise<TestDocumentCategoryMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                TestDocumentCategoryId: (params.TestDocumentCategoryId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(`${TestDocumentCategoryMasterApi.DELETE}?${queryParams.toString()}`)

            return response

        } catch (error) {

            console.error('ERROR: DELETE TEST DOCUMENT CATEGORY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteTestDocumentCategoryMaster(params);

            }

            throw error
        }
    }

}