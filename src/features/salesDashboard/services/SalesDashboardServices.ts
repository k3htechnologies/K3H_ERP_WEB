import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { SalesDashboardDatasourceImpl } from '@/features/salesDashboard/datasources/SalesDashboardDataSource';
import type { SalesDashboardDatasetResponse } from '@/features/salesDashboard/models/SalesDashboardModel';

const salesDashboardDatasource = new SalesDashboardDatasourceImpl();

export const salesDashboardService = {
    apiCallPullSalesDashboard: async (signal?: AbortSignal): Promise<E.Either<Failure, SalesDashboardDatasetResponse>> => {
        try {
            const response = await salesDashboardDatasource.pullSalesDashboard(signal);
            return E.right(response);
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    }
}
