import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { DeleteMaterialRequisitionInvoice, FilterWithPaginationMaterialRequisitionInvoice, MaterialRequisitionInvoiceDeleteResponse, MaterialRequisitionInvoiceListResponse, MaterialRequisitionInvoiceSaveResponse } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { MaterialRequisitionInvoiceApi } from "@/features/materialRequisition/api/MaterialRequisitionInvoiceApi";

export abstract class MaterialRequisitionInvoiceDatasource {
    abstract pullMaterialRequisitionInvoice(params: FilterWithPaginationMaterialRequisitionInvoice, signal?: AbortSignal): Promise<MaterialRequisitionInvoiceListResponse>;
    abstract addUpdateMaterialRequisitionInvoice(data: FormData): Promise<MaterialRequisitionInvoiceSaveResponse>;
    abstract deleteMaterialRequisitionInvoice(params: DeleteMaterialRequisitionInvoice): Promise<MaterialRequisitionInvoiceDeleteResponse>;
}

export class MaterialRequisitionInvoiceDatasourceImpl implements MaterialRequisitionInvoiceDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialRequisitionInvoice(params: FilterWithPaginationMaterialRequisitionInvoice, signal?: AbortSignal): Promise<MaterialRequisitionInvoiceListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.MaterialRequisitionInvoiceId) queryParams.append('MaterialRequisitionInvoiceId', params.MaterialRequisitionInvoiceId.toString());
            if (params.MaterialRequisitionId) queryParams.append('MaterialRequisitionId', params.MaterialRequisitionId.toString());
            if (params.Uniquekey) queryParams.append('Uniquekey', params.Uniquekey);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionInvoiceApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION INVOICE:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionInvoice(params);
            }

            throw error
        }
    }
    async addUpdateMaterialRequisitionInvoice(formData: FormData): Promise<MaterialRequisitionInvoiceSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                MaterialRequisitionInvoiceApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE MATERIAL REQUISITION INVOICE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateMaterialRequisitionInvoice(formData);
            }
            throw error
        }
    }

    async deleteMaterialRequisitionInvoice(params: DeleteMaterialRequisitionInvoice): Promise<MaterialRequisitionInvoiceDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionInvoiceId: (params.MaterialRequisitionInvoiceId ?? 0).toString(),
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MaterialRequisitionInvoiceApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE MATERIAL REQUISITION INVOICE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteMaterialRequisitionInvoice(params);

            }

            throw error
        }
    }

}