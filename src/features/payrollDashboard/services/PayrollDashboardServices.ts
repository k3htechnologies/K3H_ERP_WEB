import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { PayrollDashboardDatasourceImpl } from '@/features/payrollDashboard/datasources/PayrollDashboardDatasource';
import type { FilterWithPaginationPayrollDashboard, PayrollDashboardDatasetResponse } from '@/features/payrollDashboard/models/PayrollDashboardModel';

const payrollDashboardDatasource = new PayrollDashboardDatasourceImpl();

export const payrollDashboardService = {

    apiCallPullPayrollDashboard: async (params: FilterWithPaginationPayrollDashboard, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PayrollDashboardDatasetResponse>> => {
        try {

            return E.right(await payrollDashboardDatasource.pullPayrollDashboard(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }

}
