import type { Failure } from '@/core/api/FailureResponse';
import { FlatAlterationCrmDatasourceImpl } from '@/features/crmPayTrack/datasources/FlatAlterationCrmDatasource'
import type {
    FilterWithPaginationFlatAlterationRequest,
    FlatAlterationRequestListResponse,
    AddUpdateFlatAlterationRequest,
    FlatAlterationRequestSaveReponse
} from '@/features/crmPayTrack/models/FlatAlterationRequestModel';

import * as E from 'fp-ts/Either';

const flatAlterationCrmDatasource = new FlatAlterationCrmDatasourceImpl();

export const flatAlterationService = {

    apiCallPullFlatAlterationRequest: async (params: FilterWithPaginationFlatAlterationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, FlatAlterationRequestListResponse>> => {
        try {

            return E.right(await flatAlterationCrmDatasource.pullFlatAlterationRequest(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateFlatAlterationRequest: async (params: AddUpdateFlatAlterationRequest): Promise<E.Either<Failure, FlatAlterationRequestSaveReponse>> => {
        try {

            return E.right(await flatAlterationCrmDatasource.addUpdateFlatAlterationRequest(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}