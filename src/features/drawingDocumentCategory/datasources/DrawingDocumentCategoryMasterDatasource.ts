import baseClient from "@/core/config/baseClient";
import type { AddUpdateDrawingDocumentCategoryMasterRequest, DeleteDrawingDocumentCategoryMasterRequest, FilterWithPaginationDrawingDocumentCategoryMaster, DrawingDocumentCategoryMasterDeleteResponse, DrawingDocumentCategoryMasterListResponse, DrawingDocumentCategoryMasterSaveReponse } from "@/features/drawingDocumentCategory/models/DrawingDocumentCategoryMasterModel";
import { DrawingDocumentCategoryMasterApi } from "@/features/drawingDocumentCategory/api/DrawingDocumentCategoryMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class DrawingDocumentCategoryMasterDatasource {
    abstract pullDrawingDocumentCategoryMaster(params: FilterWithPaginationDrawingDocumentCategoryMaster, signal?: AbortSignal): Promise<DrawingDocumentCategoryMasterListResponse>;
    abstract addUpdateDrawingDocumentCategoryMaster(payload: AddUpdateDrawingDocumentCategoryMasterRequest): Promise<DrawingDocumentCategoryMasterSaveReponse>;
    abstract deleteDrawingDocumentCategoryMaster(params: DeleteDrawingDocumentCategoryMasterRequest): Promise<DrawingDocumentCategoryMasterDeleteResponse>;
}

export class DrawingDocumentCategoryMasterDatasourceImpl implements DrawingDocumentCategoryMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullDrawingDocumentCategoryMaster(params: FilterWithPaginationDrawingDocumentCategoryMaster, signal?: AbortSignal): Promise<DrawingDocumentCategoryMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.DrawingDocumentCategoryId) queryParams.append('DrawingDocumentCategoryId', params.DrawingDocumentCategoryId.toString());
            if (params.DrawingDocumentCategory?.trim()) queryParams.append('DrawingDocumentCategory', params.DrawingDocumentCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${DrawingDocumentCategoryMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL DRAWING DOCUMENT CATEGORY MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullDrawingDocumentCategoryMaster(params);
            }

            throw error
        }
    }
    async addUpdateDrawingDocumentCategoryMaster(params: AddUpdateDrawingDocumentCategoryMasterRequest): Promise<DrawingDocumentCategoryMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                DrawingDocumentCategoryMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE DRAWING DOCUMENT CATEGORY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateDrawingDocumentCategoryMaster(params);
            }
            throw error
        }
    }

    async deleteDrawingDocumentCategoryMaster(params: DeleteDrawingDocumentCategoryMasterRequest): Promise<DrawingDocumentCategoryMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                DrawingDocumentCategoryId: (params.DrawingDocumentCategoryId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(`${DrawingDocumentCategoryMasterApi.DELETE}?${queryParams.toString()}`)

            return response

        } catch (error) {

            console.error('ERROR: DELETE DRAWING DOCUMENT CATEGORY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteDrawingDocumentCategoryMaster(params);

            }

            throw error
        }
    }

}