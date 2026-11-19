import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { MaterialRequisitionFinalizedVendorApi } from "@/features/materialRequisition/api/MaterialRequisitionFinalizedVendorApi";
import type { AddFinalizedVendorRequest, FilterMaterialWiseQuotationRequest, MaterialWiseQuotationResponse, RevokeFinalizationVendorRequest, RevokeFinalizationVendorResponse } from "@/features/materialRequisition/models/MaterialRequisitionFinalizedVendorModel";

export abstract class MaterialRequisitionFinalizedVendorDataSource {
    abstract addFinalizedVendor(payload: AddFinalizedVendorRequest): Promise<MaterialWiseQuotationResponse>;
    abstract pullMaterialWiseQuotation(params: FilterMaterialWiseQuotationRequest, signal?: AbortSignal): Promise<MaterialWiseQuotationResponse>;
    abstract revokeFinalizationVendor(payload: RevokeFinalizationVendorRequest): Promise<RevokeFinalizationVendorResponse>;
}

export class MaterialRequisitionFinalizedVendorDataSourceImpl implements MaterialRequisitionFinalizedVendorDataSource {

    private get k3hHttpClient() {
        return baseClient;
    }

     async addFinalizedVendor(payload: AddFinalizedVendorRequest): Promise<MaterialWiseQuotationResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(`${MaterialRequisitionFinalizedVendorApi.ADD_FINALIZED_VENDOR}`, payload)


        } catch (error) {

            console.error('ERROR: ADD FINALIZED VENDOR :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addFinalizedVendor(payload);
            }
            throw error
        }

    }

    async pullMaterialWiseQuotation(params: FilterMaterialWiseQuotationRequest, signal?: AbortSignal): Promise<MaterialWiseQuotationResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString()
            })
            if (params.ProjectId) queryParams.append('ProjectId', (params.ProjectId).toString());
            if (params.Uniquekey?.trim()) queryParams.append('Uniquekey', params.Uniquekey.trim());

            return await this.k3hHttpClient.getRequestWithAuthentication(`${MaterialRequisitionFinalizedVendorApi.PULL_MATERIAL_WISE_QUOTATION}?${queryParams.toString()}`, { signal })


        } catch (error: any) {

            console.error('ERROR: PULL MATERIAL WISE QUOTATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialWiseQuotation(params);
            }

            throw error
        }
    }

   
    async revokeFinalizationVendor(payload: RevokeFinalizationVendorRequest): Promise<RevokeFinalizationVendorResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(MaterialRequisitionFinalizedVendorApi.REVOKE_FINALIZATION_VENDOR, payload)


        } catch (error) {

            console.error('ERROR: REVOKE FINALIZATION VENDOR :', error)

            if (error instanceof TokenExpiredException) {

                return await this.revokeFinalizationVendor(payload);
            }
            throw error
        }

    }
}