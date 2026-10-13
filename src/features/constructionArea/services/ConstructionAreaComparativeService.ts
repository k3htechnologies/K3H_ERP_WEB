
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { ConstructionAreaComparativeDatasourceImpl } from '@/features/constructionArea/datasources/ConstructionAreaComparativeDatasource';
import type { ConstructionAreaComparativeListResponse, FilterWithConstructionAreaComparativeRequest } from '@/features/constructionArea/models/ConstructionAreaComparativeModel';

const ConstructionAreaComparativeDatasource = new ConstructionAreaComparativeDatasourceImpl();

export const constructionAreaComparativeService = {

    apiCallPullConstructionAreaComparative: async (params: FilterWithConstructionAreaComparativeRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ConstructionAreaComparativeListResponse>> => {

        try {
            return E.right(await ConstructionAreaComparativeDatasource.pullConstructionAreaComparative(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateConstructionAreaComparative: async (formData: FormData): Promise<E.Either<Failure, ConstructionAreaComparativeListResponse>> => {
        try {

            return E.right(await ConstructionAreaComparativeDatasource.addUpdateConstructionAreaComparative(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}