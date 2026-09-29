import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { AddVendorForEnquiryRequest } from "@/features/materialRequisition/models/VendorFinalizeModel";
import type { DeleteMaterialRequisitionQuotation, FilterWithMaterialRequisitionSummaryOfQuotationRequest, MaterialRequisitionQuotationListResponse, MaterialRequisitionQuotationSaveReponse, MaterialRequisitionSummaryOfQuotationListResponse } from "@/features/materialRequisition/models/MaterialRequisitionQuotationModel";
import { MaterialRequisitionQuotationApi } from "@/features/materialRequisition/api/MaterialRequisitionQuotationApi";

export abstract class MaterialRequisitionQuotationDatasource {
    abstract pullMaterialRequisitionQuotation(params: AddVendorForEnquiryRequest, signal?: AbortSignal): Promise<MaterialRequisitionQuotationListResponse>;
    abstract addUpdateMaterialRequisitionQuotation(FormData: FormData): Promise<MaterialRequisitionQuotationSaveReponse>;
    abstract deleteMaterialRequisitionQuotation(params: DeleteMaterialRequisitionQuotation): Promise<DeleteMaterialRequisitionQuotation>;
    abstract pullMaterialRequisitionSummaryOfQuotation(params: FilterWithMaterialRequisitionSummaryOfQuotationRequest, signal?: AbortSignal): Promise<MaterialRequisitionSummaryOfQuotationListResponse>;
}

export class MaterialRequisitionQuotationDatasourceImpl implements MaterialRequisitionQuotationDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialRequisitionQuotation(params: AddVendorForEnquiryRequest, signal?: AbortSignal): Promise<MaterialRequisitionQuotationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString()
            })

            if (params.MaterialRequisitionId) queryParams.append('MaterialRequisitionId', params.MaterialRequisitionId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', (params.ProjectId).toString());
            if (params.Uniquekey?.trim()) queryParams.append('Uniquekey', params.Uniquekey.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MaterialRequisitionQuotationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION QUOTATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionQuotation(params);
            }

            throw error
        }
    }

    async addUpdateMaterialRequisitionQuotation(FormData: FormData): Promise<MaterialRequisitionQuotationSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                MaterialRequisitionQuotationApi.ADD,
                FormData
            )

            return response;

        } catch (error) {

            console.error('ERROR: ADD  MATERIAL REQUISITION  QUOTATION:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateMaterialRequisitionQuotation(FormData);
            }
            throw error
        }
    }

    async deleteMaterialRequisitionQuotation(params: DeleteMaterialRequisitionQuotation): Promise<DeleteMaterialRequisitionQuotation> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionQuotationTermsId: (params.MaterialRequisitionQuotationTermsId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                VendorId: (params.VendorId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MaterialRequisitionQuotationApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE MATERIAL REQUISITION :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteMaterialRequisitionQuotation(params);

            }
            throw error
        }
    }

    async pullMaterialRequisitionSummaryOfQuotation(params: FilterWithMaterialRequisitionSummaryOfQuotationRequest, signal?: AbortSignal): Promise<MaterialRequisitionSummaryOfQuotationListResponse> {
       
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString()
            })

            if (params.ProjectId) queryParams.append('ProjectId', (params.ProjectId).toString());

            return await this.k3hHttpClient.getRequestWithAuthentication(`${MaterialRequisitionQuotationApi.PULL_SUMMARY_OF_QUITATION}?${queryParams.toString()}`, { signal })
             

        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION SUMMARY OF QUOTATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionSummaryOfQuotation(params);
            }

            throw error
        }
    }
}