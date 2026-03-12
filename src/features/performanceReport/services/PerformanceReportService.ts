
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { PerformanceReportDatasourceImpl } from '@/features/performanceReport/datasources/PerformanceReportDatasource';
import type { PerformanceReportClosingListResponse,
    FilterWithPaginationPerformanceReportRequest,
    PerformanceReportSourcingListResponse } from '@/features/performanceReport/models/PerformanceReportModel';

const PerformanceReportDatasource = new PerformanceReportDatasourceImpl();

export const performanceReportService = {

    apiCallPullPerformanceReportClosing: async (params: FilterWithPaginationPerformanceReportRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PerformanceReportClosingListResponse>> => {

        try {
            return E.right(await PerformanceReportDatasource.pullPerformanceReportClosing(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

     apiCallPullPerformanceReportSourcing: async (params: FilterWithPaginationPerformanceReportRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PerformanceReportSourcingListResponse>> => {

        try {
            return E.right(await PerformanceReportDatasource.pullPerformanceReportSourcing(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}