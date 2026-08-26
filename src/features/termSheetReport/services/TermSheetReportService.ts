import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { TermSheetReportDatasourceImpl } from '@/features/termSheetReport/datasources/TermSheetReportDatasource';
import type { FilterWithPaginationTermSheetReportRequest, TermSheetReportListResponse } from '@/features/termSheetReport/models/TermSheetReportModel';

const termSheetReportDatasource = new TermSheetReportDatasourceImpl();

export const termSheetReportService = {

    apiCallPullTermSheetReport: async (params: FilterWithPaginationTermSheetReportRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TermSheetReportListResponse>> => {
        try {

            return E.right(await termSheetReportDatasource.pullTermSheetReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}

