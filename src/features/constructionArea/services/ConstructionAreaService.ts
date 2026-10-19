
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { ConstructionAreaDatasourceImpl } from '@/features/constructionArea/datasources/ConstructionAreaDatasource';
import type { AddUpdateConstructionAreaRequest, ConstructionAreaListResponse, FilterWithPaginationConstructionAreaRequest } from '@/features/constructionArea/models/ConstructionAreaModel';

const ConstructionAreaDatasource = new ConstructionAreaDatasourceImpl();

export const constructionAreaService = {

    apiCallPullConstructionArea: async (params: FilterWithPaginationConstructionAreaRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ConstructionAreaListResponse>> => {

        try {
            return E.right(await ConstructionAreaDatasource.pullConstructionArea(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateConstructionArea: async (params: AddUpdateConstructionAreaRequest): Promise<E.Either<Failure, ConstructionAreaListResponse>> => {
        try {

            return E.right(await ConstructionAreaDatasource.addUpdateConstructionArea(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}