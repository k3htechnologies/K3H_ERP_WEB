import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { DailyCollectionReportDatasourceImpl } from '@/features/dailyCollectionReport/datasources/DailyCollectionReportDatasource';
import type {
    FilterWithPaginationDailyCollectionReportModel,
    DailyCollectionReportListResponse
} from "@/features/dailyCollectionReport/models/DailyCollectionReportModel";

const DailyCollectionReportDatasource = new DailyCollectionReportDatasourceImpl();

export const dailyCollectionReportService = {

    apiCallPullDailyCollectionReport: async (params: FilterWithPaginationDailyCollectionReportModel, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, DailyCollectionReportListResponse>> => {

        try {
            return E.right(await DailyCollectionReportDatasource.pullDailyCollectionReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}

