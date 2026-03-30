import type { Failure } from '@/core/api/FailureResponse';
import type { AddUpdateInwardAndOutWardRequest, DeleteInwardAndOutWardRequest, FilterWithPaginationInwardAndOutWardRequest, InwardAndOutWardDeleteResponse, InwardAndOutWardListResponse, InwardAndOutWardSaveResponse } from '@/features/inwardAndOutWard/models/InwardAndOutWardModel';

import * as E from 'fp-ts/Either';
import { InwardDatasourceImpl } from '../datasources/InwardAndOutWardDataSource';

const InwardDatasource = new InwardDatasourceImpl();

export const InwardService = {

    apiCallPullInward: async (params: FilterWithPaginationInwardAndOutWardRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, InwardAndOutWardListResponse>> => {

        try {

            return E.right(await InwardDatasource.pullInward(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateInward: async (params: AddUpdateInwardAndOutWardRequest): Promise<E.Either<Failure, InwardAndOutWardSaveResponse>> => {
        try {

            return E.right(await InwardDatasource.addUpdateInward(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteInward: async (params: DeleteInwardAndOutWardRequest): Promise<E.Either<Failure, InwardAndOutWardDeleteResponse>> => {
        try {

            return E.right(await InwardDatasource.deleteInwardRequest(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}


