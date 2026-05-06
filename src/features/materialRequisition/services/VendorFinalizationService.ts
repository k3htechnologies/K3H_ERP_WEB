import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import { VendorFinalizationDatasourceImpl } from "@/features/materialRequisition/datasources/VendorFinalizationDataSource";
import type { AddVendorForEnquiryRequest, AddVendorForEnquiryRequestResponse, FilterWithPaginationVendorForEnquiryRequest, FilterWithPaginationVendorForSelectedEnquiryRequest, SelectedVendorListResponse } from "@/features/materialRequisition/models/VendorFinalizeModel";
import type { VendorListResponse } from "@/features/vendor/models/VendorModel";


const VendorFinalizationDatasource = new VendorFinalizationDatasourceImpl

export const vendorFinalizationService = {
   

    
    apiCallpullVendorsForEnquiry: async (params: FilterWithPaginationVendorForEnquiryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, VendorListResponse>> => {
        try {
    
            return E.right(await VendorFinalizationDatasource.pullVendorsForEnquiry(params, options?.signal));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
    
    apiCallToAddVendorForEnquiry: async (payload: AddVendorForEnquiryRequest): Promise<E.Either<Failure, VendorListResponse>> => {
        try {
    
            return E.right(await VendorFinalizationDatasource.addVendorForEnquiry(payload));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
    
    apiCallPullSelectedVendorForEnquiry: async (params:FilterWithPaginationVendorForSelectedEnquiryRequest ): Promise<E.Either<Failure, SelectedVendorListResponse>> => {
        try {
    
            return E.right(await VendorFinalizationDatasource.pullSelectedVendorForEnquiry(params));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
        
    },
        
    apiCallAddFinalizedVendor: async (payload: AddVendorForEnquiryRequest): Promise<E.Either<Failure, VendorListResponse>> => {
        try {
    
            return E.right(await VendorFinalizationDatasource.addFinalizedVendor(payload));

        } catch (error: any) {
            
            return E.left({ message: error.message, code: error.code });

            
        }
    },
    apiCallPullFinalizedVendor: async (params: FilterWithPaginationVendorForEnquiryRequest): Promise<E.Either<Failure, VendorListResponse>> => {
        try {
    
            return E.right(await VendorFinalizationDatasource.pullFinalizedVendor(params));

        } catch (error: any) {
            
            return E.left({ message: error.message, code: error.code });

            
        }
    } 
}