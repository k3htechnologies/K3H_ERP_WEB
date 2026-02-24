import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { LitigationDashboardDatasourceImpl } from '@/features/litigationDashboard/datasources/litigationDashboardDatasource';
import type { LitigationDashboardDatasetResponse } from '@/features/litigationDashboard/models/litigationDashboardModel';

const LitigationDashboardDatasource = new LitigationDashboardDatasourceImpl();

export const litigationDashboardService = {

    apiCallPullLitigationDashboard: async (ProjectId: number, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LitigationDashboardDatasetResponse>> => {
        try {

            return E.right(await LitigationDashboardDatasource.pullLitigationDashboard(ProjectId, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
