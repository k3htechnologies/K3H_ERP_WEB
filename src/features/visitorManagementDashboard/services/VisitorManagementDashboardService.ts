import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { VisitorManagementDashboardDatasourceImpl } from '@/features/visitorManagementDashboard/datasources/VisitorManagementDashboardDatasource';
import type { FilterVisitorManagementDashboardRequest, VisitorManagementDashboardResponse } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';

const visitorManagementDashboardDatasource = new VisitorManagementDashboardDatasourceImpl();

export const visitorManagementDashboardService = {

    apiCallPullVisitorManagementDashboard: async (params: FilterVisitorManagementDashboardRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, VisitorManagementDashboardResponse>> => {
        try {

            return E.right(await visitorManagementDashboardDatasource.pullVisitorManagementDashboard(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }

}
