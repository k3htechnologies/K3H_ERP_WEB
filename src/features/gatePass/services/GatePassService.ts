import type { Failure } from '@/core/api/FailureResponse';
import { GatePassDatasourceImpl } from '@/features/gatePass/datasources/GatePassDatasource'
import type { FilterWithPaginationGatePassRequest, DeleteGatePassRequest, GatePassListResponse, GatePassSaveResponse, GatePassDeleteResponse, UpdateGatePassOutRequest, GatePassOutResponse } from '@/features/gatePass/models/GatePassModel'
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

    apiCallAddUpdateGatePass: async (FormData: FormData): Promise<E.Either<Failure, GatePassSaveResponse>> => {
        try {

            return E.right(await gatePassDatasource.addUpdateGatePass(FormData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallUpdateGatePassOutRequest: async (parms: UpdateGatePassOutRequest): Promise<E.Either<Failure, GatePassOutResponse>> => {
        try {

            return E.right(await gatePassDatasource.updateGatePassOutRequest(parms));

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
