import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { AccountDashboardDatasourceImpl } from '@/features/accountDashboard/datasources/AccountDashboardDatasource';
import type { AccountDashboardDatasetResoponse } from '@/features/accountDashboard/models/AccountDashboardModel';

const accountDashboardDatasource = new AccountDashboardDatasourceImpl();

export const accountDashboardService = {

    apiCallPullAccountDashboard: async (CompanyId: number, FinancialYear?: string, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AccountDashboardDatasetResoponse>> => {

        try {

            return E.right(await accountDashboardDatasource.pullAccountDashboard(CompanyId, FinancialYear, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}























