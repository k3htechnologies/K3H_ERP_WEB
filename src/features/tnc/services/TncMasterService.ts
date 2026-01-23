import type { Failure } from '@/core/api/FailureResponse';
import { TncMasterDatasourceImpl } from '@/features/tnc/datasources/TncMasterDatasource'
import type {
    FilterWithPaginationTncMasterRequest,
    AddUpdateTncMasterRequest,
    DeleteTncMasterRequest,
    TncMasterListResponse,
    TncMasterSaveResponse,
    TncMasterDeleteResponse
} from '@/features/tnc/models/TncMasterModel';

import * as E from 'fp-ts/Either';

const tncMasterDatasource = new TncMasterDatasourceImpl();

export const tncMasterService = {

    apiCallPullTncMaster: async (params: FilterWithPaginationTncMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TncMasterListResponse>> => {
        try {

            return E.right(await tncMasterDatasource.pullTncMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTncMaster: async (params: AddUpdateTncMasterRequest): Promise<E.Either<Failure, TncMasterSaveResponse>> => {
        try {

            return E.right(await tncMasterDatasource.addUpdateTncMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteTncMaster: async (params: DeleteTncMasterRequest): Promise<E.Either<Failure, TncMasterDeleteResponse>> => {
        try {

            return E.right(await tncMasterDatasource.deleteTncMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
