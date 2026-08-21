import baseClient from "@/core/config/baseClient";
import type { DeleteDrawingDocumentRequest, FilterWithPaginationDrawingDocument, DrawingDocumentDeleteResponse, DrawingDocumentListResponse, DrawingDocumentSaveReponse } from "@/features/drawingDocument/models/DrawingDocumentModel";
import { DrawingDocumentApi } from "@/features/drawingDocument/api/DrawingDocumentApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class DrawingDocumentDatasource {
    abstract pullDrawingDocument(params: FilterWithPaginationDrawingDocument, signal?: AbortSignal): Promise<DrawingDocumentListResponse>;
    abstract addUpdateDrawingDocument(formData: FormData): Promise<DrawingDocumentSaveReponse>;
    abstract deleteDrawingDocument(params: DeleteDrawingDocumentRequest): Promise<DrawingDocumentDeleteResponse>;
}

export class DrawingDocumentDatasourceImpl implements DrawingDocumentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullDrawingDocument(params: FilterWithPaginationDrawingDocument, signal?: AbortSignal): Promise<DrawingDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', String(params.ProjectId));
            if (params.DrawingDocumentId) queryParams.append('DrawingDocumentId', params.DrawingDocumentId.toString());
            if (params.DrawingDocumentCategoryId) queryParams.append('DrawingDocumentCategoryId', params.DrawingDocumentCategoryId.toString());
            if (params.DrawingDocumentName?.trim()) queryParams.append('DrawingDocumentName', params.DrawingDocumentName.trim());
            if (params.DrawingDocumentStatus?.trim()) queryParams.append('DrawingDocumentStatus', params.DrawingDocumentStatus.trim());
            if (params.DrawingDocumentCategory?.trim()) queryParams.append('DrawingDocumentCategory', params.DrawingDocumentCategory.trim());
            if (params.BuildingNumber) queryParams.append('BuildingNumber', params.BuildingNumber);
            if (params.Wing) queryParams.append('Wing', params.Wing);
            if (params.Floor) queryParams.append('Floor', params.Floor);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${DrawingDocumentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL DRAWING DOCUMENT :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullDrawingDocument(params);
            }

            throw error
        }
    }
    async addUpdateDrawingDocument(formData: FormData): Promise<DrawingDocumentSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                DrawingDocumentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE DRAWING DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateDrawingDocument(formData);
            }
            throw error
        }
    }

    async deleteDrawingDocument(params: DeleteDrawingDocumentRequest): Promise<DrawingDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                DrawingDocumentId: (params.DrawingDocumentId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                projectId: (params.projectId ?? 0).toString(),
                DrawingDocumentCategoryId: (params.DrawingDocumentCategoryId ?? 0).toString(),

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${DrawingDocumentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE DRAWING DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteDrawingDocument(params);

            }

            throw error
        }
    }

}