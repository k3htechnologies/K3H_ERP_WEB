import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import type { DeleteMaterialRequisitionRequest, FilterMaterialRequisitionDetails, FilterMaterialRequisitionOverview, FilterWithPaginationMaterialRequisition, MaterialRequisitionDeleteResponse, MaterialRequisitionDetailsResponse, MaterialRequisitionListResponse, MaterialRequisitionOverviewResponse, MaterialRequisitionSaveReponse } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { MaterialRequisitionDatasourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionDataSource";

const materialRequisitionDatasource = new MaterialRequisitionDatasourceImpl

export const materialRequisitionService = {
   
    apiCallPullMaterialRequisition: async (params: FilterWithPaginationMaterialRequisition, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionListResponse>> => {
        try {
    
            return E.right(await materialRequisitionDatasource.pullMaterialRequisition(params, options?.signal));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },

    apiCallPullMaterialRequisitionOverview: async (params: FilterMaterialRequisitionOverview, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionOverviewResponse>> => {
        try {
    
            return E.right(await materialRequisitionDatasource.pullMaterialRequisitionOverview(params, options?.signal));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },

    apiCallPullMaterialRequisitionDetails: async (params: FilterMaterialRequisitionDetails, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionDetailsResponse>> => {
        try {
    
            return E.right(await materialRequisitionDatasource.pullMaterialRequisitionDetails(params, options?.signal));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
    
    apiCallToAddMaterialRequisition: async (FormData: FormData): Promise<E.Either<Failure, MaterialRequisitionSaveReponse>> => {
        try {
    
            return E.right(await materialRequisitionDatasource.addUpdateMaterialRequisition(FormData));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },
    
    apiCallDeleteMaterialRequisition: async (params: DeleteMaterialRequisitionRequest): Promise<E.Either<Failure, MaterialRequisitionDeleteResponse>> => {
        try {
    
            return E.right(await materialRequisitionDatasource.deleteMaterialRequisition(params));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
        
    },
        
    apiCallCloseMaterialRequisition: async (payload: DeleteMaterialRequisitionRequest): Promise<E.Either<Failure, MaterialRequisitionDeleteResponse>> => {
        try {
    
            return E.right(await materialRequisitionDatasource.closeMaterialRequisition(payload));

        } catch (error: any) {
            
            return E.left({ message: error.message, code: error.code });
            
        }
    }
}