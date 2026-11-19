import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import type { FilterPullVendorForEnquiryRequest,PullVendorForEnquiryListResponse,AddVendorForEnquiryRequest,AddVendorForEnquiryResponse } from "@/features/materialRequisition/models/MaterialRequisitionEnquiryModel";
import { MaterialRequisitionEnquiryDataSourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionEnquiryDataSource";

const MaterialRequisitionEnquiryDataSource = new MaterialRequisitionEnquiryDataSourceImpl

export const materialRequisitionEnquiryService = {
   
    apiCallpullVendorsForEnquiry: async (params: FilterPullVendorForEnquiryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PullVendorForEnquiryListResponse>> => {
        try {
    
            return E.right(await MaterialRequisitionEnquiryDataSource.pullVendorsForEnquiry(params, options?.signal));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
    
    apiCallAddVendorForEnquiry: async (payload: AddVendorForEnquiryRequest): Promise<E.Either<Failure, AddVendorForEnquiryResponse>> => {
        try {
    
            return E.right(await MaterialRequisitionEnquiryDataSource.addVendorForEnquiry(payload));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
     
}