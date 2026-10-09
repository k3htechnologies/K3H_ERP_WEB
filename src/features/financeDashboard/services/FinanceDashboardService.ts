import type { Failure } from '@/core/api/FailureResponse';


import * as E from 'fp-ts/Either';
import { FinanceDashboardDatasourceImpl } from '@/features/financeDashboard/datasources/FinanceDashboardDatasource';
import type { FinanceDashboardDatasetResponse } from '@/features/financeDashboard/models/FinanceDashboardModel';

const financeDashboardDatasource = new FinanceDashboardDatasourceImpl();

export const financeDashboardService = {

    apiCallPullFinanceDashboard: async (ProjectId: number, CompanyId?: number, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, FinanceDashboardDatasetResponse>> => {
        try {

            return E.right(await financeDashboardDatasource.pullFinanceDashboard(ProjectId, CompanyId, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
