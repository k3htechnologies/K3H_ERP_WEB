import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationIbmObmReportRequest, IbmObmReportResponse } from '@/features/ibmObmReport/models/IbmObmReportModel';
import { IbmObmReportDatasourceImpl } from '@/features/ibmObmReport/datasources/IbmObmReportDatasource';

const ibmObmReportDatasource = new IbmObmReportDatasourceImpl();

export const ibmObmReportService = {

    apiCallPullIbmObmReport: async (params: FilterWithPaginationIbmObmReportRequest): Promise<E.Either<Failure, IbmObmReportResponse>> => {
        try {

            return E.right(await ibmObmReportDatasource.pullIbmObmReport(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
