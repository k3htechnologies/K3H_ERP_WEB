import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { UserDashboardDatasourceImpl } from '@/features/dashboard/datasources/UserDashboardDatasource';
import type { UserDashboardDatasetResponse } from '@/features/dashboard/models/UserDashboardModel';


const userDashboardDatasource = new UserDashboardDatasourceImpl();

export const userDashboardServices = {
    apiCallPullUserDashboard: async (signal?: AbortSignal): Promise<E.Either<Failure, UserDashboardDatasetResponse>> => {
        try {
            const response = await userDashboardDatasource.pullUserDashboard(signal);
            return E.right(response);
        } catch (error) {
            return E.left(error as Failure);
        }
    },
}
