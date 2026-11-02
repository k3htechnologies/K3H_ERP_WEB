import type { Failure } from '@/core/api/FailureResponse';
import { BaselineCostPlanDocumentCategoryMasterDatasourceImpl } from '@/features/baselineCostPlanDocumentCategory/datasources/BaselineCostPlanDocumentCategoryMasterDatasource'
import type {
    AddUpdateBaselineCostPlanDocumentCategoryMasterRequest,
    DeleteBaselineCostPlanDocumentCategoryMasterRequest,
    BaselineCostPlanDocumentCategoryMasterListResponse,
    BaselineCostPlanDocumentCategoryMasterDeleteResponse,
    FilterWithPaginationBaselineCostPlanDocumentCategoryMaster,
    BaselineCostPlanDocumentCategoryMasterSaveReponse
} from '@/features/baselineCostPlanDocumentCategory/models/BaselineCostPlanDocumentCategoryMasterModel';

import * as E from 'fp-ts/Either';

const baselineCostPlanDocumentCategoryMasterDatasource = new BaselineCostPlanDocumentCategoryMasterDatasourceImpl();

export const baselineCostPlanDocumentCategoryMasterService = {

    apiCallPullBaselineCostPlanDocumentCategoryMaster: async (params: FilterWithPaginationBaselineCostPlanDocumentCategoryMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BaselineCostPlanDocumentCategoryMasterListResponse>> => {
       
        try {
            return E.right(await baselineCostPlanDocumentCategoryMasterDatasource.pullBaselineCostPlanDocumentCategoryMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBaselineCostPlanDocumentCategoryMaster: async (params: AddUpdateBaselineCostPlanDocumentCategoryMasterRequest): Promise<E.Either<Failure, BaselineCostPlanDocumentCategoryMasterSaveReponse>> => {
        
        try {

            return E.right(await baselineCostPlanDocumentCategoryMasterDatasource.addUpdateBaselineCostPlanDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteBaselineCostPlanDocumentCategoryMaster: async (params: DeleteBaselineCostPlanDocumentCategoryMasterRequest): Promise<E.Either<Failure, BaselineCostPlanDocumentCategoryMasterDeleteResponse>> => {
        
        try {

            return E.right(await baselineCostPlanDocumentCategoryMasterDatasource.deleteBaselineCostPlanDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
