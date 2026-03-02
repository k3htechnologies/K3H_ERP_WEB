
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { SourcingTargetDatasourceImpl } from '@/features/target/datasources/SourcingTargetDatasource';
import type { SourcingTargetListResponse, FilterWithPaginationSourcingTargetRequest } from '@/features/target/models/SourcingTargetModel';

const SourcingTargetDatasource = new SourcingTargetDatasourceImpl();

export const sourcingTargetService = {

    apiCallPullSourcingTarget: async (params: FilterWithPaginationSourcingTargetRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, SourcingTargetListResponse>> => {

        try {
            return E.right(await SourcingTargetDatasource.pullSourcingTarget(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}