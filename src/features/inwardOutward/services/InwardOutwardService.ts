
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { InwardOutwardDatasourceImpl } from '@/features/inwardOutward/datasources/InwardOutwardDatasource';
import type { InwardOutwardListResponse, FilterWithPaginationInwardOutwardRequest } from '@/features/inwardOutward/models/InwardOutwardModel';

const InwardOutwardDatasource = new InwardOutwardDatasourceImpl();

export const inwardOutwardService = {

    apiCallPullInwardOutwardData: async (params: FilterWithPaginationInwardOutwardRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, InwardOutwardListResponse>> => {

        try {
            return E.right(await InwardOutwardDatasource.pullInwardOutwardData(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}