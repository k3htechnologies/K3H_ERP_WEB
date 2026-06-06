import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { SalesDashboardDatasourceImpl } from '@/features/salesDashboard/datasources/SalesDashboardDataSource';
import type { EnquiryOutTimeSaveResponse, SalesDashboardDatasetResponse, UpdateEnquiryOutTimeRequest } from '@/features/salesDashboard/models/SalesDashboardModel';

const salesDashboardDatasource = new SalesDashboardDatasourceImpl();

export const salesDashboardService = {

    apiCallPullSalesDashboard: async (ProjectId: number, FilterType?: string | null, FromDate?: string | null, ToDate?: string  | null, signal?: AbortSignal): Promise<E.Either<Failure, SalesDashboardDatasetResponse>> => {
        try {

            return E.right(await salesDashboardDatasource.pullSalesDashboard(ProjectId, FilterType ?? "", FromDate ?? "",ToDate ?? "", signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallUpdateEnquiryOutTime: async (params: UpdateEnquiryOutTimeRequest): Promise<E.Either<Failure, EnquiryOutTimeSaveResponse>> => {

        try {

            return E.right(await salesDashboardDatasource.UpadateEnquiryOutTime(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}
