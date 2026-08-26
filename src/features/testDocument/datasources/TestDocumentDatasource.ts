import baseClient from "@/core/config/baseClient";
import type { DeleteTestDocumentRequest, FilterWithPaginationTestDocument, TestDocumentDeleteResponse, TestDocumentListResponse, TestDocumentSaveReponse } from "@/features/testDocument/models/TestDocumentModel";
import { TestDocumentApi } from "@/features/testDocument/api/TestDocumentApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class TestDocumentDatasource {
    abstract pullTestDocument(params: FilterWithPaginationTestDocument, signal?: AbortSignal): Promise<TestDocumentListResponse>;
    abstract addUpdateTestDocument(formData: FormData): Promise<TestDocumentSaveReponse>;
    abstract deleteTestDocument(params: DeleteTestDocumentRequest): Promise<TestDocumentDeleteResponse>;
}

export class TestDocumentDatasourceImpl implements TestDocumentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullTestDocument(params: FilterWithPaginationTestDocument, signal?: AbortSignal): Promise<TestDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', String(params.ProjectId));
            if (params.TestDocumentId) queryParams.append('TestDocumentId', params.TestDocumentId.toString());
            if (params.TestDocumentCategoryId) queryParams.append('TestDocumentCategoryId', params.TestDocumentCategoryId.toString());
            if (params.TestDocumentName?.trim()) queryParams.append('TestDocumentName', params.TestDocumentName.trim());
            if (params.TestDocumentCategory?.trim()) queryParams.append('TestDocumentCategory', params.TestDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TestDocumentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL TEST DOCUMENT :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullTestDocument(params);
            }

            throw error
        }
    }
    async addUpdateTestDocument(formData: FormData): Promise<TestDocumentSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TestDocumentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE TEST DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateTestDocument(formData);
            }
            throw error
        }
    }

    async deleteTestDocument(params: DeleteTestDocumentRequest): Promise<TestDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                TestDocumentId: (params.TestDocumentId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                projectId: (params.projectId ?? 0).toString(),
                TestDocumentCategoryId: (params.TestDocumentCategoryId ?? 0).toString(),

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${TestDocumentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE TEST DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteTestDocument(params);

            }

            throw error
        }
    }

}