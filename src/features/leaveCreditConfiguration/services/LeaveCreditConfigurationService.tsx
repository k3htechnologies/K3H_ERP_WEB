import type { Failure } from '@/core/api/FailureResponse';
import { LeaveCreditConfigurationDatasourceImpl } from '@/features/leaveCreditConfiguration/datasources/LeaveCreditConfigurationDatasource'
import type {
    FilterWithPaginationLeaveCreditConfigurationRequest,
    AddUpdateLeaveCreditConfigurationRequest,
    DeleteLeaveCreditConfigurationRequest,
    LeaveCreditConfigurationListResponse,
    LeaveCreditConfigurationSaveResponse,
    LeaveCreditConfigurationDeleteResponse
} from '@/features/leaveCreditConfiguration/models/leaveCreditConfiguration';

import * as E from 'fp-ts/Either';

const leaveCreditConfigurationDatasource = new LeaveCreditConfigurationDatasourceImpl();

export const leaveCreditConfigurationService = {

    apiCallPullLeaveCreditConfiguration: async (params: FilterWithPaginationLeaveCreditConfigurationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LeaveCreditConfigurationListResponse>> => {
        try {

            return E.right(await leaveCreditConfigurationDatasource.pullLeaveCreditConfiguration(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLeaveCreditConfiguration: async (params: AddUpdateLeaveCreditConfigurationRequest): Promise<E.Either<Failure, LeaveCreditConfigurationSaveResponse>> => {
        try {

            return E.right(await leaveCreditConfigurationDatasource.addUpdateLeaveCreditConfiguration(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteLeaveCreditConfiguration: async (params: DeleteLeaveCreditConfigurationRequest): Promise<E.Either<Failure, LeaveCreditConfigurationDeleteResponse>> => {
        try {

            return E.right(await leaveCreditConfigurationDatasource.deleteLeaveCreditConfiguration(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}





