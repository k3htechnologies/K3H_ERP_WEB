import type { Failure } from '@/core/api/FailureResponse';
import { UomMasterDatasourceImpl } from '@/features/uomMaster/datasources/UOMMasterDatasource'
import type {
    AddUpdateUomMasterRequest,
    DeleteUomMasterRequest,
    UomMasterListResponse,
    UomMasterDeleteResponse,
    FilterWithPaginationUomMaster,
    UomMasterSaveReponse
} from '@/features/uomMaster/models/UOMMasterModel';

import * as E from 'fp-ts/Either';

const uomMasterDatasource = new UomMasterDatasourceImpl();

export const uomMasterService = {

    apiCallPullUomMaster: async (params: FilterWithPaginationUomMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, UomMasterListResponse>> => {
        try {
            return E.right(await uomMasterDatasource.pullUomMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateUomMaster: async (params: AddUpdateUomMasterRequest): Promise<E.Either<Failure, UomMasterSaveReponse>> => {
        try {

            return E.right(await uomMasterDatasource.addUpdateUomMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteUomMaster: async (params: DeleteUomMasterRequest): Promise<E.Either<Failure, UomMasterDeleteResponse>> => {
        try {

            return E.right(await uomMasterDatasource.deleteUomMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
