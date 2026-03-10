
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { PerformanceReportDatasourceImpl } from '@/features/performanceReport/datasources/PerformanceReportDatasource';
import type { PerformanceReportListResponse, FilterWithPaginationPerformanceReportRequest } from '@/features/performanceReport/models/PerformanceReportModel';

const PerformanceReportDatasource = new PerformanceReportDatasourceImpl();

export const performanceReportService = {

    apiCallPullPerformanceReport: async (params: FilterWithPaginationPerformanceReportRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PerformanceReportListResponse>> => {

        try {
            return E.right(await PerformanceReportDatasource.pullPerformanceReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}