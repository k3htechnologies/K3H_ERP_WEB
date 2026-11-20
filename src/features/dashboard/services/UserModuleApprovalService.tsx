import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { UserModuleApprovalDatasourceImpl } from '@/features/dashboard/datasources/UserModuleApprovalDatasource';
import type { FilterWithPaginationUserApprovalRequest, UserApprovalDashboardListResponse } from '@/features/dashboard/models/UserApprovalModel';

const userModuleApprovalDatasource = new UserModuleApprovalDatasourceImpl();

export const userModuleApprovalDashboardServices = {

    apiCallPullUserModuleApproval: async (params?: FilterWithPaginationUserApprovalRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, UserApprovalDashboardListResponse>> => {
        try {

            return E.right(await userModuleApprovalDatasource.pullUserApproval(params, options?.signal));

        } catch (error) {

            return E.left(error as Failure);
        }
    },

}
