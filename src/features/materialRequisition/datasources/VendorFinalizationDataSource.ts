import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { AddVendorForEnquiryRequest, AddVendorForEnquiryRequestResponse, FilterWithPaginationVendorForEnquiryRequest, FilterWithPaginationVendorForSelectedEnquiryRequest, SelectedVendorListResponse } from "@/features/materialRequisition/models/VendorFinalizeModel";
import { VendorFinalizationApi } from "@/features/materialRequisition/api/VendorFinalizationApi";
import type { VendorListResponse } from "@/features/vendor/models/VendorModel";


export abstract class VendorFinalizationDatasource {
    abstract pullVendorsForEnquiry(params: FilterWithPaginationVendorForEnquiryRequest, signal?: AbortSignal): Promise<VendorListResponse>;
    abstract addVendorForEnquiry(payload: AddVendorForEnquiryRequest): Promise<AddVendorForEnquiryRequestResponse>;
    abstract pullSelectedVendorForEnquiry(params: FilterWithPaginationVendorForSelectedEnquiryRequest,signal?: AbortSignal): Promise<SelectedVendorListResponse>;
    abstract addFinalizedVendor(payload: AddVendorForEnquiryRequestResponse): Promise<VendorListResponse>;
    abstract pullFinalizedVendor(params: FilterWithPaginationVendorForEnquiryRequest, signal?: AbortSignal): Promise<VendorListResponse>;

}

export class VendorFinalizationDatasourceImpl implements VendorFinalizationDatasource {

   private get k3hHttpClient() {
        return baseClient;
    }

    async pullVendorsForEnquiry(params: FilterWithPaginationVendorForEnquiryRequest, signal?: AbortSignal): Promise<VendorListResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                Uniquekey: (params.Uniquekey ?? null)?.toString() || '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${VendorFinalizationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL VENDORS FOR ENQUIRY :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullVendorsForEnquiry(params);
            }

            throw error
        }
    }
    async addVendorForEnquiry(payload: AddVendorForEnquiryRequest): Promise<VendorListResponse> {
        try {
            
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                VendorFinalizationApi.ADD,
                payload
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD VENDOR FOR ENQUIRY :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addVendorForEnquiry(payload);
            }
            throw error
        }
    }

    async pullSelectedVendorForEnquiry(params: FilterWithPaginationVendorForSelectedEnquiryRequest, signal?: AbortSignal): Promise<SelectedVendorListResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                Uniquekey: (params.Uniquekey ?? null)?.toString() || '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${VendorFinalizationApi.PULL_SELECTED_VENDOR}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE MATERIAL REQUISITION :', error)

            if (error instanceof TokenExpiredException) {

                return  await this.pullSelectedVendorForEnquiry(params);

            }

            throw error
        }
    }

    async addFinalizedVendor(payload: AddVendorForEnquiryRequest): Promise<AddVendorForEnquiryRequestResponse> {
        try {
        
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                `${VendorFinalizationApi.ADD_FINALIZED_VENDOR}`,payload
            )

            return response
        
        } catch (error) {

            console.error('ERROR: CLOSE MATERIAL REQUISITION :', error)
            
            if (error instanceof TokenExpiredException) {

                return await this.addFinalizedVendor(payload);
                
            }
            throw error
        }
        
    }
                    
    async pullFinalizedVendor(params: FilterWithPaginationVendorForEnquiryRequest, signal?: AbortSignal): Promise<VendorListResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                Uniquekey: (params.Uniquekey ?? null)?.toString() || '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${VendorFinalizationApi.PULL_FINALIZED_VENDOR}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL FINALIZED VENDOR :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullFinalizedVendor(params, signal);
            }

            throw error
        }
    }
}