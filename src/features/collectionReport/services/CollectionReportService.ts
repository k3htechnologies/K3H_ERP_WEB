import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { CollectionReportDatasourceImpl } from '@/features/collectionReport/datasources/CollectionReportDatasource';
import type { FilterWithPaginationCollectionReportRequest, FilterWithPaginationProjectWiseRequest, ProjectWiseCollectionReportResponse, CollectionReportResponse } from '@/features/collectionReport/models/CollectionReportModel';

const collectionReportDatasource = new CollectionReportDatasourceImpl();

export const collectionReportService = {

    apiCallPullProjectWiseCollectionReport: async (params: FilterWithPaginationProjectWiseRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectWiseCollectionReportResponse>> => {
        try {
            return E.right(await collectionReportDatasource.pullProjectWiseCollectionReport(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullCollectionReport: async (params: FilterWithPaginationCollectionReportRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CollectionReportResponse>> => {
        try {
            return E.right(await collectionReportDatasource.pullCollectionReport(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    }

}