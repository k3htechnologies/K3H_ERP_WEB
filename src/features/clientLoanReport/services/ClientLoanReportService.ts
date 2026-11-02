import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { ClientLoanReportDatasourceImpl } from '@/features/clientLoanReport/datasources/ClientLoanReportDatasource';
import type { FilterWithPaginationClientLoanReport, ClientLoanReportResponse } from '@/features/clientLoanReport/models/ClientLoanReportModel';

const clientReportDatasource = new ClientLoanReportDatasourceImpl();

export const clientLoanReportService = {

    apiCallPullClientLoanReport: async (params: FilterWithPaginationClientLoanReport, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ClientLoanReportResponse>> => {

        try {

            return E.right(await clientReportDatasource.pullClientLoanReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}