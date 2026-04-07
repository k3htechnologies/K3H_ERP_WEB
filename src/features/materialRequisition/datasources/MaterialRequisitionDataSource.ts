import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {CloseMaterialRequisitionRequest, DeleteMaterialRequisitionRequest, FilterWithPaginationMaterialRequisition, MaterialRequisitionDeleteResponse, MaterialRequisitionListResponse, MaterialRequisitionSaveReponse } from "../models/MaterialRequisitionModel";
import { MaterialRequisitionApi } from "../api/MaterialRequisitionApi";

export abstract class MaterialRequisitionDatasource {
    abstract pullMaterialRequisition(params: FilterWithPaginationMaterialRequisition, signal?: AbortSignal): Promise<MaterialRequisitionListResponse>;
    abstract addUpdateMaterialRequisition(data: FormData): Promise<MaterialRequisitionSaveReponse>;
    abstract deleteMaterialRequisition(params: DeleteMaterialRequisitionRequest): Promise<MaterialRequisitionDeleteResponse>;
    abstract closeMaterialRequisition(payload: CloseMaterialRequisitionRequest): Promise<MaterialRequisitionDeleteResponse>;

}

export class MaterialRequisitionDatasourceImpl implements MaterialRequisitionDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialRequisition(params: FilterWithPaginationMaterialRequisition, signal?: AbortSignal): Promise<MaterialRequisitionListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.MaterialRequisitionId) queryParams.append('MaterialRequisitionId', params.MaterialRequisitionId.toString());
            if (params.SystemGeneratedCode?.trim()) queryParams.append('SystemGeneratedCode', params.SystemGeneratedCode.trim());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);
            if (params.MaterialRequisitionStage?.trim()) queryParams.append('MaterialRequisitionStage', params.MaterialRequisitionStage.trim());
            if (params.MaterialRequisitionStatus?.trim()) queryParams.append('MaterialRequisitionStatus', params.MaterialRequisitionStatus.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisition(params);
            }

            throw error
        }
    }
    async addUpdateMaterialRequisition(formData: FormData): Promise<MaterialRequisitionSaveReponse> {
        try {
            
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                MaterialRequisitionApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE MATERIAL REQUISITION :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateMaterialRequisition(formData);
            }
            throw error
        }
    }

    async deleteMaterialRequisition(params: DeleteMaterialRequisitionRequest): Promise<MaterialRequisitionDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MaterialRequisitionApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE MATERIAL REQUISITION :', error)

            if (error instanceof TokenExpiredException) {

                return  await this.deleteMaterialRequisition(params);

            }

            throw error
        }
    }

    async closeMaterialRequisition(payload: CloseMaterialRequisitionRequest): Promise<MaterialRequisitionDeleteResponse> {
        try {
        
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                `${MaterialRequisitionApi.CLOSE_REQUISITION}?${payload.toString()}`,payload
            )

            return response
        
        } catch (error) {

            console.error('ERROR: CLOSE MATERIAL REQUISITION :', error)
            
            if (error instanceof TokenExpiredException) {

                return await this.closeMaterialRequisition(payload);
                
            }
            throw error
        }
        
    }    
}