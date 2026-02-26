import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { EnquiryReportDatasourceImpl } from '@/features/enquiryReport/datasources/EnquiryReportDatasource';
import type { EnquiryReportResponse, FilterWithPaginationEnquiryReportRequest } from '@/features/enquiryReport/models/EnquiryReportModel';

const enquiryReportDatasource = new EnquiryReportDatasourceImpl();

export const enquiryReportService = {

    apiCallPullEnquiryReport: async (params: FilterWithPaginationEnquiryReportRequest): Promise<E.Either<Failure, EnquiryReportResponse>> => {
        try {

            return E.right(await enquiryReportDatasource.pullEnquiryReport(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
