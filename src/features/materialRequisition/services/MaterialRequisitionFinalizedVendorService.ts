import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import { MaterialRequisitionFinalizedVendorDataSourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionFinalizedVendorDataSource";
import type { AddFinalizedVendorRequest, FilterMaterialWiseQuotationRequest, MaterialWiseQuotationResponse, RevokeFinalizationVendorRequest, RevokeFinalizationVendorResponse } from "@/features/materialRequisition/models/MaterialRequisitionFinalizedVendorModel";

const MaterialRequisitionFinalizedVendorDatasource = new MaterialRequisitionFinalizedVendorDataSourceImpl

export const materialRequisitionFinalizedVendorService = {
   
    apiCallAddFinalizedVendor: async (payload: AddFinalizedVendorRequest): Promise<E.Either<Failure, MaterialWiseQuotationResponse>> => {
        try {
    
            return E.right(await MaterialRequisitionFinalizedVendorDatasource.addFinalizedVendor(payload));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
    
    apiCallPullMaterialWiseQuotation: async (params:FilterMaterialWiseQuotationRequest ): Promise<E.Either<Failure, MaterialWiseQuotationResponse>> => {
        try {
    
            return E.right(await MaterialRequisitionFinalizedVendorDatasource.pullMaterialWiseQuotation(params));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }  
    },
    

    apiCallRevokeFinalizationVendor: async (params: RevokeFinalizationVendorRequest): Promise<E.Either<Failure, RevokeFinalizationVendorResponse>> => {
        try {
    
            return E.right(await MaterialRequisitionFinalizedVendorDatasource.revokeFinalizationVendor(params));

        } catch (error: any) {
            
            return E.left({ message: error.message, code: error.code });

        }
    }  
}