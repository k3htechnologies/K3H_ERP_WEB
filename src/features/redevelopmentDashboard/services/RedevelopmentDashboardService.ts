import type { Failure } from '@/core/api/FailureResponse';


import * as E from 'fp-ts/Either';
import { RedevelopmentDashboardDatasourceImpl } from '@/features/redevelopmentDashboard/datasources/RedevelopmentDashboardDatasource';
import type { RedevelopmentDashboardDatasetResponse } from '@/features/redevelopmentDashboard/models/RedevelopmentDashboardModel';

const redevelopmentDashboardDatasource = new RedevelopmentDashboardDatasourceImpl();

export const redevelopmentDashboardService = {

    apiCallPullRedevelopmentDashboard: async (ProjectId: number, BuildingId?: number, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, RedevelopmentDashboardDatasetResponse>> => {
        try {

            return E.right(await redevelopmentDashboardDatasource.pullRedevelopmentDashboard(ProjectId,BuildingId, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
