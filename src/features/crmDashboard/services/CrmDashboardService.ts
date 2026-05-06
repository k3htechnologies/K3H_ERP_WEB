import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { CrmDashboardDatasourceImpl } from '@/features/crmDashboard/datasources/CrmDashboardDatasource';
import type { CrmDashboardResponse } from '@/features/crmDashboard/models/CrmDashboardModel';

const CrmDashboardDatasource = new CrmDashboardDatasourceImpl();

export const crmDashboardService = {

    apiCallPullCrmDashboard: async (ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null, signal?: AbortSignal): Promise<E.Either<Failure, CrmDashboardResponse>> => {
        try {

            const response = await CrmDashboardDatasource.pullCrmDashboard(ProjectId, FilterType, FromDate, ToDate, signal);
            
            return E.right(response);

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
