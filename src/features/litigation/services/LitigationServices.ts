import type { Failure } from "@/core/api/FailureResponse";
import { LitigationDatasourceImpl } from '@/features/litigation/datasources/LitigationDataSource';
import type {
    FilterWithPaginationLitigationRequest,
    LitigationListResponse,
    LitigationSaveResponse,
    LitigationDeleteResponse,
    LitigationHearingListResponse,
    LitigationHearingSaveResponse,
    LitigationHearingDeleteResponse,
    LitigationClosureListResponse,
    LitigationClosureSaveResponse,
    DeleteLitigationHearingRequest,
    DeleteLitigationRequest,
    FilterWithPaginationLitigationClosureRequest,
    FilterWithPaginationLitigationHearingRequest,
    AddUpdateLitigationRequest,
} from '@/features/litigation/models/LitigationModel'

import * as E from 'fp-ts/Either';

export const LitigationDataSource = new LitigationDatasourceImpl();

export const litigationService = {

    apiCallPullLitigation: async (params: FilterWithPaginationLitigationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LitigationListResponse>> => {

        try {

            return E.right(await LitigationDataSource.pullLitigation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateLitigation: async (params: AddUpdateLitigationRequest): Promise<E.Either<Failure, LitigationSaveResponse>> => {

        try {

            return E.right(await LitigationDataSource.addUpadateLitigation(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullLitigationHearing: async (params: FilterWithPaginationLitigationHearingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LitigationHearingListResponse>> => {

        try {

            return E.right(await LitigationDataSource.pullLitigationHearing(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLitigationHearing: async (formData: FormData): Promise<E.Either<Failure, LitigationHearingSaveResponse>> => {

        try {

            return E.right(await LitigationDataSource.addUpadateLitigationHearing(formData));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullLitigationClosure: async (params: FilterWithPaginationLitigationClosureRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LitigationClosureListResponse>> => {

        try {

            return E.right(await LitigationDataSource.pullLitigationClosure(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLitigationClosure: async (formData: FormData): Promise<E.Either<Failure, LitigationClosureSaveResponse>> => {

        try {

            return E.right(await LitigationDataSource.addUpadateLitigationClosure(formData));
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

    apiCallDeleteLitigationHearing: async (params: DeleteLitigationHearingRequest): Promise<E.Either<Failure, LitigationHearingDeleteResponse>> => {

        try {

            return E.right(await LitigationDataSource.deleteLitigationHearing(params));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}

