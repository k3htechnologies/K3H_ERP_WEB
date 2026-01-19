import type { Failure } from '@/core/api/FailureResponse';
import { DeductionMasterDatasourceImpl } from '@/features/deductionMaster/datasources/DeductionMasterDatasource'
import type {
    FilterWithPaginationDeductionMasterRequest,
    AddUpdateDeductionMasterRequest,
    DeleteDeductionMasterRequest,
    DeductionMasterListResponse,
    DeductionMasterSaveResponse,
    DeductionMasterDeleteResponse
} from '@/features/deductionMaster/models/DeductionMasterModel'

import * as E from 'fp-ts/Either';

const deductionMasterDatasource = new DeductionMasterDatasourceImpl();

export const deductionMasterService = {

    apiCallPullDeductionMaster: async (params: FilterWithPaginationDeductionMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, DeductionMasterListResponse>> => {
        try {
            
            return E.right(await deductionMasterDatasource.pullDeductionMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateDeductionMaster: async (params: AddUpdateDeductionMasterRequest): Promise<E.Either<Failure, DeductionMasterSaveResponse>> => {
        try {

            return E.right(await deductionMasterDatasource.addUpdateDeductionMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteDeductionMaster: async (params: DeleteDeductionMasterRequest): Promise<E.Either<Failure, DeductionMasterDeleteResponse>> => {
        try {

            return E.right(await deductionMasterDatasource.deleteDeductionMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
