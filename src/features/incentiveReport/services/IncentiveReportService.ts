import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationIncentiveReportRequest, IncentiveReportListResponse } from '@/features/incentiveReport/models/IncentiveReportModel'
import { IncentiveReportDatasourceImpl } from '@/features/incentiveReport/datasources/IncentiveReportDatasource';

const incentiveReportDatasource = new IncentiveReportDatasourceImpl();

export const incentiveReportService = {

    apiCallPullIncentiveReport: async (params: FilterWithPaginationIncentiveReportRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, IncentiveReportListResponse>> => {
        try {
            return E.right(await incentiveReportDatasource.pullIncentiveReport(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    }

}

