import type { Failure } from '@/core/api/FailureResponse';
import { LeaveCreditDebitDatasourceImpl } from '@/features/leaveCreditDebit/datasources/LeaveCreditDebitDatasource '
import type {
    FilterWithPaginationLeaveCreditDebitRequest,
    AddUpdateLeaveCreditDebitRequest,
    DeleteLeaveCreditDebitRequest,
    LeaveCreditDebitListResponse,
    LeaveCreditDebitSaveResponse,
    LeaveCreditDebitDeleteResponse
} from '@/features/leaveCreditDebit/models/leaveCreditDebit';

import * as E from 'fp-ts/Either';

const leaveCreditDebitDatasource = new LeaveCreditDebitDatasourceImpl();

export const leaveCreditDebitService = {

    apiCallPullLeaveCreditDebit: async (params: FilterWithPaginationLeaveCreditDebitRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LeaveCreditDebitListResponse>> => {
        try {

            return E.right(await leaveCreditDebitDatasource.pullLeaveCreditDebit(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLeaveCreditDebit: async (params: AddUpdateLeaveCreditDebitRequest): Promise<E.Either<Failure, LeaveCreditDebitSaveResponse>> => {
        try {

            return E.right(await leaveCreditDebitDatasource.addUpdateLeaveCreditDebit(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteLeaveCreditDebit: async (params: DeleteLeaveCreditDebitRequest): Promise<E.Either<Failure, LeaveCreditDebitDeleteResponse>> => {
        try {

            return E.right(await leaveCreditDebitDatasource.deleteLeaveCreditDebit(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}



