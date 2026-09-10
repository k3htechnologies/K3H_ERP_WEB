import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { DeleteMaterialRequisitionGRN, FilterWithPaginationMaterialRequisitionGRN, FilterWithPaginationMaterialRequisitionGRNSummary, MaterialRequisitionGRNDeleteResponse, MaterialRequisitionGRNListResponse, MaterialRequisitionGRNSaveResponse, MaterialRequisitionGRNSummaryListResponse } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { MaterialRequisitionGRNApi } from "@/features/materialRequisition/api/MaterialRequisitionGRNApi";

export abstract class MaterialRequisitionGRNGRNDatasource {
    abstract pullMaterialRequisitionGRN(params: FilterWithPaginationMaterialRequisitionGRN, signal?: AbortSignal): Promise<MaterialRequisitionGRNListResponse>;
    abstract addUpdateMaterialRequisitionGRN(data: FormData): Promise<MaterialRequisitionGRNSaveResponse>;
    abstract deleteMaterialRequisitionGRN(params: DeleteMaterialRequisitionGRN): Promise<MaterialRequisitionGRNDeleteResponse>;
    abstract pullMaterialRequisitionGRNSummary(params: FilterWithPaginationMaterialRequisitionGRNSummary, signal?: AbortSignal): Promise<MaterialRequisitionGRNSummaryListResponse>;
}

export class MaterialRequisitionGRNGRNDatasourceImpl implements MaterialRequisitionGRNGRNDatasource {
    
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialRequisitionGRN(params: FilterWithPaginationMaterialRequisitionGRN, signal?: AbortSignal): Promise<MaterialRequisitionGRNListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.MaterialRequisitionGRNId) queryParams.append('MaterialRequisitionGRNId', params.MaterialRequisitionGRNId.toString());
            if (params.MaterialRequisitionId) queryParams.append('MaterialRequisitionId', params.MaterialRequisitionId.toString());
            if (params.Uniquekey?.trim()) queryParams.append('Uniquekey', params.Uniquekey.trim());


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionGRNApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION GRN:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionGRN(params);
            }

            throw error
        }
    }

    async addUpdateMaterialRequisitionGRN(formData: FormData): Promise<MaterialRequisitionGRNSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                MaterialRequisitionGRNApi.ADD,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE MATERIAL REQUISITION GRN:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateMaterialRequisitionGRN(formData);
            }
            throw error
        }
    }

    async deleteMaterialRequisitionGRN(params: DeleteMaterialRequisitionGRN): Promise<MaterialRequisitionGRNDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({

                MaterialRequisitionGRNId: (params.MaterialRequisitionGRNId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MaterialRequisitionGRNApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE MATERIAL REQUISITION GRN :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteMaterialRequisitionGRN(params);
            }
            throw error
        }
    }

    async pullMaterialRequisitionGRNSummary(params: FilterWithPaginationMaterialRequisitionGRNSummary, signal?: AbortSignal): Promise<MaterialRequisitionGRNSummaryListResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionGRNApi.PULL_SUMMARY}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION GRN SUMMARY :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionGRNSummary(params);
            }
            throw error
        }
    }
}