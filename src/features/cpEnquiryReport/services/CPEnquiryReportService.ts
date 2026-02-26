import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { CPEnquiryReportDatasourceImpl } from '@/features/cpEnquiryReport/datasources/CPEnquiryReportDatasource';
import type { CPEnquiryReportResponse, FilterWithPaginationCPEnquiryReportRequest } from '@/features/cpEnquiryReport/models/CPEnquiryReportModel';

const cpEnquiryReportDatasource = new CPEnquiryReportDatasourceImpl();

export const cpEnquiryReportService = {

    apiCallPullCPEnquiryReport: async (params: FilterWithPaginationCPEnquiryReportRequest): Promise<E.Either<Failure, CPEnquiryReportResponse>> => {
        try {

            return E.right(await cpEnquiryReportDatasource.pullCPEnquiryReport(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
