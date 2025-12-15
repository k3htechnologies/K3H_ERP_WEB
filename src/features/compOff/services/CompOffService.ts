import type { Failure } from '@/core/api/FailureResponse';
import { CompOffDatasourceImpl } from '@/features/compOff/datasources/CompOffDatasource'
import type {
    FilterWithPaginationCompOff,
    AddUpdateCompOff,
    DeleteCompOffRequest,
    CompOffListResponse,
    CompOffSaveResponse,
    CompOffDeleteResponse,
} from '@/features/compOff/models/compOff';

import * as E from 'fp-ts/Either';

const compOffDatasource = new CompOffDatasourceImpl();

export const CompOffService = {

    apiCallPullCompOff: async (params: FilterWithPaginationCompOff, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CompOffListResponse>> => {
        try {

            return E.right(await compOffDatasource.pullCompOff(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateCompOff: async (params: AddUpdateCompOff): Promise<E.Either<Failure, CompOffSaveResponse>> => {
        try {

            return E.right(await compOffDatasource.addUpdateCompOff(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteCompOff: async (params: DeleteCompOffRequest): Promise<E.Either<Failure, CompOffDeleteResponse>> => {
        try {

            return E.right(await compOffDatasource.deleteCompOff(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}

