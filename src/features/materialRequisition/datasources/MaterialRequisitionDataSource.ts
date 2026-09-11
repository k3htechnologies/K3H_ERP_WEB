import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { DeleteMaterialRequisitionRequest, FilterMaterialRequisitionDetails, FilterMaterialRequisitionOverview, FilterWithPaginationMaterialRequisition, MaterialRequisitionDeleteResponse, MaterialRequisitionDetailsResponse, MaterialRequisitionListResponse, MaterialRequisitionOverviewResponse, MaterialRequisitionSaveReponse } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { MaterialRequisitionApi } from "@/features/materialRequisition/api/MaterialRequisitionApi";

export abstract class MaterialRequisitionDatasource {
    abstract pullMaterialRequisition(params: FilterWithPaginationMaterialRequisition, signal?: AbortSignal): Promise<MaterialRequisitionListResponse>;
    abstract pullMaterialRequisitionOverview(params: FilterMaterialRequisitionOverview, signal?: AbortSignal): Promise<MaterialRequisitionOverviewResponse>;
    abstract pullMaterialRequisitionDetails(params: FilterMaterialRequisitionDetails, signal?: AbortSignal): Promise<MaterialRequisitionDetailsResponse>;
    abstract addUpdateMaterialRequisition(data: FormData): Promise<MaterialRequisitionSaveReponse>;
    abstract deleteMaterialRequisition(params: DeleteMaterialRequisitionRequest): Promise<MaterialRequisitionDeleteResponse>;
    abstract closeMaterialRequisition(payload: DeleteMaterialRequisitionRequest): Promise<MaterialRequisitionDeleteResponse>;
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
            if (params.VendorName?.trim()) queryParams.append('VendorName', params.VendorName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionApi.PULL}?${queryParams.toString()}`, { signal }
            )
            
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisition(params);
            }

            throw error
        }
    }
    
    async pullMaterialRequisitionOverview(params: FilterMaterialRequisitionOverview, signal?: AbortSignal): Promise<MaterialRequisitionOverviewResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 10).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionApi.PULL_MATERIAL_REQUISITION_OVERVIEW}?${queryParams.toString()}`, { signal }
            )
            
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION OVERVIEW:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionOverview(params);
            }

            throw error
        }
    }

    async pullMaterialRequisitionDetails(params: FilterMaterialRequisitionDetails, signal?: AbortSignal): Promise<MaterialRequisitionDetailsResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 10).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionApi.PULL_MATERIAL_REQUISITION_DETAILS}?${queryParams.toString()}`, { signal }
            )
            
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION DETAILS:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionDetails(params);
            }

            throw error
        }
    }

    
    async addUpdateMaterialRequisition(formData: FormData): Promise<MaterialRequisitionSaveReponse> {
        try {
            
            return await this.k3hHttpClient.multipartRequestWithAuthentication(
                MaterialRequisitionApi.ADD_UPDATE,
                formData
            )

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
                ProjectId: (params.ProjectId ?? 0).toString(),

            })

           return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MaterialRequisitionApi.DELETE}?${queryParams.toString()}`
            )


        } catch (error) {
            console.error('ERROR: DELETE MATERIAL REQUISITION :', error)

            if (error instanceof TokenExpiredException) {

                return  await this.deleteMaterialRequisition(params);
            }
            throw error
        }
    }

    async closeMaterialRequisition(payload: DeleteMaterialRequisitionRequest): Promise<MaterialRequisitionDeleteResponse> {
        try {
        
            return await this.k3hHttpClient.postRequestWithAuthentication(
                `${MaterialRequisitionApi.CLOSE_REQUISITION}?${payload.toString()}`,payload
            )

        
        } catch (error) {

            console.error('ERROR: CLOSE MATERIAL REQUISITION :', error)
            
            if (error instanceof TokenExpiredException) {

                return await this.closeMaterialRequisition(payload);
            }
            throw error
        }
        
    }    
}