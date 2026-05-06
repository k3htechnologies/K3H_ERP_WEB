import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { DeleteMaterialRequisitionPurchaseOrder, FilterWithPaginationMaterialRequisitionPurchaseOrder, GenerateMaterialRequisitionPurchaseOrderPdfData, GenerateMaterialRequisitionPurchaseOrderPdfSaveResponse, MaterialRequisitionPurchaseOrderDeleteResponse, MaterialRequisitionPurchaseOrderListResponse, MaterialRequisitionPurchaseOrderSaveResponse } from "@/features/materialRequisition/models/MaterialRequisitionPurchaseOrderModel";
import { MaterialRequisitionPurchaseOrderApi } from "@/features/materialRequisition/api/MaterialRequisitionPurchaseOrderApi";

export abstract class MaterialRequisitionPurchaseOrderDatasource {
    abstract pullMaterialRequisitionPurchaseOrder(params: FilterWithPaginationMaterialRequisitionPurchaseOrder, signal?: AbortSignal): Promise<MaterialRequisitionPurchaseOrderListResponse>;
    abstract addUpdateMaterialRequisitionPurchaseOrder(data: FormData): Promise<MaterialRequisitionPurchaseOrderSaveResponse>;
    abstract deleteMaterialRequisitionPurchaseOrder(params: DeleteMaterialRequisitionPurchaseOrder): Promise<MaterialRequisitionPurchaseOrderDeleteResponse>;
    abstract generateMaterialRequisitionPurchaseOrderPdf(params: GenerateMaterialRequisitionPurchaseOrderPdfData): Promise<GenerateMaterialRequisitionPurchaseOrderPdfSaveResponse>;
}

export class MaterialRequisitionPurchaseOrderDatasourceImpl implements MaterialRequisitionPurchaseOrderDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialRequisitionPurchaseOrder(params: FilterWithPaginationMaterialRequisitionPurchaseOrder, signal?: AbortSignal): Promise<MaterialRequisitionPurchaseOrderListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.MaterialRequisitionId) queryParams.append('MaterialRequisitionId', params.MaterialRequisitionId.toString());
            if (params.Uniquekey) queryParams.append('Uniquekey', params.Uniquekey);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionPurchaseOrderApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION PURCHASE ORDER:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionPurchaseOrder(params);
            }

            throw error
        }
    }
    async addUpdateMaterialRequisitionPurchaseOrder(formData: FormData): Promise<MaterialRequisitionPurchaseOrderSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                MaterialRequisitionPurchaseOrderApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE MATERIAL REQUISITION PURCHASE ORDER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateMaterialRequisitionPurchaseOrder(formData);
            }
            throw error
        }
    }

    async deleteMaterialRequisitionPurchaseOrder(params: DeleteMaterialRequisitionPurchaseOrder): Promise<MaterialRequisitionPurchaseOrderDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionPurchaseOrderId: (params.MaterialRequisitionPurchaseOrderId ?? 0).toString(),
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MaterialRequisitionPurchaseOrderApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE MATERIAL REQUISITION PURCHASE ORDER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteMaterialRequisitionPurchaseOrder(params);
            }
            throw error
        }
    }

    async generateMaterialRequisitionPurchaseOrderPdf(params: GenerateMaterialRequisitionPurchaseOrderPdfData): Promise<GenerateMaterialRequisitionPurchaseOrderPdfSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                MaterialRequisitionPurchaseOrderApi.GENERATE_MATERIAL_REQUISITION,
                params
            )
            return response

        } catch (error) {

            console.error('ERROR: GENERATE MATERIAL REQUISITION PURCHASE ORDER PDF :', error)

            if (error instanceof TokenExpiredException) {

                return await this.generateMaterialRequisitionPurchaseOrderPdf(params);
            }
            throw error
        }
    }

}