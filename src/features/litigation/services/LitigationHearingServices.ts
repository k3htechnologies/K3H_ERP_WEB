import type { Failure } from "@/core/api/FailureResponse";

import * as E from 'fp-ts/Either';
import type {

    DeleteLitigationHearingRequest,
    FilterWithPaginationLitigationHearingRequest,
    LitigationHearingDeleteResponse,
    LitigationHearingListResponse,
    LitigationHearingSaveResponse

} from "@/features/litigation/models/LitigationHearingModel";

import { LitigationHearingDatasourceImpl } from "../datasources/LitigationHearingDataSource";

export const LitigationHearingDataSource = new LitigationHearingDatasourceImpl();

export const litigationHearingService = {

    apiCallPullLitigationHearing: async (params: FilterWithPaginationLitigationHearingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LitigationHearingListResponse>> => {

        try {

            return E.right(await LitigationHearingDataSource.pullLitigationHearing(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLitigationHearing: async (formData: FormData): Promise<E.Either<Failure, LitigationHearingSaveResponse>> => {

        try {

            return E.right(await LitigationHearingDataSource.addUpadateLitigationHearing(formData));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteLitigationHearing: async (params: DeleteLitigationHearingRequest): Promise<E.Either<Failure, LitigationHearingDeleteResponse>> => {

        try {

            return E.right(await LitigationHearingDataSource.deleteLitigationHearing(params));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}

