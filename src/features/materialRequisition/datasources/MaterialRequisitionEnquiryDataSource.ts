import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { MaterialRequisitionEnquiryApi } from "@/features/materialRequisition/api/MaterialRequisitionEnquiryApi";
import type { FilterPullVendorForEnquiryRequest,PullVendorForEnquiryListResponse,AddVendorForEnquiryRequest,AddVendorForEnquiryResponse } from "@/features/materialRequisition/models/MaterialRequisitionEnquiryModel";

export abstract class MaterialRequisitionEnquiryDataSource {
    
    abstract pullVendorsForEnquiry(params: FilterPullVendorForEnquiryRequest, signal?: AbortSignal): Promise<PullVendorForEnquiryListResponse>;
    abstract addVendorForEnquiry(payload: AddVendorForEnquiryRequest): Promise<AddVendorForEnquiryResponse>;
}

export class MaterialRequisitionEnquiryDataSourceImpl implements MaterialRequisitionEnquiryDataSource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullVendorsForEnquiry(params: FilterPullVendorForEnquiryRequest, signal?: AbortSignal): Promise<PullVendorForEnquiryListResponse> {
        try {
            const queryParams = new URLSearchParams({
                MaterialRequisitionId: (params.MaterialRequisitionId ?? 0).toString(),
                MaterialRequisitionDetailId: (params.MaterialRequisitionDetailId ?? 0).toString(),
                Uniquekey: (params.Uniquekey ?? null)?.toString() || '',
                ProjectId: (params.ProjectId ?? 0).toString(),
                SearchVendor: (params.SearchVendor ?? null)?.toString() || '',
            })

            return await this.k3hHttpClient.getRequestWithAuthentication(`${MaterialRequisitionEnquiryApi.PULL}?${queryParams.toString()}`, { signal })
           
        } catch (error: any) {

            console.error('ERROR: PULL VENDORS FOR ENQUIRY :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullVendorsForEnquiry(params);
            }

            throw error
        }
    }

    async addVendorForEnquiry(payload: AddVendorForEnquiryRequest): Promise<AddVendorForEnquiryResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(MaterialRequisitionEnquiryApi.ADD,  payload )
            
        } catch (error) {

            console.error('ERROR: ADD VENDOR FOR ENQUIRY :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addVendorForEnquiry(payload);
            }
            throw error
        }
    }
}