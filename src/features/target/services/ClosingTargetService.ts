
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { ClosingTargetDatasourceImpl } from '@/features/target/datasources/ClosingTargetDatasource';
import type { ClosingTargetListResponse, FilterWithPaginationClosingTargetRequest } from '@/features/target/models/ClosingTargetModel';

const ClosingTargetDatasource = new ClosingTargetDatasourceImpl();

export const closingTargetService = {

    apiCallPullClosingTarget: async (params: FilterWithPaginationClosingTargetRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ClosingTargetListResponse>> => {

        try {
            return E.right(await ClosingTargetDatasource.pullClosingTarget(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}