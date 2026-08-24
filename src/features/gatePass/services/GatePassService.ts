import type { Failure } from '@/core/api/FailureResponse';
import { GatePassDatasourceImpl } from '@/features/gatePass/datasources/GatePassDatasource'
import type { FilterWithPaginationGatePassRequest, AddUpdateGatePassRequest, DeleteGatePassRequest, GatePassListResponse, GatePassSaveResponse, GatePassDeleteResponse } from '@/features/gatePass/models/GatePassModel'
import * as E from 'fp-ts/Either';

const gatePassDatasource = new GatePassDatasourceImpl();

export const gatePassService = {

    apiCallPullGatePass: async (params: FilterWithPaginationGatePassRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, GatePassListResponse>> => {
        try {

            return E.right(await gatePassDatasource.pullGatePass(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateGatePass: async (params: AddUpdateGatePassRequest): Promise<E.Either<Failure, GatePassSaveResponse>> => {
        try {

            return E.right(await gatePassDatasource.addUpdateGatePass(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteGatePass: async (params: DeleteGatePassRequest): Promise<E.Either<Failure, GatePassDeleteResponse>> => {
        try {

            return E.right(await gatePassDatasource.deleteGatePass(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
