import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { HireSpaceDashboardDatasourceImpl } from '@/features/hireSpaceDashboard/datasources/HireSpaceDashboardDatasource';
import type { FilterHireSpaceDashboardRequest, HireSpaceDashboardResponse } from '@/features/hireSpaceDashboard/models/HireSpaceDashboardModel';

const hireSpaceDashboardDatasource = new HireSpaceDashboardDatasourceImpl();

export const hireSpaceDashboardService = {

    apiCallPullHireSpaceDashboard: async (params: FilterHireSpaceDashboardRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, HireSpaceDashboardResponse>> => {
        try {

            return E.right(await hireSpaceDashboardDatasource.pullHireSpaceDashboard(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
