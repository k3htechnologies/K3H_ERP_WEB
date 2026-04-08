import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { DeleteMaterialRequisitionPayment, FilterWithPaginationMaterialRequisitionPayment, MaterialRequisitionPaymentDeleteResponse, MaterialRequisitionPaymentListResponse, MaterialRequisitionPaymentSaveResponse } from "../models/MaterialRequisitionPaymentModel";
import { MaterialRequisitionPaymentApi } from "../api/MaterialRequisitionPaymentApi";

export abstract class MaterialRequisitionPaymentDatasource {
    abstract pullMaterialRequisitionPayment(params: FilterWithPaginationMaterialRequisitionPayment, signal?: AbortSignal): Promise<MaterialRequisitionPaymentListResponse>;
    abstract addUpdateMaterialRequisitionPayment(data: FormData): Promise<MaterialRequisitionPaymentSaveResponse>;
    abstract deleteMaterialRequisitionPayment(params: DeleteMaterialRequisitionPayment): Promise<MaterialRequisitionPaymentDeleteResponse>;
}

export class MaterialRequisitionPaymentDatasourceImpl implements MaterialRequisitionPaymentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialRequisitionPayment(params: FilterWithPaginationMaterialRequisitionPayment, signal?: AbortSignal): Promise<MaterialRequisitionPaymentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.MaterialRequisitionInvoiceId) queryParams.append('MaterialRequisitionInvoiceId', params.MaterialRequisitionInvoiceId.toString());
            if (params.MaterialRequisitionId) queryParams.append('MaterialRequisitionId', params.MaterialRequisitionId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionPaymentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION PAYMENT:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionPayment(params);
            }

            throw error
        }
    }
    async addUpdateMaterialRequisitionPayment(formData: FormData): Promise<MaterialRequisitionPaymentSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                MaterialRequisitionPaymentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE MATERIAL REQUISITION PAYMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateMaterialRequisitionPayment(formData);
            }
            throw error
        }
    }

    async deleteMaterialRequisitionPayment(params: DeleteMaterialRequisitionPayment): Promise<MaterialRequisitionPaymentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionPaymentId: (params.MaterialRequisitionPaymentId ?? 0).toString(),
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MaterialRequisitionPaymentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE MATERIAL REQUISITION PAYMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteMaterialRequisitionPayment(params);

            }

            throw error
        }
    }

}