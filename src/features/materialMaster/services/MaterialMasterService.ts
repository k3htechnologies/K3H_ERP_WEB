import type { Failure } from "@/core/api/FailureResponse";
import { MaterialMasterDatasourceImpl } from "@/features/materialMaster/datasources/MaterialMasterDatasource";
import type { AddUpdateMaterialMasterRequest, DeleteMaterialMasterRequest, FilterWithPaginationMaterialMaster, MaterialMasterDeleteResponse, MaterialMasterListResponse, MaterialMasterSaveReponse } from "../models/MaterialMasterModel";
import * as E from 'fp-ts/Either';


const materialMasterDatasource = new MaterialMasterDatasourceImpl

export const materialMasterService = {
   

    
        apiCallPullMaterialMaster: async (params: FilterWithPaginationMaterialMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialMasterListResponse>> => {
            try {
    
                return E.right(await materialMasterDatasource.pullMaterialMaster(params, options?.signal));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
    
            }
        },
    
        apiCallToAddUpdateMaterialMaster: async (params: AddUpdateMaterialMasterRequest): Promise<E.Either<Failure, MaterialMasterSaveReponse>> => {
            try {
    
                return E.right(await materialMasterDatasource.addUpdateMaterialMaster(params));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
    
            }
        },
    
        apiCallDeleteMaterialMaster: async (params: DeleteMaterialMasterRequest): Promise<E.Either<Failure, MaterialMasterDeleteResponse>> => {
            try {
    
                return E.right(await materialMasterDatasource.deleteMaterialMaster(params));
    
            } catch (error: any) {
    
                return E.left({ message: error.message, code: error.code });
    
            }
        },
}