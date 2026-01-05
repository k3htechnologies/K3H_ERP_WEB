import type { Failure } from "@/core/api/FailureResponse";
import { LitigationDatasourceImpl } from '@/features/litigation/datasources/LitigationDataSource';
import type {
    DeleteLitigationRequest,
    FilterWithPaginationLitigationRequest,
    LitigationDeleteResponse,
    LitigationListResponse,
    LitigationSaveResponse
} from '@/features/litigation/models/LitigationModel'

import * as E from 'fp-ts/Either';

export const LitigationDataSource = new LitigationDatasourceImpl();

export const LitigationService = {

    apiCallPullLitigation: async (params: FilterWithPaginationLitigationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LitigationListResponse>> => {

        try {

            return E.right(await LitigationDataSource.pullLitigation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateLitigation: async (formData: FormData): Promise<E.Either<Failure, LitigationSaveResponse>> => {

        try {

            return E.right(await LitigationDataSource.addUpadateLitigation(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteLitigation: async (params: DeleteLitigationRequest): Promise<E.Either<Failure, LitigationDeleteResponse>> => {

        try {

            return E.right(await LitigationDataSource.deleteLitigation(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}