import type { Failure } from '@/core/api/FailureResponse';
import { PayTrackRentDatasourceImpl } from '@/features/payTrackRent/datasources/PayTrackRentDatasource'
import type {
    FilterWithPaginationPayTrackRentRequest,
    PayTrackRentLedgerListResponse,
    DeletePayTrackRentRequest,
    PayTrackRentDeleteResponse,
    PayTrackRentSaveResponse,
} from '@/features/payTrackRent/models/PayTrackRentModel'

import * as E from 'fp-ts/Either';

const payTrackRentDatasource = new PayTrackRentDatasourceImpl();

export const payTrackRentService = {

    apiCallPullPayTrackRentLedger: async (params: FilterWithPaginationPayTrackRentRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PayTrackRentLedgerListResponse>> => {
        try {

            return E.right(await payTrackRentDatasource.pullPayTrackRentLedger(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdatePayTrackRent: async (data: FormData): Promise<E.Either<Failure, PayTrackRentSaveResponse>> => {
        try {

            return E.right(await payTrackRentDatasource.addUpdatePayTrackRent(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeletePayTrackRent: async (params: DeletePayTrackRentRequest): Promise<E.Either<Failure, PayTrackRentDeleteResponse>> => {
        try {

            return E.right(await payTrackRentDatasource.deletePayTrackRent(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}

