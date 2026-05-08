import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import { MaterialRequisitionQuotationDatasourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionQuotationDataSource";
import type { AddVendorForEnquiryRequest } from "@/features/materialRequisition/models/VendorFinalizeModel";
import type { AddUpdateMaterialRequestQuotation, DeleteMaterialRequisitionQuotation, MaterialRequisitionQuotationListResponse, MaterialRequisitionQuotationSaveReponse } from "@/features/materialRequisition/models/MaterialRequisitionQuotationApi";

const materialRequisitionQuotationDatasource = new MaterialRequisitionQuotationDatasourceImpl

export const materialRequisitionQuotationService = {
   
    apiCallPullMaterialRequisitionQuotation: async (params: AddVendorForEnquiryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionQuotationListResponse>> => {
        try {
    
            return E.right(await materialRequisitionQuotationDatasource.pullMaterialRequisitionQuotation(params, options?.signal));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
    
    apiCallToAddMaterialRequisitionQuotation: async (payload: AddUpdateMaterialRequestQuotation): Promise<E.Either<Failure, MaterialRequisitionQuotationSaveReponse>> => {
        try {
    
            return E.right(await materialRequisitionQuotationDatasource.addUpdateMaterialRequisitionQuotation(payload));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
    
    apiCallDeleteMaterialRequisitionQuotation: async (params: DeleteMaterialRequisitionQuotation): Promise<E.Either<Failure, DeleteMaterialRequisitionQuotation>> => {
        try {
    
            return E.right(await materialRequisitionQuotationDatasource.deleteMaterialRequisitionQuotation(params));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
        
    },
        
}