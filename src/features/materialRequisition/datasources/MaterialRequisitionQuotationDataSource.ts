import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { DeleteMaterialRequisitionQuotationRequest, DeletMaterialRequisitionQuotationResponse, FilterMaterialRequisitionQuotationRequest, FilterSelectedVendorForQuotationRequest, FilterWithMaterialRequisitionSummaryOfQuotationRequest, MaterialRequisitionQuotationListResponse, MaterialRequisitionQuotationSaveReponse, MaterialRequisitionSummaryOfQuotationListResponse, SelectedVendorForQuotationListResponse } from "@/features/materialRequisition/models/MaterialRequisitionQuotationModel";
import { MaterialRequisitionQuotationApi } from "@/features/materialRequisition/api/MaterialRequisitionQuotationApi";
export abstract class MaterialRequisitionQuotationDatasource {
    abstract pullMaterialRequisitionQuotation(params: FilterMaterialRequisitionQuotationRequest, signal?: AbortSignal): Promise<MaterialRequisitionQuotationListResponse>;
    abstract pullMaterialRequisitionSummaryOfQuotation(params: FilterWithMaterialRequisitionSummaryOfQuotationRequest, signal?: AbortSignal): Promise<MaterialRequisitionSummaryOfQuotationListResponse>;
    abstract addUpdateMaterialRequisitionQuotation(FormData: FormData): Promise<MaterialRequisitionQuotationSaveReponse>;
    abstract deleteMaterialRequisitionQuotation(params: DeleteMaterialRequisitionQuotationRequest): Promise<DeletMaterialRequisitionQuotationResponse>;
    abstract pullSelectedVendorForQuotation(params: FilterSelectedVendorForQuotationRequest, signal?: AbortSignal): Promise<SelectedVendorForQuotationListResponse>;
}

export class MaterialRequisitionQuotationDatasourceImpl implements MaterialRequisitionQuotationDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialRequisitionQuotation(params: FilterMaterialRequisitionQuotationRequest, signal?: AbortSignal): Promise<MaterialRequisitionQuotationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString()
            })

            if (params.MaterialRequisitionId) queryParams.append('MaterialRequisitionId', params.MaterialRequisitionId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', (params.ProjectId).toString());
            if (params.Uniquekey?.trim()) queryParams.append('Uniquekey', params.Uniquekey.trim());

            return await this.k3hHttpClient.getRequestWithAuthentication(`${MaterialRequisitionQuotationApi.PULL}?${queryParams.toString()}`, { signal })

        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION QUOTATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionQuotation(params);
            }

            throw error
        }
    }

    async pullMaterialRequisitionSummaryOfQuotation(params: FilterWithMaterialRequisitionSummaryOfQuotationRequest, signal?: AbortSignal): Promise<MaterialRequisitionSummaryOfQuotationListResponse> {

        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            if (params.VendorName?.trim()) queryParams.append('VendorName', params.VendorName.trim());

            return await this.k3hHttpClient.getRequestWithAuthentication(`${MaterialRequisitionQuotationApi.PULL_SUMMARY_OF_QUITATION}?${queryParams.toString()}`, { signal })


        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL REQUISITION SUMMARY OF QUOTATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionSummaryOfQuotation(params);
            }

            throw error
        }
    }


    async addUpdateMaterialRequisitionQuotation(FormData: FormData): Promise<MaterialRequisitionQuotationSaveReponse> {
        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(MaterialRequisitionQuotationApi.ADD, FormData)


        } catch (error) {

            console.error('ERROR: ADD  MATERIAL REQUISITION  QUOTATION:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateMaterialRequisitionQuotation(FormData);
            }
            throw error
        }
    }

    async deleteMaterialRequisitionQuotation(params: DeleteMaterialRequisitionQuotationRequest): Promise<DeletMaterialRequisitionQuotationResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionQuotationTermsId: (params.MaterialRequisitionQuotationTermsId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                VendorId: (params.VendorId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${MaterialRequisitionQuotationApi.DELETE}?${queryParams.toString()}`)


        } catch (error) {

            console.error('ERROR: DELETE MATERIAL REQUISITION :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteMaterialRequisitionQuotation(params);

            }
            throw error
        }
    }

    async pullSelectedVendorForQuotation(params: FilterSelectedVendorForQuotationRequest, signal?: AbortSignal): Promise<SelectedVendorForQuotationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                Uniquekey: (params.Uniquekey ?? null)?.toString() || '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })
            
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);
            if (params.MaterialRequisitionDetailId) queryParams.append('MaterialRequisitionDetailId', params.MaterialRequisitionDetailId);
            

            return await this.k3hHttpClient.getRequestWithAuthentication(`${MaterialRequisitionQuotationApi.PULL_SELECTED_VENDOR_FOR_QUOTATION}?${queryParams.toString()}`, { signal })


        } catch (error) {

            console.error('ERROR: PULL SELECTED VENDOR FOR ENQUIRY  :', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullSelectedVendorForQuotation(params);
            }
            throw error
        }
    }

}