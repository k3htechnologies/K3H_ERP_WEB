import type { Failure } from "@/core/api/FailureResponse";

import * as E from 'fp-ts/Either';
import type {

    FilterWithPaginationLitigationClosureRequest,
    LitigationClosureListResponse,
    LitigationClosureSaveResponse

} from "@/features/litigation/models/LitigationClosureModel";

import { LitigationClosureDatasourceImpl } from "@/features/litigation/datasources/LitigationClosureDataSource";

export const LitigationClosureDataSource = new LitigationClosureDatasourceImpl();

export const litigationClosureService = {

    apiCallPullLitigationClosure: async (params: FilterWithPaginationLitigationClosureRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LitigationClosureListResponse>> => {

        try {

            return E.right(await LitigationClosureDataSource.pullLitigationClosure(params, options?.signal));
            
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLitigationClosure: async (formData: FormData): Promise<E.Either<Failure, LitigationClosureSaveResponse>> => {

        try {

            return E.right(await LitigationClosureDataSource.addUpadateLitigationClosure(formData));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}

